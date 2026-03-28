import { motion } from "framer-motion";
import { MapPin, Droplets, Wind, Eye, ArrowUp, ArrowDown } from "lucide-react";

// Simple gradient background based on weather
const getBackgroundGradient = (icon) => {
  const isNight = icon?.includes("n");
  const isRainy = icon?.includes("09") || icon?.includes("10");
  const isStormy = icon?.includes("11");
  const isSnowy = icon?.includes("13");
  const isCloudy = icon?.includes("03") || icon?.includes("04");
  
  if (isNight) return "linear-gradient(180deg, #0f172a 0%, #1e293b 100%)";
  if (isStormy) return "linear-gradient(180deg, #374151 0%, #4b5563 100%)";
  if (isRainy) return "linear-gradient(180deg, #475569 0%, #64748b 100%)";
  if (isSnowy) return "linear-gradient(180deg, #94a3b8 0%, #cbd5e1 100%)";
  if (isCloudy) return "linear-gradient(180deg, #0284c7 0%, #38bdf8 100%)";
  return "linear-gradient(180deg, #0369a1 0%, #0ea5e9 100%)";
};

export default function WeatherSlide({ weather, forecast, currentTime }) {
  if (!weather) return null;

  const dateStr = currentTime.toLocaleDateString("en-US", { 
    weekday: "long",
    month: "long", 
    day: "numeric" 
  });

  // Get 6 days of forecast
  const forecastDays = forecast && forecast.length > 0 
    ? forecast.slice(0, 6) 
    : [
        { day: "Sat", temp_min: 36, temp_max: 41, icon: "01d" },
        { day: "Sun", temp_min: 35, temp_max: 55, icon: "02d" },
        { day: "Mon", temp_min: 42, temp_max: 53, icon: "03d" },
        { day: "Tue", temp_min: 51, temp_max: 77, icon: "10d" },
        { day: "Wed", temp_min: 64, temp_max: 77, icon: "04d" },
        { day: "Thu", temp_min: 46, temp_max: 58, icon: "02d" },
      ];

  const iconUrl = `https://openweathermap.org/img/wn/${weather.icon || "02d"}@4x.png`;

  return (
    <div 
      className="w-full h-full relative overflow-hidden"
      style={{ background: getBackgroundGradient(weather.icon) }}
      data-testid="weather-slide"
    >
      {/* Subtle animated gradient overlay */}
      <motion.div 
        className="absolute inset-0 opacity-30"
        style={{
          background: 'radial-gradient(ellipse at 70% 20%, rgba(255,255,255,0.3) 0%, transparent 50%)'
        }}
        animate={{ opacity: [0.2, 0.4, 0.2] }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
      />

      {/* Content */}
      <div className="relative z-10 h-full flex flex-col p-12 lg:p-16">
        
        {/* Main Weather Display */}
        <div className="flex-1 flex items-center justify-center">
          <div className="flex items-center gap-16 lg:gap-24">
            
            {/* Left - Temperature */}
            <motion.div 
              className="text-center"
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
            >
              {/* Location */}
              <div className="flex items-center justify-center gap-2 mb-2">
                <MapPin className="w-5 h-5 text-white/80" />
                <span className="text-xl text-white/80 font-sans">{weather.city}, TX</span>
              </div>
              
              {/* Date */}
              <p className="text-lg text-white/60 font-sans mb-6">{dateStr}</p>
              
              {/* Big Temperature */}
              <div className="flex items-start justify-center">
                <span className="text-[8rem] lg:text-[12rem] font-extralight text-white leading-none tracking-tighter font-sans">
                  {Math.round(weather.temp)}
                </span>
                <span className="text-4xl lg:text-5xl font-light text-white/70 mt-6">°F</span>
              </div>
              
              {/* High/Low */}
              <div className="flex items-center justify-center gap-6 mt-4">
                <div className="flex items-center gap-1">
                  <ArrowUp className="w-4 h-4 text-orange-300" />
                  <span className="text-lg text-white font-sans">{Math.round(weather.temp_max)}°</span>
                </div>
                <div className="flex items-center gap-1">
                  <ArrowDown className="w-4 h-4 text-blue-300" />
                  <span className="text-lg text-white font-sans">{Math.round(weather.temp_min)}°</span>
                </div>
              </div>
            </motion.div>

            {/* Center - Weather Icon */}
            <motion.div 
              className="flex flex-col items-center"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, delay: 0.2 }}
            >
              <motion.img 
                src={iconUrl}
                alt={weather.condition}
                className="w-48 h-48 lg:w-64 lg:h-64"
                style={{ filter: 'drop-shadow(0 10px 30px rgba(0,0,0,0.2))' }}
                animate={{ y: [-5, 5, -5] }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
              />
              <p className="text-2xl lg:text-3xl text-white font-sans capitalize mt-2">
                {weather.condition}
              </p>
            </motion.div>

            {/* Right - Details */}
            <motion.div 
              className="space-y-6"
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.3 }}
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center">
                  <Droplets className="w-6 h-6 text-blue-300" />
                </div>
                <div>
                  <p className="text-sm text-white/60 uppercase tracking-wider">Humidity</p>
                  <p className="text-2xl text-white font-sans">{weather.humidity}%</p>
                </div>
              </div>
              
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center">
                  <Wind className="w-6 h-6 text-cyan-300" />
                </div>
                <div>
                  <p className="text-sm text-white/60 uppercase tracking-wider">Wind</p>
                  <p className="text-2xl text-white font-sans">{weather.wind_speed} mph</p>
                </div>
              </div>
              
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center">
                  <Eye className="w-6 h-6 text-white/80" />
                </div>
                <div>
                  <p className="text-sm text-white/60 uppercase tracking-wider">Visibility</p>
                  <p className="text-2xl text-white font-sans">{weather.visibility} mi</p>
                </div>
              </div>
            </motion.div>
          </div>
        </div>

        {/* 6-Day Forecast */}
        <motion.div 
          className="bg-white/10 backdrop-blur-sm rounded-2xl p-6"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
        >
          <div className="flex justify-around items-center">
            {forecastDays.map((day, index) => {
              const dayIconUrl = `https://openweathermap.org/img/wn/${day.icon || "02d"}@2x.png`;
              return (
                <motion.div 
                  key={index}
                  className="flex flex-col items-center"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: 0.5 + index * 0.08 }}
                >
                  <p className="text-sm font-medium text-white/70 uppercase tracking-wider mb-2">
                    {typeof day.day === 'string' ? day.day.substring(0, 3) : `Day ${index + 1}`}
                  </p>
                  <motion.img 
                    src={dayIconUrl}
                    alt="Forecast"
                    className="w-14 h-14"
                    animate={{ y: [-2, 2, -2] }}
                    transition={{ duration: 3, repeat: Infinity, ease: "easeInOut", delay: index * 0.2 }}
                  />
                  <p className="text-lg font-medium text-white mt-1">
                    {Math.round(day.temp_max)}°
                  </p>
                  <p className="text-sm text-white/50">
                    {Math.round(day.temp_min)}°
                  </p>
                </motion.div>
              );
            })}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
