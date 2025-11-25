import { useState, useEffect, useMemo, useCallback } from 'react'
import { SearchInput } from '@/components/ui'
import { User, UserStatus, UserStatusLabels, UserRoleType, UserRoleLabels } from '@/types/user'
import { CreateButton } from '@/components/features/buttons/FigmaButtons'
import { usePageHeader } from '@/components/layout/MainLayout'
import { DataTable, DataTableColumn, DataTableAction } from '@/components/features/table/DataTable'
import { useUsersQuery } from '@/services/users'

/**
 * User Management Page
 * Figma reference: https://www.figma.com/design/kOzUFxGwYftvVD97zYoTJM/Desk?node-id=230-1863
 *
 * Features:
 * - User list table with sorting and selection
 * - Search by user ID and username
 * - Advanced filtering
 * - Pagination
 * - Action menu for each user
 */

// Type for User with index signature for DataTable compatibility
type UserRecord = User & Record<string, unknown>

export function UserManagementPage() {
  const { setHeader } = usePageHeader()

  // Search state
  const [userIdSearch, setUserIdSearch] = useState('')
  const [usernameSearch, setUsernameSearch] = useState('')

  // Selection state
  const [selectedRowKeys, setSelectedRowKeys] = useState<string[]>([])

  const {
    data: users = [],
    isLoading,
    isFetching,
    refetch,
    error,
  } = useUsersQuery({
    searchId: userIdSearch,
    searchName: usernameSearch,
  })

  // Action handlers
  const handleCreate = () => {
    // TODO: Open create user modal
  }

  const handleUserDetail = (user: UserRecord) => {
    // TODO: Open user details modal/page
    console.log('View user details:', user.id)
  }

  const handleUserEdit = (user: UserRecord) => {
    // TODO: Open edit user modal
    console.log('Edit user:', user.id)
  }

  const handleUserDelete = (user: UserRecord) => {
    // TODO: Show delete confirmation
    console.log('Delete user:', user.id)
  }

  const handleBatchDelete = (ids: string[]) => {
    // TODO: Show batch delete confirmation
    console.log('Batch delete users:', ids)
  }

  const handleRefresh = () => {
    refetch()
  }

  // Set page header actions
  useEffect(() => {
    setHeader({
      action: <CreateButton onClick={handleCreate}>新建</CreateButton>,
    })
  }, [setHeader])

  // Column definitions
  const columns: DataTableColumn<UserRecord>[] = useMemo(
    () => [
      {
        id: 'id',
        key: 'id',
        label: '用户编号',
        width: 120,
        sortable: true,
        type: 'text',
      },
      {
        id: 'username',
        key: 'username',
        label: '用户名',
        width: 120,
        sortable: true,
        type: 'text',
      },
      {
        id: 'phone',
        key: 'phone',
        label: '联系手机',
        width: 140,
        type: 'text',
      },
      {
        id: 'status',
        key: 'status',
        label: '状态',
        width: 80,
        type: 'enum',
        enumOptions: [
          { label: UserStatusLabels[UserStatus.ACTIVE], value: UserStatus.ACTIVE },
          { label: UserStatusLabels[UserStatus.INACTIVE], value: UserStatus.INACTIVE },
        ],
        enumVariant: (value) => (value === UserStatus.ACTIVE ? 'success' : 'default'),
        render: (value) => UserStatusLabels[value as UserStatus] || String(value),
      },
      {
        id: 'role',
        key: 'role',
        label: '角色',
        width: 120,
        type: 'enum',
        enumOptions: [
          { label: UserRoleLabels[UserRoleType.ADMIN], value: UserRoleType.ADMIN },
          { label: UserRoleLabels[UserRoleType.TENANT_ADMIN], value: UserRoleType.TENANT_ADMIN },
          { label: UserRoleLabels[UserRoleType.OPERATOR], value: UserRoleType.OPERATOR },
          { label: UserRoleLabels[UserRoleType.USER], value: UserRoleType.USER },
        ],
        render: (value) => UserRoleLabels[value as UserRoleType] || String(value),
      },
      {
        id: 'organization',
        key: 'organization',
        label: '租户',
        width: 150,
        type: 'text',
        sortable: true,
      },
      {
        id: 'userGroup',
        key: 'userGroup',
        label: '用户组',
        width: 200,
        type: 'text',
      },
      {
        id: 'lastLoginTime',
        key: 'lastLoginTime',
        label: '最近登录时间',
        width: 170,
        type: 'date',
        sortable: true,
      },
    ],
    []
  )

  // Row actions
  const actions: DataTableAction<UserRecord>[] = useMemo(
    () => [
      {
        key: 'detail',
        label: '详情',
        onClick: handleUserDetail,
      },
      {
        key: 'edit',
        label: '编辑',
        onClick: handleUserEdit,
      },
      {
        key: 'delete',
        label: '删除',
        onClick: handleUserDelete,
      },
    ],
    []
  )

  // Selection change handler
  const handleSelectionChange = useCallback((keys: string[]) => {
    setSelectedRowKeys(keys)
  }, [])

  // Toolbar with search inputs
  const toolbar = (
    <div className="flex items-center gap-2">
      <SearchInput
        placeholder="用户编号"
        value={userIdSearch}
        onChange={(e) => setUserIdSearch(e.target.value)}
      />
      <SearchInput
        placeholder="用户名称"
        value={usernameSearch}
        onChange={(e) => setUsernameSearch(e.target.value)}
      />
    </div>
  )

  return (
    <div className="flex flex-col gap-3 h-full">
      {/* Table Panel */}
      <div className="border border-[#f5f5f5] rounded-[10px] p-3 flex-1">
        <DataTable<UserRecord>
          data={users as UserRecord[]}
          columns={columns}
          rowKey="id"
          selectable
          selectedRowKeys={selectedRowKeys}
          onSelectionChange={handleSelectionChange}
          actions={actions}
          toolbar={toolbar}
          loading={isLoading || isFetching}
          error={error instanceof Error ? error.message : null}
          onRefresh={handleRefresh}
          filterable
          columnSettings
          batchActions={[
            {
              key: 'delete',
              label: '批量删除',
              onClick: handleBatchDelete,
              variant: 'danger',
            },
          ]}
          pagination={{
            showPageSize: true,
            showGoto: true,
          }}
          empty={{
            title: '暂无用户数据',
            description: '点击右上角"新建"按钮创建用户',
          }}
        />
      </div>
    </div>
  )
}
