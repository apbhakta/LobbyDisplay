import { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MapPin, Droplets, Wind, Thermometer, ArrowUp, ArrowDown, CloudRain, Eye } from "lucide-react";
import WeatherBackground, { getWeatherTheme } from "./WeatherBackground";

// Glass Panel Component with weather-reactive styling
const GlassPanel = ({ children, className = "", theme = "sunny", intensity = "medium" }) => {
  const getStyle = () => {
    const base = "backdrop-blur-xl border border-white/20 shadow-2xl";
    const bgOpacity = intensity === "strong" ? "bg-black/40" : intensity === "light" ? "bg-white/10" : "bg-black/25";
    return `${base} ${bgOpacity}`;
  };

  return (
    <motion.div 
      className={`rounded-2xl ${getStyle()} ${className}`}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8 }}
    >
      {children}
    </motion.div>
  );
};

// Animated Weather Icon with theme-based effects
const AnimatedWeatherIcon = ({ icon, condition, size = 160, theme }) => {
  const iconUrl = `https://openweathermap.org/img/wn/${icon || "02d"}@4x.png`;
  
  // Get animation based on theme
  const getAnimation = () => {
    switch (theme) {
      case "sunny":
        return { 
          scale: [1, 1.05, 1], 
          filter: ["brightness(1)", "brightness(1.1)", "brightness(1)"]
        };
      case "rain":
      case "storm":
        return { y: [-3, 3, -3], opacity: [0.9, 1, 0.9] };
      case "snow":
        return { y: [-5, 5, -5], rotate: [-2, 2, -2] };
      case "windy":
        return { x: [-5, 5, -5], rotate: [-3, 3, -3] };
      case "cloudy":
        return { x: [-3, 3, -3], opacity: [0.9, 1, 0.9] };
      case "fog":
        return { opacity: [0.7, 1, 0.7], scale: [0.98, 1.02, 0.98] };
      default:
        return { y: [-3, 3, -3] };
    }
  };

  return (
    <motion.div
      className="relative"
      animate={getAnimation()}
      transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
    >
      <img
        src={iconUrl}
        alt={condition}
        style={{ width: size, height: size }}
        className="drop-shadow-2xl"
      />
      {/* Glow effect for sunny */}
      {theme === "sunny" && (
        <motion.div
          className="absolute inset-0 rounded-full"
          style={{
            background: "radial-gradient(circle, rgba(251,191,36,0.3) 0%, transparent 70%)",
            filter: "blur(20px)",
          }}
          animate={{ scale: [1, 1.2, 1], opacity: [0.5, 0.8, 0.5] }}
          transition={{ duration: 3, repeat: Infinity }}
        />
      )}
    </motion.div>
  );
};

// Forecast Day Card
const ForecastDayCard = ({ day, icon, high, low, condition, index, theme }) => {
  const iconUrl = `https://openweathermap.org/img/wn/${icon || "02d"}@2x.png`;
  const isToday = index === 0;
  
  return (
    <motion.div
      className={`flex flex-col items-center p-4 rounded-xl ${
        isToday ? "bg-white/20" : "bg-white/10"
      }`}
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.3 + index * 0.1 }}
    >
      <p className={`text-sm font-medium uppercase tracking-wider ${isToday ? "text-white" : "text-white/80"}`}>
        {isToday ? "Today" : day?.substring(0, 3)}
      </p>
      <motion.img
        src={iconUrl}
        alt={condition}
        className="w-14 h-14 my-2"
        animate={{ y: [-2, 2, -2] }}
        transition={{ duration: 3, repeat: Infinity, delay: index * 0.2 }}
      />
      <div className="flex items-center gap-2">
        <span className="text-lg font-semibold text-white">{Math.round(high)}°</span>
        <span className="text-sm text-white/60">{Math.round(low)}°</span>
      </div>
      <p className="text-xs text-white/60 mt-1 capitalize">{condition?.split(" ")[0]}</p>
    </motion.div>
  );
};

// Live Clock Component
const LiveClock = () => {
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

  const dateStr = time.toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric"
  });

  return (
    <div className="text-center">
      <motion.div 
        className="text-5xl md:text-6xl font-light text-white tracking-tight"
        animate={{ opacity: [0.9, 1, 0.9] }}
        transition={{ duration: 2, repeat: Infinity }}
      >
        {displayHours}
        <motion.span 
          animate={{ opacity: [1, 0.4, 1] }}
          transition={{ duration: 1, repeat: Infinity }}
        >
          :
        </motion.span>
        {minutes}
        <span className="text-3xl opacity-70">:{seconds}</span>
        <span className="text-2xl ml-2 opacity-80">{ampm}</span>
      </motion.div>
      <p className="text-lg text-white/70 mt-2">{dateStr}</p>
    </div>
  );
};

// Main Weather Slide Component
export default function WeatherSlide({ weather, forecast, currentTime, isPortrait }) {
  const theme = useMemo(() => {
    if (!weather) return "sunny";
    return getWeatherTheme(weather.condition, weather.icon);
  }, [weather]);

  if (!weather) return null;

  const feelsLike = weather.feels_like || Math.round(weather.temp - (weather.wind_speed / 2));
  
  const forecastDays = forecast && forecast.length > 0 
    ? [
        { day: "Today", icon: weather.icon, temp_max: weather.temp_max, temp_min: weather.temp_min, condition: weather.condition },
        ...forecast.slice(0, 5)
      ]
    : [
        { day: "Today", icon: weather.icon, temp_max: weather.temp_max, temp_min: weather.temp_min, condition: weather.condition },
        { day: "Sunday", icon: "02d", temp_max: 45, temp_min: 38, condition: "Partly Cloudy" },
        { day: "Monday", icon: "03d", temp_max: 48, temp_min: 40, condition: "Cloudy" },
        { day: "Tuesday", icon: "10d", temp_max: 52, temp_min: 42, condition: "Rain" },
        { day: "Wednesday", icon: "01d", temp_max: 55, temp_min: 44, condition: "Sunny" },
        { day: "Thursday", icon: "02d", temp_max: 50, temp_min: 40, condition: "Partly Cloudy" },
      ];

  const isSnowTheme = theme === "snow";
  const textColor = isSnowTheme ? "text-slate-800" : "text-white";
  const mutedColor = isSnowTheme ? "text-slate-600" : "text-white/70";

  return (
    <div 
      className="w-full h-full relative overflow-hidden"
      data-testid="weather-slide"
    >
      <WeatherBackground condition={weather.condition} icon={weather.icon} />

      <div className={`absolute inset-0 z-10 flex flex-col ${isPortrait ? 'p-6 lg:p-8' : 'p-10 lg:p-16'}`}>
        
        {/* Header - Location & Time */}
        <div className={`flex ${isPortrait ? 'flex-col items-center gap-3' : 'justify-between items-start'} mb-6`}>
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            className={isPortrait ? 'text-center' : ''}
          >
            <div className={`flex items-center gap-3 mb-1 ${isPortrait ? 'justify-center' : ''}`}>
              <MapPin className={`w-6 h-6 ${textColor}`} />
              <h1 className={`${isPortrait ? 'text-2xl' : 'text-4xl'} font-light tracking-wide ${textColor}`}>
                {weather.city}, Texas
              </h1>
            </div>
            <p className={`text-base ${mutedColor} ${isPortrait ? 'text-center' : 'ml-10'}`}>Current Weather</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
          >
            <LiveClock />
          </motion.div>
        </div>

        {/* Main Weather Content */}
        {isPortrait ? (
          /* Portrait: stacked layout */
          <div className="flex-1 flex flex-col items-center justify-center gap-4">
            {/* Temperature + Icon */}
            <motion.div 
              className="text-center"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, delay: 0.2 }}
            >
              <AnimatedWeatherIcon 
                icon={weather.icon} 
                condition={weather.condition}
                size={140}
                theme={theme}
              />
              <motion.p 
                className={`text-2xl font-light capitalize mt-2 ${textColor}`}
                animate={{ opacity: [0.9, 1, 0.9] }}
                transition={{ duration: 3, repeat: Infinity }}
              >
                {weather.condition}
              </motion.p>
            </motion.div>

            <div className="flex items-start justify-center">
              <motion.span 
                className={`text-[8rem] font-extralight leading-none tracking-tighter ${textColor}`}
                animate={{ opacity: [0.95, 1, 0.95] }}
                transition={{ duration: 4, repeat: Infinity }}
              >
                {Math.round(weather.temp)}
              </motion.span>
              <span className={`text-4xl font-light ${mutedColor} mt-4`}>°F</span>
            </div>

            {/* Feels Like + Hi/Lo */}
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-2">
                <Thermometer className={`w-4 h-4 ${mutedColor}`} />
                <span className={`text-base ${mutedColor}`}>Feels {Math.round(feelsLike)}°</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1">
                  <ArrowUp className="w-4 h-4 text-orange-400" />
                  <span className={`text-lg ${textColor}`}>{Math.round(weather.temp_max)}°</span>
                </div>
                <div className="flex items-center gap-1">
                  <ArrowDown className="w-4 h-4 text-blue-400" />
                  <span className={`text-lg ${textColor}`}>{Math.round(weather.temp_min)}°</span>
                </div>
              </div>
            </div>

            {/* Detail chips */}
            <div className="flex gap-3 flex-wrap justify-center mt-2">
              <GlassPanel theme={theme} intensity="strong" className="px-4 py-2 flex items-center gap-2">
                <Droplets className="w-4 h-4 text-blue-400" />
                <span className="text-sm text-white">{weather.humidity}%</span>
              </GlassPanel>
              <GlassPanel theme={theme} intensity="strong" className="px-4 py-2 flex items-center gap-2">
                <Wind className="w-4 h-4 text-cyan-400" />
                <span className="text-sm text-white">{weather.wind_speed} mph</span>
              </GlassPanel>
              <GlassPanel theme={theme} intensity="strong" className="px-4 py-2 flex items-center gap-2">
                <Eye className="w-4 h-4 text-purple-400" />
                <span className="text-sm text-white">{weather.visibility || 10} mi</span>
              </GlassPanel>
            </div>
          </div>
        ) : (
          /* Landscape: original horizontal layout */
          <div className="flex-1 flex items-center justify-center gap-16">
            <motion.div 
              className="text-center"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, delay: 0.2 }}
            >
              <div className="flex items-start justify-center">
                <motion.span 
                  className={`text-[10rem] lg:text-[14rem] font-extralight leading-none tracking-tighter ${textColor}`}
                  animate={{ opacity: [0.95, 1, 0.95] }}
                  transition={{ duration: 4, repeat: Infinity }}
                >
                  {Math.round(weather.temp)}
                </motion.span>
                <span className={`text-5xl lg:text-6xl font-light ${mutedColor} mt-8`}>°F</span>
              </div>
              <motion.div 
                className="flex items-center justify-center gap-2 mt-2"
                animate={{ opacity: [0.8, 1, 0.8] }}
                transition={{ duration: 3, repeat: Infinity }}
              >
                <Thermometer className={`w-5 h-5 ${mutedColor}`} />
                <span className={`text-xl ${mutedColor}`}>Feels like {Math.round(feelsLike)}°F</span>
              </motion.div>
              <div className="flex items-center justify-center gap-6 mt-4">
                <div className="flex items-center gap-2">
                  <ArrowUp className="w-5 h-5 text-orange-400" />
                  <span className={`text-2xl ${textColor}`}>{Math.round(weather.temp_max)}°</span>
                </div>
                <div className="w-px h-6 bg-white/30" />
                <div className="flex items-center gap-2">
                  <ArrowDown className="w-5 h-5 text-blue-400" />
                  <span className={`text-2xl ${textColor}`}>{Math.round(weather.temp_min)}°</span>
                </div>
              </div>
            </motion.div>

            <motion.div 
              className="flex flex-col items-center"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.3 }}
            >
              <AnimatedWeatherIcon 
                icon={weather.icon} 
                condition={weather.condition}
                size={200}
                theme={theme}
              />
              <motion.p 
                className={`text-3xl lg:text-4xl font-light capitalize mt-4 ${textColor}`}
                animate={{ opacity: [0.9, 1, 0.9] }}
                transition={{ duration: 3, repeat: Infinity }}
              >
                {weather.condition}
              </motion.p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
            >
              <GlassPanel theme={theme} intensity="strong" className="p-8 space-y-6">
                <div className="flex items-center gap-5">
                  <div className="w-14 h-14 rounded-xl bg-blue-500/20 flex items-center justify-center">
                    <Droplets className="w-7 h-7 text-blue-400" />
                  </div>
                  <div>
                    <p className="text-sm text-white/60 uppercase tracking-wider">Humidity</p>
                    <p className="text-3xl font-light text-white">{weather.humidity}%</p>
                  </div>
                </div>
                <div className="flex items-center gap-5">
                  <div className="w-14 h-14 rounded-xl bg-cyan-500/20 flex items-center justify-center">
                    <Wind className="w-7 h-7 text-cyan-400" />
                  </div>
                  <div>
                    <p className="text-sm text-white/60 uppercase tracking-wider">Wind Speed</p>
                    <p className="text-3xl font-light text-white">{weather.wind_speed} mph</p>
                  </div>
                </div>
                <div className="flex items-center gap-5">
                  <div className="w-14 h-14 rounded-xl bg-purple-500/20 flex items-center justify-center">
                    <Eye className="w-7 h-7 text-purple-400" />
                  </div>
                  <div>
                    <p className="text-sm text-white/60 uppercase tracking-wider">Visibility</p>
                    <p className="text-3xl font-light text-white">{weather.visibility || 10} mi</p>
                  </div>
                </div>
                <div className="flex items-center gap-5">
                  <div className="w-14 h-14 rounded-xl bg-indigo-500/20 flex items-center justify-center">
                    <CloudRain className="w-7 h-7 text-indigo-400" />
                  </div>
                  <div>
                    <p className="text-sm text-white/60 uppercase tracking-wider">Precipitation</p>
                    <p className="text-3xl font-light text-white">{weather.precipitation || 0}%</p>
                  </div>
                </div>
              </GlassPanel>
            </motion.div>
          </div>
        )}

        {/* 6-Day Forecast */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.5 }}
        >
          <GlassPanel theme={theme} intensity="medium" className={isPortrait ? "p-4" : "p-6"}>
            <p className={`text-sm text-white/60 uppercase tracking-wider ${isPortrait ? 'mb-3 ml-1' : 'mb-4 ml-2'}`}>6-Day Forecast</p>
            <div className={`grid ${isPortrait ? 'grid-cols-3 gap-2' : 'grid-cols-6 gap-4'}`}>
              {forecastDays.slice(0, 6).map((day, index) => (
                <ForecastDayCard
                  key={index}
                  day={day.day}
                  icon={day.icon}
                  high={day.temp_max}
                  low={day.temp_min}
                  condition={day.condition}
                  index={index}
                  theme={theme}
                />
              ))}
            </div>
          </GlassPanel>
        </motion.div>
      </div>
    </div>
  );
}
