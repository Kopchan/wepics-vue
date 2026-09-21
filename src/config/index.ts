export const API_PATH    : string = (import.meta.env.VITE_API_URL || '').replace(/\/$/, '') || 'api'
export const PROJECT_NAME: string = import.meta.env.VITE_PROJECT_NAME || 'Wepics'
export const SITE_NAME   : string = import.meta.env.VITE_SITE_NAME || PROJECT_NAME
export const BASE_URL    : string = (
  import.meta.env.VITE_BASE_URL !== './' &&
  import.meta.env.VITE_BASE_URL
) ? import.meta.env.VITE_BASE_URL : ''
export const STORAGE_PREFIX : string = import.meta.env.VITE_STORAGE_PREFIX || BASE_URL + PROJECT_NAME
