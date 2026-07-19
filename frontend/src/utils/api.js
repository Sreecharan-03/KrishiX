import axios from 'axios'

const API = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '',
  timeout: 30000,
})

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

export default API
