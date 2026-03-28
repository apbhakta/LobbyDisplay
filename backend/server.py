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
OPENWEATHER_API_KEY = os.environ.get('OPENWEATHER_API_KEY', '')
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
    hotel_name: str = "Velkommen Inn"
    city: str = "Clifton, Texas"
    news_category: str = "general"
    photo_interval: int = 8
    weather_refresh: int = 15
    news_refresh: int = 30
    display_orientation: str = "landscape"  # landscape, portrait, or standard
    display_scale: int = 100  # 50-150 percentage
    display_width: float = 16.0  # width in inches or ratio
    display_height: float = 9.0  # height in inches or ratio

class SettingsUpdate(BaseModel):
    hotel_name: Optional[str] = None
    city: Optional[str] = None
    news_category: Optional[str] = None
    photo_interval: Optional[int] = None
    weather_refresh: Optional[int] = None
    news_refresh: Optional[int] = None
    display_orientation: Optional[str] = None
    display_scale: Optional[int] = None
    display_width: Optional[float] = None
    display_height: Optional[float] = None

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

# ===== Default/Fallback Data =====

DEFAULT_IMAGES = [
    {
        "id": "default_1",
        "filename": "luxury_lobby.jpg",
        "url": "https://images.pexels.com/photos/29649745/pexels-photo-29649745.jpeg",
        "uploaded_at": datetime.now(timezone.utc).isoformat()
    },
    {
        "id": "default_2",
        "filename": "elegant_lobby.jpg",
        "url": "https://images.unsplash.com/photo-1677129667171-92abd8740fa3",
        "uploaded_at": datetime.now(timezone.utc).isoformat()
    },
    {
        "id": "default_3",
        "filename": "luxury_bed.jpg",
        "url": "https://images.unsplash.com/photo-1731336478850-6bce7235e320",
        "uploaded_at": datetime.now(timezone.utc).isoformat()
    },
    {
        "id": "default_4",
        "filename": "hotel_room.jpg",
        "url": "https://images.pexels.com/photos/6466490/pexels-photo-6466490.jpeg",
        "uploaded_at": datetime.now(timezone.utc).isoformat()
    },
    {
        "id": "default_5",
        "filename": "living_room.jpg",
        "url": "https://images.unsplash.com/photo-1720540244592-b4124532b318",
        "uploaded_at": datetime.now(timezone.utc).isoformat()
    }
]

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
    {"title": "Welcome to Velkommen Inn — Where Comfort Meets Elegance", "source": "Hotel News", "url": "#", "is_fallback": True},
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

# ===== Weather Endpoint =====

@api_router.get("/weather", response_model=WeatherData)
async def get_weather(city: Optional[str] = None):
    """Get current weather for the hotel location"""
    global weather_cache
    
    # Get city from settings if not provided
    if not city:
        settings = await db.settings.find_one({"id": "hotel_settings"}, {"_id": 0})
        city = settings.get("city", "Clifton, Texas") if settings else "Clifton, Texas"
    
    # Check cache (15 minute expiry)
    now = datetime.now(timezone.utc)
    if weather_cache["data"] and weather_cache["timestamp"]:
        cache_age = (now - weather_cache["timestamp"]).total_seconds()
        if cache_age < 900:  # 15 minutes
            logger.info("Returning cached weather data")
            return WeatherData(**weather_cache["data"])
    
    # Try to fetch from OpenWeatherMap
    if not OPENWEATHER_API_KEY:
        logger.warning("No OpenWeatherMap API key configured, using fallback")
        fallback = FALLBACK_WEATHER.copy()
        fallback["city"] = city
        return WeatherData(**fallback)
    
    try:
        async with httpx.AsyncClient(timeout=10.0) as client:
            response = await client.get(
                "https://api.openweathermap.org/data/2.5/weather",
                params={
                    "q": city,
                    "appid": OPENWEATHER_API_KEY,
                    "units": "imperial"
                }
            )
            
            if response.status_code == 200:
                data = response.json()
                # Convert Unix timestamps to readable time
                sunrise_ts = data.get("sys", {}).get("sunrise", 0)
                sunset_ts = data.get("sys", {}).get("sunset", 0)
                sunrise_time = datetime.fromtimestamp(sunrise_ts).strftime("%I:%M %p") if sunrise_ts else "6:00 AM"
                sunset_time = datetime.fromtimestamp(sunset_ts).strftime("%I:%M %p") if sunset_ts else "6:00 PM"
                
                weather_data = {
                    "temp": round(data["main"]["temp"]),
                    "temp_min": round(data["main"]["temp_min"]),
                    "temp_max": round(data["main"]["temp_max"]),
                    "condition": data["weather"][0]["description"].title(),
                    "icon": data["weather"][0]["icon"],
                    "city": data["name"],
                    "humidity": data["main"].get("humidity", 50),
                    "wind_speed": round(data.get("wind", {}).get("speed", 0), 1),
                    "visibility": round(data.get("visibility", 10000) / 1000, 1),
                    "sunrise": sunrise_time,
                    "sunset": sunset_time,
                    "uv_index": 5,  # UV index requires separate API call
                    "air_quality": 42,  # Air quality requires separate API call
                    "is_fallback": False
                }
                weather_cache["data"] = weather_data
                weather_cache["timestamp"] = now
                logger.info(f"Weather fetched successfully for {city}")
                return WeatherData(**weather_data)
            else:
                logger.error(f"Weather API error: {response.status_code}")
                raise HTTPException(status_code=response.status_code, detail="Weather API error")
                
    except httpx.RequestError as e:
        logger.error(f"Weather request failed: {e}")
        # Return cached data if available, otherwise fallback
        if weather_cache["data"]:
            weather_cache["data"]["is_fallback"] = True
            return WeatherData(**weather_cache["data"])
        fallback = FALLBACK_WEATHER.copy()
        fallback["city"] = city
        return WeatherData(**fallback)

@api_router.get("/weather/extended", response_model=ExtendedWeatherData)
async def get_extended_weather(city: Optional[str] = None):
    """Get extended weather including forecast"""
    # Get current weather
    current = await get_weather(city)
    
    # Get city from settings if not provided
    if not city:
        settings = await db.settings.find_one({"id": "hotel_settings"}, {"_id": 0})
        city = settings.get("city", "Clifton, Texas") if settings else "Clifton, Texas"
    
    forecast = []
    hourly = []
    
    if not OPENWEATHER_API_KEY:
        # Return fallback forecast
        return ExtendedWeatherData(
            current=current,
            forecast=[ForecastDay(**f) for f in FALLBACK_FORECAST],
            hourly=[]
        )
    
    try:
        async with httpx.AsyncClient(timeout=10.0) as client:
            # Get 5-day forecast
            response = await client.get(
                "https://api.openweathermap.org/data/2.5/forecast",
                params={
                    "q": city,
                    "appid": OPENWEATHER_API_KEY,
                    "units": "imperial"
                }
            )
            
            if response.status_code == 200:
                data = response.json()
                
                # Process hourly data (next 24 hours, every 3 hours)
                for item in data.get("list", [])[:8]:
                    dt = datetime.fromtimestamp(item["dt"])
                    hourly.append({
                        "time": dt.strftime("%I %p"),
                        "temp": round(item["main"]["temp"])
                    })
                
                # Process daily forecast (group by day)
                daily_data = {}
                for item in data.get("list", []):
                    dt = datetime.fromtimestamp(item["dt"])
                    day_name = dt.strftime("%A")
                    if day_name not in daily_data:
                        daily_data[day_name] = {
                            "day": day_name,
                            "temps": [],
                            "condition": item["weather"][0]["description"].title(),
                            "icon": item["weather"][0]["icon"]
                        }
                    daily_data[day_name]["temps"].append(item["main"]["temp"])
                
                # Calculate min/max for each day
                for day_name, day_info in list(daily_data.items())[:7]:
                    forecast.append(ForecastDay(
                        day=day_name,
                        temp_min=round(min(day_info["temps"])),
                        temp_max=round(max(day_info["temps"])),
                        condition=day_info["condition"],
                        icon=day_info["icon"]
                    ))
                    
    except Exception as e:
        logger.error(f"Forecast fetch failed: {e}")
        forecast = [ForecastDay(**f) for f in FALLBACK_FORECAST]
    
    return ExtendedWeatherData(
        current=current,
        forecast=forecast if forecast else [ForecastDay(**f) for f in FALLBACK_FORECAST],
        hourly=hourly
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

# ===== Health Check =====

@api_router.get("/")
async def root():
    return {"message": "Hotel Lobby Display API", "status": "running"}

@api_router.get("/health")
async def health_check():
    return {
        "status": "healthy",
        "weather_api_configured": bool(OPENWEATHER_API_KEY),
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
