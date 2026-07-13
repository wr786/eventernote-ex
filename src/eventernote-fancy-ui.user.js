// ==UserScript==
// @name         Eventernote Fancy UI
// @namespace    https://github.com/wr786/eventernote-power-list
// @version      0.3.0
// @description  A bold, minimal visual redesign for Eventernote that preserves its original layout.
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
      --enf-bg: #ffffff;
      --enf-soft: #f4f5f7;
      --enf-soft-hover: #f8f8f9;
      --enf-text: #14171b;
      --enf-muted: #737981;
      --enf-line: #dfe2e6;
      --enf-line-dark: #b9bec5;
      --enf-accent: #ef2f57;
      --enf-accent-dark: #c91f43;
      --enf-link: #176b9d;
      --enf-dark: #15191e;
    }

    html,
    body {
      color: var(--enf-text);
      background: var(--enf-bg);
    }

    body {
      font-family: system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", "Hiragino Kaku Gothic ProN", Meiryo, sans-serif;
      letter-spacing: 0;
      -webkit-font-smoothing: antialiased;
      text-rendering: optimizeLegibility;
    }

    ::selection {
      color: #fff;
      background: var(--enf-accent);
    }

    a {
      color: var(--enf-link);
      transition: color .12s ease, opacity .12s ease;
    }

    a:hover,
    a:focus {
      color: var(--enf-accent-dark);
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
      border: 0;
      box-shadow: inset 0 -3px 0 var(--enf-accent);
    }

    .navbar-inverse .navbar-inner {
      min-height: 60px;
      border: 0;
      background: var(--enf-dark);
      box-shadow: none;
    }

    .navbar .container {
      min-height: 60px;
    }

    .navbar .logo {
      margin-top: 12px;
      padding-right: 20px;
    }

    .navbar .logo img {
      display: block;
    }

    .navbar-inverse .nav {
      margin-top: 10px !important;
    }

    .navbar-inverse .nav > li > a {
      padding: 11px 13px 10px;
      color: #cbd0d6 !important;
      background: transparent;
      font-size: 13px;
      font-weight: 650;
      text-shadow: none;
      transition: color .12s ease, background-color .12s ease;
    }

    .navbar-inverse .nav > li > a:hover,
    .navbar-inverse .nav > li > a:focus {
      color: #fff !important;
      background: #252b32;
    }

    .navbar .topic,
    .navbar .topic h1,
    .navbar .topic p {
      color: #7f8790;
    }

    .navbar .search_box .keyword {
      height: 32px;
      box-sizing: border-box;
      border: 1px solid #454c54;
      border-radius: 3px;
      color: #fff;
      background: #252b32;
      box-shadow: none;
    }

    .navbar .search_box .keyword::placeholder {
      color: #9299a1;
    }

    .navbar .search_box .keyword:focus {
      border-color: var(--enf-accent);
      outline: 0;
      box-shadow: 0 0 0 2px rgba(239, 47, 87, .22);
    }

    .navbar .login.btn-primary {
      margin-top: 13px;
      border-color: var(--enf-accent);
      color: #fff !important;
      background: var(--enf-accent);
      box-shadow: none;
    }

    .navbar a.login[href="/login"] {
      border-color: #525a63;
      color: #dfe3e7 !important;
      background: transparent;
    }

    .navbar a.login[href="/login"]:hover,
    .navbar a.login[href="/login"]:focus {
      border-color: #fff;
      color: #fff !important;
      background: transparent;
    }

    .breadcrumb {
      margin: 0 0 18px;
      padding: 13px 0 11px;
      border-bottom: 1px solid var(--enf-line);
      border-radius: 0;
      color: var(--enf-muted);
      background: transparent;
      font-size: 11px;
    }

    .breadcrumb span.divider {
      color: var(--enf-line-dark);
    }

    .container .page {
      box-sizing: border-box;
      padding-bottom: 32px;
      border: 0;
      border-radius: 0;
      background: transparent;
      box-shadow: none;
    }

    .container > .row > .span4.page {
      padding-right: 9px;
      padding-left: 20px;
      border-left: 1px solid var(--enf-line);
      background: #fafafa;
    }

    .container .page > h2,
    .page-header h2,
    h2.gb_subtitle,
    .gb_subtitle {
      margin: 0 0 20px;
      padding: 0 0 14px;
      border-bottom: 1px solid var(--enf-line);
      color: var(--enf-text);
      font-size: 20px;
      font-weight: 750;
      line-height: 1.4;
      text-indent: 0;
    }

    .container .page > h2::before,
    .page-header h2::before,
    h2.gb_subtitle::before,
    .gb_subtitle::before {
      display: inline-block;
      width: 8px;
      height: 8px;
      margin-right: 10px;
      background: var(--enf-accent);
      content: "";
      vertical-align: 2px;
    }

    .gb_form {
      margin: 0 0 26px;
      padding: 24px 24px 16px;
      border: 0;
      border-radius: 4px;
      background: var(--enf-soft);
    }

    input,
    select,
    textarea,
    .uneditable-input {
      border-color: var(--enf-line-dark);
      border-radius: 3px;
      color: var(--enf-text);
      background: #fff;
      box-shadow: none;
    }

    input:focus,
    select:focus,
    textarea:focus,
    .uneditable-input:focus {
      border-color: var(--enf-accent);
      outline: 0;
      box-shadow: 0 0 0 2px rgba(239, 47, 87, .16);
    }

    .btn {
      border-color: var(--enf-line-dark);
      border-radius: 3px;
      color: var(--enf-text);
      background: #fff;
      background-image: none;
      font-weight: 650;
      text-shadow: none;
      box-shadow: none;
      transition: border-color .12s ease, color .12s ease, background-color .12s ease;
    }

    .btn:hover,
    .btn:focus {
      border-color: var(--enf-dark);
      color: #fff;
      background: var(--enf-dark);
    }

    .btn-primary {
      border-color: var(--enf-accent);
      color: #fff;
      background: var(--enf-accent);
    }

    .btn-primary:hover,
    .btn-primary:focus {
      border-color: var(--enf-accent-dark);
      color: #fff;
      background: var(--enf-accent-dark);
    }

    .gb_form .btn {
      border-color: var(--enf-dark);
      color: #fff;
      background: var(--enf-dark);
    }

    .gb_form .btn:hover,
    .gb_form .btn:focus {
      border-color: var(--enf-accent);
      color: #fff;
      background: var(--enf-accent);
    }

    .gb_event_list {
      margin: 0;
    }

    .gb_event_list > ul > li,
    .gb_event_list > li {
      box-sizing: border-box;
      margin: 0;
      padding: 18px 10px;
      border: 0;
      border-bottom: 1px solid var(--enf-line);
      border-radius: 0;
      background: transparent;
      box-shadow: none;
      transition: background-color .12s ease;
    }

    .gb_event_list > ul > li:first-child,
    .gb_event_list > li:first-child {
      border-top: 1px solid var(--enf-line);
    }

    .gb_event_list > ul > li:hover,
    .gb_event_list > li:hover {
      background: var(--enf-soft-hover);
    }

    .gb_event_list .date {
      color: var(--enf-muted);
      font-family: inherit;
      font-size: 13px;
      font-variant-numeric: tabular-nums;
    }

    .gb_event_list .date > p:first-child {
      margin-bottom: 8px;
      color: #383e45;
      font-size: 14px;
      font-weight: 750;
    }

    .gb_event_list .date img {
      border: 0;
      border-radius: 3px;
      box-shadow: 0 2px 8px rgba(20, 23, 27, .12);
    }

    .gb_event_list .day0 {
      color: var(--enf-accent);
    }

    .gb_event_list .day6 {
      color: #2675a8;
    }

    .gb_event_list .event h4 {
      margin-bottom: 5px;
      font-size: 18px;
      line-height: 1.4;
    }

    .gb_event_list .event h4 a {
      color: var(--enf-text) !important;
      font-weight: 750;
      text-decoration: none;
    }

    .gb_event_list .event h4 a:hover,
    .gb_event_list .event h4 a:focus {
      color: var(--enf-accent-dark) !important;
    }

    .gb_event_list .place {
      color: var(--enf-muted);
      font-size: 12px;
    }

    .gb_event_list .actor ul li {
      margin-right: 7px;
      color: var(--enf-muted);
    }

    .gb_event_list .note_count {
      font-family: inherit;
      font-variant-numeric: tabular-nums;
    }

    .gb_event_list .note_count p {
      width: 80px;
      height: auto;
      margin: 28px 10px 0 auto;
      padding: 0;
      border: 0;
      border-radius: 0;
      background: transparent;
      font-size: 32px;
      font-weight: 800;
      line-height: 1;
      text-align: right;
      box-shadow: none;
    }

    .gb_event_list .note_count p:not(.enpl-note-count-highlight) {
      color: var(--enf-accent);
    }

    .gb_event_list .date_header {
      height: 38px;
      padding-left: 14px;
      border: 0;
      border-radius: 0;
      color: #fff;
      background: var(--enf-dark);
      font-family: inherit;
      font-size: 15px;
      font-weight: 700;
      line-height: 38px;
    }

    .pagination ul {
      border-radius: 0;
      box-shadow: none;
    }

    .pagination ul > li > a,
    .pagination ul > li > span {
      min-width: 34px;
      box-sizing: border-box;
      border-color: var(--enf-line);
      color: var(--enf-text);
      background: #fff;
      text-align: center;
    }

    .pagination ul > li > a:hover,
    .pagination ul > .active > a,
    .pagination ul > .active > span {
      border-color: var(--enf-dark);
      color: #fff;
      background: var(--enf-dark);
    }

    .nav-tabs {
      border-bottom: 1px solid var(--enf-line);
    }

    .nav-tabs > li > a {
      margin-right: 20px;
      padding-right: 0;
      padding-left: 0;
      border: 0;
      border-bottom: 3px solid transparent;
      border-radius: 0;
      color: var(--enf-muted);
      background: transparent;
    }

    .nav-tabs > li > a:hover,
    .nav-tabs > .active > a,
    .nav-tabs > .active > a:hover {
      border: 0;
      border-bottom: 3px solid var(--enf-accent);
      color: var(--enf-text);
      background: transparent;
      font-weight: 700;
    }

    table,
    .table {
      color: var(--enf-text);
    }

    .table th {
      color: var(--enf-muted);
      background: var(--enf-soft);
      font-size: 11px;
      font-weight: 700;
    }

    .table th,
    .table td {
      border-top-color: var(--enf-line);
    }

    .table-striped tbody > tr:nth-child(odd) > td,
    .table-striped tbody > tr:nth-child(odd) > th {
      background: #fafafa;
    }

    .gb_users_side_profile {
      box-sizing: border-box;
      width: 350px;
      margin: 0 auto 22px;
      padding: 0 0 20px;
      border: 0;
      border-bottom: 1px solid var(--enf-line);
      border-radius: 0;
      background: transparent;
      box-shadow: none;
    }

    .gb_users_side_profile .thumb {
      width: 72px;
      height: 62px;
    }

    .gb_users_side_profile .thumb img {
      width: 52px;
      height: 52px;
      border: 0;
      border-radius: 50%;
      box-shadow: none;
    }

    .gb_users_side_profile .desc {
      box-sizing: border-box;
      width: calc(100% - 72px);
      padding-top: 2px;
    }

    .gb_users_side_profile .desc .name1 {
      padding: 0;
      color: var(--enf-text);
      font-size: 19px;
      font-weight: 800;
      line-height: 1.25;
    }

    .gb_users_side_profile .desc .name2 {
      padding: 4px 0 0;
      color: var(--enf-muted);
      font-size: 11px;
      line-height: 1.45;
    }

    .gb_users_side_profile .text {
      box-sizing: border-box;
      width: 100%;
      margin-top: 14px;
      padding: 16px 0 0;
      clear: both;
      float: none;
      border: 0;
      border-top: 1px solid var(--enf-line);
      border-radius: 0;
      color: #545b63;
      background: transparent;
      font-size: 12px;
      line-height: 1.65;
    }

    .gb_score_table,
    .gb_score_table4 {
      box-sizing: border-box;
      width: 350px;
      margin: 22px auto;
      border: 0;
      border-top: 1px solid var(--enf-line);
      border-bottom: 1px solid var(--enf-line);
      border-radius: 0;
      background: transparent;
      background-image: none;
      box-shadow: none;
    }

    .gb_score_table table tr td + td,
    .gb_score_table4 table tr td + td {
      border-left: 1px solid var(--enf-line);
    }

    .gb_score_table table .number,
    .gb_score_table4 table .number {
      height: 54px;
      padding-top: 8px;
      font-family: inherit;
      font-size: 34px;
      font-weight: 800;
      font-variant-numeric: tabular-nums;
      line-height: 54px;
    }

    .gb_score_table table .number a,
    .gb_score_table4 table .number a {
      color: var(--enf-text) !important;
      font-family: inherit;
      line-height: 54px;
    }

    .gb_score_table table tr:first-child td:last-child a,
    .gb_score_table4 table tr:first-child td:last-child a {
      color: var(--enf-accent) !important;
    }

    .gb_score_table table .labels,
    .gb_score_table4 table .labels {
      color: var(--enf-muted);
      font-size: 10px;
      text-decoration: none;
    }

    .gb_badges .badges img {
      border: 0;
      border-radius: 4px;
      opacity: .76;
      box-shadow: none;
      transition: opacity .12s ease, transform .12s ease;
    }

    .gb_badges .badges img:hover {
      opacity: 1;
      transform: translateY(-2px);
    }

    .span4.page .gb_actors_list {
      margin: 0 0 26px;
      padding: 0 0 18px;
      border: 0;
      border-bottom: 1px solid var(--enf-line);
      border-radius: 0;
      background: transparent;
    }

    .gb_calendar_score {
      box-sizing: border-box;
      width: 350px;
      margin: 0 auto 18px;
      padding: 0;
      border: 0;
      border-radius: 0;
      background: transparent;
    }

    .gb_calendar_score table {
      border: 1px solid var(--enf-line);
      background: #fff;
    }

    .gb_calendar_score table tr td {
      padding: 4px 2px;
      border-color: var(--enf-line);
      font-size: 10px;
      font-variant-numeric: tabular-nums;
    }

    .gb_calendar_score table tr:nth-child(3n+1) td {
      border-color: var(--enf-dark);
      color: #fff;
      background: var(--enf-dark);
      font-weight: 700;
    }

    .gb_calendar_score table tr:nth-child(3n+1) a {
      color: #fff;
      font-weight: 700;
    }

    .gb_calendar_score table tr:nth-child(3n+2) td {
      color: var(--enf-muted);
      background: var(--enf-soft);
    }

    .gb_calendar_score table tr:nth-child(3n) td:has(a) {
      background: #fff0f3;
    }

    .gb_calendar_score table tr:nth-child(3n) a {
      color: var(--enf-accent-dark);
      font-weight: 800;
    }

    .gb_events_side_month {
      margin: 18px 0;
      border: 0;
      border-top: 3px solid var(--enf-dark);
      border-radius: 0;
      background: transparent;
      box-shadow: none;
    }

    .alert {
      border-radius: 3px;
      text-shadow: none;
      box-shadow: none;
    }

    .footer {
      margin-top: 34px;
      padding: 34px 0 24px;
      border: 0;
      color: #8f969e;
      background: var(--enf-dark);
    }

    .footer h4 {
      margin-bottom: 14px;
      color: #fff;
      font-size: 12px;
      font-weight: 750;
    }

    .footer a {
      color: #aeb4bb !important;
    }

    .footer a:hover,
    .footer a:focus {
      color: #fff !important;
    }

    address {
      color: #727a83;
    }
  `);
})();
