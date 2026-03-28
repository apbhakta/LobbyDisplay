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

## What's Been Implemented (All Complete)
- [x] Full lobby display with slide rotation (LobbyDisplay.jsx)
- [x] Weather-reactive animated backgrounds (WeatherBackground.jsx) - 8 themes: sunny, night, cloudy, rain, storm, snow, fog, windy
- [x] Glassmorphism weather widget, news headline overlay
- [x] Live clock and date
- [x] Fullscreen weather slide with 6-day forecast (WeatherSlide.jsx)
- [x] Local Attractions slide with dynamic weather background (LocalAttractionsSlide.jsx)
- [x] Events slide with dynamic weather background (EventsSlide.jsx)
- [x] Admin panel with image upload, drag-and-drop reorder, settings, display orientation
- [x] Display scaling: landscape, portrait, 4:3 standard
- [x] Backend APIs: /api/weather, /api/weather/extended, /api/news, /api/settings, /api/images
- [x] Weather & news caching (15min / 30min)
- [x] Fallback data for API failures
- [x] Slide interval timing fix (setTimeout-based, variable per slide type)
- [x] Dynamic weather backgrounds on ALL non-photo slides (weather, attractions, events)

## P2 Backlog
- Event/announcement overlay for special occasions or promotions

## Key Files
- /app/frontend/src/pages/LobbyDisplay.jsx - Main display
- /app/frontend/src/pages/AdminPanel.jsx - Admin config
- /app/frontend/src/components/WeatherBackground.jsx - Dynamic weather animations
- /app/frontend/src/components/WeatherSlide.jsx - Fullscreen weather
- /app/frontend/src/components/LocalAttractionsSlide.jsx - Attractions
- /app/frontend/src/components/EventsSlide.jsx - Events
- /app/backend/server.py - FastAPI backend
