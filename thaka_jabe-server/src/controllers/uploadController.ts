import { Request, Response, NextFunction } from 'express';
import fs from 'fs';
import path from 'path';
import { AppError } from '../middleware/errorHandler';

export const uploadImage = async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.file) {
      return next(new AppError('No image file provided', 400));
    }

    const imageUrl = `${process.env.NEXT_PUBLIC_IMG_BASE_URL || 'http://localhost:8080'}/uploads/${req.file.filename}`;

    res.json({
      success: true,
      message: 'Image uploaded successfully',
      data: {
        filename: req.file.filename,
        originalName: req.file.originalname,
        size: req.file.size,
        url: imageUrl
      }
    });
  } catch (error) {
    next(error);
  }
};

export const deleteImage = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { filename } = req.params;
    const filePath = path.join('uploads', filename);

    // Check if file exists
    if (!fs.existsSync(filePath)) {
      return next(new AppError('File not found', 404));
    }

    // Delete file
    fs.unlinkSync(filePath);

    res.json({
      success: true,
      message: 'Image deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};
