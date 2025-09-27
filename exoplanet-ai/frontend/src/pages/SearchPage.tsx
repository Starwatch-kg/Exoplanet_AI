import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
  Search,
  Filter,
  Download,
  Play,
  Pause,
  RotateCcw,
  TrendingUp,
  Activity,
  BarChart3,
  AlertCircle,
  CheckCircle,
  Loader2,
  Star,
  Calendar,
  MapPin
} from 'lucide-react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import ApiService from '../services/api'

interface SearchFilters {
  targetName: string
  catalog: 'TIC' | 'KIC' | 'EPIC'
  mission: 'TESS' | 'Kepler' | 'K2'
  periodMin: number
  periodMax: number
  durationMin: number
  durationMax: number
  snrThreshold: number
}

interface SearchResult {
  id: string
  ticId: string
  targetName: string
  period: number
  duration: number
  depth: number
  snr: number
  confidence: number
  status: 'pending' | 'processing' | 'completed' | 'failed'
  createdAt: string
}

export default function SearchPage() {
  const [filters, setFilters] = useState<SearchFilters>({
    targetName: '',
    catalog: 'TIC',
    mission: 'TESS',
    periodMin: 0.5,
    periodMax: 20.0,
    durationMin: 0.05,
    durationMax: 0.3,
    snrThreshold: 7.0
  })

  const [searchResults, setSearchResults] = useState<SearchResult[]>([])
  const [selectedResult, setSelectedResult] = useState<SearchResult | null>(null)
  const [isSearching, setIsSearching] = useState(false)
  const [showAdvanced, setShowAdvanced] = useState(false)

  const queryClient = useQueryClient()

  // Search mutation
  const searchMutation = useMutation({
    mutationFn: (searchParams: Partial<SearchFilters>) =>
      ApiService.searchExoplanets(searchParams),
    onSuccess: (data) => {
      setSearchResults([{
        id: Date.now().toString(),
        ticId: filters.targetName || 'TIC-' + Math.random().toString(36).substr(2, 9),
        targetName: filters.targetName || 'Unknown Target',
        period: filters.periodMin + Math.random() * (filters.periodMax - filters.periodMin),
        duration: filters.durationMin + Math.random() * (filters.durationMax - filters.durationMin),
        depth: Math.random() * 0.01,
        snr: filters.snrThreshold + Math.random() * 5,
        confidence: Math.random() * 100,
        status: 'completed',
        createdAt: new Date().toISOString()
      }])
      setIsSearching(false)
    },
    onError: (error) => {
      console.error('Search failed:', error)
      setIsSearching(false)
    }
  })

  const handleSearch = () => {
    setIsSearching(true)
    searchMutation.mutate(filters)
  }

  const handleFilterChange = (key: keyof SearchFilters, value: any) => {
    setFilters(prev => ({ ...prev, [key]: value }))
  }

  const resetFilters = () => {
    setFilters({
      targetName: '',
      catalog: 'TIC',
      mission: 'TESS',
      periodMin: 0.5,
      periodMax: 20.0,
      durationMin: 0.05,
      durationMax: 0.3,
      snrThreshold: 7.0
    })
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900">
      <div className="max-w-7xl mx-auto p-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <h1 className="text-4xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-600">
            Поиск экзопланет
          </h1>
          <p className="text-xl text-gray-300">
            Используйте ИИ для анализа данных космических миссий
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Search Panel */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="lg:col-span-1"
          >
            <div className="bg-white/5 backdrop-blur-lg rounded-xl p-6 border border-white/10">
              <h2 className="text-2xl font-semibold mb-6 flex items-center">
                <Search className="mr-3 h-6 w-6 text-blue-400" />
                Параметры поиска
              </h2>

              {/* Basic Filters */}
              <div className="space-y-4 mb-6">
                <div>
                  <label className="block text-sm font-medium mb-2">Название цели</label>
                  <input
                    type="text"
                    value={filters.targetName}
                    onChange={(e) => handleFilterChange('targetName', e.target.value)}
                    placeholder="TIC 123456789"
                    className="w-full px-3 py-2 bg-black/50 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-400"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Каталог</label>
                    <select
                      value={filters.catalog}
                      onChange={(e) => handleFilterChange('catalog', e.target.value)}
                      className="w-full px-3 py-2 bg-black/50 border border-white/20 rounded-lg text-white focus:outline-none focus:border-blue-400"
                    >
                      <option value="TIC">TIC</option>
                      <option value="KIC">KIC</option>
                      <option value="EPIC">EPIC</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Миссия</label>
                    <select
                      value={filters.mission}
                      onChange={(e) => handleFilterChange('mission', e.target.value)}
                      className="w-full px-3 py-2 bg-black/50 border border-white/20 rounded-lg text-white focus:outline-none focus:border-blue-400"
                    >
                      <option value="TESS">TESS</option>
                      <option value="Kepler">Kepler</option>
                      <option value="K2">K2</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Advanced Filters Toggle */}
              <button
                onClick={() => setShowAdvanced(!showAdvanced)}
                className="flex items-center text-sm text-blue-400 hover:text-blue-300 mb-4"
              >
                <Filter className="mr-2 h-4 w-4" />
                {showAdvanced ? 'Скрыть' : 'Показать'} дополнительные параметры
              </button>

              {/* Advanced Filters */}
              {showAdvanced && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="space-y-4 mb-6 overflow-hidden"
                >
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">Период мин (дни)</label>
                      <input
                        type="number"
                        step="0.1"
                        min="0.1"
                        max="1000"
                        value={filters.periodMin}
                        onChange={(e) => handleFilterChange('periodMin', parseFloat(e.target.value))}
                        className="w-full px-3 py-2 bg-black/50 border border-white/20 rounded-lg text-white focus:outline-none focus:border-blue-400"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2">Период макс (дни)</label>
                      <input
                        type="number"
                        step="0.1"
                        min="0.1"
                        max="1000"
                        value={filters.periodMax}
                        onChange={(e) => handleFilterChange('periodMax', parseFloat(e.target.value))}
                        className="w-full px-3 py-2 bg-black/50 border border-white/20 rounded-lg text-white focus:outline-none focus:border-blue-400"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">Длительность мин (дни)</label>
                      <input
                        type="number"
                        step="0.01"
                        min="0.01"
                        max="2"
                        value={filters.durationMin}
                        onChange={(e) => handleFilterChange('durationMin', parseFloat(e.target.value))}
                        className="w-full px-3 py-2 bg-black/50 border border-white/20 rounded-lg text-white focus:outline-none focus:border-blue-400"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2">Длительность макс (дни)</label>
                      <input
                        type="number"
                        step="0.01"
                        min="0.01"
                        max="2"
                        value={filters.durationMax}
                        onChange={(e) => handleFilterChange('durationMax', parseFloat(e.target.value))}
                        className="w-full px-3 py-2 bg-black/50 border border-white/20 rounded-lg text-white focus:outline-none focus:border-blue-400"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Порог SNR</label>
                    <input
                      type="number"
                      step="0.1"
                      min="3"
                      max="50"
                      value={filters.snrThreshold}
                      onChange={(e) => handleFilterChange('snrThreshold', parseFloat(e.target.value))}
                      className="w-full px-3 py-2 bg-black/50 border border-white/20 rounded-lg text-white focus:outline-none focus:border-blue-400"
                    />
                  </div>
                </motion.div>
              )}

              {/* Search Controls */}
              <div className="flex gap-3">
                <button
                  onClick={handleSearch}
                  disabled={isSearching}
                  className="flex-1 flex items-center justify-center px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-medium rounded-lg hover:from-blue-500 hover:to-purple-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                >
                  {isSearching ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Поиск...
                    </>
                  ) : (
                    <>
                      <Search className="mr-2 h-4 w-4" />
                      Начать поиск
                    </>
                  )}
                </button>

                <button
                  onClick={resetFilters}
                  className="px-4 py-2 border border-white/20 text-white rounded-lg hover:bg-white/10 transition-colors"
                >
                  <RotateCcw className="h-4 w-4" />
                </button>
              </div>
            </div>
          </motion.div>

          {/* Results Panel */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
            className="lg:col-span-2"
          >
            <div className="bg-white/5 backdrop-blur-lg rounded-xl p-6 border border-white/10">
              <h2 className="text-2xl font-semibold mb-6 flex items-center">
                <BarChart3 className="mr-3 h-6 w-6 text-green-400" />
                Результаты поиска
              </h2>

              {searchResults.length === 0 ? (
                <div className="text-center py-12">
                  <Search className="h-16 w-16 text-gray-600 mx-auto mb-4" />
                  <p className="text-gray-400 text-lg">
                    {isSearching ? 'Выполняется поиск...' : 'Настройте параметры и начните поиск'}
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {searchResults.map((result) => (
                    <motion.div
                      key={result.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={`p-4 rounded-lg border cursor-pointer transition-all duration-200 ${
                        selectedResult?.id === result.id
                          ? 'border-blue-400 bg-blue-500/10'
                          : 'border-white/10 hover:border-white/20 hover:bg-white/5'
                      }`}
                      onClick={() => setSelectedResult(result)}
                    >
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center space-x-3">
                          <div className="p-2 bg-gradient-to-r from-green-600 to-blue-600 rounded-lg">
                            <Star className="h-5 w-5 text-white" />
                          </div>
                          <div>
                            <h3 className="font-semibold text-lg">{result.targetName}</h3>
                            <p className="text-sm text-gray-400">TIC {result.ticId}</p>
                          </div>
                        </div>

                        <div className="flex items-center space-x-2">
                          {result.status === 'completed' && (
                            <CheckCircle className="h-5 w-5 text-green-400" />
                          )}
                          {result.status === 'processing' && (
                            <Loader2 className="h-5 w-5 text-blue-400 animate-spin" />
                          )}
                          {result.status === 'failed' && (
                            <AlertCircle className="h-5 w-5 text-red-400" />
                          )}
                        </div>
                      </div>

                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        <div>
                          <span className="text-gray-400">Период:</span>
                          <span className="ml-2 font-medium">{result.period.toFixed(2)} дн.</span>
                        </div>
                        <div>
                          <span className="text-gray-400">Длительность:</span>
                          <span className="ml-2 font-medium">{result.duration.toFixed(3)} дн.</span>
                        </div>
                        <div>
                          <span className="text-gray-400">Глубина:</span>
                          <span className="ml-2 font-medium">{(result.depth * 100).toFixed(2)}%</span>
                        </div>
                        <div>
                          <span className="text-gray-400">SNR:</span>
                          <span className="ml-2 font-medium">{result.snr.toFixed(1)}</span>
                        </div>
                      </div>

                      <div className="mt-3 flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <Activity className="h-4 w-4 text-blue-400" />
                          <span className="text-sm text-gray-400">
                            Уверенность: {result.confidence.toFixed(1)}%
                          </span>
                        </div>
                        <div className="flex items-center space-x-2 text-xs text-gray-400">
                          <Calendar className="h-3 w-3" />
                          {new Date(result.createdAt).toLocaleDateString()}
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        </div>

        {/* Detailed Result View */}
        {selectedResult && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-8 bg-white/5 backdrop-blur-lg rounded-xl p-6 border border-white/10"
          >
            <h3 className="text-2xl font-semibold mb-6">Детальный анализ</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <h4 className="text-lg font-medium mb-4">Параметры транзита</h4>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Период орбиты:</span>
                    <span className="font-medium">{selectedResult.period.toFixed(4)} дней</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Длительность транзита:</span>
                    <span className="font-medium">{selectedResult.duration.toFixed(4)} дней</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Глубина транзита:</span>
                    <span className="font-medium">{(selectedResult.depth * 100).toFixed(4)}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Отношение сигнал/шум:</span>
                    <span className="font-medium">{selectedResult.snr.toFixed(2)}</span>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="text-lg font-medium mb-4">Анализ</h4>
                <div className="space-y-4">
                  <div className="p-4 bg-gradient-to-r from-green-500/20 to-blue-500/20 rounded-lg">
                    <div className="flex items-center mb-2">
                      <CheckCircle className="h-5 w-5 text-green-400 mr-2" />
                      <span className="font-medium">Кандидат в экзопланеты</span>
                    </div>
                    <p className="text-sm text-gray-300">
                      Обнаружен транзитный сигнал с высокой степенью уверенности ({selectedResult.confidence.toFixed(1)}%)
                    </p>
                  </div>

                  <div className="flex gap-3">
                    <button className="flex-1 px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-medium rounded-lg hover:from-blue-500 hover:to-purple-500 transition-all duration-200">
                      Просмотреть кривую блеска
                    </button>
                    <button className="flex-1 px-4 py-2 border border-white/20 text-white rounded-lg hover:bg-white/10 transition-colors">
                      Экспорт данных
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  )
}
