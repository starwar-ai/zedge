# 网络管理用例 (Network Management Use Cases)

## 模块概述

网络管理模块负责VPC、子网、IP地址和安全组的管理，实现租户网络隔离。

**相关实体**: VPC, Subnet, Network, IpAddress, SecurityGroup
**主要服务**: VpcService, SubnetService, IpAddressService
**API路由**: `/api/v1/vpcs`, `/api/v1/subnets`, `/api/v1/networks`

---

## VPC管理用例

### UC-NETWORK-001: 创建VPC
**参与者**: 租户管理员、系统管理员
**前置条件**:
- 拥有`vpcs:create`权限

**主要流程**:
1. 用户提交VPC创建请求
2. 系统验证CIDR不冲突
3. 系统继承租户的VLAN ID
4. 系统创建VPC记录
5. 系统创建默认路由表

**API端点**: `POST /api/v1/vpcs`

**请求示例**:
```json
{
  "name": "生产环境VPC",
  "cidrBlock": "10.0.0.0/16",
  "description": "生产环境网络"
}
```

---

### UC-NETWORK-002: 创建子网
**参与者**: 租户管理员
**前置条件**:
- VPC已存在
- CIDR在VPC范围内

**主要流程**:
1. 用户提交子网创建请求
2. 系统验证CIDR在VPC范围内
3. 系统验证CIDR不与其他子网冲突
4. 系统创建子网记录
5. 系统初始化IP地址池

**API端点**: `POST /api/v1/vpcs/:vpcId/subnets`

---

### UC-NETWORK-003: 分配IP地址
**参与者**: 实例服务（内部调用）
**前置条件**:
- 子网有可用IP地址

**主要流程**:
1. 实例启动时请求分配IP
2. 系统从子网IP池中选择可用IP
3. 系统创建IP地址记录
4. 系统关联IP到实例
5. 系统返回IP地址

**API端点**: `POST /api/v1/subnets/:subnetId/allocate-ip`

---

### UC-NETWORK-004: 释放IP地址
**参与者**: 实例服务（内部调用）
**前置条件**:
- IP地址已分配

**主要流程**:
1. 实例停止时请求释放IP
2. 系统解除IP与实例的关联
3. 系统更新IP状态为available
4. 系统返回成功响应

**API端点**: `POST /api/v1/ip-addresses/:ipId/release`

---

### UC-NETWORK-005: 创建安全组
**参与者**: 租户管理员
**前置条件**:
- 拥有`securityGroups:create`权限

**主要流程**:
1. 用户提交安全组创建请求
2. 系统创建安全组记录
3. 系统创建默认拒绝规则
4. 系统返回安全组信息

**API端点**: `POST /api/v1/security-groups`

---

### UC-NETWORK-006: 添加安全组规则
**参与者**: 租户管理员
**前置条件**:
- 安全组已存在

**主要流程**:
1. 用户提交规则（协议、端口、源IP）
2. 系统验证规则合法性
3. 系统添加规则到安全组
4. 系统应用规则到关联的实例

**API端点**: `POST /api/v1/security-groups/:groupId/rules`

**请求示例**:
```json
{
  "direction": "ingress",
  "protocol": "tcp",
  "portRange": "22-22",
  "sourceCidr": "0.0.0.0/0",
  "action": "allow"
}
```

---

## 网络隔离

### VLAN隔离机制
- 每个租户分配唯一VLAN ID
- 租户的所有VPC继承租户VLAN
- 不同租户的网络在二层完全隔离

### 网络架构
```
租户A (VLAN 100)
  ├── VPC-1 (10.0.0.0/16)
  │   ├── Subnet-1 (10.0.1.0/24)
  │   └── Subnet-2 (10.0.2.0/24)
  └── VPC-2 (172.16.0.0/16)

租户B (VLAN 101)
  └── VPC-1 (10.0.0.0/16)  ← 即使CIDR相同，也不会冲突
```

---

## 相关文档
- [租户管理用例](02_tenant_usecases.md)
- [实例管理用例](04_instance_usecases.md)
- [领域模型 - 网络管理](../domain_model.md#5-网络管理)
