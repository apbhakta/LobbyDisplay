"""
Test Cloudinary Image Upload/Delete/Migration Endpoints
Tests the migration from local disk storage to Cloudinary cloud storage.
"""
import pytest
import requests
import os
import io

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', '').rstrip('/')

class TestCloudinaryImageEndpoints:
    """Test image endpoints with Cloudinary integration"""
    
    def test_get_images_returns_cloudinary_urls(self):
        """GET /api/images should return images with Cloudinary URLs (not /api/uploads/)"""
        response = requests.get(f"{BASE_URL}/api/images")
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        
        images = response.json()
        print(f"Found {len(images)} images")
        
        # Check that all images have Cloudinary URLs (not local /api/uploads/ paths)
        for img in images:
            assert "id" in img, "Image should have id"
            assert "url" in img, "Image should have url"
            assert "filename" in img, "Image should have filename"
            
            url = img["url"]
            # Cloudinary URLs start with https://res.cloudinary.com/
            assert url.startswith("https://res.cloudinary.com/"), \
                f"Image URL should be Cloudinary URL, got: {url}"
            assert not url.startswith("/api/uploads/"), \
                f"Image URL should NOT be local path, got: {url}"
            print(f"  ✓ Image {img['id'][:8]}... has Cloudinary URL")
        
        print(f"All {len(images)} images have Cloudinary URLs")
    
    def test_upload_image_returns_cloudinary_url(self):
        """POST /api/images should upload to Cloudinary and return Cloudinary URL"""
        # Create a simple test image (1x1 red pixel PNG)
        # PNG header + IHDR + IDAT + IEND for a 1x1 red pixel
        png_data = bytes([
            0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A,  # PNG signature
            0x00, 0x00, 0x00, 0x0D, 0x49, 0x48, 0x44, 0x52,  # IHDR chunk
            0x00, 0x00, 0x00, 0x01, 0x00, 0x00, 0x00, 0x01,  # 1x1
            0x08, 0x02, 0x00, 0x00, 0x00, 0x90, 0x77, 0x53,  # 8-bit RGB
            0xDE, 0x00, 0x00, 0x00, 0x0C, 0x49, 0x44, 0x41,  # IDAT chunk
            0x54, 0x08, 0xD7, 0x63, 0xF8, 0xCF, 0xC0, 0x00,  # compressed data
            0x00, 0x00, 0x03, 0x00, 0x01, 0x00, 0x18, 0xDD,  
            0x8D, 0xB4, 0x00, 0x00, 0x00, 0x00, 0x49, 0x45,  # IEND chunk
            0x4E, 0x44, 0xAE, 0x42, 0x60, 0x82
        ])
        
        files = {
            'file': ('test_cloudinary_upload.png', io.BytesIO(png_data), 'image/png')
        }
        
        response = requests.post(f"{BASE_URL}/api/images", files=files)
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        
        data = response.json()
        assert "id" in data, "Response should have id"
        assert "url" in data, "Response should have url"
        assert "filename" in data, "Response should have filename"
        
        # Verify URL is Cloudinary
        url = data["url"]
        assert url.startswith("https://res.cloudinary.com/"), \
            f"Uploaded image URL should be Cloudinary URL, got: {url}"
        
        # Verify it's in the correct folder
        assert "hotel_lobby/images" in url, \
            f"Image should be in hotel_lobby/images folder, got: {url}"
        
        print(f"✓ Uploaded image has Cloudinary URL: {url}")
        
        # Store the ID for cleanup
        self.__class__.uploaded_image_id = data["id"]
        return data["id"]
    
    def test_delete_image_from_cloudinary(self):
        """DELETE /api/images/{id} should delete from Cloudinary and DB"""
        # First upload an image to delete
        png_data = bytes([
            0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A,
            0x00, 0x00, 0x00, 0x0D, 0x49, 0x48, 0x44, 0x52,
            0x00, 0x00, 0x00, 0x01, 0x00, 0x00, 0x00, 0x01,
            0x08, 0x02, 0x00, 0x00, 0x00, 0x90, 0x77, 0x53,
            0xDE, 0x00, 0x00, 0x00, 0x0C, 0x49, 0x44, 0x41,
            0x54, 0x08, 0xD7, 0x63, 0xF8, 0xCF, 0xC0, 0x00,
            0x00, 0x00, 0x03, 0x00, 0x01, 0x00, 0x18, 0xDD,
            0x8D, 0xB4, 0x00, 0x00, 0x00, 0x00, 0x49, 0x45,
            0x4E, 0x44, 0xAE, 0x42, 0x60, 0x82
        ])
        
        files = {
            'file': ('test_delete_image.png', io.BytesIO(png_data), 'image/png')
        }
        
        upload_response = requests.post(f"{BASE_URL}/api/images", files=files)
        assert upload_response.status_code == 200, f"Upload failed: {upload_response.text}"
        
        image_id = upload_response.json()["id"]
        print(f"Uploaded test image with ID: {image_id}")
        
        # Now delete it
        delete_response = requests.delete(f"{BASE_URL}/api/images/{image_id}")
        assert delete_response.status_code == 200, \
            f"Expected 200, got {delete_response.status_code}: {delete_response.text}"
        
        data = delete_response.json()
        assert "message" in data, "Response should have message"
        assert "deleted" in data["message"].lower(), f"Message should confirm deletion: {data['message']}"
        
        print(f"✓ Image {image_id} deleted successfully")
        
        # Verify it's gone from the list
        list_response = requests.get(f"{BASE_URL}/api/images")
        images = list_response.json()
        image_ids = [img["id"] for img in images]
        assert image_id not in image_ids, "Deleted image should not appear in list"
        
        print("✓ Deleted image no longer in image list")
    
    def test_delete_nonexistent_image_returns_404(self):
        """DELETE /api/images/{id} with invalid ID should return 404"""
        response = requests.delete(f"{BASE_URL}/api/images/nonexistent-id-12345")
        assert response.status_code == 404, f"Expected 404, got {response.status_code}"
        print("✓ Delete nonexistent image returns 404")
    
    def test_upload_non_image_returns_400(self):
        """POST /api/images with non-image file should return 400"""
        files = {
            'file': ('test.txt', io.BytesIO(b'This is not an image'), 'text/plain')
        }
        
        response = requests.post(f"{BASE_URL}/api/images", files=files)
        assert response.status_code == 400, f"Expected 400, got {response.status_code}"
        print("✓ Upload non-image returns 400")
    
    def test_migrate_to_cloud_endpoint(self):
        """POST /api/images/migrate-to-cloud should return success when no local images"""
        response = requests.post(f"{BASE_URL}/api/images/migrate-to-cloud")
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        
        data = response.json()
        assert "message" in data, "Response should have message"
        assert "migrated" in data, "Response should have migrated count"
        
        # Since all images are already migrated, should report 0 local images
        print(f"Migration result: {data}")
        
        # If there were no local images, migrated should be 0
        if "No local images" in data.get("message", ""):
            assert data["migrated"] == 0, "Should report 0 migrated when no local images"
            print("✓ No local images to migrate (all already on Cloudinary)")
        else:
            print(f"✓ Migration endpoint returned: {data}")


class TestEventImageUpload:
    """Test event image upload to Cloudinary"""
    
    def test_upload_event_image_to_cloudinary(self):
        """POST /api/events/{event_id}/image should upload to Cloudinary"""
        # First get an existing event
        events_response = requests.get(f"{BASE_URL}/api/events", params={"include_expired": "true"})
        assert events_response.status_code == 200, f"Failed to get events: {events_response.text}"
        
        events = events_response.json()
        if not events:
            pytest.skip("No events available to test image upload")
        
        event_id = events[0]["id"]
        print(f"Testing image upload for event: {events[0]['title']} (ID: {event_id})")
        
        # Create a test image
        png_data = bytes([
            0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A,
            0x00, 0x00, 0x00, 0x0D, 0x49, 0x48, 0x44, 0x52,
            0x00, 0x00, 0x00, 0x01, 0x00, 0x00, 0x00, 0x01,
            0x08, 0x02, 0x00, 0x00, 0x00, 0x90, 0x77, 0x53,
            0xDE, 0x00, 0x00, 0x00, 0x0C, 0x49, 0x44, 0x41,
            0x54, 0x08, 0xD7, 0x63, 0xF8, 0xCF, 0xC0, 0x00,
            0x00, 0x00, 0x03, 0x00, 0x01, 0x00, 0x18, 0xDD,
            0x8D, 0xB4, 0x00, 0x00, 0x00, 0x00, 0x49, 0x45,
            0x4E, 0x44, 0xAE, 0x42, 0x60, 0x82
        ])
        
        files = {
            'file': ('event_test_image.png', io.BytesIO(png_data), 'image/png')
        }
        
        response = requests.post(f"{BASE_URL}/api/events/{event_id}/image", files=files)
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        
        data = response.json()
        assert "image_url" in data, "Response should have image_url"
        
        url = data["image_url"]
        assert url.startswith("https://res.cloudinary.com/"), \
            f"Event image URL should be Cloudinary URL, got: {url}"
        
        # Verify it's in the events folder
        assert "hotel_lobby/events" in url, \
            f"Event image should be in hotel_lobby/events folder, got: {url}"
        
        print(f"✓ Event image uploaded to Cloudinary: {url}")
    
    def test_upload_event_image_invalid_event_returns_404(self):
        """POST /api/events/{event_id}/image with invalid event ID should return 404"""
        png_data = bytes([
            0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A,
            0x00, 0x00, 0x00, 0x0D, 0x49, 0x48, 0x44, 0x52,
            0x00, 0x00, 0x00, 0x01, 0x00, 0x00, 0x00, 0x01,
            0x08, 0x02, 0x00, 0x00, 0x00, 0x90, 0x77, 0x53,
            0xDE, 0x00, 0x00, 0x00, 0x0C, 0x49, 0x44, 0x41,
            0x54, 0x08, 0xD7, 0x63, 0xF8, 0xCF, 0xC0, 0x00,
            0x00, 0x00, 0x03, 0x00, 0x01, 0x00, 0x18, 0xDD,
            0x8D, 0xB4, 0x00, 0x00, 0x00, 0x00, 0x49, 0x45,
            0x4E, 0x44, 0xAE, 0x42, 0x60, 0x82
        ])
        
        files = {
            'file': ('event_test_image.png', io.BytesIO(png_data), 'image/png')
        }
        
        response = requests.post(f"{BASE_URL}/api/events/nonexistent-event-id/image", files=files)
        assert response.status_code == 404, f"Expected 404, got {response.status_code}"
        print("✓ Upload to nonexistent event returns 404")
    
    def test_upload_event_image_invalid_file_type_returns_400(self):
        """POST /api/events/{event_id}/image with invalid file type should return 400"""
        # Get an existing event
        events_response = requests.get(f"{BASE_URL}/api/events", params={"include_expired": "true"})
        events = events_response.json()
        if not events:
            pytest.skip("No events available")
        
        event_id = events[0]["id"]
        
        files = {
            'file': ('test.txt', io.BytesIO(b'Not an image'), 'text/plain')
        }
        
        response = requests.post(f"{BASE_URL}/api/events/{event_id}/image", files=files)
        assert response.status_code == 400, f"Expected 400, got {response.status_code}"
        print("✓ Upload invalid file type to event returns 400")


class TestHealthAndBasicEndpoints:
    """Verify basic endpoints are working"""
    
    def test_health_endpoint(self):
        """GET /api/health should return healthy status"""
        response = requests.get(f"{BASE_URL}/api/health")
        assert response.status_code == 200
        data = response.json()
        assert data.get("status") == "healthy"
        print("✓ Health endpoint working")
    
    def test_settings_endpoint(self):
        """GET /api/settings should return settings"""
        response = requests.get(f"{BASE_URL}/api/settings")
        assert response.status_code == 200
        data = response.json()
        assert "hotel_name" in data or "city" in data
        print("✓ Settings endpoint working")


if __name__ == "__main__":
    pytest.main([__file__, "-v"])
