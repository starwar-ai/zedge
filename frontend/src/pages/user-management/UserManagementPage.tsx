import { useState, useEffect, useMemo, useCallback } from 'react'
import { createColumnHelper } from '@tanstack/react-table'
import { SearchInput, TableTextCell, TableEnumCell } from '@/components/ui'
import { User, UserStatus, UserStatusLabels, UserRoleType, UserRoleLabels } from '@/types/user'
import { CreateButton } from '@/components/features/buttons/FigmaButtons'
import { usePageHeader } from '@/components/layout/MainLayout'
import { TanStackDataTable } from '@/components/features/table'
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
          <TableTextCell>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => handleUserDetail(row.original)}
                className="text-[14px] text-black hover:text-primary-600 transition-colors"
              >
                详情
              </button>
              <div className="w-px h-[11px] bg-[#d9d9d9]" />
              <button
                type="button"
                onClick={() => handleUserEdit(row.original)}
                className="text-[14px] text-black hover:text-primary-600 transition-colors"
              >
                编辑
              </button>
              <div className="w-px h-[11px] bg-[#d9d9d9]" />
              <button
                type="button"
                onClick={() => handleUserDelete(row.original)}
                className="text-[14px] text-black hover:text-error-600 transition-colors"
              >
                删除
              </button>
            </div>
          </TableTextCell>
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
