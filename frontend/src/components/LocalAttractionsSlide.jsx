import { MapPin, Mountain, Church, Palette, Trees, Building2, Camera } from "lucide-react";
import { motion } from "framer-motion";

const attractions = [
  {
    name: "Bosque County Courthouse",
    description: "Historic 1886 limestone courthouse in the heart of downtown",
    icon: Building2,
    image: "https://images.unsplash.com/photo-1555883006-87e8e3c5f4cf?w=400"
  },
  {
    name: "Clifton Lutheran Church",
    description: "Historic Rock Church celebrating Norwegian heritage since 1886",
    icon: Church,
    image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400"
  },
  {
    name: "Bosque Museum",
    description: "Preserving the history and culture of Bosque County",
    icon: Palette,
    image: "https://images.unsplash.com/photo-1566127444979-b3d2b654e3d7?w=400"
  },
  {
    name: "Meridian State Park",
    description: "Scenic park with lake, hiking trails, and wildlife nearby",
    icon: Trees,
    image: "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=400"
  },
  {
    name: "Norse Historic District",
    description: "Experience authentic Norwegian heritage and architecture",
    icon: Mountain,
    image: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400"
  },
  {
    name: "Main Street Clifton",
    description: "Charming downtown with antique shops and local eateries",
    icon: Camera,
    image: "https://images.unsplash.com/photo-1519999482648-25049ddd37b1?w=400"
  }
];

export default function LocalAttractionsSlide({ hotelName }) {
  return (
    <div 
      className="w-full h-full relative overflow-hidden"
      data-testid="local-attractions-slide"
    >
      {/* Background gradient */}
      <div 
        className="absolute inset-0"
        style={{
          background: "linear-gradient(135deg, #1e3a5f 0%, #2d5a7b 30%, #3d7a9c 60%, #4a9bb8 100%)"
        }}
      />
      
      {/* Decorative pattern overlay */}
      <div 
        className="absolute inset-0 opacity-10"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.4'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
        }}
      />

      {/* Content */}
      <div className="relative z-10 h-full flex flex-col p-12 lg:p-16">
        {/* Header */}
        <div className="flex justify-between items-start mb-8">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <MapPin className="w-8 h-8 text-amber-300" />
              <h2 className="text-4xl lg:text-5xl font-serif font-semibold text-white tracking-wide">
                Discover Clifton
              </h2>
            </div>
            <p className="text-xl text-white/70 font-sans ml-11">
              The Norwegian Capital of Texas
            </p>
          </div>
          <div className="text-right">
            <p className="text-white/60 text-sm uppercase tracking-widest font-sans">Local Attractions</p>
          </div>
        </div>

        {/* Attractions Grid */}
        <div className="flex-1 grid grid-cols-3 gap-6">
          {attractions.map((attraction, index) => {
            const Icon = attraction.icon;
            return (
              <motion.div
                key={attraction.name}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1, duration: 0.5 }}
                className="bg-white/10 backdrop-blur-sm rounded-2xl overflow-hidden border border-white/20 hover:bg-white/15 transition-all group"
              >
                {/* Image */}
                <div className="h-32 overflow-hidden relative">
                  <div 
                    className="absolute inset-0 bg-cover bg-center transform group-hover:scale-105 transition-transform duration-500"
                    style={{ 
                      backgroundImage: `url(${attraction.image})`,
                      filter: "brightness(0.8)"
                    }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                  <div className="absolute bottom-3 left-4">
                    <div className="bg-amber-500/90 p-2 rounded-lg">
                      <Icon className="w-5 h-5 text-white" />
                    </div>
                  </div>
                </div>
                
                {/* Content */}
                <div className="p-4">
                  <h3 className="text-lg font-semibold text-white font-sans mb-1">
                    {attraction.name}
                  </h3>
                  <p className="text-sm text-white/70 font-sans leading-relaxed">
                    {attraction.description}
                  </p>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="mt-6 flex items-center justify-center gap-2 text-white/50">
          <MapPin className="w-4 h-4" />
          <span className="text-sm font-sans">Clifton, TX 76634 • Ask our front desk for directions</span>
        </div>
      </div>
    </div>
  );
}
