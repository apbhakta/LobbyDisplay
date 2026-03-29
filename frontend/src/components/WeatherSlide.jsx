import { useState, useEffect, useMemo } from "react";
import { motion } from "framer-motion";
import { MapPin, Droplets, Wind, Thermometer, ArrowUp, ArrowDown, CloudRain, Eye } from "lucide-react";
import WeatherBackground, { getWeatherTheme } from "./WeatherBackground";

// Glass Panel
const GlassPanel = ({ children, className = "", intensity = "medium", ...props }) => {
  const bg = intensity === "strong" ? "bg-black/40" : intensity === "light" ? "bg-white/10" : "bg-black/25";
  return (
    <motion.div
      className={`rounded-2xl backdrop-blur-xl border border-white/20 shadow-2xl ${bg} ${className}`}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8 }}
      {...props}
    >
      {children}
    </motion.div>
  );
};

// Animated Weather Icon
const AnimatedWeatherIcon = ({ icon, condition, size = 160, theme }) => {
  const iconUrl = `https://openweathermap.org/img/wn/${icon || "02d"}@4x.png`;
  const getAnimation = () => {
    switch (theme) {
      case "sunny": return { scale: [1, 1.05, 1], filter: ["brightness(1)", "brightness(1.1)", "brightness(1)"] };
      case "rain": case "storm": return { y: [-3, 3, -3], opacity: [0.9, 1, 0.9] };
      case "snow": return { y: [-5, 5, -5], rotate: [-2, 2, -2] };
      case "cloudy": return { x: [-3, 3, -3], opacity: [0.9, 1, 0.9] };
      case "fog": return { opacity: [0.7, 1, 0.7], scale: [0.98, 1.02, 0.98] };
      default: return { y: [-3, 3, -3] };
    }
  };

  return (
    <motion.div
      className="relative"
      animate={getAnimation()}
      transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
    >
      <img src={iconUrl} alt={condition} style={{ width: size, height: size }} className="drop-shadow-2xl" />
      {theme === "sunny" && (
        <motion.div
          className="absolute inset-0 rounded-full"
          style={{ background: "radial-gradient(circle, rgba(251,191,36,0.3) 0%, transparent 70%)", filter: "blur(20px)" }}
          animate={{ scale: [1, 1.2, 1], opacity: [0.5, 0.8, 0.5] }}
          transition={{ duration: 3, repeat: Infinity }}
        />
      )}
    </motion.div>
  );
};

// Forecast Day Card
const ForecastDayCard = ({ day, icon, high, low, condition, index, isCompact }) => {
  const iconUrl = `https://openweathermap.org/img/wn/${icon || "02d"}@2x.png`;
  const isToday = index === 0;

  return (
    <motion.div
      className={`flex flex-col items-center rounded-xl ${isToday ? "bg-white/20" : "bg-white/10"} ${isCompact ? 'py-3 px-2' : 'py-4 px-3'}`}
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.3 + index * 0.1 }}
    >
      <p className={`${isCompact ? 'text-xs' : 'text-base'} font-semibold uppercase tracking-wider ${isToday ? "text-white" : "text-white/80"}`}>
        {isToday ? "Today" : day?.substring(0, 3)}
      </p>
      <motion.img
        src={iconUrl}
        alt={condition}
        className={`${isCompact ? 'w-10 h-10 my-1.5' : 'w-16 h-16 my-2'}`}
        animate={{ y: [-2, 2, -2] }}
        transition={{ duration: 3, repeat: Infinity, delay: index * 0.2 }}
      />
      <div className="flex items-center gap-2">
        <span className={`${isCompact ? 'text-base' : 'text-2xl'} font-semibold text-white`}>{Math.round(high)}°</span>
        <span className={`${isCompact ? 'text-xs' : 'text-base'} text-white/60`}>{Math.round(low)}°</span>
      </div>
      <p className={`${isCompact ? 'text-[10px]' : 'text-sm'} text-white/60 mt-1 capitalize`}>{condition?.split(" ")[0]}</p>
    </motion.div>
  );
};

// Live Clock
const LiveClock = ({ isPortrait }) => {
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
  const dateStr = time.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric", year: "numeric" });

  return (
    <div className={isPortrait ? "text-right" : "text-center"}>
      <motion.div
        className={`font-light text-white tracking-tight ${isPortrait ? 'text-5xl' : 'text-5xl md:text-6xl'}`}
        animate={{ opacity: [0.9, 1, 0.9] }}
        transition={{ duration: 2, repeat: Infinity }}
      >
        {displayHours}
        <motion.span animate={{ opacity: [1, 0.4, 1] }} transition={{ duration: 1, repeat: Infinity }}>:</motion.span>
        {minutes}
        <span className={`${isPortrait ? 'text-2xl' : 'text-3xl'} opacity-70`}>:{seconds}</span>
        <span className={`${isPortrait ? 'text-xl' : 'text-2xl'} ml-2 opacity-80`}>{ampm}</span>
      </motion.div>
      <p className={`${isPortrait ? 'text-lg' : 'text-lg'} text-white/70 mt-1`}>{dateStr}</p>
    </div>
  );
};

// Detail stat row
const StatRow = ({ icon: Icon, color, bgColor, label, value, isCompact }) => (
  <div className="flex items-center gap-3">
    <div className={`${isCompact ? 'w-10 h-10' : 'w-12 h-12'} rounded-xl ${bgColor} flex items-center justify-center flex-shrink-0`}>
      <Icon className={`${isCompact ? 'w-5 h-5' : 'w-6 h-6'} ${color}`} />
    </div>
    <div>
      <p className={`${isCompact ? 'text-[10px]' : 'text-xs'} text-white/60 uppercase tracking-wider`}>{label}</p>
      <p className={`${isCompact ? 'text-xl' : 'text-2xl'} font-light text-white`}>{value}</p>
    </div>
  </div>
);

// Main Weather Slide
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
      ];

  const isSnowTheme = theme === "snow";
  const textColor = isSnowTheme ? "text-slate-800" : "text-white";
  const mutedColor = isSnowTheme ? "text-slate-600" : "text-white/70";

  if (isPortrait) {
    return (
      <div className="w-full h-full relative overflow-hidden" data-testid="weather-slide">
        <WeatherBackground condition={weather.condition} icon={weather.icon} />

        <div className="absolute inset-0 z-10 flex flex-col p-8 lg:p-10">

          {/* Header — Location left, Clock right */}
          <div className="flex justify-between items-start mb-4">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
            >
              <div className="flex items-center gap-2 mb-1">
                <MapPin className={`w-7 h-7 ${textColor}`} />
                <h1 className={`text-4xl font-light tracking-wide ${textColor}`}>
                  {weather.city}, Texas
                </h1>
              </div>
              <p className={`text-xl ${mutedColor} ml-9`}>Current Weather</p>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
            >
              <LiveClock isPortrait />
            </motion.div>
          </div>

          {/* Main Weather — centered hero area */}
          <div className="flex-1 flex flex-col items-center justify-center">

            {/* Temperature + Icon row */}
            <motion.div
              className="flex items-center justify-center gap-8 mb-6"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, delay: 0.2 }}
            >
              <div className="flex items-start">
                <motion.span
                  className={`text-[10rem] font-extralight leading-none tracking-tighter ${textColor}`}
                  animate={{ opacity: [0.95, 1, 0.95] }}
                  transition={{ duration: 4, repeat: Infinity }}
                >
                  {Math.round(weather.temp)}
                </motion.span>
                <span className={`text-5xl font-light ${mutedColor} mt-6`}>°F</span>
              </div>

              <div className="flex flex-col items-center">
                <AnimatedWeatherIcon icon={weather.icon} condition={weather.condition} size={140} theme={theme} />
                <motion.p
                  className={`text-3xl font-light capitalize ${textColor} -mt-1`}
                  animate={{ opacity: [0.9, 1, 0.9] }}
                  transition={{ duration: 3, repeat: Infinity }}
                >
                  {weather.condition}
                </motion.p>
              </div>
            </motion.div>

            {/* Feels like + Hi/Lo */}
            <motion.div
              className="flex items-center gap-8 mb-10"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
            >
              <div className="flex items-center gap-2">
                <Thermometer className={`w-6 h-6 ${mutedColor}`} />
                <span className={`text-xl ${mutedColor}`}>Feels like {Math.round(feelsLike)}°F</span>
              </div>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-1.5">
                  <ArrowUp className="w-6 h-6 text-orange-400" />
                  <span className={`text-2xl font-medium ${textColor}`}>{Math.round(weather.temp_max)}°</span>
                </div>
                <div className="w-px h-7 bg-white/30" />
                <div className="flex items-center gap-1.5">
                  <ArrowDown className="w-6 h-6 text-blue-400" />
                  <span className={`text-2xl font-medium ${textColor}`}>{Math.round(weather.temp_min)}°</span>
                </div>
              </div>
            </motion.div>

            {/* Detail stats — 2x2 grid */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
            >
              <GlassPanel intensity="strong" className="p-6">
                <div className="grid grid-cols-2 gap-x-10 gap-y-5">
                  <StatRow icon={Droplets} color="text-blue-400" bgColor="bg-blue-500/20" label="Humidity" value={`${weather.humidity}%`} />
                  <StatRow icon={Wind} color="text-cyan-400" bgColor="bg-cyan-500/20" label="Wind Speed" value={`${weather.wind_speed} mph`} />
                  <StatRow icon={Eye} color="text-purple-400" bgColor="bg-purple-500/20" label="Visibility" value={`${weather.visibility || 10} mi`} />
                  <StatRow icon={CloudRain} color="text-indigo-400" bgColor="bg-indigo-500/20" label="Precipitation" value={`${weather.precipitation || 0}%`} />
                </div>
              </GlassPanel>
            </motion.div>
          </div>

          {/* Forecast — bottom, auto-fit grid */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            className="mt-6"
          >
            <GlassPanel intensity="medium" className="p-5">
              <p className="text-sm text-white/60 uppercase tracking-wider mb-3 ml-1">Forecast</p>
              <div
                className="grid gap-3"
                style={{ gridTemplateColumns: `repeat(${Math.min(forecastDays.length, 5)}, 1fr)` }}
              >
                {forecastDays.slice(0, 5).map((day, index) => (
                  <ForecastDayCard
                    key={index}
                    day={day.day}
                    icon={day.icon}
                    high={day.temp_max}
                    low={day.temp_min}
                    condition={day.condition}
                    index={index}
                    isCompact={false}
                  />
                ))}
              </div>
            </GlassPanel>
          </motion.div>
        </div>
      </div>
    );
  }

  // ====== LANDSCAPE LAYOUT ======
  return (
    <div className="w-full h-full relative overflow-hidden" data-testid="weather-slide">
      <WeatherBackground condition={weather.condition} icon={weather.icon} />

      <div className="absolute inset-0 z-10 flex flex-col p-10 lg:p-16">

        {/* Header */}
        <div className="flex justify-between items-start mb-6">
          <motion.div initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.8 }}>
            <div className="flex items-center gap-3 mb-1">
              <MapPin className={`w-6 h-6 ${textColor}`} />
              <h1 className={`text-4xl font-light tracking-wide ${textColor}`}>{weather.city}, Texas</h1>
            </div>
            <p className={`text-base ${mutedColor} ml-10`}>Current Weather</p>
          </motion.div>
          <motion.div initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.8 }}>
            <LiveClock isPortrait={false} />
          </motion.div>
        </div>

        {/* Main content */}
        <div className="flex-1 flex items-center justify-center gap-16">
          {/* Temperature */}
          <motion.div className="text-center" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.8, delay: 0.2 }}>
            <div className="flex items-start justify-center">
              <motion.span className={`text-[10rem] lg:text-[14rem] font-extralight leading-none tracking-tighter ${textColor}`} animate={{ opacity: [0.95, 1, 0.95] }} transition={{ duration: 4, repeat: Infinity }}>
                {Math.round(weather.temp)}
              </motion.span>
              <span className={`text-5xl lg:text-6xl font-light ${mutedColor} mt-8`}>°F</span>
            </div>
            <div className="flex items-center justify-center gap-2 mt-2">
              <Thermometer className={`w-5 h-5 ${mutedColor}`} />
              <span className={`text-xl ${mutedColor}`}>Feels like {Math.round(feelsLike)}°F</span>
            </div>
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

          {/* Icon + Condition */}
          <motion.div className="flex flex-col items-center" initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.3 }}>
            <AnimatedWeatherIcon icon={weather.icon} condition={weather.condition} size={200} theme={theme} />
            <motion.p className={`text-3xl lg:text-4xl font-light capitalize mt-4 ${textColor}`} animate={{ opacity: [0.9, 1, 0.9] }} transition={{ duration: 3, repeat: Infinity }}>
              {weather.condition}
            </motion.p>
          </motion.div>

          {/* Detail stats */}
          <motion.div initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.8, delay: 0.4 }}>
            <GlassPanel intensity="strong" className="p-8 space-y-6">
              <StatRow icon={Droplets} color="text-blue-400" bgColor="bg-blue-500/20" label="Humidity" value={`${weather.humidity}%`} />
              <StatRow icon={Wind} color="text-cyan-400" bgColor="bg-cyan-500/20" label="Wind Speed" value={`${weather.wind_speed} mph`} />
              <StatRow icon={Eye} color="text-purple-400" bgColor="bg-purple-500/20" label="Visibility" value={`${weather.visibility || 10} mi`} />
              <StatRow icon={CloudRain} color="text-indigo-400" bgColor="bg-indigo-500/20" label="Precipitation" value={`${weather.precipitation || 0}%`} />
            </GlassPanel>
          </motion.div>
        </div>

        {/* Forecast */}
        <motion.div initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.5 }}>
          <GlassPanel intensity="medium" className="p-6">
            <p className="text-sm text-white/60 uppercase tracking-wider mb-4 ml-2">Forecast</p>
            <div
              className="grid gap-4"
              style={{ gridTemplateColumns: `repeat(${Math.min(forecastDays.length, 6)}, 1fr)` }}
            >
              {forecastDays.slice(0, 6).map((day, index) => (
                <ForecastDayCard
                  key={index}
                  day={day.day}
                  icon={day.icon}
                  high={day.temp_max}
                  low={day.temp_min}
                  condition={day.condition}
                  index={index}
                  isCompact={false}
                />
              ))}
            </div>
          </GlassPanel>
        </motion.div>
      </div>
    </div>
  );
}
