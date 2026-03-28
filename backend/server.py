from fastapi import FastAPI, APIRouter, UploadFile, File, HTTPException
from fastapi.staticfiles import StaticFiles
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field, ConfigDict
from typing import List, Optional
import uuid
from datetime import datetime, timezone
import httpx
import base64
import aiofiles

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

# Ensure uploads directory exists
UPLOADS_DIR = ROOT_DIR / "uploads"
UPLOADS_DIR.mkdir(exist_ok=True)

# API Keys from environment
WEATHERAPI_KEY = os.environ.get('WEATHERAPI_KEY', '')
NEWS_API_KEY = os.environ.get('NEWS_API_KEY', '')

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

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

class SettingsUpdate(BaseModel):
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

# ===== Default/Fallback Data =====

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
    """Upload a new hotel image"""
    if not file.content_type.startswith("image/"):
        raise HTTPException(status_code=400, detail="File must be an image")
    
    # Generate unique filename
    ext = file.filename.split(".")[-1] if "." in file.filename else "jpg"
    unique_filename = f"{uuid.uuid4()}.{ext}"
    file_path = UPLOADS_DIR / unique_filename
    
    # Save file
    async with aiofiles.open(file_path, 'wb') as f:
        content = await file.read()
        await f.write(content)
    
    # Create image record
    image = HotelImage(
        filename=file.filename,
        url=f"/api/uploads/{unique_filename}"
    )
    
    await db.images.insert_one(image.model_dump())
    return image

@api_router.delete("/images/{image_id}")
async def delete_image(image_id: str):
    """Delete a hotel image"""
    image = await db.images.find_one({"id": image_id}, {"_id": 0})
    if not image:
        raise HTTPException(status_code=404, detail="Image not found")
    
    # Delete file if it exists locally
    if image.get("url", "").startswith("/api/uploads/"):
        filename = image["url"].split("/")[-1]
        file_path = UPLOADS_DIR / filename
        if file_path.exists():
            file_path.unlink()
    
    await db.images.delete_one({"id": image_id})
    return {"message": "Image deleted successfully"}

@api_router.post("/images/reset-defaults")
async def reset_to_defaults():
    """Reset images to default sample images"""
    await db.images.delete_many({})
    return {"message": "Images reset to defaults"}

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

    filename = f"event_{event_id}{ext}"
    filepath = UPLOADS_DIR / filename
    async with aiofiles.open(str(filepath), "wb") as f:
        content = await file.read()
        await f.write(content)

    image_url = f"/api/uploads/{filename}"
    await db.local_events.update_one({"id": event_id}, {"$set": {"image_url": image_url}})
    return {"image_url": image_url}

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

# Mount static files for uploaded images
app.mount("/api/uploads", StaticFiles(directory=str(UPLOADS_DIR)), name="uploads")

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()
