import axios from 'axios'

const BASE_URL = import.meta.env.VITE_API_URL || 'https://krishix.onrender.com'

const API = axios.create({
  baseURL: BASE_URL,
  // 90 s — TensorFlow on Render free tier takes 60-90 s to load on cold start
  timeout: 90000,
})

// Convert raw axios errors into readable messages
API.interceptors.response.use(
  res => res,
  err => {
    if (err.code === 'ECONNABORTED' || err.message?.includes('timeout')) {
      return Promise.reject(new Error(
        '⏳ Server is waking up from sleep (Render free tier). Please wait ~60 seconds and try again.'
      ))
    }
    if (!err.response) {
      return Promise.reject(new Error(
        'Cannot reach the server. Please check your internet connection or try again shortly.'
      ))
    }
    // Pass through backend error messages if present
    const msg = err.response?.data?.error || err.response?.data?.message
    if (msg) return Promise.reject(new Error(msg))
    return Promise.reject(err)
  }
)

export const cropPredict = (data) => API.post('/api/crop-predict', data)
export const fertilizerPredict = (data) => API.post('/api/fertilizer-predict', data)
export const diseasePredict = (file) => {
  const form = new FormData()
  form.append('file', file)
  return API.post('/api/predict', form, { headers: { 'Content-Type': 'multipart/form-data' } })
}
export const yieldPredict = (data) => API.post('/api/yield-predict', data)
export const getWeather = (city) => API.post('/api/weather', { city })
export const modelStatus = () => API.get('/api/model-status')

// Silently pings backend to wake it from sleep before user submits
export const wakeUp = () =>
  fetch(`${BASE_URL}/api/model-status`, { method: 'GET', signal: AbortSignal.timeout(5000) }).catch(() => {})

export default API
