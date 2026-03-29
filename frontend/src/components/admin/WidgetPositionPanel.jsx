import { useState, useRef, useCallback, useMemo } from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "../../components/ui/card";
import { Maximize2, Image as ImageIcon } from "lucide-react";

const DEFAULT_POSITIONS = {
  logo: { x: 3, y: 3 },
  clock: { x: 85, y: 3 },
  weather: { x: 3, y: 80 },
  news: { x: 55, y: 85 },
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

  const positions = useMemo(() => ({ ...DEFAULT_POSITIONS, ...settings.widget_positions }), [settings.widget_positions]);

  const updatePosition = useCallback((key, x, y) => {
    const clamped = { x: Math.max(0, Math.min(95, x)), y: Math.max(0, Math.min(95, y)) };
    setSettings(prev => {
      const newPositions = { ...DEFAULT_POSITIONS, ...prev.widget_positions, [key]: clamped };
      const updated = { ...prev, widget_positions: newPositions };
      if (onSave) setTimeout(() => onSave(updated), 100);
      return updated;
    });
  }, [setSettings, onSave]);

  const handleMouseDown = (e, key) => {
    e.preventDefault();
    e.stopPropagation();
    setDragging(key);
  };

  const handleMouseMove = useCallback((e) => {
    if (!dragging || !canvasRef.current) return;
    const rect = canvasRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    updatePosition(dragging, x, y);
  }, [dragging, updatePosition]);

  const handleMouseUp = useCallback(() => {
    setDragging(null);
  }, []);

  const handleTouchMove = useCallback((e) => {
    if (!dragging || !canvasRef.current) return;
    const touch = e.touches[0];
    const rect = canvasRef.current.getBoundingClientRect();
    const x = ((touch.clientX - rect.left) / rect.width) * 100;
    const y = ((touch.clientY - rect.top) / rect.height) * 100;
    updatePosition(dragging, x, y);
  }, [dragging, updatePosition]);

  return (
    <Card className="bg-card border-white/10">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Maximize2 className="w-5 h-5" />
          Widget Positioning
        </CardTitle>
        <CardDescription>Drag widgets to any position on the preview canvas</CardDescription>
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
            aspectRatio: settings.display_orientation === "portrait" ? '3/4' : '16/9',
            maxHeight: 320,
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
            <ImageIcon className="w-10 h-10 text-white/8" />
          </div>

          {/* Grid lines */}
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute left-1/3 top-0 bottom-0 border-l border-white/5" />
            <div className="absolute left-2/3 top-0 bottom-0 border-l border-white/5" />
            <div className="absolute top-1/3 left-0 right-0 border-t border-white/5" />
            <div className="absolute top-2/3 left-0 right-0 border-t border-white/5" />
          </div>

          {/* Draggable widgets */}
          {WIDGETS.map(w => {
            const pos = positions[w.key] || DEFAULT_POSITIONS[w.key];
            const posStyle = {};
            if (pos.x <= 50) posStyle.left = `${pos.x}%`;
            else posStyle.right = `${100 - pos.x}%`;
            if (pos.y <= 50) posStyle.top = `${pos.y}%`;
            else posStyle.bottom = `${100 - pos.y}%`;
            return (
              <div
                key={w.key}
                className={`absolute z-10 transition-shadow ${dragging === w.key ? 'ring-2 ring-white/50 shadow-lg' : 'hover:ring-1 hover:ring-white/30'}`}
                style={{
                  ...posStyle,
                  cursor: dragging === w.key ? 'grabbing' : 'grab',
                  userSelect: 'none',
                }}
                onMouseDown={(e) => handleMouseDown(e, w.key)}
                onTouchStart={(e) => { e.preventDefault(); setDragging(w.key); }}
                data-testid={`widget-drag-${w.key}`}
              >
                <div
                  className="text-white text-[10px] font-bold px-2 py-1 rounded-md shadow-md whitespace-nowrap"
                  style={{ background: w.color }}
                >
                  {w.label}
                </div>
              </div>
            );
          })}
        </div>

        <p className="text-xs text-muted-foreground text-center">
          Drag any widget to reposition it. Changes save automatically.
        </p>
      </CardContent>
    </Card>
  );
}
