# Thaka Jabe - Full Stack E-commerce Platform

A modern e-commerce platform built with Next.js 14 and Node.js, designed for deployment on Ubuntu 24.04 VPS.

## Project Structure

```
thakajabewithchatgpt/
├── thakajabe/                 # Frontend (Next.js 14)
│   ├── app/                   # App Router
│   ├── components/            # React components
│   ├── lib/                   # Utilities
│   └── ...
├── thaka_jabe-server/         # Backend (Node.js + Express)
│   ├── src/
│   │   ├── controllers/       # Route controllers
│   │   ├── middleware/        # Custom middleware
│   │   ├── models/            # Mongoose models
│   │   ├── routes/            # API routes
│   │   └── index.ts           # Server entry point
│   └── ...
├── DEPLOYMENT.md              # Deployment guide
├── BACKUP.md                  # Backup procedures
└── README.md                  # This file
```

## Tech Stack

### Frontend
- **Next.js 14** with App Router
- **TypeScript** for type safety
- **Tailwind CSS** for styling
- **shadcn/ui** for UI components
- **Lucide React** for icons
- **NextAuth.js** for authentication

### Backend
- **Node.js** with **Express**
- **TypeScript** for type safety
- **Mongoose** for MongoDB ODM
- **Zod** for validation
- **Firebase Admin** for authentication
- **SSLCOMMERZ** for payment processing
- **JWT** for token-based auth

## Quick Start

### Prerequisites
- Node.js 20+
- pnpm 8+
- MongoDB
- Git

### Development Setup

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd thakajabewithchatgpt
   ```

2. **Setup Frontend**
   ```bash
   cd thakajabe
   pnpm install
   cp env.example .env.local
   # Edit .env.local with your configuration
   pnpm dev
   ```

3. **Setup Backend**
   ```bash
   cd ../thaka_jabe-server
   pnpm install
   cp env.example .env
   # Edit .env with your configuration
   pnpm dev
   ```

4. **Access the applications**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:8080
   - API Health: http://localhost:8080/health

## Environment Variables

### Frontend (.env.local)
```env
NEXT_PUBLIC_API_BASE_URL=http://localhost:8080/api
NEXT_PUBLIC_IMG_BASE_URL=http://localhost:8080
NEXT_PUBLIC_FB_PIXEL_ID=your_facebook_pixel_id
NEXT_PUBLIC_TIKTOK_PIXEL_ID=your_tiktok_pixel_id
NEXT_PUBLIC_FIREBASE_API_KEY=your_firebase_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_DB_URL=https://your_project.firebaseio.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your_nextauth_secret_key_here
```

### Backend (.env)
```env
PORT=8080
MONGODB_URI=mongodb://localhost:27017/thakajabe
JWT_SECRET=your_jwt_secret_key_here
SSL_STORE_ID=your_ssl_store_id
SSL_STORE_PASSWD=your_ssl_store_password
SSL_SUCCESS_URL=https://thakajabe.com/payment/success
SSL_FAIL_URL=https://thakajabe.com/payment/fail
SSL_CANCEL_URL=https://thakajabe.com/payment/cancel
SSL_IPN_URL=https://api.thakajabe.com/payments/ssl/ipn
FB_PIXEL_ACCESS_TOKEN=your_facebook_pixel_access_token
TIKTOK_ACCESS_TOKEN=your_tiktok_access_token
TIKTOK_PIXEL_ID=your_tiktok_pixel_id
TIKTOK_TEST_EVENT_CODE=your_tiktok_test_event_code
FIREBASE_PROJECT_ID=your_firebase_project_id
FIREBASE_CLIENT_EMAIL=your_firebase_client_email
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
```

## Available Scripts

### Frontend (thakajabe/)
- `pnpm dev` - Start development server
- `pnpm build` - Build for production
- `pnpm start` - Start production server
- `pnpm lint` - Run ESLint
- `pnpm type-check` - Run TypeScript type checking

### Backend (thaka_jabe-server/)
- `pnpm dev` - Start development server with hot reload
- `pnpm build` - Build TypeScript to JavaScript
- `pnpm start` - Start production server
- `pnpm lint` - Run ESLint
- `pnpm type-check` - Run TypeScript type checking
- `pnpm test` - Run tests

## API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout
- `GET /api/auth/profile` - Get user profile

### Users
- `GET /api/users` - Get all users (admin only)
- `GET /api/users/:id` - Get user by ID
- `PUT /api/users/:id` - Update user
- `DELETE /api/users/:id` - Delete user (admin only)

### Products
- `GET /api/products` - Get products with pagination and filters
- `GET /api/products/:id` - Get product by ID
- `POST /api/products` - Create product (seller/admin)
- `PUT /api/products/:id` - Update product (seller/admin)
- `DELETE /api/products/:id` - Delete product (admin only)

### Payments
- `POST /api/payments/ssl/create` - Create SSLCOMMERZ payment
- `POST /api/payments/ssl/verify` - Verify payment
- `POST /api/payments/ssl/ipn` - SSLCOMMERZ IPN handler
- `GET /api/payments/status/:transactionId` - Get payment status

### Uploads
- `POST /api/uploads/image` - Upload image
- `DELETE /api/uploads/image/:filename` - Delete image

## Deployment

See [DEPLOYMENT.md](./DEPLOYMENT.md) for detailed deployment instructions.

## Backup

See [BACKUP.md](./BACKUP.md) for backup procedures.

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the MIT License.
