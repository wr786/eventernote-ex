// ==UserScript==
// @name         Eventernote Air
// @namespace    https://github.com/wr786/eventernote-power-list
// @version      0.1.2
// @description  A calm, Apple-inspired visual theme for Eventernote. Refined surfaces, typography, navigation and forms, designed to complement Eventernote EX.
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
      --ena-link: #255f9f;
      --ena-line: #e8e9ed;
      --ena-surface: #fff;
      --ena-canvas: #f4f5f8;
      color: var(--ena-ink);
      background: var(--ena-canvas);
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", "Hiragino Kaku Gothic ProN", Meiryo, sans-serif;
      font-optical-sizing: auto;
      -webkit-font-smoothing: antialiased;
    }

    body.ena-enabled > .navbar .navbar-inner {
      background: rgba(25, 29, 37, .96);
      background-image: none;
      border: 0;
      box-shadow: 0 1px 0 rgba(255,255,255,.08), 0 4px 20px rgba(20,25,40,.1);
      backdrop-filter: blur(20px) saturate(140%);
      -webkit-backdrop-filter: blur(20px) saturate(140%);
    }
    body.ena-enabled .navbar .topic { color: #b5bac6; font-size: 10px; letter-spacing: .02em; }
    body.ena-enabled .navbar .nav > li > a {
      margin: 0 2px;
      border-radius: 9px;
      color: #e1e4eb;
      text-shadow: none;
      font-size: 13px;
      font-weight: 500;
    }
    body.ena-enabled .navbar .nav > li > a:hover,
    body.ena-enabled .navbar .nav > li > a:focus-visible { color: #fff; background: rgba(255,255,255,.1); }
    body.ena-enabled .navbar .nav > .active > a { color: #fff; background: rgba(255,255,255,.12); box-shadow: none; }
    body.ena-enabled .navbar .search_box input[type="text"] {
      border: 1px solid rgba(255,255,255,.2);
      border-radius: 8px;
      color: #f5f7fb;
      background: rgba(255,255,255,.1);
      box-shadow: none;
      font-family: inherit;
    }
    body.ena-enabled .navbar .search_box input::placeholder { color: #c4c9d4; opacity: 1; }
    body.ena-enabled .navbar .search_box .btn { border: 0; border-radius: 8px; color: #182537; background: #e8edf5; text-shadow: none; box-shadow: none; }
    body.ena-enabled .navbar .dropdown-menu { padding: 6px; border: 1px solid var(--ena-line); border-radius: 12px; box-shadow: 0 12px 32px rgba(20,25,40,.15); }
    body.ena-enabled .navbar .dropdown-menu > li > a { border-radius: 6px; text-shadow: none; }

    body.ena-enabled .container .page {
      box-sizing: border-box;
      border: 1px solid var(--ena-line);
      border-radius: 20px;
      background: var(--ena-surface);
      box-shadow: 0 4px 22px rgba(30,40,60,.035);
    }
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
      border-bottom-color: var(--ena-line);
      border-radius: 12px;
      background-color: #fff;
    }
    body.ena-enabled .gb_event_list > ul > li:hover,
    body.ena-enabled .gb_event_list > li:hover { background-color: #fafbfe; }
    body.ena-enabled .gb_event_list .event > h4 > a { color: var(--ena-link); font-weight: 600; text-decoration: none; }
    body.ena-enabled .gb_event_list .event > h4 > a:hover { color: #174576; text-decoration: underline; text-underline-offset: 3px; }
    body.ena-enabled .gb_event_list .date img { border-radius: 10px; box-shadow: 0 2px 8px rgba(20,30,50,.08); }
    body.ena-enabled .gb_event_list .place { color: var(--ena-muted); }
    body.ena-enabled .gb_event_list .place > a[href*="/places/"] { color: #426c99; }
    body.ena-enabled .gb_event_list .date_header { border-radius: 10px; color: #566478; background: #eef2f7; }

    body.ena-enabled .gb_form { padding: 16px; margin-bottom: 18px; border: 1px solid var(--ena-line); border-radius: 14px; background: #f8f9fc; }
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

    body.ena-enabled .gb_users_side_profile { padding: 12px 0 16px; border: 0; border-bottom: 1px solid var(--ena-line); background: transparent; }
    body.ena-enabled .gb_users_side_profile img { border-radius: 12px; }
    body.ena-enabled .gb_users_side_profile .name1 { color: #282d36; font-weight: 600; letter-spacing: -.02em; }
    body.ena-enabled .gb_users_side_profile .name2,
    body.ena-enabled .gb_users_side_profile .text { color: var(--ena-muted); }
    body.ena-enabled .gb_score_table { border: 1px solid var(--ena-line); border-radius: 14px; background: #f8f9fc; box-shadow: none; }
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
      body.ena-enabled > .navbar .navbar-inner { background: #191d25; backdrop-filter: none; -webkit-backdrop-filter: none; }
    }
    @media (prefers-contrast: more) {
      body.ena-enabled { --ena-line: #959ca8; --ena-muted: #505965; --ena-link: #164e8b; }
      body.ena-enabled .container .page { box-shadow: none; }
      body.ena-enabled .navbar .nav > li > a { color: #fff; }
    }
    @media print {
      body.ena-enabled { background: #fff; }
      body.ena-enabled .container .page { border: 0; box-shadow: none; }
    }
  `);
})();
