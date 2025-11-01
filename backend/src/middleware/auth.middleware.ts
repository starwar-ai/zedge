/**
 * 认证中间件 (Authentication Middleware)
 * 用于验证 JWT Token 并提取用户信息
 */

import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { UserRole } from '@prisma/client';

interface JwtPayload {
  user_id: string;
  username: string;
  email: string;
  role: UserRole;
  tenant_id?: string;
  iat?: number;
  exp?: number;
}

/**
 * JWT Token 认证中间件
 * 从请求头中提取 Bearer Token 并验证
 */
export const authenticateToken = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
      res.status(401).json({
        code: 401,
        message: 'Access token required',
        data: null,
      });
      return;
    }

    // 验证 JWT Token
    const jwtSecret = process.env.JWT_SECRET;
    if (!jwtSecret) {
      throw new Error('JWT_SECRET is not configured');
    }

    const payload = jwt.verify(token, jwtSecret) as JwtPayload;

    // 将用户信息附加到请求对象
    req.user = {
      user_id: payload.user_id,
      username: payload.username,
      email: payload.email,
      role: payload.role,
      tenant_id: payload.tenant_id,
    };

    next();
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      res.status(401).json({
        code: 401,
        message: 'Token expired',
        data: null,
      });
      return;
    }

    if (error instanceof jwt.JsonWebTokenError) {
      res.status(403).json({
        code: 403,
        message: 'Invalid token',
        data: null,
      });
      return;
    }

    res.status(500).json({
      code: 500,
      message: 'Authentication error',
      data: null,
    });
  }
};

/**
 * 可选的认证中间件
 * 如果有 Token 则验证，没有则继续（用于公共和私有混合的接口）
 */
export const optionalAuth = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    next();
    return;
  }

  try {
    const jwtSecret = process.env.JWT_SECRET;
    if (!jwtSecret) {
      throw new Error('JWT_SECRET is not configured');
    }

    const payload = jwt.verify(token, jwtSecret) as JwtPayload;

    req.user = {
      user_id: payload.user_id,
      username: payload.username,
      email: payload.email,
      role: payload.role,
      tenant_id: payload.tenant_id,
    };

    next();
  } catch (error) {
    // Token 无效时忽略错误，继续处理请求
    next();
  }
};

/**
 * 生成 JWT Token
 */
export const generateToken = (payload: Omit<JwtPayload, 'iat' | 'exp'>): string => {
  const jwtSecret = process.env.JWT_SECRET;
  if (!jwtSecret) {
    throw new Error('JWT_SECRET is not configured');
  }

  const expiresIn = process.env.JWT_EXPIRES_IN || '24h';

  return jwt.sign(payload, jwtSecret, { expiresIn });
};

/**
 * 生成刷新 Token
 */
export const generateRefreshToken = (payload: Omit<JwtPayload, 'iat' | 'exp'>): string => {
  const jwtSecret = process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET;
  if (!jwtSecret) {
    throw new Error('JWT_REFRESH_SECRET is not configured');
  }

  const expiresIn = process.env.JWT_REFRESH_EXPIRES_IN || '7d';

  return jwt.sign(payload, jwtSecret, { expiresIn });
};

/**
 * 验证刷新 Token
 */
export const verifyRefreshToken = (token: string): JwtPayload => {
  const jwtSecret = process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET;
  if (!jwtSecret) {
    throw new Error('JWT_REFRESH_SECRET is not configured');
  }

  return jwt.verify(token, jwtSecret) as JwtPayload;
};
