# Hotel Lobby Digital Signage — Clifton, Texas

## Problem Statement
Build a premium fullscreen hotel lobby display web app in Clifton, Texas for a TV screen. Digital signage with rotating hotel photos, live clock/date, WeatherAPI weather, NewsAPI headlines, weather-reactive animated backgrounds, 6-day forecast weather slide, local attractions, local events, video commercials, content announcements, overlays, and comprehensive admin panel with authentication.

## Architecture
- Frontend: React + TailwindCSS + framer-motion + shadcn/ui
- Backend: FastAPI + MongoDB + httpx
- Weather: WeatherAPI.com
- News: NewsAPI.org
- Image/Video Storage: Cloudinary
- Auth: JWT + bcrypt

## Completed Features

### Core Lobby Display (5 slide types)
- [x] Photo slides — rotating hotel images with glassmorphism widgets
- [x] Weather slide — fullscreen 6-day forecast with weather-reactive backgrounds
- [x] Attractions slide — local attractions with categories
- [x] Events slide — local events with rich fields
- [x] Video slide — fullscreen video/commercial playback (NEW)
- [x] Hotel logo overlay on every slide (top-left)
- [x] Live clock and date

### Phase 10: Cloudinary Migration (Completed Mar 2026)
- [x] All images (hotel, events, logo) and videos stored on Cloudinary
- [x] Migration endpoint for legacy local images

### Phase 11: Hotel Logo & Widget Fix (Completed Mar 2026)
- [x] Hotel logo upload/replace/delete in admin Settings
- [x] Logo renders top-left on every slide
- [x] Widget positioning auto-saves

### Phase 12: Video/Commercial System (Completed Mar 2026)
- [x] Full video CRUD: create, read, update, delete
- [x] Cloudinary video upload (`hotel_lobby/videos`)
- [x] Cloudinary thumbnail upload (`hotel_lobby/video_thumbnails`)
- [x] Video entry fields: title, description, start_date, end_date, active, featured, mute, autoplay, loop, show_controls, frequency, order
- [x] Scheduling: start_date/end_date with auto-detection of expired/scheduled status
- [x] Frequency control: video appears every N rotation cycles
- [x] Playback: fullscreen, muted autoplay default, auto-advance on end, graceful error skip
- [x] No widgets overlaid on video slides (clean commercial playback)
- [x] Admin Videos tab: add/edit/upload/thumbnail/toggle/delete/reorder
- [x] Reorder endpoint for manual sort control
- [x] Videos inserted between other slide types in lobby rotation

### Admin Panel (8 tabs)
- Images, Attractions, Events, Content, Settings, Display, Overlays, Videos

## DB Schema
- `settings`: hotel_name, city, logo_url, logo_cloudinary_id, news_category, photo_interval, weather_slide_duration, widget_positions, widget_scale, font_scale, etc.
- `images`: id, filename, url (Cloudinary), cloudinary_public_id, uploaded_at
- `videos`: id, title, description, video_url, video_cloudinary_id, thumbnail_url, thumbnail_cloudinary_id, start_date, end_date, active, featured, mute, autoplay, loop, show_controls, order, frequency, created_at
- `attractions`: id, name, description, distance, category, image_url, enabled, order
- `local_events`: id, title, description, event_date, start_time, end_time, location, address, category, image_url, cloudinary_public_id, etc.
- `content`: id, section_type, title, content, enabled, order, priority, icon
- `overlays`: id, title, message, style, bg_color, text_color, icon, enabled, priority, start_time, end_time
- `users`: email, password_hash, name, role

## API Endpoints
- Auth: POST /api/auth/login, GET /api/auth/me, POST /api/auth/logout, POST /api/auth/change-password
- Settings: GET/PUT /api/settings, POST /api/settings/logo, DELETE /api/settings/logo
- Images: GET/POST /api/images, DELETE /api/images/{id}, POST /api/images/migrate-to-cloud
- Videos: GET/POST /api/videos, PUT/DELETE /api/videos/{id}, POST /api/videos/{id}/upload, POST /api/videos/{id}/thumbnail, POST /api/videos/reorder
- Attractions: GET/POST /api/attractions, PUT/DELETE /api/attractions/{id}, POST /api/attractions/reorder
- Events: GET/POST /api/events, PUT/DELETE /api/events/{id}, POST /api/events/reorder, POST /api/events/{id}/image
- Content: GET/POST /api/content/{type}, PUT/DELETE /api/content/{type}/{id}
- Overlays: GET/POST/PUT/DELETE /api/overlays, GET /api/overlays/active
- Weather: GET /api/weather, GET /api/weather/extended
- News: GET /api/news

## P1 Upcoming Tasks
- Scrolling ticker bar at bottom for content announcements/promotions

## P2 Backlog
- Content sections integration into lobby display slides
- Full free-form drag widget positioning (pixel-level)
- Refactor AdminPanel.jsx into smaller sub-components (2900+ lines)
