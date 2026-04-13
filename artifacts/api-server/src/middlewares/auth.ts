import { Request, Response, NextFunction } from "express";

declare global {
  namespace Express {
    interface Request {
      userId?: string;
    }
  }
}

export function requireAuth(req: Request, res: Response, next: NextFunction) {
  const userId = req.signedCookies?.["userId"];
  if (!userId) {
    return res.status(401).json({ error: "Not authenticated" });
  }
  req.userId = userId as string;
  return next();
}

export function optionalAuth(req: Request, res: Response, next: NextFunction) {
  const userId = req.signedCookies?.["userId"];
  if (userId) {
    req.userId = userId as string;
  }
  return next();
}
