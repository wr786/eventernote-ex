// ==UserScript==
// @name         Eventernote Lite Enhancer
// @namespace    https://github.com/wr786/eventernote-power-list
// @version      0.8.6
// @description  Lightweight Eventernote list enhancements: compact rows, venue links, popularity, and followed actor highlighting.
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
    venueLinksEnabled: true
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
    });
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

  function applyFollowedActorHighlights() {
    if (!settings.followedActorHighlightEnabled) return;

    const following = getFollowingActorMap();
    if (!following) return;

    getPageActorLinks().forEach((actor) => {
      const pathname = getPathname(actor.href);
      const rank = following[pathname];
      if (!rank) return;

      const parent = actor.parentElement;
      if (!parent) return;

      parent.classList.add("enpl-followed-actor");
      const level = getFollowingRankLevel(rank);
      if (level !== null) {
        parent.classList.add(`enpl-followed-actor-${level}`);
      }
    });
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

  function textOf(node) {
    return (node ? node.textContent : "").replace(/\s+/g, " ").trim();
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
        display: inline-flex;
        align-items: center;
        border: 1px solid #fdba74;
        border-radius: 4px;
        color: #b45309;
        background: #fff7ed;
        padding: 1px 5px;
        text-decoration: none;
      }

      .enpl-followed-actor-1 > a,
      .enpl-followed-actor-2 > a {
        border-color: #fb923c;
        color: #c2410c;
        background: #ffedd5;
      }

      .enpl-followed-actor-3 > a,
      .enpl-followed-actor-4 > a {
        border-color: #f87171;
        color: #b91c1c;
        background: #fef2f2;
      }

      .enpl-followed-actor-5 > a {
        border-color: #ef4444;
        color: #991b1b;
        background: #fee2e2;
        font-weight: 600;
      }

      .enpl-followed-actor-6 > a {
        border-color: #facc15;
        color: #92400e;
        background: #fef9c3;
        box-shadow: inset 0 0 0 1px rgba(250, 204, 21, .25);
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

    `);
  }
})();
