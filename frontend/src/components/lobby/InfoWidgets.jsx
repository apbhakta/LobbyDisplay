import { motion } from "framer-motion";
import { MapPin, ArrowUp, ArrowDown, Droplets, Wind, Newspaper } from "lucide-react";
import { GlassPanel } from "./GlassPanel";

export const WeatherWidget = ({ weather, theme, color = "#ffffff", glass = true }) => {
  if (!weather) return null;
  const iconUrl = `https://openweathermap.org/img/wn/${weather.icon || "02d"}@4x.png`;

  const content = (
    <>
      <div className="flex items-center gap-2 mb-2">
        <MapPin className="w-3 h-3" style={{ color, opacity: 0.6 }} />
        <span className="text-xs" style={{ color, opacity: 0.6 }}>{weather.city}, Texas</span>
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
            <span className="text-3xl font-light" style={{ color }}>{Math.round(weather.temp)}</span>
            <span className="text-sm mt-0.5" style={{ color, opacity: 0.6 }}>°F</span>
          </div>
          <p className="text-xs capitalize" style={{ color, opacity: 0.6 }}>{weather.condition}</p>
        </div>
        <div className="ml-auto space-y-1">
          <div className="flex items-center gap-2 text-xs">
            <ArrowUp className="w-3 h-3 text-orange-400" />
            <span style={{ color }}>{Math.round(weather.temp_max)}°</span>
            <ArrowDown className="w-3 h-3 text-blue-400" />
            <span style={{ color }}>{Math.round(weather.temp_min)}°</span>
          </div>
          <div className="flex items-center gap-2 text-xs">
            <Droplets className="w-3 h-3 text-blue-300" />
            <span style={{ color, opacity: 0.6 }}>{weather.humidity}%</span>
            <Wind className="w-3 h-3 text-cyan-300" />
            <span style={{ color, opacity: 0.6 }}>{weather.wind_speed}mph</span>
          </div>
        </div>
      </div>
    </>
  );

  if (glass) {
    return <GlassPanel theme={theme} className="p-4" data-testid="weather-widget">{content}</GlassPanel>;
  }
  return <div className="p-4" data-testid="weather-widget">{content}</div>;
};

export const NewsHeadline = ({ headline, theme, color = "#ffffff", glass = true }) => {
  if (!headline) return null;

  const content = (
    <div className="flex items-start gap-2">
      <Newspaper className="w-4 h-4 mt-0.5 flex-shrink-0" style={{ color, opacity: 0.5 }} />
      <div className="min-w-0">
        <p className="text-xs leading-relaxed line-clamp-2" style={{ color }}>{headline.title}</p>
        <p className="text-xs mt-1" style={{ color, opacity: 0.5 }}>{headline.source}</p>
      </div>
    </div>
  );

  if (glass) {
    return <GlassPanel theme={theme} className="p-3" data-testid="news-headline">{content}</GlassPanel>;
  }
  return <div className="p-3" data-testid="news-headline">{content}</div>;
};
