import { Calendar, Star, Music, Bike, Gift, Sparkles, Flag, ShoppingBag } from "lucide-react";
import { motion } from "framer-motion";

const events = [
  {
    name: "Bosque Art Classic",
    date: "September",
    description: "National juried art show featuring realistic and representational art",
    icon: Star,
    color: "from-purple-500 to-indigo-600",
    featured: true
  },
  {
    name: "Clifton Rodeo & Parade",
    date: "June",
    description: "Traditional cowboy events at the Clifton Fairgrounds",
    icon: Flag,
    color: "from-red-500 to-orange-500",
    featured: true
  },
  {
    name: "Bosque Tour de Norway",
    date: "May",
    description: "Cycling through scenic countryside and Norwegian heritage sites",
    icon: Bike,
    color: "from-blue-500 to-cyan-500",
    featured: true
  },
  {
    name: "Norwegian Country Christmas Tour",
    date: "December",
    description: "Tour of historic sites celebrating Norwegian roots",
    icon: Gift,
    color: "from-emerald-500 to-teal-500",
    featured: true
  },
  {
    name: "FallFest & Fireworks",
    date: "Fall",
    description: "Community festival with vendors and fireworks on the Bosque",
    icon: Sparkles,
    color: "from-amber-500 to-orange-500",
    featured: false
  },
  {
    name: "Central Texas Youth Fair",
    date: "Annual",
    description: "Youth livestock projects showcase at the fairgrounds",
    icon: Music,
    color: "from-green-500 to-emerald-500",
    featured: false
  },
  {
    name: "Trick or Treat on Main",
    date: "October",
    description: "Safe Halloween fun hosted by local merchants",
    icon: Sparkles,
    color: "from-orange-500 to-yellow-500",
    featured: false
  },
  {
    name: "County-Wide Garage Sale",
    date: "Various",
    description: "Large-scale bargain hunting event across Bosque County",
    icon: ShoppingBag,
    color: "from-pink-500 to-rose-500",
    featured: false
  }
];

const featuredEvents = events.filter(e => e.featured);
const otherEvents = events.filter(e => !e.featured);

export default function EventsSlide({ hotelName, currentTime }) {
  const currentMonth = currentTime?.toLocaleDateString("en-US", { month: "long" }) || "March";
  
  return (
    <div 
      className="w-full h-full relative overflow-hidden"
      data-testid="events-slide"
    >
      {/* Background with warm gradient */}
      <div 
        className="absolute inset-0"
        style={{
          background: "linear-gradient(135deg, #7c2d12 0%, #9a3412 25%, #c2410c 50%, #ea580c 75%, #f97316 100%)"
        }}
      />
      
      {/* Decorative circles */}
      <div className="absolute top-20 right-20 w-64 h-64 rounded-full bg-white/5 blur-3xl" />
      <div className="absolute bottom-20 left-20 w-96 h-96 rounded-full bg-yellow-500/10 blur-3xl" />

      {/* Content */}
      <div className="relative z-10 h-full flex flex-col p-12 lg:p-16">
        {/* Header */}
        <div className="flex justify-between items-start mb-6">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <Calendar className="w-8 h-8 text-yellow-300" />
              <h2 className="text-4xl lg:text-5xl font-serif font-semibold text-white tracking-wide">
                Local Events
              </h2>
            </div>
            <p className="text-xl text-white/80 font-sans ml-11">
              What's happening in Clifton, Texas
            </p>
          </div>
          <div className="text-right">
            <p className="text-white/60 text-sm uppercase tracking-widest font-sans">Current Month</p>
            <p className="text-white text-2xl font-serif">{currentMonth}</p>
          </div>
        </div>

        {/* Featured Events */}
        <div className="mb-6">
          <h3 className="text-sm uppercase tracking-widest text-yellow-300/80 font-sans mb-4 flex items-center gap-2">
            <Star className="w-4 h-4" /> Featured Annual Events
          </h3>
          <div className="grid grid-cols-4 gap-4">
            {featuredEvents.map((event, index) => {
              const Icon = event.icon;
              return (
                <motion.div
                  key={event.name}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.1, duration: 0.4 }}
                  className="bg-white/10 backdrop-blur-sm rounded-2xl p-5 border border-white/20 hover:bg-white/15 transition-all"
                >
                  <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${event.color} flex items-center justify-center mb-3 shadow-lg`}>
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                  <h4 className="text-lg font-semibold text-white font-sans mb-1">
                    {event.name}
                  </h4>
                  <p className="text-yellow-300 text-sm font-medium mb-2">
                    {event.date}
                  </p>
                  <p className="text-sm text-white/70 font-sans leading-relaxed">
                    {event.description}
                  </p>
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* Other Events */}
        <div className="flex-1">
          <h3 className="text-sm uppercase tracking-widest text-white/60 font-sans mb-4">
            More Community Events
          </h3>
          <div className="grid grid-cols-4 gap-3">
            {otherEvents.map((event, index) => {
              const Icon = event.icon;
              return (
                <motion.div
                  key={event.name}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.4 + index * 0.1, duration: 0.4 }}
                  className="bg-white/5 backdrop-blur-sm rounded-xl p-4 border border-white/10 flex items-start gap-3"
                >
                  <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${event.color} flex items-center justify-center flex-shrink-0`}>
                    <Icon className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-white font-sans">
                      {event.name}
                    </h4>
                    <p className="text-yellow-300/80 text-xs">{event.date}</p>
                    <p className="text-xs text-white/60 mt-1">{event.description}</p>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* Footer */}
        <div className="mt-4 flex items-center justify-between text-white/50">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4" />
            <span className="text-sm font-sans">Ask our concierge for event details and tickets</span>
          </div>
          <div className="text-right">
            <p className="text-sm font-sans">{hotelName || "Velkommen Inn"}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
