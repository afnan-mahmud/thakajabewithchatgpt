import multer from 'multer';
import sharp from 'sharp';
import { v4 as uuidv4 } from 'uuid';
import path from 'path';
import fs from 'fs';
import { Request } from 'express';

// Ensure upload directories exist
const ensureUploadDirs = (roomId: string) => {
  // Use local directory for development, production path for production
  const baseDir = process.env.NODE_ENV === 'production' ? '/var/www/uploads/rooms' : 'test-uploads/rooms';
  const uploadDir = path.join(baseDir, roomId);
  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
  }
  return uploadDir;
};

// Custom storage engine for multer
const roomImageStorage = multer.diskStorage({
  destination: (req: Request, file: Express.Multer.File, cb) => {
    const roomId = req.params.roomId || req.body.roomId || 'temp';
    console.log(`[MULTER] Room ID: ${roomId}`);
    const uploadDir = ensureUploadDirs(roomId);
    console.log(`[MULTER] Upload directory: ${uploadDir}`);
    cb(null, uploadDir);
  },
  filename: (req: Request, file: Express.Multer.File, cb) => {
    // Generate unique filename with .webp extension
    const uniqueName = `${uuidv4()}.webp`;
    console.log(`[MULTER] Generated filename: ${uniqueName}`);
    cb(null, uniqueName);
  }
});

// File filter for images only
const imageFilter = (req: Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Only image files are allowed!'));
  }
};

// Multer configuration for room images
export const roomImageUpload = multer({
  storage: roomImageStorage,
  fileFilter: imageFilter,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB per file
    files: 15 // Maximum 15 files
  }
});

// Image processing middleware
export const processRoomImages = async (req: Request, res: any, next: any) => {
  try {
    if (!req.files || !Array.isArray(req.files)) {
      return next();
    }

    const processedFiles: string[] = [];
    const roomId = req.params.roomId || req.body.roomId || 'temp';
    const uploadDir = ensureUploadDirs(roomId);

    for (const file of req.files) {
      const inputPath = file.path;
      const outputPath = path.join(uploadDir, file.filename);

      try {
        // Process image with sharp
        await sharp(inputPath)
          .resize(1920, 1920, {
            fit: 'inside',
            withoutEnlargement: true
          })
          .webp({ quality: 80 })
          .toFile(outputPath);

        // Remove original file
        fs.unlinkSync(inputPath);

        // Generate public URL
        const baseUrl = process.env.NODE_ENV === 'production' 
          ? 'https://thakajabe.com/uploads/rooms' 
          : 'http://localhost:3000/uploads/rooms';
        const publicUrl = `${baseUrl}/${roomId}/${file.filename}`;
        processedFiles.push(publicUrl);

        console.log(`[IMAGE_PROCESS] Processed: ${file.originalname} -> ${publicUrl}`);
      } catch (error) {
        console.error(`[IMAGE_PROCESS] Error processing ${file.originalname}:`, error);
        // Remove failed file
        if (fs.existsSync(inputPath)) {
          fs.unlinkSync(inputPath);
        }
        if (fs.existsSync(outputPath)) {
          fs.unlinkSync(outputPath);
        }
      }
    }

    // Attach processed files to request
    req.processedImages = processedFiles;
    next();
  } catch (error) {
    console.error('[IMAGE_PROCESS] Error:', error);
    next(error);
  }
};

// Delete room images helper
export const deleteRoomImages = async (roomId: string, imageUrls: string[]) => {
  try {
    const baseDir = process.env.NODE_ENV === 'production' ? '/var/www/uploads/rooms' : 'test-uploads/rooms';
    const uploadDir = path.join(baseDir, roomId);
    
    for (const imageUrl of imageUrls) {
      const filename = path.basename(imageUrl);
      const filePath = path.join(uploadDir, filename);
      
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
        console.log(`[IMAGE_DELETE] Deleted: ${filePath}`);
      }
    }

    // Remove room directory if empty
    if (fs.existsSync(uploadDir)) {
      const files = fs.readdirSync(uploadDir);
      if (files.length === 0) {
        fs.rmdirSync(uploadDir);
        console.log(`[IMAGE_DELETE] Removed empty directory: ${uploadDir}`);
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
