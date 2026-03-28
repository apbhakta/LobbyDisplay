import { motion } from "framer-motion";
import { MapPin, Calendar, Droplets, Wind, Compass, Gauge, ArrowUp, ArrowDown } from "lucide-react";

// Realistic Weather Background with gradient overlays
const WeatherBackground = ({ condition, icon }) => {
  const isNight = icon?.includes("n");
  const isCloudy = icon?.includes("02") || icon?.includes("03") || icon?.includes("04");
  const isRainy = icon?.includes("09") || icon?.includes("10");
  const isStormy = icon?.includes("11");
  const isSnowy = icon?.includes("13");
  const isSunny = icon?.includes("01");
  const isFoggy = icon?.includes("50");

  // Get background gradient based on conditions
  const getBackgroundStyle = () => {
    if (isNight) {
      return {
        background: "linear-gradient(180deg, #0a1628 0%, #1a2744 40%, #2d3a52 100%)",
      };
    }
    if (isStormy) {
      return {
        background: "linear-gradient(180deg, #1f2937 0%, #374151 40%, #4b5563 100%)",
      };
    }
    if (isRainy) {
      return {
        background: "linear-gradient(180deg, #475569 0%, #64748b 50%, #94a3b8 100%)",
      };
    }
    if (isSnowy) {
      return {
        background: "linear-gradient(180deg, #e2e8f0 0%, #cbd5e1 50%, #94a3b8 100%)",
      };
    }
    if (isFoggy) {
      return {
        background: "linear-gradient(180deg, #9ca3af 0%, #d1d5db 50%, #e5e7eb 100%)",
      };
    }
    if (isCloudy) {
      return {
        background: "linear-gradient(180deg, #0ea5e9 0%, #38bdf8 40%, #7dd3fc 100%)",
      };
    }
    // Sunny / Clear
    return {
      background: "linear-gradient(180deg, #0284c7 0%, #0ea5e9 30%, #38bdf8 60%, #7dd3fc 100%)",
    };
  };

  return (
    <div className="absolute inset-0 overflow-hidden" style={getBackgroundStyle()}>
      {/* Ambient light effect for sunny days */}
      {(isSunny || isCloudy) && !isNight && (
        <div className="absolute top-0 right-0 w-[600px] h-[600px] opacity-30">
          <div 
            className="w-full h-full rounded-full"
            style={{
              background: "radial-gradient(circle, rgba(255,255,255,0.4) 0%, rgba(255,255,255,0) 70%)",
            }}
          />
        </div>
      )}

      {/* Subtle cloud layers for cloudy/rainy */}
      {(isCloudy || isRainy) && (
        <>
          <motion.div
            className="absolute w-full h-32 opacity-20"
            style={{
              top: '15%',
              background: 'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.3) 50%, transparent 100%)',
              filter: 'blur(40px)',
            }}
            animate={{ x: ['-50%', '50%'] }}
            transition={{ duration: 60, repeat: Infinity, ease: "linear" }}
          />
          <motion.div
            className="absolute w-full h-48 opacity-15"
            style={{
              top: '30%',
              background: 'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.2) 50%, transparent 100%)',
              filter: 'blur(60px)',
            }}
            animate={{ x: ['50%', '-50%'] }}
            transition={{ duration: 80, repeat: Infinity, ease: "linear" }}
          />
        </>
      )}

      {/* Rain effect */}
      {isRainy && (
        <div className="absolute inset-0 opacity-30">
          {[...Array(100)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-px bg-gradient-to-b from-transparent via-white/40 to-white/60"
              style={{
                left: `${Math.random() * 100}%`,
                top: '-10%',
                height: `${15 + Math.random() * 20}px`,
              }}
              animate={{ y: '120vh' }}
              transition={{
                duration: 0.5 + Math.random() * 0.3,
                repeat: Infinity,
                ease: "linear",
                delay: Math.random() * 2
              }}
            />
          ))}
        </div>
      )}

      {/* Snow effect */}
      {isSnowy && (
        <div className="absolute inset-0 opacity-60">
          {[...Array(60)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-1 h-1 bg-white rounded-full"
              style={{
                left: `${Math.random() * 100}%`,
                top: '-5%',
              }}
              animate={{ 
                y: '110vh',
                x: [0, 30, -30, 0],
              }}
              transition={{
                y: { duration: 8 + Math.random() * 4, repeat: Infinity, ease: "linear" },
                x: { duration: 4, repeat: Infinity, ease: "easeInOut" },
                delay: Math.random() * 5
              }}
            />
          ))}
        </div>
      )}

      {/* Night stars */}
      {isNight && (
        <div className="absolute inset-0">
          {[...Array(50)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-0.5 h-0.5 bg-white rounded-full"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 50}%`,
              }}
              animate={{ opacity: [0.2, 0.8, 0.2] }}
              transition={{ duration: 2 + Math.random() * 3, repeat: Infinity, delay: Math.random() * 2 }}
            />
          ))}
        </div>
      )}

      {/* Fog layers */}
      {isFoggy && (
        <>
          {[...Array(3)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-[200%] h-40"
              style={{
                top: `${40 + i * 15}%`,
                background: 'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.15) 50%, transparent 100%)',
                filter: 'blur(30px)',
              }}
              animate={{ x: ['-50%', '0%'] }}
              transition={{ duration: 30 + i * 10, repeat: Infinity, ease: "linear", repeatType: "reverse" }}
            />
          ))}
        </>
      )}

      {/* Subtle gradient overlay for depth */}
      <div 
        className="absolute inset-0"
        style={{
          background: 'linear-gradient(180deg, transparent 0%, rgba(0,0,0,0.1) 100%)',
        }}
      />
    </div>
  );
};

// Realistic Weather Icon using OpenWeatherMap icons or elegant SVG
const WeatherIcon = ({ icon, size = 180 }) => {
  // Use OpenWeatherMap's official icons for realism
  const iconUrl = `https://openweathermap.org/img/wn/${icon}@4x.png`;
  
  return (
    <motion.div 
      className="relative"
      style={{ width: size, height: size }}
      animate={{ y: [-5, 5, -5] }}
      transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
    >
      <img 
        src={iconUrl} 
        alt="Weather"
        className="w-full h-full object-contain drop-shadow-2xl"
        style={{ filter: 'drop-shadow(0 10px 30px rgba(0,0,0,0.2))' }}
      />
    </motion.div>
  );
};

// Glass card component
const GlassCard = ({ children, className = "" }) => (
  <div 
    className={`backdrop-blur-xl rounded-2xl border border-white/20 ${className}`}
    style={{
      background: 'linear-gradient(135deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.05) 100%)',
      boxShadow: '0 8px 32px rgba(0,0,0,0.1), inset 0 1px 0 rgba(255,255,255,0.2)',
    }}
  >
    {children}
  </div>
);

// Mini forecast icon
const ForecastWeatherIcon = ({ icon }) => {
  const iconUrl = `https://openweathermap.org/img/wn/${icon}@2x.png`;
  return (
    <motion.img 
      src={iconUrl}
      alt="Forecast"
      className="w-16 h-16 object-contain"
      animate={{ y: [-2, 2, -2] }}
      transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
    />
  );
};

export default function WeatherSlide({ weather, forecast, currentTime }) {
  if (!weather) return null;

  const dateStr = currentTime.toLocaleDateString("en-US", { month: "long", day: "numeric" });
  const dayStr = currentTime.toLocaleDateString("en-US", { weekday: "long" });
  const timeStr = currentTime.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });

  // Get 6 days of forecast
  const forecastDays = forecast && forecast.length > 0 
    ? forecast.slice(0, 6) 
    : [
        { day: "Saturday", temp_min: 36, temp_max: 41, icon: "01d" },
        { day: "Sunday", temp_min: 35, temp_max: 55, icon: "02d" },
        { day: "Monday", temp_min: 42, temp_max: 53, icon: "03d" },
        { day: "Tuesday", temp_min: 51, temp_max: 77, icon: "10d" },
        { day: "Wednesday", temp_min: 64, temp_max: 77, icon: "04d" },
        { day: "Thursday", temp_min: 46, temp_max: 58, icon: "02d" },
      ];

  const isNight = weather.icon?.includes("n");
  const textColor = isNight ? "text-white" : "text-white";
  const mutedColor = isNight ? "text-white/70" : "text-white/80";

  return (
    <div 
      className="w-full h-full relative overflow-hidden"
      data-testid="weather-slide"
    >
      {/* Animated Weather Background */}
      <WeatherBackground condition={weather.condition} icon={weather.icon} />

      {/* Content */}
      <div className="relative z-10 h-full flex flex-col p-10 lg:p-14">
        {/* Top Section */}
        <div className="flex justify-between items-start mb-8">
          {/* Location & Time */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <div className="flex items-center gap-3 mb-2">
              <MapPin className={`w-6 h-6 ${textColor}`} />
              <h2 className={`text-3xl lg:text-4xl font-light ${textColor} tracking-wide font-sans`}>
                {weather.city}, Texas
              </h2>
            </div>
            <div className="flex items-center gap-3 ml-9">
              <Calendar className={`w-5 h-5 ${mutedColor}`} />
              <p className={`text-lg ${mutedColor} font-sans`}>
                {dayStr}, {dateStr} • {timeStr}
              </p>
            </div>
          </motion.div>

          {/* Current Condition Badge */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.1 }}
          >
            <GlassCard className="px-6 py-3">
              <p className={`text-lg font-medium ${textColor} capitalize tracking-wide`}>
                {weather.condition}
              </p>
            </GlassCard>
          </motion.div>
        </div>

        {/* Main Content */}
        <div className="flex-1 flex items-center justify-between">
          {/* Left - Temperature */}
          <motion.div 
            className="flex flex-col"
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <div className="flex items-start">
              <span className={`text-[10rem] lg:text-[12rem] font-extralight ${textColor} leading-none tracking-tighter font-sans`}>
                {Math.round(weather.temp)}
              </span>
              <span className={`text-5xl lg:text-6xl font-light ${mutedColor} mt-8`}>°F</span>
            </div>
            <div className="flex items-center gap-6 mt-4 ml-2">
              <div className="flex items-center gap-2">
                <ArrowUp className="w-5 h-5 text-orange-400" />
                <span className={`text-xl ${textColor} font-sans`}>{Math.round(weather.temp_max)}°</span>
              </div>
              <div className="flex items-center gap-2">
                <ArrowDown className="w-5 h-5 text-blue-400" />
                <span className={`text-xl ${textColor} font-sans`}>{Math.round(weather.temp_min)}°</span>
              </div>
            </div>
          </motion.div>

          {/* Center - Weather Icon */}
          <motion.div
            className="flex justify-center"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.3 }}
          >
            <WeatherIcon icon={weather.icon || "02d"} size={220} />
          </motion.div>

          {/* Right - Weather Details */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
          >
            <GlassCard className="p-6 space-y-5">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center">
                  <Droplets className="w-5 h-5 text-blue-300" />
                </div>
                <div>
                  <p className={`text-sm ${mutedColor} uppercase tracking-wider`}>Humidity</p>
                  <p className={`text-xl font-medium ${textColor}`}>{weather.humidity}%</p>
                </div>
              </div>
              
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center">
                  <Wind className="w-5 h-5 text-cyan-300" />
                </div>
                <div>
                  <p className={`text-sm ${mutedColor} uppercase tracking-wider`}>Wind</p>
                  <p className={`text-xl font-medium ${textColor}`}>{weather.wind_speed} mph</p>
                </div>
              </div>
              
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center">
                  <Gauge className="w-5 h-5 text-purple-300" />
                </div>
                <div>
                  <p className={`text-sm ${mutedColor} uppercase tracking-wider`}>Visibility</p>
                  <p className={`text-xl font-medium ${textColor}`}>{weather.visibility} mi</p>
                </div>
              </div>

              <div className="pt-3 border-t border-white/10">
                <div className="flex justify-between text-sm">
                  <span className={mutedColor}>Sunrise</span>
                  <span className={textColor}>{weather.sunrise}</span>
                </div>
                <div className="flex justify-between text-sm mt-2">
                  <span className={mutedColor}>Sunset</span>
                  <span className={textColor}>{weather.sunset}</span>
                </div>
              </div>
            </GlassCard>
          </motion.div>
        </div>

        {/* 6-Day Forecast */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.5 }}
        >
          <GlassCard className="p-6">
            <div className="flex justify-between items-center">
              {forecastDays.map((day, index) => (
                <motion.div 
                  key={index}
                  className="flex flex-col items-center"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.6 + index * 0.1 }}
                >
                  <p className={`text-sm font-medium ${mutedColor} uppercase tracking-wider mb-2`}>
                    {day.day?.substring(0, 3) || `Day ${index + 1}`}
                  </p>
                  <ForecastWeatherIcon icon={day.icon || "02d"} />
                  <div className="flex items-center gap-2 mt-2">
                    <span className={`text-lg font-medium ${textColor}`}>
                      {Math.round(day.temp_max)}°
                    </span>
                    <span className={`text-sm ${mutedColor}`}>
                      {Math.round(day.temp_min)}°
                    </span>
                  </div>
                </motion.div>
              ))}
            </div>
          </GlassCard>
        </motion.div>
      </div>
    </div>
  );
}
