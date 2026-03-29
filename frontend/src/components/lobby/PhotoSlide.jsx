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

  // Widget positions — smart anchoring
  // x <= 50: left-anchored, x > 50: right-anchored
  // y <= 50: top-anchored, y > 50: bottom-anchored
  // This ensures old grid values (0/100) AND free-form values both work
  // Orientation-aware defaults: portrait stacks vertically, landscape uses corners
  const defaultPos = isPortrait
    ? { logo: { x: 50, y: 3 }, clock: { x: 50, y: 10 }, weather: { x: 50, y: 82 }, news: { x: 50, y: 93 } }
    : { logo: { x: 0, y: 0 }, clock: { x: 100, y: 0 }, weather: { x: 0, y: 100 }, news: { x: 100, y: 100 } };
  const raw = settings.widget_positions || {};
  const positions = {
    logo: raw.logo || defaultPos.logo,
    clock: raw.clock || raw.hotel_name || defaultPos.clock,
    weather: raw.weather || defaultPos.weather,
    news: raw.news || defaultPos.news,
  };

  const anchorStyle = (pos) => {
    const style = {};
    // Add small inset so widgets at edges (0/100) don't get cut off
    if (pos.x <= 50) style.left = `${Math.max(pos.x, 1)}%`;
    else style.right = `${Math.max(100 - pos.x, 1)}%`;
    if (pos.y <= 50) style.top = `${Math.max(pos.y, 1)}%`;
    else style.bottom = `${Math.max(100 - pos.y, 2)}%`;
    return style;
  };

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

      {/* Positioned widgets */}
      <div className="absolute inset-0 z-[3]" style={{ padding: isPortrait ? Math.min(padding, 24) : padding }}>
        {/* Logo */}
        {visibility.logo && settings.logo_url && (
          <motion.div
            className="absolute"
            style={{ ...anchorStyle(positions.logo), ...(isPortrait && positions.logo.x > 25 && positions.logo.x < 75 ? { left: '50%', right: 'auto', transform: 'translateX(-50%)' } : {}) }}
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
            style={{
              ...anchorStyle(positions.clock),
              textAlign: isPortrait && positions.clock.x > 25 && positions.clock.x < 75 ? 'center' : (positions.clock.x > 50 ? 'right' : 'left'),
              ...(isPortrait && positions.clock.x > 25 && positions.clock.x < 75 ? { left: '50%', right: 'auto', transform: 'translateX(-50%)' } : {}),
            }}
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
              ...anchorStyle(positions.weather),
              maxWidth: isPortrait ? '90%' : '45%',
              maxHeight: '30%',
              transform: `scale(${wScale})`,
              transformOrigin: `${positions.weather.x <= 50 ? 'left' : 'right'} ${positions.weather.y <= 50 ? 'top' : 'bottom'}`,
              ...(isPortrait && positions.weather.x > 25 && positions.weather.x < 75 ? { left: '50%', right: 'auto', transform: `scale(${wScale}) translateX(-50%)`, transformOrigin: 'center top' } : {}),
            }}
            initial={{ opacity: 0, y: positions.weather.y <= 50 ? -20 : 20 }}
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
              ...anchorStyle(positions.news),
              maxWidth: isPortrait ? '90%' : '45%',
              maxHeight: '18%',
              transform: `scale(${wScale})`,
              transformOrigin: `${positions.news.x <= 50 ? 'left' : 'right'} ${positions.news.y <= 50 ? 'top' : 'bottom'}`,
              ...(isPortrait && positions.news.x > 25 && positions.news.x < 75 ? { left: '50%', right: 'auto', transform: `scale(${wScale}) translateX(-50%)`, transformOrigin: 'center top' } : {}),
            }}
            initial={{ opacity: 0, y: positions.news.y <= 50 ? -20 : 20 }}
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
