// ==UserScript==
// @name         Eventernote Fancy UI
// @namespace    https://github.com/wr786/eventernote-power-list
// @version      0.4.0
// @description  A Material 3 Expressive-inspired theme for Eventernote that preserves its original layout.
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
      --enf-bg: #fff8fb;
      --enf-surface: #ffffff;
      --enf-surface-low: #fbf3f7;
      --enf-surface-container: #f5eaf0;
      --enf-surface-high: #eedde6;
      --enf-text: #24191f;
      --enf-muted: #75636b;
      --enf-outline: #8b707a;
      --enf-outline-variant: #ddc1ca;
      --enf-primary: #a7275b;
      --enf-primary-dark: #7c1740;
      --enf-primary-container: #ffd9e6;
      --enf-on-primary-container: #3d001d;
      --enf-secondary: #006b60;
      --enf-secondary-container: #9cf2df;
      --enf-on-secondary-container: #00201b;
      --enf-tertiary: #7b5800;
      --enf-tertiary-container: #ffdea6;
      --enf-on-tertiary-container: #271900;
      --enf-dark: #2b1722;
      --enf-motion: cubic-bezier(.2, .8, .2, 1);
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
      background: var(--enf-primary);
    }

    a {
      color: var(--enf-primary-dark);
      transition: color .18s var(--enf-motion), opacity .18s var(--enf-motion);
    }

    a:hover,
    a:focus {
      color: var(--enf-secondary);
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
      box-shadow: 0 5px 20px rgba(61, 0, 29, .18);
    }

    .navbar-inverse .navbar-inner {
      min-height: 68px;
      border: 0;
      background: var(--enf-dark);
      box-shadow: none;
    }

    .navbar .container {
      min-height: 68px;
    }

    .navbar .logo {
      margin-top: 16px;
      padding-right: 20px;
    }

    .navbar .logo img {
      display: block;
    }

    .navbar-inverse .nav {
      margin-top: 13px !important;
    }

    .navbar-inverse .nav > li > a {
      margin-right: 4px;
      padding: 10px 14px;
      border-radius: 999px;
      color: #f4dce6 !important;
      background: rgba(255, 255, 255, .06);
      font-size: 13px;
      font-weight: 700;
      text-shadow: none;
      transition: color .18s var(--enf-motion), background-color .18s var(--enf-motion), transform .18s var(--enf-motion);
    }

    .navbar-inverse .nav > li > a:hover,
    .navbar-inverse .nav > li > a:focus {
      color: #fff !important;
      background: var(--enf-primary);
      transform: translateY(-1px);
    }

    .navbar .topic,
    .navbar .topic h1,
    .navbar .topic p {
      color: #b99eaa;
    }

    .navbar .search_box .keyword {
      height: 36px;
      box-sizing: border-box;
      border: 0;
      border-radius: 18px;
      color: #fff;
      background: #49313e;
      box-shadow: none;
    }

    .navbar .search_box .keyword::placeholder {
      color: #cfb7c1;
    }

    .navbar .search_box .keyword:focus {
      border-color: var(--enf-primary);
      outline: 0;
      box-shadow: 0 0 0 3px rgba(255, 217, 230, .28);
    }

    .navbar .login.btn-primary {
      margin-top: 16px;
      border-color: var(--enf-primary);
      color: #fff !important;
      background: var(--enf-primary);
      box-shadow: none;
    }

    .navbar a.login[href="/login"] {
      border-color: var(--enf-secondary-container);
      color: var(--enf-on-secondary-container) !important;
      background: var(--enf-secondary-container);
    }

    .navbar a.login[href="/login"]:hover,
    .navbar a.login[href="/login"]:focus {
      border-color: #fff;
      color: var(--enf-on-secondary-container) !important;
      background: #c7fff1;
    }

    .breadcrumb {
      margin: 0 0 18px;
      padding: 15px 0 12px;
      border-bottom: 1px solid var(--enf-outline-variant);
      border-radius: 0;
      color: var(--enf-muted);
      background: transparent;
      font-size: 11px;
    }

    .breadcrumb span.divider {
      color: var(--enf-outline);
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
      border: 0;
      border-radius: 28px 8px 28px 8px;
      background: #f0f8f6;
    }

    .container .page > h2,
    .page-header h2,
    h2.gb_subtitle,
    .gb_subtitle {
      margin: 0 0 20px;
      padding: 0 0 12px;
      border-bottom: 1px solid var(--enf-outline-variant);
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
      width: 12px;
      height: 25px;
      margin-right: 11px;
      border-radius: 10px 3px 10px 3px;
      background: var(--enf-primary);
      content: "";
      vertical-align: -6px;
    }

    .gb_form {
      margin: 0 0 26px;
      padding: 24px 24px 16px;
      border: 0;
      border-radius: 28px 8px 28px 8px;
      background: var(--enf-surface-container);
    }

    input,
    select,
    textarea,
    .uneditable-input {
      border-color: transparent;
      border-radius: 16px;
      color: var(--enf-text);
      background: var(--enf-surface-high);
      box-shadow: none;
    }

    input:focus,
    select:focus,
    textarea:focus,
    .uneditable-input:focus {
      border-color: var(--enf-primary);
      outline: 0;
      box-shadow: 0 0 0 3px rgba(167, 39, 91, .16);
    }

    .btn {
      border-color: var(--enf-outline-variant);
      border-radius: 999px;
      color: var(--enf-text);
      background: var(--enf-surface);
      background-image: none;
      font-weight: 700;
      text-shadow: none;
      box-shadow: none;
      transition: border-color .18s var(--enf-motion), color .18s var(--enf-motion), background-color .18s var(--enf-motion), transform .18s var(--enf-motion);
    }

    .btn:hover,
    .btn:focus {
      border-color: var(--enf-primary-container);
      color: var(--enf-on-primary-container);
      background: var(--enf-primary-container);
      transform: translateY(-1px);
    }

    .btn-primary {
      border-color: var(--enf-primary);
      color: #fff;
      background: var(--enf-primary);
    }

    .btn-primary:hover,
    .btn-primary:focus {
      border-color: var(--enf-primary-dark);
      color: #fff;
      background: var(--enf-primary-dark);
    }

    .gb_form .btn {
      border-color: var(--enf-primary);
      color: #fff;
      background: var(--enf-primary);
    }

    .gb_form .btn:hover,
    .gb_form .btn:focus {
      border-color: var(--enf-primary-dark);
      color: #fff;
      background: var(--enf-primary-dark);
    }

    .gb_event_list {
      margin: 0;
    }

    .gb_event_list > ul > li,
    .gb_event_list > li {
      position: relative;
      box-sizing: border-box;
      margin: 0 0 12px;
      padding: 16px 14px;
      border: 1px solid var(--enf-outline-variant);
      border-radius: 24px 8px 24px 8px;
      background: var(--enf-surface);
      box-shadow: 0 2px 5px rgba(61, 0, 29, .06);
      transition: background-color .22s var(--enf-motion), border-radius .22s var(--enf-motion), box-shadow .22s var(--enf-motion), transform .22s var(--enf-motion);
    }

    .gb_event_list > ul > li:first-child,
    .gb_event_list > li:first-child {
      border-top-color: var(--enf-outline-variant);
    }

    .gb_event_list > ul > li:hover,
    .gb_event_list > li:hover {
      border-radius: 8px 24px 8px 24px;
      background: var(--enf-surface-low);
      box-shadow: 0 8px 20px rgba(61, 0, 29, .12);
      transform: translateY(-2px);
    }

    .gb_event_list > ul > li::before,
    .gb_event_list > li::before {
      position: absolute;
      top: 30px;
      left: -1px;
      width: 7px;
      height: 46px;
      border-radius: 0 10px 10px 0;
      background: var(--enf-primary);
      content: "";
    }

    .gb_event_list > ul > li:nth-child(3n+2)::before,
    .gb_event_list > li:nth-child(3n+2)::before {
      background: var(--enf-secondary);
    }

    .gb_event_list > ul > li:nth-child(3n)::before,
    .gb_event_list > li:nth-child(3n)::before {
      background: var(--enf-tertiary);
    }

    .gb_event_list .date {
      color: var(--enf-muted);
      font-family: inherit;
      font-size: 13px;
      font-variant-numeric: tabular-nums;
    }

    .gb_event_list .date > p:first-child {
      margin-bottom: 8px;
      color: var(--enf-text);
      font-size: 14px;
      font-weight: 750;
    }

    .gb_event_list .date img {
      border: 3px solid #fff;
      border-radius: 18px 6px 18px 6px;
      box-shadow: 0 4px 12px rgba(61, 0, 29, .14);
    }

    .gb_event_list .day0 {
      color: var(--enf-primary);
    }

    .gb_event_list .day6 {
      color: var(--enf-secondary);
    }

    .gb_event_list .event h4 {
      margin-bottom: 5px;
      font-size: 18px;
      line-height: 1.4;
    }

    .gb_event_list .event h4 a {
      color: var(--enf-on-primary-container) !important;
      font-weight: 800;
      text-decoration: none;
    }

    .gb_event_list .event h4 a:hover,
    .gb_event_list .event h4 a:focus {
      color: var(--enf-primary) !important;
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
      width: 78px;
      height: 52px;
      margin: 25px 8px 0 auto;
      padding: 0;
      border: 0;
      border-radius: 26px 8px 26px 8px;
      background: var(--enf-primary-container);
      font-size: 28px;
      font-weight: 800;
      line-height: 52px;
      text-align: center;
      box-shadow: none;
      transition: border-radius .2s var(--enf-motion), transform .2s var(--enf-motion);
    }

    .gb_event_list > ul > li:hover .note_count p,
    .gb_event_list > li:hover .note_count p {
      border-radius: 8px 26px 8px 26px;
      transform: scale(1.04);
    }

    .gb_event_list .note_count p:not(.enpl-note-count-highlight) {
      color: var(--enf-on-primary-container);
    }

    .gb_event_list .date_header {
      height: 42px;
      padding-left: 18px;
      border: 0;
      border-radius: 22px 7px 22px 7px;
      color: #fff;
      background: var(--enf-primary);
      font-family: inherit;
      font-size: 15px;
      font-weight: 700;
      line-height: 42px;
      box-shadow: 0 5px 14px rgba(124, 23, 64, .2);
    }

    .pagination ul {
      border-radius: 999px;
      box-shadow: none;
    }

    .pagination ul > li > a,
    .pagination ul > li > span {
      min-width: 34px;
      height: 36px;
      box-sizing: border-box;
      margin: 0 3px;
      border: 0;
      border-radius: 50% !important;
      color: var(--enf-text);
      background: var(--enf-surface-container);
      line-height: 26px;
      text-align: center;
    }

    .pagination ul > li > a:hover,
    .pagination ul > .active > a,
    .pagination ul > .active > span {
      border-color: var(--enf-primary);
      color: #fff;
      background: var(--enf-primary);
    }

    .nav-tabs {
      padding: 5px;
      border: 0;
      border-radius: 24px;
      background: var(--enf-surface-container);
    }

    .nav-tabs > li > a {
      margin: 0 4px 0 0;
      padding: 9px 15px;
      border: 0;
      border-radius: 999px;
      color: var(--enf-muted);
      background: transparent;
    }

    .nav-tabs > li > a:hover,
    .nav-tabs > .active > a,
    .nav-tabs > .active > a:hover {
      border: 0;
      border-radius: 999px;
      color: var(--enf-on-primary-container);
      background: var(--enf-primary-container);
      font-weight: 700;
    }

    table,
    .table {
      color: var(--enf-text);
    }

    .table th {
      color: var(--enf-muted);
      background: var(--enf-surface-container);
      font-size: 11px;
      font-weight: 700;
    }

    .table th,
    .table td {
      border-top-color: var(--enf-outline-variant);
    }

    .table-striped tbody > tr:nth-child(odd) > td,
    .table-striped tbody > tr:nth-child(odd) > th {
      background: #fafafa;
    }

    .gb_users_side_profile {
      box-sizing: border-box;
      width: 350px;
      margin: 0 auto 18px;
      padding: 18px;
      border: 0;
      border-radius: 32px 10px 32px 10px;
      background: var(--enf-primary-container);
      box-shadow: none;
    }

    .gb_users_side_profile .thumb {
      width: 72px;
      height: 62px;
    }

    .gb_users_side_profile .thumb img {
      width: 56px;
      height: 56px;
      border: 4px solid #fff;
      border-radius: 50%;
      box-shadow: 0 4px 12px rgba(61, 0, 29, .14);
    }

    .gb_users_side_profile .desc {
      box-sizing: border-box;
      width: calc(100% - 72px);
      padding-top: 2px;
    }

    .gb_users_side_profile .desc .name1 {
      padding: 0;
      color: var(--enf-on-primary-container);
      font-size: 19px;
      font-weight: 800;
      line-height: 1.25;
    }

    .gb_users_side_profile .desc .name2 {
      padding: 4px 0 0;
      color: var(--enf-primary-dark);
      font-size: 11px;
      line-height: 1.45;
    }

    .gb_users_side_profile .text {
      box-sizing: border-box;
      width: 100%;
      margin-top: 16px;
      padding: 13px 14px;
      clear: both;
      float: none;
      border: 0;
      border-radius: 18px 6px 18px 6px;
      color: var(--enf-on-primary-container);
      background: rgba(255, 255, 255, .58);
      font-size: 12px;
      line-height: 1.65;
    }

    .gb_score_table,
    .gb_score_table4 {
      box-sizing: border-box;
      width: 350px;
      margin: 14px auto 22px;
      border: 0;
      border-radius: 0;
      background: transparent;
      background-image: none;
      box-shadow: none;
    }

    .gb_score_table table,
    .gb_score_table4 table {
      border-collapse: separate;
      border-spacing: 4px 0;
    }

    .gb_score_table table tr td,
    .gb_score_table4 table tr td {
      border: 0;
    }

    .gb_score_table table tr td:nth-child(1),
    .gb_score_table4 table tr td:nth-child(1) {
      background: var(--enf-primary-container);
    }

    .gb_score_table table tr td:nth-child(2),
    .gb_score_table4 table tr td:nth-child(2) {
      background: var(--enf-secondary-container);
    }

    .gb_score_table table tr td:nth-child(3),
    .gb_score_table4 table tr td:nth-child(3) {
      background: var(--enf-tertiary-container);
    }

    .gb_score_table table tr:first-child td,
    .gb_score_table4 table tr:first-child td {
      border-radius: 24px 9px 0 0;
    }

    .gb_score_table table tr:last-child td,
    .gb_score_table4 table tr:last-child td {
      border-radius: 0 0 9px 24px;
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
      color: var(--enf-on-primary-container) !important;
      font-family: inherit;
      line-height: 54px;
    }

    .gb_score_table table tr:first-child td:nth-child(2) a,
    .gb_score_table4 table tr:first-child td:nth-child(2) a {
      color: var(--enf-on-secondary-container) !important;
    }

    .gb_score_table table tr:first-child td:nth-child(3) a,
    .gb_score_table4 table tr:first-child td:nth-child(3) a {
      color: var(--enf-on-tertiary-container) !important;
    }

    .gb_score_table table .labels,
    .gb_score_table4 table .labels {
      color: var(--enf-on-primary-container);
      font-size: 10px;
      text-decoration: none;
    }

    .gb_score_table table tr:last-child td:nth-child(2) .labels,
    .gb_score_table4 table tr:last-child td:nth-child(2) .labels {
      color: var(--enf-on-secondary-container);
    }

    .gb_score_table table tr:last-child td:nth-child(3) .labels,
    .gb_score_table4 table tr:last-child td:nth-child(3) .labels {
      color: var(--enf-on-tertiary-container);
    }

    .gb_badges .badges img {
      border: 0;
      border-radius: 16px 5px 16px 5px;
      opacity: .84;
      box-shadow: none;
      transition: border-radius .18s var(--enf-motion), opacity .18s var(--enf-motion), transform .18s var(--enf-motion);
    }

    .gb_badges .badges img:hover {
      opacity: 1;
      border-radius: 5px 16px 5px 16px;
      transform: translateY(-2px);
    }

    .span4.page .gb_actors_list {
      margin: 0 0 26px;
      padding: 15px 16px;
      border: 0;
      border-radius: 28px 8px 28px 8px;
      background: var(--enf-tertiary-container);
    }

    .gb_calendar_score {
      box-sizing: border-box;
      width: 350px;
      margin: 0 auto 18px;
      padding: 8px;
      border: 1px solid var(--enf-outline-variant);
      border-radius: 24px 8px 24px 8px;
      background: var(--enf-surface);
    }

    .gb_calendar_score table {
      border: 0;
      background: #fff;
    }

    .gb_calendar_score table tr td {
      padding: 4px 2px;
      border-color: var(--enf-outline-variant);
      font-size: 10px;
      font-variant-numeric: tabular-nums;
    }

    .gb_calendar_score table tr:nth-child(3n+1) td {
      border-color: var(--enf-primary-dark);
      color: #fff;
      background: var(--enf-primary-dark);
      font-weight: 700;
    }

    .gb_calendar_score table tr:nth-child(3n+1) a {
      color: #fff;
      font-weight: 700;
    }

    .gb_calendar_score table tr:nth-child(3n+2) td {
      color: var(--enf-muted);
      background: var(--enf-surface-container);
    }

    .gb_calendar_score table tr:nth-child(3n) td:has(a) {
      background: var(--enf-primary-container);
    }

    .gb_calendar_score table tr:nth-child(3n) a {
      color: var(--enf-primary-dark);
      font-weight: 800;
    }

    .gb_events_side_month {
      margin: 18px 0;
      border: 0;
      border-radius: 24px 8px 24px 8px;
      background: var(--enf-secondary-container);
      box-shadow: none;
    }

    .alert {
      border-radius: 20px 7px 20px 7px;
      text-shadow: none;
      box-shadow: none;
    }

    .footer {
      margin-top: 34px;
      padding: 34px 0 24px;
      border: 0;
      color: #bea9b2;
      background: var(--enf-dark);
    }

    .footer h4 {
      margin-bottom: 14px;
      color: #fff;
      font-size: 12px;
      font-weight: 750;
    }

    .footer a {
      color: #dfc5d0 !important;
    }

    .footer a:hover,
    .footer a:focus {
      color: #fff !important;
    }

    address {
      color: #a68f99;
    }

    @media (prefers-reduced-motion: reduce) {
      .navbar-inverse .nav > li > a,
      .btn,
      .gb_event_list > ul > li,
      .gb_event_list > li,
      .gb_event_list .note_count p,
      .gb_badges .badges img {
        transition: none;
      }

      .navbar-inverse .nav > li > a:hover,
      .navbar-inverse .nav > li > a:focus,
      .btn:hover,
      .btn:focus,
      .gb_event_list > ul > li:hover,
      .gb_event_list > li:hover,
      .gb_event_list > ul > li:hover .note_count p,
      .gb_event_list > li:hover .note_count p,
      .gb_badges .badges img:hover {
        transform: none;
      }
    }
  `);
})();
