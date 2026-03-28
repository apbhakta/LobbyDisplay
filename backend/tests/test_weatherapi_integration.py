"""
Test WeatherAPI.com Integration
Tests the replacement of OpenWeatherMap with WeatherAPI.com
"""
import pytest
import requests
import os
import time

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', '').rstrip('/')

class TestHealthEndpoint:
    """Health endpoint should show WeatherAPI.com as provider"""
    
    def test_health_shows_weatherapi_provider(self):
        """GET /api/health shows weather_provider as 'WeatherAPI.com'"""
        response = requests.get(f"{BASE_URL}/api/health")
        assert response.status_code == 200
        data = response.json()
        assert data["weather_provider"] == "WeatherAPI.com"
        assert data["weather_api_configured"] == True
        print(f"✓ Health endpoint shows WeatherAPI.com provider")


class TestWeatherEndpoint:
    """Test /api/weather endpoint with WeatherAPI.com"""
    
    def test_weather_returns_real_data(self):
        """GET /api/weather returns real weather data (not fallback)"""
        response = requests.get(f"{BASE_URL}/api/weather")
        assert response.status_code == 200
        data = response.json()
        assert data["is_fallback"] == False, "Weather should be real data, not fallback"
        print(f"✓ Weather returns real data (is_fallback=false)")
    
    def test_weather_has_required_fields(self):
        """GET /api/weather returns all required fields"""
        response = requests.get(f"{BASE_URL}/api/weather")
        assert response.status_code == 200
        data = response.json()
        
        required_fields = [
            "temp", "temp_min", "temp_max", "condition", "icon", "city",
            "humidity", "wind_speed", "visibility", "sunrise", "sunset",
            "uv_index", "feels_like", "precipitation"
        ]
        
        for field in required_fields:
            assert field in data, f"Missing required field: {field}"
            print(f"  ✓ Field '{field}' present: {data[field]}")
        
        print(f"✓ All {len(required_fields)} required fields present")
    
    def test_weather_city_is_clifton(self):
        """GET /api/weather returns Clifton as city"""
        response = requests.get(f"{BASE_URL}/api/weather")
        assert response.status_code == 200
        data = response.json()
        assert "Clifton" in data["city"], f"Expected Clifton, got {data['city']}"
        print(f"✓ City is Clifton: {data['city']}")
    
    def test_weather_icon_is_owm_format(self):
        """Weather icon codes are mapped to OWM format (01d/02d/03d/04d/09d/10d/11d/13d/50d pattern)"""
        response = requests.get(f"{BASE_URL}/api/weather")
        assert response.status_code == 200
        data = response.json()
        
        icon = data["icon"]
        # OWM icon format: 2 digits + d/n suffix
        valid_prefixes = ["01", "02", "03", "04", "09", "10", "11", "13", "50"]
        valid_suffixes = ["d", "n"]
        
        assert len(icon) == 3, f"Icon should be 3 chars (e.g., '04d'), got '{icon}'"
        assert icon[:2] in valid_prefixes, f"Icon prefix '{icon[:2]}' not in valid OWM prefixes"
        assert icon[2] in valid_suffixes, f"Icon suffix '{icon[2]}' not in valid OWM suffixes"
        print(f"✓ Icon '{icon}' is valid OWM format")
    
    def test_weather_numeric_fields_are_valid(self):
        """Weather numeric fields have valid values"""
        response = requests.get(f"{BASE_URL}/api/weather")
        assert response.status_code == 200
        data = response.json()
        
        # Temperature should be reasonable (in Fahrenheit)
        assert -50 <= data["temp"] <= 150, f"Temp {data['temp']} out of range"
        assert -50 <= data["temp_min"] <= 150, f"Temp_min {data['temp_min']} out of range"
        assert -50 <= data["temp_max"] <= 150, f"Temp_max {data['temp_max']} out of range"
        assert -50 <= data["feels_like"] <= 150, f"Feels_like {data['feels_like']} out of range"
        
        # Humidity 0-100%
        assert 0 <= data["humidity"] <= 100, f"Humidity {data['humidity']} out of range"
        
        # Wind speed >= 0
        assert data["wind_speed"] >= 0, f"Wind speed {data['wind_speed']} should be >= 0"
        
        # UV index 0-15
        assert 0 <= data["uv_index"] <= 15, f"UV index {data['uv_index']} out of range"
        
        # Precipitation >= 0
        assert data["precipitation"] >= 0, f"Precipitation {data['precipitation']} should be >= 0"
        
        print(f"✓ All numeric fields have valid values")


class TestExtendedWeatherEndpoint:
    """Test /api/weather/extended endpoint"""
    
    def test_extended_weather_returns_current(self):
        """GET /api/weather/extended returns current weather"""
        response = requests.get(f"{BASE_URL}/api/weather/extended")
        assert response.status_code == 200
        data = response.json()
        
        assert "current" in data, "Missing 'current' field"
        assert data["current"]["is_fallback"] == False, "Current weather should not be fallback"
        print(f"✓ Extended weather has current data (is_fallback=false)")
    
    def test_extended_weather_has_forecast_array(self):
        """GET /api/weather/extended returns forecast array"""
        response = requests.get(f"{BASE_URL}/api/weather/extended")
        assert response.status_code == 200
        data = response.json()
        
        assert "forecast" in data, "Missing 'forecast' field"
        assert isinstance(data["forecast"], list), "Forecast should be a list"
        assert len(data["forecast"]) > 0, "Forecast should have at least one day"
        print(f"✓ Extended weather has forecast array with {len(data['forecast'])} days")
    
    def test_extended_weather_forecast_has_required_fields(self):
        """Forecast days have day name, temp_min, temp_max, condition, icon"""
        response = requests.get(f"{BASE_URL}/api/weather/extended")
        assert response.status_code == 200
        data = response.json()
        
        required_fields = ["day", "temp_min", "temp_max", "condition", "icon"]
        
        for i, day in enumerate(data["forecast"]):
            for field in required_fields:
                assert field in day, f"Forecast day {i} missing field: {field}"
            print(f"  ✓ Day {i}: {day['day']} - {day['condition']} ({day['temp_min']}°-{day['temp_max']}°)")
        
        print(f"✓ All forecast days have required fields")
    
    def test_extended_weather_has_hourly_array(self):
        """GET /api/weather/extended returns hourly array"""
        response = requests.get(f"{BASE_URL}/api/weather/extended")
        assert response.status_code == 200
        data = response.json()
        
        assert "hourly" in data, "Missing 'hourly' field"
        assert isinstance(data["hourly"], list), "Hourly should be a list"
        assert len(data["hourly"]) > 0, "Hourly should have entries"
        print(f"✓ Extended weather has hourly array with {len(data['hourly'])} entries")
    
    def test_extended_weather_hourly_has_time_and_temp(self):
        """Hourly entries have time and temp fields"""
        response = requests.get(f"{BASE_URL}/api/weather/extended")
        assert response.status_code == 200
        data = response.json()
        
        for i, hour in enumerate(data["hourly"][:5]):  # Check first 5
            assert "time" in hour, f"Hourly entry {i} missing 'time'"
            assert "temp" in hour, f"Hourly entry {i} missing 'temp'"
            print(f"  ✓ Hour {i}: {hour['time']} - {hour['temp']}°F")
        
        print(f"✓ Hourly entries have time and temp fields")


class TestWeatherCaching:
    """Test weather caching (15-minute TTL)"""
    
    def test_weather_caching_works(self):
        """Second call within 15 min returns cached data"""
        # First call
        response1 = requests.get(f"{BASE_URL}/api/weather")
        assert response1.status_code == 200
        data1 = response1.json()
        
        # Wait a moment
        time.sleep(1)
        
        # Second call (should be cached)
        response2 = requests.get(f"{BASE_URL}/api/weather")
        assert response2.status_code == 200
        data2 = response2.json()
        
        # Both should return same data (cached)
        assert data1["temp"] == data2["temp"], "Cached data should match"
        assert data1["condition"] == data2["condition"], "Cached data should match"
        print(f"✓ Caching works - both calls returned same data")


class TestNoOpenWeatherMapReferences:
    """Verify OpenWeatherMap has been removed"""
    
    def test_env_has_weatherapi_key(self):
        """Backend .env has WEATHERAPI_KEY"""
        env_path = "/app/backend/.env"
        with open(env_path, 'r') as f:
            content = f.read()
        
        assert "WEATHERAPI_KEY" in content, "WEATHERAPI_KEY not found in .env"
        assert "OPENWEATHER_API_KEY" not in content, "OPENWEATHER_API_KEY should be removed from .env"
        print(f"✓ .env has WEATHERAPI_KEY, no OPENWEATHER_API_KEY")
    
    def test_server_uses_weatherapi(self):
        """server.py uses WeatherAPI.com endpoints"""
        server_path = "/app/backend/server.py"
        with open(server_path, 'r') as f:
            content = f.read()
        
        # Should have WeatherAPI.com URL
        assert "api.weatherapi.com" in content, "WeatherAPI.com URL not found in server.py"
        
        # Should NOT have OpenWeatherMap URL (except in comments)
        lines = content.split('\n')
        for i, line in enumerate(lines):
            if "api.openweathermap.org" in line and not line.strip().startswith('#'):
                pytest.fail(f"OpenWeatherMap URL found in server.py line {i+1}: {line}")
        
        print(f"✓ server.py uses WeatherAPI.com, no OpenWeatherMap URLs")


class TestWeatherBackgroundTheme:
    """Test that weather condition maps to correct theme"""
    
    def test_overcast_maps_to_cloudy_icon(self):
        """Overcast condition should map to 04d icon (cloudy)"""
        response = requests.get(f"{BASE_URL}/api/weather")
        assert response.status_code == 200
        data = response.json()
        
        condition = data["condition"].lower()
        icon = data["icon"]
        
        # If condition is overcast, icon should be 04d/04n
        if "overcast" in condition:
            assert icon.startswith("04"), f"Overcast should map to 04x icon, got {icon}"
            print(f"✓ Overcast condition correctly maps to {icon}")
        else:
            print(f"✓ Current condition is '{data['condition']}' with icon {icon}")


if __name__ == "__main__":
    pytest.main([__file__, "-v"])
