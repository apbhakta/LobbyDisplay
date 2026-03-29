import { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import { Film } from "lucide-react";

export default function VideoSlide({ video, onVideoEnd, isPortrait }) {
  const videoRef = useRef(null);
  const [hasError, setHasError] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    setHasError(false);
    setIsLoaded(false);
  }, [video?.id]);

  useEffect(() => {
    // If error, skip to next slide after 2s
    if (hasError && onVideoEnd) {
      const t = setTimeout(onVideoEnd, 2000);
      return () => clearTimeout(t);
    }
  }, [hasError, onVideoEnd]);

  const handleEnded = () => {
    if (video?.loop) return; // loop handled by video element
    if (onVideoEnd) onVideoEnd();
  };

  const handleError = () => {
    setHasError(true);
  };

  const handleCanPlay = () => {
    setIsLoaded(true);
    if (videoRef.current && video?.autoplay !== false) {
      videoRef.current.play().catch(() => {});
    }
  };

  if (!video || !video.video_url) {
    return null;
  }

  if (hasError) {
    return (
      <div className="w-full h-full bg-slate-900 flex items-center justify-center" data-testid="video-slide-error">
        <motion.div
          className="text-center opacity-30"
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.3 }}
        >
          <Film className="w-12 h-12 text-white/20 mx-auto mb-2" />
          <p className="text-white/20 text-sm">Video unavailable</p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="w-full h-full relative bg-black" data-testid="video-slide">
      <motion.video
        ref={videoRef}
        src={video.video_url}
        className="absolute inset-0 w-full h-full object-contain"
        style={{ backgroundColor: "#000" }}
        muted={video.mute !== false}
        autoPlay={video.autoplay !== false}
        loop={video.loop === true}
        controls={video.show_controls === true}
        playsInline
        onEnded={handleEnded}
        onError={handleError}
        onCanPlay={handleCanPlay}
        initial={{ opacity: 0 }}
        animate={{ opacity: isLoaded ? 1 : 0 }}
        transition={{ duration: 1 }}
        poster={video.thumbnail_url || undefined}
      />
    </div>
  );
}
