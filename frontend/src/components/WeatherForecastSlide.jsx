import { MapPin, Sun, Cloud, CloudRain, CloudSnow, CloudLightning, Wind } from "lucide-react";

// Weather icon component for current display
const CurrentWeatherIcon = ({ icon }) => {
  const baseClass = "drop-shadow-lg";
  
  // Partly cloudy - sun with cloud
  if (icon?.includes("02")) {
    return (
      <div className="relative w-36 h-36">
        <Sun className={`w-28 h-28 absolute top-0 left-0 ${baseClass}`} style={{ color: "#FFD93D" }} />
        <Cloud className={`w-24 h-24 absolute bottom-0 right-0 ${baseClass}`} style={{ color: "#fff" }} />
      </div>
    );
  }
  
  if (icon?.includes("01")) {
    return <Sun className={`w-32 h-32 ${baseClass}`} style={{ color: "#FFD93D" }} />;
  }
  if (icon?.includes("03") || icon?.includes("04")) {
    return <Cloud className={`w-32 h-32 ${baseClass}`} style={{ color: "#94A3B8" }} />;
  }
  if (icon?.includes("09") || icon?.includes("10")) {
    return <CloudRain className={`w-32 h-32 ${baseClass}`} style={{ color: "#60A5FA" }} />;
  }
  if (icon?.includes("11")) {
    return <CloudLightning className={`w-32 h-32 ${baseClass}`} style={{ color: "#FBBF24" }} />;
  }
  if (icon?.includes("13")) {
    return <CloudSnow className={`w-32 h-32 ${baseClass}`} style={{ color: "#BFDBFE" }} />;
  }
  if (icon?.includes("50")) {
    return <Wind className={`w-32 h-32 ${baseClass}`} style={{ color: "#94A3B8" }} />;
  }
  return <Cloud className={`w-32 h-32 ${baseClass}`} style={{ color: "#94A3B8" }} />;
};

// Mini weather icon for forecast
const ForecastIcon = ({ icon }) => {
  const size = "w-10 h-10";
  
  if (icon?.includes("01")) {
    return <Sun className={size} style={{ color: "#FFD93D" }} />;
  }
  if (icon?.includes("02")) {
    return (
      <div className="relative w-10 h-10">
        <Sun className="w-6 h-6 absolute top-0 left-0" style={{ color: "#FFD93D" }} />
        <Cloud className="w-7 h-7 absolute bottom-0 right-0" style={{ color: "#fff" }} />
      </div>
    );
  }
  if (icon?.includes("03") || icon?.includes("04")) {
    return <Cloud className={size} style={{ color: "#94A3B8" }} />;
  }
  if (icon?.includes("09") || icon?.includes("10")) {
    return <CloudRain className={size} style={{ color: "#60A5FA" }} />;
  }
  if (icon?.includes("11")) {
    return <CloudLightning className={size} style={{ color: "#FBBF24" }} />;
  }
  if (icon?.includes("13")) {
    return <CloudSnow className={size} style={{ color: "#BFDBFE" }} />;
  }
  if (icon?.includes("50")) {
    return <Wind className={size} style={{ color: "#94A3B8" }} />;
  }
  return <Cloud className={size} style={{ color: "#94A3B8" }} />;
};

export default function WeatherForecastSlide({ weather, forecast, currentTime }) {
  if (!weather) return null;

  const dateStr = currentTime.toLocaleDateString("en-US", { 
    weekday: "long", 
    month: "long",
    day: "numeric"
  });

  // Ensure we have forecast data
  const forecastDays = forecast && forecast.length > 0 
    ? forecast.slice(0, 7) 
    : [
        { day: "Saturday", temp_min: 36, temp_max: 41, icon: "01d" },
        { day: "Sunday", temp_min: 35, temp_max: 55, icon: "02d" },
        { day: "Monday", temp_min: 42, temp_max: 53, icon: "03d" },
        { day: "Tuesday", temp_min: 51, temp_max: 77, icon: "10d" },
        { day: "Wednesday", temp_min: 64, temp_max: 77, icon: "02d" },
        { day: "Thursday", temp_min: 46, temp_max: 58, icon: "50d" },
      ];

  return (
    <div 
      className="w-full h-full relative overflow-hidden"
      data-testid="weather-forecast-slide"
    >
      {/* Sky Background with gradient */}
      <div 
        className="absolute inset-0"
        style={{
          background: "linear-gradient(180deg, #4BA3C3 0%, #7ECBE6 40%, #A8D8EA 70%, #E8F4F8 100%)"
        }}
      />
      
      {/* Cloud Wave at bottom */}
      <div className="absolute bottom-0 left-0 right-0 h-64">
        <svg viewBox="0 0 1440 320" className="w-full h-full" preserveAspectRatio="none">
          <path 
            fill="rgba(255,255,255,0.4)" 
            d="M0,160L48,176C96,192,192,224,288,218.7C384,213,480,171,576,165.3C672,160,768,192,864,197.3C960,203,1056,181,1152,165.3C1248,149,1344,139,1392,133.3L1440,128L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"
          />
          <path 
            fill="rgba(100,116,139,0.3)" 
            d="M0,224L48,213.3C96,203,192,181,288,181.3C384,181,480,203,576,213.3C672,224,768,224,864,213.3C960,203,1056,181,1152,176C1248,171,1344,181,1392,186.7L1440,192L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"
          />
        </svg>
      </div>

      {/* Floating Clouds decoration */}
      <Cloud className="absolute top-20 left-20 w-24 h-24 text-white/50" />
      <Cloud className="absolute top-32 right-1/3 w-16 h-16 text-white/40" />
      <Cloud className="absolute top-16 right-1/4 w-20 h-20 text-white/30" />

      {/* Content */}
      <div className="relative z-10 h-full flex flex-col p-12 lg:p-16">
        {/* Top Section */}
        <div className="flex justify-between items-start flex-1">
          {/* Location Card */}
          <div className="bg-white/85 backdrop-blur-sm rounded-3xl p-8 shadow-2xl max-w-sm">
            <div className="flex items-center gap-2 text-gray-700 mb-6">
              <MapPin className="w-6 h-6 text-gray-600" />
              <span className="text-2xl font-semibold font-sans">{weather.city}</span>
            </div>
            
            {/* Weather Icon */}
            <div className="flex justify-center my-4">
              <CurrentWeatherIcon icon={weather.icon} />
            </div>
            
            <p className="text-center text-xl text-gray-600 font-sans uppercase tracking-wider mt-4">
              {weather.condition}
            </p>
          </div>

          {/* Temperature & Date */}
          <div className="text-right">
            <div className="text-sm uppercase tracking-widest text-slate-600 font-sans font-medium">
              News
            </div>
            <div className="text-slate-600 font-sans">
              {dateStr}
            </div>
            
            <div className="mt-6">
              <span className="text-[9rem] lg:text-[11rem] font-extralight text-white drop-shadow-xl font-sans leading-none tracking-tight"
                style={{ textShadow: "2px 4px 20px rgba(0,0,0,0.15)" }}>
                +{Math.round(weather.temp)}°
              </span>
              <span className="text-4xl text-white/80 ml-1">F</span>
            </div>
            
            <div className="mt-6 flex gap-6 justify-end items-center">
              <div className="text-white">
                <span className="text-4xl lg:text-5xl font-light drop-shadow-lg">{Math.round(weather.temp_min)}°F</span>
                <span className="block text-sm uppercase tracking-widest text-white/70 mt-1">Lowest</span>
              </div>
              <span className="text-white/50 text-5xl font-extralight">/</span>
              <div className="text-white">
                <span className="text-4xl lg:text-5xl font-light drop-shadow-lg">{Math.round(weather.temp_max)}°F</span>
                <span className="block text-sm uppercase tracking-widest text-white/70 mt-1">Highest</span>
              </div>
            </div>
          </div>
        </div>

        {/* 7-Day Forecast */}
        <div className="mt-auto pt-8">
          <div className="flex justify-between items-end px-4">
            {forecastDays.map((day, index) => (
              <div 
                key={index} 
                className="flex flex-col items-center"
              >
                <p className="text-sm uppercase tracking-wider text-slate-600 mb-3 font-sans font-medium">
                  {day.day?.substring(0, 3) || `Day ${index + 1}`}
                </p>
                <div className="bg-white/40 backdrop-blur-sm rounded-2xl p-4 mb-3 shadow-lg">
                  <ForecastIcon icon={day.icon} />
                </div>
                <p className="text-lg font-sans text-slate-700">
                  <span className="text-slate-500">{Math.round(day.temp_min)}°</span>
                  <span className="mx-1 text-slate-400">/</span>
                  <span className="font-medium">{Math.round(day.temp_max)}°</span>
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
