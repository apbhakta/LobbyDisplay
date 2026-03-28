import { motion } from "framer-motion";

// Glassmorphism panel — highly transparent so photos show through
export const GlassPanel = ({ children, className = "", theme = "sunny", ...props }) => {
  return (
    <motion.div
      className={`rounded-2xl backdrop-blur-md border border-white/10 bg-black/20 ${className}`}
      {...props}
    >
      {children}
    </motion.div>
  );
};
