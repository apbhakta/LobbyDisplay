import { motion } from "framer-motion";
import { useMemo } from "react";

// Weather theme mapping
const getWeatherTheme = (condition, icon) => {
  const conditionLower = condition?.toLowerCase() || "";
  const isNight = icon?.includes("n");
  
  if (conditionLower.includes("thunder") || conditionLower.includes("storm")) return "storm";
  if (conditionLower.includes("rain") || conditionLower.includes("drizzle") || conditionLower.includes("shower")) return "rain";
  if (conditionLower.includes("snow") || conditionLower.includes("sleet")) return "snow";
  if (conditionLower.includes("mist") || conditionLower.includes("fog") || conditionLower.includes("haze") || conditionLower.includes("smoke")) return "fog";
  if (conditionLower.includes("cloud") || conditionLower.includes("overcast")) return "cloudy";
  if (conditionLower.includes("clear") || conditionLower.includes("sunny")) return isNight ? "night" : "sunny";
  if (conditionLower.includes("wind")) return "windy";
  
  // Default based on icon
  if (icon?.includes("01")) return isNight ? "night" : "sunny";
  if (icon?.includes("02") || icon?.includes("03") || icon?.includes("04")) return "cloudy";
  if (icon?.includes("09") || icon?.includes("10")) return "rain";
  if (icon?.includes("11")) return "storm";
  if (icon?.includes("13")) return "snow";
  if (icon?.includes("50")) return "fog";
  
  return isNight ? "night" : "sunny";
};

// Theme configurations
const themes = {
  sunny: {
    gradient: "linear-gradient(180deg, #1e3a5f 0%, #2563eb 30%, #3b82f6 60%, #60a5fa 100%)",
    accentColor: "rgba(251, 191, 36, 0.3)",
    particleColor: "rgba(255, 255, 255, 0.1)",
  },
  night: {
    gradient: "linear-gradient(180deg, #0a0a1a 0%, #1a1a2e 40%, #16213e 100%)",
    accentColor: "rgba(147, 197, 253, 0.2)",
    particleColor: "rgba(255, 255, 255, 0.3)",
  },
  cloudy: {
    gradient: "linear-gradient(180deg, #475569 0%, #64748b 40%, #94a3b8 100%)",
    accentColor: "rgba(255, 255, 255, 0.15)",
    particleColor: "rgba(255, 255, 255, 0.1)",
  },
  rain: {
    gradient: "linear-gradient(180deg, #1e293b 0%, #334155 40%, #475569 100%)",
    accentColor: "rgba(96, 165, 250, 0.2)",
    particleColor: "rgba(147, 197, 253, 0.4)",
  },
  storm: {
    gradient: "linear-gradient(180deg, #0f172a 0%, #1e293b 40%, #334155 100%)",
    accentColor: "rgba(250, 204, 21, 0.15)",
    particleColor: "rgba(255, 255, 255, 0.1)",
  },
  snow: {
    gradient: "linear-gradient(180deg, #cbd5e1 0%, #e2e8f0 40%, #f1f5f9 100%)",
    accentColor: "rgba(255, 255, 255, 0.3)",
    particleColor: "rgba(255, 255, 255, 0.8)",
  },
  fog: {
    gradient: "linear-gradient(180deg, #6b7280 0%, #9ca3af 40%, #d1d5db 100%)",
    accentColor: "rgba(255, 255, 255, 0.2)",
    particleColor: "rgba(255, 255, 255, 0.15)",
  },
  windy: {
    gradient: "linear-gradient(180deg, #0ea5e9 0%, #38bdf8 40%, #7dd3fc 100%)",
    accentColor: "rgba(255, 255, 255, 0.2)",
    particleColor: "rgba(255, 255, 255, 0.15)",
  },
};

// Sun glow for sunny theme
const SunGlow = () => (
  <div className="absolute top-0 right-0 w-[800px] h-[800px] pointer-events-none">
    <motion.div
      className="absolute top-[-200px] right-[-200px] w-full h-full rounded-full"
      style={{
        background: "radial-gradient(circle, rgba(251,191,36,0.4) 0%, rgba(251,191,36,0.1) 40%, transparent 70%)",
      }}
      animate={{ 
        scale: [1, 1.05, 1],
        opacity: [0.6, 0.8, 0.6]
      }}
      transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
    />
  </div>
);

// Stars for night theme
const Stars = () => {
  const stars = useMemo(() => 
    Array.from({ length: 60 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 60,
      size: Math.random() * 2 + 1,
      delay: Math.random() * 4,
      duration: 2 + Math.random() * 3,
    })), []
  );

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {stars.map((star) => (
        <motion.div
          key={star.id}
          className="absolute rounded-full bg-white"
          style={{
            left: `${star.x}%`,
            top: `${star.y}%`,
            width: star.size,
            height: star.size,
          }}
          animate={{ opacity: [0.3, 1, 0.3] }}
          transition={{ 
            duration: star.duration, 
            repeat: Infinity, 
            delay: star.delay,
            ease: "easeInOut"
          }}
        />
      ))}
      {/* Moon */}
      <motion.div
        className="absolute top-16 right-32 w-24 h-24 rounded-full"
        style={{
          background: "radial-gradient(circle at 30% 30%, #f5f5f5 0%, #d1d5db 100%)",
          boxShadow: "0 0 60px rgba(255,255,255,0.3)",
        }}
        animate={{ opacity: [0.8, 0.9, 0.8] }}
        transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
      />
    </div>
  );
};

// Clouds for cloudy theme
const Clouds = () => {
  const clouds = useMemo(() => [
    { width: 400, height: 120, top: "10%", duration: 80, delay: 0, opacity: 0.15 },
    { width: 300, height: 90, top: "25%", duration: 60, delay: 10, opacity: 0.12 },
    { width: 500, height: 150, top: "15%", duration: 100, delay: 20, opacity: 0.1 },
    { width: 350, height: 100, top: "35%", duration: 70, delay: 30, opacity: 0.08 },
  ], []);

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {clouds.map((cloud, i) => (
        <motion.div
          key={i}
          className="absolute rounded-full"
          style={{
            width: cloud.width,
            height: cloud.height,
            top: cloud.top,
            background: `radial-gradient(ellipse, rgba(255,255,255,${cloud.opacity}) 0%, transparent 70%)`,
            filter: "blur(40px)",
          }}
          initial={{ x: "-100%" }}
          animate={{ x: "120vw" }}
          transition={{
            duration: cloud.duration,
            repeat: Infinity,
            delay: cloud.delay,
            ease: "linear",
          }}
        />
      ))}
    </div>
  );
};

// Rain effect
const Rain = () => {
  const raindrops = useMemo(() => 
    Array.from({ length: 80 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      delay: Math.random() * 2,
      duration: 0.6 + Math.random() * 0.4,
      height: 20 + Math.random() * 30,
    })), []
  );

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {raindrops.map((drop) => (
        <motion.div
          key={drop.id}
          className="absolute w-px"
          style={{
            left: `${drop.x}%`,
            top: "-10%",
            height: drop.height,
            background: "linear-gradient(to bottom, transparent, rgba(147,197,253,0.4), rgba(147,197,253,0.6))",
          }}
          animate={{ y: "120vh" }}
          transition={{
            duration: drop.duration,
            repeat: Infinity,
            delay: drop.delay,
            ease: "linear",
          }}
        />
      ))}
    </div>
  );
};

// Storm with lightning
const Storm = () => (
  <div className="absolute inset-0 overflow-hidden pointer-events-none">
    <Clouds />
    <Rain />
    {/* Lightning flash */}
    <motion.div
      className="absolute inset-0 bg-white/10"
      animate={{ opacity: [0, 0, 0, 0, 0.3, 0, 0, 0, 0, 0, 0.15, 0] }}
      transition={{ duration: 8, repeat: Infinity, repeatDelay: 4 }}
    />
  </div>
);

// Snow effect
const Snow = () => {
  const snowflakes = useMemo(() => 
    Array.from({ length: 50 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      delay: Math.random() * 8,
      duration: 10 + Math.random() * 10,
      size: 2 + Math.random() * 4,
      drift: 30 + Math.random() * 40,
    })), []
  );

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {snowflakes.map((flake) => (
        <motion.div
          key={flake.id}
          className="absolute rounded-full bg-white"
          style={{
            left: `${flake.x}%`,
            top: "-5%",
            width: flake.size,
            height: flake.size,
            opacity: 0.8,
          }}
          animate={{ 
            y: "110vh",
            x: [0, flake.drift, -flake.drift, 0],
          }}
          transition={{
            y: { duration: flake.duration, repeat: Infinity, ease: "linear", delay: flake.delay },
            x: { duration: flake.duration / 2, repeat: Infinity, ease: "easeInOut", delay: flake.delay },
          }}
        />
      ))}
    </div>
  );
};

// Fog/Mist effect
const Fog = () => (
  <div className="absolute inset-0 overflow-hidden pointer-events-none">
    {[0, 1, 2].map((i) => (
      <motion.div
        key={i}
        className="absolute w-[200%] h-48"
        style={{
          top: `${30 + i * 20}%`,
          background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.1), transparent)",
          filter: "blur(40px)",
        }}
        animate={{ x: ["-50%", "0%", "-50%"] }}
        transition={{
          duration: 30 + i * 10,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />
    ))}
  </div>
);

// Wind streaks
const Wind = () => {
  const streaks = useMemo(() => 
    Array.from({ length: 20 }, (_, i) => ({
      id: i,
      y: Math.random() * 100,
      delay: Math.random() * 3,
      duration: 2 + Math.random() * 2,
      width: 100 + Math.random() * 200,
    })), []
  );

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {streaks.map((streak) => (
        <motion.div
          key={streak.id}
          className="absolute h-px"
          style={{
            top: `${streak.y}%`,
            width: streak.width,
            background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent)",
          }}
          initial={{ x: "-100%", opacity: 0 }}
          animate={{ x: "200vw", opacity: [0, 0.5, 0] }}
          transition={{
            duration: streak.duration,
            repeat: Infinity,
            delay: streak.delay,
            ease: "easeOut",
          }}
        />
      ))}
    </div>
  );
};

// Main Weather Background Component
export default function WeatherBackground({ condition, icon }) {
  const theme = getWeatherTheme(condition, icon);
  const themeConfig = themes[theme] || themes.sunny;

  const renderWeatherEffect = () => {
    switch (theme) {
      case "sunny":
        return <SunGlow />;
      case "night":
        return <Stars />;
      case "cloudy":
        return <Clouds />;
      case "rain":
        return (
          <>
            <Clouds />
            <Rain />
          </>
        );
      case "storm":
        return <Storm />;
      case "snow":
        return <Snow />;
      case "fog":
        return <Fog />;
      case "windy":
        return (
          <>
            <Wind />
            <Clouds />
          </>
        );
      default:
        return <SunGlow />;
    }
  };

  return (
    <div className="absolute inset-0 overflow-hidden">
      {/* Base gradient */}
      <motion.div
        className="absolute inset-0"
        style={{ background: themeConfig.gradient }}
        animate={{ opacity: [0.95, 1, 0.95] }}
        transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
      />
      
      {/* Weather effects */}
      {renderWeatherEffect()}
      
      {/* Subtle vignette */}
      <div 
        className="absolute inset-0 pointer-events-none"
        style={{
          background: "radial-gradient(ellipse at center, transparent 40%, rgba(0,0,0,0.3) 100%)",
        }}
      />
    </div>
  );
}

// Export theme getter for widgets
export { getWeatherTheme };
