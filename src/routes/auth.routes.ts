import { Router, Request, Response } from 'express';
import { authenticateToken } from '../middleware/auth.middleware';
import axios from 'axios';

const router = Router();
// Hardcoded VPS auth service URL
const AUTH_SERVICE_URL = 'https://auth.srv36.mikr.us';

// Login proxy (forwards to auth service and stores token)
router.post('/login', async (req: Request, res: Response) => {
  try {
    const { username, password } = req.body;

    // Forward login request to auth service
    const response = await axios.post(`${AUTH_SERVICE_URL}/auth/login`, {
      username,
      password,
    });

    if (response.data.success) {
      const { token, user } = response.data.data;

      // Set httpOnly cookie with token
      res.cookie('authToken', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 24 * 60 * 60 * 1000, // 24 hours
      });

      return res.json({
        success: true,
        data: {
          user: {
            id: user.id,
            // Frontend oczekuje pola email, więc mapujemy username jako email
            email: user.username,
            role: user.role,
          },
        },
      });
    }

    return res.status(401).json({
      success: false,
      error: 'Invalid credentials',
    });
  } catch (error: unknown) {
    const axiosError = error as { response?: { data?: { error?: string }; status?: number } };
    const errorMessage = axiosError.response?.data?.error || 'Login failed';
    return res.status(axiosError.response?.status || 500).json({
      success: false,
      error: errorMessage,
    });
  }
});

// Register proxy – na ten moment rejestracja nie jest zaimplementowana w simple-auth
router.post('/register', async (req: Request, res: Response) => {
  return res.status(501).json({
    success: false,
    error: 'Registration is not implemented yet',
  });
});

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
      maxAge: 24 * 60 * 60 * 1000, // 24 hours
    });

    res.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to create session' });
  }
});

// Get current session
router.get('/session', authenticateToken, async (req: Request, res: Response) => {
  res.json({
    success: true,
    user: req.user,
  });
});

// Logout (clear cookie)
router.post('/logout', async (req: Request, res: Response) => {
  res.clearCookie('authToken');
  res.json({
    success: true,
    message: 'Logged out successfully',
  });
});

// Refresh token (optional - for future implementation)
router.post('/refresh', authenticateToken, async (req: Request, res: Response) => {
  // This would call auth service to refresh the token
  res.json({
    success: false,
    message: 'Token refresh not implemented yet',
  });
});

export default router;
