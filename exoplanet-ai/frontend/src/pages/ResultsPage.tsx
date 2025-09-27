import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
  Download,
  Filter,
  Search,
  BarChart3,
  TrendingUp,
  Calendar,
  Star,
  AlertCircle,
  CheckCircle,
  X,
  Eye,
  FileText,
  Share2,
  RefreshCw
} from 'lucide-react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import ApiService from '../services/api'

interface AnalysisResult {
  id: string
  targetName: string
  ticId: string
  period: number
  duration: number
  depth: number
  snr: number
  confidence: number
  status: 'pending' | 'processing' | 'completed' | 'failed'
  analysisType: 'amateur' | 'pro' | 'bls'
  createdAt: string
  updatedAt: string
  parameters: {
    periodMin?: number
    periodMax?: number
    durationMin?: number
    durationMax?: number
    snrThreshold?: number
  }
  metrics: {
    transitCount: number
    falsePositiveProbability: number
    signalSignificance: number
  }
}

export default function ResultsPage() {
  const [results, setResults] = useState<AnalysisResult[]>([])
  const [filteredResults, setFilteredResults] = useState<AnalysisResult[]>([])
  const [selectedResult, setSelectedResult] = useState<AnalysisResult | null>(null)
  const [filterStatus, setFilterStatus] = useState<string>('all')
  const [filterType, setFilterType] = useState<string>('all')
  const [searchTerm, setSearchTerm] = useState('')
  const [showFilters, setShowFilters] = useState(false)

  const queryClient = useQueryClient()

  // Load results
  const { data: loadedResults, isLoading } = useQuery({
    queryKey: ['analysis-results'],
    queryFn: ApiService.getAnalysisHistory,
    onSuccess: (data) => {
      setResults(data || [])
      setFilteredResults(data || [])
    }
  })

  // Delete result mutation
  const deleteMutation = useMutation({
    mutationFn: (id: string) => ApiService.deleteAnalysis(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['analysis-results'] })
    }
  })

  // Apply filters
  useEffect(() => {
    let filtered = results

    // Status filter
    if (filterStatus !== 'all') {
      filtered = filtered.filter(result => result.status === filterStatus)
    }

    // Type filter
    if (filterType !== 'all') {
      filtered = filtered.filter(result => result.analysisType === filterType)
    }

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(result =>
        result.targetName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        result.ticId.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    setFilteredResults(filtered)
  }, [results, filterStatus, filterType, searchTerm])

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-green-400" />
      case 'processing':
        return <RefreshCw className="h-4 w-4 text-blue-400 animate-spin" />
      case 'failed':
        return <AlertCircle className="h-4 w-4 text-red-400" />
      default:
        return <RefreshCw className="h-4 w-4 text-gray-400" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'text-green-400 bg-green-500/20'
      case 'processing':
        return 'text-blue-400 bg-blue-500/20'
      case 'failed':
        return 'text-red-400 bg-red-500/20'
      default:
        return 'text-gray-400 bg-gray-500/20'
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ru-RU', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const handleDeleteResult = (id: string) => {
    if (confirm('Вы уверены, что хотите удалить этот результат?')) {
      deleteMutation.mutate(id)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <div className="max-w-7xl mx-auto p-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-4xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-green-400 to-blue-600">
            Результаты анализа
          </h1>
          <p className="text-xl text-gray-300">
            История всех выполненных анализов и их результаты
          </p>
        </motion.div>

        {/* Filters and Search */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mb-8"
        >
          <div className="bg-white/5 backdrop-blur-lg rounded-xl p-6 border border-white/10">
            <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
              {/* Search */}
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Поиск по названию или TIC ID..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-black/50 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-green-400"
                />
              </div>

              {/* Filters */}
              <div className="flex items-center gap-4">
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="px-3 py-2 bg-black/50 border border-white/20 rounded-lg text-white focus:outline-none focus:border-green-400"
                >
                  <option value="all">Все статусы</option>
                  <option value="completed">Завершено</option>
                  <option value="processing">В процессе</option>
                  <option value="failed">Ошибка</option>
                  <option value="pending">Ожидает</option>
                </select>

                <select
                  value={filterType}
                  onChange={(e) => setFilterType(e.target.value)}
                  className="px-3 py-2 bg-black/50 border border-white/20 rounded-lg text-white focus:outline-none focus:border-green-400"
                >
                  <option value="all">Все типы</option>
                  <option value="amateur">Любительский</option>
                  <option value="pro">Профессиональный</option>
                  <option value="bls">BLS</option>
                </select>

                <button
                  onClick={() => setShowFilters(!showFilters)}
                  className="p-2 bg-white/10 hover:bg-white/20 rounded-lg transition-colors"
                >
                  <Filter className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* Advanced Filters */}
            {showFilters && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="mt-4 pt-4 border-t border-white/10"
              >
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Период от (дни)</label>
                    <input
                      type="number"
                      placeholder="0.5"
                      className="w-full px-3 py-2 bg-black/50 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-green-400"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Период до (дни)</label>
                    <input
                      type="number"
                      placeholder="50"
                      className="w-full px-3 py-2 bg-black/50 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-green-400"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">SNR от</label>
                    <input
                      type="number"
                      placeholder="5"
                      className="w-full px-3 py-2 bg-black/50 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-green-400"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Уверенность от (%)</label>
                    <input
                      type="number"
                      placeholder="80"
                      className="w-full px-3 py-2 bg-black/50 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-green-400"
                    />
                  </div>
                </div>
              </motion.div>
            )}
          </div>
        </motion.div>

        {/* Results Grid */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6"
        >
          {isLoading ? (
            <div className="col-span-full text-center py-12">
              <RefreshCw className="h-8 w-8 animate-spin text-gray-400 mx-auto mb-4" />
              <p className="text-gray-400">Загрузка результатов...</p>
            </div>
          ) : filteredResults.length === 0 ? (
            <div className="col-span-full text-center py-12">
              <BarChart3 className="h-16 w-16 text-gray-600 mx-auto mb-4" />
              <p className="text-gray-400 text-lg">
                {results.length === 0 ? 'Результаты анализа не найдены' : 'Нет результатов по заданным фильтрам'}
              </p>
            </div>
          ) : (
            filteredResults.map((result) => (
              <motion.div
                key={result.id}
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                whileHover={{ y: -5 }}
                className="bg-white/5 backdrop-blur-lg rounded-xl p-6 border border-white/10 hover:border-white/20 transition-all duration-300 cursor-pointer"
                onClick={() => setSelectedResult(result)}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div className={`p-2 rounded-lg ${getStatusColor(result.status)}`}>
                      {getStatusIcon(result.status)}
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg">{result.targetName}</h3>
                      <p className="text-sm text-gray-400">TIC {result.ticId}</p>
                    </div>
                  </div>

                  <span className="px-2 py-1 bg-purple-500/20 text-purple-300 text-xs rounded-full">
                    {result.analysisType.toUpperCase()}
                  </span>
                </div>

                <div className="space-y-3 mb-4">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">Период:</span>
                    <span className="font-medium">{result.period.toFixed(3)} дн.</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">Длительность:</span>
                    <span className="font-medium">{result.duration.toFixed(3)} дн.</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">Глубина:</span>
                    <span className="font-medium">{(result.depth * 100).toFixed(2)}%</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">SNR:</span>
                    <span className="font-medium">{result.snr.toFixed(1)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">Уверенность:</span>
                    <span className="font-medium text-green-400">{result.confidence.toFixed(1)}%</span>
                  </div>
                </div>

                <div className="flex items-center justify-between text-xs text-gray-400 mb-4">
                  <div className="flex items-center">
                    <Calendar className="h-3 w-3 mr-1" />
                    {formatDate(result.createdAt)}
                  </div>
                  <div className="flex items-center">
                    <Star className="h-3 w-3 mr-1" />
                    {result.metrics.transitCount} транзитов
                  </div>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      setSelectedResult(result)
                    }}
                    className="flex-1 flex items-center justify-center px-3 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white text-sm font-medium rounded-lg hover:from-blue-500 hover:to-purple-500 transition-all duration-200"
                  >
                    <Eye className="h-4 w-4 mr-1" />
                    Просмотр
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      handleDeleteResult(result.id)
                    }}
                    className="px-3 py-2 bg-red-500/20 text-red-300 hover:bg-red-500/30 rounded-lg transition-colors"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              </motion.div>
            ))
          )}
        </motion.div>

        {/* Detailed Result Modal */}
        {selectedResult && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setSelectedResult(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-gray-900 rounded-xl p-6 max-w-4xl w-full max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold">Детальный анализ</h2>
                <button
                  onClick={() => setSelectedResult(null)}
                  className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div>
                  <h3 className="text-lg font-semibold mb-4">Параметры</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-gray-400">Название цели:</span>
                      <span className="font-medium">{selectedResult.targetName}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">TIC ID:</span>
                      <span className="font-medium">{selectedResult.ticId}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Тип анализа:</span>
                      <span className="font-medium capitalize">{selectedResult.analysisType}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Статус:</span>
                      <span className={`font-medium ${getStatusColor(selectedResult.status)}`}>
                        {selectedResult.status}
                      </span>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold mb-4">Метрики транзита</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-gray-400">Период:</span>
                      <span className="font-medium">{selectedResult.period.toFixed(4)} дней</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Длительность:</span>
                      <span className="font-medium">{selectedResult.duration.toFixed(4)} дней</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Глубина:</span>
                      <span className="font-medium">{(selectedResult.depth * 100).toFixed(4)}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">SNR:</span>
                      <span className="font-medium">{selectedResult.snr.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Уверенность:</span>
                      <span className="font-medium text-green-400">{selectedResult.confidence.toFixed(1)}%</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-8 flex gap-4">
                <button className="flex-1 px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-medium rounded-lg hover:from-blue-500 hover:to-purple-500 transition-all duration-200">
                  <BarChart3 className="h-4 w-4 mr-2" />
                  Просмотреть кривую блеска
                </button>
                <button className="flex-1 px-4 py-2 border border-white/20 text-white rounded-lg hover:bg-white/10 transition-colors">
                  <Download className="h-4 w-4 mr-2" />
                  Экспорт данных
                </button>
                <button className="px-4 py-2 bg-green-500/20 text-green-300 hover:bg-green-500/30 rounded-lg transition-colors">
                  <Share2 className="h-4 w-4" />
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </div>
    </div>
  )
}
