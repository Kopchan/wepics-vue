import { API_PATH } from '@/config'
import { useAuthStore } from '@/stores/auth.js'
import sleep from '@/helpers/sleep'

export const fetchWrapper = {
  get:    request('GET'),
  post:   request('POST'),
  patch:  request('PATCH'),
  delete: request('DELETE')
}

function request(method) {
  return (path, body = null) => {
    const requestOptions = {
      method,
      headers: authHeader()
    }
    if (body) {
      requestOptions.headers['Content-Type'] = 'application/json'
      requestOptions.body = JSON.stringify(body)
    }
    
    return fetch(API_PATH + path, requestOptions).then(handleResponse)
  }
}

function authHeader() {
  const token = localStorage.getItem('token')
  if (token)
    return { Authorization: `Bearer ${token}` }
  
  return {}
}

function handleResponse(response) {
  return response.text().then(async text => {
    const data = tryParceJSON(text)
    
    if (!response.ok) {
      const { user, logout } = useAuthStore()
      if ([401].includes(response.status) && user)
        logout()
      
      if (response.status == 429) {
        await sleep(5000) // FIXME: Сделать норм обработку 429, мб серв отдаёт время когда можно ещё раз попробовать
      }

      const message = (data?.message || data) || response.statusText
      console.error(`fetchWrapper: ${response.status}: ${message}`)

      return Promise.reject({
        response,
        status: response.status,
        message,
      })
    }
    return data
  })
}

function tryParceJSON(text) {
  try {
    return JSON.parse(text)
  }
  catch (e) {
    return text
  }
}

export default fetchWrapper
