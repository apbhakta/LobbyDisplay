# Velkommen Inn — Hotel Lobby Digital Signage

## Problem Statement
Build a premium fullscreen hotel lobby display web app for "Velkommen Inn" in Clifton, Texas. Digital signage with rotating hotel photos, live clock/date, OpenWeatherMap weather, NewsAPI headlines, weather-reactive animated backgrounds, 6-day forecast weather slide, admin panel for image management and full content management.

## Architecture
- Frontend: React + TailwindCSS + framer-motion + shadcn/ui
- Backend: FastAPI + MongoDB + httpx
- APIs: OpenWeatherMap, NewsAPI.org

## Completed Features

### Core Lobby Display
- [x] 4 slide types rotation: Photo, Weather, Attractions, Events
- [x] Weather-reactive animated backgrounds (8 themes, driven by live API)
- [x] Glassmorphism weather widget, news headline overlay
- [x] Live clock and date
- [x] Fullscreen weather slide with 6-day forecast

### Phase 1: Display Settings & Orientation
- [x] Preset aspect ratios (16:9, 9:16, 4:3, 3:4, Custom)
- [x] Landscape/Portrait toggle with auto-dimension flip
- [x] Custom width/height, display scale, live miniature preview

### Phase 2: Backend Content Management
- [x] Attractions CRUD with 9 categories, distance, image_url
- [x] Content sections CRUD for 7 types (announcements, promotions, welcome messages, amenities, events, emergency info, checkout reminders)

### Phase 3: Widget Layout Controls
- [x] 5 preset layouts: bottom-left, top-right, bottom-bar, centered, split
- [x] Widget scale, font scale, padding, spacing controls

### Phase 4: Local Events (NEW)
- [x] Full CRUD: add, edit, delete, enable/disable, reorder
- [x] Rich fields: title, description, event_date, start_time, end_time, location, address, category, image_url, website, phone, notes, featured, keep_after_expired
- [x] 12 categories: community, music, arts, food, sports, holiday, festival, market, charity, outdoor, family, education
- [x] Active/expired handling: auto-hide expired, keep_after_expired override
- [x] Sorting: upcoming, newest, featured, custom order
- [x] Event image upload
- [x] Settings: events_per_slide, events_auto_rotate, events_show_in_slideshow, events_auto_hide_expired, events_sort_by
- [x] Dynamic EventsSlide in lobby display driven by DB data

### Admin Panel (6 tabs)
- Images: Upload, drag-reorder, delete, reset to defaults
- Attractions: Full CRUD with categories, enable/disable, per-slide config
- Events: Full CRUD with rich fields, featured/expired handling, sort, image upload
- Content: 7 section types with CRUD
- Settings: Hotel info, news category, timing, weather animations
- Display: Aspect ratios, orientation, layout presets, widget sizing, live preview

## DB Schema
- `settings`: hotel_name, city, news_category, photo_interval, weather_slide_duration, aspect_ratio, display_orientation, display_scale, display_width, display_height, widget_layout, widget_scale, font_scale, widget_padding, widget_spacing, attractions_per_slide, attractions_auto_rotate, events_per_slide, events_auto_rotate, events_show_in_slideshow, events_auto_hide_expired, events_sort_by, enable_weather_animations
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

## P2 Backlog
- Content sections integration into lobby display (announcements, promotions on slides)
- Full drag-and-drop widget positioning
- Event/announcement overlay for special occasions
