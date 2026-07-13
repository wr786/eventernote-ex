// ==UserScript==
// @name         Eventernote Fancy UI
// @namespace    https://github.com/wr786/eventernote-power-list
// @version      0.1.0
// @description  A polished, modern visual theme for Eventernote.
// @author       wr786
// @match        https://www.eventernote.com/*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=eventernote.com
// @run-at       document-start
// @grant        GM_addStyle
// @license      MIT
// ==/UserScript==

(function () {
  "use strict";

  GM_addStyle(`
    :root {
      --enf-bg: #f3f5f7;
      --enf-surface: #ffffff;
      --enf-surface-soft: #f8fafb;
      --enf-text: #252a31;
      --enf-muted: #6f7782;
      --enf-border: #dfe4e9;
      --enf-border-strong: #cfd6dd;
      --enf-link: #1769aa;
      --enf-link-hover: #c63f4f;
      --enf-accent: #d94b5b;
      --enf-accent-dark: #b93647;
      --enf-gold: #c18a24;
      --enf-nav: #24282e;
      --enf-nav-soft: #30353c;
      --enf-shadow: 0 1px 2px rgba(25, 31, 38, .08);
    }

    html {
      background: var(--enf-bg);
    }

    body {
      color: var(--enf-text);
      background: var(--enf-bg);
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", "Hiragino Kaku Gothic ProN", Meiryo, sans-serif;
      letter-spacing: 0;
    }

    ::selection {
      color: #fff;
      background: var(--enf-accent);
    }

    a {
      color: var(--enf-link);
      transition: color .15s ease;
    }

    a:hover,
    a:focus {
      color: var(--enf-link-hover);
    }

    h1,
    h2,
    h3,
    h4,
    h5,
    h6 {
      color: var(--enf-text);
      font-family: inherit;
      letter-spacing: 0;
    }

    .navbar {
      margin: 0;
      border-bottom: 3px solid var(--enf-accent);
      box-shadow: 0 2px 8px rgba(16, 20, 24, .18);
    }

    .navbar-inverse .navbar-inner {
      min-height: 49px;
      border: 0;
      background: var(--enf-nav);
      box-shadow: inset 0 -1px 0 rgba(255, 255, 255, .05);
    }

    .navbar .container {
      min-height: 49px;
    }

    .navbar .logo {
      margin-top: 7px;
      padding-right: 14px;
    }

    .navbar .logo img {
      display: block;
    }

    .navbar-inverse .nav > li > a {
      color: #d9dee4;
      text-shadow: none;
      transition: color .15s ease, background-color .15s ease;
    }

    .navbar-inverse .nav > li > a:hover,
    .navbar-inverse .nav > li > a:focus {
      color: #fff;
      background: var(--enf-nav-soft);
    }

    .navbar .topic,
    .navbar .topic h1,
    .navbar .topic p {
      color: #98a1ab;
    }

    .navbar .search_box .keyword {
      border-color: #4a515a;
      color: #eef1f4;
      background: #343941;
      box-shadow: inset 0 1px 2px rgba(0, 0, 0, .2);
    }

    .navbar .search_box .keyword::placeholder {
      color: #aeb6bf;
    }

    .navbar .search_box .keyword:focus {
      border-color: #e2707d;
      box-shadow: 0 0 0 2px rgba(217, 75, 91, .22);
    }

    .breadcrumb {
      padding: 8px 0;
      color: var(--enf-muted);
      background: transparent;
    }

    .breadcrumb span.divider {
      color: #a8afb7;
    }

    .container .page {
      padding-bottom: 14px;
      border: 1px solid var(--enf-border);
      border-radius: 6px;
      background: var(--enf-surface);
      box-shadow: var(--enf-shadow);
    }

    .container .page > h2,
    .page-header h2,
    h2.gb_subtitle,
    .gb_subtitle {
      margin: 0 10px 10px;
      padding: 12px 0 9px;
      border-bottom: 2px solid var(--enf-border);
      color: var(--enf-text);
      font-weight: 600;
      text-indent: 0;
    }

    .container .page > h2::after,
    h2.gb_subtitle::after,
    .gb_subtitle::after {
      display: block;
      width: 42px;
      height: 2px;
      margin-top: 9px;
      margin-bottom: -11px;
      background: var(--enf-accent);
      content: "";
    }

    .gb_form {
      margin: 0 10px 14px;
      padding: 14px 12px 8px;
      border-top: 1px solid var(--enf-border);
      border-bottom: 1px solid var(--enf-border);
      background: var(--enf-surface-soft);
    }

    input,
    select,
    textarea,
    .uneditable-input {
      border-color: var(--enf-border-strong);
      border-radius: 4px;
      color: var(--enf-text);
      background: #fff;
      box-shadow: inset 0 1px 2px rgba(27, 34, 41, .05);
    }

    input:focus,
    select:focus,
    textarea:focus,
    .uneditable-input:focus {
      border-color: var(--enf-accent);
      outline: 0;
      box-shadow: 0 0 0 2px rgba(217, 75, 91, .15);
    }

    .btn {
      border-color: var(--enf-border-strong);
      border-radius: 4px;
      color: #3e4650;
      background: #fff;
      background-image: none;
      text-shadow: none;
      box-shadow: 0 1px 1px rgba(25, 31, 38, .06);
      transition: border-color .15s ease, color .15s ease, background-color .15s ease;
    }

    .btn:hover,
    .btn:focus {
      border-color: #adb6bf;
      color: var(--enf-text);
      background: #f3f5f7;
    }

    .btn-primary,
    .navbar .login.btn-primary {
      border-color: var(--enf-accent-dark);
      color: #fff;
      background: var(--enf-accent);
      box-shadow: 0 1px 2px rgba(121, 31, 43, .2);
    }

    .btn-primary:hover,
    .btn-primary:focus,
    .navbar .login.btn-primary:hover,
    .navbar .login.btn-primary:focus {
      border-color: #982a39;
      color: #fff;
      background: var(--enf-accent-dark);
    }

    .gb_event_list {
      margin: 0 10px;
    }

    .gb_event_list > ul > li,
    .gb_event_list > li {
      box-sizing: border-box;
      margin-bottom: 8px;
      padding: 8px 0;
      border: 1px solid var(--enf-border);
      border-radius: 6px;
      background: var(--enf-surface);
      box-shadow: var(--enf-shadow);
      transition: border-color .15s ease, box-shadow .15s ease, transform .15s ease;
    }

    .gb_event_list > ul > li:hover,
    .gb_event_list > li:hover {
      border-color: #c8d0d8;
      box-shadow: 0 4px 12px rgba(25, 31, 38, .09);
      transform: translateY(-1px);
    }

    .gb_event_list .date {
      color: var(--enf-muted);
      font-family: inherit;
      font-variant-numeric: tabular-nums;
    }

    .gb_event_list .date img {
      border: 1px solid var(--enf-border);
      border-radius: 5px;
      box-shadow: 0 1px 3px rgba(25, 31, 38, .12);
    }

    .gb_event_list .day0 {
      color: #cf3f50;
      font-weight: 600;
    }

    .gb_event_list .day6 {
      color: #2877b8;
      font-weight: 600;
    }

    .gb_event_list .event h4 {
      line-height: 1.55;
    }

    .gb_event_list .event h4 a {
      color: #27313b;
      font-weight: 650;
    }

    .gb_event_list .event h4 a:hover {
      color: var(--enf-accent-dark);
      text-decoration: none;
    }

    .gb_event_list .place {
      color: var(--enf-muted);
    }

    .gb_event_list .actor ul li {
      margin-right: 5px;
    }

    .gb_event_list .note_count {
      font-family: inherit;
      font-variant-numeric: tabular-nums;
    }

    .gb_event_list .note_count p {
      border: 1px solid var(--enf-border);
      border-radius: 6px;
      color: #4d5661;
      background: var(--enf-surface-soft);
      box-shadow: none;
    }

    .gb_event_list .date_header {
      border-radius: 4px;
      color: #fff;
      background: var(--enf-nav-soft);
    }

    .pagination ul {
      border-radius: 4px;
      box-shadow: none;
    }

    .pagination ul > li > a,
    .pagination ul > li > span {
      border-color: var(--enf-border);
      color: var(--enf-link);
      background: #fff;
    }

    .pagination ul > li > a:hover,
    .pagination ul > .active > a,
    .pagination ul > .active > span {
      color: #fff;
      background: var(--enf-accent);
    }

    .nav-tabs {
      border-bottom-color: var(--enf-border);
    }

    .nav-tabs > li > a {
      border-radius: 4px 4px 0 0;
      color: var(--enf-muted);
    }

    .nav-tabs > .active > a,
    .nav-tabs > .active > a:hover {
      border-color: var(--enf-border) var(--enf-border) #fff;
      color: var(--enf-accent-dark);
      font-weight: 600;
    }

    table,
    .table {
      color: var(--enf-text);
    }

    .table th,
    .table td {
      border-top-color: var(--enf-border);
    }

    .table-striped tbody > tr:nth-child(odd) > td,
    .table-striped tbody > tr:nth-child(odd) > th {
      background: var(--enf-surface-soft);
    }

    .gb_users_side_profile,
    .gb_events_side_month {
      border-color: var(--enf-border);
      border-radius: 5px;
      background: var(--enf-surface-soft);
      box-shadow: var(--enf-shadow);
    }

    .gb_users_side_profile .thumb img {
      border: 1px solid var(--enf-border);
      border-radius: 5px;
    }

    .alert {
      border-radius: 5px;
      text-shadow: none;
      box-shadow: none;
    }

    .footer {
      margin-top: 18px;
      padding-top: 18px;
      border-top: 1px solid #d8dde2;
      color: #7a838d;
      background: #e8ebee;
    }

    .footer a {
      color: #65707b;
    }

    .footer a:hover {
      color: var(--enf-accent-dark);
    }

    address {
      color: #7f8790;
    }
  `);
})();
