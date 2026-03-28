"""
Phase 2 Backend API Tests for Hotel Lobby Digital Signage
Tests: Attractions CRUD, Content Sections CRUD, Settings for attractions
"""
import pytest
import requests
import os
import uuid

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', '').rstrip('/')

# ===== Attractions CRUD Tests =====

class TestAttractionsEndpoints:
    """Attractions API endpoint tests - GET, POST, PUT, DELETE"""
    
    def test_get_attractions_returns_list(self):
        """Test GET /api/attractions returns list of attractions"""
        response = requests.get(f"{BASE_URL}/api/attractions")
        assert response.status_code == 200
        data = response.json()
        
        assert isinstance(data, list)
        print(f"✓ GET /api/attractions returns {len(data)} attractions")
    
    def test_get_attractions_has_default_seeded(self):
        """Test that 6 default attractions are seeded"""
        response = requests.get(f"{BASE_URL}/api/attractions")
        assert response.status_code == 200
        data = response.json()
        
        # Should have at least 6 default attractions
        assert len(data) >= 6, f"Expected at least 6 attractions, got {len(data)}"
        
        # Verify attraction structure
        for attraction in data:
            assert "id" in attraction
            assert "name" in attraction
            assert "description" in attraction
            assert "distance" in attraction
            assert "category" in attraction
            assert "enabled" in attraction
            assert "order" in attraction
        
        print(f"✓ {len(data)} attractions present with correct structure")
    
    def test_get_attractions_sorted_by_order(self):
        """Test attractions are returned sorted by order field"""
        response = requests.get(f"{BASE_URL}/api/attractions")
        assert response.status_code == 200
        data = response.json()
        
        orders = [a["order"] for a in data]
        assert orders == sorted(orders), "Attractions not sorted by order"
        
        print("✓ Attractions sorted by order field")
    
    def test_create_attraction(self):
        """Test POST /api/attractions creates new attraction"""
        unique_name = f"TEST_Attraction_{uuid.uuid4().hex[:8]}"
        payload = {
            "name": unique_name,
            "description": "Test description for new attraction",
            "distance": "5 miles",
            "category": "dining",
            "image_url": "https://example.com/test.jpg",
            "enabled": True
        }
        
        response = requests.post(f"{BASE_URL}/api/attractions", json=payload)
        assert response.status_code == 200
        data = response.json()
        
        # Verify response contains created attraction
        assert data["name"] == unique_name
        assert data["description"] == "Test description for new attraction"
        assert data["distance"] == "5 miles"
        assert data["category"] == "dining"
        assert data["enabled"] == True
        assert "id" in data
        assert "order" in data
        assert "created_at" in data
        
        # Verify persistence with GET
        get_response = requests.get(f"{BASE_URL}/api/attractions")
        assert get_response.status_code == 200
        all_attractions = get_response.json()
        created_ids = [a["id"] for a in all_attractions]
        assert data["id"] in created_ids, "Created attraction not found in GET response"
        
        print(f"✓ Created attraction: {unique_name}")
        
        # Cleanup
        requests.delete(f"{BASE_URL}/api/attractions/{data['id']}")
    
    def test_create_attraction_with_different_categories(self):
        """Test creating attractions with all valid categories"""
        valid_categories = ["dining", "shopping", "parks", "museums", "entertainment",
                          "family", "events", "outdoor", "hotel_recommendations"]
        
        created_ids = []
        for category in valid_categories:
            payload = {
                "name": f"TEST_{category}_{uuid.uuid4().hex[:6]}",
                "description": f"Test {category} attraction",
                "distance": "1 mile",
                "category": category
            }
            response = requests.post(f"{BASE_URL}/api/attractions", json=payload)
            assert response.status_code == 200, f"Failed to create attraction with category: {category}"
            data = response.json()
            assert data["category"] == category
            created_ids.append(data["id"])
        
        print(f"✓ Created attractions with all {len(valid_categories)} categories")
        
        # Cleanup
        for aid in created_ids:
            requests.delete(f"{BASE_URL}/api/attractions/{aid}")
    
    def test_update_attraction(self):
        """Test PUT /api/attractions/{id} updates attraction"""
        # First create an attraction
        create_payload = {
            "name": f"TEST_Update_{uuid.uuid4().hex[:8]}",
            "description": "Original description",
            "distance": "1 mile",
            "category": "dining"
        }
        create_response = requests.post(f"{BASE_URL}/api/attractions", json=create_payload)
        assert create_response.status_code == 200
        created = create_response.json()
        attraction_id = created["id"]
        
        # Update the attraction
        update_payload = {
            "name": "Updated Name",
            "description": "Updated description",
            "distance": "10 miles",
            "category": "parks"
        }
        update_response = requests.put(f"{BASE_URL}/api/attractions/{attraction_id}", json=update_payload)
        assert update_response.status_code == 200
        updated = update_response.json()
        
        assert updated["name"] == "Updated Name"
        assert updated["description"] == "Updated description"
        assert updated["distance"] == "10 miles"
        assert updated["category"] == "parks"
        
        # Verify persistence with GET
        get_response = requests.get(f"{BASE_URL}/api/attractions")
        all_attractions = get_response.json()
        found = next((a for a in all_attractions if a["id"] == attraction_id), None)
        assert found is not None
        assert found["name"] == "Updated Name"
        
        print(f"✓ Updated attraction successfully")
        
        # Cleanup
        requests.delete(f"{BASE_URL}/api/attractions/{attraction_id}")
    
    def test_update_attraction_enabled_toggle(self):
        """Test toggling attraction enabled/disabled"""
        # Create attraction
        create_payload = {
            "name": f"TEST_Toggle_{uuid.uuid4().hex[:8]}",
            "description": "Toggle test",
            "category": "dining",
            "enabled": True
        }
        create_response = requests.post(f"{BASE_URL}/api/attractions", json=create_payload)
        assert create_response.status_code == 200
        created = create_response.json()
        attraction_id = created["id"]
        assert created["enabled"] == True
        
        # Disable it
        update_response = requests.put(f"{BASE_URL}/api/attractions/{attraction_id}", json={"enabled": False})
        assert update_response.status_code == 200
        updated = update_response.json()
        assert updated["enabled"] == False
        
        # Enable it again
        update_response2 = requests.put(f"{BASE_URL}/api/attractions/{attraction_id}", json={"enabled": True})
        assert update_response2.status_code == 200
        updated2 = update_response2.json()
        assert updated2["enabled"] == True
        
        print("✓ Attraction enabled/disabled toggle works")
        
        # Cleanup
        requests.delete(f"{BASE_URL}/api/attractions/{attraction_id}")
    
    def test_delete_attraction(self):
        """Test DELETE /api/attractions/{id} removes attraction"""
        # Create attraction
        create_payload = {
            "name": f"TEST_Delete_{uuid.uuid4().hex[:8]}",
            "description": "To be deleted",
            "category": "dining"
        }
        create_response = requests.post(f"{BASE_URL}/api/attractions", json=create_payload)
        assert create_response.status_code == 200
        created = create_response.json()
        attraction_id = created["id"]
        
        # Delete it
        delete_response = requests.delete(f"{BASE_URL}/api/attractions/{attraction_id}")
        assert delete_response.status_code == 200
        
        # Verify it's gone
        get_response = requests.get(f"{BASE_URL}/api/attractions")
        all_attractions = get_response.json()
        found_ids = [a["id"] for a in all_attractions]
        assert attraction_id not in found_ids, "Deleted attraction still exists"
        
        print("✓ Attraction deleted successfully")
    
    def test_delete_nonexistent_attraction_returns_404(self):
        """Test deleting non-existent attraction returns 404"""
        fake_id = f"nonexistent_{uuid.uuid4().hex}"
        response = requests.delete(f"{BASE_URL}/api/attractions/{fake_id}")
        assert response.status_code == 404
        
        print("✓ DELETE non-existent attraction returns 404")
    
    def test_update_nonexistent_attraction_returns_404(self):
        """Test updating non-existent attraction returns 404"""
        fake_id = f"nonexistent_{uuid.uuid4().hex}"
        response = requests.put(f"{BASE_URL}/api/attractions/{fake_id}", json={"name": "Test"})
        assert response.status_code == 404
        
        print("✓ PUT non-existent attraction returns 404")


class TestAttractionsReorder:
    """Test attractions reorder endpoint"""
    
    def test_reorder_attractions(self):
        """Test POST /api/attractions/reorder reorders attractions"""
        # Get current attractions
        get_response = requests.get(f"{BASE_URL}/api/attractions")
        assert get_response.status_code == 200
        attractions = get_response.json()
        
        if len(attractions) < 2:
            pytest.skip("Need at least 2 attractions to test reorder")
        
        # Reverse the order
        original_ids = [a["id"] for a in attractions]
        reversed_ids = list(reversed(original_ids))
        
        reorder_response = requests.post(f"{BASE_URL}/api/attractions/reorder", json=reversed_ids)
        assert reorder_response.status_code == 200
        
        # Verify new order
        get_response2 = requests.get(f"{BASE_URL}/api/attractions")
        reordered = get_response2.json()
        new_ids = [a["id"] for a in reordered]
        
        assert new_ids == reversed_ids, "Attractions not reordered correctly"
        
        # Restore original order
        requests.post(f"{BASE_URL}/api/attractions/reorder", json=original_ids)
        
        print("✓ Attractions reorder works correctly")


class TestAttractionsSettings:
    """Test attractions-related settings"""
    
    def test_settings_include_attractions_per_slide(self):
        """Test settings include attractions_per_slide field"""
        response = requests.get(f"{BASE_URL}/api/settings")
        assert response.status_code == 200
        data = response.json()
        
        assert "attractions_per_slide" in data
        assert isinstance(data["attractions_per_slide"], int)
        assert data["attractions_per_slide"] >= 2
        
        print(f"✓ attractions_per_slide setting present: {data['attractions_per_slide']}")
    
    def test_settings_include_attractions_auto_rotate(self):
        """Test settings include attractions_auto_rotate field"""
        response = requests.get(f"{BASE_URL}/api/settings")
        assert response.status_code == 200
        data = response.json()
        
        assert "attractions_auto_rotate" in data
        assert isinstance(data["attractions_auto_rotate"], bool)
        
        print(f"✓ attractions_auto_rotate setting present: {data['attractions_auto_rotate']}")
    
    def test_update_attractions_settings(self):
        """Test updating attractions settings"""
        payload = {
            "attractions_per_slide": 8,
            "attractions_auto_rotate": False
        }
        response = requests.put(f"{BASE_URL}/api/settings", json=payload)
        assert response.status_code == 200
        data = response.json()
        
        assert data["attractions_per_slide"] == 8
        assert data["attractions_auto_rotate"] == False
        
        # Restore defaults
        requests.put(f"{BASE_URL}/api/settings", json={
            "attractions_per_slide": 6,
            "attractions_auto_rotate": True
        })
        
        print("✓ Attractions settings update works")


# ===== Content Sections CRUD Tests =====

CONTENT_TYPES = ["announcement", "promotion", "welcome_message", "amenity", 
                 "event", "emergency", "checkout_reminder"]


class TestContentEndpoints:
    """Content sections API endpoint tests"""
    
    def test_get_content_for_all_types(self):
        """Test GET /api/content/{section_type} for all 7 content types"""
        for content_type in CONTENT_TYPES:
            response = requests.get(f"{BASE_URL}/api/content/{content_type}")
            assert response.status_code == 200, f"Failed for content type: {content_type}"
            data = response.json()
            assert isinstance(data, list), f"Expected list for {content_type}"
            print(f"  ✓ GET /api/content/{content_type} returns {len(data)} items")
        
        print(f"✓ All {len(CONTENT_TYPES)} content types accessible")
    
    def test_get_content_invalid_type_returns_400(self):
        """Test GET /api/content/{invalid_type} returns 400"""
        response = requests.get(f"{BASE_URL}/api/content/invalid_type")
        assert response.status_code == 400
        
        print("✓ Invalid content type returns 400")
    
    def test_create_content_item(self):
        """Test POST /api/content/{section_type} creates content item"""
        unique_title = f"TEST_Content_{uuid.uuid4().hex[:8]}"
        payload = {
            "title": unique_title,
            "content": "Test content body",
            "enabled": True,
            "priority": "normal"
        }
        
        response = requests.post(f"{BASE_URL}/api/content/announcement", json=payload)
        assert response.status_code == 200
        data = response.json()
        
        assert data["title"] == unique_title
        assert data["content"] == "Test content body"
        assert data["enabled"] == True
        assert data["priority"] == "normal"
        assert data["section_type"] == "announcement"
        assert "id" in data
        assert "order" in data
        assert "created_at" in data
        
        # Verify persistence
        get_response = requests.get(f"{BASE_URL}/api/content/announcement")
        all_items = get_response.json()
        created_ids = [c["id"] for c in all_items]
        assert data["id"] in created_ids
        
        print(f"✓ Created content item: {unique_title}")
        
        # Cleanup
        requests.delete(f"{BASE_URL}/api/content/announcement/{data['id']}")
    
    def test_create_content_for_all_types(self):
        """Test creating content items for all 7 section types"""
        created_items = []
        
        for content_type in CONTENT_TYPES:
            payload = {
                "title": f"TEST_{content_type}_{uuid.uuid4().hex[:6]}",
                "content": f"Test content for {content_type}",
                "priority": "normal"
            }
            response = requests.post(f"{BASE_URL}/api/content/{content_type}", json=payload)
            assert response.status_code == 200, f"Failed to create content for: {content_type}"
            data = response.json()
            assert data["section_type"] == content_type
            created_items.append((content_type, data["id"]))
        
        print(f"✓ Created content items for all {len(CONTENT_TYPES)} section types")
        
        # Cleanup
        for content_type, item_id in created_items:
            requests.delete(f"{BASE_URL}/api/content/{content_type}/{item_id}")
    
    def test_create_content_with_priorities(self):
        """Test creating content with different priorities"""
        priorities = ["normal", "high", "urgent"]
        created_items = []
        
        for priority in priorities:
            payload = {
                "title": f"TEST_Priority_{priority}_{uuid.uuid4().hex[:6]}",
                "content": f"Content with {priority} priority",
                "priority": priority
            }
            response = requests.post(f"{BASE_URL}/api/content/announcement", json=payload)
            assert response.status_code == 200
            data = response.json()
            assert data["priority"] == priority
            created_items.append(data["id"])
        
        print(f"✓ Created content with all priority levels")
        
        # Cleanup
        for item_id in created_items:
            requests.delete(f"{BASE_URL}/api/content/announcement/{item_id}")
    
    def test_update_content_item(self):
        """Test PUT /api/content/{section_type}/{id} updates content"""
        # Create content
        create_payload = {
            "title": f"TEST_Update_{uuid.uuid4().hex[:8]}",
            "content": "Original content",
            "priority": "normal"
        }
        create_response = requests.post(f"{BASE_URL}/api/content/promotion", json=create_payload)
        assert create_response.status_code == 200
        created = create_response.json()
        item_id = created["id"]
        
        # Update it
        update_payload = {
            "title": "Updated Title",
            "content": "Updated content body",
            "priority": "high"
        }
        update_response = requests.put(f"{BASE_URL}/api/content/promotion/{item_id}", json=update_payload)
        assert update_response.status_code == 200
        updated = update_response.json()
        
        assert updated["title"] == "Updated Title"
        assert updated["content"] == "Updated content body"
        assert updated["priority"] == "high"
        
        # Verify persistence
        get_response = requests.get(f"{BASE_URL}/api/content/promotion")
        all_items = get_response.json()
        found = next((c for c in all_items if c["id"] == item_id), None)
        assert found is not None
        assert found["title"] == "Updated Title"
        
        print("✓ Content item updated successfully")
        
        # Cleanup
        requests.delete(f"{BASE_URL}/api/content/promotion/{item_id}")
    
    def test_update_content_enabled_toggle(self):
        """Test toggling content item enabled/disabled"""
        # Create content
        create_payload = {
            "title": f"TEST_Toggle_{uuid.uuid4().hex[:8]}",
            "content": "Toggle test",
            "enabled": True
        }
        create_response = requests.post(f"{BASE_URL}/api/content/amenity", json=create_payload)
        assert create_response.status_code == 200
        created = create_response.json()
        item_id = created["id"]
        assert created["enabled"] == True
        
        # Disable it
        update_response = requests.put(f"{BASE_URL}/api/content/amenity/{item_id}", json={"enabled": False})
        assert update_response.status_code == 200
        updated = update_response.json()
        assert updated["enabled"] == False
        
        # Enable it again
        update_response2 = requests.put(f"{BASE_URL}/api/content/amenity/{item_id}", json={"enabled": True})
        assert update_response2.status_code == 200
        updated2 = update_response2.json()
        assert updated2["enabled"] == True
        
        print("✓ Content enabled/disabled toggle works")
        
        # Cleanup
        requests.delete(f"{BASE_URL}/api/content/amenity/{item_id}")
    
    def test_delete_content_item(self):
        """Test DELETE /api/content/{section_type}/{id} removes content"""
        # Create content
        create_payload = {
            "title": f"TEST_Delete_{uuid.uuid4().hex[:8]}",
            "content": "To be deleted"
        }
        create_response = requests.post(f"{BASE_URL}/api/content/event", json=create_payload)
        assert create_response.status_code == 200
        created = create_response.json()
        item_id = created["id"]
        
        # Delete it
        delete_response = requests.delete(f"{BASE_URL}/api/content/event/{item_id}")
        assert delete_response.status_code == 200
        
        # Verify it's gone
        get_response = requests.get(f"{BASE_URL}/api/content/event")
        all_items = get_response.json()
        found_ids = [c["id"] for c in all_items]
        assert item_id not in found_ids
        
        print("✓ Content item deleted successfully")
    
    def test_delete_nonexistent_content_returns_404(self):
        """Test deleting non-existent content returns 404"""
        fake_id = f"nonexistent_{uuid.uuid4().hex}"
        response = requests.delete(f"{BASE_URL}/api/content/announcement/{fake_id}")
        assert response.status_code == 404
        
        print("✓ DELETE non-existent content returns 404")
    
    def test_update_nonexistent_content_returns_404(self):
        """Test updating non-existent content returns 404"""
        fake_id = f"nonexistent_{uuid.uuid4().hex}"
        response = requests.put(f"{BASE_URL}/api/content/announcement/{fake_id}", json={"title": "Test"})
        assert response.status_code == 404
        
        print("✓ PUT non-existent content returns 404")


class TestContentReorder:
    """Test content reorder endpoint"""
    
    def test_reorder_content(self):
        """Test POST /api/content/{section_type}/reorder reorders content"""
        # Create 3 test items
        created_ids = []
        for i in range(3):
            payload = {
                "title": f"TEST_Reorder_{i}_{uuid.uuid4().hex[:6]}",
                "content": f"Item {i}"
            }
            response = requests.post(f"{BASE_URL}/api/content/checkout_reminder", json=payload)
            assert response.status_code == 200
            created_ids.append(response.json()["id"])
        
        # Reverse the order
        reversed_ids = list(reversed(created_ids))
        reorder_response = requests.post(f"{BASE_URL}/api/content/checkout_reminder/reorder", json=reversed_ids)
        assert reorder_response.status_code == 200
        
        # Verify new order
        get_response = requests.get(f"{BASE_URL}/api/content/checkout_reminder")
        items = get_response.json()
        # Filter to only our test items
        test_items = [c for c in items if c["id"] in created_ids]
        new_ids = [c["id"] for c in test_items]
        
        # Check order values
        for item in test_items:
            expected_order = reversed_ids.index(item["id"])
            assert item["order"] == expected_order, f"Item {item['id']} has wrong order"
        
        print("✓ Content reorder works correctly")
        
        # Cleanup
        for item_id in created_ids:
            requests.delete(f"{BASE_URL}/api/content/checkout_reminder/{item_id}")


# ===== Integration Tests =====

class TestPhase2Integration:
    """Integration tests for Phase 2 features"""
    
    def test_attractions_data_for_lobby_display(self):
        """Test attractions data is suitable for lobby display"""
        response = requests.get(f"{BASE_URL}/api/attractions")
        assert response.status_code == 200
        attractions = response.json()
        
        # Filter enabled attractions
        enabled = [a for a in attractions if a.get("enabled", True)]
        assert len(enabled) >= 1, "No enabled attractions for display"
        
        # Verify each has required display fields
        for attraction in enabled:
            assert attraction.get("name"), "Attraction missing name"
            assert attraction.get("category"), "Attraction missing category"
        
        print(f"✓ {len(enabled)} enabled attractions ready for lobby display")
    
    def test_settings_attractions_per_slide_affects_display(self):
        """Test attractions_per_slide setting is available for display"""
        settings_response = requests.get(f"{BASE_URL}/api/settings")
        assert settings_response.status_code == 200
        settings = settings_response.json()
        
        attractions_response = requests.get(f"{BASE_URL}/api/attractions")
        assert attractions_response.status_code == 200
        attractions = attractions_response.json()
        
        per_slide = settings.get("attractions_per_slide", 6)
        enabled = [a for a in attractions if a.get("enabled", True)]
        
        # Display should show min(per_slide, enabled_count) attractions
        display_count = min(per_slide, len(enabled))
        assert display_count >= 1
        
        print(f"✓ Display will show {display_count} attractions (per_slide={per_slide}, enabled={len(enabled)})")
    
    def test_all_existing_endpoints_still_work(self):
        """Verify Phase 1 endpoints still work after Phase 2 additions"""
        # Root
        response = requests.get(f"{BASE_URL}/api/")
        assert response.status_code == 200
        
        # Health
        response = requests.get(f"{BASE_URL}/api/health")
        assert response.status_code == 200
        
        # Weather
        response = requests.get(f"{BASE_URL}/api/weather")
        assert response.status_code == 200
        
        # Extended weather
        response = requests.get(f"{BASE_URL}/api/weather/extended")
        assert response.status_code == 200
        
        # News
        response = requests.get(f"{BASE_URL}/api/news")
        assert response.status_code == 200
        
        # Images
        response = requests.get(f"{BASE_URL}/api/images")
        assert response.status_code == 200
        
        # Settings
        response = requests.get(f"{BASE_URL}/api/settings")
        assert response.status_code == 200
        
        print("✓ All existing Phase 1 endpoints still working")


if __name__ == "__main__":
    pytest.main([__file__, "-v"])
