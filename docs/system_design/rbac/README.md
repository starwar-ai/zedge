# Zedge RBAC 后端系统

基于 Node.js + TypeScript + Prisma + PostgreSQL 的 RBAC 权限管理系统。

## 技术栈

- **运行时**: Node.js 18+ LTS
- **语言**: TypeScript 5+
- **框架**: Express.js
- **ORM**: Prisma 5+
- **数据库**: PostgreSQL 14+
- **认证**: JWT (jsonwebtoken)
- **密码加密**: bcrypt

## 项目结构

```
backend/
├── prisma/
│   └── schema.prisma          # Prisma 数据库模型定义
├── src/
│   ├── middleware/            # Express 中间件
│   │   ├── auth.middleware.ts       # JWT 认证中间件
│   │   └── permission.middleware.ts # 权限验证中间件
│   ├── services/              # 业务逻辑层
│   │   ├── auth/              # 认证服务
│   │   ├── tenant/            # 租户管理
│   │   │   ├── tenant.service.ts
│   │   │   └── tenant.controller.ts
│   │   ├── user/              # 用户管理
│   │   │   ├── user.service.ts
│   │   │   └── user.controller.ts
│   │   └── permission/        # 权限服务
│   │       └── permission.service.ts
│   ├── routes/                # API 路由
│   │   ├── auth.routes.ts
│   │   ├── tenant.routes.ts
│   │   └── user.routes.ts
│   ├── types/                 # TypeScript 类型定义
│   │   └── express.d.ts
│   └── utils/                 # 工具函数
│       └── prisma.client.ts
└── scripts/                   # 脚本文件
    └── init-permissions.ts    # 初始化权限数据
```

## 快速开始

### 1. 安装依赖

```bash
npm install
```

需要安装的主要依赖：

```bash
npm install express cors helmet
npm install prisma @prisma/client
npm install jsonwebtoken bcrypt
npm install dotenv

# 开发依赖
npm install -D typescript ts-node ts-node-dev
npm install -D @types/node @types/express @types/jsonwebtoken @types/bcrypt
```

### 2. 配置环境变量

创建 `.env` 文件：

```env
# 数据库配置
DATABASE_URL="postgresql://user:password@localhost:5432/zedge"

# JWT 配置
JWT_SECRET="your-super-secret-key-change-in-production"
JWT_EXPIRES_IN="24h"
JWT_REFRESH_SECRET="your-refresh-secret-key"
JWT_REFRESH_EXPIRES_IN="7d"

# 应用配置
NODE_ENV="development"
PORT="3000"
```

### 3. 初始化数据库

```bash
# 生成 Prisma Client
npx prisma generate

# 创建数据库并运行迁移
npx prisma migrate dev --name init_rbac

# 初始化权限数据
npx ts-node scripts/init-permissions.ts
```

### 4. 创建初始管理员

```bash
npx ts-node scripts/create-admin.ts
```

### 5. 启动开发服务器

```bash
npm run dev
```

服务器将在 `http://localhost:3000` 启动。

## API 端点

### 认证 API

```
POST   /api/v1/auth/login          # 用户登录
POST   /api/v1/auth/refresh        # 刷新 Token
POST   /api/v1/auth/logout         # 用户登出
```

### 租户管理 API

```
POST   /api/v1/tenants             # 创建租户 (仅 admin)
GET    /api/v1/tenants             # 获取租户列表
GET    /api/v1/tenants/:id         # 获取租户详情
PATCH  /api/v1/tenants/:id         # 更新租户 (仅 admin)
DELETE /api/v1/tenants/:id         # 删除租户 (仅 admin)
GET    /api/v1/tenants/:id/quota   # 获取租户配额
```

### 用户管理 API

```
GET    /api/v1/users/me                    # 获取当前用户信息
POST   /api/v1/users                       # 创建用户 (admin/tenant_admin)
GET    /api/v1/users                       # 获取用户列表
GET    /api/v1/users/:id                   # 获取用户详情
PATCH  /api/v1/users/:id                   # 更新用户
DELETE /api/v1/users/:id                   # 删除用户
POST   /api/v1/users/:id/change-password   # 修改密码
POST   /api/v1/users/:id/reset-password    # 重置密码 (仅管理员)
```

## 数据库模型

### 核心表

- **tenants** - 租户表
- **users** - 用户表
- **user_groups** - 用户组表
- **user_group_members** - 用户组成员关系表
- **permissions** - 权限表
- **role_permissions** - 角色权限关联表
- **instances** - 实例表 (示例)
- **private_data_disks** - 私有数据盘表 (示例)
- **audit_logs** - 审计日志表

详见 [prisma/schema.prisma](prisma/schema.prisma)

## 角色权限矩阵

| 资源类型 | admin | tenant_admin | operator | user |
|---------|-------|--------------|----------|------|
| 租户管理 | ✅ 全部 | ❌ 只读 | ❌ | ❌ |
| 用户管理 | ✅ 全部 | ✅ 租户内 | ❌ | ❌ |
| 实例管理 | ✅ 全部 | ✅ 租户内 | ✅ 自己的 | ✅ 自己的 |
| 存储管理 | ✅ 全部 | ✅ 租户内 | ✅ 自己的 | ✅ 自己的 |
| 镜像管理 | ✅ 全部 | ✅ 查看+创建 | ✅ 查看 | ✅ 查看 |

## 开发指南

### 添加新的 API 端点

1. 在 `src/services/` 中创建 Service 和 Controller
2. 在 `src/routes/` 中创建路由文件
3. 应用认证和权限中间件
4. 在主应用中注册路由

示例：

```typescript
// src/routes/resource.routes.ts
import express from 'express';
import { authenticateToken } from '../middleware/auth.middleware';
import { requireRole } from '../middleware/permission.middleware';
import { UserRole } from '@prisma/client';

const router = express.Router();

router.post(
  '/',
  authenticateToken,
  requireRole(UserRole.ADMIN),
  resourceController.create
);

export default router;
```

### 运行测试

```bash
npm test
```

### 代码格式化

```bash
npm run format
```

### 类型检查

```bash
npm run type-check
```

## 部署

### 使用 Docker

```dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY . .
RUN npx prisma generate
RUN npm run build

EXPOSE 3000

CMD ["npm", "start"]
```

### 环境变量检查清单

- ✅ `DATABASE_URL` 设置为生产数据库
- ✅ `JWT_SECRET` 使用强随机字符串
- ✅ `NODE_ENV=production`
- ✅ 启用 HTTPS
- ✅ 配置 CORS 白名单

## 安全建议

1. **JWT Secret**: 使用长度至少 32 字符的随机字符串
2. **密码策略**: 最小长度 8 位，包含大小写字母、数字、特殊字符
3. **HTTPS**: 生产环境必须使用 HTTPS
4. **Rate Limiting**: 实现登录接口的速率限制
5. **审计日志**: 记录所有敏感操作
6. **输入验证**: 使用 Joi 或 Zod 验证所有输入
7. **SQL 注入**: Prisma ORM 自动防护
8. **XSS 防护**: 使用 helmet 中间件

## 性能优化

1. **数据库索引**: 已在 Schema 中定义关键索引
2. **连接池**: 使用 Prisma 连接池管理
3. **查询优化**: 使用 `select` 只返回需要的字段
4. **分页**: 所有列表接口支持分页
5. **缓存**: 可使用 Redis 缓存用户权限

## 故障排查

### 数据库连接失败

```bash
# 检查 PostgreSQL 服务
sudo systemctl status postgresql

# 测试连接
psql postgresql://user:password@localhost:5432/zedge
```

### Prisma 迁移失败

```bash
# 重置数据库（开发环境）
npx prisma migrate reset

# 应用迁移
npx prisma migrate deploy
```

### JWT Token 错误

- 检查 `JWT_SECRET` 环境变量
- 确认前后端使用相同的 Secret
- 验证 Token 格式: `Bearer <token>`

## 相关文档

- [RBAC 使用指南](RBAC_GUIDE.md)
- [领域模型](../../domain_model/domain_model.md)

## License

MIT
