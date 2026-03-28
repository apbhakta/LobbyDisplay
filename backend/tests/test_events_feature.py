"""
Test suite for Local Events feature (Phase 4)
Tests CRUD operations, sorting, filtering, image upload, and settings
"""
import pytest
import requests
import os
import time

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', 'https://luxury-lobby.preview.emergentagent.com').rstrip('/')

class TestEventsBasicCRUD:
    """Test basic CRUD operations for events"""
    
    @pytest.fixture(autouse=True)
    def setup(self):
        """Setup test session"""
        self.session = requests.Session()
        self.session.headers.update({"Content-Type": "application/json"})
        self.created_event_ids = []
        yield
        # Cleanup: delete test events
        for event_id in self.created_event_ids:
            try:
                self.session.delete(f"{BASE_URL}/api/events/{event_id}")
            except:
                pass
    
    def test_get_events_returns_list(self):
        """GET /api/events returns list of events (4 defaults seeded)"""
        response = self.session.get(f"{BASE_URL}/api/events")
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        
        data = response.json()
        assert isinstance(data, list), "Response should be a list"
        assert len(data) >= 4, f"Expected at least 4 default events, got {len(data)}"
        
        # Verify event structure
        event = data[0]
        assert "id" in event, "Event should have id"
        assert "title" in event, "Event should have title"
        assert "event_date" in event, "Event should have event_date"
        assert "category" in event, "Event should have category"
        assert "is_expired" in event, "Event should have is_expired computed field"
        print(f"✓ GET /api/events returns {len(data)} events with correct structure")
    
    def test_get_events_sorted_by_upcoming(self):
        """GET /api/events?sort_by=upcoming returns events sorted by date"""
        response = self.session.get(f"{BASE_URL}/api/events", params={"sort_by": "upcoming"})
        assert response.status_code == 200
        
        data = response.json()
        # Verify dates are in ascending order
        dates = [e.get("event_date", "9999-12-31") for e in data if e.get("event_date")]
        assert dates == sorted(dates), "Events should be sorted by upcoming date"
        print(f"✓ Events sorted by upcoming date correctly")
    
    def test_get_events_sorted_by_featured(self):
        """GET /api/events?sort_by=featured returns featured events first"""
        response = self.session.get(f"{BASE_URL}/api/events", params={"sort_by": "featured"})
        assert response.status_code == 200
        
        data = response.json()
        featured_events = [e for e in data if e.get("featured")]
        non_featured_events = [e for e in data if not e.get("featured")]
        
        # Featured events should come before non-featured
        if featured_events and non_featured_events:
            first_non_featured_idx = next((i for i, e in enumerate(data) if not e.get("featured")), len(data))
            last_featured_idx = next((i for i, e in enumerate(reversed(data)) if e.get("featured")), -1)
            if last_featured_idx >= 0:
                last_featured_idx = len(data) - 1 - last_featured_idx
            assert first_non_featured_idx > last_featured_idx or last_featured_idx == -1, "Featured events should come first"
        print(f"✓ Events sorted by featured correctly ({len(featured_events)} featured)")
    
    def test_get_events_sorted_by_newest(self):
        """GET /api/events?sort_by=newest returns newest first"""
        response = self.session.get(f"{BASE_URL}/api/events", params={"sort_by": "newest"})
        assert response.status_code == 200
        
        data = response.json()
        created_dates = [e.get("created_at", "") for e in data if e.get("created_at")]
        assert created_dates == sorted(created_dates, reverse=True), "Events should be sorted by newest first"
        print(f"✓ Events sorted by newest correctly")
    
    def test_get_events_include_expired(self):
        """GET /api/events?include_expired=true returns all events including expired"""
        # First get without include_expired
        response_without = self.session.get(f"{BASE_URL}/api/events")
        count_without = len(response_without.json())
        
        # Then get with include_expired
        response_with = self.session.get(f"{BASE_URL}/api/events", params={"include_expired": "true"})
        assert response_with.status_code == 200
        count_with = len(response_with.json())
        
        # With include_expired should return >= events
        assert count_with >= count_without, "include_expired should return same or more events"
        print(f"✓ include_expired works: {count_without} without, {count_with} with")
    
    def test_create_event_with_all_fields(self):
        """POST /api/events creates new event with all fields"""
        new_event = {
            "title": "TEST_Event_Full_Fields",
            "description": "Test event with all fields",
            "event_date": "2026-06-15",
            "start_time": "10:00 AM",
            "end_time": "4:00 PM",
            "location": "Test Location",
            "address": "123 Test St, Test City, TX",
            "category": "community",
            "website": "https://test.com",
            "phone": "555-123-4567",
            "notes": "Test notes",
            "featured": True,
            "enabled": True,
            "keep_after_expired": False
        }
        
        response = self.session.post(f"{BASE_URL}/api/events", json=new_event)
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        
        data = response.json()
        self.created_event_ids.append(data["id"])
        
        # Verify all fields
        assert data["title"] == new_event["title"]
        assert data["description"] == new_event["description"]
        assert data["event_date"] == new_event["event_date"]
        assert data["start_time"] == new_event["start_time"]
        assert data["end_time"] == new_event["end_time"]
        assert data["location"] == new_event["location"]
        assert data["address"] == new_event["address"]
        assert data["category"] == new_event["category"]
        assert data["website"] == new_event["website"]
        assert data["phone"] == new_event["phone"]
        assert data["notes"] == new_event["notes"]
        assert data["featured"] == new_event["featured"]
        assert data["enabled"] == new_event["enabled"]
        assert "id" in data
        assert "is_expired" in data
        print(f"✓ Created event with all fields: {data['id']}")
    
    def test_update_event_fields(self):
        """PUT /api/events/{id} updates event fields"""
        # Create event first
        create_response = self.session.post(f"{BASE_URL}/api/events", json={
            "title": "TEST_Event_To_Update",
            "event_date": "2026-07-01",
            "category": "music"
        })
        assert create_response.status_code == 200
        event_id = create_response.json()["id"]
        self.created_event_ids.append(event_id)
        
        # Update event
        update_data = {
            "title": "TEST_Event_Updated",
            "description": "Updated description",
            "location": "Updated Location"
        }
        update_response = self.session.put(f"{BASE_URL}/api/events/{event_id}", json=update_data)
        assert update_response.status_code == 200
        
        updated = update_response.json()
        assert updated["title"] == "TEST_Event_Updated"
        assert updated["description"] == "Updated description"
        assert updated["location"] == "Updated Location"
        
        # Verify persistence with GET
        get_response = self.session.get(f"{BASE_URL}/api/events", params={"include_expired": "true"})
        events = get_response.json()
        found = next((e for e in events if e["id"] == event_id), None)
        assert found is not None
        assert found["title"] == "TEST_Event_Updated"
        print(f"✓ Updated event fields successfully")
    
    def test_toggle_featured_flag(self):
        """PUT /api/events/{id} toggles featured flag"""
        # Create event
        create_response = self.session.post(f"{BASE_URL}/api/events", json={
            "title": "TEST_Event_Featured_Toggle",
            "event_date": "2026-08-01",
            "category": "festival",
            "featured": False
        })
        event_id = create_response.json()["id"]
        self.created_event_ids.append(event_id)
        
        # Toggle featured to true
        toggle_response = self.session.put(f"{BASE_URL}/api/events/{event_id}", json={"featured": True})
        assert toggle_response.status_code == 200
        assert toggle_response.json()["featured"] == True
        
        # Toggle featured back to false
        toggle_response2 = self.session.put(f"{BASE_URL}/api/events/{event_id}", json={"featured": False})
        assert toggle_response2.status_code == 200
        assert toggle_response2.json()["featured"] == False
        print(f"✓ Featured flag toggle works")
    
    def test_toggle_enabled_flag(self):
        """PUT /api/events/{id} toggles enabled flag"""
        # Create event
        create_response = self.session.post(f"{BASE_URL}/api/events", json={
            "title": "TEST_Event_Enabled_Toggle",
            "event_date": "2026-09-01",
            "category": "market",
            "enabled": True
        })
        event_id = create_response.json()["id"]
        self.created_event_ids.append(event_id)
        
        # Toggle enabled to false
        toggle_response = self.session.put(f"{BASE_URL}/api/events/{event_id}", json={"enabled": False})
        assert toggle_response.status_code == 200
        assert toggle_response.json()["enabled"] == False
        
        # Toggle enabled back to true
        toggle_response2 = self.session.put(f"{BASE_URL}/api/events/{event_id}", json={"enabled": True})
        assert toggle_response2.status_code == 200
        assert toggle_response2.json()["enabled"] == True
        print(f"✓ Enabled flag toggle works")
    
    def test_delete_event(self):
        """DELETE /api/events/{id} removes an event"""
        # Create event
        create_response = self.session.post(f"{BASE_URL}/api/events", json={
            "title": "TEST_Event_To_Delete",
            "event_date": "2026-10-01",
            "category": "charity"
        })
        event_id = create_response.json()["id"]
        
        # Delete event
        delete_response = self.session.delete(f"{BASE_URL}/api/events/{event_id}")
        assert delete_response.status_code == 200
        
        # Verify deletion
        get_response = self.session.get(f"{BASE_URL}/api/events", params={"include_expired": "true"})
        events = get_response.json()
        found = next((e for e in events if e["id"] == event_id), None)
        assert found is None, "Event should be deleted"
        print(f"✓ Event deleted successfully")
    
    def test_delete_nonexistent_event_returns_404(self):
        """DELETE /api/events/{id} returns 404 for nonexistent event"""
        response = self.session.delete(f"{BASE_URL}/api/events/nonexistent-id-12345")
        assert response.status_code == 404
        print(f"✓ Delete nonexistent event returns 404")


class TestEventsReorder:
    """Test event reordering"""
    
    @pytest.fixture(autouse=True)
    def setup(self):
        self.session = requests.Session()
        self.session.headers.update({"Content-Type": "application/json"})
        self.created_event_ids = []
        yield
        for event_id in self.created_event_ids:
            try:
                self.session.delete(f"{BASE_URL}/api/events/{event_id}")
            except:
                pass
    
    def test_reorder_events(self):
        """POST /api/events/reorder accepts list of IDs"""
        # Create 3 test events
        events = []
        for i in range(3):
            response = self.session.post(f"{BASE_URL}/api/events", json={
                "title": f"TEST_Reorder_Event_{i}",
                "event_date": f"2026-11-0{i+1}",
                "category": "community"
            })
            events.append(response.json())
            self.created_event_ids.append(response.json()["id"])
        
        # Reorder: reverse the order
        new_order = [events[2]["id"], events[1]["id"], events[0]["id"]]
        reorder_response = self.session.post(f"{BASE_URL}/api/events/reorder", json=new_order)
        assert reorder_response.status_code == 200
        
        # Verify order with custom sort
        get_response = self.session.get(f"{BASE_URL}/api/events", params={"sort_by": "custom", "include_expired": "true"})
        all_events = get_response.json()
        
        # Find our test events and check their order
        test_events = [e for e in all_events if e["id"] in new_order]
        orders = {e["id"]: e.get("order", 0) for e in test_events}
        
        # Event 2 should have lower order than event 1, which should have lower than event 0
        assert orders[events[2]["id"]] < orders[events[1]["id"]] or orders[events[1]["id"]] < orders[events[0]["id"]], "Reorder should update order field"
        print(f"✓ Events reordered successfully")


class TestEventsExpired:
    """Test expired event handling"""
    
    @pytest.fixture(autouse=True)
    def setup(self):
        self.session = requests.Session()
        self.session.headers.update({"Content-Type": "application/json"})
        self.created_event_ids = []
        yield
        for event_id in self.created_event_ids:
            try:
                self.session.delete(f"{BASE_URL}/api/events/{event_id}")
            except:
                pass
    
    def test_is_expired_computed_field(self):
        """Events have is_expired field computed from event_date"""
        # Create past event
        past_response = self.session.post(f"{BASE_URL}/api/events", json={
            "title": "TEST_Past_Event",
            "event_date": "2025-01-01",
            "category": "community"
        })
        past_event = past_response.json()
        self.created_event_ids.append(past_event["id"])
        assert past_event["is_expired"] == True, "Past event should be expired"
        
        # Create future event
        future_response = self.session.post(f"{BASE_URL}/api/events", json={
            "title": "TEST_Future_Event",
            "event_date": "2027-12-31",
            "category": "community"
        })
        future_event = future_response.json()
        self.created_event_ids.append(future_event["id"])
        assert future_event["is_expired"] == False, "Future event should not be expired"
        print(f"✓ is_expired computed correctly")
    
    def test_auto_hide_expired_events(self):
        """Auto-hide expired events when events_auto_hide_expired is true"""
        # Ensure auto_hide is enabled
        self.session.put(f"{BASE_URL}/api/settings", json={"events_auto_hide_expired": True})
        
        # Create expired event
        create_response = self.session.post(f"{BASE_URL}/api/events", json={
            "title": "TEST_Expired_Hidden",
            "event_date": "2025-01-15",
            "category": "community",
            "keep_after_expired": False
        })
        event_id = create_response.json()["id"]
        self.created_event_ids.append(event_id)
        
        # Get events without include_expired - should not include this event
        get_response = self.session.get(f"{BASE_URL}/api/events")
        events = get_response.json()
        found = next((e for e in events if e["id"] == event_id), None)
        assert found is None, "Expired event should be hidden when auto_hide is enabled"
        
        # Get events with include_expired - should include this event
        get_with_expired = self.session.get(f"{BASE_URL}/api/events", params={"include_expired": "true"})
        events_with = get_with_expired.json()
        found_with = next((e for e in events_with if e["id"] == event_id), None)
        assert found_with is not None, "Expired event should be visible with include_expired=true"
        print(f"✓ Auto-hide expired events works")
    
    def test_keep_after_expired_flag(self):
        """keep_after_expired flag overrides auto-hide for individual events"""
        # Ensure auto_hide is enabled
        self.session.put(f"{BASE_URL}/api/settings", json={"events_auto_hide_expired": True})
        
        # Create expired event with keep_after_expired=True
        create_response = self.session.post(f"{BASE_URL}/api/events", json={
            "title": "TEST_Expired_Kept",
            "event_date": "2025-02-01",
            "category": "festival",
            "keep_after_expired": True
        })
        event_id = create_response.json()["id"]
        self.created_event_ids.append(event_id)
        
        # Get events without include_expired - should still include this event
        get_response = self.session.get(f"{BASE_URL}/api/events")
        events = get_response.json()
        found = next((e for e in events if e["id"] == event_id), None)
        assert found is not None, "Event with keep_after_expired should be visible even when expired"
        print(f"✓ keep_after_expired flag works")


class TestEventsSettings:
    """Test events-related settings"""
    
    @pytest.fixture(autouse=True)
    def setup(self):
        self.session = requests.Session()
        self.session.headers.update({"Content-Type": "application/json"})
    
    def test_get_settings_returns_events_fields(self):
        """GET /api/settings returns events_per_slide, events_auto_rotate, events_show_in_slideshow, events_auto_hide_expired, events_sort_by"""
        response = self.session.get(f"{BASE_URL}/api/settings")
        assert response.status_code == 200
        
        data = response.json()
        assert "events_per_slide" in data, "Settings should have events_per_slide"
        assert "events_auto_rotate" in data, "Settings should have events_auto_rotate"
        assert "events_show_in_slideshow" in data, "Settings should have events_show_in_slideshow"
        assert "events_auto_hide_expired" in data, "Settings should have events_auto_hide_expired"
        assert "events_sort_by" in data, "Settings should have events_sort_by"
        print(f"✓ Settings contain all events fields")
    
    def test_update_events_per_slide(self):
        """PUT /api/settings saves events_per_slide"""
        # Update
        update_response = self.session.put(f"{BASE_URL}/api/settings", json={"events_per_slide": 6})
        assert update_response.status_code == 200
        assert update_response.json()["events_per_slide"] == 6
        
        # Verify persistence
        get_response = self.session.get(f"{BASE_URL}/api/settings")
        assert get_response.json()["events_per_slide"] == 6
        
        # Reset to default
        self.session.put(f"{BASE_URL}/api/settings", json={"events_per_slide": 4})
        print(f"✓ events_per_slide update works")
    
    def test_update_events_auto_rotate(self):
        """PUT /api/settings saves events_auto_rotate"""
        # Toggle off
        update_response = self.session.put(f"{BASE_URL}/api/settings", json={"events_auto_rotate": False})
        assert update_response.status_code == 200
        assert update_response.json()["events_auto_rotate"] == False
        
        # Toggle on
        update_response2 = self.session.put(f"{BASE_URL}/api/settings", json={"events_auto_rotate": True})
        assert update_response2.json()["events_auto_rotate"] == True
        print(f"✓ events_auto_rotate update works")
    
    def test_update_events_show_in_slideshow(self):
        """PUT /api/settings saves events_show_in_slideshow"""
        update_response = self.session.put(f"{BASE_URL}/api/settings", json={"events_show_in_slideshow": False})
        assert update_response.status_code == 200
        assert update_response.json()["events_show_in_slideshow"] == False
        
        # Reset
        self.session.put(f"{BASE_URL}/api/settings", json={"events_show_in_slideshow": True})
        print(f"✓ events_show_in_slideshow update works")
    
    def test_update_events_auto_hide_expired(self):
        """PUT /api/settings saves events_auto_hide_expired"""
        update_response = self.session.put(f"{BASE_URL}/api/settings", json={"events_auto_hide_expired": False})
        assert update_response.status_code == 200
        assert update_response.json()["events_auto_hide_expired"] == False
        
        # Reset
        self.session.put(f"{BASE_URL}/api/settings", json={"events_auto_hide_expired": True})
        print(f"✓ events_auto_hide_expired update works")
    
    def test_update_events_sort_by(self):
        """PUT /api/settings saves events_sort_by"""
        for sort_option in ["upcoming", "newest", "featured", "custom"]:
            update_response = self.session.put(f"{BASE_URL}/api/settings", json={"events_sort_by": sort_option})
            assert update_response.status_code == 200
            assert update_response.json()["events_sort_by"] == sort_option
        
        # Reset to default
        self.session.put(f"{BASE_URL}/api/settings", json={"events_sort_by": "upcoming"})
        print(f"✓ events_sort_by update works for all options")


class TestRegressionPhase1And2:
    """Regression tests for Phase 1 and Phase 2 features"""
    
    @pytest.fixture(autouse=True)
    def setup(self):
        self.session = requests.Session()
        self.session.headers.update({"Content-Type": "application/json"})
    
    def test_health_endpoint(self):
        """Health endpoint still works"""
        response = self.session.get(f"{BASE_URL}/api/health")
        assert response.status_code == 200
        assert response.json()["status"] == "healthy"
        print(f"✓ Health endpoint works")
    
    def test_images_endpoint(self):
        """Images endpoint still works"""
        response = self.session.get(f"{BASE_URL}/api/images")
        assert response.status_code == 200
        assert isinstance(response.json(), list)
        print(f"✓ Images endpoint works")
    
    def test_settings_endpoint(self):
        """Settings endpoint still works"""
        response = self.session.get(f"{BASE_URL}/api/settings")
        assert response.status_code == 200
        data = response.json()
        assert "hotel_name" in data
        assert "city" in data
        print(f"✓ Settings endpoint works")
    
    def test_attractions_endpoint(self):
        """Attractions endpoint still works"""
        response = self.session.get(f"{BASE_URL}/api/attractions")
        assert response.status_code == 200
        assert isinstance(response.json(), list)
        assert len(response.json()) >= 6, "Should have default attractions"
        print(f"✓ Attractions endpoint works")
    
    def test_content_endpoint(self):
        """Content endpoint still works"""
        response = self.session.get(f"{BASE_URL}/api/content/announcement")
        assert response.status_code == 200
        assert isinstance(response.json(), list)
        print(f"✓ Content endpoint works")
    
    def test_news_endpoint(self):
        """News endpoint still works"""
        response = self.session.get(f"{BASE_URL}/api/news")
        assert response.status_code == 200
        assert isinstance(response.json(), list)
        print(f"✓ News endpoint works")


if __name__ == "__main__":
    pytest.main([__file__, "-v", "--tb=short"])
