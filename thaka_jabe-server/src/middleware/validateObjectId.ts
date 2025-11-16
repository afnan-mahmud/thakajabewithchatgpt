import { Request, Response, NextFunction } from 'express';
import { isValidObjectId } from '../utils/validation';
import { AppError } from './errorHandler';

/**
 * Middleware to validate MongoDB ObjectId in request params
 * Apply this to routes that have :id, :roomId, :userId, etc.
 */
export const validateObjectId = (paramName: string = 'id') => {
  return (req: Request, res: Response, next: NextFunction) => {
    const id = req.params[paramName];
    
    if (id && !isValidObjectId(id)) {
      return next(new AppError(`Invalid ${paramName} format`, 400));
    }
    
    next();
  };
};

/**
 * Middleware to validate multiple ObjectId params
 */
export const validateObjectIds = (...paramNames: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    for (const paramName of paramNames) {
      const id = req.params[paramName];
      
      if (id && !isValidObjectId(id)) {
        return next(new AppError(`Invalid ${paramName} format`, 400));
      }
    }
    
    next();
  };
};

