import axios from 'axios'
import { useAuthStore } from '../context/authStore'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8000/api',
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
})

// Request interceptor: add Bearer token
api.interceptors.request.use((config) => {
  const token = useAuthStore.getState().token
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// Response interceptor: handle 401
let isRedirecting = false

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 && !isRedirecting) {
      isRedirecting = true
      useAuthStore.getState().logout()
      // Use replace to avoid history entry, then reset flag
      window.location.replace('/login')
      setTimeout(() => { isRedirecting = false }, 1000)
    }
    return Promise.reject(error)
  }
)

/**
 * Download a file from the API with authentication.
 * Uses axios to send the Bearer token, then creates a blob download link.
 * @param {string} url - The API endpoint (e.g., '/cours/1/download')
 * @param {string} filename - The suggested filename for the download
 */
export async function downloadFile(url, filename) {
  const token = useAuthStore.getState().token
  const baseURL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api'

  const response = await axios.get(`${baseURL}${url}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
    responseType: 'blob',
  })

  // Create a blob URL and trigger download
  const blob = new Blob([response.data], { type: response.headers['content-type'] })
  const downloadUrl = window.URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = downloadUrl
  link.download = filename
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  window.URL.revokeObjectURL(downloadUrl)
}

export default api
