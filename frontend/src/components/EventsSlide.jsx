import { Calendar, Star, MapPin, Clock, Globe, Music, Flag, Sparkles } from "lucide-react";
import { motion } from "framer-motion";
import WeatherBackground from "./WeatherBackground";

// Category color mapping
const CATEGORY_COLORS = {
  community: "from-blue-500 to-indigo-600",
  music: "from-purple-500 to-violet-600",
  arts: "from-pink-500 to-rose-500",
  food: "from-amber-500 to-orange-500",
  sports: "from-green-500 to-emerald-600",
  holiday: "from-red-500 to-rose-600",
  festival: "from-yellow-500 to-amber-500",
  market: "from-teal-500 to-cyan-500",
  charity: "from-indigo-500 to-blue-600",
  outdoor: "from-emerald-500 to-teal-500",
  family: "from-orange-500 to-yellow-500",
  education: "from-cyan-500 to-blue-500",
};

// Fallback events if API returns empty
const FALLBACK_EVENTS = [
  { title: "Clifton Norwegian Heritage Festival", description: "Annual celebration of Norwegian roots with food, music, and crafts", event_date: "2026-04-18", start_time: "9:00 AM", end_time: "5:00 PM", location: "Downtown Clifton", category: "festival", featured: true },
  { title: "Bosque County Farmers Market", description: "Fresh local produce, baked goods, and artisan items", event_date: "2026-04-05", start_time: "8:00 AM", end_time: "12:00 PM", location: "Clifton City Park", category: "market", featured: false },
  { title: "Live Music at Cliftex Theatre", description: "Local bands performing country and folk music", event_date: "2026-04-12", start_time: "7:00 PM", end_time: "10:00 PM", location: "Cliftex Theatre", category: "music", featured: true },
  { title: "Spring Trail Hike", description: "Guided nature hike through Meridian State Park", event_date: "2026-04-20", start_time: "8:00 AM", end_time: "11:00 AM", location: "Meridian State Park", category: "outdoor", featured: false },
];

function formatEventDate(dateStr) {
  if (!dateStr) return "";
  try {
    const d = new Date(dateStr + "T00:00:00");
    return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  } catch {
    return dateStr;
  }
}

export default function EventsSlide({ weather, currentTime, isPortrait, events: dynamicEvents, maxItems }) {
  const allEvents = (dynamicEvents && dynamicEvents.length > 0)
    ? dynamicEvents.filter(e => e.enabled !== false)
    : FALLBACK_EVENTS;

  const limit = maxItems || 8;
  const featuredEvents = allEvents.filter(e => e.featured).slice(0, Math.min(4, limit));
  const otherEvents = allEvents.filter(e => !e.featured).slice(0, limit - featuredEvents.length);
  const currentMonth = currentTime?.toLocaleDateString("en-US", { month: "long" }) || "March";
  
  return (
    <div 
      className="w-full h-full relative overflow-hidden"
      data-testid="events-slide"
    >
      <WeatherBackground condition={weather?.condition} icon={weather?.icon} />
      <div className="absolute inset-0 bg-black/30 z-[1]" />

      <div className={`relative h-full flex flex-col ${isPortrait ? 'p-6 lg:p-8' : 'p-12 lg:p-16'}`} style={{ zIndex: 2 }}>
        {/* Header */}
        <div className={`flex ${isPortrait ? 'flex-col items-center gap-1' : 'justify-between items-start'} mb-5`}>
          <div className={isPortrait ? 'text-center' : ''}>
            <div className={`flex items-center gap-3 mb-1 ${isPortrait ? 'justify-center' : ''}`}>
              <Calendar className="w-7 h-7 text-yellow-300" />
              <h2 className={`${isPortrait ? 'text-3xl' : 'text-4xl lg:text-5xl'} font-serif font-semibold text-white tracking-wide`}>
                Local Events
              </h2>
            </div>
            <p className={`text-lg text-white/80 font-sans ${isPortrait ? '' : 'ml-11'}`}>
              What's happening in Clifton, Texas
            </p>
          </div>
          <div className={isPortrait ? 'text-center mt-1' : 'text-right'}>
            <p className="text-white/60 text-xs uppercase tracking-widest font-sans">Current Month</p>
            <p className="text-white text-xl font-serif">{currentMonth}</p>
          </div>
        </div>

        {/* Featured Events */}
        {featuredEvents.length > 0 && (
          <div className="mb-4">
            <h3 className="text-xs uppercase tracking-widest text-yellow-300/80 font-sans mb-3 flex items-center gap-2">
              <Star className="w-3.5 h-3.5" /> Featured Events
            </h3>
            <div className={`grid ${isPortrait ? 'grid-cols-2 gap-3' : `grid-cols-${Math.min(featuredEvents.length, 4)} gap-4`}`}>
              {featuredEvents.map((event, index) => {
                const color = CATEGORY_COLORS[event.category] || "from-blue-500 to-indigo-600";
                return (
                  <motion.div
                    key={event.title + index}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: index * 0.1, duration: 0.4 }}
                    className={`bg-white/10 backdrop-blur-sm rounded-2xl ${isPortrait ? 'p-3' : 'p-5'} border border-white/20 transition-all overflow-hidden`}
                  >
                    {/* Image strip if available */}
                    {event.image_url && (
                      <div className={`-mx-3 -mt-3 ${isPortrait ? '-mx-3 -mt-3' : '-mx-5 -mt-5'} mb-3 h-20 overflow-hidden`}>
                        <img src={event.image_url} alt={event.title} className="w-full h-full object-cover" />
                      </div>
                    )}
                    <div className={`${isPortrait ? 'w-9 h-9' : 'w-12 h-12'} rounded-xl bg-gradient-to-br ${color} flex items-center justify-center mb-2 shadow-lg`}>
                      <Calendar className={`${isPortrait ? 'w-4 h-4' : 'w-6 h-6'} text-white`} />
                    </div>
                    <h4 className={`${isPortrait ? 'text-sm' : 'text-lg'} font-semibold text-white font-sans mb-0.5`}>
                      {event.title}
                    </h4>
                    <p className={`text-yellow-300 ${isPortrait ? 'text-xs' : 'text-sm'} font-medium mb-1`}>
                      {formatEventDate(event.event_date)}
                      {event.start_time ? ` at ${event.start_time}` : ""}
                    </p>
                    <p className={`${isPortrait ? 'text-xs' : 'text-sm'} text-white/70 font-sans leading-relaxed`}>
                      {event.description}
                    </p>
                    {event.location && (
                      <p className="text-xs text-white/50 mt-1 flex items-center gap-1">
                        <MapPin className="w-3 h-3" /> {event.location}
                      </p>
                    )}
                  </motion.div>
                );
              })}
            </div>
          </div>
        )}

        {/* Other Events */}
        {otherEvents.length > 0 && (
          <div className="flex-1">
            {featuredEvents.length > 0 && (
              <h3 className="text-xs uppercase tracking-widest text-white/60 font-sans mb-3">
                More Events
              </h3>
            )}
            <div className={`grid ${isPortrait ? 'grid-cols-2 gap-2' : 'grid-cols-4 gap-3'}`}>
              {otherEvents.map((event, index) => {
                const color = CATEGORY_COLORS[event.category] || "from-blue-500 to-indigo-600";
                return (
                  <motion.div
                    key={event.title + index}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.4 + index * 0.1, duration: 0.4 }}
                    className={`bg-white/5 backdrop-blur-sm rounded-xl ${isPortrait ? 'p-2.5' : 'p-4'} border border-white/10 flex items-start gap-2`}
                  >
                    <div className={`${isPortrait ? 'w-8 h-8' : 'w-10 h-10'} rounded-lg bg-gradient-to-br ${color} flex items-center justify-center flex-shrink-0`}>
                      <Calendar className={`${isPortrait ? 'w-4 h-4' : 'w-5 h-5'} text-white`} />
                    </div>
                    <div className="min-w-0">
                      <h4 className={`${isPortrait ? 'text-xs' : 'text-sm'} font-semibold text-white font-sans`}>
                        {event.title}
                      </h4>
                      <p className="text-yellow-300/80 text-xs">
                        {formatEventDate(event.event_date)}
                        {event.start_time ? ` - ${event.start_time}` : ""}
                      </p>
                      {!isPortrait && event.location && (
                        <p className="text-xs text-white/50 mt-0.5 flex items-center gap-1">
                          <MapPin className="w-3 h-3" /> {event.location}
                        </p>
                      )}
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="mt-4 flex items-center justify-center gap-2 text-white/50">
          <MapPin className="w-4 h-4" />
          <span className="text-sm font-sans">Clifton, TX 76634</span>
        </div>
      </div>
    </div>
  );
}
