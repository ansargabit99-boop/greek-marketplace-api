# Geek Marketplace API

A REST API for a classifieds service where users can post and browse ads for LEGO sets, board games, books, souvenirs, etc.

## Tech Stack
- Node.js + Express
- PostgreSQL
- JWT Authentication
- Bcrypt password hashing

## Getting Started

1. Clone the repository
2. Install dependencies:
   cd backend
   npm install

3. Create .env file in backend folder:
   PORT=3000
   JWT_SECRET=your_secret_key
   DB_USER=postgres
   DB_PASSWORD=your_password
   DB_HOST=localhost
   DB_PORT=5432
   DB_NAME=greek-marketplace-api

4. Run the server:
   npm start

## Test Accounts
- User: ethan@ws-s17.kz / ethan_123
- Moderator: olivia@ws-s17.kz / olivia_123

## API Endpoints

### Auth
- POST /api/register - Register new user
- POST /api/login - Login with email or phone
- GET /api/me - Get own profile (auth required)
- PUT /api/me - Update own profile (auth required)
- GET /api/me/adverts - Get own adverts (auth required)

### Categories
- GET /api/categories - Get all categories

### Adverts
- GET /api/post - Get all published adverts (filters: search, category, minPrice, maxPrice, sort, page)
- GET /api/post/:id - Get advert detail + view tracking
- POST /api/post - Create advert (auth required)
- PUT /api/post/:id - Edit advert (auth required)
- DELETE /api/post/:id - Delete advert (auth required)
- PUT /api/post/:id/status - Change advert status (auth required)

### Advantage Services
- POST /api/post/:id/service - Activate VIP or TOP service (auth required)
- PUT /api/post/:id/service - Extend service (auth required)
- GET /api/post/:id/service - Get service info (auth required)

## Advantage Services

### VIP Service (7 days)
- First 3 positions in results are random VIP adverts
- Ignores text filter
- Price filter has ±100 tolerance

### TOP Service (3 days)
- Always appears before VIP block
- Subject to all filters
- Multiple TOP adverts sorted by most recently activated first