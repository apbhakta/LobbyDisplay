import { useState, useRef, useCallback, useMemo } from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Maximize2, Image as ImageIcon, RotateCcw } from "lucide-react";

export const DEFAULT_POSITIONS_LANDSCAPE = {
  logo: { x: 5, y: 5 },
  clock: { x: 90, y: 5 },
  weather: { x: 5, y: 92 },
  news: { x: 90, y: 92 },
};

export const DEFAULT_POSITIONS_PORTRAIT = {
  logo: { x: 10, y: 4 },
  clock: { x: 85, y: 4 },
  weather: { x: 10, y: 92 },
  news: { x: 85, y: 92 },
};

const WIDGETS = [
  { key: "logo", label: "Logo", color: "#f59e0b" },
  { key: "clock", label: "Clock", color: "#3b82f6" },
  { key: "weather", label: "Weather", color: "#22c55e" },
  { key: "news", label: "News", color: "#a855f7" },
];

export default function WidgetPositionPanel({ settings, setSettings, onSave }) {
  const canvasRef = useRef(null);
  const [dragging, setDragging] = useState(null);
  // Local drag state for smooth movement — no API calls during drag
  const [dragPositions, setDragPositions] = useState(null);

  const isPortrait = settings.display_orientation === "portrait";
  const defaultPositions = isPortrait ? DEFAULT_POSITIONS_PORTRAIT : DEFAULT_POSITIONS_LANDSCAPE;
  // Compute actual aspect ratio from settings dimensions
  const canvasAspect = (() => {
    const w = parseFloat(settings.display_width) || 16;
    const h = parseFloat(settings.display_height) || 9;
    return `${w}/${h}`;
  })();

  const savedPositions = useMemo(() => ({ ...defaultPositions, ...settings.widget_positions }), [settings.widget_positions, defaultPositions]);
  const positions = dragPositions || savedPositions;

  const handleMouseDown = (e, key) => {
    e.preventDefault();
    e.stopPropagation();
    setDragging(key);
    setDragPositions({ ...savedPositions });
  };

  const handleMouseMove = useCallback((e) => {
    if (!dragging || !canvasRef.current) return;
    const rect = canvasRef.current.getBoundingClientRect();
    const x = Math.max(0, Math.min(100, ((e.clientX - rect.left) / rect.width) * 100));
    const y = Math.max(0, Math.min(100, ((e.clientY - rect.top) / rect.height) * 100));
    setDragPositions(prev => prev ? { ...prev, [dragging]: { x, y } } : null);
  }, [dragging]);

  const handleMouseUp = useCallback(() => {
    if (dragging && dragPositions) {
      // Save final position to settings + backend
      const finalPositions = { ...dragPositions };
      setSettings(prev => {
        const updated = { ...prev, widget_positions: finalPositions };
        if (onSave) setTimeout(() => onSave(updated), 50);
        return updated;
      });
    }
    setDragging(null);
    setDragPositions(null);
  }, [dragging, dragPositions, setSettings, onSave]);

  const handleTouchMove = useCallback((e) => {
    if (!dragging || !canvasRef.current) return;
    const touch = e.touches[0];
    const rect = canvasRef.current.getBoundingClientRect();
    const x = Math.max(0, Math.min(100, ((touch.clientX - rect.left) / rect.width) * 100));
    const y = Math.max(0, Math.min(100, ((touch.clientY - rect.top) / rect.height) * 100));
    setDragPositions(prev => prev ? { ...prev, [dragging]: { x, y } } : null);
  }, [dragging]);

  return (
    <Card className="bg-card border-white/10">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Maximize2 className="w-5 h-5" />
          Widget Positioning
        </CardTitle>
        <CardDescription>Drag widgets freely to any position. Saves when you release.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Legend */}
        <div className="flex gap-3 flex-wrap">
          {WIDGETS.map(w => (
            <div key={w.key} className="flex items-center gap-1.5 text-xs">
              <span className="w-3 h-3 rounded" style={{ background: w.color }} />
              <span className="text-muted-foreground">{w.label}</span>
            </div>
          ))}
        </div>

        {/* Canvas */}
        <div
          ref={canvasRef}
          className="relative rounded-xl border border-white/20 overflow-hidden select-none"
          style={{
            aspectRatio: canvasAspect,
            maxHeight: 360,
            background: 'linear-gradient(180deg, #1e293b 0%, #334155 50%, #0f172a 100%)',
            cursor: dragging ? 'grabbing' : 'default',
            touchAction: 'none',
          }}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleMouseUp}
          data-testid="widget-position-canvas"
        >
          <div className="absolute inset-0 bg-black/20" />
          <div className="absolute inset-0 flex items-center justify-center">
            <ImageIcon className="w-10 h-10 text-white/[0.08]" />
          </div>

          {/* Grid guides */}
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute left-1/4 top-0 bottom-0 border-l border-white/[0.04]" />
            <div className="absolute left-1/2 top-0 bottom-0 border-l border-dashed border-white/[0.08]" />
            <div className="absolute left-3/4 top-0 bottom-0 border-l border-white/[0.04]" />
            <div className="absolute top-1/4 left-0 right-0 border-t border-white/[0.04]" />
            <div className="absolute top-1/2 left-0 right-0 border-t border-dashed border-white/[0.08]" />
            <div className="absolute top-3/4 left-0 right-0 border-t border-white/[0.04]" />
          </div>

          {/* Draggable widgets — always use left/top on canvas for smooth drag */}
          {WIDGETS.map(w => {
            const pos = positions[w.key] || defaultPositions[w.key];
            const isDragging = dragging === w.key;
            return (
              <div
                key={w.key}
                className={`absolute z-10 ${isDragging ? 'ring-2 ring-white/60 shadow-xl scale-110' : 'hover:ring-1 hover:ring-white/30 hover:scale-105'}`}
                style={{
                  left: `${pos.x}%`,
                  top: `${pos.y}%`,
                  transform: 'translate(-50%, -50%)',
                  cursor: isDragging ? 'grabbing' : 'grab',
                  userSelect: 'none',
                  transition: isDragging ? 'none' : 'transform 0.15s, box-shadow 0.15s',
                }}
                onMouseDown={(e) => handleMouseDown(e, w.key)}
                onTouchStart={(e) => { e.preventDefault(); handleMouseDown(e, w.key); }}
                data-testid={`widget-drag-${w.key}`}
              >
                <div
                  className="text-white text-[10px] font-bold px-2.5 py-1 rounded-md shadow-md whitespace-nowrap"
                  style={{ background: w.color }}
                >
                  {w.label}
                </div>
              </div>
            );
          })}
        </div>

        <div className="flex items-center justify-between">
          <p className="text-xs text-muted-foreground">
            Drag any widget to reposition it. Changes save when you release.
          </p>
          <Button
            variant="outline"
            size="sm"
            className="gap-1.5 text-xs"
            onClick={() => {
              const defaults = isPortrait ? DEFAULT_POSITIONS_PORTRAIT : DEFAULT_POSITIONS_LANDSCAPE;
              setSettings(prev => {
                const updated = { ...prev, widget_positions: { ...defaults } };
                if (onSave) setTimeout(() => onSave(updated), 50);
                return updated;
              });
            }}
            data-testid="reset-widget-positions"
          >
            <RotateCcw className="w-3 h-3" />
            Reset Positions
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
