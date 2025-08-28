import { Request, Response, NextFunction } from 'express';

export function ensureAuthenticated(req: any, res: Response, next: NextFunction) {
  if (req.user) {
    return next();
  }
  res.status(401).json({ error: 'Authentication required' });
}
