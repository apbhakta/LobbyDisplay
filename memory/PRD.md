# Hotel Lobby Display App - PRD

## Original Problem Statement
Build a fullscreen hotel lobby display app for a TV screen in landscape mode with:
- Live digital clock, date and day
- Live weather from OpenWeatherMap
- One live news headline from NewsAPI.org
- Rotating hotel photo gallery (8-10 second intervals)
- Weather dashboard and forecast slides
- **Local attractions slide for Clifton, TX**
- **Events slide for Clifton, TX (Norwegian Capital of Texas)**
- Admin panel for content management

## What's Been Implemented (March 28, 2026)

### Slide Types (9 Total)
1. **Photo Slides** (5) - Hotel images with clock, date, weather, news
2. **Weather Dashboard** - Teal gradient with gauge, hourly chart, highlights
3. **Weather Forecast** - Sky-blue with location card, 7-day forecast
4. **Local Attractions** - Blue gradient featuring 6 Clifton attractions
5. **Events** - Orange gradient with featured & community events

### Local Attractions Slide
- Bosque County Courthouse (1886 limestone historic building)
- Clifton Lutheran Church (Historic Rock Church, Norwegian heritage)
- Bosque Museum (Local history and culture)
- Meridian State Park (Lake, hiking, wildlife nearby)
- Norse Historic District (Norwegian architecture)
- Main Street Clifton (Antique shops, local eateries)

### Events Slide
**Featured Annual Events:**
- Bosque Art Classic (September) - National juried art show
- Clifton Rodeo & Parade (June) - Traditional cowboy events
- Bosque Tour de Norway (May) - Cycling event
- Norwegian Country Christmas Tour (December) - Historic sites tour

**Community Events:**
- FallFest & Fireworks on the Bosque
- Central Texas Youth Fair
- Trick or Treat with Main Street (October)
- Bosque County-Wide Garage Sale

### Slide Rotation Order
Photo → Photo → Weather Dashboard → Photo → Local Attractions → Photo → Weather Forecast → Photo → Events → (cycles)

### Backend APIs
- GET /api/settings, PUT /api/settings
- GET /api/images, POST /api/images, DELETE /api/images/{id}
- GET /api/weather, GET /api/weather/extended
- GET /api/news

### API Keys Configured
- OpenWeatherMap: c0ca4a039347f2b57a7a55902d27bddb
- NewsAPI.org: cb070f8c007f4ab396a629e24cd29c15

## Tech Stack
- Frontend: React 19, Tailwind CSS, Framer Motion, Shadcn UI
- Backend: FastAPI, Motor (MongoDB async)
- APIs: OpenWeatherMap, NewsAPI.org

## Prioritized Backlog
### P1 (High)
- [ ] Hotel logo upload
- [ ] Admin management for attractions/events content

### P2 (Medium)
- [ ] Custom announcement overlay
- [ ] Multi-language support
