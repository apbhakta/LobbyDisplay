import { motion, AnimatePresence } from "framer-motion";
import { Camera } from "lucide-react";
import WeatherBackground from "../WeatherBackground";
import { LiveClock, DateDisplay } from "./ClockWidgets";
import { WeatherWidget, NewsHeadline } from "./InfoWidgets";
import { GlassPanel } from "./GlassPanel";

// Empty state when no images uploaded
const EmptyPhotoState = ({ theme }) => (
  <div className="w-full h-full flex items-center justify-center" data-testid="empty-photo-state">
    <WeatherBackground condition="clear" icon="01d" />
    <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900" />
    <motion.div
      className="relative z-10 text-center"
      initial={{ opacity: 0 }}
      animate={{ opacity: 0.3 }}
      transition={{ duration: 2 }}
    >
      <Camera className="w-16 h-16 text-white/20 mx-auto mb-4" />
      <p className="text-white/15 text-lg tracking-widest uppercase">Upload photos in admin panel</p>
    </motion.div>
  </div>
);

export default function PhotoSlide({
  image,
  weather,
  settings,
  currentTheme,
  isPortrait,
  headlines,
  currentHeadlineIndex,
  getImageUrl,
}) {
  const currentHeadline = headlines[currentHeadlineIndex];

  // Widget visibility, colors, and glass effect from settings
  const visibility = {
    logo: settings.widget_visibility?.logo !== false,
    clock: settings.widget_visibility?.clock !== false,
    weather: settings.widget_visibility?.weather !== false,
    news: settings.widget_visibility?.news !== false,
  };
  const colors = {
    clock: settings.widget_colors?.clock || "#ffffff",
    weather: settings.widget_colors?.weather || "#ffffff",
    news: settings.widget_colors?.news || "#ffffff",
  };
  const glass = settings.glass_effect !== false;

  // Widget positions for logo and clock only (top area, draggable)
  const raw = settings.widget_positions || {};
  const logoPos = raw.logo || { x: 8, y: 2 };
  const clockPos = raw.clock || raw.hotel_name || { x: 92, y: 2 };

  // Edge-aware positioning for top widgets
  const widgetStyle = (pos) => {
    const style = {};
    const x = Math.max(1, Math.min(99, pos.x));
    const y = Math.max(1, Math.min(99, pos.y));
    if (x <= 20) { style.left = `${x}%`; }
    else if (x >= 80) { style.right = `${100 - x}%`; }
    else { style.left = `${x}%`; style.transform = 'translateX(-50%)'; }
    if (y <= 20) { style.top = `${y}%`; }
    else if (y >= 80) { style.bottom = `${100 - y}%`; }
    else {
      style.top = `${y}%`;
      style.transform = (style.transform || '') + ' translateY(-50%)';
    }
    return style;
  };

  const textAlign = (pos) => pos.x > 60 ? 'right' : pos.x < 40 ? 'left' : 'center';

  return (
    <div className="w-full h-full relative flex flex-col" data-testid="photo-slide">
      <WeatherBackground condition={weather?.condition} icon={weather?.icon} />

      {/* Photo area — fills available space above bottom bar */}
      <div className="relative flex-1 min-h-0">
        {image ? (
          <motion.img
            src={getImageUrl(image)}
            alt="Hotel"
            className="absolute inset-0 w-full h-full object-contain z-[1]"
            style={{ backgroundColor: '#0f172a' }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1.5, ease: "easeOut" }}
          />
        ) : (
          <EmptyPhotoState theme={currentTheme} />
        )}

        {/* Subtle gradient overlays */}
        <div className="absolute inset-0 z-[2] pointer-events-none">
          <div className="absolute bottom-0 left-0 right-0 h-[20%] bg-gradient-to-t from-black/40 to-transparent" />
          <div className="absolute top-0 left-0 right-0 h-[12%] bg-gradient-to-b from-black/30 to-transparent" />
        </div>

        {/* Top widgets — logo and clock, positioned absolutely */}
        <div className="absolute inset-0 z-[3]" style={{ padding: isPortrait ? 12 : 24 }}>
          {visibility.logo && settings.logo_url && (
            <motion.div
              className="absolute"
              style={widgetStyle(logoPos)}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.8 }}
            >
              {glass ? (
                <GlassPanel theme={currentTheme} className="p-2">
                  <img src={settings.logo_url} alt="Logo" className="h-10 w-auto max-w-[110px] object-contain" />
                </GlassPanel>
              ) : (
                <img src={settings.logo_url} alt="Logo" className="h-12 w-auto max-w-[120px] object-contain drop-shadow-lg" style={{ filter: 'drop-shadow(0 2px 8px rgba(0,0,0,0.5))' }} />
              )}
            </motion.div>
          )}

          {visibility.clock && (
            <motion.div
              className="absolute"
              style={{ ...widgetStyle(clockPos), textAlign: textAlign(clockPos) }}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.1 }}
            >
              <LiveClock theme={currentTheme} size={isPortrait ? "compact" : "large"} format={settings.clock_format || "12h"} clockStyle={settings.clock_style || "digital"} fontStyle={settings.font_style || "modern"} color={colors.clock} glass={glass} />
              <DateDisplay theme={currentTheme} fontStyle={settings.font_style || "modern"} color={colors.clock} />
            </motion.div>
          )}
        </div>
      </div>

      {/* Bottom info bar — fixed at bottom, never overlaps photo content */}
      {(visibility.weather || visibility.news) && (
        <motion.div
          className="relative z-[5] flex items-center justify-between gap-3 bg-black/70 backdrop-blur-sm border-t border-white/5"
          style={{ padding: isPortrait ? '8px 16px' : '10px 24px' }}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3 }}
          data-testid="bottom-info-bar"
        >
          {/* Weather — left side */}
          {visibility.weather ? (
            <div className="flex-shrink-0" style={{ maxWidth: '50%' }}>
              <WeatherWidget weather={weather} theme={currentTheme} color={colors.weather} glass={false} compact />
            </div>
          ) : <div />}

          {/* News — right side */}
          {visibility.news ? (
            <div className="flex-1 min-w-0 text-right overflow-hidden">
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentHeadlineIndex}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                  transition={{ duration: 0.5 }}
                >
                  <NewsHeadline headline={currentHeadline} theme={currentTheme} color={colors.news} glass={false} compact />
                </motion.div>
              </AnimatePresence>
            </div>
          ) : <div />}
        </motion.div>
      )}
    </div>
  );
}
