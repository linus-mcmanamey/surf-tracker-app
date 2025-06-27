# iOS Deployment Guide

## Overview

This document explains how to deploy the surf tracking application as an iOS app that connects to the existing backend API and Railway PostgreSQL database.

## Architecture

The surf tracking application follows a client-server architecture:

```
iOS App (Swift/React Native)
    ↓ HTTPS API calls
Backend API (Express.js on Railway)
    ↓ PostgreSQL connection
Railway Database (PostgreSQL)
```

## Backend API Endpoints

Your Express.js backend provides RESTful APIs that the iOS app will consume:

### Surf Spots

- `GET /api/surf-spots` - Fetch all active surf spots
- `POST /api/surf-spots` - Create a new surf spot
- `PUT /api/surf-spots/:id` - Update a surf spot
- `DELETE /api/surf-spots/:id` - Delete a surf spot

### Surf Sessions

- `GET /api/sessions` - Fetch all surf sessions
- `POST /api/sessions` - Create a new surf session

### Dashboard

- `GET /api/dashboard/stats` - Get dashboard statistics

## iOS Implementation Options

### Option 1: Native iOS App (Swift)

#### Network Layer

Create a dedicated API service class using URLSession:

```swift
class SurfAPIService {
    private let baseURL = "https://your-app.railway.app"

    func fetchSurfSpots() async throws -> [SurfSpot] {
        let url = URL(string: "\(baseURL)/api/surf-spots")!
        let (data, _) = try await URLSession.shared.data(from: url)
        return try JSONDecoder().decode([SurfSpot].self, from: data)
    }

    func createSurfSpot(_ spot: SurfSpot) async throws -> SurfSpot {
        let url = URL(string: "\(baseURL)/api/surf-spots")!
        var request = URLRequest(url: url)
        request.httpMethod = "POST"
        request.setValue("application/json", forHTTPHeaderField: "Content-Type")
        request.httpBody = try JSONEncoder().encode(spot)

        let (data, _) = try await URLSession.shared.data(for: request)
        return try JSONDecoder().decode(SurfSpot.self, from: data)
    }
}
```

#### Data Models

```swift
struct SurfSpot: Codable, Identifiable {
    let id: Int
    let name: String
    let latitude: Double
    let longitude: Double
    let breakType: String
    let skillRequirement: String
    let notes: String?
    let totalSessions: Int
    let averageRating: Double?
    let createdAt: String

    enum CodingKeys: String, CodingKey {
        case id, name, latitude, longitude, notes
        case breakType = "break_type"
        case skillRequirement = "skill_requirement"
        case totalSessions = "total_sessions"
        case averageRating = "average_rating"
        case createdAt = "created_at"
    }
}
```

### Option 2: React Native App

#### API Service

```javascript
class SurfAPI {
  constructor() {
    this.baseURL = "https://your-app.railway.app";
  }

  async fetchSurfSpots() {
    const response = await fetch(`${this.baseURL}/api/surf-spots`);
    if (!response.ok) throw new Error("Failed to fetch surf spots");
    return response.json();
  }

  async createSurfSpot(spotData) {
    const response = await fetch(`${this.baseURL}/api/surf-spots`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(spotData),
    });
    if (!response.ok) throw new Error("Failed to create surf spot");
    return response.json();
  }
}
```

## Deployment Steps

### 1. Deploy Backend to Railway

Your Express.js backend needs to be deployed to Railway to provide a public API endpoint.

#### Prepare for Production

Update your `server/index.js` to handle production environment:

```javascript
// Add to your server/index.js
const PORT = process.env.PORT || 5000;

app.listen(PORT, "0.0.0.0", () => {
  console.log(`Server running on port ${PORT}`);
});
```

#### Railway Deployment

1. Connect your GitHub repository to Railway
2. Deploy the Node.js service
3. Set environment variables:
   - `DATABASE_URL` (Railway PostgreSQL connection string)
   - `NODE_ENV=production`
4. Railway will automatically detect and run your Express app

### 2. Configure Domain and HTTPS

Railway provides automatic HTTPS certificates. Your API will be available at:
`https://your-app-name.up.railway.app`

### 3. iOS App Development

#### Project Setup

1. Create new Xcode project or React Native project
2. Configure network permissions in Info.plist (for native iOS)
3. Add required dependencies for HTTP networking

#### Environment Configuration

```swift
// Config.swift
struct Config {
    static let apiBaseURL = "https://your-app.railway.app"

    #if DEBUG
    static let isDebugMode = true
    #else
    static let isDebugMode = false
    #endif
}
```

#### Error Handling

Implement proper error handling for network requests:

```swift
enum APIError: Error {
    case invalidURL
    case noData
    case decodingError
    case networkError(Error)
}

extension SurfAPIService {
    func handleAPIError(_ error: Error) -> APIError {
        if error is DecodingError {
            return .decodingError
        }
        return .networkError(error)
    }
}
```

## Security Considerations

### 1. API Authentication

Consider implementing authentication for production:

```javascript
// Add to your Express routes
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) {
    return res.sendStatus(401);
  }

  // Verify JWT token
  jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, user) => {
    if (err) return res.sendStatus(403);
    req.user = user;
    next();
  });
};

app.get("/api/surf-spots", authenticateToken, async (req, res) => {
  // Protected route
});
```

### 2. Rate Limiting

Implement rate limiting to prevent API abuse:

```javascript
const rateLimit = require("express-rate-limit");

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
});

app.use("/api/", limiter);
```

### 3. Input Validation

Add validation middleware:

```javascript
const { body, validationResult } = require("express-validator");

app.post(
  "/api/surf-spots",
  [
    body("name").isLength({ min: 1 }).escape(),
    body("latitude").isFloat({ min: -90, max: 90 }),
    body("longitude").isFloat({ min: -180, max: 180 }),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    // Process request
  }
);
```

## Offline Support

### 1. Local Database (iOS)

Implement Core Data or SQLite for offline storage:

```swift
class OfflineDataManager {
    func cacheSurfSpots(_ spots: [SurfSpot]) {
        // Store in Core Data
    }

    func getCachedSurfSpots() -> [SurfSpot] {
        // Retrieve from Core Data
    }

    func syncWithServer() async {
        // Sync cached data with server when online
    }
}
```

### 2. Network Connectivity Detection

```swift
import Network

class NetworkMonitor: ObservableObject {
    private let monitor = NWPathMonitor()
    @Published var isConnected = false

    init() {
        monitor.pathUpdateHandler = { path in
            DispatchQueue.main.async {
                self.isConnected = path.status == .satisfied
            }
        }
        monitor.start(queue: DispatchQueue.global())
    }
}
```

## Testing

### 1. API Testing

Test your API endpoints before iOS development:

```bash
# Test surf spots endpoint
curl -X GET https://your-app.railway.app/api/surf-spots

# Test creating a surf spot
curl -X POST https://your-app.railway.app/api/surf-spots \
  -H "Content-Type: application/json" \
  -d '{"name":"Test Spot","latitude":34.0522,"longitude":-118.2437,"breakType":"Beach Break","skillRequirement":"Beginner","description":"Test spot"}'
```

### 2. iOS Unit Tests

```swift
class SurfAPIServiceTests: XCTestCase {
    func testFetchSurfSpots() async throws {
        let service = SurfAPIService()
        let spots = try await service.fetchSurfSpots()
        XCTAssertGreaterThan(spots.count, 0)
    }
}
```

## Performance Optimization

### 1. Caching Strategy

```swift
class CacheManager {
    private let cache = NSCache<NSString, NSData>()

    func cacheResponse(for url: String, data: Data) {
        cache.setObject(data as NSData, forKey: url as NSString)
    }

    func getCachedResponse(for url: String) -> Data? {
        return cache.object(forKey: url as NSString) as Data?
    }
}
```

### 2. Image Loading

For surf spot images, implement efficient image loading:

```swift
class ImageLoader: ObservableObject {
    @Published var image: UIImage?

    func load(from url: URL) {
        URLSession.shared.dataTask(with: url) { data, _, _ in
            guard let data = data, let image = UIImage(data: data) else { return }
            DispatchQueue.main.async {
                self.image = image
            }
        }.resume()
    }
}
```

## App Store Deployment

### 1. Prepare for Release

- Configure app icons and launch screens
- Update Info.plist with required permissions
- Set up proper signing certificates
- Configure release build settings

### 2. Build and Archive

```bash
# For React Native
npx react-native run-ios --configuration Release

# For native iOS, use Xcode Archive feature
```

### 3. App Store Connect

1. Create app record in App Store Connect
2. Upload build using Xcode or Transporter
3. Configure app metadata and screenshots
4. Submit for review

## Monitoring and Analytics

### 1. Error Tracking

Implement error tracking in your iOS app:

```swift
import Crashlytics

func logError(_ error: Error, context: String) {
    Crashlytics.crashlytics().record(error: error)
    Crashlytics.crashlytics().log("Error in \(context): \(error.localizedDescription)")
}
```

### 2. API Monitoring

Monitor your Railway-hosted API:

```javascript
// Add logging middleware to Express
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});
```

## Conclusion

Your surf tracking application is well-architected for iOS deployment. The Express.js API provides a clean interface for the iOS app to interact with the PostgreSQL database hosted on Railway. The key benefits of this architecture include:

1. **Scalability**: Railway can handle increased load as your app grows
2. **Data Consistency**: Centralized database ensures all users see the same data
3. **Real-time Updates**: Multiple users can add/update surf spots and sessions
4. **Cross-platform**: The same API can serve iOS, Android, and web clients

The next steps would be to:

1. Deploy your Express.js backend to Railway
2. Begin iOS app development using the API endpoints
3. Implement offline support and caching
4. Add authentication and security measures
5. Test thoroughly before App Store submission
