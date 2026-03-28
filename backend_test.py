#!/usr/bin/env python3

import requests
import sys
import json
from datetime import datetime

class HotelLobbyAPITester:
    def __init__(self, base_url="https://luxury-lobby.preview.emergentagent.com"):
        self.base_url = base_url
        self.api_url = f"{base_url}/api"
        self.tests_run = 0
        self.tests_passed = 0
        self.test_results = []

    def run_test(self, name, method, endpoint, expected_status, data=None, headers=None):
        """Run a single API test"""
        url = f"{self.api_url}/{endpoint}" if endpoint else self.api_url
        if headers is None:
            headers = {'Content-Type': 'application/json'}

        self.tests_run += 1
        print(f"\n🔍 Testing {name}...")
        
        try:
            if method == 'GET':
                response = requests.get(url, headers=headers, timeout=10)
            elif method == 'POST':
                response = requests.post(url, json=data, headers=headers, timeout=10)
            elif method == 'PUT':
                response = requests.put(url, json=data, headers=headers, timeout=10)

            success = response.status_code == expected_status
            result = {
                "test_name": name,
                "endpoint": endpoint,
                "method": method,
                "expected_status": expected_status,
                "actual_status": response.status_code,
                "success": success,
                "response_data": None,
                "error": None
            }

            if success:
                self.tests_passed += 1
                print(f"✅ Passed - Status: {response.status_code}")
                try:
                    result["response_data"] = response.json()
                except:
                    result["response_data"] = response.text
            else:
                print(f"❌ Failed - Expected {expected_status}, got {response.status_code}")
                try:
                    result["error"] = response.json()
                except:
                    result["error"] = response.text

            self.test_results.append(result)
            return success, response.json() if success and response.content else {}

        except Exception as e:
            print(f"❌ Failed - Error: {str(e)}")
            result = {
                "test_name": name,
                "endpoint": endpoint,
                "method": method,
                "expected_status": expected_status,
                "actual_status": None,
                "success": False,
                "response_data": None,
                "error": str(e)
            }
            self.test_results.append(result)
            return False, {}

    def test_health_endpoints(self):
        """Test health and root endpoints"""
        print("\n=== Testing Health Endpoints ===")
        
        # Test root endpoint
        success, response = self.run_test("Root API", "GET", "", 200)
        if success:
            print(f"   Root response: {response.get('message', 'N/A')}")

        # Test health endpoint
        success, response = self.run_test("Health Check", "GET", "health", 200)
        if success:
            print(f"   Health status: {response.get('status', 'N/A')}")
            print(f"   Weather API configured: {response.get('weather_api_configured', False)}")
            print(f"   News API configured: {response.get('news_api_configured', False)}")

    def test_settings_endpoints(self):
        """Test settings CRUD operations"""
        print("\n=== Testing Settings Endpoints ===")
        
        # Get settings
        success, settings = self.run_test("Get Settings", "GET", "settings", 200)
        if success:
            print(f"   Hotel name: {settings.get('hotel_name', 'N/A')}")
            print(f"   City: {settings.get('city', 'N/A')}")
            print(f"   News category: {settings.get('news_category', 'N/A')}")

        # Update settings
        update_data = {
            "hotel_name": "Test Hotel Update",
            "city": "Test City, TX"
        }
        success, updated = self.run_test("Update Settings", "PUT", "settings", 200, update_data)
        if success:
            print(f"   Updated hotel name: {updated.get('hotel_name', 'N/A')}")
            print(f"   Updated city: {updated.get('city', 'N/A')}")

        # Restore original settings
        if settings:
            restore_data = {
                "hotel_name": settings.get('hotel_name', 'Velkommen Inn'),
                "city": settings.get('city', 'Clifton, Texas')
            }
            self.run_test("Restore Settings", "PUT", "settings", 200, restore_data)

    def test_images_endpoints(self):
        """Test image management endpoints"""
        print("\n=== Testing Images Endpoints ===")
        
        # Get images
        success, images = self.run_test("Get Images", "GET", "images", 200)
        if success:
            print(f"   Found {len(images)} images")
            if images:
                print(f"   First image: {images[0].get('filename', 'N/A')}")

        # Test reset to defaults
        success, response = self.run_test("Reset Images to Defaults", "POST", "images/reset-defaults", 200)
        if success:
            print(f"   Reset response: {response.get('message', 'N/A')}")

    def test_weather_endpoint(self):
        """Test weather API"""
        print("\n=== Testing Weather Endpoint ===")
        
        success, weather = self.run_test("Get Weather", "GET", "weather", 200)
        if success:
            print(f"   Temperature: {weather.get('temp', 'N/A')}°F")
            print(f"   Condition: {weather.get('condition', 'N/A')}")
            print(f"   City: {weather.get('city', 'N/A')}")
            print(f"   High/Low: {weather.get('temp_max', 'N/A')}°/{weather.get('temp_min', 'N/A')}°")
            print(f"   Is fallback: {weather.get('is_fallback', False)}")

    def test_extended_weather_endpoint(self):
        """Test extended weather API with forecast"""
        print("\n=== Testing Extended Weather Endpoint ===")
        
        success, extended = self.run_test("Get Extended Weather", "GET", "weather/extended", 200)
        if success:
            current = extended.get('current', {})
            forecast = extended.get('forecast', [])
            hourly = extended.get('hourly', [])
            
            print(f"   Current temp: {current.get('temp', 'N/A')}°F")
            print(f"   Current condition: {current.get('condition', 'N/A')}")
            print(f"   Forecast days: {len(forecast)}")
            print(f"   Hourly data points: {len(hourly)}")
            
            if forecast:
                first_day = forecast[0]
                print(f"   First forecast: {first_day.get('day', 'N/A')} - {first_day.get('temp_min', 'N/A')}°/{first_day.get('temp_max', 'N/A')}°")
            
            if hourly:
                first_hour = hourly[0]
                print(f"   First hourly: {first_hour.get('time', 'N/A')} - {first_hour.get('temp', 'N/A')}°")

    def test_news_endpoint(self):
        """Test news API"""
        print("\n=== Testing News Endpoint ===")
        
        success, headlines = self.run_test("Get News Headlines", "GET", "news", 200)
        if success:
            print(f"   Found {len(headlines)} headlines")
            if headlines:
                first_headline = headlines[0]
                print(f"   First headline: {first_headline.get('title', 'N/A')[:80]}...")
                print(f"   Source: {first_headline.get('source', 'N/A')}")
                print(f"   Is fallback: {first_headline.get('is_fallback', False)}")

    def run_all_tests(self):
        """Run all API tests"""
        print(f"🚀 Starting Hotel Lobby Display API Tests")
        print(f"📍 Testing against: {self.base_url}")
        print("=" * 60)

        # Run all test suites
        self.test_health_endpoints()
        self.test_settings_endpoints()
        self.test_images_endpoints()
        self.test_weather_endpoint()
        self.test_extended_weather_endpoint()
        self.test_news_endpoint()

        # Print summary
        print("\n" + "=" * 60)
        print(f"📊 Test Results Summary")
        print(f"   Tests passed: {self.tests_passed}/{self.tests_run}")
        print(f"   Success rate: {(self.tests_passed/self.tests_run)*100:.1f}%")
        
        # Print failed tests
        failed_tests = [t for t in self.test_results if not t["success"]]
        if failed_tests:
            print(f"\n❌ Failed Tests:")
            for test in failed_tests:
                print(f"   - {test['test_name']}: {test.get('error', 'Status mismatch')}")
        
        return self.tests_passed == self.tests_run

def main():
    tester = HotelLobbyAPITester()
    success = tester.run_all_tests()
    
    # Save detailed results
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    results_file = f"/app/backend_test_results_{timestamp}.json"
    
    with open(results_file, 'w') as f:
        json.dump({
            "timestamp": timestamp,
            "total_tests": tester.tests_run,
            "passed_tests": tester.tests_passed,
            "success_rate": (tester.tests_passed/tester.tests_run)*100 if tester.tests_run > 0 else 0,
            "test_results": tester.test_results
        }, f, indent=2)
    
    print(f"\n📄 Detailed results saved to: {results_file}")
    
    return 0 if success else 1

if __name__ == "__main__":
    sys.exit(main())