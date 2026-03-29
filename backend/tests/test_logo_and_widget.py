"""
Test suite for Logo Upload and Widget Positioning features
- POST /api/settings/logo - Upload logo to Cloudinary
- DELETE /api/settings/logo - Remove logo
- GET /api/settings - Should return logo_url field
- PUT /api/settings - Update widget_positions
"""
import pytest
import requests
import os
import io

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', '').rstrip('/')

class TestLogoEndpoints:
    """Logo upload and delete endpoint tests"""
    
    def test_get_settings_has_logo_url_field(self):
        """GET /api/settings should return logo_url field"""
        response = requests.get(f"{BASE_URL}/api/settings")
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        data = response.json()
        assert "logo_url" in data, "logo_url field should be present in settings"
        print(f"✓ GET /api/settings returns logo_url: '{data['logo_url']}'")
    
    def test_upload_logo_success(self):
        """POST /api/settings/logo should upload logo to Cloudinary"""
        # Create a simple test image (1x1 red pixel PNG)
        png_data = bytes([
            0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A,  # PNG signature
            0x00, 0x00, 0x00, 0x0D, 0x49, 0x48, 0x44, 0x52,  # IHDR chunk
            0x00, 0x00, 0x00, 0x01, 0x00, 0x00, 0x00, 0x01,  # 1x1 dimensions
            0x08, 0x02, 0x00, 0x00, 0x00, 0x90, 0x77, 0x53,
            0xDE, 0x00, 0x00, 0x00, 0x0C, 0x49, 0x44, 0x41,  # IDAT chunk
            0x54, 0x08, 0xD7, 0x63, 0xF8, 0xCF, 0xC0, 0x00,
            0x00, 0x00, 0x03, 0x00, 0x01, 0x00, 0x18, 0xDD,
            0x8D, 0xB4, 0x00, 0x00, 0x00, 0x00, 0x49, 0x45,  # IEND chunk
            0x4E, 0x44, 0xAE, 0x42, 0x60, 0x82
        ])
        
        files = {'file': ('test_logo.png', io.BytesIO(png_data), 'image/png')}
        response = requests.post(f"{BASE_URL}/api/settings/logo", files=files)
        
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        data = response.json()
        assert "logo_url" in data, "Response should contain logo_url"
        assert data["logo_url"].startswith("https://res.cloudinary.com/"), f"Logo URL should be Cloudinary URL, got: {data['logo_url']}"
        print(f"✓ POST /api/settings/logo uploaded successfully: {data['logo_url']}")
        
        # Verify logo_url is now in settings
        settings_response = requests.get(f"{BASE_URL}/api/settings")
        assert settings_response.status_code == 200
        settings_data = settings_response.json()
        assert settings_data["logo_url"] == data["logo_url"], "Settings should have updated logo_url"
        print(f"✓ GET /api/settings confirms logo_url is persisted")
    
    def test_upload_logo_invalid_file_type(self):
        """POST /api/settings/logo with non-image should return 400"""
        files = {'file': ('test.txt', io.BytesIO(b'not an image'), 'text/plain')}
        response = requests.post(f"{BASE_URL}/api/settings/logo", files=files)
        
        assert response.status_code == 400, f"Expected 400 for non-image, got {response.status_code}"
        print(f"✓ POST /api/settings/logo rejects non-image files with 400")
    
    def test_delete_logo_success(self):
        """DELETE /api/settings/logo should remove logo"""
        response = requests.delete(f"{BASE_URL}/api/settings/logo")
        
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        data = response.json()
        assert "message" in data, "Response should contain message"
        print(f"✓ DELETE /api/settings/logo returned: {data}")
        
        # Verify logo_url is now empty in settings
        settings_response = requests.get(f"{BASE_URL}/api/settings")
        assert settings_response.status_code == 200
        settings_data = settings_response.json()
        assert settings_data["logo_url"] == "", f"Settings logo_url should be empty after delete, got: {settings_data['logo_url']}"
        print(f"✓ GET /api/settings confirms logo_url is empty after delete")


class TestWidgetPositioning:
    """Widget positioning endpoint tests"""
    
    def test_get_settings_has_widget_positions(self):
        """GET /api/settings should return widget_positions"""
        response = requests.get(f"{BASE_URL}/api/settings")
        assert response.status_code == 200
        data = response.json()
        assert "widget_positions" in data, "widget_positions field should be present"
        assert isinstance(data["widget_positions"], dict), "widget_positions should be a dict"
        
        # Check expected widget keys
        expected_widgets = ["hotel_name", "clock", "weather", "news"]
        for widget in expected_widgets:
            assert widget in data["widget_positions"], f"widget_positions should have {widget}"
            assert "x" in data["widget_positions"][widget], f"{widget} should have x coordinate"
            assert "y" in data["widget_positions"][widget], f"{widget} should have y coordinate"
        
        print(f"✓ GET /api/settings returns widget_positions: {data['widget_positions']}")
    
    def test_update_widget_positions(self):
        """PUT /api/settings should update widget_positions"""
        new_positions = {
            "hotel_name": {"x": 50, "y": 0},
            "clock": {"x": 100, "y": 0},
            "weather": {"x": 0, "y": 100},
            "news": {"x": 50, "y": 100}
        }
        
        response = requests.put(f"{BASE_URL}/api/settings", json={"widget_positions": new_positions})
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        data = response.json()
        assert data["widget_positions"] == new_positions, f"widget_positions should be updated"
        print(f"✓ PUT /api/settings updated widget_positions successfully")
        
        # Verify persistence
        get_response = requests.get(f"{BASE_URL}/api/settings")
        assert get_response.status_code == 200
        get_data = get_response.json()
        assert get_data["widget_positions"] == new_positions, "widget_positions should persist after GET"
        print(f"✓ GET /api/settings confirms widget_positions persisted")
    
    def test_restore_default_widget_positions(self):
        """Restore default widget positions after test"""
        default_positions = {
            "hotel_name": {"x": 0, "y": 0},
            "clock": {"x": 100, "y": 0},
            "weather": {"x": 0, "y": 100},
            "news": {"x": 100, "y": 100}
        }
        
        response = requests.put(f"{BASE_URL}/api/settings", json={"widget_positions": default_positions})
        assert response.status_code == 200
        print(f"✓ Widget positions restored to defaults")


class TestHealthAndBasics:
    """Basic health check tests"""
    
    def test_health_endpoint(self):
        """GET /api/health should return healthy status"""
        response = requests.get(f"{BASE_URL}/api/health")
        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "healthy"
        print(f"✓ GET /api/health returns healthy")


if __name__ == "__main__":
    pytest.main([__file__, "-v", "--tb=short"])
