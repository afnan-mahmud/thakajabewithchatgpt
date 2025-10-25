import express from 'express';
import { Message, MessageThread, Room, HostProfile, User } from '../models';
import { requireUser, AuthenticatedRequest } from '../middleware/auth';
import { messageCreateSchema, paginationSchema } from '../schemas';
import { validateBody, validateQuery } from '../middleware/validateRequest';
import { sanitizeText } from '../utils/sanitizer';
import admin from 'firebase-admin';

const router: express.Router = express.Router();

// Initialize Firebase Admin (if not already initialized)
let db: any = null;

const initializeFirebase = () => {
  const requiredFirebaseVars = [
    'FIREBASE_PROJECT_ID',
    'FIREBASE_CLIENT_EMAIL', 
    'FIREBASE_PRIVATE_KEY',
    'FIREBASE_DATABASE_URL'
  ];
  
  const missingVars = requiredFirebaseVars.filter(varName => !process.env[varName]);
  
  if (missingVars.length > 0) {
    console.warn(`⚠️  Firebase initialization skipped - missing environment variables: ${missingVars.join(', ')}`);
    return false;
  }
  
  if (!admin.apps.length) {
    try {
      admin.initializeApp({
        credential: admin.credential.cert({
          projectId: process.env.FIREBASE_PROJECT_ID,
          clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
          privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n') || '',
        }),
        databaseURL: process.env.FIREBASE_DATABASE_URL
      });
      db = admin.database();
      console.log('✅ Firebase Admin initialized successfully');
      return true;
    } catch (error) {
      console.warn('Firebase initialization failed:', error);
      return false;
    }
  }
  return true;
};

initializeFirebase();

// Use the new sanitizer utility
const sanitizeMessage = (text: string) => {
  const result = sanitizeText(text);
  return {
    clean: result.clean,
    blocked: !result.clean,
    reason: result.reason
  };
};

// @route   POST /api/chat/messages
// @desc    Send a message
// @access  Private
router.post('/messages', requireUser, validateBody(messageCreateSchema), async (req: AuthenticatedRequest, res) => {
  try {
    const { text, threadId, roomId, userId, hostId } = req.body;

    // Sanitize message
    const sanitized = sanitizeMessage(text);

    // If message is blocked, store it but don't push to Firebase
    if (sanitized.blocked) {
      let messageThread;

      if (threadId) {
        // Use existing thread
        messageThread = await MessageThread.findById(threadId);
        if (!messageThread) {
          return res.status(404).json({
            success: false,
            message: 'Thread not found'
          });
        }
      } else {
        // Create new thread
        if (!roomId || !userId || !hostId) {
          return res.status(400).json({
            success: false,
            message: 'Room ID, User ID, and Host ID are required for new thread'
          });
        }

        // Check if thread already exists
        messageThread = await MessageThread.findOne({ roomId, userId });
        if (!messageThread) {
          messageThread = new MessageThread({
            roomId,
            userId,
            hostId,
            lastMessageAt: new Date()
          });
          await messageThread.save();
        }
      }

      // Create blocked message in database only
      const message = new Message({
        threadId: messageThread._id,
        senderRole: req.user!.role,
        text,
        blocked: true,
        reason: sanitized.reason
      });

      await message.save();

      // Update thread's last message time
      messageThread.lastMessageAt = new Date();
      await messageThread.save();

      // Return 200 with blocked status (do not push to Firebase)
      return res.status(200).json({
        success: true,
        message: 'Message blocked due to contact information',
        data: {
          id: message._id,
          threadId: messageThread._id,
          text: '[Message blocked - contains contact information]',
          blocked: true,
          reason: sanitized.reason,
          createdAt: message.createdAt
        }
      });
    }

    // Message is clean, proceed normally
    let messageThread;

    if (threadId) {
      // Use existing thread
      messageThread = await MessageThread.findById(threadId);
      if (!messageThread) {
        return res.status(404).json({
          success: false,
          message: 'Thread not found'
        });
      }
    } else {
      // Create new thread
      if (!roomId || !userId || !hostId) {
        return res.status(400).json({
          success: false,
          message: 'Room ID, User ID, and Host ID are required for new thread'
        });
      }

      // Check if thread already exists
      messageThread = await MessageThread.findOne({ roomId, userId });
      if (!messageThread) {
        messageThread = new MessageThread({
          roomId,
          userId,
          hostId,
          lastMessageAt: new Date()
        });
        await messageThread.save();
      }
    }

    // Create message in database
    const message = new Message({
      threadId: messageThread._id,
      senderRole: req.user!.role,
      text,
      blocked: false
    });

    await message.save();

    // Update thread's last message time
    messageThread.lastMessageAt = new Date();
    await messageThread.save();

    // Write to Firebase RTDB (if available)
    if (db) {
      try {
        // Write thread metadata
        const threadMetaRef = db.ref(`/threads/${messageThread._id}/meta`);
        await threadMetaRef.set({
          roomId: messageThread.roomId.toString(),
          userId: messageThread.userId.toString(),
          hostId: messageThread.hostId.toString(),
          lastMessageAt: messageThread.lastMessageAt.toISOString()
        });

        // Write message with push ID
        const messagesRef = db.ref(`/threads/${messageThread._id}/messages`);
        const newMessageRef = messagesRef.push();
        await newMessageRef.set({
          senderRole: message.senderRole,
          text: message.text,
          createdAt: message.createdAt.toISOString()
        });
      } catch (error) {
        console.warn('Failed to write to Firebase RTDB:', error);
      }
    }

    res.status(201).json({
      success: true,
      message: 'Message sent successfully',
      data: {
        id: message._id,
        threadId: messageThread._id,
        text: message.text,
        blocked: false,
        createdAt: message.createdAt
      }
    });
  } catch (error) {
    console.error('Send message error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// @route   POST /api/chat/threads
// @desc    Create a new message thread
// @access  Private
router.post('/threads', requireUser, async (req: AuthenticatedRequest, res) => {
  try {
    const { roomId, userId, hostId } = req.body;

    if (!roomId || !userId || !hostId) {
      return res.status(400).json({
        success: false,
        message: 'Room ID, User ID, and Host ID are required'
      });
    }

    // Check if thread already exists
    let messageThread = await MessageThread.findOne({ roomId, userId });
    
    if (messageThread) {
      return res.json({
        success: true,
        message: 'Thread already exists',
        data: {
          id: messageThread._id,
          roomId: messageThread.roomId,
          userId: messageThread.userId,
          hostId: messageThread.hostId,
          lastMessageAt: messageThread.lastMessageAt
        }
      });
    }

    // Create new thread
    messageThread = new MessageThread({
      roomId,
      userId,
      hostId,
      lastMessageAt: new Date()
    });

    await messageThread.save();

    // Write to Firebase RTDB (if available)
    if (db) {
      try {
        const threadMetaRef = db.ref(`/threads/${messageThread._id}/meta`);
        await threadMetaRef.set({
          roomId: messageThread.roomId.toString(),
          userId: messageThread.userId.toString(),
          hostId: messageThread.hostId.toString(),
          lastMessageAt: messageThread.lastMessageAt.toISOString()
        });
      } catch (error) {
        console.warn('Failed to write thread meta to Firebase RTDB:', error);
      }
    }

    res.status(201).json({
      success: true,
      message: 'Thread created successfully',
      data: {
        id: messageThread._id,
        roomId: messageThread.roomId,
        userId: messageThread.userId,
        hostId: messageThread.hostId,
        lastMessageAt: messageThread.lastMessageAt
      }
    });
  } catch (error) {
    console.error('Create thread error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// @route   GET /api/chat/threads/ids
// @desc    Get thread IDs that user is allowed to access
// @access  Private
router.get('/threads/ids', requireUser, async (req: AuthenticatedRequest, res) => {
  try {
    const userId = req.user!.id;
    const userRole = req.user!.role;

    let query: any = {};

    if (userRole === 'admin') {
      // Admin can see all threads
      query = {};
    } else if (userRole === 'host') {
      // Host can see threads where they are the host
      query = { hostId: userId };
    } else {
      // Guest can see threads where they are the user
      query = { userId: userId };
    }

    const threads = await MessageThread.find(query)
      .select('_id roomId userId hostId lastMessageAt')
      .sort({ lastMessageAt: -1 });

    const threadIds = threads.map(thread => (thread._id as any).toString());

    res.json({
      success: true,
      data: {
        threadIds,
        threads: threads.map(thread => ({
          id: thread._id,
          roomId: (thread.roomId as any).toString(),
          userId: (thread.userId as any).toString(),
          hostId: (thread.hostId as any).toString(),
          lastMessageAt: thread.lastMessageAt
        }))
      }
    });
  } catch (error) {
    console.error('Get thread IDs error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// @route   GET /api/chat/threads
// @desc    Get user's message threads
// @access  Private
router.get('/threads', requireUser, validateQuery(paginationSchema), async (req: AuthenticatedRequest, res) => {
  try {
    const { page, limit } = req.query;
    const skip = (Number(page) - 1) * Number(limit);

    let filter: any = {};

    if (req.user!.role === 'guest') {
      filter.userId = req.user!.id;
    } else if (req.user!.role === 'host') {
      const hostProfile = await HostProfile.findOne({ userId: req.user!.id });
      if (hostProfile) {
        filter.hostId = hostProfile._id;
      } else {
        return res.status(404).json({
          success: false,
          message: 'Host profile not found'
        });
      }
    } else if (req.user!.role === 'admin') {
      // Admin can see all threads
      filter = {};
    }

    const threads = await MessageThread.find(filter)
      .populate('roomId', 'title images')
      .populate('userId', 'name email')
      .populate('hostId', 'displayName')
      .sort({ lastMessageAt: -1 })
      .skip(skip)
      .limit(Number(limit));

    const total = await MessageThread.countDocuments(filter);

    res.json({
      success: true,
      data: {
        threads,
        pagination: {
          page: Number(page),
          limit: Number(limit),
          total,
          pages: Math.ceil(total / Number(limit))
        }
      }
    });
  } catch (error) {
    console.error('Get threads error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// @route   GET /api/chat/threads/:id/messages
// @desc    Get messages for a specific thread
// @access  Private
router.get('/threads/:id/messages', requireUser, validateQuery(paginationSchema), async (req: AuthenticatedRequest, res) => {
  try {
    const { page, limit } = req.query;
    const skip = (Number(page) - 1) * Number(limit);

    const thread = await MessageThread.findById(req.params.id);
    if (!thread) {
      return res.status(404).json({
        success: false,
        message: 'Thread not found'
      });
    }

    // Check permissions
    if (req.user!.role === 'guest' && thread.userId.toString() !== req.user!.id) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    if (req.user!.role === 'host') {
      const hostProfile = await HostProfile.findOne({ userId: req.user!.id });
      if (!hostProfile || thread.hostId.toString() !== (hostProfile._id as any).toString()) {
        return res.status(403).json({
          success: false,
          message: 'Access denied'
        });
      }
    }

    const messages = await Message.find({ threadId: req.params.id })
      .sort({ createdAt: 1 })
      .skip(skip)
      .limit(Number(limit));

    const total = await Message.countDocuments({ threadId: req.params.id });

    res.json({
      success: true,
      data: {
        messages,
        pagination: {
          page: Number(page),
          limit: Number(limit),
          total,
          pages: Math.ceil(total / Number(limit))
        }
      }
    });
  } catch (error) {
    console.error('Get messages error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// @route   GET /api/chat/threads/:id
// @desc    Get thread details
// @access  Private
router.get('/threads/:id', requireUser, async (req: AuthenticatedRequest, res) => {
  try {
    const thread = await MessageThread.findById(req.params.id)
      .populate('roomId', 'title images')
      .populate('userId', 'name email')
      .populate('hostId', 'displayName');

    if (!thread) {
      return res.status(404).json({
        success: false,
        message: 'Thread not found'
      });
    }

    // Check permissions
    if (req.user!.role === 'guest' && thread.userId._id.toString() !== req.user!.id) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    if (req.user!.role === 'host') {
      const hostProfile = await HostProfile.findOne({ userId: req.user!.id });
      if (!hostProfile || thread.hostId._id.toString() !== (hostProfile._id as any).toString()) {
        return res.status(403).json({
          success: false,
          message: 'Access denied'
        });
      }
    }

    res.json({
      success: true,
      data: thread
    });
  } catch (error) {
    console.error('Get thread error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

export default router;
