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

  // Widget positions — smart anchoring
  // x <= 50: left-anchored, x > 50: right-anchored
  // y <= 50: top-anchored, y > 50: bottom-anchored
  // This ensures old grid values (0/100) AND free-form values both work
  const defaultPos = {
    logo: { x: 0, y: 0 },
    clock: { x: 100, y: 0 },
    weather: { x: 0, y: 100 },
    news: { x: 100, y: 100 },
  };
  const raw = settings.widget_positions || {};
  const positions = {
    logo: raw.logo || defaultPos.logo,
    clock: raw.clock || raw.hotel_name || defaultPos.clock,
    weather: raw.weather || defaultPos.weather,
    news: raw.news || defaultPos.news,
  };

  const anchorStyle = (pos) => {
    const style = {};
    if (pos.x <= 50) style.left = `${pos.x}%`;
    else style.right = `${100 - pos.x}%`;
    if (pos.y <= 50) style.top = `${pos.y}%`;
    else style.bottom = `${100 - pos.y}%`;
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
      <div className="absolute inset-0 z-[3]" style={{ padding }}>
        {/* Logo */}
        {settings.logo_url && (
          <motion.div
            className="absolute"
            style={anchorStyle(positions.logo)}
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
          style={{ ...anchorStyle(positions.clock), textAlign: positions.clock.x > 50 ? 'right' : 'left' }}
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
          style={{ ...anchorStyle(positions.weather), maxWidth: isPortrait ? '48%' : '45%', transform: `scale(${wScale})`, transformOrigin: `${positions.weather.x <= 50 ? 'left' : 'right'} ${positions.weather.y <= 50 ? 'top' : 'bottom'}` }}
          initial={{ opacity: 0, y: positions.weather.y <= 50 ? -20 : 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          <WeatherWidget weather={weather} theme={currentTheme} />
        </motion.div>

        {/* News */}
        <motion.div
          className="absolute"
          style={{ ...anchorStyle(positions.news), maxWidth: isPortrait ? '48%' : '45%', transform: `scale(${wScale})`, transformOrigin: `${positions.news.x <= 50 ? 'left' : 'right'} ${positions.news.y <= 50 ? 'top' : 'bottom'}` }}
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
              <NewsHeadline headline={currentHeadline} theme={currentTheme} />
            </motion.div>
          </AnimatePresence>
        </motion.div>
      </div>
    </div>
  );
}
