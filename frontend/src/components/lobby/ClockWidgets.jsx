import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { GlassPanel } from "./GlassPanel";

const FONT_MAP = {
  modern: "font-sans",
  classic: "font-serif",
  mono: "font-mono",
};

export const LiveClock = ({ theme, size = "large", format = "12h", clockStyle = "digital", fontStyle = "modern", color = "#ffffff", glass = true }) => {
  const [time, setTime] = useState(new Date());
  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const hours24 = time.getHours();
  const minutes = time.getMinutes().toString().padStart(2, "0");
  const seconds = time.getSeconds().toString().padStart(2, "0");
  const ampm = hours24 >= 12 ? "PM" : "AM";
  const hours12 = hours24 % 12 || 12;
  const displayHours = format === "24h" ? hours24.toString().padStart(2, "0") : hours12;
  const fontClass = FONT_MAP[fontStyle] || FONT_MAP.modern;

  const fontSize =
    clockStyle === "large" ? (size === "compact" ? "clamp(3rem, 8vw, 5rem)" : "clamp(4rem, 10vw, 7rem)") :
    clockStyle === "minimal" ? (size === "compact" ? "clamp(1.5rem, 4vw, 2.5rem)" : "clamp(2rem, 5vw, 3.5rem)") :
    (size === "compact" ? "clamp(2rem, 5vw, 3.5rem)" : "clamp(3rem, 7vw, 5rem)");

  const content = (
    <div data-testid="live-clock">
      <motion.div
        className={`${fontClass} font-light tracking-tight leading-none`}
        style={{ fontSize, color }}
        animate={{ opacity: [0.95, 1, 0.95] }}
        transition={{ duration: 2, repeat: Infinity }}
      >
        <span>{displayHours}</span>
        <motion.span animate={{ opacity: [1, 0.4, 1] }} transition={{ duration: 1, repeat: Infinity }}>:</motion.span>
        <span>{minutes}</span>
        {clockStyle === "large" && (
          <>
            <motion.span animate={{ opacity: [1, 0.4, 1] }} transition={{ duration: 1, repeat: Infinity }}>:</motion.span>
            <span>{seconds}</span>
          </>
        )}
        {format === "12h" && clockStyle !== "minimal" && (
          <span className="text-lg ml-2" style={{ color, opacity: 0.7 }}>{ampm}</span>
        )}
      </motion.div>
      {clockStyle === "minimal" && format === "12h" && (
        <p className="text-xs mt-0.5" style={{ color, opacity: 0.5 }}>{ampm}</p>
      )}
    </div>
  );

  if (glass) {
    return <GlassPanel theme={theme} className="px-4 py-3">{content}</GlassPanel>;
  }
  return content;
};

export const DateDisplay = ({ theme, fontStyle = "modern", color = "#ffffff" }) => {
  const [date, setDate] = useState(new Date());
  useEffect(() => {
    const timer = setInterval(() => setDate(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);
  const fontClass = FONT_MAP[fontStyle] || FONT_MAP.modern;
  const dateStr = date.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric", year: "numeric" });
  return (
    <motion.p
      className={`text-sm ${fontClass} font-light tracking-wider mt-1`}
      style={{ color, opacity: 0.8 }}
      animate={{ opacity: [0.7, 0.9, 0.7] }}
      transition={{ duration: 4, repeat: Infinity }}
      data-testid="date-display"
    >
      {dateStr}
    </motion.p>
  );
};
