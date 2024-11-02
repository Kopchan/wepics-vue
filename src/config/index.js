export const API_PATH       = import.meta.env.VITE_API_URL        || 'api'
export const SITE_NAME      = import.meta.env.VITE_SITE_NAME      || 'Wepics'
export const STORAGE_PREFIX = import.meta.env.VITE_STORAGE_PREFIX || 'wepics_'
export const BASE_URL = (
  import.meta.env.VITE_BASE_URL !== './' &&
  import.meta.env.VITE_BASE_URL
) ? import.meta.env.VITE_BASE_URL : ''
