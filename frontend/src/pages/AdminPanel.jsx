import { useState, useEffect, useCallback, useRef } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { 
  Settings, 
  Image as ImageIcon, 
  Upload, 
  Trash2, 
  Eye, 
  Save,
  RefreshCw,
  Clock,
  Newspaper,
  MapPin,
  Building2,
  ArrowLeft,
  Monitor,
  Smartphone,
  Maximize2,
  GripVertical,
  X,
  Plus,
  CloudSun
} from "lucide-react";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select";
import { Switch } from "../components/ui/switch";
import { Slider } from "../components/ui/slider";
import { Toaster, toast } from "sonner";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const NEWS_CATEGORIES = [
  { value: "general", label: "General" },
  { value: "business", label: "Business" },
  { value: "technology", label: "Technology" },
  { value: "entertainment", label: "Entertainment" },
  { value: "health", label: "Health" },
  { value: "science", label: "Science" },
  { value: "sports", label: "Sports" },
];

// Drag and Drop Image Grid
const ImageGrid = ({ images, onReorder, onDelete, getImageUrl }) => {
  const [draggedIndex, setDraggedIndex] = useState(null);
  const [dragOverIndex, setDragOverIndex] = useState(null);

  const handleDragStart = (e, index) => {
    setDraggedIndex(index);
    e.dataTransfer.effectAllowed = "move";
  };

  const handleDragOver = (e, index) => {
    e.preventDefault();
    if (draggedIndex !== index) {
      setDragOverIndex(index);
    }
  };

  const handleDragLeave = () => {
    setDragOverIndex(null);
  };

  const handleDrop = (e, index) => {
    e.preventDefault();
    if (draggedIndex !== null && draggedIndex !== index) {
      const newImages = [...images];
      const [draggedItem] = newImages.splice(draggedIndex, 1);
      newImages.splice(index, 0, draggedItem);
      onReorder(newImages);
    }
    setDraggedIndex(null);
    setDragOverIndex(null);
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
    setDragOverIndex(null);
  };

  if (images.length === 0) {
    return (
      <div className="text-center py-16 text-muted-foreground border-2 border-dashed border-white/10 rounded-xl">
        <ImageIcon className="w-16 h-16 mx-auto mb-4 opacity-30" />
        <p className="text-lg">No images uploaded yet</p>
        <p className="text-sm mt-1">Drop images here or use the upload button</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
      {images.map((image, index) => (
        <div
          key={image.id}
          draggable
          onDragStart={(e) => handleDragStart(e, index)}
          onDragOver={(e) => handleDragOver(e, index)}
          onDragLeave={handleDragLeave}
          onDrop={(e) => handleDrop(e, index)}
          onDragEnd={handleDragEnd}
          className={`relative group rounded-xl overflow-hidden border-2 cursor-move transition-all ${
            draggedIndex === index 
              ? "opacity-50 scale-95" 
              : dragOverIndex === index 
              ? "border-primary scale-105" 
              : "border-white/10 hover:border-white/30"
          }`}
        >
          {/* Drag Handle */}
          <div className="absolute top-2 left-2 z-10 p-1.5 rounded bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity">
            <GripVertical className="w-4 h-4 text-white" />
          </div>

          {/* Order Number */}
          <div className="absolute top-2 right-2 z-10 w-6 h-6 rounded-full bg-primary text-primary-foreground text-xs flex items-center justify-center font-medium">
            {index + 1}
          </div>

          {/* Image */}
          <img
            src={getImageUrl(image)}
            alt={image.filename}
            className="w-full h-40 object-cover"
            draggable={false}
          />

          {/* Delete Overlay */}
          <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
            <Button
              variant="destructive"
              size="icon"
              onClick={() => onDelete(image.id)}
              className="rounded-full"
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>

          {/* Filename */}
          <div className="absolute bottom-0 left-0 right-0 bg-black/70 p-2">
            <p className="text-xs text-white truncate">{image.filename}</p>
          </div>
        </div>
      ))}
    </div>
  );
};

// Drop Zone for multiple images
const DropZone = ({ onUpload, uploading }) => {
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef(null);

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const files = Array.from(e.dataTransfer.files).filter(f => f.type.startsWith("image/"));
    if (files.length > 0) {
      onUpload(files);
    }
  };

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files || []);
    if (files.length > 0) {
      onUpload(files);
      e.target.value = "";
    }
  };

  return (
    <div
      onClick={handleClick}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all ${
        isDragging 
          ? "border-primary bg-primary/10" 
          : "border-white/20 hover:border-white/40 hover:bg-white/5"
      }`}
    >
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        multiple
        className="hidden"
        onChange={handleFileChange}
      />
      {uploading ? (
        <div className="flex flex-col items-center gap-3">
          <RefreshCw className="w-10 h-10 text-primary animate-spin" />
          <p className="text-sm text-muted-foreground">Uploading...</p>
        </div>
      ) : (
        <div className="flex flex-col items-center gap-3">
          <div className="w-16 h-16 rounded-full bg-white/10 flex items-center justify-center">
            <Plus className="w-8 h-8 text-muted-foreground" />
          </div>
          <div>
            <p className="text-lg font-medium">Drop images here</p>
            <p className="text-sm text-muted-foreground mt-1">or click to browse</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default function AdminPanel() {
  const navigate = useNavigate();
  const [settings, setSettings] = useState({
    hotel_name: "Velkommen Inn",
    city: "Clifton, Texas",
    news_category: "general",
    photo_interval: 8,
    weather_refresh: 15,
    news_refresh: 30,
    display_orientation: "landscape",
    display_scale: 100,
    enable_weather_animations: true,
  });
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);

  const fetchSettings = useCallback(async () => {
    try {
      const response = await axios.get(`${API}/settings`);
      setSettings(prev => ({ ...prev, ...response.data }));
    } catch (error) {
      console.error("Error fetching settings:", error);
      toast.error("Failed to load settings");
    }
  }, []);

  const fetchImages = useCallback(async () => {
    try {
      const response = await axios.get(`${API}/images`);
      setImages(response.data);
    } catch (error) {
      console.error("Error fetching images:", error);
      toast.error("Failed to load images");
    }
  }, []);

  useEffect(() => {
    fetchSettings();
    fetchImages();
  }, [fetchSettings, fetchImages]);

  const handleSaveSettings = async () => {
    setLoading(true);
    try {
      await axios.put(`${API}/settings`, settings);
      toast.success("Settings saved successfully");
    } catch (error) {
      console.error("Error saving settings:", error);
      toast.error("Failed to save settings");
    } finally {
      setLoading(false);
    }
  };

  const handleUploadImages = async (files) => {
    setUploading(true);
    let successCount = 0;
    
    for (const file of files) {
      const formData = new FormData();
      formData.append("file", file);
      
      try {
        const response = await axios.post(`${API}/images`, formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        setImages((prev) => [...prev, response.data]);
        successCount++;
      } catch (error) {
        console.error("Error uploading image:", error);
      }
    }
    
    setUploading(false);
    if (successCount > 0) {
      toast.success(`${successCount} image${successCount > 1 ? 's' : ''} uploaded`);
    }
    if (successCount < files.length) {
      toast.error(`${files.length - successCount} upload${files.length - successCount > 1 ? 's' : ''} failed`);
    }
  };

  const handleDeleteImage = async (imageId) => {
    try {
      await axios.delete(`${API}/images/${imageId}`);
      setImages((prev) => prev.filter((img) => img.id !== imageId));
      toast.success("Image deleted");
    } catch (error) {
      console.error("Error deleting image:", error);
      toast.error("Failed to delete image");
    }
  };

  const handleReorderImages = (newImages) => {
    setImages(newImages);
    // Optionally save order to backend
  };

  const handleResetImages = async () => {
    try {
      await axios.post(`${API}/images/reset-defaults`);
      await fetchImages();
      toast.success("Images reset to defaults");
    } catch (error) {
      console.error("Error resetting images:", error);
      toast.error("Failed to reset images");
    }
  };

  const getImageUrl = (image) => {
    if (image.url.startsWith("http")) return image.url;
    return `${BACKEND_URL}${image.url}`;
  };

  return (
    <div className="admin-panel dark min-h-screen bg-background text-foreground">
      <Toaster position="top-right" theme="dark" />
      
      {/* Header */}
      <header className="border-b border-white/10 bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button 
              variant="ghost" 
              size="icon"
              onClick={() => navigate("/")}
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div>
              <h1 className="text-xl font-semibold">Admin Panel</h1>
              <p className="text-sm text-muted-foreground">Manage your lobby display</p>
            </div>
          </div>
          <Button 
            variant="outline" 
            onClick={() => navigate("/")}
            className="gap-2"
          >
            <Eye className="w-4 h-4" />
            Preview Display
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-6 py-8">
        <Tabs defaultValue="images" className="space-y-8">
          <TabsList className="bg-card border border-white/10">
            <TabsTrigger value="images" className="gap-2">
              <ImageIcon className="w-4 h-4" />
              Images
            </TabsTrigger>
            <TabsTrigger value="settings" className="gap-2">
              <Settings className="w-4 h-4" />
              Settings
            </TabsTrigger>
            <TabsTrigger value="display" className="gap-2">
              <Monitor className="w-4 h-4" />
              Display
            </TabsTrigger>
          </TabsList>

          {/* Images Tab */}
          <TabsContent value="images" className="space-y-6">
            <Card className="bg-card border-white/10">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <ImageIcon className="w-5 h-5" />
                      Hotel Slideshow Images
                    </CardTitle>
                    <CardDescription>
                      Drag to reorder • Drop multiple images to upload
                    </CardDescription>
                  </div>
                  <Button 
                    variant="outline" 
                    onClick={handleResetImages}
                    className="gap-2"
                  >
                    <RefreshCw className="w-4 h-4" />
                    Reset to Defaults
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Drop Zone */}
                <DropZone onUpload={handleUploadImages} uploading={uploading} />

                {/* Image Grid */}
                <ImageGrid 
                  images={images}
                  onReorder={handleReorderImages}
                  onDelete={handleDeleteImage}
                  getImageUrl={getImageUrl}
                />
              </CardContent>
            </Card>
          </TabsContent>

          {/* Settings Tab */}
          <TabsContent value="settings" className="space-y-6">
            <Card className="bg-card border-white/10">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Building2 className="w-5 h-5" />
                  Hotel Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid gap-6 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label>Hotel Name</Label>
                    <Input
                      value={settings.hotel_name}
                      onChange={(e) => setSettings({ ...settings, hotel_name: e.target.value })}
                      placeholder="Enter hotel name"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="flex items-center gap-2">
                      <MapPin className="w-4 h-4" />
                      Weather Location
                    </Label>
                    <Input
                      value={settings.city}
                      onChange={(e) => setSettings({ ...settings, city: e.target.value })}
                      placeholder="City, State"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-card border-white/10">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Newspaper className="w-5 h-5" />
                  News Settings
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <Label>News Category</Label>
                  <Select
                    value={settings.news_category}
                    onValueChange={(value) => setSettings({ ...settings, news_category: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {NEWS_CATEGORIES.map((cat) => (
                        <SelectItem key={cat.value} value={cat.value}>
                          {cat.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-card border-white/10">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="w-5 h-5" />
                  Timing & Refresh
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-6 md:grid-cols-3">
                  <div className="space-y-2">
                    <Label>Photo Interval (seconds)</Label>
                    <Input
                      type="number"
                      min="3"
                      max="60"
                      value={settings.photo_interval}
                      onChange={(e) => setSettings({ ...settings, photo_interval: parseInt(e.target.value) || 8 })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Weather Refresh (minutes)</Label>
                    <Input
                      type="number"
                      min="5"
                      max="60"
                      value={settings.weather_refresh}
                      onChange={(e) => setSettings({ ...settings, weather_refresh: parseInt(e.target.value) || 15 })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>News Refresh (minutes)</Label>
                    <Input
                      type="number"
                      min="10"
                      max="120"
                      value={settings.news_refresh}
                      onChange={(e) => setSettings({ ...settings, news_refresh: parseInt(e.target.value) || 30 })}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-card border-white/10">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CloudSun className="w-5 h-5" />
                  Weather Animations
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Enable Weather-Reactive Animations</p>
                    <p className="text-sm text-muted-foreground">Show animated backgrounds based on weather</p>
                  </div>
                  <Switch
                    checked={settings.enable_weather_animations !== false}
                    onCheckedChange={(checked) => setSettings({ ...settings, enable_weather_animations: checked })}
                  />
                </div>
              </CardContent>
            </Card>

            <div className="flex justify-end">
              <Button onClick={handleSaveSettings} disabled={loading} className="gap-2">
                <Save className="w-4 h-4" />
                {loading ? "Saving..." : "Save Settings"}
              </Button>
            </div>
          </TabsContent>

          {/* Display Tab */}
          <TabsContent value="display" className="space-y-6">
            <Card className="bg-card border-white/10">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Monitor className="w-5 h-5" />
                  Display Settings
                </CardTitle>
                <CardDescription>
                  Configure screen orientation and size
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Orientation */}
                <div className="space-y-3">
                  <Label>Screen Orientation</Label>
                  <div className="grid grid-cols-3 gap-4">
                    {[
                      { value: "landscape", label: "Landscape", ratio: "16:9", icon: Monitor, w: "w-20", h: "h-12" },
                      { value: "portrait", label: "Portrait", ratio: "9:16", icon: Smartphone, w: "w-12", h: "h-20" },
                      { value: "standard", label: "Standard", ratio: "4:3", icon: Monitor, w: "w-16", h: "h-12" },
                    ].map((opt) => (
                      <button
                        key={opt.value}
                        onClick={() => setSettings({ ...settings, display_orientation: opt.value })}
                        className={`flex flex-col items-center gap-3 p-4 rounded-xl border-2 transition-all ${
                          settings.display_orientation === opt.value
                            ? "border-primary bg-primary/10"
                            : "border-white/10 hover:border-white/20"
                        }`}
                      >
                        <div className={`${opt.w} ${opt.h} rounded-lg border-2 border-current flex items-center justify-center`}>
                          <opt.icon className="w-5 h-5 opacity-50" />
                        </div>
                        <span className="text-sm font-medium">{opt.label}</span>
                        <span className="text-xs text-muted-foreground">{opt.ratio}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Scale */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label className="flex items-center gap-2">
                      <Maximize2 className="w-4 h-4" />
                      Display Scale
                    </Label>
                    <span className="text-sm font-mono bg-secondary px-2 py-1 rounded">
                      {settings.display_scale}%
                    </span>
                  </div>
                  <Slider
                    value={[settings.display_scale]}
                    onValueChange={(value) => setSettings({ ...settings, display_scale: value[0] })}
                    min={50}
                    max={150}
                    step={5}
                  />
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>50%</span>
                    <span>100%</span>
                    <span>150%</span>
                  </div>
                </div>

                {/* Preview */}
                <div className="p-6 bg-secondary/30 rounded-xl">
                  <p className="text-sm text-muted-foreground mb-4 text-center">Preview</p>
                  <div className="flex justify-center">
                    <div 
                      className="bg-gradient-to-br from-slate-700 to-slate-900 rounded-lg flex items-center justify-center text-white/40 text-xs transition-all"
                      style={{
                        width: settings.display_orientation === "landscape" ? 160 : settings.display_orientation === "portrait" ? 90 : 120,
                        height: settings.display_orientation === "landscape" ? 90 : settings.display_orientation === "portrait" ? 160 : 90,
                        transform: `scale(${settings.display_scale / 100})`,
                      }}
                    >
                      {settings.display_orientation === "landscape" ? "16:9" : settings.display_orientation === "portrait" ? "9:16" : "4:3"}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="flex justify-end">
              <Button onClick={handleSaveSettings} disabled={loading} className="gap-2">
                <Save className="w-4 h-4" />
                {loading ? "Saving..." : "Save Settings"}
              </Button>
            </div>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
