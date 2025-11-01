/**
 * 用户服务层 (User Service)
 * 提供用户的 CRUD 操作和认证功能
 */

import { prisma } from '../../utils/prisma.client';
import { User, UserRole, UserStatus, Prisma } from '@prisma/client';
import bcrypt from 'bcrypt';

/**
 * 创建用户 DTO
 */
export interface CreateUserDto {
  username: string;
  email: string;
  password: string;
  role?: UserRole;
  tenantId?: string;
  quotaConfig?: any;
}

/**
 * 更新用户 DTO
 */
export interface UpdateUserDto {
  username?: string;
  email?: string;
  password?: string;
  role?: UserRole;
  status?: UserStatus;
  quotaConfig?: any;
}

/**
 * 用户列表查询参数
 */
export interface UserListQuery {
  page?: number;
  limit?: number;
  tenantId?: string;
  role?: UserRole;
  status?: UserStatus;
  search?: string;
}

/**
 * 用户服务类
 */
export class UserService {
  /**
   * 创建用户
   */
  static async createUser(data: CreateUserDto): Promise<Omit<User, 'passwordHash'>> {
    // 检查用户名是否已存在
    const existingUsername = await prisma.user.findUnique({
      where: { username: data.username },
    });

    if (existingUsername) {
      throw new Error('Username already exists');
    }

    // 检查邮箱是否已存在
    const existingEmail = await prisma.user.findUnique({
      where: { email: data.email },
    });

    if (existingEmail) {
      throw new Error('Email already exists');
    }

    // 加密密码
    const saltRounds = 10;
    const passwordHash = await bcrypt.hash(data.password, saltRounds);

    // 创建用户
    const user = await prisma.user.create({
      data: {
        username: data.username,
        email: data.email,
        passwordHash,
        role: data.role || UserRole.USER,
        tenantId: data.tenantId,
        quotaConfig: data.quotaConfig as Prisma.InputJsonValue,
        status: UserStatus.ACTIVE,
      },
    });

    // 排除密码字段
    const { passwordHash: _, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }

  /**
   * 通过用户名或邮箱查找用户（用于登录）
   */
  static async findUserForLogin(usernameOrEmail: string): Promise<User | null> {
    return prisma.user.findFirst({
      where: {
        OR: [{ username: usernameOrEmail }, { email: usernameOrEmail }],
      },
    });
  }

  /**
   * 验证密码
   */
  static async verifyPassword(
    plainPassword: string,
    passwordHash: string
  ): Promise<boolean> {
    return bcrypt.compare(plainPassword, passwordHash);
  }

  /**
   * 获取用户详情
   */
  static async getUserById(
    userId: string
  ): Promise<Omit<User, 'passwordHash'> | null> {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        tenant: {
          select: {
            id: true,
            name: true,
            status: true,
          },
        },
        groupMemberships: {
          include: {
            group: {
              select: {
                id: true,
                name: true,
                description: true,
              },
            },
          },
        },
      },
    });

    if (!user) {
      return null;
    }

    const { passwordHash: _, ...userWithoutPassword } = user;
    return userWithoutPassword as any;
  }

  /**
   * 获取用户列表
   */
  static async getUserList(query: UserListQuery): Promise<{
    users: Omit<User, 'passwordHash'>[];
    total: number;
    page: number;
    limit: number;
  }> {
    const page = query.page || 1;
    const limit = query.limit || 20;
    const skip = (page - 1) * limit;

    const where: Prisma.UserWhereInput = {};

    if (query.tenantId) {
      where.tenantId = query.tenantId;
    }

    if (query.role) {
      where.role = query.role;
    }

    if (query.status) {
      where.status = query.status;
    }

    if (query.search) {
      where.OR = [
        { username: { contains: query.search, mode: 'insensitive' } },
        { email: { contains: query.search, mode: 'insensitive' } },
      ];
    }

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          username: true,
          email: true,
          role: true,
          status: true,
          tenantId: true,
          quotaConfig: true,
          lastLoginAt: true,
          createdAt: true,
          updatedAt: true,
        },
      }),
      prisma.user.count({ where }),
    ]);

    return {
      users: users as any,
      total,
      page,
      limit,
    };
  }

  /**
   * 更新用户
   */
  static async updateUser(
    userId: string,
    data: UpdateUserDto
  ): Promise<Omit<User, 'passwordHash'>> {
    // 检查用户是否存在
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new Error('User not found');
    }

    // 如果更新用户名，检查是否重复
    if (data.username && data.username !== user.username) {
      const existing = await prisma.user.findUnique({
        where: { username: data.username },
      });

      if (existing) {
        throw new Error('Username already exists');
      }
    }

    // 如果更新邮箱，检查是否重复
    if (data.email && data.email !== user.email) {
      const existing = await prisma.user.findUnique({
        where: { email: data.email },
      });

      if (existing) {
        throw new Error('Email already exists');
      }
    }

    // 准备更新数据
    const updateData: any = {
      username: data.username,
      email: data.email,
      role: data.role,
      status: data.status,
      quotaConfig: data.quotaConfig as Prisma.InputJsonValue,
    };

    // 如果更新密码，加密密码
    if (data.password) {
      const saltRounds = 10;
      updateData.passwordHash = await bcrypt.hash(data.password, saltRounds);
    }

    // 更新用户
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: updateData,
    });

    const { passwordHash: _, ...userWithoutPassword } = updatedUser;
    return userWithoutPassword;
  }

  /**
   * 删除用户
   */
  static async deleteUser(userId: string): Promise<void> {
    // 检查用户是否存在
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        instances: true,
        privateDataDisks: true,
      },
    });

    if (!user) {
      throw new Error('User not found');
    }

    // 检查是否有关联资源
    if (user.instances.length > 0) {
      throw new Error('Cannot delete user with existing instances');
    }

    if (user.privateDataDisks.length > 0) {
      throw new Error('Cannot delete user with existing storage resources');
    }

    // 删除用户
    await prisma.user.delete({
      where: { id: userId },
    });
  }

  /**
   * 更新用户状态
   */
  static async updateUserStatus(
    userId: string,
    status: UserStatus
  ): Promise<Omit<User, 'passwordHash'>> {
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: { status },
    });

    const { passwordHash: _, ...userWithoutPassword } = updatedUser;
    return userWithoutPassword;
  }

  /**
   * 更新最后登录时间
   */
  static async updateLastLogin(userId: string): Promise<void> {
    await prisma.user.update({
      where: { id: userId },
      data: { lastLoginAt: new Date() },
    });
  }

  /**
   * 修改密码
   */
  static async changePassword(
    userId: string,
    oldPassword: string,
    newPassword: string
  ): Promise<void> {
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new Error('User not found');
    }

    // 验证旧密码
    const isValid = await bcrypt.compare(oldPassword, user.passwordHash);

    if (!isValid) {
      throw new Error('Invalid old password');
    }

    // 加密新密码
    const saltRounds = 10;
    const passwordHash = await bcrypt.hash(newPassword, saltRounds);

    // 更新密码
    await prisma.user.update({
      where: { id: userId },
      data: { passwordHash },
    });
  }

  /**
   * 重置密码（管理员操作）
   */
  static async resetPassword(
    userId: string,
    newPassword: string
  ): Promise<void> {
    const saltRounds = 10;
    const passwordHash = await bcrypt.hash(newPassword, saltRounds);

    await prisma.user.update({
      where: { id: userId },
      data: { passwordHash },
    });
  }
}
