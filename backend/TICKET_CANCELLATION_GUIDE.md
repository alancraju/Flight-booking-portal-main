# Ticket Cancellation API Guide

## Features Added

### 1. Cancel Entire Booking
**Endpoint:** `POST /api/bookings/:id/cancel`

Cancels all tickets in a booking and restores all seats to inventory.

**Request:**
```bash
curl -X POST http://localhost:5000/api/bookings/507f1f77bcf86cd799439011/cancel \
  -H "Authorization: Bearer YOUR_CLERK_TOKEN"
```

**Response:**
```json
{
  "message": "Booking cancelled successfully and seats restored",
  "booking": {
    "_id": "507f1f77bcf86cd799439011",
    "paymentStatus": "Cancelled",
    "cancelledAt": "2026-04-29T10:30:00.000Z",
    ...
  },
  "refundRequired": true
}
```

---

### 2. Cancel Specific Tickets (NEW)
**Endpoint:** `POST /api/bookings/:bookingId/cancel-ticket`

Cancel specific passengers from a booking without cancelling the entire booking.

**Request:**
```bash
curl -X POST http://localhost:5000/api/bookings/507f1f77bcf86cd799439011/cancel-ticket \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_CLERK_TOKEN" \
  -d '{
    "passengerIndices": [0, 2]
  }'
```

**Explanation:**
- `passengerIndices`: Array of passenger positions to cancel (0-indexed)
- Example: `[0, 2]` cancels 1st and 3rd passengers, keeps 2nd

**Response:**
```json
{
  "message": "2 ticket(s) cancelled successfully",
  "booking": {
    "_id": "507f1f77bcf86cd799439011",
    "passengers": [
      {
        "name": "John Doe",
        "age": 30,
        "gender": "M"
      }
    ],
    "seats": ["2B"],
    "totalAmount": 5000,
    ...
  },
  "cancelledPassengers": [
    {
      "name": "Jane Doe",
      "age": 28,
      "gender": "F"
    },
    {
      "name": "Bob Smith",
      "age": 35,
      "gender": "M"
    }
  ],
  "refundAmount": 10000
}
```

---

## Scenarios

### Scenario 1: Cancel Entire Booking
User booked 3 tickets but wants to cancel all.

```bash
POST /api/bookings/123/cancel
```
- All 3 seats restored to inventory
- Booking marked as "Cancelled"
- Full refund eligible

---

### Scenario 2: Cancel 1 Ticket from Multi-Ticket Booking
User booked 3 tickets but one passenger can't travel.

```bash
POST /api/bookings/123/cancel-ticket
{
  "passengerIndices": [1]
}
```
- 1 seat restored to inventory
- Booking remains active with 2 passengers
- Partial refund calculated

---

### Scenario 3: Cancel Multiple Specific Tickets
User booked 5 tickets, 2 passengers can't go.

```bash
POST /api/bookings/123/cancel-ticket
{
  "passengerIndices": [1, 3]
}
```
- 2 seats restored
- Booking continues with 3 passengers
- 2-ticket refund calculated

---

## Refund Logic

Both endpoints return refund information:

- **Full Booking Cancel**: Full refund if paid
- **Partial Ticket Cancel**: Refund per cancelled ticket calculated as:
  ```
  refundAmount = (totalAmount / originalPassengerCount) × cancelledCount
  ```

---

## Error Handling

### Invalid Passenger Index
```json
{
  "message": "Invalid passenger index"
}
```

### Trying to Cancel Already Cancelled Booking
```json
{
  "message": "Cannot modify cancelled booking"
}
```

### Cancelling All Passengers
If you cancel all remaining passengers, the entire booking is cancelled:
```bash
POST /api/bookings/123/cancel-ticket
{
  "passengerIndices": [0, 1, 2]  # All 3 passengers
}
```
→ Entire booking cancelled (same as `/cancel` endpoint)

---

## Logging

Check server logs for cancellation details:

```
🔄 Restoring 2 seats to inventory...
✅ 2 tickets cancelled from booking 507f1f77bcf86cd799439011
```

Or for full cancellation:

```
⚠️ Cancelling paid booking 507f1f77bcf86cd799439011. Refund required.
🔄 Restoring 3 seats to inventory...
✅ Booking 507f1f77bcf86cd799439011 cancelled and seats restored
```

---

## Frontend Integration Example (React)

```jsx
// Cancel specific tickets
const cancelTickets = async (bookingId, passengerIndices) => {
  const response = await fetch(`/api/bookings/${bookingId}/cancel-ticket`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${clerkToken}`
    },
    body: JSON.stringify({ passengerIndices })
  });
  return response.json();
};

// Usage
cancelTickets('507f1f77bcf86cd799439011', [0, 2])
  .then(data => {
    console.log(`Refund: ${data.refundAmount}`);
    console.log('Cancelled:', data.cancelledPassengers);
  });
```

---

## Database Updates

When cancelling tickets, the system:

1. ✅ Reduces `FlightInventory[classType].availableSeats`
2. ✅ Updates `Booking.passengers` array
3. ✅ Updates `Booking.seats` array
4. ✅ Recalculates `Booking.totalAmount`
5. ✅ Adds `Booking.cancelledAt` timestamp (full cancel only)
