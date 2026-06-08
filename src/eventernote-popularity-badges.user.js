// ==UserScript==
// @name         Eventernote Popularity Badges
// @namespace    https://github.com/yanfu/eventernote-power-list
// @version      0.1.0
// @description  Add visual popularity badges to Eventernote event lists based on note/attendance count.
// @author       yanfu
// @match        https://www.eventernote.com/events*
// @run-at       document-idle
// @grant        none
// ==/UserScript==

(function () {
  "use strict";

  const STORAGE_KEY = "eventernote-popularity-badges.settings.v1";
  const DEFAULT_SETTINGS = {
    enabled: true,
    warm: 3,
    hot: 10,
    veryHot: 30
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
      return { ...DEFAULT_SETTINGS, ...JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}") };
    } catch (_error) {
      return { ...DEFAULT_SETTINGS };
    }
  }

  function saveSettings() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
  }

  function apply() {
    document.querySelectorAll(".gb_event_list > li.clearfix").forEach((item) => {
      item.querySelectorAll(".enpb-badge").forEach((node) => node.remove());
      if (!settings.enabled) return;

      const title = item.querySelector(".event h4 a, h4 a");
      const count = parseNoteCount(item);
      if (!title || count === null) return;

      const level = getLevel(count);
      const badge = document.createElement("span");
      badge.className = `enpb-badge enpb-${level}`;
      badge.textContent = `${getLabel(level)} ${count}`;
      title.closest("h4").append(" ", badge);
    });

    updatePanel();
  }

  function parseNoteCount(item) {
    const node = item.querySelector(".note_count");
    if (!node) return null;

    const count = Number((node.textContent || "").replace(/[^\d]/g, ""));
    return Number.isFinite(count) ? count : null;
  }

  function getLevel(count) {
    if (count >= settings.veryHot) return "very-hot";
    if (count >= settings.hot) return "hot";
    if (count >= settings.warm) return "warm";
    return "quiet";
  }

  function getLabel(level) {
    return {
      "very-hot": "VERY HOT",
      hot: "HOT",
      warm: "WARM",
      quiet: "QUIET"
    }[level];
  }

  function renderPanel() {
    const panel = document.createElement("aside");
    panel.className = "enpb-panel";
    panel.innerHTML = `
      <button type="button" class="enpb-toggle" aria-expanded="false">Popularity</button>
      <form class="enpb-body">
        <label><input type="checkbox" name="enabled"> Enable badges</label>
        <div class="enpb-thresholds">
          <label>Warm <input type="number" name="warm" min="0" step="1"></label>
          <label>Hot <input type="number" name="hot" min="0" step="1"></label>
          <label>Very hot <input type="number" name="veryHot" min="0" step="1"></label>
        </div>
        <div class="enpb-actions">
          <button type="submit">Apply</button>
          <button type="button" name="reset">Reset</button>
        </div>
      </form>
    `;

    panel.querySelector(".enpb-toggle").addEventListener("click", () => {
      const open = !panel.classList.contains("enpb-open");
      panel.classList.toggle("enpb-open", open);
      panel.querySelector(".enpb-toggle").setAttribute("aria-expanded", String(open));
    });

    panel.querySelector("form").addEventListener("submit", (event) => {
      event.preventDefault();
      settings.enabled = panel.querySelector("[name='enabled']").checked;
      settings.warm = Number(panel.querySelector("[name='warm']").value) || 0;
      settings.hot = Number(panel.querySelector("[name='hot']").value) || 0;
      settings.veryHot = Number(panel.querySelector("[name='veryHot']").value) || 0;
      saveSettings();
      apply();
    });

    panel.querySelector("[name='reset']").addEventListener("click", () => {
      settings = { ...DEFAULT_SETTINGS };
      saveSettings();
      apply();
    });

    document.body.append(panel);
    updatePanel();
  }

  function updatePanel() {
    const panel = document.querySelector(".enpb-panel");
    if (!panel) return;
    panel.querySelector("[name='enabled']").checked = settings.enabled;
    panel.querySelector("[name='warm']").value = settings.warm;
    panel.querySelector("[name='hot']").value = settings.hot;
    panel.querySelector("[name='veryHot']").value = settings.veryHot;
  }

  function injectStyles() {
    const style = document.createElement("style");
    style.textContent = `
      .enpb-badge {
        display: inline-block;
        border-radius: 3px;
        font-size: 11px;
        font-weight: 700;
        line-height: 1.4;
        padding: 1px 5px;
        vertical-align: middle;
        white-space: nowrap;
      }

      .enpb-quiet {
        color: #667085;
        background: #eef1f4;
      }

      .enpb-warm {
        color: #135c3b;
        background: #cdebdc;
      }

      .enpb-hot {
        color: #8a4b00;
        background: #ffdca8;
      }

      .enpb-very-hot {
        color: #8f1f2c;
        background: #ffd1d8;
      }

      .enpb-panel {
        position: fixed;
        right: 14px;
        bottom: 98px;
        z-index: 9997;
        width: 240px;
        font-size: 12px;
        color: #26313d;
      }

      .enpb-toggle,
      .enpb-panel button {
        border: 1px solid #7f95ad;
        border-radius: 4px;
        color: #17324d;
        background: #fff;
        cursor: pointer;
      }

      .enpb-toggle {
        float: right;
        padding: 5px 9px;
        box-shadow: 0 1px 5px rgba(0, 0, 0, .18);
      }

      .enpb-body {
        display: none;
        clear: both;
        margin-top: 34px;
        padding: 10px;
        border: 1px solid #9fb0c3;
        border-radius: 4px;
        background: #fff;
        box-shadow: 0 2px 14px rgba(0, 0, 0, .2);
      }

      .enpb-open .enpb-body {
        display: block;
      }

      .enpb-panel label {
        display: block;
        margin: 0 0 7px;
        font-weight: 700;
      }

      .enpb-thresholds {
        display: grid;
        grid-template-columns: repeat(3, 1fr);
        gap: 6px;
      }

      .enpb-panel input[type="number"] {
        box-sizing: border-box;
        width: 100%;
        margin-top: 3px;
        font: inherit;
      }

      .enpb-actions {
        display: flex;
        justify-content: flex-end;
        gap: 6px;
      }
    `;
    document.head.append(style);
  }
})();
