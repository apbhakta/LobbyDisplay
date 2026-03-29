import { useState, useCallback, useEffect } from "react";
import axios from "axios";
import { toast } from "sonner";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { Switch } from "../../components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../components/ui/select";
import { MapPin, Plus, Check, Edit2, Trash2, ToggleLeft, ToggleRight, Save } from "lucide-react";

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

const ATTRACTION_CATEGORIES = [
  { value: "dining", label: "Dining" },
  { value: "shopping", label: "Shopping" },
  { value: "nature", label: "Nature & Parks" },
  { value: "historic", label: "Historic Sites" },
  { value: "entertainment", label: "Entertainment" },
  { value: "recreation", label: "Recreation" },
  { value: "services", label: "Services" },
  { value: "religious", label: "Religious" },
  { value: "other", label: "Other" },
];

export default function AttractionsTab({ settings, setSettings, handleSaveSettings, loading }) {
  const [attractions, setAttractions] = useState([]);
  const [editing, setEditing] = useState(null);
  const [newItem, setNewItem] = useState(null);

  const fetchAttractions = useCallback(async () => {
    try { setAttractions((await axios.get(`${API}/attractions`)).data); } catch (e) { console.error(e); }
  }, []);

  useEffect(() => { fetchAttractions(); }, [fetchAttractions]);

  const handleCreate = async () => {
    if (!newItem?.name) return;
    try {
      const r = await axios.post(`${API}/attractions`, newItem);
      setAttractions(prev => [...prev, r.data]);
      setNewItem(null);
      toast.success("Attraction added");
    } catch { toast.error("Failed to add attraction"); }
  };

  const handleUpdate = async (id) => {
    if (!editing) return;
    try {
      const r = await axios.put(`${API}/attractions/${id}`, editing);
      setAttractions(prev => prev.map(a => a.id === id ? r.data : a));
      setEditing(null);
      toast.success("Attraction updated");
    } catch { toast.error("Failed to update"); }
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(`${API}/attractions/${id}`);
      setAttractions(prev => prev.filter(a => a.id !== id));
      toast.success("Attraction deleted");
    } catch { toast.error("Failed to delete"); }
  };

  const handleToggle = async (item) => {
    try {
      const r = await axios.put(`${API}/attractions/${item.id}`, { enabled: !item.enabled });
      setAttractions(prev => prev.map(a => a.id === item.id ? r.data : a));
    } catch { toast.error("Failed to toggle"); }
  };

  return (
    <Card className="bg-card border-white/10">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2"><MapPin className="w-5 h-5" />Local Attractions</CardTitle>
            <CardDescription>Manage attractions shown in the lobby display</CardDescription>
          </div>
          <Button onClick={() => setNewItem({ name: "", description: "", distance: "", category: "dining", image_url: "", enabled: true })} className="gap-2" data-testid="add-attraction-button">
            <Plus className="w-4 h-4" />Add Attraction
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center gap-6 p-4 rounded-lg bg-muted/50 border border-white/5">
          <div className="space-y-1 flex-1">
            <Label>Attractions per slide</Label>
            <Input type="number" min="2" max="12" value={settings.attractions_per_slide || 6} onChange={(e) => setSettings(prev => ({ ...prev, attractions_per_slide: parseInt(e.target.value) || 6 }))} className="w-24" data-testid="attractions-per-slide-input" />
          </div>
          <div className="flex items-center gap-3">
            <Label>Auto-rotate</Label>
            <Switch checked={settings.attractions_auto_rotate !== false} onCheckedChange={(checked) => setSettings(prev => ({ ...prev, attractions_auto_rotate: checked }))} data-testid="attractions-auto-rotate-toggle" />
          </div>
          <Button onClick={() => handleSaveSettings()} disabled={loading} size="sm" className="gap-2"><Save className="w-3 h-3" />Save</Button>
        </div>

        {newItem && (
          <div className="p-4 rounded-lg border-2 border-primary/30 bg-primary/5 space-y-3" data-testid="new-attraction-form">
            <p className="text-sm font-medium text-primary">New Attraction</p>
            <div className="grid grid-cols-2 gap-3">
              <Input placeholder="Attraction name" value={newItem.name} onChange={(e) => setNewItem(prev => ({ ...prev, name: e.target.value }))} data-testid="new-attraction-name" />
              <Select value={newItem.category} onValueChange={(v) => setNewItem(prev => ({ ...prev, category: v }))}>
                <SelectTrigger data-testid="new-attraction-category"><SelectValue /></SelectTrigger>
                <SelectContent>{ATTRACTION_CATEGORIES.map(c => <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <Input placeholder="Short description" value={newItem.description} onChange={(e) => setNewItem(prev => ({ ...prev, description: e.target.value }))} data-testid="new-attraction-description" />
            <div className="grid grid-cols-2 gap-3">
              <Input placeholder="Distance (e.g., 2.5 miles)" value={newItem.distance} onChange={(e) => setNewItem(prev => ({ ...prev, distance: e.target.value }))} data-testid="new-attraction-distance" />
              <Input placeholder="Image URL (optional)" value={newItem.image_url} onChange={(e) => setNewItem(prev => ({ ...prev, image_url: e.target.value }))} />
            </div>
            <div className="flex gap-2">
              <Button onClick={handleCreate} size="sm" className="gap-2" data-testid="save-new-attraction"><Check className="w-3 h-3" />Save</Button>
              <Button onClick={() => setNewItem(null)} variant="ghost" size="sm">Cancel</Button>
            </div>
          </div>
        )}

        <div className="space-y-2">
          {attractions.map(item => (
            <div key={item.id} className={`flex items-center gap-3 p-3 rounded-lg border transition-all ${item.enabled ? 'border-white/10 bg-card' : 'border-white/5 bg-muted/30 opacity-60'}`} data-testid={`attraction-item-${item.id}`}>
              {editing?.id === item.id ? (
                <div className="flex-1 space-y-2">
                  <div className="grid grid-cols-2 gap-2">
                    <Input value={editing.name || item.name} onChange={(e) => setEditing(prev => ({ ...prev, name: e.target.value }))} data-testid={`edit-attraction-name-${item.id}`} />
                    <Select value={editing.category || item.category} onValueChange={(v) => setEditing(prev => ({ ...prev, category: v }))}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>{ATTRACTION_CATEGORIES.map(c => <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>)}</SelectContent>
                    </Select>
                  </div>
                  <Input value={editing.description || item.description} onChange={(e) => setEditing(prev => ({ ...prev, description: e.target.value }))} placeholder="Description" />
                  <Input value={editing.distance || item.distance} onChange={(e) => setEditing(prev => ({ ...prev, distance: e.target.value }))} placeholder="Distance" />
                  <div className="flex gap-2">
                    <Button onClick={() => handleUpdate(item.id)} size="sm" className="gap-1"><Check className="w-3 h-3" />Save</Button>
                    <Button onClick={() => setEditing(null)} variant="ghost" size="sm">Cancel</Button>
                  </div>
                </div>
              ) : (
                <>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="font-medium truncate">{item.name}</p>
                      <span className="text-xs px-2 py-0.5 rounded-full bg-white/10 text-muted-foreground flex-shrink-0">{ATTRACTION_CATEGORIES.find(c => c.value === item.category)?.label || item.category}</span>
                    </div>
                    <p className="text-sm text-muted-foreground truncate">{item.description}</p>
                    {item.distance && <p className="text-xs text-muted-foreground mt-0.5">{item.distance}</p>}
                  </div>
                  <div className="flex items-center gap-1 flex-shrink-0">
                    <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleToggle(item)} data-testid={`toggle-attraction-${item.id}`}>
                      {item.enabled ? <ToggleRight className="w-4 h-4 text-green-400" /> : <ToggleLeft className="w-4 h-4 text-muted-foreground" />}
                    </Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setEditing({ id: item.id, name: item.name, description: item.description, distance: item.distance, category: item.category })} data-testid={`edit-attraction-${item.id}`}>
                      <Edit2 className="w-4 h-4" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => handleDelete(item.id)} data-testid={`delete-attraction-${item.id}`}>
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </>
              )}
            </div>
          ))}
          {attractions.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              <MapPin className="w-10 h-10 mx-auto mb-2 opacity-30" />
              <p>No attractions yet. Add one above.</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
