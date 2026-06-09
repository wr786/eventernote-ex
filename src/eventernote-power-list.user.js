// ==UserScript==
// @name         Eventernote Power List
// @namespace    https://github.com/wr786/eventernote-power-list
// @version      0.8.2
// @description  Compact Eventernote lists, relative date labels, mute rules, venue links, popularity, and followed actor highlighting.
// @author       wr786
// @match        https://www.eventernote.com/*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=eventernote.com
// @run-at       document-idle
// @grant        GM_addStyle
// @license      MIT
// ==/UserScript==

(function () {
  "use strict";

  const STORAGE_KEY = "eventernote-power-list.settings.v2";
  const DEFAULT_SETTINGS = {
    compactEnabled: true,
    keywordsEnabled: true,
    hideMuted: false,
    highlightKeywords: [
      "ミニライブ",
      "お見送り会",
      "舞台挨拶",
      "無料",
      "配信",
      "生配信",
      "朗読劇",
      "トークショー",
      "LIVE",
      "舞台",
      "FES"
    ],
    muteKeywords: [
      "女性限定"
    ],
    popularityEnabled: true,
    warm: 10,
    hot: 50,
    veryHot: 100,
    followedActorHighlightEnabled: true,
    venueLinksEnabled: true,
    relativeDateEnabled: true
  };

  let settings = loadSettings();
  let started = false;

  scheduleBoot();

  function scheduleBoot() {
    tryBoot();
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", tryBoot, { once: true });
    }
    window.addEventListener("load", tryBoot, { once: true });

    const observer = new MutationObserver(() => {
      if (!started) tryBoot();
      if (started) observer.disconnect();
    });
    observer.observe(document.documentElement, { childList: true, subtree: true });
    setTimeout(tryBoot, 1000);
    setTimeout(tryBoot, 3000);
  }

  function tryBoot() {
    if (started) return;
    if (!document.body) return;
    started = true;
    injectStyles();
    apply();
    setTimeout(apply, 1000);
    setTimeout(apply, 3000);
    console.info("[Eventernote Power List] active");
  }

  function loadSettings() {
    try {
      const stored = JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}");
      return {
        ...DEFAULT_SETTINGS,
        ...stored,
        highlightKeywords: Array.isArray(stored.highlightKeywords)
          ? stored.highlightKeywords
          : DEFAULT_SETTINGS.highlightKeywords,
        muteKeywords: Array.isArray(stored.muteKeywords)
          ? stored.muteKeywords
          : DEFAULT_SETTINGS.muteKeywords
      };
    } catch (_error) {
      return { ...DEFAULT_SETTINGS };
    }
  }

  function saveSettings() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
  }

  function apply() {
    document.body.classList.toggle("enpl-compact-enabled", settings.compactEnabled);
    document.body.classList.toggle("enpl-hide-muted", settings.keywordsEnabled && settings.hideMuted);
    cleanupFollowedActorHighlights();

    getEventItems().forEach((item) => {
      cleanupItem(item);
      applyKeywords(item);
      applyPopularity(item);
      applyVenueLinks(item);
      applyRelativeDateCue(item);
    });
    applyFollowedActorHighlights();
  }

  function cleanupItem(item) {
    item.classList.remove("enpl-keyword-hit", "enpl-muted");
    cleanupPopularity(item);
    cleanupVenueLinks(item);
    cleanupRelativeDateCue(item);
  }

  function applyKeywords(item) {
    if (!settings.keywordsEnabled) return;

    const title = getTitleLink(item);
    if (!title) return;

    const text = collectSearchableText(item);
    const highlightMatches = findMatches(text, settings.highlightKeywords);
    const muteMatches = findMatches(text, settings.muteKeywords);

    item.classList.toggle("enpl-keyword-hit", highlightMatches.length > 0);
    item.classList.toggle("enpl-muted", muteMatches.length > 0);
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

  function applyRelativeDateCue(item) {
    if (!settings.relativeDateEnabled) return;

    const eventDate = parseEventDate(item);
    const dateLine = getDateLine(item);
    if (!eventDate || !dateLine) return;

    const chip = document.createElement("span");
    chip.className = "enpl-date-chip";
    chip.textContent = getRelativeDateLabel(eventDate);
    dateLine.appendChild(chip);
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

  function getEventItems() {
    const containers = Array.from(document.querySelectorAll(".gb_event_list > ul > li, .gb_event_list > li, .event_list > li, li.clearfix"));
    return containers.filter((item) => item.querySelector("a[href^='/events/'], a[href*='eventernote.com/events/']"));
  }

  function getTitleLink(item) {
    return item.querySelector(".event h4 a, h4 a");
  }

  function getDateLine(item) {
    return item.querySelector(".date p[class^='day'], .date p");
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
    try {
      const following = JSON.parse(localStorage.getItem("following-highlight") || "null");
      return following && typeof following === "object" ? following : null;
    } catch (_error) {
      return null;
    }
  }

  function cleanupFollowedActorHighlights() {
    document.querySelectorAll(".enpl-followed-actor").forEach((node) => {
      node.classList.remove(
        "enpl-followed-actor",
        "enpl-followed-actor-0",
        "enpl-followed-actor-1",
        "enpl-followed-actor-2",
        "enpl-followed-actor-3",
        "enpl-followed-actor-4",
        "enpl-followed-actor-5",
        "enpl-followed-actor-6"
      );
    });
  }

  function cleanupPopularity(item) {
    const node = getNoteCountTextElement(item);
    if (!node) return;
    node.classList.remove(
      "enpl-note-count-highlight",
      "enpl-note-count-quiet",
      "enpl-note-count-warm",
      "enpl-note-count-hot",
      "enpl-note-count-very-hot"
    );
  }

  function cleanupVenueLinks(item) {
    item.querySelectorAll(".enpl-venue-link").forEach((node) => node.remove());
  }

  function cleanupRelativeDateCue(item) {
    item.querySelectorAll(".enpl-date-chip").forEach((node) => node.remove());
  }

  function getFollowingRankLevel(rank) {
    const match = String(rank || "").match(/s([0-6])/);
    return match ? match[1] : null;
  }

  function collectSearchableText(item) {
    const parts = [
      textOf(getTitleLink(item)),
      ...Array.from(item.querySelectorAll(".place")).map(textOf),
      ...Array.from(item.querySelectorAll(".actor a")).map(textOf)
    ];
    return parts.join(" ").toLowerCase();
  }

  function textOf(node) {
    return (node ? node.textContent : "").replace(/\s+/g, " ").trim();
  }

  function parseEventDate(item) {
    const dateLine = getDateLine(item);
    const text = textOf(dateLine);
    const match = text.match(/(\d{4})[-/.年](\d{1,2})[-/.月](\d{1,2})/);
    if (!match) return null;

    const year = Number(match[1]);
    const month = Number(match[2]);
    const day = Number(match[3]);
    if (!year || !month || !day) return null;

    return new Date(year, month - 1, day);
  }

  function getRelativeDateLabel(eventDate) {
    const today = new Date();
    const startOfToday = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const startOfEvent = new Date(eventDate.getFullYear(), eventDate.getMonth(), eventDate.getDate());
    const days = Math.round((startOfEvent.getTime() - startOfToday.getTime()) / 86400000);

    if (days === 0) return "今日";
    if (days === 1) return "明日";
    if (days === -1) return "昨日";
    if (days > 0) return `あと${days}日`;
    return `${Math.abs(days)}日前`;
  }

  function normalizeKeywords(value) {
    if (Array.isArray(value)) return value.map((word) => String(word).trim()).filter(Boolean);
    return String(value || "")
      .split(/\n|,/)
      .map((word) => word.trim())
      .filter(Boolean);
  }

  function findMatches(text, keywords) {
    const haystack = text.toLowerCase();
    return normalizeKeywords(keywords).filter((keyword) => haystack.includes(keyword.toLowerCase()));
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
      .enpl-compact-enabled .gb_event_list > ul > li.clearfix,
      .enpl-compact-enabled .gb_event_list > li.clearfix {
        min-height: 0;
        padding-top: 8px;
        padding-bottom: 8px;
      }

      .enpl-compact-enabled .gb_event_list > ul > li.clearfix .date,
      .enpl-compact-enabled .gb_event_list > li.clearfix .date {
        width: 120px;
      }

      .enpl-compact-enabled .gb_event_list > ul > li.clearfix .event,
      .enpl-compact-enabled .gb_event_list > li.clearfix .event {
        margin-left: 128px;
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

      .gb_event_list > ul > li.enpl-keyword-hit,
      .gb_event_list > li.enpl-keyword-hit {
        border-left: 4px solid #f0ad4e;
        background: #fff9ed;
      }

      .gb_event_list > ul > li.enpl-muted,
      .gb_event_list > li.enpl-muted {
        border-left: 4px solid #9aa3ad;
        opacity: .48;
      }

      .enpl-hide-muted .gb_event_list > ul > li.enpl-muted,
      .enpl-hide-muted .gb_event_list > li.enpl-muted {
        display: none;
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

      .enpl-followed-actor-5 > a,
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

      .enpl-date-chip {
        display: inline-block;
        margin-left: 4px;
        padding: 0 4px;
        border-radius: 3px;
        color: #8a5a18;
        background: #fff4dc;
        font-size: 10px;
        font-weight: 600;
        line-height: 1.35;
        vertical-align: 1px;
        white-space: nowrap;
      }

    `);
  }
})();
