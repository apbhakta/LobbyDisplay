import { motion } from "framer-motion";
import { Camera } from "lucide-react";
import WeatherBackground from "../WeatherBackground";

const EmptyPhotoState = () => (
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

export default function PhotoSlide({ image, weather, settings, currentTheme, isPortrait, headlines, currentHeadlineIndex, getImageUrl }) {
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
        <EmptyPhotoState />
      )}
    </div>
  );
}
