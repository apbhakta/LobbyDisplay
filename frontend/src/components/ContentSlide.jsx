import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";
import { Megaphone, Tag, Heart, Building2, Calendar, AlertTriangle, LogOut } from "lucide-react";
import WeatherBackground from "./WeatherBackground";

const SECTION_ICONS = {
  announcement: Megaphone,
  promotion: Tag,
  welcome_message: Heart,
  amenity: Building2,
  event: Calendar,
  emergency: AlertTriangle,
  checkout_reminder: LogOut,
};

const SECTION_LABELS = {
  announcement: "Announcements",
  promotion: "Promotions",
  welcome_message: "Welcome",
  amenity: "Amenities",
  event: "Events",
  emergency: "Emergency Info",
  checkout_reminder: "Checkout",
};

const SECTION_COLORS = {
  announcement: "from-blue-600/20 to-blue-900/40",
  promotion: "from-amber-600/20 to-amber-900/40",
  welcome_message: "from-rose-600/20 to-rose-900/40",
  amenity: "from-emerald-600/20 to-emerald-900/40",
  event: "from-purple-600/20 to-purple-900/40",
  emergency: "from-red-600/20 to-red-900/40",
  checkout_reminder: "from-slate-600/20 to-slate-900/40",
};

export default function ContentSlide({ items, sectionType, weather, isPortrait }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const Icon = SECTION_ICONS[sectionType] || Megaphone;
  const label = SECTION_LABELS[sectionType] || "Information";
  const colorGrad = SECTION_COLORS[sectionType] || "from-slate-600/20 to-slate-900/40";

  useEffect(() => {
    if (items.length <= 1) return;
    const t = setInterval(() => setCurrentIndex(prev => (prev + 1) % items.length), 6000);
    return () => clearInterval(t);
  }, [items.length]);

  const currentItem = items[currentIndex];

  return (
    <div className="w-full h-full relative" data-testid="content-slide">
      <WeatherBackground condition={weather?.condition} icon={weather?.icon} />
      <div className={`absolute inset-0 bg-gradient-to-br ${colorGrad}`} />
      <div className="absolute inset-0 bg-black/40" />

      <div className={`absolute inset-0 flex flex-col items-center justify-center ${isPortrait ? 'px-8' : 'px-16'}`}>
        {/* Section header */}
        <motion.div
          className="flex items-center gap-3 mb-8"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <Icon className="w-8 h-8 text-white/70" />
          <h2 className="text-white/70 text-sm font-medium tracking-[0.3em] uppercase">{label}</h2>
        </motion.div>

        {/* Content card */}
        <AnimatePresence mode="wait">
          {currentItem && (
            <motion.div
              key={currentItem.id || currentIndex}
              className="max-w-2xl w-full"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -30 }}
              transition={{ duration: 0.8 }}
            >
              <div className="backdrop-blur-xl bg-white/8 border border-white/10 rounded-2xl p-8 shadow-2xl">
                {currentItem.title && (
                  <h3 className={`${isPortrait ? 'text-2xl' : 'text-3xl'} font-bold text-white mb-4 tracking-wide`}>
                    {currentItem.title}
                  </h3>
                )}
                {currentItem.content && (
                  <p className={`${isPortrait ? 'text-base' : 'text-lg'} text-white/80 leading-relaxed`}>
                    {currentItem.content}
                  </p>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Page indicator */}
        {items.length > 1 && (
          <motion.div
            className="flex gap-2 mt-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
          >
            {items.map((_, i) => (
              <div
                key={i}
                className={`w-2 h-2 rounded-full transition-all ${i === currentIndex ? 'bg-white w-6' : 'bg-white/30'}`}
              />
            ))}
          </motion.div>
        )}
      </div>
    </div>
  );
}
