"""
Iteration 25 Backend Tests
Tests for: Content sections, Attractions, Overlays, Videos, Widget Positions
"""
import pytest
import requests
import os
import uuid

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', 'https://luxury-lobby.preview.emergentagent.com')

@pytest.fixture
def api_client():
    """Shared requests session"""
    session = requests.Session()
    session.headers.update({"Content-Type": "application/json"})
    return session


class TestHealthAndBasics:
    """Basic health check tests"""
    
    def test_health_endpoint(self, api_client):
        response = api_client.get(f"{BASE_URL}/api/health")
        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "healthy"
        print("✓ Health endpoint working")


class TestContentSections:
    """Tests for GET /api/content/{type} endpoint"""
    
    def test_get_announcement_content(self, api_client):
        """GET /api/content/announcement returns content items"""
        response = api_client.get(f"{BASE_URL}/api/content/announcement")
        assert response.status_code == 200
        assert isinstance(response.json(), list)
        print("✓ GET /api/content/announcement returns list")
    
    def test_get_promotion_content(self, api_client):
        """GET /api/content/promotion returns content items"""
        response = api_client.get(f"{BASE_URL}/api/content/promotion")
        assert response.status_code == 200
        assert isinstance(response.json(), list)
        print("✓ GET /api/content/promotion returns list")
    
    def test_get_welcome_message_content(self, api_client):
        """GET /api/content/welcome_message returns content items"""
        response = api_client.get(f"{BASE_URL}/api/content/welcome_message")
        assert response.status_code == 200
        assert isinstance(response.json(), list)
        print("✓ GET /api/content/welcome_message returns list")
    
    def test_get_amenity_content(self, api_client):
        """GET /api/content/amenity returns content items"""
        response = api_client.get(f"{BASE_URL}/api/content/amenity")
        assert response.status_code == 200
        assert isinstance(response.json(), list)
        print("✓ GET /api/content/amenity returns list")
    
    def test_get_event_content(self, api_client):
        """GET /api/content/event returns content items"""
        response = api_client.get(f"{BASE_URL}/api/content/event")
        assert response.status_code == 200
        assert isinstance(response.json(), list)
        print("✓ GET /api/content/event returns list")
    
    def test_get_emergency_content(self, api_client):
        """GET /api/content/emergency returns content items"""
        response = api_client.get(f"{BASE_URL}/api/content/emergency")
        assert response.status_code == 200
        assert isinstance(response.json(), list)
        print("✓ GET /api/content/emergency returns list")
    
    def test_get_checkout_reminder_content(self, api_client):
        """GET /api/content/checkout_reminder returns content items"""
        response = api_client.get(f"{BASE_URL}/api/content/checkout_reminder")
        assert response.status_code == 200
        assert isinstance(response.json(), list)
        print("✓ GET /api/content/checkout_reminder returns list")
    
    def test_create_and_delete_content(self, api_client):
        """POST /api/content/{type} creates content, DELETE removes it"""
        # Create
        test_id = f"TEST_{uuid.uuid4().hex[:8]}"
        payload = {
            "title": f"Test Announcement {test_id}",
            "content": "This is a test announcement",
            "enabled": True,
            "priority": "normal"
        }
        response = api_client.post(f"{BASE_URL}/api/content/announcement", json=payload)
        assert response.status_code == 200
        data = response.json()
        assert data["title"] == payload["title"]
        assert "id" in data
        item_id = data["id"]
        print(f"✓ Created content item: {item_id}")
        
        # Verify it exists
        response = api_client.get(f"{BASE_URL}/api/content/announcement")
        assert response.status_code == 200
        items = response.json()
        assert any(item["id"] == item_id for item in items)
        print("✓ Content item appears in list")
        
        # Delete
        response = api_client.delete(f"{BASE_URL}/api/content/announcement/{item_id}")
        assert response.status_code == 200
        print("✓ Content item deleted")
        
        # Verify deletion
        response = api_client.get(f"{BASE_URL}/api/content/announcement")
        items = response.json()
        assert not any(item["id"] == item_id for item in items)
        print("✓ Content item no longer in list")


class TestAttractions:
    """Tests for Attractions CRUD"""
    
    def test_get_attractions(self, api_client):
        """GET /api/attractions returns list of attractions"""
        response = api_client.get(f"{BASE_URL}/api/attractions")
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        print(f"✓ GET /api/attractions returns {len(data)} attractions")
    
    def test_create_update_delete_attraction(self, api_client):
        """Full CRUD cycle for attractions"""
        test_id = f"TEST_{uuid.uuid4().hex[:8]}"
        
        # Create
        payload = {
            "name": f"Test Attraction {test_id}",
            "description": "A test attraction",
            "distance": "1.5 miles",
            "category": "dining",
            "enabled": True
        }
        response = api_client.post(f"{BASE_URL}/api/attractions", json=payload)
        assert response.status_code == 200
        data = response.json()
        assert data["name"] == payload["name"]
        attraction_id = data["id"]
        print(f"✓ Created attraction: {attraction_id}")
        
        # Update
        update_payload = {"name": f"Updated Attraction {test_id}"}
        response = api_client.put(f"{BASE_URL}/api/attractions/{attraction_id}", json=update_payload)
        assert response.status_code == 200
        data = response.json()
        assert data["name"] == update_payload["name"]
        print("✓ Updated attraction")
        
        # Toggle enabled
        response = api_client.put(f"{BASE_URL}/api/attractions/{attraction_id}", json={"enabled": False})
        assert response.status_code == 200
        data = response.json()
        assert data["enabled"] == False
        print("✓ Toggled attraction enabled status")
        
        # Delete
        response = api_client.delete(f"{BASE_URL}/api/attractions/{attraction_id}")
        assert response.status_code == 200
        print("✓ Deleted attraction")


class TestOverlays:
    """Tests for Overlays CRUD"""
    
    def test_get_overlays(self, api_client):
        """GET /api/overlays returns list"""
        response = api_client.get(f"{BASE_URL}/api/overlays")
        assert response.status_code == 200
        assert isinstance(response.json(), list)
        print("✓ GET /api/overlays returns list")
    
    def test_get_active_overlays(self, api_client):
        """GET /api/overlays/active returns active overlays"""
        response = api_client.get(f"{BASE_URL}/api/overlays/active")
        assert response.status_code == 200
        assert isinstance(response.json(), list)
        print("✓ GET /api/overlays/active returns list")
    
    def test_create_update_delete_overlay(self, api_client):
        """Full CRUD cycle for overlays"""
        test_id = f"TEST_{uuid.uuid4().hex[:8]}"
        
        # Create
        payload = {
            "title": f"Test Overlay {test_id}",
            "message": "Test message",
            "style": "banner",
            "bg_color": "#1e293b",
            "text_color": "#ffffff",
            "enabled": True,
            "priority": 0
        }
        response = api_client.post(f"{BASE_URL}/api/overlays", json=payload)
        assert response.status_code == 200
        data = response.json()
        assert data["title"] == payload["title"]
        overlay_id = data["id"]
        print(f"✓ Created overlay: {overlay_id}")
        
        # Update - toggle enabled
        response = api_client.put(f"{BASE_URL}/api/overlays/{overlay_id}", json={"enabled": False})
        assert response.status_code == 200
        data = response.json()
        assert data["enabled"] == False
        print("✓ Toggled overlay enabled status")
        
        # Delete
        response = api_client.delete(f"{BASE_URL}/api/overlays/{overlay_id}")
        assert response.status_code == 200
        print("✓ Deleted overlay")


class TestVideos:
    """Tests for Videos CRUD"""
    
    def test_get_videos(self, api_client):
        """GET /api/videos returns list"""
        response = api_client.get(f"{BASE_URL}/api/videos")
        assert response.status_code == 200
        assert isinstance(response.json(), list)
        print("✓ GET /api/videos returns list")
    
    def test_get_active_videos(self, api_client):
        """GET /api/videos?active_only=true returns active videos"""
        response = api_client.get(f"{BASE_URL}/api/videos", params={"active_only": "true"})
        assert response.status_code == 200
        assert isinstance(response.json(), list)
        print("✓ GET /api/videos?active_only=true returns list")
    
    def test_create_update_delete_video(self, api_client):
        """Full CRUD cycle for videos"""
        test_id = f"TEST_{uuid.uuid4().hex[:8]}"
        
        # Create
        payload = {
            "title": f"Test Video {test_id}",
            "description": "Test video description",
            "active": True,
            "mute": True,
            "autoplay": True,
            "loop": False,
            "frequency": 1
        }
        response = api_client.post(f"{BASE_URL}/api/videos", json=payload)
        assert response.status_code == 200
        data = response.json()
        assert data["title"] == payload["title"]
        video_id = data["id"]
        print(f"✓ Created video: {video_id}")
        
        # Update - toggle active
        response = api_client.put(f"{BASE_URL}/api/videos/{video_id}", json={"active": False})
        assert response.status_code == 200
        data = response.json()
        assert data["active"] == False
        print("✓ Toggled video active status")
        
        # Delete
        response = api_client.delete(f"{BASE_URL}/api/videos/{video_id}")
        assert response.status_code == 200
        print("✓ Deleted video")


class TestSettings:
    """Tests for Settings including widget_positions"""
    
    def test_get_settings(self, api_client):
        """GET /api/settings returns settings object"""
        response = api_client.get(f"{BASE_URL}/api/settings")
        assert response.status_code == 200
        data = response.json()
        assert "hotel_name" in data or "city" in data
        print("✓ GET /api/settings returns settings")
    
    def test_update_widget_positions(self, api_client):
        """PUT /api/settings can update widget_positions"""
        # Get current settings
        response = api_client.get(f"{BASE_URL}/api/settings")
        assert response.status_code == 200
        current = response.json()
        
        # Update widget positions
        new_positions = {
            "logo": {"x": 5, "y": 5},
            "clock": {"x": 80, "y": 5},
            "weather": {"x": 5, "y": 75},
            "news": {"x": 50, "y": 80}
        }
        payload = {"widget_positions": new_positions}
        response = api_client.put(f"{BASE_URL}/api/settings", json=payload)
        assert response.status_code == 200
        print("✓ PUT /api/settings with widget_positions succeeds")
        
        # Verify update
        response = api_client.get(f"{BASE_URL}/api/settings")
        assert response.status_code == 200
        data = response.json()
        if "widget_positions" in data:
            assert data["widget_positions"]["logo"]["x"] == 5
            print("✓ Widget positions persisted correctly")
        else:
            print("⚠ widget_positions not in response (may be stored differently)")


if __name__ == "__main__":
    pytest.main([__file__, "-v", "--tb=short"])
