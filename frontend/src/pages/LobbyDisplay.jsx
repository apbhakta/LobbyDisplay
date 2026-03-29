import { useState, useEffect, useCallback, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import axios from "axios";
import { getWeatherTheme } from "../components/WeatherBackground";
import WeatherSlide from "../components/WeatherSlide";
import LocalAttractionsSlide from "../components/LocalAttractionsSlide";
import EventsSlide from "../components/EventsSlide";
import PhotoSlide from "../components/lobby/PhotoSlide";
import VideoSlide from "../components/lobby/VideoSlide";
import SlideIndicators from "../components/lobby/SlideIndicators";
import OverlayDisplay from "../components/lobby/OverlayDisplay";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

// Small hotel logo overlay — shown on every slide
const LogoOverlay = ({ logoUrl }) => {
  if (!logoUrl) return null;
  return (
    <div className="absolute top-4 left-4 z-[10]" data-testid="hotel-logo-overlay">
      <img
        src={logoUrl}
        alt="Hotel Logo"
        className="h-12 w-auto max-w-[120px] object-contain drop-shadow-lg"
        style={{ filter: 'drop-shadow(0 2px 8px rgba(0,0,0,0.5))' }}
      />
    </div>
  );
};

const SLIDE_TYPES = {
  PHOTO: 'photo',
  WEATHER: 'weather',
  ATTRACTIONS: 'attractions',
  EVENTS: 'events',
  VIDEO: 'video',
};

export default function LobbyDisplay() {
  const [settings, setSettings] = useState({
    hotel_name: "",
    city: "Clifton, Texas",
    photo_interval: 8,
    weather_slide_duration: 15,
    aspect_ratio: "4:3",
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

  // Initial fetch
  useEffect(() => {
    fetchSettings(); fetchImages(); fetchWeather(); fetchNews(); fetchAttractions(); fetchLocalEvents(); fetchOverlays(); fetchVideos();
  }, [fetchSettings, fetchImages, fetchWeather, fetchNews, fetchAttractions, fetchLocalEvents, fetchOverlays, fetchVideos]);

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

    // Insert active videos based on frequency and cycle count
    if (videos.length > 0) {
      const activeVids = videos.filter(v => {
        const freq = v.frequency || 1;
        return videoCycleCount % freq === 0;
      });
      activeVids.forEach((vid, i) => {
        // Use 120s max duration — video onEnded will advance sooner
        const vidSlide = { type: SLIDE_TYPES.VIDEO, data: vid, id: `video-${vid.id}`, duration: 120 * 1000 };
        // Insert videos spread throughout the slideshow
        const insertAt = Math.min(3 + (i * 4), newSlides.length);
        newSlides.splice(insertAt, 0, vidSlide);
      });
    }

    setSlides(newSlides);
  }, [images, videos, videoCycleCount, settings.photo_interval, settings.weather_slide_duration]);

  // Slide auto-advance (skip timer for video slides — they advance on video end)
  useEffect(() => {
    if (slides.length === 0) return;
    const current = slides[currentSlideIndex];
    if (current?.type === SLIDE_TYPES.VIDEO) return; // video handles its own advance
    const duration = current?.duration || 8000;
    const timer = setTimeout(() => advanceSlide(), duration);
    return () => clearTimeout(timer);
  }, [slides, currentSlideIndex]);

  const advanceSlide = useCallback(() => {
    setCurrentSlideIndex((prev) => {
      const next = (prev + 1) % slides.length;
      // Increment cycle count when we loop back to start
      if (next === 0) setVideoCycleCount(c => c + 1);
      return next;
    });
  }, [slides.length]);

  // Headline rotation
  useEffect(() => {
    if (headlines.length === 0) return;
    const interval = setInterval(() => setCurrentHeadlineIndex((prev) => (prev + 1) % headlines.length), 15000);
    return () => clearInterval(interval);
  }, [headlines.length]);

  // Periodic refreshes
  useEffect(() => { const i = setInterval(fetchWeather, 10 * 60 * 1000); return () => clearInterval(i); }, [fetchWeather]);
  useEffect(() => { const i = setInterval(fetchNews, 30 * 60 * 1000); return () => clearInterval(i); }, [fetchNews]);
  useEffect(() => { const i = setInterval(fetchOverlays, 60 * 1000); return () => clearInterval(i); }, [fetchOverlays]);

  const currentSlide = slides[currentSlideIndex];
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const currentTime = useMemo(() => new Date(), [currentSlideIndex]);
  const isPortrait = settings.display_orientation === "portrait";
  const scale = settings.display_scale / 100;

  const getImageUrl = (image) => {
    if (!image) return "";
    if (image.url.startsWith("http")) return image.url;
    return `${BACKEND_URL}${image.url}`;
  };

  return (
    <div
      className="lobby-display w-screen h-screen overflow-hidden relative bg-slate-900"
      style={{ transform: `scale(${scale})`, transformOrigin: 'center' }}
      data-testid="lobby-display"
    >
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

      <LogoOverlay logoUrl={settings.logo_url} />
      <SlideIndicators slides={slides} currentSlideIndex={currentSlideIndex} />
      <OverlayDisplay overlays={activeOverlays} />
    </div>
  );
}
