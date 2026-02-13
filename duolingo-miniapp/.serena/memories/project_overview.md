# Project Overview

## Purpose
Duolingo-style WeChat Mini Program (微信小程序) that recreates the Duolingo iOS UI using native Mini Program tech (no third-party framework).

## Tech Stack
- WXML (templates)
- WXSS (styles)
- JavaScript (Mini Program logic)
- WeChat Mini Program APIs
- Optional: TDesign mini program components

## High-level Structure
- `app.js` global app entry and data
- `app.json` pages registration and window config
- `app.wxss` global styles and theme tokens
- `pages/` feature pages (login flow, sections/levels, lessons, media players, achievements, league)
- `components/` reusable UI pieces (metrics, bottom nav, cards, banners)
- Docs: `README.md`, `QUICK_START.md`, `PROJECT_INFO.md`, and feature-specific guides

## Pages (from `app.json`)
- `pages/index/index`
- `pages/login/welcome/welcome`
- `pages/login/auth-choice/auth-choice`
- `pages/login/signin/signin`
- `pages/login/register/register`
- `pages/sections/list/list`
- `pages/section/detail/detail`
- `pages/level/detail/detail`
- `pages/league/sapphire/sapphire`
- `pages/courses/list/list`
- `pages/materials/detail/detail`
- `pages/lesson/interactive/interactive`
- `pages/lesson/practice/practice`
- `pages/player/pdf/pdf`
- `pages/player/audio/audio`
- `pages/player/video/video`
- `pages/achievement/achievement`

## Components
- `components/account-card`
- `components/bottom-nav`
- `components/input-card`
- `components/level-card`
- `components/metrics`
- `components/section-card`
- `components/unit-banner`

## Key Features
- Duolingo-like UI, responsive layout
- Course lists, achievements, league, login flow
- Navigation between pages
