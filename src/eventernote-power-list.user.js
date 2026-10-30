// ==UserScript==
// @name         Eventernote EX
// @namespace    https://github.com/wr786/eventernote-power-list
// @version      0.14.3
// @description  Eventernote UI enhancements: personal calendars, annual recaps, milestone countdowns, planned-event itineraries, weighted followed-actor recommendations, milestone gradients, popularity cues, venue maps, and profile participation counts.
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
    profileActorDisplayMode: "badges",
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
  let personalRecordRequest = null;
  const profileOriginalOrders = new Map();

  injectStyles();
  updateFollowingActorCache();
  applyEnhancements();
  console.info("[Eventernote EX] active");
  if (document.querySelector(".enpl-event-countdown")) {
    let countdownDate = new Date().toLocaleDateString("sv-SE", { timeZone: "Asia/Tokyo" });
    setInterval(() => {
      const today = new Date().toLocaleDateString("sv-SE", { timeZone: "Asia/Tokyo" });
      if (today !== countdownDate) {
        countdownDate = today;
        getEventItems().forEach(applyEventCountdown);
      }
    }, 60000);
  }

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
      applyEventCountdown(item);
    });
    applyFollowedActorEventSort(eventItems);
    applySameDaySchedule();
    applyFavoriteActorParticipationCounts();
    applyPersonalDashboard();
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

  function getEventDayDifference(date, today) {
    const target = new Date(Date.UTC(date.year, date.month - 1, date.day));
    if (target.getUTCFullYear() !== date.year || target.getUTCMonth() !== date.month - 1 || target.getUTCDate() !== date.day) return null;
    return Math.round((target.getTime() - Date.parse(`${today}T00:00:00Z`)) / 86400000);
  }

  function applyEventCountdown(item) {
    const dateNode = item.querySelector(".date > p:first-child");
    const date = parseEventDate(textOf(dateNode));
    if (!date) return;
    const today = new Date().toLocaleDateString("sv-SE", { timeZone: "Asia/Tokyo" });
    const days = getEventDayDifference(date, today);
    if (days === null || !Number.isFinite(days)) return;
    let badge = item.querySelector(".enpl-event-countdown");
    if (!badge) {
      badge = document.createElement("span");
      badge.className = "enpl-event-countdown";
      dateNode.insertAdjacentElement("afterend", badge);
    }
    badge.dataset.state = days < 0 ? "past" : days === 0 ? "today" : days === 1 ? "tomorrow" : days === 2 ? "soon" : days <= 7 ? "week" : days <= 30 ? "month" : "later";
    badge.title = `按日本日期 ${today} 计算，与活动日期相差 ${Math.abs(days)} 天；不判断活动是否已结束`;
    badge.replaceChildren();
    if (days === 0) badge.textContent = "今天";
    else if (days === 1) badge.textContent = "明天";
    else {
      const count = document.createElement("strong");
      count.textContent = Math.abs(days);
      badge.append(days > 0 ? "还有 " : "已过 ", count, " 天");
    }
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
            applyEventCountdown(imported);
          });
          visited.add(nextUrl);
          pagesLoaded++;
          nextUrl = nextPage(pageDocument, response.url);
          render();
        }
        status.textContent = `已推荐 ${originalOrder.length} 场 · ${pagesLoaded} 页${nextUrl ? " · 可继续加载" : " · 已加载到底"}`;
      } catch (error) {
        status.textContent = `已有 ${originalOrder.length} 场 · 加载失败，可点击加载更多重试`;
        console.warn("[Eventernote EX] recommendation loading failed", error);
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

  function getOwnProfilePath() {
    const link = Array.from(document.querySelectorAll("a[href]")).find((node) => textOf(node) === "自分のページを確認");
    return link ? getPathname(link.href).replace(/\/$/, "") : "";
  }

  function loadPersonalRecords(ownPath, onProgress, refresh = false) {
    if (personalRecordRequest?.ownPath === ownPath && (!refresh || personalRecordRequest.pending)) {
      if (personalRecordRequest.pending) personalRecordRequest.listeners.add(onProgress);
      return personalRecordRequest.promise;
    }
    const listeners = new Set([onProgress]);
    const request = { ownPath, listeners, pending: true };
    personalRecordRequest = request;
    request.promise = (async () => {
      const events = new Map();
      const visited = new Set();
      let expectedCount = null;
      let rowsRead = 0;
      let url = new URL(`${ownPath}/events`, location.origin);
      try {
        while (url) {
          if (visited.has(url.href) || visited.size >= 100) throw new Error("分页重复或超过 100 页，未完成读取");
          visited.add(url.href);
          listeners.forEach((notify) => notify(`正在读取第 ${visited.size} 页 · 已读取 ${events.size} 场`));
          const controller = new AbortController();
          const timeout = setTimeout(() => controller.abort(), 20000);
          let response;
          let html;
          try {
            response = await fetch(url.href, { credentials: "same-origin", signal: controller.signal });
            if (!response.ok) throw new Error(`HTTP ${response.status}`);
            html = await response.text();
          } finally { clearTimeout(timeout); }
          if (new URL(response.url).origin !== location.origin || new URL(response.url).pathname.replace(/\/$/, "") !== `${ownPath}/events`) throw new Error("参加记录页面已跳转，请确认登录状态");
          const root = new DOMParser().parseFromString(html, "text/html");
          const title = Array.from(root.querySelectorAll(".gb_subtitle")).find((node) => /参加イベント一覧/.test(textOf(node)));
          if (!title) throw new Error("未找到参加记录，可能需要重新登录");
          const total = textOf(title).match(/\(([\d,]+)件\)/);
          if (expectedCount === null && total) expectedCount = Number(total[1].replace(/,/g, ""));
          const rawItems = getEventItems(root);
          const items = rawItems.map(readPersonalEvent).filter(Boolean);
          if (items.length !== rawItems.length) throw new Error("部分活动日期无法读取，未生成不完整统计");
          rowsRead += rawItems.length;
          if (!items.length && !/\(0件\)/.test(textOf(title))) throw new Error("参加记录格式已变化");
          items.forEach((event) => events.set(getPathname(event.href), event));
          const next = root.querySelector(".pagination li.next:not(.disabled) a[href]");
          url = next ? new URL(next.getAttribute("href"), response.url) : null;
          if (url && (url.origin !== location.origin || url.pathname.replace(/\/$/, "") !== `${ownPath}/events`)) throw new Error("分页链接不属于本人的参加记录");
        }
        if (expectedCount !== null && rowsRead !== expectedCount) throw new Error(`读取 ${rowsRead} 条，与页面总数 ${expectedCount} 不符，请重试`);
        return {
          records: Array.from(events.values()).sort((a, b) => a.date.localeCompare(b.date) || (a.start ?? 1440) - (b.start ?? 1440)),
          rowsRead, pages: visited.size,
          today: new Date().toLocaleDateString("sv-SE", { timeZone: "Asia/Tokyo" })
        };
      } catch (error) {
        if (personalRecordRequest === request) personalRecordRequest = null;
        throw error;
      } finally {
        request.pending = false;
        listeners.clear();
      }
    })();
    return request.promise;
  }

  function applyPersonalDashboard() {
    const ownPath = getOwnProfilePath();
    const pathname = location.pathname.replace(/\/$/, "");
    if (!ownPath || (pathname !== "/users" && pathname !== ownPath) || document.querySelector(".enpl-personal")) return;
    const heading = Array.from(document.querySelectorAll(".gb_subtitle")).find((node) => /参加予定イベント/.test(textOf(node)));
    if (!heading) return;
    const today = new Date().toLocaleDateString("sv-SE", { timeZone: "Asia/Tokyo" });
    let month = today.slice(0, 7);
    let year = Number(today.slice(0, 4));
    let selectedDate = "";
    let complete = false;
    let busy = false;
    let records = getEventItems(heading.nextElementSibling).map(readPersonalEvent).filter(Boolean);
    const favorites = Array.from(document.querySelectorAll(".gb_actors_list li")).map((item) => {
      const actor = item.querySelector("a[href*='/actors/']");
      return actor ? { href: actor.href, name: textOf(actor.querySelector(".enpl-profile-name")) || Array.from(actor.childNodes).filter((node) => node.nodeType === 3).map((node) => node.textContent).join("").trim() } : null;
    }).filter(Boolean);
    function make(tag, className, text) {
      const element = document.createElement(tag);
      element.className = className;
      element.textContent = text;
      return element;
    }
    function button(text, action) {
      const element = make("button", "enpl-personal-button", text);
      element.type = "button";
      element.addEventListener("click", action);
      return element;
    }
    const panel = make("details", "enpl-personal", "");
    const summary = make("summary", "enpl-personal-summary", "我的现场 · 月历 / 年度回顾 / 里程碑");
    panel.setAttribute("aria-label", "我的现场");
    const top = make("div", "enpl-personal-top", "");
    const intro = make("div", "", "");
    intro.append(make("p", "enpl-personal-eyebrow", "MY LIVE JOURNAL"), make("h2", "", "我的现场"));
    const load = button("读取完整参加记录", loadRecords);
    top.append(intro, load);
    const status = make("p", "enpl-personal-note", "月历先显示主页列出的予定。读取完整记录后，可查看全年予定、年度回顾与里程碑预测；数据仅在本页使用。");
    status.setAttribute("role", "status");
    const tabs = make("div", "enpl-personal-tabs", "");
    const calendar = make("div", "", "");
    const recap = make("div", "", "");
    const milestones = make("div", "", "");
    const views = [calendar, recap, milestones];
    const labels = ["参加予定月历", "个人年度回顾", "里程碑倒计时"];
    const tabButtons = labels.map((label, index) => {
      const tab = button(label, () => {
        views.forEach((view, i) => { view.hidden = i !== index; tabButtons[i].setAttribute("aria-pressed", String(i === index)); });
      });
      tab.setAttribute("aria-pressed", String(index === 0));
      tabs.append(tab);
      views[index].hidden = index !== 0;
      return tab;
    });
    panel.append(summary, top, status, tabs, ...views);
    heading.insertAdjacentElement("beforebegin", panel);
    render();

    async function loadRecords() {
      if (busy) return;
      busy = true;
      load.disabled = true;
      try {
        const result = await loadPersonalRecords(ownPath, (message) => { status.textContent = message; }, complete);
        records = result.records;
        complete = true;
        status.textContent = `完整读取 ${result.rowsRead} 条 · 去重后 ${records.length} 场 · ${result.pages} 页。回顾按日本日期截至 ${today}，未来登记单列为予定；登记不代表实际到场。`;
        load.textContent = "刷新参加记录";
        render();
      } catch (error) {
        status.textContent = `读取未完成：${error.message}。${complete ? "保留上次完整结果。" : "仍使用主页预览，不生成年度统计。"}可点击重试。`;
      } finally {
        busy = false;
        load.disabled = false;
      }
    }

    function render() { renderCalendar(); renderRecap(); renderMilestones(); }

    function renderCalendar() {
      calendar.replaceChildren();
      const controls = make("div", "enpl-personal-controls", "");
      const picker = make("input", "", "");
      picker.type = "month";
      picker.value = month;
      picker.setAttribute("aria-label", "予定月历月份");
      picker.addEventListener("change", () => { if (/^\d{4}-\d{2}$/.test(picker.value)) { month = picker.value; selectedDate = ""; renderCalendar(); } });
      function shift(amount) {
        const date = new Date(Number(month.slice(0, 4)), Number(month.slice(5)) - 1 + amount, 1);
        month = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
        selectedDate = "";
        renderCalendar();
      }
      controls.append(button("上一月", () => shift(-1)), picker, button("下一月", () => shift(1)), button("本月", () => { month = today.slice(0, 7); selectedDate = ""; renderCalendar(); }));
      calendar.append(controls, make("p", "enpl-personal-note", complete ? "仅显示今天及之后的本人登记予定，点击日期查看场次。" : "主页予定预览 · 尚未读取的月份不能视为没有活动。"));
      const planned = records.filter((event) => event.date >= today && event.date.startsWith(month));
      const grid = make("div", "enpl-calendar-grid", "");
      ["一", "二", "三", "四", "五", "六", "日"].forEach((day) => grid.append(make("span", "enpl-calendar-weekday", day)));
      const first = new Date(Number(month.slice(0, 4)), Number(month.slice(5)) - 1, 1);
      for (let i = 0; i < (first.getDay() + 6) % 7; i++) grid.append(make("span", "", ""));
      const days = new Date(first.getFullYear(), first.getMonth() + 1, 0).getDate();
      for (let day = 1; day <= days; day++) {
        const date = `${month}-${String(day).padStart(2, "0")}`;
        const count = planned.filter((event) => event.date === date).length;
        const cell = button("", () => { selectedDate = selectedDate === date ? "" : date; renderCalendar(); });
        cell.className = `enpl-calendar-day${count ? " enpl-calendar-busy" : ""}${date === today ? " enpl-calendar-today" : ""}`;
        cell.setAttribute("aria-label", `${date}，${count} 场${complete ? "" : "（预览）"}`);
        cell.setAttribute("aria-pressed", String(selectedDate === date));
        cell.append(make("span", "", String(day)));
        if (count) cell.append(make("small", "", `${count} 场`));
        grid.append(cell);
      }
      calendar.append(grid);
      const events = planned.filter((event) => !selectedDate || event.date === selectedDate);
      calendar.append(make("h3", "", `${selectedDate || month} · ${events.length} 场${complete ? "予定" : "预览"}`));
      if (!events.length) calendar.append(make("p", "enpl-personal-note", complete ? "当前日期没有登记予定。" : "当前预览没有场次，可读取完整记录。"));
      events.forEach((event) => {
        const row = make("div", "enpl-personal-event", "");
        const link = make("a", "", event.title);
        link.href = event.href;
        row.append(make("span", "enpl-personal-note", `${event.date} · ${formatScheduleTime(event.start)}`), link, make("small", "enpl-personal-note", event.venue || "场馆未定"));
        calendar.append(row);
      });
    }

    function renderRecap() {
      recap.replaceChildren();
      if (!complete) { recap.append(make("p", "enpl-personal-empty", "读取完整参加记录，解锁你的年度现场回顾。")); return; }
      const picker = make("select", "", "");
      picker.setAttribute("aria-label", "年度回顾年份");
      const years = Array.from(new Set([Number(today.slice(0, 4)), ...records.map((event) => Number(event.date.slice(0, 4)))])).sort((a, b) => b - a);
      years.forEach((value) => { const option = make("option", "", `${value} 年`); option.value = value; picker.append(option); });
      picker.value = String(year);
      picker.addEventListener("change", () => { year = Number(picker.value); renderRecap(); });
      const events = records.filter((event) => event.date.startsWith(`${year}-`) && event.date <= today);
      const future = records.filter((event) => event.date.startsWith(`${year}-`) && event.date > today);
      const venues = new Set(events.filter((event) => event.venueHref).map((event) => getPathname(event.venueHref)));
      const stats = make("div", "enpl-personal-stats", "");
      [[events.length, "场登记"], [new Set(events.map((event) => event.date)).size, "个现场日"], [venues.size, "个场馆"], [future.length, "场未来予定"]].forEach(([value, label]) => {
        const tile = make("div", "", ""); tile.append(make("strong", "", String(value)), make("span", "", label)); stats.append(tile);
      });
      recap.append(picker, make("h3", "enpl-recap-title", `${year} · 你的现场足迹`), stats);
      const months = Array.from({ length: 12 }, (_, index) => events.filter((event) => Number(event.date.slice(5, 7)) === index + 1).length);
      const chart = make("div", "enpl-recap-months", "");
      months.forEach((count, index) => {
        const bar = make("div", "", "");
        const fill = make("span", "enpl-recap-bar", ""); fill.style.height = `${count ? 8 + count / Math.max(1, ...months) * 52 : 2}px`;
        bar.append(make("small", "", String(count)), fill, make("small", "", `${index + 1}月`)); chart.append(bar);
      });
      recap.append(chart);
      function ranking(title, entries) {
        const counts = new Map();
        entries.forEach((entry) => { const key = getPathname(entry.href); const found = counts.get(key); counts.set(key, { ...entry, count: (found ? found.count : 0) + 1 }); });
        const section = make("div", "enpl-recap-ranking", ""); section.append(make("h3", "", title));
        Array.from(counts.values()).sort((a, b) => b.count - a.count || a.name.localeCompare(b.name)).slice(0, 5).forEach((entry, index) => {
          const row = make("a", "", `${index + 1}. ${entry.name} · ${entry.count} 场`); row.href = entry.href; section.append(row);
        });
        if (!counts.size) section.append(make("p", "enpl-personal-note", "暂无记录"));
        return section;
      }
      const ranks = make("div", "enpl-recap-rankings", "");
      ranks.append(ranking("见得最多的艺人", events.flatMap((event) => event.actors)), ranking("最常去的场馆", events.filter((event) => event.venueHref).map((event) => ({ name: event.venue, href: event.venueHref }))));
      recap.append(ranks, make("p", "enpl-personal-note", `依据当前仍登记的活动，按活动日期截至 ${today}；今天的活动不判断是否已结束。艺人统计为出演场次，同场每位艺人只计一次。`));
    }

    function renderMilestones() {
      milestones.replaceChildren();
      if (!complete) { milestones.append(make("p", "enpl-personal-empty", "读取完整参加记录，看看下一次里程碑还有多远。")); return; }
      milestones.append(make("p", "enpl-personal-note", "只看关注艺人：从历史登记重算截至今天的出演场次，未来予定不计入已达成次数。预测以予定全部参加为前提，不代表已经达成。"));
      const cards = favorites.map((actor) => {
        const key = getPathname(actor.href);
        const appearances = records.filter((event) => event.actors.some((entry) => getPathname(entry.href) === key));
        const count = appearances.filter((event) => event.date <= today).length;
        const goal = nextParticipationGoal(count);
        const planned = appearances.filter((event) => event.date > today);
        return { ...actor, count, goal, remaining: goal - count, planned, target: planned[goal - count - 1] };
      }).sort((a, b) => a.remaining - b.remaining || b.count - a.count);
      if (!cards.length) milestones.append(make("p", "enpl-personal-empty", "关注艺人后，这里会显示下一目标。"));
      const grid = make("div", "enpl-milestone-grid", "");
      cards.forEach((actor) => {
        const card = make("article", "enpl-milestone-card", "");
        card.dataset.enplTier = getParticipationTier(actor.count);
        const link = make("a", "", actor.name); link.href = actor.href;
        const progress = make("progress", "", ""); progress.max = actor.goal; progress.value = actor.count;
        progress.setAttribute("aria-label", `${actor.name}：${actor.count} / ${actor.goal} 回`);
        card.append(link, make("strong", "", `还差 ${actor.remaining} 场`), make("small", "enpl-personal-note", `${actor.count} → ${actor.goal} 回`), progress);
        if (actor.target) {
          const target = make("a", "enpl-personal-note", `可能达成：${actor.target.date} · ${actor.target.title}`); target.href = actor.target.href; card.append(target);
        } else card.append(make("small", "enpl-personal-note", `已有 ${actor.planned.length} 场未来予定，还需 ${Math.max(0, actor.remaining - actor.planned.length)} 场`));
        grid.append(card);
      });
      milestones.append(grid);
    }
  }

  function readPersonalEvent(item) {
    const event = readScheduleEvent(item);
    if (!event || !event.date) return null;
    const actors = new Map();
    item.querySelectorAll(".actor a[href*='/actors/']").forEach((actor) => actors.set(getPathname(actor.href), { name: textOf(actor), href: new URL(actor.getAttribute("href"), location.origin).href }));
    return { ...event, href: new URL(item.querySelector("h4 a").getAttribute("href"), location.origin).href, actors: Array.from(actors.values()) };
  }

  function nextParticipationGoal(count) {
    return [10, 20, 30, 50, 100, 150, 200].find((goal) => goal > count) || (Math.floor(count / 50) + 1) * 50;
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
      actor.classList.add("enpl-metal-chip");
      parent.dataset.enplTier = getParticipationTier(getParticipationCount(actorClassName) ?? 0);
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
          item.parentElement.classList.add("enpl-profile-actor-source");
          if (!actor.querySelector(".enpl-profile-name")) {
            const name = document.createElement("span");
            name.className = "enpl-profile-name";
            Array.from(actor.childNodes).filter((node) => node !== actor.querySelector(".enpl-participation-count")).forEach((node) => name.append(node));
            name.title = textOf(name);
            actor.prepend(name);
          }
          item.dataset.enplTier = getParticipationTier(count);
        }
      }
    });
    document.querySelectorAll(".enpl-profile-actor-source").forEach((list) => {
      if (list.previousElementSibling?.classList.contains("enpl-profile-mode")) return;
      const controls = document.createElement("div");
      controls.className = "enpl-profile-mode";
      const displayField = document.createElement("label");
      displayField.className = "enpl-profile-field";
      displayField.append("显示模式");
      const picker = document.createElement("select");
      picker.setAttribute("aria-label", "艺人参加回数显示模式");
      [["badges", "徽章模式"], ["compact", "紧凑徽章"], ["original", "原版模式"]].forEach(([value, name]) => {
        const option = document.createElement("option");
        option.value = value;
        option.textContent = name;
        picker.append(option);
      });
      picker.value = settings.profileActorDisplayMode;
      const status = document.createElement("span");
      status.setAttribute("role", "status");
      picker.addEventListener("change", () => {
        settings.profileActorDisplayMode = picker.value;
        applyProfileActorDisplayMode();
        try {
          localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
          status.textContent = "";
        } catch (_error) {
          status.textContent = "本次生效，无法保存偏好";
        }
      });
      displayField.append(picker);
      controls.append(displayField, status);
      const ownPath = getOwnProfilePath();
      const pathname = location.pathname.replace(/\/$/, "");
      if (ownPath && (pathname === "/users" || pathname === ownPath)) {
        profileOriginalOrders.set(list, Array.from(list.children));
        const scope = document.createElement("select");
        scope.setAttribute("aria-label", "艺人参加回数统计范围");
        [["all", "全部登记（含未来予定）"], ["today", "截至今天"]].forEach(([value, label]) => {
          const option = document.createElement("option");
          option.value = value;
          option.textContent = label;
          scope.append(option);
        });
        const progress = document.createElement("span");
        progress.setAttribute("role", "status");
        let generation = 0;
        scope.addEventListener("change", async () => {
          const current = ++generation;
          if (scope.value === "all") {
            delete list.dataset.enplCutoff;
            list.querySelectorAll("li").forEach((item) => { delete item.dataset.enplHistoricalCount; });
            list.append(...profileOriginalOrders.get(list));
            progress.textContent = "";
            applyProfileActorDisplayMode();
            return;
          }
          progress.textContent = "正在读取完整记录，暂时保留原回数…";
          try {
            const result = await loadPersonalRecords(ownPath, (message) => {
              if (current === generation) progress.textContent = `${message} · 暂时保留原回数`;
            });
            if (current !== generation) return;
            const counts = new Map();
            result.records.filter((event) => event.date <= result.today).forEach((event) => {
              event.actors.forEach((actor) => {
                const key = getPathname(actor.href);
                counts.set(key, (counts.get(key) || 0) + 1);
              });
            });
            list.dataset.enplCutoff = result.today;
            list.querySelectorAll("li").forEach((item) => {
              const actor = item.querySelector("a[href*='/actors/']");
              if (actor) item.dataset.enplHistoricalCount = counts.get(getPathname(actor.href)) || 0;
            });
            list.append(...profileOriginalOrders.get(list).slice().sort((a, b) =>
              Number(b.dataset.enplHistoricalCount || 0) - Number(a.dataset.enplHistoricalCount || 0)));
            progress.textContent = `日本日期截至 ${result.today} · 已去重，包含今日登记`;
            applyProfileActorDisplayMode();
          } catch (error) {
            if (current !== generation) return;
            scope.value = list.dataset.enplCutoff ? "today" : "all";
            progress.textContent = `读取失败：${error.message}。保留原统计，可重新选择重试。`;
          }
        });
        const scopeField = document.createElement("label");
        scopeField.className = "enpl-profile-field";
        scopeField.append("统计范围", scope);
        controls.append(scopeField, progress);
      }
      list.insertAdjacentElement("beforebegin", controls);
      const sidebar = list.closest(".span4.page");
      if (sidebar?.querySelector(".gb_users_side_profile")) sidebar.classList.add("enpl-profile-sidebar");
      let previousWidth;
      new ResizeObserver(() => {
        const width = list.clientWidth;
        if (width === previousWidth) return;
        previousWidth = width;
        fitOriginalProfileActors(list);
      }).observe(list);
    });
    applyProfileActorDisplayMode();
  }

  function applyProfileActorDisplayMode() {
    const mode = ["badges", "compact", "original"].includes(settings.profileActorDisplayMode) ? settings.profileActorDisplayMode : "badges";
    const original = mode === "original";
    const compact = mode === "compact";
    document.querySelectorAll(".enpl-profile-actor-source").forEach((list) => {
      list.classList.toggle("enpl-profile-actors", mode === "badges");
      list.classList.toggle("enpl-profile-compact", compact);
      list.classList.toggle("enpl-profile-original", original);
      const counts = Array.from(list.querySelectorAll("li"), (item) => ({
        item, count: item.dataset.enplHistoricalCount !== undefined
          ? Number(item.dataset.enplHistoricalCount) : getParticipationCount(item.className)
      }));
      const maximum = Math.max(0, ...counts.map(({ count }) => count ?? 0));
      counts.forEach(({ item, count }) => {
        const badge = item.querySelector(".enpl-participation-count");
        if (badge && count !== null) {
          item.dataset.enplTier = getParticipationTier(count);
          item.style.setProperty("--enpl-count-share", `${maximum ? count / maximum * 100 : 0}%`);
          item.querySelector("a[href*='/actors/']")?.classList.toggle("enpl-metal-chip", compact);
          badge.classList.toggle("enpl-metal-chip", !original && !compact);
          badge.textContent = original ? `[${count}回]` : `${count}回`;
          badge.title = `参加回数：${count}回${list.dataset.enplCutoff ? `（日本日期截至 ${list.dataset.enplCutoff}，已去重）` : "（站内全部登记）"}`;
          badge.setAttribute("aria-label", badge.title);
        }
      });
      fitOriginalProfileActors(list);
      const controls = list.previousElementSibling;
      let note = controls?.querySelector(".enpl-profile-scale-note");
      if (controls && !note) {
        note = document.createElement("span");
        note.className = "enpl-profile-scale-note";
        note.textContent = "细条长度以本列表最高回数为基准";
        controls.append(note);
      }
      if (note) note.hidden = mode !== "badges";
      const picker = controls?.querySelector("select");
      if (picker) picker.value = mode;
    });
  }

  function fitOriginalProfileActors(list) {
    list.querySelectorAll("li > a").forEach((actor) => {
      actor.style.removeProperty("font-size");
      if (!list.classList.contains("enpl-profile-original") || !actor.clientWidth) return;
      const size = parseFloat(getComputedStyle(actor).fontSize);
      if (actor.scrollWidth > actor.clientWidth) {
        actor.style.setProperty("font-size", `${Math.floor(size * (actor.clientWidth - 2) / actor.scrollWidth * 10) / 10}px`, "important");
      }
    });
  }

  function getParticipationTier(count) {
    return [[200, "ruby"], [150, "diamond"], [100, "black-gold"], [50, "gold"], [30, "rose-gold"], [20, "silver"], [10, "bronze"], [0, "iron"]]
      .find(([minimum]) => count >= minimum)[1];
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

      .enpl-metal-chip {
        border-radius: 9px;
        color: var(--enpl-metal-ink);
        background: linear-gradient(120deg, var(--enpl-metal-start), var(--enpl-metal-end));
        box-shadow: inset 0 0 0 1px var(--enpl-metal-edge), inset 0 1px 0 rgba(255, 255, 255, .25);
        font-weight: 600;
        letter-spacing: .01em;
        line-height: 1.4;
      }
      .enpl-followed-actor > a { display: inline-flex; align-items: center; max-width: 100%; padding: 4px 9px; font-size: 12px; overflow-wrap: anywhere; text-decoration: none; }
      a.enpl-metal-chip { transition: filter 120ms ease-out, box-shadow 120ms ease-out; }
      a.enpl-metal-chip:hover { color: var(--enpl-metal-ink); text-decoration: none; }
      @media (hover: hover) {
        a.enpl-metal-chip:hover {
          filter: brightness(1.035);
          box-shadow: inset 0 0 0 1px var(--enpl-metal-edge), inset 0 1px 0 rgba(255, 255, 255, .5), 0 2px 5px rgba(30, 25, 25, .12);
        }
      }
      a.enpl-metal-chip:active { filter: brightness(.94); transition: none; }
      a.enpl-metal-chip:focus-visible { outline: 2px solid var(--enpl-metal-accent); outline-offset: 2px; }

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

      .enpl-profile-sidebar > .gb_users_side_profile { margin: 0 14px; }
      .enpl-profile-sidebar > .gb_score_table { margin: 10px 14px; }
      .enpl-profile-sidebar > .gb_subtitle { margin: 16px 14px 8px; text-indent: 0; }
      .enpl-profile-sidebar > p.t { margin: 0 14px 10px; padding: 5px 0; }
      .enpl-profile-sidebar .gb_actors_list.enpl-profile-actors,
      .enpl-profile-sidebar .gb_actors_list.enpl-profile-original { width: auto; margin-left: 14px; margin-right: 14px; }
      @media (prefers-reduced-motion: reduce) { a.enpl-metal-chip { transition: none; } }
      .enpl-profile-mode { display: grid; gap: 8px; box-sizing: border-box; padding: 4px 14px; margin: 10px 0; color: #6e6e73; font-size: 12px; font-family: system-ui, sans-serif; }
      .enpl-profile-field { display: grid; grid-template-columns: 4em minmax(0, 1fr); align-items: center; gap: 8px; margin: 0; font: inherit; white-space: nowrap; }
      .enpl-profile-mode > [role="status"]:empty { display: none; }
      .enpl-profile-mode > [role="status"] { min-width: 0; line-height: 1.5; overflow-wrap: anywhere; }
      .enpl-profile-mode select { box-sizing: border-box; width: 100%; min-width: 0; max-width: 100%; margin: 0; padding: 4px 8px; border: 1px solid #d8d8dc; border-radius: 8px; color: #3a3a3c; background: #f5f5f7; font: inherit; }
      .gb_actors_list.enpl-profile-actors {
        display: grid;
        gap: 0;
        padding: 5px 14px;
        border: 1px solid rgba(60, 60, 67, .12);
        border-radius: 18px;
        background: rgba(255, 255, 255, .92);
        box-shadow: 0 3px 16px rgba(35, 30, 30, .04), inset 0 1px 0 #fff;
        font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
        font-optical-sizing: auto;
      }
      .gb_actors_list.enpl-profile-actors > li {
        margin: 0;
        padding: 0;
        font-size: 14px !important;
        line-height: 1.5;
      }
      [data-enpl-tier="iron"] {
        --enpl-metal-ink: #202733; --enpl-metal-start: #c2c7ce; --enpl-metal-end: #929ba7; --enpl-metal-edge: #7e8896; --enpl-metal-accent: #647080;
      }
      [data-enpl-tier="bronze"] {
        --enpl-metal-ink: #61351e; --enpl-metal-start: #f3d5b6; --enpl-metal-end: #cd9564; --enpl-metal-edge: #b77c4f; --enpl-metal-accent: #a3683e;
      }
      [data-enpl-tier="silver"] {
        --enpl-metal-ink: #3c4859; --enpl-metal-start: #f5f7fb; --enpl-metal-end: #c1cbd9; --enpl-metal-edge: #a1adbd; --enpl-metal-accent: #7d8a9e;
      }
      [data-enpl-tier="rose-gold"] {
        --enpl-metal-ink: #63382f; --enpl-metal-start: #f3d1c4; --enpl-metal-end: #d99a86; --enpl-metal-edge: #bc7c68; --enpl-metal-accent: #a45f4d;
      }
      [data-enpl-tier="gold"] {
        --enpl-metal-ink: #654610; --enpl-metal-start: #fff0b6; --enpl-metal-end: #e6bc57; --enpl-metal-edge: #c89a36; --enpl-metal-accent: #b78924;
      }
      [data-enpl-tier="black-gold"] {
        --enpl-metal-ink: #ffe9b0; --enpl-metal-start: #594422; --enpl-metal-end: #221c14; --enpl-metal-edge: #e5b85a; --enpl-metal-accent: #a77b22;
      }
      [data-enpl-tier="diamond"] {
        --enpl-metal-ink: #edf4ff; --enpl-metal-start: #3d438c; --enpl-metal-end: #211b4d; --enpl-metal-edge: #b8c9ff; --enpl-metal-accent: #6465ad;
      }
      [data-enpl-tier="ruby"] {
        --enpl-metal-ink: #ffe4ea; --enpl-metal-start: #a93553; --enpl-metal-end: #62162e; --enpl-metal-edge: #da8099; --enpl-metal-accent: #b3395c;
      }
      .gb_actors_list.enpl-profile-actors > li > a {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 12px;
        min-height: 46px;
        padding: 0 2px;
        border: 0;
        border-radius: 0;
        color: #252528;
        background: transparent;
        font-size: 14px !important;
        font-weight: 500;
        line-height: 1.5;
        text-decoration: none;
      }
      .gb_actors_list.enpl-profile-actors > li > a { position: relative; padding-bottom: 5px; }
      .gb_actors_list.enpl-profile-actors > li > a::after {
        content: ""; position: absolute; left: 2px; right: 2px; bottom: 3px;
        height: 3px; border-radius: 2px;
        background: linear-gradient(to right, var(--enpl-metal-accent) 0 var(--enpl-count-share, 0%), #eeeeF1 var(--enpl-count-share, 0%) 100%);
      }
      .enpl-profile-scale-note { color: #77777f; font-size: 11px; line-height: 1.5; }
      .enpl-profile-scale-note[hidden] { display: none; }
      .gb_actors_list.enpl-profile-actors > li + li > a { border-top: 1px solid rgba(60, 60, 67, .09); }
      .enpl-profile-name { min-width: 0; white-space: nowrap; }
      .enpl-profile-actors .enpl-profile-name { overflow: hidden; text-overflow: ellipsis; }
      .enpl-profile-actors .enpl-profile-name::before { content: ""; display: inline-block; width: 5px; height: 5px; margin-right: 8px; border-radius: 1px; background: var(--enpl-metal-accent); transform: rotate(45deg); vertical-align: 2px; }
      .enpl-profile-actors .enpl-participation-count {
        flex: none;
        min-width: 3.4em;
        margin: 0;
        padding: 4px 9px;
        font-size: 12px;
        text-align: center;
      }
      .gb_actors_list.enpl-profile-actors > li > a:hover { color: var(--enpl-metal-accent); background: #fafafa; }
      .gb_actors_list.enpl-profile-actors > li > a:active { background: #f2f2f4; }
      .gb_actors_list.enpl-profile-actors > li > a:focus-visible { outline: 2px solid var(--enpl-metal-accent); outline-offset: 1px; border-radius: 5px; }
      .gb_actors_list.enpl-profile-compact {
        display: flex; flex-wrap: wrap; align-items: flex-start; gap: 7px;
        box-sizing: border-box; width: 100%;
        padding: 12px 14px 16px; margin: 8px 0 0; list-style: none;
        font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
        font-optical-sizing: auto;
      }
      .gb_actors_list.enpl-profile-compact > li {
        flex: 0 1 auto; float: none; width: auto; min-width: 0; max-width: 100%;
        margin: 0; padding: 0; font-size: 12px !important; line-height: 1.5;
      }
      .gb_actors_list.enpl-profile-compact > li > a {
        display: flex; align-items: stretch; gap: 0; box-sizing: border-box;
        max-width: 100%; min-height: 30px; padding: 0;
        color: var(--enpl-metal-ink) !important;
        font-size: 12px !important; line-height: 1.5; text-decoration: none;
      }
      .enpl-profile-compact .enpl-profile-name { overflow: hidden; text-overflow: ellipsis; padding: 5px 9px; background: rgba(255, 255, 255, .12); border-radius: 9px 0 0 9px; }
      .enpl-profile-compact .enpl-participation-count {
        display: inline-flex; align-items: center; flex: none; margin: 0; padding: 5px 9px;
        background: rgba(0, 0, 0, .06); border-radius: 0 9px 9px 0; font-size: inherit;
      }
      .enpl-profile-original > li > a { display: flex; align-items: baseline; gap: .25em; white-space: nowrap; max-width: 100%; padding: 2px 0; }
      .enpl-profile-original .enpl-profile-name, .enpl-profile-original .enpl-participation-count { flex: none; font-size: inherit; line-height: inherit; }
      .enpl-profile-original .enpl-participation-count { margin: 0; }
      @media (prefers-contrast: more) {
        .gb_actors_list.enpl-profile-actors { border-color: #76767b; background: #fff; box-shadow: none; }
        .gb_actors_list.enpl-profile-actors > li + li > a { border-color: #76767b; }
      }

      .enpl-personal {
        margin: 0 0 24px;
        padding: 20px;
        border: 1px solid #f2d5c8;
        border-radius: 20px;
        color: #493d3d;
        background: linear-gradient(135deg, #fff9f2, #fff3f5 75%, #fff);
      }
      .enpl-personal:not([open]) { padding: 12px 16px; }
      .enpl-personal-summary { color: #873e32; font-size: 14px; font-weight: 600; line-height: 1.6; cursor: pointer; }
      .enpl-personal[open] > .enpl-personal-summary { margin-bottom: 16px; }
      .enpl-personal-summary:focus-visible { outline: 2px solid #bd564b; outline-offset: 4px; border-radius: 4px; }
      .enpl-personal [hidden] { display: none !important; }
      .enpl-personal h2 { margin: 0; color: #873e32; font-size: 24px; line-height: 1.4; }
      .enpl-personal h3 { margin: 18px 0 10px; font-size: 15px; line-height: 1.5; }
      .enpl-personal-top, .enpl-personal-controls, .enpl-personal-tabs { display: flex; align-items: center; flex-wrap: wrap; gap: 8px; }
      .enpl-personal-top { justify-content: space-between; }
      .enpl-personal-eyebrow { margin: 0 0 3px; color: #aa6556; font-size: 10px; letter-spacing: .16em; }
      .enpl-personal-note { color: #796968; font-size: 12px; line-height: 1.65; }
      .enpl-personal > .enpl-personal-note { margin: 12px 0; }
      .enpl-personal-button {
        padding: 7px 12px; border: 1px solid #ecc8b9; border-radius: 12px;
        background: #fffaf6; color: #914b39; font: inherit; font-size: 12px; cursor: pointer;
      }
      .enpl-personal-button:hover { background: #ffe4d6; }
      .enpl-personal-button:focus-visible { outline: 2px solid #bd564b; outline-offset: 2px; }
      .enpl-personal-button:disabled { opacity: .6; cursor: wait; }
      .enpl-personal-tabs { margin-bottom: 16px; padding-bottom: 12px; border-bottom: 1px solid #f1dcd4; }
      .enpl-personal-tabs [aria-pressed="true"] { background: #a94442; color: white; border-color: #a94442; }
      .enpl-personal input[type="month"], .enpl-personal select { width: auto; max-width: 100%; margin: 0; border-radius: 10px; border-color: #e8cbbf; color: #744238; }
      .enpl-personal-controls { margin-bottom: 10px; }
      .enpl-calendar-grid { display: grid; grid-template-columns: repeat(7, minmax(0, 1fr)); gap: 5px; }
      .enpl-calendar-weekday { padding: 5px 0; text-align: center; color: #997b73; font-size: 12px; }
      .enpl-calendar-day { display: flex; flex-direction: column; align-items: center; justify-content: center; min-height: 54px; padding: 4px; border-radius: 10px; border-color: transparent; color: #80716b; background: #fffaf8; }
      .enpl-calendar-day small { font-size: 10px; }
      .enpl-calendar-busy { color: #a13c36; background: linear-gradient(135deg, #ffe6d0, #ffbcae); font-weight: 600; }
      .enpl-calendar-today { border-color: #b74f42; }
      .enpl-calendar-day[aria-pressed="true"] { outline: 2px solid #a94442; outline-offset: 0; }
      .enpl-personal-event { display: grid; gap: 3px; padding: 10px 0; border-bottom: 1px solid #f0dfd7; }
      .enpl-personal-event > a { color: #8c443d; font-size: 13px; line-height: 1.6; }
      .enpl-personal-empty { padding: 30px 12px; text-align: center; color: #96726b; }
      .enpl-personal-stats { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 8px; }
      .enpl-personal-stats > div { display: grid; padding: 12px 5px; text-align: center; border: 1px solid #f1d4c8; border-radius: 14px; background: #fffaf6; }
      .enpl-personal-stats strong { font-size: 27px; line-height: 1.5; color: #a94442; font-variant-numeric: tabular-nums; }
      .enpl-personal-stats span { color: #96726b; font-size: 11px; }
      .enpl-recap-months { display: grid; grid-template-columns: repeat(12, minmax(0, 1fr)); align-items: end; gap: 4px; margin: 22px 0 8px; }
      .enpl-recap-months > div { display: grid; justify-items: center; align-content: end; gap: 4px; font-size: 10px; color: #96726b; }
      .enpl-recap-bar { width: 75%; border-radius: 5px 5px 2px 2px; background: linear-gradient(#e89478, #ba4d51); }
      .enpl-recap-rankings { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 16px; }
      .enpl-recap-ranking > a { display: block; padding: 7px 0; border-bottom: 1px solid #efdbd2; color: #8f5147; font-size: 12px; overflow-wrap: anywhere; }
      .enpl-milestone-grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 10px; }
      .enpl-milestone-card { display: grid; gap: 7px; padding: 14px; border: 1px solid var(--enpl-metal-edge, #edc7b3); border-radius: 14px; background: #fffaf7; }
      .enpl-milestone-card > a { color: var(--enpl-metal-accent, #8f5147); font-size: 12px; overflow-wrap: anywhere; line-height: 1.5; }
      .enpl-milestone-card > strong { color: var(--enpl-metal-accent, #a94442); font-size: 20px; line-height: 1.5; }
      .enpl-milestone-card progress { width: 100%; height: 7px; accent-color: var(--enpl-metal-accent, #d98463); }
      @media (max-width: 600px) {
        .enpl-personal { padding: 12px; }
        .enpl-personal-stats, .enpl-recap-rankings, .enpl-milestone-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); }
        .enpl-recap-rankings { grid-template-columns: minmax(0, 1fr); }
        .enpl-calendar-day { min-height: 44px; }
      }

      .enpl-event-countdown {
        display: inline-flex; align-items: baseline; gap: .25em;
        box-sizing: border-box; max-width: 100%; margin: 2px 0 7px; padding: 3px 8px;
        border: 1px solid #dce7f4; border-radius: 8px;
        color: #365f91; background: #eff5fc;
        font: 500 11px/1.5 -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
        font-variant-numeric: tabular-nums; white-space: nowrap;
      }
      .enpl-event-countdown strong { font-size: 13px; font-weight: 650; }
      .enpl-event-countdown[data-state="later"] { color: #64758a; background: #f1f4f8; border-color: #dfe5ed; }
      .enpl-event-countdown[data-state="month"] { color: #365f91; background: #eff5fc; border-color: #dce7f4; }
      .enpl-event-countdown[data-state="week"] { color: #71529b; background: #f4eefb; border-color: #e3d6f2; }
      .enpl-event-countdown[data-state="soon"] { color: #9a541c; background: #fff0df; border-color: #f0d2ae; }
      .enpl-event-countdown[data-state="tomorrow"] { color: #a24043; background: #fff0ed; border-color: #f0c8c1; }
      .enpl-event-countdown[data-state="today"] { color: #89500e; background: #fff3db; border-color: #efd6a5; }
      .enpl-event-countdown[data-state="past"] { color: #73737b; background: #f4f4f6; border-color: #e5e5e9; }
      .enpl-venue-link, .enpl-date-search-link, .enpl-event-countdown {
        display: inline-flex; align-items: baseline; gap: .25em;
        box-sizing: border-box; padding: 3px 7px; border-radius: 7px;
        font: 500 11px/1.5 -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
        font-variant-numeric: tabular-nums; white-space: nowrap; text-decoration: none;
      }
      .enpl-venue-link, .enpl-date-search-link {
        color: #686b76; background: #f5f6f8; border: 1px solid #e2e4e9;
        vertical-align: baseline;
      }
      .enpl-venue-link { margin-left: 6px; }
      .enpl-venue-link:hover, .enpl-date-search-link:hover {
        color: #3b4d68; background: #eaf0f8; border-color: #cbd8e8; text-decoration: none;
      }
      .enpl-venue-link:active, .enpl-date-search-link:active { background: #dfe8f4; }
      .enpl-venue-link:focus-visible, .enpl-date-search-link:focus-visible { outline: 2px solid #647c9e; outline-offset: 2px; }

    `);
  }
})();
