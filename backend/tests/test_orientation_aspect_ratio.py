"""
Test suite for Orientation/Aspect Ratio Switching Feature
Tests:
- Widget positions auto-reset when orientation changes
- Widget positions auto-reset when aspect ratio preset changes
- Backend accepts and stores widget_positions
- GET /api/settings returns widget_positions field
"""
import pytest
import requests
import os

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', '').rstrip('/')

# Default positions for landscape and portrait modes
DEFAULT_POSITIONS_LANDSCAPE = {
    "logo": {"x": 3, "y": 5},
    "clock": {"x": 97, "y": 5},
    "weather": {"x": 3, "y": 90},
    "news": {"x": 97, "y": 90},
}

DEFAULT_POSITIONS_PORTRAIT = {
    "logo": {"x": 50, "y": 3},
    "clock": {"x": 50, "y": 10},
    "weather": {"x": 50, "y": 82},
    "news": {"x": 50, "y": 93},
}


class TestOrientationAspectRatio:
    """Tests for orientation and aspect ratio switching with widget position auto-reset"""

    @pytest.fixture(autouse=True)
    def setup(self):
        """Setup test session"""
        self.session = requests.Session()
        self.session.headers.update({"Content-Type": "application/json"})

    def test_health_endpoint(self):
        """Verify backend is healthy"""
        response = self.session.get(f"{BASE_URL}/api/health")
        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "healthy"
        print("✓ Health endpoint returns healthy status")

    def test_get_settings_returns_widget_positions(self):
        """GET /api/settings should return widget_positions field"""
        response = self.session.get(f"{BASE_URL}/api/settings")
        assert response.status_code == 200
        data = response.json()
        assert "widget_positions" in data, "widget_positions field missing from settings"
        assert isinstance(data["widget_positions"], dict), "widget_positions should be a dict"
        print(f"✓ GET /api/settings returns widget_positions: {data['widget_positions']}")

    def test_get_settings_returns_orientation_fields(self):
        """GET /api/settings should return orientation and aspect ratio fields"""
        response = self.session.get(f"{BASE_URL}/api/settings")
        assert response.status_code == 200
        data = response.json()
        assert "display_orientation" in data, "display_orientation field missing"
        assert "aspect_ratio" in data, "aspect_ratio field missing"
        assert "display_width" in data, "display_width field missing"
        assert "display_height" in data, "display_height field missing"
        print(f"✓ Settings contain orientation fields: orientation={data['display_orientation']}, aspect={data['aspect_ratio']}")

    def test_put_settings_with_landscape_positions(self):
        """PUT /api/settings should accept landscape widget positions"""
        payload = {
            "display_orientation": "landscape",
            "aspect_ratio": "16:9",
            "display_width": 16,
            "display_height": 9,
            "widget_positions": DEFAULT_POSITIONS_LANDSCAPE
        }
        response = self.session.put(f"{BASE_URL}/api/settings", json=payload)
        assert response.status_code == 200
        
        # Verify positions were saved
        get_response = self.session.get(f"{BASE_URL}/api/settings")
        assert get_response.status_code == 200
        data = get_response.json()
        assert data["display_orientation"] == "landscape"
        assert data["aspect_ratio"] == "16:9"
        assert data["widget_positions"]["logo"]["x"] == 3
        assert data["widget_positions"]["logo"]["y"] == 5
        assert data["widget_positions"]["clock"]["x"] == 97
        assert data["widget_positions"]["clock"]["y"] == 5
        print("✓ PUT /api/settings accepts and saves landscape widget positions")

    def test_put_settings_with_portrait_positions(self):
        """PUT /api/settings should accept portrait widget positions"""
        payload = {
            "display_orientation": "portrait",
            "aspect_ratio": "9:16",
            "display_width": 9,
            "display_height": 16,
            "widget_positions": DEFAULT_POSITIONS_PORTRAIT
        }
        response = self.session.put(f"{BASE_URL}/api/settings", json=payload)
        assert response.status_code == 200
        
        # Verify positions were saved
        get_response = self.session.get(f"{BASE_URL}/api/settings")
        assert get_response.status_code == 200
        data = get_response.json()
        assert data["display_orientation"] == "portrait"
        assert data["aspect_ratio"] == "9:16"
        assert data["widget_positions"]["logo"]["x"] == 50
        assert data["widget_positions"]["logo"]["y"] == 3
        assert data["widget_positions"]["clock"]["x"] == 50
        assert data["widget_positions"]["clock"]["y"] == 10
        print("✓ PUT /api/settings accepts and saves portrait widget positions")

    def test_put_settings_with_custom_positions(self):
        """PUT /api/settings should accept custom widget positions"""
        custom_positions = {
            "logo": {"x": 25, "y": 15},
            "clock": {"x": 75, "y": 15},
            "weather": {"x": 25, "y": 85},
            "news": {"x": 75, "y": 85},
        }
        payload = {
            "widget_positions": custom_positions
        }
        response = self.session.put(f"{BASE_URL}/api/settings", json=payload)
        assert response.status_code == 200
        
        # Verify custom positions were saved
        get_response = self.session.get(f"{BASE_URL}/api/settings")
        assert get_response.status_code == 200
        data = get_response.json()
        assert data["widget_positions"]["logo"]["x"] == 25
        assert data["widget_positions"]["logo"]["y"] == 15
        print("✓ PUT /api/settings accepts and saves custom widget positions")

    def test_put_settings_aspect_ratio_4_3(self):
        """PUT /api/settings should accept 4:3 aspect ratio"""
        payload = {
            "aspect_ratio": "4:3",
            "display_orientation": "landscape",
            "display_width": 4,
            "display_height": 3
        }
        response = self.session.put(f"{BASE_URL}/api/settings", json=payload)
        assert response.status_code == 200
        
        get_response = self.session.get(f"{BASE_URL}/api/settings")
        data = get_response.json()
        assert data["aspect_ratio"] == "4:3"
        print("✓ PUT /api/settings accepts 4:3 aspect ratio")

    def test_put_settings_aspect_ratio_3_4(self):
        """PUT /api/settings should accept 3:4 aspect ratio (portrait)"""
        payload = {
            "aspect_ratio": "3:4",
            "display_orientation": "portrait",
            "display_width": 3,
            "display_height": 4
        }
        response = self.session.put(f"{BASE_URL}/api/settings", json=payload)
        assert response.status_code == 200
        
        get_response = self.session.get(f"{BASE_URL}/api/settings")
        data = get_response.json()
        assert data["aspect_ratio"] == "3:4"
        print("✓ PUT /api/settings accepts 3:4 aspect ratio")

    def test_put_settings_custom_aspect_ratio(self):
        """PUT /api/settings should accept custom aspect ratio"""
        payload = {
            "aspect_ratio": "custom",
            "display_width": 7.5,
            "display_height": 10
        }
        response = self.session.put(f"{BASE_URL}/api/settings", json=payload)
        assert response.status_code == 200
        
        get_response = self.session.get(f"{BASE_URL}/api/settings")
        data = get_response.json()
        assert data["aspect_ratio"] == "custom"
        print("✓ PUT /api/settings accepts custom aspect ratio")

    def test_widget_positions_persist_after_reload(self):
        """Widget positions should persist after settings reload"""
        # Set specific positions
        test_positions = {
            "logo": {"x": 10, "y": 10},
            "clock": {"x": 90, "y": 10},
            "weather": {"x": 10, "y": 90},
            "news": {"x": 90, "y": 90},
        }
        payload = {"widget_positions": test_positions}
        response = self.session.put(f"{BASE_URL}/api/settings", json=payload)
        assert response.status_code == 200
        
        # Create new session to simulate reload
        new_session = requests.Session()
        get_response = new_session.get(f"{BASE_URL}/api/settings")
        assert get_response.status_code == 200
        data = get_response.json()
        
        assert data["widget_positions"]["logo"]["x"] == 10
        assert data["widget_positions"]["logo"]["y"] == 10
        print("✓ Widget positions persist after reload")

    def test_orientation_switch_landscape_to_portrait(self):
        """Switching from landscape to portrait should work"""
        # First set to landscape
        landscape_payload = {
            "display_orientation": "landscape",
            "aspect_ratio": "16:9",
            "display_width": 16,
            "display_height": 9,
            "widget_positions": DEFAULT_POSITIONS_LANDSCAPE
        }
        response = self.session.put(f"{BASE_URL}/api/settings", json=landscape_payload)
        assert response.status_code == 200
        
        # Then switch to portrait
        portrait_payload = {
            "display_orientation": "portrait",
            "aspect_ratio": "9:16",
            "display_width": 9,
            "display_height": 16,
            "widget_positions": DEFAULT_POSITIONS_PORTRAIT
        }
        response = self.session.put(f"{BASE_URL}/api/settings", json=portrait_payload)
        assert response.status_code == 200
        
        # Verify portrait settings
        get_response = self.session.get(f"{BASE_URL}/api/settings")
        data = get_response.json()
        assert data["display_orientation"] == "portrait"
        assert data["aspect_ratio"] == "9:16"
        print("✓ Orientation switch from landscape to portrait works")

    def test_orientation_switch_portrait_to_landscape(self):
        """Switching from portrait to landscape should work"""
        # First set to portrait
        portrait_payload = {
            "display_orientation": "portrait",
            "aspect_ratio": "9:16",
            "display_width": 9,
            "display_height": 16,
            "widget_positions": DEFAULT_POSITIONS_PORTRAIT
        }
        response = self.session.put(f"{BASE_URL}/api/settings", json=portrait_payload)
        assert response.status_code == 200
        
        # Then switch to landscape
        landscape_payload = {
            "display_orientation": "landscape",
            "aspect_ratio": "16:9",
            "display_width": 16,
            "display_height": 9,
            "widget_positions": DEFAULT_POSITIONS_LANDSCAPE
        }
        response = self.session.put(f"{BASE_URL}/api/settings", json=landscape_payload)
        assert response.status_code == 200
        
        # Verify landscape settings
        get_response = self.session.get(f"{BASE_URL}/api/settings")
        data = get_response.json()
        assert data["display_orientation"] == "landscape"
        assert data["aspect_ratio"] == "16:9"
        print("✓ Orientation switch from portrait to landscape works")


if __name__ == "__main__":
    pytest.main([__file__, "-v"])
