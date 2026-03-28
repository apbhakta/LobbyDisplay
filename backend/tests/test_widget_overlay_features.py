"""
Backend API tests for widget positioning and overlay features.
Tests:
- GET /api/settings includes widget_positions field
- PUT /api/settings accepts widget_positions updates
- Overlay CRUD: GET /api/overlays, POST /api/overlays, PUT /api/overlays/{id}, DELETE /api/overlays/{id}
- GET /api/overlays/active returns only enabled overlays
"""
import pytest
import requests
import os
import uuid

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', '').rstrip('/')

class TestWidgetPositions:
    """Tests for widget_positions in settings"""
    
    def test_get_settings_includes_widget_positions(self):
        """GET /api/settings should include widget_positions field"""
        response = requests.get(f"{BASE_URL}/api/settings")
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        
        data = response.json()
        assert "widget_positions" in data, "widget_positions field missing from settings"
        
        # Verify structure
        positions = data["widget_positions"]
        assert isinstance(positions, dict), "widget_positions should be a dict"
        
        # Check expected widget keys
        expected_widgets = ["hotel_name", "clock", "weather", "news"]
        for widget in expected_widgets:
            assert widget in positions, f"Missing widget position for: {widget}"
            assert "x" in positions[widget], f"Missing x coordinate for {widget}"
            assert "y" in positions[widget], f"Missing y coordinate for {widget}"
        
        print(f"PASS: widget_positions found with all expected widgets: {list(positions.keys())}")
    
    def test_update_widget_positions(self):
        """PUT /api/settings should accept widget_positions updates"""
        # New positions: move weather to top-center, news to bottom-center
        new_positions = {
            "hotel_name": {"x": 0, "y": 0},
            "clock": {"x": 100, "y": 0},
            "weather": {"x": 50, "y": 0},  # Changed to top-center
            "news": {"x": 50, "y": 100},   # Changed to bottom-center
        }
        
        response = requests.put(f"{BASE_URL}/api/settings", json={
            "widget_positions": new_positions
        })
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        
        data = response.json()
        assert "widget_positions" in data, "widget_positions not in response"
        
        # Verify the update was applied
        assert data["widget_positions"]["weather"]["x"] == 50, "Weather x position not updated"
        assert data["widget_positions"]["weather"]["y"] == 0, "Weather y position not updated"
        assert data["widget_positions"]["news"]["x"] == 50, "News x position not updated"
        assert data["widget_positions"]["news"]["y"] == 100, "News y position not updated"
        
        print("PASS: widget_positions updated successfully")
        
        # Restore default positions
        default_positions = {
            "hotel_name": {"x": 0, "y": 0},
            "clock": {"x": 100, "y": 0},
            "weather": {"x": 0, "y": 100},
            "news": {"x": 100, "y": 100},
        }
        requests.put(f"{BASE_URL}/api/settings", json={"widget_positions": default_positions})
        print("PASS: widget_positions restored to defaults")


class TestOverlayCRUD:
    """Tests for overlay CRUD operations"""
    
    @pytest.fixture
    def test_overlay_id(self):
        """Create a test overlay and return its ID, cleanup after test"""
        overlay_data = {
            "title": f"TEST_Overlay_{uuid.uuid4().hex[:8]}",
            "message": "Test message for automated testing",
            "style": "banner",
            "bg_color": "#1e293b",
            "text_color": "#ffffff",
            "enabled": True,
            "priority": 5
        }
        response = requests.post(f"{BASE_URL}/api/overlays", json=overlay_data)
        assert response.status_code == 200, f"Failed to create test overlay: {response.status_code}"
        overlay_id = response.json()["id"]
        yield overlay_id
        # Cleanup
        requests.delete(f"{BASE_URL}/api/overlays/{overlay_id}")
    
    def test_get_overlays(self):
        """GET /api/overlays should return list of overlays"""
        response = requests.get(f"{BASE_URL}/api/overlays")
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        
        data = response.json()
        assert isinstance(data, list), "Response should be a list"
        print(f"PASS: GET /api/overlays returned {len(data)} overlays")
    
    def test_create_overlay_banner_style(self):
        """POST /api/overlays should create a banner overlay"""
        overlay_data = {
            "title": f"TEST_Banner_{uuid.uuid4().hex[:8]}",
            "message": "Welcome to our hotel!",
            "style": "banner",
            "bg_color": "#2563eb",
            "text_color": "#ffffff",
            "enabled": True,
            "priority": 10
        }
        
        response = requests.post(f"{BASE_URL}/api/overlays", json=overlay_data)
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        
        data = response.json()
        assert "id" in data, "Response should include id"
        assert data["title"] == overlay_data["title"], "Title mismatch"
        assert data["style"] == "banner", "Style should be banner"
        assert data["enabled"] == True, "Should be enabled"
        
        # Verify it appears in GET /api/overlays
        get_response = requests.get(f"{BASE_URL}/api/overlays")
        overlays = get_response.json()
        found = any(o["id"] == data["id"] for o in overlays)
        assert found, "Created overlay not found in GET /api/overlays"
        
        print(f"PASS: Created banner overlay with id: {data['id']}")
        
        # Cleanup
        requests.delete(f"{BASE_URL}/api/overlays/{data['id']}")
        print("PASS: Cleaned up test overlay")
    
    def test_create_overlay_all_styles(self):
        """Test creating overlays with all supported styles"""
        styles = ["banner", "ticker", "corner", "fullscreen"]
        created_ids = []
        
        for style in styles:
            overlay_data = {
                "title": f"TEST_{style}_{uuid.uuid4().hex[:8]}",
                "message": f"Test {style} overlay",
                "style": style,
                "bg_color": "#1e293b",
                "text_color": "#ffffff",
                "enabled": True,
                "priority": 1
            }
            
            response = requests.post(f"{BASE_URL}/api/overlays", json=overlay_data)
            assert response.status_code == 200, f"Failed to create {style} overlay: {response.status_code}"
            
            data = response.json()
            assert data["style"] == style, f"Style mismatch for {style}"
            created_ids.append(data["id"])
            print(f"PASS: Created {style} overlay")
        
        # Cleanup
        for oid in created_ids:
            requests.delete(f"{BASE_URL}/api/overlays/{oid}")
        print("PASS: All overlay styles created and cleaned up")
    
    def test_update_overlay(self, test_overlay_id):
        """PUT /api/overlays/{id} should update an overlay"""
        update_data = {
            "title": "Updated Title",
            "message": "Updated message",
            "enabled": False
        }
        
        response = requests.put(f"{BASE_URL}/api/overlays/{test_overlay_id}", json=update_data)
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        
        data = response.json()
        assert data["title"] == "Updated Title", "Title not updated"
        assert data["message"] == "Updated message", "Message not updated"
        assert data["enabled"] == False, "Enabled status not updated"
        
        # Verify with GET
        get_response = requests.get(f"{BASE_URL}/api/overlays")
        overlays = get_response.json()
        updated = next((o for o in overlays if o["id"] == test_overlay_id), None)
        assert updated is not None, "Updated overlay not found"
        assert updated["title"] == "Updated Title", "Title not persisted"
        
        print("PASS: Overlay updated successfully")
    
    def test_delete_overlay(self):
        """DELETE /api/overlays/{id} should delete an overlay"""
        # Create an overlay to delete
        overlay_data = {
            "title": f"TEST_ToDelete_{uuid.uuid4().hex[:8]}",
            "message": "This will be deleted",
            "style": "banner",
            "enabled": True
        }
        
        create_response = requests.post(f"{BASE_URL}/api/overlays", json=overlay_data)
        assert create_response.status_code == 200
        overlay_id = create_response.json()["id"]
        
        # Delete it
        delete_response = requests.delete(f"{BASE_URL}/api/overlays/{overlay_id}")
        assert delete_response.status_code == 200, f"Expected 200, got {delete_response.status_code}"
        
        # Verify it's gone
        get_response = requests.get(f"{BASE_URL}/api/overlays")
        overlays = get_response.json()
        found = any(o["id"] == overlay_id for o in overlays)
        assert not found, "Deleted overlay still exists"
        
        print("PASS: Overlay deleted successfully")
    
    def test_delete_nonexistent_overlay(self):
        """DELETE /api/overlays/{id} should return 404 for nonexistent overlay"""
        fake_id = f"nonexistent_{uuid.uuid4().hex}"
        response = requests.delete(f"{BASE_URL}/api/overlays/{fake_id}")
        assert response.status_code == 404, f"Expected 404, got {response.status_code}"
        print("PASS: 404 returned for nonexistent overlay")


class TestActiveOverlays:
    """Tests for GET /api/overlays/active endpoint"""
    
    def test_get_active_overlays_returns_only_enabled(self):
        """GET /api/overlays/active should return only enabled overlays"""
        # Create one enabled and one disabled overlay
        enabled_overlay = {
            "title": f"TEST_Enabled_{uuid.uuid4().hex[:8]}",
            "message": "This is enabled",
            "style": "banner",
            "enabled": True,
            "priority": 10
        }
        disabled_overlay = {
            "title": f"TEST_Disabled_{uuid.uuid4().hex[:8]}",
            "message": "This is disabled",
            "style": "banner",
            "enabled": False,
            "priority": 5
        }
        
        enabled_resp = requests.post(f"{BASE_URL}/api/overlays", json=enabled_overlay)
        disabled_resp = requests.post(f"{BASE_URL}/api/overlays", json=disabled_overlay)
        
        enabled_id = enabled_resp.json()["id"]
        disabled_id = disabled_resp.json()["id"]
        
        try:
            # Get active overlays
            response = requests.get(f"{BASE_URL}/api/overlays/active")
            assert response.status_code == 200, f"Expected 200, got {response.status_code}"
            
            active = response.json()
            assert isinstance(active, list), "Response should be a list"
            
            # Check enabled overlay is in active list
            enabled_found = any(o["id"] == enabled_id for o in active)
            assert enabled_found, "Enabled overlay should be in active list"
            
            # Check disabled overlay is NOT in active list
            disabled_found = any(o["id"] == disabled_id for o in active)
            assert not disabled_found, "Disabled overlay should NOT be in active list"
            
            print("PASS: GET /api/overlays/active returns only enabled overlays")
        finally:
            # Cleanup
            requests.delete(f"{BASE_URL}/api/overlays/{enabled_id}")
            requests.delete(f"{BASE_URL}/api/overlays/{disabled_id}")
    
    def test_toggle_overlay_enabled(self):
        """Test toggling overlay enabled/disabled status"""
        # Create an enabled overlay
        overlay_data = {
            "title": f"TEST_Toggle_{uuid.uuid4().hex[:8]}",
            "message": "Toggle test",
            "style": "corner",
            "enabled": True
        }
        
        create_resp = requests.post(f"{BASE_URL}/api/overlays", json=overlay_data)
        overlay_id = create_resp.json()["id"]
        
        try:
            # Verify it's in active list
            active_resp = requests.get(f"{BASE_URL}/api/overlays/active")
            active = active_resp.json()
            assert any(o["id"] == overlay_id for o in active), "Should be in active list initially"
            
            # Disable it
            requests.put(f"{BASE_URL}/api/overlays/{overlay_id}", json={"enabled": False})
            
            # Verify it's NOT in active list
            active_resp = requests.get(f"{BASE_URL}/api/overlays/active")
            active = active_resp.json()
            assert not any(o["id"] == overlay_id for o in active), "Should NOT be in active list after disabling"
            
            # Re-enable it
            requests.put(f"{BASE_URL}/api/overlays/{overlay_id}", json={"enabled": True})
            
            # Verify it's back in active list
            active_resp = requests.get(f"{BASE_URL}/api/overlays/active")
            active = active_resp.json()
            assert any(o["id"] == overlay_id for o in active), "Should be in active list after re-enabling"
            
            print("PASS: Overlay toggle enabled/disabled works correctly")
        finally:
            requests.delete(f"{BASE_URL}/api/overlays/{overlay_id}")


class TestSettingsPortraitDefaults:
    """Verify portrait 4:3 7.5x10 settings are in place"""
    
    def test_portrait_settings(self):
        """GET /api/settings should return portrait 4:3 defaults"""
        response = requests.get(f"{BASE_URL}/api/settings")
        assert response.status_code == 200
        
        data = response.json()
        assert data.get("aspect_ratio") == "4:3", f"Expected 4:3, got {data.get('aspect_ratio')}"
        assert data.get("display_orientation") == "portrait", f"Expected portrait, got {data.get('display_orientation')}"
        assert data.get("display_width") == 7.5, f"Expected 7.5, got {data.get('display_width')}"
        assert data.get("display_height") == 10.0, f"Expected 10.0, got {data.get('display_height')}"
        
        print("PASS: Portrait 4:3 7.5x10 settings verified")


if __name__ == "__main__":
    pytest.main([__file__, "-v", "--tb=short"])
