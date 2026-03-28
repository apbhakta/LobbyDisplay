import { MapPin, Mountain, Church, Palette, Trees, Building2, Camera, Utensils, ShoppingBag, Tent, Star, Music } from "lucide-react";
import { motion } from "framer-motion";
import WeatherBackground from "./WeatherBackground";

// Category icon mapping
const CATEGORY_ICONS = {
  dining: Utensils,
  shopping: ShoppingBag,
  parks: Trees,
  museums: Palette,
  entertainment: Music,
  family: Star,
  events: Camera,
  outdoor: Tent,
  hotel_recommendations: Building2,
};

// No fallback attractions — all managed via admin panel

export default function LocalAttractionsSlide({ weather, isPortrait, attractions: dynamicAttractions, maxItems }) {
  const items = (dynamicAttractions && dynamicAttractions.length > 0)
    ? dynamicAttractions.filter(a => a.enabled !== false).slice(0, maxItems || 6)
    : [];

  // Empty state — no attractions configured
  if (items.length === 0) {
    return (
      <div className="w-full h-full relative overflow-hidden" data-testid="local-attractions-slide">
        <WeatherBackground condition={weather?.condition} icon={weather?.icon} />
        <div className="absolute inset-0 bg-black/30 z-[1]" />
        <div className="relative z-10 h-full flex flex-col items-center justify-center">
          <MapPin className="w-12 h-12 text-white/15 mb-4" />
          <p className="text-white/20 text-lg tracking-widest uppercase">Attractions coming soon</p>
        </div>
      </div>
    );
  }

  return (
    <div 
      className="w-full h-full relative overflow-hidden"
      data-testid="local-attractions-slide"
    >
      <WeatherBackground condition={weather?.condition} icon={weather?.icon} />
      <div className="absolute inset-0 bg-black/30 z-[1]" />

      <div className={`relative h-full flex flex-col ${isPortrait ? 'p-6 lg:p-8' : 'p-12 lg:p-16'}`} style={{ zIndex: 2 }}>
        {/* Header */}
        <div className={`flex ${isPortrait ? 'flex-col items-center gap-1' : 'justify-between items-start'} mb-6`}>
          <div className={isPortrait ? 'text-center' : ''}>
            <div className={`flex items-center gap-3 mb-1 ${isPortrait ? 'justify-center' : ''}`}>
              <MapPin className="w-7 h-7 text-amber-300" />
              <h2 className={`${isPortrait ? 'text-3xl' : 'text-4xl lg:text-5xl'} font-serif font-semibold text-white tracking-wide`}>
                Discover Clifton
              </h2>
            </div>
            <p className={`text-lg text-white/70 font-sans ${isPortrait ? '' : 'ml-11'}`}>
              The Norwegian Capital of Texas
            </p>
          </div>
          {!isPortrait && (
            <div className="text-right">
              <p className="text-white/60 text-sm uppercase tracking-widest font-sans">Local Attractions</p>
            </div>
          )}
        </div>

        {/* Attractions Grid */}
        <div className={`flex-1 grid ${isPortrait ? 'grid-cols-2 gap-3' : 'grid-cols-3 gap-6'}`}>
          {items.map((attraction, index) => {
            const Icon = CATEGORY_ICONS[attraction.category] || MapPin;
            const imgUrl = attraction.image_url || attraction.image;
            return (
              <motion.div
                key={attraction.name + index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1, duration: 0.5 }}
                className="bg-white/10 backdrop-blur-sm rounded-2xl overflow-hidden border border-white/20 transition-all group"
              >
                <div className={`${isPortrait ? 'h-20' : 'h-32'} overflow-hidden relative`}>
                  {imgUrl ? (
                    <div 
                      className="absolute inset-0 bg-cover bg-center"
                      style={{ backgroundImage: `url(${imgUrl})`, filter: "brightness(0.8)" }}
                    />
                  ) : (
                    <div className="absolute inset-0 bg-gradient-to-br from-white/8 to-white/3" />
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                  <div className="absolute bottom-2 left-3">
                    <div className="bg-amber-500/90 p-1.5 rounded-lg">
                      <Icon className="w-4 h-4 text-white" />
                    </div>
                  </div>
                </div>
                
                <div className={isPortrait ? "p-3" : "p-4"}>
                  <h3 className={`${isPortrait ? 'text-sm' : 'text-lg'} font-semibold text-white font-sans mb-0.5`}>
                    {attraction.name}
                  </h3>
                  <p className={`${isPortrait ? 'text-xs' : 'text-sm'} text-white/70 font-sans leading-relaxed`}>
                    {attraction.description}
                  </p>
                  {attraction.distance && (
                    <p className="text-xs text-amber-300/70 mt-1 flex items-center gap-1">
                      <MapPin className="w-3 h-3" /> {attraction.distance}
                    </p>
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="mt-4 flex items-center justify-center gap-2 text-white/50">
          <MapPin className="w-4 h-4" />
          <span className="text-sm font-sans">Clifton, TX 76634</span>
        </div>
      </div>
    </div>
  );
}
