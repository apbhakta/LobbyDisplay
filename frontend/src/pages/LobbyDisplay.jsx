import { useState, useEffect, useCallback, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import axios from "axios";
import { getWeatherTheme } from "../components/WeatherBackground";
import WeatherSlide from "../components/WeatherSlide";
import LocalAttractionsSlide from "../components/LocalAttractionsSlide";
import EventsSlide from "../components/EventsSlide";
import PhotoSlide from "../components/lobby/PhotoSlide";
import SlideIndicators from "../components/lobby/SlideIndicators";
import OverlayDisplay from "../components/lobby/OverlayDisplay";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const SLIDE_TYPES = {
  PHOTO: 'photo',
  WEATHER: 'weather',
  ATTRACTIONS: 'attractions',
  EVENTS: 'events',
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

  // Initial fetch
  useEffect(() => {
    fetchSettings(); fetchImages(); fetchWeather(); fetchNews(); fetchAttractions(); fetchLocalEvents(); fetchOverlays();
  }, [fetchSettings, fetchImages, fetchWeather, fetchNews, fetchAttractions, fetchLocalEvents, fetchOverlays]);

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
    setSlides(newSlides);
  }, [images, settings.photo_interval, settings.weather_slide_duration]);

  // Slide auto-advance
  useEffect(() => {
    if (slides.length === 0) return;
    const duration = slides[currentSlideIndex]?.duration || 8000;
    const timer = setTimeout(() => setCurrentSlideIndex((prev) => (prev + 1) % slides.length), duration);
    return () => clearTimeout(timer);
  }, [slides, currentSlideIndex]);

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

      <SlideIndicators slides={slides} currentSlideIndex={currentSlideIndex} />
      <OverlayDisplay overlays={activeOverlays} />
    </div>
  );
}
