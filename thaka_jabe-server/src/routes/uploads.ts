import express from 'express';
import multer from 'multer';
import path from 'path';
import { uploadImage, deleteImage } from '../controllers/uploadController';
import { requireUser } from '../middleware/auth';
import { roomImageUpload, processRoomImages, deleteRoomImages } from '../middleware/upload';

const router: express.Router = express.Router();

// Configure multer for image uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const fileFilter = (req: any, file: any, cb: any) => {
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Only image files are allowed!'), false);
  }
};

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
  fileFilter: fileFilter
});

// Routes
router.post('/image', requireUser, upload.single('image'), uploadImage);
router.delete('/image/:filename', requireUser, deleteImage);

// Room image uploads
router.post('/rooms/:roomId/images', requireUser, roomImageUpload.array('images', 15), processRoomImages, async (req, res) => {
  try {
    const { roomId } = req.params;
    const processedImages = req.processedImages || [];

    if (processedImages.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No images were processed successfully'
      });
    }

    res.json({
      success: true,
      message: `${processedImages.length} images uploaded successfully`,
      data: {
        roomId,
        images: processedImages,
        count: processedImages.length
      }
    });
  } catch (error) {
    console.error('Room image upload error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Delete room images
router.delete('/rooms/:roomId/images', requireUser, async (req, res) => {
  try {
    const { roomId } = req.params;
    const { imageUrls } = req.body;

    if (!imageUrls || !Array.isArray(imageUrls)) {
      return res.status(400).json({
        success: false,
        message: 'Image URLs array is required'
      });
    }

    await deleteRoomImages(roomId, imageUrls);

    res.json({
      success: true,
      message: 'Images deleted successfully',
      data: {
        roomId,
        deletedCount: imageUrls.length
      }
    });
  } catch (error) {
    console.error('Delete room images error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

export default router;
