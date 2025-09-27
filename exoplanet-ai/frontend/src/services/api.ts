import axios, { AxiosResponse } from 'axios'
import { 
  SearchRequest, 
  SearchResult, 
  LightCurveData, 
  HealthStatus, 
  Target,
  ExportFormat
} from '../types/api'

// API configuration
const API_BASE_URL = (import.meta as any).env?.VITE_API_URL || 'http://localhost:8001'
const API_VERSION = '/api/v1' // API version prefix

// Create axios instance with default config
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 60000, // 60 seconds timeout for most requests
  headers: {
    'Content-Type': 'application/json',
  },
})

// Create a special client for long-running operations
const longRunningClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 0, // No timeout for analysis operations
  headers: {
    'Content-Type': 'application/json',
  },
})

// Request interceptor for logging
const requestInterceptor = (config: any) => {
  const fullUrl = `${config.baseURL}${config.url}`
  console.log(`API Request: ${config.method?.toUpperCase()} ${fullUrl}`)
  return config
}

const requestErrorInterceptor = (error: any) => {
  console.error('API Request Error:', error)
  return Promise.reject(error)
}

// Response interceptor for error handling
const responseInterceptor = (response: any) => {
  const fullUrl = `${response.config.baseURL}${response.config.url}`
  console.log(`API Response: ${response.status} ${fullUrl}`)
  return response
}

const responseErrorInterceptor = (error: any) => {
  console.error('API Response Error:', error.response?.data || error.message)
  
  if (error.response?.status === 500) {
    throw new Error('Внутренняя ошибка сервера. Попробуйте позже.')
  } else if (error.response?.status === 404) {
    throw new Error('Ресурс не найден.')
  } else if (error.response?.status === 400) {
    throw new Error(error.response.data?.detail || 'Неверный запрос.')
  } else if (error.code === 'ECONNABORTED') {
    throw new Error('Превышено время ожидания запроса.')
  } else if (!error.response) {
    throw new Error('Нет соединения с сервером.')
  }
  
  return Promise.reject(error)
}

// Apply interceptors to both clients
apiClient.interceptors.request.use(requestInterceptor, requestErrorInterceptor)
apiClient.interceptors.response.use(responseInterceptor, responseErrorInterceptor)
longRunningClient.interceptors.request.use(requestInterceptor, requestErrorInterceptor)
longRunningClient.interceptors.response.use(responseInterceptor, responseErrorInterceptor)

export class ApiService {
  // Health check
  static async getHealth(): Promise<HealthStatus> {
    const response: AxiosResponse<HealthStatus> = await apiClient.get('/health')
    return response.data
  }

  // Basic search
  static async searchExoplanets(request: Partial<SearchRequest>): Promise<SearchResult> {
    const response: AxiosResponse<SearchResult> = await longRunningClient.post('/api/search', request)
    return response.data
  }

  // Load TIC data
  static async loadTicData(ticId: string): Promise<Target> {
    const response: AxiosResponse<Target> = await apiClient.get(`/load-tic/${ticId}`)
    return response.data
  }

  // Get light curve data
  static async getLightCurve(targetId: string): Promise<LightCurveData> {
    const response: AxiosResponse<LightCurveData> = await apiClient.get(`/api/lightcurve/${targetId}`)
    return response.data
  }

  // Amateur analysis
  static async analyzeAmateur(ticId: string): Promise<any> {
    const response = await longRunningClient.post('/amateur/analyze', { tic_id: ticId })
    return response.data
  }

  // Professional analysis
  static async analyzePro(ticId: string, params?: any): Promise<any> {
    const response = await longRunningClient.post('/pro/analyze', { 
      tic_id: ticId,
      ...params 
    })
    return response.data
  }

  // BLS analysis (Box Least Squares)
  static async analyzeBLS(ticId: string, params?: any): Promise<any> {
    const response = await longRunningClient.post('/api/bls/analyze', {
      tic_id: ticId,
      ...params
    })
    return response.data
  }

  // Get NASA statistics
  static async getNasaStats(): Promise<any> {
    const response = await apiClient.get('/api/nasa/stats')
    return response.data
  }

  // Get catalog data
  static async getCatalog(params?: any): Promise<any> {
    const response = await apiClient.get('/api/catalog', { params })
    return response.data
  }

  // Export results
  static async exportResults(data: any, format: ExportFormat): Promise<Blob> {
    const response = await apiClient.post('/api/export', data, {
      params: { format },
      responseType: 'blob'
    })
    return response.data
  }

  // Get analysis history
  static async getAnalysisHistory(): Promise<any[]> {
    const response = await apiClient.get('/api/history')
    return response.data
  }

  // Save analysis result
  static async saveAnalysis(result: any): Promise<any> {
    const response = await apiClient.post('/api/history', result)
    return response.data
  }

  // Delete analysis from history
  static async deleteAnalysis(id: string): Promise<void> {
    await apiClient.delete(`/api/history/${id}`)
  }
}

// Export individual clients for special cases
export { apiClient, longRunningClient }

// Export default service
export default ApiService
