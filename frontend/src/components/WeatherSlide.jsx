import { motion } from "framer-motion";
import { MapPin, Calendar, Sunrise, Sunset, Droplets, Wind, Compass, Gauge } from "lucide-react";

// Animated Weather Backgrounds based on condition
const WeatherBackground = ({ condition, icon }) => {
  const isNight = icon?.includes("n");
  const isCloudy = icon?.includes("02") || icon?.includes("03") || icon?.includes("04");
  const isRainy = icon?.includes("09") || icon?.includes("10");
  const isStormy = icon?.includes("11");
  const isSnowy = icon?.includes("13");
  const isSunny = icon?.includes("01");
  const isFoggy = icon?.includes("50");

  // Base gradient based on condition
  const getGradient = () => {
    if (isNight) return "linear-gradient(180deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)";
    if (isStormy) return "linear-gradient(180deg, #2c3e50 0%, #34495e 50%, #1a252f 100%)";
    if (isRainy) return "linear-gradient(180deg, #4a6572 0%, #5d8aa8 50%, #7db8c9 100%)";
    if (isSnowy) return "linear-gradient(180deg, #83a4d4 0%, #b6d0e2 50%, #e8f4f8 100%)";
    if (isFoggy) return "linear-gradient(180deg, #757F9A 0%, #9CA4B8 50%, #D7DDE8 100%)";
    if (isCloudy) return "linear-gradient(180deg, #3a7bd5 0%, #5ba3d9 50%, #7ec8e3 100%)";
    return "linear-gradient(180deg, #2196F3 0%, #64B5F6 40%, #87CEEB 100%)"; // Sunny default
  };

  return (
    <div className="absolute inset-0 overflow-hidden" style={{ background: getGradient() }}>
      {/* Animated Sun for sunny/partly cloudy */}
      {(isSunny || isCloudy) && !isNight && (
        <motion.div
          className="absolute top-10 right-20"
          animate={{ 
            rotate: 360,
            scale: [1, 1.05, 1]
          }}
          transition={{ 
            rotate: { duration: 60, repeat: Infinity, ease: "linear" },
            scale: { duration: 4, repeat: Infinity, ease: "easeInOut" }
          }}
        >
          <div className="relative">
            {/* Sun rays */}
            {[...Array(12)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute w-2 h-16 bg-yellow-300/30 rounded-full"
                style={{
                  left: '50%',
                  top: '50%',
                  transform: `translate(-50%, -50%) rotate(${i * 30}deg)`,
                  transformOrigin: 'center 80px'
                }}
                animate={{ opacity: [0.3, 0.6, 0.3] }}
                transition={{ duration: 2, repeat: Infinity, delay: i * 0.1 }}
              />
            ))}
            {/* Sun core */}
            <div className="w-24 h-24 rounded-full bg-gradient-to-br from-yellow-300 to-orange-400 shadow-lg shadow-yellow-500/50" />
          </div>
        </motion.div>
      )}

      {/* Animated Clouds */}
      {(isCloudy || isRainy || isStormy) && (
        <>
          {[...Array(5)].map((_, i) => (
            <motion.div
              key={`cloud-${i}`}
              className="absolute"
              style={{
                top: `${10 + i * 15}%`,
                width: `${150 + i * 30}px`,
                height: `${60 + i * 15}px`,
              }}
              initial={{ left: '-20%' }}
              animate={{ left: '120%' }}
              transition={{
                duration: 30 + i * 10,
                repeat: Infinity,
                ease: "linear",
                delay: i * 5
              }}
            >
              <div className="relative w-full h-full">
                <div className="absolute bottom-0 left-1/4 w-1/2 h-3/4 bg-white/80 rounded-full" />
                <div className="absolute bottom-0 left-0 w-2/5 h-1/2 bg-white/70 rounded-full" />
                <div className="absolute bottom-0 right-0 w-2/5 h-2/3 bg-white/75 rounded-full" />
              </div>
            </motion.div>
          ))}
        </>
      )}

      {/* Rain drops */}
      {isRainy && (
        <>
          {[...Array(50)].map((_, i) => (
            <motion.div
              key={`rain-${i}`}
              className="absolute w-0.5 h-6 bg-gradient-to-b from-transparent via-blue-300/60 to-blue-400/80 rounded-full"
              style={{
                left: `${Math.random() * 100}%`,
                top: '-5%'
              }}
              animate={{ y: '110vh' }}
              transition={{
                duration: 0.8 + Math.random() * 0.4,
                repeat: Infinity,
                ease: "linear",
                delay: Math.random() * 2
              }}
            />
          ))}
        </>
      )}

      {/* Lightning for storms */}
      {isStormy && (
        <motion.div
          className="absolute inset-0 bg-white/20"
          animate={{ opacity: [0, 0, 1, 0, 0, 0, 0.5, 0] }}
          transition={{ duration: 5, repeat: Infinity, repeatDelay: 3 }}
        />
      )}

      {/* Snow flakes */}
      {isSnowy && (
        <>
          {[...Array(40)].map((_, i) => (
            <motion.div
              key={`snow-${i}`}
              className="absolute w-2 h-2 bg-white rounded-full opacity-80"
              style={{
                left: `${Math.random() * 100}%`,
                top: '-5%'
              }}
              animate={{ 
                y: '110vh',
                x: [0, 20, -20, 0],
                rotate: 360
              }}
              transition={{
                y: { duration: 5 + Math.random() * 5, repeat: Infinity, ease: "linear" },
                x: { duration: 3, repeat: Infinity, ease: "easeInOut" },
                rotate: { duration: 4, repeat: Infinity, ease: "linear" },
                delay: Math.random() * 5
              }}
            />
          ))}
        </>
      )}

      {/* Stars for night */}
      {isNight && (
        <>
          {[...Array(30)].map((_, i) => (
            <motion.div
              key={`star-${i}`}
              className="absolute w-1 h-1 bg-white rounded-full"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 60}%`
              }}
              animate={{ opacity: [0.3, 1, 0.3], scale: [1, 1.2, 1] }}
              transition={{ duration: 2 + Math.random() * 2, repeat: Infinity, delay: Math.random() * 2 }}
            />
          ))}
          {/* Moon */}
          <motion.div
            className="absolute top-16 right-24 w-20 h-20 rounded-full bg-gradient-to-br from-gray-100 to-gray-300 shadow-lg shadow-white/20"
            animate={{ scale: [1, 1.02, 1] }}
            transition={{ duration: 4, repeat: Infinity }}
          />
        </>
      )}

      {/* Fog layers */}
      {isFoggy && (
        <>
          {[...Array(4)].map((_, i) => (
            <motion.div
              key={`fog-${i}`}
              className="absolute w-full h-32 bg-gradient-to-r from-transparent via-white/30 to-transparent"
              style={{ top: `${30 + i * 20}%` }}
              animate={{ x: ['-100%', '100%'] }}
              transition={{ duration: 20 + i * 5, repeat: Infinity, ease: "linear", delay: i * 3 }}
            />
          ))}
        </>
      )}
    </div>
  );
};

// Animated 3D-style Weather Icon
const AnimatedWeatherIcon = ({ icon, size = 200 }) => {
  const isSunny = icon?.includes("01");
  const isPartlyCloudy = icon?.includes("02");
  const isCloudy = icon?.includes("03") || icon?.includes("04");
  const isRainy = icon?.includes("09") || icon?.includes("10");
  const isStormy = icon?.includes("11");
  const isSnowy = icon?.includes("13");
  const isFoggy = icon?.includes("50");

  return (
    <div className="relative" style={{ width: size, height: size }}>
      {/* Sunny */}
      {isSunny && (
        <motion.div 
          className="w-full h-full flex items-center justify-center"
          animate={{ rotate: 360 }}
          transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
        >
          <div className="relative">
            {/* Rays */}
            {[...Array(8)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute w-3 h-8 bg-gradient-to-t from-yellow-400 to-yellow-200 rounded-full"
                style={{
                  left: '50%',
                  top: '50%',
                  transform: `translate(-50%, -50%) rotate(${i * 45}deg) translateY(-60px)`,
                }}
                animate={{ scaleY: [1, 1.3, 1], opacity: [0.8, 1, 0.8] }}
                transition={{ duration: 1.5, repeat: Infinity, delay: i * 0.1 }}
              />
            ))}
            <motion.div 
              className="w-28 h-28 rounded-full bg-gradient-to-br from-yellow-300 via-yellow-400 to-orange-400 shadow-2xl"
              animate={{ scale: [1, 1.05, 1] }}
              transition={{ duration: 3, repeat: Infinity }}
            />
          </div>
        </motion.div>
      )}

      {/* Partly Cloudy */}
      {isPartlyCloudy && (
        <div className="w-full h-full flex items-center justify-center relative">
          <motion.div 
            className="absolute top-4 right-8 w-20 h-20 rounded-full bg-gradient-to-br from-yellow-300 to-orange-400 shadow-lg"
            animate={{ scale: [1, 1.1, 1] }}
            transition={{ duration: 3, repeat: Infinity }}
          />
          <motion.div
            className="relative"
            animate={{ x: [-5, 5, -5] }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
          >
            <div className="w-32 h-20 relative">
              <div className="absolute bottom-0 left-4 w-24 h-16 bg-gradient-to-b from-white to-gray-100 rounded-full shadow-xl" />
              <div className="absolute bottom-0 left-0 w-16 h-12 bg-gradient-to-b from-white to-gray-100 rounded-full shadow-lg" />
              <div className="absolute bottom-0 right-0 w-20 h-14 bg-gradient-to-b from-white to-gray-100 rounded-full shadow-lg" />
            </div>
          </motion.div>
        </div>
      )}

      {/* Cloudy */}
      {isCloudy && (
        <motion.div
          className="w-full h-full flex items-center justify-center"
          animate={{ x: [-8, 8, -8], y: [-3, 3, -3] }}
          transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
        >
          <div className="w-36 h-24 relative">
            <div className="absolute bottom-0 left-6 w-28 h-20 bg-gradient-to-b from-white to-gray-200 rounded-full shadow-xl" />
            <div className="absolute bottom-0 left-0 w-20 h-14 bg-gradient-to-b from-gray-100 to-gray-300 rounded-full shadow-lg" />
            <div className="absolute bottom-0 right-0 w-24 h-16 bg-gradient-to-b from-white to-gray-200 rounded-full shadow-lg" />
          </div>
        </motion.div>
      )}

      {/* Rainy */}
      {isRainy && (
        <div className="w-full h-full flex items-center justify-center relative">
          <motion.div
            animate={{ y: [-3, 3, -3] }}
            transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
          >
            <div className="w-32 h-20 relative">
              <div className="absolute bottom-0 left-4 w-24 h-16 bg-gradient-to-b from-gray-300 to-gray-400 rounded-full shadow-xl" />
              <div className="absolute bottom-0 left-0 w-16 h-12 bg-gradient-to-b from-gray-400 to-gray-500 rounded-full shadow-lg" />
              <div className="absolute bottom-0 right-0 w-20 h-14 bg-gradient-to-b from-gray-300 to-gray-400 rounded-full shadow-lg" />
            </div>
          </motion.div>
          {/* Rain drops */}
          {[...Array(5)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-1 h-4 bg-gradient-to-b from-blue-300 to-blue-500 rounded-full"
              style={{ left: `${30 + i * 10}%`, top: '60%' }}
              animate={{ y: [0, 40], opacity: [1, 0] }}
              transition={{ duration: 0.6, repeat: Infinity, delay: i * 0.15 }}
            />
          ))}
        </div>
      )}

      {/* Stormy */}
      {isStormy && (
        <div className="w-full h-full flex items-center justify-center relative">
          <motion.div
            animate={{ y: [-3, 3, -3] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          >
            <div className="w-32 h-20 relative">
              <div className="absolute bottom-0 left-4 w-24 h-16 bg-gradient-to-b from-gray-500 to-gray-700 rounded-full shadow-xl" />
              <div className="absolute bottom-0 left-0 w-16 h-12 bg-gradient-to-b from-gray-600 to-gray-800 rounded-full shadow-lg" />
              <div className="absolute bottom-0 right-0 w-20 h-14 bg-gradient-to-b from-gray-500 to-gray-700 rounded-full shadow-lg" />
            </div>
          </motion.div>
          {/* Lightning */}
          <motion.svg
            className="absolute bottom-4 left-1/2 -translate-x-1/2 w-8 h-16"
            viewBox="0 0 24 48"
            animate={{ opacity: [0, 1, 0], scale: [0.9, 1.1, 0.9] }}
            transition={{ duration: 0.3, repeat: Infinity, repeatDelay: 2 }}
          >
            <path d="M14 0 L8 20 L14 20 L10 48 L18 24 L12 24 Z" fill="#FFD700" />
          </motion.svg>
        </div>
      )}

      {/* Snowy */}
      {isSnowy && (
        <div className="w-full h-full flex items-center justify-center relative">
          <motion.div
            animate={{ y: [-3, 3, -3] }}
            transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
          >
            <div className="w-32 h-20 relative">
              <div className="absolute bottom-0 left-4 w-24 h-16 bg-gradient-to-b from-gray-200 to-gray-300 rounded-full shadow-xl" />
              <div className="absolute bottom-0 left-0 w-16 h-12 bg-gradient-to-b from-gray-100 to-gray-200 rounded-full shadow-lg" />
              <div className="absolute bottom-0 right-0 w-20 h-14 bg-gradient-to-b from-gray-200 to-gray-300 rounded-full shadow-lg" />
            </div>
          </motion.div>
          {/* Snowflakes */}
          {[...Array(5)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-3 h-3 text-white"
              style={{ left: `${25 + i * 12}%`, top: '55%' }}
              animate={{ y: [0, 50], opacity: [1, 0], rotate: 360 }}
              transition={{ duration: 1.5, repeat: Infinity, delay: i * 0.2 }}
            >
              ❄
            </motion.div>
          ))}
        </div>
      )}

      {/* Foggy */}
      {isFoggy && (
        <div className="w-full h-full flex items-center justify-center">
          {[...Array(4)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute h-3 rounded-full bg-gradient-to-r from-transparent via-gray-300 to-transparent"
              style={{ 
                width: `${60 + i * 20}px`,
                top: `${35 + i * 12}%`
              }}
              animate={{ x: [-20, 20, -20], opacity: [0.5, 0.8, 0.5] }}
              transition={{ duration: 3 + i, repeat: Infinity, delay: i * 0.5 }}
            />
          ))}
        </div>
      )}
    </div>
  );
};

// Mini forecast icon
const ForecastIcon = ({ icon, size = 64 }) => {
  const getIconStyle = () => {
    if (icon?.includes("01")) return { type: "sunny", bg: "from-yellow-300 to-orange-400" };
    if (icon?.includes("02")) return { type: "partlyCloudy", bg: "from-yellow-300 to-orange-400" };
    if (icon?.includes("03") || icon?.includes("04")) return { type: "cloudy", bg: "from-gray-200 to-gray-400" };
    if (icon?.includes("09") || icon?.includes("10")) return { type: "rainy", bg: "from-gray-400 to-gray-600" };
    if (icon?.includes("11")) return { type: "stormy", bg: "from-gray-600 to-gray-800" };
    if (icon?.includes("13")) return { type: "snowy", bg: "from-blue-200 to-blue-400" };
    if (icon?.includes("50")) return { type: "foggy", bg: "from-gray-300 to-gray-500" };
    return { type: "sunny", bg: "from-yellow-300 to-orange-400" };
  };

  const style = getIconStyle();

  return (
    <motion.div 
      className="relative flex items-center justify-center"
      style={{ width: size, height: size }}
      animate={{ y: [-2, 2, -2] }}
      transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
    >
      {style.type === "sunny" && (
        <motion.div 
          className={`w-12 h-12 rounded-full bg-gradient-to-br ${style.bg} shadow-lg`}
          animate={{ scale: [1, 1.1, 1] }}
          transition={{ duration: 2, repeat: Infinity }}
        />
      )}
      {style.type === "partlyCloudy" && (
        <div className="relative">
          <div className={`absolute -top-2 -right-1 w-8 h-8 rounded-full bg-gradient-to-br ${style.bg}`} />
          <div className="w-12 h-8 relative">
            <div className="absolute bottom-0 left-1 w-10 h-6 bg-white rounded-full shadow" />
            <div className="absolute bottom-0 left-0 w-6 h-4 bg-gray-100 rounded-full" />
          </div>
        </div>
      )}
      {style.type === "cloudy" && (
        <div className="w-14 h-10 relative">
          <div className="absolute bottom-0 left-2 w-10 h-7 bg-gradient-to-b from-white to-gray-200 rounded-full shadow" />
          <div className="absolute bottom-0 left-0 w-7 h-5 bg-gray-200 rounded-full" />
          <div className="absolute bottom-0 right-0 w-8 h-6 bg-gray-100 rounded-full" />
        </div>
      )}
      {style.type === "rainy" && (
        <div className="relative">
          <div className="w-12 h-8 relative">
            <div className="absolute bottom-0 left-1 w-10 h-6 bg-gradient-to-b from-gray-300 to-gray-400 rounded-full shadow" />
            <div className="absolute bottom-0 left-0 w-6 h-4 bg-gray-400 rounded-full" />
          </div>
          <motion.div 
            className="absolute -bottom-2 left-3 w-1 h-2 bg-blue-400 rounded-full"
            animate={{ y: [0, 8], opacity: [1, 0] }}
            transition={{ duration: 0.5, repeat: Infinity }}
          />
          <motion.div 
            className="absolute -bottom-2 left-6 w-1 h-2 bg-blue-400 rounded-full"
            animate={{ y: [0, 8], opacity: [1, 0] }}
            transition={{ duration: 0.5, repeat: Infinity, delay: 0.2 }}
          />
        </div>
      )}
      {style.type === "stormy" && (
        <div className="relative">
          <div className="w-12 h-8 bg-gradient-to-b from-gray-500 to-gray-700 rounded-full shadow" />
          <motion.div 
            className="absolute -bottom-1 left-4 text-yellow-400 text-xs"
            animate={{ opacity: [0, 1, 0] }}
            transition={{ duration: 0.5, repeat: Infinity, repeatDelay: 1 }}
          >
            ⚡
          </motion.div>
        </div>
      )}
      {style.type === "snowy" && (
        <div className="relative">
          <div className="w-12 h-8 bg-gradient-to-b from-gray-200 to-gray-300 rounded-full shadow" />
          <motion.div 
            className="absolute -bottom-1 left-3 text-white text-xs"
            animate={{ y: [0, 6], opacity: [1, 0] }}
            transition={{ duration: 1, repeat: Infinity }}
          >
            ❄
          </motion.div>
        </div>
      )}
      {style.type === "foggy" && (
        <div className="flex flex-col gap-1">
          <motion.div className="w-10 h-1.5 bg-gray-300 rounded-full" animate={{ x: [-3, 3, -3] }} transition={{ duration: 2, repeat: Infinity }} />
          <motion.div className="w-12 h-1.5 bg-gray-400 rounded-full" animate={{ x: [3, -3, 3] }} transition={{ duration: 2.5, repeat: Infinity }} />
          <motion.div className="w-8 h-1.5 bg-gray-300 rounded-full" animate={{ x: [-2, 2, -2] }} transition={{ duration: 2, repeat: Infinity }} />
        </div>
      )}
    </motion.div>
  );
};

export default function WeatherSlide({ weather, forecast, currentTime }) {
  if (!weather) return null;

  const dateStr = currentTime.toLocaleDateString("en-US", { month: "long", day: "numeric" });
  const dayStr = currentTime.toLocaleDateString("en-US", { weekday: "long" });

  // Get 6 days of forecast
  const forecastDays = forecast && forecast.length > 0 
    ? forecast.slice(0, 6) 
    : [
        { day: "Sunday", temp_max: 35, icon: "01d" },
        { day: "Monday", temp_max: 21, icon: "02d" },
        { day: "Tuesday", temp_max: 29, icon: "10d" },
        { day: "Wednesday", temp_max: 7, icon: "04d" },
        { day: "Thursday", temp_max: -3, icon: "13d" },
        { day: "Friday", temp_max: 1, icon: "02d" },
      ];

  return (
    <div 
      className="w-full h-full relative overflow-hidden"
      data-testid="weather-slide"
    >
      {/* Animated Weather Background */}
      <WeatherBackground condition={weather.condition} icon={weather.icon} />

      {/* Content Overlay */}
      <div className="relative z-10 h-full flex flex-col p-10 lg:p-14">
        {/* Main Content Area */}
        <div className="flex-1 flex items-center justify-between">
          {/* Left Column - Location, Date, Temperature */}
          <div className="flex flex-col gap-6">
            {/* Location */}
            <motion.div 
              className="flex items-center gap-3"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
            >
              <MapPin className="w-7 h-7 text-white" />
              <div>
                <p className="text-2xl lg:text-3xl font-semibold text-white font-sans">{weather.city}</p>
              </div>
            </motion.div>

            {/* Date */}
            <motion.div 
              className="flex items-center gap-3"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
            >
              <Calendar className="w-6 h-6 text-white/80" />
              <div>
                <p className="text-xl text-white font-sans">{dateStr}</p>
                <p className="text-lg text-white/70 font-sans">{dayStr}</p>
              </div>
            </motion.div>

            {/* Temperature */}
            <motion.div 
              className="flex items-start gap-2 mt-4"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <div className="flex items-center gap-3">
                {/* Thermometer icon */}
                <div className="w-10 h-24 relative">
                  <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-6 h-6 rounded-full bg-red-500" />
                  <div className="absolute bottom-3 left-1/2 -translate-x-1/2 w-3 h-16 bg-gradient-to-t from-red-500 to-red-300 rounded-t-full" />
                  <div className="absolute bottom-3 left-1/2 -translate-x-1/2 w-4 h-20 border-2 border-white/50 rounded-full" />
                </div>
                <div>
                  <span className="text-7xl lg:text-8xl font-light text-white font-sans">
                    {Math.round(weather.temp)}
                  </span>
                  <span className="text-4xl text-white/80 align-top">°F</span>
                  <p className="text-lg text-white/70 font-sans mt-1">
                    Feels like {Math.round(weather.temp - 5)}°
                  </p>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Center - Large Animated Weather Icon */}
          <motion.div 
            className="flex flex-col items-center"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
          >
            <AnimatedWeatherIcon icon={weather.icon} size={220} />
            <p className="text-2xl lg:text-3xl text-white font-sans mt-4 capitalize">
              {weather.condition}
            </p>
          </motion.div>

          {/* Right Column - Weather Details */}
          <motion.div 
            className="flex flex-col gap-5"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            <div className="flex items-center gap-4">
              <Sunrise className="w-6 h-6 text-amber-300" />
              <span className="text-lg text-white font-sans">Sunrise {weather.sunrise}</span>
            </div>
            <div className="flex items-center gap-4">
              <Sunset className="w-6 h-6 text-orange-400" />
              <span className="text-lg text-white font-sans">Sunset {weather.sunset}</span>
            </div>
            <div className="flex items-center gap-4">
              <Droplets className="w-6 h-6 text-blue-300" />
              <span className="text-lg text-white font-sans">{weather.humidity}%</span>
            </div>
            <div className="flex items-center gap-4">
              <Wind className="w-6 h-6 text-white/80" />
              <span className="text-lg text-white font-sans">{weather.wind_speed} mph</span>
            </div>
            <div className="flex items-center gap-4">
              <Compass className="w-6 h-6 text-white/80" />
              <span className="text-lg text-white font-sans">North-East</span>
            </div>
            <div className="flex items-center gap-4">
              <Gauge className="w-6 h-6 text-white/80" />
              <span className="text-lg text-white font-sans">1035.0 mb</span>
            </div>
          </motion.div>
        </div>

        {/* 6-Day Forecast Bar */}
        <motion.div 
          className="mt-auto bg-white/20 backdrop-blur-md rounded-2xl p-6"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.5 }}
        >
          <div className="flex justify-around items-center">
            {forecastDays.map((day, index) => (
              <motion.div 
                key={index}
                className="flex flex-col items-center gap-3"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.6 + index * 0.1 }}
              >
                <ForecastIcon icon={day.icon} />
                <p className="text-2xl font-medium text-white font-sans">
                  {day.temp_max > 0 ? '+' : ''}{Math.round(day.temp_max)}°
                </p>
                <p className="text-sm text-white/80 font-sans">
                  {day.day?.substring(0, 3) || `Day ${index + 1}`}
                </p>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
