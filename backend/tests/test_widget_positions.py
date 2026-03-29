"""
Test widget positions API - verifies the fix for widget overlap bug
Tests center-point positioning system used by both admin canvas and lobby display
"""
import pytest
import requests
import os

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', 'https://luxury-lobby.preview.emergentagent.com')

class TestWidgetPositionsAPI:
    """Test widget_positions field in settings API"""
    
    def test_get_settings_returns_widget_positions(self):
        """GET /api/settings should return widget_positions field"""
        response = requests.get(f"{BASE_URL}/api/settings")
        assert response.status_code == 200
        data = response.json()
        
        # Verify widget_positions exists
        assert "widget_positions" in data, "widget_positions field missing from settings"
        
        # Verify structure
        positions = data["widget_positions"]
        assert isinstance(positions, dict), "widget_positions should be a dict"
        
        # Verify all widget keys exist
        for widget in ["logo", "clock", "weather", "news"]:
            assert widget in positions, f"{widget} missing from widget_positions"
            assert "x" in positions[widget], f"x coordinate missing for {widget}"
            assert "y" in positions[widget], f"y coordinate missing for {widget}"
        
        print(f"Current widget_positions: {positions}")
    
    def test_put_settings_saves_widget_positions(self):
        """PUT /api/settings should save and return widget_positions"""
        # Custom positions for testing
        test_positions = {
            "logo": {"x": 12, "y": 6},
            "clock": {"x": 88, "y": 6},
            "weather": {"x": 12, "y": 94},
            "news": {"x": 88, "y": 94}
        }
        
        response = requests.put(
            f"{BASE_URL}/api/settings",
            json={"widget_positions": test_positions}
        )
        assert response.status_code == 200
        data = response.json()
        
        # Verify positions were saved
        assert "widget_positions" in data
        saved_positions = data["widget_positions"]
        
        for widget in ["logo", "clock", "weather", "news"]:
            assert saved_positions[widget]["x"] == test_positions[widget]["x"]
            assert saved_positions[widget]["y"] == test_positions[widget]["y"]
        
        print(f"Saved widget_positions: {saved_positions}")
    
    def test_widget_positions_persist_after_reload(self):
        """Widget positions should persist after GET"""
        # First set positions
        test_positions = {
            "logo": {"x": 15, "y": 5},
            "clock": {"x": 85, "y": 5},
            "weather": {"x": 15, "y": 90},
            "news": {"x": 85, "y": 90}
        }
        
        put_response = requests.put(
            f"{BASE_URL}/api/settings",
            json={"widget_positions": test_positions}
        )
        assert put_response.status_code == 200
        
        # Then verify with GET
        get_response = requests.get(f"{BASE_URL}/api/settings")
        assert get_response.status_code == 200
        data = get_response.json()
        
        saved_positions = data["widget_positions"]
        for widget in ["logo", "clock", "weather", "news"]:
            assert saved_positions[widget]["x"] == test_positions[widget]["x"]
            assert saved_positions[widget]["y"] == test_positions[widget]["y"]
        
        print("Widget positions persisted correctly")
    
    def test_portrait_default_positions(self):
        """Portrait mode should use corner positions"""
        # Set portrait orientation with default positions
        portrait_defaults = {
            "logo": {"x": 10, "y": 4},
            "clock": {"x": 85, "y": 4},
            "weather": {"x": 10, "y": 92},
            "news": {"x": 85, "y": 92}
        }
        
        response = requests.put(
            f"{BASE_URL}/api/settings",
            json={
                "display_orientation": "portrait",
                "aspect_ratio": "9:16",
                "widget_positions": portrait_defaults
            }
        )
        assert response.status_code == 200
        data = response.json()
        
        assert data["display_orientation"] == "portrait"
        assert data["aspect_ratio"] == "9:16"
        
        # Verify positions are in corners (not center)
        positions = data["widget_positions"]
        assert positions["logo"]["x"] < 20, "Logo should be on left side"
        assert positions["clock"]["x"] > 80, "Clock should be on right side"
        assert positions["weather"]["y"] > 80, "Weather should be at bottom"
        assert positions["news"]["y"] > 80, "News should be at bottom"
        
        print(f"Portrait positions verified: {positions}")
    
    def test_landscape_default_positions(self):
        """Landscape mode should use corner positions"""
        landscape_defaults = {
            "logo": {"x": 5, "y": 5},
            "clock": {"x": 90, "y": 5},
            "weather": {"x": 5, "y": 92},
            "news": {"x": 90, "y": 92}
        }
        
        response = requests.put(
            f"{BASE_URL}/api/settings",
            json={
                "display_orientation": "landscape",
                "aspect_ratio": "16:9",
                "widget_positions": landscape_defaults
            }
        )
        assert response.status_code == 200
        data = response.json()
        
        assert data["display_orientation"] == "landscape"
        assert data["aspect_ratio"] == "16:9"
        
        # Verify positions are in corners
        positions = data["widget_positions"]
        assert positions["logo"]["x"] < 10, "Logo should be on left side"
        assert positions["clock"]["x"] > 85, "Clock should be on right side"
        
        print(f"Landscape positions verified: {positions}")
    
    def test_widget_visibility_settings(self):
        """Widget visibility settings should be saved"""
        visibility = {
            "logo": True,
            "clock": True,
            "weather": True,
            "news": True
        }
        
        response = requests.put(
            f"{BASE_URL}/api/settings",
            json={"widget_visibility": visibility}
        )
        assert response.status_code == 200
        data = response.json()
        
        assert "widget_visibility" in data
        for widget in ["logo", "clock", "weather", "news"]:
            assert data["widget_visibility"][widget] == True
        
        print("Widget visibility settings verified")


class TestOrientationSwitching:
    """Test orientation and aspect ratio switching"""
    
    def test_switch_to_portrait(self):
        """Switching to portrait should update dimensions"""
        response = requests.put(
            f"{BASE_URL}/api/settings",
            json={
                "display_orientation": "portrait",
                "aspect_ratio": "9:16",
                "display_width": 9,
                "display_height": 16
            }
        )
        assert response.status_code == 200
        data = response.json()
        
        assert data["display_orientation"] == "portrait"
        assert data["aspect_ratio"] == "9:16"
        assert data["display_width"] == 9
        assert data["display_height"] == 16
        
        print("Portrait orientation set successfully")
    
    def test_switch_to_landscape(self):
        """Switching to landscape should update dimensions"""
        response = requests.put(
            f"{BASE_URL}/api/settings",
            json={
                "display_orientation": "landscape",
                "aspect_ratio": "16:9",
                "display_width": 16,
                "display_height": 9
            }
        )
        assert response.status_code == 200
        data = response.json()
        
        assert data["display_orientation"] == "landscape"
        assert data["aspect_ratio"] == "16:9"
        assert data["display_width"] == 16
        assert data["display_height"] == 9
        
        print("Landscape orientation set successfully")
    
    def test_custom_aspect_ratio(self):
        """Custom aspect ratio should be saved"""
        response = requests.put(
            f"{BASE_URL}/api/settings",
            json={
                "aspect_ratio": "custom",
                "display_width": 10,
                "display_height": 12
            }
        )
        assert response.status_code == 200
        data = response.json()
        
        assert data["aspect_ratio"] == "custom"
        assert data["display_width"] == 10
        assert data["display_height"] == 12
        
        print("Custom aspect ratio set successfully")


# Cleanup - reset to portrait defaults
@pytest.fixture(scope="module", autouse=True)
def cleanup():
    yield
    # Reset to portrait defaults after all tests
    requests.put(
        f"{BASE_URL}/api/settings",
        json={
            "display_orientation": "portrait",
            "aspect_ratio": "9:16",
            "display_width": 9,
            "display_height": 16,
            "widget_positions": {
                "logo": {"x": 10, "y": 4},
                "clock": {"x": 85, "y": 4},
                "weather": {"x": 10, "y": 92},
                "news": {"x": 85, "y": 92}
            }
        }
    )
    print("Cleanup: Reset to portrait defaults")
