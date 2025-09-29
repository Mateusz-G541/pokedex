import { Router, Request, Response } from 'express';
import { authenticateToken, optionalAuth } from '../middleware/auth.middleware';

const router = Router();

// Create session (store token in httpOnly cookie)
router.post('/session', async (req: Request, res: Response) => {
  try {
    const { token, user } = req.body;
    
    if (!token) {
      return res.status(400).json({ error: 'Token is required' });
    }
    
    // Set httpOnly cookie with token
    res.cookie('authToken', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 24 * 60 * 60 * 1000 // 24 hours
    });
    
    res.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to create session' });
  }
});

// Get current session
router.get('/session', authenticateToken, async (req: Request, res: Response) => {
  res.json({
    success: true,
    user: req.user
  });
});

// Logout (clear cookie)
router.post('/logout', async (req: Request, res: Response) => {
  res.clearCookie('authToken');
  res.json({
    success: true,
    message: 'Logged out successfully'
  });
});

// Refresh token (optional - for future implementation)
router.post('/refresh', authenticateToken, async (req: Request, res: Response) => {
  // This would call auth service to refresh the token
  res.json({
    success: false,
    message: 'Token refresh not implemented yet'
  });
});

export default router;
