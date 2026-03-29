import { useState, useEffect, useCallback, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import axios from "axios";
import { getWeatherTheme } from "../components/WeatherBackground";
import WeatherSlide from "../components/WeatherSlide";
import LocalAttractionsSlide from "../components/LocalAttractionsSlide";
import EventsSlide from "../components/EventsSlide";
import ContentSlide from "../components/ContentSlide";
import PhotoSlide from "../components/lobby/PhotoSlide";
import VideoSlide from "../components/lobby/VideoSlide";
import SlideIndicators from "../components/lobby/SlideIndicators";
import OverlayDisplay from "../components/lobby/OverlayDisplay";
import { LiveClock, DateDisplay } from "../components/lobby/ClockWidgets";
import { WeatherWidget, NewsHeadline } from "../components/lobby/InfoWidgets";
import { GlassPanel } from "../components/lobby/GlassPanel";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

// Corner-aware widget positioning: pins widget edges to nearest screen edge
const cornerStyle = (pos, extraPad = 14) => {
  const style = { padding: extraPad };
  if (pos.x <= 25) { style.left = 0; }
  else if (pos.x >= 75) { style.right = 0; }
  else { style.left = `${pos.x}%`; style.transform = 'translateX(-50%)'; }
  if (pos.y <= 25) { style.top = 0; }
  else if (pos.y >= 75) { style.bottom = 0; }
  else { style.top = `${pos.y}%`; style.transform = (style.transform || '') + ' translateY(-50%)'; }
  return style;
};

const SLIDE_TYPES = {
  PHOTO: 'photo',
  WEATHER: 'weather',
  ATTRACTIONS: 'attractions',
  EVENTS: 'events',
  VIDEO: 'video',
  CONTENT: 'content',
};

export default function LobbyDisplay() {
  const [settings, setSettings] = useState({
    hotel_name: "",
    city: "Clifton, Texas",
    photo_interval: 8,
    weather_slide_duration: 15,
    aspect_ratio: "3:4",
    display_orientation: "portrait",
    display_scale: 100,
    display_width: 7.5,
    display_height: 10,
    widget_layout: "bottom-left",
    widget_scale: 1,
    font_scale: 1,
    widget_padding: 48,
    widget_spacing: 16,
  });
  const [images, setImages] = useState([]);
  const [slides, setSlides] = useState([]);
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
  const [weather, setWeather] = useState(null);
  const [forecast, setForecast] = useState([]);
  const [headlines, setHeadlines] = useState([]);
  const [currentHeadlineIndex, setCurrentHeadlineIndex] = useState(0);
  const [attractions, setAttractions] = useState([]);
  const [localEvents, setLocalEvents] = useState([]);
  const [activeOverlays, setActiveOverlays] = useState([]);
  const [videos, setVideos] = useState([]);
  const [videoCycleCount, setVideoCycleCount] = useState(0);
  const [contentSections, setContentSections] = useState({});

  const currentTheme = useMemo(() => {
    if (!weather) return "sunny";
    return getWeatherTheme(weather.condition, weather.icon);
  }, [weather]);

  // Data fetchers
  const fetchSettings = useCallback(async () => {
    try { setSettings((await axios.get(`${API}/settings`)).data); } catch (e) { console.error("Settings fetch error:", e); }
  }, []);
  const fetchImages = useCallback(async () => {
    try { setImages((await axios.get(`${API}/images`)).data); } catch (e) { console.error("Images fetch error:", e); }
  }, []);
  const fetchWeather = useCallback(async () => {
    try {
      const r = await axios.get(`${API}/weather/extended`);
      setWeather(r.data.current);
      setForecast(r.data.forecast || []);
    } catch {
      try { setWeather((await axios.get(`${API}/weather`)).data); } catch (e) { console.error("Weather fetch error:", e); }
    }
  }, []);
  const fetchNews = useCallback(async () => {
    try { setHeadlines((await axios.get(`${API}/news`)).data); } catch (e) { console.error("News fetch error:", e); }
  }, []);
  const fetchAttractions = useCallback(async () => {
    try { setAttractions((await axios.get(`${API}/attractions`)).data); } catch (e) { console.error("Attractions fetch error:", e); }
  }, []);
  const fetchLocalEvents = useCallback(async () => {
    try { setLocalEvents((await axios.get(`${API}/events`, { params: { sort_by: "upcoming" } })).data); } catch (e) { console.error("Events fetch error:", e); }
  }, []);
  const fetchOverlays = useCallback(async () => {
    try { setActiveOverlays((await axios.get(`${API}/overlays/active`)).data); } catch (e) { console.error("Overlays fetch error:", e); }
  }, []);
  const fetchVideos = useCallback(async () => {
    try { setVideos((await axios.get(`${API}/videos`, { params: { active_only: true } })).data); } catch (e) { console.error("Videos fetch error:", e); }
  }, []);
  const fetchContent = useCallback(async () => {
    const types = ["announcement", "promotion", "welcome_message", "amenity", "emergency", "checkout_reminder"];
    const sections = {};
    for (const type of types) {
      try {
        const data = (await axios.get(`${API}/content/${type}`)).data;
        if (data.length > 0) sections[type] = data.filter(item => item.enabled);
      } catch (e) { /* skip */ }
    }
    setContentSections(sections);
  }, []);

  // Initial fetch
  useEffect(() => {
    fetchSettings(); fetchImages(); fetchWeather(); fetchNews(); fetchAttractions(); fetchLocalEvents(); fetchOverlays(); fetchVideos(); fetchContent();
  }, [fetchSettings, fetchImages, fetchWeather, fetchNews, fetchAttractions, fetchLocalEvents, fetchOverlays, fetchVideos, fetchContent]);

  // Build slide queue
  useEffect(() => {
    const newSlides = [];
    const photoInterval = settings.photo_interval || 8;
    const weatherDuration = settings.weather_slide_duration || 15;
    const specialDuration = 12;

    images.forEach((img, index) => {
      newSlides.push({ type: SLIDE_TYPES.PHOTO, data: img, id: `photo-${index}`, duration: photoInterval * 1000 });
    });

    if (newSlides.length >= 6) {
      newSlides.splice(2, 0, { type: SLIDE_TYPES.ATTRACTIONS, id: 'attractions', duration: specialDuration * 1000 });
      newSlides.splice(5, 0, { type: SLIDE_TYPES.WEATHER, id: 'weather', duration: weatherDuration * 1000 });
      if (newSlides.length > 7) {
        newSlides.splice(8, 0, { type: SLIDE_TYPES.EVENTS, id: 'events', duration: specialDuration * 1000 });
      } else {
        newSlides.push({ type: SLIDE_TYPES.EVENTS, id: 'events', duration: specialDuration * 1000 });
      }
    } else if (newSlides.length >= 1) {
      newSlides.push({ type: SLIDE_TYPES.ATTRACTIONS, id: 'attractions', duration: specialDuration * 1000 });
      newSlides.push({ type: SLIDE_TYPES.WEATHER, id: 'weather', duration: weatherDuration * 1000 });
      newSlides.push({ type: SLIDE_TYPES.EVENTS, id: 'events', duration: specialDuration * 1000 });
    } else {
      newSlides.push({ type: SLIDE_TYPES.WEATHER, id: 'weather', duration: weatherDuration * 1000 });
      newSlides.push({ type: SLIDE_TYPES.ATTRACTIONS, id: 'attractions', duration: specialDuration * 1000 });
      newSlides.push({ type: SLIDE_TYPES.EVENTS, id: 'events', duration: specialDuration * 1000 });
    }

    if (videos.length > 0) {
      const activeVids = videos.filter(v => {
        const freq = v.frequency || 1;
        return videoCycleCount % freq === 0;
      });
      activeVids.forEach((vid, i) => {
        const vidSlide = { type: SLIDE_TYPES.VIDEO, data: vid, id: `video-${vid.id}`, duration: 120 * 1000 };
        const insertAt = Math.min(3 + (i * 4), newSlides.length);
        newSlides.splice(insertAt, 0, vidSlide);
      });
    }

    const contentTypes = Object.keys(contentSections);
    contentTypes.forEach((type, i) => {
      const items = contentSections[type];
      if (items && items.length > 0) {
        const insertAt = Math.min(4 + (i * 3), newSlides.length);
        newSlides.splice(insertAt, 0, { type: SLIDE_TYPES.CONTENT, data: { items, sectionType: type }, id: `content-${type}`, duration: Math.max(8, items.length * 6) * 1000 });
      }
    });

    setSlides(newSlides);
  }, [images, videos, videoCycleCount, contentSections, settings.photo_interval, settings.weather_slide_duration]);

  const advanceSlide = useCallback(() => {
    setCurrentSlideIndex((prev) => {
      const next = (prev + 1) % slides.length;
      if (next === 0) setVideoCycleCount(c => c + 1);
      return next;
    });
  }, [slides.length]);

  // Slide auto-advance
  useEffect(() => {
    if (slides.length === 0) return;
    const current = slides[currentSlideIndex];
    if (current?.type === SLIDE_TYPES.VIDEO) return;
    const duration = current?.duration || 8000;
    const timer = setTimeout(() => advanceSlide(), duration);
    return () => clearTimeout(timer);
  }, [slides, currentSlideIndex, advanceSlide]);

  // Headline rotation
  useEffect(() => {
    if (headlines.length === 0) return;
    const interval = setInterval(() => setCurrentHeadlineIndex((prev) => (prev + 1) % headlines.length), 15000);
    return () => clearInterval(interval);
  }, [headlines.length]);

  // Periodic refreshes — settings refresh every 30s so admin changes appear on lobby
  useEffect(() => { const i = setInterval(fetchSettings, 30 * 1000); return () => clearInterval(i); }, [fetchSettings]);
  useEffect(() => { const i = setInterval(fetchWeather, 10 * 60 * 1000); return () => clearInterval(i); }, [fetchWeather]);
  useEffect(() => { const i = setInterval(fetchNews, 30 * 60 * 1000); return () => clearInterval(i); }, [fetchNews]);
  useEffect(() => { const i = setInterval(fetchOverlays, 60 * 1000); return () => clearInterval(i); }, [fetchOverlays]);

  const currentSlide = slides[currentSlideIndex];
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const currentTime = useMemo(() => new Date(), [currentSlideIndex]);
  const isPortrait = settings.display_orientation === "portrait";
  const scale = settings.display_scale / 100;

  // Compute aspect ratio CSS from settings
  const aspectRatio = (() => {
    const w = parseFloat(settings.display_width) || 7.5;
    const h = parseFloat(settings.display_height) || 10;
    return `${w} / ${h}`;
  })();

  const getImageUrl = (image) => {
    if (!image) return "";
    if (image.url.startsWith("http")) return image.url;
    return `${BACKEND_URL}${image.url}`;
  };

  // Widget visibility, colors, positions, glass
  const visibility = {
    logo: settings.widget_visibility?.logo !== false,
    clock: settings.widget_visibility?.clock !== false,
    weather: settings.widget_visibility?.weather !== false,
    news: settings.widget_visibility?.news !== false,
  };
  const colors = {
    clock: settings.widget_colors?.clock || "#ffffff",
    weather: settings.widget_colors?.weather || "#ffffff",
    news: settings.widget_colors?.news || "#ffffff",
  };
  const glass = settings.glass_effect !== false;
  const raw = settings.widget_positions || {};
  const positions = {
    logo: raw.logo || { x: 2, y: 2 },
    clock: raw.clock || raw.hotel_name || { x: 98, y: 2 },
    weather: raw.weather || { x: 2, y: 98 },
    news: raw.news || { x: 98, y: 98 },
  };
  const align = (pos) => pos.x >= 75 ? 'right' : pos.x <= 25 ? 'left' : 'center';
  const currentHeadline = headlines[currentHeadlineIndex];
  const pad = isPortrait ? 14 : 20;

  return (
    <div
      className="w-screen h-screen flex items-center justify-center overflow-hidden bg-black"
      data-testid="lobby-display"
    >
      {/* Aspect-ratio constrained container — matches admin setting */}
      <div
        className="relative overflow-hidden bg-slate-900"
        style={{
          aspectRatio,
          maxWidth: '100vw',
          maxHeight: '100vh',
          width: isPortrait ? 'auto' : '100vw',
          height: isPortrait ? '100vh' : 'auto',
          transform: scale !== 1 ? `scale(${scale})` : undefined,
          transformOrigin: 'center',
        }}
      >
        {/* Slide content */}
        <AnimatePresence mode="wait">
          {currentSlide && (
            <motion.div
              key={currentSlide.id}
              className="absolute inset-0"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 2, ease: "easeInOut" }}
            >
              {currentSlide.type === SLIDE_TYPES.WEATHER ? (
                <WeatherSlide weather={weather} forecast={forecast} currentTime={currentTime} isPortrait={isPortrait} />
              ) : currentSlide.type === SLIDE_TYPES.ATTRACTIONS ? (
                <LocalAttractionsSlide weather={weather} isPortrait={isPortrait} attractions={attractions} maxItems={settings.attractions_per_slide || 6} />
              ) : currentSlide.type === SLIDE_TYPES.EVENTS ? (
                <EventsSlide weather={weather} currentTime={currentTime} isPortrait={isPortrait} events={localEvents} maxItems={settings.events_per_slide || 8} />
              ) : currentSlide.type === SLIDE_TYPES.VIDEO ? (
                <VideoSlide video={currentSlide.data} onVideoEnd={advanceSlide} isPortrait={isPortrait} />
              ) : currentSlide.type === SLIDE_TYPES.CONTENT ? (
                <ContentSlide items={currentSlide.data.items} sectionType={currentSlide.data.sectionType} weather={weather} isPortrait={isPortrait} />
              ) : (
                <PhotoSlide
                  image={currentSlide.data}
                  weather={weather}
                  settings={settings}
                  currentTheme={currentTheme}
                  isPortrait={isPortrait}
                  headlines={headlines}
                  currentHeadlineIndex={currentHeadlineIndex}
                  getImageUrl={getImageUrl}
                />
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Gradient overlays for widget readability — visible on ALL slides */}
        <div className="absolute inset-0 z-[8] pointer-events-none">
          <div className="absolute top-0 left-0 right-0 h-[12%] bg-gradient-to-b from-black/40 to-transparent" />
          <div className="absolute bottom-0 left-0 right-0 h-[12%] bg-gradient-to-t from-black/40 to-transparent" />
        </div>

        {/* Persistent widget overlays — visible on ALL slides, all 4 corners */}
        <div className="absolute inset-0 z-[9] pointer-events-none" style={{ padding: pad }}>
          {/* TOP-LEFT: Logo */}
          {visibility.logo && settings.logo_url && (
            <motion.div
              className="absolute"
              style={cornerStyle(positions.logo, 0)}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.8 }}
            >
              {glass ? (
                <GlassPanel className="p-2">
                  <img src={settings.logo_url} alt="Logo" className="h-10 w-auto max-w-[110px] object-contain" />
                </GlassPanel>
              ) : (
                <img src={settings.logo_url} alt="Logo" className="h-12 w-auto max-w-[120px] object-contain drop-shadow-lg" style={{ filter: 'drop-shadow(0 2px 8px rgba(0,0,0,0.5))' }} />
              )}
            </motion.div>
          )}

          {/* TOP-RIGHT: Clock */}
          {visibility.clock && (
            <motion.div
              className="absolute"
              style={{ ...cornerStyle(positions.clock, 0), textAlign: align(positions.clock) }}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.1 }}
            >
              <LiveClock theme={currentTheme} size={isPortrait ? "compact" : "large"} format={settings.clock_format || "12h"} clockStyle={settings.clock_style || "digital"} fontStyle={settings.font_style || "modern"} color={colors.clock} glass={glass} />
              <DateDisplay theme={currentTheme} fontStyle={settings.font_style || "modern"} color={colors.clock} />
            </motion.div>
          )}

          {/* BOTTOM-LEFT: Weather */}
          {visibility.weather && (
            <motion.div
              className="absolute"
              style={{ ...cornerStyle(positions.weather, 0), maxWidth: isPortrait ? '60%' : '38%' }}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
            >
              <WeatherWidget weather={weather} theme={currentTheme} color={colors.weather} glass={glass} />
            </motion.div>
          )}

          {/* BOTTOM-RIGHT: News */}
          {visibility.news && (
            <motion.div
              className="absolute"
              style={{ ...cornerStyle(positions.news, 0), maxWidth: isPortrait ? '60%' : '38%', textAlign: align(positions.news) }}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
            >
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentHeadlineIndex}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.6 }}
                >
                  <NewsHeadline headline={currentHeadline} theme={currentTheme} color={colors.news} glass={glass} />
                </motion.div>
              </AnimatePresence>
            </motion.div>
          )}
        </div>

        <SlideIndicators slides={slides} currentSlideIndex={currentSlideIndex} />
        <OverlayDisplay overlays={activeOverlays} />
      </div>
    </div>
  );
}
