import { motion, AnimatePresence } from "framer-motion";
import { Camera } from "lucide-react";
import WeatherBackground from "../WeatherBackground";
import { LiveClock, DateDisplay } from "./ClockWidgets";
import { WeatherWidget, NewsHeadline } from "./InfoWidgets";
import { GlassPanel } from "./GlassPanel";

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
  image, weather, settings, currentTheme, isPortrait,
  headlines, currentHeadlineIndex, getImageUrl,
}) {
  const currentHeadline = headlines[currentHeadlineIndex];
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

  const raw = settings.widget_positions || {};
  const positions = {
    logo: raw.logo || { x: 2, y: 2 },
    clock: raw.clock || raw.hotel_name || { x: 98, y: 2 },
    weather: raw.weather || { x: 2, y: 98 },
    news: raw.news || { x: 98, y: 98 },
  };

  // Corner-aware positioning: pins widget edges to the nearest screen edge
  // x<=25 → left edge pinned | x>=75 → right edge pinned | else → centered
  // y<=25 → top edge pinned  | y>=75 → bottom edge pinned | else → centered
  const cornerStyle = (pos) => {
    const style = {};
    if (pos.x <= 25) {
      style.left = 0;
    } else if (pos.x >= 75) {
      style.right = 0;
    } else {
      style.left = `${pos.x}%`;
      style.transform = 'translateX(-50%)';
    }
    if (pos.y <= 25) {
      style.top = 0;
    } else if (pos.y >= 75) {
      style.bottom = 0;
    } else {
      style.top = `${pos.y}%`;
      style.transform = (style.transform || '') + ' translateY(-50%)';
    }
    return style;
  };

  const align = (pos) => pos.x >= 75 ? 'right' : pos.x <= 25 ? 'left' : 'center';
  const pad = isPortrait ? 14 : 20;

  return (
    <div className="w-full h-full relative" data-testid="photo-slide">
      <WeatherBackground condition={weather?.condition} icon={weather?.icon} />
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

      {/* Gradient overlays for readability */}
      <div className="absolute inset-0 z-[2] pointer-events-none">
        <div className="absolute top-0 left-0 right-0 h-[18%] bg-gradient-to-b from-black/50 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 h-[18%] bg-gradient-to-t from-black/50 to-transparent" />
      </div>

      {/* All 4 corner widgets */}
      <div className="absolute inset-0 z-[3]" style={{ padding: pad }}>
        {/* TOP-LEFT: Logo */}
        {visibility.logo && settings.logo_url && (
          <motion.div
            className="absolute"
            style={cornerStyle(positions.logo)}
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

        {/* TOP-RIGHT: Clock */}
        {visibility.clock && (
          <motion.div
            className="absolute"
            style={{ ...cornerStyle(positions.clock), textAlign: align(positions.clock) }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.1 }}
          >
            <LiveClock theme={currentTheme} size={isPortrait ? "compact" : "large"} format={settings.clock_format || "12h"} clockStyle={settings.clock_style || "digital"} fontStyle={settings.font_style || "modern"} color={colors.clock} glass={glass} />
            <DateDisplay theme={currentTheme} fontStyle={settings.font_style || "modern"} color={colors.clock} />
          </motion.div>
        )}

        {/* BOTTOM-LEFT: Weather */}
        {visibility.weather && (
          <motion.div
            className="absolute"
            style={{ ...cornerStyle(positions.weather), maxWidth: isPortrait ? '65%' : '40%' }}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <WeatherWidget weather={weather} theme={currentTheme} color={colors.weather} glass={glass} />
          </motion.div>
        )}

        {/* BOTTOM-RIGHT: News */}
        {visibility.news && (
          <motion.div
            className="absolute"
            style={{ ...cornerStyle(positions.news), maxWidth: isPortrait ? '65%' : '40%', textAlign: align(positions.news) }}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
          >
            <AnimatePresence mode="wait">
              <motion.div
                key={currentHeadlineIndex}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.6 }}
              >
                <NewsHeadline headline={currentHeadline} theme={currentTheme} color={colors.news} glass={glass} />
              </motion.div>
            </AnimatePresence>
          </motion.div>
        )}
      </div>
    </div>
  );
}
