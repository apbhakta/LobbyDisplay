import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Cloud, Sun, CloudRain, CloudSnow, CloudLightning, Wind, Droplets, Thermometer } from "lucide-react";
import axios from "axios";

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

export default function LobbyDisplay() {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [settings, setSettings] = useState({
    hotel_name: "Velkommen Inn",
    city: "Clifton, Texas",
    photo_interval: 8,
  });
  const [images, setImages] = useState([]);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [weather, setWeather] = useState(null);
  const [headlines, setHeadlines] = useState([]);
  const [currentHeadlineIndex, setCurrentHeadlineIndex] = useState(0);

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

  // Fetch weather
  const fetchWeather = useCallback(async () => {
    try {
      const response = await axios.get(`${API}/weather`);
      setWeather(response.data);
    } catch (error) {
      console.error("Error fetching weather:", error);
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

  // Update clock every second
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Rotate images
  useEffect(() => {
    if (images.length === 0) return;
    const interval = setInterval(() => {
      setCurrentImageIndex((prev) => (prev + 1) % images.length);
    }, settings.photo_interval * 1000);
    return () => clearInterval(interval);
  }, [images.length, settings.photo_interval]);

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
  const currentImage = images[currentImageIndex];

  // Get image URL
  const getImageUrl = (image) => {
    if (!image) return "";
    if (image.url.startsWith("http")) return image.url;
    return `${BACKEND_URL}${image.url}`;
  };

  return (
    <div 
      className="lobby-display relative w-screen h-screen overflow-hidden bg-black"
      data-testid="lobby-display"
    >
      {/* Background Image with Crossfade */}
      <AnimatePresence mode="wait">
        {currentImage && (
          <motion.div
            key={currentImageIndex}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 2, ease: "easeInOut" }}
            className="absolute inset-0"
          >
            <img
              src={getImageUrl(currentImage)}
              alt="Hotel"
              className="w-full h-full object-cover"
              data-testid="background-image"
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Gradient Overlay */}
      <div className="gradient-overlay absolute inset-0 z-10" />

      {/* Content Layer */}
      <div className="relative z-20 h-full w-full p-12 md:p-16 lg:p-24 flex flex-col justify-between">
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
    </div>
  );
}
