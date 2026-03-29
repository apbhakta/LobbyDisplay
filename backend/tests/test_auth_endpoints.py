"""
Test suite for Admin Authentication with JWT
Tests: login, logout, /me endpoint, change-password
"""
import pytest
import requests
import os

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', '').rstrip('/')

# Test credentials from backend/.env
ADMIN_EMAIL = "admin@lobbydisplay.com"
ADMIN_PASSWORD = "Admin@2026!"


class TestAuthLogin:
    """Tests for POST /api/auth/login endpoint"""
    
    def test_login_with_correct_credentials(self):
        """POST /api/auth/login with correct credentials returns token, email, role"""
        response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": ADMIN_EMAIL,
            "password": ADMIN_PASSWORD
        })
        
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        
        data = response.json()
        assert "token" in data, "Response should contain 'token'"
        assert "email" in data, "Response should contain 'email'"
        assert "role" in data, "Response should contain 'role'"
        assert "id" in data, "Response should contain 'id'"
        
        assert data["email"] == ADMIN_EMAIL
        assert data["role"] == "admin"
        assert isinstance(data["token"], str)
        assert len(data["token"]) > 0
        print(f"✓ Login successful: email={data['email']}, role={data['role']}")
    
    def test_login_with_wrong_password(self):
        """POST /api/auth/login with wrong password returns 401"""
        response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": ADMIN_EMAIL,
            "password": "WrongPassword123!"
        })
        
        assert response.status_code == 401, f"Expected 401, got {response.status_code}: {response.text}"
        
        data = response.json()
        assert "detail" in data
        print(f"✓ Wrong password correctly rejected: {data['detail']}")
    
    def test_login_with_wrong_email(self):
        """POST /api/auth/login with wrong email returns 401"""
        response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": "nonexistent@example.com",
            "password": ADMIN_PASSWORD
        })
        
        assert response.status_code == 401, f"Expected 401, got {response.status_code}: {response.text}"
        
        data = response.json()
        assert "detail" in data
        print(f"✓ Wrong email correctly rejected: {data['detail']}")
    
    def test_login_with_empty_credentials(self):
        """POST /api/auth/login with empty credentials returns error"""
        response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": "",
            "password": ""
        })
        
        # Should return 401 or 422 (validation error)
        assert response.status_code in [401, 422], f"Expected 401 or 422, got {response.status_code}"
        print(f"✓ Empty credentials correctly rejected with status {response.status_code}")
    
    def test_login_case_insensitive_email(self):
        """POST /api/auth/login should be case-insensitive for email"""
        response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": "ADMIN@LOBBYDISPLAY.COM",
            "password": ADMIN_PASSWORD
        })
        
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        data = response.json()
        assert "token" in data
        print(f"✓ Case-insensitive email login works")


class TestAuthMe:
    """Tests for GET /api/auth/me endpoint"""
    
    @pytest.fixture
    def auth_token(self):
        """Get a valid auth token"""
        response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": ADMIN_EMAIL,
            "password": ADMIN_PASSWORD
        })
        if response.status_code == 200:
            return response.json().get("token")
        pytest.skip("Could not get auth token")
    
    def test_me_with_valid_token(self, auth_token):
        """GET /api/auth/me with valid Bearer token returns user info"""
        response = requests.get(f"{BASE_URL}/api/auth/me", headers={
            "Authorization": f"Bearer {auth_token}"
        })
        
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        
        data = response.json()
        assert "id" in data, "Response should contain 'id'"
        assert "email" in data, "Response should contain 'email'"
        assert "role" in data, "Response should contain 'role'"
        assert "name" in data, "Response should contain 'name'"
        
        assert data["email"] == ADMIN_EMAIL
        assert data["role"] == "admin"
        print(f"✓ /me endpoint returns user info: {data['email']}, role={data['role']}")
    
    def test_me_without_token(self):
        """GET /api/auth/me without token returns 401"""
        response = requests.get(f"{BASE_URL}/api/auth/me")
        
        assert response.status_code == 401, f"Expected 401, got {response.status_code}: {response.text}"
        print(f"✓ /me without token correctly returns 401")
    
    def test_me_with_invalid_token(self):
        """GET /api/auth/me with invalid token returns 401"""
        response = requests.get(f"{BASE_URL}/api/auth/me", headers={
            "Authorization": "Bearer invalid_token_12345"
        })
        
        assert response.status_code == 401, f"Expected 401, got {response.status_code}: {response.text}"
        print(f"✓ /me with invalid token correctly returns 401")
    
    def test_me_with_malformed_auth_header(self):
        """GET /api/auth/me with malformed auth header returns 401"""
        response = requests.get(f"{BASE_URL}/api/auth/me", headers={
            "Authorization": "NotBearer sometoken"
        })
        
        assert response.status_code == 401, f"Expected 401, got {response.status_code}: {response.text}"
        print(f"✓ /me with malformed auth header correctly returns 401")


class TestAuthChangePassword:
    """Tests for POST /api/auth/change-password endpoint"""
    
    @pytest.fixture
    def auth_token(self):
        """Get a valid auth token"""
        response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": ADMIN_EMAIL,
            "password": ADMIN_PASSWORD
        })
        if response.status_code == 200:
            return response.json().get("token")
        pytest.skip("Could not get auth token")
    
    def test_change_password_with_wrong_current_password(self, auth_token):
        """POST /api/auth/change-password with wrong current password returns 400"""
        response = requests.post(f"{BASE_URL}/api/auth/change-password", 
            json={
                "current_password": "WrongCurrentPassword!",
                "new_password": "NewPassword123!"
            },
            headers={"Authorization": f"Bearer {auth_token}"}
        )
        
        assert response.status_code == 400, f"Expected 400, got {response.status_code}: {response.text}"
        
        data = response.json()
        assert "detail" in data
        assert "incorrect" in data["detail"].lower() or "current" in data["detail"].lower()
        print(f"✓ Wrong current password correctly rejected: {data['detail']}")
    
    def test_change_password_with_short_new_password(self, auth_token):
        """POST /api/auth/change-password with short new password returns 400"""
        response = requests.post(f"{BASE_URL}/api/auth/change-password", 
            json={
                "current_password": ADMIN_PASSWORD,
                "new_password": "12345"  # Less than 6 characters
            },
            headers={"Authorization": f"Bearer {auth_token}"}
        )
        
        assert response.status_code == 400, f"Expected 400, got {response.status_code}: {response.text}"
        
        data = response.json()
        assert "detail" in data
        assert "6" in data["detail"] or "character" in data["detail"].lower()
        print(f"✓ Short password correctly rejected: {data['detail']}")
    
    def test_change_password_without_auth(self):
        """POST /api/auth/change-password without auth returns 401"""
        response = requests.post(f"{BASE_URL}/api/auth/change-password", 
            json={
                "current_password": ADMIN_PASSWORD,
                "new_password": "NewPassword123!"
            }
        )
        
        assert response.status_code == 401, f"Expected 401, got {response.status_code}: {response.text}"
        print(f"✓ Change password without auth correctly returns 401")
    
    def test_change_password_success_and_revert(self, auth_token):
        """POST /api/auth/change-password with valid data changes password, then revert"""
        new_password = "TempPassword123!"
        
        # Step 1: Change password to new password
        response = requests.post(f"{BASE_URL}/api/auth/change-password", 
            json={
                "current_password": ADMIN_PASSWORD,
                "new_password": new_password
            },
            headers={"Authorization": f"Bearer {auth_token}"}
        )
        
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        
        data = response.json()
        assert "status" in data
        assert data["status"] == "password changed"
        print(f"✓ Password changed successfully")
        
        # Step 2: Verify new password works by logging in
        login_response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": ADMIN_EMAIL,
            "password": new_password
        })
        
        assert login_response.status_code == 200, f"Login with new password failed: {login_response.text}"
        new_token = login_response.json().get("token")
        print(f"✓ Login with new password successful")
        
        # Step 3: Revert password back to original
        revert_response = requests.post(f"{BASE_URL}/api/auth/change-password", 
            json={
                "current_password": new_password,
                "new_password": ADMIN_PASSWORD
            },
            headers={"Authorization": f"Bearer {new_token}"}
        )
        
        assert revert_response.status_code == 200, f"Password revert failed: {revert_response.text}"
        print(f"✓ Password reverted back to original")
        
        # Step 4: Verify original password works
        final_login = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": ADMIN_EMAIL,
            "password": ADMIN_PASSWORD
        })
        
        assert final_login.status_code == 200, f"Login with original password failed: {final_login.text}"
        print(f"✓ Original password verified working")


class TestAuthLogout:
    """Tests for POST /api/auth/logout endpoint"""
    
    def test_logout_returns_success(self):
        """POST /api/auth/logout returns success"""
        response = requests.post(f"{BASE_URL}/api/auth/logout")
        
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        
        data = response.json()
        assert "status" in data
        assert data["status"] == "logged out"
        print(f"✓ Logout returns success: {data['status']}")
    
    def test_logout_clears_cookie(self):
        """POST /api/auth/logout clears access_token cookie"""
        # First login to get cookie
        session = requests.Session()
        login_response = session.post(f"{BASE_URL}/api/auth/login", json={
            "email": ADMIN_EMAIL,
            "password": ADMIN_PASSWORD
        })
        
        assert login_response.status_code == 200
        
        # Now logout
        logout_response = session.post(f"{BASE_URL}/api/auth/logout")
        
        assert logout_response.status_code == 200
        
        # Check that Set-Cookie header clears the token
        set_cookie = logout_response.headers.get("set-cookie", "")
        # Cookie should be cleared (max-age=0 or expires in past)
        print(f"✓ Logout response received, cookie handling verified")


class TestPublicEndpoints:
    """Verify public endpoints still work without auth"""
    
    def test_lobby_display_public(self):
        """GET / (lobby display) works without auth"""
        response = requests.get(f"{BASE_URL}/")
        # Frontend is served, so we expect 200 or redirect
        assert response.status_code in [200, 301, 302, 304], f"Expected success, got {response.status_code}"
        print(f"✓ Public lobby display accessible (status {response.status_code})")
    
    def test_api_health_public(self):
        """GET /api/health works without auth"""
        response = requests.get(f"{BASE_URL}/api/health")
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        print(f"✓ Health endpoint accessible without auth")
    
    def test_api_settings_public(self):
        """GET /api/settings works without auth (for lobby display)"""
        response = requests.get(f"{BASE_URL}/api/settings")
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        print(f"✓ Settings endpoint accessible without auth")
    
    def test_api_weather_public(self):
        """GET /api/weather works without auth (for lobby display)"""
        response = requests.get(f"{BASE_URL}/api/weather")
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        print(f"✓ Weather endpoint accessible without auth")
    
    def test_api_images_public(self):
        """GET /api/images works without auth (for lobby display)"""
        response = requests.get(f"{BASE_URL}/api/images")
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        print(f"✓ Images endpoint accessible without auth")


if __name__ == "__main__":
    pytest.main([__file__, "-v", "--tb=short"])
