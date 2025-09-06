# Booking API Data Structure

This document describes the JSON data structure sent to `POST /api/booking/` when users click the "Add Booking" button on the quotes page.

## API Endpoint
```
POST {VITE_API_URL}/api/booking/
Content-Type: application/json
Authorization: Bearer {accessToken}

Environment Variable: VITE_API_URL=https://travelbook-backend.onrender.com
Full URL: https://travelbook-backend.onrender.com/api/booking/
```

## Authentication
All API requests require authentication. The system automatically includes the authorization header:

- **Token Source**: `localStorage.getItem('accessToken')`
- **Header Format**: `Authorization: Bearer {token}`
- **Without Token**: Server returns 401 Unauthorized

The `apiCall` helper function from `/src/config/api.ts` handles authentication automatically.

## Request Body Structure

### Customer Information
```json
{
  "customer": {
    "name": "string",           // Customer full name (required)
    "email": "string",          // Email address (defaults to "noemail@example.com")
    "phone": "string",          // Phone number (cleaned from mask format)
    "language": "string",       // Language code (es, en, pt, fr, de)
    "country": "string",        // Country of origin
    "idNumber": "string",       // ID/Passport (cleaned from mask format)
    "cpf": "string",           // Brazilian CPF if applicable
    "address": "string"         // Full address
  }
}
```

### Tours Array
```json
{
  "tours": [
    {
      "id": "string",           // Unique tour booking ID (timestamp)
      "tourId": "string",       // Tour catalog ID
      "tourName": "string",     // Tour display name
      "tourCode": "string",     // Tour code/SKU
      "date": "ISO_DATE",       // Operation date
      "pickupAddress": "string", // Hotel/pickup location
      "pickupTime": "string",   // Time in HH:MM format
      "adultPax": "number",     // Number of adult passengers
      "adultPrice": "number",   // Price per adult
      "childPax": "number",     // Number of child passengers
      "childPrice": "number",   // Price per child
      "infantPax": "number",    // Number of infant passengers
      "infantPrice": "number",  // Price per infant
      "subtotal": "number",     // Calculated tour subtotal
      "operator": "string",     // Tour operator ("own-operation" or supplier name)
      "comments": "string"      // Special requests/comments
    }
  ]
}
```

### Tour Details Summary
```json
{
  "tourDetails": {
    "destination": "string",    // Primary destination
    "tourType": "string",       // Primary tour code
    "startDate": "ISO_DATE",    // First tour date
    "endDate": "ISO_DATE",      // Last tour date
    "passengers": "number",     // Total passenger count across all tours
    "passengerBreakdown": {
      "adults": "number",       // Total adults across all tours
      "children": "number",     // Total children across all tours
      "infants": "number"       // Total infants across all tours
    },
    "hotel": "string",         // Default hotel/accommodation
    "room": "string"           // Room/unit number
  }
}
```

### Pricing Information
```json
{
  "pricing": {
    "amount": "number",        // Total booking amount
    "currency": "string",      // Currency code (CLP, USD, EUR, BRL, ARS)
    "breakdown": [             // Detailed pricing breakdown
      {
        "item": "string",      // Item description
        "quantity": "number",  // Quantity
        "unitPrice": "number", // Price per unit
        "total": "number"      // Line total
      }
    ]
  }
}
```

### Booking Configuration
```json
{
  "leadSource": "string",         // Origin (website, phone, email, walkIn, referral, instagram, youtube)
  "assignedTo": "string",         // Salesperson name
  "agency": "null|string",        // External agency (usually null for direct bookings)
  "status": "string",             // Booking status (always "confirmed")
  "validUntil": "ISO_DATE",       // Quote validity date
  "additionalNotes": "string",    // Accommodation/special notes
  "hasMultipleAddresses": "boolean", // Whether passengers have different addresses
  "termsAccepted": {
    "accepted": "boolean"         // Terms acceptance (always false initially)
  }
}
```

### Quote Configuration
```json
{
  "quotationComments": "string",     // Comments about the quotation
  "includePayment": "boolean",       // Whether payment details are included
  "copyComments": "boolean",         // Copy comments to purchase order
  "sendPurchaseOrder": "boolean",    // Send PO access to customer
  "sendQuotationAccess": "boolean"   // Send quote access to customer
}
```

### Payment Details (Optional)
```json
{
  "paymentDetails": {              // Only included if includePayment is true
    "date": "ISO_DATE",            // Payment date
    "method": "string",            // Payment method (credit-card, bank-transfer, etc.)
    "percentage": "number",        // Payment percentage (0-100)
    "amountPaid": "number",        // Amount paid
    "comments": "string",          // Payment comments
    "status": "string",            // Payment status (pending, partial, paid, refunded, cancelled)
    "receiptFile": "File|null"     // Receipt file upload
  }
}
```

## Payment Methods
- `credit-card` - Credit Card
- `bank-transfer` - Bank Transfer
- `cash-office` - Cash Office
- `mercado-pago` - Mercado Pago
- `pix` - PIX
- `nubank-transfer` - Nubank Transfer
- `wise` - Wise Transfer

## Currency Codes
- `CLP` - Chilean Pesos
- `USD` - US Dollars
- `EUR` - Euros
- `BRL` - Brazilian Reais
- `ARS` - Argentine Pesos

## Language Codes
- `es` - Spanish
- `en` - English
- `pt` - Portuguese
- `fr` - French
- `de` - German

## Notes
- All monetary amounts are in the smallest currency unit (no decimals for CLP, cents for USD)
- Phone numbers are stored without formatting (digits only)
- ID numbers are stored without formatting (alphanumeric only)
- Dates are in ISO 8601 format
- The `receiptFile` field contains the actual file object for file uploads