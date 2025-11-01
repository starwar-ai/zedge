# Zedge Backend - Quick Reference Guide

## Quick Stack Overview

```
┌─────────────────────────────────────────────────────────────┐
│ Zedge Cloud Desktop Management System - Backend Architecture │
└─────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────┐
│                    HTTP Client / Frontend                     │
└───────────────────────────┬──────────────────────────────────┘
                            │
                    /api/v1 Routes
                            │
┌───────────────────────────▼──────────────────────────────────┐
│              Express.js (HTTP Server)                         │
│  ┌────────────────────────────────────────────────────────┐  │
│  │ Middleware Stack                                        │  │
│  │  - helmet (HTTP security)                             │  │
│  │  - cors (CORS handling)                               │  │
│  │  - express.json() (JSON parsing)                      │  │
│  │  - auth.middleware.ts (JWT verification)             │  │
│  │  - permission.middleware.ts (RBAC enforcement)       │  │
│  └────────────────────────────────────────────────────────┘  │
└───────────────────────────┬──────────────────────────────────┘
                            │
        ┌───────────────────┼───────────────────┐
        │                   │                   │
    Route Handlers      Route Handlers     Route Handlers
        │                   │                   │
┌───────▼──────┐  ┌────────▼─────────┐  ┌─────▼────────────┐
│ Auth Routes  │  │ Instance Routes  │  │ Network Routes   │
│  /auth       │  │  /instances      │  │  /vpcs, /subnets │
└───────┬──────┘  └────────┬─────────┘  └─────┬────────────┘
        │                  │                    │
        └──────────────────┼────────────────────┘
                           │
        ┌──────────────────▼─────────────────┐
        │    Service Layer (Business Logic)   │
        │  ┌──────────────────────────────┐  │
        │  │ - User Service               │  │
        │  │ - Instance Service           │  │
        │  │ - Permission Service         │  │
        │  │ - VPC Service                │  │
        │  │ - Image Service              │  │
        │  │ - Cloud Box Service          │  │
        │  │ - ... (18 service modules)   │  │
        │  └──────────────────────────────┘  │
        └──────────────────┬──────────────────┘
                           │
        ┌──────────────────▼──────────────────┐
        │  Prisma ORM (Data Access Layer)    │
        │  ┌──────────────────────────────┐  │
        │  │ - Database Schema            │  │
        │  │ - 27 Models/Entities         │  │
        │  │ - Query Builder              │  │
        │  └──────────────────────────────┘  │
        └──────────────────┬──────────────────┘
                           │
        ┌──────────────────▼──────────────────┐
        │      PostgreSQL Database (14+)      │
        │  ┌──────────────────────────────┐  │
        │  │ Tables for 27 Models         │  │
        │  │ - Multi-tenant data          │  │
        │  │ - RBAC permission mapping    │  │
        │  │ - Instance/VM lifecycle      │  │
        │  │ - Network/Storage config     │  │
        │  └──────────────────────────────┘  │
        └──────────────────────────────────────┘
```

---

## Domain Organization (18 Service Modules)

```
Authentication & Authorization
├── /auth              - JWT token generation/validation
├── /user              - User CRUD and password management
├── /permission        - RBAC permission system
└── /tenant            - Multi-tenant management

Compute Infrastructure
├── /instance          - Cloud desktop instance lifecycle
├── /instance-set      - Grouped instance management
├── /compute-machine   - Physical/virtual compute hosts
├── /virtual-machine   - VM instance details
├── /resource-pool     - Resource allocation pools
└── /hypervisor        - Multi-hypervisor abstraction (KVM, VMware, Hyper-V)

Storage Management
├── /image             - System/application images with versioning
└── /private-data-disk - Persistent data disk management

Networking
├── /vpc               - Virtual private cloud networks
├── /subnet            - Network subnets with CIDR blocks
├── /place             - Network location management
└── /ip-address        - IP address allocation and tracking

Cloud Hardware
├── /cloud-box         - Cloud desktop devices (thin clients)
└── /edge-datacenter   - Edge data center management

Configuration
└── /template          - Instance provisioning templates
```

---

## 27 Database Models at a Glance

### Core Models (Authentication & Authorization)
1. **Tenant** - Organization/customer
2. **User** - System user
3. **UserGroup** - User organization (hierarchical)
4. **UserGroupMember** - Group membership link
5. **Permission** - Fine-grained action permissions
6. **RolePermission** - Role-to-permission mapping

### Compute Models
7. **Instance** - Cloud desktop instance
8. **Template** - Instance template
9. **TemplateVersion** - Template version history
10. **ComputeMachine** - Compute host (physical/virtual)
11. **VirtualMachine** - VM running on compute machine
12. **ResourcePool** - Resource allocation unit
13. **InstanceSet** - Collection of instances
14. **InstanceSetMember** - Instance-set membership link

### Storage Models
15. **PrivateDataDisk** - Persistent storage volume
16. **InstancePrivateDataDiskAttachment** - Disk-instance link
17. **Image** - System/application image
18. **ImageVersion** - Image version history
19. **ImageTag** - Image tag/alias

### Network Models
20. **Vpc** - Virtual private cloud
21. **Subnet** - Network subnet
22. **Place** - Network location
23. **IpAddress** - IP address record

### Infrastructure Models
24. **EdgeDataCenter** - Edge data center site
25. **CloudBox** - Cloud desktop device
26. **AuditLog** - Operation audit trail

**Total: 27 Models covering full cloud desktop lifecycle management**

---

## API Endpoint Summary (70+ endpoints)

```
Authentication (3)
├── POST /auth/login
├── POST /auth/refresh
└── POST /auth/logout

Tenants (7)
├── POST /tenants
├── GET /tenants
├── GET /tenants/:id
├── PATCH /tenants/:id
├── DELETE /tenants/:id
├── PATCH /tenants/:id/status
└── GET /tenants/:id/quota

Users (8)
├── GET /users/me
├── GET /users/me/instance-sets
├── POST /users
├── GET /users
├── GET /users/:id
├── PATCH /users/:id
├── DELETE /users/:id
├── POST /users/:id/change-password
└── POST /users/:id/reset-password

Instances (13)
├── POST /instances
├── POST /instances/from-template/:id
├── GET /instances
├── GET /instances/:id
├── PATCH /instances/:id
├── DELETE /instances/:id
├── POST /instances/:id/start
├── POST /instances/:id/stop
├── GET /instances/:id/private-data-disks
├── POST /instances/:id/private-data-disks/:disk_id/attach
└── POST /instances/:id/private-data-disks/:disk_id/detach

Instance Sets (7)
├── POST /instance-sets
├── GET /instance-sets
├── GET /instance-sets/:id
├── PATCH /instance-sets/:id
├── DELETE /instance-sets/:id
├── POST /instance-sets/:id/members
├── POST /instance-sets/:id/batch-create-instances
└── DELETE /instance-sets/:id/members/:instance_id

Networks (13)
├── [VPC] POST/GET/PATCH/DELETE /vpcs + /vpcs/:id/status
├── [Subnet] POST/GET/PATCH/DELETE /subnets
└── [Place] POST/GET/PATCH/DELETE /places

Images (15)
├── POST/GET/PATCH/DELETE /images
├── POST/GET/PATCH/DELETE /images/:id/versions/:version_id
├── POST/GET/PATCH/DELETE /images/:id/tags/:tag_id
└── GET /images/:id/tags/:tag_name

Templates (5)
├── POST/GET/PATCH/DELETE /templates
└── GET /templates/:id

Cloud Boxes (7)
├── GET /cloud-boxes/instances
├── POST /cloud-boxes
├── GET /cloud-boxes/:id
├── POST /cloud-boxes/:id/bind-instance
├── DELETE /cloud-boxes/:id/unbind-instance
├── GET /cloud-boxes/:id/startup-check
└── GET /cloud-boxes/:id/bound-instance

Private Disks (5)
├── POST/GET/PATCH/DELETE /private-data-disks
└── GET /private-data-disks/:id
```

---

## Key Concepts & Patterns

### 1. Multi-Tenancy
- Complete isolation between tenants
- User belongs to a single tenant
- Resources scoped to tenant
- Quota management per tenant

### 2. RBAC (Role-Based Access Control)
```
Roles: ADMIN, TENANT_ADMIN, OPERATOR, USER
       ↓
Resource Types: TENANT, USER, INSTANCE, STORAGE, NETWORK, IMAGE, etc.
       ↓
Actions: CREATE, READ, UPDATE, DELETE, MANAGE, EXECUTE
```

### 3. Instance Lifecycle
```
CREATING → STARTING → RUNNING → (STOPPING → STOPPED)
                         ↑
                   Can start/stop
                         ↓
                      Can delete
```

### 4. Resource Allocation
```
ComputeMachine (physical host)
    ↓
ResourcePool (logical grouping)
    ↓
Instance (user's cloud desktop)
    ↓
VirtualMachine (actual VM on host)
    ↓
IpAddress + Disks (network/storage)
```

### 5. Hypervisor Abstraction
```
HypervisorInterface (abstract)
    ↓
├── KVMAdapter
├── VMWareAdapter
└── HyperVAdapter
```

### 6. Instance Rental Modes
- **EXCLUSIVE**: Dedicated compute machine per instance
- **SHARED**: Multiple instances per compute machine

---

## Environment Configuration

```bash
# Database
DATABASE_URL=postgresql://user:password@localhost:5432/zedge_db

# JWT Authentication
JWT_SECRET=your-secret-key-here
JWT_REFRESH_SECRET=your-refresh-secret-here

# Server
PORT=3000

# Optional
LOG_LEVEL=info
NODE_ENV=development
```

---

## Development Commands

```bash
# Setup
npm install
npm run prisma:generate
npm run prisma:migrate
npm run init-permissions

# Development
npm run dev              # Hot reload development server
npm run build            # Compile TypeScript
npm start                # Run compiled code

# Database
npm run prisma:studio   # Prisma GUI for database

# Quality
npm run lint             # ESLint
npm run format           # Prettier
npm test                 # Jest tests
npm run type-check      # TypeScript check
```

---

## Key Security Features

1. **Authentication**
   - JWT tokens (access + refresh)
   - Password hashing with bcrypt
   - Token expiration

2. **Authorization**
   - Role-based access control (RBAC)
   - Permission-based endpoint access
   - Resource ownership validation

3. **Protection**
   - Helmet (HTTP headers security)
   - CORS configuration
   - Input validation
   - SQL injection prevention (via Prisma)

4. **Auditing**
   - AuditLog model for all operations
   - User tracking for all changes
   - Timestamp recording

---

## Common Workflows

### Create & Launch an Instance
```
1. Create Instance (POST /instances)
   → Instance state: CREATING
   
2. Start Instance (POST /instances/:id/start)
   → Allocate resources from ResourcePool
   → Select ComputeMachine
   → Create VirtualMachine
   → Instance state: RUNNING
   
3. Attach Disk (POST /instances/:id/private-data-disks/:disk_id/attach)
   → Update disk status
   → Record attachment details
   
4. Allocate IP (IpAddress management)
   → Assign IP from pool
   → Link to instance
```

### Image Versioning & Usage
```
1. Create Image (POST /images)
   → Upload to file server
   
2. Create Image Version (POST /images/:id/versions)
   → Record version number
   → Store configuration
   
3. Tag Version (POST /images/:id/tags)
   → Create alias (e.g., "latest", "stable")
   
4. Use in Template
   → Template references image
   → New instances use template → image
```

### Template-Based Instance Creation
```
1. Create Template (POST /templates)
   → Define CPU, memory, storage defaults
   → Specify base image
   → Set network configuration
   
2. Create from Template (POST /instances/from-template/:id)
   → Copy template config to instance
   → Allocate resources
   → Start instance
```

---

## File Locations Summary

```
Key Source Files:
  /src/index.ts                          - Entry point, Express app setup
  /src/middleware/auth.middleware.ts     - JWT verification
  /src/middleware/permission.middleware.ts - RBAC enforcement
  
Routes (12 files):
  /src/routes/*.routes.ts                - API endpoint definitions
  
Services (18 modules):
  /src/services/[module]/[module].service.ts   - Business logic
  /src/services/[module]/[module].controller.ts - Request handlers
  
Database:
  /prisma/schema.prisma                  - All 27 models defined here
  
Configuration:
  /tsconfig.json                         - TypeScript settings
  /package.json                          - Dependencies & scripts
  /.env.example                          - Environment template
```

---

## Stats Summary

| Metric | Count |
|--------|-------|
| **Service Modules** | 18 |
| **Database Models** | 27 |
| **API Routes** | 12 |
| **Endpoints** | 70+ |
| **Enums** | 14+ |
| **User Roles** | 4 |
| **Resource Types** | 11 |
| **Permission Actions** | 6 |

