# Velkommen Inn — Hotel Lobby Digital Signage

## Problem Statement
Build a premium fullscreen hotel lobby display web app for "Velkommen Inn" in Clifton, Texas for a 16:9 TV screen. The digital signage must show rotating hotel photos, live clock, date, OpenWeatherMap weather, 1 NewsAPI headline, and feature a weather-reactive animated background (sunny, cloudy, rainy, etc.). Also needs a standalone fullscreen weather slide in the rotation with a 6-day forecast. Requires an admin panel for drag-and-drop image uploads and configuration.

## Core Requirements
- Rotating hotel photo slides with glassmorphism weather/news overlays
- Live clock and date display
- Real-time weather from OpenWeatherMap API (Clifton, TX)
- News headlines from NewsAPI.org
- Weather-reactive animated backgrounds that dynamically change based on live weather API conditions
- Dedicated fullscreen weather slide with 6-day forecast
- Local Attractions slide for Clifton, TX
- Events slide for Clifton area events
- Admin panel at /admin for image management, settings, and display orientation

## Architecture
- Frontend: React + TailwindCSS + framer-motion + shadcn/ui
- Backend: FastAPI + MongoDB + httpx
- APIs: OpenWeatherMap, NewsAPI.org

## Slide Rotation Order
Photos -> Attractions -> Photos -> Weather -> Photos -> Events (looping)
- Photo interval: 8s (configurable)
- Weather slide: 15s (configurable)
- Special slides (attractions/events): 12s

## What's Been Implemented

### Phase 1: Display Settings & Orientation (COMPLETE - Mar 28 2026)
- [x] Preset aspect ratios: 16:9, 9:16, 4:3, 3:4, Custom
- [x] Custom width/height input (inches)
- [x] Landscape/Portrait orientation toggle with auto-dimension flip
- [x] Live miniature preview in admin showing widget placement + weather theme
- [x] Format info label (Aspect Ratio, Orientation, Width, Height)
- [x] All slides responsive in both portrait and landscape
- [x] Display scale slider (50-150%)
- [x] Settings persist in backend (aspect_ratio field added to Settings model)

### Core Features (COMPLETE - earlier sessions)
- [x] Full lobby display with slide rotation (LobbyDisplay.jsx)
- [x] Weather-reactive animated backgrounds (WeatherBackground.jsx) - 8 themes
- [x] Glassmorphism weather widget, news headline overlay
- [x] Live clock and date
- [x] Fullscreen weather slide with 6-day forecast (WeatherSlide.jsx)
- [x] Local Attractions slide with dynamic weather background
- [x] Events slide with dynamic weather background
- [x] Admin panel: Images tab (upload/drag-reorder/delete), Settings tab, Display tab
- [x] Backend APIs: /api/weather, /api/weather/extended, /api/news, /api/settings, /api/images

## Upcoming Tasks (Phase 2)
- [ ] Backend CRUD for local attractions (add, edit, delete, reorder, enable/disable)
  - Fields: name, description, distance, category
  - Categories: dining, shopping, parks, museums, entertainment, family, events, outdoor, hotel recommendations
  - Config: count visible, auto-rotate toggle
- [ ] Backend CRUD for: announcements, promotions, welcome messages, amenities, events, emergency info, checkout reminders
- [ ] Admin management UI for all content sections

## Future Tasks (Phase 3)
- [ ] Preset widget layouts (bottom-left, top-right, bottom bar, centered, split)
- [ ] Widget sizing controls (clock, weather, news, forecast, logo, welcome, attractions)
- [ ] Padding, spacing, font size adjustments
- [ ] Structure for future drag-and-drop positioning

## P2 Backlog
- Event/announcement overlay for special occasions or promotions

## Key Files
- /app/frontend/src/pages/LobbyDisplay.jsx
- /app/frontend/src/pages/AdminPanel.jsx
- /app/frontend/src/components/WeatherBackground.jsx
- /app/frontend/src/components/WeatherSlide.jsx
- /app/frontend/src/components/LocalAttractionsSlide.jsx
- /app/frontend/src/components/EventsSlide.jsx
- /app/backend/server.py

## DB Schema
- `settings`: { id, hotel_name, city, news_category, photo_interval, weather_slide_duration, weather_refresh, news_refresh, aspect_ratio, display_orientation, display_scale, display_width, display_height, enable_weather_animations }
- `images`: { id, filename, url, uploaded_at }
