import { motion } from "framer-motion";
import { MapPin, ArrowUp, ArrowDown, Droplets, Wind, Newspaper } from "lucide-react";
import { GlassPanel } from "./GlassPanel";

export const WeatherWidget = ({ weather, theme }) => {
  if (!weather) return null;
  const isSnow = theme === "snow";
  const textColor = isSnow ? "text-slate-800" : "text-white";
  const mutedColor = isSnow ? "text-slate-600" : "text-white/70";
  const iconUrl = `https://openweathermap.org/img/wn/${weather.icon || "02d"}@4x.png`;

  return (
    <GlassPanel theme={theme} className="p-4" data-testid="weather-widget">
      <div className="flex items-center gap-2 mb-2">
        <MapPin className={`w-3 h-3 ${mutedColor}`} />
        <span className={`text-xs ${mutedColor}`}>{weather.city}, Texas</span>
      </div>
      <div className="flex items-center gap-3">
        <motion.img
          src={iconUrl}
          alt={weather.condition}
          className="w-14 h-14"
          animate={{ y: [-2, 2, -2] }}
          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
        />
        <div>
          <div className="flex items-start">
            <span className={`text-3xl font-light ${textColor}`}>{Math.round(weather.temp)}</span>
            <span className={`text-sm ${mutedColor} mt-0.5`}>°F</span>
          </div>
          <p className={`text-xs ${mutedColor} capitalize`}>{weather.condition}</p>
        </div>
        <div className="ml-auto space-y-1">
          <div className="flex items-center gap-2 text-xs">
            <ArrowUp className="w-3 h-3 text-orange-400" />
            <span className={textColor}>{Math.round(weather.temp_max)}°</span>
            <ArrowDown className="w-3 h-3 text-blue-400" />
            <span className={textColor}>{Math.round(weather.temp_min)}°</span>
          </div>
          <div className="flex items-center gap-2 text-xs">
            <Droplets className="w-3 h-3 text-blue-300" />
            <span className={mutedColor}>{weather.humidity}%</span>
            <Wind className="w-3 h-3 text-cyan-300" />
            <span className={mutedColor}>{weather.wind_speed}mph</span>
          </div>
        </div>
      </div>
    </GlassPanel>
  );
};

export const NewsHeadline = ({ headline, theme }) => {
  if (!headline) return null;
  const isSnow = theme === "snow";
  const textColor = isSnow ? "text-slate-800" : "text-white";
  const mutedColor = isSnow ? "text-slate-600" : "text-white/60";

  return (
    <GlassPanel theme={theme} className="p-3" data-testid="news-headline">
      <div className="flex items-start gap-2">
        <Newspaper className={`w-4 h-4 mt-0.5 flex-shrink-0 ${mutedColor}`} />
        <div className="min-w-0">
          <p className={`text-xs leading-relaxed ${textColor} line-clamp-2`}>{headline.title}</p>
          <p className={`text-xs ${mutedColor} mt-1`}>{headline.source}</p>
        </div>
      </div>
    </GlassPanel>
  );
};
