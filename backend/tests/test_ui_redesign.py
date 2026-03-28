"""
Test suite for UI Redesign verification
Tests:
1. Backend API endpoints return correct data
2. Code defaults are correct (no Velkommen Inn, no unsplash URLs)
3. Empty states work correctly
"""
import pytest
import requests
import os

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', '').rstrip('/')

class TestBackendAPIs:
    """Test backend API endpoints"""
    
    def test_health_endpoint(self):
        """Test /api/health returns healthy status"""
        response = requests.get(f"{BASE_URL}/api/health")
        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "healthy"
        print("SUCCESS: Health endpoint working")
    
    def test_settings_endpoint(self):
        """Test /api/settings returns settings"""
        response = requests.get(f"{BASE_URL}/api/settings")
        assert response.status_code == 200
        data = response.json()
        assert "hotel_name" in data
        assert "city" in data
        print(f"SUCCESS: Settings endpoint working - hotel_name: '{data['hotel_name']}', city: '{data['city']}'")
    
    def test_attractions_endpoint(self):
        """Test /api/attractions returns attractions list"""
        response = requests.get(f"{BASE_URL}/api/attractions")
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        print(f"SUCCESS: Attractions endpoint working - {len(data)} attractions returned")
    
    def test_events_endpoint(self):
        """Test /api/events returns events list"""
        response = requests.get(f"{BASE_URL}/api/events")
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        print(f"SUCCESS: Events endpoint working - {len(data)} events returned")
    
    def test_news_endpoint(self):
        """Test /api/news returns news headlines"""
        response = requests.get(f"{BASE_URL}/api/news")
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        print(f"SUCCESS: News endpoint working - {len(data)} headlines returned")
    
    def test_weather_endpoint(self):
        """Test /api/weather returns weather data (may be fallback)"""
        response = requests.get(f"{BASE_URL}/api/weather")
        # Weather API may return 401 if key expired, but endpoint should still work
        if response.status_code == 200:
            data = response.json()
            assert "temp" in data
            assert "city" in data
            print(f"SUCCESS: Weather endpoint working - city: '{data['city']}', is_fallback: {data.get('is_fallback', False)}")
        else:
            print(f"INFO: Weather endpoint returned {response.status_code} - API key may be expired")


class TestCodeDefaults:
    """Test that code defaults are correct"""
    
    def test_settings_hotel_name_default_is_empty(self):
        """Verify hotel_name default in code is empty string (not 'Velkommen Inn')"""
        # This tests the code default, not the DB value
        # The Settings model in server.py should have hotel_name: str = ""
        import sys
        sys.path.insert(0, '/app/backend')
        from server import Settings
        
        default_settings = Settings()
        assert default_settings.hotel_name == "", f"Expected empty string, got '{default_settings.hotel_name}'"
        print(f"SUCCESS: Settings.hotel_name default is empty string")
    
    def test_default_images_is_empty(self):
        """Verify DEFAULT_IMAGES is empty list (no stock images)"""
        import sys
        sys.path.insert(0, '/app/backend')
        from server import DEFAULT_IMAGES
        
        assert DEFAULT_IMAGES == [], f"Expected empty list, got {DEFAULT_IMAGES}"
        print("SUCCESS: DEFAULT_IMAGES is empty list")
    
    def test_default_attractions_no_unsplash(self):
        """Verify DEFAULT_ATTRACTIONS have no unsplash URLs"""
        import sys
        sys.path.insert(0, '/app/backend')
        from server import DEFAULT_ATTRACTIONS
        
        for attraction in DEFAULT_ATTRACTIONS:
            image_url = attraction.get("image_url", "")
            assert "unsplash.com" not in image_url, f"Found unsplash URL in attraction: {attraction['name']}"
            assert image_url == "", f"Expected empty image_url, got '{image_url}' for {attraction['name']}"
        print(f"SUCCESS: DEFAULT_ATTRACTIONS have no unsplash URLs ({len(DEFAULT_ATTRACTIONS)} attractions checked)")
    
    def test_default_events_no_unsplash(self):
        """Verify DEFAULT_EVENTS have no unsplash URLs"""
        import sys
        sys.path.insert(0, '/app/backend')
        from server import DEFAULT_EVENTS
        
        for event in DEFAULT_EVENTS:
            image_url = event.get("image_url", "")
            assert "unsplash.com" not in image_url, f"Found unsplash URL in event: {event['title']}"
        print(f"SUCCESS: DEFAULT_EVENTS have no unsplash URLs ({len(DEFAULT_EVENTS)} events checked)")
    
    def test_fallback_headlines_no_velkommen(self):
        """Verify FALLBACK_HEADLINES don't contain 'Velkommen Inn'"""
        import sys
        sys.path.insert(0, '/app/backend')
        from server import FALLBACK_HEADLINES
        
        for headline in FALLBACK_HEADLINES:
            assert "Velkommen Inn" not in headline.get("title", ""), f"Found 'Velkommen Inn' in headline: {headline['title']}"
        print(f"SUCCESS: FALLBACK_HEADLINES don't contain 'Velkommen Inn' ({len(FALLBACK_HEADLINES)} headlines checked)")


class TestEmptyStates:
    """Test empty state handling"""
    
    def test_attractions_empty_state_message(self):
        """Verify LocalAttractionsSlide shows 'Attractions coming soon' when empty"""
        # This is a frontend test - we verify the component code
        import re
        
        with open('/app/frontend/src/components/LocalAttractionsSlide.jsx', 'r') as f:
            content = f.read()
        
        # Check for empty state message
        assert "Attractions coming soon" in content, "Empty state message 'Attractions coming soon' not found"
        
        # Check that FALLBACK_ATTRACTIONS is not defined
        assert "FALLBACK_ATTRACTIONS" not in content, "FALLBACK_ATTRACTIONS should be removed"
        
        print("SUCCESS: LocalAttractionsSlide has correct empty state handling")
    
    def test_events_empty_state_message(self):
        """Verify EventsSlide shows 'Events coming soon' when empty"""
        import re
        
        with open('/app/frontend/src/components/EventsSlide.jsx', 'r') as f:
            content = f.read()
        
        # Check for empty state message
        assert "Events coming soon" in content, "Empty state message 'Events coming soon' not found"
        
        # Check that FALLBACK_EVENTS is not defined
        assert "FALLBACK_EVENTS" not in content, "FALLBACK_EVENTS should be removed"
        
        print("SUCCESS: EventsSlide has correct empty state handling")


class TestNoVelkommenInn:
    """Test that 'Velkommen Inn' text is removed from all display slides"""
    
    def test_lobby_display_no_velkommen(self):
        """Verify LobbyDisplay.jsx doesn't contain 'Velkommen Inn'"""
        with open('/app/frontend/src/pages/LobbyDisplay.jsx', 'r') as f:
            content = f.read()
        
        assert "Velkommen Inn" not in content, "Found 'Velkommen Inn' in LobbyDisplay.jsx"
        print("SUCCESS: LobbyDisplay.jsx doesn't contain 'Velkommen Inn'")
    
    def test_weather_slide_no_velkommen(self):
        """Verify WeatherSlide.jsx doesn't contain 'Velkommen Inn'"""
        with open('/app/frontend/src/components/WeatherSlide.jsx', 'r') as f:
            content = f.read()
        
        assert "Velkommen Inn" not in content, "Found 'Velkommen Inn' in WeatherSlide.jsx"
        print("SUCCESS: WeatherSlide.jsx doesn't contain 'Velkommen Inn'")
    
    def test_admin_panel_no_velkommen(self):
        """Verify AdminPanel.jsx doesn't contain 'Velkommen Inn'"""
        with open('/app/frontend/src/pages/AdminPanel.jsx', 'r') as f:
            content = f.read()
        
        assert "Velkommen Inn" not in content, "Found 'Velkommen Inn' in AdminPanel.jsx"
        print("SUCCESS: AdminPanel.jsx doesn't contain 'Velkommen Inn'")
    
    def test_backend_no_velkommen(self):
        """Verify server.py doesn't contain 'Velkommen Inn'"""
        with open('/app/backend/server.py', 'r') as f:
            content = f.read()
        
        assert "Velkommen Inn" not in content, "Found 'Velkommen Inn' in server.py"
        print("SUCCESS: server.py doesn't contain 'Velkommen Inn'")


class TestNoUnsplashURLs:
    """Test that unsplash.com URLs are removed from code"""
    
    def test_local_attractions_slide_no_unsplash(self):
        """Verify LocalAttractionsSlide.jsx doesn't contain unsplash URLs"""
        with open('/app/frontend/src/components/LocalAttractionsSlide.jsx', 'r') as f:
            content = f.read()
        
        assert "unsplash.com" not in content, "Found unsplash.com URL in LocalAttractionsSlide.jsx"
        print("SUCCESS: LocalAttractionsSlide.jsx doesn't contain unsplash URLs")
    
    def test_events_slide_no_unsplash(self):
        """Verify EventsSlide.jsx doesn't contain unsplash URLs"""
        with open('/app/frontend/src/components/EventsSlide.jsx', 'r') as f:
            content = f.read()
        
        assert "unsplash.com" not in content, "Found unsplash.com URL in EventsSlide.jsx"
        print("SUCCESS: EventsSlide.jsx doesn't contain unsplash URLs")
    
    def test_backend_no_unsplash(self):
        """Verify server.py doesn't contain unsplash URLs"""
        with open('/app/backend/server.py', 'r') as f:
            content = f.read()
        
        assert "unsplash.com" not in content, "Found unsplash.com URL in server.py"
        print("SUCCESS: server.py doesn't contain unsplash URLs")


class TestSeparatedLayout:
    """Test that the separated panel layout is implemented"""
    
    def test_lobby_display_has_separated_layout(self):
        """Verify LobbyDisplay.jsx has separated layout (flex-[68] and flex-[32] for landscape)"""
        with open('/app/frontend/src/pages/LobbyDisplay.jsx', 'r') as f:
            content = f.read()
        
        # Check for landscape layout ratios
        assert "flex-[68]" in content, "Landscape photo area flex-[68] not found"
        assert "flex-[32]" in content, "Landscape info panel flex-[32] not found"
        
        # Check for portrait layout ratios
        assert "flex-[65]" in content, "Portrait photo area flex-[65] not found"
        assert "flex-[35]" in content, "Portrait info panel flex-[35] not found"
        
        print("SUCCESS: LobbyDisplay.jsx has separated layout with correct flex ratios")
    
    def test_admin_panel_shows_separated_layout(self):
        """Verify AdminPanel.jsx shows 'Separated Panel Layout' in Display tab"""
        with open('/app/frontend/src/pages/AdminPanel.jsx', 'r') as f:
            content = f.read()
        
        assert "Separated Panel" in content, "'Separated Panel' text not found in AdminPanel.jsx"
        print("SUCCESS: AdminPanel.jsx shows 'Separated Panel Layout'")


class TestWeatherSlide:
    """Test WeatherSlide shows city name, not hotel name"""
    
    def test_weather_slide_shows_city(self):
        """Verify WeatherSlide shows {weather.city}, Texas"""
        with open('/app/frontend/src/components/WeatherSlide.jsx', 'r') as f:
            content = f.read()
        
        # Should show weather.city, not hotel_name
        assert "weather.city" in content, "weather.city not found in WeatherSlide.jsx"
        assert "hotel_name" not in content, "hotel_name should not be in WeatherSlide.jsx"
        
        print("SUCCESS: WeatherSlide shows weather.city, not hotel_name")


if __name__ == "__main__":
    pytest.main([__file__, "-v", "--tb=short"])
