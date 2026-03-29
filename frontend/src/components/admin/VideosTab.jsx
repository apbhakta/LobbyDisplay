import { useState, useCallback, useEffect } from "react";
import axios from "axios";
import { toast } from "sonner";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { Switch } from "../../components/ui/switch";
import { Film, Plus, Trash2, Upload, ImagePlus, ToggleLeft, ToggleRight, Star, Play, Volume2, VolumeX, Repeat, RefreshCw } from "lucide-react";

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

export default function VideosTab() {
  const [videos, setVideos] = useState([]);
  const [newVideo, setNewVideo] = useState(null);
  const [videoUploading, setVideoUploading] = useState(false);

  const fetchVideos = useCallback(async () => {
    try { setVideos((await axios.get(`${API}/videos`)).data); } catch (e) { console.error(e); }
  }, []);

  useEffect(() => { fetchVideos(); }, [fetchVideos]);

  return (
    <Card className="bg-card border-white/10">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2"><Film className="w-5 h-5" />Videos & Commercials</CardTitle>
            <CardDescription>Upload and manage video content for the lobby slideshow</CardDescription>
          </div>
          <Button onClick={() => setNewVideo({ title: "", description: "", start_date: "", end_date: "", active: true, featured: false, mute: true, autoplay: true, loop: false, show_controls: false, frequency: 1 })} className="gap-2" data-testid="add-video-button">
            <Plus className="w-4 h-4" /> Add Video
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {newVideo && (
          <Card className="bg-primary/5 border-primary/20">
            <CardContent className="pt-6 space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label>Title *</Label>
                  <Input value={newVideo.title} onChange={(e) => setNewVideo(prev => ({ ...prev, title: e.target.value }))} placeholder="e.g. Hotel Welcome Video" data-testid="new-video-title" />
                </div>
                <div className="space-y-2">
                  <Label>Frequency (every N cycles)</Label>
                  <Input type="number" min="1" max="10" value={newVideo.frequency} onChange={(e) => setNewVideo(prev => ({ ...prev, frequency: parseInt(e.target.value) || 1 }))} data-testid="new-video-frequency" />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Description</Label>
                <Input value={newVideo.description} onChange={(e) => setNewVideo(prev => ({ ...prev, description: e.target.value }))} placeholder="Optional description" data-testid="new-video-description" />
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label>Start Date</Label>
                  <Input type="date" value={newVideo.start_date} onChange={(e) => setNewVideo(prev => ({ ...prev, start_date: e.target.value }))} data-testid="new-video-start-date" />
                </div>
                <div className="space-y-2">
                  <Label>End Date</Label>
                  <Input type="date" value={newVideo.end_date} onChange={(e) => setNewVideo(prev => ({ ...prev, end_date: e.target.value }))} data-testid="new-video-end-date" />
                </div>
              </div>
              <div className="grid gap-4 grid-cols-2 md:grid-cols-4">
                <div className="flex items-center gap-2">
                  <Switch checked={newVideo.mute} onCheckedChange={(v) => setNewVideo(prev => ({ ...prev, mute: v }))} />
                  <Label className="text-sm">{newVideo.mute ? <VolumeX className="w-4 h-4 inline" /> : <Volume2 className="w-4 h-4 inline" />} Muted</Label>
                </div>
                <div className="flex items-center gap-2">
                  <Switch checked={newVideo.autoplay} onCheckedChange={(v) => setNewVideo(prev => ({ ...prev, autoplay: v }))} />
                  <Label className="text-sm"><Play className="w-4 h-4 inline" /> Autoplay</Label>
                </div>
                <div className="flex items-center gap-2">
                  <Switch checked={newVideo.loop} onCheckedChange={(v) => setNewVideo(prev => ({ ...prev, loop: v }))} />
                  <Label className="text-sm"><Repeat className="w-4 h-4 inline" /> Loop</Label>
                </div>
                <div className="flex items-center gap-2">
                  <Switch checked={newVideo.featured} onCheckedChange={(v) => setNewVideo(prev => ({ ...prev, featured: v }))} />
                  <Label className="text-sm"><Star className="w-4 h-4 inline" /> Featured</Label>
                </div>
              </div>
              <div className="flex gap-2">
                <Button disabled={!newVideo.title} onClick={async () => {
                  try {
                    await axios.post(`${API}/videos`, newVideo);
                    setNewVideo(null);
                    fetchVideos();
                    toast.success("Video entry created — now upload the video file");
                  } catch { toast.error("Failed to create video"); }
                }} data-testid="save-new-video">Create Video Entry</Button>
                <Button variant="outline" onClick={() => setNewVideo(null)}>Cancel</Button>
              </div>
            </CardContent>
          </Card>
        )}

        {videos.length === 0 && !newVideo ? (
          <div className="text-center py-12 text-muted-foreground">
            <Film className="w-12 h-12 mx-auto mb-3 opacity-30" />
            <p>No videos yet. Click "Add Video" to get started.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {videos.map(video => (
              <Card key={video.id} className={`border-white/10 ${!video.active ? "opacity-50" : ""} ${video.is_expired ? "border-red-500/30" : ""}`} data-testid={`video-card-${video.id}`}>
                <CardContent className="pt-4">
                  <div className="flex gap-4">
                    <div className="w-40 h-24 rounded-lg bg-black/40 border border-white/10 overflow-hidden flex-shrink-0 flex items-center justify-center">
                      {video.thumbnail_url ? (
                        <img src={video.thumbnail_url} alt={video.title} className="w-full h-full object-cover" />
                      ) : video.video_url ? (
                        <video src={video.video_url} className="w-full h-full object-cover" muted preload="metadata" />
                      ) : (
                        <Film className="w-8 h-8 text-white/20" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold truncate">{video.title}</h3>
                        {video.featured && <Star className="w-4 h-4 text-amber-400 flex-shrink-0" />}
                        {video.is_expired && <span className="text-xs text-red-400 bg-red-500/10 px-2 py-0.5 rounded">Expired</span>}
                        {video.is_scheduled && <span className="text-xs text-blue-400 bg-blue-500/10 px-2 py-0.5 rounded">Scheduled</span>}
                      </div>
                      {video.description && <p className="text-sm text-muted-foreground truncate">{video.description}</p>}
                      <div className="flex gap-3 mt-2 text-xs text-muted-foreground">
                        {video.start_date && <span>From: {video.start_date}</span>}
                        {video.end_date && <span>Until: {video.end_date}</span>}
                        <span>Freq: every {video.frequency || 1} cycle{(video.frequency || 1) > 1 ? "s" : ""}</span>
                        <span className="flex items-center gap-1">{video.mute ? <VolumeX className="w-3 h-3" /> : <Volume2 className="w-3 h-3" />}{video.mute ? "Muted" : "Sound"}</span>
                        {video.loop && <span className="flex items-center gap-1"><Repeat className="w-3 h-3" />Loop</span>}
                      </div>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <label className="cursor-pointer">
                        <input type="file" accept="video/*" className="hidden" onChange={async (e) => {
                          const file = e.target.files?.[0];
                          if (!file) return;
                          setVideoUploading(true);
                          const formData = new FormData();
                          formData.append("file", file);
                          try {
                            await axios.post(`${API}/videos/${video.id}/upload`, formData, { headers: { "Content-Type": "multipart/form-data" }, timeout: 300000 });
                            fetchVideos();
                            toast.success("Video file uploaded");
                          } catch { toast.error("Video upload failed"); }
                          finally { setVideoUploading(false); }
                        }} data-testid={`upload-video-file-${video.id}`} />
                        <Button variant="outline" size="sm" asChild className="gap-1" disabled={videoUploading}>
                          <span><Upload className="w-3.5 h-3.5" />{video.video_url ? "Replace" : "Upload"}</span>
                        </Button>
                      </label>
                      <label className="cursor-pointer">
                        <input type="file" accept="image/*" className="hidden" onChange={async (e) => {
                          const file = e.target.files?.[0];
                          if (!file) return;
                          const formData = new FormData();
                          formData.append("file", file);
                          try {
                            await axios.post(`${API}/videos/${video.id}/thumbnail`, formData, { headers: { "Content-Type": "multipart/form-data" } });
                            fetchVideos();
                            toast.success("Thumbnail uploaded");
                          } catch { toast.error("Thumbnail upload failed"); }
                        }} data-testid={`upload-thumbnail-${video.id}`} />
                        <Button variant="outline" size="sm" asChild className="gap-1"><span><ImagePlus className="w-3.5 h-3.5" />Thumb</span></Button>
                      </label>
                      <Button variant="ghost" size="sm" onClick={async () => {
                        try {
                          await axios.put(`${API}/videos/${video.id}`, { active: !video.active });
                          fetchVideos();
                          toast.success(video.active ? "Video deactivated" : "Video activated");
                        } catch { toast.error("Failed to toggle"); }
                      }} data-testid={`toggle-video-${video.id}`}>
                        {video.active ? <ToggleRight className="w-5 h-5 text-green-400" /> : <ToggleLeft className="w-5 h-5 text-gray-400" />}
                      </Button>
                      <Button variant="ghost" size="sm" onClick={async () => {
                        if (!window.confirm("Delete this video?")) return;
                        try {
                          await axios.delete(`${API}/videos/${video.id}`);
                          fetchVideos();
                          toast.success("Video deleted");
                        } catch { toast.error("Failed to delete video"); }
                      }} data-testid={`delete-video-${video.id}`}>
                        <Trash2 className="w-4 h-4 text-red-400" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {videoUploading && (
          <div className="text-center py-4 text-primary">
            <RefreshCw className="w-5 h-5 animate-spin mx-auto mb-2" />
            <p className="text-sm">Uploading video... This may take a moment.</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
