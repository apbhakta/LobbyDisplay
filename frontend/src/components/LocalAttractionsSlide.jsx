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

// Fallback attractions if API returns empty
const FALLBACK_ATTRACTIONS = [
  { name: "Bosque County Courthouse", description: "Historic 1886 limestone courthouse in downtown", distance: "0.3 miles", category: "museums", image_url: "https://images.unsplash.com/photo-1555883006-87e8e3c5f4cf?w=400" },
  { name: "Clifton Lutheran Church", description: "Historic Rock Church celebrating Norwegian heritage since 1886", distance: "0.5 miles", category: "museums", image_url: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400" },
  { name: "Bosque Museum", description: "Preserving the history and culture of Bosque County", distance: "0.4 miles", category: "museums", image_url: "https://images.unsplash.com/photo-1566127444979-b3d2b654e3d7?w=400" },
  { name: "Meridian State Park", description: "Scenic park with lake, hiking trails, and wildlife", distance: "12 miles", category: "parks", image_url: "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=400" },
  { name: "Norse Historic District", description: "Authentic Norwegian heritage and architecture", distance: "8 miles", category: "outdoor", image_url: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400" },
  { name: "Main Street Clifton", description: "Charming downtown with antique shops and local eateries", distance: "0.2 miles", category: "shopping", image_url: "https://images.unsplash.com/photo-1519999482648-25049ddd37b1?w=400" },
];

export default function LocalAttractionsSlide({ weather, isPortrait, attractions: dynamicAttractions, maxItems }) {
  const items = (dynamicAttractions && dynamicAttractions.length > 0)
    ? dynamicAttractions.filter(a => a.enabled !== false).slice(0, maxItems || 6)
    : FALLBACK_ATTRACTIONS.slice(0, maxItems || 6);

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
                    <div className="absolute inset-0 bg-white/5" />
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
                    <p className={`${isPortrait ? 'text-xs' : 'text-xs'} text-amber-300/70 mt-1 flex items-center gap-1`}>
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
