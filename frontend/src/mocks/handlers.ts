import { http, HttpResponse } from 'msw'
import { mockUsers } from '@/services/users'

function filterUsers(searchId?: string, searchName?: string) {
  return mockUsers.filter((user) => {
    const matchesId = !searchId || user.id.includes(searchId)
    const matchesName = !searchName || user.username.includes(searchName)
    return matchesId && matchesName
  })
}

export const handlers = [
  http.get('/users', ({ request }) => {
    const url = new URL(request.url)
    const searchId = url.searchParams.get('searchId') ?? undefined
    const searchName = url.searchParams.get('searchName') ?? undefined

    const data = filterUsers(searchId, searchName)

    return HttpResponse.json(data, {
      status: 200,
    })
  }),
]


