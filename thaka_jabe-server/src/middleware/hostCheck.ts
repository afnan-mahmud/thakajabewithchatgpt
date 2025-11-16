import { Request, Response, NextFunction } from 'express';
import { HostProfile } from '../models';
import { AuthenticatedRequest } from './auth';

/**
 * Middleware to check if user has a host profile (regardless of approval status)
 * This allows hosts to create listings even if their profile is pending approval
 */
export const requireHostProfile = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
      return;
    }

    // Check if user has a host profile (any status)
    const hostProfile = await HostProfile.findOne({ userId: req.user.id });
    
    if (!hostProfile) {
      res.status(403).json({
        success: false,
        message: 'Host profile required. Please apply to become a host first.'
      });
      return;
    }

    // Host profile exists - allow access
    // Room approval will be handled separately
    next();
  } catch (error) {
    console.error('Host profile check error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

/**
 * Middleware to check if host profile is approved
 * Use this for operations that require approved host status (e.g., payouts)
 */
export const requireApprovedHost = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
      return;
    }

    const hostProfile = await HostProfile.findOne({ userId: req.user.id });
    
    if (!hostProfile) {
      res.status(403).json({
        success: false,
        message: 'Host profile not found'
      });
      return;
    }

    if (hostProfile.status !== 'approved') {
      res.status(403).json({
        success: false,
        message: 'Host profile must be approved for this operation'
      });
      return;
    }

    next();
  } catch (error) {
    console.error('Approved host check error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

