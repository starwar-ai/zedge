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
  Pagination,
} from '@/components/ui'
import { User, UserStatus, UserStatusLabels } from '@/types/user'
import { Plus } from 'lucide-react'

/**
 * User Management Page
 * Figma reference: https://www.figma.com/design/kOzUFxGwYftvVD97zYoTJM/Desk?node-id=230-1863
 *
 * Features:
 * - User list table with sorting and selection
 * - Search by user ID and username
 * - Pagination
 * - Action menu for each user
 */

// Mock data for demonstration - matching Figma design exactly
const mockUsers: User[] = [
  {
    id: '009-33',
    username: '学生001',
    phone: '13818216424',
    status: UserStatus.ACTIVE,
    role: '教职工' as any,
    organization: '山东科技大学',
    userGroup: '计算机学院/2022年级',
    lastLoginTime: '2025-11-10 12:00',
  },
  {
    id: '009-34',
    username: '学生002',
    phone: '13818216425',
    status: UserStatus.ACTIVE,
    role: '教职工' as any,
    organization: '山东科技大学',
    userGroup: '电子工程学院/2022年级',
    lastLoginTime: '2025-12-15 14:00',
  },
  {
    id: '009-35',
    username: '学生003',
    phone: '13818216426',
    status: UserStatus.ACTIVE,
    role: '教职工' as any,
    organization: '山东科技大学',
    userGroup: '机械工程学院/2022年级',
    lastLoginTime: '2025-09-20 10:30',
  },
  {
    id: '009-36',
    username: '学生004',
    phone: '13818216427',
    status: UserStatus.ACTIVE,
    role: '教职工' as any,
    organization: '山东科技大学',
    userGroup: '土木工程学院/2022年级',
    lastLoginTime: '2025-08-05 15:45',
  },
]

export function UserManagement() {
  // Search state
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

  const handleUserAction = (userId: string) => {
    console.log('View user details:', userId)
    // TODO: Open user details modal/page
  }

  const handleUserMore = (userId: string) => {
    console.log('Show more options for user:', userId)
    // TODO: Show context menu with edit, delete, etc.
  }

  return (
    <div className="flex flex-col gap-3 h-full">
      {/* Header - Figma node: 2027:1436 */}
      <div className="flex items-center justify-between h-[62.5px] px-6 py-3">
        <h1 className="text-[18px] font-medium leading-[31.5px] text-[#314158]">
          用户列表
        </h1>
        <button
          onClick={handleCreate}
          className="flex items-center justify-center h-[28px] min-w-[100px] px-[11px] py-[7px] bg-[#262626] text-white rounded-[6.75px] text-[12.5px] font-medium tracking-[1px] leading-[17.5px] hover:bg-[#333] transition-colors"
        >
          <Plus className="w-[14px] h-[14px] mr-1" />
          新建
        </button>
      </div>

      {/* Content - Figma node: 2027:1439 */}
      <div className="flex-1 px-6 pb-6">
        {/* Table Panel - Figma node: 2027:1442 */}
        <div className="border border-[#f5f5f5] rounded-[10px] p-3">
          {/* Search Bar - Figma node: 2027:1443 */}
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              {/* Search Input 1 - 用户编号 */}
              <div className="flex items-center gap-[10px] h-[30px] px-2 py-1 bg-white border border-[#f5f5f5] rounded-[4px] w-[169px]">
                <input
                  type="text"
                  placeholder="用户编号"
                  value={userIdSearch}
                  onChange={(e) => setUserIdSearch(e.target.value)}
                  className="flex-1 text-[12.5px] leading-[22px] text-[#a1a1a1] placeholder:text-[#a1a1a1] outline-none bg-transparent"
                />
              </div>
              {/* Search Input 2 - 用户名称 */}
              <div className="flex items-center gap-[10px] h-[30px] px-2 py-1 bg-white border border-[#f5f5f5] rounded-[4px] w-[169px]">
                <input
                  type="text"
                  placeholder="用户名称"
                  value={usernameSearch}
                  onChange={(e) => setUsernameSearch(e.target.value)}
                  className="flex-1 text-[12.5px] leading-[22px] text-[#a1a1a1] placeholder:text-[#a1a1a1] outline-none bg-transparent"
                />
              </div>
            </div>
            {/* Empty space for buttons area - Figma shows empty */}
            <div className="w-[100px] h-[28px]" />
          </div>

          {/* User Table - Figma node: 2027:1987 */}
          {/* Fixed columns: checkbox + 用户编号 + 用户名 on left, 操作 on right */}
          <div className="overflow-x-auto w-full">
            <Table>
              <TableHead>
                <TableRow>
                  {/* Fixed left columns */}
                  <TableHeaderCell showDivider className="w-[36px]" fixed="left" fixedOffset={0}>
                    <input
                      type="checkbox"
                      checked={allSelected}
                      ref={(el) => {
                        if (el) el.indeterminate = someSelected
                      }}
                      onChange={(e) => handleSelectAll(e.target.checked)}
                      className="w-5 h-5 border border-[#767575] rounded-none cursor-pointer bg-white"
                    />
                  </TableHeaderCell>
                  <TableHeaderCell className="w-[111px]" fixed="left" fixedOffset={36}>
                    用户编号
                  </TableHeaderCell>
                  <TableHeaderCell className="w-[111px]" fixed="left" fixedOffset={147}>
                    用户名
                  </TableHeaderCell>
                  {/* Scrollable columns */}
                  <TableHeaderCell className="w-[124px]">联系手机</TableHeaderCell>
                  <TableHeaderCell className="w-[63px]">状态</TableHeaderCell>
                  <TableHeaderCell className="w-[150px]">角色</TableHeaderCell>
                  <TableHeaderCell className="w-[150px]">租户</TableHeaderCell>
                  <TableHeaderCell className="w-[145px]">用户组</TableHeaderCell>
                  <TableHeaderCell className="w-[166px]">最近登录时间</TableHeaderCell>
                  {/* Fixed right column */}
                  <TableHeaderCell showDivider={false} className="w-[111px]" fixed="right" fixedOffset={0}>
                    操作
                  </TableHeaderCell>
                </TableRow>
              </TableHead>

              <TableBody>
                {currentUsers.map((user) => (
                  <TableRow key={user.id}>
                    {/* Fixed left columns */}
                    <TableSelectCell
                      checked={selectedUsers.has(user.id)}
                      onCheckedChange={(checked) => handleSelectUser(user.id, checked)}
                      fixed="left"
                      fixedOffset={0}
                    />
                    <TableTextCell fixed="left" fixedOffset={36}>
                      {user.id}
                    </TableTextCell>
                    <TableTextCell fixed="left" fixedOffset={147}>
                      {user.username}
                    </TableTextCell>
                    {/* Scrollable columns */}
                    <TableTextCell>{user.phone}</TableTextCell>
                    <TableEnumCell variant={user.status === UserStatus.ACTIVE ? 'default' : 'default'}>
                      {UserStatusLabels[user.status]}
                    </TableEnumCell>
                    <TableTextCell>{user.role}</TableTextCell>
                    <TableTextCell>{user.organization}</TableTextCell>
                    <TableTextCell>{user.userGroup}</TableTextCell>
                    <TableTextCell>{user.lastLoginTime}</TableTextCell>
                    {/* Fixed right column */}
                    <TableActionCell
                      actionText="详情"
                      onAction={() => handleUserAction(user.id)}
                      onMore={() => handleUserMore(user.id)}
                      fixed="right"
                      fixedOffset={0}
                    />
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {/* Pagination Footer - Figma node: 2027:1585 */}
          <div className="flex justify-end p-3">
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              pageSize={pageSize}
              onPageChange={setCurrentPage}
              onPageSizeChange={(newSize) => {
                setPageSize(newSize)
                setCurrentPage(1)
              }}
              showPageSize={true}
              showGoto={true}
            />
          </div>
        </div>
      </div>
    </div>
  )
}
