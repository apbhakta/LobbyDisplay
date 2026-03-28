import { useState, useEffect, useCallback } from "react";
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
  ArrowLeft
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

export default function AdminPanel() {
  const navigate = useNavigate();
  const [settings, setSettings] = useState({
    hotel_name: "Velkommen Inn",
    city: "Clifton, Texas",
    news_category: "general",
    photo_interval: 8,
    weather_refresh: 15,
    news_refresh: 30,
  });
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);

  // Fetch settings
  const fetchSettings = useCallback(async () => {
    try {
      const response = await axios.get(`${API}/settings`);
      setSettings(response.data);
    } catch (error) {
      console.error("Error fetching settings:", error);
      toast.error("Failed to load settings");
    }
  }, []);

  // Fetch images
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

  // Save settings
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

  // Upload image
  const handleUploadImage = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setUploading(true);
    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await axios.post(`${API}/images`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setImages((prev) => [...prev, response.data]);
      toast.success("Image uploaded successfully");
    } catch (error) {
      console.error("Error uploading image:", error);
      toast.error("Failed to upload image");
    } finally {
      setUploading(false);
      event.target.value = "";
    }
  };

  // Delete image
  const handleDeleteImage = async (imageId) => {
    try {
      await axios.delete(`${API}/images/${imageId}`);
      setImages((prev) => prev.filter((img) => img.id !== imageId));
      toast.success("Image deleted successfully");
    } catch (error) {
      console.error("Error deleting image:", error);
      toast.error("Failed to delete image");
    }
  };

  // Reset to default images
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

  // Get image URL
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
              data-testid="back-to-display"
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div>
              <h1 className="text-xl font-semibold font-sans">Admin Panel</h1>
              <p className="text-sm text-muted-foreground">Manage your hotel lobby display</p>
            </div>
          </div>
          <Button 
            variant="outline" 
            onClick={() => navigate("/")}
            className="gap-2"
            data-testid="preview-display"
          >
            <Eye className="w-4 h-4" />
            Preview Display
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-6 py-8">
        <Tabs defaultValue="settings" className="space-y-8">
          <TabsList className="bg-card border border-white/10">
            <TabsTrigger value="settings" className="gap-2" data-testid="settings-tab">
              <Settings className="w-4 h-4" />
              Settings
            </TabsTrigger>
            <TabsTrigger value="images" className="gap-2" data-testid="images-tab">
              <ImageIcon className="w-4 h-4" />
              Images
            </TabsTrigger>
          </TabsList>

          {/* Settings Tab */}
          <TabsContent value="settings" className="space-y-6">
            <Card className="bg-card border-white/10" data-testid="admin-settings-form">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Building2 className="w-5 h-5" />
                  Hotel Information
                </CardTitle>
                <CardDescription>
                  Configure your hotel name and location
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid gap-6 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="hotel_name">Hotel Name</Label>
                    <Input
                      id="hotel_name"
                      value={settings.hotel_name}
                      onChange={(e) => setSettings({ ...settings, hotel_name: e.target.value })}
                      placeholder="Enter hotel name"
                      data-testid="admin-name-input"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="city" className="flex items-center gap-2">
                      <MapPin className="w-4 h-4" />
                      City / Location
                    </Label>
                    <Input
                      id="city"
                      value={settings.city}
                      onChange={(e) => setSettings({ ...settings, city: e.target.value })}
                      placeholder="Enter city for weather"
                      data-testid="admin-city-input"
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
                <CardDescription>
                  Configure the news category for headlines
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <Label htmlFor="news_category">News Category</Label>
                  <Select
                    value={settings.news_category}
                    onValueChange={(value) => setSettings({ ...settings, news_category: value })}
                  >
                    <SelectTrigger data-testid="news-category-select">
                      <SelectValue placeholder="Select category" />
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
                  Timing Settings
                </CardTitle>
                <CardDescription>
                  Configure refresh intervals and photo rotation
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid gap-6 md:grid-cols-3">
                  <div className="space-y-2">
                    <Label htmlFor="photo_interval">Photo Interval (seconds)</Label>
                    <Input
                      id="photo_interval"
                      type="number"
                      min="3"
                      max="60"
                      value={settings.photo_interval}
                      onChange={(e) => setSettings({ ...settings, photo_interval: parseInt(e.target.value) || 8 })}
                      data-testid="photo-interval-input"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="weather_refresh">Weather Refresh (minutes)</Label>
                    <Input
                      id="weather_refresh"
                      type="number"
                      min="5"
                      max="60"
                      value={settings.weather_refresh}
                      onChange={(e) => setSettings({ ...settings, weather_refresh: parseInt(e.target.value) || 15 })}
                      data-testid="weather-refresh-input"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="news_refresh">News Refresh (minutes)</Label>
                    <Input
                      id="news_refresh"
                      type="number"
                      min="10"
                      max="120"
                      value={settings.news_refresh}
                      onChange={(e) => setSettings({ ...settings, news_refresh: parseInt(e.target.value) || 30 })}
                      data-testid="news-refresh-input"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="flex justify-end">
              <Button 
                onClick={handleSaveSettings} 
                disabled={loading}
                className="gap-2"
                data-testid="admin-save-button"
              >
                <Save className="w-4 h-4" />
                {loading ? "Saving..." : "Save Settings"}
              </Button>
            </div>
          </TabsContent>

          {/* Images Tab */}
          <TabsContent value="images" className="space-y-6">
            <Card className="bg-card border-white/10">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <ImageIcon className="w-5 h-5" />
                      Hotel Images
                    </CardTitle>
                    <CardDescription>
                      Upload and manage images for the rotating display
                    </CardDescription>
                  </div>
                  <div className="flex gap-2">
                    <Button 
                      variant="outline" 
                      onClick={handleResetImages}
                      className="gap-2"
                      data-testid="reset-images-button"
                    >
                      <RefreshCw className="w-4 h-4" />
                      Reset to Defaults
                    </Button>
                    <Label 
                      htmlFor="image-upload" 
                      className="cursor-pointer"
                    >
                      <Button 
                        asChild 
                        disabled={uploading}
                        className="gap-2"
                        data-testid="upload-image-button"
                      >
                        <span>
                          <Upload className="w-4 h-4" />
                          {uploading ? "Uploading..." : "Upload Image"}
                        </span>
                      </Button>
                    </Label>
                    <Input
                      id="image-upload"
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleUploadImage}
                      data-testid="image-upload-input"
                    />
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {images.length === 0 ? (
                  <div className="text-center py-12 text-muted-foreground">
                    <ImageIcon className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>No images uploaded yet</p>
                    <p className="text-sm">Upload images to display in the lobby</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {images.map((image) => (
                      <div 
                        key={image.id} 
                        className="relative group rounded-lg overflow-hidden border border-white/10"
                        data-testid={`image-card-${image.id}`}
                      >
                        <img
                          src={getImageUrl(image)}
                          alt={image.filename}
                          className="w-full h-40 object-cover"
                        />
                        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                          <Button
                            variant="destructive"
                            size="icon"
                            onClick={() => handleDeleteImage(image.id)}
                            data-testid={`delete-image-${image.id}`}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                        <div className="absolute bottom-0 left-0 right-0 bg-black/60 p-2">
                          <p className="text-xs text-white truncate">{image.filename}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
