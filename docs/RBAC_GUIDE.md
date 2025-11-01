# RBAC 权限管理系统使用指南

## 目录

1. [系统概述](#系统概述)
2. [角色和权限](#角色和权限)
3. [后端集成](#后端集成)
4. [前端集成](#前端集成)
5. [API 使用示例](#api-使用示例)
6. [常见场景](#常见场景)
7. [最佳实践](#最佳实践)

---

## 系统概述

本 RBAC (Role-Based Access Control) 权限管理系统为 Zedge 云电脑业务管理平台提供了完整的权限控制解决方案。

### 核心特性

- 🔐 **基于角色的访问控制** - 4 种预定义角色
- 🏢 **多租户隔离** - 完整的租户数据隔离
- 🔑 **JWT Token 认证** - 安全的无状态认证
- 🛡️ **细粒度权限控制** - 资源级别的权限检查
- 📊 **配额管理** - 租户和用户级别的资源配额
- 🎯 **前后端统一** - 前后端权限检查逻辑一致

---

## 角色和权限

### 角色定义

#### 1. admin (系统管理员/超级管理员)

**权限范围**：
- ✅ 可以创建、删除、管理所有租户
- ✅ 可以管理所有用户和用户组
- ✅ 可以管理所有资源（实例、存储、网络等）
- ✅ 可以查看和修改所有配额
- ✅ 可以管理边缘机房、服务器等基础设施
- ✅ 跨租户操作权限

**典型用例**：
- 创建新租户
- 分配租户配额
- 管理系统基础设施
- 查看全局统计数据

#### 2. tenant_admin (租户管理员)

**权限范围**：
- ✅ 只能管理自己租户内的用户和用户组
- ✅ 只能管理自己租户内的实例和资源
- ✅ 可以查看自己租户的配额使用情况
- ❌ 不能跨租户操作
- ❌ 不能创建或删除租户
- ❌ 不能管理基础设施

**典型用例**：
- 为租户内创建用户
- 管理租户内的用户组
- 查看租户资源使用情况
- 管理租户内的实例

#### 3. operator (运维人员)

**权限范围**：
- ✅ 可以管理实例、存储等资源
- ✅ 通常用于系统运维和监控
- ❌ 不能管理用户和租户
- ❌ 权限受租户隔离限制

**典型用例**：
- 创建和管理实例
- 管理存储资源
- 执行运维操作

#### 4. user (普通用户)

**权限范围**：
- ✅ 仅操作自有资源
- ✅ 可以创建和管理自己的实例
- ✅ 可以管理自己的私有数据盘
- ❌ 不能访问其他用户的资源
- ❌ 不能管理用户和租户

**典型用例**：
- 创建个人云电脑实例
- 管理个人数据盘
- 查看个人资源使用情况

---

## 后端集成

### 1. 数据库初始化

```bash
# 安装依赖
cd backend
npm install

# 设置环境变量
cp .env.example .env

# 配置数据库连接
# DATABASE_URL="postgresql://user:password@localhost:5432/zedge"
# JWT_SECRET="your-secret-key"
# JWT_EXPIRES_IN="24h"

# 生成 Prisma Client
npx prisma generate

# 运行数据库迁移
npx prisma migrate dev --name init_rbac

# 初始化权限数据
npx ts-node scripts/init-permissions.ts
```

### 2. 权限初始化脚本

创建 `backend/scripts/init-permissions.ts`:

```typescript
import { PermissionService } from '../src/services/permission/permission.service';
import { prisma } from '../src/utils/prisma.client';

async function main() {
  console.log('Initializing RBAC permissions...');

  await PermissionService.initializePermissions();

  console.log('Permissions initialized successfully!');
}

main()
  .catch((error) => {
    console.error('Error initializing permissions:', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
```

### 3. 在路由中使用权限中间件

```typescript
import express from 'express';
import { authenticateToken } from './middleware/auth.middleware';
import { requireRole, requireResourceOwnership } from './middleware/permission.middleware';
import { UserRole } from '@prisma/client';

const router = express.Router();

// 示例：只有 admin 可以创建租户
router.post(
  '/tenants',
  authenticateToken,
  requireRole(UserRole.ADMIN),
  tenantController.createTenant
);

// 示例：验证资源所有权
router.delete(
  '/instances/:id',
  authenticateToken,
  requireResourceOwnership('instance'),
  instanceController.deleteInstance
);

// 示例：验证租户访问权限
router.get(
  '/tenants/:tenant_id/users',
  authenticateToken,
  requireTenantAccess,
  userController.getUserList
);
```

### 4. 创建初始管理员用户

```typescript
// backend/scripts/create-admin.ts
import { UserService } from '../src/services/user/user.service';
import { UserRole } from '@prisma/client';

async function createAdmin() {
  const admin = await UserService.createUser({
    username: 'admin',
    email: 'admin@example.com',
    password: 'Admin@123456',
    role: UserRole.ADMIN,
  });

  console.log('Admin user created:', admin);
}

createAdmin();
```

---

## 前端集成

### 1. 使用 useAuth Hook

```tsx
import { useAuth } from '@/hooks/useAuth';
import { ResourceType, PermissionAction } from '@/types/auth';

function MyComponent() {
  const {
    user,
    isAuthenticated,
    hasRole,
    hasPermission,
    isAdmin,
    isTenantAdmin,
    canAccessTenant,
  } = useAuth();

  // 检查是否已登录
  if (!isAuthenticated()) {
    return <LoginPage />;
  }

  // 检查是否是管理员
  if (isAdmin()) {
    return <AdminDashboard />;
  }

  // 检查是否有特定权限
  if (hasPermission(ResourceType.INSTANCE, PermissionAction.CREATE)) {
    return <CreateInstanceButton />;
  }

  return <UserDashboard />;
}
```

### 2. 使用权限守卫组件

```tsx
import {
  RoleGuard,
  PermissionGuard,
  AdminGuard,
  TenantAdminGuard,
} from '@/components/PermissionGuard';
import { UserRole, ResourceType, PermissionAction } from '@/types/auth';

function Dashboard() {
  return (
    <div>
      {/* 仅管理员可见 */}
      <AdminGuard>
        <CreateTenantButton />
      </AdminGuard>

      {/* 管理员或租户管理员可见 */}
      <TenantAdminGuard>
        <UserManagementSection />
      </TenantAdminGuard>

      {/* 基于角色的守卫 */}
      <RoleGuard roles={[UserRole.ADMIN, UserRole.TENANT_ADMIN]}>
        <ConfigPanel />
      </RoleGuard>

      {/* 基于权限的守卫 */}
      <PermissionGuard
        resource={ResourceType.INSTANCE}
        action={PermissionAction.CREATE}
      >
        <Button>创建实例</Button>
      </PermissionGuard>

      {/* 没有权限时显示 fallback */}
      <PermissionGuard
        resource={ResourceType.USER}
        action={PermissionAction.DELETE}
        fallback={<Tooltip>您没有删除用户的权限</Tooltip>}
      >
        <DeleteUserButton />
      </PermissionGuard>
    </div>
  );
}
```

### 3. 路由守卫

```tsx
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { UserRole } from '@/types/auth';

function ProtectedRoute({ children, roles }: { children: React.ReactNode; roles?: UserRole[] }) {
  const { isAuthenticated, hasRole } = useAuth();

  if (!isAuthenticated()) {
    return <Navigate to="/login" replace />;
  }

  if (roles && !hasRole(...roles)) {
    return <Navigate to="/403" replace />;
  }

  return <>{children}</>;
}

// 使用示例
<Route
  path="/admin"
  element={
    <ProtectedRoute roles={[UserRole.ADMIN]}>
      <AdminPage />
    </ProtectedRoute>
  }
/>
```

---

## API 使用示例

### 1. 用户登录

```typescript
// POST /api/v1/auth/login
const response = await fetch('/api/v1/auth/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    username: 'admin',
    password: 'Admin@123456',
  }),
});

const data = await response.json();

// 保存 Token
localStorage.setItem('access_token', data.data.access_token);
localStorage.setItem('refresh_token', data.data.refresh_token);
localStorage.setItem('current_user', JSON.stringify(data.data.user));
```

### 2. 创建租户 (仅 admin)

```typescript
// POST /api/v1/tenants
const response = await fetch('/api/v1/tenants', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${accessToken}`,
  },
  body: JSON.stringify({
    name: 'Acme Corporation',
    description: 'Acme 公司租户',
    vlan_id: 100,
    quota_config: {
      max_instances: 50,
      max_cpu_cores: 200,
      max_memory_gb: 500,
      max_storage_gb: 2000,
    },
  }),
});
```

### 3. 创建租户用户 (admin 或 tenant_admin)

```typescript
// POST /api/v1/users
const response = await fetch('/api/v1/users', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${accessToken}`,
  },
  body: JSON.stringify({
    username: 'john.doe',
    email: 'john@acme.com',
    password: 'SecurePass123',
    role: 'user',
    tenant_id: 'tenant-uuid',
    quota_config: {
      max_instances: 5,
      max_cpu_cores: 16,
      max_memory_gb: 64,
    },
  }),
});
```

### 4. 获取租户用户列表

```typescript
// GET /api/v1/users?tenant_id=xxx&page=1&limit=20
const response = await fetch(
  `/api/v1/users?tenant_id=${tenantId}&page=1&limit=20`,
  {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  }
);

const data = await response.json();
console.log(data.data.users); // 用户列表
console.log(data.data.total); // 总数
```

### 5. 创建实例 (所有角色都可以)

```typescript
// POST /api/v1/instances
const response = await fetch('/api/v1/instances', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${accessToken}`,
  },
  body: JSON.stringify({
    name: 'my-instance',
    image_id: 'image-uuid',
    flavor: {
      cpu: 4,
      memory_gb: 8,
    },
    storage_gb: 100,
  }),
});
```

---

## 常见场景

### 场景 1: 多租户系统初始化

```bash
# 1. 创建系统管理员
npm run create-admin

# 2. 管理员登录
# POST /api/v1/auth/login

# 3. 创建租户
# POST /api/v1/tenants

# 4. 创建租户管理员
# POST /api/v1/users (role: tenant_admin)

# 5. 租户管理员登录
# POST /api/v1/auth/login

# 6. 租户管理员创建普通用户
# POST /api/v1/users (role: user)
```

### 场景 2: 租户管理员管理用户

```typescript
// 租户管理员只能看到自己租户的用户
const { user } = useAuth();

// 获取本租户用户列表
const users = await fetchUsers({ tenant_id: user.tenant_id });

// 创建新用户（自动属于当前租户）
await createUser({
  username: 'new_user',
  email: 'user@tenant.com',
  password: 'password',
  tenant_id: user.tenant_id, // 必须是当前租户
  role: 'user',
});
```

### 场景 3: 普通用户创建实例

```typescript
// 普通用户创建实例
const instance = await createInstance({
  name: 'my-workspace',
  image_id: selectedImageId,
  flavor: selectedFlavor,
});

// 用户只能看到自己的实例
const myInstances = await fetchInstances({
  user_id: currentUser.id,
});

// 用户不能删除其他用户的实例 (后端会验证所有权)
await deleteInstance(instanceId); // 如果不是所有者，返回 403
```

### 场景 4: 权限检查 UI 控制

```tsx
function InstanceActions({ instance }: { instance: Instance }) {
  const { user, hasPermission, isAdmin, isTenantAdmin } = useAuth();

  // 是否可以删除（所有者、租户管理员、系统管理员）
  const canDelete =
    instance.user_id === user?.id || isTenantAdmin() || isAdmin();

  // 是否可以执行操作
  const canExecute = hasPermission(ResourceType.INSTANCE, PermissionAction.EXECUTE);

  return (
    <div>
      {canExecute && (
        <>
          <Button onClick={startInstance}>启动</Button>
          <Button onClick={stopInstance}>停止</Button>
          <Button onClick={restartInstance}>重启</Button>
        </>
      )}

      {canDelete && (
        <Button danger onClick={deleteInstance}>
          删除
        </Button>
      )}
    </div>
  );
}
```

---

## 最佳实践

### 1. 安全性

✅ **DO**:
- 始终在后端验证权限，前端权限检查只用于 UI 控制
- 使用 HTTPS 传输 Token
- 设置合理的 Token 过期时间
- 定期轮换 JWT Secret
- 记录所有敏感操作的审计日志

❌ **DON'T**:
- 不要仅依赖前端权限检查
- 不要在 JWT Payload 中存储敏感信息
- 不要在 URL 中传递 Token
- 不要使用弱密码策略

### 2. 租户隔离

✅ **DO**:
- 所有数据库查询都包含 tenant_id 过滤
- 使用 Row-Level Security (RLS) 加强隔离
- 租户管理员创建的资源自动关联到其租户
- 实现租户级别的配额限制

```typescript
// 好的做法：自动过滤租户
async function getInstances(userId: string) {
  const user = await prisma.user.findUnique({ where: { id: userId } });

  // 非 admin 自动添加租户过滤
  const where = user.role === UserRole.ADMIN
    ? {}
    : { tenantId: user.tenantId };

  return prisma.instance.findMany({ where });
}
```

### 3. 错误处理

```typescript
// 统一的权限错误响应
if (!hasPermission) {
  return res.status(403).json({
    code: 403,
    message: 'Insufficient permissions',
    data: {
      required_role: 'admin',
      current_role: user.role,
    },
  });
}

// 前端处理
try {
  await api.deleteUser(userId);
} catch (error) {
  if (error.code === 403) {
    message.error('您没有权限执行此操作');
  } else {
    message.error('操作失败，请稍后重试');
  }
}
```

### 4. 性能优化

```typescript
// 使用索引优化权限查询
@@index([userId])
@@index([tenantId])
@@index([role])

// 缓存用户权限
const userPermissions = await redis.get(`permissions:${userId}`);
if (!userPermissions) {
  const permissions = await PermissionService.getUserPermissions(userId);
  await redis.setex(`permissions:${userId}`, 3600, JSON.stringify(permissions));
}
```

### 5. 审计日志

```typescript
// 记录所有敏感操作
async function auditLog(userId: string, action: string, resourceType: string, resourceId: string) {
  await prisma.auditLog.create({
    data: {
      userId,
      action,
      resourceType,
      resourceId,
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'],
      status: 'success',
    },
  });
}

// 在敏感操作中使用
await deleteTenant(tenantId);
await auditLog(userId, 'delete', 'tenant', tenantId);
```

---

## 配置参考

### 环境变量

```bash
# 数据库
DATABASE_URL="postgresql://user:password@localhost:5432/zedge"

# JWT 配置
JWT_SECRET="your-super-secret-key-change-this-in-production"
JWT_EXPIRES_IN="24h"
JWT_REFRESH_SECRET="your-refresh-secret-key"
JWT_REFRESH_EXPIRES_IN="7d"

# 应用配置
NODE_ENV="development"
PORT="3000"
```

### package.json 脚本

```json
{
  "scripts": {
    "dev": "ts-node-dev --respawn src/index.ts",
    "build": "tsc",
    "start": "node dist/index.js",
    "migrate": "prisma migrate dev",
    "generate": "prisma generate",
    "init-permissions": "ts-node scripts/init-permissions.ts",
    "create-admin": "ts-node scripts/create-admin.ts"
  }
}
```

---

## 故障排查

### 问题 1: Token 无效

**症状**: 403 "Invalid token"

**解决方案**:
1. 检查 JWT_SECRET 是否配置
2. 确认 Token 格式为 "Bearer <token>"
3. 检查 Token 是否过期
4. 验证前后端使用相同的 Secret

### 问题 2: 权限检查失败

**症状**: 用户有角色但无法访问资源

**解决方案**:
1. 确认权限已初始化: `npm run init-permissions`
2. 检查数据库中的 role_permissions 表
3. 验证用户的 role 字段值
4. 查看后端日志中的权限检查详情

### 问题 3: 租户隔离失效

**症状**: 用户可以看到其他租户的数据

**解决方案**:
1. 检查所有查询是否包含 tenantId 过滤
2. 验证中间件是否正确应用
3. 确认用户的 tenant_id 字段正确
4. 使用数据库 RLS 加强隔离

---

## 相关资源

- [Prisma 文档](https://www.prisma.io/docs)
- [JWT 最佳实践](https://tools.ietf.org/html/rfc8725)
- [OWASP 认证备忘单](https://cheatsheetseries.owasp.org/cheatsheets/Authentication_Cheat_Sheet.html)
- [React Router 文档](https://reactrouter.com)

---

**版本**: 1.0.0
**最后更新**: 2025-11-01
