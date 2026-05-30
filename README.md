# Flight Booking Portal

A full-stack flight booking application with search, inventory, booking, payment, and administration features.

## 🚀 What this project includes

- Flight search by origin, destination, and travel date
- Real flight inventory with economy/business pricing and seat availability
- Booking flow with passenger and payment data
- Admin dashboard for flights, airports, bookings, and inventory
- MongoDB database persistence
- React frontend powered by Vite
- Express backend with REST API routes

## 🧱 Project structure

- `backend/` — Node.js + Express backend code
- `frontend/` — React application powered by Vite

## ✅ Prerequisites

- Node.js 18+ / npm
- MongoDB installed locally or accessible via a connection URI

## 🔧 Setup instructions

### 1. Clone the repository

If you have not already cloned the repository, use:

```bash
git clone https://github.com/alancraju/flight-booking-portal-main.git
cd flight-booking-portal-main
```

### 2. Install dependencies

Install backend and frontend packages:

```bash
cd backend
npm install
cd ../frontend
npm install
```

### 3. Configure MongoDB

#### Option A: Local MongoDB

If MongoDB is installed locally, start it with one of these commands:

```bash
mongod --dbpath "./backend/mongodb-data" --logpath "./backend/mongodb-log/mongod.log" --bind_ip 127.0.0.1 --port 27017
```

> If you get permission errors, run the command with administrator rights or use a different local folder path.

#### Option B: Remote MongoDB Atlas or other URI

Create a `backend/.env` file with this content:

```env
MONGO_URI=your-mongodb-connection-string
PORT=5000
```

If you do not create `.env`, the backend will use the default local URI:

```text
mongodb://localhost:27017/flight-booking
```

### 4. Run the backend

Start the backend server from the `backend` folder:

```bash
cd backend
npm run dev
```

You should see:

```text
Server running on port 5000
MongoDB Connected: localhost
```

### 5. Run the frontend

Start the React frontend from the `frontend` folder:

```bash
cd frontend
npm run dev -- --host 127.0.0.1
```

Open the app in your browser at:

```text
http://127.0.0.1:5173
```

## 📌 How to use the app

### Search flights

1. Open the frontend app in the browser.
2. Enter the origin airport code (for example, `DEL`).
3. Enter the destination airport code (for example, `BOM`).
4. Pick a travel date.
5. Click `Search`.

### Demo route example

- Origin: `DEL`
- Destination: `BOM`
- Date: today or a valid date in the format shown by the UI

If the inventory is available, the app displays flights such as:

- `AI844` — Air India Express
- `ET736` — Etihad Airways
- `AI767` — Air India
- `EM933` — Emirates

## 🔍 API demo

Use this API endpoint to confirm the inventory search is working:

```bash
curl "http://127.0.0.1:5000/api/inventory/search?from=DEL&to=BOM&date=$(date +%Y-%m-%d)"
```

On Windows PowerShell:

```powershell
$url = "http://127.0.0.1:5000/api/inventory/search?from=DEL&to=BOM&date=$(Get-Date -Format yyyy-MM-dd)"
Invoke-WebRequest -Uri $url -UseBasicParsing | Select-Object -ExpandProperty Content
```

Expected response: JSON list of inventory records and flight details.

## 📚 Useful endpoints

- `GET /api/health` — API health check
- `GET /api/inventory/search` — search flight inventory
- `GET /api/flights` — list all flights
- `GET /api/airports` — list all airports
- `POST /api/bookings` — create a booking

## 💡 Notes

- Ensure MongoDB is running before starting the backend.
- The backend uses `dotenv`, so add `MONGO_URI` to `backend/.env` if not using local MongoDB.
- The frontend and backend run separately, so start both servers.

## 🧹 GitHub repository

If you want to push this project to GitHub, use:

```bash
git add .
git commit -m "Add project and README"
git push -u origin main
```

## 🎉 Ready to go

This repository is now configured to run locally with working backend and frontend steps.
Follow the demo section above to verify the flight search and inventory flow.
