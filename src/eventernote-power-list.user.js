// ==UserScript==
// @name         Eventernote Power List
// @namespace    https://github.com/wr786/eventernote-power-list
// @version      0.4.1
// @description  Compact Eventernote lists, keyword badges, mute rules, and popularity badges in one script.
// @author       yanfu
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
    maxActors: 10,
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
    actorDensityEnabled: true,
    followedActorHighlightEnabled: true
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
    renderPanel();
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
      applyActorDensity(item);
      applyCompact(item);
    });
    applyFollowedActorHighlights();

    updatePanel();
  }

  function cleanupItem(item) {
    item.classList.remove("enpl-keyword-hit", "enpl-muted");
    item.querySelectorAll(".enpl-badge-row, .enpl-actor-more").forEach((node) => node.remove());
    item.querySelectorAll(".actor li.enpl-actor-hidden").forEach((node) => {
      node.classList.remove("enpl-actor-hidden");
    });
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
    renderKeywordChips(title, highlightMatches, muteMatches);
  }

  function applyPopularity(item) {
    if (!settings.popularityEnabled) return;

    const title = getTitleLink(item);
    const count = parseNoteCount(item);
    if (!title || count === null) return;

    const level = getPopularityLevel(count);
    const badge = document.createElement("span");
    badge.className = `enpl-popularity-badge enpl-popularity-${level}`;
    badge.textContent = `${getPopularityLabel(level)} ${count}`;
    getBadgeRow(title).append(badge);
  }

  function applyActorDensity(item) {
    if (!settings.actorDensityEnabled) return;

    const title = getTitleLink(item);
    if (!title) return;

    const actors = getActorLinks(item);
    if (!actors.length) return;

    const actorPaths = new Set(actors.map((actor) => getPathname(actor.href)).filter(Boolean));
    const actorCount = actorPaths.size;
    const following = getFollowingActorMap();
    if (!following) return;

    const followCount = Array.from(actorPaths).filter((pathname) => following[pathname]).length;
    const followBadge = document.createElement("span");
    followBadge.className = `enpl-follow-badge enpl-follow-${getFollowLevel(followCount)}`;
    followBadge.textContent = `Follow ${followCount}/${actorCount}`;
    getBadgeRow(title).append(followBadge);
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

  function applyCompact(item) {
    if (!settings.compactEnabled) return;
    if (item.dataset.enplExpanded === "true") return;

    const actors = Array.from(item.querySelectorAll(".actor li")).filter((node) => node.querySelector("a"));
    const maxActors = Math.max(0, Number(settings.maxActors) || 0);
    if (actors.length <= maxActors) return;

    actors.slice(maxActors).forEach((node) => node.classList.add("enpl-actor-hidden"));

    const more = document.createElement("li");
    more.className = "enpl-actor-more";

    const button = document.createElement("button");
    button.type = "button";
    button.className = "enpl-actor-more-button";
    button.textContent = `+${actors.length - maxActors}`;
    button.title = "Show hidden actors";
    button.addEventListener("click", () => {
      item.dataset.enplExpanded = "true";
      item.querySelectorAll(".actor li.enpl-actor-hidden").forEach((node) => {
        node.classList.remove("enpl-actor-hidden");
      });
      more.remove();
    });

    more.append(button);
    actors[actors.length - 1].insertAdjacentElement("afterend", more);
  }

  function getEventItems() {
    const containers = Array.from(document.querySelectorAll(".gb_event_list > li, .event_list > li, li.clearfix"));
    return containers.filter((item) => item.querySelector("a[href^='/events/'], a[href*='eventernote.com/events/']"));
  }

  function getTitleLink(item) {
    return item.querySelector(".event h4 a, h4 a");
  }

  function getActorLinks(item) {
    return Array.from(item.querySelectorAll(".actor a[href*='/actors/'], .actors a[href*='/actors/']"));
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

  function renderKeywordChips(titleLink, highlightMatches, muteMatches) {
    const matches = [
      ...highlightMatches.map((word) => ({ word, type: "hit" })),
      ...muteMatches.map((word) => ({ word, type: "mute" }))
    ];
    if (!matches.length) return;

    const row = document.createElement("span");
    row.className = "enpl-chip-row";
    matches.forEach(({ word, type }) => {
      const chip = document.createElement("span");
      chip.className = `enpl-chip enpl-chip-${type}`;
      chip.textContent = word;
      row.append(chip);
    });
    getBadgeRow(titleLink).append(row);
  }

  function getBadgeRow(titleLink) {
    const heading = titleLink.closest("h4");
    let row = heading.nextElementSibling;
    if (!row || !row.classList.contains("enpl-badge-row")) {
      row = document.createElement("div");
      row.className = "enpl-badge-row";
      heading.insertAdjacentElement("afterend", row);
    }
    return row;
  }

  function parseNoteCount(item) {
    const node = item.querySelector(".note_count");
    if (!node) return null;

    const count = Number((node.textContent || "").replace(/[^\d]/g, ""));
    return Number.isFinite(count) ? count : null;
  }

  function getPopularityLevel(count) {
    if (count >= settings.veryHot) return "very-hot";
    if (count >= settings.hot) return "hot";
    if (count >= settings.warm) return "warm";
    return "quiet";
  }

  function getPopularityLabel(level) {
    return {
      "very-hot": "VERY HOT",
      hot: "HOT",
      warm: "WARM",
      quiet: "QUIET"
    }[level];
  }

  function getFollowLevel(count) {
    if (count >= 5) return "5";
    if (count >= 3) return "3";
    if (count >= 1) return "1";
    return "0";
  }

  function renderPanel() {
    const panel = document.createElement("aside");
    panel.className = "enpl-panel";
    panel.innerHTML = `
      <button type="button" class="enpl-toggle" aria-expanded="false">Power List</button>
      <form class="enpl-body">
        <label><input type="checkbox" name="compactEnabled"> Compact list</label>
        <label>Actors shown <input type="number" name="maxActors" min="0" max="20" step="1"></label>
        <label><input type="checkbox" name="keywordsEnabled"> Keyword rules</label>
        <label><input type="checkbox" name="hideMuted"> Hide muted events</label>
        <label>Highlight keywords <textarea name="highlightKeywords" rows="5"></textarea></label>
        <label>Mute keywords <textarea name="muteKeywords" rows="4"></textarea></label>
        <label><input type="checkbox" name="popularityEnabled"> Popularity badges</label>
        <div class="enpl-thresholds">
          <label>Warm <input type="number" name="warm" min="0" step="1"></label>
          <label>Hot <input type="number" name="hot" min="0" step="1"></label>
          <label>Very hot <input type="number" name="veryHot" min="0" step="1"></label>
        </div>
        <label><input type="checkbox" name="actorDensityEnabled"> Actor density badges</label>
        <label><input type="checkbox" name="followedActorHighlightEnabled"> Followed actor highlight</label>
        <div class="enpl-actions">
          <button type="submit">Apply</button>
          <button type="button" name="reset">Reset</button>
        </div>
      </form>
    `;

    panel.querySelector(".enpl-toggle").addEventListener("click", () => {
      const open = !panel.classList.contains("enpl-open");
      panel.classList.toggle("enpl-open", open);
      panel.querySelector(".enpl-toggle").setAttribute("aria-expanded", String(open));
    });

    panel.querySelector("form").addEventListener("submit", (event) => {
      event.preventDefault();
      readPanelValues(panel);
      saveSettings();
      apply();
    });

    panel.querySelector("[name='reset']").addEventListener("click", () => {
      settings = {
        ...DEFAULT_SETTINGS,
        highlightKeywords: [...DEFAULT_SETTINGS.highlightKeywords],
        muteKeywords: [...DEFAULT_SETTINGS.muteKeywords]
      };
      saveSettings();
      apply();
    });

    document.body.append(panel);
    updatePanel();
  }

  function readPanelValues(panel) {
    settings.compactEnabled = panel.querySelector("[name='compactEnabled']").checked;
    settings.maxActors = Number(panel.querySelector("[name='maxActors']").value) || 0;
    settings.keywordsEnabled = panel.querySelector("[name='keywordsEnabled']").checked;
    settings.hideMuted = panel.querySelector("[name='hideMuted']").checked;
    settings.highlightKeywords = normalizeKeywords(panel.querySelector("[name='highlightKeywords']").value);
    settings.muteKeywords = normalizeKeywords(panel.querySelector("[name='muteKeywords']").value);
    settings.popularityEnabled = panel.querySelector("[name='popularityEnabled']").checked;
    settings.warm = Number(panel.querySelector("[name='warm']").value) || 0;
    settings.hot = Number(panel.querySelector("[name='hot']").value) || 0;
    settings.veryHot = Number(panel.querySelector("[name='veryHot']").value) || 0;
    settings.actorDensityEnabled = panel.querySelector("[name='actorDensityEnabled']").checked;
    settings.followedActorHighlightEnabled = panel.querySelector("[name='followedActorHighlightEnabled']").checked;
  }

  function updatePanel() {
    const panel = document.querySelector(".enpl-panel");
    if (!panel) return;

    panel.querySelector("[name='compactEnabled']").checked = settings.compactEnabled;
    panel.querySelector("[name='maxActors']").value = settings.maxActors;
    panel.querySelector("[name='keywordsEnabled']").checked = settings.keywordsEnabled;
    panel.querySelector("[name='hideMuted']").checked = settings.hideMuted;
    panel.querySelector("[name='highlightKeywords']").value = settings.highlightKeywords.join("\n");
    panel.querySelector("[name='muteKeywords']").value = settings.muteKeywords.join("\n");
    panel.querySelector("[name='popularityEnabled']").checked = settings.popularityEnabled;
    panel.querySelector("[name='warm']").value = settings.warm;
    panel.querySelector("[name='hot']").value = settings.hot;
    panel.querySelector("[name='veryHot']").value = settings.veryHot;
    panel.querySelector("[name='actorDensityEnabled']").checked = settings.actorDensityEnabled;
    panel.querySelector("[name='followedActorHighlightEnabled']").checked = settings.followedActorHighlightEnabled;
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

      .enpl-compact-enabled .gb_event_list .actor li.enpl-actor-hidden {
        display: none;
      }

      .gb_event_list > li.enpl-keyword-hit {
        border-left: 4px solid #f0ad4e;
        background: #fff9ed;
      }

      .gb_event_list > li.enpl-muted {
        border-left: 4px solid #9aa3ad;
        opacity: .48;
      }

      .enpl-hide-muted .gb_event_list > li.enpl-muted {
        display: none;
      }

      .enpl-badge-row {
        display: flex;
        flex-wrap: wrap;
        gap: 4px;
        margin: 2px 0 5px;
        align-items: center;
      }

      .enpl-chip-row {
        display: inline-flex;
        flex-wrap: wrap;
        gap: 4px;
      }

      .enpl-chip,
      .enpl-popularity-badge,
      .enpl-follow-badge,
      .enpl-actor-more-button {
        display: inline-block;
        border-radius: 3px;
        font-size: 11px;
        font-weight: 700;
        line-height: 1.4;
        padding: 1px 5px;
        vertical-align: middle;
        white-space: nowrap;
      }

      .enpl-chip-hit {
        color: #8a5a00;
        background: #ffe6a6;
      }

      .enpl-chip-mute {
        color: #4d5965;
        background: #dfe5ec;
      }

      .enpl-popularity-quiet,
      .enpl-actor-more-button {
        color: #667085;
        background: #eef1f4;
      }

      .enpl-follow-0 {
        color: #667085;
        background: #eef1f4;
      }

      .enpl-follow-1 {
        color: #164e63;
        background: #cffafe;
      }

      .enpl-follow-3 {
        color: #14532d;
        background: #bbf7d0;
      }

      .enpl-follow-5 {
        color: #7f1d1d;
        background: #fecaca;
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

      .enpl-popularity-warm {
        color: #135c3b;
        background: #cdebdc;
      }

      .enpl-popularity-hot {
        color: #8a4b00;
        background: #ffdca8;
      }

      .enpl-popularity-very-hot {
        color: #8f1f2c;
        background: #ffd1d8;
      }

      .enpl-actor-more {
        display: inline-block;
      }

      .enpl-actor-more-button {
        border: 0;
        cursor: pointer;
      }

      .enpl-panel {
        position: fixed;
        right: 14px;
        bottom: 14px;
        z-index: 9999;
        width: auto;
        font-size: 12px;
        color: #26313d;
      }

      .enpl-toggle,
      .enpl-panel button {
        border: 1px solid #7f95ad;
        border-radius: 4px;
        color: #17324d;
        background: #fff;
        cursor: pointer;
      }

      .enpl-toggle {
        padding: 5px 9px;
        box-shadow: 0 1px 5px rgba(0, 0, 0, .18);
      }

      .enpl-body {
        display: none;
        position: absolute;
        right: 0;
        bottom: 34px;
        width: 300px;
        box-sizing: border-box;
        padding: 10px;
        border: 1px solid #9fb0c3;
        border-radius: 4px;
        background: #fff;
        box-shadow: 0 2px 14px rgba(0, 0, 0, .2);
      }

      .enpl-open .enpl-body {
        display: block;
      }

      .enpl-panel label {
        display: block;
        margin: 0 0 7px;
        font-weight: 700;
      }

      .enpl-panel input[type="number"],
      .enpl-panel textarea {
        box-sizing: border-box;
        width: 100%;
        margin-top: 3px;
        font: inherit;
      }

      .enpl-panel textarea {
        resize: vertical;
      }

      .enpl-thresholds {
        display: grid;
        grid-template-columns: repeat(3, 1fr);
        gap: 6px;
      }

      .enpl-actions {
        display: flex;
        justify-content: flex-end;
        gap: 6px;
      }
    `);
  }
})();
