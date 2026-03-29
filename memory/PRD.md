# Hotel Lobby Digital Signage — Clifton, Texas

## Problem Statement
Build a premium fullscreen hotel lobby display web app in Clifton, Texas for a TV screen. Digital signage with rotating hotel photos, live clock/date, WeatherAPI weather, NewsAPI headlines, weather-reactive animated backgrounds, 6-day forecast weather slide, local attractions, local events, video commercials, content sections, overlays, and comprehensive admin panel with authentication.

## Architecture
- Frontend: React + TailwindCSS + framer-motion + shadcn/ui
- Backend: FastAPI + MongoDB + httpx
- Weather: WeatherAPI.com
- News: NewsAPI.org
- Image/Video Storage: Cloudinary
- Auth: JWT + bcrypt

## Completed Features

### Core Lobby Display (6 slide types)
- [x] Photo slides — rotating hotel images with glassmorphism widgets
- [x] Weather slide — fullscreen 6-day forecast with weather-reactive backgrounds
- [x] Attractions slide — local attractions with categories
- [x] Events slide — local events with rich fields
- [x] Video slide — fullscreen video/commercial playback
- [x] Content slide — announcements, promotions, amenities, etc. (NEW)
- [x] Hotel logo overlay on every slide (positioned via free-form drag)
- [x] Live clock and date

### Phase 10: Cloudinary Migration (Completed Mar 2026)
- [x] All images/videos/logos on Cloudinary

### Phase 11: Hotel Logo & Widget Fix (Completed Mar 2026)
- [x] Hotel logo upload/replace/delete, renders on all slides

### Phase 12: Video/Commercial System (Completed Mar 2026)
- [x] Full video CRUD, Cloudinary upload, scheduling, frequency control

### Phase 13: Content Sections Integration (Completed Mar 2026)
- [x] 7 content types: announcement, promotion, welcome_message, amenity, event, emergency, checkout_reminder
- [x] ContentSlide component renders in lobby rotation with weather backgrounds
- [x] Auto-rotates through multiple items per section
- [x] Section-specific color themes and icons

### Phase 14: Free-form Widget Positioning (Completed Mar 2026)
- [x] Replaced 6-spot grid with continuous drag canvas (0-100% x/y)
- [x] 4 draggable widgets: Logo, Clock, Weather, News
- [x] Mouse drag on preview canvas in admin Display tab
- [x] Positions auto-save to backend
- [x] PhotoSlide renders widgets at exact percentage positions

### Phase 15: AdminPanel Refactor (Completed Mar 2026)
- [x] Extracted 3 tabs into separate components:
  - AttractionsTab.jsx — self-contained CRUD
  - OverlaysTab.jsx — self-contained CRUD
  - VideosTab.jsx — self-contained CRUD
- [x] Extracted WidgetPositionPanel.jsx (free-form drag canvas)
- [x] AdminPanel.jsx reduced from 2981 → 2194 lines
- [x] All 8 tabs working: Images, Attractions, Events, Content, Settings, Display, Overlays, Videos

### Admin Panel (8 tabs)
- Images, Attractions, Events, Content, Settings, Display, Overlays, Videos

## DB Schema
- `settings`: hotel_name, city, logo_url, logo_cloudinary_id, news_category, photo_interval, weather_slide_duration, widget_positions (continuous %), widget_scale, font_scale, etc.
- `images`: id, filename, url, cloudinary_public_id, uploaded_at
- `videos`: id, title, description, video_url, video_cloudinary_id, thumbnail_url, thumbnail_cloudinary_id, start_date, end_date, active, featured, mute, autoplay, loop, show_controls, order, frequency
- `attractions`: id, name, description, distance, category, image_url, enabled, order
- `local_events`: id, title, description, event_date, start_time, end_time, location, address, category, image_url, etc.
- `content`: id, section_type, title, content, enabled, order, priority, icon
- `overlays`: id, title, message, style, bg_color, text_color, icon, enabled, priority, start_time, end_time
- `users`: email, password_hash, name, role

## API Endpoints
- Auth: POST /api/auth/login, GET /api/auth/me, POST /api/auth/change-password
- Settings: GET/PUT /api/settings, POST /api/settings/logo, DELETE /api/settings/logo
- Images: GET/POST /api/images, DELETE /api/images/{id}, POST /api/images/migrate-to-cloud
- Videos: GET/POST /api/videos, PUT/DELETE /api/videos/{id}, POST /api/videos/{id}/upload, POST /api/videos/{id}/thumbnail, POST /api/videos/reorder
- Attractions: GET/POST /api/attractions, PUT/DELETE /api/attractions/{id}
- Events: GET/POST /api/events, PUT/DELETE /api/events/{id}, POST /api/events/{id}/image
- Content: GET/POST /api/content/{type}, PUT/DELETE /api/content/{type}/{id}
- Overlays: GET/POST/PUT/DELETE /api/overlays, GET /api/overlays/active
- Weather: GET /api/weather, GET /api/weather/extended
- News: GET /api/news

## P1 Upcoming Tasks
- Scrolling ticker bar at bottom for content announcements/promotions

## P2 Backlog
- Further AdminPanel refactor (Images, Events, Content, Settings, Display tabs still inline)
