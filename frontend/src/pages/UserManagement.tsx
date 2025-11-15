import { useState } from 'react'
import {
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableHeaderCell,
  TableTextCell,
  TableSelectCell,
  TableEnumCell,
  TableActionCell,
  Input,
  Select,
  Pagination,
} from '@/components/ui'
import { CreateButton, FilterButton, ResetButton } from '@/components/features/buttons/FigmaButtons'
import { User, UserStatus, UserStatusLabels, UserRoleLabels } from '@/types/user'

/**
 * User Management Page
 * Figma reference: https://www.figma.com/design/s3szBzWOPmpdq0EZg9PwKj/DeskPro?node-id=230-1863
 *
 * Features:
 * - User list table with sorting and selection
 * - Search by user ID and username
 * - Pagination
 * - Filter and reset functionality
 * - Action menu for each user
 */

// Mock data for demonstration
const mockUsers: User[] = [
  {
    id: '009-33',
    username: '001',
    phone: '13818216424',
    status: UserStatus.ACTIVE,
    role: 'operator' as any,
    organization: '山东科技大学',
    userGroup: '计算机学院/2022年级',
    lastLoginTime: '2025-11-10 12:00',
  },
  {
    id: '009-34',
    username: '学生002',
    phone: '13818216425',
    status: UserStatus.ACTIVE,
    role: 'operator' as any,
    organization: '山东科技大学',
    userGroup: '电子工程学院/2022年级',
    lastLoginTime: '2025-12-15 14:00',
  },
  {
    id: '009-35',
    username: '学生003',
    phone: '13818216426',
    status: UserStatus.ACTIVE,
    role: 'operator' as any,
    organization: '山东科技大学',
    userGroup: '机械工程学院/2022年级',
    lastLoginTime: '2025-09-20 10:30',
  },
  {
    id: '009-36',
    username: '学生004',
    phone: '13818216427',
    status: UserStatus.ACTIVE,
    role: 'operator' as any,
    organization: '山东科技大学',
    userGroup: '土木工程学院/2022年级',
    lastLoginTime: '2025-08-05 15:45',
  },
]

export function UserManagement() {
  // Search and filter state
  const [userIdSearch, setUserIdSearch] = useState('')
  const [usernameSearch, setUsernameSearch] = useState('')

  // Table state
  const [selectedUsers, setSelectedUsers] = useState<Set<string>>(new Set())
  const [users] = useState<User[]>(mockUsers)

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)

  // Calculate pagination
  const totalPages = Math.ceil(users.length / pageSize)
  const startIndex = (currentPage - 1) * pageSize
  const endIndex = startIndex + pageSize
  const currentUsers = users.slice(startIndex, endIndex)

  // Selection handlers
  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedUsers(new Set(currentUsers.map((u) => u.id)))
    } else {
      setSelectedUsers(new Set())
    }
  }

  const handleSelectUser = (userId: string, checked: boolean) => {
    const newSelected = new Set(selectedUsers)
    if (checked) {
      newSelected.add(userId)
    } else {
      newSelected.delete(userId)
    }
    setSelectedUsers(newSelected)
  }

  const allSelected = currentUsers.length > 0 && currentUsers.every((u) => selectedUsers.has(u.id))
  const someSelected = currentUsers.some((u) => selectedUsers.has(u.id)) && !allSelected

  // Action handlers
  const handleCreate = () => {
    console.log('Create new user')
    // TODO: Open create user modal
  }

  const handleFilter = () => {
    console.log('Apply filters:', { userIdSearch, usernameSearch })
    // TODO: Apply filters to user list
  }

  const handleReset = () => {
    setUserIdSearch('')
    setUsernameSearch('')
    console.log('Reset filters')
  }

  const handleUserAction = (userId: string) => {
    console.log('View user details:', userId)
    // TODO: Open user details modal/page
  }

  const handleUserMore = (userId: string) => {
    console.log('Show more options for user:', userId)
    // TODO: Show context menu with edit, delete, etc.
  }

  return (
    <>
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-6 bg-white border-b border-neutral-200">
        <h1 className="text-2xl font-semibold text-neutral-900">用户列表</h1>
        <CreateButton onClick={handleCreate} />
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto px-6 py-6">
          {/* Table Panel */}
          <div className="bg-white rounded-lg border border-neutral-200 shadow-sm">
            {/* Search and Filter Toolbar */}
            <div className="flex items-center justify-between px-3 py-3 border-b border-neutral-200">
              {/* Search Inputs */}
              <div className="flex items-center gap-5">
                <Input
                  variant="search"
                  placeholder="用户编号"
                  value={userIdSearch}
                  onChange={(e) => setUserIdSearch(e.target.value)}
                  className="w-[201px]"
                />
                <Select
                  placeholder="用户名称"
                  value={usernameSearch}
                  onChange={setUsernameSearch}
                  options={[
                    { value: '001', label: '001' },
                    { value: '学生002', label: '学生002' },
                    { value: '学生003', label: '学生003' },
                    { value: '学生004', label: '学生004' },
                  ]}
                  className="w-[210px]"
                />
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2">
                <FilterButton onClick={handleFilter} />
                <ResetButton onClick={handleReset} />
              </div>
            </div>

            {/* User Table */}
            <div className="overflow-x-auto">
              <Table>
                <TableHead>
                  <TableRow>
                    <TableHeaderCell showDivider={false} className="w-[36px]">
                      <input
                        type="checkbox"
                        checked={allSelected}
                        ref={(el) => {
                          if (el) el.indeterminate = someSelected
                        }}
                        onChange={(e) => handleSelectAll(e.target.checked)}
                        className="w-5 h-5 border border-[#767575] rounded-none cursor-pointer"
                      />
                    </TableHeaderCell>
                    <TableHeaderCell className="w-[111px]">用户编号</TableHeaderCell>
                    <TableHeaderCell className="w-[111px]">用户名</TableHeaderCell>
                    <TableHeaderCell className="w-[124px]">联系手机</TableHeaderCell>
                    <TableHeaderCell className="w-[63px]">状态</TableHeaderCell>
                    <TableHeaderCell className="w-[150px]">角色</TableHeaderCell>
                    <TableHeaderCell className="w-[150px]">组户</TableHeaderCell>
                    <TableHeaderCell className="w-[145px]">用户组</TableHeaderCell>
                    <TableHeaderCell className="w-[166px]">最近登录时间</TableHeaderCell>
                    <TableHeaderCell showDivider={false} className="w-[111px]">
                      操作
                    </TableHeaderCell>
                  </TableRow>
                </TableHead>

                <TableBody>
                  {currentUsers.map((user) => (
                    <TableRow key={user.id}>
                      <TableSelectCell
                        checked={selectedUsers.has(user.id)}
                        onCheckedChange={(checked) => handleSelectUser(user.id, checked)}
                      />
                      <TableTextCell>{user.id}</TableTextCell>
                      <TableTextCell>{user.username}</TableTextCell>
                      <TableTextCell>{user.phone}</TableTextCell>
                      <TableEnumCell variant={user.status === UserStatus.ACTIVE ? 'default' : 'default'}>
                        {UserStatusLabels[user.status]}
                      </TableEnumCell>
                      <TableTextCell>{UserRoleLabels[user.role] || user.role}</TableTextCell>
                      <TableTextCell>{user.organization}</TableTextCell>
                      <TableTextCell>{user.userGroup}</TableTextCell>
                      <TableTextCell>{user.lastLoginTime}</TableTextCell>
                      <TableActionCell
                        actionText="详情"
                        onAction={() => handleUserAction(user.id)}
                        onMore={() => handleUserMore(user.id)}
                      />
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            {/* Pagination Footer */}
            <div className="px-3 py-3 border-t border-neutral-200 flex justify-end">
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                pageSize={pageSize}
                onPageChange={setCurrentPage}
                onPageSizeChange={(newSize) => {
                  setPageSize(newSize)
                  setCurrentPage(1) // Reset to first page when changing page size
                }}
                showPageSize={true}
                showGoto={true}
              />
            </div>
          </div>
        </div>
    </>
  )
}
