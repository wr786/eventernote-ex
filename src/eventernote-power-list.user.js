// ==UserScript==
// @name         Eventernote Lite Enhancer
// @namespace    https://github.com/wr786/eventernote-power-list
// @version      0.10.5
// @description  Eventernote UI enhancements: milestone and black-gold performer gradients, popularity cues, venue maps, and profile participation counts.
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

    getEventItems().forEach((item) => {
      applyPopularity(item);
      applyVenueLinks(item);
      applyDateSearchLinks(item);
    });
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
        parent.classList.toggle("enpl-followed-actor-100-plus", count >= 100);
      }
    });
  }

  function applyFavoriteActorParticipationCounts() {
    if (!/^\/users(?:\/|$)/.test(location.pathname) || /\/(?:following|follower)\/?$/.test(location.pathname)) return;

    document.querySelectorAll(".gb_actors_list li, .gb_listview li").forEach((item) => {
      const actor = item.querySelector("a[href*='/actors/']");
      const count = getParticipationCount(item.className);
      if (actor && count !== null) addParticipationCount(actor, count);
    });
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

  function getEventItems() {
    const containers = Array.from(document.querySelectorAll(".gb_event_list > ul > li, .gb_event_list > li, .event_list > li"));
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
        --enpl-actor-gradient-start: #fff0f3;
        --enpl-actor-gradient-end: #ffc4d1;
        --enpl-actor-gradient-deep: #e11d48;
        --enpl-actor-border: #fb7185;
        --enpl-actor-text: #9f1239;
        --enpl-actor-text-deep: #881337;
        --enpl-actor-glow: rgba(225, 29, 72, .23);
      }

      .enpl-followed-actor-5 > a {
        --enpl-actor-gradient-start: #ffe3e8;
        --enpl-actor-gradient-end: #fda4b3;
        --enpl-actor-gradient-deep: #be123c;
        --enpl-actor-border: #e11d48;
        --enpl-actor-text: #881337;
        --enpl-actor-text-deep: #701a2c;
        --enpl-actor-glow: rgba(190, 18, 60, .25);
        font-weight: 600;
      }

      .enpl-followed-actor-6 > a {
        --enpl-actor-gradient-start: #fff7d6;
        --enpl-actor-gradient-end: #f5d98f;
        --enpl-actor-gradient-deep: #b7791f;
        --enpl-actor-border: #d6a72c;
        --enpl-actor-text: #78500a;
        --enpl-actor-text-deep: #5f3b08;
        --enpl-actor-glow: rgba(161, 98, 7, .22);
        font-weight: 700;
      }

      .enpl-followed-actor-deep > a {
        color: var(--enpl-actor-text-deep);
      }

      .enpl-followed-actor-100-plus > a {
        --enpl-actor-gradient-start: #12110f;
        --enpl-actor-gradient-end: #292318;
        --enpl-actor-gradient-deep: #554222;
        --enpl-actor-border: #c9a96b;
        --enpl-actor-text: #f1dfb6;
        --enpl-actor-text-deep: #fff0c2;
        --enpl-actor-glow: rgba(201, 169, 107, .28);
        background:
          linear-gradient(135deg, rgba(255, 230, 180, .2), rgba(255, 230, 180, 0) 56%),
          linear-gradient(135deg,
            color-mix(in srgb, var(--enpl-actor-gradient-start) calc(100% - var(--enpl-actor-gradient-depth, 0%)), var(--enpl-actor-gradient-deep) var(--enpl-actor-gradient-depth, 0%)),
            color-mix(in srgb, var(--enpl-actor-gradient-end) calc(100% - var(--enpl-actor-gradient-depth, 0%)), var(--enpl-actor-gradient-deep) var(--enpl-actor-gradient-depth, 0%))
        );
        box-shadow: inset 0 1px 0 rgba(255, 231, 183, .2), 0 2px 6px var(--enpl-actor-glow);
      }

      .enpl-participation-count {
        margin-left: .25em;
        font-variant-numeric: tabular-nums;
        white-space: nowrap;
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
