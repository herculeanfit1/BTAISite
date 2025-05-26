# Product Requirements Document (prd.md)

## 1. Introduction

### 1.1 Purpose

Bridging Trust AI is a consultancy and development firm specializing in making AI accessible and beneficial for small and mid‑sized businesses (SMBs). This document outlines the product vision, objectives, features, and acceptance criteria for the initial website.

### 1.2 Scope

This PRD covers the public-facing website built with Next.js 15.3.2 + Tailwind CSS, including brand identity integration, content strategy, SEO setup, appointment booking, privacy compliance, and analytics.

## 2. Objectives & Goals

- **Communicate Value**: Present Bridging Trust AI's mission of "Making AI accessible and beneficial for everyone."
- **Lead Generation**: Enable SMB owners to easily book consultations via embedded scheduling.
- **Authority Building**: Showcase expertise through a blog, case studies, and thought leadership.
- **Brand Consistency**: Enforce the brand guidelines (colors, typography, imagery).
- **Compliance & Trust**: Adhere to GDPR/CCPA and implement transparent privacy notices.
- **SEO & Performance**: Optimize for target keywords and fast load times on Namecheap hosting.

## 3. Key Features

1. **Responsive Marketing Pages** (Home, About, Services, Contact)
2. **Blog & Resources** for SEO-driven content targeting SMB AI adoption keywords
3. **Appointment Booking Embed** (Microsoft Bookings or Calendly)
4. **Static Site Generation** for performance, with optional SSR API routes for dynamic data
5. **Privacy & Cookie Banner** with GDPR/CCPA compliance
6. **Analytics Integration** (GA4 with IP anonymization, custom conversion events)
7. **CI/CD Pipeline** via GitHub Actions → Namecheap deploy
8. **Dynamics 365 BC Integration** (optional headless CMS for content)

## 4. User Stories

- **US1**: As an SMB owner, I want to understand how AI can help my business, so that I can make an informed decision.
- **US2**: As a prospective client, I want to schedule a free consultation without back-and-forth emailing, so that onboarding is seamless.
- **US3**: As a site visitor, I want to find relevant AI resources (blog posts) for my industry, so that I learn best practices.
- **US4**: As a privacy-conscious user, I want to control my cookie and analytics consent, so that my data is respected.

## 5. Acceptance Criteria

- PRD-approved design implemented in Next.js 15.3.2 + Tailwind CSS
- Pages load in <1.5s on desktop and mobile (Lighthouse Performance > 90)
- Appointment widget embedded and functional (bookings appear in calendar)
- Privacy banner appears on first visit; GA4 does not fire until consent given
- All pages have unique title tags and meta descriptions; target keywords included
- CI/CD pipeline automatically deploys changes to live site

## 6. Dependencies

- Namecheap hosting with Node.js 18.17 support
- Microsoft 365 Bookings or Calendly account
- GitHub repository & Actions runner
- Azure AD app for Dynamics BC (for CMS integration)

## 7. Timeline

| Milestone                    | Target Date |
| ---------------------------- | ----------- |
| Brand & Style Guide Complete | Week 1      |
| Next.js + Tailwind Scaffold  | Week 2      |
| Core Pages (SSG) Deployed    | Week 3      |
| Booking Integration Live     | Week 4      |
| Blog Setup & First Posts     | Week 5      |
| Privacy & Analytics Setup    | Week 5      |
| Final QA & Launch            | Week 6      |
