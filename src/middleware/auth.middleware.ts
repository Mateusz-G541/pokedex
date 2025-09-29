import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import axios from 'axios';

interface JwtPayload {
  userId: number;
  email: string;
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

class TokenValidator {
  private publicKey?: string;
  private keyFetchTime: number = 0;
  private readonly KEY_CACHE_DURATION = 3600000; // 1 hour

  private async fetchPublicKey(): Promise<string> {
    const authServiceUrl = process.env.AUTH_SERVICE_URL || 'http://localhost:4000';

    try {
      const response = await axios.get(`${authServiceUrl}/auth/public-key`, {
        timeout: 5000,
      });

      if (response.data.success && response.data.data.publicKey) {
        this.publicKey = response.data.data.publicKey as string;
        this.keyFetchTime = Date.now();
        return response.data.data.publicKey as string;
      } else {
        throw new Error('Invalid response from auth service');
      }
    } catch (error) {
      console.error('Failed to fetch public key:', error);
      throw new Error('Unable to fetch public key');
    }
  }

  private async getPublicKey(): Promise<string> {
    if (this.publicKey && Date.now() - this.keyFetchTime < this.KEY_CACHE_DURATION) {
      return this.publicKey as string;
    }
    return await this.fetchPublicKey();
  }

  async validateToken(token: string): Promise<JwtPayload> {
    try {
      const publicKey = await this.getPublicKey();

      const decoded = jwt.verify(token, publicKey, {
        algorithms: ['RS256'],
        issuer: 'pokedex-auth-service',
        audience: 'pokedex-app',
      }) as JwtPayload;

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
  }
}

const tokenValidator = new TokenValidator();

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

    const userPayload = await tokenValidator.validateToken(token);
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
        const userPayload = await tokenValidator.validateToken(token);
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

export const requireAdmin = requireRole(['ADMINISTRATOR']);
export const requireUser = requireRole(['USER', 'ADMINISTRATOR']);
