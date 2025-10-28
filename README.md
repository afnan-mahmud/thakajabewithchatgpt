# Thaka Jabe - Room Rental & Accommodation Booking Platform

A full-stack room rental and accommodation booking platform built with Next.js 14 and Node.js/Express. Thaka Jabe connects property hosts with guests looking for short-term accommodations, featuring secure payments, real-time messaging, comprehensive admin controls, and marketing analytics.

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

## Features

### For Guests
- 🔍 **Advanced Search** - Search rooms by location, price, amenities, and room type
- 📅 **Smart Booking** - Instant booking or request-to-book modes with calendar availability
- 💳 **Secure Payments** - SSLCOMMERZ payment gateway integration with full refund support
- ⭐ **Reviews & Ratings** - Read and write reviews for completed stays
- 💬 **Real-time Messaging** - Chat with hosts before and during your stay
- 📱 **Booking Management** - Track all your bookings, payments, and refunds
- 🔐 **Secure Authentication** - Email/password and Firebase authentication

### For Hosts
- 🏠 **Property Management** - Create and manage multiple room listings with up to 15 images per listing
- 📊 **Dashboard Analytics** - Track bookings, earnings, and property performance
- 💰 **Earnings & Payouts** - Monitor earnings and request payouts with transaction history
- 📆 **Availability Calendar** - Manage room availability with date blocking
- ✉️ **Guest Communication** - Message with guests through integrated chat system
- 🔔 **Booking Notifications** - Instant and request-based booking management
- ✅ **Host Verification** - NID-based verification for trust and safety

### For Administrators
- 👥 **User Management** - Manage all users, hosts, and guest accounts
- 🏢 **Host Approval System** - Review and approve host applications with NID verification
- 🏠 **Room Moderation** - Approve or reject room listings before they go live
- 💼 **Booking Management** - View and manage all bookings across the platform
- 💵 **Financial Dashboard** - Track revenue, commissions, and platform expenses
- 📝 **Account Ledger** - Complete financial tracking with spend and adjustment entries
- 💸 **Payout Processing** - Review and process host payout requests
- 📰 **Blog Management** - Create, edit, and publish blog content for SEO
- 📈 **Analytics & Reports** - Platform statistics and performance metrics

### Technical Features
- 🖼️ **Cloudflare R2 Storage** - Scalable image hosting with CDN
- 📊 **Marketing Pixels** - Facebook and TikTok pixel integration for ad tracking
- 🔒 **Security** - Helmet.js, rate limiting, CORS, input validation
- 🚀 **Performance** - Compression, image optimization with Sharp, MongoDB indexing
- 📱 **Responsive Design** - Mobile-first design with Tailwind CSS
- 🎨 **Modern UI** - shadcn/ui components with Radix UI primitives
- 🔄 **Real-time Updates** - Optimistic UI updates with Zustand state management

## Tech Stack

### Frontend
- **Next.js 16** with App Router and React 19
- **TypeScript** for type safety
- **Tailwind CSS** for styling
- **shadcn/ui** and **Radix UI** for UI components
- **Lucide React** for icons
- **NextAuth.js** for authentication
- **Zustand** for state management
- **React Hook Form** + **Zod** for form validation
- **date-fns** for date manipulation
- **Framer Motion** for animations

### Backend
- **Node.js 20+** with **Express**
- **TypeScript** for type safety
- **MongoDB** with **Mongoose** ODM
- **Zod** for request validation
- **Firebase Admin** for authentication
- **SSLCOMMERZ** for payment processing
- **JWT** & **bcryptjs** for secure authentication
- **AWS SDK** for Cloudflare R2 storage
- **Sharp** for image processing
- **Multer** for file uploads
- **Helmet** for security headers
- **Morgan** for logging
- **express-rate-limit** for rate limiting

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
# Server Configuration
PORT=8080
NODE_ENV=development

# Database
MONGODB_URI=mongodb://localhost:27017/thakajabe

# Authentication
JWT_SECRET=your_jwt_secret_key_here

# SSLCOMMERZ Payment Gateway
SSL_STORE_ID=your_ssl_store_id
SSL_STORE_PASSWD=your_ssl_store_password
SSL_SUCCESS_URL=https://thakajabe.com/payment/success
SSL_FAIL_URL=https://thakajabe.com/payment/fail
SSL_CANCEL_URL=https://thakajabe.com/payment/cancel
SSL_IPN_URL=https://api.thakajabe.com/api/payments/ssl/ipn

# Cloudflare R2 Storage
R2_ACCOUNT_ID=your_cloudflare_account_id
R2_ACCESS_KEY_ID=your_r2_access_key_id
R2_SECRET_ACCESS_KEY=your_r2_secret_access_key
R2_BUCKET_NAME=your_bucket_name
R2_PUBLIC_URL=https://your-bucket.r2.dev

# Facebook Pixel (optional)
FB_PIXEL_ACCESS_TOKEN=your_facebook_pixel_access_token

# TikTok Pixel (optional)
TIKTOK_ACCESS_TOKEN=your_tiktok_access_token
TIKTOK_PIXEL_ID=your_tiktok_pixel_id
TIKTOK_TEST_EVENT_CODE=your_tiktok_test_event_code

# Firebase Admin (optional)
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

### Authentication (`/api/auth`)
- `POST /register` - User registration (with optional host data)
- `POST /login` - User login
- `POST /logout` - User logout
- `GET /profile` - Get authenticated user profile

### Users (`/api/users`)
- `GET /` - Get all users with pagination (admin only)
- `GET /:id` - Get user by ID
- `PUT /:id` - Update user profile
- `DELETE /:id` - Delete user (admin only)

### Rooms (`/api/rooms`)
- `GET /search` - Search rooms with filters (location, price, type, amenities)
- `GET /:id` - Get room details with host info
- `POST /` - Create new room listing (host only)
- `PUT /:id` - Update room listing (host/owner only)
- `DELETE /:id` - Delete room listing (host/owner only)
- `GET /:id/unavailable` - Get unavailable dates for a room
- `POST /:id/unavailable` - Add unavailable dates
- `DELETE /:id/unavailable` - Remove unavailable dates

### Bookings (`/api/bookings`)
- `POST /create` - Create new booking
- `GET /mine` - Get user's bookings with pagination
- `GET /:id` - Get booking details
- `PUT /:id` - Update booking (admin only)
- `POST /:id/cancel` - Cancel booking (with refund)

### Payments (`/api/payments`)
- `POST /ssl/init` - Initialize SSLCOMMERZ payment session
- `POST /ssl/create` - Create payment (deprecated)
- `POST /ssl/verify` - Verify payment after success
- `POST /ssl/ipn` - SSLCOMMERZ IPN webhook
- `GET /status/:transactionId` - Get payment status

### Hosts (`/api/hosts`)
- `POST /apply` - Apply to become a host (with NID verification)
- `GET /me` - Get host profile
- `PUT /me` - Update host profile
- `GET /stats` - Get host dashboard statistics
- `GET /rooms` - Get host's room listings
- `GET /bookings` - Get host's bookings
- `GET /balance` - Get host earnings and balance
- `GET /transactions` - Get host transaction history
- `GET /rooms/unavailable` - Get unavailable dates for all host rooms

### Reviews (`/api/reviews`)
- `POST /` - Create review for booking
- `GET /room/:roomId` - Get reviews for a room
- `GET /my` - Get user's reviews
- `GET /booking/:bookingId` - Check if booking has review

### Messages (`/api/messages`)
- `GET /threads` - Get message threads with pagination
- `POST /threads` - Create new message thread
- `GET /threads/:threadId` - Get messages in a thread
- `POST /threads/:threadId` - Send message in thread

### Chat (`/api/chat`)
- `GET /threads/ids` - Get all thread IDs for real-time sync
- `GET /threads` - Get chat threads
- `POST /threads` - Create chat thread
- `POST /messages` - Send message
- `GET /threads/:threadId/messages` - Get thread messages

### Payouts (`/api/payouts`)
- `GET /mine` - Get host's payout requests
- `POST /request` - Request payout
- `GET /:id` - Get payout details

### Blogs (`/api/blogs`)
- `GET /` - Get published blogs with pagination
- `GET /slug/:slug` - Get blog by slug
- `GET /admin/all` - Get all blogs including drafts (admin only)
- `GET /admin/:id` - Get blog by ID (admin only)
- `POST /admin` - Create blog (admin only)
- `PUT /admin/:id` - Update blog (admin only)
- `DELETE /admin/:id` - Delete blog (admin only)
- `PATCH /admin/:id/publish` - Toggle publish status (admin only)

### Admin (`/api/admin`)
- `GET /stats` - Get platform statistics
- `GET /hosts` - Get all hosts with filters
- `POST /hosts/:id/approve` - Approve host application
- `POST /hosts/:id/reject` - Reject host application
- `GET /rooms` - Get all rooms
- `POST /rooms/:id/approve` - Approve room listing
- `POST /rooms/:id/reject` - Reject room listing
- `GET /bookings` - Get all bookings with filters
- `GET /users` - Get all users
- `GET /payouts` - Get all payout requests
- `POST /payouts/:id/approve` - Approve payout
- `POST /payouts/:id/reject` - Reject payout

### Accounts (`/api/accounts`)
- `GET /summary` - Get financial summary (admin only)
- `GET /ledger` - Get account ledger entries (admin only)
- `POST /spend` - Record platform expense (admin only)
- `POST /adjustment` - Record financial adjustment (admin only)

### Uploads (`/api/uploads`)
- `POST /image` - Upload image (authenticated)
- `POST /public/image` - Upload public image
- `DELETE /image/:filename` - Delete image
- `POST /rooms/:roomId/images` - Upload multiple room images
- `DELETE /rooms/:roomId/images` - Delete room images

### Locations (`/api/locations`)
- `GET /` - Get popular locations/destinations
- `GET /search` - Search locations

### Events (`/api/events`)
- `POST /track` - Track pixel events (Facebook/TikTok)

## Database Models

### Core Models
- **User** - User accounts (guests, hosts, admins)
- **HostProfile** - Extended profile for hosts with verification details
- **Room** - Property listings with images, pricing, and amenities
- **Booking** - Reservation records with payment and status tracking
- **Review** - Guest reviews and ratings for completed stays
- **Message** - Chat messages between users
- **MessageThread** - Message conversation threads
- **Payment** - Payment transaction records
- **PayoutRequest** - Host payout requests and processing
- **AccountLedger** - Financial transaction ledger for accounting
- **Blog** - Blog posts for content marketing

### Key Relationships
- Users can be guests, hosts, or admins
- Hosts have one HostProfile (verified with NID)
- Hosts can create multiple Rooms
- Guests can create multiple Bookings
- Bookings belong to one Room and one User
- Reviews are linked to Bookings (one review per booking)
- Payments are linked to Bookings
- MessageThreads connect Users for communication

## Architecture Overview

### Frontend Architecture
```
thakajabe/
├── app/                      # Next.js App Router
│   ├── (public)/            # Public pages (landing, search, room details)
│   ├── admin/               # Admin dashboard pages
│   ├── host/                # Host dashboard pages
│   └── api/                 # API routes (NextAuth, server actions)
├── components/              # React components
│   ├── admin/              # Admin-specific components
│   ├── auth/               # Authentication components
│   ├── chat/               # Messaging components
│   ├── home/               # Landing page components
│   ├── host/               # Host dashboard components
│   ├── navigation/         # Navigation and layout components
│   ├── room/               # Room listing components
│   ├── search/             # Search and filter components
│   ├── tracking/           # Analytics pixel components
│   └── ui/                 # Reusable UI components (shadcn/ui)
├── lib/                     # Utilities and helpers
│   ├── api.ts              # API client with typed endpoints
│   ├── auth-context.tsx    # Authentication context
│   ├── chat-context.tsx    # Chat/messaging context
│   ├── store.ts            # Zustand state management
│   └── utils.ts            # Helper functions
└── hooks/                   # Custom React hooks
```

### Backend Architecture
```
thaka_jabe-server/
├── src/
│   ├── controllers/         # Request handlers
│   │   ├── authController.ts
│   │   ├── paymentController.ts
│   │   ├── productController.ts
│   │   ├── uploadController.ts
│   │   └── userController.ts
│   ├── middleware/          # Express middleware
│   │   ├── auth.ts         # JWT authentication
│   │   ├── errorHandler.ts # Error handling
│   │   ├── upload.ts       # Multer file upload
│   │   └── validateRequest.ts # Request validation
│   ├── models/             # Mongoose schemas
│   │   ├── User.ts
│   │   ├── Room.ts
│   │   ├── Booking.ts
│   │   ├── HostProfile.ts
│   │   ├── Payment.ts
│   │   ├── Review.ts
│   │   ├── Blog.ts
│   │   └── ...
│   ├── routes/             # API route definitions
│   │   ├── auth.ts
│   │   ├── rooms.ts
│   │   ├── bookings.ts
│   │   ├── payments.ts
│   │   ├── hosts.ts
│   │   ├── admin.ts
│   │   └── ...
│   ├── utils/              # Utility functions
│   │   ├── r2.ts          # Cloudflare R2 operations
│   │   ├── sanitizer.ts   # Input sanitization
│   │   └── bookingUtils.ts # Booking logic
│   └── index.ts            # Server entry point
└── dist/                    # Compiled JavaScript (production)
```

### Data Flow
1. **User Request** → Frontend (Next.js)
2. **API Call** → Backend API (Express)
3. **Authentication** → JWT verification
4. **Validation** → Zod schema validation
5. **Business Logic** → Controllers
6. **Database** → MongoDB via Mongoose
7. **External Services** → SSLCOMMERZ, Cloudflare R2, Firebase
8. **Response** → JSON response to frontend
9. **State Update** → Zustand/React state
10. **UI Update** → React re-render

## Key Features Deep Dive

### 🔐 Security Features
- **Authentication**: JWT tokens with secure httpOnly cookies
- **Authorization**: Role-based access control (guest, host, admin)
- **Rate Limiting**: Prevents brute force and DDoS attacks
- **Input Validation**: Zod schemas for all API requests
- **Password Hashing**: bcrypt for secure password storage
- **CORS**: Configured for production domains only
- **Security Headers**: Helmet.js for HTTP security headers
- **XSS Protection**: Input sanitization on all user content
- **File Upload Security**: Type and size validation with Sharp processing

### 💳 Payment Processing
- **Gateway**: SSLCOMMERZ integration (Bangladesh's leading payment gateway)
- **Flow**: Booking → Payment Init → Gateway Redirect → Verification → Confirmation
- **Refunds**: Automatic refund processing on cancellation
- **Transaction Tracking**: Complete payment history and status tracking
- **IPN Webhook**: Real-time payment status updates
- **Security**: Transaction validation and duplicate prevention

### 📊 Admin Dashboard
- **Statistics**: Real-time platform metrics and KPIs
- **User Management**: View, edit, and manage all users
- **Host Verification**: Review NID documents and approve/reject hosts
- **Content Moderation**: Approve room listings before publication
- **Financial Tracking**: Revenue, commissions, expenses, and ledger
- **Payout Management**: Review and process host payouts
- **Blog Management**: Create and publish SEO-optimized content

### 🖼️ Image Management
- **Storage**: Cloudflare R2 (S3-compatible object storage)
- **Processing**: Sharp for image optimization and resizing
- **Upload**: Multiple image upload with progress tracking
- **Limits**: Up to 15 images per room listing
- **CDN**: Global CDN delivery via Cloudflare
- **Optimization**: Automatic format conversion and compression

### 📈 Analytics & Tracking
- **Facebook Pixel**: Server-side and client-side event tracking
- **TikTok Pixel**: Conversion tracking for TikTok ads
- **Custom Events**: PageView, ViewContent, Search, Purchase, etc.
- **Cookie Sync**: fbp and fbc cookie forwarding to backend
- **Privacy Compliant**: User consent and opt-out support

## Deployment

See [DEPLOYMENT.md](./DEPLOYMENT.md) for detailed deployment instructions.

## Backup

See [BACKUP.md](./BACKUP.md) for backup procedures and disaster recovery.

## Development Best Practices

### Code Style
- **TypeScript**: Strict mode enabled for type safety
- **ESLint**: Configured for both frontend and backend
- **Prettier**: Consistent code formatting
- **Naming**: Descriptive variable names, camelCase for variables, PascalCase for components
- **Comments**: Document complex logic and business rules

### Git Workflow
```bash
# Feature development
git checkout -b feature/your-feature-name
# Make changes
git add .
git commit -m "feat: add new feature description"
git push origin feature/your-feature-name
# Create pull request

# Bug fixes
git checkout -b fix/bug-description
# Make changes
git commit -m "fix: resolve bug description"
```

### Commit Message Convention
- `feat:` - New feature
- `fix:` - Bug fix
- `docs:` - Documentation changes
- `style:` - Code style changes (formatting, etc.)
- `refactor:` - Code refactoring
- `test:` - Adding or updating tests
- `chore:` - Maintenance tasks

### Testing Guidelines
```bash
# Backend tests
cd thaka_jabe-server
pnpm test

# Frontend type checking
cd thakajabe
pnpm type-check

# Linting
pnpm lint
```

### Database Indexing
- All frequently queried fields are indexed
- Compound indexes for complex queries
- Text indexes for search functionality
- Regular index performance monitoring

### Performance Optimization
- **Images**: Optimized with Sharp, served via CDN
- **Database**: Indexed queries, lean() for read operations
- **Caching**: Consider adding Redis for session management
- **Compression**: Gzip compression enabled
- **Code Splitting**: Next.js automatic code splitting
- **Lazy Loading**: Images and components lazy loaded where appropriate

## Troubleshooting

### Common Issues

#### MongoDB Connection Error
```bash
# Check if MongoDB is running
sudo systemctl status mongod

# Restart MongoDB
sudo systemctl restart mongod

# Check MongoDB logs
sudo journalctl -u mongod -f
```

#### Port Already in Use
```bash
# Find process using port 8080
lsof -i :8080

# Kill the process
kill -9 <PID>
```

#### Image Upload Fails
- Check Cloudflare R2 credentials in `.env`
- Verify bucket name and access keys
- Check file size limits (default 10MB)
- Ensure Sharp is properly installed: `pnpm rebuild sharp`

#### Payment Gateway Issues
- Verify SSLCOMMERZ credentials (store ID and password)
- Check callback URLs are accessible from internet
- Review IPN webhook logs
- Test with sandbox mode first

#### Build Errors
```bash
# Clear node_modules and reinstall
rm -rf node_modules pnpm-lock.yaml
pnpm install

# Clear Next.js cache
rm -rf .next
pnpm build

# Clear TypeScript cache
rm -rf tsconfig.tsbuildinfo
```

### Logs and Monitoring

#### Backend Logs (Production)
```bash
# View PM2 logs
pm2 logs thaka_jabe-server

# View error logs only
pm2 logs thaka_jabe-server --err

# View access logs
sudo tail -f /var/log/nginx/access.log
```

#### Frontend Logs (Production)
```bash
# View PM2 logs
pm2 logs thakajabe

# View build logs
pm2 logs thakajabe --lines 100
```

#### Database Monitoring
```bash
# Connect to MongoDB
mongosh

# Check database stats
use thakajabe
db.stats()

# Check collection stats
db.rooms.stats()
db.bookings.stats()

# Monitor slow queries
db.setProfilingLevel(1, { slowms: 100 })
db.system.profile.find().sort({ts:-1}).limit(5)
```

## Monitoring & Maintenance

### Regular Tasks
- **Daily**: Check application logs for errors
- **Weekly**: Review booking and payment statistics
- **Monthly**: Database backup verification and cleanup
- **Quarterly**: Security updates and dependency updates

### Health Checks
```bash
# Backend health
curl http://localhost:8080/health

# Frontend (Next.js)
curl http://localhost:3000

# MongoDB status
mongosh --eval "db.adminCommand('ping')"
```

### Database Maintenance
```bash
# Backup database
mongodump --uri="mongodb://localhost:27017/thakajabe" --out=/backup/$(date +%Y%m%d)

# Restore database
mongorestore --uri="mongodb://localhost:27017/thakajabe" /backup/20240101

# Compact database
mongosh
use thakajabe
db.runCommand({ compact: 'rooms' })
```

### Performance Monitoring
- Monitor response times for API endpoints
- Track MongoDB query performance
- Monitor Cloudflare R2 usage and bandwidth
- Review payment gateway transaction success rates
- Monitor server resource usage (CPU, RAM, disk)

## Contributing

We welcome contributions! Please follow these guidelines:

1. **Fork the repository** and create your branch from `main`
2. **Make your changes** with clear, descriptive commits
3. **Test your changes** thoroughly
   - Add tests if adding new features
   - Ensure existing tests pass
   - Test in both development and production builds
4. **Update documentation** if needed
   - Update README for new features
   - Add comments for complex logic
   - Update API documentation
5. **Submit a pull request**
   - Provide clear description of changes
   - Reference any related issues
   - Wait for code review

### Code Review Checklist
- [ ] Code follows project style guidelines
- [ ] All tests pass
- [ ] No console.log or debugging code
- [ ] No security vulnerabilities
- [ ] Documentation updated
- [ ] Commit messages follow convention
- [ ] No hardcoded sensitive data

## Support & Contact

For issues, questions, or contributions:
- **Issues**: Create an issue on GitHub
- **Documentation**: Check DEPLOYMENT.md and BACKUP.md
- **Email**: Contact the development team

## Roadmap

### Planned Features
- [ ] Multi-language support (English, Bengali)
- [ ] Mobile app (React Native)
- [ ] Advanced search filters (map-based search)
- [ ] Host analytics dashboard
- [ ] Booking calendar synchronization
- [ ] SMS notifications
- [ ] Guest loyalty program
- [ ] Advanced reporting and analytics
- [ ] API rate limiting per user
- [ ] GraphQL API option

## License

This project is proprietary software. All rights reserved.

## Acknowledgments

Built with modern technologies and best practices:
- Next.js team for the amazing framework
- Vercel for hosting and deployment tools
- MongoDB for the flexible database
- Cloudflare for R2 storage and CDN
- SSLCOMMERZ for payment processing
- The open-source community for various libraries and tools
