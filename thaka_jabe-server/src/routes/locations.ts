import express, { Request, Response } from 'express';
import { Room } from '../models';

const router: express.Router = express.Router();

// @route   GET /api/locations
// @desc    Get unique location names for autocomplete
// @access  Public
router.get('/', async (req: Request, res: Response) => {
  try {
    const { s } = req.query;
    const searchTerm = s ? String(s).trim() : '';

    // Get unique location names from approved rooms
    const locations = await Room.aggregate([
      {
        $match: {
          status: 'approved',
          ...(searchTerm && {
            locationName: { $regex: searchTerm, $options: 'i' }
          })
        }
      },
      {
        $group: {
          _id: '$locationName',
          count: { $sum: 1 }
        }
      },
      {
        $sort: { count: -1 }
      },
      {
        $limit: 10
      },
      {
        $project: {
          id: '$_id',
          label: '$_id',
          count: 1,
          _id: 0
        }
      }
    ]);

    return res.json(locations);
  } catch (error) {
    console.error('Get locations error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

export default router;

