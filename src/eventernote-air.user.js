// ==UserScript==
// @name         Eventernote Air
// @namespace    https://github.com/wr786/eventernote-power-list
// @version      0.2.1
// @description  A distinct Apple-inspired Eventernote redesign: light glass navigation, separate event cards, date tiles and a layered sidebar. Complements Eventernote EX.
// @author       wr786
// @match        https://www.eventernote.com/*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=eventernote.com
// @run-at       document-end
// @grant        GM_addStyle
// @license      MIT
// ==/UserScript==

(function () {
  "use strict";

  document.body.classList.add("ena-enabled");
  GM_addStyle(`
    body.ena-enabled {
      --ena-ink: #25262b;
      --ena-muted: #727680;
      --ena-link: #28568b;
      --ena-line: #e8e9ed;
      --ena-surface: #fff;
      --ena-canvas: #eaf0f8;
      color: var(--ena-ink);
      background: radial-gradient(ellipse at 15% 0%, #e0e8ff 0%, transparent 50%), radial-gradient(ellipse at 90% 10%, #f6e9ee 0%, transparent 38%), var(--ena-canvas);
      background-attachment: fixed;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", "Hiragino Kaku Gothic ProN", Meiryo, sans-serif;
      font-optical-sizing: auto;
      -webkit-font-smoothing: antialiased;
    }

    body.ena-enabled > .navbar .navbar-inner {
      background: rgba(255, 255, 255, .88);
      background-image: none;
      border: 0;
      box-shadow: 0 1px 0 rgba(49,69,106,.1), 0 8px 30px rgba(40,65,105,.08);
      padding-bottom: 8px;
      backdrop-filter: blur(20px) saturate(140%);
      -webkit-backdrop-filter: blur(20px) saturate(140%);
    }
    body.ena-enabled .navbar .logo img { filter: brightness(0); opacity: .84; }
    body.ena-enabled .navbar .caret { border-top-color: #53657e; border-bottom-color: #53657e; }
    body.ena-enabled .navbar .topic { color: #7c8698; font-size: 10px; letter-spacing: .02em; }
    body.ena-enabled .navbar .nav > li > a {
      margin: 0 2px;
      border-radius: 9px;
      color: #35435b;
      text-shadow: none;
      font-size: 13px;
      font-weight: 600;
    }
    body.ena-enabled .navbar .nav > li > a:hover,
    body.ena-enabled .navbar .nav > li > a:focus-visible { color: #203e70; background: #e7edf8; }
    body.ena-enabled .navbar .nav > .active > a { color: #203e70; background: #e7edf8; box-shadow: none; }
    body.ena-enabled .navbar .search_box input[type="text"] {
      border: 1px solid #d8e0ec;
      border-radius: 8px;
      color: #35435b;
      background: #edf1f8;
      box-shadow: none;
      font-family: inherit;
    }
    body.ena-enabled .navbar .search_box input::placeholder { color: #7d889c; opacity: 1; }
    body.ena-enabled .navbar .search_box .btn { border: 0; border-radius: 8px; color: #182537; background: #e8edf5; text-shadow: none; box-shadow: none; }
    body.ena-enabled .navbar .dropdown-menu { padding: 6px; border: 1px solid var(--ena-line); border-radius: 12px; box-shadow: 0 12px 32px rgba(20,25,40,.15); }
    body.ena-enabled .navbar .dropdown-menu > li > a { border-radius: 6px; text-shadow: none; }

    body.ena-enabled .container .page {
      box-sizing: border-box;
      border: 1px solid var(--ena-line);
      border-radius: 24px;
      background: var(--ena-surface);
      box-shadow: 0 4px 22px rgba(30,40,60,.035);
    }
    body.ena-enabled .span8.page:has(> .gb_event_list) { border: 0; background: transparent; box-shadow: none; }
    body.ena-enabled .span4.page { padding: 14px; border-color: #d7e0ef; background: #e6edf8; box-shadow: inset 0 1px 0 rgba(255,255,255,.9), 0 10px 30px rgba(43,66,103,.05); }
    body.ena-enabled .span8.page > .gb_subtitle { padding: 16px 18px; margin-bottom: 16px; border: 1px solid #d8e2f1; border-radius: 16px; background: linear-gradient(115deg, #fff, #e8effb); color: #344b74; font-size: 20px; }
    body.ena-enabled .span4.page > .gb_subtitle { color: #415474; font-size: 15px; }
    body.ena-enabled .breadcrumb { padding: 12px 2px; margin-bottom: 4px; border: 0; background: transparent; font-size: 12px; text-shadow: none; }
    body.ena-enabled .breadcrumb a { color: var(--ena-muted); }
    body.ena-enabled .breadcrumb .divider { color: #b7bbc4; }
    body.ena-enabled .gb_subtitle {
      padding: 12px 0;
      border: 0;
      color: #34363e;
      background: transparent;
      font-size: 17px;
      font-weight: 600;
      line-height: 1.45;
      letter-spacing: -.015em;
    }
    body.ena-enabled .page-title h1 { color: #20232a; font-weight: 600; letter-spacing: -.035em; }
    body.ena-enabled .page-title p { color: var(--ena-muted); }
    body.ena-enabled .row:has(> .gb_top_box) { display: flex; flex-wrap: wrap; align-items: stretch; }
    body.ena-enabled .gb_top_box { flex: 0 0 380px; margin-bottom: 20px; height: auto; min-height: 280px; box-sizing: border-box; padding: 22px; border: 1px solid var(--ena-line); border-radius: 20px; background: #fff; box-shadow: 0 5px 24px rgba(30,40,60,.035); }
    body.ena-enabled .gb_top_box h2 { color: #34363e; font-size: 21px; font-weight: 600; letter-spacing: -.02em; }
    body.ena-enabled .gb_top_box p { color: var(--ena-muted); line-height: 1.7; }

    /* EX owns event-row geometry and performer chips; these rules decorate the native surfaces only. */
    body.ena-enabled .gb_event_list > ul > li,
    body.ena-enabled .gb_event_list > li {
      box-sizing: border-box;
      margin-bottom: 12px;
      border: 1px solid #dce4f0;
      border-radius: 20px;
      background-color: #fff;
      box-shadow: 0 5px 18px rgba(48,69,106,.055);
    }
    body.ena-enabled.enpl-compact-enabled .gb_event_list > ul > li,
    body.ena-enabled.enpl-compact-enabled .gb_event_list > li { padding-top: 8px; padding-bottom: 8px; }
    body.ena-enabled:not(.enpl-compact-enabled) .gb_event_list > ul > li,
    body.ena-enabled:not(.enpl-compact-enabled) .gb_event_list > li { padding-top: 14px; padding-bottom: 14px; }
    body.ena-enabled .gb_event_list > ul > li:hover,
    body.ena-enabled .gb_event_list > li:hover { background-color: #fcfdff; border-color: #b7c9e4; box-shadow: 0 7px 24px rgba(48,69,106,.09); }
    body.ena-enabled .gb_event_list .event > h4 > a { color: var(--ena-link); font-weight: 600; text-decoration: none; }
    body.ena-enabled .gb_event_list .event > h4 > a:hover { color: #174576; text-decoration: underline; text-underline-offset: 3px; }
    body.ena-enabled .gb_event_list .date > p:first-child { box-sizing: border-box; margin: 0 4px 8px; padding: 8px 2px; border-radius: 10px; background: #edf2fc; font-size: 13px; font-weight: 600; text-align: center; }
    body.ena-enabled .gb_event_list .date img { border-radius: 10px; box-shadow: 0 2px 8px rgba(20,30,50,.08); }
    body.ena-enabled .gb_event_list .place { color: var(--ena-muted); }
    body.ena-enabled .gb_event_list .place > a[href*="/places/"] { color: #426c99; }
    body.ena-enabled .gb_event_list .date_header { border-radius: 10px; color: #566478; background: #eef2f7; }

    body.ena-enabled .gb_form { padding: 20px; margin-bottom: 20px; border: 1px solid #d3dfef; border-radius: 20px; background: linear-gradient(135deg, #f8fbff, #e9f0fb); box-shadow: 0 5px 18px rgba(48,69,106,.04); }
    body.ena-enabled .gb_form form { margin-bottom: 0; }
    body.ena-enabled .gb_form label { color: #555c68; font-size: 13px; }
    body.ena-enabled .gb_form input:not([type="submit"]):not([type="checkbox"]):not([type="radio"]),
    body.ena-enabled .gb_form select,
    body.ena-enabled .gb_form textarea {
      border: 1px solid #d9dde5;
      border-radius: 8px;
      color: #343a45;
      background: #fff;
      box-shadow: 0 1px 2px rgba(20,30,50,.025);
      font-family: inherit;
    }
    body.ena-enabled .gb_form input:focus-visible,
    body.ena-enabled .gb_form select:focus-visible,
    body.ena-enabled .gb_form textarea:focus-visible { outline: 2px solid #8fb6e3; outline-offset: 2px; }
    body.ena-enabled .gb_form .btn,
    body.ena-enabled #entry_area .btn,
    body.ena-enabled .gb_top_box .btn {
      border: 1px solid #c9d6e6;
      border-radius: 9px;
      color: #315c8b;
      background: #edf3fa;
      text-shadow: none;
      box-shadow: none;
      font-family: inherit;
      font-weight: 500;
    }
    body.ena-enabled .gb_form .btn-primary,
    body.ena-enabled #entry_area .btn-primary { border-color: #2866a6; color: #fff; background: #2866a6; }
    body.ena-enabled .gb_form .btn:active,
    body.ena-enabled #entry_area .btn:active { filter: brightness(.94); }

    body.ena-enabled .pagination ul { border-radius: 10px; box-shadow: none; }
    body.ena-enabled .pagination ul > li > a,
    body.ena-enabled .pagination ul > li > span { border-color: var(--ena-line); color: #536579; background: #fff; }
    body.ena-enabled .pagination ul > .active > a,
    body.ena-enabled .pagination ul > .active > span { color: #fff; background: #344d6d; }
    body.ena-enabled .pagination ul > .disabled > span,
    body.ena-enabled .pagination ul > .disabled > a { color: #a4a9b2; background: #f9fafc; }
    body.ena-enabled .pagination ul > li > a:hover { background: #edf2f8; }
    body.ena-enabled .pagination ul > li:first-child > a,
    body.ena-enabled .pagination ul > li:first-child > span { border-radius: 10px 0 0 10px; }
    body.ena-enabled .pagination ul > li:last-child > a,
    body.ena-enabled .pagination ul > li:last-child > span { border-radius: 0 10px 10px 0; }
    body.ena-enabled .nav-tabs { border-color: var(--ena-line); }
    body.ena-enabled .nav-tabs > li > a { border-radius: 9px 9px 0 0; color: #657287; }
    body.ena-enabled .nav-tabs > .active > a { border-color: var(--ena-line) var(--ena-line) #fff; color: #2d4d73; background: #fff; }

    body.ena-enabled .gb_users_side_profile { padding: 16px 0; margin-bottom: 12px; border: 1px solid #dce4f0; border-radius: 18px; background: #fff; box-shadow: 0 3px 12px rgba(48,69,106,.035); }
    body.ena-enabled .gb_users_side_profile img { border-radius: 12px; }
    body.ena-enabled .gb_users_side_profile .name1 { color: #282d36; font-weight: 600; letter-spacing: -.02em; }
    body.ena-enabled .gb_users_side_profile .name2,
    body.ena-enabled .gb_users_side_profile .text { color: var(--ena-muted); }
    body.ena-enabled .gb_score_table { border: 1px solid var(--ena-line); border-radius: 16px; background: #fff; box-shadow: 0 3px 12px rgba(48,69,106,.035); }
    body.ena-enabled .gb_score_table table { background: transparent; }
    body.ena-enabled .gb_score_table .number { color: #325d8b; font-variant-numeric: tabular-nums; }
    body.ena-enabled .gb_score_table .labels { color: #788392; font-size: 11px; }
    body.ena-enabled .gb_calendar_score { padding: 8px 0; border-top: 1px solid var(--ena-line); }
    body.ena-enabled .gb_calendar_score td { border-color: var(--ena-line); color: #737f8d; }
    body.ena-enabled .gb_calendar_score a { color: #37699d; }

    body.ena-enabled .gb_events_detail_title.bg { padding: 14px 0; border: 0; border-bottom: 1px solid var(--ena-line); background: transparent; }
    body.ena-enabled .gb_events_detail_title h2 { color: #262d39; font-size: 25px; font-weight: 600; line-height: 1.4; letter-spacing: -.025em; }
    body.ena-enabled .gb_events_info_table > table { border-color: var(--ena-line); border-radius: 12px; border-collapse: separate; }
    body.ena-enabled .gb_events_info_table > table > tbody > tr > td { padding: 12px; border-color: var(--ena-line); background: #fff; line-height: 1.7; }
    body.ena-enabled .gb_events_info_table > table > tbody > tr > td:first-child { color: #6c7685; background: #f7f8fb; font-size: 12px; }
    body.ena-enabled .gb_events_info_table img { border-radius: 10px; }
    body.ena-enabled .gb_history_editor_list { color: #7e8897; font-size: 12px; }
    body.ena-enabled .gb_users_icon img { border-radius: 8px; }

    body.ena-enabled > .footer { margin-top: 36px; padding-top: 24px; border-top: 1px solid #e0e3e9; color: #8a909b; background: #eceff4; }
    body.ena-enabled .footer h4 { color: #596473; font-size: 13px; font-weight: 600; }
    body.ena-enabled .footer a { color: #738095; }

    @media (prefers-reduced-transparency: reduce) {
      body.ena-enabled > .navbar .navbar-inner { background: #fff; backdrop-filter: none; -webkit-backdrop-filter: none; }
    }
    @media (prefers-contrast: more) {
      body.ena-enabled { --ena-line: #959ca8; --ena-muted: #505965; --ena-link: #164e8b; }
      body.ena-enabled .container .page { box-shadow: none; }
      body.ena-enabled .navbar .nav > li > a { color: #263b5d; }
    }
    @media print {
      body.ena-enabled { background: #fff; background-attachment: scroll; }
      body.ena-enabled .container .page { border: 0; box-shadow: none; }
    }
  `);
})();
