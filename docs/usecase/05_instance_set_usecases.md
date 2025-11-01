# 实例集管理用例 (Instance Set Management Use Cases)

## 模块概述

实例集管理模块负责实例集合的创建、成员管理和批量操作，特别支持教学场景的批量实例创建。

**相关实体**: InstanceSet, Instance, User, UserGroup
**主要服务**: InstanceSetService
**API路由**: `/api/v1/instance-sets`

---

## 用例列表

### UC-INSTANCESET-001: 创建实例集
**参与者**: 老师、租户管理员
**前置条件**:
- 拥有`instanceSets:create`权限

**主要流程**:
1. 老师提交实例集信息（名称、类型、用户组）
2. 系统验证用户权限
3. 系统验证用户组存在（如果指定）
4. 系统创建实例集记录（状态: active）
5. 系统返回实例集信息

**后置条件**:
- 实例集已创建
- 可以添加实例到集合

**API端点**: `POST /api/v1/instance-sets`

**请求示例**:
```json
{
  "name": "Java开发实训课程",
  "description": "2025年春季Java开发实训",
  "setType": "training",
  "userGroupId": "group-uuid"
}
```

---

### UC-INSTANCESET-002: 批量创建实例（教学场景）
**参与者**: 老师、租户管理员
**前置条件**:
- 拥有`instanceSets:update`权限
- 实例集已创建
- 学生用户已创建

**主要流程**:
1. 老师提交批量创建请求
2. 系统验证老师权限
3. 系统验证实例集存在
4. 系统验证镜像存在

   **创建老师实例（可选）**:
   - 验证老师用户配额
   - 使用老师指定的配置创建实例
   - 设置owner_id为老师用户ID
   - 添加实例到实例集（角色: teacher）
   - 占用老师用户的配额

   **批量创建学生实例**:
   - 遍历学生用户列表
   - 对每个学生：
     * 验证学生用户存在且属于同一租户
     * 验证学生用户配额
     * 使用统一配置创建实例
     * 设置owner_id为学生用户ID
     * 添加实例到实例集（角色: student）
     * 占用学生用户的配额
   - 记录创建成功和失败的实例

5. 系统返回批量创建结果

**后置条件**:
- 老师实例已创建（如果有）
- 学生实例已批量创建
- 所有实例已添加到实例集
- 每个用户配额已更新

**异常流程**:
- E1: 某个学生配额不足 → 该学生实例创建失败，其他继续
- E2: 镜像不存在 → 返回400错误

**API端点**: `POST /api/v1/instance-sets/:setId/batch-create-instances`

**请求示例**:
```json
{
  "imageId": "image-uuid",
  "teacherInstance": {
    "userId": "teacher-user-uuid",
    "name": "老师实例",
    "config": {
      "cpuCores": 8,
      "memoryGb": 16,
      "storageGb": 200
    }
  },
  "studentInstances": {
    "config": {
      "cpuCores": 4,
      "memoryGb": 8,
      "storageGb": 100
    },
    "students": [
      {"userId": "student1-uuid", "name": "学生1实例"},
      {"userId": "student2-uuid", "name": "学生2实例"},
      {"userId": "student3-uuid", "name": "学生3实例"}
    ]
  }
}
```

**响应示例**:
```json
{
  "setId": "set-uuid",
  "totalRequested": 4,
  "successCount": 3,
  "failureCount": 1,
  "results": {
    "teacher": {
      "success": true,
      "instanceId": "teacher-instance-uuid"
    },
    "students": [
      {"userId": "student1-uuid", "success": true, "instanceId": "instance-uuid-1"},
      {"userId": "student2-uuid", "success": true, "instanceId": "instance-uuid-2"},
      {"userId": "student3-uuid", "success": false, "error": "配额不足"}
    ]
  }
}
```

---

### UC-INSTANCESET-003: 添加实例到实例集
**参与者**: 老师、租户管理员
**前置条件**:
- 拥有`instanceSets:update`权限
- 实例存在且属于同一租户

**主要流程**:
1. 老师提交添加请求
2. 系统验证权限
3. 系统验证实例存在
4. 系统验证实例未在该实例集中
5. 系统创建成员关系记录
6. 系统返回成功响应

**API端点**: `POST /api/v1/instance-sets/:setId/members`

**请求示例**:
```json
{
  "instanceId": "instance-uuid",
  "role": "student"
}
```

---

### UC-INSTANCESET-004: 从实例集移除实例
**参与者**: 老师、租户管理员
**前置条件**:
- 拥有`instanceSets:update`权限

**主要流程**:
1. 老师请求移除实例
2. 系统验证权限
3. 系统验证成员关系存在
4. 系统删除成员关系记录
5. 系统返回成功响应

**后置条件**:
- 实例已从实例集移除
- 实例本身未删除

**API端点**: `DELETE /api/v1/instance-sets/:setId/members/:instanceId`

---

### UC-INSTANCESET-005: 查询实例集列表
**参与者**: 老师、学生、租户管理员
**前置条件**:
- 用户已认证

**主要流程**:
1. 用户请求实例集列表
2. 系统验证权限
3. 系统应用权限过滤：
   - 老师：看自己创建的实例集
   - 学生：看自己所属的实例集
   - 租户管理员：看租户内所有实例集
4. 系统应用筛选条件（类型、状态）
5. 系统统计每个实例集的实例数量
6. 系统返回实例集列表

**API端点**: `GET /api/v1/instance-sets`

---

### UC-INSTANCESET-006: 查询实例集详情
**参与者**: 老师、学生、租户管理员
**前置条件**:
- 用户有访问权限

**主要流程**:
1. 用户请求实例集详细信息
2. 系统验证权限
3. 系统查询实例集基本信息
4. 系统查询实例集成员列表（含角色）
5. 系统查询每个实例的状态
6. 系统返回详细信息

**API端点**: `GET /api/v1/instance-sets/:setId`

**响应示例**:
```json
{
  "setId": "set-uuid",
  "name": "Java开发实训课程",
  "description": "2025年春季Java开发实训",
  "setType": "training",
  "status": "active",
  "ownerId": "teacher-user-uuid",
  "tenantId": "tenant-uuid",
  "members": [
    {
      "instanceId": "teacher-instance-uuid",
      "instanceName": "老师实例",
      "role": "teacher",
      "status": "running",
      "userId": "teacher-user-uuid",
      "userName": "张老师",
      "joinedAt": "2025-01-15T10:00:00Z"
    },
    {
      "instanceId": "student1-instance-uuid",
      "instanceName": "学生1实例",
      "role": "student",
      "status": "stopped",
      "userId": "student1-uuid",
      "userName": "李四",
      "joinedAt": "2025-01-15T10:05:00Z"
    }
  ],
  "stats": {
    "totalMembers": 31,
    "teacherCount": 1,
    "studentCount": 30,
    "runningCount": 15,
    "stoppedCount": 16
  },
  "createdAt": "2025-01-15T10:00:00Z"
}
```

---

### UC-INSTANCESET-007: 批量启动实例集成员
**参与者**: 老师、租户管理员
**前置条件**:
- 拥有`instanceSets:update`权限
- 有足够的算力资源

**主要流程**:
1. 老师请求批量启动实例集内的实例
2. 系统验证权限
3. 系统查询实例集的所有stopped状态实例
4. 系统验证算力资源充足性
5. 系统批量启动实例（异步）
6. 系统返回启动任务ID

**后置条件**:
- 实例集内的实例正在启动
- 可以查询启动进度

**API端点**: `POST /api/v1/instance-sets/:setId/start-all`

**请求示例**:
```json
{
  "resourcePoolId": "pool-uuid",
  "rentalMode": "shared",
  "filter": {
    "role": "student"
  }
}
```

---

### UC-INSTANCESET-008: 批量停止实例集成员
**参与者**: 老师、租户管理员
**前置条件**:
- 拥有`instanceSets:update`权限

**主要流程**:
1. 老师请求批量停止实例集内的实例
2. 系统验证权限
3. 系统查询实例集的所有running状态实例
4. 系统批量停止实例（异步）
5. 系统返回停止任务ID

**后置条件**:
- 实例集内的实例正在停止

**API端点**: `POST /api/v1/instance-sets/:setId/stop-all`

---

### UC-INSTANCESET-009: 查询用户所属实例集（学生视角）
**参与者**: 学生
**前置条件**:
- 用户已认证

**主要流程**:
1. 学生请求自己所属的实例集
2. 系统查询包含该学生实例的所有实例集
3. 系统为每个实例集查询该学生的实例
4. 系统查询实例状态
5. 系统返回实例集列表

**后置条件**:
- 学生获得自己所属的实例集和实例信息

**API端点**: `GET /api/v1/users/me/instance-sets`

**响应示例**:
```json
{
  "data": [
    {
      "setId": "set-uuid",
      "setName": "Java开发实训课程",
      "setType": "training",
      "myRole": "student",
      "myInstances": [
        {
          "instanceId": "instance-uuid",
          "instanceName": "学生1实例",
          "status": "stopped",
          "canStart": true
        }
      ],
      "teacher": {
        "userId": "teacher-uuid",
        "userName": "张老师"
      }
    }
  ]
}
```

---

### UC-INSTANCESET-010: 归档实例集
**参与者**: 老师、租户管理员
**前置条件**:
- 拥有`instanceSets:update`权限

**主要流程**:
1. 老师请求归档实例集（课程结束后）
2. 系统验证权限
3. 系统更新实例集状态为archived
4. 系统返回成功响应

**后置条件**:
- 实例集状态为archived
- 归档的实例集不在常规查询中显示
- 实例和数据保留

**API端点**: `POST /api/v1/instance-sets/:setId/archive`

---

### UC-INSTANCESET-011: 删除实例集
**参与者**: 老师、租户管理员
**前置条件**:
- 拥有`instanceSets:delete`权限

**主要流程**:
1. 老师请求删除实例集
2. 系统验证权限
3. 系统删除所有成员关系记录
4. 系统删除实例集记录
5. 系统返回成功响应

**后置条件**:
- 实例集已删除
- 成员关系已解除
- 集内实例未删除（仍归用户所有）

**API端点**: `DELETE /api/v1/instance-sets/:setId`

---

## 教学场景完整流程

### 课前准备
1. 老师创建实例集（UC-INSTANCESET-001）
2. 老师批量创建实例（UC-INSTANCESET-002）
   - 创建老师实例（高配）
   - 批量创建学生实例（标准配）
3. 管理员为云盒临时绑定学生实例（见云盒管理用例）

### 上课时
4. 学生云盒启动，自动连接绑定的实例
5. 老师通过实例集批量启动所有学生实例（UC-INSTANCESET-007）
6. 学生和老师使用云电脑进行实训

### 下课后
7. 老师批量停止学生实例（UC-INSTANCESET-008）
8. 管理员解除云盒临时绑定
9. 课程结束后，老师归档实例集（UC-INSTANCESET-010）

---

## 实例集类型

| 类型 | 说明 | 典型用途 |
|-----|------|---------|
| project | 项目集 | 协作项目的实例分组 |
| department | 部门集 | 部门资源隔离 |
| application | 应用集 | 同一应用的多个实例 |
| training | 实训集 | 教学实训课程 |
| custom | 自定义集 | 其他场景 |

---

## 权限矩阵

| 用例 | 超级管理员 | 租户管理员 | 老师 | 学生 |
|-----|----------|----------|------|------|
| UC-INSTANCESET-001 创建实例集 | ✓ | ✓ | ✓ | ✗ |
| UC-INSTANCESET-002 批量创建实例 | ✓ | ✓ | ✓ (自己的集) | ✗ |
| UC-INSTANCESET-003 添加实例 | ✓ | ✓ | ✓ (自己的集) | ✗ |
| UC-INSTANCESET-004 移除实例 | ✓ | ✓ | ✓ (自己的集) | ✗ |
| UC-INSTANCESET-005 查询列表 | ✓ | ✓ (租户内) | ✓ (自己的) | ✓ (所属的) |
| UC-INSTANCESET-006 查询详情 | ✓ | ✓ (租户内) | ✓ (自己的) | ✓ (所属的) |
| UC-INSTANCESET-007 批量启动 | ✓ | ✓ | ✓ (自己的集) | ✗ |
| UC-INSTANCESET-008 批量停止 | ✓ | ✓ | ✓ (自己的集) | ✗ |
| UC-INSTANCESET-009 查询所属集 | ✓ | ✓ | ✓ | ✓ |
| UC-INSTANCESET-010 归档实例集 | ✓ | ✓ | ✓ (自己的集) | ✗ |
| UC-INSTANCESET-011 删除实例集 | ✓ | ✓ | ✓ (自己的集) | ✗ |

---

## 相关文档
- [实例管理用例](04_instance_usecases.md)
- [云盒管理用例](09_cloudbox_usecases.md)
- [领域模型 - 实例集管理](../domain_model.md#22-实例集)
- [领域模型 - 教学场景流程](../domain_model.md#25-教学场景流程)
