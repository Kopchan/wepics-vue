import { useAuthStore } from '@/stores/auth'
import { sleep } from '@/helpers'

export interface FetchErrorPayload {
  response: Response
  data: unknown
  status: number
  errors?: unknown
  message: string
}

type RequestMethod = <T = unknown>(path: string, body?: unknown) => Promise<T>

export const fetchWrapper: Record<'get' | 'post' | 'patch' | 'delete', RequestMethod> = {
  get:    request('GET'),
  post:   request('POST'),
  patch:  request('PATCH'),
  delete: request('DELETE')
}

function request(method: string): RequestMethod {
  return <T = unknown>(path: string, body: unknown = null) => {
    const requestOptions: RequestInit & { headers: Record<string, string> } = {
      method,
      headers: authHeader()
    }
    if (body) {
      requestOptions.headers['Content-Type'] = 'application/json'
      requestOptions.body = JSON.stringify(body)
    }

    return fetch(path, requestOptions).then(response => handleResponse<T>(response))
  }
}

function authHeader(): Record<string, string> {
  const auth = useAuthStore()
  if (auth.user.token)
    return { Authorization: `Bearer ${auth.user.token}` }

  return {}
}

function handleResponse<T>(response: Response): Promise<T> {
  return response.text().then(async text => {
    const data = tryParceJSON(text)

    if (!response.ok) {
      const auth = useAuthStore()
      if ([401].includes(response.status) && auth.user.token)
        auth.logout()

      if (response.status == 429) {
        await sleep(5000) // FIXME: Сделать норм обработку 429, мб серв отдаёт время когда можно ещё раз попробовать
      }

      const message = (data?.message || data) || response.statusText
      console.error(`fetchWrapper: ${response.status}: ${message}`)

      return Promise.reject({
        response,
        data,
        status: response.status,
        errors: data?.errors,
        message,
      } satisfies FetchErrorPayload)
    }
    return data
  })
}

function tryParceJSON(text: string): any {
  try {
    return JSON.parse(text)
  }
  catch (e) {
    return text
  }
}

export default fetchWrapper
