// ==UserScript==
// @name         Eventernote Power List
// @namespace    https://github.com/wr786/eventernote-power-list
// @version      0.6.0
// @description  Compact Eventernote lists, dark mode, mute rules, popularity highlighting, and followed actor highlighting.
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
    darkModeEnabled: false
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
    document.body.classList.toggle("enpl-dark-mode", settings.darkModeEnabled);
    cleanupFollowedActorHighlights();

    getEventItems().forEach((item) => {
      cleanupItem(item);
      applyKeywords(item);
      applyPopularity(item);
    });
    applyFollowedActorHighlights();

    updatePanel();
  }

  function cleanupItem(item) {
    item.classList.remove("enpl-keyword-hit", "enpl-muted");
    cleanupPopularity(item);
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
    const containers = Array.from(document.querySelectorAll(".gb_event_list > li, .event_list > li, li.clearfix"));
    return containers.filter((item) => item.querySelector("a[href^='/events/'], a[href*='eventernote.com/events/']"));
  }

  function getTitleLink(item) {
    return item.querySelector(".event h4 a, h4 a");
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

  function renderPanel() {
    const panel = document.createElement("aside");
    panel.className = "enpl-panel";
    panel.innerHTML = `
      <div class="enpl-controls">
        <button type="button" class="enpl-theme-toggle" title="Toggle dark mode" aria-pressed="false">Light</button>
        <button type="button" class="enpl-toggle" aria-expanded="false">Power List</button>
      </div>
      <form class="enpl-body">
        <label><input type="checkbox" name="compactEnabled"> Compact list</label>
        <label><input type="checkbox" name="keywordsEnabled"> Keyword rules</label>
        <label><input type="checkbox" name="hideMuted"> Hide muted events</label>
        <label>Highlight keywords <textarea name="highlightKeywords" rows="5"></textarea></label>
        <label>Mute keywords <textarea name="muteKeywords" rows="4"></textarea></label>
        <label><input type="checkbox" name="popularityEnabled"> Popularity highlight</label>
        <div class="enpl-thresholds">
          <label>Warm <input type="number" name="warm" min="0" step="1"></label>
          <label>Hot <input type="number" name="hot" min="0" step="1"></label>
          <label>Very hot <input type="number" name="veryHot" min="0" step="1"></label>
        </div>
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

    panel.querySelector(".enpl-theme-toggle").addEventListener("click", () => {
      settings.darkModeEnabled = !settings.darkModeEnabled;
      saveSettings();
      apply();
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
    settings.keywordsEnabled = panel.querySelector("[name='keywordsEnabled']").checked;
    settings.hideMuted = panel.querySelector("[name='hideMuted']").checked;
    settings.highlightKeywords = normalizeKeywords(panel.querySelector("[name='highlightKeywords']").value);
    settings.muteKeywords = normalizeKeywords(panel.querySelector("[name='muteKeywords']").value);
    settings.popularityEnabled = panel.querySelector("[name='popularityEnabled']").checked;
    settings.warm = Number(panel.querySelector("[name='warm']").value) || 0;
    settings.hot = Number(panel.querySelector("[name='hot']").value) || 0;
    settings.veryHot = Number(panel.querySelector("[name='veryHot']").value) || 0;
    settings.followedActorHighlightEnabled = panel.querySelector("[name='followedActorHighlightEnabled']").checked;
  }

  function updatePanel() {
    const panel = document.querySelector(".enpl-panel");
    if (!panel) return;

    panel.querySelector("[name='compactEnabled']").checked = settings.compactEnabled;
    panel.querySelector("[name='keywordsEnabled']").checked = settings.keywordsEnabled;
    panel.querySelector("[name='hideMuted']").checked = settings.hideMuted;
    panel.querySelector("[name='highlightKeywords']").value = settings.highlightKeywords.join("\n");
    panel.querySelector("[name='muteKeywords']").value = settings.muteKeywords.join("\n");
    panel.querySelector("[name='popularityEnabled']").checked = settings.popularityEnabled;
    panel.querySelector("[name='warm']").value = settings.warm;
    panel.querySelector("[name='hot']").value = settings.hot;
    panel.querySelector("[name='veryHot']").value = settings.veryHot;
    panel.querySelector("[name='followedActorHighlightEnabled']").checked = settings.followedActorHighlightEnabled;
    const themeToggle = panel.querySelector(".enpl-theme-toggle");
    themeToggle.textContent = settings.darkModeEnabled ? "Dark" : "Light";
    themeToggle.setAttribute("aria-pressed", String(settings.darkModeEnabled));
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

      .enpl-panel {
        position: fixed;
        right: 14px;
        bottom: 14px;
        z-index: 9999;
        width: auto;
        font-size: 12px;
        color: #26313d;
      }

      .enpl-controls {
        display: flex;
        justify-content: flex-end;
        gap: 6px;
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

      .enpl-theme-toggle[aria-pressed="true"] {
        color: #f8fafc;
        background: #1f2937;
        border-color: #64748b;
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

      body.enpl-dark-mode {
        color: #d7dde7;
        background: #111827;
      }

      body.enpl-dark-mode .container,
      body.enpl-dark-mode .page,
      body.enpl-dark-mode .span4.page,
      body.enpl-dark-mode .span8.page,
      body.enpl-dark-mode .span12,
      body.enpl-dark-mode .gb_form,
      body.enpl-dark-mode .gb_event_list,
      body.enpl-dark-mode .gb_listview,
      body.enpl-dark-mode .gb_events_side_comment,
      body.enpl-dark-mode .gb_events_side_month,
      body.enpl-dark-mode .gb_history_editor_list,
      body.enpl-dark-mode .gb_events_detail_title,
      body.enpl-dark-mode .gb_events_info_table,
      body.enpl-dark-mode .well,
      body.enpl-dark-mode .hero-unit {
        color: #d7dde7;
        background: #111827;
      }

      body.enpl-dark-mode .navbar-inner,
      body.enpl-dark-mode .footer,
      body.enpl-dark-mode .gb_ad_footer {
        background: #0b1220;
      }

      body.enpl-dark-mode .breadcrumb,
      body.enpl-dark-mode .page-header,
      body.enpl-dark-mode .gb_subtitle,
      body.enpl-dark-mode .control-group,
      body.enpl-dark-mode .media,
      body.enpl-dark-mode .gb_event_list > li,
      body.enpl-dark-mode li.clearfix,
      body.enpl-dark-mode table,
      body.enpl-dark-mode tr,
      body.enpl-dark-mode td,
      body.enpl-dark-mode th {
        border-color: #334155;
      }

      body.enpl-dark-mode .gb_event_list > li,
      body.enpl-dark-mode .media,
      body.enpl-dark-mode .breadcrumb,
      body.enpl-dark-mode .gb_form,
      body.enpl-dark-mode .enpl-body {
        background: #1f2937;
      }

      body.enpl-dark-mode h1,
      body.enpl-dark-mode h2,
      body.enpl-dark-mode h3,
      body.enpl-dark-mode h4,
      body.enpl-dark-mode h5,
      body.enpl-dark-mode h6,
      body.enpl-dark-mode label,
      body.enpl-dark-mode p,
      body.enpl-dark-mode li,
      body.enpl-dark-mode .s,
      body.enpl-dark-mode .color2,
      body.enpl-dark-mode .control-label {
        color: #d7dde7;
      }

      body.enpl-dark-mode a {
        color: #93c5fd;
      }

      body.enpl-dark-mode a:hover {
        color: #bfdbfe;
      }

      body.enpl-dark-mode input,
      body.enpl-dark-mode textarea,
      body.enpl-dark-mode select {
        color: #e5e7eb;
        background: #0f172a;
        border-color: #475569;
      }

      body.enpl-dark-mode .btn {
        color: #e5e7eb;
        background-image: none;
        background-color: #334155;
        border-color: #475569;
        text-shadow: none;
      }

      body.enpl-dark-mode .btn-primary {
        background-color: #1d4ed8;
        border-color: #2563eb;
      }

      body.enpl-dark-mode .enpl-panel,
      body.enpl-dark-mode .enpl-panel label {
        color: #d7dde7;
      }

      body.enpl-dark-mode .enpl-toggle,
      body.enpl-dark-mode .enpl-panel button {
        color: #e5e7eb;
        background: #1f2937;
        border-color: #64748b;
      }

      body.enpl-dark-mode .gb_event_list > li.enpl-keyword-hit {
        background: #332a19;
      }

      body.enpl-dark-mode .gb_event_list > li.enpl-muted {
        opacity: .5;
      }

      body.enpl-dark-mode .enpl-followed-actor > a {
        color: #fdba74;
        background: #3b260f;
      }

      body.enpl-dark-mode .enpl-followed-actor-3 > a,
      body.enpl-dark-mode .enpl-followed-actor-4 > a {
        color: #fca5a5;
        background: #3b1515;
      }

      body.enpl-dark-mode .enpl-followed-actor-5 > a,
      body.enpl-dark-mode .enpl-followed-actor-6 > a {
        color: #fde68a;
        background: #3b310b;
      }
    `);
  }
})();
