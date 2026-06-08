// ==UserScript==
// @name         Eventernote Compact List
// @namespace    https://github.com/wr786/eventernote-power-list
// @version      0.1.1
// @description  Make Eventernote event list pages denser by hiding images and folding long actor lists.
// @author       yanfu
// @match        https://www.eventernote.com/*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=eventernote.com
// @run-at       document-idle
// @grant        GM_addStyle
// @license      MIT
// ==/UserScript==

(function () {
  "use strict";

  const STORAGE_KEY = "eventernote-compact-list.settings.v1";
  const DEFAULT_SETTINGS = {
    enabled: true,
    maxActors: 4
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
      if (!started) {
        tryBoot();
      }
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
    console.info("[Eventernote Compact List] active");
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
    document.body.classList.toggle("encl-enabled", settings.enabled);

    getEventItems().forEach((item) => {
      item.querySelectorAll(".actor li.encl-actor-hidden").forEach((node) => {
        node.classList.remove("encl-actor-hidden");
      });
      item.querySelectorAll(".encl-actor-more").forEach((node) => node.remove());

      if (!settings.enabled) return;

      const actors = Array.from(item.querySelectorAll(".actor li")).filter((node) => node.querySelector("a"));
      const maxActors = Math.max(0, Number(settings.maxActors) || 0);
      if (actors.length <= maxActors) return;

      actors.slice(maxActors).forEach((node) => node.classList.add("encl-actor-hidden"));

      const more = document.createElement("li");
      more.className = "encl-actor-more";
      more.textContent = `+${actors.length - maxActors}`;
      actors[actors.length - 1].insertAdjacentElement("afterend", more);
    });

    updatePanel();
  }

  function renderPanel() {
    const panel = document.createElement("aside");
    panel.className = "encl-panel";
    panel.innerHTML = `
      <button type="button" class="encl-toggle" aria-expanded="false">Compact</button>
      <form class="encl-body">
        <label><input type="checkbox" name="enabled"> Enable compact list</label>
        <label>Actors shown <input type="number" name="maxActors" min="0" max="20" step="1"></label>
        <div class="encl-actions">
          <button type="submit">Apply</button>
          <button type="button" name="reset">Reset</button>
        </div>
      </form>
    `;

    panel.querySelector(".encl-toggle").addEventListener("click", () => {
      const open = !panel.classList.contains("encl-open");
      panel.classList.toggle("encl-open", open);
      panel.querySelector(".encl-toggle").setAttribute("aria-expanded", String(open));
    });

    panel.querySelector("form").addEventListener("submit", (event) => {
      event.preventDefault();
      settings.enabled = panel.querySelector("[name='enabled']").checked;
      settings.maxActors = Number(panel.querySelector("[name='maxActors']").value) || 0;
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

  function getEventItems() {
    const containers = Array.from(document.querySelectorAll(".gb_event_list > li, .event_list > li, li.clearfix"));
    return containers.filter((item) => item.querySelector("a[href^='/events/'], a[href*='eventernote.com/events/']"));
  }

  function updatePanel() {
    const panel = document.querySelector(".encl-panel");
    if (!panel) return;
    panel.querySelector("[name='enabled']").checked = settings.enabled;
    panel.querySelector("[name='maxActors']").value = settings.maxActors;
  }

  function injectStyles() {
    GM_addStyle(`
      .encl-enabled .gb_event_list > li.clearfix {
        min-height: 0;
        padding-top: 8px;
        padding-bottom: 8px;
      }

      .encl-enabled .gb_event_list > li.clearfix .date img {
        display: none;
      }

      .encl-enabled .gb_event_list > li.clearfix .date {
        width: 105px;
      }

      .encl-enabled .gb_event_list > li.clearfix .event {
        margin-left: 112px;
      }

      .encl-enabled .gb_event_list h4 {
        margin: 0 0 4px;
        line-height: 1.35;
      }

      .encl-enabled .gb_event_list .place {
        margin: 1px 0;
      }

      .encl-enabled .gb_event_list .actor ul {
        margin-bottom: 0;
      }

      .encl-enabled .gb_event_list .actor li.encl-actor-hidden {
        display: none;
      }

      .encl-actor-more {
        display: inline-block;
        border-radius: 3px;
        color: #4b5563;
        background: #eef1f4;
        font-size: 11px;
        font-weight: 700;
        line-height: 1.4;
        padding: 1px 5px;
        white-space: nowrap;
      }

      .encl-panel {
        position: fixed;
        right: 14px;
        bottom: 14px;
        z-index: 9999;
        width: 220px;
        font-size: 12px;
        color: #26313d;
      }

      .encl-toggle,
      .encl-panel button {
        border: 1px solid #7f95ad;
        border-radius: 4px;
        color: #17324d;
        background: #fff;
        cursor: pointer;
      }

      .encl-toggle {
        float: right;
        padding: 5px 9px;
        box-shadow: 0 1px 5px rgba(0, 0, 0, .18);
      }

      .encl-body {
        display: none;
        clear: both;
        margin-top: 34px;
        padding: 10px;
        border: 1px solid #9fb0c3;
        border-radius: 4px;
        background: #fff;
        box-shadow: 0 2px 14px rgba(0, 0, 0, .2);
      }

      .encl-open .encl-body {
        display: block;
      }

      .encl-panel label {
        display: block;
        margin: 0 0 7px;
        font-weight: 700;
      }

      .encl-panel input[type="number"] {
        box-sizing: border-box;
        width: 100%;
        margin-top: 3px;
        font: inherit;
      }

      .encl-actions {
        display: flex;
        justify-content: flex-end;
        gap: 6px;
      }
    `);
  }
})();
