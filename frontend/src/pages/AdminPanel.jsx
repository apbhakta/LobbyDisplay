import { useState, useEffect, useCallback, useRef, useMemo } from "react";
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
  CloudSun,
  RectangleHorizontal,
  RectangleVertical,
  Square,
  Ruler,
  Ratio
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

const ASPECT_PRESETS = [
  { value: "16:9", label: "16:9", orientation: "landscape", w: 16, h: 9, desc: "Widescreen TV" },
  { value: "9:16", label: "9:16", orientation: "portrait", w: 9, h: 16, desc: "Vertical Display" },
  { value: "4:3", label: "4:3", orientation: "landscape", w: 4, h: 3, desc: "Standard Monitor" },
  { value: "3:4", label: "3:4", orientation: "portrait", w: 3, h: 4, desc: "Vertical Standard" },
  { value: "custom", label: "Custom", orientation: null, w: null, h: null, desc: "Custom Size" },
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
          <div className="absolute top-2 left-2 z-10 p-1.5 rounded bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity">
            <GripVertical className="w-4 h-4 text-white" />
          </div>
          <div className="absolute top-2 right-2 z-10 w-6 h-6 rounded-full bg-primary text-primary-foreground text-xs flex items-center justify-center font-medium">
            {index + 1}
          </div>
          <img
            src={getImageUrl(image)}
            alt={image.filename}
            className="w-full h-40 object-cover"
            draggable={false}
          />
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
          <div className="absolute bottom-0 left-0 right-0 bg-black/70 p-2">
            <p className="text-xs text-white truncate">{image.filename}</p>
          </div>
        </div>
      ))}
    </div>
  );
};

// Drop Zone
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

// Live Display Preview Component - miniature rendering of actual lobby display
const LivePreview = ({ settings, weather }) => {
  const isPortrait = settings.display_orientation === "portrait";
  const ratioW = parseFloat(settings.display_width) || 16;
  const ratioH = parseFloat(settings.display_height) || 9;
  
  // Calculate preview dimensions to fit within a max box
  const maxW = 480;
  const maxH = 320;
  const aspectRatio = ratioW / ratioH;
  
  let previewW, previewH;
  if (aspectRatio > maxW / maxH) {
    previewW = maxW;
    previewH = maxW / aspectRatio;
  } else {
    previewH = maxH;
    previewW = maxH * aspectRatio;
  }

  // Weather theme colors
  const getThemeBg = () => {
    const condition = weather?.condition?.toLowerCase() || "";
    if (condition.includes("rain") || condition.includes("drizzle")) return "linear-gradient(180deg, #1e293b 0%, #334155 40%, #475569 100%)";
    if (condition.includes("cloud") || condition.includes("overcast")) return "linear-gradient(180deg, #475569 0%, #64748b 40%, #94a3b8 100%)";
    if (condition.includes("snow")) return "linear-gradient(180deg, #cbd5e1 0%, #e2e8f0 40%, #f1f5f9 100%)";
    if (condition.includes("storm") || condition.includes("thunder")) return "linear-gradient(180deg, #0f172a 0%, #1e293b 40%, #334155 100%)";
    if (condition.includes("fog") || condition.includes("mist")) return "linear-gradient(180deg, #6b7280 0%, #9ca3af 40%, #d1d5db 100%)";
    if (condition.includes("clear") || condition.includes("sunny")) return "linear-gradient(180deg, #1e3a5f 0%, #2563eb 30%, #3b82f6 60%, #60a5fa 100%)";
    return "linear-gradient(180deg, #475569 0%, #64748b 40%, #94a3b8 100%)";
  };

  return (
    <div className="flex flex-col items-center gap-4" data-testid="live-preview">
      {/* Preview Canvas */}
      <div 
        className="relative rounded-lg overflow-hidden shadow-2xl border border-white/20"
        style={{ width: previewW, height: previewH, background: getThemeBg() }}
        data-testid="preview-canvas"
      >
        {/* Mini photo background */}
        <div className="absolute inset-0 bg-black/20" />
        
        {isPortrait ? (
          /* Portrait layout preview */
          <div className="absolute inset-0 p-3 flex flex-col">
            {/* Top - Hotel Name */}
            <div className="text-center mb-1">
              <div className="bg-white/20 rounded h-2.5 w-20 mx-auto mb-1" />
              <div className="bg-white/10 rounded h-1.5 w-12 mx-auto" />
            </div>
            {/* Clock area */}
            <div className="text-center my-1">
              <div className="bg-white/25 rounded h-4 w-16 mx-auto mb-0.5" />
              <div className="bg-white/10 rounded h-1 w-14 mx-auto" />
            </div>
            {/* Photo area */}
            <div className="flex-1 mx-2 my-1 rounded bg-white/10 flex items-center justify-center">
              <ImageIcon className="w-6 h-6 text-white/20" />
            </div>
            {/* Weather widget */}
            <div className="mx-2 my-1 p-1.5 rounded bg-white/15 backdrop-blur">
              <div className="flex items-center gap-2">
                <div className="w-5 h-5 rounded bg-white/20" />
                <div>
                  <div className="bg-white/30 rounded h-2 w-8 mb-0.5" />
                  <div className="bg-white/15 rounded h-1 w-12" />
                </div>
              </div>
            </div>
            {/* News */}
            <div className="mx-2 mb-1 p-1.5 rounded bg-white/10">
              <div className="bg-white/20 rounded h-1 w-full mb-0.5" />
              <div className="bg-white/10 rounded h-1 w-3/4" />
            </div>
          </div>
        ) : (
          /* Landscape layout preview */
          <div className="absolute inset-0 p-3 flex flex-col">
            {/* Top row - Hotel name & clock */}
            <div className="flex justify-between items-start mb-1">
              <div>
                <div className="bg-white/20 rounded h-2 w-16 mb-0.5" />
                <div className="bg-white/10 rounded h-1 w-8" />
              </div>
              <div className="text-right">
                <div className="bg-white/25 rounded h-3.5 w-14 mb-0.5 ml-auto" />
                <div className="bg-white/10 rounded h-1 w-12 ml-auto" />
              </div>
            </div>
            {/* Spacer */}
            <div className="flex-1" />
            {/* Bottom row - weather & news */}
            <div className="flex justify-between items-end gap-3">
              <div className="p-1.5 rounded bg-white/15 backdrop-blur flex-1 max-w-[45%]">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded bg-white/20" />
                  <div>
                    <div className="bg-white/30 rounded h-2.5 w-10 mb-0.5" />
                    <div className="bg-white/15 rounded h-1 w-14" />
                  </div>
                </div>
              </div>
              <div className="p-1.5 rounded bg-white/10 flex-1 max-w-[40%]">
                <div className="bg-white/20 rounded h-1 w-full mb-0.5" />
                <div className="bg-white/10 rounded h-1 w-3/4" />
              </div>
            </div>
          </div>
        )}

        {/* Slide indicators */}
        <div className="absolute bottom-1 left-1/2 -translate-x-1/2 flex gap-0.5">
          <div className="w-3 h-0.5 rounded-full bg-white/80" />
          <div className="w-0.5 h-0.5 rounded-full bg-white/30" />
          <div className="w-0.5 h-0.5 rounded-full bg-white/30" />
          <div className="w-0.5 h-0.5 rounded-full bg-white/30" />
        </div>
      </div>

      {/* Format Info */}
      <div className="grid grid-cols-2 gap-x-8 gap-y-1 text-sm" data-testid="format-info">
        <div className="flex justify-between gap-4">
          <span className="text-muted-foreground">Aspect Ratio:</span>
          <span className="font-mono font-medium">{settings.aspect_ratio}</span>
        </div>
        <div className="flex justify-between gap-4">
          <span className="text-muted-foreground">Orientation:</span>
          <span className="font-medium capitalize">{settings.display_orientation}</span>
        </div>
        <div className="flex justify-between gap-4">
          <span className="text-muted-foreground">Width:</span>
          <span className="font-mono font-medium">{settings.display_width} in</span>
        </div>
        <div className="flex justify-between gap-4">
          <span className="text-muted-foreground">Height:</span>
          <span className="font-mono font-medium">{settings.display_height} in</span>
        </div>
      </div>
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
    weather_slide_duration: 15,
    weather_refresh: 15,
    news_refresh: 30,
    aspect_ratio: "16:9",
    display_orientation: "landscape",
    display_scale: 100,
    display_width: 16,
    display_height: 9,
    enable_weather_animations: true,
  });
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [weather, setWeather] = useState(null);

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

  const fetchWeather = useCallback(async () => {
    try {
      const response = await axios.get(`${API}/weather`);
      setWeather(response.data);
    } catch (error) {
      console.error("Error fetching weather:", error);
    }
  }, []);

  useEffect(() => {
    fetchSettings();
    fetchImages();
    fetchWeather();
  }, [fetchSettings, fetchImages, fetchWeather]);

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

  // Handle aspect ratio preset selection
  const handlePresetSelect = (preset) => {
    if (preset.value === "custom") {
      setSettings(prev => ({ ...prev, aspect_ratio: "custom" }));
      return;
    }
    setSettings(prev => ({
      ...prev,
      aspect_ratio: preset.value,
      display_orientation: preset.orientation,
      display_width: preset.w,
      display_height: preset.h,
    }));
  };

  // Handle orientation flip
  const handleOrientationToggle = (orientation) => {
    const w = settings.display_width;
    const h = settings.display_height;
    const isFlipping = (orientation === "portrait" && w > h) || (orientation === "landscape" && h > w);
    
    if (isFlipping) {
      // Flip dimensions and update ratio
      const ratioMap = { "16:9": "9:16", "9:16": "16:9", "4:3": "3:4", "3:4": "4:3" };
      setSettings(prev => ({
        ...prev,
        display_orientation: orientation,
        display_width: h,
        display_height: w,
        aspect_ratio: ratioMap[prev.aspect_ratio] || "custom",
      }));
    } else {
      setSettings(prev => ({ ...prev, display_orientation: orientation }));
    }
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
              data-testid="back-button"
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
            data-testid="preview-display-button"
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
            <TabsTrigger value="images" className="gap-2" data-testid="tab-images">
              <ImageIcon className="w-4 h-4" />
              Images
            </TabsTrigger>
            <TabsTrigger value="settings" className="gap-2" data-testid="tab-settings">
              <Settings className="w-4 h-4" />
              Settings
            </TabsTrigger>
            <TabsTrigger value="display" className="gap-2" data-testid="tab-display">
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
                      Drag to reorder. Drop multiple images to upload.
                    </CardDescription>
                  </div>
                  <Button 
                    variant="outline" 
                    onClick={handleResetImages}
                    className="gap-2"
                    data-testid="reset-images-button"
                  >
                    <RefreshCw className="w-4 h-4" />
                    Reset to Defaults
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                <DropZone onUpload={handleUploadImages} uploading={uploading} />
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
                      data-testid="hotel-name-input"
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
                      data-testid="city-input"
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
                    <SelectTrigger data-testid="news-category-select">
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
                <div className="grid gap-6 md:grid-cols-4">
                  <div className="space-y-2">
                    <Label>Photo Interval (seconds)</Label>
                    <Input
                      type="number"
                      min="3"
                      max="60"
                      value={settings.photo_interval}
                      onChange={(e) => setSettings({ ...settings, photo_interval: parseInt(e.target.value) || 8 })}
                      data-testid="photo-interval-input"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Weather Slide Duration (s)</Label>
                    <Input
                      type="number"
                      min="10"
                      max="60"
                      value={settings.weather_slide_duration}
                      onChange={(e) => setSettings({ ...settings, weather_slide_duration: parseInt(e.target.value) || 15 })}
                      data-testid="weather-duration-input"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Weather Refresh (min)</Label>
                    <Input
                      type="number"
                      min="5"
                      max="60"
                      value={settings.weather_refresh}
                      onChange={(e) => setSettings({ ...settings, weather_refresh: parseInt(e.target.value) || 15 })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>News Refresh (min)</Label>
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
                    data-testid="weather-animations-toggle"
                  />
                </div>
              </CardContent>
            </Card>

            <div className="flex justify-end">
              <Button onClick={handleSaveSettings} disabled={loading} className="gap-2" data-testid="save-settings-button">
                <Save className="w-4 h-4" />
                {loading ? "Saving..." : "Save Settings"}
              </Button>
            </div>
          </TabsContent>

          {/* Display Tab - Complete Overhaul */}
          <TabsContent value="display" className="space-y-6" data-testid="display-tab-content">
            <div className="grid gap-6 lg:grid-cols-[1fr,auto]">
              {/* Left Column - Controls */}
              <div className="space-y-6">
                {/* Aspect Ratio Presets */}
                <Card className="bg-card border-white/10">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Ratio className="w-5 h-5" />
                      Screen Aspect Ratio
                    </CardTitle>
                    <CardDescription>Choose a preset or enter custom dimensions</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-5 gap-3" data-testid="aspect-ratio-presets">
                      {ASPECT_PRESETS.map((preset) => {
                        const isActive = settings.aspect_ratio === preset.value;
                        const isLandscape = preset.orientation === "landscape" || (preset.value === "custom" && settings.display_orientation === "landscape");
                        
                        // Mini shape for the preset button
                        const shapeW = preset.value === "custom" ? 36 : (isLandscape ? 42 : 26);
                        const shapeH = preset.value === "custom" ? 36 : (isLandscape ? 26 : 42);
                        
                        return (
                          <button
                            key={preset.value}
                            onClick={() => handlePresetSelect(preset)}
                            data-testid={`preset-${preset.value}`}
                            className={`flex flex-col items-center gap-2 p-3 rounded-xl border-2 transition-all ${
                              isActive
                                ? "border-primary bg-primary/10 ring-1 ring-primary/30"
                                : "border-white/10 hover:border-white/25 hover:bg-white/5"
                            }`}
                          >
                            {preset.value === "custom" ? (
                              <div className="w-9 h-9 rounded border-2 border-dashed border-current flex items-center justify-center opacity-60">
                                <Ruler className="w-4 h-4" />
                              </div>
                            ) : (
                              <div 
                                className="rounded border-2 border-current flex items-center justify-center"
                                style={{ width: shapeW, height: shapeH }}
                              >
                                <Monitor className="w-3 h-3 opacity-40" />
                              </div>
                            )}
                            <span className="text-xs font-semibold">{preset.label}</span>
                            <span className="text-[10px] text-muted-foreground leading-tight text-center">{preset.desc}</span>
                          </button>
                        );
                      })}
                    </div>
                  </CardContent>
                </Card>

                {/* Orientation Toggle */}
                <Card className="bg-card border-white/10">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Monitor className="w-5 h-5" />
                      Orientation
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 gap-4" data-testid="orientation-toggle">
                      <button
                        onClick={() => handleOrientationToggle("landscape")}
                        data-testid="orientation-landscape"
                        className={`flex items-center gap-3 p-4 rounded-xl border-2 transition-all ${
                          settings.display_orientation === "landscape"
                            ? "border-primary bg-primary/10"
                            : "border-white/10 hover:border-white/25"
                        }`}
                      >
                        <RectangleHorizontal className="w-6 h-6" />
                        <div className="text-left">
                          <p className="text-sm font-medium">Landscape</p>
                          <p className="text-xs text-muted-foreground">TV & widescreen</p>
                        </div>
                      </button>
                      <button
                        onClick={() => handleOrientationToggle("portrait")}
                        data-testid="orientation-portrait"
                        className={`flex items-center gap-3 p-4 rounded-xl border-2 transition-all ${
                          settings.display_orientation === "portrait"
                            ? "border-primary bg-primary/10"
                            : "border-white/10 hover:border-white/25"
                        }`}
                      >
                        <RectangleVertical className="w-6 h-6" />
                        <div className="text-left">
                          <p className="text-sm font-medium">Portrait</p>
                          <p className="text-xs text-muted-foreground">Vertical signage</p>
                        </div>
                      </button>
                    </div>
                  </CardContent>
                </Card>

                {/* Custom Dimensions */}
                <Card className="bg-card border-white/10">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Ruler className="w-5 h-5" />
                      Dimensions
                    </CardTitle>
                    <CardDescription>
                      {settings.aspect_ratio === "custom" 
                        ? "Enter custom width and height" 
                        : "Dimensions auto-set from preset (editable)"}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <Label>Width (inches)</Label>
                        <Input
                          type="number"
                          min="1"
                          max="100"
                          step="0.5"
                          value={settings.display_width}
                          onChange={(e) => {
                            const w = parseFloat(e.target.value) || 16;
                            setSettings(prev => ({ ...prev, display_width: w, aspect_ratio: "custom" }));
                          }}
                          data-testid="width-input"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Height (inches)</Label>
                        <Input
                          type="number"
                          min="1"
                          max="100"
                          step="0.5"
                          value={settings.display_height}
                          onChange={(e) => {
                            const h = parseFloat(e.target.value) || 9;
                            setSettings(prev => ({ ...prev, display_height: h, aspect_ratio: "custom" }));
                          }}
                          data-testid="height-input"
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Display Scale */}
                <Card className="bg-card border-white/10">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Maximize2 className="w-5 h-5" />
                      Display Scale
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Scale factor</span>
                      <span className="text-sm font-mono bg-secondary px-2 py-1 rounded" data-testid="scale-value">
                        {settings.display_scale}%
                      </span>
                    </div>
                    <Slider
                      value={[settings.display_scale]}
                      onValueChange={(value) => setSettings({ ...settings, display_scale: value[0] })}
                      min={50}
                      max={150}
                      step={5}
                      data-testid="scale-slider"
                    />
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>50%</span>
                      <span>100%</span>
                      <span>150%</span>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Right Column - Live Preview */}
              <div className="lg:w-[520px]">
                <Card className="bg-card border-white/10 sticky top-24">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Eye className="w-5 h-5" />
                      Live Preview
                    </CardTitle>
                    <CardDescription>Miniature rendering of your lobby display</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <LivePreview settings={settings} weather={weather} />
                  </CardContent>
                </Card>
              </div>
            </div>

            <div className="flex justify-end">
              <Button onClick={handleSaveSettings} disabled={loading} className="gap-2" data-testid="save-display-button">
                <Save className="w-4 h-4" />
                {loading ? "Saving..." : "Save Display Settings"}
              </Button>
            </div>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
