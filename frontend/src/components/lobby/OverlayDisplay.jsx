import { motion, AnimatePresence } from "framer-motion";
import { X, AlertTriangle, PartyPopper, Bell, Megaphone } from "lucide-react";

const STYLE_ICONS = {
  alert: AlertTriangle,
  celebration: PartyPopper,
  info: Bell,
  default: Megaphone,
};

// Banner style — appears at top
const BannerOverlay = ({ overlay }) => (
  <motion.div
    className="absolute top-0 left-0 right-0 z-50"
    initial={{ y: -100 }}
    animate={{ y: 0 }}
    exit={{ y: -100 }}
    transition={{ type: "spring", damping: 20 }}
    data-testid="overlay-banner"
  >
    <div
      className="py-4 px-8 flex items-center justify-center gap-3 backdrop-blur-md shadow-2xl"
      style={{ backgroundColor: overlay.bg_color + "ee", color: overlay.text_color }}
    >
      <Megaphone className="w-5 h-5 flex-shrink-0" />
      <div className="text-center">
        <p className="font-semibold text-base">{overlay.title}</p>
        {overlay.message && <p className="text-sm opacity-80 mt-0.5">{overlay.message}</p>}
      </div>
    </div>
  </motion.div>
);

// Corner style — appears in bottom-right corner
const CornerOverlay = ({ overlay }) => (
  <motion.div
    className="absolute bottom-20 right-6 z-50 max-w-sm"
    initial={{ opacity: 0, x: 100 }}
    animate={{ opacity: 1, x: 0 }}
    exit={{ opacity: 0, x: 100 }}
    transition={{ type: "spring", damping: 20 }}
    data-testid="overlay-corner"
  >
    <div
      className="rounded-2xl py-4 px-6 backdrop-blur-xl shadow-2xl border border-white/20"
      style={{ backgroundColor: overlay.bg_color + "dd", color: overlay.text_color }}
    >
      <p className="font-semibold text-sm">{overlay.title}</p>
      {overlay.message && <p className="text-xs opacity-80 mt-1">{overlay.message}</p>}
    </div>
  </motion.div>
);

// Fullscreen style — covers entire display
const FullscreenOverlay = ({ overlay }) => (
  <motion.div
    className="absolute inset-0 z-50 flex items-center justify-center"
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    exit={{ opacity: 0 }}
    data-testid="overlay-fullscreen"
  >
    <div
      className="absolute inset-0 backdrop-blur-sm"
      style={{ backgroundColor: overlay.bg_color + "cc" }}
    />
    <div className="relative z-10 text-center max-w-2xl px-8" style={{ color: overlay.text_color }}>
      <Megaphone className="w-12 h-12 mx-auto mb-4 opacity-80" />
      <h2 className="text-4xl font-serif font-bold mb-4">{overlay.title}</h2>
      {overlay.message && <p className="text-xl opacity-80 leading-relaxed">{overlay.message}</p>}
    </div>
  </motion.div>
);

// Ticker style — scrolling text at bottom
const TickerOverlay = ({ overlay }) => (
  <motion.div
    className="absolute bottom-8 left-0 right-0 z-50"
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    exit={{ opacity: 0 }}
    data-testid="overlay-ticker"
  >
    <div
      className="py-2 px-4 backdrop-blur-md overflow-hidden"
      style={{ backgroundColor: overlay.bg_color + "cc", color: overlay.text_color }}
    >
      <motion.div
        className="whitespace-nowrap flex items-center gap-8"
        animate={{ x: ["100%", "-100%"] }}
        transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
      >
        <span className="text-sm font-medium">{overlay.title}</span>
        {overlay.message && <span className="text-sm opacity-80">{overlay.message}</span>}
        <span className="text-sm font-medium">{overlay.title}</span>
        {overlay.message && <span className="text-sm opacity-80">{overlay.message}</span>}
      </motion.div>
    </div>
  </motion.div>
);

export default function OverlayDisplay({ overlays = [] }) {
  if (!overlays || overlays.length === 0) return null;

  return (
    <AnimatePresence>
      {overlays.map((overlay) => {
        switch (overlay.style) {
          case "banner": return <BannerOverlay key={overlay.id} overlay={overlay} />;
          case "corner": return <CornerOverlay key={overlay.id} overlay={overlay} />;
          case "fullscreen": return <FullscreenOverlay key={overlay.id} overlay={overlay} />;
          case "ticker": return <TickerOverlay key={overlay.id} overlay={overlay} />;
          default: return <BannerOverlay key={overlay.id} overlay={overlay} />;
        }
      })}
    </AnimatePresence>
  );
}
