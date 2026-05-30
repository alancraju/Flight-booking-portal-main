# MongoDB Booking Connection Troubleshooting

## Quick Checklist

### 1. Verify MongoDB is Running
```bash
# Check if MongoDB is running (Windows)
netstat -ano | findstr :27017

# Or try to connect with mongosh
mongosh mongodb://localhost:27017
```

If nothing listens on port 27017, **MongoDB is not running**. Start it:
- **MongoDB Community**: `mongod` command
- **MongoDB Atlas**: Ensure your cluster is active and connection string is correct

### 2. Check Environment Variables
Verify `.env` has correct MongoDB URI:
```
MONGO_URI=mongodb://localhost:27017/flight-booking
```

Common issues:
- Wrong host/port
- Missing authentication credentials (for Atlas)
- Typo in database name

### 3. Test the Connection
Start the backend and check:

```bash
# Check if server started and connected to MongoDB
npm start

# In another terminal, test the connection endpoint:
curl http://localhost:5000/api/db-status
```

Expected response:
```json
{
  "status": 1,
  "statusText": "connected",
  "database": "flight-booking",
  "host": "localhost",
  "mongoUri": "mongodb://localhost:27017/flight-booking"
}
```

**Status codes:**
- `0` = disconnected
- `1` = connected ✅
- `2` = connecting
- `3` = disconnecting

### 4. Test Booking Creation
```bash
# Test creating a booking (you need a valid auth token from Clerk)
curl -X POST http://localhost:5000/api/bookings \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_CLERK_TOKEN" \
  -d '{
    "flightId": "flight_id_here",
    "inventoryId": "inventory_id_here",
    "classType": "economy",
    "passengers": [{"name": "John", "age": 30, "gender": "M"}],
    "addons": {},
    "seats": ["1A"],
    "totalAmount": 5000
  }'
```

### 5. Check Server Logs
When starting the backend, you should see:
```
📡 Attempting MongoDB connection to: mongodb://localhost:27017/flight_booking
✅ MongoDB Connected: localhost
Database: flight-booking
Server running on port 5000
```

If you see errors:
```
❌ Error connecting to MongoDB: connect ECONNREFUSED 127.0.0.1:27017
```
→ MongoDB is not running

## Common Issues & Solutions

### Issue: ECONNREFUSED 127.0.0.1:27017
**Cause**: MongoDB service not running
**Solution**: Start MongoDB service

### Issue: ENOTFOUND localhost
**Cause**: Hostname resolution issue
**Solution**: Try `127.0.0.1` instead of `localhost` in MONGO_URI

### Issue: Authentication failed
**Cause**: MongoDB credentials incorrect (Atlas users)
**Solution**: Check username/password in connection string

### Issue: Booking created but not in database
**Cause**: Mongoose schema validation failed
**Check**: Browser console and server logs for validation errors

### Issue: "User not authenticated" error
**Cause**: Clerk auth token not provided or invalid
**Solution**: Ensure valid Clerk auth token in Authorization header

## Debugging with Logs

The updated code now includes detailed logging:

```
📝 Creating booking: {flightId, inventoryId, classType, passengerCount}
🔍 Checking inventory availability for economy...
✅ Seats reserved. Updated inventory: {...}
✅ Booking saved to MongoDB with ID: 507f1f77bcf86cd799439011
```

Watch for these logs to see where it fails.

## Next Steps

1. Start MongoDB
2. Verify `.env` MONGO_URI is correct
3. Run backend with `npm start`
4. Check `/api/db-status` endpoint
5. Review server logs for errors
6. Test booking creation with proper auth token

If still not working, share the output from:
- `npm start` (full server startup logs)
- `/api/db-status` response
- Booking creation error message
