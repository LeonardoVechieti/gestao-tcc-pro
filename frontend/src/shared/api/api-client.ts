import axios from 'axios'

export const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL ?? 'http://localhost:3003',
  headers: {
    Accept: 'application/json',
  },
})
