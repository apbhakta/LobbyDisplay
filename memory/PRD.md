# Hotel Lobby Display App - PRD

## Original Problem Statement
Build a fullscreen hotel lobby display app for a TV screen in landscape mode with:
- Live digital clock (HH:MM format)
- Current date and day
- Live weather from OpenWeatherMap
- One live news headline from NewsAPI.org
- Rotating hotel photo gallery (8-10 second intervals)
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
- [x] Fullscreen lobby display with rotating hero images
- [x] Large live clock with AM/PM indicator
- [x] Full date and weekday display
- [x] Weather widget with OpenWeatherMap integration (temp, high/low, condition, icon)
- [x] News headline rotation from NewsAPI.org (15 second local rotation)
- [x] Hotel name branding display
- [x] Admin panel with Settings and Images tabs
- [x] Hotel name/city configuration
- [x] News category selection (7 categories)
- [x] Timing settings (photo interval, weather/news refresh)
- [x] Image upload and management
- [x] Reset to default images functionality
- [x] Dark gradient overlay for text readability
- [x] Framer Motion crossfade animations
- [x] MongoDB persistence for settings and images
- [x] API caching with fallback support

## API Keys Configured
- OpenWeatherMap: c0ca4a039347f2b57a7a55902d27bddb
- NewsAPI.org: cb070f8c007f4ab396a629e24cd29c15

## Prioritized Backlog
### P0 (Critical) - DONE
- All core display features implemented

### P1 (High)
- [ ] Multiple language support
- [ ] Hotel logo upload

### P2 (Medium)
- [ ] Event/announcement overlay
- [ ] Scheduled content display
- [ ] Weather forecast (multi-day)

## Tech Stack
- Frontend: React 19, Tailwind CSS, Framer Motion, Shadcn UI
- Backend: FastAPI, Motor (MongoDB async)
- APIs: OpenWeatherMap, NewsAPI.org

## Next Tasks
- Add hotel logo upload functionality
- Consider event/announcement scheduling feature
