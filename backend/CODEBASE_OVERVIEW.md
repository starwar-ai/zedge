# Zedge Backend Codebase - Comprehensive Overview

## 1. Technology Stack

### Core Framework & Runtime
- **Runtime**: Node.js 18+ LTS
- **Language**: TypeScript 5.3.3
- **Web Framework**: Express.js 4.18.2
- **Database**: PostgreSQL 14+
- **ORM**: Prisma 6.18.0 (Client + Migration tools)

### Key Dependencies
- **Authentication**: JWT (jsonwebtoken 9.0.2)
- **Security**: 
  - bcrypt 5.1.1 (password hashing)
  - helmet 7.1.0 (HTTP security headers)
  - cors 2.8.5 (Cross-Origin Resource Sharing)
- **Logging**: winston 3.11.0
- **Environment**: dotenv 16.3.1

### Development Tools
- **Build**: TypeScript compiler (tsc)
- **Dev Server**: ts-node-dev 2.0.0
- **Testing**: Jest 29.7.0 with ts-jest
- **Linting**: ESLint 8.56.0 with TypeScript parser
- **Formatting**: Prettier 3.1.1

---

## 2. Main Modules/Domains

The application is organized into the following domains:

### A. Authentication & Authorization
- **Module**: `auth`, `user`, `permission`, `tenant`
- **Purpose**: User authentication, role-based access control (RBAC), tenant management
- **Key Files**:
  - `/src/services/auth/` - Authentication logic
  - `/src/services/user/` - User management
  - `/src/services/permission/` - Permission/RBAC service
  - `/src/services/tenant/` - Tenant management

### B. Compute & Infrastructure
- **Modules**: `instance`, `instance-set`, `compute-machine`, `virtual-machine`, `resource-pool`
- **Purpose**: Manage cloud desktop instances, compute resources, and VM allocation
- **Key Features**:
  - Instance creation, lifecycle management (start/stop/delete)
  - Instance Sets for grouping instances
  - Compute Machine management (CPU servers, GPU servers, PC farms)
  - Virtual Machine creation and management
  - Resource Pool management for resource allocation
  - Rental modes: EXCLUSIVE and SHARED

### C. Storage & Data Management
- **Modules**: `private-data-disk`, `image`
- **Purpose**: Manage persistent storage and system/application images
- **Key Features**:
  - Private data disk management with versioning
  - Disk attachment/detachment to instances
  - Image management (OS base, application layer, custom)
  - Image versioning and tagging
  - Resource requirement validation

### D. Networking
- **Modules**: `vpc`, `subnet`, `place`, `ip-address`
- **Purpose**: Virtual network infrastructure and IP address management
- **Key Features**:
  - VPC (Virtual Private Cloud) creation and management
  - Subnet management with CIDR blocks
  - Place management (network locations)
  - IP address allocation and pool management
  - DNS configuration
  - VLAN support

### E. Cloud Desktop Device Management
- **Module**: `cloud-box`
- **Purpose**: Manage cloud box devices (thin clients/cloud desktops)
- **Key Features**:
  - Cloud box registration and status tracking
  - Temporary instance binding
  - Device heartbeat monitoring
  - Hardware configuration tracking
  - Network configuration management

### F. Infrastructure Services
- **Modules**: `hypervisor`, `edge-datacenter`
- **Purpose**: Multi-hypervisor support and edge data center management
- **Key Features**:
  - Hypervisor abstraction layer (KVM, VMware, Hyper-V)
  - Edge data center registration and status
  - Compute machine aggregation
  - Resource pool management

### G. Configuration & Templates
- **Module**: `template`
- **Purpose**: Instance templates for quick provisioning
- **Key Features**:
  - Template creation with predefined resources
  - Multiple use cases (AI, graphics, gaming, office, etc.)
  - Template versioning
  - Visibility control (public, private, group-specific)

---

## 3. Database Models & Entities (Prisma Schema)

### Authentication & Multi-Tenancy (27 Models)

| Model | Purpose | Key Fields |
|-------|---------|-----------|
| **Tenant** | Multi-tenant organization | id, name, status, adminUserId, vlanId, quotaConfig |
| **User** | System user | id, username, email, passwordHash, role, status, tenantId |
| **UserGroup** | User organization | id, name, tenantId, parentGroupId (hierarchical) |
| **UserGroupMember** | Group membership | id, groupId, userId, joinedAt |
| **Permission** | Fine-grained permissions | id, resourceType, action, permissionName |
| **RolePermission** | Role-to-permission mapping | id, role, permissionId |

### Compute & Instance Management

| Model | Purpose | Key Fields |
|-------|---------|-----------|
| **Instance** | Cloud desktop instance | id, name, tenantId, userId, templateId, status, rentalMode, resourcePoolId |
| **Template** | Instance template | id, name, templateType, defaultCpuCores, defaultMemoryGb, defaultStorageGb |
| **TemplateVersion** | Template version control | id, templateId, versionNumber, configSnapshot |
| **ComputeMachine** | Physical/virtual compute host | id, hostname, resourcePoolId, machineType, cpuCores, memoryGb, status |
| **VirtualMachine** | Actual VM instance | id, computeMachineId, instanceId, vmUuid, cpuCores, memoryGb, status |
| **ResourcePool** | Resource allocation pool | id, edgeDataCenterId, poolType, totalCpuCores, allocatedCpuCores |
| **InstanceSet** | Collection of instances | id, name, ownerId, tenantId, setType, status |
| **InstanceSetMember** | Instance set membership | id, setId, instanceId, role |

### Storage Management

| Model | Purpose | Key Fields |
|-------|---------|-----------|
| **PrivateDataDisk** | Persistent storage | id, name, sizeGb, diskType, status, shareMode, rbdImageName |
| **InstancePrivateDataDiskAttachment** | Disk-instance mapping | id, instanceId, diskId, mountPath, mountMode, status |
| **Image** | System/application image | id, name, imageType, baseOs, sizeGb, minCpuCores, minMemoryGb |
| **ImageVersion** | Image versioning | id, imageId, versionNumber, isLatest, isDefault, status |
| **ImageTag** | Image tagging | id, imageId, versionId, tagName |

### Network Management

| Model | Purpose | Key Fields |
|-------|---------|-----------|
| **Vpc** | Virtual private cloud | id, name, tenantId, cidrBlock, edgeDataCenterId, vlanId, status |
| **Subnet** | Network subnet | id, name, vpcId, cidrBlock, availabilityZone, gateway, ipPoolId |
| **Place** | Network location | id, name, tenantId, subnetId, location, status |
| **IpAddress** | IP address tracking | id, ipAddress, ipPoolId, subnetId, status, instanceId, allocatedBy |

### Infrastructure

| Model | Purpose | Key Fields |
|-------|---------|-----------|
| **EdgeDataCenter** | Edge data center site | id, name, location, status, totalCpuCores, totalMemoryGb |
| **CloudBox** | Cloud desktop device | id, name, serialNumber, status, ipAddress, edgeDataCenterId, assignedUserId |

### Auditing

| Model | Purpose | Key Fields |
|-------|---------|-----------|
| **AuditLog** | Operation audit trail | id, userId, action, resourceType, resourceId, details, status |

---

## 4. API Routes & Endpoints

### Base URL: `/api/v1`

#### Authentication
- **Route**: `/auth`
- `POST /login` - User login
- `POST /refresh` - Refresh access token
- `POST /logout` - User logout

#### Tenant Management
- **Route**: `/tenants`
- `POST /` - Create tenant (ADMIN only)
- `GET /` - List tenants
- `GET /:tenant_id` - Get tenant details
- `PATCH /:tenant_id` - Update tenant (ADMIN only)
- `DELETE /:tenant_id` - Delete tenant (ADMIN only)
- `PATCH /:tenant_id/status` - Update tenant status (ADMIN only)
- `GET /:tenant_id/quota` - Get tenant quota usage

#### User Management
- **Route**: `/users`
- `GET /me` - Get current user info
- `GET /me/instance-sets` - Get current user's instance sets
- `POST /` - Create user
- `GET /` - List users
- `GET /:user_id` - Get user details
- `PATCH /:user_id` - Update user
- `DELETE /:user_id` - Delete user
- `POST /:user_id/change-password` - Change password
- `POST /:user_id/reset-password` - Reset password (ADMIN)

#### Instance Management
- **Route**: `/instances`
- `POST /` - Create instance
- `POST /from-template/:template_id` - Create from template
- `GET /` - List instances
- `GET /:instance_id` - Get instance details
- `PATCH /:instance_id` - Update instance
- `DELETE /:instance_id` - Delete instance
- `POST /:instance_id/start` - Start instance
- `POST /:instance_id/stop` - Stop instance
- `GET /:instance_id/private-data-disks` - List attached disks
- `POST /:instance_id/private-data-disks/:disk_id/attach` - Attach disk
- `POST /:instance_id/private-data-disks/:disk_id/detach` - Detach disk

#### Instance Set Management
- **Route**: `/instance-sets`
- `POST /` - Create instance set
- `GET /` - List instance sets
- `GET /:id` - Get instance set details
- `PATCH /:id` - Update instance set
- `DELETE /:id` - Delete instance set
- `POST /:id/members` - Add instance to set
- `POST /:id/batch-create-instances` - Batch create instances
- `DELETE /:id/members/:instance_id` - Remove instance from set

#### VPC & Network Management
- **Route**: `/vpcs`
- `POST /` - Create VPC
- `GET /` - List VPCs
- `GET /:vpc_id` - Get VPC details
- `PATCH /:vpc_id` - Update VPC
- `DELETE /:vpc_id` - Delete VPC
- `PATCH /:vpc_id/status` - Update VPC status

#### Subnet Management
- **Route**: `/subnets`
- `POST /` - Create subnet
- `GET /` - List subnets
- `GET /:subnet_id` - Get subnet details
- `PATCH /:subnet_id` - Update subnet
- `DELETE /:subnet_id` - Delete subnet

#### Place Management
- **Route**: `/places`
- `POST /` - Create place
- `GET /` - List places
- `GET /:place_id` - Get place details
- `PATCH /:place_id` - Update place
- `DELETE /:place_id` - Delete place

#### Image Management
- **Route**: `/images`
- `POST /` - Create image
- `GET /` - List images
- `GET /:image_id` - Get image details
- `PATCH /:image_id` - Update image
- `DELETE /:image_id` - Delete image
- `POST /:image_id/versions` - Create image version
- `GET /:image_id/versions` - List versions
- `GET /:image_id/versions/:version_id` - Get version details
- `PATCH /:image_id/versions/:version_id` - Update version
- `DELETE /:image_id/versions/:version_id` - Delete version
- `POST /:image_id/tags` - Create image tag
- `GET /:image_id/tags` - List tags
- `PATCH /:image_id/tags/:tag_id` - Update tag
- `DELETE /:image_id/tags/:tag_id` - Delete tag
- `GET /:image_id/tags/:tag_name` - Get image by tag

#### Template Management
- **Route**: `/templates`
- `POST /` - Create template
- `GET /` - List templates
- `GET /:template_id` - Get template details
- `PATCH /:template_id` - Update template
- `DELETE /:template_id` - Delete template

#### Cloud Box Management
- **Route**: `/cloud-boxes` or `/cloud-box`
- `GET /instances` - Get user accessible instances
- `POST /` - Create cloud box
- `GET /:box_id` - Get cloud box details
- `POST /:box_id/bind-instance` - Bind instance temporarily
- `DELETE /:box_id/unbind-instance` - Unbind instance
- `GET /:box_id/startup-check` - Startup validation (no auth)
- `GET /:box_id/bound-instance` - Get bound instance

#### Private Data Disk Management
- **Route**: `/private-data-disks`
- `POST /` - Create disk
- `GET /` - List disks
- `GET /:disk_id` - Get disk details
- `PATCH /:disk_id` - Update disk
- `DELETE /:disk_id` - Delete disk

---

## 5. Entity/Model Files Location

All models are defined in a single Prisma schema file:

**Location**: `/home/ubuntu/zhangkai/zedge/backend/prisma/schema.prisma`

**Model Sections**:
1. Tenant Management (lines 14-50)
2. User Management (lines 52-159)
3. Permission Management (lines 161-217)
4. Instance Management (lines 220-259)
5. Storage Management (lines 262-351)
6. Network Management (lines 353-461)
7. IP Address Management (lines 464-503)
8. Audit Logs (lines 506-529)
9. Template Management (lines 532-619)
10. Instance Set Management (lines 622-689)
11. Cloud Box Management (lines 692-757)
12. Edge Data Center (lines 759-792)
13. Resource Pool (lines 795-846)
14. Compute Machine (lines 848-930)
15. Virtual Machine (lines 932-976)
16. Image Management (lines 978-1093)

---

## 6. Project Directory Structure

```
/home/ubuntu/zhangkai/zedge/backend/
├── prisma/
│   └── schema.prisma                    # Prisma database schema (all models)
├── src/
│   ├── index.ts                          # Express app main entry point
│   ├── middleware/
│   │   ├── auth.middleware.ts           # JWT authentication
│   │   └── permission.middleware.ts     # RBAC permission checks
│   ├── routes/                          # API route handlers
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
│   ├── services/                        # Business logic layer
│   │   ├── auth/                        # Authentication service
│   │   ├── user/                        # User service
│   │   │   ├── user.controller.ts
│   │   │   └── user.service.ts
│   │   ├── tenant/
│   │   │   ├── tenant.controller.ts
│   │   │   └── tenant.service.ts
│   │   ├── permission/
│   │   │   └── permission.service.ts
│   │   ├── instance/
│   │   │   ├── instance.controller.ts
│   │   │   └── instance.service.ts
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
│   │   ├── hypervisor/                  # Hypervisor adapter pattern
│   │   │   ├── hypervisor.interface.ts
│   │   │   ├── hypervisor-factory.ts
│   │   │   ├── kvm-adapter.ts
│   │   │   ├── vmware-adapter.ts
│   │   │   └── hyper-v-adapter.ts
│   │   └── ip-address/
│   ├── types/
│   │   └── express.d.ts                # TypeScript Express type extensions
│   └── utils/
│       └── prisma.client.ts            # Prisma client initialization
├── scripts/
│   ├── init-permissions.ts             # Initialize default permissions
│   └── create-admin.ts                 # Create default admin user
├── package.json                         # Project dependencies
├── package-lock.json
├── tsconfig.json                        # TypeScript configuration
├── .env.example                         # Environment variables template
└── README.md                            # Project documentation
```

---

## 7. Key Architecture Patterns

### 1. MVC-Like Pattern
- **Controllers** (in routes/): Handle HTTP requests
- **Services** (in services/): Contain business logic
- **Models** (Prisma schema): Define data structure

### 2. Middleware Stack
- Authentication middleware (JWT verification)
- Permission middleware (RBAC enforcement)

### 3. Multi-Tenancy
- Tenant isolation at database level
- User-to-tenant relationship
- Quota management per tenant

### 4. RBAC (Role-Based Access Control)
- **Roles**: ADMIN, TENANT_ADMIN, OPERATOR, USER
- **Permissions**: Tied to resource types and actions
- **Actions**: CREATE, READ, UPDATE, DELETE, MANAGE, EXECUTE

### 5. Adapter Pattern (Hypervisor)
- Factory pattern for hypervisor creation
- Supports KVM, VMware, Hyper-V
- Abstracted interface for multi-hypervisor support

### 6. Versioning
- Template versioning
- Image versioning
- API versioning (v1)

---

## 8. Key Enums & Constants

### User Roles
- ADMIN (System administrator)
- TENANT_ADMIN (Tenant administrator)
- OPERATOR (Operations personnel)
- USER (Regular user)

### Resource Types
- TENANT, USER, USER_GROUP, INSTANCE, INSTANCE_SET
- STORAGE, NETWORK, IMAGE, SERVER, EDGE_DC, PLACE, TEMPLATE

### Permission Actions
- CREATE, READ, UPDATE, DELETE, MANAGE, EXECUTE

### Instance Status
- CREATING, STARTING, RUNNING, STOPPING, STOPPED, ERROR

### Compute Machine Types
- CPU_SERVER, PC_FARM, GPU_SERVER

### Rental Modes
- EXCLUSIVE (dedicated), SHARED (multi-tenant)

### Hypervisor Types
- KVM, VMWARE, HYPER_V

### Disk Share Modes
- EXCLUSIVE, SHARED

---

## 9. Key Features

### Security
- JWT-based authentication with access/refresh tokens
- Password hashing with bcrypt
- RBAC with fine-grained permissions
- Audit logging for all operations
- Helmet for HTTP security headers
- CORS protection

### Multi-Tenancy
- Complete tenant isolation
- Tenant quota management
- Tenant-scoped resources

### Cloud Desktop Management
- Instance lifecycle management (create, start, stop, delete)
- Resource allocation (CPU, memory, storage, GPU)
- Private data disk management with versioning
- Network configuration with VPC/Subnet/IP management
- Cloud box device management

### Flexibility
- Multiple hypervisor support (KVM, VMware, Hyper-V)
- Instance sets for grouped management
- Templates for quick provisioning
- Image versioning and tagging

### Scalability
- Edge data center support
- Resource pool abstraction
- Multi-zone availability
- Shared/exclusive rental modes

---

## 10. Configuration & Setup

### Environment Variables (.env)
- `DATABASE_URL`: PostgreSQL connection string
- `JWT_SECRET`: JWT signing secret
- `JWT_REFRESH_SECRET`: Refresh token secret
- `PORT`: Server port (default: 3000)

### Scripts
- `npm run dev`: Start development server with hot reload
- `npm run build`: Compile TypeScript
- `npm start`: Run production build
- `npm run prisma:generate`: Generate Prisma client
- `npm run prisma:migrate`: Run database migrations
- `npm run init-permissions`: Initialize default permissions
- `npm run create-admin`: Create default admin user
- `npm test`: Run tests
- `npm run lint`: Lint code
- `npm run format`: Format code with Prettier

---

## Summary

The Zedge backend is a comprehensive cloud desktop management platform built with:
- **Express.js** for HTTP API
- **Prisma** for database abstraction
- **TypeScript** for type safety
- **PostgreSQL** for persistent storage
- **JWT** for authentication
- **RBAC** for fine-grained authorization

It supports multi-tenancy, multiple hypervisors, edge computing, resource pooling, and complete lifecycle management of cloud desktop instances with networking and storage capabilities.
