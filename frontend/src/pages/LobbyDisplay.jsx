import { useState, useEffect, useCallback, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MapPin, ArrowUp, ArrowDown, Droplets, Wind, Newspaper } from "lucide-react";
import axios from "axios";
import WeatherBackground, { getWeatherTheme } from "../components/WeatherBackground";
import WeatherSlide from "../components/WeatherSlide";
import LocalAttractionsSlide from "../components/LocalAttractionsSlide";
import EventsSlide from "../components/EventsSlide";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

// Slide types
const SLIDE_TYPES = {
  PHOTO: 'photo',
  WEATHER: 'weather',
  ATTRACTIONS: 'attractions',
  EVENTS: 'events',
};

// Glass panel component with weather-reactive styling
const GlassPanel = ({ children, className = "", theme = "sunny" }) => {
  const getGlassStyle = () => {
    const baseStyle = "backdrop-blur-xl border border-white/20 shadow-2xl";
    switch (theme) {
      case "sunny":
        return `${baseStyle} bg-white/10`;
      case "night":
        return `${baseStyle} bg-black/20`;
      case "rain":
      case "storm":
        return `${baseStyle} bg-black/25`;
      case "snow":
        return `${baseStyle} bg-white/30`;
      case "fog":
        return `${baseStyle} bg-white/20`;
      case "cloudy":
        return `${baseStyle} bg-white/15`;
      default:
        return `${baseStyle} bg-white/10`;
    }
  };

  return (
    <motion.div 
      className={`rounded-2xl ${getGlassStyle()} ${className}`}
      animate={{ 
        boxShadow: [
          "0 8px 32px rgba(0,0,0,0.1)",
          "0 12px 40px rgba(0,0,0,0.15)",
          "0 8px 32px rgba(0,0,0,0.1)"
        ]
      }}
      transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
    >
      {children}
    </motion.div>
  );
};

// Animated Clock Component
const LiveClock = ({ theme, isPortrait }) => {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const hours = time.getHours();
  const minutes = time.getMinutes().toString().padStart(2, "0");
  const seconds = time.getSeconds().toString().padStart(2, "0");
  const ampm = hours >= 12 ? "PM" : "AM";
  const displayHours = hours % 12 || 12;

  const isSnow = theme === "snow";
  const textColor = isSnow ? "text-slate-800" : "text-white";
  const mutedColor = isSnow ? "text-slate-600" : "text-white/70";

  return (
    <div className={isPortrait ? "text-center" : "text-right"}>
      <motion.div 
        className={`font-light tracking-tight leading-none ${textColor}`}
        style={{ fontSize: isPortrait ? "clamp(3rem, 8vw, 5rem)" : "clamp(4rem, 10vw, 8rem)" }}
        animate={{ opacity: [0.95, 1, 0.95] }}
        transition={{ duration: 2, repeat: Infinity }}
      >
        <span>{displayHours}</span>
        <motion.span 
          animate={{ opacity: [1, 0.4, 1] }}
          transition={{ duration: 1, repeat: Infinity }}
        >
          :
        </motion.span>
        <span>{minutes}</span>
        <span className={`${isPortrait ? 'text-2xl' : 'text-3xl md:text-4xl'} ml-2 opacity-60`}>{seconds}</span>
        <span className={`${isPortrait ? 'text-xl' : 'text-2xl md:text-3xl'} ml-3 ${mutedColor}`}>{ampm}</span>
      </motion.div>
    </div>
  );
};

// Date Display
const DateDisplay = ({ theme, isPortrait }) => {
  const [date, setDate] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setDate(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

  const isSnow = theme === "snow";
  const textColor = isSnow ? "text-slate-700" : "text-white/80";

  const dateStr = date.toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric"
  });

  return (
    <motion.p 
      className={`${isPortrait ? 'text-lg' : 'text-xl md:text-2xl'} font-light tracking-wider ${textColor} ${isPortrait ? 'text-center' : 'text-right'} mt-2`}
      animate={{ opacity: [0.8, 1, 0.8] }}
      transition={{ duration: 4, repeat: Infinity }}
    >
      {dateStr}
    </motion.p>
  );
};

// Weather Widget
const WeatherWidget = ({ weather, theme, isPortrait }) => {
  if (!weather) return null;

  const isSnow = theme === "snow";
  const textColor = isSnow ? "text-slate-800" : "text-white";
  const mutedColor = isSnow ? "text-slate-600" : "text-white/70";
  const iconUrl = `https://openweathermap.org/img/wn/${weather.icon || "02d"}@4x.png`;

  return (
    <GlassPanel theme={theme} className={isPortrait ? "p-4 md:p-5" : "p-6 md:p-8"}>
      {/* Location */}
      <div className="flex items-center gap-2 mb-3">
        <MapPin className={`w-4 h-4 ${mutedColor}`} />
        <span className={`text-base ${mutedColor}`}>{weather.city}, Texas</span>
      </div>

      <div className={`flex items-center ${isPortrait ? 'gap-4' : 'gap-6'}`}>
        {/* Weather Icon */}
        <motion.img
          src={iconUrl}
          alt={weather.condition}
          className={isPortrait ? "w-16 h-16 md:w-20 md:h-20" : "w-24 h-24 md:w-32 md:h-32"}
          animate={{ y: [-3, 3, -3] }}
          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
        />

        {/* Temperature */}
        <div>
          <div className="flex items-start">
            <motion.span 
              className={`${isPortrait ? 'text-4xl md:text-5xl' : 'text-6xl md:text-7xl'} font-light ${textColor}`}
              animate={{ opacity: [0.9, 1, 0.9] }}
              transition={{ duration: 3, repeat: Infinity }}
            >
              {Math.round(weather.temp)}
            </motion.span>
            <span className={`${isPortrait ? 'text-xl' : 'text-3xl'} ${mutedColor} mt-1`}>°F</span>
          </div>
          <p className={`text-base ${mutedColor} capitalize mt-1`}>{weather.condition}</p>
        </div>

        {/* Details */}
        <div className="ml-4 space-y-2">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1">
              <ArrowUp className="w-4 h-4 text-orange-400" />
              <span className={textColor}>{Math.round(weather.temp_max)}°</span>
            </div>
            <div className="flex items-center gap-1">
              <ArrowDown className="w-4 h-4 text-blue-400" />
              <span className={textColor}>{Math.round(weather.temp_min)}°</span>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1">
              <Droplets className="w-4 h-4 text-blue-300" />
              <span className={mutedColor}>{weather.humidity}%</span>
            </div>
            <div className="flex items-center gap-1">
              <Wind className="w-4 h-4 text-cyan-300" />
              <span className={mutedColor}>{weather.wind_speed} mph</span>
            </div>
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
    <GlassPanel theme={theme} className="p-4 md:p-5">
      <div className="flex items-start gap-3">
        <div className="p-2 rounded-lg bg-white/10">
          <Newspaper className={`w-5 h-5 ${mutedColor}`} />
        </div>
        <div className="flex-1">
          <motion.p 
            className={`text-base md:text-lg leading-relaxed ${textColor}`}
            animate={{ opacity: [0.9, 1, 0.9] }}
            transition={{ duration: 4, repeat: Infinity }}
          >
            {headline.title}
          </motion.p>
          <p className={`text-sm ${mutedColor} mt-1`}>{headline.source}</p>
        </div>
      </div>
    </GlassPanel>
  );
};

// Main Lobby Display
export default function LobbyDisplay() {
  const [settings, setSettings] = useState({
    hotel_name: "Velkommen Inn",
    city: "Clifton, Texas",
    photo_interval: 8,
    weather_slide_duration: 15,
    aspect_ratio: "16:9",
    display_orientation: "landscape",
    display_scale: 100,
    display_width: 16,
    display_height: 9,
  });
  const [images, setImages] = useState([]);
  const [slides, setSlides] = useState([]);
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
  const [weather, setWeather] = useState(null);
  const [forecast, setForecast] = useState([]);
  const [headlines, setHeadlines] = useState([]);
  const [currentHeadlineIndex, setCurrentHeadlineIndex] = useState(0);
  const [attractions, setAttractions] = useState([]);

  // Get current theme
  const currentTheme = useMemo(() => {
    if (!weather) return "sunny";
    return getWeatherTheme(weather.condition, weather.icon);
  }, [weather]);

  // Fetch functions
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
      console.error("Error fetching weather:", error);
      // Fallback to basic weather
      try {
        const basicResponse = await axios.get(`${API}/weather`);
        setWeather(basicResponse.data);
      } catch (e) {
        console.error("Error fetching basic weather:", e);
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

  // Initialize
  useEffect(() => {
    fetchSettings();
    fetchImages();
    fetchWeather();
    fetchNews();
    fetchAttractions();
  }, [fetchSettings, fetchImages, fetchWeather, fetchNews]);

  // Build slides array
  useEffect(() => {
    const newSlides = [];
    const photoInterval = settings.photo_interval || 8;
    const weatherDuration = settings.weather_slide_duration || 15;
    const specialDuration = 12; // seconds for attractions/events slides
    
    // Add photo slides
    images.forEach((img, index) => {
      newSlides.push({ 
        type: SLIDE_TYPES.PHOTO, 
        data: img, 
        id: `photo-${index}`,
        duration: photoInterval * 1000
      });
    });
    
    // Insert special slides into the rotation
    // Pattern: photos → attractions → photos → weather → photos → events
    if (newSlides.length >= 6) {
      // After 2nd photo: attractions
      newSlides.splice(2, 0, { 
        type: SLIDE_TYPES.ATTRACTIONS, 
        id: 'attractions',
        duration: specialDuration * 1000
      });
      // After 5th item (3 photos + attractions + 1 photo): weather
      newSlides.splice(5, 0, { 
        type: SLIDE_TYPES.WEATHER, 
        id: 'weather',
        duration: weatherDuration * 1000
      });
      // After 8th item: events
      if (newSlides.length > 7) {
        newSlides.splice(8, 0, { 
          type: SLIDE_TYPES.EVENTS, 
          id: 'events',
          duration: specialDuration * 1000
        });
      } else {
        newSlides.push({ 
          type: SLIDE_TYPES.EVENTS, 
          id: 'events',
          duration: specialDuration * 1000
        });
      }
    } else if (newSlides.length >= 3) {
      newSlides.splice(2, 0, { 
        type: SLIDE_TYPES.ATTRACTIONS, 
        id: 'attractions',
        duration: specialDuration * 1000
      });
      newSlides.push({ 
        type: SLIDE_TYPES.WEATHER, 
        id: 'weather',
        duration: weatherDuration * 1000
      });
      newSlides.push({ 
        type: SLIDE_TYPES.EVENTS, 
        id: 'events',
        duration: specialDuration * 1000
      });
    } else {
      // Few or no photos — add all special slides
      newSlides.push({ 
        type: SLIDE_TYPES.ATTRACTIONS, 
        id: 'attractions',
        duration: specialDuration * 1000
      });
      newSlides.push({ 
        type: SLIDE_TYPES.WEATHER, 
        id: 'weather',
        duration: weatherDuration * 1000
      });
      newSlides.push({ 
        type: SLIDE_TYPES.EVENTS, 
        id: 'events',
        duration: specialDuration * 1000
      });
    }
    
    setSlides(newSlides);
  }, [images, settings.photo_interval, settings.weather_slide_duration]);

  // Rotate slides with variable duration
  useEffect(() => {
    if (slides.length === 0) return;
    
    const currentSlideData = slides[currentSlideIndex];
    const duration = currentSlideData?.duration || 8000;
    
    const timer = setTimeout(() => {
      setCurrentSlideIndex((prev) => (prev + 1) % slides.length);
    }, duration);
    
    return () => clearTimeout(timer);
  }, [slides, currentSlideIndex]);

  // Rotate headlines
  useEffect(() => {
    if (headlines.length === 0) return;
    const interval = setInterval(() => {
      setCurrentHeadlineIndex((prev) => (prev + 1) % headlines.length);
    }, 15000);
    return () => clearInterval(interval);
  }, [headlines.length]);

  // Refresh weather every 10 minutes
  useEffect(() => {
    const interval = setInterval(fetchWeather, 10 * 60 * 1000);
    return () => clearInterval(interval);
  }, [fetchWeather]);

  // Refresh news every 30 minutes
  useEffect(() => {
    const interval = setInterval(fetchNews, 30 * 60 * 1000);
    return () => clearInterval(interval);
  }, [fetchNews]);

  const currentSlide = slides[currentSlideIndex];
  const currentHeadline = headlines[currentHeadlineIndex];
  const currentTime = useMemo(() => new Date(), [currentSlideIndex]); // Update on slide change

  const getImageUrl = (image) => {
    if (!image) return "";
    if (image.url.startsWith("http")) return image.url;
    return `${BACKEND_URL}${image.url}`;
  };

  // Display settings
  const isPortrait = settings.display_orientation === "portrait";
  const scale = settings.display_scale / 100;

  const isSnow = currentTheme === "snow";
  const textColor = isSnow ? "text-slate-800" : "text-white";

  return (
    <div 
      className="lobby-display w-screen h-screen overflow-hidden relative"
      style={{ transform: `scale(${scale})`, transformOrigin: 'center' }}
      data-testid="lobby-display"
    >
      {/* Slide Content */}
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
              <WeatherSlide 
                weather={weather} 
                forecast={forecast}
                currentTime={currentTime}
                isPortrait={isPortrait}
              />
            ) : currentSlide.type === SLIDE_TYPES.ATTRACTIONS ? (
              <LocalAttractionsSlide 
                weather={weather} 
                isPortrait={isPortrait} 
                attractions={attractions}
                maxItems={settings.attractions_per_slide || 6}
              />
            ) : currentSlide.type === SLIDE_TYPES.EVENTS ? (
              <EventsSlide weather={weather} currentTime={currentTime} isPortrait={isPortrait} />
            ) : (
              /* Photo Slide */
              <>
                <WeatherBackground 
                  condition={weather?.condition} 
                  icon={weather?.icon} 
                />
                <div className="absolute inset-0">
                  <img
                    src={getImageUrl(currentSlide.data)}
                    alt="Hotel"
                    className="w-full h-full object-cover"
                  />
                  <div 
                    className="absolute inset-0"
                    style={{
                      background: isPortrait
                        ? "linear-gradient(to bottom, rgba(0,0,0,0.45) 0%, rgba(0,0,0,0.1) 25%, rgba(0,0,0,0.1) 55%, rgba(0,0,0,0.55) 100%)"
                        : "linear-gradient(to bottom, rgba(0,0,0,0.3) 0%, rgba(0,0,0,0.1) 30%, rgba(0,0,0,0.1) 70%, rgba(0,0,0,0.5) 100%)"
                    }}
                  />
                </div>

                {/* Content Layer */}
                <div className={`absolute inset-0 z-10 flex flex-col ${isPortrait ? 'p-6 md:p-8' : 'p-8 md:p-12 lg:p-16'}`}>
                  {isPortrait ? (
                    /* Portrait Layout */
                    <>
                      {/* Top - Hotel Name centered */}
                      <motion.div
                        className="text-center"
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 1 }}
                      >
                        <h1 className={`text-2xl md:text-3xl font-light tracking-widest uppercase ${textColor}`}>
                          {settings.hotel_name}
                        </h1>
                        <p className={`text-base ${isSnow ? "text-slate-600" : "text-white/60"} mt-1`}>
                          Welcome
                        </p>
                      </motion.div>

                      {/* Clock centered */}
                      <motion.div
                        className="text-center mt-4"
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 1, delay: 0.2 }}
                      >
                        <LiveClock theme={currentTheme} isPortrait />
                        <DateDisplay theme={currentTheme} isPortrait />
                      </motion.div>

                      <div className="flex-1" />

                      {/* Bottom - Weather full width */}
                      <motion.div
                        className="mb-3"
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 1, delay: 0.4 }}
                      >
                        <WeatherWidget weather={weather} theme={currentTheme} isPortrait />
                      </motion.div>

                      {/* News full width */}
                      <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 1, delay: 0.6 }}
                      >
                        <AnimatePresence mode="wait">
                          <motion.div
                            key={currentHeadlineIndex}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            transition={{ duration: 0.8 }}
                          >
                            <NewsHeadline headline={currentHeadline} theme={currentTheme} />
                          </motion.div>
                        </AnimatePresence>
                      </motion.div>
                    </>
                  ) : (
                    /* Landscape Layout */
                    <>
                      <div className="flex justify-between items-start">
                        <motion.div
                          initial={{ opacity: 0, y: -20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 1 }}
                        >
                          <h1 className={`text-3xl md:text-4xl font-light tracking-widest uppercase ${textColor}`}>
                            {settings.hotel_name}
                          </h1>
                          <p className={`text-lg ${isSnow ? "text-slate-600" : "text-white/60"} mt-1`}>
                            Welcome
                          </p>
                        </motion.div>
                        <motion.div
                          initial={{ opacity: 0, y: -20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 1, delay: 0.2 }}
                        >
                          <LiveClock theme={currentTheme} />
                          <DateDisplay theme={currentTheme} />
                        </motion.div>
                      </div>
                      <div className="flex-1" />
                      <div className="flex justify-between items-end gap-8">
                        <motion.div
                          initial={{ opacity: 0, x: -30 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ duration: 1, delay: 0.4 }}
                        >
                          <WeatherWidget weather={weather} theme={currentTheme} />
                        </motion.div>
                        <motion.div
                          className="max-w-lg"
                          initial={{ opacity: 0, x: 30 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ duration: 1, delay: 0.6 }}
                        >
                          <AnimatePresence mode="wait">
                            <motion.div
                              key={currentHeadlineIndex}
                              initial={{ opacity: 0, y: 10 }}
                              animate={{ opacity: 1, y: 0 }}
                              exit={{ opacity: 0, y: -10 }}
                              transition={{ duration: 0.8 }}
                            >
                              <NewsHeadline headline={currentHeadline} theme={currentTheme} />
                            </motion.div>
                          </AnimatePresence>
                        </motion.div>
                      </div>
                    </>
                  )}
                </div>
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Slide Indicators */}
      <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 z-20 flex gap-2">
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
