# ⚔️ ConflictLens API

> A production-ready REST API for analyzing the economic impact of global military conflicts — built with Node.js, Express, and MongoDB.

[![Node.js](https://img.shields.io/badge/Node.js-18.x-green?style=flat-square&logo=node.js)](https://nodejs.org)
[![Express](https://img.shields.io/badge/Express-4.x-black?style=flat-square&logo=express)](https://expressjs.com)
[![MongoDB](https://img.shields.io/badge/MongoDB-7.x-green?style=flat-square&logo=mongodb)](https://mongodb.com)
[![JWT](https://img.shields.io/badge/Auth-JWT-orange?style=flat-square&logo=jsonwebtokens)](https://jwt.io)
[![License](https://img.shields.io/badge/License-MIT-blue?style=flat-square)](LICENSE)

---

## 📌 What is ConflictLens?

**ConflictLens** is a backend analytics API that stores, filters, queries, and compares economic data of global wars and conflicts. It covers 10+ major conflicts including WWII, Russia-Ukraine War, Syrian Civil War, Israel-Hamas War, Afghanistan War, Iraq War, Yemen Civil War, and more.

Each conflict record contains **28 economic indicators** such as:
- GDP change, inflation rate, currency devaluation
- Unemployment spike, youth unemployment
- Poverty rates, food insecurity, household poverty
- Black market activity, war profiteering
- Cost of war, reconstruction cost, informal economy size

---

## 🚀 Tech Stack

| Layer | Technology |
|-------|-----------|
| Runtime | Node.js 18.x |
| Framework | Express.js 4.x |
| Database | MongoDB 7.x + Mongoose 8.x |
| Authentication | JWT (Access + Refresh Tokens) |
| Password Hashing | bcryptjs |
| Security | Helmet, CORS, Rate Limiting |
| Logging | Morgan |
| Input Validation | express-validator |
| Dev Tool | Nodemon |

---

## 📁 Project Structure

```
conflictlens-api/
├── config/
│   ├── db.js                    # MongoDB connection
│   └── rateLimit.js             # Rate limit configurations
├── controllers/
│   ├── authController.js        # Auth request handlers
│   ├── conflictController.js    # Conflict CRUD handlers
│   ├── statsController.js       # Statistics handlers
│   └── adminController.js       # Admin-only handlers
├── middlewares/
│   ├── authMiddleware.js        # JWT verification
│   ├── adminMiddleware.js       # Admin role check
│   ├── errorMiddleware.js       # Global error handler
│   ├── loggerMiddleware.js      # Request logger
│   └── validateMiddleware.js   # Input validation
├── models/
│   ├── User.js                  # User schema
│   └── Conflict.js              # Conflict schema (28 fields)
├── routes/
│   ├── authRoutes.js
│   ├── conflictRoutes.js
│   ├── statsRoutes.js
│   └── adminRoutes.js
├── services/
│   ├── authService.js           # Auth business logic
│   ├── conflictService.js       # Conflict business logic
│   └── statsService.js          # Stats & aggregation logic
├── utils/
│   ├── asyncHandler.js          # Async wrapper utility
│   ├── apiResponse.js           # Standard response format
│   ├── apiError.js              # Custom error class
│   ├── pagination.js            # Reusable pagination
│   ├── filterBuilder.js         # Dynamic MongoDB filter
│   └── tokenUtils.js            # JWT helpers
├── data/
│   └── war_economic_impact_dataset.json
├── scripts/
│   └── seedData.js              # Database seeding script
├── .env
├── .env.example
├── .gitignore
├── package.json
├── server.js                    # Entry point
└── README.md
```

---

## ⚡ Quick Start

### Prerequisites
- Node.js 18.x or higher
- MongoDB running locally or MongoDB Atlas URI
- npm or yarn

### 1. Clone the Repository
```bash
git clone https://github.com/yourusername/conflictlens-api.git
cd conflictlens-api
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Setup Environment Variables
```bash
cp .env.example .env
```

Edit `.env` file:
```env
PORT=5000
MONGO_URI=mongodb://localhost:27017/conflictlens
JWT_SECRET=your_super_secret_jwt_key_here
JWT_REFRESH_SECRET=your_refresh_secret_here
JWT_EXPIRE=7d
JWT_REFRESH_EXPIRE=30d
NODE_ENV=development
ADMIN_SECRET_KEY=your_admin_register_key
```

### 4. Seed the Database
```bash
npm run seed
```

Output:
```
🔌 Connecting to MongoDB...
✅ MongoDB Connected: 127.0.0.1
🗑️  Clearing existing conflict data...
📥 Inserting 500+ conflict records...
✅ Successfully seeded 523 records
👋 Database connection closed
```

### 5. Start the Server
```bash
# Development (with auto-reload)
npm run dev

# Production
npm start
```

Output:
```
[Logger] Request logging enabled
✅ MongoDB Connected: 127.0.0.1
🚀 Server running on PORT 5000
📦 Environment: development
🔐 JWT Auth: Enabled
⚡ Rate Limiting: Enabled
```

---

## 🔐 Authentication

ConflictLens uses **JWT-based authentication** with access tokens and refresh tokens.

### Flow
```
Register/Login → Get Access Token (7d) + Refresh Token (30d)
         ↓
Send token in header: Authorization: Bearer <token>
         ↓
Access protected routes
         ↓
Token expired? → POST /api/v1/auth/refresh-token → New Access Token
```

### Register as Admin
Pass the `ADMIN_SECRET_KEY` from your `.env` to get admin role:
```json
{
  "name": "Admin User",
  "email": "admin@example.com",
  "password": "password123",
  "secretKey": "your_admin_register_key"
}
```

---

## 📡 API Documentation

**Base URL:** `http://localhost:5000/api/v1`

### Standard Response Format

**Success:**
```json
{
  "success": true,
  "message": "Conflicts fetched successfully",
  "data": [...],
  "pagination": {
    "total": 523,
    "page": 1,
    "limit": 10,
    "totalPages": 53,
    "hasNext": true,
    "hasPrev": false
  },
  "timestamp": "2026-05-14T10:30:00.000Z"
}
```

**Error:**
```json
{
  "success": false,
  "message": "Conflict not found",
  "error": "No document found with id: 663abc...",
  "timestamp": "2026-05-14T10:30:00.000Z"
}
```

---

### 🔑 Auth Routes

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/auth/register` | No | Register new user |
| POST | `/auth/login` | No | Login and get tokens |
| POST | `/auth/logout` | Yes | Logout and clear token |
| GET | `/auth/me` | Yes | Get logged-in user info |
| POST | `/auth/refresh-token` | No | Refresh access token |

**Register:**
```bash
POST /api/v1/auth/register
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123"
}
```

**Login:**
```bash
POST /api/v1/auth/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "password123"
}
```

---

### ⚔️ Conflict Routes

#### CRUD Operations

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/conflicts` | No | Get all conflicts (with filters) |
| GET | `/conflicts/:id` | No | Get conflict by ID |
| POST | `/conflicts` | Yes | Create new conflict |
| PUT | `/conflicts/:id` | Yes | Replace conflict data |
| PATCH | `/conflicts/:id` | Yes | Update specific fields |
| DELETE | `/conflicts/:id` | Yes | Soft delete conflict |

#### Filter by Route Params

| Endpoint | Description |
|----------|-------------|
| `/conflicts/region/:region` | Filter by region |
| `/conflicts/country/:country` | Filter by country |
| `/conflicts/type/:type` | Filter by conflict type |
| `/conflicts/status/:status` | Filter by status |
| `/conflicts/region/:region/latest` | Latest conflict in region |
| `/conflicts/region/:region/oldest` | Oldest conflict in region |
| `/conflicts/country/:country/history` | Full country conflict history |

#### Query Parameters (GET /conflicts)

| Parameter | Type | Example | Description |
|-----------|------|---------|-------------|
| `status` | String | `?status=Ongoing` | Filter by status |
| `region` | String | `?region=Europe` | Filter by region |
| `country` | String | `?country=Ukraine` | Filter by country |
| `type` | String | `?type=Civil War` | Filter by conflict type |
| `keyword` | String | `?keyword=ukraine` | Search in name/country/region |
| `inflationAbove` | Number | `?inflationAbove=80` | Inflation rate above value |
| `inflationBelow` | Number | `?inflationBelow=20` | Inflation rate below value |
| `gdpLossAbove` | Number | `?gdpLossAbove=30` | GDP loss above value |
| `povertyAbove` | Number | `?povertyAbove=40` | Poverty rate above value |
| `foodInsecurityAbove` | Number | `?foodInsecurityAbove=30` | Food insecurity above value |
| `blackMarket` | String | `?blackMarket=High` | Filter by black market level |
| `profiteering` | String | `?profiteering=Yes` | Filter by profiteering |
| `startYear` | Number | `?startYear=1939` | Filter by start year |
| `endYear` | Number | `?endYear=1945` | Filter by end year |
| `minInflation` | Number | `?minInflation=20` | Min inflation range |
| `maxInflation` | Number | `?maxInflation=80` | Max inflation range |
| `minGDP` | Number | `?minGDP=-50` | Min GDP change |
| `maxGDP` | Number | `?maxGDP=-20` | Max GDP change |
| `page` | Number | `?page=1` | Page number (default: 1) |
| `limit` | Number | `?limit=10` | Results per page (default: 10, max: 100) |
| `sort` | String | `?sort=Inflation_Rate_Percentage` | Sort ascending |
| `sort` | String | `?sort=-GDP_Change_Percentage` | Sort descending (prefix -) |

**Combined Query Example:**
```bash
GET /api/v1/conflicts?status=Ongoing&region=Middle East&inflationAbove=50&page=1&limit=10&sort=-Inflation_Rate_Percentage
```

#### War-Specific Routes

| Endpoint | Description |
|----------|-------------|
| `/conflicts/war/:name/summary` | Full war summary |
| `/conflicts/war/:name/economic-impact` | Economic indicators |
| `/conflicts/war/:name/poverty-impact` | Poverty analysis |
| `/conflicts/war/:name/black-market` | Black market data |
| `/conflicts/war/:name/reconstruction` | Reconstruction costs |
| `/conflicts/war/:name/currency-crisis` | Currency crisis data |
| `/conflicts/war/:name/unemployment` | Unemployment analysis |

#### Special Routes

| Endpoint | Description |
|----------|-------------|
| `/conflicts/compare?conflict1=WWII&conflict2=Syria` | Compare two conflicts |
| `/conflicts/ongoing` | All ongoing conflicts |
| `/conflicts/resolved` | All resolved conflicts |
| `/conflicts/recent` | Most recent conflicts |
| `/conflicts/random` | Random conflict record |
| `/conflicts/top/highest-inflation` | Top inflation conflicts |
| `/conflicts/top/highest-poverty` | Top poverty conflicts |
| `/conflicts/high-risk` | High risk conflicts |
| `/conflicts/economic-collapse` | Economic collapse conflicts |

**Compare Example Response:**
```json
{
  "success": true,
  "message": "Comparison fetched successfully",
  "data": {
    "conflict1": {
      "name": "WWII",
      "recordCount": 25,
      "avgInflation": 72.3,
      "avgGDPChange": -28.5,
      "avgPoverty": 24.1,
      "avgUnemploymentSpike": 9.8,
      "totalWarCostUSD": 2500000000
    },
    "conflict2": {
      "name": "Syrian Civil War",
      "recordCount": 18,
      "avgInflation": 74.6,
      "avgGDPChange": -35.2,
      "avgPoverty": 44.3,
      "avgUnemploymentSpike": 31.2,
      "totalWarCostUSD": 3200000000
    }
  }
}
```

---

### 📊 Stats Routes (Aggregation)

| Endpoint | Description |
|----------|-------------|
| `/stats/total-conflicts` | Total conflict records |
| `/stats/ongoing-conflicts` | Count of ongoing conflicts |
| `/stats/resolved-conflicts` | Count of resolved conflicts |
| `/stats/highest-inflation` | Conflict with highest inflation |
| `/stats/lowest-gdp` | Conflict with most GDP loss |
| `/stats/highest-poverty` | Conflict with highest poverty |
| `/stats/highest-food-insecurity` | Highest food insecurity |
| `/stats/highest-currency-gap` | Highest black market rate gap |
| `/stats/highest-war-cost` | Most expensive war |
| `/stats/highest-reconstruction-cost` | Highest reconstruction cost |
| `/stats/region-summary` | Aggregated stats by region |
| `/stats/conflict-type-summary` | Stats grouped by conflict type |
| `/stats/inflation-by-region` | Average inflation per region |
| `/stats/top-gdp-loss` | Top 5 GDP loss conflicts |
| `/stats/black-market-summary` | Black market level distribution |
| `/stats/economic-overview` | Global economic overview |

**Region Summary Response:**
```json
{
  "success": true,
  "message": "Region summary fetched successfully",
  "data": [
    {
      "region": "Middle East",
      "conflictCount": 187,
      "avgInflation": 68.4,
      "avgGDPChange": -38.2,
      "avgPoverty": 39.7,
      "totalWarCostUSD": 4800000000,
      "totalReconstructionCostUSD": 12000000000,
      "avgUnemploymentSpike": 28.4
    }
  ]
}
```

---

### 🛡️ Admin Routes

All admin routes require: `Authorization: Bearer <token>` with admin role.

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/admin/conflicts` | Get all conflicts (including deleted) |
| POST | `/admin/conflicts` | Create conflict |
| DELETE | `/admin/conflicts/:id` | Hard delete conflict |
| PATCH | `/admin/conflicts/:id` | Update conflict |
| GET | `/admin/dashboard` | System dashboard stats |

---

### 🔧 Utility Routes

| Endpoint | Description |
|----------|-------------|
| `GET /api/v1/health` | API health check |
| `GET /api/v1/version` | API version info |

**Health Response:**
```json
{
  "success": true,
  "message": "Server is healthy",
  "data": {
    "status": "OK",
    "uptime": "2h 34m 12s",
    "environment": "development",
    "database": "connected",
    "timestamp": "2026-05-14T10:30:00.000Z"
  }
}
```

---

## 🗄️ MongoDB Schema

### Conflict Schema (28 fields)

```javascript
{
  Conflict_Name: String,                          // "Russia-Ukraine War"
  Conflict_Type: String,                          // "Interstate War"
  Region: String,                                 // "Europe"
  Start_Year: Number,                             // 2022
  End_Year: Number,                               // 2026
  Status: String,                                 // "Ongoing" | "Resolved"
  Primary_Country: String,                        // "Ukraine"
  Pre_War_Unemployment_Percentage: Number,        // 4.37
  During_War_Unemployment_Percentage: Number,     // 7.11
  Unemployment_Spike_Percentage_Points: Number,   // 2.74
  Most_Affected_Sector: String,                   // "Construction"
  Youth_Unemployment_Change_Percentage: Number,   // 3.87
  Pre_War_Poverty_Rate_Percentage: Number,        // 6.92
  During_War_Poverty_Rate_Percentage: Number,     // 8.82
  Extreme_Poverty_Rate_Percentage: Number,        // 5.07
  Food_Insecurity_Rate_Percentage: Number,        // 6.4
  Households_Fallen_Into_Poverty_Estimate: Number,// 433156
  GDP_Change_Percentage: Number,                  // -15.79
  Inflation_Rate_Percentage: Number,              // 41.72
  Currency_Devaluation_Percentage: Number,        // 77.17
  Cost_of_War_USD: Number,                        // 129571916155
  Estimated_Reconstruction_Cost_USD: Number,      // 198788464791
  Informal_Economy_Size_Pre_War_Percentage: Number, // 32.36
  Informal_Economy_Size_During_War_Percentage: Number, // 60.89
  Black_Market_Activity_Level: String,            // "Dominant"
  Primary_Black_Market_Goods: String,             // "fuel, medicine, currency"
  Currency_Black_Market_Rate_Gap_Percentage: Number, // 361.96
  War_Profiteering_Documented: String,            // "Yes" | "No"
  isDeleted: Boolean,                             // false (soft delete)
  createdAt: Date,
  updatedAt: Date
}
```

### MongoDB Indexes
```javascript
{ Conflict_Name: 'text', Primary_Country: 'text', Region: 'text' }  // Text search
{ Region: 1 }
{ Status: 1 }
{ Conflict_Type: 1 }
{ Primary_Country: 1 }
{ Inflation_Rate_Percentage: 1 }
{ GDP_Change_Percentage: 1 }
{ Black_Market_Activity_Level: 1 }
```

---

## 🧱 Architecture Overview

```
Request
   ↓
Rate Limiter
   ↓
Logger Middleware
   ↓
Auth Middleware (protected routes only)
   ↓
Admin Middleware (admin routes only)
   ↓
Validate Middleware (POST/PUT routes)
   ↓
Router
   ↓
Controller (req/res handling only)
   ↓
Service (business logic + DB queries)
   ↓
MongoDB (via Mongoose)
   ↓
ApiResponse (standardized output)
   ↓
Response
```

---

## ⚠️ Error Handling

| Error Type | Status Code | Example |
|-----------|-------------|---------|
| Validation Error | 400 | Required field missing |
| Invalid MongoDB ID | 400 | Malformed ObjectId |
| Unauthorized | 401 | No token / expired token |
| Forbidden | 403 | Not admin |
| Not Found | 404 | Conflict not found |
| Duplicate Entry | 409 | Email already exists |
| Rate Limit | 429 | Too many requests |
| Server Error | 500 | Internal server error |

---

## 🚦 Rate Limiting

| Route | Limit |
|-------|-------|
| General API | 100 requests / 15 minutes |
| Auth Routes | 10 requests / 15 minutes |
| Admin Routes | 50 requests / 15 minutes |

---

## 📮 Postman Collection

1. Open Postman
2. Click **Import**
3. Import the collection file: `ConflictLens_API.postman_collection.json`
4. Set environment variable: `base_url = http://localhost:5000/api/v1`
5. Register a user first to get your JWT token
6. Set `token` environment variable with your access token
7. Start testing all endpoints

---

## 🌱 Datasets Covered

| Conflict | Type | Region | Status |
|---------|------|--------|--------|
| WWII (Japan) | World War | East Asia | Resolved |
| WWII (Germany) | World War | Europe | Resolved |
| Russia-Ukraine War | Interstate War | Europe | Ongoing |
| Syrian Civil War | Civil War | Middle East | Ongoing |
| Israel-Hamas War | Asymmetric War | Middle East | Ongoing |
| Israel-Iran War | Interstate War | Middle East | Ongoing |
| Afghanistan War | Counter-insurgency | South Asia | Resolved |
| Iraq War | Interstate War | Middle East | Resolved |
| Yemen Civil War | Civil War | Middle East | Ongoing |
| DRC Conflict | Civil War | Africa | Ongoing |
| Tigray Conflict | Civil War | Africa | Resolved |

---

## 🔮 Future Improvements

- [ ] GraphQL API layer
- [ ] Redis caching for stats endpoints
- [ ] WebSocket for real-time conflict updates
- [ ] Data export (CSV, Excel) endpoints
- [ ] AI-powered conflict summary endpoint
- [ ] Swagger/OpenAPI documentation
- [ ] Docker containerization
- [ ] CI/CD pipeline with GitHub Actions
- [ ] Unit and integration tests (Jest)

---

## 📄 License

This project is licensed under the MIT License.

---

## 👨‍💻 Author

Built with ❤️ as a full-stack learning project — 2026

> **ConflictLens** — *See beyond the battlefield, understand the economic truth.*