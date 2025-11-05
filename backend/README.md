# Zedge Backend

Cloud Desktop Management Platform with comprehensive RBAC (Role-Based Access Control) and multi-tenancy support.

## Table of Contents

- [Overview](#overview)
- [Technology Stack](#technology-stack)
- [Quick Start](#quick-start)
- [Project Structure](#project-structure)
- [Key Features](#key-features)
- [API Documentation](#api-documentation)
- [Database Schema](#database-schema)
- [Authentication & Authorization](#authentication--authorization)
- [Development](#development)
- [Deployment](#deployment)
- [Scripts](#scripts)
- [Environment Variables](#environment-variables)

## Overview

Zedge Backend is a comprehensive cloud desktop management platform built with TypeScript, Express.js, and Prisma ORM. It provides a robust API for managing cloud desktop instances, virtual private clouds, storage, networking, and user access control in a multi-tenant environment.

**Key Statistics:**
- **17,384+ lines** of TypeScript code
- **60+ source files** organized by domain
- **40+ database models** with comprehensive relationships
- **20+ domain services** for business logic
- **80+ API endpoints** across 13 route modules

## Technology Stack

### Core Technologies
- **Runtime:** Node.js 18+ LTS
- **Language:** TypeScript 5.3.3
- **Web Framework:** Express.js 4.18.2
- **Database:** PostgreSQL 14+
- **ORM:** Prisma 6.18.0

### Security & Authentication
- **JWT:** jsonwebtoken 9.0.2
- **Password Hashing:** bcrypt 5.1.1
- **HTTP Security:** helmet 7.1.0
- **CORS:** cors 2.8.5

### Development Tools
- **Build:** TypeScript Compiler
- **Dev Server:** ts-node-dev 2.0.0 (hot reload)
- **Testing:** Jest 29.7.0 with ts-jest
- **Code Quality:** ESLint 8.56.0, Prettier 3.1.1
- **Logging:** winston 3.11.0

## Quick Start

### Prerequisites

- Node.js >= 18.0.0
- npm >= 9.0.0
- PostgreSQL >= 14
- Git

### Installation

1. **Clone the repository:**
   ```bash
   git clone <repository-url>
   cd zedge/backend
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Configure environment:**
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

4. **Set up the database:**
   ```bash
   # Generate Prisma client
   npm run prisma:generate

   # Run database migrations
   npm run prisma:migrate
   ```

5. **Initialize default data:**
   ```bash
   # Initialize RBAC permissions
   npm run init-permissions

   # Create admin user (optional)
   npm run create-admin
   ```

6. **Start development server:**
   ```bash
   npm run dev
   ```

The server will start on `http://localhost:3000` (or the port specified in `.env`).

## Project Structure

```
backend/
├── prisma/
│   └── schema.prisma              # Database schema (1,093 lines)
├── src/
│   ├── index.ts                   # Express app entry point
│   ├── middleware/
│   │   ├── auth.middleware.ts     # JWT authentication
│   │   └── permission.middleware.ts # RBAC enforcement
│   ├── routes/                    # API route handlers (13 modules)
│   │   ├── auth.routes.ts
│   │   ├── tenant.routes.ts
│   │   ├── user.routes.ts
│   │   ├── instance.routes.ts
│   │   ├── instance-set.routes.ts
│   │   ├── vpc.routes.ts
│   │   ├── subnet.routes.ts
│   │   ├── place.routes.ts
│   │   ├── image.routes.ts
│   │   ├── template.routes.ts
│   │   ├── cloud-box.routes.ts
│   │   └── private-data-disk.routes.ts
│   ├── services/                  # Business logic (20 domains)
│   │   ├── auth/
│   │   ├── user/
│   │   ├── tenant/
│   │   ├── permission/
│   │   ├── instance/
│   │   ├── instance-set/
│   │   ├── vpc/
│   │   ├── subnet/
│   │   ├── place/
│   │   ├── image/
│   │   ├── template/
│   │   ├── cloud-box/
│   │   ├── private-data-disk/
│   │   ├── compute-machine/
│   │   ├── virtual-machine/
│   │   ├── resource-pool/
│   │   ├── ip-address/
│   │   ├── ip-address-pool/
│   │   └── hypervisor/            # Multi-hypervisor abstraction
│   ├── types/
│   │   └── express.d.ts           # Express type extensions
│   └── utils/
│       └── prisma.client.ts       # Prisma singleton
├── scripts/
│   ├── init-permissions.ts        # Initialize default permissions
│   └── create-admin.ts            # Create default admin user
├── package.json
├── tsconfig.json
└── .env.example
```

## Key Features

### 1. Cloud Desktop Management
- Complete instance lifecycle management (create, start, stop, delete)
- Resource allocation and tracking (CPU, memory, storage, GPU)
- Instance templates for quick provisioning
- Batch instance creation and management
- Instance sets for organizing related instances
- Support for multiple rental modes (EXCLUSIVE, SHARED)

### 2. Multi-Tenancy Support
- Complete tenant isolation at database level
- Tenant quota management and tracking
- Tenant-scoped resource access control
- Hierarchical user groups per tenant
- Flexible tenant status management

### 3. Storage Management
- Private data disks with versioning
- Disk attachment/detachment to instances
- Mount mode control (read-write/read-only)
- Share modes (EXCLUSIVE/SHARED)
- RBD backend support
- Image management with versioning
- Image tagging system
- Resource requirement validation

### 4. Networking
- VPC (Virtual Private Cloud) for network isolation
- Subnet management with CIDR blocks
- IP address pooling and allocation
- VLAN support
- Multi-zone availability
- Gateway configuration
- Place-based network organization

### 5. Role-Based Access Control (RBAC)
- Four user roles: ADMIN, TENANT_ADMIN, OPERATOR, USER
- Fine-grained permissions (resource + action based)
- Permission middleware for route protection
- Resource ownership validation
- Tenant-scoped access control

### 6. Infrastructure Flexibility
- Multi-hypervisor support (KVM, VMware, Hyper-V)
- Edge data center management
- Resource pool abstraction
- Compute machine tracking
- Virtual machine lifecycle management
- Cloud box (thin client) device management

### 7. Security Features
- JWT-based authentication (access + refresh tokens)
- Bcrypt password hashing
- HTTP security headers (Helmet)
- CORS protection
- Input validation
- Comprehensive audit logging
- User status management (active/inactive/suspended)

## API Documentation

### Base URL
```
/api/v1
```

### Authentication Endpoints

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/auth/login` | User login | No |
| POST | `/auth/refresh` | Refresh access token | No |
| POST | `/auth/logout` | User logout | Yes |

### Tenant Management

| Method | Endpoint | Description | Required Role |
|--------|----------|-------------|---------------|
| POST | `/tenants` | Create tenant | ADMIN |
| GET | `/tenants` | List tenants | Any |
| GET | `/tenants/:tenant_id` | Get tenant details | Any |
| PATCH | `/tenants/:tenant_id` | Update tenant | ADMIN |
| DELETE | `/tenants/:tenant_id` | Delete tenant | ADMIN |
| PATCH | `/tenants/:tenant_id/status` | Update tenant status | ADMIN |
| GET | `/tenants/:tenant_id/quota` | Get quota usage | TENANT_ADMIN |

### User Management

| Method | Endpoint | Description | Required Role |
|--------|----------|-------------|---------------|
| GET | `/users/me` | Get current user info | Any |
| GET | `/users/me/instance-sets` | Get user's instance sets | Any |
| POST | `/users` | Create user | TENANT_ADMIN |
| GET | `/users` | List users | TENANT_ADMIN |
| GET | `/users/:user_id` | Get user details | TENANT_ADMIN |
| PATCH | `/users/:user_id` | Update user | TENANT_ADMIN |
| DELETE | `/users/:user_id` | Delete user | TENANT_ADMIN |
| POST | `/users/:user_id/change-password` | Change password | User/ADMIN |
| POST | `/users/:user_id/reset-password` | Reset password | TENANT_ADMIN |

### Instance Management

| Method | Endpoint | Description | Permission |
|--------|----------|-------------|------------|
| POST | `/instances` | Create instance | CREATE_INSTANCE |
| POST | `/instances/from-template/:template_id` | Create from template | CREATE_INSTANCE |
| GET | `/instances` | List instances | READ_INSTANCE |
| GET | `/instances/:instance_id` | Get instance details | READ_INSTANCE |
| PATCH | `/instances/:instance_id` | Update instance | UPDATE_INSTANCE |
| DELETE | `/instances/:instance_id` | Delete instance | DELETE_INSTANCE |
| POST | `/instances/:instance_id/start` | Start instance | EXECUTE_INSTANCE |
| POST | `/instances/:instance_id/stop` | Stop instance | EXECUTE_INSTANCE |
| GET | `/instances/:instance_id/private-data-disks` | List attached disks | READ_INSTANCE |
| POST | `/instances/:instance_id/private-data-disks/:disk_id/attach` | Attach disk | UPDATE_INSTANCE |
| POST | `/instances/:instance_id/private-data-disks/:disk_id/detach` | Detach disk | UPDATE_INSTANCE |

### Instance Set Management

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/instance-sets` | Create instance set |
| GET | `/instance-sets` | List instance sets |
| GET | `/instance-sets/:id` | Get instance set details |
| PATCH | `/instance-sets/:id` | Update instance set |
| DELETE | `/instance-sets/:id` | Delete instance set |
| POST | `/instance-sets/:id/members` | Add instance to set |
| DELETE | `/instance-sets/:id/members/:instance_id` | Remove instance from set |
| POST | `/instance-sets/:id/batch-create-instances` | Batch create instances |

### VPC & Networking

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/vpcs` | Create VPC |
| GET | `/vpcs` | List VPCs |
| GET | `/vpcs/:vpc_id` | Get VPC details |
| PATCH | `/vpcs/:vpc_id` | Update VPC |
| DELETE | `/vpcs/:vpc_id` | Delete VPC |
| PATCH | `/vpcs/:vpc_id/status` | Update VPC status |
| POST | `/subnets` | Create subnet |
| GET | `/subnets` | List subnets |
| GET | `/subnets/:subnet_id` | Get subnet details |
| PATCH | `/subnets/:subnet_id` | Update subnet |
| DELETE | `/subnets/:subnet_id` | Delete subnet |
| POST | `/places` | Create place |
| GET | `/places` | List places |
| GET | `/places/:place_id` | Get place details |
| PATCH | `/places/:place_id` | Update place |
| DELETE | `/places/:place_id` | Delete place |

### Storage & Images

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/private-data-disks` | Create private data disk |
| GET | `/private-data-disks` | List private data disks |
| GET | `/private-data-disks/:disk_id` | Get disk details |
| PATCH | `/private-data-disks/:disk_id` | Update disk |
| DELETE | `/private-data-disks/:disk_id` | Delete disk |
| POST | `/images` | Create image |
| GET | `/images` | List images |
| GET | `/images/:image_id` | Get image details |
| PATCH | `/images/:image_id` | Update image |
| DELETE | `/images/:image_id` | Delete image |
| POST | `/images/:image_id/versions` | Create image version |
| GET | `/images/:image_id/versions` | List image versions |
| POST | `/images/:image_id/tags` | Create image tag |
| GET | `/images/:image_id/tags` | List image tags |

### Templates

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/templates` | Create template |
| GET | `/templates` | List templates |
| GET | `/templates/:template_id` | Get template details |
| PATCH | `/templates/:template_id` | Update template |
| DELETE | `/templates/:template_id` | Delete template |

### Cloud Boxes

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/cloud-boxes/instances` | Get user instances | Yes |
| POST | `/cloud-boxes` | Create cloud box | Yes |
| GET | `/cloud-boxes/:box_id` | Get cloud box details | Yes |
| POST | `/cloud-boxes/:box_id/bind-instance` | Bind instance | Yes |
| DELETE | `/cloud-boxes/:box_id/unbind-instance` | Unbind instance | Yes |
| GET | `/cloud-boxes/:box_id/startup-check` | Startup check | No |

## Database Schema

### Core Models (40+ total)

#### Authentication & Multi-Tenancy
- **Tenant** - Organization unit with quota management
- **User** - System users with role-based access
- **UserGroup** - Hierarchical user organization
- **UserGroupMember** - Group membership mapping
- **Permission** - Fine-grained permission definitions
- **RolePermission** - Role-to-permission mapping

#### Compute & Instances
- **Instance** - Cloud desktop instances
- **Template** - Instance templates for provisioning
- **TemplateVersion** - Template version control
- **ComputeMachine** - Physical/virtual compute hosts
- **VirtualMachine** - VM instances on hypervisors
- **ResourcePool** - Resource allocation tracking
- **InstanceSet** - Instance collections
- **InstanceSetMember** - Instance set membership

#### Storage
- **PrivateDataDisk** - Persistent storage volumes
- **InstancePrivateDataDiskAttachment** - Disk-instance mapping
- **Image** - System/application images
- **ImageVersion** - Image versioning
- **ImageTag** - Image tagging system

#### Networking
- **Vpc** - Virtual Private Cloud
- **Subnet** - Network subnets
- **Place** - Network locations/regions
- **IpAddress** - IP address tracking
- **IpAddressPool** - IP pool management

#### Infrastructure
- **EdgeDataCenter** - Data center sites
- **CloudBox** - Cloud desktop devices

#### Auditing
- **AuditLog** - Operation audit trail

For detailed schema documentation, see [prisma/schema.prisma](prisma/schema.prisma).

## Authentication & Authorization

### Authentication Flow

1. **Login:**
   ```http
   POST /api/v1/auth/login
   Content-Type: application/json

   {
     "username": "user@example.com",
     "password": "password123"
   }
   ```

   Response:
   ```json
   {
     "code": 200,
     "message": "Login successful",
     "data": {
       "accessToken": "eyJhbGciOiJIUzI1NiIs...",
       "refreshToken": "eyJhbGciOiJIUzI1NiIs...",
       "user": {
         "id": "user_id",
         "username": "user@example.com",
         "role": "USER"
       }
     }
   }
   ```

2. **Authenticated Requests:**
   ```http
   GET /api/v1/instances
   Authorization: Bearer <accessToken>
   ```

3. **Refresh Token:**
   ```http
   POST /api/v1/auth/refresh
   Content-Type: application/json

   {
     "refreshToken": "eyJhbGciOiJIUzI1NiIs..."
   }
   ```

### User Roles

| Role | Description | Scope |
|------|-------------|-------|
| **ADMIN** | System administrator | Full system access |
| **TENANT_ADMIN** | Tenant administrator | Tenant-scoped management |
| **OPERATOR** | Operations personnel | Limited operational access |
| **USER** | Regular user | Own resources only |

### Permission Model

Permissions are defined by:
- **Resource Type:** TENANT, USER, INSTANCE, STORAGE, NETWORK, IMAGE, etc.
- **Action:** CREATE, READ, UPDATE, DELETE, MANAGE, EXECUTE

Example permissions:
- `instance:create` - Create instances
- `instance:read` - View instances
- `instance:execute` - Start/stop instances
- `storage:manage` - Full storage management
- `tenant:manage` - Tenant administration

### Middleware Usage

```typescript
// Require authentication
router.get('/instances', authenticateToken, listInstances);

// Require specific role
router.post('/tenants', authenticateToken, requireAdmin, createTenant);

// Require permission
router.post('/instances', authenticateToken, requirePermission('instance', 'create'), createInstance);

// Require tenant access
router.get('/users', authenticateToken, requireTenantAccess, listUsers);
```

## Development

### Available Scripts

```bash
# Development
npm run dev              # Start with hot reload
npm run build           # Compile TypeScript
npm start               # Run production build

# Database
npm run prisma:generate # Generate Prisma client
npm run prisma:migrate  # Run migrations (dev)
npm run prisma:deploy   # Deploy migrations (prod)
npm run prisma:studio   # Open Prisma Studio UI

# Setup
npm run init-permissions # Initialize RBAC permissions
npm run create-admin     # Create admin user

# Testing & Quality
npm test                # Run Jest tests
npm run lint            # ESLint checks
npm run format          # Prettier formatting
npm run type-check      # TypeScript validation
```

### Development Workflow

1. **Create a feature branch:**
   ```bash
   git checkout -b feature/my-feature
   ```

2. **Make changes and test:**
   ```bash
   npm run dev
   # Test your changes
   ```

3. **Run quality checks:**
   ```bash
   npm run lint
   npm run type-check
   npm run format
   npm test
   ```

4. **Database changes:**
   ```bash
   # Edit prisma/schema.prisma
   npm run prisma:migrate
   npm run prisma:generate
   ```

5. **Commit and push:**
   ```bash
   git add .
   git commit -m "feat: add new feature"
   git push origin feature/my-feature
   ```

### Code Style

- **TypeScript:** Strict mode enabled
- **Formatting:** Prettier with 2-space indentation
- **Linting:** ESLint with TypeScript rules
- **Naming:**
  - Files: `kebab-case.ts`
  - Classes: `PascalCase`
  - Functions/variables: `camelCase`
  - Constants: `UPPER_SNAKE_CASE`

### Architecture Patterns

1. **MVC-Like Pattern:**
   - Routes (HTTP) → Controllers (request handling) → Services (business logic)

2. **Middleware Chain:**
   - Helmet → CORS → JSON Parser → Auth → Permissions → Route Handler

3. **Multi-Tenancy:**
   - Database-level isolation via `tenantId`
   - Automatic tenant filtering in queries

4. **RBAC:**
   - Permission middleware validates access
   - Resource ownership validation
   - Tenant-scoped operations

5. **Adapter Pattern:**
   - Hypervisor abstraction (KVM, VMware, Hyper-V)
   - Factory pattern for adapter creation

## Deployment

### Production Checklist

- [ ] Set strong `JWT_SECRET` and `JWT_REFRESH_SECRET`
- [ ] Configure production `DATABASE_URL`
- [ ] Set `NODE_ENV=production`
- [ ] Configure `CORS_ORIGINS` for your frontend
- [ ] Set appropriate `LOG_LEVEL` (info/warn/error)
- [ ] Increase `BCRYPT_ROUNDS` for better security (12-14)
- [ ] Configure rate limiting appropriately
- [ ] Set up database backups
- [ ] Configure monitoring and logging
- [ ] Use environment variables for all secrets
- [ ] Enable HTTPS/TLS
- [ ] Review security headers in Helmet configuration

### Production Build

```bash
# Install dependencies
npm ci --production

# Generate Prisma client
npm run prisma:generate

# Build TypeScript
npm run build

# Run migrations
npm run prisma:deploy

# Initialize permissions (first deploy only)
npm run init-permissions

# Start production server
npm start
```

### Docker Deployment

Example `Dockerfile`:
```dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --production

COPY prisma ./prisma
RUN npx prisma generate

COPY . .
RUN npm run build

EXPOSE 3000

CMD ["npm", "start"]
```

### Environment Variables for Production

See [Environment Variables](#environment-variables) section below.

## Scripts

### Initialize Permissions

Creates all default RBAC permissions in the database:

```bash
npm run init-permissions
```

This script creates permissions for all resource types and actions based on the role hierarchy.

### Create Admin User

Creates a default administrator account:

```bash
npm run create-admin
```

You'll be prompted for:
- Username
- Email
- Password

The user will be created with the `ADMIN` role.

## Environment Variables

### Required Variables

```bash
# Database
DATABASE_URL="postgresql://user:password@host:5432/database"

# JWT Authentication
JWT_SECRET="your-super-secret-jwt-key-change-in-production"
JWT_REFRESH_SECRET="your-super-secret-refresh-key-change-in-production"
```

### Optional Variables

```bash
# JWT Configuration
JWT_EXPIRES_IN="24h"                    # Access token expiration
JWT_REFRESH_EXPIRES_IN="7d"             # Refresh token expiration

# Application
NODE_ENV="development"                  # development | production | test
PORT="3000"                             # Server port

# CORS
CORS_ORIGINS="http://localhost:5173,http://localhost:3000"

# Logging
LOG_LEVEL="debug"                       # debug | info | warn | error

# Security
BCRYPT_ROUNDS="10"                      # Password hashing rounds (10-14)

# Rate Limiting
RATE_LIMIT_WINDOW_MS="900000"           # 15 minutes
RATE_LIMIT_MAX_REQUESTS="100"           # Max requests per window
```

### Optional Services

```bash
# Redis (for caching and sessions)
REDIS_URL="redis://localhost:6379"

# Email (for notifications)
SMTP_HOST="smtp.example.com"
SMTP_PORT="587"
SMTP_USER="noreply@zedge.local"
SMTP_PASSWORD="your-smtp-password"
SMTP_FROM="Zedge Platform <noreply@zedge.local>"
```

## Documentation

Additional documentation is available in the `docs/` directory:

- **[RBAC Guide](../docs/system_design/rbac/README.md)** - Comprehensive RBAC documentation
- **[Instance Management](../docs/system_design/instance_management/)** - Instance lifecycle documentation
- **[Database Models](DOCUMENTATION_INDEX.md)** - Detailed model documentation
- **[Quick Reference](DOCUMENTATION_INDEX.md)** - Developer quick reference

## Testing

### Run Tests

```bash
# Run all tests
npm test

# Run with coverage
npm test -- --coverage

# Run specific test file
npm test -- instance.service.test.ts

# Run in watch mode
npm test -- --watch
```

### Test Structure

```
backend/
├── __tests__/
│   ├── unit/
│   │   ├── services/
│   │   └── middleware/
│   ├── integration/
│   │   └── api/
│   └── e2e/
```

## Troubleshooting

### Common Issues

**Database connection fails:**
- Check `DATABASE_URL` is correct
- Ensure PostgreSQL is running
- Verify network connectivity

**JWT token invalid:**
- Check `JWT_SECRET` matches between requests
- Verify token hasn't expired
- Ensure proper Bearer token format

**Permission denied errors:**
- Verify user has correct role
- Check RBAC permissions are initialized
- Confirm tenant access is correct

**Prisma client errors:**
- Run `npm run prisma:generate`
- Ensure migrations are up to date
- Check database schema matches Prisma schema

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run tests and linting
5. Submit a pull request

## License

MIT

## Support

For questions and support:
- Check the [documentation](../docs/)
- Open an issue on GitHub
- Contact the Zedge team

---

**Version:** 1.0.0
**Last Updated:** 2025-01-05