# SSLCommerz Payment Integration Guide

This document provides comprehensive information about the SSLCommerz payment gateway integration in the Thaka Jabe platform.

## Table of Contents
- [Overview](#overview)
- [Architecture](#architecture)
- [Setup & Configuration](#setup--configuration)
- [Backend Implementation](#backend-implementation)
- [Frontend Implementation](#frontend-implementation)
- [Payment Flow](#payment-flow)
- [Webhook & IPN](#webhook--ipn)
- [Error Handling](#error-handling)
- [Testing](#testing)
- [Production Checklist](#production-checklist)
- [Troubleshooting](#troubleshooting)

---

## Overview

### What is SSLCommerz?
SSLCommerz is Bangladesh's largest payment gateway service provider, offering secure online payment processing for businesses. The platform supports multiple payment methods including credit/debit cards, mobile banking, internet banking, and digital wallets.

### Integration Type
The Thaka Jabe platform uses the **SSLCommerz Hosted Payment Gateway** with:
- **Package**: `sslcommerz-lts` (v1.2.0+)
- **Mode**: Sandbox (development) / Live (production)
- **Integration Method**: Server-to-Server with redirect

### Key Features
- ✅ Secure payment processing with 256-bit SSL encryption
- ✅ Multiple payment methods (bKash, Nagad, cards, bank transfers)
- ✅ Real-time payment verification
- ✅ IPN (Instant Payment Notification) support
- ✅ Automatic refund processing
- ✅ Transaction tracking and logging
- ✅ Commission-based revenue tracking

---

## Architecture

### High-Level Flow
```
┌─────────────┐     ┌──────────────┐     ┌──────────────┐     ┌──────────────┐
│   Guest     │────>│   Frontend   │────>│   Backend    │────>│  SSLCommerz  │
│  (Browser)  │     │  (Next.js)   │     │  (Express)   │     │   Gateway    │
└─────────────┘     └──────────────┘     └──────────────┘     └──────────────┘
      ^                                           │                     │
      │                                           │                     │
      └───────────────────────────────────────────┴─────────────────────┘
                            Redirect & Callback
```

### Component Structure

#### Backend Components
```
thaka_jabe-server/
├── src/
│   ├── routes/
│   │   └── payments.ts              # Payment routes and handlers
│   ├── models/
│   │   ├── Payment.ts              # Payment transaction model
│   │   ├── Booking.ts              # Booking model
│   │   └── AccountLedger.ts        # Financial ledger
│   ├── schemas/
│   │   └── index.ts                # Payment validation schemas
│   └── utils/
│       └── bookingUtils.ts         # Booking overlap detection
```

#### Frontend Components
```
thakajabe/
├── app/(public)/
│   ├── booking/
│   │   ├── details/page.tsx        # Booking confirmation & payment init
│   │   ├── success/page.tsx        # Payment success page
│   │   └── failed/page.tsx         # Payment failure page
│   └── payment/
│       ├── page.tsx                # Legacy payment page
│       └── success/page.tsx        # Legacy success page
└── lib/
    └── api.ts                       # API client with payment methods
```

---

## Setup & Configuration

### 1. Environment Variables

#### Backend (.env)
```env
# Server Configuration
PORT=8080
BACKEND_URL=http://localhost:8080
FRONTEND_URL=http://localhost:3000
NODE_ENV=development

# MongoDB
MONGODB_URI=mongodb://localhost:27017/thakajabe

# SSLCommerz Credentials
SSL_STORE_ID=your_store_id_here
SSL_STORE_PASSWD=your_store_password_here

# SSLCommerz Callback URLs (Production)
# Note: These must be publicly accessible URLs
SSL_SUCCESS_URL=https://api.thakajabe.com/api/payments/ssl/success
SSL_FAIL_URL=https://api.thakajabe.com/api/payments/ssl/fail
SSL_CANCEL_URL=https://api.thakajabe.com/api/payments/ssl/cancel
SSL_IPN_URL=https://api.thakajabe.com/api/payments/ssl/ipn

# Optional: Marketing Pixels
FB_PIXEL_ACCESS_TOKEN=your_token
TIKTOK_ACCESS_TOKEN=your_token
```

#### Frontend (.env.local)
```env
NEXT_PUBLIC_API_BASE_URL=http://localhost:8080/api
NEXT_PUBLIC_IMG_BASE_URL=http://localhost:8080
```

### 2. Install Dependencies

#### Backend
```bash
cd thaka_jabe-server
pnpm add sslcommerz-lts
```

#### Frontend
```bash
cd thakajabe
# No additional packages required - uses fetch API
```

### 3. Obtain SSLCommerz Credentials

#### For Sandbox Testing
1. Visit [SSLCommerz Sandbox](https://developer.sslcommerz.com/)
2. Create a developer account
3. Get your sandbox credentials:
   - Store ID: `testbox`
   - Store Password: `qwerty`

#### For Production
1. Apply at [SSLCommerz](https://sslcommerz.com/)
2. Submit business documents:
   - Trade license
   - NID/Passport
   - Bank account details
3. Wait for approval (typically 3-5 business days)
4. Receive live credentials via email

---

## Backend Implementation

### 1. Database Models

#### Payment Transaction Model
```typescript
// src/models/Payment.ts
interface IPaymentTransaction {
  bookingId: ObjectId;           // Reference to booking
  gateway: 'sslcommerz';          // Payment gateway type
  sslSessionKey?: string;         // SSL session key
  valId?: string;                 // Validation ID from SSL
  amountTk: number;               // Amount in Taka
  status: 'pending' | 'completed' | 'failed' | 'cancelled';
  raw: any;                       // Raw response from SSL
  createdAt: Date;
  updatedAt: Date;
}
```

#### Key Fields
- **bookingId**: Links payment to a specific booking
- **sslSessionKey**: Session identifier from SSLCommerz init
- **valId**: Unique validation ID received after successful payment
- **status**: Payment status tracking
- **raw**: Complete response data for debugging

### 2. Payment Routes

#### POST `/api/payments/ssl/init`
**Purpose**: Initialize payment session with SSLCommerz

**Request**:
```json
{
  "bookingId": "507f1f77bcf86cd799439011"
}
```

**Process**:
1. Validate booking exists and belongs to authenticated user
2. Check booking status (must be `pending`)
3. Verify payment status (must be `unpaid`)
4. Check room approval status
5. Detect booking overlaps
6. Calculate total amount (price × nights)
7. Create payment transaction record
8. Initialize SSLCommerz session
9. Return gateway URL

**Response**:
```json
{
  "success": true,
  "message": "Payment session created successfully",
  "data": {
    "gatewayUrl": "https://sandbox.sslcommerz.com/gwprocess/v4/gw.php?Q=...",
    "sessionKey": "ABC123XYZ456..."
  }
}
```

**SSLCommerz Payload**:
```javascript
{
  total_amount: 5000,
  currency: 'BDT',
  tran_id: '507f1f77bcf86cd799439011',           // Payment transaction ID
  success_url: 'https://api.thakajabe.com/api/payments/ssl/success',
  fail_url: 'https://api.thakajabe.com/api/payments/ssl/fail',
  cancel_url: 'https://api.thakajabe.com/api/payments/ssl/cancel',
  ipn_url: 'https://api.thakajabe.com/api/payments/ssl/ipn',
  product_name: 'Room Booking - Luxury Suite',
  product_category: 'Accommodation',
  product_profile: 'general',
  cus_name: 'John Doe',
  cus_email: 'john@example.com',
  cus_phone: '+8801711123456',
  cus_add1: 'Dhaka',
  cus_city: 'Dhaka',
  cus_country: 'Bangladesh',
  multi_card_name: 'brac_visa,mastercard,amex,dbbl_nexus',
  value_a: 'bookingId',                          // Custom field: booking ID
  value_b: 'userId',                             // Custom field: user ID
  value_c: 'hostId',                             // Custom field: host ID
  value_d: '5000'                                // Custom field: amount
}
```

#### GET `/api/payments/ssl/success`
**Purpose**: Handle successful payment callback from SSLCommerz

**Query Parameters**:
- `val_id`: Validation ID from SSLCommerz
- `amount`: Transaction amount
- `tran_id`: Transaction ID (payment transaction ID)
- `status`: Payment status

**Process**:
1. Validate required parameters
2. Find payment transaction by `tran_id`
3. Verify payment with SSLCommerz using `val_id`
4. Check verification status and amount match
5. Update payment transaction status to `completed`
6. Update booking status to `confirmed` and payment to `paid`
7. Track purchase event for marketing pixels
8. Create commission entry in account ledger
9. Redirect to frontend success page

**Redirect**:
```
https://thakajabe.com/booking/success?bookingId=xxx&transactionId=yyy
```

#### GET `/api/payments/ssl/fail`
**Purpose**: Handle failed payment callback

**Process**:
1. Extract transaction ID and error
2. Update payment transaction status to `failed`
3. Store error details in raw field
4. Redirect to frontend failure page

**Redirect**:
```
https://thakajabe.com/booking/failed?error=payment_failed&bookingId=xxx
```

#### GET `/api/payments/ssl/cancel`
**Purpose**: Handle cancelled payment callback

**Process**:
1. Extract transaction ID
2. Update payment transaction status to `cancelled`
3. Redirect to frontend failure page with cancelled status

#### POST `/api/payments/ssl/ipn`
**Purpose**: Instant Payment Notification webhook from SSLCommerz

**Request Body** (from SSLCommerz):
```json
{
  "val_id": "ABC123XYZ456",
  "amount": "5000.00",
  "tran_id": "507f1f77bcf86cd799439011",
  "status": "VALID",
  "store_amount": "4900.00",
  "currency": "BDT",
  "bank_tran_id": "151114130739MqCBNx5",
  "card_type": "VISA-Dutch Bangla",
  "card_no": "432149XXXXXX0667",
  "card_issuer": "Dutch Bangla Bank",
  "card_brand": "VISA",
  "currency_type": "BDT",
  "currency_amount": "5000.00",
  "verify_sign": "abc123def456",
  "value_a": "bookingId",
  "value_b": "userId",
  "value_c": "hostId",
  "value_d": "5000"
}
```

**Process**:
1. Validate required fields
2. Find payment transaction
3. Verify payment with SSLCommerz
4. Update payment transaction with full details
5. If VALID, update booking status
6. Create commission ledger entry
7. Return 200 OK to acknowledge receipt

**Important**: IPN is sent by SSLCommerz as a backup notification. The main flow uses the success callback.

### 3. Validation Schema

```typescript
// src/schemas/index.ts
export const paymentInitSchema = z.object({
  bookingId: z.string().min(1, 'Booking ID is required'),
});
```

### 4. Security Features

#### Authentication
```typescript
router.post('/ssl/init', requireUser, validateBody(paymentInitSchema), async (req, res) => {
  // Only authenticated users can initiate payment
  // User ID is verified from JWT token
});
```

#### Booking Ownership Verification
```typescript
if (booking.userId._id.toString() !== req.user!.id) {
  return res.status(403).json({
    success: false,
    message: 'Access denied'
  });
}
```

#### Overlap Detection
```typescript
const hasOverlappingBookings = await hasOverlap(
  booking.roomId._id.toString(),
  booking.checkIn,
  booking.checkOut,
  booking._id.toString()
);

if (hasOverlappingBookings) {
  return res.status(400).json({
    success: false,
    message: 'Room is no longer available for the selected dates'
  });
}
```

#### Payment Verification
```typescript
const sslcommerz = new SSLCommerzPayment(store_id, store_passwd, is_live);
const verification = await sslcommerz.validate({ val_id });

if (verification.status === 'VALID' && verification.amount === amount) {
  // Payment is genuine, proceed with confirmation
}
```

### 5. Commission Tracking

```typescript
// After successful payment confirmation
if (booking.roomId && booking.roomId.commissionTk) {
  const commissionAmount = booking.roomId.commissionTk;
  const ledgerEntry = new AccountLedger({
    type: 'commission',
    ref: { bookingId: booking._id },
    amountTk: commissionAmount,
    note: `Commission from booking ${booking._id}`,
    at: new Date()
  });
  await ledgerEntry.save();
}
```

---

## Frontend Implementation

### 1. API Client

```typescript
// lib/api.ts
export const api = {
  payments: {
    // Initialize SSLCommerz payment
    initSsl: (data: { bookingId: string }) => 
      apiClient.post<{ gatewayUrl: string; sessionKey: string }>(
        '/payments/ssl/init', 
        data
      ),
    
    // Verify payment (legacy)
    verify: <T = any>(params: { val_id: string; tran_id: string }) =>
      apiClient.post<T>('/payments/ssl/verify', params),
    
    // Get payment status
    status: <T = any>(transactionId: string) => 
      apiClient.get<T>(`/payments/status/${transactionId}`),
  },
};
```

### 2. Booking Details Page

**File**: `thakajabe/app/(public)/booking/details/page.tsx`

**Purpose**: Display booking summary and initiate payment

**Key Functions**:

```typescript
const handleConfirmAndPay = async () => {
  // 1. Create booking
  const bookingData = {
    roomId: room._id,
    checkIn: checkIn,
    checkOut: checkOut,
    guests: adults + children,
    mode: 'instant'
  };

  const bookingResponse = await api.bookings.create(bookingData);
  
  if (bookingResponse.success) {
    const bookingId = bookingResponse.data.bookingId;
    
    // 2. Initialize payment
    const paymentResponse = await api.payments.initSsl({ bookingId });
    
    if (paymentResponse.success && paymentResponse.data?.gatewayUrl) {
      // 3. Redirect to SSLCommerz payment gateway
      window.location.href = paymentResponse.data.gatewayUrl;
    } else {
      alert('Failed to initialize payment');
    }
  }
};
```

**UI Components**:
- Room details card with images
- Date selection display
- Guest count
- Price breakdown (price × nights)
- Total amount in BDT
- "Confirm and Pay" button
- Countdown timer (24 hours to complete payment)

### 3. Payment Success Page

**File**: `thakajabe/app/(public)/booking/success/page.tsx`

**Purpose**: Display payment confirmation and booking details

**Process**:
1. Extract `val_id` and `tran_id` from URL query parameters
2. Verify payment using `/api/payments/ssl/verify` (optional)
3. Track purchase event with Facebook/TikTok pixels
4. Display booking confirmation
5. Show next steps for guest

**UI Components**:
- Success icon with animation
- Booking summary card
- Payment amount
- Booking ID and transaction ID
- Next steps guide:
  1. Check email for confirmation
  2. Contact host for check-in details
  3. Enjoy your stay
- "View My Bookings" button
- "Back to Home" button

### 4. Payment Failure Page

**File**: `thakajabe/app/(public)/booking/failed/page.tsx`

**Purpose**: Handle payment failures and cancellations

**Error Handling**:
- Display user-friendly error messages
- Show retry button
- Provide support contact information
- Link back to room details for retry

---

## Payment Flow

### Complete Payment Journey

```
┌─────────────────────────────────────────────────────────────────────┐
│                        1. User Browses Rooms                        │
│                     (Next.js Frontend - Search)                     │
└──────────────────────────────┬──────────────────────────────────────┘
                               │
                               ▼
┌─────────────────────────────────────────────────────────────────────┐
│                    2. User Selects Room & Dates                     │
│                   (Frontend - Room Details Page)                    │
└──────────────────────────────┬──────────────────────────────────────┘
                               │
                               ▼
┌─────────────────────────────────────────────────────────────────────┐
│                    3. Review Booking Details                        │
│                  (Frontend - Booking Details Page)                  │
│                                                                     │
│   • Room: Luxury Suite                                             │
│   • Check-in: 2024-01-15                                           │
│   • Check-out: 2024-01-17                                          │
│   • Guests: 2                                                      │
│   • Total: ৳10,000 (৳5,000 × 2 nights)                            │
│                                                                     │
│                  [Confirm and Pay Button]                          │
└──────────────────────────────┬──────────────────────────────────────┘
                               │ User clicks "Confirm and Pay"
                               ▼
┌─────────────────────────────────────────────────────────────────────┐
│                       4. Create Booking                             │
│                  POST /api/bookings/create                          │
│                                                                     │
│   Request: {                                                        │
│     roomId, checkIn, checkOut, guests, mode: 'instant'             │
│   }                                                                 │
│                                                                     │
│   Response: {                                                       │
│     success: true,                                                  │
│     data: { bookingId: "xxx", status: "pending" }                  │
│   }                                                                 │
└──────────────────────────────┬──────────────────────────────────────┘
                               │ Booking created with status: pending
                               ▼
┌─────────────────────────────────────────────────────────────────────┐
│                    5. Initialize Payment                            │
│                  POST /api/payments/ssl/init                        │
│                                                                     │
│   Request: { bookingId: "xxx" }                                     │
│                                                                     │
│   Backend Process:                                                  │
│   ✓ Validate booking ownership                                     │
│   ✓ Check booking status (pending)                                 │
│   ✓ Check payment status (unpaid)                                  │
│   ✓ Verify room approval                                           │
│   ✓ Detect overlapping bookings                                    │
│   ✓ Calculate amount                                               │
│   ✓ Create PaymentTransaction record                               │
│   ✓ Call SSLCommerz.init(paymentData)                             │
│                                                                     │
│   Response: {                                                       │
│     success: true,                                                  │
│     data: {                                                         │
│       gatewayUrl: "https://sandbox.sslcommerz.com/...",           │
│       sessionKey: "ABC123XYZ"                                       │
│     }                                                               │
│   }                                                                 │
└──────────────────────────────┬──────────────────────────────────────┘
                               │ Frontend receives gateway URL
                               ▼
┌─────────────────────────────────────────────────────────────────────┐
│                   6. Redirect to SSLCommerz                         │
│                window.location.href = gatewayUrl                    │
│                                                                     │
│   User lands on SSLCommerz payment gateway page                    │
└──────────────────────────────┬──────────────────────────────────────┘
                               │
                               ▼
┌─────────────────────────────────────────────────────────────────────┐
│                 7. User Completes Payment                           │
│                  (SSLCommerz Gateway)                               │
│                                                                     │
│   User selects payment method:                                      │
│   • bKash                                                           │
│   • Nagad                                                           │
│   • Credit/Debit Card                                              │
│   • Internet Banking                                                │
│                                                                     │
│   Enters payment details and confirms                               │
└──────────────────────────────┬──────────────────────────────────────┘
                               │ Payment processed by SSL
                               ▼
┌─────────────────────────────────────────────────────────────────────┐
│                    8a. Payment Successful                           │
│          SSLCommerz redirects to success_url                        │
│                                                                     │
│   GET /api/payments/ssl/success                                     │
│   ?val_id=xxx&amount=10000&tran_id=yyy&status=VALID               │
│                                                                     │
│   Backend Process:                                                  │
│   ✓ Verify payment with SSLCommerz.validate(val_id)               │
│   ✓ Check status === 'VALID' && amount matches                    │
│   ✓ Update PaymentTransaction: status = 'completed'                │
│   ✓ Update Booking: paymentStatus = 'paid', status = 'confirmed'  │
│   ✓ Track Purchase event (FB/TikTok pixels)                       │
│   ✓ Create commission entry in AccountLedger                       │
│                                                                     │
│   Redirect to:                                                      │
│   https://thakajabe.com/booking/success?bookingId=xxx              │
└──────────────────────────────┬──────────────────────────────────────┘
                               │
                               ▼
┌─────────────────────────────────────────────────────────────────────┐
│                    9. Display Success Page                          │
│              (Frontend - Payment Success Page)                      │
│                                                                     │
│   ✓ Show success icon and message                                  │
│   ✓ Display booking details                                        │
│   ✓ Show transaction ID                                            │
│   ✓ Provide next steps                                             │
│   ✓ Track pixel events                                             │
│   ✓ Send confirmation email (backend)                              │
└─────────────────────────────────────────────────────────────────────┘

                        ALTERNATIVE PATH:

┌─────────────────────────────────────────────────────────────────────┐
│                    8b. Payment Failed/Cancelled                     │
│          SSLCommerz redirects to fail_url/cancel_url                │
│                                                                     │
│   Backend Process:                                                  │
│   ✓ Update PaymentTransaction: status = 'failed'/'cancelled'       │
│   ✓ Booking remains in 'pending' state                             │
│                                                                     │
│   Redirect to:                                                      │
│   https://thakajabe.com/booking/failed?error=payment_failed        │
└──────────────────────────────┬──────────────────────────────────────┘
                               │
                               ▼
┌─────────────────────────────────────────────────────────────────────┐
│                    10. Display Failure Page                         │
│                                                                     │
│   • Show error message                                              │
│   • Provide retry option                                            │
│   • Show support contact                                            │
└─────────────────────────────────────────────────────────────────────┘

                        BACKGROUND PROCESS:

┌─────────────────────────────────────────────────────────────────────┐
│                    IPN (Instant Payment Notification)               │
│                                                                     │
│   SSLCommerz sends POST request to ipn_url                          │
│   POST /api/payments/ssl/ipn                                        │
│                                                                     │
│   This is a backup notification mechanism                           │
│   Handles cases where success callback fails                        │
│                                                                     │
│   Process:                                                          │
│   ✓ Verify payment                                                 │
│   ✓ Update transaction if not already updated                      │
│   ✓ Update booking if not already confirmed                        │
│   ✓ Create commission entry if not exists                          │
│   ✓ Return 200 OK to acknowledge                                   │
└─────────────────────────────────────────────────────────────────────┘
```

### State Transitions

#### Payment Transaction States
```
pending ──────> completed    (Successful payment)
   │
   ├──────────> failed        (Payment processing error)
   │
   └──────────> cancelled     (User cancelled)
```

#### Booking States
```
pending ──────> confirmed    (Payment successful)
   │
   └──────────> rejected      (Host/Admin rejection for request mode)
```

#### Payment Status
```
unpaid ────────> paid        (Payment completed)
   │
   └──────────> refunded      (Booking cancelled after payment)
```

---

## Webhook & IPN

### IPN (Instant Payment Notification)

#### What is IPN?
IPN is a server-to-server notification sent by SSLCommerz to your backend after a payment is processed. It acts as a backup mechanism in case the user's browser redirect fails.

#### IPN vs Redirect Callbacks
- **Redirect callbacks** (success/fail/cancel): User's browser is redirected
- **IPN**: Server-to-server POST request (more reliable)

#### IPN Configuration
1. Set IPN URL in payment initialization:
```javascript
ipn_url: `${process.env.BACKEND_URL}/api/payments/ssl/ipn`
```

2. Ensure IPN URL is publicly accessible
3. SSLCommerz will send POST request to this URL

#### IPN Request Format
```http
POST /api/payments/ssl/ipn HTTP/1.1
Host: api.thakajabe.com
Content-Type: application/x-www-form-urlencoded

val_id=ABC123XYZ456
&amount=5000.00
&tran_id=507f1f77bcf86cd799439011
&status=VALID
&store_amount=4900.00
&currency=BDT
&bank_tran_id=151114130739MqCBNx5
&card_type=VISA-Dutch%20Bangla
&card_no=432149XXXXXX0667
&verify_sign=abc123def456
&value_a=bookingId
&value_b=userId
&value_c=hostId
&value_d=5000
```

#### IPN Handler Implementation
```typescript
router.post('/ssl/ipn', async (req, res) => {
  const { val_id, amount, tran_id, status } = req.body;
  
  // 1. Find payment transaction
  const paymentTransaction = await PaymentTransaction.findById(tran_id);
  
  // 2. Verify with SSLCommerz
  const verification = await sslcommerz.validate({ val_id });
  
  // 3. Update payment and booking if valid
  if (verification.status === 'VALID') {
    await paymentTransaction.updateOne({ 
      status: 'completed',
      valId: val_id,
      raw: verification 
    });
    
    await Booking.updateOne(
      { _id: paymentTransaction.bookingId },
      { paymentStatus: 'paid', status: 'confirmed' }
    );
  }
  
  // 4. Always return 200 OK
  res.status(200).json({ status: 'success' });
});
```

#### IPN Best Practices
- **Always return 200 OK** to acknowledge receipt
- **Verify payment** before updating database
- **Handle idempotency** - check if already processed
- **Log all IPN requests** for debugging
- **Timeout handling** - respond within 30 seconds

---

## Error Handling

### Common Errors & Solutions

#### 1. Session Creation Failure
**Error**: `Failed to create payment session`

**Causes**:
- Invalid SSL credentials
- Incorrect store ID or password
- Network timeout
- Invalid payment data

**Solution**:
```typescript
try {
  const sslSession = await sslcommerz.init(paymentData);
  
  if (sslSession.status !== 'SUCCESS') {
    console.error('SSL Error:', sslSession.failedreason);
    throw new Error(sslSession.failedreason || 'Payment initialization failed');
  }
} catch (error) {
  console.error('SSL Exception:', error);
  return res.status(500).json({
    success: false,
    message: 'Payment system temporarily unavailable'
  });
}
```

#### 2. Booking Not Found
**Error**: `Booking not found`

**Causes**:
- Invalid booking ID
- Booking deleted
- Database connectivity issue

**Solution**:
```typescript
const booking = await Booking.findById(bookingId);

if (!booking) {
  return res.status(404).json({
    success: false,
    message: 'Booking not found or expired'
  });
}
```

#### 3. Access Denied
**Error**: `Access denied`

**Causes**:
- User trying to pay for someone else's booking
- JWT token expired
- User logged out

**Solution**:
```typescript
if (booking.userId._id.toString() !== req.user!.id) {
  return res.status(403).json({
    success: false,
    message: 'You are not authorized to access this booking'
  });
}
```

#### 4. Room No Longer Available
**Error**: `Room is no longer available for the selected dates`

**Causes**:
- Another user booked the same dates
- Host blocked the dates
- Room was deleted/deactivated

**Solution**:
```typescript
const hasOverlap = await Booking.checkOverlap(
  roomId,
  checkIn,
  checkOut
);

if (hasOverlap) {
  return res.status(409).json({
    success: false,
    message: 'Room unavailable - please select different dates'
  });
}
```

#### 5. Payment Verification Failed
**Error**: `Payment verification failed`

**Causes**:
- Tampered val_id
- Network issue during verification
- SSL servers down

**Solution**:
```typescript
const verification = await sslcommerz.validate({ val_id });

if (verification.status !== 'VALID') {
  console.error('Verification failed:', verification);
  
  // Mark as failed but don't delete
  await PaymentTransaction.findByIdAndUpdate(tran_id, {
    status: 'failed',
    raw: verification
  });
  
  return res.redirect(
    `${FRONTEND_URL}/booking/failed?error=verification_failed`
  );
}
```

### Frontend Error Handling

```typescript
// lib/api.ts
private async request<T>(endpoint: string, options: RequestInit) {
  try {
    const response = await fetch(url, config);
    const data = await response.json();
    
    if (!response.ok) {
      return {
        success: false,
        error: data.error || data.message || 'Request failed',
        message: data.message || data.error
      };
    }
    
    return data;
  } catch (error) {
    console.error('API Error:', error);
    return {
      success: false,
      error: error.message,
      message: 'Network error - please check your connection'
    };
  }
}
```

### Error Response Format

```typescript
{
  success: false,
  message: 'User-friendly error message',
  error: 'Technical error details',
  code: 'ERROR_CODE'  // Optional
}
```

---

## Testing

### Sandbox Testing

#### 1. Use Test Credentials
```env
SSL_STORE_ID=testbox
SSL_STORE_PASSWD=qwerty
NODE_ENV=development
```

#### 2. Test Cards

**Visa (Success)**
- Card Number: `4111111111111111`
- Expiry: Any future date
- CVV: Any 3 digits

**Mastercard (Success)**
- Card Number: `5555555555554444`
- Expiry: Any future date
- CVV: Any 3 digits

**Card Declined**
- Card Number: `4000000000000002`
- This will trigger a payment failure

#### 3. Test bKash
In sandbox mode, use:
- Mobile: `01711111111`
- PIN: `12345`
- OTP: Any 4 digits

#### 4. Testing Scenarios

**Successful Payment Flow**:
1. Create a booking
2. Initialize payment
3. Use test card on SSL gateway
4. Verify success callback
5. Check booking status changed to `confirmed`
6. Verify commission entry created

**Failed Payment Flow**:
1. Create a booking
2. Initialize payment
3. Use declined card
4. Verify fail callback
5. Check booking remains `pending`
6. Retry payment

**Cancelled Payment Flow**:
1. Create a booking
2. Initialize payment
3. Click "Cancel" on SSL gateway
4. Verify cancel callback
5. Check payment status is `cancelled`

**IPN Testing**:
1. Use a tool like [webhook.site](https://webhook.site)
2. Set temporary IPN URL
3. Complete payment
4. Verify IPN POST received
5. Check IPN payload format

#### 5. Debug Logging

Enable comprehensive logging:
```typescript
// Log all payment initializations
console.log('[PAYMENT_INIT] Request:', JSON.stringify(req.body, null, 2));
console.log('[PAYMENT_INIT] SSL Data:', JSON.stringify(paymentData, null, 2));
console.log('[PAYMENT_INIT] SSL Response:', JSON.stringify(sslSession, null, 2));

// Log all callbacks
console.log('[PAYMENT_SUCCESS] Query:', req.query);
console.log('[PAYMENT_SUCCESS] Verification:', verification);
```

### Integration Testing

```bash
# Backend API testing
cd thaka_jabe-server

# Test payment initialization
curl -X POST http://localhost:8080/api/payments/ssl/init \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{"bookingId":"BOOKING_ID"}'

# Test success callback (manual)
curl "http://localhost:8080/api/payments/ssl/success?val_id=TEST123&amount=5000&tran_id=PAYMENT_ID&status=VALID"
```

### Load Testing

Test payment system under load:
```bash
# Use Apache Bench
ab -n 100 -c 10 -H "Authorization: Bearer TOKEN" \
  -p payment.json \
  http://localhost:8080/api/payments/ssl/init

# payment.json
{
  "bookingId": "507f1f77bcf86cd799439011"
}
```

---

## Production Checklist

### Pre-Launch

- [ ] **Obtain Live SSL Credentials**
  - Store ID
  - Store Password
  - Verify credentials work in test environment

- [ ] **Update Environment Variables**
  ```env
  NODE_ENV=production
  SSL_STORE_ID=your_live_store_id
  SSL_STORE_PASSWD=your_live_password
  ```

- [ ] **Configure Callback URLs**
  - All URLs must be HTTPS
  - Verify URLs are publicly accessible
  - Test each callback URL
  ```env
  SSL_SUCCESS_URL=https://api.thakajabe.com/api/payments/ssl/success
  SSL_FAIL_URL=https://api.thakajabe.com/api/payments/ssl/fail
  SSL_CANCEL_URL=https://api.thakajabe.com/api/payments/ssl/cancel
  SSL_IPN_URL=https://api.thakajabe.com/api/payments/ssl/ipn
  ```

- [ ] **SSL Certificate**
  - Ensure domain has valid SSL certificate
  - Test HTTPS on all callback URLs
  - No mixed content warnings

- [ ] **Database Backups**
  - Set up automated daily backups
  - Test backup restoration
  - Monitor database storage

- [ ] **Error Monitoring**
  - Set up Sentry or similar
  - Configure error alerts
  - Test error reporting

- [ ] **Transaction Logging**
  - Log all payment attempts
  - Store complete SSL responses
  - Set up log rotation

- [ ] **Security Audit**
  - Review authentication middleware
  - Check authorization logic
  - Validate input sanitization
  - Test CORS settings

### Post-Launch

- [ ] **Monitor Transactions**
  - Track success rate
  - Monitor average payment time
  - Check for unusual patterns

- [ ] **Test Live Payments**
  - Make small test transactions
  - Verify refund process
  - Test all payment methods

- [ ] **Documentation**
  - Update internal documentation
  - Train support team
  - Create troubleshooting guide

- [ ] **Compliance**
  - PCI DSS compliance check
  - Privacy policy updated
  - Terms & conditions include payment terms

### Monitoring Metrics

Track these KPIs:
- **Success Rate**: Successful payments / Total payment attempts
- **Average Transaction Value**: Total revenue / Number of transactions
- **Failed Payment Reasons**: Categorize failure causes
- **Payment Method Distribution**: Which methods are popular
- **Average Payment Time**: Time from init to success
- **Refund Rate**: Refunds / Total successful payments

---

## Troubleshooting

### Issue: "Invalid Store ID or Password"

**Symptoms**:
- Payment initialization fails
- SSL returns authentication error

**Solutions**:
1. Verify credentials in `.env` file
2. Check for extra spaces in credentials
3. Confirm you're using correct mode (sandbox vs live)
4. Contact SSLCommerz support to verify account status

### Issue: "Callback URL Not Working"

**Symptoms**:
- Payment succeeds but booking not confirmed
- User stuck on SSL gateway after payment

**Solutions**:
1. Check callback URLs are publicly accessible
```bash
curl https://api.thakajabe.com/api/payments/ssl/success
# Should return something, not 404
```

2. Verify HTTPS is working (no SSL certificate errors)

3. Check server logs for any errors in callback handlers

4. Ensure no firewall blocking SSL's IP addresses

### Issue: "Payment Verified but Booking Not Updated"

**Symptoms**:
- `PaymentTransaction` status is `completed`
- `Booking` status still `pending`
- User sees success but can't access booking

**Solutions**:
1. Check database for orphaned transactions
```javascript
// Find completed payments with pending bookings
db.paymenttransactions.find({
  status: 'completed'
}).forEach(payment => {
  const booking = db.bookings.findOne({ _id: payment.bookingId });
  if (booking && booking.paymentStatus !== 'paid') {
    print(`Orphaned payment: ${payment._id} for booking: ${booking._id}`);
  }
});
```

2. Manually update booking:
```javascript
db.bookings.updateOne(
  { _id: ObjectId("BOOKING_ID") },
  { 
    $set: {
      paymentStatus: 'paid',
      status: 'confirmed',
      updatedAt: new Date()
    }
  }
);
```

3. Check if IPN handler is working - it should catch these cases

### Issue: "Duplicate Payments"

**Symptoms**:
- User charged twice for same booking
- Multiple `PaymentTransaction` records

**Solutions**:
1. Add unique constraint on booking + success combination:
```typescript
// Prevent duplicate payments
const existingPayment = await PaymentTransaction.findOne({
  bookingId: booking._id,
  status: 'completed'
});

if (existingPayment) {
  return res.status(409).json({
    success: false,
    message: 'Payment already completed for this booking'
  });
}
```

2. Refund duplicate payment through SSLCommerz dashboard

### Issue: "IPN Not Received"

**Symptoms**:
- No POST requests from SSLCommerz to IPN URL
- IPN logs empty

**Solutions**:
1. Verify IPN URL is accessible:
```bash
curl -X POST https://api.thakajabe.com/api/payments/ssl/ipn \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "test=true"
```

2. Check SSL's outbound IPs are not blocked

3. Contact SSLCommerz to verify IPN is enabled for your account

4. Use webhook testing tools to simulate IPN:
```bash
# Test with sample data
curl -X POST http://localhost:8080/api/payments/ssl/ipn \
  -H "Content-Type: application/json" \
  -d '{
    "val_id": "TEST123",
    "amount": "5000",
    "tran_id": "PAYMENT_ID",
    "status": "VALID"
  }'
```

### Issue: "Amount Mismatch"

**Symptoms**:
- Verification fails due to amount difference
- User paid different amount than expected

**Solutions**:
1. Always verify amount in success callback:
```typescript
if (verification.amount !== amount.toString()) {
  console.error(`Amount mismatch: Expected ${amount}, Got ${verification.amount}`);
  // Don't confirm payment
}
```

2. Check for currency conversion issues
3. Verify commission calculation is correct

### Issue: "Session Expired"

**Symptoms**:
- Gateway shows "Session expired" message
- Payment fails after long time on gateway

**Solutions**:
1. SSLCommerz sessions expire after 30 minutes
2. Implement session timeout warning on frontend
3. Allow user to reinitialize payment:
```typescript
if (error.includes('session') || error.includes('expired')) {
  alert('Your payment session has expired. Please try again.');
  router.push(`/room/${roomId}`);
}
```

### Debug Tools

#### Enable Verbose Logging
```typescript
// Add to payment routes
const DEBUG = process.env.DEBUG_PAYMENTS === 'true';

if (DEBUG) {
  console.log('[PAYMENT_DEBUG]', {
    timestamp: new Date().toISOString(),
    endpoint: req.path,
    method: req.method,
    query: req.query,
    body: req.body,
    headers: req.headers
  });
}
```

#### Payment Status Checker
```bash
# Check payment status
curl -H "Authorization: Bearer TOKEN" \
  http://localhost:8080/api/payments/status/PAYMENT_TRANSACTION_ID
```

#### Database Queries
```javascript
// MongoDB shell - check recent payments
db.paymenttransactions.find().sort({ createdAt: -1 }).limit(10)

// Find failed payments
db.paymenttransactions.find({ status: 'failed' })

// Find pending payments older than 1 hour
db.paymenttransactions.find({
  status: 'pending',
  createdAt: { $lt: new Date(Date.now() - 60*60*1000) }
})

// Check commission entries
db.accountledgers.find({ type: 'commission' }).sort({ at: -1 }).limit(10)
```

---

## Additional Resources

### Official Documentation
- [SSLCommerz Developer Documentation](https://developer.sslcommerz.com/)
- [SSLCommerz API Reference](https://developer.sslcommerz.com/doc/v4/)
- [SSLCommerz NPM Package](https://www.npmjs.com/package/sslcommerz-lts)

### Support Contacts
- **SSLCommerz Technical Support**: `support@sslcommerz.com`
- **SSLCommerz Phone**: `+880 2 41020715-17`
- **Business Hours**: Saturday to Thursday, 10 AM - 6 PM (GMT+6)

### Testing Resources
- **Sandbox URL**: `https://sandbox.sslcommerz.com/`
- **Test Credentials**: Store ID: `testbox`, Password: `qwerty`
- **Webhook Tester**: [webhook.site](https://webhook.site)

### Related Documentation
- [DEPLOYMENT.md](./DEPLOYMENT.md) - Server deployment guide
- [BACKUP.md](./BACKUP.md) - Database backup procedures
- [README.md](./README.md) - Project overview

---

## Summary

The SSLCommerz integration in Thaka Jabe provides a complete, secure payment solution with:

✅ **Robust Payment Flow** - From booking to confirmation
✅ **Multiple Payment Methods** - Cards, mobile banking, internet banking
✅ **Secure Verification** - Server-side validation of all transactions
✅ **Error Handling** - Comprehensive error recovery
✅ **IPN Support** - Backup notification mechanism
✅ **Commission Tracking** - Automated revenue calculation
✅ **Refund Support** - Handle booking cancellations
✅ **Real-time Status** - Live payment status updates
✅ **Comprehensive Logging** - Full audit trail
✅ **Production Ready** - Tested and secure

For additional help or questions, refer to the troubleshooting section or contact the development team.

---

**Last Updated**: October 28, 2025
**Version**: 1.0.0
**Maintained By**: Thaka Jabe Development Team

