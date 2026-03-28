"""
Test portrait 4:3 display settings - iteration 19
Tests backend API returns correct default settings for portrait mode
"""
import pytest
import requests
import os

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', 'https://luxury-lobby.preview.emergentagent.com')

class TestPortraitSettings:
    """Test portrait 4:3 display settings"""
    
    def test_settings_returns_portrait_orientation(self):
        """Settings should return portrait orientation"""
        response = requests.get(f"{BASE_URL}/api/settings")
        assert response.status_code == 200
        data = response.json()
        assert data.get("display_orientation") == "portrait", f"Expected portrait, got {data.get('display_orientation')}"
    
    def test_settings_returns_4_3_aspect_ratio(self):
        """Settings should return 4:3 aspect ratio"""
        response = requests.get(f"{BASE_URL}/api/settings")
        assert response.status_code == 200
        data = response.json()
        assert data.get("aspect_ratio") == "4:3", f"Expected 4:3, got {data.get('aspect_ratio')}"
    
    def test_settings_returns_7_5_width(self):
        """Settings should return 7.5 inch width"""
        response = requests.get(f"{BASE_URL}/api/settings")
        assert response.status_code == 200
        data = response.json()
        assert data.get("display_width") == 7.5, f"Expected 7.5, got {data.get('display_width')}"
    
    def test_settings_returns_10_height(self):
        """Settings should return 10 inch height"""
        response = requests.get(f"{BASE_URL}/api/settings")
        assert response.status_code == 200
        data = response.json()
        assert data.get("display_height") == 10.0, f"Expected 10.0, got {data.get('display_height')}"
    
    def test_settings_all_portrait_values(self):
        """Settings should return all portrait 4:3 7.5x10 values"""
        response = requests.get(f"{BASE_URL}/api/settings")
        assert response.status_code == 200
        data = response.json()
        
        assert data.get("aspect_ratio") == "4:3"
        assert data.get("display_orientation") == "portrait"
        assert data.get("display_width") == 7.5
        assert data.get("display_height") == 10.0


class TestWeatherAPI:
    """Test weather API for forecast data"""
    
    def test_weather_extended_returns_forecast(self):
        """Extended weather should return forecast array"""
        response = requests.get(f"{BASE_URL}/api/weather/extended")
        assert response.status_code == 200
        data = response.json()
        
        assert "forecast" in data
        assert isinstance(data["forecast"], list)
        assert len(data["forecast"]) >= 1, "Should have at least 1 forecast day"
    
    def test_weather_extended_forecast_has_required_fields(self):
        """Forecast days should have required fields"""
        response = requests.get(f"{BASE_URL}/api/weather/extended")
        assert response.status_code == 200
        data = response.json()
        
        for day in data.get("forecast", []):
            assert "day" in day
            assert "temp_min" in day
            assert "temp_max" in day
            assert "condition" in day
            assert "icon" in day
    
    def test_weather_current_has_all_fields(self):
        """Current weather should have all required fields"""
        response = requests.get(f"{BASE_URL}/api/weather")
        assert response.status_code == 200
        data = response.json()
        
        required_fields = ["temp", "temp_min", "temp_max", "condition", "icon", "city", 
                          "humidity", "wind_speed", "visibility", "precipitation"]
        for field in required_fields:
            assert field in data, f"Missing field: {field}"


class TestHealthEndpoint:
    """Test health endpoint"""
    
    def test_health_returns_healthy(self):
        """Health endpoint should return healthy status"""
        response = requests.get(f"{BASE_URL}/api/health")
        assert response.status_code == 200
        data = response.json()
        assert data.get("status") == "healthy"
    
    def test_health_shows_weather_configured(self):
        """Health should show weather API configured"""
        response = requests.get(f"{BASE_URL}/api/health")
        assert response.status_code == 200
        data = response.json()
        assert data.get("weather_api_configured") == True


class TestAttractionsAPI:
    """Test attractions API"""
    
    def test_attractions_returns_list(self):
        """Attractions should return a list"""
        response = requests.get(f"{BASE_URL}/api/attractions")
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
    
    def test_attractions_have_required_fields(self):
        """Attractions should have required fields"""
        response = requests.get(f"{BASE_URL}/api/attractions")
        assert response.status_code == 200
        data = response.json()
        
        if len(data) > 0:
            attraction = data[0]
            assert "id" in attraction
            assert "name" in attraction
            assert "description" in attraction
            assert "category" in attraction


class TestEventsAPI:
    """Test events API"""
    
    def test_events_returns_list(self):
        """Events should return a list"""
        response = requests.get(f"{BASE_URL}/api/events")
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
    
    def test_events_have_required_fields(self):
        """Events should have required fields"""
        response = requests.get(f"{BASE_URL}/api/events")
        assert response.status_code == 200
        data = response.json()
        
        if len(data) > 0:
            event = data[0]
            assert "id" in event
            assert "title" in event
            assert "category" in event
