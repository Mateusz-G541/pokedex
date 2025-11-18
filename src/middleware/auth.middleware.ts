import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

interface JwtPayload {
  userId: number;
  username: string;
  role: string;
  iat?: number;
  exp?: number;
}

declare global {
  namespace Express {
    interface Request {
      user?: JwtPayload;
      token?: string;
    }
  }
}

const JWT_SECRET = process.env.JWT_SECRET || 'change-me-in-prod';

if (JWT_SECRET === 'change-me-in-prod') {
  // eslint-disable-next-line no-console
  console.warn(
    '⚠️ Using default JWT secret in pokedex API. Set JWT_SECRET in environment for production.',
  );
}

const validateToken = (token: string): JwtPayload => {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as JwtPayload;
    return decoded;
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      throw new Error('Token has expired');
    } else if (error instanceof jwt.JsonWebTokenError) {
      throw new Error('Invalid token');
    } else {
      throw new Error('Token validation failed');
    }
  }
};

// Extract token from cookie or Authorization header
export const extractToken = (req: Request): string | null => {
  // Check cookie first (preferred for security)
  if (req.cookies?.authToken) {
    return req.cookies.authToken;
  }

  // Fallback to Authorization header
  const authHeader = req.headers.authorization;
  if (authHeader?.startsWith('Bearer ')) {
    return authHeader.substring(7);
  }

  return null;
};

// Main authentication middleware
export const authenticateToken = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const token = extractToken(req);

    if (!token) {
      res.status(401).json({
        error: 'Authentication required',
      });
      return;
    }

    const userPayload = validateToken(token);
    req.user = userPayload;
    req.token = token;

    next();
  } catch (error) {
    res.status(401).json({
      error: (error as Error).message,
    });
    return;
  }
};

// Optional auth - doesn't fail if no token
export const optionalAuth = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const token = extractToken(req);

    if (token) {
      try {
        const userPayload = validateToken(token);
        req.user = userPayload;
        req.token = token;
      } catch (error) {
        console.warn('Optional auth failed:', (error as Error).message);
      }
    }

    next();
  } catch (error) {
    next();
  }
};

// Role-based access control
export const requireRole = (roles: string[]) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({
        error: 'Authentication required',
      });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        error: 'Insufficient permissions',
      });
    }

    next();
  };
};

export const requireAdmin = requireRole(['admin']);
export const requireUser = requireRole(['user', 'admin']);
