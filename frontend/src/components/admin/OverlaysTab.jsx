import { useState, useCallback, useEffect } from "react";
import axios from "axios";
import { toast } from "sonner";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../components/ui/select";
import { Megaphone, Plus, Check, Trash2, ToggleLeft, ToggleRight } from "lucide-react";

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

export default function OverlaysTab() {
  const [overlays, setOverlays] = useState([]);
  const [newOverlay, setNewOverlay] = useState(null);

  const fetchOverlays = useCallback(async () => {
    try { setOverlays((await axios.get(`${API}/overlays`)).data); } catch (e) { console.error(e); }
  }, []);

  useEffect(() => { fetchOverlays(); }, [fetchOverlays]);

  return (
    <Card className="bg-card border-white/10">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2"><Megaphone className="w-5 h-5" />Overlays & Announcements</CardTitle>
            <CardDescription>Create banner, ticker, or fullscreen announcements that overlay on the lobby display</CardDescription>
          </div>
          <Button onClick={() => setNewOverlay({ title: "", message: "", style: "banner", bg_color: "#1e293b", text_color: "#ffffff", enabled: true, priority: 0, start_time: "", end_time: "" })} data-testid="add-overlay-btn">
            <Plus className="w-4 h-4 mr-2" /> Add Overlay
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {newOverlay && (
          <div className="mb-6 p-4 rounded-xl bg-muted/30 border border-white/10 space-y-4">
            <h4 className="font-medium text-sm">New Overlay</h4>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Title</Label>
                <Input value={newOverlay.title} onChange={(e) => setNewOverlay(prev => ({ ...prev, title: e.target.value }))} placeholder="e.g. Happy Hour Special" data-testid="new-overlay-title" />
              </div>
              <div>
                <Label>Style</Label>
                <Select value={newOverlay.style} onValueChange={(v) => setNewOverlay(prev => ({ ...prev, style: v }))}>
                  <SelectTrigger data-testid="new-overlay-style"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="banner">Banner (Top)</SelectItem>
                    <SelectItem value="ticker">Ticker (Scrolling)</SelectItem>
                    <SelectItem value="corner">Corner (Bottom-right)</SelectItem>
                    <SelectItem value="fullscreen">Fullscreen</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div>
              <Label>Message</Label>
              <Input value={newOverlay.message} onChange={(e) => setNewOverlay(prev => ({ ...prev, message: e.target.value }))} placeholder="Optional detailed message" data-testid="new-overlay-message" />
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label>Background Color</Label>
                <div className="flex gap-2 items-center">
                  <input type="color" value={newOverlay.bg_color} onChange={(e) => setNewOverlay(prev => ({ ...prev, bg_color: e.target.value }))} className="w-10 h-10 rounded border border-white/20 cursor-pointer" />
                  <Input value={newOverlay.bg_color} onChange={(e) => setNewOverlay(prev => ({ ...prev, bg_color: e.target.value }))} className="font-mono text-sm" />
                </div>
              </div>
              <div>
                <Label>Text Color</Label>
                <div className="flex gap-2 items-center">
                  <input type="color" value={newOverlay.text_color} onChange={(e) => setNewOverlay(prev => ({ ...prev, text_color: e.target.value }))} className="w-10 h-10 rounded border border-white/20 cursor-pointer" />
                  <Input value={newOverlay.text_color} onChange={(e) => setNewOverlay(prev => ({ ...prev, text_color: e.target.value }))} className="font-mono text-sm" />
                </div>
              </div>
              <div>
                <Label>Priority</Label>
                <Input type="number" value={newOverlay.priority} onChange={(e) => setNewOverlay(prev => ({ ...prev, priority: parseInt(e.target.value) || 0 }))} />
              </div>
            </div>
            <div className="flex gap-2 justify-end">
              <Button variant="outline" onClick={() => setNewOverlay(null)}>Cancel</Button>
              <Button disabled={!newOverlay.title} onClick={async () => {
                try {
                  await axios.post(`${API}/overlays`, newOverlay);
                  setNewOverlay(null);
                  fetchOverlays();
                  toast.success("Overlay created");
                } catch { toast.error("Failed to create overlay"); }
              }} data-testid="save-new-overlay-btn">
                <Check className="w-4 h-4 mr-2" /> Save Overlay
              </Button>
            </div>
          </div>
        )}

        {overlays.length === 0 && !newOverlay ? (
          <div className="text-center py-12 text-muted-foreground">
            <Megaphone className="w-12 h-12 mx-auto mb-4 opacity-30" />
            <p>No overlays yet. Create one to display announcements on the lobby screen.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {overlays.map(overlay => (
              <div key={overlay.id} className="flex items-center gap-4 p-4 rounded-xl bg-muted/20 border border-white/10" data-testid={`overlay-item-${overlay.id}`}>
                <div className="w-10 h-10 rounded-lg flex-shrink-0 flex items-center justify-center text-xs font-bold" style={{ backgroundColor: overlay.bg_color, color: overlay.text_color }}>
                  {overlay.style === "banner" ? "B" : overlay.style === "ticker" ? "T" : overlay.style === "corner" ? "C" : "F"}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium truncate">{overlay.title}</p>
                  <p className="text-xs text-muted-foreground">{overlay.style} &middot; Priority {overlay.priority}</p>
                </div>
                <Button variant="ghost" size="sm" onClick={async () => {
                  try {
                    await axios.put(`${API}/overlays/${overlay.id}`, { enabled: !overlay.enabled });
                    fetchOverlays();
                  } catch { toast.error("Failed to toggle overlay"); }
                }} data-testid={`toggle-overlay-${overlay.id}`}>
                  {overlay.enabled ? <ToggleRight className="w-5 h-5 text-green-400" /> : <ToggleLeft className="w-5 h-5 text-muted-foreground" />}
                </Button>
                <Button variant="ghost" size="sm" onClick={async () => {
                  try {
                    await axios.delete(`${API}/overlays/${overlay.id}`);
                    fetchOverlays();
                    toast.success("Overlay deleted");
                  } catch { toast.error("Failed to delete overlay"); }
                }} data-testid={`delete-overlay-${overlay.id}`}>
                  <Trash2 className="w-4 h-4 text-red-400" />
                </Button>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
