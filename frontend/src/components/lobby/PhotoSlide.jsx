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
  const padding = settings.widget_padding || 48;
  const wScale = settings.widget_scale || 1;
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

  // Widget positions — use same center-point system as drag canvas
  const defaultPos = {
    logo: { x: 5, y: 5 },
    clock: { x: 90, y: 5 },
    weather: { x: 5, y: 92 },
    news: { x: 90, y: 92 },
  };
  const raw = settings.widget_positions || {};
  const positions = {
    logo: raw.logo || defaultPos.logo,
    clock: raw.clock || raw.hotel_name || defaultPos.clock,
    weather: raw.weather || defaultPos.weather,
    news: raw.news || defaultPos.news,
  };

  // Center-point positioning — matches the drag canvas exactly
  // Widgets are placed with their CENTER at (x%, y%)
  // Clamp to keep widgets from going off-screen edges
  const centerStyle = (pos) => ({
    left: `${Math.max(2, Math.min(98, pos.x))}%`,
    top: `${Math.max(2, Math.min(98, pos.y))}%`,
    transform: 'translate(-50%, -50%)',
  });

  // Text alignment based on position
  const textAlign = (pos) => pos.x > 60 ? 'right' : pos.x < 40 ? 'left' : 'center';

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

      {/* Subtle gradient overlays */}
      <div className="absolute inset-0 z-[2] pointer-events-none">
        <div className="absolute bottom-0 left-0 right-0 h-[30%] bg-gradient-to-t from-black/30 to-transparent" />
        <div className="absolute top-0 left-0 right-0 h-[15%] bg-gradient-to-b from-black/20 to-transparent" />
      </div>

      {/* Positioned widgets — uses center-point positioning matching the admin drag canvas */}
      <div className="absolute inset-0 z-[3] overflow-hidden" style={{ padding }}>
        {/* Logo */}
        {visibility.logo && settings.logo_url && (
          <motion.div
            className="absolute"
            style={centerStyle(positions.logo)}
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

        {/* Clock */}
        {visibility.clock && (
          <motion.div
            className="absolute"
            style={{ ...centerStyle(positions.clock), textAlign: textAlign(positions.clock) }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.1 }}
          >
            <LiveClock theme={currentTheme} size={isPortrait ? "compact" : "large"} format={settings.clock_format || "12h"} clockStyle={settings.clock_style || "digital"} fontStyle={settings.font_style || "modern"} color={colors.clock} glass={glass} />
            <DateDisplay theme={currentTheme} fontStyle={settings.font_style || "modern"} color={colors.clock} />
          </motion.div>
        )}

        {/* Weather */}
        {visibility.weather && (
          <motion.div
            className="absolute overflow-hidden"
            style={{
              ...centerStyle(positions.weather),
              maxWidth: isPortrait ? '80%' : '40%',
              maxHeight: '25%',
            }}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <WeatherWidget weather={weather} theme={currentTheme} color={colors.weather} glass={glass} />
          </motion.div>
        )}

        {/* News */}
        {visibility.news && (
          <motion.div
            className="absolute overflow-hidden"
            style={{
              ...centerStyle(positions.news),
              maxWidth: isPortrait ? '80%' : '40%',
              maxHeight: '15%',
            }}
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
