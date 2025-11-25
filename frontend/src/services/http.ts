const DEFAULT_HEADERS = {
  'Content-Type': 'application/json',
}

interface HttpConfig {
  baseUrl?: string
  defaultHeaders?: Record<string, string>
}

class HttpClient {
  private baseUrl: string
  private defaultHeaders: Record<string, string>

  constructor(config: HttpConfig = {}) {
    this.baseUrl = config.baseUrl ?? ''
    this.defaultHeaders = {
      ...DEFAULT_HEADERS,
      ...config.defaultHeaders,
    }
  }

  private buildUrl(path: string) {
    if (path.startsWith('http')) {
      return path
    }
    return `${this.baseUrl}${path}`
  }

  private buildHeaders(headers?: Record<string, string>) {
    return {
      ...this.defaultHeaders,
      ...headers,
    }
  }

  async request<T>(
    path: string,
    options: RequestInit & { mockData?: T } = {},
  ): Promise<T> {
    // mockData 在后端未就绪时可以直接返回
    if (options.mockData) {
      return Promise.resolve(options.mockData)
    }

    const response = await fetch(this.buildUrl(path), {
      ...options,
      headers: this.buildHeaders(
        options.headers as Record<string, string>,
      ),
    })

    if (!response.ok) {
      const message = await response.text()
      throw new Error(message || `HTTP error ${response.status}`)
    }

    if (response.status === 204) {
      return undefined as T
    }

    return (await response.json()) as T
  }

  get<T>(path: string, options?: RequestInit & { mockData?: T }) {
    return this.request<T>(path, {
      method: 'GET',
      ...options,
    })
  }

  post<T>(path: string, body?: unknown, options?: RequestInit & { mockData?: T }) {
    return this.request<T>(path, {
      method: 'POST',
      body: body ? JSON.stringify(body) : undefined,
      ...options,
    })
  }

  put<T>(path: string, body?: unknown, options?: RequestInit & { mockData?: T }) {
    return this.request<T>(path, {
      method: 'PUT',
      body: body ? JSON.stringify(body) : undefined,
      ...options,
    })
  }

  delete<T>(path: string, options?: RequestInit & { mockData?: T }) {
    return this.request<T>(path, {
      method: 'DELETE',
      ...options,
    })
  }
}

export const httpClient = new HttpClient({
  baseUrl: import.meta.env.VITE_API_BASE_URL,
})


