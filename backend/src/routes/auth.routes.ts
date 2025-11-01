/**
 * 认证路由 (Auth Routes)
 * /api/v1/auth
 */

import express, { Request, Response } from 'express';
import { UserService } from '../services/user/user.service';
import { generateToken, generateRefreshToken, verifyRefreshToken } from '../middleware/auth.middleware';

const router = express.Router();

/**
 * 用户登录
 * POST /api/v1/auth/login
 */
router.post('/login', async (req: Request, res: Response): Promise<void> => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      res.status(400).json({
        code: 400,
        message: 'Username and password are required',
        data: null,
      });
      return;
    }

    // 查找用户
    const user = await UserService.findUserForLogin(username);

    if (!user) {
      res.status(401).json({
        code: 401,
        message: 'Invalid username or password',
        data: null,
      });
      return;
    }

    // 检查用户状态
    if (user.status !== 'active') {
      res.status(403).json({
        code: 403,
        message: 'User account is not active',
        data: null,
      });
      return;
    }

    // 验证密码
    const isPasswordValid = await UserService.verifyPassword(password, user.passwordHash);

    if (!isPasswordValid) {
      res.status(401).json({
        code: 401,
        message: 'Invalid username or password',
        data: null,
      });
      return;
    }

    // 更新最后登录时间
    await UserService.updateLastLogin(user.id);

    // 生成 Token
    const tokenPayload = {
      user_id: user.id,
      username: user.username,
      email: user.email,
      role: user.role,
      tenant_id: user.tenantId,
    };

    const accessToken = generateToken(tokenPayload);
    const refreshToken = generateRefreshToken(tokenPayload);

    res.status(200).json({
      code: 200,
      message: 'Login successful',
      data: {
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          role: user.role,
          tenant_id: user.tenantId,
        },
        access_token: accessToken,
        refresh_token: refreshToken,
        token_type: 'Bearer',
      },
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      code: 500,
      message: 'Login failed',
      data: null,
    });
  }
});

/**
 * 刷新 Token
 * POST /api/v1/auth/refresh
 */
router.post('/refresh', async (req: Request, res: Response): Promise<void> => {
  try {
    const { refresh_token } = req.body;

    if (!refresh_token) {
      res.status(400).json({
        code: 400,
        message: 'Refresh token is required',
        data: null,
      });
      return;
    }

    // 验证刷新 Token
    const payload = verifyRefreshToken(refresh_token);

    // 生成新的访问 Token
    const newAccessToken = generateToken({
      user_id: payload.user_id,
      username: payload.username,
      email: payload.email,
      role: payload.role,
      tenant_id: payload.tenant_id,
    });

    res.status(200).json({
      code: 200,
      message: 'Token refreshed successfully',
      data: {
        access_token: newAccessToken,
        token_type: 'Bearer',
      },
    });
  } catch (error) {
    console.error('Token refresh error:', error);
    res.status(401).json({
      code: 401,
      message: 'Invalid or expired refresh token',
      data: null,
    });
  }
});

/**
 * 用户登出
 * POST /api/v1/auth/logout
 */
router.post('/logout', async (req: Request, res: Response): Promise<void> => {
  // 客户端应该删除本地存储的 Token
  res.status(200).json({
    code: 200,
    message: 'Logout successful',
    data: null,
  });
});

export default router;
