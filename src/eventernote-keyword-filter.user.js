// ==UserScript==
// @name         Eventernote Keyword Filter
// @namespace    https://github.com/wr786/eventernote-power-list
// @version      0.1.0
// @description  Highlight or mute Eventernote events by title, venue, and actor keywords.
// @author       yanfu
// @match        https://www.eventernote.com/events*
// @run-at       document-idle
// @grant        none
// ==/UserScript==

(function () {
  "use strict";

  const STORAGE_KEY = "eventernote-keyword-filter.settings.v1";
  const DEFAULT_SETTINGS = {
    enabled: true,
    hideMuted: false,
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
    ]
  };

  let settings = loadSettings();

  boot();

  function boot() {
    if (!document.querySelector(".gb_event_list")) return;
    injectStyles();
    renderPanel();
    apply();
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
    document.body.classList.toggle("enkf-hide-muted", settings.enabled && settings.hideMuted);

    document.querySelectorAll(".gb_event_list > li.clearfix").forEach((item) => {
      cleanup(item);
      if (!settings.enabled) return;

      const title = item.querySelector(".event h4 a, h4 a");
      if (!title) return;

      const text = collectSearchableText(item);
      const highlightMatches = findMatches(text, settings.highlightKeywords);
      const muteMatches = findMatches(text, settings.muteKeywords);

      item.classList.toggle("enkf-keyword-hit", highlightMatches.length > 0);
      item.classList.toggle("enkf-muted", muteMatches.length > 0);
      renderChips(title, highlightMatches, muteMatches);
    });

    updatePanel();
  }

  function cleanup(item) {
    item.classList.remove("enkf-keyword-hit", "enkf-muted");
    item.querySelectorAll(".enkf-chip-row").forEach((node) => node.remove());
  }

  function collectSearchableText(item) {
    const parts = [
      textOf(item.querySelector(".event h4 a, h4 a")),
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

  function renderChips(titleLink, highlightMatches, muteMatches) {
    const matches = [
      ...highlightMatches.map((word) => ({ word, type: "hit" })),
      ...muteMatches.map((word) => ({ word, type: "mute" }))
    ];
    if (!matches.length) return;

    const row = document.createElement("div");
    row.className = "enkf-chip-row";
    matches.forEach(({ word, type }) => {
      const chip = document.createElement("span");
      chip.className = `enkf-chip enkf-chip-${type}`;
      chip.textContent = word;
      row.append(chip);
    });
    titleLink.closest("h4").insertAdjacentElement("afterend", row);
  }

  function renderPanel() {
    const panel = document.createElement("aside");
    panel.className = "enkf-panel";
    panel.innerHTML = `
      <button type="button" class="enkf-toggle" aria-expanded="false">Keywords</button>
      <form class="enkf-body">
        <label><input type="checkbox" name="enabled"> Enable keyword rules</label>
        <label><input type="checkbox" name="hideMuted"> Hide muted events</label>
        <label>Highlight keywords <textarea name="highlightKeywords" rows="5"></textarea></label>
        <label>Mute keywords <textarea name="muteKeywords" rows="4"></textarea></label>
        <div class="enkf-actions">
          <button type="submit">Apply</button>
          <button type="button" name="reset">Reset</button>
        </div>
      </form>
    `;

    panel.querySelector(".enkf-toggle").addEventListener("click", () => {
      const open = !panel.classList.contains("enkf-open");
      panel.classList.toggle("enkf-open", open);
      panel.querySelector(".enkf-toggle").setAttribute("aria-expanded", String(open));
    });

    panel.querySelector("form").addEventListener("submit", (event) => {
      event.preventDefault();
      settings.enabled = panel.querySelector("[name='enabled']").checked;
      settings.hideMuted = panel.querySelector("[name='hideMuted']").checked;
      settings.highlightKeywords = normalizeKeywords(panel.querySelector("[name='highlightKeywords']").value);
      settings.muteKeywords = normalizeKeywords(panel.querySelector("[name='muteKeywords']").value);
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

  function updatePanel() {
    const panel = document.querySelector(".enkf-panel");
    if (!panel) return;
    panel.querySelector("[name='enabled']").checked = settings.enabled;
    panel.querySelector("[name='hideMuted']").checked = settings.hideMuted;
    panel.querySelector("[name='highlightKeywords']").value = settings.highlightKeywords.join("\n");
    panel.querySelector("[name='muteKeywords']").value = settings.muteKeywords.join("\n");
  }

  function injectStyles() {
    const style = document.createElement("style");
    style.textContent = `
      .gb_event_list > li.enkf-keyword-hit {
        border-left: 4px solid #f0ad4e;
        background: #fff9ed;
      }

      .gb_event_list > li.enkf-muted {
        border-left: 4px solid #9aa3ad;
        opacity: .48;
      }

      .enkf-hide-muted .gb_event_list > li.enkf-muted {
        display: none;
      }

      .enkf-chip-row {
        display: flex;
        flex-wrap: wrap;
        gap: 4px;
        margin: 2px 0 5px;
      }

      .enkf-chip {
        display: inline-block;
        border-radius: 3px;
        font-size: 11px;
        font-weight: 700;
        line-height: 1.4;
        padding: 1px 5px;
        white-space: nowrap;
      }

      .enkf-chip-hit {
        color: #8a5a00;
        background: #ffe6a6;
      }

      .enkf-chip-mute {
        color: #4d5965;
        background: #dfe5ec;
      }

      .enkf-panel {
        position: fixed;
        right: 14px;
        bottom: 56px;
        z-index: 9998;
        width: 250px;
        font-size: 12px;
        color: #26313d;
      }

      .enkf-toggle,
      .enkf-panel button {
        border: 1px solid #7f95ad;
        border-radius: 4px;
        color: #17324d;
        background: #fff;
        cursor: pointer;
      }

      .enkf-toggle {
        float: right;
        padding: 5px 9px;
        box-shadow: 0 1px 5px rgba(0, 0, 0, .18);
      }

      .enkf-body {
        display: none;
        clear: both;
        margin-top: 34px;
        padding: 10px;
        border: 1px solid #9fb0c3;
        border-radius: 4px;
        background: #fff;
        box-shadow: 0 2px 14px rgba(0, 0, 0, .2);
      }

      .enkf-open .enkf-body {
        display: block;
      }

      .enkf-panel label {
        display: block;
        margin: 0 0 7px;
        font-weight: 700;
      }

      .enkf-panel textarea {
        box-sizing: border-box;
        width: 100%;
        margin-top: 3px;
        font: inherit;
        resize: vertical;
      }

      .enkf-actions {
        display: flex;
        justify-content: flex-end;
        gap: 6px;
      }
    `;
    document.head.append(style);
  }
})();
