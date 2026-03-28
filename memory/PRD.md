# Hotel Lobby Digital Signage — Clifton, Texas

## Problem Statement
Build a premium fullscreen hotel lobby display web app in Clifton, Texas for a 16:9 TV screen. Digital signage with rotating hotel photos, live clock/date, OpenWeatherMap weather, NewsAPI headlines, weather-reactive animated backgrounds, 6-day forecast weather slide, local attractions, local events, content announcements, and comprehensive admin panel.

## Architecture
- Frontend: React + TailwindCSS + framer-motion + shadcn/ui
- Backend: FastAPI + MongoDB + httpx
- APIs: OpenWeatherMap, NewsAPI.org

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
- [x] **Separated Panel Layout**: Photo area and info panel (clock, weather, news) strictly separated — NO overlap
  - Landscape: Photo left (68%), info panel right (32%)
  - Portrait: Photo top (65%), info panel bottom (35%)
- [x] **Removed all stock images**: No unsplash.com fallback URLs in code or DB
- [x] **Removed "Velkommen Inn"** from all display slides, backend defaults, and fallback data
- [x] **Premium empty states**: "Attractions coming soon" / "Events coming soon" when no DB data
- [x] **Admin LivePreview** updated to reflect the new separated panel layout
- [x] **Display Layout card** replaces old widget layout presets in admin
- [x] **DB data migration**: Cleaned unsplash URLs from existing attractions, cleared hotel_name

### Admin Panel (6 tabs)
- Images: Upload, drag-reorder, delete, reset
- Attractions: Full CRUD with categories, enable/disable, per-slide config
- Events: Full CRUD with rich fields, featured/expired handling, sort, image upload
- Content: 7 section types with CRUD
- Settings: Hotel info, news category, timing, weather animations
- Display: Aspect ratios, orientation, separated layout info, widget sizing, live preview

## DB Schema
- `settings`: hotel_name, city, news_category, photo_interval, weather_slide_duration, aspect_ratio, display_orientation, display_scale, display_width, display_height, widget_scale, font_scale, widget_padding, widget_spacing, attractions_per_slide, events_per_slide, etc.
- `images`: id, filename, url, uploaded_at
- `attractions`: id, name, description, distance, category, image_url, enabled, order
- `local_events`: id, title, description, event_date, start_time, end_time, location, address, category, image_url, website, phone, notes, featured, enabled, keep_after_expired, order
- `content`: id, section_type, title, content, enabled, order, priority, icon

## API Endpoints
- GET/PUT /api/settings
- GET/POST /api/images, DELETE /api/images/{id}
- GET/POST /api/attractions, PUT/DELETE /api/attractions/{id}, POST /api/attractions/reorder
- GET/POST /api/events, PUT/DELETE /api/events/{id}, POST /api/events/reorder, POST /api/events/{id}/image
- GET/POST /api/content/{type}, PUT/DELETE /api/content/{type}/{id}, POST /api/content/{type}/reorder
- GET /api/weather, GET /api/weather/extended, GET /api/news

## P1 Upcoming Tasks
- Scrolling ticker bar at the bottom for content announcements/promotions

## P2 Backlog
- Content sections integration into lobby display (announcements, promotions on slides)
- Full drag-and-drop widget positioning
- Event/announcement overlay for special occasions
- Refactor LobbyDisplay.jsx into smaller layout sub-components
