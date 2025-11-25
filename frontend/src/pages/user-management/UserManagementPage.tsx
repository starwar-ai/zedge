import { useState, useEffect, useMemo, useCallback } from 'react'
import { createColumnHelper } from '@tanstack/react-table'
import { SearchInput, TableTextCell, TableEnumCell, TableActionCell } from '@/components/ui'
import { Edit, Trash2 } from 'lucide-react'
import { User, UserStatus, UserStatusLabels, UserRoleType, UserRoleLabels } from '@/types/user'
import { CreateButton } from '@/components/features/buttons/FigmaButtons'
import { usePageHeader } from '@/components/layout/MainLayout'
import {
  TanStackDataTable,
  FilterCondition,
  ColumnSetting,
  ColumnDef as TableColumnDef,
} from '@/components/features/table'
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

// Type for User with index signature for table compatibility
type UserRecord = User & Record<string, unknown>

const columnHelper = createColumnHelper<UserRecord>()

// ============================================================================
// Column Definitions for Filter & Settings
// ============================================================================

const allTableColumns: TableColumnDef[] = [
  { id: 'id', label: '用户编号' },
  { id: 'username', label: '用户名' },
  { id: 'phone', label: '联系手机' },
  { id: 'status', label: '状态' },
  { id: 'role', label: '角色' },
  { id: 'organization', label: '租户' },
  { id: 'userGroup', label: '用户组' },
  { id: 'lastLoginTime', label: '最近登录时间' },
]

const defaultColumnSettings: ColumnSetting[] = [
  { id: 'id' },
  { id: 'username' },
  { id: 'phone' },
  { id: 'status' },
  { id: 'role' },
  { id: 'organization' },
  { id: 'userGroup' },
  { id: 'lastLoginTime' },
]

export function UserManagementPage() {
  const { setHeader } = usePageHeader()

  // Search state
  const [userIdSearch, setUserIdSearch] = useState('')
  const [usernameSearch, setUsernameSearch] = useState('')

  // Selection state
  const [selectedRowKeys, setSelectedRowKeys] = useState<string[]>([])

  // Advanced filter state
  const [advancedFilters, setAdvancedFilters] = useState<FilterCondition[]>([])
  const [filterLogic, setFilterLogic] = useState<'and' | 'or'>('and')

  // Column settings state
  const [columnSettings, setColumnSettings] = useState<ColumnSetting[]>(defaultColumnSettings)

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

  // Filter handler
  const handleFilter = useCallback((conditions: FilterCondition[], logic: 'and' | 'or') => {
    setAdvancedFilters(conditions)
    setFilterLogic(logic)
    // TODO: Apply filters to query
    console.log('Filter conditions:', conditions, 'Logic:', logic)
  }, [])

  // Reset handler
  const handleReset = useCallback(() => {
    setUserIdSearch('')
    setUsernameSearch('')
    setAdvancedFilters([])
    setFilterLogic('and')
  }, [])

  // Set page header actions
  useEffect(() => {
    setHeader({
      action: <CreateButton onClick={handleCreate}>新建</CreateButton>,
    })
  }, [setHeader])

  const columns = useMemo(
    () => [
      columnHelper.accessor('id', {
        header: () => '用户编号',
        enableSorting: true,
        cell: ({ getValue }) => (
          <TableTextCell>{getValue() as string}</TableTextCell>
        ),
      }),
      columnHelper.accessor('username', {
        header: () => '用户名',
        enableSorting: true,
        cell: ({ getValue }) => (
          <TableTextCell>{getValue() as string}</TableTextCell>
        ),
      }),
      columnHelper.accessor('phone', {
        header: () => '联系手机',
        cell: ({ getValue }) => (
          <TableTextCell>{getValue() as string}</TableTextCell>
        ),
      }),
      columnHelper.accessor('status', {
        header: () => '状态',
        enableSorting: true,
        cell: ({ getValue }) => {
          const status = getValue() as UserStatus
          return (
            <TableEnumCell variant={status === UserStatus.ACTIVE ? 'success' : 'default'}>
              {UserStatusLabels[status]}
            </TableEnumCell>
          )
        },
      }),
      columnHelper.accessor('role', {
        header: () => '角色',
        cell: ({ getValue }) => {
          const role = getValue() as UserRoleType
          return (
            <TableTextCell>{UserRoleLabels[role]}</TableTextCell>
          )
        },
      }),
      columnHelper.accessor('organization', {
        header: () => '租户',
        enableSorting: true,
        cell: ({ getValue }) => (
          <TableTextCell>{getValue() as string}</TableTextCell>
        ),
      }),
      columnHelper.accessor('userGroup', {
        header: () => '用户组',
        cell: ({ getValue }) => (
          <TableTextCell>{getValue() as string}</TableTextCell>
        ),
      }),
      columnHelper.accessor('lastLoginTime', {
        header: () => '最近登录时间',
        enableSorting: true,
        cell: ({ getValue }) => (
          <TableTextCell>{getValue() as string}</TableTextCell>
        ),
      }),
      columnHelper.display({
        id: 'actions',
        header: () => '操作',
        cell: ({ row }) => (
          <TableActionCell
            actions={[
              {
                key: 'view',
                label: '详情',
                onClick: () => handleUserDetail(row.original),
              },
            ]}
            moreActions={[
              {
                key: 'edit',
                label: '编辑',
                icon: <Edit className="w-4 h-4" />,
                onClick: () => handleUserEdit(row.original),
              },
              {
                key: 'delete',
                label: '删除',
                icon: <Trash2 className="w-4 h-4" />,
                danger: true,
                onClick: () => handleUserDelete(row.original),
              },
            ]}
          />
        ),
      }),
    ],
    [handleUserDelete, handleUserDetail, handleUserEdit]
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
        <TanStackDataTable<UserRecord>
          data={users as UserRecord[]}
          columns={columns}
          rowKey="id"
          selectable
          selectedRowKeys={selectedRowKeys}
          onSelectionChange={handleSelectionChange}
          toolbar={toolbar}
          loading={isLoading || isFetching}
          error={error instanceof Error ? error.message : null}
          onRefresh={handleRefresh}
          onReset={handleReset}
          batchActions={[
            {
              key: 'delete',
              label: '批量删除',
              onClick: handleBatchDelete,
              variant: 'danger',
            },
          ]}
          filterProps={{
            columns: allTableColumns.map((col) => ({
              ...col,
              type: col.id === 'status' ? 'enum' : 'text',
              enumOptions:
                col.id === 'status'
                  ? [
                      { label: '正常', value: 'active' },
                      { label: '禁用', value: 'inactive' },
                    ]
                  : undefined,
            })),
            onFilter: handleFilter,
            initialConditions: advancedFilters,
            initialLogic: filterLogic,
          }}
          settingProps={{
            allColumns: allTableColumns,
            value: columnSettings,
            defaultValue: defaultColumnSettings,
            onSave: setColumnSettings,
          }}
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
