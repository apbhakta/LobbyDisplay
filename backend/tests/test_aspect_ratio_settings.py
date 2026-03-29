"""
Test suite for aspect ratio and widget overlay settings
Tests the architectural changes:
1. PUT /api/settings with aspect_ratio, display_width, display_height persists correctly
2. GET /api/settings returns updated aspect ratio settings
3. Widget positions persist correctly
"""
import pytest
import requests
import os

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', '').rstrip('/')

class TestAspectRatioSettings:
    """Test aspect ratio and display settings API"""
    
    def test_get_settings_returns_aspect_ratio_fields(self):
        """GET /api/settings should return aspect_ratio, display_width, display_height"""
        response = requests.get(f"{BASE_URL}/api/settings")
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        
        data = response.json()
        # Verify aspect ratio fields exist
        assert "aspect_ratio" in data, "Missing aspect_ratio field"
        assert "display_orientation" in data, "Missing display_orientation field"
        assert "display_width" in data, "Missing display_width field"
        assert "display_height" in data, "Missing display_height field"
        print(f"Current settings: aspect_ratio={data['aspect_ratio']}, orientation={data['display_orientation']}, width={data['display_width']}, height={data['display_height']}")
    
    def test_put_settings_16_9_landscape(self):
        """PUT /api/settings with 16:9 landscape should persist correctly"""
        payload = {
            "aspect_ratio": "16:9",
            "display_orientation": "landscape",
            "display_width": 16,
            "display_height": 9
        }
        response = requests.put(f"{BASE_URL}/api/settings", json=payload)
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        
        data = response.json()
        assert data["aspect_ratio"] == "16:9", f"Expected 16:9, got {data['aspect_ratio']}"
        assert data["display_orientation"] == "landscape", f"Expected landscape, got {data['display_orientation']}"
        assert data["display_width"] == 16, f"Expected 16, got {data['display_width']}"
        assert data["display_height"] == 9, f"Expected 9, got {data['display_height']}"
        print("16:9 landscape settings saved successfully")
    
    def test_verify_16_9_persisted(self):
        """GET /api/settings should return the 16:9 settings we just saved"""
        response = requests.get(f"{BASE_URL}/api/settings")
        assert response.status_code == 200
        
        data = response.json()
        assert data["aspect_ratio"] == "16:9", f"Expected 16:9, got {data['aspect_ratio']}"
        assert data["display_orientation"] == "landscape", f"Expected landscape, got {data['display_orientation']}"
        print("16:9 landscape settings persisted correctly")
    
    def test_put_settings_3_4_portrait(self):
        """PUT /api/settings with 3:4 portrait should persist correctly"""
        payload = {
            "aspect_ratio": "3:4",
            "display_orientation": "portrait",
            "display_width": 7.5,
            "display_height": 10
        }
        response = requests.put(f"{BASE_URL}/api/settings", json=payload)
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        
        data = response.json()
        assert data["aspect_ratio"] == "3:4", f"Expected 3:4, got {data['aspect_ratio']}"
        assert data["display_orientation"] == "portrait", f"Expected portrait, got {data['display_orientation']}"
        assert data["display_width"] == 7.5, f"Expected 7.5, got {data['display_width']}"
        assert data["display_height"] == 10, f"Expected 10, got {data['display_height']}"
        print("3:4 portrait settings saved successfully")
    
    def test_verify_3_4_persisted(self):
        """GET /api/settings should return the 3:4 settings we just saved"""
        response = requests.get(f"{BASE_URL}/api/settings")
        assert response.status_code == 200
        
        data = response.json()
        assert data["aspect_ratio"] == "3:4", f"Expected 3:4, got {data['aspect_ratio']}"
        assert data["display_orientation"] == "portrait", f"Expected portrait, got {data['display_orientation']}"
        print("3:4 portrait settings persisted correctly")


class TestWidgetPositionSettings:
    """Test widget position settings API"""
    
    def test_get_settings_returns_widget_positions(self):
        """GET /api/settings should return widget_positions field"""
        response = requests.get(f"{BASE_URL}/api/settings")
        assert response.status_code == 200
        
        data = response.json()
        assert "widget_positions" in data, "Missing widget_positions field"
        positions = data["widget_positions"]
        print(f"Current widget positions: {positions}")
    
    def test_put_widget_positions(self):
        """PUT /api/settings with widget_positions should persist correctly"""
        payload = {
            "widget_positions": {
                "logo": {"x": 2, "y": 2},
                "clock": {"x": 98, "y": 2},
                "weather": {"x": 2, "y": 98},
                "news": {"x": 98, "y": 98}
            }
        }
        response = requests.put(f"{BASE_URL}/api/settings", json=payload)
        assert response.status_code == 200
        
        data = response.json()
        positions = data["widget_positions"]
        assert positions["logo"]["x"] == 2, f"Expected logo x=2, got {positions['logo']['x']}"
        assert positions["logo"]["y"] == 2, f"Expected logo y=2, got {positions['logo']['y']}"
        assert positions["clock"]["x"] == 98, f"Expected clock x=98, got {positions['clock']['x']}"
        assert positions["clock"]["y"] == 2, f"Expected clock y=2, got {positions['clock']['y']}"
        assert positions["weather"]["x"] == 2, f"Expected weather x=2, got {positions['weather']['x']}"
        assert positions["weather"]["y"] == 98, f"Expected weather y=98, got {positions['weather']['y']}"
        assert positions["news"]["x"] == 98, f"Expected news x=98, got {positions['news']['x']}"
        assert positions["news"]["y"] == 98, f"Expected news y=98, got {positions['news']['y']}"
        print("Widget positions saved successfully: logo(2,2) clock(98,2) weather(2,98) news(98,98)")
    
    def test_verify_widget_positions_persisted(self):
        """GET /api/settings should return the widget positions we just saved"""
        response = requests.get(f"{BASE_URL}/api/settings")
        assert response.status_code == 200
        
        data = response.json()
        positions = data["widget_positions"]
        assert positions["logo"]["x"] == 2
        assert positions["clock"]["x"] == 98
        assert positions["weather"]["y"] == 98
        assert positions["news"]["y"] == 98
        print("Widget positions persisted correctly")


class TestWidgetVisibilitySettings:
    """Test widget visibility settings API"""
    
    def test_get_settings_returns_widget_visibility(self):
        """GET /api/settings should return widget_visibility field"""
        response = requests.get(f"{BASE_URL}/api/settings")
        assert response.status_code == 200
        
        data = response.json()
        assert "widget_visibility" in data, "Missing widget_visibility field"
        visibility = data["widget_visibility"]
        print(f"Current widget visibility: {visibility}")
    
    def test_put_widget_visibility(self):
        """PUT /api/settings with widget_visibility should persist correctly"""
        payload = {
            "widget_visibility": {
                "logo": True,
                "clock": True,
                "weather": True,
                "news": True
            }
        }
        response = requests.put(f"{BASE_URL}/api/settings", json=payload)
        assert response.status_code == 200
        
        data = response.json()
        visibility = data["widget_visibility"]
        assert visibility["logo"] == True
        assert visibility["clock"] == True
        assert visibility["weather"] == True
        assert visibility["news"] == True
        print("Widget visibility saved successfully: all widgets visible")


class TestAuthLogin:
    """Test admin authentication"""
    
    def test_admin_login(self):
        """POST /api/auth/login with admin credentials should succeed"""
        payload = {
            "email": "admin@lobbydisplay.com",
            "password": "Admin@2026!"
        }
        response = requests.post(f"{BASE_URL}/api/auth/login", json=payload)
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        
        data = response.json()
        assert "token" in data, "Missing token in response"
        assert data["email"] == "admin@lobbydisplay.com"
        print(f"Admin login successful: {data['email']}")
        return data["token"]
    
    def test_admin_login_invalid_password(self):
        """POST /api/auth/login with wrong password should fail"""
        payload = {
            "email": "admin@lobbydisplay.com",
            "password": "wrongpassword"
        }
        response = requests.post(f"{BASE_URL}/api/auth/login", json=payload)
        assert response.status_code == 401, f"Expected 401, got {response.status_code}"
        print("Invalid password correctly rejected")


if __name__ == "__main__":
    pytest.main([__file__, "-v"])
