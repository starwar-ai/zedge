# Zedge Backend Documentation Index

This directory contains comprehensive documentation of the Zedge Cloud Desktop Management Platform backend codebase.

## Documentation Files

### 1. CODEBASE_OVERVIEW.md (19 KB, 523 lines)
**Complete technical overview of the entire backend system**

Covers:
- Technology stack (Express.js, TypeScript, Prisma, PostgreSQL, JWT, bcrypt)
- All 18 service modules and their responsibilities
- All 27 database models with detailed descriptions
- Complete API endpoint reference (70+ endpoints across 12 routes)
- Entity/model file locations
- Architecture patterns (MVC, middleware stack, multi-tenancy, RBAC, adapter pattern, versioning)
- Key enums and constants
- Security features
- Configuration and setup instructions

**Best for**: Understanding the complete system architecture and finding detailed information about specific components.

---

### 2. QUICK_REFERENCE.md (16 KB, 453 lines)
**Fast lookup guide with visual diagrams and quick summaries**

Contains:
- ASCII architecture diagram
- Domain organization tree
- 27 database models at a glance
- Complete API endpoint summary (organized by resource)
- Key concepts and patterns
- Environment configuration
- Development commands
- Security features summary
- Common workflows (instance creation, image versioning, template usage)
- File location shortcuts
- Statistics summary

**Best for**: Quick lookup, understanding the big picture, and finding specific information fast.

---

### 3. DATABASE_MODELS.md (33 KB, 1137 lines)
**Comprehensive database schema reference**

Includes:
- Detailed model relationship diagrams
- Complete entity descriptions organized by category:
  - Authentication & Authorization (6 models)
  - Compute & Infrastructure (8 models)
  - Storage & Image Management (5 models)
  - Network Management (4 models)
  - Cloud Hardware (2 models)
  - Audit & Logging (1 model)
  - Plus 1 Infrastructure model
- Field-by-field documentation for each model
- All enums with values
- Relations between models
- Database constraints
- Design patterns and notes

**Best for**: Understanding the data model, database design decisions, and writing queries.

---

### 4. README.md (7.3 KB, 306 lines)
**Original project readme with quick start instructions**

Contains:
- Project description
- Technology stack overview
- Basic project structure
- Quick start guide
- Installation instructions

**Best for**: Getting started with the project and basic setup.

---

## Quick Navigation

### I want to understand...

**The overall architecture**
→ Read: QUICK_REFERENCE.md (Architecture Diagram section)
→ Then: CODEBASE_OVERVIEW.md (Technology Stack & Modules sections)

**The database structure**
→ Read: DATABASE_MODELS.md (full document)
→ Quick lookup: QUICK_REFERENCE.md (27 Database Models section)

**How to use the API**
→ Read: CODEBASE_OVERVIEW.md (API Routes & Endpoints section)
→ Quick lookup: QUICK_REFERENCE.md (API Endpoint Summary section)

**All 18 service modules**
→ Read: CODEBASE_OVERVIEW.md (Main Modules/Domains section)
→ Quick lookup: QUICK_REFERENCE.md (Domain Organization section)

**A specific entity/model**
→ Search: DATABASE_MODELS.md for detailed specification
→ Cross-reference: CODEBASE_OVERVIEW.md (Database Models section)

**How to set up the project**
→ Read: README.md and .env.example
→ Commands: QUICK_REFERENCE.md (Development Commands section)

**Security & authentication**
→ Read: CODEBASE_OVERVIEW.md (Key Features section)
→ Summary: QUICK_REFERENCE.md (Key Security Features section)

**RBAC & permissions**
→ Read: DATABASE_MODELS.md (Permission & RolePermission models)
→ Context: CODEBASE_OVERVIEW.md (Key Concepts section)

**Cloud instance lifecycle**
→ Read: QUICK_REFERENCE.md (Common Workflows section)
→ Details: DATABASE_MODELS.md (Instance & VirtualMachine models)

---

## Key Metrics

| Aspect | Count |
|--------|-------|
| Service Modules | 18 |
| Database Models | 27 |
| API Routes | 12 |
| API Endpoints | 70+ |
| User Roles | 4 (ADMIN, TENANT_ADMIN, OPERATOR, USER) |
| Permission Actions | 6 (CREATE, READ, UPDATE, DELETE, MANAGE, EXECUTE) |
| Resource Types | 11 (TENANT, USER, INSTANCE, STORAGE, NETWORK, IMAGE, etc.) |
| Hypervisor Support | 3 (KVM, VMware, Hyper-V) |

---

## Technology Stack Summary

```
Frontend (HTTP Client)
    ↓
Express.js REST API (/api/v1)
    ↓
TypeScript + Service Layer (18 modules)
    ↓
Prisma ORM (27 models)
    ↓
PostgreSQL Database
```

**Key Technologies:**
- Runtime: Node.js 18+ LTS
- Language: TypeScript 5.3.3
- Framework: Express.js 4.18.2
- ORM: Prisma 6.18.0
- Database: PostgreSQL 14+
- Auth: JWT + bcrypt
- Security: Helmet + CORS

---

## File Location Map

```
/home/ubuntu/zhangkai/zedge/backend/

Documentation Files:
├── DOCUMENTATION_INDEX.md          (this file)
├── CODEBASE_OVERVIEW.md            (comprehensive overview)
├── QUICK_REFERENCE.md              (quick lookup guide)
├── DATABASE_MODELS.md              (detailed schema)
├── README.md                        (quick start)
└── .env.example                    (environment template)

Source Code:
├── src/
│   ├── index.ts                    (Express app entry point)
│   ├── middleware/                 (JWT, RBAC)
│   ├── routes/                     (12 route files)
│   ├── services/                   (18 service modules)
│   ├── types/                      (TypeScript types)
│   └── utils/                      (utilities)
├── prisma/
│   └── schema.prisma               (all 27 models)
├── scripts/
│   ├── init-permissions.ts         (setup permissions)
│   └── create-admin.ts             (create admin user)
├── package.json                    (dependencies)
├── tsconfig.json                   (TypeScript config)
└── node_modules/                   (dependencies)
```

---

## Service Modules (18 Total)

### Authentication & Authorization
- `/auth` - JWT token management
- `/user` - User CRUD and password management
- `/permission` - RBAC permission system
- `/tenant` - Multi-tenant management

### Compute Infrastructure (6)
- `/instance` - Cloud desktop instances
- `/instance-set` - Grouped instances
- `/compute-machine` - Physical/virtual hosts
- `/virtual-machine` - VM instances
- `/resource-pool` - Resource allocation
- `/hypervisor` - Multi-hypervisor abstraction

### Storage (2)
- `/image` - System/app images with versioning
- `/private-data-disk` - Persistent storage

### Networking (4)
- `/vpc` - Virtual private clouds
- `/subnet` - Network subnets
- `/place` - Network locations
- `/ip-address` - IP address tracking

### Infrastructure & Cloud Hardware (2)
- `/cloud-box` - Cloud desktop devices
- `/edge-datacenter` - Edge data center management

### Configuration (1)
- `/template` - Instance provisioning templates

---

## API Endpoint Categories

**Authentication** (3 endpoints)
- Login, Refresh token, Logout

**Tenants** (7 endpoints)
- CRUD + status management + quota tracking

**Users** (9 endpoints)
- CRUD + password management + profile

**Instances** (13 endpoints)
- CRUD + lifecycle (start/stop) + disk management

**Instance Sets** (7 endpoints)
- CRUD + member management + batch operations

**Networks** (13 endpoints)
- VPC, Subnet, Place management

**Images** (15 endpoints)
- CRUD + versions + tags

**Templates** (5 endpoints)
- CRUD + versioning

**Cloud Boxes** (7 endpoints)
- CRUD + instance binding + startup checks

**Private Disks** (5 endpoints)
- CRUD operations

---

## Key Concepts

### Multi-Tenancy
- Complete isolation between tenants
- User → Tenant (N:1)
- Resource scoping by tenantId
- Quota management

### RBAC (Role-Based Access Control)
```
User Role (ADMIN, TENANT_ADMIN, OPERATOR, USER)
    ↓
Permission (ResourceType + Action)
    ↓
RolePermission (role → permissions mapping)
    ↓
Middleware enforcement on routes
```

### Instance Lifecycle
```
CREATE → CREATING → STARTING → RUNNING 
           ↑                      ↓
         (error)           STOPPING → STOPPED → DELETE
```

### Resource Allocation Model
```
EdgeDataCenter
    ├─ ResourcePool
    │   └─ Host (with allocation tracking)
    │       └─ VirtualMachine
    │           └─ Instance (user's cloud desktop)
    │               ├─ IpAddress
    │               └─ PrivateDataDisk
    └─ CloudBox (thin client devices)
```

### Rental Modes
- **EXCLUSIVE**: Dedicated compute machine per instance
- **SHARED**: Multiple instances per compute machine

---

## Common Tasks

### Find information about a feature
1. Search QUICK_REFERENCE.md first (fastest)
2. Check CODEBASE_OVERVIEW.md for details
3. Review DATABASE_MODELS.md for data structure

### Understand a specific model
1. Go to DATABASE_MODELS.md
2. Find the model in the appropriate category
3. Read field descriptions and relations
4. Cross-reference with CODEBASE_OVERVIEW.md

### Find an API endpoint
1. Check QUICK_REFERENCE.md (API Endpoint Summary)
2. Go to CODEBASE_OVERVIEW.md (API Routes & Endpoints)
3. Look at the actual route file in `/src/routes/`

### Set up the project
1. Follow README.md
2. Use .env.example as template
3. Run commands from QUICK_REFERENCE.md

### Understand architecture patterns
1. Read CODEBASE_OVERVIEW.md (Key Architecture Patterns)
2. View QUICK_REFERENCE.md (Key Concepts section)
3. Review DATABASE_MODELS.md (relationships)

---

## Additional Resources

### Configuration
- `.env.example` - Environment variables template
- `tsconfig.json` - TypeScript configuration
- `package.json` - Dependencies and scripts

### Database
- `prisma/schema.prisma` - Prisma schema with all 27 models

### Setup Scripts
- `scripts/init-permissions.ts` - Initialize default permissions
- `scripts/create-admin.ts` - Create default admin user

### Development
```bash
npm run dev              # Start with hot reload
npm run build            # Compile TypeScript
npm test                 # Run tests
npm run lint             # Lint code
npm run format           # Format code
npm run prisma:studio   # Visual database editor
```

---

## Document Maintenance

These documentation files are:
- Generated from codebase analysis (November 1, 2025)
- Organized for quick reference and comprehensive understanding
- Updated to reflect the current backend structure

**To update documentation:**
1. Review changes in source code
2. Update relevant .md file(s)
3. Ensure consistency across all documents
4. Update this index if structure changes

---

## Quick Stats

- **Total Lines of Documentation**: 2,419
- **Service Modules**: 18
- **Database Models**: 27
- **API Routes**: 12 
- **API Endpoints**: 70+
- **Dependencies**: 8 main + 8 dev
- **Supported Hypervisors**: 3
- **User Roles**: 4
- **Programming Language**: TypeScript 5.3.3
- **Runtime**: Node.js 18+ LTS

---

**Last Updated**: November 1, 2025

For questions about specific components, refer to the appropriate documentation file above, or examine the source code in `/src/`.
