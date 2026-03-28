import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Cloud, Sun, CloudRain, CloudSnow, CloudLightning, Wind, Thermometer } from "lucide-react";
import axios from "axios";
import WeatherSlide from "../components/WeatherSlide";
import LocalAttractionsSlide from "../components/LocalAttractionsSlide";
import EventsSlide from "../components/EventsSlide";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

// Weather icon mapping
const getWeatherIcon = (iconCode) => {
  const iconMap = {
    "01d": Sun,
    "01n": Sun,
    "02d": Cloud,
    "02n": Cloud,
    "03d": Cloud,
    "03n": Cloud,
    "04d": Cloud,
    "04n": Cloud,
    "09d": CloudRain,
    "09n": CloudRain,
    "10d": CloudRain,
    "10n": CloudRain,
    "11d": CloudLightning,
    "11n": CloudLightning,
    "13d": CloudSnow,
    "13n": CloudSnow,
    "50d": Wind,
    "50n": Wind,
  };
  return iconMap[iconCode] || Cloud;
};

// Slide types
const SLIDE_TYPES = {
  PHOTO: 'photo',
  WEATHER: 'weather',
  LOCAL_ATTRACTIONS: 'local_attractions',
  EVENTS: 'events'
};

export default function LobbyDisplay() {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [settings, setSettings] = useState({
    hotel_name: "Velkommen Inn",
    city: "Clifton, Texas",
    photo_interval: 8,
    display_orientation: "landscape",
    display_scale: 100,
    display_width: 16,
    display_height: 9,
  });
  const [images, setImages] = useState([]);
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
  const [weather, setWeather] = useState(null);
  const [forecast, setForecast] = useState([]);
  const [hourly, setHourly] = useState([]);
  const [headlines, setHeadlines] = useState([]);
  const [currentHeadlineIndex, setCurrentHeadlineIndex] = useState(0);
  
  // Build the complete slide sequence
  const [slides, setSlides] = useState([]);

  // Fetch settings
  const fetchSettings = useCallback(async () => {
    try {
      const response = await axios.get(`${API}/settings`);
      setSettings(response.data);
    } catch (error) {
      console.error("Error fetching settings:", error);
    }
  }, []);

  // Fetch images
  const fetchImages = useCallback(async () => {
    try {
      const response = await axios.get(`${API}/images`);
      setImages(response.data);
    } catch (error) {
      console.error("Error fetching images:", error);
    }
  }, []);

  // Fetch extended weather (includes forecast)
  const fetchWeather = useCallback(async () => {
    try {
      const response = await axios.get(`${API}/weather/extended`);
      setWeather(response.data.current);
      setForecast(response.data.forecast || []);
      setHourly(response.data.hourly || []);
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

  // Fetch news
  const fetchNews = useCallback(async () => {
    try {
      const response = await axios.get(`${API}/news`);
      setHeadlines(response.data);
    } catch (error) {
      console.error("Error fetching news:", error);
    }
  }, []);

  // Initialize data
  useEffect(() => {
    fetchSettings();
    fetchImages();
    fetchWeather();
    fetchNews();
  }, [fetchSettings, fetchImages, fetchWeather, fetchNews]);

  // Build slides array when images change
  useEffect(() => {
    const newSlides = [];
    
    // Add photo slides
    images.forEach((img, index) => {
      newSlides.push({ type: SLIDE_TYPES.PHOTO, data: img, id: `photo-${index}` });
    });
    
    // Insert weather slide after 2 photos
    if (newSlides.length >= 2) {
      newSlides.splice(2, 0, { type: SLIDE_TYPES.WEATHER, id: 'weather' });
    } else {
      newSlides.push({ type: SLIDE_TYPES.WEATHER, id: 'weather' });
    }
    
    // Insert local attractions after weather + 1 more photo
    if (newSlides.length >= 4) {
      newSlides.splice(4, 0, { type: SLIDE_TYPES.LOCAL_ATTRACTIONS, id: 'local-attractions' });
    } else {
      newSlides.push({ type: SLIDE_TYPES.LOCAL_ATTRACTIONS, id: 'local-attractions' });
    }
    
    // Insert events slide after local attractions + 2 more photos
    if (newSlides.length >= 7) {
      newSlides.splice(7, 0, { type: SLIDE_TYPES.EVENTS, id: 'events' });
    } else {
      newSlides.push({ type: SLIDE_TYPES.EVENTS, id: 'events' });
    }
    
    setSlides(newSlides);
  }, [images]);

  // Update clock every second
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Rotate slides
  useEffect(() => {
    if (slides.length === 0) return;
    const interval = setInterval(() => {
      setCurrentSlideIndex((prev) => (prev + 1) % slides.length);
    }, settings.photo_interval * 1000);
    return () => clearInterval(interval);
  }, [slides.length, settings.photo_interval]);

  // Rotate headlines every 15 seconds
  useEffect(() => {
    if (headlines.length === 0) return;
    const interval = setInterval(() => {
      setCurrentHeadlineIndex((prev) => (prev + 1) % headlines.length);
    }, 15000);
    return () => clearInterval(interval);
  }, [headlines.length]);

  // Refresh weather every 15 minutes
  useEffect(() => {
    const interval = setInterval(fetchWeather, 15 * 60 * 1000);
    return () => clearInterval(interval);
  }, [fetchWeather]);

  // Refresh news every 30 minutes
  useEffect(() => {
    const interval = setInterval(fetchNews, 30 * 60 * 1000);
    return () => clearInterval(interval);
  }, [fetchNews]);

  // Format time
  const formatTime = (date) => {
    const hours = date.getHours();
    const minutes = date.getMinutes().toString().padStart(2, "0");
    const ampm = hours >= 12 ? "PM" : "AM";
    const displayHours = hours % 12 || 12;
    return { hours: displayHours, minutes, ampm };
  };

  // Format date
  const formatDate = (date) => {
    const options = { weekday: "long", month: "long", day: "numeric", year: "numeric" };
    return date.toLocaleDateString("en-US", options);
  };

  const time = formatTime(currentTime);
  const WeatherIcon = weather ? getWeatherIcon(weather.icon) : Cloud;
  const currentHeadline = headlines[currentHeadlineIndex];
  const currentSlide = slides[currentSlideIndex];

  // Calculate display styles based on orientation and scale
  const isPortrait = settings.display_orientation === "portrait";
  const isStandard = settings.display_orientation === "standard";
  const scale = settings.display_scale / 100;
  
  // Calculate aspect ratio for standard mode (4:3 = 7.5" x 10")
  const getAspectRatioStyle = () => {
    if (isStandard) {
      return {
        aspectRatio: `${settings.display_width} / ${settings.display_height}`,
        maxWidth: '100vw',
        maxHeight: '100vh',
        margin: '0 auto',
      };
    }
    return {};
  };

  // Get image URL
  const getImageUrl = (image) => {
    if (!image) return "";
    if (image.url.startsWith("http")) return image.url;
    return `${BACKEND_URL}${image.url}`;
  };

  // Render slide based on type
  const renderSlide = (slide) => {
    if (!slide) return null;

    switch (slide.type) {
      case SLIDE_TYPES.WEATHER:
        return (
          <WeatherSlide 
            weather={weather} 
            forecast={forecast}
            currentTime={currentTime}
          />
        );
      
      case SLIDE_TYPES.LOCAL_ATTRACTIONS:
        return (
          <LocalAttractionsSlide 
            hotelName={settings.hotel_name}
          />
        );
      
      case SLIDE_TYPES.EVENTS:
        return (
          <EventsSlide 
            hotelName={settings.hotel_name}
            currentTime={currentTime}
          />
        );
      
      case SLIDE_TYPES.PHOTO:
      default:
        return (
          <>
            {/* Background Image */}
            <img
              src={getImageUrl(slide.data)}
              alt="Hotel"
              className="w-full h-full object-cover"
              data-testid="background-image"
            />
            
            {/* Gradient Overlay */}
            <div className="gradient-overlay absolute inset-0" />

            {/* Content Layer */}
            <div className="absolute inset-0 z-20 h-full w-full p-12 md:p-16 lg:p-24 flex flex-col justify-between">
              {/* Top Row */}
              <div className="flex justify-between items-start">
                {/* Hotel Name - Top Left */}
                <div className="flex flex-col items-start">
                  <h1 
                    className="font-serif text-4xl lg:text-5xl font-semibold tracking-widest uppercase text-white text-shadow-strong"
                    data-testid="hotel-name-display"
                  >
                    {settings.hotel_name}
                  </h1>
                </div>

                {/* Clock and Date - Top Right */}
                <div className="flex flex-col items-end text-right">
                  <div 
                    className="font-serif text-[6rem] lg:text-[10rem] font-light tracking-tighter leading-none text-white text-shadow-strong"
                    data-testid="clock-display"
                  >
                    <span>{time.hours}</span>
                    <span className="clock-separator">:</span>
                    <span>{time.minutes}</span>
                    <span className="text-3xl lg:text-4xl ml-4 font-sans font-light text-white/80">{time.ampm}</span>
                  </div>
                  <p 
                    className="text-xl lg:text-2xl font-light tracking-widest uppercase text-white/80 font-sans mt-2 text-shadow"
                    data-testid="date-display"
                  >
                    {formatDate(currentTime)}
                  </p>
                </div>
              </div>

              {/* Bottom Row */}
              <div className="flex justify-between items-end">
                {/* Weather Widget - Bottom Left */}
                {weather && (
                  <div 
                    className="flex items-center gap-6"
                    data-testid="weather-widget"
                  >
                    <WeatherIcon 
                      className="w-16 h-16 lg:w-24 lg:h-24 text-white weather-icon" 
                      strokeWidth={1.5}
                    />
                    <div className="flex flex-col">
                      <div className="flex items-baseline gap-2">
                        <span className="text-5xl lg:text-7xl font-light font-sans text-white text-shadow-strong">
                          {Math.round(weather.temp)}°
                        </span>
                        <span className="text-2xl font-light text-white/70">F</span>
                      </div>
                      <p className="text-lg lg:text-xl font-light uppercase tracking-widest text-white/70 font-sans">
                        {weather.condition}
                      </p>
                      <div className="flex items-center gap-4 mt-1 text-sm lg:text-base text-white/60 font-sans">
                        <span className="flex items-center gap-1">
                          <Thermometer className="w-4 h-4" />
                          H: {Math.round(weather.temp_max)}°
                        </span>
                        <span className="flex items-center gap-1">
                          L: {Math.round(weather.temp_min)}°
                        </span>
                      </div>
                    </div>
                  </div>
                )}

                {/* News Headline - Bottom Right */}
                <div className="max-w-2xl text-right flex flex-col items-end gap-2">
                  <AnimatePresence mode="wait">
                    {currentHeadline && (
                      <motion.div
                        key={currentHeadlineIndex}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 1 }}
                        data-testid="news-headline"
                      >
                        <p className="font-serif text-xl lg:text-2xl font-light leading-relaxed text-white/90 italic text-shadow">
                          "{currentHeadline.title}"
                        </p>
                        <p className="text-sm lg:text-base font-sans text-white/50 mt-2 uppercase tracking-wider">
                          — {currentHeadline.source}
                        </p>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            </div>
          </>
        );
    }
  };

  return (
    <div 
      className={`lobby-display relative overflow-hidden bg-black flex items-center justify-center ${
        isStandard ? "w-screen h-screen" : "w-screen h-screen"
      }`}
      style={{
        transform: `scale(${scale})`,
        transformOrigin: 'center center',
      }}
      data-testid="lobby-display"
      data-orientation={settings.display_orientation}
    >
      {/* Standard 4:3 mode wrapper - 7.5" x 10" (portrait-ish 3:4 ratio) */}
      {isStandard ? (
        <div 
          className="relative overflow-hidden bg-black"
          style={{
            width: 'min(100vw, calc(100vh * 0.75))',
            height: 'min(100vh, calc(100vw * 1.333))',
            aspectRatio: '7.5 / 10',
          }}
        >
          {/* Slide Content with Crossfade */}
          <AnimatePresence mode="wait">
            {currentSlide && (
              <motion.div
                key={currentSlide.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 2, ease: "easeInOut" }}
                className="absolute inset-0"
              >
                {renderSlide(currentSlide)}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Slide Indicator */}
          <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 z-30 flex gap-2">
            {slides.map((slide, index) => (
              <div
                key={slide.id}
                className={`w-2 h-2 rounded-full transition-all duration-300 ${
                  index === currentSlideIndex 
                    ? 'bg-white w-6' 
                    : 'bg-white/40'
                }`}
              />
            ))}
          </div>
        </div>
      ) : (
        /* Portrait/Landscape mode wrapper */
        <div 
          className={`${
            isPortrait 
              ? "absolute inset-0 flex items-center justify-center"
              : "w-full h-full"
          }`}
        >
          <div 
            className={`${
              isPortrait 
                ? "w-[100vh] h-[100vw] origin-center rotate-90"
                : "w-full h-full"
            }`}
          >
            {/* Slide Content with Crossfade */}
            <AnimatePresence mode="wait">
              {currentSlide && (
                <motion.div
                  key={currentSlide.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 2, ease: "easeInOut" }}
                  className="absolute inset-0"
                >
                  {renderSlide(currentSlide)}
                </motion.div>
              )}
            </AnimatePresence>

            {/* Slide Indicator */}
            <div className={`absolute z-30 flex gap-2 ${
              isPortrait 
                ? "bottom-6 left-1/2 transform -translate-x-1/2" 
                : "bottom-6 left-1/2 transform -translate-x-1/2"
            }`}>
              {slides.map((slide, index) => (
                <div
                  key={slide.id}
                  className={`w-2 h-2 rounded-full transition-all duration-300 ${
                    index === currentSlideIndex 
                      ? 'bg-white w-6' 
                      : 'bg-white/40'
                  }`}
                />
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
