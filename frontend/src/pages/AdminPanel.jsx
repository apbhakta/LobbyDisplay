import { useState, useEffect, useCallback, useRef, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import LoginPage from "./LoginPage";
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
  Ratio,
  Edit2,
  Check,
  FileText,
  Megaphone,
  Tag,
  Heart,
  Calendar,
  AlertTriangle,
  LogOut,
  ChevronDown,
  ChevronUp,
  ToggleLeft,
  ToggleRight,
  Star,
  Globe,
  Phone,
  StickyNote,
  ImagePlus,
  ArrowUpDown,
  CalendarDays,
  Timer,
  Lock,
  KeyRound,
  Film
} from "lucide-react";
import WidgetPositionPanel from "../components/admin/WidgetPositionPanel";
import AttractionsTab from "../components/admin/AttractionsTab";
import OverlaysTab from "../components/admin/OverlaysTab";
import VideosTab from "../components/admin/VideosTab";
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

const ATTRACTION_CATEGORIES = [
  { value: "dining", label: "Dining" },
  { value: "shopping", label: "Shopping" },
  { value: "parks", label: "Parks" },
  { value: "museums", label: "Museums" },
  { value: "entertainment", label: "Entertainment" },
  { value: "family", label: "Family Activities" },
  { value: "events", label: "Local Events" },
  { value: "outdoor", label: "Outdoor" },
  { value: "hotel_recommendations", label: "Hotel Picks" },
];

const CONTENT_SECTIONS = [
  { type: "announcement", label: "Announcements", icon: Megaphone, desc: "Hotel announcements" },
  { type: "promotion", label: "Promotions", icon: Tag, desc: "Special offers & deals" },
  { type: "welcome_message", label: "Welcome Messages", icon: Heart, desc: "Guest welcome messages" },
  { type: "amenity", label: "Amenities", icon: Building2, desc: "Hotel amenities" },
  { type: "event", label: "Events", icon: Calendar, desc: "Upcoming events" },
  { type: "emergency", label: "Emergency Info", icon: AlertTriangle, desc: "Emergency contacts & info" },
  { type: "checkout_reminder", label: "Checkout", icon: LogOut, desc: "Checkout reminders" },
];

const EVENT_CATEGORIES = [
  { value: "community", label: "Community" },
  { value: "music", label: "Music" },
  { value: "arts", label: "Arts & Culture" },
  { value: "food", label: "Food & Drink" },
  { value: "sports", label: "Sports" },
  { value: "holiday", label: "Holiday" },
  { value: "festival", label: "Festival" },
  { value: "market", label: "Market" },
  { value: "charity", label: "Charity" },
  { value: "outdoor", label: "Outdoor" },
  { value: "family", label: "Family" },
  { value: "education", label: "Education" },
];

const EVENT_SORT_OPTIONS = [
  { value: "upcoming", label: "Upcoming First" },
  { value: "newest", label: "Newest First" },
  { value: "featured", label: "Featured First" },
  { value: "custom", label: "Custom Order" },
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

  // Mini widget blocks
  const hotelBlock = settings.hotel_name ? <div className="bg-white/20 rounded h-2 w-14 mb-0.5" /> : null;
  const clockBlock = <div className="bg-white/25 rounded h-3 w-12 mb-0.5" />;
  const weatherBlock = (
    <div className="p-1 rounded bg-white/15 backdrop-blur">
      <div className="flex items-center gap-1">
        <div className="w-4 h-4 rounded bg-white/20" />
        <div>
          <div className="bg-white/30 rounded h-1.5 w-7 mb-0.5" />
          <div className="bg-white/15 rounded h-1 w-10" />
        </div>
      </div>
    </div>
  );
  const newsBlock = (
    <div className="p-1 rounded bg-white/10">
      <div className="bg-white/20 rounded h-1 w-full mb-0.5" />
      <div className="bg-white/10 rounded h-1 w-3/4" />
    </div>
  );

  const renderOverlayPreview = () => {
    if (isPortrait) {
      return (
        <div className="absolute inset-0 p-2.5 flex flex-col">
          <div className="text-center">{hotelBlock}<div className="mt-1">{clockBlock}</div></div>
          <div className="flex-1" />
          <div className="space-y-1">
            {weatherBlock}
            {newsBlock}
          </div>
        </div>
      );
    }
    // Landscape: hotel+clock top, weather+news bottom
    return (
      <div className="absolute inset-0 p-2.5 flex flex-col">
        <div className="flex justify-between items-start">
          <div>{hotelBlock}</div>
          <div>{clockBlock}</div>
        </div>
        <div className="flex-1" />
        <div className="flex justify-between items-end gap-2">
          {weatherBlock}
          <div className="max-w-[45%]">{newsBlock}</div>
        </div>
      </div>
    );
  };

  return (
    <div className="flex flex-col items-center gap-4" data-testid="live-preview">
      <div 
        className="relative rounded-lg overflow-hidden shadow-2xl border border-white/20"
        style={{ width: previewW, height: previewH, background: getThemeBg() }}
        data-testid="preview-canvas"
      >
        <div className="absolute inset-0 bg-black/20" />
        {renderOverlayPreview()}
        <div className="absolute bottom-1 left-1/2 -translate-x-1/2 flex gap-0.5 z-10">
          <div className="w-3 h-0.5 rounded-full bg-white/80" />
          <div className="w-0.5 h-0.5 rounded-full bg-white/30" />
          <div className="w-0.5 h-0.5 rounded-full bg-white/30" />
          <div className="w-0.5 h-0.5 rounded-full bg-white/30" />
        </div>
      </div>
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
        <div className="flex justify-between gap-4">
          <span className="text-muted-foreground">Layout:</span>
          <span className="font-medium">Fullscreen Overlay</span>
        </div>
        <div className="flex justify-between gap-4">
          <span className="text-muted-foreground">Widget Scale:</span>
          <span className="font-mono font-medium">{(settings.widget_scale || 1).toFixed(1)}x</span>
        </div>
      </div>
    </div>
  );
};




export default function AdminPanel() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [authChecked, setAuthChecked] = useState(false);
  const [showPasswordChange, setShowPasswordChange] = useState(false);
  const [passwordForm, setPasswordForm] = useState({ current: "", new: "", confirm: "" });
  const [passwordError, setPasswordError] = useState("");
  const [passwordLoading, setPasswordLoading] = useState(false);

  // Check existing auth on mount
  useEffect(() => {
    const token = localStorage.getItem("admin_token");
    const savedUser = localStorage.getItem("admin_user");
    if (token && savedUser) {
      axios.get(`${API}/auth/me`, { headers: { Authorization: `Bearer ${token}` } })
        .then(res => { setUser(res.data); setAuthChecked(true); })
        .catch(() => { localStorage.removeItem("admin_token"); localStorage.removeItem("admin_user"); setAuthChecked(true); });
    } else {
      setAuthChecked(true);
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("admin_token");
    localStorage.removeItem("admin_user");
    setUser(null);
  };

  const handleChangePassword = async () => {
    setPasswordError("");
    if (passwordForm.new !== passwordForm.confirm) {
      setPasswordError("New passwords don't match");
      return;
    }
    if (passwordForm.new.length < 6) {
      setPasswordError("New password must be at least 6 characters");
      return;
    }
    setPasswordLoading(true);
    try {
      const token = localStorage.getItem("admin_token");
      await axios.post(`${API}/auth/change-password`, 
        { current_password: passwordForm.current, new_password: passwordForm.new },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success("Password changed successfully");
      setShowPasswordChange(false);
      setPasswordForm({ current: "", new: "", confirm: "" });
    } catch (err) {
      setPasswordError(err.response?.data?.detail || "Failed to change password");
    } finally {
      setPasswordLoading(false);
    }
  };

  // Show login if not authenticated
  if (!authChecked) {
    return <div className="min-h-screen bg-slate-950 flex items-center justify-center"><div className="text-white/50">Loading...</div></div>;
  }
  if (!user) {
    return <LoginPage onLogin={(u) => setUser(u)} />;
  }

  return <AdminDashboard 
    navigate={navigate} user={user} 
    onLogout={handleLogout} 
    showPasswordChange={showPasswordChange}
    setShowPasswordChange={setShowPasswordChange}
    passwordForm={passwordForm}
    setPasswordForm={setPasswordForm}
    passwordError={passwordError}
    handleChangePassword={handleChangePassword}
    passwordLoading={passwordLoading}
  />;
}

function AdminDashboard({ navigate, user, onLogout, showPasswordChange, setShowPasswordChange, passwordForm, setPasswordForm, passwordError, handleChangePassword, passwordLoading }) {
  const [settings, setSettings] = useState({
    hotel_name: "",
    city: "Clifton, Texas",
    news_category: "general",
    photo_interval: 8,
    weather_slide_duration: 15,
    weather_refresh: 15,
    news_refresh: 30,
    aspect_ratio: "4:3",
    display_orientation: "portrait",
    display_scale: 100,
    display_width: 7.5,
    display_height: 10,
    enable_weather_animations: true,
  });
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [weather, setWeather] = useState(null);
  const [contentItems, setContentItems] = useState({});
  const [activeContentType, setActiveContentType] = useState("announcement");
  const [editingContent, setEditingContent] = useState(null);
  const [newContent, setNewContent] = useState(null);
  const [events, setEvents] = useState([]);
  const [editingEvent, setEditingEvent] = useState(null);
  const [newEvent, setNewEvent] = useState(null);
  const [eventSortBy, setEventSortBy] = useState("upcoming");

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

  const fetchContent = useCallback(async (sectionType) => {
    try {
      const response = await axios.get(`${API}/content/${sectionType}`);
      setContentItems(prev => ({ ...prev, [sectionType]: response.data }));
    } catch (error) {
      console.error("Error fetching content:", error);
    }
  }, []);

  const fetchEvents = useCallback(async (sort = "upcoming") => {
    try {
      const response = await axios.get(`${API}/events`, { params: { sort_by: sort, include_expired: true } });
      setEvents(response.data);
    } catch (error) {
      console.error("Error fetching events:", error);
    }
  }, []);

  useEffect(() => {
    fetchSettings();
    fetchImages();
    fetchWeather();
    fetchEvents();
    CONTENT_SECTIONS.forEach(s => fetchContent(s.type));
  }, [fetchSettings, fetchImages, fetchWeather, fetchEvents, fetchContent]);

  const handleSaveSettings = async (settingsToSave) => {
    // Guard against receiving event objects from onClick handlers
    const data = (settingsToSave && settingsToSave.widget_positions !== undefined) ? settingsToSave : settings;
    setLoading(true);
    try {
      await axios.put(`${API}/settings`, data);
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

  // ===== Content CRUD =====
  const handleCreateContent = async () => {
    if (!newContent?.title) return;
    try {
      const response = await axios.post(`${API}/content/${activeContentType}`, newContent);
      setContentItems(prev => ({
        ...prev,
        [activeContentType]: [...(prev[activeContentType] || []), response.data]
      }));
      setNewContent(null);
      toast.success("Content item added");
    } catch (error) {
      toast.error("Failed to add content");
    }
  };

  const handleUpdateContent = async (id) => {
    if (!editingContent) return;
    try {
      const response = await axios.put(`${API}/content/${activeContentType}/${id}`, editingContent);
      setContentItems(prev => ({
        ...prev,
        [activeContentType]: (prev[activeContentType] || []).map(c => c.id === id ? response.data : c)
      }));
      setEditingContent(null);
      toast.success("Content updated");
    } catch (error) {
      toast.error("Failed to update content");
    }
  };

  const handleDeleteContent = async (id) => {
    try {
      await axios.delete(`${API}/content/${activeContentType}/${id}`);
      setContentItems(prev => ({
        ...prev,
        [activeContentType]: (prev[activeContentType] || []).filter(c => c.id !== id)
      }));
      toast.success("Content deleted");
    } catch (error) {
      toast.error("Failed to delete content");
    }
  };

  const handleToggleContent = async (item) => {
    try {
      const response = await axios.put(`${API}/content/${activeContentType}/${item.id}`, { enabled: !item.enabled });
      setContentItems(prev => ({
        ...prev,
        [activeContentType]: (prev[activeContentType] || []).map(c => c.id === item.id ? response.data : c)
      }));
    } catch (error) {
      toast.error("Failed to toggle content");
    }
  };

  // ===== Events CRUD =====
  const emptyEvent = { title: "", description: "", event_date: "", start_time: "", end_time: "", location: "", address: "", category: "community", image_url: "", website: "", phone: "", notes: "", featured: false, enabled: true, keep_after_expired: false };

  const handleCreateEvent = async () => {
    if (!newEvent?.title) return;
    try {
      const response = await axios.post(`${API}/events`, newEvent);
      setEvents(prev => [...prev, response.data]);
      setNewEvent(null);
      toast.success("Event added");
    } catch (error) {
      toast.error("Failed to add event");
    }
  };

  const handleUpdateEvent = async (id) => {
    if (!editingEvent) return;
    try {
      const { id: _, is_expired: __, ...updateData } = editingEvent;
      const response = await axios.put(`${API}/events/${id}`, updateData);
      setEvents(prev => prev.map(e => e.id === id ? response.data : e));
      setEditingEvent(null);
      toast.success("Event updated");
    } catch (error) {
      toast.error("Failed to update event");
    }
  };

  const handleDeleteEvent = async (id) => {
    try {
      await axios.delete(`${API}/events/${id}`);
      setEvents(prev => prev.filter(e => e.id !== id));
      toast.success("Event deleted");
    } catch (error) {
      toast.error("Failed to delete event");
    }
  };

  const handleToggleEvent = async (item, field = "enabled") => {
    try {
      const response = await axios.put(`${API}/events/${item.id}`, { [field]: !item[field] });
      setEvents(prev => prev.map(e => e.id === item.id ? response.data : e));
    } catch (error) {
      toast.error("Failed to toggle event");
    }
  };

  const handleEventImageUpload = async (eventId, file) => {
    const formData = new FormData();
    formData.append("file", file);
    try {
      const response = await axios.post(`${API}/events/${eventId}/image`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setEvents(prev => prev.map(e => e.id === eventId ? { ...e, image_url: response.data.image_url } : e));
      toast.success("Image uploaded");
    } catch (error) {
      toast.error("Failed to upload image");
    }
  };

  const handleEventSortChange = (sort) => {
    setEventSortBy(sort);
    fetchEvents(sort);
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
          <div className="flex items-center gap-3">
            <Button 
              variant="outline" 
              onClick={() => navigate("/")}
              className="gap-2"
              data-testid="preview-display-button"
            >
              <Eye className="w-4 h-4" />
              Preview
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowPasswordChange(true)}
              className="gap-2 text-muted-foreground"
              data-testid="change-password-btn"
            >
              <KeyRound className="w-4 h-4" />
              Password
            </Button>
            <div className="h-6 w-px bg-white/10" />
            <span className="text-xs text-muted-foreground">{user?.email}</span>
            <Button
              variant="ghost"
              size="sm"
              onClick={onLogout}
              className="gap-2 text-red-400 hover:text-red-300"
              data-testid="logout-btn"
            >
              <LogOut className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </header>

      {/* Password Change Modal */}
      {showPasswordChange && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm" data-testid="password-change-modal">
          <div className="bg-slate-900 border border-white/10 rounded-2xl p-6 w-full max-w-md shadow-2xl">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-blue-500/20 flex items-center justify-center">
                <Lock className="w-5 h-5 text-blue-400" />
              </div>
              <div>
                <h3 className="font-semibold text-white">Change Password</h3>
                <p className="text-xs text-white/50">Update your admin password</p>
              </div>
            </div>

            {passwordError && (
              <div className="mb-4 p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm flex items-center gap-2" data-testid="password-change-error">
                <AlertTriangle className="w-4 h-4 flex-shrink-0" />
                {passwordError}
              </div>
            )}

            <div className="space-y-4">
              <div>
                <Label className="text-white/60">Current Password</Label>
                <Input
                  type="password"
                  value={passwordForm.current}
                  onChange={(e) => setPasswordForm(p => ({ ...p, current: e.target.value }))}
                  placeholder="Enter current password"
                  data-testid="current-password-input"
                />
              </div>
              <div>
                <Label className="text-white/60">New Password</Label>
                <Input
                  type="password"
                  value={passwordForm.new}
                  onChange={(e) => setPasswordForm(p => ({ ...p, new: e.target.value }))}
                  placeholder="Enter new password (min 6 chars)"
                  data-testid="new-password-input"
                />
              </div>
              <div>
                <Label className="text-white/60">Confirm New Password</Label>
                <Input
                  type="password"
                  value={passwordForm.confirm}
                  onChange={(e) => setPasswordForm(p => ({ ...p, confirm: e.target.value }))}
                  placeholder="Confirm new password"
                  data-testid="confirm-password-input"
                />
              </div>
            </div>

            <div className="flex gap-3 mt-6 justify-end">
              <Button variant="outline" onClick={() => { setShowPasswordChange(false); setPasswordForm({ current: "", new: "", confirm: "" }); }} data-testid="cancel-password-btn">
                Cancel
              </Button>
              <Button
                onClick={handleChangePassword}
                disabled={passwordLoading || !passwordForm.current || !passwordForm.new || !passwordForm.confirm}
                data-testid="save-password-btn"
              >
                {passwordLoading ? "Saving..." : "Change Password"}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-6 py-8">
        <Tabs defaultValue="images" className="space-y-8">
          <TabsList className="bg-card border border-white/10">
            <TabsTrigger value="images" className="gap-2" data-testid="tab-images">
              <ImageIcon className="w-4 h-4" />
              Images
            </TabsTrigger>
            <TabsTrigger value="attractions" className="gap-2" data-testid="tab-attractions">
              <MapPin className="w-4 h-4" />
              Attractions
            </TabsTrigger>
            <TabsTrigger value="events" className="gap-2" data-testid="tab-events">
              <CalendarDays className="w-4 h-4" />
              Events
            </TabsTrigger>
            <TabsTrigger value="content" className="gap-2" data-testid="tab-content">
              <FileText className="w-4 h-4" />
              Content
            </TabsTrigger>
            <TabsTrigger value="settings" className="gap-2" data-testid="tab-settings">
              <Settings className="w-4 h-4" />
              Settings
            </TabsTrigger>
            <TabsTrigger value="display" className="gap-2" data-testid="tab-display">
              <Monitor className="w-4 h-4" />
              Display
            </TabsTrigger>
            <TabsTrigger value="overlays" className="gap-2" data-testid="tab-overlays">
              <Megaphone className="w-4 h-4" />
              Overlays
            </TabsTrigger>
            <TabsTrigger value="videos" className="gap-2" data-testid="tab-videos">
              <Film className="w-4 h-4" />
              Videos
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

          {/* Attractions Tab */}
          <TabsContent value="attractions" className="space-y-6" data-testid="attractions-tab-content">
            <AttractionsTab settings={settings} setSettings={setSettings} handleSaveSettings={handleSaveSettings} loading={loading} />
          </TabsContent>


          {/* Events Tab */}
          <TabsContent value="events" className="space-y-6" data-testid="events-tab-content">
            <Card className="bg-card border-white/10">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <CalendarDays className="w-5 h-5" />
                      Local Events
                    </CardTitle>
                    <CardDescription>Manage events shown in the lobby display</CardDescription>
                  </div>
                  <Button 
                    onClick={() => setNewEvent({ ...emptyEvent })}
                    className="gap-2"
                    data-testid="add-event-button"
                  >
                    <Plus className="w-4 h-4" />
                    Add Event
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Events Settings */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 rounded-lg bg-muted/50 border border-white/5">
                  <div className="space-y-1">
                    <Label className="text-xs">Events per slide</Label>
                    <Input
                      type="number"
                      min="1"
                      max="12"
                      value={settings.events_per_slide || 4}
                      onChange={(e) => setSettings({ ...settings, events_per_slide: parseInt(e.target.value) || 4 })}
                      className="h-8"
                      data-testid="events-per-slide-input"
                    />
                  </div>
                  <div className="flex items-end gap-3 pb-1">
                    <div className="space-y-1">
                      <Label className="text-xs">Auto-rotate</Label>
                      <Switch
                        checked={settings.events_auto_rotate !== false}
                        onCheckedChange={(checked) => setSettings({ ...settings, events_auto_rotate: checked })}
                        data-testid="events-auto-rotate-toggle"
                      />
                    </div>
                  </div>
                  <div className="flex items-end gap-3 pb-1">
                    <div className="space-y-1">
                      <Label className="text-xs">Show in slideshow</Label>
                      <Switch
                        checked={settings.events_show_in_slideshow !== false}
                        onCheckedChange={(checked) => setSettings({ ...settings, events_show_in_slideshow: checked })}
                        data-testid="events-show-in-slideshow-toggle"
                      />
                    </div>
                  </div>
                  <div className="flex items-end gap-3 pb-1">
                    <div className="space-y-1">
                      <Label className="text-xs">Auto-hide expired</Label>
                      <Switch
                        checked={settings.events_auto_hide_expired !== false}
                        onCheckedChange={(checked) => setSettings({ ...settings, events_auto_hide_expired: checked })}
                        data-testid="events-auto-hide-expired-toggle"
                      />
                    </div>
                  </div>
                </div>

                {/* Sort & Save */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <ArrowUpDown className="w-4 h-4 text-muted-foreground" />
                    <Select value={eventSortBy} onValueChange={handleEventSortChange}>
                      <SelectTrigger className="w-[180px] h-8" data-testid="events-sort-select">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {EVENT_SORT_OPTIONS.map((opt) => (
                          <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <Button onClick={handleSaveSettings} disabled={loading} size="sm" className="gap-2">
                    <Save className="w-3 h-3" />
                    Save Settings
                  </Button>
                </div>

                {/* New Event Form */}
                {newEvent && (
                  <div className="p-4 rounded-lg border-2 border-primary/30 bg-primary/5 space-y-3" data-testid="new-event-form">
                    <p className="text-sm font-medium text-primary">New Event</p>
                    <div className="grid grid-cols-2 gap-3">
                      <Input
                        placeholder="Event title *"
                        value={newEvent.title}
                        onChange={(e) => setNewEvent({ ...newEvent, title: e.target.value })}
                        data-testid="new-event-title"
                      />
                      <Select
                        value={newEvent.category}
                        onValueChange={(value) => setNewEvent({ ...newEvent, category: value })}
                      >
                        <SelectTrigger data-testid="new-event-category">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {EVENT_CATEGORIES.map((cat) => (
                            <SelectItem key={cat.value} value={cat.value}>{cat.label}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <Input
                      placeholder="Short description"
                      value={newEvent.description}
                      onChange={(e) => setNewEvent({ ...newEvent, description: e.target.value })}
                      data-testid="new-event-description"
                    />
                    <div className="grid grid-cols-3 gap-3">
                      <div className="space-y-1">
                        <Label className="text-xs">Event Date</Label>
                        <Input
                          type="date"
                          value={newEvent.event_date}
                          onChange={(e) => setNewEvent({ ...newEvent, event_date: e.target.value })}
                          data-testid="new-event-date"
                        />
                      </div>
                      <div className="space-y-1">
                        <Label className="text-xs">Start Time</Label>
                        <Input
                          placeholder="e.g. 9:00 AM"
                          value={newEvent.start_time}
                          onChange={(e) => setNewEvent({ ...newEvent, start_time: e.target.value })}
                          data-testid="new-event-start-time"
                        />
                      </div>
                      <div className="space-y-1">
                        <Label className="text-xs">End Time</Label>
                        <Input
                          placeholder="e.g. 5:00 PM"
                          value={newEvent.end_time}
                          onChange={(e) => setNewEvent({ ...newEvent, end_time: e.target.value })}
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <Input
                        placeholder="Location name"
                        value={newEvent.location}
                        onChange={(e) => setNewEvent({ ...newEvent, location: e.target.value })}
                      />
                      <Input
                        placeholder="Address"
                        value={newEvent.address}
                        onChange={(e) => setNewEvent({ ...newEvent, address: e.target.value })}
                      />
                    </div>
                    <div className="grid grid-cols-3 gap-3">
                      <Input
                        placeholder="Website URL"
                        value={newEvent.website}
                        onChange={(e) => setNewEvent({ ...newEvent, website: e.target.value })}
                      />
                      <Input
                        placeholder="Phone number"
                        value={newEvent.phone}
                        onChange={(e) => setNewEvent({ ...newEvent, phone: e.target.value })}
                      />
                      <Input
                        placeholder="Notes"
                        value={newEvent.notes}
                        onChange={(e) => setNewEvent({ ...newEvent, notes: e.target.value })}
                      />
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-2">
                        <Switch
                          checked={newEvent.featured}
                          onCheckedChange={(checked) => setNewEvent({ ...newEvent, featured: checked })}
                        />
                        <Label className="text-xs">Featured</Label>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button onClick={handleCreateEvent} size="sm" className="gap-2" data-testid="save-new-event">
                        <Check className="w-3 h-3" />
                        Save Event
                      </Button>
                      <Button onClick={() => setNewEvent(null)} variant="ghost" size="sm">Cancel</Button>
                    </div>
                  </div>
                )}

                {/* Events List */}
                <div className="space-y-2">
                  {events.map((item) => (
                    <div 
                      key={item.id}
                      className={`rounded-lg border transition-all ${
                        item.is_expired && !item.keep_after_expired 
                          ? 'border-red-500/20 bg-red-500/5 opacity-50' 
                          : item.enabled 
                            ? 'border-white/10 bg-card' 
                            : 'border-white/5 bg-muted/30 opacity-60'
                      }`}
                      data-testid={`event-item-${item.id}`}
                    >
                      {editingEvent?.id === item.id ? (
                        /* Edit Mode */
                        <div className="p-3 space-y-2">
                          <div className="grid grid-cols-2 gap-2">
                            <Input
                              value={editingEvent.title}
                              onChange={(e) => setEditingEvent({ ...editingEvent, title: e.target.value })}
                              placeholder="Title"
                            />
                            <Select
                              value={editingEvent.category}
                              onValueChange={(value) => setEditingEvent({ ...editingEvent, category: value })}
                            >
                              <SelectTrigger><SelectValue /></SelectTrigger>
                              <SelectContent>
                                {EVENT_CATEGORIES.map((cat) => (
                                  <SelectItem key={cat.value} value={cat.value}>{cat.label}</SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                          <Input
                            value={editingEvent.description}
                            onChange={(e) => setEditingEvent({ ...editingEvent, description: e.target.value })}
                            placeholder="Description"
                          />
                          <div className="grid grid-cols-3 gap-2">
                            <Input
                              type="date"
                              value={editingEvent.event_date}
                              onChange={(e) => setEditingEvent({ ...editingEvent, event_date: e.target.value })}
                            />
                            <Input
                              value={editingEvent.start_time}
                              onChange={(e) => setEditingEvent({ ...editingEvent, start_time: e.target.value })}
                              placeholder="Start time"
                            />
                            <Input
                              value={editingEvent.end_time}
                              onChange={(e) => setEditingEvent({ ...editingEvent, end_time: e.target.value })}
                              placeholder="End time"
                            />
                          </div>
                          <div className="grid grid-cols-2 gap-2">
                            <Input
                              value={editingEvent.location}
                              onChange={(e) => setEditingEvent({ ...editingEvent, location: e.target.value })}
                              placeholder="Location"
                            />
                            <Input
                              value={editingEvent.address}
                              onChange={(e) => setEditingEvent({ ...editingEvent, address: e.target.value })}
                              placeholder="Address"
                            />
                          </div>
                          <div className="grid grid-cols-3 gap-2">
                            <Input
                              value={editingEvent.website}
                              onChange={(e) => setEditingEvent({ ...editingEvent, website: e.target.value })}
                              placeholder="Website"
                            />
                            <Input
                              value={editingEvent.phone}
                              onChange={(e) => setEditingEvent({ ...editingEvent, phone: e.target.value })}
                              placeholder="Phone"
                            />
                            <Input
                              value={editingEvent.notes}
                              onChange={(e) => setEditingEvent({ ...editingEvent, notes: e.target.value })}
                              placeholder="Notes"
                            />
                          </div>
                          <div className="flex items-center gap-4">
                            <div className="flex items-center gap-2">
                              <Switch
                                checked={editingEvent.featured}
                                onCheckedChange={(checked) => setEditingEvent({ ...editingEvent, featured: checked })}
                              />
                              <Label className="text-xs">Featured</Label>
                            </div>
                            <div className="flex items-center gap-2">
                              <Switch
                                checked={editingEvent.keep_after_expired}
                                onCheckedChange={(checked) => setEditingEvent({ ...editingEvent, keep_after_expired: checked })}
                              />
                              <Label className="text-xs">Keep after expired</Label>
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <Button onClick={() => handleUpdateEvent(item.id)} size="sm" className="gap-1">
                              <Check className="w-3 h-3" />
                              Save
                            </Button>
                            <Button onClick={() => setEditingEvent(null)} variant="ghost" size="sm">Cancel</Button>
                          </div>
                        </div>
                      ) : (
                        /* View Mode */
                        <div className="flex items-start gap-3 p-3">
                          {/* Image preview */}
                          {item.image_url && (
                            <div className="w-16 h-16 rounded-lg overflow-hidden flex-shrink-0 bg-white/5">
                              <img 
                                src={item.image_url.startsWith("http") ? item.image_url : `${BACKEND_URL}${item.image_url}`}
                                alt={item.title}
                                className="w-full h-full object-cover"
                              />
                            </div>
                          )}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <p className="font-medium">{item.title}</p>
                              {item.featured && (
                                <span className="text-xs px-1.5 py-0.5 rounded bg-yellow-500/20 text-yellow-400 flex items-center gap-1">
                                  <Star className="w-3 h-3" /> Featured
                                </span>
                              )}
                              {item.is_expired && (
                                <span className="text-xs px-1.5 py-0.5 rounded bg-red-500/20 text-red-400">
                                  Expired
                                </span>
                              )}
                              {item.keep_after_expired && item.is_expired && (
                                <span className="text-xs px-1.5 py-0.5 rounded bg-blue-500/20 text-blue-400">
                                  Kept
                                </span>
                              )}
                              <span className="text-xs px-1.5 py-0.5 rounded-full bg-white/10 text-muted-foreground">
                                {EVENT_CATEGORIES.find(c => c.value === item.category)?.label || item.category}
                              </span>
                            </div>
                            {item.description && <p className="text-sm text-muted-foreground truncate">{item.description}</p>}
                            <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                              {item.event_date && (
                                <span className="flex items-center gap-1">
                                  <Calendar className="w-3 h-3" />
                                  {new Date(item.event_date + "T00:00:00").toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                                </span>
                              )}
                              {item.start_time && (
                                <span className="flex items-center gap-1">
                                  <Timer className="w-3 h-3" />
                                  {item.start_time}{item.end_time ? ` - ${item.end_time}` : ""}
                                </span>
                              )}
                              {item.location && (
                                <span className="flex items-center gap-1">
                                  <MapPin className="w-3 h-3" />
                                  {item.location}
                                </span>
                              )}
                            </div>
                          </div>
                          <div className="flex items-center gap-1 flex-shrink-0">
                            {/* Image upload */}
                            <label className="cursor-pointer">
                              <input
                                type="file"
                                accept="image/*"
                                className="hidden"
                                onChange={(e) => {
                                  const file = e.target.files?.[0];
                                  if (file) handleEventImageUpload(item.id, file);
                                  e.target.value = "";
                                }}
                              />
                              <div className="h-8 w-8 flex items-center justify-center rounded-md hover:bg-accent transition-colors">
                                <ImagePlus className="w-4 h-4 text-muted-foreground" />
                              </div>
                            </label>
                            <Button variant="ghost" size="icon" className="h-8 w-8"
                              onClick={() => handleToggleEvent(item, "featured")}
                              data-testid={`feature-event-${item.id}`}
                            >
                              <Star className={`w-4 h-4 ${item.featured ? "text-yellow-400 fill-yellow-400" : "text-muted-foreground"}`} />
                            </Button>
                            <Button variant="ghost" size="icon" className="h-8 w-8"
                              onClick={() => handleToggleEvent(item, "enabled")}
                              data-testid={`toggle-event-${item.id}`}
                            >
                              {item.enabled ? <ToggleRight className="w-4 h-4 text-green-400" /> : <ToggleLeft className="w-4 h-4 text-muted-foreground" />}
                            </Button>
                            <Button variant="ghost" size="icon" className="h-8 w-8"
                              onClick={() => setEditingEvent({ ...item })}
                              data-testid={`edit-event-${item.id}`}
                            >
                              <Edit2 className="w-4 h-4" />
                            </Button>
                            <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive"
                              onClick={() => handleDeleteEvent(item.id)}
                              data-testid={`delete-event-${item.id}`}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                  {events.length === 0 && (
                    <div className="text-center py-8 text-muted-foreground">
                      <CalendarDays className="w-10 h-10 mx-auto mb-2 opacity-30" />
                      <p>No events yet. Add one above.</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Content Tab */}
          <TabsContent value="content" className="space-y-6" data-testid="content-tab">
            <Card className="bg-card border-white/10">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="w-5 h-5" />
                  Content Management
                </CardTitle>
                <CardDescription>Manage announcements, promotions, and other lobby content</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Section Type Selector */}
                <div className="flex flex-wrap gap-2" data-testid="content-section-selector">
                  {CONTENT_SECTIONS.map((section) => {
                    const Icon = section.icon;
                    const count = (contentItems[section.type] || []).length;
                    return (
                      <button
                        key={section.type}
                        onClick={() => setActiveContentType(section.type)}
                        data-testid={`content-section-${section.type}`}
                        className={`flex items-center gap-2 px-3 py-2 rounded-lg border text-sm transition-all ${
                          activeContentType === section.type
                            ? "border-primary bg-primary/10 text-primary"
                            : "border-white/10 hover:border-white/25"
                        }`}
                      >
                        <Icon className="w-4 h-4" />
                        <span>{section.label}</span>
                        {count > 0 && (
                          <span className="text-xs bg-white/10 rounded-full px-1.5 py-0.5">{count}</span>
                        )}
                      </button>
                    );
                  })}
                </div>

                {/* Active Section Header */}
                <div className="flex items-center justify-between pt-2 border-t border-white/5">
                  <p className="text-sm text-muted-foreground">
                    {CONTENT_SECTIONS.find(s => s.type === activeContentType)?.desc}
                  </p>
                  <Button 
                    onClick={() => setNewContent({ title: "", content: "", enabled: true, priority: "normal", icon: "" })}
                    size="sm"
                    className="gap-2"
                    data-testid="add-content-button"
                  >
                    <Plus className="w-3 h-3" />
                    Add {CONTENT_SECTIONS.find(s => s.type === activeContentType)?.label?.replace(/s$/, '') || "Item"}
                  </Button>
                </div>

                {/* New Content Form */}
                {newContent && (
                  <div className="p-4 rounded-lg border-2 border-primary/30 bg-primary/5 space-y-3" data-testid="new-content-form">
                    <p className="text-sm font-medium text-primary">New {CONTENT_SECTIONS.find(s => s.type === activeContentType)?.label?.replace(/s$/, '')}</p>
                    <div className="grid grid-cols-2 gap-3">
                      <Input
                        placeholder="Title"
                        value={newContent.title}
                        onChange={(e) => setNewContent({ ...newContent, title: e.target.value })}
                        data-testid="new-content-title"
                      />
                      <Select
                        value={newContent.priority}
                        onValueChange={(value) => setNewContent({ ...newContent, priority: value })}
                      >
                        <SelectTrigger data-testid="new-content-priority">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="normal">Normal</SelectItem>
                          <SelectItem value="high">High</SelectItem>
                          <SelectItem value="urgent">Urgent</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <Input
                      placeholder="Content / description"
                      value={newContent.content}
                      onChange={(e) => setNewContent({ ...newContent, content: e.target.value })}
                      data-testid="new-content-body"
                    />
                    <div className="flex gap-2">
                      <Button onClick={handleCreateContent} size="sm" className="gap-2" data-testid="save-new-content">
                        <Check className="w-3 h-3" />
                        Save
                      </Button>
                      <Button onClick={() => setNewContent(null)} variant="ghost" size="sm">
                        Cancel
                      </Button>
                    </div>
                  </div>
                )}

                {/* Content Items List */}
                <div className="space-y-2">
                  {(contentItems[activeContentType] || []).map((item) => (
                    <div 
                      key={item.id}
                      className={`flex items-center gap-3 p-3 rounded-lg border transition-all ${
                        item.enabled ? 'border-white/10 bg-card' : 'border-white/5 bg-muted/30 opacity-60'
                      }`}
                      data-testid={`content-item-${item.id}`}
                    >
                      {editingContent?.id === item.id ? (
                        <div className="flex-1 space-y-2">
                          <div className="grid grid-cols-2 gap-2">
                            <Input
                              value={editingContent.title || item.title}
                              onChange={(e) => setEditingContent({ ...editingContent, title: e.target.value })}
                            />
                            <Select
                              value={editingContent.priority || item.priority}
                              onValueChange={(value) => setEditingContent({ ...editingContent, priority: value })}
                            >
                              <SelectTrigger><SelectValue /></SelectTrigger>
                              <SelectContent>
                                <SelectItem value="normal">Normal</SelectItem>
                                <SelectItem value="high">High</SelectItem>
                                <SelectItem value="urgent">Urgent</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <Input
                            value={editingContent.content || item.content}
                            onChange={(e) => setEditingContent({ ...editingContent, content: e.target.value })}
                            placeholder="Content"
                          />
                          <div className="flex gap-2">
                            <Button onClick={() => handleUpdateContent(item.id)} size="sm" className="gap-1">
                              <Check className="w-3 h-3" />
                              Save
                            </Button>
                            <Button onClick={() => setEditingContent(null)} variant="ghost" size="sm">
                              Cancel
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <p className="font-medium truncate">{item.title}</p>
                              {item.priority !== "normal" && (
                                <span className={`text-xs px-2 py-0.5 rounded-full flex-shrink-0 ${
                                  item.priority === "urgent" ? "bg-red-500/20 text-red-400" : "bg-yellow-500/20 text-yellow-400"
                                }`}>
                                  {item.priority}
                                </span>
                              )}
                            </div>
                            {item.content && <p className="text-sm text-muted-foreground truncate">{item.content}</p>}
                          </div>
                          <div className="flex items-center gap-1 flex-shrink-0">
                            <Button 
                              variant="ghost" 
                              size="icon"
                              className="h-8 w-8"
                              onClick={() => handleToggleContent(item)}
                            >
                              {item.enabled ? <ToggleRight className="w-4 h-4 text-green-400" /> : <ToggleLeft className="w-4 h-4 text-muted-foreground" />}
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="icon"
                              className="h-8 w-8"
                              onClick={() => setEditingContent({ id: item.id, title: item.title, content: item.content, priority: item.priority })}
                            >
                              <Edit2 className="w-4 h-4" />
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="icon"
                              className="h-8 w-8 text-destructive"
                              onClick={() => handleDeleteContent(item.id)}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </>
                      )}
                    </div>
                  ))}
                  {(contentItems[activeContentType] || []).length === 0 && (
                    <div className="text-center py-8 text-muted-foreground">
                      <FileText className="w-10 h-10 mx-auto mb-2 opacity-30" />
                      <p>No {CONTENT_SECTIONS.find(s => s.type === activeContentType)?.label?.toLowerCase()} yet.</p>
                    </div>
                  )}
                </div>
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

            {/* Hotel Logo Upload */}
            <Card className="bg-card border-white/10">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ImageIcon className="w-5 h-5" />
                  Hotel Logo
                </CardTitle>
                <CardDescription>Upload your hotel logo — appears on the top-left of every slide</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {settings.logo_url ? (
                  <div className="flex items-center gap-4">
                    <div className="w-24 h-24 rounded-lg border border-white/10 bg-black/30 flex items-center justify-center p-2">
                      <img src={settings.logo_url} alt="Hotel Logo" className="max-h-full max-w-full object-contain" data-testid="logo-preview" />
                    </div>
                    <div className="space-y-2">
                      <p className="text-sm text-muted-foreground">Logo uploaded</p>
                      <div className="flex gap-2">
                        <label className="cursor-pointer">
                          <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={async (e) => {
                              const file = e.target.files?.[0];
                              if (!file) return;
                              const formData = new FormData();
                              formData.append("file", file);
                              try {
                                const res = await axios.post(`${API}/settings/logo`, formData, { headers: { "Content-Type": "multipart/form-data" } });
                                setSettings(prev => ({ ...prev, logo_url: res.data.logo_url }));
                                toast.success("Logo updated");
                              } catch { toast.error("Failed to upload logo"); }
                            }}
                            data-testid="logo-replace-input"
                          />
                          <Button variant="outline" size="sm" asChild><span>Replace</span></Button>
                        </label>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={async () => {
                            try {
                              await axios.delete(`${API}/settings/logo`);
                              setSettings(prev => ({ ...prev, logo_url: "" }));
                              toast.success("Logo removed");
                            } catch { toast.error("Failed to remove logo"); }
                          }}
                          data-testid="logo-delete-button"
                        >
                          <Trash2 className="w-4 h-4 mr-1" /> Remove
                        </Button>
                      </div>
                    </div>
                  </div>
                ) : (
                  <label className="cursor-pointer">
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={async (e) => {
                        const file = e.target.files?.[0];
                        if (!file) return;
                        const formData = new FormData();
                        formData.append("file", file);
                        try {
                          const res = await axios.post(`${API}/settings/logo`, formData, { headers: { "Content-Type": "multipart/form-data" } });
                          setSettings(prev => ({ ...prev, logo_url: res.data.logo_url }));
                          toast.success("Logo uploaded");
                        } catch { toast.error("Failed to upload logo"); }
                      }}
                      data-testid="logo-upload-input"
                    />
                    <div className="border-2 border-dashed border-white/20 rounded-xl p-8 text-center hover:border-primary/40 transition-colors">
                      <Upload className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
                      <p className="text-sm font-medium">Click to upload hotel logo</p>
                      <p className="text-xs text-muted-foreground mt-1">PNG or SVG recommended for transparency</p>
                    </div>
                  </label>
                )}
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

                {/* Widget Positioning */}
                <WidgetPositionPanel settings={settings} setSettings={setSettings} onSave={handleSaveSettings} />

                {/* Widget Sizing & Spacing */}
                <Card className="bg-card border-white/10">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Ruler className="w-5 h-5" />
                      Widget Sizing & Spacing
                    </CardTitle>
                    <CardDescription>Fine-tune widget size, font scale, and spacing</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <Label>Widget Scale</Label>
                        <span className="text-sm font-mono bg-secondary px-2 py-1 rounded" data-testid="widget-scale-value">
                          {(settings.widget_scale || 1).toFixed(1)}x
                        </span>
                      </div>
                      <Slider
                        value={[(settings.widget_scale || 1) * 100]}
                        onValueChange={(value) => setSettings(prev => ({ ...prev, widget_scale: value[0] / 100 }))}
                        min={50}
                        max={150}
                        step={5}
                        data-testid="widget-scale-slider"
                      />
                      <div className="flex justify-between text-xs text-muted-foreground">
                        <span>0.5x</span><span>1.0x</span><span>1.5x</span>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <Label>Font Scale</Label>
                        <span className="text-sm font-mono bg-secondary px-2 py-1 rounded" data-testid="font-scale-value">
                          {(settings.font_scale || 1).toFixed(1)}x
                        </span>
                      </div>
                      <Slider
                        value={[(settings.font_scale || 1) * 100]}
                        onValueChange={(value) => setSettings(prev => ({ ...prev, font_scale: value[0] / 100 }))}
                        min={70}
                        max={150}
                        step={5}
                        data-testid="font-scale-slider"
                      />
                      <div className="flex justify-between text-xs text-muted-foreground">
                        <span>0.7x</span><span>1.0x</span><span>1.5x</span>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <Label>Outer Padding (px)</Label>
                        <Input
                          type="number"
                          min="8"
                          max="120"
                          step="4"
                          value={settings.widget_padding || 48}
                          onChange={(e) => setSettings(prev => ({ ...prev, widget_padding: parseInt(e.target.value) || 48 }))}
                          data-testid="widget-padding-input"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Widget Spacing (px)</Label>
                        <Input
                          type="number"
                          min="4"
                          max="64"
                          step="4"
                          value={settings.widget_spacing || 16}
                          onChange={(e) => setSettings(prev => ({ ...prev, widget_spacing: parseInt(e.target.value) || 16 }))}
                          data-testid="widget-spacing-input"
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

          {/* Overlays Tab */}
          <TabsContent value="overlays" className="space-y-6" data-testid="overlays-tab-content">
            <OverlaysTab />
          </TabsContent>


          {/* Videos Tab */}
          <TabsContent value="videos" className="space-y-6" data-testid="videos-tab-content">
            <VideosTab />
          </TabsContent>


        </Tabs>
      </main>
    </div>
  );
}
