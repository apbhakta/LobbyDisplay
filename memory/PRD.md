# Hotel Lobby Digital Signage — Clifton, Texas

## Problem Statement
Build a premium fullscreen hotel lobby display web app in Clifton, Texas for a TV screen. Digital signage with rotating hotel photos, live clock/date, WeatherAPI weather, NewsAPI headlines, weather-reactive animated backgrounds, 6-day forecast weather slide, local attractions, local events, content announcements, overlays, and comprehensive admin panel with authentication.

## Architecture
- Frontend: React + TailwindCSS + framer-motion + shadcn/ui
- Backend: FastAPI + MongoDB + httpx
- Weather: WeatherAPI.com (replaced OpenWeatherMap Feb 2026)
- News: NewsAPI.org
- Image Storage: Cloudinary (migrated from local disk Mar 2026)
- Auth: JWT + bcrypt

## Completed Features

### Core Lobby Display
- [x] 4 slide types rotation: Photo, Weather, Attractions, Events
- [x] Weather-reactive animated backgrounds (8 themes, driven by live API)
- [x] Live clock and date
- [x] Fullscreen weather slide with 6-day forecast
- [x] Glassmorphism weather widget, news headline

### Phase 1: Display Settings & Orientation
- [x] Preset aspect ratios (16:9, 9:16, 4:3, 3:4, Custom)
- [x] Landscape/Portrait toggle with auto-dimension flip
- [x] Custom width/height, display scale, live miniature preview

### Phase 2: Backend Content Management
- [x] Attractions CRUD with 9 categories, distance, image_url
- [x] Content sections CRUD for 7 types

### Phase 3: Widget Layout Controls
- [x] Widget scale, font scale, padding, spacing controls

### Phase 4: Local Events
- [x] Full CRUD with rich fields, 12 categories, featured/expired handling
- [x] Sorting, event image upload, settings integration
- [x] Dynamic EventsSlide in lobby display

### Phase 5: UI Redesign (Completed Feb 2026)
- [x] Fullscreen Overlay Layout: Photos fill entire screen, widgets float on top with glassmorphism
- [x] Removed all stock images: No unsplash.com fallback URLs
- [x] Premium empty states
- [x] Admin LivePreview reflects fullscreen overlay layout

### Phase 6: WeatherAPI.com Migration (Completed Feb 2026)
- [x] Replaced OpenWeatherMap with WeatherAPI.com
- [x] Icon mapping, new fields (feels_like, precipitation)
- [x] 15-minute cache, graceful fallback

### Phase 7: Portrait 4:3 Default Display (Completed Feb 2026)
- [x] Default: Portrait 4:3, 7.5x10 inches
- [x] Smart photo cropping, weather slide rewrite for portrait

### Phase 8: Widget Positioning, Refactoring & Overlays (Completed Feb 2026)
- [x] Drag-and-drop widget positioning in Admin Display tab
- [x] LobbyDisplay.jsx refactored into sub-components
- [x] Event/announcement overlay system (4 styles, scheduling, priority)

### Phase 9: Admin Authentication (Completed Feb 2026)
- [x] JWT-based admin login with bcrypt
- [x] Login page, token-based auth, password change, logout
- [x] Admin seeded on startup from env vars

### Phase 10: Cloudinary Migration & Cleanup (Completed Mar 2026)
- [x] Migrated all image uploads from local disk (`/uploads/`) to Cloudinary cloud storage
- [x] Hotel images uploaded to `hotel_lobby/images` folder on Cloudinary
- [x] Event images uploaded to `hotel_lobby/events` folder on Cloudinary
- [x] `cloudinary_public_id` stored in DB for proper deletion
- [x] Migration endpoint `POST /api/images/migrate-to-cloud` for bulk migration of legacy local images
- [x] All 24 existing images successfully migrated to Cloudinary
- [x] Removed "Made with Emergent" watermark and PostHog analytics from `index.html`
- [x] Updated page title and meta description

### Admin Panel (6 tabs)
- Images: Upload to Cloudinary, drag-reorder, delete, reset
- Attractions: Full CRUD with categories, enable/disable
- Events: Full CRUD with rich fields, featured/expired, image upload to Cloudinary
- Content: 7 section types with CRUD
- Settings: Hotel info, news category, timing
- Display: Aspect ratios, orientation, widget sizing, live preview

## DB Schema
- `settings`: hotel_name, city, news_category, photo_interval, weather_slide_duration, aspect_ratio, display_orientation, display_scale, display_width, display_height, widget_scale, font_scale, widget_padding, widget_spacing, attractions_per_slide, events_per_slide, widget_positions, etc.
- `images`: id, filename, url (Cloudinary), cloudinary_public_id, uploaded_at
- `attractions`: id, name, description, distance, category, image_url, enabled, order
- `local_events`: id, title, description, event_date, start_time, end_time, location, address, category, image_url, cloudinary_public_id, website, phone, notes, featured, enabled, keep_after_expired, order
- `content`: id, section_type, title, content, enabled, order, priority, icon
- `overlays`: id, title, message, style, bg_color, text_color, icon, enabled, priority, start_time, end_time
- `users`: email, password_hash, name, role

## API Endpoints
- POST /api/auth/login, GET /api/auth/me, POST /api/auth/logout, POST /api/auth/change-password
- GET/PUT /api/settings
- GET/POST /api/images, DELETE /api/images/{id}, POST /api/images/migrate-to-cloud, POST /api/images/reset-defaults
- GET/POST /api/attractions, PUT/DELETE /api/attractions/{id}, POST /api/attractions/reorder
- GET/POST /api/events, PUT/DELETE /api/events/{id}, POST /api/events/reorder, POST /api/events/{id}/image
- GET/POST /api/content/{type}, PUT/DELETE /api/content/{type}/{id}, POST /api/content/{type}/reorder
- GET/POST/PUT/DELETE /api/overlays, GET /api/overlays/active
- GET /api/weather, GET /api/weather/extended
- GET /api/news
- GET /api/health

## P1 Upcoming Tasks
- Scrolling ticker bar at bottom for content announcements/promotions

## P2 Backlog
- Content sections integration into lobby display slides
- Full free-form drag widget positioning (pixel-level, not grid-based)
- Refactor AdminPanel.jsx into smaller sub-components (2600+ lines)
