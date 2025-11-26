
# Shipment Flow - Quick Reference

## 🚀 Quick Start

### User Journey
1. User fills out shipment form → **NewShipment**
2. Reviews details and selects payment → **ShipmentSummary**
3. Receives confirmation and tracking → **ShipmentConfirmation**

## 📋 Validation Rules

### Required Fields
- ✅ Sender name, phone, email
- ✅ Pickup address, city, country
- ✅ Delivery address, city, country
- ✅ Parcel weight

### Format Rules
- 📧 Email: `user@domain.com`
- 📱 Phone: Min 8 chars, digits + "+"
- ⚖️ Weight: > 0, max 100 kg
- 💰 Declared value: >= 0 (optional)

## 🔌 API Endpoints

### Calculate Quote
```
POST /shipments/quote
Auth: Required
Body: { sender, pickup, delivery, parcel }
Response: { quote_id, price, estimated_delivery }
```

### Create & Pay
```
POST /shipments/create-and-pay
Auth: Required
Body: { quote_id, payment_method, payment_token }
Response: { shipment_id, tracking_number, payment_status }
```

## 💳 Payment Methods

1. **Carte bancaire** (Card) → Immediate payment
2. **Mobile Money** → Processing status
3. **Cash on Delivery** → Pending status

## 🎨 UI Components

### Colors
- Primary: `#002C5F` (Maritime Blue)
- Success: `#4CAF50` (Green)
- Error: `#F44336` (Red)
- Accent: `#00C2FF` (Aqua Sky)

### Icons
- Checkmark: Success states
- Calculator: Quote calculation
- Credit card: Payment
- Location: Tracking

## 🛡️ Security

- ✅ JWT authentication required
- ✅ Server-side amount validation
- ✅ Input sanitization
- ✅ CORS protection
- ✅ Rate limiting

## 📊 Database Tables

### freight_quotes
- Stores quote requests
- Links to shipments when paid

### shipments
- Main shipment records
- Includes tracking number
- Status tracking

### events_log
- Audit trail
- User actions
- System events

## 🐛 Common Issues

### "Informations incorrectes"
- Check all required fields filled
- Validate email/phone format
- Ensure weight > 0

### "Service indisponible"
- Check Edge Function status
- Verify database connection
- Check Supabase logs

### Payment Failed
- Verify payment method selected
- Check quote_id exists
- Validate amount > 0

## 📱 Navigation

```
new-shipment
  ↓ (quote calculated)
shipment-summary
  ↓ (payment processed)
shipment-confirmation
  ↓ (track or dashboard)
shipment-detail OR client-dashboard
```

## 🔧 Testing

### Test Data
```javascript
{
  sender: {
    type: "individual",
    name: "John Doe",
    phone: "+212600000000",
    email: "john@doe.com"
  },
  pickup: {
    address: "Bd Anfa",
    city: "Casablanca",
    country: "MA"
  },
  delivery: {
    address: "Rue X",
    city: "Paris",
    country: "FR"
  },
  parcel: {
    type: "standard",
    weight_kg: 3.5,
    declared_value: 100,
    options: ["insurance"]
  }
}
```

## 📞 Support

- Check Supabase logs for errors
- Monitor Edge Function performance
- Review RLS policies if access denied
- Verify environment variables set

---

**Quick Links**:
- [Full Documentation](./NEW_SHIPMENT_PAYMENT_FLOW.md)
- [Validation Utils](../utils/validation.ts)
- [Edge Functions](../supabase/functions/)
