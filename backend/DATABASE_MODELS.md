# Zedge Database Models - Complete Reference

## Model Relationships Diagram

```
┌─────────────────────────────────────────────────────────────────────────┐
│                       AUTHENTICATION & AUTHORIZATION                     │
├─────────────────────────────────────────────────────────────────────────┤
│
│  ┌──────────────┐         ┌──────────────┐      ┌──────────────────────┐
│  │   Tenant     │────────>│     User     │<─────│  UserGroup           │
│  │              │ 1:N     │              │ 1:N  │  (hierarchical)      │
│  │ id           │         │ id           │      │ id                   │
│  │ name         │         │ username     │      │ name                 │
│  │ status       │         │ email        │      │ parentGroupId        │
│  │ adminUserId  │         │ password     │      │                      │
│  │ quotaConfig  │         │ role         │      └─────────┬────────────┘
│  │ vlanId       │         │ status       │                │
│  └──────────────┘         │ tenantId     │                │
│                           │ quotaConfig  │                │
│                           └──────────────┘      ┌──────────▼────────────┐
│                                  ▲              │  UserGroupMember     │
│                                  │              │ (many-to-many)       │
│                                  │              │ groupId              │
│                           ┌──────┴──────────┐   │ userId               │
│                           │  Permission    │   │ joinedAt             │
│                           │  id            │   └──────────────────────┘
│                           │  resourceType  │
│                           │  action        │
│                           │  permissionName│
│                           └──────┬─────────┘
│                                  │
│                        ┌─────────▼──────────┐
│                        │  RolePermission    │
│                        │ (many-to-many)     │
│                        │ role               │
│                        │ permissionId       │
│                        └────────────────────┘
│
└─────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────┐
│                    COMPUTE & INFRASTRUCTURE LAYER                        │
├─────────────────────────────────────────────────────────────────────────┤
│
│  ┌──────────────────────────────────┐
│  │   EdgeDataCenter                 │
│  │   id, name, location, status     │
│  │   totalCpuCores, totalMemoryGb   │
│  └──────────────┬────────────────────┘
│                 │
│     ┌───────────┼───────────┬──────────┐
│     │           │           │          │
│     ▼           ▼           ▼          ▼
│ ┌─────────┐ ┌──────────┐ ┌────────┐ ┌──────────┐
│ │ResourcePool│ │ComputeMachine│ │CloudBox  │ │Vpc      │
│ │ id       │ │ id       │ │ id     │ │ id      │
│ │ name     │ │ hostname │ │ name   │ │ name    │
│ │ poolType │ │ cpuCores │ │ status │ │ cidrBlock
│ │ status   │ │ memoryGb │ │ ipAddr │ │ edgeDC_id
│ └────┬─────┘ │ status   │ └────────┘ └──────────┘
│      │       │ rentalMode          │
│      │       └──────┬──────────────┘         ┌──────────┐
│      │              │                        │ Subnet   │
│      ▼              ▼                        │ id       │
│ ┌──────────┐   ┌──────────────┐              │ cidrBlock
│ │IpAddress │   │VirtualMachine│              │ gateway  │
│ │(many)    │   │ id           │              │ vlanId   │
│ │ipAddress │   │ vmUuid       │              │ ipPoolId │
│ │ipPoolId  │   │ cpuCores     │              └────┬─────┘
│ │status    │   │ instanceId   │                   │
│ │instance  │   │ status       │           ┌──────▼────────┐
│ │Allocated │   │ ipAddress    │           │  Place        │
│ └──────────┘   │ macAddress   │           │  id           │
│                └──────────────┘           │  subnetId     │
│                                            │  location     │
│                                            └───────────────┘
│
│  ┌──────────┐
│  │Instance  │──────┐
│  │ id       │      │ references Template
│  │ name     │      │
│  │ status   │      ▼
│  │ tenantId │  ┌──────────────┐
│  │ userId   │  │Template      │
│  │ template │  │ id           │
│  │ rentalMode  │ name         │
│  │ resourcePool│ defaultCpuCores
│  │ computeMach.│ defaultMemory│
│  │ virtualMach │ defaultStorage
│  └──────────────┴──────────────┴──────┐
│                                        │
│                            ┌───────────▼──────┐
│                            │TemplateVersion   │
│                            │ id               │
│                            │ templateId       │
│                            │ versionNumber    │
│                            │ configSnapshot   │
│                            └──────────────────┘
│
│  ┌──────────────────┐          ┌───────────────────┐
│  │InstanceSet      │─────────>│InstanceSetMember  │
│  │ id               │ 1:N      │ setId             │
│  │ name             │          │ instanceId        │
│  │ ownerId          │          │ role              │
│  │ tenantId         │          └───────────────────┘
│  │ userGroupId      │                   │
│  │ setType          │                   │
│  └──────────────────┘                   │
│                                          ▼
│                                     ┌─────────┐
│                                     │Instance │
│                                     │ id      │
│                                     └─────────┘
│
└─────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────┐
│                        STORAGE & IMAGE MANAGEMENT                        │
├─────────────────────────────────────────────────────────────────────────┤
│
│  ┌──────────────┐
│  │PrivateDataDisk
│  │ id           │
│  │ name         │
│  │ sizeGb       │
│  │ diskType     │
│  │ status       │
│  │ shareMode    │
│  │ rbdImageName │
│  └────┬─────────┘
│       │
│       ▼
│  ┌──────────────────────────┐
│  │InstancePrivateDataDisk   │
│  │Attachment                │
│  │ id                       │
│  │ instanceId               │
│  │ diskId                   │
│  │ mountPath                │
│  │ mountMode (RW/RO)        │
│  │ status                   │
│  └──────────────────────────┘
│
│  ┌──────────────┐
│  │Image         │
│  │ id           │
│  │ name         │
│  │ imageType    │
│  │ baseOs       │
│  │ osVersion    │
│  │ sizeGb       │
│  │ minCpuCores  │
│  │ minMemoryGb  │
│  │ minStorageGb │
│  │ visibility   │
│  │ status       │
│  │ ownerId      │
│  │ tenantId     │
│  └────┬─────────┘
│       │
│       ├──────────────┐
│       │              │
│       ▼              ▼
│  ┌──────────────┐ ┌─────────┐
│  │ImageVersion  │ │ImageTag │
│  │ id           │ │ id      │
│  │ imageId      │ │ imageId │
│  │ versionNo    │ │ versionId
│  │ isLatest     │ │ tagName │
│  │ isDefault    │ │ isImmut │
│  │ filePath     │ └─────────┘
│  │ checksumMd5  │
│  │ releaseNotes │
│  │ status       │
│  └──────────────┘
│
└─────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────┐
│                           AUDIT & LOGGING                                │
├─────────────────────────────────────────────────────────────────────────┤
│
│  ┌──────────────────┐
│  │AuditLog          │
│  │ id               │
│  │ userId           │
│  │ action           │
│  │ resourceType     │
│  │ resourceId       │
│  │ details          │
│  │ ipAddress        │
│  │ userAgent        │
│  │ status           │
│  │ createdAt        │
│  └──────────────────┘
│
└─────────────────────────────────────────────────────────────────────────┘
```

---

## Model Categories

### 1. AUTHENTICATION & AUTHORIZATION (6 Models)

#### Tenant
```typescript
id: UUID (PK)
name: String (UNIQUE)
description: String (optional)
status: TenantStatus (ACTIVE, INACTIVE, SUSPENDED)
adminUserId: UUID (FK to User)
vlanId: Int (optional, UNIQUE)
quotaConfig: JSON (optional)
createdAt: DateTime
updatedAt: DateTime
createdBy: UUID (FK to User, optional)

Relations:
- users: User[] (1:N)
- userGroups: UserGroup[] (1:N)
- instances: Instance[] (1:N)
- vpcs: Vpc[] (1:N)
- places: Place[] (1:N)
- templates: Template[] (1:N)
- instanceSets: InstanceSet[] (1:N)
- images: Image[] (1:N)
- privateDataDisks: PrivateDataDisk[] (1:N)
- creator: User (optional, 1:1)
```

#### User
```typescript
id: UUID (PK)
username: String (UNIQUE)
email: String (UNIQUE)
passwordHash: String
role: UserRole (ADMIN, TENANT_ADMIN, OPERATOR, USER)
status: UserStatus (ACTIVE, INACTIVE, LOCKED)
tenantId: UUID (FK to Tenant, optional)
quotaConfig: JSON (optional)
lastLoginAt: DateTime (optional)
createdAt: DateTime
updatedAt: DateTime

Relations:
- tenant: Tenant (optional, N:1)
- groupMemberships: UserGroupMember[] (1:N)
- instances: Instance[] (1:N)
- vpcs: Vpc[] (1:N)
- auditLogs: AuditLog[] (1:N)
- createdTenants: Tenant[] (many)
- ownedImages: Image[] (many)
- allocatedIpAddresses: IpAddress[] (many)
- ... (many more relations)
```

#### UserGroup
```typescript
id: UUID (PK)
name: String
description: String (optional)
tenantId: UUID (FK to Tenant)
parentGroupId: UUID (FK to UserGroup, optional)
quotaConfig: JSON (optional)
createdAt: DateTime
updatedAt: DateTime

Relations:
- tenant: Tenant (1:1)
- parentGroup: UserGroup (optional, 1:1)
- childGroups: UserGroup[] (1:N)
- members: UserGroupMember[] (1:N)
- instanceSets: InstanceSet[] (1:N)

Constraints:
- UNIQUE(tenantId, name)
```

#### UserGroupMember
```typescript
id: UUID (PK)
groupId: UUID (FK to UserGroup)
userId: UUID (FK to User)
joinedAt: DateTime
addedBy: UUID (FK to User, optional)

Relations:
- group: UserGroup (N:1)
- user: User (N:1)

Constraints:
- UNIQUE(groupId, userId)
```

#### Permission
```typescript
id: UUID (PK)
resourceType: ResourceType
action: PermissionAction
permissionName: String (UNIQUE)
description: String (optional)
createdAt: DateTime

Relations:
- rolePermissions: RolePermission[] (1:N)

ResourceType Enum:
- TENANT
- USER
- USER_GROUP
- INSTANCE
- INSTANCE_SET
- STORAGE
- NETWORK
- IMAGE
- SERVER
- EDGE_DC
- PLACE
- TEMPLATE

PermissionAction Enum:
- CREATE
- READ
- UPDATE
- DELETE
- MANAGE
- EXECUTE
```

#### RolePermission
```typescript
id: UUID (PK)
role: UserRole
permissionId: UUID (FK to Permission)

Relations:
- permission: Permission (N:1)

Constraints:
- UNIQUE(role, permissionId)
```

---

### 2. COMPUTE & INFRASTRUCTURE (8 Models)

#### Instance
```typescript
id: UUID (PK)
name: String
tenantId: UUID (FK to Tenant)
userId: UUID (FK to User)
templateId: UUID (FK to Template, optional)
status: String (CREATING, STARTING, RUNNING, STOPPING, STOPPED, ERROR)
config: JSON (optional)
rentalMode: RentalMode (EXCLUSIVE, SHARED, optional)
resourcePoolId: UUID (FK to ResourcePool, optional)
computeMachineId: UUID (FK to ComputeMachine, optional)
virtualMachineId: UUID (FK to VirtualMachine, UNIQUE, optional)
createdAt: DateTime
updatedAt: DateTime

Relations:
- tenant: Tenant (N:1)
- user: User (N:1)
- template: Template (optional, N:1)
- resourcePool: ResourcePool (optional, N:1)
- computeMachine: ComputeMachine (optional, N:1)
- virtualMachine: VirtualMachine (optional, 1:1)
- instanceSetMembers: InstanceSetMember[] (1:N)
- privateDataDiskAttachments: InstancePrivateDataDiskAttachment[] (1:N)
- ipAddresses: IpAddress[] (1:N)
- temporaryCloudBoxes: CloudBox[] (many)
```

#### Template
```typescript
id: UUID (PK)
name: String
description: String (optional)
useCase: TemplateUseCase (optional)
templateType: TemplateType (INSTANCE, INSTANCE_SET)
baseImageId: UUID (optional)
defaultCpuCores: Int
defaultMemoryGb: Int
defaultStorageGb: Int
defaultGpuCount: Int (default: 0)
defaultBandwidthGbps: Float (optional)
networkConfig: JSON (optional)
userData: String (optional)
tags: JSON (optional)
visibility: TemplateVisibility (PRIVATE, PUBLIC, GROUP_SPECIFIC)
ownerId: UUID (FK to User)
tenantId: UUID (FK to Tenant, optional)
version: String (default: "v1.0.0")
status: TemplateStatus (ACTIVE, DEPRECATED, ARCHIVED)
createdAt: DateTime
updatedAt: DateTime

Relations:
- owner: User (N:1)
- tenant: Tenant (optional, N:1)
- versions: TemplateVersion[] (1:N)
- instances: Instance[] (1:N)

TemplateUseCase Enum:
- AI_APPLICATION
- GRAPHICS_RENDERING
- GAMING_HIGH_PERFORMANCE
- LIGHTWEIGHT_OFFICE
- WEB_SERVER
- DATABASE
- DEVELOPMENT
- GENERAL

TemplateType Enum:
- INSTANCE
- INSTANCE_SET

TemplateVisibility Enum:
- PUBLIC
- PRIVATE
- GROUP_SPECIFIC

TemplateStatus Enum:
- ACTIVE
- DEPRECATED
- ARCHIVED

Constraints:
- UNIQUE(tenantId, name)
```

#### TemplateVersion
```typescript
id: UUID (PK)
templateId: UUID (FK to Template)
versionNumber: String
isLatest: Boolean (default: false)
configSnapshot: JSON
changelog: String (optional)
createdAt: DateTime
createdBy: UUID (FK to User)

Relations:
- template: Template (N:1)
- creator: User (N:1)

Constraints:
- UNIQUE(templateId, versionNumber)
```

#### ComputeMachine
```typescript
id: UUID (PK)
hostname: String
name: String
edgeDataCenterId: UUID (FK to EdgeDataCenter)
resourcePoolId: UUID (FK to ResourcePool)
machineType: ComputeMachineType (CPU_SERVER, PC_FARM, GPU_SERVER)
rentalMode: RentalMode (EXCLUSIVE, SHARED)
hypervisorType: HypervisorType (KVM, VMWARE, HYPER_V)
cpuCores: Int
memoryGb: Int
storageGb: Int
gpuCount: Int (optional, default: 0)
gpuModel: String (optional)
managementIp: String
businessIp: String (optional)
allocatedCpuCores: Int (default: 0)
allocatedMemoryGb: Int (default: 0)
allocatedStorageGb: Int (default: 0)
allocatedGpuCount: Int (default: 0)
status: ComputeMachineStatus (ACTIVE, MAINTENANCE, OFFLINE, DECOMMISSIONING)
healthStatus: HealthStatus (HEALTHY, WARNING, CRITICAL)
connectionConfig: JSON (optional)
tags: JSON (optional)
createdAt: DateTime
updatedAt: DateTime
lastHeartbeat: DateTime (optional)

Relations:
- edgeDataCenter: EdgeDataCenter (N:1)
- resourcePool: ResourcePool (N:1)
- virtualMachines: VirtualMachine[] (1:N)
- instances: Instance[] (1:N)

ComputeMachineType Enum:
- CPU_SERVER
- PC_FARM
- GPU_SERVER

HypervisorType Enum:
- KVM
- VMWARE
- HYPER_V

ComputeMachineStatus Enum:
- ACTIVE
- MAINTENANCE
- OFFLINE
- DECOMMISSIONING

HealthStatus Enum:
- HEALTHY
- WARNING
- CRITICAL

Constraints:
- UNIQUE(edgeDataCenterId, managementIp)
- UNIQUE(edgeDataCenterId, businessIp)
```

#### VirtualMachine
```typescript
id: UUID (PK)
computeMachineId: UUID (FK to ComputeMachine)
instanceId: UUID (FK to Instance, UNIQUE)
vmUuid: String (optional, UNIQUE)
vmName: String
cpuCores: Int
memoryGb: Int
storageGb: Int
gpuCount: Int (optional, default: 0)
status: VirtualMachineStatus (CREATING, STARTING, RUNNING, STOPPING, STOPPED, RESTARTING, ERROR, DELETED)
ipAddress: String (optional)
macAddress: String (optional)
config: JSON (optional)
createdAt: DateTime
updatedAt: DateTime

Relations:
- computeMachine: ComputeMachine (N:1)
- instance: Instance (1:1)

VirtualMachineStatus Enum:
- CREATING
- STARTING
- RUNNING
- STOPPING
- STOPPED
- RESTARTING
- ERROR
- DELETED
```

#### ResourcePool
```typescript
id: UUID (PK)
name: String
description: String (optional)
edgeDataCenterId: UUID (FK to EdgeDataCenter)
poolType: ResourcePoolType (COMPUTE, STORAGE, IP_ADDRESS)
schedulingPolicy: String (default: "load_balance")
status: ResourcePoolStatus (ACTIVE, MAINTENANCE, DISABLED)
totalCpuCores: Int (default: 0)
totalMemoryGb: Int (default: 0)
totalStorageGb: Int (default: 0)
totalGpuCount: Int (default: 0)
allocatedCpuCores: Int (default: 0)
allocatedMemoryGb: Int (default: 0)
allocatedStorageGb: Int (default: 0)
allocatedGpuCount: Int (default: 0)
subnetId: UUID (FK to Subnet, optional, UNIQUE)
ipPoolConfig: JSON (optional)
createdAt: DateTime
updatedAt: DateTime

Relations:
- edgeDataCenter: EdgeDataCenter (N:1)
- subnet: Subnet (optional, 1:1)
- computeMachines: ComputeMachine[] (1:N)
- instances: Instance[] (1:N)
- ipAddresses: IpAddress[] (1:N)

ResourcePoolType Enum:
- COMPUTE
- STORAGE
- IP_ADDRESS

ResourcePoolStatus Enum:
- ACTIVE
- MAINTENANCE
- DISABLED

Constraints:
- UNIQUE(edgeDataCenterId, name)
```

#### InstanceSet
```typescript
id: UUID (PK)
name: String
description: String (optional)
ownerId: UUID (FK to User)
tenantId: UUID (FK to Tenant)
userGroupId: UUID (FK to UserGroup, optional)
setType: InstanceSetType (PROJECT, DEPARTMENT, APPLICATION, TRAINING, CUSTOM)
status: InstanceSetStatus (ACTIVE, ARCHIVED, DELETED)
tags: JSON (optional)
createdAt: DateTime
updatedAt: DateTime
createdBy: UUID (FK to User, optional)
updatedBy: UUID (FK to User, optional)

Relations:
- owner: User (N:1)
- tenant: Tenant (N:1)
- userGroup: UserGroup (optional, N:1)
- members: InstanceSetMember[] (1:N)
- creator: User (optional, N:1)
- updater: User (optional, N:1)

InstanceSetType Enum:
- PROJECT
- DEPARTMENT
- APPLICATION
- TRAINING
- CUSTOM

InstanceSetStatus Enum:
- ACTIVE
- ARCHIVED
- DELETED

Constraints:
- UNIQUE(tenantId, name)
```

#### InstanceSetMember
```typescript
id: UUID (PK)
setId: UUID (FK to InstanceSet)
instanceId: UUID (FK to Instance)
role: String
joinedAt: DateTime
addedBy: UUID (FK to User, optional)

Relations:
- instanceSet: InstanceSet (N:1)
- instance: Instance (N:1)
- adder: User (optional, N:1)

Constraints:
- UNIQUE(setId, instanceId)
```

---

### 3. STORAGE & IMAGE MANAGEMENT (5 Models)

#### PrivateDataDisk
```typescript
id: UUID (PK)
name: String
tenantId: UUID (FK to Tenant)
userId: UUID (FK to User)
sizeGb: Int
diskType: PrivateDataDiskType (STANDARD, SSD, NVME)
status: PrivateDataDiskStatus (AVAILABLE, ATTACHED, CREATING, DELETING, ERROR)
shareMode: ShareMode (EXCLUSIVE, SHARED)
maxAttachments: Int (default: 1)
rbdImageName: String (UNIQUE)
rbdPool: String (default: "private-data-disks")
createdAt: DateTime
updatedAt: DateTime
createdBy: UUID (FK to User, optional)
updatedBy: UUID (FK to User, optional)

Relations:
- tenant: Tenant (N:1)
- user: User (N:1)
- attachments: InstancePrivateDataDiskAttachment[] (1:N)
- creator: User (optional, N:1)
- updater: User (optional, N:1)

PrivateDataDiskType Enum:
- STANDARD
- SSD
- NVME

PrivateDataDiskStatus Enum:
- AVAILABLE
- ATTACHED
- CREATING
- DELETING
- ERROR

ShareMode Enum:
- EXCLUSIVE
- SHARED
```

#### InstancePrivateDataDiskAttachment
```typescript
id: UUID (PK)
instanceId: UUID (FK to Instance)
diskId: UUID (FK to PrivateDataDisk)
mountPath: String
mountMode: MountMode (RW, RO)
attachedAt: DateTime
attachedBy: UUID (FK to User)
status: AttachmentStatus (ATTACHING, ATTACHED, DETACHING, FAILED)

Relations:
- instance: Instance (N:1)
- disk: PrivateDataDisk (N:1)
- attacher: User (N:1)

MountMode Enum:
- RW (Read-Write)
- RO (Read-Only)

AttachmentStatus Enum:
- ATTACHING
- ATTACHED
- DETACHING
- FAILED

Constraints:
- UNIQUE(instanceId, diskId)
```

#### Image
```typescript
id: UUID (PK)
name: String
description: String (optional)
imageType: ImageType (OS_BASE, APPLICATION_LAYER, CUSTOM)
baseOs: String (optional)
osVersion: String (optional)
architecture: String (optional)
sizeGb: Decimal (optional)
minCpuCores: Int (optional)
minMemoryGb: Int (optional)
minStorageGb: Int (optional)
recommendedCpuCores: Int (optional)
recommendedMemoryGb: Int (optional)
visibility: ImageVisibility (PUBLIC, PRIVATE, GROUP_SPECIFIC)
status: ImageStatus (ACTIVE, DEPRECATED, ARCHIVED)
fileServerId: UUID (optional)
filePath: String (optional)
checksumMd5: String (optional)
ownerId: UUID (FK to User)
tenantId: UUID (FK to Tenant, optional)
createdAt: DateTime
updatedAt: DateTime

Relations:
- owner: User (N:1)
- tenant: Tenant (optional, N:1)
- versions: ImageVersion[] (1:N)
- tags: ImageTag[] (1:N)

ImageType Enum:
- OS_BASE
- APPLICATION_LAYER
- CUSTOM

ImageVisibility Enum:
- PUBLIC
- PRIVATE
- GROUP_SPECIFIC

ImageStatus Enum:
- ACTIVE
- DEPRECATED
- ARCHIVED

Constraints:
- UNIQUE(tenantId, name)
```

#### ImageVersion
```typescript
id: UUID (PK)
imageId: UUID (FK to Image)
versionNumber: String
versionName: String (optional)
isLatest: Boolean (default: false)
isDefault: Boolean (default: false)
parentVersionId: UUID (FK to ImageVersion, optional)
sizeGb: Decimal (optional)
filePath: String (optional)
checksumMd5: String (optional)
releaseNotes: String (optional)
status: ImageVersionStatus (ACTIVE, DEPRECATED, ARCHIVED)
createdAt: DateTime
createdBy: UUID (FK to User)

Relations:
- image: Image (N:1)
- parentVersion: ImageVersion (optional, N:1)
- childVersions: ImageVersion[] (1:N)
- creator: User (N:1)
- tags: ImageTag[] (1:N)

ImageVersionStatus Enum:
- ACTIVE
- DEPRECATED
- ARCHIVED

Constraints:
- UNIQUE(imageId, versionNumber)
```

#### ImageTag
```typescript
id: UUID (PK)
imageId: UUID (FK to Image)
versionId: UUID (FK to ImageVersion)
tagName: String
isImmutable: Boolean (default: false)
createdAt: DateTime
updatedAt: DateTime

Relations:
- image: Image (N:1)
- version: ImageVersion (N:1)

Constraints:
- UNIQUE(imageId, tagName)
```

---

### 4. NETWORK MANAGEMENT (4 Models)

#### Vpc
```typescript
id: UUID (PK)
name: String
description: String (optional)
tenantId: UUID (FK to Tenant)
userId: UUID (FK to User)
cidrBlock: String
edgeDataCenterId: UUID (FK to EdgeDataCenter, optional)
vlanId: Int (optional)
enableDns: Boolean (default: true)
dnsServers: JSON (optional)
status: VpcStatus (ACTIVE, DISABLED, DELETED)
createdAt: DateTime
updatedAt: DateTime
createdBy: UUID (FK to User, optional)
updatedBy: UUID (FK to User, optional)

Relations:
- tenant: Tenant (N:1)
- user: User (N:1)
- edgeDataCenter: EdgeDataCenter (optional, N:1)
- subnets: Subnet[] (1:N)
- creator: User (optional, N:1)
- updater: User (optional, N:1)

VpcStatus Enum:
- ACTIVE
- DISABLED
- DELETED

Constraints:
- UNIQUE(tenantId, name)
```

#### Subnet
```typescript
id: UUID (PK)
name: String
vpcId: UUID (FK to Vpc)
cidrBlock: String
availabilityZone: String (optional)
gateway: String (optional)
vlanId: Int (optional)
isPublic: Boolean (default: false)
autoAssignIp: Boolean (default: true)
ipPoolId: UUID (FK to ResourcePool, optional, UNIQUE)
status: SubnetStatus (ACTIVE, DISABLED)
createdAt: DateTime
updatedAt: DateTime
createdBy: UUID (FK to User, optional)
updatedBy: UUID (FK to User, optional)

Relations:
- vpc: Vpc (N:1)
- place: Place (optional, 1:1)
- ipPool: ResourcePool (optional, 1:1)
- ipAddresses: IpAddress[] (1:N)
- creator: User (optional, N:1)
- updater: User (optional, N:1)

SubnetStatus Enum:
- ACTIVE
- DISABLED

Constraints:
- UNIQUE(vpcId, cidrBlock)
```

#### Place
```typescript
id: UUID (PK)
name: String
description: String (optional)
tenantId: UUID (FK to Tenant)
subnetId: UUID (FK to Subnet, optional, UNIQUE)
location: String (optional)
status: PlaceStatus (ACTIVE, INACTIVE, DISABLED)
createdAt: DateTime
updatedAt: DateTime
createdBy: UUID (FK to User, optional)
updatedBy: UUID (FK to User, optional)

Relations:
- tenant: Tenant (N:1)
- subnet: Subnet (optional, 1:1)
- creator: User (optional, N:1)
- updater: User (optional, N:1)

PlaceStatus Enum:
- ACTIVE
- INACTIVE
- DISABLED

Constraints:
- UNIQUE(tenantId, name)
```

#### IpAddress
```typescript
id: UUID (PK)
ipAddress: String (UNIQUE)
ipPoolId: UUID (FK to ResourcePool)
subnetId: UUID (FK to Subnet)
status: IpAddressStatus (AVAILABLE, ALLOCATED, RESERVED, FROZEN)
instanceId: UUID (FK to Instance, optional)
macAddress: String (optional)
allocatedAt: DateTime (optional)
allocatedBy: UUID (FK to User, optional)
leaseExpiresAt: DateTime (optional)
isRangeStart: Boolean (default: false)
rangeSize: Int (default: 1)
tags: JSON (optional)
createdAt: DateTime
updatedAt: DateTime

Relations:
- ipPool: ResourcePool (N:1)
- subnet: Subnet (N:1)
- instance: Instance (optional, N:1)
- allocator: User (optional, N:1)

IpAddressStatus Enum:
- AVAILABLE
- ALLOCATED
- RESERVED
- FROZEN
```

---

### 5. CLOUD HARDWARE (2 Models)

#### CloudBox
```typescript
id: UUID (PK)
name: String
serialNumber: String (UNIQUE)
networkId: UUID (optional)
status: CloudBoxStatus (ONLINE, OFFLINE, INITIALIZING, MAINTENANCE, ERROR)
ipAddress: String (optional)
macAddress: String (optional)
firmwareVersion: String (optional)
lastBootTime: DateTime (optional)
isDisabled: Boolean (default: false)
edgeDataCenterId: UUID (FK to EdgeDataCenter, optional)
createdAt: DateTime
updatedAt: DateTime
lastHeartbeat: DateTime (optional)
temporaryInstanceId: UUID (FK to Instance, optional)
temporaryBindExpiresAt: DateTime (optional)
model: String (optional)
manufacturer: String (optional)
hardwareConfig: JSON (optional)
location: String (optional)
assignedUserId: UUID (FK to User, optional)
tags: JSON (optional)
networkMode: String (optional)
gateway: String (optional)
dnsServers: JSON (optional)
subnetMask: String (optional)
cpuUsagePercent: Float (optional)
memoryUsagePercent: Float (optional)
diskUsagePercent: Float (optional)
temperature: Float (optional)
uptimeSeconds: Int (optional)

Relations:
- edgeDataCenter: EdgeDataCenter (optional, N:1)
- temporaryInstance: Instance (optional, N:1)
- assignedUser: User (optional, N:1)

CloudBoxStatus Enum:
- ONLINE
- OFFLINE
- INITIALIZING
- MAINTENANCE
- ERROR
```

#### EdgeDataCenter
```typescript
id: UUID (PK)
name: String (UNIQUE)
location: String (optional)
status: EdgeDataCenterStatus (ACTIVE, OFFLINE, MAINTENANCE)
networkConfig: JSON (optional)
totalCpuCores: Int (default: 0)
totalMemoryGb: Int (default: 0)
totalStorageGb: Int (default: 0)
totalGpuCount: Int (default: 0)
createdAt: DateTime
updatedAt: DateTime

Relations:
- resourcePools: ResourcePool[] (1:N)
- computeMachines: ComputeMachine[] (1:N)
- cloudBoxes: CloudBox[] (1:N)
- vpcs: Vpc[] (1:N)

EdgeDataCenterStatus Enum:
- ACTIVE
- OFFLINE
- MAINTENANCE
```

---

### 6. AUDIT & LOGGING (1 Model)

#### AuditLog
```typescript
id: UUID (PK)
userId: UUID (FK to User)
action: String
resourceType: String
resourceId: UUID (optional)
details: JSON (optional)
ipAddress: String (optional)
userAgent: String (optional)
status: String
createdAt: DateTime

Relations:
- user: User (N:1)
```

---

## Key Relationships

### One-to-Many (1:N)
- Tenant → User
- Tenant → UserGroup
- Tenant → Instance
- Tenant → Vpc
- Tenant → Place
- Tenant → Template
- Tenant → InstanceSet
- Tenant → Image
- Tenant → PrivateDataDisk
- User → UserGroupMember
- User → Instance
- User → PrivateDataDisk
- User → Vpc
- User → AuditLog
- UserGroup → UserGroupMember
- UserGroup → UserGroup (self-referencing hierarchical)
- EdgeDataCenter → ResourcePool
- EdgeDataCenter → ComputeMachine
- EdgeDataCenter → CloudBox
- EdgeDataCenter → Vpc
- ResourcePool → ComputeMachine
- ResourcePool → Instance
- ResourcePool → IpAddress
- ComputeMachine → VirtualMachine
- ComputeMachine → Instance
- Template → TemplateVersion
- Template → Instance
- Vpc → Subnet
- Subnet → Place
- Subnet → IpAddress
- Image → ImageVersion
- Image → ImageTag
- ImageVersion → ImageTag
- ImageVersion → ImageVersion (self-referencing parent-child)
- InstanceSet → InstanceSetMember
- PrivateDataDisk → InstancePrivateDataDiskAttachment
- Permission → RolePermission

### One-to-One (1:1)
- Instance ↔ VirtualMachine
- ComputeMachine ↔ ... (through rentalMode)
- ResourcePool ↔ Subnet (optional)
- Place ↔ Subnet (optional)
- CloudBox ↔ Instance (temporary binding)

### Many-to-Many (N:N)
- User ↔ UserGroup (through UserGroupMember)
- UserRole ↔ Permission (through RolePermission)
- Instance ↔ PrivateDataDisk (through InstancePrivateDataDiskAttachment)
- InstanceSet ↔ Instance (through InstanceSetMember)

---

## Database Design Notes

1. **UUID Primary Keys**: All tables use UUID as primary key for distributed systems support

2. **Timestamps**: All models include `createdAt` and `updatedAt` for audit trail

3. **Soft Deletes**: Implemented via status enums rather than explicit delete flags

4. **Multi-Tenancy**: `tenantId` present in all tenant-scoped models

5. **User Tracking**: `createdBy` and `updatedBy` fields track user actions

6. **JSON Fields**: Used for flexible, semi-structured data (config, tags, metadata)

7. **Enumeration Types**: All status and type fields use PostgreSQL enums for type safety

8. **Foreign Keys**: Proper cascading rules (CASCADE, Restrict, SetNull) for data integrity

9. **Indexes**: Indexes on frequently queried fields (status, tenantId, userId, etc.)

10. **Constraints**: Unique constraints prevent duplicate data entry

