// ==UserScript==
// @name         Eventernote Power List
// @namespace    https://github.com/yanfu/eventernote-power-list
// @version      0.1.0
// @description  Compact Eventernote event lists, keyword highlight/mute rules, and popularity badges.
// @author       yanfu
// @match        https://www.eventernote.com/events*
// @run-at       document-idle
// @grant        none
// ==/UserScript==

(function () {
  "use strict";

  const STORAGE_KEY = "eventernote-power-list.settings.v1";

  const DEFAULT_SETTINGS = {
    compact: true,
    hideMuted: false,
    maxActorsInCompact: 4,
    highlightKeywords: [
      "ミニライブ",
      "お見送り会",
      "舞台挨拶",
      "無料",
      "配信",
      "生配信",
      "朗読劇",
      "トークショー"
    ],
    muteKeywords: [
      "女性限定",
      "男性限定"
    ],
    popularity: {
      warm: 3,
      hot: 10,
      veryHot: 30
    }
  };

  const state = {
    settings: loadSettings(),
    panelOpen: false
  };

  boot();

  function boot() {
    if (!document.querySelector(".gb_event_list")) return;

    injectStyles();
    document.body.classList.add("enpl-ready");
    renderPanel();
    apply();
  }

  function loadSettings() {
    try {
      const stored = JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}");
      return {
        ...DEFAULT_SETTINGS,
        ...stored,
        popularity: {
          ...DEFAULT_SETTINGS.popularity,
          ...(stored.popularity || {})
        },
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
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state.settings));
  }

  function apply() {
    document.body.classList.toggle("enpl-compact", state.settings.compact);
    document.body.classList.toggle("enpl-hide-muted", state.settings.hideMuted);

    getEventItems().forEach((item) => enhanceItem(item));
    updatePanelValues();
  }

  function getEventItems() {
    return Array.from(document.querySelectorAll(".gb_event_list > li.clearfix"));
  }

  function enhanceItem(item) {
    const title = item.querySelector(".event h4 a, h4 a");
    if (!title) return;

    cleanupItem(item);

    const searchableText = collectSearchableText(item);
    const highlightMatches = findMatches(searchableText, state.settings.highlightKeywords);
    const muteMatches = findMatches(searchableText, state.settings.muteKeywords);
    const count = parseNoteCount(item);

    item.classList.toggle("enpl-keyword-hit", highlightMatches.length > 0);
    item.classList.toggle("enpl-muted", muteMatches.length > 0);

    renderKeywordChips(item, title, highlightMatches, muteMatches);
    renderPopularityBadge(title, count);
    compactActors(item);
  }

  function cleanupItem(item) {
    item.classList.remove("enpl-keyword-hit", "enpl-muted");
    item.querySelectorAll(".enpl-chip-row, .enpl-popularity-badge, .enpl-actor-more").forEach((node) => node.remove());
    item.querySelectorAll(".actor li.enpl-actor-hidden").forEach((node) => {
      node.classList.remove("enpl-actor-hidden");
    });
  }

  function collectSearchableText(item) {
    const title = textOf(item.querySelector(".event h4 a, h4 a"));
    const places = Array.from(item.querySelectorAll(".place")).map(textOf).join(" ");
    const actors = Array.from(item.querySelectorAll(".actor a")).map(textOf).join(" ");
    return `${title} ${places} ${actors}`.toLowerCase();
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

  function renderKeywordChips(item, titleLink, highlightMatches, muteMatches) {
    const matches = [
      ...highlightMatches.map((word) => ({ word, type: "hit" })),
      ...muteMatches.map((word) => ({ word, type: "mute" }))
    ];
    if (!matches.length) return;

    const row = document.createElement("div");
    row.className = "enpl-chip-row";

    matches.forEach(({ word, type }) => {
      const chip = document.createElement("span");
      chip.className = `enpl-chip enpl-chip-${type}`;
      chip.textContent = word;
      row.append(chip);
    });

    titleLink.closest("h4").insertAdjacentElement("afterend", row);
  }

  function parseNoteCount(item) {
    const node = item.querySelector(".note_count");
    if (!node) return null;

    const number = Number((node.textContent || "").replace(/[^\d]/g, ""));
    return Number.isFinite(number) ? number : null;
  }

  function renderPopularityBadge(titleLink, count) {
    if (count === null) return;

    const badge = document.createElement("span");
    const level = getPopularityLevel(count);
    badge.className = `enpl-popularity-badge enpl-popularity-${level}`;
    badge.textContent = `${getPopularityLabel(level)} ${count}`;
    titleLink.closest("h4").append(" ", badge);
  }

  function getPopularityLevel(count) {
    const { warm, hot, veryHot } = state.settings.popularity;
    if (count >= veryHot) return "very-hot";
    if (count >= hot) return "hot";
    if (count >= warm) return "warm";
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

  function compactActors(item) {
    const actorItems = Array.from(item.querySelectorAll(".actor li")).filter((node) => node.querySelector("a"));
    const maxActors = Math.max(0, Number(state.settings.maxActorsInCompact) || 0);
    if (!state.settings.compact || actorItems.length <= maxActors) return;

    actorItems.slice(maxActors).forEach((node) => node.classList.add("enpl-actor-hidden"));

    const more = document.createElement("li");
    more.className = "enpl-actor-more";
    more.textContent = `+${actorItems.length - maxActors}`;
    actorItems[actorItems.length - 1].insertAdjacentElement("afterend", more);
  }

  function renderPanel() {
    const panel = document.createElement("aside");
    panel.className = "enpl-panel";
    panel.innerHTML = `
      <button type="button" class="enpl-panel-toggle" aria-expanded="false">Power List</button>
      <form class="enpl-panel-body">
        <label><input type="checkbox" name="compact"> Compact list</label>
        <label><input type="checkbox" name="hideMuted"> Hide muted</label>
        <label>Actors in compact <input type="number" name="maxActorsInCompact" min="0" max="20" step="1"></label>
        <label>Highlight keywords <textarea name="highlightKeywords" rows="5"></textarea></label>
        <label>Mute keywords <textarea name="muteKeywords" rows="4"></textarea></label>
        <div class="enpl-thresholds">
          <label>Warm <input type="number" name="warm" min="0" step="1"></label>
          <label>Hot <input type="number" name="hot" min="0" step="1"></label>
          <label>Very hot <input type="number" name="veryHot" min="0" step="1"></label>
        </div>
        <div class="enpl-panel-actions">
          <button type="submit">Apply</button>
          <button type="button" name="reset">Reset</button>
        </div>
      </form>
    `;

    panel.querySelector(".enpl-panel-toggle").addEventListener("click", () => {
      state.panelOpen = !state.panelOpen;
      panel.classList.toggle("enpl-panel-open", state.panelOpen);
      panel.querySelector(".enpl-panel-toggle").setAttribute("aria-expanded", String(state.panelOpen));
    });

    panel.querySelector("form").addEventListener("submit", (event) => {
      event.preventDefault();
      readPanelValues(panel);
      saveSettings();
      apply();
    });

    panel.querySelector("[name='reset']").addEventListener("click", () => {
      state.settings = { ...DEFAULT_SETTINGS, popularity: { ...DEFAULT_SETTINGS.popularity } };
      saveSettings();
      apply();
    });

    document.body.append(panel);
    updatePanelValues();
  }

  function updatePanelValues() {
    const panel = document.querySelector(".enpl-panel");
    if (!panel) return;

    panel.querySelector("[name='compact']").checked = state.settings.compact;
    panel.querySelector("[name='hideMuted']").checked = state.settings.hideMuted;
    panel.querySelector("[name='maxActorsInCompact']").value = state.settings.maxActorsInCompact;
    panel.querySelector("[name='highlightKeywords']").value = state.settings.highlightKeywords.join("\n");
    panel.querySelector("[name='muteKeywords']").value = state.settings.muteKeywords.join("\n");
    panel.querySelector("[name='warm']").value = state.settings.popularity.warm;
    panel.querySelector("[name='hot']").value = state.settings.popularity.hot;
    panel.querySelector("[name='veryHot']").value = state.settings.popularity.veryHot;
  }

  function readPanelValues(panel) {
    state.settings.compact = panel.querySelector("[name='compact']").checked;
    state.settings.hideMuted = panel.querySelector("[name='hideMuted']").checked;
    state.settings.maxActorsInCompact = Number(panel.querySelector("[name='maxActorsInCompact']").value) || 0;
    state.settings.highlightKeywords = normalizeKeywords(panel.querySelector("[name='highlightKeywords']").value);
    state.settings.muteKeywords = normalizeKeywords(panel.querySelector("[name='muteKeywords']").value);
    state.settings.popularity = {
      warm: Number(panel.querySelector("[name='warm']").value) || 0,
      hot: Number(panel.querySelector("[name='hot']").value) || 0,
      veryHot: Number(panel.querySelector("[name='veryHot']").value) || 0
    };
  }

  function injectStyles() {
    const style = document.createElement("style");
    style.textContent = `
      .enpl-ready .gb_event_list > li.clearfix {
        position: relative;
        border-left: 4px solid transparent;
        transition: background-color .12s ease, opacity .12s ease;
      }

      .enpl-ready .gb_event_list > li.enpl-keyword-hit {
        border-left-color: #f0ad4e;
        background: #fff9ed;
      }

      .enpl-ready .gb_event_list > li.enpl-muted {
        opacity: .48;
        border-left-color: #9aa3ad;
      }

      .enpl-hide-muted .gb_event_list > li.enpl-muted {
        display: none;
      }

      .enpl-compact .gb_event_list > li.clearfix {
        min-height: 0;
        padding-top: 8px;
        padding-bottom: 8px;
      }

      .enpl-compact .gb_event_list > li.clearfix .date img {
        display: none;
      }

      .enpl-compact .gb_event_list > li.clearfix .date {
        width: 105px;
      }

      .enpl-compact .gb_event_list > li.clearfix .event {
        margin-left: 112px;
      }

      .enpl-compact .gb_event_list h4 {
        margin: 0 0 4px;
        line-height: 1.35;
      }

      .enpl-compact .gb_event_list .place {
        margin: 1px 0;
      }

      .enpl-compact .gb_event_list .actor ul {
        margin-bottom: 0;
      }

      .enpl-compact .gb_event_list .actor li.enpl-actor-hidden {
        display: none;
      }

      .enpl-chip-row {
        display: flex;
        flex-wrap: wrap;
        gap: 4px;
        margin: 2px 0 5px;
      }

      .enpl-chip,
      .enpl-popularity-badge,
      .enpl-actor-more {
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

      .enpl-popularity-quiet {
        color: #667085;
        background: #eef1f4;
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
        color: #4b5563;
        background: #eef1f4;
      }

      .enpl-panel {
        position: fixed;
        right: 14px;
        bottom: 14px;
        z-index: 9999;
        width: 260px;
        font-size: 12px;
        color: #26313d;
      }

      .enpl-panel-toggle,
      .enpl-panel button {
        border: 1px solid #7f95ad;
        border-radius: 4px;
        color: #17324d;
        background: #fff;
        cursor: pointer;
      }

      .enpl-panel-toggle {
        float: right;
        padding: 5px 9px;
        box-shadow: 0 1px 5px rgba(0, 0, 0, .18);
      }

      .enpl-panel-body {
        display: none;
        clear: both;
        margin-top: 34px;
        padding: 10px;
        border: 1px solid #9fb0c3;
        border-radius: 4px;
        background: #fff;
        box-shadow: 0 2px 14px rgba(0, 0, 0, .2);
      }

      .enpl-panel-open .enpl-panel-body {
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

      .enpl-panel-actions {
        display: flex;
        justify-content: flex-end;
        gap: 6px;
        margin-top: 8px;
      }

      .enpl-panel-actions button {
        padding: 3px 8px;
      }
    `;
    document.head.append(style);
  }
})();
