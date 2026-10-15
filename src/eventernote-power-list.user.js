// ==UserScript==
// @name         Eventernote Lite Enhancer
// @namespace    https://github.com/wr786/eventernote-power-list
// @version      0.10.13
// @description  Eventernote UI enhancements: personal planned-event itineraries, weighted followed-actor recommendations, milestone gradients, popularity cues, venue maps, and profile participation counts.
// @author       wr786
// @match        https://www.eventernote.com/*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=eventernote.com
// @grant        GM_addStyle
// @license      MIT
// ==/UserScript==

(function () {
  "use strict";

  const STORAGE_KEY = "eventernote-power-list.settings.v2";
  const FOLLOWING_CACHE_KEY = "eventernote-lite-enhancer.following.v1";
  const DEFAULT_SETTINGS = {
    compactEnabled: true,
    popularityEnabled: true,
    warm: 10,
    hot: 50,
    veryHot: 100,
    followedActorHighlightEnabled: true,
    venueLinksEnabled: true,
    dateSearchLinksEnabled: true
  };

  const settings = loadSettings();

  injectStyles();
  updateFollowingActorCache();
  applyEnhancements();
  console.info("[Eventernote Lite Enhancer] active");

  function loadSettings() {
    try {
      const stored = JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}");
      return {
        ...DEFAULT_SETTINGS,
        ...stored
      };
    } catch (_error) {
      return { ...DEFAULT_SETTINGS };
    }
  }

  function applyEnhancements() {
    document.body.classList.toggle("enpl-compact-enabled", settings.compactEnabled);

    const eventItems = getEventItems();
    eventItems.forEach((item) => {
      applyPopularity(item);
      applyVenueLinks(item);
      applyDateSearchLinks(item);
    });
    applyFollowedActorEventSort(eventItems);
    applySameDaySchedule();
    applyFavoriteActorParticipationCounts();
    applyFollowedActorHighlights();
  }

  function applyPopularity(item) {
    if (!settings.popularityEnabled) return;

    const count = parseNoteCount(item);
    const node = getNoteCountTextElement(item);
    if (!node || count === null) return;

    const level = getPopularityLevel(count);
    node.classList.add("enpl-note-count-highlight", `enpl-note-count-${level}`);
  }

  function applyVenueLinks(item) {
    if (!settings.venueLinksEnabled) return;

    const venueLink = getVenueLink(item);
    if (!venueLink) return;
    if (venueLink.parentElement && venueLink.parentElement.querySelector(".enpl-venue-link")) return;

    const venueName = textOf(venueLink);
    if (!venueName) return;

    const mapLink = document.createElement("a");
    mapLink.className = "enpl-venue-link";
    mapLink.href = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(venueName)}`;
    mapLink.target = "_blank";
    mapLink.rel = "noopener noreferrer";
    mapLink.title = `Google Maps: ${venueName}`;
    mapLink.textContent = "map";
    venueLink.insertAdjacentElement("afterend", mapLink);
  }

  function applyDateSearchLinks(item) {
    if (!settings.dateSearchLinksEnabled) return;

    const dateNode = item.querySelector(".date > p:first-child");
    if (!dateNode || dateNode.querySelector(".enpl-date-search-link")) return;

    const date = parseEventDate(textOf(dateNode));
    if (!date) return;

    const searchLink = document.createElement("a");
    searchLink.className = "enpl-date-search-link";
    searchLink.href = `/events/search?year=${date.year}&month=${date.month}&day=${date.day}`;
    searchLink.title = `查看 ${date.year}-${String(date.month).padStart(2, "0")}-${String(date.day).padStart(2, "0")} 的其他活动`;
    searchLink.textContent = "all";
    dateNode.append(" ", searchLink);
  }

  function applyFollowedActorEventSort(eventItems) {
    if (!/^\/events\/(?:search(?:\/|$)|month(?:\/|$))/.test(location.pathname) || !eventItems.length) return;

    const list = eventItems[0].parentElement;
    const following = getFollowingActorMap() || {};
    if (!list || eventItems.some((item) => item.parentElement !== list)) return;

    const originalNodes = Array.from(list.childNodes);
    const originalOrder = eventItems.slice();
    const eventSet = new Set(eventItems);
    const scores = new Map();
    const eventPaths = new Set(originalOrder.map(eventPath));
    const visited = new Set([location.href]);
    let nextUrl = nextPage(document, location.href);
    let pagesLoaded = 1;
    let sorted = false;
    let loading = false;
    originalOrder.forEach((item) => scores.set(item, scoreEvent(item)));

    const button = document.createElement("button");
    button.type = "button";
    button.className = "enpl-interest-sort-button";
    button.textContent = Object.keys(following).length ? "按关注推荐" : "关注推荐（先访问关注页）";
    button.title = "按关注艺人的参加回数加权排序，并加载后续搜索结果";
    button.setAttribute("aria-pressed", "false");
    button.disabled = !Object.keys(following).length;

    const more = document.createElement("button");
    more.type = "button";
    more.className = "enpl-interest-sort-button";
    more.textContent = "加载更多推荐";
    more.hidden = true;
    const status = document.createElement("span");
    status.setAttribute("role", "status");
    const controls = document.createElement("div");
    controls.className = "enpl-interest-sort-controls";
    controls.append(button, " ", more, " ", status);
    list.insertAdjacentElement("beforebegin", controls);

    function eventPath(item) {
      const link = item.querySelector("h4 a[href*='/events/'], a[href^='/events/']");
      return link ? getPathname(link.href) : "";
    }

    function scoreEvent(item) {
      const actors = new Set(Array.from(item.querySelectorAll(".actor > ul > li > a[href*='/actors/'], .actors > li > a[href*='/actors/']"), (actor) => getPathname(actor.href)));
      return Array.from(actors).reduce((total, pathname) => {
        if (!Object.prototype.hasOwnProperty.call(following, pathname)) return total;
        return total + (getParticipationCount(following[pathname]) ?? 1);
      }, 0);
    }

    function nextPage(root, base) {
      const link = root.querySelector(".pagination li.next:not(.disabled) a[href]");
      if (!link) return null;
      const url = new URL(link.getAttribute("href"), base);
      return url.origin === location.origin && /^\/events\//.test(url.pathname) ? url.href : null;
    }

    function render() {
      if (sorted) {
        const order = originalOrder.slice().sort((left, right) => scores.get(right) - scores.get(left));
        const fragment = document.createDocumentFragment();
        let eventIndex = 0;
        originalNodes.forEach((node) => fragment.append(eventSet.has(node) ? order[eventIndex++] : node));
        order.slice(eventIndex).forEach((item) => fragment.append(item));
        list.replaceChildren(fragment);
        applyFollowedActorHighlights();
      } else {
        list.replaceChildren(...originalNodes);
      }
      button.textContent = sorted ? "恢复原排序" : "按关注推荐";
      button.setAttribute("aria-pressed", String(sorted));
      more.hidden = !sorted || !nextUrl;
    }

    async function loadMore() {
      if (loading || !nextUrl) return;
      loading = true;
      button.disabled = true;
      more.disabled = true;
      try {
        // shortcut: fetch up to 10 pages per click; use another batch for larger searches.
        const pageLimit = pagesLoaded === 1 ? 9 : 10;
        for (let page = 0; page < pageLimit && nextUrl; page++) {
          if (visited.has(nextUrl)) {
            nextUrl = null;
            break;
          }
          status.textContent = `正在加载… 已有 ${originalOrder.length} 场`;
          const controller = new AbortController();
          const timeout = setTimeout(() => controller.abort(), 20000);
          let response;
          let html;
          try {
            response = await fetch(nextUrl, { credentials: "same-origin", signal: controller.signal });
            if (!response.ok) throw new Error(`HTTP ${response.status}`);
            html = await response.text();
          } finally {
            clearTimeout(timeout);
          }
          const pageDocument = new DOMParser().parseFromString(html, "text/html");
          const items = getEventItems(pageDocument);
          if (!items.length) throw new Error("No event results in the next page");
          items.forEach((item) => {
            const pathname = eventPath(item);
            if (!pathname || eventPaths.has(pathname)) return;
            eventPaths.add(pathname);
            const imported = document.importNode(item, true);
            scores.set(imported, scoreEvent(imported));
            originalOrder.push(imported);
            applyPopularity(imported);
            applyVenueLinks(imported);
            applyDateSearchLinks(imported);
          });
          visited.add(nextUrl);
          pagesLoaded++;
          nextUrl = nextPage(pageDocument, response.url);
          render();
        }
        status.textContent = `已推荐 ${originalOrder.length} 场 · ${pagesLoaded} 页${nextUrl ? " · 可继续加载" : " · 已加载到底"}`;
      } catch (error) {
        status.textContent = `已有 ${originalOrder.length} 场 · 加载失败，可点击加载更多重试`;
        console.warn("[Eventernote Lite Enhancer] recommendation loading failed", error);
      } finally {
        loading = false;
        button.disabled = false;
        more.disabled = false;
        more.hidden = !sorted || !nextUrl;
      }
    }

    button.addEventListener("click", async () => {
      sorted = !sorted;
      render();
      if (sorted && pagesLoaded === 1 && nextUrl) await loadMore();
      else status.textContent = sorted ? `已推荐 ${originalOrder.length} 场 · ${pagesLoaded} 页` : "";
    });
    more.addEventListener("click", loadMore);
  }

  function applySameDaySchedule() {
    const ownProfile = Array.from(document.querySelectorAll("a[href]")).find((link) => textOf(link) === "自分のページを確認");
    const pathname = location.pathname.replace(/\/$/, "");
    const ownPath = ownProfile ? getPathname(ownProfile.href).replace(/\/$/, "") : "";
    if (pathname !== "/users" && (!ownPath || pathname !== ownPath)) return;

    const heading = Array.from(document.querySelectorAll(".gb_subtitle")).find((node) => /参加予定イベント/.test(textOf(node)));
    const container = heading && heading.nextElementSibling;
    if (!container || !container.classList.contains("gb_event_list")) return;
    const eventItems = getEventItems(container);
    if (!eventItems.length) return;
    const list = eventItems[0].parentElement;
    if (!list || eventItems.some((item) => item.parentElement !== list)) return;

    let controls = list.previousElementSibling;
    if (!controls || !controls.classList.contains("enpl-interest-sort-controls")) {
      controls = document.createElement("div");
      controls.className = "enpl-interest-sort-controls";
      list.insertAdjacentElement("beforebegin", controls);
    }
    const button = document.createElement("button");
    button.type = "button";
    button.className = "enpl-interest-sort-button";
    button.textContent = "参加予定的行程";
    button.setAttribute("aria-pressed", "false");
    const datePicker = document.createElement("select");
    datePicker.className = "enpl-schedule-date-select";
    datePicker.setAttribute("aria-label", "行程日期");
    datePicker.hidden = true;
    controls.append(" ", button, " ", datePicker);
    const view = document.createElement("section");
    view.className = "enpl-schedule";
    view.setAttribute("aria-label", "我的参加予定行程");
    view.hidden = true;
    list.insertAdjacentElement("afterend", view);
    let active = false;

    function make(tag, className, text) {
      const node = document.createElement(tag);
      node.className = className;
      node.textContent = text;
      return node;
    }

    function refresh() {
      const events = Array.from(list.children).map(readScheduleEvent).filter(Boolean);
      events.sort((left, right) => (left.date || "\uffff").localeCompare(right.date || "\uffff") || (left.start ?? 1440) - (right.start ?? 1440));
      const selectedDate = datePicker.value || "";
      const dates = Array.from(new Set(events.map((event) => event.date || "unknown")));
      const allDates = make("option", "", "全部日期");
      allDates.value = "";
      datePicker.replaceChildren(allDates);
      dates.forEach((date) => {
        const option = make("option", "", date === "unknown" ? "日期未定" : date);
        option.value = date;
        datePicker.append(option);
      });
      datePicker.value = dates.includes(selectedDate) ? selectedDate : "";
      const fragment = document.createDocumentFragment();
      fragment.append(make("p", "enpl-schedule-note", "仅显示此页面列出的本人参加予定，按日期和开演时间排列；场次间隔不含路程，终演时间以页面信息为准。"));
      let date;
      let previous;
      let group;
      events.filter((event) => !datePicker.value || (event.date || "unknown") === datePicker.value).forEach((event) => {
        if (event.date !== date || !group) {
          date = event.date;
          previous = null;
          group = make("div", "enpl-schedule-day", "");
          group.append(make("h3", "enpl-schedule-date", date || "日期未定"));
          fragment.append(group);
        }
        if (previous && event.start !== null) {
          const gap = previous.end === null || previous.start === null || previous.end < previous.start ? null : event.start - previous.end;
          const overlapEnd = event.end !== null && event.end > event.start && gap !== null && gap < 0 ? Math.min(previous.end, event.end) : null;
          const label = gap === null ? "上一场终演时间未知或跨日，间隔待确认" : gap < 0
            ? overlapEnd === null ? `开演时上一场尚未结束（距终演 ${formatScheduleDuration(-gap)}）` : `与上一场重叠 ${formatScheduleDuration(overlapEnd - event.start)}`
            : `场次间隔 ${formatScheduleDuration(gap)}`;
          group.append(make("p", gap !== null && gap < 0 ? "enpl-schedule-gap enpl-schedule-overlap" : "enpl-schedule-gap", label));
        }
        const row = make("article", "enpl-schedule-row", "");
        row.append(make("span", "enpl-schedule-time", formatScheduleTime(event.start)));
        const details = make("div", "enpl-schedule-details", "");
        const title = make("a", "enpl-schedule-title", event.title);
        title.href = event.href;
        details.append(title);
        const venue = make(event.venueHref ? "a" : "span", "enpl-schedule-venue", event.venue || "场馆未定");
        if (event.venueHref) venue.href = event.venueHref;
        details.append(venue);
        details.append(make("p", "enpl-schedule-meta", `开场 ${formatScheduleTime(event.open)} · 终演 ${formatScheduleTime(event.end)}${event.start !== null && event.end !== null && event.end < event.start ? " · 跨日时间待确认" : ""}`));
        row.append(details);
        group.append(row);
        previous = event;
      });
      view.replaceChildren(fragment);
    }

    button.addEventListener("click", () => {
      active = !active;
      if (active) refresh();
      list.classList.toggle("enpl-schedule-source-hidden", active);
      view.hidden = !active;
      datePicker.hidden = !active;
      button.textContent = active ? "返回参加予定列表" : "参加予定的行程";
      button.setAttribute("aria-pressed", String(active));
    });
    datePicker.addEventListener("change", refresh);
    new MutationObserver(() => { if (active) refresh(); }).observe(list, { childList: true });
  }

  function readScheduleEvent(item) {
    const title = item.querySelector("h4 a[href*='/events/']");
    if (!title) return null;
    const date = parseEventDate(textOf(item.querySelector(".date > p:first-child")));
    const venue = item.querySelector(".place a[href*='/places/']");
    const times = textOf(item.querySelector(".event .place .s"));
    return {
      date: date ? `${date.year}-${String(date.month).padStart(2, "0")}-${String(date.day).padStart(2, "0")}` : "",
      title: textOf(title), href: title.href,
      venue: textOf(venue), venueHref: venue ? venue.href : "",
      open: parseScheduleTime(times, "開場"),
      start: parseScheduleTime(times, "開演"),
      end: parseScheduleTime(times, "終演")
    };
  }

  function parseScheduleTime(text, label) {
    const match = text.match(new RegExp(`(?:^|\\s)${label}\\s+(\\d{1,2}):(\\d{2})(?=\\s|$)`));
    if (!match) return null;
    const hour = Number(match[1]);
    const minute = Number(match[2]);
    return hour < 24 && minute < 60 ? hour * 60 + minute : null;
  }

  function formatScheduleTime(minutes) {
    return minutes === null ? "未定" : `${String(Math.floor(minutes / 60)).padStart(2, "0")}:${String(minutes % 60).padStart(2, "0")}`;
  }

  function formatScheduleDuration(minutes) {
    const hours = Math.floor(minutes / 60);
    return hours ? `${hours} 小时${minutes % 60 ? ` ${minutes % 60} 分钟` : ""}` : `${minutes} 分钟`;
  }

  function applyFollowedActorHighlights() {
    if (!settings.followedActorHighlightEnabled) return;

    const following = getFollowingActorMap();
    if (!following) return;

    getPageActorLinks().forEach((actor) => {
      const pathname = getPathname(actor.href);
      const actorClassName = following[pathname];
      if (!actorClassName) return;

      const parent = actor.parentElement;
      if (!parent) return;

      parent.classList.add("enpl-followed-actor");
      const level = getFollowingRankLevel(actorClassName);
      if (level !== null) {
        parent.classList.add(`enpl-followed-actor-${level}`);
      }

      const count = getParticipationCount(actorClassName);
      if (count !== null) {
        // shortcut: cap gradient depth at 50 appearances to keep labels readable; raise it if higher counts need more separation.
        parent.style.setProperty("--enpl-actor-gradient-depth", `${Math.min(count, 50)}%`);
        parent.classList.toggle("enpl-followed-actor-deep", count >= 30);
        parent.dataset.enplMilestone = getParticipationMilestone(count);
      }
    });
  }

  function applyFavoriteActorParticipationCounts() {
    if (!/^\/users(?:\/|$)/.test(location.pathname) || /\/(?:following|follower)\/?$/.test(location.pathname)) return;

    document.querySelectorAll(".gb_actors_list li, .gb_listview li").forEach((item) => {
      const actor = item.querySelector("a[href*='/actors/']");
      const count = getParticipationCount(item.className);
      if (actor && count !== null) {
        addParticipationCount(actor, count);
        if (item.parentElement.matches(".gb_actors_list")) {
          item.parentElement.classList.add("enpl-profile-actors");
          item.dataset.enplMilestone = getParticipationMilestone(count);
        }
      }
    });
  }

  function getParticipationMilestone(count) {
    return count >= 200 ? "200" : count >= 150 ? "150" : count >= 100 ? "100" : "0";
  }

  function addParticipationCount(actor, count) {
    let badge = actor.querySelector(".enpl-participation-count");
    if (!badge) {
      badge = actor.nextElementSibling && actor.nextElementSibling.classList.contains("enpl-participation-count")
        ? actor.nextElementSibling
        : document.createElement("span");
      badge.className = "enpl-participation-count";
      actor.append(badge);
    }

    badge.textContent = `[${count}回]`;
    badge.title = `参加回数：${count}回`;
    badge.setAttribute("aria-label", `参加回数：${count}回`);
  }

  function updateFollowingActorCache() {
    if (!settings.followedActorHighlightEnabled || location.pathname !== "/users") return;

    const following = extractFollowingActorMap(document);
    if (following) saveFollowingActorCache(following);
  }

  function extractFollowingActorMap(root) {
    const list = root.querySelector(".gb_users_side_profile ~ .gb_subtitle + div > .gb_actors_list");
    if (!list) return null;

    const following = {};
    list.querySelectorAll("li > a[href*='/actors/']").forEach((actor) => {
      const pathname = getPathname(actor.href);
      if (pathname) following[pathname] = actor.parentElement ? actor.parentElement.className : "";
    });
    return following;
  }

  function loadFollowingActorCache() {
    try {
      const cache = JSON.parse(localStorage.getItem(FOLLOWING_CACHE_KEY) || "null");
      if (!cache || typeof cache !== "object" || typeof cache.actors !== "object") return null;
      return cache;
    } catch (_error) {
      return null;
    }
  }

  function saveFollowingActorCache(actors) {
    localStorage.setItem(FOLLOWING_CACHE_KEY, JSON.stringify({ updatedAt: Date.now(), actors }));
  }

  function getEventItems(root = document) {
    const containers = Array.from(root.querySelectorAll(".gb_event_list > ul > li, .gb_event_list > li, .event_list > li"));
    return containers.filter((item) => item.querySelector("a[href^='/events/'], a[href*='eventernote.com/events/']"));
  }

  function getVenueLink(item) {
    return item.querySelector(".place a[href^='/places/'], .place a[href*='eventernote.com/places/']");
  }

  function getPageActorLinks() {
    return Array.from(document.querySelectorAll(".actor > ul > li > a[href*='/actors/'], .actors > li > a[href*='/actors/']"));
  }

  function getPathname(href) {
    try {
      return new URL(href, location.origin).pathname;
    } catch (_error) {
      return "";
    }
  }

  function getFollowingActorMap() {
    const cache = loadFollowingActorCache();
    return cache ? cache.actors : null;
  }

  function getFollowingRankLevel(rank) {
    const match = String(rank || "").match(/s([0-6])/);
    return match ? match[1] : null;
  }

  function getParticipationCount(className) {
    const match = String(className || "").match(/(?:^|\s)c(\d+)(?:\s|$)/);
    return match ? Number(match[1]) : null;
  }

  function textOf(node) {
    return (node ? node.textContent : "").replace(/\s+/g, " ").trim();
  }

  function parseEventDate(text) {
    const match = String(text || "").match(/\b(\d{4})-(\d{1,2})-(\d{1,2})\b/);
    if (!match) return null;

    return {
      year: Number(match[1]),
      month: Number(match[2]),
      day: Number(match[3])
    };
  }

  function parseNoteCount(item) {
    const node = item.querySelector(".note_count");
    if (!node) return null;

    const count = Number((node.textContent || "").replace(/[^\d]/g, ""));
    return Number.isFinite(count) ? count : null;
  }

  function getNoteCountTextElement(item) {
    return item.querySelector(".note_count [title='参加者数'], .note_count p") || item.querySelector(".note_count");
  }

  function getPopularityLevel(count) {
    if (count >= settings.veryHot) return "very-hot";
    if (count >= settings.hot) return "hot";
    if (count >= settings.warm) return "warm";
    return "quiet";
  }

  function injectStyles() {
    GM_addStyle(`
      .enpl-compact-enabled .gb_event_list > li.clearfix {
        min-height: 0;
        padding-top: 8px;
        padding-bottom: 8px;
      }

      .enpl-compact-enabled .gb_event_list > li.clearfix .date img {
        display: none;
      }

      .enpl-compact-enabled .gb_event_list > li.clearfix .date {
        width: 105px;
      }

      .enpl-compact-enabled .gb_event_list > li.clearfix .event {
        margin-left: 112px;
      }

      .enpl-compact-enabled .gb_event_list h4 {
        margin: 0 0 4px;
        line-height: 1.35;
      }

      .enpl-compact-enabled .gb_event_list .place {
        margin: 1px 0;
      }

      .enpl-compact-enabled .gb_event_list .actor ul {
        margin-bottom: 0;
      }

      .enpl-note-count-highlight {
        font-weight: 700;
      }

      .enpl-note-count-quiet {
        color: inherit;
      }

      .enpl-note-count-warm {
        color: #d97706;
      }

      .enpl-note-count-hot {
        color: #dc2626;
      }

      .enpl-note-count-very-hot {
        color: #b91c1c;
        text-decoration: underline;
        text-decoration-thickness: 2px;
        text-underline-offset: 2px;
      }

      .enpl-followed-actor > a {
        --enpl-actor-gradient-start: #fff3e5;
        --enpl-actor-gradient-end: #ffd9b8;
        --enpl-actor-gradient-deep: #f97316;
        --enpl-actor-border: #fb923c;
        --enpl-actor-text: #9a3412;
        --enpl-actor-text-deep: #7c2d12;
        --enpl-actor-glow: rgba(249, 115, 22, .24);
        display: inline-flex;
        align-items: center;
        border: 1px solid var(--enpl-actor-border);
        border-radius: 999px;
        color: var(--enpl-actor-text);
        background: linear-gradient(135deg, var(--enpl-actor-gradient-start), var(--enpl-actor-gradient-end));
        background:
          linear-gradient(135deg, rgba(255, 255, 255, .56), rgba(255, 255, 255, 0) 56%),
          linear-gradient(135deg,
            color-mix(in srgb, var(--enpl-actor-gradient-start) calc(100% - var(--enpl-actor-gradient-depth, 0%)), var(--enpl-actor-gradient-deep) var(--enpl-actor-gradient-depth, 0%)),
            color-mix(in srgb, var(--enpl-actor-gradient-end) calc(100% - var(--enpl-actor-gradient-depth, 0%)), var(--enpl-actor-gradient-deep) var(--enpl-actor-gradient-depth, 0%))
        );
        box-shadow: inset 0 1px 0 rgba(255, 255, 255, .82), 0 2px 5px var(--enpl-actor-glow);
        padding: 3px 8px;
        text-decoration: none;
      }

      .enpl-followed-actor-1 > a,
      .enpl-followed-actor-2 > a {
        --enpl-actor-gradient-start: #fff3e5;
        --enpl-actor-gradient-end: #ffd9b8;
        --enpl-actor-gradient-deep: #f97316;
        --enpl-actor-border: #fb923c;
        --enpl-actor-text: #9a3412;
        --enpl-actor-text-deep: #7c2d12;
        --enpl-actor-glow: rgba(249, 115, 22, .24);
      }

      .enpl-followed-actor-3 > a,
      .enpl-followed-actor-4 > a {
        --enpl-actor-gradient-start: #fff2e8;
        --enpl-actor-gradient-end: #ffd6ba;
        --enpl-actor-gradient-deep: #f9734b;
        --enpl-actor-border: #fba17c;
        --enpl-actor-text: #9a3f20;
        --enpl-actor-text-deep: #84351d;
        --enpl-actor-glow: rgba(249, 115, 75, .23);
      }

      .enpl-followed-actor-5 > a {
        --enpl-actor-gradient-start: #ffece0;
        --enpl-actor-gradient-end: #ffc5a7;
        --enpl-actor-gradient-deep: #ef7144;
        --enpl-actor-border: #f9734b;
        --enpl-actor-text: #84351d;
        --enpl-actor-text-deep: #78301c;
        --enpl-actor-glow: rgba(239, 113, 68, .25);
        font-weight: 600;
      }

      .enpl-followed-actor-6 > a {
        --enpl-actor-gradient-start: #ffe5d5;
        --enpl-actor-gradient-end: #ffb996;
        --enpl-actor-gradient-deep: #e96036;
        --enpl-actor-border: #ef9c72;
        --enpl-actor-text: #8f361e;
        --enpl-actor-text-deep: #7c2d19;
        --enpl-actor-glow: rgba(233, 96, 54, .22);
        font-weight: 700;
      }

      .enpl-followed-actor-deep > a {
        color: var(--enpl-actor-text-deep);
      }

      [data-enpl-milestone="100"] {
        --enpl-milestone-start: #fff0e8;
        --enpl-milestone-end: #ffb99f;
        --enpl-milestone-deep: #fb714c;
        --enpl-milestone-ink: #8b2e1d;
        --enpl-milestone-border: #f58c6b;
        --enpl-milestone-glow: rgba(251, 113, 76, .2);
      }

      [data-enpl-milestone="150"] {
        --enpl-milestone-start: #ffe5eb;
        --enpl-milestone-end: #ff8da8;
        --enpl-milestone-deep: #ef476f;
        --enpl-milestone-ink: #861735;
        --enpl-milestone-border: #ed6e8d;
        --enpl-milestone-glow: rgba(239, 71, 111, .22);
      }

      [data-enpl-milestone="200"] {
        --enpl-milestone-start: #ffc7d7;
        --enpl-milestone-end: #f45b83;
        --enpl-milestone-deep: #d92355;
        --enpl-milestone-ink: #680f2d;
        --enpl-milestone-border: #d93e68;
        --enpl-milestone-glow: rgba(217, 35, 85, .25);
      }

      .enpl-followed-actor[data-enpl-milestone]:not([data-enpl-milestone="0"]) > a {
        --enpl-actor-gradient-start: var(--enpl-milestone-start);
        --enpl-actor-gradient-end: var(--enpl-milestone-end);
        --enpl-actor-gradient-deep: var(--enpl-milestone-deep);
        --enpl-actor-border: var(--enpl-milestone-border);
        --enpl-actor-text: var(--enpl-milestone-ink);
        --enpl-actor-text-deep: var(--enpl-milestone-ink);
        --enpl-actor-glow: var(--enpl-milestone-glow);
      }

      .enpl-interest-sort-controls {
        margin: 0 0 10px;
        text-align: right;
      }

      .enpl-interest-sort-button {
        padding: 5px 10px;
        border: 1px solid #c9a96b;
        border-radius: 999px;
        color: #78500a;
        background: #fff7d6;
        font: inherit;
        line-height: 1.4;
        cursor: pointer;
      }

      .enpl-interest-sort-button:hover:not(:disabled) {
        color: #fff0c2;
        background: #292318;
      }

      .enpl-interest-sort-button:disabled {
        cursor: not-allowed;
        opacity: .65;
      }

      .enpl-schedule-date-select {
        padding: 5px 10px;
        border: 1px solid #d6c7ee;
        border-radius: 999px;
        color: #5c3a7a;
        background: #faf7ff;
        font: inherit;
      }

      .enpl-schedule-source-hidden,
      .enpl-schedule-date-select[hidden],
      .enpl-schedule[hidden] {
        display: none !important;
      }

      .enpl-schedule {
        margin: 12px 0;
        color: #334155;
      }

      .enpl-schedule-note,
      .enpl-schedule-meta {
        color: #64748b;
        font-size: 12px;
        line-height: 1.6;
      }

      .enpl-schedule-day {
        margin-bottom: 20px;
        padding: 14px;
        border: 1px solid #e3daef;
        border-radius: 16px;
        background: linear-gradient(135deg, #faf7ff, #fff);
      }

      .enpl-schedule-date {
        margin: 0 0 12px;
        color: #5c3a7a;
        font-size: 16px;
      }

      .enpl-schedule-row {
        display: grid;
        grid-template-columns: 72px minmax(0, 1fr);
        gap: 12px;
        padding: 12px 0;
      }

      .enpl-schedule-time {
        color: #5c3a7a;
        font-size: 18px;
        font-weight: 700;
        font-variant-numeric: tabular-nums;
      }

      .enpl-schedule-details {
        border-left: 2px solid #d6c7ee;
        padding-left: 14px;
      }

      .enpl-schedule-title,
      .enpl-schedule-venue {
        display: block;
        overflow-wrap: anywhere;
      }

      .enpl-schedule-title {
        font-weight: 600;
        line-height: 1.5;
      }

      .enpl-schedule-venue {
        margin-top: 5px;
        color: #64748b;
        font-size: 12px;
      }

      .enpl-schedule-meta {
        margin: 5px 0 0;
      }

      .enpl-schedule-gap {
        margin: 0 0 0 84px;
        padding: 5px 14px;
        color: #64748b;
        border-left: 2px dashed #d6c7ee;
        font-size: 12px;
      }

      .enpl-schedule-overlap {
        color: #be123c;
        border-color: #fda4af;
        background: #fff1f2;
      }

      .enpl-participation-count {
        margin-left: .25em;
        font-variant-numeric: tabular-nums;
        white-space: nowrap;
      }

      .gb_actors_list.enpl-profile-actors {
        display: grid;
        gap: 6px;
        padding: 12px;
        border: 1px solid #e8e2d9;
        border-radius: 16px;
        background: linear-gradient(145deg, #fffdf9, #f5f2ed);
      }

      .gb_actors_list.enpl-profile-actors > li {
        --enpl-profile-ink: #657286;
        --enpl-profile-tint: #edf1f6;
        margin: 0;
        padding: 0;
        font-size: 14px !important;
        line-height: 1.5;
      }

      .enpl-profile-actors > li.s1 { --enpl-profile-ink: #a56825; --enpl-profile-tint: #fff1dc; }
      .enpl-profile-actors > li.s2 { --enpl-profile-ink: #af592e; --enpl-profile-tint: #ffe8de; }
      .enpl-profile-actors > li.s3 { --enpl-profile-ink: #a3542e; --enpl-profile-tint: #ffe7d5; }
      .enpl-profile-actors > li.s4 { --enpl-profile-ink: #a34829; --enpl-profile-tint: #ffddc5; }
      .enpl-profile-actors > li.s5 { --enpl-profile-ink: #994023; --enpl-profile-tint: #ffd2b6; }
      .enpl-profile-actors > li.s6 { --enpl-profile-ink: #8f361e; --enpl-profile-tint: #ffc6a6; }

      .gb_actors_list.enpl-profile-actors > li > a {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 8px;
        padding: 8px 10px;
        border: 1px solid var(--enpl-profile-tint);
        border-left: 3px solid var(--enpl-profile-ink);
        border-radius: 10px;
        background: linear-gradient(110deg, #fff, var(--enpl-profile-tint));
        color: #343944;
        font-size: 14px !important;
        font-weight: 600;
        line-height: 1.5;
        overflow-wrap: anywhere;
        text-decoration: none;
      }

      .enpl-profile-actors .enpl-participation-count {
        flex: none;
        margin: 0;
        color: var(--enpl-profile-ink);
        font-size: inherit;
        font-weight: 600;
      }

      .gb_actors_list.enpl-profile-actors > li[data-enpl-milestone]:not([data-enpl-milestone="0"]) {
        --enpl-profile-ink: var(--enpl-milestone-ink);
        --enpl-profile-tint: var(--enpl-milestone-end);
      }

      .gb_actors_list.enpl-profile-actors > li[data-enpl-milestone]:not([data-enpl-milestone="0"]) > a {
        border-color: var(--enpl-milestone-end);
        border-left-color: var(--enpl-milestone-border);
        background: linear-gradient(115deg, var(--enpl-milestone-start), var(--enpl-milestone-end));
        color: var(--enpl-milestone-ink);
      }

      .gb_actors_list.enpl-profile-actors > li > a:hover,
      .gb_actors_list.enpl-profile-actors > li > a:focus-visible {
        outline: 2px solid var(--enpl-profile-ink);
        outline-offset: 2px;
      }

      .enpl-venue-link {
        display: inline-block;
        margin-left: 5px;
        padding: 0 4px;
        border: 1px solid #ddd5cc;
        border-radius: 3px;
        color: #9a6a32;
        background: #fffaf2;
        font-size: 11px;
        line-height: 1.35;
        text-decoration: none;
        vertical-align: 1px;
      }

      .enpl-venue-link:hover {
        border-color: #e5a64a;
        color: #8a4f10;
        background: #fff3d8;
        text-decoration: none;
      }

      .enpl-date-search-link {
        display: inline-block;
        padding: 0 4px;
        border: 1px solid #ddd5cc;
        border-radius: 3px;
        color: #9a6a32;
        background: #fffaf2;
        font-size: 10px;
        font-weight: 600;
        line-height: 1.35;
        text-decoration: none;
        vertical-align: 1px;
      }

      .enpl-date-search-link:hover {
        border-color: #e5a64a;
        color: #8a4f10;
        background: #fff3d8;
        text-decoration: none;
      }

    `);
  }
})();
