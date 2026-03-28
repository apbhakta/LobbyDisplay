import { motion } from "framer-motion";

// Glassmorphism panel with weather-reactive styling
export const GlassPanel = ({ children, className = "", theme = "sunny", ...props }) => {
  const getGlassStyle = () => {
    const baseStyle = "backdrop-blur-xl border border-white/20 shadow-2xl";
    switch (theme) {
      case "snow": return `${baseStyle} bg-white/30`;
      case "rain": case "storm": return `${baseStyle} bg-black/25`;
      case "night": return `${baseStyle} bg-black/20`;
      case "fog": return `${baseStyle} bg-white/20`;
      case "cloudy": return `${baseStyle} bg-white/15`;
      default: return `${baseStyle} bg-white/10`;
    }
  };
  return (
    <motion.div
      className={`rounded-2xl ${getGlassStyle()} ${className}`}
      animate={{ boxShadow: ["0 8px 32px rgba(0,0,0,0.1)", "0 12px 40px rgba(0,0,0,0.15)", "0 8px 32px rgba(0,0,0,0.1)"] }}
      transition={{ duration: 4, repeat: Infinity }}
      {...props}
    >
      {children}
    </motion.div>
  );
};
