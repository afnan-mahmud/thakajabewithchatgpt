import express from 'express';
import { HostProfile, User, Room, Booking } from '../models';
import { requireUser, requireHost, requireAdmin } from '../middleware/auth';
import { hostApplySchema, hostApprovalSchema, paginationSchema, statusFilterSchema } from '../schemas';
import { validateBody, validateQuery } from '../middleware/validateRequest';

const router = express.Router();

// @route   POST /api/hosts/apply
// @desc    Apply to become a host
// @access  Private (any authenticated user)
router.post('/apply', requireUser, validateBody(hostApplySchema), async (req, res) => {
  try {
    // Check if user already has a host profile
    const existingProfile = await HostProfile.findOne({ userId: req.user!.id });
    if (existingProfile) {
      return res.status(400).json({
        success: false,
        message: 'Host profile already exists'
      });
    }

    // Create host profile
    const hostProfile = new HostProfile({
      userId: req.user!.id,
      ...req.body,
      status: 'pending'
    });

    await hostProfile.save();

    res.status(201).json({
      success: true,
      message: 'Host application submitted successfully',
      data: {
        id: hostProfile._id,
        status: hostProfile.status,
        createdAt: hostProfile.createdAt
      }
    });
  } catch (error) {
    console.error('Host application error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// @route   GET /api/hosts/me
// @desc    Get current user's host profile
// @access  Private (host or admin)
router.get('/me', requireUser, async (req, res) => {
  try {
    const hostProfile = await HostProfile.findOne({ userId: req.user!.id })
      .populate('userId', 'name email phone');

    if (!hostProfile) {
      return res.status(404).json({
        success: false,
        message: 'Host profile not found'
      });
    }

    res.json({
      success: true,
      data: {
        id: hostProfile._id,
        displayName: hostProfile.displayName,
        phone: hostProfile.phone,
        whatsapp: hostProfile.whatsapp,
        locationName: hostProfile.locationName,
        locationMapUrl: hostProfile.locationMapUrl,
        nidFrontUrl: hostProfile.nidFrontUrl,
        nidBackUrl: hostProfile.nidBackUrl,
        status: hostProfile.status,
        propertyCount: hostProfile.propertyCount,
        user: hostProfile.userId,
        createdAt: hostProfile.createdAt,
        updatedAt: hostProfile.updatedAt
      }
    });
  } catch (error) {
    console.error('Get host profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// @route   GET /api/admin/hosts
// @desc    Get all host profiles (admin only)
// @access  Private (admin)
router.get('/admin/hosts', requireAdmin, validateQuery(paginationSchema.merge(statusFilterSchema)), async (req, res) => {
  try {
    const { page, limit, status } = req.query;
    const skip = (Number(page) - 1) * Number(limit);

    const filter: any = {};
    if (status) filter.status = status;

    const hosts = await HostProfile.find(filter)
      .populate('userId', 'name email phone createdAt')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit));

    const total = await HostProfile.countDocuments(filter);

    res.json({
      success: true,
      data: {
        hosts,
        pagination: {
          page: Number(page),
          limit: Number(limit),
          total,
          pages: Math.ceil(total / Number(limit))
        }
      }
    });
  } catch (error) {
    console.error('Get hosts error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// @route   POST /api/admin/hosts/:id/approve
// @desc    Approve host application
// @access  Private (admin)
router.post('/admin/hosts/:id/approve', requireAdmin, validateBody(hostApprovalSchema), async (req, res) => {
  try {
    const hostProfile = await HostProfile.findById(req.params.id);
    if (!hostProfile) {
      return res.status(404).json({
        success: false,
        message: 'Host profile not found'
      });
    }

    hostProfile.status = 'approved';
    await hostProfile.save();

    // Update user role to host
    await User.findByIdAndUpdate(hostProfile.userId, { role: 'host' });

    res.json({
      success: true,
      message: 'Host application approved successfully',
      data: {
        id: hostProfile._id,
        status: hostProfile.status,
        updatedAt: hostProfile.updatedAt
      }
    });
  } catch (error) {
    console.error('Approve host error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// @route   POST /api/admin/hosts/:id/reject
// @desc    Reject host application
// @access  Private (admin)
router.post('/admin/hosts/:id/reject', requireAdmin, validateBody(hostApprovalSchema), async (req, res) => {
  try {
    const hostProfile = await HostProfile.findById(req.params.id);
    if (!hostProfile) {
      return res.status(404).json({
        success: false,
        message: 'Host profile not found'
      });
    }

    hostProfile.status = 'rejected';
    await hostProfile.save();

    res.json({
      success: true,
      message: 'Host application rejected',
      data: {
        id: hostProfile._id,
        status: hostProfile.status,
        updatedAt: hostProfile.updatedAt
      }
    });
  } catch (error) {
    console.error('Reject host error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// @route   GET /api/hosts/stats
// @desc    Get host dashboard statistics
// @access  Private (host)
router.get('/stats', requireHost, async (req, res) => {
  try {
    const hostProfile = await HostProfile.findOne({ userId: req.user!.id });
    if (!hostProfile) {
      return res.status(404).json({
        success: false,
        message: 'Host profile not found'
      });
    }

    // Get booking statistics for this host
    const totalBookings = await Booking.countDocuments({ hostId: hostProfile._id });
    const confirmedBookings = await Booking.countDocuments({ 
      hostId: hostProfile._id, 
      status: 'confirmed' 
    });
    const pendingBookings = await Booking.countDocuments({ 
      hostId: hostProfile._id, 
      status: 'pending' 
    });

    // Get earnings from confirmed bookings
    const earningsResult = await Booking.aggregate([
      { 
        $match: { 
          hostId: hostProfile._id, 
          status: 'confirmed', 
          paymentStatus: 'paid' 
        } 
      },
      { $group: { _id: null, total: { $sum: '$amountTk' } } }
    ]);
    const totalEarnings = earningsResult.length > 0 ? earningsResult[0].total : 0;

    // Get room statistics
    const totalRooms = await Room.countDocuments({ hostId: hostProfile._id });
    const activeRooms = await Room.countDocuments({ 
      hostId: hostProfile._id, 
      status: 'approved' 
    });

    res.json({
      success: true,
      data: {
        totalBookings,
        confirmedBookings,
        pendingBookings,
        totalEarnings,
        totalRooms,
        activeRooms
      }
    });
  } catch (error) {
    console.error('Host stats error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// @route   GET /api/hosts/rooms
// @desc    Get host's rooms
// @access  Private (host)
router.get('/rooms', requireHost, async (req, res) => {
  try {
    const hostProfile = await HostProfile.findOne({ userId: req.user!.id });
    if (!hostProfile) {
      return res.status(404).json({
        success: false,
        message: 'Host profile not found'
      });
    }

    const rooms = await Room.find({ hostId: hostProfile._id })
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      data: rooms
    });
  } catch (error) {
    console.error('Get host rooms error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// @route   GET /api/hosts/bookings
// @desc    Get host's bookings
// @access  Private (host)
router.get('/bookings', requireHost, async (req, res) => {
  try {
    const hostProfile = await HostProfile.findOne({ userId: req.user!.id });
    if (!hostProfile) {
      return res.status(404).json({
        success: false,
        message: 'Host profile not found'
      });
    }

    const bookings = await Booking.find({ hostId: hostProfile._id })
      .populate('roomId', 'title locationName images')
      .populate('userId', 'name email phone')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      data: bookings
    });
  } catch (error) {
    console.error('Get host bookings error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

export default router;
