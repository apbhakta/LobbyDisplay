# Hotel Lobby Digital Signage — Clifton, Texas

## Problem Statement
Build a premium fullscreen hotel lobby display web app in Clifton, Texas for a TV screen. Digital signage with rotating hotel photos, live clock/date, WeatherAPI weather, NewsAPI headlines, weather-reactive animated backgrounds, 6-day forecast weather slide, local attractions, local events, content announcements, overlays, and comprehensive admin panel with authentication.

## Architecture
- Frontend: React + TailwindCSS + framer-motion + shadcn/ui
- Backend: FastAPI + MongoDB + httpx
- Weather: WeatherAPI.com
- News: NewsAPI.org
- Image Storage: Cloudinary
- Auth: JWT + bcrypt

## Completed Features

### Core Lobby Display
- [x] 4 slide types rotation: Photo, Weather, Attractions, Events
- [x] Weather-reactive animated backgrounds (8 themes)
- [x] Live clock and date
- [x] Fullscreen weather slide with 6-day forecast
- [x] Glassmorphism weather widget, news headline
- [x] Hotel logo overlay on every slide (top-left)

### Phase 1-4: Display, Content, Widgets, Events (Completed)
### Phase 5: UI Redesign (Completed Feb 2026)
### Phase 6: WeatherAPI.com Migration (Completed Feb 2026)
### Phase 7: Portrait 4:3 Default Display (Completed Feb 2026)
### Phase 8: Widget Positioning, Refactoring & Overlays (Completed Feb 2026)
### Phase 9: Admin Authentication (Completed Feb 2026)

### Phase 10: Cloudinary Migration & Cleanup (Completed Mar 2026)
- [x] Migrated all image uploads from local disk to Cloudinary
- [x] Hotel images: `hotel_lobby/images`, Event images: `hotel_lobby/events`, Logo: `hotel_lobby/logo`
- [x] `cloudinary_public_id` stored in DB for proper deletion
- [x] Migration endpoint `POST /api/images/migrate-to-cloud`
- [x] Removed "Made with Emergent" watermark from index.html

### Phase 11: Hotel Logo & Widget Fix (Completed Mar 2026)
- [x] Hotel logo upload via admin Settings tab (Cloudinary-backed)
- [x] Logo displays top-left on every slide type (photo, weather, attractions, events)
- [x] Logo upload, replace, and delete functionality
- [x] `POST /api/settings/logo` and `DELETE /api/settings/logo` endpoints
- [x] Widget positioning auto-save (positions save immediately when changed, no manual save needed)

### Admin Panel (6 tabs)
- Images: Upload to Cloudinary, drag-reorder, delete, reset
- Attractions: Full CRUD with categories, enable/disable
- Events: Full CRUD with rich fields, featured/expired, image upload to Cloudinary
- Content: 7 section types with CRUD
- Settings: Hotel info, logo upload, news category, timing
- Display: Aspect ratios, orientation, widget positioning (auto-save), widget sizing

## DB Schema
- `settings`: hotel_name, city, logo_url, logo_cloudinary_id, news_category, photo_interval, weather_slide_duration, aspect_ratio, display_orientation, widget_positions, widget_scale, font_scale, etc.
- `images`: id, filename, url (Cloudinary), cloudinary_public_id, uploaded_at
- `attractions`: id, name, description, distance, category, image_url, enabled, order
- `local_events`: id, title, description, event_date, start_time, end_time, location, address, category, image_url, cloudinary_public_id, etc.
- `content`: id, section_type, title, content, enabled, order, priority, icon
- `overlays`: id, title, message, style, bg_color, text_color, icon, enabled, priority, start_time, end_time
- `users`: email, password_hash, name, role

## API Endpoints
- Auth: POST /api/auth/login, GET /api/auth/me, POST /api/auth/logout, POST /api/auth/change-password
- Settings: GET/PUT /api/settings, POST /api/settings/logo, DELETE /api/settings/logo
- Images: GET/POST /api/images, DELETE /api/images/{id}, POST /api/images/migrate-to-cloud
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
- Full free-form drag widget positioning (pixel-level, not grid-based)
- Refactor AdminPanel.jsx into smaller sub-components (2700+ lines)
