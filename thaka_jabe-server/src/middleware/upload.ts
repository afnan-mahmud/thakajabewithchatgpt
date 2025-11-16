import multer from 'multer';
import sharp from 'sharp';
import { v4 as uuidv4 } from 'uuid';
import { Request } from 'express';
import { uploadToR2, deleteFromR2, extractKeyFromUrl } from '../utils/r2';

// File filter for images only
const imageFilter = (req: Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Only image files are allowed!'));
  }
};

// Multer configuration for room images using memory storage
export const roomImageUpload = multer({
  storage: multer.memoryStorage(),
  fileFilter: imageFilter,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB per file
    files: 15 // Maximum 15 files
  }
});

// Image processing middleware for room images (OPTIMIZED: Parallel processing)
export const processRoomImages = async (req: Request, res: any, next: any) => {
  try {
    if (!req.files || !Array.isArray(req.files)) {
      return next();
    }

    const roomId = req.params.roomId || req.body.roomId || 'temp';

    // Process all images in parallel for faster upload
    const processPromises = req.files.map(async (file) => {
      try {
        // Generate unique key for R2
        const key = `rooms/${roomId}/${uuidv4()}.webp`;
        
        // Process image with sharp (optimized settings)
        const processedBuffer = await sharp(file.buffer)
          .resize(1920, 1920, {
            fit: 'inside',
            withoutEnlargement: true
          })
          .webp({ 
            quality: 80,
            effort: 2 // Lower effort = faster processing (0-6, default 4)
          })
          .toBuffer();

        // Upload to R2
        const publicUrl = await uploadToR2(key, processedBuffer, 'image/webp');

        console.log(`[IMAGE_PROCESS] ✓ Processed: ${file.originalname} -> ${publicUrl}`);
        return publicUrl;
      } catch (error) {
        console.error(`[IMAGE_PROCESS] ✗ Error processing ${file.originalname}:`, error);
        return null;
      }
    });

    // Wait for all images to be processed
    const results = await Promise.all(processPromises);
    
    // Filter out failed uploads
    const processedFiles = results.filter((url): url is string => url !== null);

    // Attach processed files to request
    req.processedImages = processedFiles;
    
    console.log(`[IMAGE_PROCESS] Completed: ${processedFiles.length}/${req.files.length} images processed successfully`);
    next();
  } catch (error) {
    console.error('[IMAGE_PROCESS] Error:', error);
    next(error);
  }
};

// Delete room images helper
export const deleteRoomImages = async (roomId: string, imageUrls: string[]) => {
  try {
    for (const imageUrl of imageUrls) {
      try {
        const key = extractKeyFromUrl(imageUrl);
        await deleteFromR2(key);
        console.log(`[IMAGE_DELETE] Deleted from R2: ${key}`);
      } catch (error) {
        console.error(`[IMAGE_DELETE] Error deleting ${imageUrl}:`, error);
      }
    }
  } catch (error) {
    console.error('[IMAGE_DELETE] Error:', error);
  }
};

// Extend Request interface to include processedImages
declare global {
  namespace Express {
    interface Request {
      processedImages?: string[];
    }
  }
}