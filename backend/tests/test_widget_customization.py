"""
Test Widget Customization Feature - Iteration 26
Tests for widget visibility, colors, clock styles, glass effect, and clock format
"""
import pytest
import requests
import os

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', '').rstrip('/')

class TestWidgetCustomizationSettings:
    """Test GET/PUT /api/settings for widget customization fields"""
    
    def test_get_settings_returns_widget_customization_fields(self):
        """GET /api/settings should return all widget customization fields"""
        response = requests.get(f"{BASE_URL}/api/settings")
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        
        data = response.json()
        
        # Verify widget_visibility field exists and has correct structure
        assert "widget_visibility" in data, "widget_visibility field missing"
        visibility = data["widget_visibility"]
        assert isinstance(visibility, dict), "widget_visibility should be a dict"
        assert "logo" in visibility, "widget_visibility.logo missing"
        assert "clock" in visibility, "widget_visibility.clock missing"
        assert "weather" in visibility, "widget_visibility.weather missing"
        assert "news" in visibility, "widget_visibility.news missing"
        
        # Verify widget_colors field exists and has correct structure
        assert "widget_colors" in data, "widget_colors field missing"
        colors = data["widget_colors"]
        assert isinstance(colors, dict), "widget_colors should be a dict"
        assert "clock" in colors, "widget_colors.clock missing"
        assert "weather" in colors, "widget_colors.weather missing"
        assert "news" in colors, "widget_colors.news missing"
        
        # Verify clock_style field
        assert "clock_style" in data, "clock_style field missing"
        assert data["clock_style"] in ["digital", "minimal", "large"], f"Invalid clock_style: {data['clock_style']}"
        
        # Verify font_style field
        assert "font_style" in data, "font_style field missing"
        assert data["font_style"] in ["modern", "classic", "mono"], f"Invalid font_style: {data['font_style']}"
        
        # Verify glass_effect field
        assert "glass_effect" in data, "glass_effect field missing"
        assert isinstance(data["glass_effect"], bool), "glass_effect should be boolean"
        
        # Verify clock_format field
        assert "clock_format" in data, "clock_format field missing"
        assert data["clock_format"] in ["12h", "24h"], f"Invalid clock_format: {data['clock_format']}"
        
        print("✓ GET /api/settings returns all widget customization fields")
    
    def test_put_settings_widget_visibility(self):
        """PUT /api/settings should accept and save widget_visibility"""
        # Get current settings
        get_response = requests.get(f"{BASE_URL}/api/settings")
        assert get_response.status_code == 200
        original = get_response.json()
        
        # Update widget_visibility
        new_visibility = {
            "logo": False,
            "clock": True,
            "weather": False,
            "news": True
        }
        
        response = requests.put(f"{BASE_URL}/api/settings", json={
            "widget_visibility": new_visibility
        })
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        
        data = response.json()
        assert data["widget_visibility"]["logo"] == False
        assert data["widget_visibility"]["clock"] == True
        assert data["widget_visibility"]["weather"] == False
        assert data["widget_visibility"]["news"] == True
        
        # Verify persistence with GET
        verify_response = requests.get(f"{BASE_URL}/api/settings")
        verify_data = verify_response.json()
        assert verify_data["widget_visibility"]["logo"] == False
        assert verify_data["widget_visibility"]["weather"] == False
        
        # Restore original
        requests.put(f"{BASE_URL}/api/settings", json={
            "widget_visibility": original.get("widget_visibility", {"logo": True, "clock": True, "weather": True, "news": True})
        })
        
        print("✓ PUT /api/settings accepts and saves widget_visibility")
    
    def test_put_settings_widget_colors(self):
        """PUT /api/settings should accept and save widget_colors"""
        # Get current settings
        get_response = requests.get(f"{BASE_URL}/api/settings")
        original = get_response.json()
        
        # Update widget_colors
        new_colors = {
            "clock": "#ff0000",
            "weather": "#00ff00",
            "news": "#0000ff"
        }
        
        response = requests.put(f"{BASE_URL}/api/settings", json={
            "widget_colors": new_colors
        })
        assert response.status_code == 200
        
        data = response.json()
        assert data["widget_colors"]["clock"] == "#ff0000"
        assert data["widget_colors"]["weather"] == "#00ff00"
        assert data["widget_colors"]["news"] == "#0000ff"
        
        # Verify persistence
        verify_response = requests.get(f"{BASE_URL}/api/settings")
        verify_data = verify_response.json()
        assert verify_data["widget_colors"]["clock"] == "#ff0000"
        
        # Restore original
        requests.put(f"{BASE_URL}/api/settings", json={
            "widget_colors": original.get("widget_colors", {"clock": "#ffffff", "weather": "#ffffff", "news": "#ffffff"})
        })
        
        print("✓ PUT /api/settings accepts and saves widget_colors")
    
    def test_put_settings_clock_style(self):
        """PUT /api/settings should accept and save clock_style"""
        get_response = requests.get(f"{BASE_URL}/api/settings")
        original = get_response.json()
        
        # Test all valid clock styles
        for style in ["digital", "minimal", "large"]:
            response = requests.put(f"{BASE_URL}/api/settings", json={
                "clock_style": style
            })
            assert response.status_code == 200
            assert response.json()["clock_style"] == style
        
        # Restore original
        requests.put(f"{BASE_URL}/api/settings", json={
            "clock_style": original.get("clock_style", "digital")
        })
        
        print("✓ PUT /api/settings accepts and saves clock_style (digital/minimal/large)")
    
    def test_put_settings_font_style(self):
        """PUT /api/settings should accept and save font_style"""
        get_response = requests.get(f"{BASE_URL}/api/settings")
        original = get_response.json()
        
        # Test all valid font styles
        for style in ["modern", "classic", "mono"]:
            response = requests.put(f"{BASE_URL}/api/settings", json={
                "font_style": style
            })
            assert response.status_code == 200
            assert response.json()["font_style"] == style
        
        # Restore original
        requests.put(f"{BASE_URL}/api/settings", json={
            "font_style": original.get("font_style", "modern")
        })
        
        print("✓ PUT /api/settings accepts and saves font_style (modern/classic/mono)")
    
    def test_put_settings_glass_effect(self):
        """PUT /api/settings should accept and save glass_effect"""
        get_response = requests.get(f"{BASE_URL}/api/settings")
        original = get_response.json()
        
        # Test toggling glass_effect
        for value in [False, True]:
            response = requests.put(f"{BASE_URL}/api/settings", json={
                "glass_effect": value
            })
            assert response.status_code == 200
            assert response.json()["glass_effect"] == value
        
        # Restore original
        requests.put(f"{BASE_URL}/api/settings", json={
            "glass_effect": original.get("glass_effect", True)
        })
        
        print("✓ PUT /api/settings accepts and saves glass_effect (true/false)")
    
    def test_put_settings_clock_format(self):
        """PUT /api/settings should accept and save clock_format"""
        get_response = requests.get(f"{BASE_URL}/api/settings")
        original = get_response.json()
        
        # Test both clock formats
        for fmt in ["12h", "24h"]:
            response = requests.put(f"{BASE_URL}/api/settings", json={
                "clock_format": fmt
            })
            assert response.status_code == 200
            assert response.json()["clock_format"] == fmt
        
        # Restore original
        requests.put(f"{BASE_URL}/api/settings", json={
            "clock_format": original.get("clock_format", "12h")
        })
        
        print("✓ PUT /api/settings accepts and saves clock_format (12h/24h)")
    
    def test_put_settings_all_widget_customization_fields(self):
        """PUT /api/settings should accept all widget customization fields at once"""
        get_response = requests.get(f"{BASE_URL}/api/settings")
        original = get_response.json()
        
        # Update all fields at once
        update_data = {
            "widget_visibility": {"logo": False, "clock": True, "weather": True, "news": False},
            "widget_colors": {"clock": "#aabbcc", "weather": "#ddeeff", "news": "#112233"},
            "clock_style": "large",
            "font_style": "mono",
            "glass_effect": False,
            "clock_format": "24h"
        }
        
        response = requests.put(f"{BASE_URL}/api/settings", json=update_data)
        assert response.status_code == 200
        
        data = response.json()
        assert data["widget_visibility"]["logo"] == False
        assert data["widget_visibility"]["news"] == False
        assert data["widget_colors"]["clock"] == "#aabbcc"
        assert data["clock_style"] == "large"
        assert data["font_style"] == "mono"
        assert data["glass_effect"] == False
        assert data["clock_format"] == "24h"
        
        # Restore original
        requests.put(f"{BASE_URL}/api/settings", json={
            "widget_visibility": original.get("widget_visibility"),
            "widget_colors": original.get("widget_colors"),
            "clock_style": original.get("clock_style"),
            "font_style": original.get("font_style"),
            "glass_effect": original.get("glass_effect"),
            "clock_format": original.get("clock_format")
        })
        
        print("✓ PUT /api/settings accepts all widget customization fields at once")


class TestAuthLogin:
    """Test admin login functionality"""
    
    def test_admin_login_success(self):
        """POST /api/auth/login should authenticate admin user"""
        response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": "admin@lobbydisplay.com",
            "password": "Admin@2026!"
        })
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        
        data = response.json()
        assert "token" in data, "token missing from login response"
        assert data["email"] == "admin@lobbydisplay.com"
        assert data["role"] == "admin"
        
        print("✓ Admin login successful with correct credentials")
    
    def test_admin_login_invalid_password(self):
        """POST /api/auth/login should reject invalid password"""
        response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": "admin@lobbydisplay.com",
            "password": "wrongpassword"
        })
        assert response.status_code == 401, f"Expected 401, got {response.status_code}"
        
        print("✓ Admin login rejected with invalid password")


class TestHealthCheck:
    """Basic health check tests"""
    
    def test_health_endpoint(self):
        """GET /api/health should return healthy status"""
        response = requests.get(f"{BASE_URL}/api/health")
        assert response.status_code == 200
        
        data = response.json()
        assert data["status"] == "healthy"
        
        print("✓ Health endpoint returns healthy status")


if __name__ == "__main__":
    pytest.main([__file__, "-v", "--tb=short"])
