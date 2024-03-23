import { API_PATH } from '@/config'
import { useAuthStore } from '@/stores/auth.js'

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
  return response.text().then(text => {
    const data = text && JSON.parse(text)
    
    if (!response.ok) {
      const { user, logout } = useAuthStore()
      if ([401].includes(response.status) && user)
        logout()
      
      const error = (data && data.message) || response.statusText
      return Promise.reject(error)
    }
    return data
  })
}
