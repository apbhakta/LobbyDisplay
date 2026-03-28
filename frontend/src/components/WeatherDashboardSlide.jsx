import { 
  Sun, 
  Cloud, 
  CloudRain, 
  CloudSnow, 
  CloudLightning, 
  Wind, 
  Droplets, 
  Eye,
  Sunrise,
  Sunset
} from "lucide-react";

// Get UV Index description
const getUVDescription = (uv) => {
  if (uv <= 2) return "Low";
  if (uv <= 5) return "Moderate";
  if (uv <= 7) return "High";
  if (uv <= 10) return "Very High";
  return "Extreme";
};

// Get Air Quality description
const getAQDescription = (aqi) => {
  if (aqi <= 50) return "Good";
  if (aqi <= 100) return "Moderate";
  if (aqi <= 150) return "Unhealthy";
  if (aqi <= 200) return "Very Unhealthy";
  return "Hazardous";
};

// Get Air Quality color
const getAQColor = (aqi) => {
  if (aqi <= 50) return "text-emerald-500";
  if (aqi <= 100) return "text-yellow-500";
  if (aqi <= 150) return "text-orange-500";
  return "text-red-500";
};

// Weather icon component
const WeatherIconDisplay = ({ icon, size = 64 }) => {
  const iconClass = `w-${size/4} h-${size/4}`;
  
  if (icon?.includes("01")) {
    return <Sun className={iconClass} style={{ width: size, height: size, color: "#FFD93D" }} />;
  }
  if (icon?.includes("02") || icon?.includes("03")) {
    return <Cloud className={iconClass} style={{ width: size, height: size, color: "#fff" }} />;
  }
  if (icon?.includes("04")) {
    return <Cloud className={iconClass} style={{ width: size, height: size, color: "#94A3B8" }} />;
  }
  if (icon?.includes("09") || icon?.includes("10")) {
    return <CloudRain className={iconClass} style={{ width: size, height: size, color: "#60A5FA" }} />;
  }
  if (icon?.includes("11")) {
    return <CloudLightning className={iconClass} style={{ width: size, height: size, color: "#FBBF24" }} />;
  }
  if (icon?.includes("13")) {
    return <CloudSnow className={iconClass} style={{ width: size, height: size, color: "#BFDBFE" }} />;
  }
  if (icon?.includes("50")) {
    return <Wind className={iconClass} style={{ width: size, height: size, color: "#94A3B8" }} />;
  }
  return <Cloud className={iconClass} style={{ width: size, height: size, color: "#fff" }} />;
};

export default function WeatherDashboardSlide({ weather, hourly, currentTime }) {
  if (!weather) return null;

  const dateStr = currentTime.toLocaleDateString("en-US", { 
    weekday: "long"
  });
  const timeStr = currentTime.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit"
  });

  // Generate hourly data if not available
  const hourlyData = hourly && hourly.length > 0 
    ? hourly.slice(0, 8) 
    : Array.from({length: 8}, (_, i) => ({
        time: `${(i * 3) % 12 || 12} ${i * 3 < 12 ? 'AM' : 'PM'}`,
        temp: Math.round(weather.temp + (Math.random() - 0.5) * 10)
      }));

  return (
    <div 
      className="w-full h-full p-10 lg:p-14 flex gap-8"
      style={{
        background: "linear-gradient(135deg, #0d9488 0%, #14b8a6 30%, #06b6d4 70%, #0891b2 100%)"
      }}
      data-testid="weather-dashboard-slide"
    >
      {/* Left Column - Current Weather */}
      <div className="w-[35%] flex flex-col justify-between">
        {/* Temperature Gauge */}
        <div className="flex justify-center">
          <div className="w-56 h-56 lg:w-72 lg:h-72 relative">
            <svg viewBox="0 0 200 200" className="w-full h-full">
              {/* Gauge background arc */}
              <path
                d="M 30 150 A 80 80 0 1 1 170 150"
                fill="none"
                stroke="rgba(255,255,255,0.2)"
                strokeWidth="14"
                strokeLinecap="round"
              />
              {/* Gauge fill */}
              <path
                d="M 30 150 A 80 80 0 1 1 170 150"
                fill="none"
                stroke="url(#tempGradient)"
                strokeWidth="14"
                strokeLinecap="round"
                strokeDasharray="380"
                strokeDashoffset={380 - (380 * Math.min(Math.max((weather.temp + 10) / 110, 0), 1) * 0.75)}
              />
              <defs>
                <linearGradient id="tempGradient" x1="0%" y1="100%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#22c55e" />
                  <stop offset="50%" stopColor="#eab308" />
                  <stop offset="100%" stopColor="#ef4444" />
                </linearGradient>
              </defs>
              {/* Temperature markers */}
              <text x="20" y="165" fill="white" fontSize="11" opacity="0.6">-10°</text>
              <text x="55" y="50" fill="white" fontSize="11" opacity="0.6">20°</text>
              <text x="130" y="50" fill="white" fontSize="11" opacity="0.6">60°</text>
              <text x="165" y="165" fill="white" fontSize="11" opacity="0.6">100°</text>
            </svg>
            {/* Center content */}
            <div className="absolute inset-0 flex items-center justify-center pt-4">
              <div className="text-center">
                <WeatherIconDisplay icon={weather.icon} size={48} />
              </div>
            </div>
          </div>
        </div>

        {/* Current Temperature */}
        <div className="text-center -mt-4">
          <div className="flex items-start justify-center gap-1">
            <span className="text-8xl lg:text-9xl font-extralight text-white font-sans tracking-tighter">
              {Math.round(weather.temp)}
            </span>
            <span className="text-3xl text-white/70 mt-4">°F</span>
          </div>
          <div className="flex items-center justify-center gap-2 mt-2">
            <Cloud className="w-5 h-5 text-white/60" />
            <p className="text-white/70 text-lg font-sans">{weather.condition}</p>
          </div>
        </div>

        {/* Date/Time */}
        <div className="mt-4">
          <p className="text-white text-xl font-sans">{dateStr}, {timeStr}</p>
        </div>

        {/* High/Low Card */}
        <div className="mt-4 rounded-2xl p-5 flex justify-around"
          style={{ background: "linear-gradient(135deg, #f97316 0%, #fbbf24 100%)" }}>
          <div className="text-center">
            <p className="text-4xl font-light text-white">{Math.round(weather.temp_max)}°</p>
            <div className="flex items-center justify-center gap-1 mt-1">
              <Sun className="w-4 h-4 text-white/80" />
              <p className="text-white/80 text-sm uppercase tracking-wider">High</p>
            </div>
          </div>
          <div className="w-px bg-white/30" />
          <div className="text-center">
            <p className="text-4xl font-light text-white">{Math.round(weather.temp_min)}°</p>
            <div className="flex items-center justify-center gap-1 mt-1">
              <Cloud className="w-4 h-4 text-white/80" />
              <p className="text-white/80 text-sm uppercase tracking-wider">Low</p>
            </div>
          </div>
        </div>
      </div>

      {/* Right Column - Details */}
      <div className="w-[65%] flex flex-col gap-5">
        {/* Hourly Forecast */}
        <div className="rounded-2xl p-5"
          style={{ background: "linear-gradient(135deg, #f59e0b 0%, #f97316 100%)" }}>
          <h3 className="text-white font-semibold text-lg mb-4 font-sans">Today</h3>
          <div className="flex justify-between items-end h-28">
            {hourlyData.map((h, i) => {
              const barHeight = Math.max(25, Math.min(90, ((h.temp - 30) / 70) * 90));
              return (
                <div key={i} className="flex flex-col items-center gap-2">
                  <span className="text-white text-sm font-medium">{h.temp}°</span>
                  <div 
                    className="w-5 bg-white/90 rounded-sm"
                    style={{ height: `${barHeight}px` }}
                  />
                  <span className="text-white/70 text-xs">{h.time}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Highlights Section */}
        <div>
          <h3 className="text-white font-semibold text-xl mb-4 font-sans">Highlights</h3>
          <div className="grid grid-cols-3 gap-4">
            {/* UV Index */}
            <div className="bg-white/95 rounded-xl p-4 text-gray-800">
              <p className="text-xs text-gray-500 uppercase tracking-wider mb-2 font-semibold">UV Index</p>
              <div className="flex items-center gap-4">
                <div className="relative w-14 h-14">
                  <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
                    <circle cx="50" cy="50" r="40" fill="none" stroke="#e5e7eb" strokeWidth="8" />
                    <circle 
                      cx="50" cy="50" r="40" fill="none" 
                      stroke="#eab308" strokeWidth="8"
                      strokeDasharray="251"
                      strokeDashoffset={251 - (251 * weather.uv_index / 11)}
                      strokeLinecap="round"
                    />
                  </svg>
                  <span className="absolute inset-0 flex items-center justify-center text-xl font-bold text-gray-800">
                    {weather.uv_index}
                  </span>
                </div>
                <span className="text-sm text-gray-600">{getUVDescription(weather.uv_index)}</span>
              </div>
            </div>

            {/* Wind Status */}
            <div className="bg-white/95 rounded-xl p-4 text-gray-800">
              <p className="text-xs text-gray-500 uppercase tracking-wider mb-2 font-semibold">Wind Status</p>
              <p className="text-4xl font-light text-gray-800">{weather.wind_speed} <span className="text-base text-gray-500">mph</span></p>
              <p className="text-xs text-gray-500 mt-1">Current wind speed</p>
            </div>

            {/* Sunrise & Sunset */}
            <div className="bg-white/95 rounded-xl p-4 text-gray-800">
              <p className="text-xs text-gray-500 uppercase tracking-wider mb-2 font-semibold">Sunrise & Sunset</p>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Sunrise className="w-5 h-5 text-amber-500" />
                  <span className="text-lg font-medium">{weather.sunrise}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Sunset className="w-5 h-5 text-orange-500" />
                  <span className="text-lg font-medium">{weather.sunset}</span>
                </div>
              </div>
            </div>

            {/* Humidity */}
            <div className="bg-white/95 rounded-xl p-4 text-gray-800">
              <p className="text-xs text-gray-500 uppercase tracking-wider mb-2 font-semibold">Humidity</p>
              <div className="flex items-center gap-3">
                <Droplets className="w-7 h-7 text-blue-500" />
                <span className="text-4xl font-light">{weather.humidity}<span className="text-base text-gray-500">%</span></span>
              </div>
              <p className="text-xs text-gray-500 mt-1">
                {weather.humidity < 30 ? "Low" : weather.humidity < 60 ? "Normal" : "High"}
              </p>
            </div>

            {/* Visibility */}
            <div className="bg-white/95 rounded-xl p-4 text-gray-800">
              <p className="text-xs text-gray-500 uppercase tracking-wider mb-2 font-semibold">Visibility</p>
              <div className="flex items-center gap-3">
                <Eye className="w-7 h-7 text-gray-500" />
                <span className="text-4xl font-light">{weather.visibility}<span className="text-base text-gray-500">mi</span></span>
              </div>
              <p className="text-xs text-gray-500 mt-1">
                {weather.visibility > 6 ? "Clear" : weather.visibility > 3 ? "Average" : "Poor"}
              </p>
            </div>

            {/* Air Quality */}
            <div className="bg-white/95 rounded-xl p-4 text-gray-800">
              <p className="text-xs text-gray-500 uppercase tracking-wider mb-2 font-semibold">Air Quality</p>
              <p className={`text-4xl font-light ${getAQColor(weather.air_quality)}`}>
                {weather.air_quality}
              </p>
              <p className="text-xs text-gray-500 mt-1">{getAQDescription(weather.air_quality)}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
