import { useState, useEffect, useCallback, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MapPin, ArrowUp, ArrowDown, Droplets, Wind, Newspaper, Camera } from "lucide-react";
import axios from "axios";
import WeatherBackground, { getWeatherTheme } from "../components/WeatherBackground";
import WeatherSlide from "../components/WeatherSlide";
import LocalAttractionsSlide from "../components/LocalAttractionsSlide";
import EventsSlide from "../components/EventsSlide";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const SLIDE_TYPES = {
  PHOTO: 'photo',
  WEATHER: 'weather',
  ATTRACTIONS: 'attractions',
  EVENTS: 'events',
};

// Glass panel component
const GlassPanel = ({ children, className = "", theme = "sunny", ...props }) => {
  const getGlassStyle = () => {
    const baseStyle = "backdrop-blur-xl border border-white/20 shadow-2xl";
    switch (theme) {
      case "snow": return `${baseStyle} bg-white/30`;
      case "rain": case "storm": return `${baseStyle} bg-black/25`;
      case "night": return `${baseStyle} bg-black/20`;
      case "fog": return `${baseStyle} bg-white/20`;
      case "cloudy": return `${baseStyle} bg-white/15`;
      default: return `${baseStyle} bg-white/10`;
    }
  };
  return (
    <motion.div 
      className={`rounded-2xl ${getGlassStyle()} ${className}`}
      animate={{ boxShadow: ["0 8px 32px rgba(0,0,0,0.1)", "0 12px 40px rgba(0,0,0,0.15)", "0 8px 32px rgba(0,0,0,0.1)"] }}
      transition={{ duration: 4, repeat: Infinity }}
      {...props}
    >
      {children}
    </motion.div>
  );
};

// Clock
const LiveClock = ({ theme, size = "large" }) => {
  const [time, setTime] = useState(new Date());
  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);
  const hours = time.getHours();
  const minutes = time.getMinutes().toString().padStart(2, "0");
  const ampm = hours >= 12 ? "PM" : "AM";
  const displayHours = hours % 12 || 12;
  const isSnow = theme === "snow";
  const textColor = isSnow ? "text-slate-800" : "text-white";
  const mutedColor = isSnow ? "text-slate-600" : "text-white/70";

  const fontSize = size === "compact" ? "clamp(2rem, 5vw, 3.5rem)" : "clamp(3rem, 7vw, 5rem)";

  return (
    <div data-testid="live-clock">
      <motion.div 
        className={`font-light tracking-tight leading-none ${textColor}`}
        style={{ fontSize }}
        animate={{ opacity: [0.95, 1, 0.95] }}
        transition={{ duration: 2, repeat: Infinity }}
      >
        <span>{displayHours}</span>
        <motion.span animate={{ opacity: [1, 0.4, 1] }} transition={{ duration: 1, repeat: Infinity }}>:</motion.span>
        <span>{minutes}</span>
        <span className={`text-lg ml-2 ${mutedColor}`}>{ampm}</span>
      </motion.div>
    </div>
  );
};

// Date
const DateDisplay = ({ theme }) => {
  const [date, setDate] = useState(new Date());
  useEffect(() => {
    const timer = setInterval(() => setDate(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);
  const isSnow = theme === "snow";
  const textColor = isSnow ? "text-slate-700" : "text-white/80";
  const dateStr = date.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric", year: "numeric" });
  return (
    <motion.p 
      className={`text-sm font-light tracking-wider ${textColor} mt-1`}
      animate={{ opacity: [0.8, 1, 0.8] }}
      transition={{ duration: 4, repeat: Infinity }}
      data-testid="date-display"
    >
      {dateStr}
    </motion.p>
  );
};

// Compact Weather Widget for the info panel
const WeatherWidget = ({ weather, theme }) => {
  if (!weather) return null;
  const isSnow = theme === "snow";
  const textColor = isSnow ? "text-slate-800" : "text-white";
  const mutedColor = isSnow ? "text-slate-600" : "text-white/70";
  const iconUrl = `https://openweathermap.org/img/wn/${weather.icon || "02d"}@4x.png`;

  return (
    <GlassPanel theme={theme} className="p-4" data-testid="weather-widget">
      <div className="flex items-center gap-2 mb-2">
        <MapPin className={`w-3 h-3 ${mutedColor}`} />
        <span className={`text-xs ${mutedColor}`}>{weather.city}, Texas</span>
      </div>
      <div className="flex items-center gap-3">
        <motion.img
          src={iconUrl}
          alt={weather.condition}
          className="w-14 h-14"
          animate={{ y: [-2, 2, -2] }}
          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
        />
        <div>
          <div className="flex items-start">
            <span className={`text-3xl font-light ${textColor}`}>{Math.round(weather.temp)}</span>
            <span className={`text-sm ${mutedColor} mt-0.5`}>°F</span>
          </div>
          <p className={`text-xs ${mutedColor} capitalize`}>{weather.condition}</p>
        </div>
        <div className="ml-auto space-y-1">
          <div className="flex items-center gap-2 text-xs">
            <ArrowUp className="w-3 h-3 text-orange-400" />
            <span className={textColor}>{Math.round(weather.temp_max)}°</span>
            <ArrowDown className="w-3 h-3 text-blue-400" />
            <span className={textColor}>{Math.round(weather.temp_min)}°</span>
          </div>
          <div className="flex items-center gap-2 text-xs">
            <Droplets className="w-3 h-3 text-blue-300" />
            <span className={mutedColor}>{weather.humidity}%</span>
            <Wind className="w-3 h-3 text-cyan-300" />
            <span className={mutedColor}>{weather.wind_speed}mph</span>
          </div>
        </div>
      </div>
    </GlassPanel>
  );
};

// News Headline
const NewsHeadline = ({ headline, theme }) => {
  if (!headline) return null;
  const isSnow = theme === "snow";
  const textColor = isSnow ? "text-slate-800" : "text-white";
  const mutedColor = isSnow ? "text-slate-600" : "text-white/60";

  return (
    <GlassPanel theme={theme} className="p-3" data-testid="news-headline">
      <div className="flex items-start gap-2">
        <Newspaper className={`w-4 h-4 mt-0.5 flex-shrink-0 ${mutedColor}`} />
        <div className="min-w-0">
          <p className={`text-xs leading-relaxed ${textColor} line-clamp-2`}>{headline.title}</p>
          <p className={`text-xs ${mutedColor} mt-1`}>{headline.source}</p>
        </div>
      </div>
    </GlassPanel>
  );
};

// Empty state when no images uploaded
const EmptyPhotoState = ({ theme }) => (
  <div className="w-full h-full flex items-center justify-center" data-testid="empty-photo-state">
    <WeatherBackground condition="clear" icon="01d" />
    <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900" />
    <motion.div 
      className="relative z-10 text-center"
      initial={{ opacity: 0 }}
      animate={{ opacity: 0.3 }}
      transition={{ duration: 2 }}
    >
      <Camera className="w-16 h-16 text-white/20 mx-auto mb-4" />
      <p className="text-white/15 text-lg tracking-widest uppercase">Upload photos in admin panel</p>
    </motion.div>
  </div>
);

// Main Lobby Display
export default function LobbyDisplay() {
  const [settings, setSettings] = useState({
    hotel_name: "",
    city: "Clifton, Texas",
    photo_interval: 8,
    weather_slide_duration: 15,
    aspect_ratio: "16:9",
    display_orientation: "landscape",
    display_scale: 100,
    display_width: 16,
    display_height: 9,
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

  const currentTheme = useMemo(() => {
    if (!weather) return "sunny";
    return getWeatherTheme(weather.condition, weather.icon);
  }, [weather]);

  const fetchSettings = useCallback(async () => {
    try {
      const response = await axios.get(`${API}/settings`);
      setSettings(response.data);
    } catch (error) {
      console.error("Error fetching settings:", error);
    }
  }, []);

  const fetchImages = useCallback(async () => {
    try {
      const response = await axios.get(`${API}/images`);
      setImages(response.data);
    } catch (error) {
      console.error("Error fetching images:", error);
    }
  }, []);

  const fetchWeather = useCallback(async () => {
    try {
      const response = await axios.get(`${API}/weather/extended`);
      setWeather(response.data.current);
      setForecast(response.data.forecast || []);
    } catch (error) {
      try {
        const basicResponse = await axios.get(`${API}/weather`);
        setWeather(basicResponse.data);
      } catch (e) {
        console.error("Error fetching weather:", e);
      }
    }
  }, []);

  const fetchNews = useCallback(async () => {
    try {
      const response = await axios.get(`${API}/news`);
      setHeadlines(response.data);
    } catch (error) {
      console.error("Error fetching news:", error);
    }
  }, []);

  const fetchAttractions = useCallback(async () => {
    try {
      const response = await axios.get(`${API}/attractions`);
      setAttractions(response.data);
    } catch (error) {
      console.error("Error fetching attractions:", error);
    }
  }, []);

  const fetchLocalEvents = useCallback(async () => {
    try {
      const response = await axios.get(`${API}/events`, { params: { sort_by: "upcoming" } });
      setLocalEvents(response.data);
    } catch (error) {
      console.error("Error fetching events:", error);
    }
  }, []);

  useEffect(() => {
    fetchSettings();
    fetchImages();
    fetchWeather();
    fetchNews();
    fetchAttractions();
    fetchLocalEvents();
  }, [fetchSettings, fetchImages, fetchWeather, fetchNews]);

  // Build slides
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
      // No photos: only special slides
      newSlides.push({ type: SLIDE_TYPES.WEATHER, id: 'weather', duration: weatherDuration * 1000 });
      newSlides.push({ type: SLIDE_TYPES.ATTRACTIONS, id: 'attractions', duration: specialDuration * 1000 });
      newSlides.push({ type: SLIDE_TYPES.EVENTS, id: 'events', duration: specialDuration * 1000 });
    }

    setSlides(newSlides);
  }, [images, settings.photo_interval, settings.weather_slide_duration]);

  useEffect(() => {
    if (slides.length === 0) return;
    const currentSlideData = slides[currentSlideIndex];
    const duration = currentSlideData?.duration || 8000;
    const timer = setTimeout(() => {
      setCurrentSlideIndex((prev) => (prev + 1) % slides.length);
    }, duration);
    return () => clearTimeout(timer);
  }, [slides, currentSlideIndex]);

  useEffect(() => {
    if (headlines.length === 0) return;
    const interval = setInterval(() => {
      setCurrentHeadlineIndex((prev) => (prev + 1) % headlines.length);
    }, 15000);
    return () => clearInterval(interval);
  }, [headlines.length]);

  useEffect(() => {
    const interval = setInterval(fetchWeather, 10 * 60 * 1000);
    return () => clearInterval(interval);
  }, [fetchWeather]);

  useEffect(() => {
    const interval = setInterval(fetchNews, 30 * 60 * 1000);
    return () => clearInterval(interval);
  }, [fetchNews]);

  const currentSlide = slides[currentSlideIndex];
  const currentHeadline = headlines[currentHeadlineIndex];
  const currentTime = useMemo(() => new Date(), [currentSlideIndex]);

  const getImageUrl = (image) => {
    if (!image) return "";
    if (image.url.startsWith("http")) return image.url;
    return `${BACKEND_URL}${image.url}`;
  };

  const isPortrait = settings.display_orientation === "portrait";
  const scale = settings.display_scale / 100;
  const wScale = settings.widget_scale || 1;
  const isSnow = currentTheme === "snow";

  // =========================================
  // PHOTO SLIDE: Fullscreen photo with overlay widgets
  // =========================================
  const renderPhotoSlide = () => {
    const hasImage = currentSlide?.data;
    const padding = settings.widget_padding || 48;
    const gap = settings.widget_spacing || 16;
    const widgetStyle = { transform: `scale(${wScale})`, transformOrigin: 'bottom left' };
    const layout = settings.widget_layout || "bottom-left";

    return (
      <div className="w-full h-full relative" data-testid="photo-slide">
        {/* Animated weather background (behind photo) */}
        <WeatherBackground condition={weather?.condition} icon={weather?.icon} />

        {/* Fullscreen photo */}
        {hasImage ? (
          <motion.img
            src={getImageUrl(currentSlide.data)}
            alt="Hotel"
            className="absolute inset-0 w-full h-full object-cover z-[1]"
            initial={{ scale: 1.05 }}
            animate={{ scale: 1 }}
            transition={{ duration: 8, ease: "easeOut" }}
          />
        ) : (
          <EmptyPhotoState theme={currentTheme} />
        )}

        {/* Subtle gradient overlays for widget readability */}
        <div className="absolute inset-0 z-[2] pointer-events-none">
          <div className="absolute bottom-0 left-0 right-0 h-[45%] bg-gradient-to-t from-black/50 to-transparent" />
          <div className="absolute top-0 left-0 right-0 h-[25%] bg-gradient-to-b from-black/30 to-transparent" />
        </div>

        {/* Overlay widgets */}
        <div className="absolute inset-0 z-[3]" style={{ padding }}>
          {isPortrait ? (
            /* PORTRAIT overlay layout */
            <div className="h-full flex flex-col">
              {/* Top: Hotel name + clock centered */}
              <div className="text-center">
                {settings.hotel_name && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8 }}
                  >
                    <h1 className="text-2xl font-serif font-bold text-white tracking-widest uppercase drop-shadow-lg">
                      {settings.hotel_name}
                    </h1>
                  </motion.div>
                )}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.8, delay: 0.2 }}
                  className="mt-2"
                >
                  <LiveClock theme={currentTheme} size="compact" />
                  <DateDisplay theme={currentTheme} />
                </motion.div>
              </div>

              <div className="flex-1" />

              {/* Bottom: Weather + News stacked */}
              <div className="space-y-3" style={{ transform: `scale(${wScale})`, transformOrigin: 'bottom center' }}>
                <WeatherWidget weather={weather} theme={currentTheme} />
                <AnimatePresence mode="wait">
                  <motion.div
                    key={currentHeadlineIndex}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    transition={{ duration: 0.6 }}
                  >
                    <NewsHeadline headline={currentHeadline} theme={currentTheme} />
                  </motion.div>
                </AnimatePresence>
              </div>
            </div>
          ) : (
            /* LANDSCAPE overlay layout */
            <div className="h-full flex flex-col">
              {/* Top row: Hotel name (left) + Clock (right) */}
              <div className="flex justify-between items-start">
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.8 }}
                >
                  {settings.hotel_name && (
                    <div>
                      <h1 className="text-xl font-serif font-bold text-white tracking-[0.2em] uppercase drop-shadow-lg">
                        {settings.hotel_name}
                      </h1>
                      <p className="text-white/60 text-xs tracking-wider mt-0.5">Welcome</p>
                    </div>
                  )}
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.8 }}
                  className="text-right"
                >
                  <LiveClock theme={currentTheme} size="large" />
                  <DateDisplay theme={currentTheme} />
                </motion.div>
              </div>

              <div className="flex-1" />

              {/* Bottom row: Weather (left) + News (right) */}
              <div className="flex items-end justify-between" style={{ gap, transform: `scale(${wScale})`, transformOrigin: 'bottom left' }}>
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, delay: 0.2 }}
                  className="max-w-[45%]"
                >
                  <WeatherWidget weather={weather} theme={currentTheme} />
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, delay: 0.4 }}
                  className="max-w-[45%]"
                  style={{ transformOrigin: 'bottom right' }}
                >
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={currentHeadlineIndex}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -8 }}
                      transition={{ duration: 0.6 }}
                    >
                      <NewsHeadline headline={currentHeadline} theme={currentTheme} />
                    </motion.div>
                  </AnimatePresence>
                </motion.div>
              </div>
            </div>
          )}
        </div>
      </div>
    );
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
              renderPhotoSlide()
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Slide Indicators */}
      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 z-20 flex gap-2">
        {slides.map((slide, index) => (
          <motion.div
            key={slide.id}
            className={`h-1.5 rounded-full transition-all duration-500 ${
              index === currentSlideIndex 
                ? slide.type === SLIDE_TYPES.WEATHER ? 'bg-blue-400 w-10' 
                  : slide.type === SLIDE_TYPES.ATTRACTIONS ? 'bg-amber-400 w-10'
                  : slide.type === SLIDE_TYPES.EVENTS ? 'bg-orange-400 w-10'
                  : 'bg-white w-8' 
                : 'bg-white/40 w-1.5'
            }`}
            animate={index === currentSlideIndex ? { opacity: [0.8, 1, 0.8] } : {}}
            transition={{ duration: 2, repeat: Infinity }}
          />
        ))}
      </div>
    </div>
  );
}
