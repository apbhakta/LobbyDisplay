import { motion, AnimatePresence } from "framer-motion";
import { Camera } from "lucide-react";
import WeatherBackground from "../WeatherBackground";
import { LiveClock, DateDisplay } from "./ClockWidgets";
import { WeatherWidget, NewsHeadline } from "./InfoWidgets";

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

  // Widget positions — continuous percentages (0-95)
  // Migrate old grid values (100 = off-screen) to safe defaults
  const migratePos = (pos, fallback) => {
    if (!pos) return fallback;
    return {
      x: pos.x >= 95 ? fallback.x : pos.x,
      y: pos.y >= 95 ? fallback.y : pos.y,
    };
  };
  const defaultPos = {
    logo: { x: 3, y: 3 },
    clock: { x: 80, y: 3 },
    weather: { x: 3, y: 78 },
    news: { x: 50, y: 85 },
  };
  const raw = settings.widget_positions || {};
  const positions = {
    logo: migratePos(raw.logo, defaultPos.logo),
    clock: migratePos(raw.clock || raw.hotel_name, defaultPos.clock),
    weather: migratePos(raw.weather, defaultPos.weather),
    news: migratePos(raw.news, defaultPos.news),
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

      {/* Free-positioned widgets */}
      <div className="absolute inset-0 z-[3]" style={{ padding }}>
        {/* Logo */}
        {settings.logo_url && (
          <motion.div
            className="absolute"
            style={{ left: `${positions.logo.x}%`, top: `${positions.logo.y}%` }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8 }}
          >
            <img
              src={settings.logo_url}
              alt="Logo"
              className="h-12 w-auto max-w-[120px] object-contain drop-shadow-lg"
              style={{ filter: 'drop-shadow(0 2px 8px rgba(0,0,0,0.5))' }}
            />
          </motion.div>
        )}

        {/* Clock */}
        <motion.div
          className="absolute"
          style={{ left: `${positions.clock.x}%`, top: `${positions.clock.y}%` }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.1 }}
        >
          <LiveClock theme={currentTheme} size={isPortrait ? "compact" : "large"} />
          <DateDisplay theme={currentTheme} />
        </motion.div>

        {/* Weather */}
        <motion.div
          className="absolute"
          style={{ left: `${positions.weather.x}%`, top: `${positions.weather.y}%`, maxWidth: isPortrait ? '48%' : '45%', transform: `scale(${wScale})`, transformOrigin: 'top left' }}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          <WeatherWidget weather={weather} theme={currentTheme} />
        </motion.div>

        {/* News */}
        <motion.div
          className="absolute"
          style={{ left: `${positions.news.x}%`, top: `${positions.news.y}%`, maxWidth: isPortrait ? '48%' : '45%', transform: `scale(${wScale})`, transformOrigin: 'top left' }}
          initial={{ opacity: 0, y: 20 }}
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
              <NewsHeadline headline={currentHeadline} theme={currentTheme} />
            </motion.div>
          </AnimatePresence>
        </motion.div>
      </div>
    </div>
  );
}
