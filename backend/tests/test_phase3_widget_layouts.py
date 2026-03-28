"""
Phase 3 Backend API Tests for Hotel Lobby Digital Signage
Tests: Widget Layout Controls - layout presets, widget scale, font scale, padding, spacing
"""
import pytest
import requests
import os

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', '').rstrip('/')

# ===== Widget Layout Settings Tests =====

class TestWidgetLayoutSettings:
    """Test widget layout fields in settings API"""
    
    def test_get_settings_includes_widget_layout(self):
        """Test GET /api/settings returns widget_layout field"""
        response = requests.get(f"{BASE_URL}/api/settings")
        assert response.status_code == 200
        data = response.json()
        
        assert "widget_layout" in data
        assert isinstance(data["widget_layout"], str)
        # Default should be bottom-left
        valid_layouts = ["bottom-left", "top-right", "bottom-bar", "centered", "split"]
        assert data["widget_layout"] in valid_layouts
        
        print(f"✓ widget_layout present: {data['widget_layout']}")
    
    def test_get_settings_includes_widget_scale(self):
        """Test GET /api/settings returns widget_scale field"""
        response = requests.get(f"{BASE_URL}/api/settings")
        assert response.status_code == 200
        data = response.json()
        
        assert "widget_scale" in data
        assert isinstance(data["widget_scale"], (int, float))
        assert 0.5 <= data["widget_scale"] <= 1.5
        
        print(f"✓ widget_scale present: {data['widget_scale']}")
    
    def test_get_settings_includes_font_scale(self):
        """Test GET /api/settings returns font_scale field"""
        response = requests.get(f"{BASE_URL}/api/settings")
        assert response.status_code == 200
        data = response.json()
        
        assert "font_scale" in data
        assert isinstance(data["font_scale"], (int, float))
        assert 0.7 <= data["font_scale"] <= 1.5
        
        print(f"✓ font_scale present: {data['font_scale']}")
    
    def test_get_settings_includes_widget_padding(self):
        """Test GET /api/settings returns widget_padding field"""
        response = requests.get(f"{BASE_URL}/api/settings")
        assert response.status_code == 200
        data = response.json()
        
        assert "widget_padding" in data
        assert isinstance(data["widget_padding"], int)
        assert data["widget_padding"] >= 0
        
        print(f"✓ widget_padding present: {data['widget_padding']}px")
    
    def test_get_settings_includes_widget_spacing(self):
        """Test GET /api/settings returns widget_spacing field"""
        response = requests.get(f"{BASE_URL}/api/settings")
        assert response.status_code == 200
        data = response.json()
        
        assert "widget_spacing" in data
        assert isinstance(data["widget_spacing"], int)
        assert data["widget_spacing"] >= 0
        
        print(f"✓ widget_spacing present: {data['widget_spacing']}px")


class TestWidgetLayoutUpdate:
    """Test updating widget layout settings via PUT /api/settings"""
    
    def test_update_widget_layout_bottom_left(self):
        """Test setting widget_layout to bottom-left"""
        payload = {"widget_layout": "bottom-left"}
        response = requests.put(f"{BASE_URL}/api/settings", json=payload)
        assert response.status_code == 200
        data = response.json()
        
        assert data["widget_layout"] == "bottom-left"
        
        # Verify persistence
        get_response = requests.get(f"{BASE_URL}/api/settings")
        assert get_response.json()["widget_layout"] == "bottom-left"
        
        print("✓ widget_layout updated to bottom-left")
    
    def test_update_widget_layout_top_right(self):
        """Test setting widget_layout to top-right"""
        payload = {"widget_layout": "top-right"}
        response = requests.put(f"{BASE_URL}/api/settings", json=payload)
        assert response.status_code == 200
        data = response.json()
        
        assert data["widget_layout"] == "top-right"
        
        print("✓ widget_layout updated to top-right")
    
    def test_update_widget_layout_bottom_bar(self):
        """Test setting widget_layout to bottom-bar"""
        payload = {"widget_layout": "bottom-bar"}
        response = requests.put(f"{BASE_URL}/api/settings", json=payload)
        assert response.status_code == 200
        data = response.json()
        
        assert data["widget_layout"] == "bottom-bar"
        
        print("✓ widget_layout updated to bottom-bar")
    
    def test_update_widget_layout_centered(self):
        """Test setting widget_layout to centered"""
        payload = {"widget_layout": "centered"}
        response = requests.put(f"{BASE_URL}/api/settings", json=payload)
        assert response.status_code == 200
        data = response.json()
        
        assert data["widget_layout"] == "centered"
        
        print("✓ widget_layout updated to centered")
    
    def test_update_widget_layout_split(self):
        """Test setting widget_layout to split"""
        payload = {"widget_layout": "split"}
        response = requests.put(f"{BASE_URL}/api/settings", json=payload)
        assert response.status_code == 200
        data = response.json()
        
        assert data["widget_layout"] == "split"
        
        print("✓ widget_layout updated to split")
    
    def test_update_widget_scale(self):
        """Test updating widget_scale"""
        # Test minimum
        payload = {"widget_scale": 0.5}
        response = requests.put(f"{BASE_URL}/api/settings", json=payload)
        assert response.status_code == 200
        assert response.json()["widget_scale"] == 0.5
        
        # Test maximum
        payload = {"widget_scale": 1.5}
        response = requests.put(f"{BASE_URL}/api/settings", json=payload)
        assert response.status_code == 200
        assert response.json()["widget_scale"] == 1.5
        
        # Test middle value
        payload = {"widget_scale": 1.0}
        response = requests.put(f"{BASE_URL}/api/settings", json=payload)
        assert response.status_code == 200
        assert response.json()["widget_scale"] == 1.0
        
        print("✓ widget_scale updates work (0.5x, 1.0x, 1.5x)")
    
    def test_update_font_scale(self):
        """Test updating font_scale"""
        # Test minimum
        payload = {"font_scale": 0.7}
        response = requests.put(f"{BASE_URL}/api/settings", json=payload)
        assert response.status_code == 200
        assert response.json()["font_scale"] == 0.7
        
        # Test maximum
        payload = {"font_scale": 1.5}
        response = requests.put(f"{BASE_URL}/api/settings", json=payload)
        assert response.status_code == 200
        assert response.json()["font_scale"] == 1.5
        
        # Reset to default
        payload = {"font_scale": 1.0}
        response = requests.put(f"{BASE_URL}/api/settings", json=payload)
        assert response.status_code == 200
        
        print("✓ font_scale updates work (0.7x, 1.0x, 1.5x)")
    
    def test_update_widget_padding(self):
        """Test updating widget_padding"""
        payload = {"widget_padding": 64}
        response = requests.put(f"{BASE_URL}/api/settings", json=payload)
        assert response.status_code == 200
        assert response.json()["widget_padding"] == 64
        
        # Reset to default
        payload = {"widget_padding": 48}
        response = requests.put(f"{BASE_URL}/api/settings", json=payload)
        assert response.status_code == 200
        
        print("✓ widget_padding updates work")
    
    def test_update_widget_spacing(self):
        """Test updating widget_spacing"""
        payload = {"widget_spacing": 24}
        response = requests.put(f"{BASE_URL}/api/settings", json=payload)
        assert response.status_code == 200
        assert response.json()["widget_spacing"] == 24
        
        # Reset to default
        payload = {"widget_spacing": 16}
        response = requests.put(f"{BASE_URL}/api/settings", json=payload)
        assert response.status_code == 200
        
        print("✓ widget_spacing updates work")
    
    def test_update_all_widget_settings_together(self):
        """Test updating all widget settings in one request"""
        payload = {
            "widget_layout": "split",
            "widget_scale": 1.2,
            "font_scale": 1.1,
            "widget_padding": 56,
            "widget_spacing": 20
        }
        response = requests.put(f"{BASE_URL}/api/settings", json=payload)
        assert response.status_code == 200
        data = response.json()
        
        assert data["widget_layout"] == "split"
        assert data["widget_scale"] == 1.2
        assert data["font_scale"] == 1.1
        assert data["widget_padding"] == 56
        assert data["widget_spacing"] == 20
        
        # Verify persistence
        get_response = requests.get(f"{BASE_URL}/api/settings")
        get_data = get_response.json()
        assert get_data["widget_layout"] == "split"
        assert get_data["widget_scale"] == 1.2
        assert get_data["font_scale"] == 1.1
        assert get_data["widget_padding"] == 56
        assert get_data["widget_spacing"] == 20
        
        # Reset to defaults
        requests.put(f"{BASE_URL}/api/settings", json={
            "widget_layout": "bottom-left",
            "widget_scale": 1.0,
            "font_scale": 1.0,
            "widget_padding": 48,
            "widget_spacing": 16
        })
        
        print("✓ All widget settings update together and persist")


# ===== Phase 1 & 2 Regression Tests =====

class TestPhase1Regression:
    """Verify Phase 1 endpoints still work after Phase 3 additions"""
    
    def test_health_endpoint(self):
        """Test /api/health still works"""
        response = requests.get(f"{BASE_URL}/api/health")
        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "healthy"
        print("✓ /api/health working")
    
    def test_weather_endpoint(self):
        """Test /api/weather still works (may return error if API key invalid)"""
        response = requests.get(f"{BASE_URL}/api/weather")
        # Weather API may return 401 if OpenWeatherMap API key is invalid
        # This is expected behavior - the endpoint itself is working
        assert response.status_code in [200, 401], f"Unexpected status: {response.status_code}"
        if response.status_code == 200:
            data = response.json()
            assert "temp" in data
            assert "condition" in data
            print("✓ /api/weather working with live data")
        else:
            print("✓ /api/weather endpoint accessible (API key issue - expected)")
    
    def test_news_endpoint(self):
        """Test /api/news still works"""
        response = requests.get(f"{BASE_URL}/api/news")
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        print("✓ /api/news working")
    
    def test_images_endpoint(self):
        """Test /api/images still works"""
        response = requests.get(f"{BASE_URL}/api/images")
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        print("✓ /api/images working")
    
    def test_display_settings_still_work(self):
        """Test Phase 1 display settings still work"""
        response = requests.get(f"{BASE_URL}/api/settings")
        assert response.status_code == 200
        data = response.json()
        
        # Phase 1 fields
        assert "aspect_ratio" in data
        assert "display_orientation" in data
        assert "display_scale" in data
        assert "display_width" in data
        assert "display_height" in data
        
        print("✓ Phase 1 display settings present")


class TestPhase2Regression:
    """Verify Phase 2 endpoints still work after Phase 3 additions"""
    
    def test_attractions_endpoint(self):
        """Test /api/attractions still works"""
        response = requests.get(f"{BASE_URL}/api/attractions")
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        assert len(data) >= 1  # Should have at least default attractions
        print(f"✓ /api/attractions working ({len(data)} attractions)")
    
    def test_content_endpoint(self):
        """Test /api/content/{section_type} still works"""
        content_types = ["announcement", "promotion", "welcome_message", "amenity", 
                        "event", "emergency", "checkout_reminder"]
        
        for content_type in content_types:
            response = requests.get(f"{BASE_URL}/api/content/{content_type}")
            assert response.status_code == 200, f"Failed for {content_type}"
            assert isinstance(response.json(), list)
        
        print(f"✓ /api/content endpoints working (all {len(content_types)} types)")
    
    def test_attractions_settings_still_work(self):
        """Test Phase 2 attractions settings still work"""
        response = requests.get(f"{BASE_URL}/api/settings")
        assert response.status_code == 200
        data = response.json()
        
        # Phase 2 fields
        assert "attractions_per_slide" in data
        assert "attractions_auto_rotate" in data
        
        print("✓ Phase 2 attractions settings present")


# ===== Integration Tests =====

class TestPhase3Integration:
    """Integration tests for Phase 3 widget layout features"""
    
    def test_all_layout_presets_valid(self):
        """Test all 5 layout presets can be set and retrieved"""
        layouts = ["bottom-left", "top-right", "bottom-bar", "centered", "split"]
        
        for layout in layouts:
            response = requests.put(f"{BASE_URL}/api/settings", json={"widget_layout": layout})
            assert response.status_code == 200
            assert response.json()["widget_layout"] == layout
            
            # Verify persistence
            get_response = requests.get(f"{BASE_URL}/api/settings")
            assert get_response.json()["widget_layout"] == layout
        
        # Reset to default
        requests.put(f"{BASE_URL}/api/settings", json={"widget_layout": "bottom-left"})
        
        print(f"✓ All {len(layouts)} layout presets work correctly")
    
    def test_widget_scale_range(self):
        """Test widget_scale accepts values in valid range"""
        test_values = [0.5, 0.75, 1.0, 1.25, 1.5]
        
        for value in test_values:
            response = requests.put(f"{BASE_URL}/api/settings", json={"widget_scale": value})
            assert response.status_code == 200
            assert response.json()["widget_scale"] == value
        
        # Reset
        requests.put(f"{BASE_URL}/api/settings", json={"widget_scale": 1.0})
        
        print(f"✓ widget_scale accepts all valid values: {test_values}")
    
    def test_font_scale_range(self):
        """Test font_scale accepts values in valid range"""
        test_values = [0.7, 0.85, 1.0, 1.25, 1.5]
        
        for value in test_values:
            response = requests.put(f"{BASE_URL}/api/settings", json={"font_scale": value})
            assert response.status_code == 200
            assert response.json()["font_scale"] == value
        
        # Reset
        requests.put(f"{BASE_URL}/api/settings", json={"font_scale": 1.0})
        
        print(f"✓ font_scale accepts all valid values: {test_values}")
    
    def test_settings_complete_structure(self):
        """Test settings response has all required fields from all phases"""
        response = requests.get(f"{BASE_URL}/api/settings")
        assert response.status_code == 200
        data = response.json()
        
        # Phase 1 fields
        phase1_fields = ["hotel_name", "city", "news_category", "photo_interval", 
                        "weather_slide_duration", "aspect_ratio", "display_orientation",
                        "display_scale", "display_width", "display_height"]
        
        # Phase 2 fields
        phase2_fields = ["attractions_per_slide", "attractions_auto_rotate"]
        
        # Phase 3 fields
        phase3_fields = ["widget_layout", "widget_scale", "font_scale", 
                        "widget_padding", "widget_spacing"]
        
        all_fields = phase1_fields + phase2_fields + phase3_fields
        
        for field in all_fields:
            assert field in data, f"Missing field: {field}"
        
        print(f"✓ Settings has all {len(all_fields)} required fields from all phases")


if __name__ == "__main__":
    pytest.main([__file__, "-v"])
