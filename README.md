# StockFlow MVP — Inventory Management System

## Tech Stack
- **Backend**: Node.js + Express + Prisma + SQLite
- **Frontend**: React + Vite + React Router
- **Auth**: JWT + Bcrypt

## Setup & Run

### Backend
cd backend
npm install
npx prisma db push
npx prisma generate
npm run dev

### Frontend
cd frontend
npm install
npm run dev

## API Endpoints
| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | /api/auth/signup | ❌ | Register user |
| POST | /api/auth/login | ❌ | Login get JWT |
| GET | /api/dashboard | ✅ | Stats and low stock |
| GET | /api/products | ✅ | List products |
| POST | /api/products | ✅ | Create product |
| PUT | /api/products/:id | ✅ | Update product |
| PATCH | /api/products/:id/adjust | ✅ | Stock adjustment |
| DELETE | /api/products/:id | ✅ | Soft delete |
| GET | /api/settings | ✅ | Get settings |
| PUT | /api/settings | ✅ | Update settings |

## Postman Collection
Import `StockFlow.postman_collection.json` in Postman to test all APIs.