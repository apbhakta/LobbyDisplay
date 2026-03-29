from fastapi import FastAPI, APIRouter, UploadFile, File, HTTPException, Request, Depends
from fastapi.responses import JSONResponse
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field, ConfigDict
from typing import List, Optional
import uuid
from datetime import datetime, timezone, timedelta
import httpx
import bcrypt
import jwt
import cloudinary
import cloudinary.uploader

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# Create the main app
app = FastAPI()

# Create a router with the /api prefix
api_router = APIRouter(prefix="/api")

# API Keys from environment
WEATHERAPI_KEY = os.environ.get('WEATHERAPI_KEY', '')
NEWS_API_KEY = os.environ.get('NEWS_API_KEY', '')

# Cloudinary configuration
cloudinary.config(
    cloud_name=os.environ.get("CLOUDINARY_CLOUD_NAME"),
    api_key=os.environ.get("CLOUDINARY_API_KEY"),
    api_secret=os.environ.get("CLOUDINARY_API_SECRET"),
    secure=True
)

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# ===== Auth Helpers =====
JWT_SECRET = os.environ.get('JWT_SECRET', '')
JWT_ALGORITHM = "HS256"

def hash_password(password: str) -> str:
    return bcrypt.hashpw(password.encode("utf-8"), bcrypt.gensalt()).decode("utf-8")

def verify_password(plain_password: str, hashed_password: str) -> bool:
    return bcrypt.checkpw(plain_password.encode("utf-8"), hashed_password.encode("utf-8"))

def create_access_token(user_id: str, email: str) -> str:
    payload = {"sub": user_id, "email": email, "exp": datetime.now(timezone.utc) + timedelta(hours=24), "type": "access"}
    return jwt.encode(payload, JWT_SECRET, algorithm=JWT_ALGORITHM)

async def get_current_user(request: Request) -> dict:
    token = request.cookies.get("access_token")
    if not token:
        auth_header = request.headers.get("Authorization", "")
        if auth_header.startswith("Bearer "):
            token = auth_header[7:]
    if not token:
        raise HTTPException(status_code=401, detail="Not authenticated")
    try:
        payload = jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM])
        if payload.get("type") != "access":
            raise HTTPException(status_code=401, detail="Invalid token type")
        from bson import ObjectId
        user = await db.users.find_one({"_id": ObjectId(payload["sub"])})
        if not user:
            raise HTTPException(status_code=401, detail="User not found")
        user["_id"] = str(user["_id"])
        user.pop("password_hash", None)
        return user
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token expired")
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="Invalid token")

async def seed_admin():
    admin_email = os.environ.get("ADMIN_EMAIL", "admin@lobbydisplay.com").lower()
    admin_password = os.environ.get("ADMIN_PASSWORD", "Admin@2026!")
    existing = await db.users.find_one({"email": admin_email})
    if existing is None:
        hashed = hash_password(admin_password)
        await db.users.insert_one({
            "email": admin_email,
            "password_hash": hashed,
            "name": "Admin",
            "role": "admin",
            "created_at": datetime.now(timezone.utc),
        })
        logger.info(f"Admin user seeded: {admin_email}")
    elif not verify_password(admin_password, existing["password_hash"]):
        await db.users.update_one(
            {"email": admin_email},
            {"$set": {"password_hash": hash_password(admin_password)}}
        )
        logger.info(f"Admin password updated for: {admin_email}")
    await db.users.create_index("email", unique=True)

# ===== Models =====

class Settings(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = "hotel_settings"
    hotel_name: str = ""
    city: str = "Clifton, Texas"
    news_category: str = "general"
    photo_interval: int = 8
    weather_slide_duration: int = 15
    weather_refresh: int = 15
    news_refresh: int = 30
    aspect_ratio: str = "4:3"  # "16:9", "9:16", "4:3", "3:4", "custom"
    display_orientation: str = "portrait"  # landscape or portrait
    display_scale: int = 100  # 50-150 percentage
    display_width: float = 7.5  # width in inches
    display_height: float = 10.0  # height in inches
    enable_weather_animations: bool = True
    attractions_per_slide: int = 6
    attractions_auto_rotate: bool = True
    widget_layout: str = "bottom-left"  # bottom-left, top-right, bottom-bar, centered, split
    widget_scale: float = 1.0  # 0.5-1.5 global widget size multiplier
    font_scale: float = 1.0  # 0.7-1.5 global font scale
    widget_padding: int = 48  # outer padding px
    widget_spacing: int = 16  # gap between widgets px
    events_per_slide: int = 4
    events_auto_rotate: bool = True
    events_show_in_slideshow: bool = True
    events_auto_hide_expired: bool = True
    events_sort_by: str = "upcoming"  # upcoming, newest, featured, custom
    # Widget positions (percentage-based, 0-100)
    widget_positions: dict = Field(default_factory=lambda: {
        "hotel_name": {"x": 0, "y": 0},
        "clock": {"x": 100, "y": 0},
        "weather": {"x": 0, "y": 100},
        "news": {"x": 100, "y": 100},
    })
    logo_url: str = ""
    # Widget visibility
    widget_visibility: dict = Field(default_factory=lambda: {
        "logo": True, "clock": True, "weather": True, "news": True,
    })
    # Widget styling
    clock_format: str = "12h"  # 12h or 24h
    clock_style: str = "digital"  # digital, minimal, large
    font_style: str = "modern"  # modern, classic, mono
    # Widget colors (individual)
    widget_colors: dict = Field(default_factory=lambda: {
        "clock": "#ffffff", "weather": "#ffffff", "news": "#ffffff", "logo_bg": "transparent",
    })
    glass_effect: bool = True

class SettingsUpdate(BaseModel):
    model_config = ConfigDict(extra="ignore")
    hotel_name: Optional[str] = None
    city: Optional[str] = None
    news_category: Optional[str] = None
    photo_interval: Optional[int] = None
    weather_slide_duration: Optional[int] = None
    weather_refresh: Optional[int] = None
    news_refresh: Optional[int] = None
    aspect_ratio: Optional[str] = None
    display_orientation: Optional[str] = None
    display_scale: Optional[int] = None
    display_width: Optional[float] = None
    display_height: Optional[float] = None
    enable_weather_animations: Optional[bool] = None
    attractions_per_slide: Optional[int] = None
    attractions_auto_rotate: Optional[bool] = None
    widget_layout: Optional[str] = None
    widget_scale: Optional[float] = None
    font_scale: Optional[float] = None
    widget_padding: Optional[int] = None
    widget_spacing: Optional[int] = None
    events_per_slide: Optional[int] = None
    events_auto_rotate: Optional[bool] = None
    events_show_in_slideshow: Optional[bool] = None
    events_auto_hide_expired: Optional[bool] = None
    events_sort_by: Optional[str] = None
    widget_positions: Optional[dict] = None
    logo_url: Optional[str] = None

class HotelImage(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    filename: str
    url: str
    uploaded_at: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())

class WeatherData(BaseModel):
    temp: float
    temp_min: float
    temp_max: float
    condition: str
    icon: str
    city: str
    humidity: int = 50
    wind_speed: float = 0
    visibility: float = 10
    sunrise: str = "6:00 AM"
    sunset: str = "6:00 PM"
    uv_index: int = 0
    air_quality: int = 50
    is_fallback: bool = False
    feels_like: float = 0
    precipitation: float = 0

class ForecastDay(BaseModel):
    day: str
    temp_min: float
    temp_max: float
    condition: str
    icon: str

class ExtendedWeatherData(BaseModel):
    current: WeatherData
    forecast: List[ForecastDay] = []
    hourly: List[dict] = []

class NewsHeadline(BaseModel):
    title: str
    source: str
    url: str
    is_fallback: bool = False

# ===== Attraction Model =====
ATTRACTION_CATEGORIES = [
    "dining", "shopping", "parks", "museums", "entertainment",
    "family", "events", "outdoor", "hotel_recommendations"
]

class Attraction(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    description: str = ""
    distance: str = ""
    category: str = "dining"
    image_url: str = ""
    enabled: bool = True
    order: int = 0
    created_at: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())

class AttractionCreate(BaseModel):
    name: str
    description: str = ""
    distance: str = ""
    category: str = "dining"
    image_url: str = ""
    enabled: bool = True

class AttractionUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    distance: Optional[str] = None
    category: Optional[str] = None
    image_url: Optional[str] = None
    enabled: Optional[bool] = None
    order: Optional[int] = None

# ===== Content Section Model =====
CONTENT_TYPES = [
    "announcement", "promotion", "welcome_message", "amenity",
    "event", "emergency", "checkout_reminder"
]

class ContentItem(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    section_type: str
    title: str
    content: str = ""
    enabled: bool = True
    order: int = 0
    priority: str = "normal"
    icon: str = ""
    created_at: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())

class ContentItemCreate(BaseModel):
    title: str
    content: str = ""
    enabled: bool = True
    priority: str = "normal"
    icon: str = ""

class ContentItemUpdate(BaseModel):
    title: Optional[str] = None
    content: Optional[str] = None
    enabled: Optional[bool] = None
    order: Optional[int] = None
    priority: Optional[str] = None
    icon: Optional[str] = None

# ===== Local Event Model =====
EVENT_CATEGORIES = [
    "community", "music", "arts", "food", "sports", "holiday",
    "festival", "market", "charity", "outdoor", "family", "education"
]

class LocalEvent(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    title: str
    description: str = ""
    event_date: str = ""  # ISO date string YYYY-MM-DD
    start_time: str = ""  # e.g. "10:00 AM"
    end_time: str = ""  # e.g. "4:00 PM"
    location: str = ""
    address: str = ""
    category: str = "community"
    image_url: str = ""
    website: str = ""
    phone: str = ""
    notes: str = ""
    featured: bool = False
    enabled: bool = True
    keep_after_expired: bool = False  # manually keep visible after event date
    order: int = 0
    created_at: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())

class LocalEventCreate(BaseModel):
    title: str
    description: str = ""
    event_date: str = ""
    start_time: str = ""
    end_time: str = ""
    location: str = ""
    address: str = ""
    category: str = "community"
    image_url: str = ""
    website: str = ""
    phone: str = ""
    notes: str = ""
    featured: bool = False
    enabled: bool = True
    keep_after_expired: bool = False

class LocalEventUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    event_date: Optional[str] = None
    start_time: Optional[str] = None
    end_time: Optional[str] = None
    location: Optional[str] = None
    address: Optional[str] = None
    category: Optional[str] = None
    image_url: Optional[str] = None
    website: Optional[str] = None
    phone: Optional[str] = None
    notes: Optional[str] = None
    featured: Optional[bool] = None
    enabled: Optional[bool] = None
    keep_after_expired: Optional[bool] = None
    order: Optional[int] = None

# ===== Overlay/Announcement Model =====
OVERLAY_STYLES = ["banner", "fullscreen", "corner", "ticker"]

class Overlay(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    title: str
    message: str = ""
    style: str = "banner"  # banner, fullscreen, corner, ticker
    bg_color: str = "#1e293b"
    text_color: str = "#ffffff"
    icon: str = ""
    enabled: bool = True
    priority: int = 0  # higher = shown first
    start_time: str = ""  # ISO datetime, empty = immediate
    end_time: str = ""  # ISO datetime, empty = indefinite
    created_at: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())

class OverlayCreate(BaseModel):
    title: str
    message: str = ""
    style: str = "banner"
    bg_color: str = "#1e293b"
    text_color: str = "#ffffff"
    icon: str = ""
    enabled: bool = True
    priority: int = 0
    start_time: str = ""
    end_time: str = ""

class OverlayUpdate(BaseModel):
    title: Optional[str] = None
    message: Optional[str] = None
    style: Optional[str] = None
    bg_color: Optional[str] = None
    text_color: Optional[str] = None
    icon: Optional[str] = None
    enabled: Optional[bool] = None
    priority: Optional[int] = None
    start_time: Optional[str] = None
    end_time: Optional[str] = None

# ===== Video/Commercial Model =====

class Video(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    title: str
    description: str = ""
    video_url: str = ""
    video_cloudinary_id: str = ""
    thumbnail_url: str = ""
    thumbnail_cloudinary_id: str = ""
    start_date: str = ""  # YYYY-MM-DD, empty = immediate
    end_date: str = ""  # YYYY-MM-DD, empty = indefinite
    active: bool = True
    featured: bool = False
    mute: bool = True
    autoplay: bool = True
    loop: bool = False
    show_controls: bool = False
    order: int = 0
    frequency: int = 1  # 1 = every cycle, 2 = every other cycle, etc.
    created_at: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())

class VideoCreate(BaseModel):
    title: str
    description: str = ""
    start_date: str = ""
    end_date: str = ""
    active: bool = True
    featured: bool = False
    mute: bool = True
    autoplay: bool = True
    loop: bool = False
    show_controls: bool = False
    frequency: int = 1

class VideoUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    start_date: Optional[str] = None
    end_date: Optional[str] = None
    active: Optional[bool] = None
    featured: Optional[bool] = None
    mute: Optional[bool] = None
    autoplay: Optional[bool] = None
    loop: Optional[bool] = None
    show_controls: Optional[bool] = None
    order: Optional[int] = None
    frequency: Optional[int] = None

DEFAULT_IMAGES = []  # No stock/demo images — user uploads their own

FALLBACK_WEATHER = {
    "temp": 72,
    "temp_min": 65,
    "temp_max": 78,
    "condition": "Partly Cloudy",
    "icon": "02d",
    "city": "Clifton, Texas",
    "humidity": 45,
    "wind_speed": 8.5,
    "visibility": 10,
    "sunrise": "6:35 AM",
    "sunset": "7:42 PM",
    "uv_index": 6,
    "air_quality": 42,
    "is_fallback": True
}

FALLBACK_FORECAST = [
    {"day": "Monday", "temp_min": 62, "temp_max": 75, "condition": "Sunny", "icon": "01d"},
    {"day": "Tuesday", "temp_min": 64, "temp_max": 78, "condition": "Sunny", "icon": "01d"},
    {"day": "Wednesday", "temp_min": 60, "temp_max": 72, "condition": "Cloudy", "icon": "03d"},
    {"day": "Thursday", "temp_min": 58, "temp_max": 68, "condition": "Rain", "icon": "10d"},
    {"day": "Friday", "temp_min": 55, "temp_max": 70, "condition": "Partly Cloudy", "icon": "02d"},
    {"day": "Saturday", "temp_min": 60, "temp_max": 74, "condition": "Cloudy", "icon": "04d"},
    {"day": "Sunday", "temp_min": 62, "temp_max": 76, "condition": "Windy", "icon": "50d"},
]

FALLBACK_HEADLINES = [
    {"title": "Welcome — Enjoy Your Stay and Explore Clifton, Texas", "source": "Hotel News", "url": "#", "is_fallback": True},
    {"title": "Experience the Heart of Texas Hospitality", "source": "Travel Today", "url": "#", "is_fallback": True},
    {"title": "Discover Local Attractions and Hidden Gems Nearby", "source": "Explore Texas", "url": "#", "is_fallback": True}
]

# Cache for weather and news
weather_cache = {"data": None, "timestamp": None}
news_cache = {"data": None, "timestamp": None}


# ===== Auth Endpoints =====

class LoginRequest(BaseModel):
    email: str
    password: str

class ChangePasswordRequest(BaseModel):
    current_password: str
    new_password: str

@api_router.post("/auth/login")
async def login(request: LoginRequest):
    email = request.email.lower().strip()
    user = await db.users.find_one({"email": email})
    if not user or not verify_password(request.password, user["password_hash"]):
        raise HTTPException(status_code=401, detail="Invalid email or password")
    
    token = create_access_token(str(user["_id"]), email)
    response = JSONResponse(content={
        "id": str(user["_id"]),
        "email": user["email"],
        "name": user.get("name", "Admin"),
        "role": user.get("role", "admin"),
        "token": token,
    })
    response.set_cookie(
        key="access_token", value=token, httponly=True,
        secure=False, samesite="lax", max_age=86400, path="/"
    )
    return response

@api_router.get("/auth/me")
async def get_me(user: dict = Depends(get_current_user)):
    return {
        "id": user["_id"],
        "email": user["email"],
        "name": user.get("name", "Admin"),
        "role": user.get("role", "admin"),
    }

@api_router.post("/auth/logout")
async def logout():
    response = JSONResponse(content={"status": "logged out"})
    response.delete_cookie("access_token", path="/")
    return response

@api_router.post("/auth/change-password")
async def change_password(request: ChangePasswordRequest, user: dict = Depends(get_current_user)):
    from bson import ObjectId
    full_user = await db.users.find_one({"_id": ObjectId(user["_id"])})
    if not full_user:
        raise HTTPException(status_code=404, detail="User not found")
    if not verify_password(request.current_password, full_user["password_hash"]):
        raise HTTPException(status_code=400, detail="Current password is incorrect")
    if len(request.new_password) < 6:
        raise HTTPException(status_code=400, detail="New password must be at least 6 characters")
    await db.users.update_one(
        {"_id": ObjectId(user["_id"])},
        {"$set": {"password_hash": hash_password(request.new_password)}}
    )
    return {"status": "password changed"}


# ===== Settings Endpoints =====

@api_router.get("/settings", response_model=Settings)
async def get_settings():
    """Get hotel display settings"""
    settings = await db.settings.find_one({"id": "hotel_settings"}, {"_id": 0})
    if not settings:
        default_settings = Settings()
        await db.settings.insert_one(default_settings.model_dump())
        return default_settings
    return Settings(**settings)

@api_router.put("/settings", response_model=Settings)
async def update_settings(update: SettingsUpdate):
    """Update hotel display settings"""
    update_data = {k: v for k, v in update.model_dump().items() if v is not None}
    if update_data:
        await db.settings.update_one(
            {"id": "hotel_settings"},
            {"$set": update_data},
            upsert=True
        )
    settings = await db.settings.find_one({"id": "hotel_settings"}, {"_id": 0})
    return Settings(**settings)

# ===== Image Endpoints =====

@api_router.get("/images", response_model=List[HotelImage])
async def get_images():
    """Get all hotel images"""
    images = await db.images.find({}, {"_id": 0}).to_list(100)
    if not images:
        return [HotelImage(**img) for img in DEFAULT_IMAGES]
    return [HotelImage(**img) for img in images]

@api_router.post("/images", response_model=HotelImage)
async def upload_image(file: UploadFile = File(...)):
    """Upload a new hotel image to Cloudinary"""
    if not file.content_type.startswith("image/"):
        raise HTTPException(status_code=400, detail="File must be an image")
    
    content = await file.read()
    try:
        result = cloudinary.uploader.upload(
            content,
            folder="hotel_lobby/images",
            resource_type="image"
        )
    except Exception as e:
        logger.error(f"Cloudinary upload failed: {e}")
        raise HTTPException(status_code=500, detail="Image upload failed")
    
    image = HotelImage(
        filename=file.filename,
        url=result["secure_url"],
    )
    image_doc = image.model_dump()
    image_doc["cloudinary_public_id"] = result["public_id"]
    
    await db.images.insert_one(image_doc)
    return image

@api_router.delete("/images/{image_id}")
async def delete_image(image_id: str):
    """Delete a hotel image from Cloudinary and DB"""
    image = await db.images.find_one({"id": image_id}, {"_id": 0})
    if not image:
        raise HTTPException(status_code=404, detail="Image not found")
    
    # Delete from Cloudinary if public_id exists
    public_id = image.get("cloudinary_public_id")
    if public_id:
        try:
            cloudinary.uploader.destroy(public_id, invalidate=True)
        except Exception as e:
            logger.error(f"Cloudinary delete failed for {public_id}: {e}")
    
    await db.images.delete_one({"id": image_id})
    return {"message": "Image deleted successfully"}

@api_router.post("/images/reset-defaults")
async def reset_to_defaults():
    """Reset images to defaults"""
    await db.images.delete_many({})
    return {"message": "Images reset to defaults"}

@api_router.post("/images/migrate-to-cloud")
async def migrate_images_to_cloud():
    """Migrate local /api/uploads/ images to Cloudinary"""
    images = await db.images.find({}, {"_id": 0}).to_list(200)
    local_images = [img for img in images if img.get("url", "").startswith("/api/uploads/")]
    
    if not local_images:
        return {"message": "No local images to migrate", "migrated": 0}
    
    migrated = 0
    failed = 0
    uploads_dir = Path(__file__).parent / "uploads"
    
    for img in local_images:
        filename = img["url"].split("/")[-1]
        file_path = uploads_dir / filename
        if not file_path.exists():
            failed += 1
            continue
        try:
            result = cloudinary.uploader.upload(
                str(file_path),
                folder="hotel_lobby/images",
                resource_type="image"
            )
            await db.images.update_one(
                {"id": img["id"]},
                {"$set": {
                    "url": result["secure_url"],
                    "cloudinary_public_id": result["public_id"]
                }}
            )
            migrated += 1
        except Exception as e:
            logger.error(f"Migration failed for {filename}: {e}")
            failed += 1
    
    return {"message": "Migration complete", "migrated": migrated, "failed": failed, "total_local": len(local_images)}

# ===== Logo Upload Endpoint =====

@api_router.post("/settings/logo")
async def upload_logo(file: UploadFile = File(...)):
    """Upload hotel logo to Cloudinary and save URL in settings"""
    if not file.content_type.startswith("image/"):
        raise HTTPException(status_code=400, detail="File must be an image")
    
    content = await file.read()
    try:
        result = cloudinary.uploader.upload(
            content,
            folder="hotel_lobby/logo",
            resource_type="image",
            format="png"
        )
    except Exception as e:
        logger.error(f"Cloudinary logo upload failed: {e}")
        raise HTTPException(status_code=500, detail="Logo upload failed")
    
    logo_url = result["secure_url"]
    await db.settings.update_one(
        {"id": "hotel_settings"},
        {"$set": {"logo_url": logo_url, "logo_cloudinary_id": result["public_id"]}},
        upsert=True
    )
    return {"logo_url": logo_url}

@api_router.delete("/settings/logo")
async def delete_logo():
    """Remove hotel logo"""
    settings = await db.settings.find_one({"id": "hotel_settings"}, {"_id": 0})
    if settings and settings.get("logo_cloudinary_id"):
        try:
            cloudinary.uploader.destroy(settings["logo_cloudinary_id"], invalidate=True)
        except Exception as e:
            logger.error(f"Cloudinary logo delete failed: {e}")
    
    await db.settings.update_one(
        {"id": "hotel_settings"},
        {"$set": {"logo_url": "", "logo_cloudinary_id": ""}},
        upsert=True
    )
    return {"message": "Logo removed"}

# ===== Weather Provider: WeatherAPI.com =====
# Maps WeatherAPI condition codes to OpenWeatherMap icon codes for frontend theme compatibility.
# See https://www.weatherapi.com/docs/weather_conditions.json

def _weatherapi_to_owm_icon(condition_code: int, is_day: bool) -> str:
    suffix = "d" if is_day else "n"
    clear = {1000}
    partly = {1003}
    cloudy = {1006}
    overcast = {1009}
    fog = {1030, 1135, 1147}
    thunder = {1087, 1273, 1276, 1279, 1282}
    snow = {1066, 1069, 1072, 1114, 1117, 1204, 1207, 1210, 1213, 1216, 1219, 1222, 1225, 1237, 1249, 1252, 1255, 1258, 1261, 1264}
    heavy_rain = {1192, 1195, 1201, 1243, 1246}
    light_rain = {1063, 1150, 1153, 1168, 1171, 1180, 1183, 1186, 1189, 1198, 1240}

    if condition_code in clear:
        return f"01{suffix}"
    if condition_code in partly:
        return f"02{suffix}"
    if condition_code in cloudy:
        return f"03{suffix}"
    if condition_code in overcast:
        return f"04{suffix}"
    if condition_code in fog:
        return f"50{suffix}"
    if condition_code in thunder:
        return f"11{suffix}"
    if condition_code in snow:
        return f"13{suffix}"
    if condition_code in heavy_rain:
        return f"09{suffix}"
    if condition_code in light_rain:
        return f"10{suffix}"
    return f"02{suffix}"


@api_router.get("/weather", response_model=WeatherData)
async def get_weather(city: Optional[str] = None):
    """Get current weather via WeatherAPI.com"""
    global weather_cache

    if not city:
        settings = await db.settings.find_one({"id": "hotel_settings"}, {"_id": 0})
        city = settings.get("city", "Clifton, Texas") if settings else "Clifton, Texas"

    now = datetime.now(timezone.utc)
    if weather_cache["data"] and weather_cache["timestamp"]:
        cache_age = (now - weather_cache["timestamp"]).total_seconds()
        if cache_age < 900:
            logger.info("Returning cached weather data")
            return WeatherData(**weather_cache["data"])

    if not WEATHERAPI_KEY:
        logger.warning("No WeatherAPI key configured, using fallback")
        fallback = FALLBACK_WEATHER.copy()
        fallback["city"] = city
        return WeatherData(**fallback)

    try:
        async with httpx.AsyncClient(timeout=10.0) as http:
            response = await http.get(
                "https://api.weatherapi.com/v1/forecast.json",
                params={"key": WEATHERAPI_KEY, "q": city, "days": 1, "aqi": "no"}
            )

            if response.status_code == 200:
                data = response.json()
                cur = data["current"]
                loc = data["location"]
                astro = data["forecast"]["forecastday"][0].get("astro", {})
                day_data = data["forecast"]["forecastday"][0]["day"]
                is_day = bool(cur.get("is_day", 1))
                code = cur["condition"]["code"]

                weather_data = {
                    "temp": round(cur["temp_f"]),
                    "temp_min": round(day_data["mintemp_f"]),
                    "temp_max": round(day_data["maxtemp_f"]),
                    "condition": cur["condition"]["text"],
                    "icon": _weatherapi_to_owm_icon(code, is_day),
                    "city": loc["name"],
                    "humidity": cur.get("humidity", 50),
                    "wind_speed": round(cur.get("wind_mph", 0), 1),
                    "visibility": round(cur.get("vis_miles", 10), 1),
                    "sunrise": astro.get("sunrise", "6:00 AM"),
                    "sunset": astro.get("sunset", "6:00 PM"),
                    "uv_index": int(cur.get("uv", 0)),
                    "air_quality": 42,
                    "is_fallback": False,
                    "feels_like": round(cur.get("feelslike_f", cur["temp_f"])),
                    "precipitation": round(cur.get("precip_in", 0), 2),
                }
                weather_cache["data"] = weather_data
                weather_cache["timestamp"] = now
                logger.info(f"Weather fetched from WeatherAPI.com for {loc['name']}")
                return WeatherData(**weather_data)
            else:
                body = response.text
                logger.error(f"WeatherAPI error {response.status_code}: {body}")
                if weather_cache["data"]:
                    weather_cache["data"]["is_fallback"] = True
                    return WeatherData(**weather_cache["data"])
                fallback = FALLBACK_WEATHER.copy()
                fallback["city"] = city
                return WeatherData(**fallback)

    except Exception as e:
        logger.error(f"Weather request failed: {e}")
        if weather_cache["data"]:
            weather_cache["data"]["is_fallback"] = True
            return WeatherData(**weather_cache["data"])
        fallback = FALLBACK_WEATHER.copy()
        fallback["city"] = city
        return WeatherData(**fallback)


@api_router.get("/weather/extended", response_model=ExtendedWeatherData)
async def get_extended_weather(city: Optional[str] = None):
    """Get current weather + multi-day forecast via WeatherAPI.com"""
    if not city:
        settings = await db.settings.find_one({"id": "hotel_settings"}, {"_id": 0})
        city = settings.get("city", "Clifton, Texas") if settings else "Clifton, Texas"

    if not WEATHERAPI_KEY:
        current = await get_weather(city)
        return ExtendedWeatherData(
            current=current,
            forecast=[ForecastDay(**f) for f in FALLBACK_FORECAST],
            hourly=[]
        )

    try:
        async with httpx.AsyncClient(timeout=10.0) as http:
            response = await http.get(
                "https://api.weatherapi.com/v1/forecast.json",
                params={"key": WEATHERAPI_KEY, "q": city, "days": 7, "aqi": "no"}
            )

            if response.status_code != 200:
                logger.error(f"WeatherAPI forecast error: {response.status_code}")
                current = await get_weather(city)
                return ExtendedWeatherData(
                    current=current,
                    forecast=[ForecastDay(**f) for f in FALLBACK_FORECAST],
                    hourly=[]
                )

            data = response.json()
            cur = data["current"]
            loc = data["location"]
            forecast_days_raw = data.get("forecast", {}).get("forecastday", [])

            # Build current weather
            is_day = bool(cur.get("is_day", 1))
            code = cur["condition"]["code"]
            astro_today = forecast_days_raw[0].get("astro", {}) if forecast_days_raw else {}
            day_today = forecast_days_raw[0]["day"] if forecast_days_raw else {}

            current_data = WeatherData(
                temp=round(cur["temp_f"]),
                temp_min=round(day_today.get("mintemp_f", cur["temp_f"])),
                temp_max=round(day_today.get("maxtemp_f", cur["temp_f"])),
                condition=cur["condition"]["text"],
                icon=_weatherapi_to_owm_icon(code, is_day),
                city=loc["name"],
                humidity=cur.get("humidity", 50),
                wind_speed=round(cur.get("wind_mph", 0), 1),
                visibility=round(cur.get("vis_miles", 10), 1),
                sunrise=astro_today.get("sunrise", "6:00 AM"),
                sunset=astro_today.get("sunset", "6:00 PM"),
                uv_index=int(cur.get("uv", 0)),
                air_quality=42,
                is_fallback=False,
                feels_like=round(cur.get("feelslike_f", cur["temp_f"])),
                precipitation=round(cur.get("precip_in", 0), 2),
            )

            # Update cache
            weather_cache["data"] = current_data.model_dump()
            weather_cache["timestamp"] = datetime.now(timezone.utc)

            # Build forecast list (skip today — frontend prepends "Today" from current)
            forecast = []
            for fd in forecast_days_raw[1:7]:
                d = fd["day"]
                fc_code = d["condition"]["code"]
                dt = datetime.strptime(fd["date"], "%Y-%m-%d")
                forecast.append(ForecastDay(
                    day=dt.strftime("%A"),
                    temp_min=round(d["mintemp_f"]),
                    temp_max=round(d["maxtemp_f"]),
                    condition=d["condition"]["text"],
                    icon=_weatherapi_to_owm_icon(fc_code, True),
                ))

            # Build hourly (next 24 hours from today's hours)
            hourly = []
            if forecast_days_raw:
                for h in forecast_days_raw[0].get("hour", [])[:24]:
                    dt_h = datetime.strptime(h["time"], "%Y-%m-%d %H:%M")
                    hourly.append({
                        "time": dt_h.strftime("%I %p"),
                        "temp": round(h["temp_f"])
                    })

            return ExtendedWeatherData(
                current=current_data,
                forecast=forecast if forecast else [ForecastDay(**f) for f in FALLBACK_FORECAST],
                hourly=hourly
            )

    except Exception as e:
        logger.error(f"Extended weather fetch failed: {e}")
        current = await get_weather(city)
        return ExtendedWeatherData(
            current=current,
            forecast=[ForecastDay(**f) for f in FALLBACK_FORECAST],
            hourly=[]
        )


# ===== News Endpoint =====

@api_router.get("/news", response_model=List[NewsHeadline])
async def get_news(category: Optional[str] = None):
    """Get top news headlines"""
    global news_cache
    
    # Get category from settings if not provided
    if not category:
        settings = await db.settings.find_one({"id": "hotel_settings"}, {"_id": 0})
        category = settings.get("news_category", "general") if settings else "general"
    
    # Check cache (30 minute expiry)
    now = datetime.now(timezone.utc)
    if news_cache["data"] and news_cache["timestamp"]:
        cache_age = (now - news_cache["timestamp"]).total_seconds()
        if cache_age < 1800:  # 30 minutes
            logger.info("Returning cached news data")
            return [NewsHeadline(**h) for h in news_cache["data"]]
    
    # Try to fetch from NewsAPI
    if not NEWS_API_KEY:
        logger.warning("No NewsAPI key configured, using fallback")
        return [NewsHeadline(**h) for h in FALLBACK_HEADLINES]
    
    try:
        async with httpx.AsyncClient(timeout=10.0) as client:
            response = await client.get(
                "https://newsapi.org/v2/top-headlines",
                params={
                    "category": category,
                    "country": "us",
                    "pageSize": 10,
                    "apiKey": NEWS_API_KEY
                }
            )
            
            if response.status_code == 200:
                data = response.json()
                if data.get("status") == "ok" and data.get("articles"):
                    headlines = []
                    for article in data["articles"][:10]:
                        headlines.append({
                            "title": article.get("title", ""),
                            "source": article.get("source", {}).get("name", "Unknown"),
                            "url": article.get("url", "#"),
                            "is_fallback": False
                        })
                    news_cache["data"] = headlines
                    news_cache["timestamp"] = now
                    logger.info(f"News fetched successfully for category: {category}")
                    return [NewsHeadline(**h) for h in headlines]
            
            logger.error(f"News API error: {response.status_code}")
            raise HTTPException(status_code=response.status_code, detail="News API error")
            
    except httpx.RequestError as e:
        logger.error(f"News request failed: {e}")
        # Return cached data if available, otherwise fallback
        if news_cache["data"]:
            for h in news_cache["data"]:
                h["is_fallback"] = True
            return [NewsHeadline(**h) for h in news_cache["data"]]
        return [NewsHeadline(**h) for h in FALLBACK_HEADLINES]

# ===== Attractions Endpoints =====

DEFAULT_ATTRACTIONS = [
    {"name": "Bosque County Courthouse", "description": "Historic 1886 limestone courthouse in downtown", "distance": "0.3 miles", "category": "museums", "image_url": "", "enabled": True, "order": 0},
    {"name": "Clifton Lutheran Church", "description": "Historic Rock Church celebrating Norwegian heritage since 1886", "distance": "0.5 miles", "category": "museums", "image_url": "", "enabled": True, "order": 1},
    {"name": "Bosque Museum", "description": "Preserving the history and culture of Bosque County", "distance": "0.4 miles", "category": "museums", "image_url": "", "enabled": True, "order": 2},
    {"name": "Meridian State Park", "description": "Scenic park with lake, hiking trails, and wildlife", "distance": "12 miles", "category": "parks", "image_url": "", "enabled": True, "order": 3},
    {"name": "Norse Historic District", "description": "Authentic Norwegian heritage and architecture", "distance": "8 miles", "category": "outdoor", "image_url": "", "enabled": True, "order": 4},
    {"name": "Main Street Clifton", "description": "Charming downtown with antique shops and local eateries", "distance": "0.2 miles", "category": "shopping", "image_url": "", "enabled": True, "order": 5},
]

@api_router.get("/attractions", response_model=List[Attraction])
async def get_attractions():
    items = await db.attractions.find({}, {"_id": 0}).sort("order", 1).to_list(100)
    if not items:
        for i, a in enumerate(DEFAULT_ATTRACTIONS):
            a["id"] = str(uuid.uuid4())
            a["order"] = i
            a["created_at"] = datetime.now(timezone.utc).isoformat()
        await db.attractions.insert_many([dict(a) for a in DEFAULT_ATTRACTIONS])
        items = await db.attractions.find({}, {"_id": 0}).sort("order", 1).to_list(100)
    return [Attraction(**item) for item in items]

@api_router.post("/attractions", response_model=Attraction)
async def create_attraction(data: AttractionCreate):
    count = await db.attractions.count_documents({})
    item = Attraction(**data.model_dump(), order=count)
    await db.attractions.insert_one(item.model_dump())
    return item

@api_router.put("/attractions/{attraction_id}", response_model=Attraction)
async def update_attraction(attraction_id: str, data: AttractionUpdate):
    update_data = {k: v for k, v in data.model_dump().items() if v is not None}
    if not update_data:
        raise HTTPException(status_code=400, detail="No fields to update")
    await db.attractions.update_one({"id": attraction_id}, {"$set": update_data})
    item = await db.attractions.find_one({"id": attraction_id}, {"_id": 0})
    if not item:
        raise HTTPException(status_code=404, detail="Attraction not found")
    return Attraction(**item)

@api_router.delete("/attractions/{attraction_id}")
async def delete_attraction(attraction_id: str):
    result = await db.attractions.delete_one({"id": attraction_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Attraction not found")
    return {"message": "Attraction deleted"}

@api_router.post("/attractions/reorder")
async def reorder_attractions(ids: List[str]):
    for i, aid in enumerate(ids):
        await db.attractions.update_one({"id": aid}, {"$set": {"order": i}})
    return {"message": "Attractions reordered"}

# ===== Content Section Endpoints =====

@api_router.get("/content/{section_type}", response_model=List[ContentItem])
async def get_content(section_type: str):
    if section_type not in CONTENT_TYPES:
        raise HTTPException(status_code=400, detail=f"Invalid section type. Valid types: {CONTENT_TYPES}")
    items = await db.content.find({"section_type": section_type}, {"_id": 0}).sort("order", 1).to_list(100)
    return [ContentItem(**item) for item in items]

@api_router.post("/content/{section_type}", response_model=ContentItem)
async def create_content(section_type: str, data: ContentItemCreate):
    if section_type not in CONTENT_TYPES:
        raise HTTPException(status_code=400, detail=f"Invalid section type. Valid types: {CONTENT_TYPES}")
    count = await db.content.count_documents({"section_type": section_type})
    item = ContentItem(**data.model_dump(), section_type=section_type, order=count)
    await db.content.insert_one(item.model_dump())
    return item

@api_router.put("/content/{section_type}/{item_id}", response_model=ContentItem)
async def update_content(section_type: str, item_id: str, data: ContentItemUpdate):
    update_data = {k: v for k, v in data.model_dump().items() if v is not None}
    if not update_data:
        raise HTTPException(status_code=400, detail="No fields to update")
    await db.content.update_one({"id": item_id, "section_type": section_type}, {"$set": update_data})
    item = await db.content.find_one({"id": item_id, "section_type": section_type}, {"_id": 0})
    if not item:
        raise HTTPException(status_code=404, detail="Content item not found")
    return ContentItem(**item)

@api_router.delete("/content/{section_type}/{item_id}")
async def delete_content(section_type: str, item_id: str):
    result = await db.content.delete_one({"id": item_id, "section_type": section_type})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Content item not found")
    return {"message": "Content item deleted"}

@api_router.post("/content/{section_type}/reorder")
async def reorder_content(section_type: str, ids: List[str]):
    for i, cid in enumerate(ids):
        await db.content.update_one({"id": cid, "section_type": section_type}, {"$set": {"order": i}})
    return {"message": "Content reordered"}

# ===== Local Events Endpoints =====

DEFAULT_EVENTS = [
    {"title": "Clifton Norwegian Heritage Festival", "description": "Annual celebration of Clifton's Norwegian roots with food, music, and crafts", "event_date": "2026-04-18", "start_time": "9:00 AM", "end_time": "5:00 PM", "location": "Downtown Clifton", "address": "100 N Ave D, Clifton, TX 76634", "category": "festival", "featured": True, "enabled": True, "order": 0},
    {"title": "Bosque County Farmers Market", "description": "Fresh local produce, baked goods, and artisan items", "event_date": "2026-04-05", "start_time": "8:00 AM", "end_time": "12:00 PM", "location": "Clifton City Park", "address": "Clifton City Park, TX", "category": "market", "featured": False, "enabled": True, "order": 1},
    {"title": "Live Music at Cliftex Theatre", "description": "Local bands and touring artists performing country and folk music", "event_date": "2026-04-12", "start_time": "7:00 PM", "end_time": "10:00 PM", "location": "Cliftex Theatre", "address": "113 W 5th St, Clifton, TX", "category": "music", "featured": True, "enabled": True, "order": 2},
    {"title": "Spring Trail Hike at Meridian SP", "description": "Guided nature hike through the scenic trails of Meridian State Park", "event_date": "2026-04-20", "start_time": "8:00 AM", "end_time": "11:00 AM", "location": "Meridian State Park", "address": "173 Park Rd 7, Meridian, TX", "category": "outdoor", "featured": False, "enabled": True, "order": 3},
]

def _is_event_expired(event_date_str: str) -> bool:
    if not event_date_str:
        return False
    try:
        event_date = datetime.strptime(event_date_str, "%Y-%m-%d").date()
        today = datetime.now(timezone.utc).date()
        return event_date < today
    except ValueError:
        return False

@api_router.get("/events")
async def get_events(sort_by: str = "upcoming", include_expired: bool = False):
    items = await db.local_events.find({}, {"_id": 0}).sort("order", 1).to_list(200)
    if not items:
        for i, e in enumerate(DEFAULT_EVENTS):
            e["id"] = str(uuid.uuid4())
            e["order"] = i
            e["image_url"] = ""
            e["website"] = ""
            e["phone"] = ""
            e["notes"] = ""
            e["keep_after_expired"] = False
            e["created_at"] = datetime.now(timezone.utc).isoformat()
        await db.local_events.insert_many([dict(e) for e in DEFAULT_EVENTS])
        items = await db.local_events.find({}, {"_id": 0}).sort("order", 1).to_list(200)

    # Add expired status to each event
    for item in items:
        item["is_expired"] = _is_event_expired(item.get("event_date", ""))

    # Filter expired unless include_expired or keep_after_expired
    if not include_expired:
        settings_doc = await db.settings.find_one({"id": "hotel_settings"}, {"_id": 0})
        auto_hide = True
        if settings_doc:
            auto_hide = settings_doc.get("events_auto_hide_expired", True)
        if auto_hide:
            items = [i for i in items if not i["is_expired"] or i.get("keep_after_expired", False)]

    # Sort
    if sort_by == "upcoming":
        items.sort(key=lambda x: x.get("event_date", "9999-12-31"))
    elif sort_by == "newest":
        items.sort(key=lambda x: x.get("created_at", ""), reverse=True)
    elif sort_by == "featured":
        items.sort(key=lambda x: (not x.get("featured", False), x.get("event_date", "9999-12-31")))
    # "custom" uses the existing order

    return items

@api_router.post("/events")
async def create_event(data: LocalEventCreate):
    count = await db.local_events.count_documents({})
    item = LocalEvent(**data.model_dump(), order=count)
    doc = item.model_dump()
    await db.local_events.insert_one(doc)
    doc.pop("_id", None)
    doc["is_expired"] = _is_event_expired(doc.get("event_date", ""))
    return doc

@api_router.put("/events/{event_id}")
async def update_event(event_id: str, data: LocalEventUpdate):
    update_data = {k: v for k, v in data.model_dump().items() if v is not None}
    if not update_data:
        raise HTTPException(status_code=400, detail="No fields to update")
    await db.local_events.update_one({"id": event_id}, {"$set": update_data})
    item = await db.local_events.find_one({"id": event_id}, {"_id": 0})
    if not item:
        raise HTTPException(status_code=404, detail="Event not found")
    item["is_expired"] = _is_event_expired(item.get("event_date", ""))
    return item

@api_router.delete("/events/{event_id}")
async def delete_event(event_id: str):
    result = await db.local_events.delete_one({"id": event_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Event not found")
    return {"message": "Event deleted"}

@api_router.post("/events/reorder")
async def reorder_events(ids: List[str]):
    for i, eid in enumerate(ids):
        await db.local_events.update_one({"id": eid}, {"$set": {"order": i}})
    return {"message": "Events reordered"}

@api_router.post("/events/{event_id}/image")
async def upload_event_image(event_id: str, file: UploadFile = File(...)):
    event = await db.local_events.find_one({"id": event_id}, {"_id": 0})
    if not event:
        raise HTTPException(status_code=404, detail="Event not found")

    ext = Path(file.filename).suffix.lower()
    if ext not in [".jpg", ".jpeg", ".png", ".gif", ".webp"]:
        raise HTTPException(status_code=400, detail="Invalid file type")

    content = await file.read()
    try:
        result = cloudinary.uploader.upload(
            content,
            folder="hotel_lobby/events",
            resource_type="image"
        )
    except Exception as e:
        logger.error(f"Cloudinary event image upload failed: {e}")
        raise HTTPException(status_code=500, detail="Image upload failed")

    image_url = result["secure_url"]
    await db.local_events.update_one(
        {"id": event_id},
        {"$set": {"image_url": image_url, "cloudinary_public_id": result["public_id"]}}
    )
    return {"image_url": image_url}

# ===== Overlay/Announcement Endpoints =====

@api_router.get("/overlays")
async def get_overlays():
    overlays = await db.overlays.find({}, {"_id": 0}).sort("priority", -1).to_list(100)
    return overlays

@api_router.post("/overlays")
async def create_overlay(overlay: OverlayCreate):
    count = await db.overlays.count_documents({})
    doc = Overlay(**overlay.model_dump(), order=count).model_dump()
    await db.overlays.insert_one(doc)
    return {k: v for k, v in doc.items() if k != "_id"}

@api_router.put("/overlays/{overlay_id}")
async def update_overlay(overlay_id: str, update: OverlayUpdate):
    update_data = {k: v for k, v in update.model_dump().items() if v is not None}
    if not update_data:
        raise HTTPException(status_code=400, detail="No fields to update")
    await db.overlays.update_one({"id": overlay_id}, {"$set": update_data})
    doc = await db.overlays.find_one({"id": overlay_id}, {"_id": 0})
    if not doc:
        raise HTTPException(status_code=404, detail="Overlay not found")
    return doc

@api_router.delete("/overlays/{overlay_id}")
async def delete_overlay(overlay_id: str):
    result = await db.overlays.delete_one({"id": overlay_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Overlay not found")
    return {"status": "deleted"}

@api_router.get("/overlays/active")
async def get_active_overlays():
    """Get currently active overlays (enabled and within time range)"""
    now = datetime.now(timezone.utc).isoformat()
    overlays = await db.overlays.find({"enabled": True}, {"_id": 0}).sort("priority", -1).to_list(100)
    active = []
    for o in overlays:
        start = o.get("start_time", "")
        end = o.get("end_time", "")
        if start and start > now:
            continue
        if end and end < now:
            continue
        active.append(o)
    return active

# ===== Video/Commercial Endpoints =====

def _is_video_expired(end_date_str: str) -> bool:
    if not end_date_str:
        return False
    try:
        end_date = datetime.strptime(end_date_str, "%Y-%m-%d").date()
        return end_date < datetime.now(timezone.utc).date()
    except ValueError:
        return False

def _is_video_scheduled(start_date_str: str) -> bool:
    if not start_date_str:
        return False
    try:
        start_date = datetime.strptime(start_date_str, "%Y-%m-%d").date()
        return start_date > datetime.now(timezone.utc).date()
    except ValueError:
        return False

@api_router.get("/videos")
async def get_videos(active_only: bool = False):
    """Get all videos/commercials"""
    items = await db.videos.find({}, {"_id": 0}).sort("order", 1).to_list(200)
    for item in items:
        item["is_expired"] = _is_video_expired(item.get("end_date", ""))
        item["is_scheduled"] = _is_video_scheduled(item.get("start_date", ""))
    if active_only:
        items = [v for v in items if v.get("active") and not v["is_expired"] and not v["is_scheduled"] and v.get("video_url")]
    return items

@api_router.post("/videos")
async def create_video(data: VideoCreate):
    """Create a new video/commercial entry"""
    count = await db.videos.count_documents({})
    item = Video(**data.model_dump(), order=count)
    doc = item.model_dump()
    await db.videos.insert_one(doc)
    doc.pop("_id", None)
    return doc

@api_router.put("/videos/{video_id}")
async def update_video(video_id: str, data: VideoUpdate):
    update_data = {k: v for k, v in data.model_dump().items() if v is not None}
    if not update_data:
        raise HTTPException(status_code=400, detail="No fields to update")
    await db.videos.update_one({"id": video_id}, {"$set": update_data})
    item = await db.videos.find_one({"id": video_id}, {"_id": 0})
    if not item:
        raise HTTPException(status_code=404, detail="Video not found")
    return item

@api_router.delete("/videos/{video_id}")
async def delete_video(video_id: str):
    video = await db.videos.find_one({"id": video_id}, {"_id": 0})
    if not video:
        raise HTTPException(status_code=404, detail="Video not found")
    # Delete video from Cloudinary
    if video.get("video_cloudinary_id"):
        try:
            cloudinary.uploader.destroy(video["video_cloudinary_id"], resource_type="video", invalidate=True)
        except Exception as e:
            logger.error(f"Cloudinary video delete failed: {e}")
    # Delete thumbnail from Cloudinary
    if video.get("thumbnail_cloudinary_id"):
        try:
            cloudinary.uploader.destroy(video["thumbnail_cloudinary_id"], invalidate=True)
        except Exception as e:
            logger.error(f"Cloudinary thumbnail delete failed: {e}")
    await db.videos.delete_one({"id": video_id})
    return {"message": "Video deleted"}

@api_router.post("/videos/{video_id}/upload")
async def upload_video_file(video_id: str, file: UploadFile = File(...)):
    """Upload a video file to Cloudinary for an existing video entry"""
    video = await db.videos.find_one({"id": video_id}, {"_id": 0})
    if not video:
        raise HTTPException(status_code=404, detail="Video not found")

    if not file.content_type or not file.content_type.startswith("video/"):
        raise HTTPException(status_code=400, detail="File must be a video")

    # Delete old video from Cloudinary if replacing
    if video.get("video_cloudinary_id"):
        try:
            cloudinary.uploader.destroy(video["video_cloudinary_id"], resource_type="video", invalidate=True)
        except Exception as e:
            logger.error(f"Old video delete failed: {e}")

    content = await file.read()
    try:
        result = cloudinary.uploader.upload(
            content,
            folder="hotel_lobby/videos",
            resource_type="video",
        )
    except Exception as e:
        logger.error(f"Cloudinary video upload failed: {e}")
        raise HTTPException(status_code=500, detail="Video upload failed")

    await db.videos.update_one(
        {"id": video_id},
        {"$set": {
            "video_url": result["secure_url"],
            "video_cloudinary_id": result["public_id"],
        }}
    )
    return {"video_url": result["secure_url"]}

@api_router.post("/videos/{video_id}/thumbnail")
async def upload_video_thumbnail(video_id: str, file: UploadFile = File(...)):
    """Upload a thumbnail/poster image for a video"""
    video = await db.videos.find_one({"id": video_id}, {"_id": 0})
    if not video:
        raise HTTPException(status_code=404, detail="Video not found")

    if not file.content_type or not file.content_type.startswith("image/"):
        raise HTTPException(status_code=400, detail="File must be an image")

    # Delete old thumbnail if replacing
    if video.get("thumbnail_cloudinary_id"):
        try:
            cloudinary.uploader.destroy(video["thumbnail_cloudinary_id"], invalidate=True)
        except Exception as e:
            logger.error(f"Old thumbnail delete failed: {e}")

    content = await file.read()
    try:
        result = cloudinary.uploader.upload(
            content,
            folder="hotel_lobby/video_thumbnails",
            resource_type="image",
        )
    except Exception as e:
        logger.error(f"Cloudinary thumbnail upload failed: {e}")
        raise HTTPException(status_code=500, detail="Thumbnail upload failed")

    await db.videos.update_one(
        {"id": video_id},
        {"$set": {
            "thumbnail_url": result["secure_url"],
            "thumbnail_cloudinary_id": result["public_id"],
        }}
    )
    return {"thumbnail_url": result["secure_url"]}

@api_router.post("/videos/reorder")
async def reorder_videos(ids: List[str]):
    for i, vid in enumerate(ids):
        await db.videos.update_one({"id": vid}, {"$set": {"order": i}})
    return {"message": "Videos reordered"}

# ===== Health Check =====

@api_router.get("/")
async def root():
    return {"message": "Hotel Lobby Display API", "status": "running"}

@api_router.get("/health")
async def health_check():
    return {
        "status": "healthy",
        "weather_provider": "WeatherAPI.com",
        "weather_api_configured": bool(WEATHERAPI_KEY),
        "news_api_configured": bool(NEWS_API_KEY)
    }

# Include the router in the main app
app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.on_event("startup")
async def startup_seed():
    await seed_admin()


@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()
