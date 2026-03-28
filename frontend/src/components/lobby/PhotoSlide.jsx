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
  const gap = settings.widget_spacing || 16;
  const wScale = settings.widget_scale || 1;
  const currentHeadline = headlines[currentHeadlineIndex];

  // Widget positions (percentage-based grid positions)
  const positions = settings.widget_positions || {
    hotel_name: { x: 0, y: 0 },
    clock: { x: 100, y: 0 },
    weather: { x: 0, y: 100 },
    news: { x: 100, y: 100 },
  };

  // Map position to CSS
  const positionStyle = (pos) => {
    const style = {};
    if (pos.x === 0) { style.left = 0; style.alignItems = 'flex-start'; }
    else if (pos.x === 50) { style.left = '50%'; style.transform = 'translateX(-50%)'; style.alignItems = 'center'; }
    else { style.right = 0; style.alignItems = 'flex-end'; }
    if (pos.y === 0) style.top = 0;
    else style.bottom = 0;
    return style;
  };

  const textAlign = (pos) => pos.x === 0 ? 'text-left' : pos.x === 50 ? 'text-center' : 'text-right';

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

      {/* Subtle gradient overlays — minimal to keep photo visible */}
      <div className="absolute inset-0 z-[2] pointer-events-none">
        <div className="absolute bottom-0 left-0 right-0 h-[30%] bg-gradient-to-t from-black/30 to-transparent" />
        <div className="absolute top-0 left-0 right-0 h-[15%] bg-gradient-to-b from-black/20 to-transparent" />
      </div>

      {/* Positioned widgets */}
      <div className="absolute inset-0 z-[3]" style={{ padding }}>
        {/* Hotel Name */}
        {settings.hotel_name && (
          <motion.div
            className={`absolute flex flex-col ${textAlign(positions.hotel_name)}`}
            style={positionStyle(positions.hotel_name)}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8 }}
          >
            <h1 className={`${isPortrait ? 'text-lg' : 'text-xl'} font-serif font-bold text-white tracking-[0.2em] uppercase drop-shadow-lg`}>
              {settings.hotel_name}
            </h1>
            <p className="text-white/60 text-xs tracking-wider mt-0.5">Welcome</p>
          </motion.div>
        )}

        {/* Clock */}
        <motion.div
          className={`absolute flex flex-col ${textAlign(positions.clock)}`}
          style={positionStyle(positions.clock)}
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
          style={{ ...positionStyle(positions.weather), maxWidth: isPortrait ? '48%' : '45%', transform: `scale(${wScale})`, transformOrigin: `${positions.weather.x === 0 ? 'left' : positions.weather.x === 100 ? 'right' : 'center'} ${positions.weather.y === 0 ? 'top' : 'bottom'}` }}
          initial={{ opacity: 0, y: positions.weather.y === 0 ? -20 : 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          <WeatherWidget weather={weather} theme={currentTheme} />
        </motion.div>

        {/* News */}
        <motion.div
          className="absolute"
          style={{ ...positionStyle(positions.news), maxWidth: isPortrait ? '48%' : '45%', transform: `scale(${wScale})`, transformOrigin: `${positions.news.x === 0 ? 'left' : positions.news.x === 100 ? 'right' : 'center'} ${positions.news.y === 0 ? 'top' : 'bottom'}` }}
          initial={{ opacity: 0, y: positions.news.y === 0 ? -20 : 20 }}
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
