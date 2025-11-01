# RBAC 系统快速入门指南

## 🚀 5 分钟快速上手

本指南将帮助你在 5 分钟内启动并运行 Zedge RBAC 权限管理系统。

---

## 前置要求

确保你的系统已安装：

- ✅ Node.js 18+ ([下载](https://nodejs.org/))
- ✅ PostgreSQL 14+ ([下载](https://www.postgresql.org/download/))
- ✅ npm 9+ (随 Node.js 安装)

---

## 步骤 1: 准备数据库

```bash
# 启动 PostgreSQL 服务
sudo systemctl start postgresql

# 创建数据库
createdb zedge

# 或使用 psql
psql -U postgres
CREATE DATABASE zedge;
\q
```

---

## 步骤 2: 后端设置

```bash
# 进入后端目录
cd backend

# 安装依赖
npm install

# 复制环境变量文件
cp .env.example .env

# 编辑 .env 文件，配置数据库连接
# DATABASE_URL="postgresql://postgres:password@localhost:5432/zedge"
# JWT_SECRET="your-secret-key"
```

---

## 步骤 3: 初始化数据库

```bash
# 生成 Prisma Client
npx prisma generate

# 运行数据库迁移
npx prisma migrate dev --name init_rbac

# 初始化权限数据
npm run init-permissions

# 创建管理员用户
npm run create-admin
# 按提示输入或使用默认值：
# - Username: admin
# - Password: Admin@123456
# - Email: admin@zedge.local
```

---

## 步骤 4: 启动后端服务

```bash
# 启动开发服务器
npm run dev

# 服务器将在 http://localhost:3000 启动
```

---

## 步骤 5: 测试 API

### 5.1 登录获取 Token

```bash
curl -X POST http://localhost:3000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "username": "admin",
    "password": "Admin@123456"
  }'
```

**响应示例：**
```json
{
  "code": 200,
  "message": "Login successful",
  "data": {
    "user": {
      "id": "uuid",
      "username": "admin",
      "email": "admin@zedge.local",
      "role": "admin"
    },
    "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refresh_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "token_type": "Bearer"
  }
}
```

### 5.2 创建租户

```bash
export TOKEN="your-access-token"

curl -X POST http://localhost:3000/api/v1/tenants \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "name": "Acme Corporation",
    "description": "Acme 公司租户",
    "vlan_id": 100,
    "quota_config": {
      "max_instances": 50,
      "max_cpu_cores": 200,
      "max_memory_gb": 500,
      "max_storage_gb": 2000
    }
  }'
```

### 5.3 创建租户管理员

```bash
curl -X POST http://localhost:3000/api/v1/users \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "username": "tenant_admin",
    "email": "admin@acme.com",
    "password": "TenantAdmin@123",
    "role": "tenant_admin",
    "tenant_id": "tenant-uuid-from-previous-step"
  }'
```

### 5.4 创建普通用户

```bash
curl -X POST http://localhost:3000/api/v1/users \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "username": "john.doe",
    "email": "john@acme.com",
    "password": "User@123456",
    "role": "user",
    "tenant_id": "tenant-uuid",
    "quota_config": {
      "max_instances": 5,
      "max_cpu_cores": 16,
      "max_memory_gb": 64
    }
  }'
```

---

## 步骤 6: 前端设置（可选）

```bash
# 进入前端目录
cd ../frontend

# 安装依赖
npm install

# 启动开发服务器
npm run dev

# 前端将在 http://localhost:5173 启动
```

---

## 📋 常用命令

### 数据库管理

```bash
# 打开 Prisma Studio（可视化数据库管理）
npx prisma studio

# 重置数据库（开发环境）
npx prisma migrate reset

# 生成新的迁移
npx prisma migrate dev --name your_migration_name
```

### 开发命令

```bash
# 启动开发服务器（带热重载）
npm run dev

# 构建生产版本
npm run build

# 启动生产服务器
npm start

# 代码格式化
npm run format

# 类型检查
npm run type-check
```

---

## 🎯 下一步

恭喜！你已经成功启动了 RBAC 系统。接下来可以：

1. 📖 阅读 [完整的 RBAC 使用指南](docs/RBAC_GUIDE.md)
2. 🔧 查看 [API 文档](docs/API.md)
3. 💻 探索 [前端集成示例](frontend/README.md)
4. 🏗️ 了解 [系统架构](design/system_architecture.md)

---

## ❓ 常见问题

### Q1: 数据库连接失败？

**A**: 检查以下几点：
- PostgreSQL 服务是否运行：`sudo systemctl status postgresql`
- `.env` 文件中的 `DATABASE_URL` 是否正确
- 数据库用户是否有权限

```bash
# 测试数据库连接
psql postgresql://postgres:password@localhost:5432/zedge
```

### Q2: JWT Token 无效？

**A**: 确保：
- `.env` 文件中设置了 `JWT_SECRET`
- Token 格式正确：`Authorization: Bearer <token>`
- Token 未过期（默认 24 小时）

### Q3: 权限检查失败？

**A**: 运行权限初始化脚本：

```bash
npm run init-permissions
```

### Q4: 如何重置管理员密码？

**A**: 使用数据库直接重置或重新创建：

```bash
# 方法 1: 重新创建管理员
npm run create-admin

# 方法 2: 通过 Prisma Studio 修改
npx prisma studio
# 在浏览器中打开 users 表，修改密码哈希
```

### Q5: 如何查看日志？

**A**: 开发模式下，日志会直接输出到控制台。生产环境可以配置 Winston 日志到文件。

---

## 🆘 获取帮助

遇到问题？

- 📖 查看 [完整文档](docs/)
- 🐛 提交 [Issue](https://github.com/your-org/zedge/issues)
- 💬 加入社区讨论

---

## ✅ 快速检查清单

在部署到生产环境前，确保：

- [ ] 修改了默认的 `JWT_SECRET`
- [ ] 修改了管理员默认密码
- [ ] 配置了生产数据库
- [ ] 启用了 HTTPS
- [ ] 配置了 CORS 白名单
- [ ] 设置了合理的 Token 过期时间
- [ ] 实现了日志记录
- [ ] 配置了备份策略
- [ ] 进行了安全审计
- [ ] 准备了监控和告警

---

**版本**: 1.0.0
**最后更新**: 2025-11-01

Happy Coding! 🎉
