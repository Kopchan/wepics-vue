export const API_PATH       = import.meta.env.VITE_API_URL.replace(/\/$/, '') || 'api'
export const PROJECT_NAME   = import.meta.env.VITE_PROJECT_NAME               || 'Wepics'
export const SITE_NAME      = import.meta.env.VITE_SITE_NAME                  || PROJECT_NAME
export const STORAGE_PREFIX = import.meta.env.VITE_STORAGE_PREFIX             || `${PROJECT_NAME}_`
export const BASE_URL = (
  import.meta.env.VITE_BASE_URL !== './' &&
  import.meta.env.VITE_BASE_URL
) ? import.meta.env.VITE_BASE_URL : ''
