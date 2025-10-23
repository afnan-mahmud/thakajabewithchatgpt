import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import compression from 'compression';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';
import path from 'path';
import mongoose from 'mongoose';
import { errorHandler } from './middleware/errorHandler';
import { notFound } from './middleware/notFound';
import authRoutes from './routes/auth';
import userRoutes from './routes/users';
import hostRoutes from './routes/hosts';
import roomRoutes from './routes/rooms';
import bookingRoutes from './routes/bookings';
import paymentRoutes from './routes/payments';
import chatRoutes from './routes/chat';
import accountRoutes from './routes/accounts';
import payoutRoutes from './routes/payouts';
import uploadRoutes from './routes/uploads';
import eventRoutes from './routes/events';
import adminRoutes from './routes/admin';
import messageRoutes from './routes/messages';

// Load environment variables
const loadEnvFiles = () => {
  const envFiles = ['.env.local', '.env'];
  const loadedVars = new Set<string>();
  
  envFiles.forEach((file) => {
    const result = dotenv.config({ path: path.resolve(process.cwd(), file) });
    if (result.parsed) {
      Object.keys(result.parsed).forEach(key => loadedVars.add(key));
    }
  });
  
  // Check for required environment variables
  const missingVars = [];
  if (!process.env.JWT_SECRET) missingVars.push('JWT_SECRET');
  if (!process.env.MONGODB_URI) missingVars.push('MONGODB_URI');
  
  if (missingVars.length > 0) {
    console.warn(`⚠️  Missing environment variables: ${missingVars.join(', ')}`);
  }
  
  return loadedVars;
};

loadEnvFiles();

const app = express();
const PORT = process.env.PORT || 8080;

// Security middleware
app.use(helmet());
app.use(cors({
  origin: process.env.NODE_ENV === 'production' 
    ? ['https://thakajabe.com', 'https://www.thakajabe.com']
    : ['http://localhost:3000'],
  credentials: true
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: {
    success: false,
    message: 'Too many requests from this IP, please try again later.'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 50, // limit auth endpoints to 50 requests per windowMs (increased for testing)
  message: {
    success: false,
    message: 'Too many authentication attempts, please try again later.'
  },
});

app.use(limiter);
// app.use('/api/auth', authLimiter); // Temporarily disabled for testing

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Compression middleware
app.use(compression());

// Logging middleware
app.use(morgan('combined'));

// Serve static files from uploads directory
const uploadsDir = path.resolve(process.cwd(), 'uploads');
app.use('/uploads', express.static(uploadsDir, {
  extensions: ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg'],
  fallthrough: false,
}));

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/hosts', hostRoutes);
app.use('/api/rooms', roomRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/accounts', accountRoutes);
app.use('/api/payouts', payoutRoutes);
app.use('/api/uploads', uploadRoutes);
app.use('/api/events', eventRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/messages', messageRoutes);

// Error handling middleware
app.use(notFound);
app.use(errorHandler);

// Database connection
const connectDB = async () => {
  try {
    if (!process.env.MONGODB_URI) {
      throw new Error('MONGODB_URI environment variable is not defined');
    }
    
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ MongoDB connected successfully');
  } catch (error) {
    console.error('❌ MongoDB connection error:', error);
    process.exit(1);
  }
};

// Graceful shutdown
process.on('SIGTERM', async () => {
  console.log('SIGTERM received, shutting down gracefully');
  await mongoose.connection.close();
  process.exit(0);
});

process.on('SIGINT', async () => {
  console.log('SIGINT received, shutting down gracefully');
  await mongoose.connection.close();
  process.exit(0);
});

// Start server
const startServer = async () => {
  await connectDB();
  
  app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
    console.log(`📊 Health check: http://localhost:${PORT}/health`);
    console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
  });
};

startServer().catch((error) => {
  console.error('Failed to start server:', error);
  process.exit(1);
});

export default app;
