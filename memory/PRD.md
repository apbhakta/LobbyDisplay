# Hotel Lobby Display App - PRD

## Original Problem Statement
Build a fullscreen hotel lobby display app for a TV screen in landscape mode with:
- Live digital clock (HH:MM format)
- Current date and day
- Live weather from OpenWeatherMap
- One live news headline from NewsAPI.org
- Rotating hotel photo gallery (8-10 second intervals)
- **Two dedicated weather slides** (dashboard + forecast)
- Admin panel for content management
- Fallback content for API failures

## User Personas
1. **Hotel Guest** - Views the lobby display for time, weather, and news
2. **Hotel Admin** - Manages display settings, images, and content via admin panel

## Core Requirements (Static)
- Fullscreen 16:9 TV display
- Premium, elegant dark theme
- Playfair Display + Outfit fonts
- Smooth image transitions (Framer Motion)
- Live data updates (clock every second, weather 15 min, news 30 min)
- Robust fallback for API failures

## What's Been Implemented (March 28, 2026)

### Phase 1 - Core Display
- [x] Fullscreen lobby display with rotating hero images
- [x] Large live clock with AM/PM indicator
- [x] Full date and weekday display
- [x] Weather widget with OpenWeatherMap integration
- [x] News headline rotation from NewsAPI.org
- [x] Hotel name branding display
- [x] Framer Motion crossfade animations
- [x] Slide indicator dots at bottom

### Phase 2 - Weather Slides (Added)
- [x] **Weather Dashboard Slide** (Teal gradient)
  - Temperature gauge with color gradient
  - Current temperature large display
  - Weather condition and icon
  - Date/Time display
  - High/Low temperature card (orange gradient)
  - Hourly forecast bar chart (8 hours)
  - Highlights section with 6 cards:
    - UV Index with circular gauge
    - Wind Status
    - Sunrise & Sunset times
    - Humidity percentage
    - Visibility distance
    - Air Quality index
    
- [x] **Weather Forecast Slide** (Sky-blue gradient)
  - Location card with city name and weather icon
  - Current condition text
  - Large temperature display (+39°F style)
  - Lowest/Highest temperatures
  - 7-day forecast row with:
    - Day abbreviation
    - Weather icon
    - Min/Max temperatures
  - Decorative cloud waves at bottom

### Admin Panel
- [x] Hotel name/city configuration
- [x] News category selection (7 categories)
- [x] Timing settings (photo interval, weather/news refresh)
- [x] Image upload and management
- [x] Reset to default images functionality

### Backend APIs
- [x] GET /api/settings - Hotel settings
- [x] PUT /api/settings - Update settings
- [x] GET /api/images - List images
- [x] POST /api/images - Upload image
- [x] DELETE /api/images/{id} - Delete image
- [x] GET /api/weather - Current weather
- [x] GET /api/weather/extended - Weather + forecast + hourly
- [x] GET /api/news - News headlines

## API Keys Configured
- OpenWeatherMap: c0ca4a039347f2b57a7a55902d27bddb
- NewsAPI.org: cb070f8c007f4ab396a629e24cd29c15

## Slide Rotation Order
1. Photo Slide 1
2. Photo Slide 2
3. **Weather Dashboard Slide**
4. Photo Slide 3
5. Photo Slide 4
6. **Weather Forecast Slide**
7. Photo Slide 5
(cycles back to 1)

## Prioritized Backlog
### P0 (Critical) - DONE
- All core display features implemented
- Both weather slides implemented

### P1 (High)
- [ ] Hotel logo upload
- [ ] Multiple language support

### P2 (Medium)
- [ ] Event/announcement overlay
- [ ] Scheduled content display
- [ ] QR code for hotel info

## Tech Stack
- Frontend: React 19, Tailwind CSS, Framer Motion, Shadcn UI
- Backend: FastAPI, Motor (MongoDB async)
- APIs: OpenWeatherMap, NewsAPI.org

## Next Tasks
- Add hotel logo upload functionality
- Consider event/announcement scheduling feature
