import { motion } from "framer-motion";

const SLIDE_TYPES = {
  PHOTO: 'photo',
  WEATHER: 'weather',
  ATTRACTIONS: 'attractions',
  EVENTS: 'events',
};

export default function SlideIndicators({ slides, currentSlideIndex }) {
  return (
    <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 z-20 flex gap-2" data-testid="slide-indicators">
      {slides.map((slide, index) => (
        <motion.div
          key={slide.id}
          className={`h-1.5 rounded-full transition-all duration-500 ${
            index === currentSlideIndex
              ? slide.type === SLIDE_TYPES.WEATHER ? 'bg-blue-400 w-10'
                : slide.type === SLIDE_TYPES.ATTRACTIONS ? 'bg-amber-400 w-10'
                : slide.type === SLIDE_TYPES.EVENTS ? 'bg-orange-400 w-10'
                : 'bg-white w-8'
              : 'bg-white/40 w-1.5'
          }`}
          animate={index === currentSlideIndex ? { opacity: [0.8, 1, 0.8] } : {}}
          transition={{ duration: 2, repeat: Infinity }}
        />
      ))}
    </div>
  );
}
