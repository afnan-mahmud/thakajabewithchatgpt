import express from 'express';
import { HostProfile, Room, Booking, User, AccountLedger } from '../models';
import { requireAdmin } from '../middleware/auth';
import { hostApprovalSchema, roomApprovalSchema, paginationSchema } from '../schemas';
import { validateBody, validateQuery } from '../middleware/validateRequest';

const router = express.Router();

// @route   GET /api/admin/stats
// @desc    Get admin dashboard statistics
// @access  Private (admin)
router.get('/stats', requireAdmin, async (req, res) => {
  try {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfYear = new Date(now.getFullYear(), 0, 1);

    // Get booking statistics
    const totalBookings = await Booking.countDocuments();
    const confirmedBookings = await Booking.countDocuments({ status: 'confirmed' });
    const cancelledBookings = await Booking.countDocuments({ status: 'cancelled' });
    
    // Get revenue from confirmed bookings
    const revenueResult = await Booking.aggregate([
      { $match: { status: 'confirmed', paymentStatus: 'paid' } },
      { $group: { _id: null, total: { $sum: '$amountTk' } } }
    ]);
    const totalRevenue = revenueResult.length > 0 ? revenueResult[0].total : 0;

    // Get host statistics
    const totalHosts = await HostProfile.countDocuments();
    const activeHosts = await HostProfile.countDocuments({ status: 'approved' });

    // Get room statistics
    const totalRooms = await Room.countDocuments();
    const activeRooms = await Room.countDocuments({ status: 'approved' });

    res.json({
      success: true,
      data: {
        totalBookings,
        confirmedBookings,
        cancelledBookings,
        totalRevenue,
        totalHosts,
        activeHosts,
        totalRooms,
        activeRooms
      }
    });
  } catch (error) {
    console.error('Admin stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// @route   GET /api/admin/hosts
// @desc    Get all host applications
// @access  Private (admin)
router.get('/hosts', requireAdmin, validateQuery(paginationSchema), async (req, res) => {
  try {
    const { page = 1, limit = 10, status } = req.query;
    const skip = (Number(page) - 1) * Number(limit);

    const filter: any = {};
    if (status) {
      filter.status = status;
    }

    const hosts = await HostProfile.find(filter)
      .populate('userId', 'name email phone')
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

// @route   GET /api/admin/rooms
// @desc    Get all rooms for admin review
// @access  Private (admin)
router.get('/rooms', requireAdmin, validateQuery(paginationSchema), async (req, res) => {
  try {
    const { page = 1, limit = 10, status } = req.query;
    const skip = (Number(page) - 1) * Number(limit);

    const filter: any = {};
    if (status) {
      filter.status = status;
    }

    const rooms = await Room.find(filter)
      .populate('hostId', 'displayName locationName')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit));

    const total = await Room.countDocuments(filter);

    res.json({
      success: true,
      data: rooms,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        pages: Math.ceil(total / Number(limit))
      }
    });
  } catch (error) {
    console.error('Get rooms error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// @route   GET /api/admin/bookings
// @desc    Get all bookings for admin review
// @access  Private (admin)
router.get('/bookings', requireAdmin, validateQuery(paginationSchema), async (req, res) => {
  try {
    const { page = 1, limit = 10, status } = req.query;
    const skip = (Number(page) - 1) * Number(limit);

    const filter: any = {};
    if (status) {
      filter.status = status;
    }

    const bookings = await Booking.find(filter)
      .populate('roomId', 'title locationName images')
      .populate('userId', 'name email phone')
      .populate('hostId', 'displayName')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit));

    const total = await Booking.countDocuments(filter);

    res.json({
      success: true,
      data: bookings,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        pages: Math.ceil(total / Number(limit))
      }
    });
  } catch (error) {
    console.error('Get bookings error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// @route   POST /api/admin/hosts/:id/approve
// @desc    Approve host application
// @access  Private (admin)
router.post('/hosts/:id/approve', requireAdmin, validateBody(hostApprovalSchema), async (req, res) => {
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
    return res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// @route   POST /api/admin/hosts/:id/reject
// @desc    Reject host application
// @access  Private (admin)
router.post('/hosts/:id/reject', requireAdmin, validateBody(hostApprovalSchema), async (req, res) => {
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
    return res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// @route   POST /api/admin/rooms/:id/approve
// @desc    Approve room listing
// @access  Private (admin)
router.post('/rooms/:id/approve', requireAdmin, validateBody(roomApprovalSchema), async (req, res) => {
  try {
    const room = await Room.findById(req.params.id);
    if (!room) {
      return res.status(404).json({
        success: false,
        message: 'Room not found'
      });
    }

    room.status = 'approved';
    room.commissionTk = req.body.commissionTk || room.commissionTk;
    room.totalPriceTk = room.basePriceTk + room.commissionTk;
    await room.save();

    res.json({
      success: true,
      message: 'Room approved successfully',
      data: {
        id: room._id,
        status: room.status,
        commissionTk: room.commissionTk,
        totalPriceTk: room.totalPriceTk,
        updatedAt: room.updatedAt
      }
    });
  } catch (error) {
    console.error('Approve room error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// @route   POST /api/admin/rooms/:id/reject
// @desc    Reject room listing
// @access  Private (admin)
router.post('/rooms/:id/reject', requireAdmin, validateBody(roomApprovalSchema), async (req, res) => {
  try {
    const room = await Room.findById(req.params.id);
    if (!room) {
      return res.status(404).json({
        success: false,
        message: 'Room not found'
      });
    }

    room.status = 'rejected';
    await room.save();

    res.json({
      success: true,
      message: 'Room rejected',
      data: {
        id: room._id,
        status: room.status,
        updatedAt: room.updatedAt
      }
    });
  } catch (error) {
    console.error('Reject room error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

export default router;
