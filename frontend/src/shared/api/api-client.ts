import axios from 'axios'
import { useAuthStore } from '../stores/auth-store'

export const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL ?? 'http://localhost:3003',
  headers: {
    Accept: 'application/json',
  },
})

apiClient.interceptors.request.use((config) => {
  const token = useAuthStore.getState().user?.token

  if (token) {
    if (!config.headers) {
      config.headers = {} as any
    }

    const headers = config.headers as Record<string, string>
    headers.Authorization = `Bearer ${token}`
    config.headers = headers as any
  }

  return config
})
