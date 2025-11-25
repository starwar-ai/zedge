import { useQuery } from '@tanstack/react-query'
import { httpClient } from './http'
import { User, UserStatus, UserRoleType } from '@/types/user'

const QUERY_KEYS = {
  users: ['users'] as const,
}

export const mockUsers: User[] = [
  {
    id: '009-33',
    username: '学生001',
    phone: '13818216424',
    status: UserStatus.ACTIVE,
    role: UserRoleType.OPERATOR,
    organization: '山东科技大学',
    userGroup: '计算机学院/2022年级',
    lastLoginTime: '2025-11-10 12:00',
  },
  {
    id: '009-34',
    username: '学生002',
    phone: '13818216425',
    status: UserStatus.ACTIVE,
    role: UserRoleType.OPERATOR,
    organization: '山东科技大学',
    userGroup: '电子工程学院/2022年级',
    lastLoginTime: '2025-12-15 14:00',
  },
  {
    id: '009-35',
    username: '学生003',
    phone: '13818216426',
    status: UserStatus.INACTIVE,
    role: UserRoleType.OPERATOR,
    organization: '山东科技大学',
    userGroup: '机械工程学院/2022年级',
    lastLoginTime: '2025-09-20 10:30',
  },
  {
    id: '009-36',
    username: '学生004',
    phone: '13818216427',
    status: UserStatus.ACTIVE,
    role: UserRoleType.ADMIN,
    organization: '山东科技大学',
    userGroup: '土木工程学院/2022年级',
    lastLoginTime: '2025-08-05 15:45',
  },
  {
    id: '009-37',
    username: '学生005',
    phone: '13818216428',
    status: UserStatus.ACTIVE,
    role: UserRoleType.USER,
    organization: '清华大学',
    userGroup: '软件学院/2023年级',
    lastLoginTime: '2025-10-12 09:30',
  },
  {
    id: '009-38',
    username: '学生006',
    phone: '13818216429',
    status: UserStatus.INACTIVE,
    role: UserRoleType.TENANT_ADMIN,
    organization: '北京大学',
    userGroup: '信息学院/2021年级',
    lastLoginTime: '2025-07-22 16:20',
  },
]

export interface UserListParams {
  searchId?: string
  searchName?: string
}

export async function fetchUsers(params: UserListParams) {
  return httpClient.get<User[]>('/users', {
    mockData: mockUsers.filter((user) => {
      const matchesId = !params.searchId || user.id.includes(params.searchId)
      const matchesName =
        !params.searchName || user.username.includes(params.searchName)
      return matchesId && matchesName
    }),
  })
}

export function useUsersQuery(params: UserListParams) {
  return useQuery({
    queryKey: [...QUERY_KEYS.users, params],
    queryFn: () => fetchUsers(params),
    staleTime: 1000 * 60,
  })
}


