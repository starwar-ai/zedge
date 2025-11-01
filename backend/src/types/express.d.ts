// TypeScript type definitions for Express Request augmentation

import { UserRole } from '@prisma/client';

declare global {
  namespace Express {
    interface Request {
      user?: {
        user_id: string;
        username: string;
        email: string;
        role: UserRole;
        tenant_id?: string;
      };
    }
  }
}

export {};
