"""
Backend API Tests for Hotel Lobby Digital Signage
Tests: Weather, News, Settings, Images endpoints
"""
import pytest
import requests
import os

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', '').rstrip('/')

class TestHealthEndpoints:
    """Health check and root endpoint tests"""
    
    def test_root_endpoint(self):
        """Test root API endpoint returns status"""
        response = requests.get(f"{BASE_URL}/api/")
        assert response.status_code == 200
        data = response.json()
        assert "status" in data
        assert data["status"] == "running"
        print("✓ Root endpoint working")
    
    def test_health_endpoint(self):
        """Test health check endpoint"""
        response = requests.get(f"{BASE_URL}/api/health")
        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "healthy"
        assert "weather_api_configured" in data
        assert "news_api_configured" in data
        assert data["weather_api_configured"] == True
        assert data["news_api_configured"] == True
        print("✓ Health endpoint working with API keys configured")


class TestWeatherEndpoints:
    """Weather API endpoint tests"""
    
    def test_get_weather_basic(self):
        """Test basic weather endpoint returns live data"""
        response = requests.get(f"{BASE_URL}/api/weather")
        assert response.status_code == 200
        data = response.json()
        
        # Verify required fields
        assert "temp" in data
        assert "temp_min" in data
        assert "temp_max" in data
        assert "condition" in data
        assert "icon" in data
        assert "city" in data
        assert "humidity" in data
        assert "wind_speed" in data
        
        # Verify data types
        assert isinstance(data["temp"], (int, float))
        assert isinstance(data["condition"], str)
        assert isinstance(data["icon"], str)
        
        # Verify it's live data (not fallback)
        assert data.get("is_fallback", True) == False
        
        print(f"✓ Weather endpoint working - {data['condition']} at {data['temp']}°F in {data['city']}")
    
    def test_get_weather_extended(self):
        """Test extended weather endpoint with forecast"""
        response = requests.get(f"{BASE_URL}/api/weather/extended")
        assert response.status_code == 200
        data = response.json()
        
        # Verify current weather
        assert "current" in data
        current = data["current"]
        assert "temp" in current
        assert "condition" in current
        assert "icon" in current
        
        # Verify forecast array
        assert "forecast" in data
        forecast = data["forecast"]
        assert isinstance(forecast, list)
        assert len(forecast) >= 1  # At least one forecast day
        
        # Verify forecast structure
        for day in forecast:
            assert "day" in day
            assert "temp_min" in day
            assert "temp_max" in day
            assert "condition" in day
            assert "icon" in day
        
        # Verify hourly data
        assert "hourly" in data
        
        print(f"✓ Extended weather working - {len(forecast)} forecast days")
    
    def test_weather_condition_for_theme(self):
        """Verify weather condition can be used for theme mapping"""
        response = requests.get(f"{BASE_URL}/api/weather")
        assert response.status_code == 200
        data = response.json()
        
        condition = data["condition"].lower()
        icon = data["icon"]
        
        # Verify condition is a valid string for theme mapping
        assert len(condition) > 0
        # Verify icon format (e.g., "03d", "10n")
        assert len(icon) >= 2
        
        print(f"✓ Weather condition '{data['condition']}' with icon '{icon}' suitable for theme mapping")


class TestSettingsEndpoints:
    """Settings API endpoint tests"""
    
    def test_get_settings(self):
        """Test settings endpoint returns correct configuration"""
        response = requests.get(f"{BASE_URL}/api/settings")
        assert response.status_code == 200
        data = response.json()
        
        # Verify required fields
        assert "hotel_name" in data
        assert "city" in data
        assert "photo_interval" in data
        assert "weather_slide_duration" in data
        
        # Verify expected values
        assert data["hotel_name"] == "Velkommen Inn"
        assert "Clifton" in data["city"]
        assert data["photo_interval"] == 8
        assert data["weather_slide_duration"] == 15
        
        print(f"✓ Settings endpoint working - Hotel: {data['hotel_name']}, City: {data['city']}")
    
    def test_settings_display_config(self):
        """Test settings include display configuration"""
        response = requests.get(f"{BASE_URL}/api/settings")
        assert response.status_code == 200
        data = response.json()
        
        assert "display_orientation" in data
        assert "display_scale" in data
        assert "enable_weather_animations" in data
        
        print(f"✓ Display settings present - Orientation: {data['display_orientation']}")


class TestImagesEndpoints:
    """Images API endpoint tests"""
    
    def test_get_images(self):
        """Test images endpoint returns image list"""
        response = requests.get(f"{BASE_URL}/api/images")
        assert response.status_code == 200
        data = response.json()
        
        assert isinstance(data, list)
        assert len(data) >= 1  # At least one image
        
        # Verify image structure
        for img in data:
            assert "id" in img
            assert "filename" in img
            assert "url" in img
            assert "uploaded_at" in img
            # Verify URL is valid
            assert img["url"].startswith("http") or img["url"].startswith("/api/uploads")
        
        print(f"✓ Images endpoint working - {len(data)} images available")
    
    def test_default_images_present(self):
        """Test default hotel images are present"""
        response = requests.get(f"{BASE_URL}/api/images")
        assert response.status_code == 200
        data = response.json()
        
        # Should have 5 default images
        assert len(data) >= 5
        
        # Verify default image IDs
        image_ids = [img["id"] for img in data]
        default_ids = ["default_1", "default_2", "default_3", "default_4", "default_5"]
        for default_id in default_ids:
            assert default_id in image_ids, f"Missing default image: {default_id}"
        
        print("✓ All 5 default hotel images present")


class TestNewsEndpoints:
    """News API endpoint tests"""
    
    def test_get_news(self):
        """Test news endpoint returns headlines"""
        response = requests.get(f"{BASE_URL}/api/news")
        assert response.status_code == 200
        data = response.json()
        
        assert isinstance(data, list)
        assert len(data) >= 1  # At least one headline
        
        # Verify headline structure
        for headline in data:
            assert "title" in headline
            assert "source" in headline
            assert "url" in headline
            assert isinstance(headline["title"], str)
            assert len(headline["title"]) > 0
        
        print(f"✓ News endpoint working - {len(data)} headlines available")
    
    def test_news_is_live(self):
        """Test news is from live API (not fallback)"""
        response = requests.get(f"{BASE_URL}/api/news")
        assert response.status_code == 200
        data = response.json()
        
        # Check if any headline is not fallback
        has_live_news = any(not h.get("is_fallback", True) for h in data)
        assert has_live_news, "All news appears to be fallback data"
        
        print("✓ News is live data from NewsAPI")


class TestSlideIntegration:
    """Integration tests for slide data requirements"""
    
    def test_weather_slide_data_complete(self):
        """Test all data needed for weather slide is available"""
        response = requests.get(f"{BASE_URL}/api/weather/extended")
        assert response.status_code == 200
        data = response.json()
        
        current = data["current"]
        
        # Weather slide needs these fields
        required_fields = ["temp", "temp_min", "temp_max", "condition", "icon", 
                          "city", "humidity", "wind_speed", "visibility"]
        for field in required_fields:
            assert field in current, f"Missing field for weather slide: {field}"
        
        # Forecast needed for 6-day display
        assert len(data["forecast"]) >= 5, "Need at least 5 forecast days for 6-day display"
        
        print("✓ All weather slide data complete")
    
    def test_photo_slide_data_complete(self):
        """Test all data needed for photo slides is available"""
        # Need images
        img_response = requests.get(f"{BASE_URL}/api/images")
        assert img_response.status_code == 200
        images = img_response.json()
        assert len(images) >= 1
        
        # Need weather for overlay
        weather_response = requests.get(f"{BASE_URL}/api/weather")
        assert weather_response.status_code == 200
        
        # Need news for headline
        news_response = requests.get(f"{BASE_URL}/api/news")
        assert news_response.status_code == 200
        
        # Need settings for hotel name
        settings_response = requests.get(f"{BASE_URL}/api/settings")
        assert settings_response.status_code == 200
        
        print("✓ All photo slide data complete")
    
    def test_attractions_events_slide_data(self):
        """Test weather data available for attractions/events slides"""
        response = requests.get(f"{BASE_URL}/api/weather")
        assert response.status_code == 200
        data = response.json()
        
        # These slides need condition and icon for WeatherBackground
        assert "condition" in data
        assert "icon" in data
        
        print("✓ Weather data available for attractions/events slides")


if __name__ == "__main__":
    pytest.main([__file__, "-v"])
