import { describe, expect, it } from 'vitest'
import { httpClient } from './http'

describe('httpClient', () => {
  it('returns mock data when provided', async () => {
    const response = await httpClient.get('/example', {
      mockData: { message: 'ok' },
    })

    expect(response).toEqual({ message: 'ok' })
  })

  it('merges custom headers with defaults', async () => {
    const result = await httpClient.get('/example', {
      headers: {
        Authorization: 'Bearer token',
      },
      mockData: { success: true },
    })

    expect(result).toEqual({ success: true })
  })
})


