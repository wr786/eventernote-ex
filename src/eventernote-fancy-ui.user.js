// ==UserScript==
// @name         Eventernote Fancy UI
// @namespace    https://github.com/wr786/eventernote-power-list
// @version      0.2.0
// @description  A vivid, modern visual theme for Eventernote that preserves its original layout.
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
      --enf-bg: #edf1f4;
      --enf-surface: #ffffff;
      --enf-surface-soft: #f6f8fa;
      --enf-text: #20262d;
      --enf-muted: #69747f;
      --enf-border: #d9e0e6;
      --enf-border-strong: #c8d1d9;
      --enf-link: #176fa5;
      --enf-link-hover: #c9324b;
      --enf-accent: #db3d56;
      --enf-accent-dark: #b82c43;
      --enf-teal: #168b85;
      --enf-gold: #bd861f;
      --enf-nav: #1d232a;
      --enf-nav-soft: #2b333c;
      --enf-shadow: 0 2px 8px rgba(27, 35, 43, .08);
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
      box-sizing: border-box;
      padding-bottom: 14px;
      border: 1px solid var(--enf-border);
      border-radius: 6px;
      background: var(--enf-surface);
      box-shadow: inset 0 3px 0 var(--enf-accent), var(--enf-shadow);
    }

    .container > .row > .span4.page {
      box-shadow: inset 0 3px 0 var(--enf-teal), var(--enf-shadow);
    }

    .container > .row > .span12.page {
      box-shadow: inset 0 3px 0 var(--enf-gold), var(--enf-shadow);
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

    .span4.page h2.gb_subtitle::after,
    .span4.page .gb_subtitle::after {
      background: var(--enf-teal);
    }

    .gb_form {
      margin: 0 10px 14px;
      padding: 14px 14px 8px;
      border: 1px solid var(--enf-border);
      border-left: 4px solid var(--enf-teal);
      border-radius: 5px;
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
      box-shadow: 0 3px 8px rgba(121, 31, 43, .22);
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
      border: 0;
      border-bottom: 1px solid var(--enf-border);
      border-left: 4px solid #e1e6ea;
      border-radius: 4px;
      background: var(--enf-surface);
      box-shadow: none;
      transition: border-color .15s ease, background-color .15s ease, box-shadow .15s ease;
    }

    .gb_event_list > ul > li:hover,
    .gb_event_list > li:hover {
      border-bottom-color: #efc3ca;
      border-left-color: var(--enf-accent);
      background: #fff8f9;
      box-shadow: 0 4px 14px rgba(91, 37, 48, .08);
    }

    .gb_event_list .date {
      color: var(--enf-muted);
      font-family: inherit;
      font-variant-numeric: tabular-nums;
    }

    .gb_event_list .date > p:first-child {
      color: #39434d;
      font-weight: 700;
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
      border: 0;
      border-radius: 0;
      background: transparent;
      box-shadow: none;
      font-weight: 700;
    }

    .gb_event_list .note_count p:not(.enpl-note-count-highlight) {
      color: var(--enf-accent-dark);
    }

    .gb_event_list .date_header {
      border-left: 5px solid var(--enf-accent);
      border-radius: 3px;
      color: #fff;
      background: #303943;
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

    .gb_users_side_profile {
      box-sizing: border-box;
      width: 350px;
      padding: 14px;
      border: 0;
      border-top: 4px solid var(--enf-teal);
      border-radius: 6px;
      background: #f6fbfb;
      box-shadow: 0 5px 16px rgba(24, 74, 72, .1);
    }

    .gb_users_side_profile .thumb {
      width: 66px;
      height: 62px;
    }

    .gb_users_side_profile .thumb img {
      border: 3px solid #fff;
      border-radius: 7px;
      box-shadow: 0 2px 8px rgba(27, 35, 43, .16);
    }

    .gb_users_side_profile .desc {
      box-sizing: border-box;
      width: calc(100% - 66px);
      padding-top: 2px;
    }

    .gb_users_side_profile .desc .name1 {
      padding: 0;
      color: var(--enf-text);
      font-size: 15px;
      line-height: 1.35;
    }

    .gb_users_side_profile .desc .name2 {
      padding: 0;
      color: var(--enf-teal);
      line-height: 1.45;
    }

    .gb_users_side_profile .text {
      box-sizing: border-box;
      width: 100%;
      margin-top: 10px;
      padding: 10px 11px;
      clear: both;
      float: none;
      border: 1px solid #d7e7e5;
      border-radius: 4px;
      color: #56636d;
      background: #fff;
      line-height: 1.55;
    }

    .gb_score_table,
    .gb_score_table4 {
      box-sizing: border-box;
      border: 1px solid var(--enf-border);
      border-radius: 6px;
      background: #fff;
      background-image: none;
      box-shadow: var(--enf-shadow);
    }

    .gb_score_table table tr td + td,
    .gb_score_table4 table tr td + td {
      border-left: 1px solid var(--enf-border);
    }

    .gb_score_table table .number,
    .gb_score_table4 table .number {
      font-family: inherit;
      font-weight: 700;
      font-variant-numeric: tabular-nums;
    }

    .gb_score_table table tr:first-child td:nth-child(1) a,
    .gb_score_table4 table tr:first-child td:nth-child(1) a {
      color: var(--enf-link);
    }

    .gb_score_table table tr:first-child td:nth-child(2) a,
    .gb_score_table4 table tr:first-child td:nth-child(2) a {
      color: var(--enf-accent);
    }

    .gb_score_table table tr:first-child td:nth-child(3) a,
    .gb_score_table4 table tr:first-child td:nth-child(3) a {
      color: var(--enf-teal);
    }

    .gb_score_table table .labels,
    .gb_score_table4 table .labels {
      color: var(--enf-muted);
      text-decoration: none;
    }

    .gb_badges .badges img {
      border: 2px solid #fff;
      border-radius: 6px;
      box-shadow: 0 2px 7px rgba(27, 35, 43, .14);
      transition: transform .15s ease, box-shadow .15s ease;
    }

    .gb_badges .badges img:hover {
      box-shadow: 0 5px 12px rgba(27, 35, 43, .18);
      transform: translateY(-2px);
    }

    .span4.page .gb_actors_list {
      margin: 0 10px 16px;
      padding: 8px 10px;
      border-left: 4px solid var(--enf-gold);
      border-radius: 4px;
      background: #fffaf0;
    }

    .gb_calendar_score {
      box-sizing: border-box;
      width: calc(100% - 20px);
      margin: 0 10px 14px;
      padding: 8px;
      border: 1px solid var(--enf-border);
      border-radius: 5px;
      background: var(--enf-surface-soft);
    }

    .gb_calendar_score table {
      border-color: var(--enf-border);
      background: #fff;
    }

    .gb_calendar_score table tr td {
      border-color: var(--enf-border);
      font-variant-numeric: tabular-nums;
    }

    .gb_calendar_score table tr:nth-child(3n+1) td {
      border-color: #34404a;
      color: #fff;
      background: #303943;
    }

    .gb_calendar_score table tr:nth-child(3n+1) a {
      color: #fff;
      font-weight: 700;
    }

    .gb_calendar_score table tr:nth-child(3n+2) td {
      color: var(--enf-muted);
      background: #edf2f4;
    }

    .gb_calendar_score table tr:nth-child(3n) a {
      color: var(--enf-accent-dark);
      font-weight: 700;
    }

    .gb_events_side_month {
      border-color: var(--enf-border);
      border-left: 4px solid var(--enf-teal);
      border-radius: 5px;
      background: var(--enf-surface-soft);
      box-shadow: var(--enf-shadow);
    }

    .alert {
      border-radius: 5px;
      text-shadow: none;
      box-shadow: none;
    }

    .footer {
      margin-top: 18px;
      padding-top: 18px;
      border-top: 4px solid var(--enf-teal);
      color: #98a4af;
      background: var(--enf-nav);
    }

    .footer h4 {
      color: #eef2f5;
    }

    .footer a {
      color: #b5bec7;
    }

    .footer a:hover {
      color: var(--enf-accent-dark);
    }

    address {
      color: #89949f;
    }
  `);
})();
