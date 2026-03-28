# Velkommen Inn — Hotel Lobby Digital Signage

## Problem Statement
Build a premium fullscreen hotel lobby display web app for "Velkommen Inn" in Clifton, Texas for a 16:9 TV screen. The digital signage must show rotating hotel photos, live clock, date, OpenWeatherMap weather, 1 NewsAPI headline, and feature a weather-reactive animated background (sunny, cloudy, rainy, etc.). Also needs a standalone fullscreen weather slide in the rotation with a 6-day forecast. Requires an admin panel for drag-and-drop image uploads and configuration.

## Architecture
- Frontend: React + TailwindCSS + framer-motion + shadcn/ui
- Backend: FastAPI + MongoDB + httpx
- APIs: OpenWeatherMap, NewsAPI.org

## What's Been Implemented

### Phase 1: Display Settings & Orientation (COMPLETE)
- Preset aspect ratios: 16:9, 9:16, 4:3, 3:4, Custom
- Custom width/height input (inches)
- Landscape/Portrait orientation toggle with auto-dimension flip
- Live miniature preview in admin
- All slides responsive in both orientations
- Display scale slider (50-150%)

### Phase 2: Backend Content Management (COMPLETE)
- Attractions CRUD: add, edit, delete, enable/disable with categories (dining, shopping, parks, museums, entertainment, family, events, outdoor, hotel_recommendations)
- Fields: name, description, distance, category, image_url
- Config: attractions_per_slide, attractions_auto_rotate
- Content sections CRUD for 7 types: announcement, promotion, welcome_message, amenity, event, emergency, checkout_reminder
- Each: title, content, priority, enabled
- Admin tabs: Images, Attractions, Content, Settings, Display

### Phase 3: Widget Layout Controls (COMPLETE)
- 5 preset layouts: bottom-left, top-right, bottom-bar, centered, split
- Widget scale slider (0.5x-1.5x)
- Font scale slider (0.7x-1.5x)
- Padding and spacing controls
- Live preview reflects layout choice
- Structured for future drag-and-drop (renderPhotoLayout pattern)

### Core Features (COMPLETE)
- Full lobby display with 4 slide types (photo, weather, attractions, events)
- Weather-reactive animated backgrounds (8 themes) driven by live API
- Glassmorphism weather widget, news headline overlay
- Live clock and date
- Fullscreen weather slide with 6-day forecast
- Dynamic attractions slide from DB
- Admin panel with 5 management tabs

## DB Schema
- `settings`: { id, hotel_name, city, news_category, photo_interval, weather_slide_duration, weather_refresh, news_refresh, aspect_ratio, display_orientation, display_scale, display_width, display_height, enable_weather_animations, attractions_per_slide, attractions_auto_rotate, widget_layout, widget_scale, font_scale, widget_padding, widget_spacing }
- `images`: { id, filename, url, uploaded_at }
- `attractions`: { id, name, description, distance, category, image_url, enabled, order, created_at }
- `content`: { id, section_type, title, content, enabled, order, priority, icon, created_at }

## API Endpoints
- GET/PUT /api/settings
- GET/POST /api/images, DELETE /api/images/{id}
- GET/POST /api/attractions, PUT/DELETE /api/attractions/{id}, POST /api/attractions/reorder
- GET/POST /api/content/{type}, PUT/DELETE /api/content/{type}/{id}, POST /api/content/{type}/reorder
- GET /api/weather, GET /api/weather/extended
- GET /api/news

## P2 Backlog
- Event/announcement overlay for special occasions
- Full drag-and-drop widget positioning
- Content sections integration into lobby display slides (announcements, promotions on display)

## Key Files
- /app/frontend/src/pages/LobbyDisplay.jsx
- /app/frontend/src/pages/AdminPanel.jsx
- /app/frontend/src/components/WeatherBackground.jsx
- /app/frontend/src/components/WeatherSlide.jsx
- /app/frontend/src/components/LocalAttractionsSlide.jsx
- /app/frontend/src/components/EventsSlide.jsx
- /app/backend/server.py
