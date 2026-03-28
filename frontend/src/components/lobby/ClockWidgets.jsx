import { useState, useEffect } from "react";
import { motion } from "framer-motion";

export const LiveClock = ({ theme, size = "large" }) => {
  const [time, setTime] = useState(new Date());
  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);
  const hours = time.getHours();
  const minutes = time.getMinutes().toString().padStart(2, "0");
  const ampm = hours >= 12 ? "PM" : "AM";
  const displayHours = hours % 12 || 12;
  const isSnow = theme === "snow";
  const textColor = isSnow ? "text-slate-800" : "text-white";
  const mutedColor = isSnow ? "text-slate-600" : "text-white/70";
  const fontSize = size === "compact" ? "clamp(2rem, 5vw, 3.5rem)" : "clamp(3rem, 7vw, 5rem)";

  return (
    <div data-testid="live-clock">
      <motion.div
        className={`font-light tracking-tight leading-none ${textColor}`}
        style={{ fontSize }}
        animate={{ opacity: [0.95, 1, 0.95] }}
        transition={{ duration: 2, repeat: Infinity }}
      >
        <span>{displayHours}</span>
        <motion.span animate={{ opacity: [1, 0.4, 1] }} transition={{ duration: 1, repeat: Infinity }}>:</motion.span>
        <span>{minutes}</span>
        <span className={`text-lg ml-2 ${mutedColor}`}>{ampm}</span>
      </motion.div>
    </div>
  );
};

export const DateDisplay = ({ theme }) => {
  const [date, setDate] = useState(new Date());
  useEffect(() => {
    const timer = setInterval(() => setDate(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);
  const isSnow = theme === "snow";
  const textColor = isSnow ? "text-slate-700" : "text-white/80";
  const dateStr = date.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric", year: "numeric" });
  return (
    <motion.p
      className={`text-sm font-light tracking-wider ${textColor} mt-1`}
      animate={{ opacity: [0.8, 1, 0.8] }}
      transition={{ duration: 4, repeat: Infinity }}
      data-testid="date-display"
    >
      {dateStr}
    </motion.p>
  );
};
