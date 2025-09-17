import React, { useState, useEffect, useMemo, useCallback, lazy, Suspense } from 'react';
import { motion } from 'framer-motion';
import { Search, BarChart3, CheckCircle, AlertCircle, Loader, Database, Telescope } from 'lucide-react';
import { exoplanetApi, type LightcurveData } from './api/exoplanetApi';

// Lazy loading компонентов
const Plot = lazy(() => import('react-plotly.js'));
const NASADataBrowser = lazy(() => import('./components/NASADataBrowser'));

interface Candidate {
  id: string;
  period: number;
  depth: number;
  duration: number;
  confidence: number;
  start_time: number;
  end_time: number;
  method: string;
}

const App: React.FC = () => {
  const [ticId, setTicId] = useState('261136679');
  const [lightcurveData, setLightcurveData] = useState<LightcurveData | null>(null);
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [showNASABrowser, setShowNASABrowser] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Слушаем события выбора TIC ID из NASA браузера
  useEffect(() => {
    const handleSelectTIC = (event: CustomEvent) => {
      setTicId(event.detail);
      setShowNASABrowser(false);
    };

    window.addEventListener('selectTIC', handleSelectTIC as EventListener);
    return () => {
      window.removeEventListener('selectTIC', handleSelectTIC as EventListener);
    };
  }, []);

  const handleLoadData = useCallback(async () => {
    if (!ticId.trim()) {
      setError('Введите TIC ID');
      return;
    }

    setIsLoading(true);
    setError(null);
    
    try {
      const response = await exoplanetApi.loadTICData(ticId.trim());
      if (response.success) {
        setLightcurveData(response.data);
      } else {
        setError('Ошибка загрузки данных');
      }
    } catch (err) {
      setError('Ошибка подключения к серверу');
    } finally {
      setIsLoading(false);
    }
  }, [ticId]);

  const handleAnalyze = useCallback(async () => {
    if (!lightcurveData) {
      setError('Сначала загрузите данные');
      return;
    }

    setIsAnalyzing(true);
    setError(null);
    
    try {
      const response = await exoplanetApi.analyzeLightcurve(
        lightcurveData,
        'simple',
        {}
      );

      if (response.success) {
        setCandidates(response.candidates || []);
      } else {
        setError(response.error || 'Ошибка анализа');
      }
    } catch (err) {
      setError('Ошибка анализа данных');
    } finally {
      setIsAnalyzing(false);
    }
  }, [lightcurveData]);

  // Мемоизированные статистики
  const lightcurveStats = useMemo(() => {
    if (!lightcurveData) return null;
    
    const { times, fluxes } = lightcurveData;
    const timeSpan = times[times.length - 1] - times[0];
    const meanFlux = fluxes.reduce((a, b) => a + b, 0) / fluxes.length;
    
    return {
      dataPoints: times.length,
      timeSpan: timeSpan.toFixed(1),
      meanFlux: meanFlux.toFixed(6),
      candidatesCount: candidates.length
    };
  }, [lightcurveData, candidates.length]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white">
      <div className="container mx-auto px-6 py-8">
        {/* Заголовок */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
            🌌 Exoplanet AI Demo
          </h1>
          <p className="text-slate-300 text-lg">
            Поиск экзопланет с использованием реальных данных NASA
          </p>
        </motion.div>

        <div className="max-w-7xl mx-auto">
          {/* Управление */}
          <div className="grid lg:grid-cols-2 gap-8 mb-8">
            {/* Левая панель - Управление */}
            <div className="space-y-6">
              {/* Форма ввода TIC ID */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="bg-slate-800/50 backdrop-blur-sm rounded-lg border border-slate-700 p-6"
              >
                <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                  <Search className="w-5 h-5 text-blue-400" />
                  Загрузка данных TESS
                </h2>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                      TIC ID звезды
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={ticId}
                        onChange={(e) => setTicId(e.target.value)}
                        placeholder="Например: 261136679"
                        className="flex-1 px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-blue-500"
                      />
                      <button
                        onClick={() => setShowNASABrowser(!showNASABrowser)}
                        className="px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg transition-colors flex items-center gap-2"
                      >
                        <Database className="w-4 h-4" />
                        NASA
                      </button>
                    </div>
                  </div>

                  <button
                    onClick={handleLoadData}
                    disabled={isLoading}
                    className="w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-600 rounded-lg transition-colors flex items-center justify-center gap-2"
                  >
                    {isLoading ? (
                      <>
                        <Loader className="w-4 h-4 animate-spin" />
                        Загрузка...
                      </>
                    ) : (
                      <>
                        <Telescope className="w-4 h-4" />
                        Загрузить данные
                      </>
                    )}
                  </button>
                </div>
              </motion.div>

              {/* Анализ */}
              {lightcurveData && (
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="bg-slate-800/50 backdrop-blur-sm rounded-lg border border-slate-700 p-6"
                >
                  <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                    <BarChart3 className="w-5 h-5 text-green-400" />
                    Анализ экзопланет
                  </h2>
                  
                  <div className="space-y-4">
                    <div className="text-sm text-slate-300">
                      <p>Данные загружены: <span className="text-green-400">{lightcurveData.times.length} точек</span></p>
                      <p>TIC ID: <span className="text-blue-400">{lightcurveData.tic_id}</span></p>
                    </div>

                    <button
                      onClick={handleAnalyze}
                      disabled={isAnalyzing}
                      className="w-full px-4 py-2 bg-green-600 hover:bg-green-700 disabled:bg-slate-600 rounded-lg transition-colors flex items-center justify-center gap-2"
                    >
                      {isAnalyzing ? (
                        <>
                          <Loader className="w-4 h-4 animate-spin" />
                          Анализ...
                        </>
                      ) : (
                        <>
                          <BarChart3 className="w-4 h-4" />
                          Найти экзопланеты
                        </>
                      )}
                    </button>
                  </div>
                </motion.div>
              )}

              {/* Результаты */}
              {candidates.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="bg-slate-800/50 backdrop-blur-sm rounded-lg border border-slate-700 p-6"
                >
                  <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                    <CheckCircle className="w-5 h-5 text-green-400" />
                    Найденные экзопланеты ({candidates.length})
                  </h2>
                  
                  <div className="space-y-3">
                    {candidates.map((candidate, index) => (
                      <div key={candidate.id} className="bg-slate-700/50 rounded-lg p-4">
                        <div className="flex justify-between items-start mb-2">
                          <h3 className="font-semibold text-blue-400">Кандидат {index + 1}</h3>
                          <span className="text-sm bg-green-600 px-2 py-1 rounded text-white">
                            {(candidate.confidence * 100).toFixed(1)}%
                          </span>
                        </div>
                        <div className="grid grid-cols-2 gap-2 text-sm">
                          <div>
                            <span className="text-slate-400">Период:</span>
                            <div className="text-white">{candidate.period.toFixed(2)} дней</div>
                          </div>
                          <div>
                            <span className="text-slate-400">Глубина:</span>
                            <div className="text-white">{(candidate.depth * 100).toFixed(3)}%</div>
                          </div>
                          <div>
                            <span className="text-slate-400">Длительность:</span>
                            <div className="text-white">{candidate.duration.toFixed(2)} ч</div>
                          </div>
                          <div>
                            <span className="text-slate-400">Метод:</span>
                            <div className="text-white">{candidate.method}</div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}

              {/* Ошибки */}
              {error && (
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="bg-red-900/50 border border-red-700 rounded-lg p-4 flex items-center gap-2"
                >
                  <AlertCircle className="w-5 h-5 text-red-400" />
                  <span className="text-red-300">{error}</span>
                </motion.div>
              )}
            </div>

            {/* Правая панель - NASA браузер и информация */}
            <div className="space-y-6">
              {/* NASA Data Browser - с lazy loading */}
              {showNASABrowser && (
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                >
                  <Suspense fallback={
                    <div className="bg-slate-800/50 rounded-lg p-6 flex items-center justify-center">
                      <Loader className="w-6 h-6 animate-spin text-blue-400" />
                      <span className="ml-2 text-slate-300">Загрузка NASA браузера...</span>
                    </div>
                  }>
                    <NASADataBrowser />
                  </Suspense>
                </motion.div>
              )}

              {/* Информационная панель */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="bg-blue-900/20 border border-blue-700/50 rounded-lg p-6"
              >
                <h3 className="text-lg font-semibold text-blue-300 mb-3">
                  🛰️ Реальные данные NASA
                </h3>
                <div className="space-y-2 text-sm text-blue-200">
                  <p>• Статистика экзопланет из NASA Exoplanet Archive</p>
                  <p>• Параметры звезд из TESS Input Catalog</p>
                  <p>• Кривые блеска на основе реальных данных</p>
                  <p>• Нажмите "NASA" для просмотра реальных данных</p>
                </div>
              </motion.div>
            </div>
          </div>

          {/* График кривой блеска - полная ширина */}
          {lightcurveData && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-slate-800/50 backdrop-blur-sm rounded-lg border border-slate-700 p-6"
            >
              <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-blue-400" />
                Кривая блеска TIC {lightcurveData.tic_id}
              </h2>
              
              {/* Статистики - оптимизированные */}
              {lightcurveStats && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6 text-sm">
                  <div className="bg-slate-700/50 rounded-lg p-3">
                    <div className="text-slate-400">Точек данных</div>
                    <div className="text-white font-mono text-lg">{lightcurveStats.dataPoints.toLocaleString()}</div>
                  </div>
                  <div className="bg-slate-700/50 rounded-lg p-3">
                    <div className="text-slate-400">Временной диапазон</div>
                    <div className="text-white font-mono text-lg">{lightcurveStats.timeSpan} дней</div>
                  </div>
                  <div className="bg-slate-700/50 rounded-lg p-3">
                    <div className="text-slate-400">Средний поток</div>
                    <div className="text-white font-mono text-lg">{lightcurveStats.meanFlux}</div>
                  </div>
                  <div className="bg-slate-700/50 rounded-lg p-3">
                    <div className="text-slate-400">Кандидатов найдено</div>
                    <div className="text-white font-mono text-lg">{lightcurveStats.candidatesCount}</div>
                  </div>
                </div>
              )}

              {/* График - с lazy loading */}
              <div className="bg-gradient-to-br from-slate-900/90 via-purple-900/20 to-slate-900/90 rounded-lg p-4 border border-purple-500/30 backdrop-blur-sm">
                <Suspense fallback={
                  <div className="h-96 flex items-center justify-center">
                    <Loader className="w-8 h-8 animate-spin text-blue-400" />
                    <span className="ml-2 text-slate-300">Загрузка графика...</span>
                  </div>
                }>
                  <Plot
                  data={[
                    {
                      x: lightcurveData.times,
                      y: lightcurveData.fluxes,
                      type: 'scattergl' as const,
                      mode: 'markers' as const,
                      marker: { 
                        size: 3, 
                        color: '#3b82f6',
                        opacity: 0.9,
                        line: { width: 0 }
                      },
                      name: 'Поток',
                      hovertemplate: 
                        '<b>Время:</b> %{x:.3f} дней<br>' +
                        '<b>Поток:</b> %{y:.6f}<br>' +
                        '<extra></extra>'
                    },
                    // Добавляем сглаженную линию
                    {
                      x: lightcurveData.times,
                      y: lightcurveData.fluxes.map((_, i, arr) => {
                        const start = Math.max(0, i - 5);
                        const end = Math.min(arr.length, i + 6);
                        const window = arr.slice(start, end);
                        return window.reduce((a, b) => a + b, 0) / window.length;
                      }),
                      type: 'scatter' as const,
                      mode: 'lines' as const,
                      line: { 
                        color: '#fbbf24', 
                        width: 3 
                      },
                      name: 'Сглаженная',
                      opacity: 0.7
                    },
                    // Отмечаем найденные транзиты
                    ...candidates.map((candidate, index) => ({
                      x: [candidate.start_time, candidate.start_time],
                      y: [Math.min(...lightcurveData.fluxes), Math.max(...lightcurveData.fluxes)],
                      type: 'scatter' as const,
                      mode: 'lines' as const,
                      line: {
                        color: index === 0 ? '#f87171' : '#34d399',
                        width: 3,
                        dash: 'dash' as const
                      },
                      name: `Транзит ${index + 1}`,
                      showlegend: false,
                      hovertemplate: 
                        `<b>Транзит ${index + 1}</b><br>` +
                        `<b>Период:</b> ${candidate.period.toFixed(2)} дней<br>` +
                        `<b>Глубина:</b> ${(candidate.depth * 100).toFixed(3)}%<br>` +
                        `<b>Уверенность:</b> ${(candidate.confidence * 100).toFixed(1)}%<br>` +
                        '<extra></extra>'
                    }))
                  ]}
                  layout={{
                    title: {
                      text: `Анализ кривой блеска`,
                      font: { 
                        color: '#e2e8f0', 
                        size: 18,
                        family: 'Inter, system-ui, sans-serif'
                      },
                      x: 0.5
                    },
                    xaxis: {
                      title: {
                        text: 'Время (дни)',
                        font: { color: '#e2e8f0', size: 14 }
                      },
                      color: '#e2e8f0',
                      gridcolor: '#4c1d95',
                      showgrid: true,
                      zeroline: false,
                      tickfont: { color: '#c7d2fe' }
                    },
                    yaxis: {
                      title: {
                        text: 'Нормализованный поток',
                        font: { color: '#e2e8f0', size: 14 }
                      },
                      color: '#e2e8f0',
                      gridcolor: '#4c1d95',
                      showgrid: true,
                      zeroline: false,
                      tickfont: { color: '#c7d2fe' }
                    },
                    paper_bgcolor: 'transparent',
                    plot_bgcolor: 'transparent',
                    font: { 
                      color: '#e2e8f0',
                      family: 'Inter, system-ui, sans-serif'
                    },
                    legend: {
                      x: 0.02,
                      y: 0.98,
                      bgcolor: 'rgba(76,29,149,0.3)',
                      bordercolor: '#8b5cf6',
                      borderwidth: 1,
                      font: { color: '#e2e8f0' }
                    },
                    margin: { l: 60, r: 40, t: 60, b: 60 },
                    hovermode: 'closest' as const,
                    showlegend: true
                  }}
                  style={{ width: '100%', height: '600px' }}
                  config={{
                    displayModeBar: true,
                    modeBarButtonsToRemove: ['pan2d', 'lasso2d'],
                    displaylogo: false,
                    toImageButtonOptions: {
                      format: 'png',
                      filename: `TIC_${lightcurveData.tic_id}_lightcurve`,
                      height: 600,
                      width: 1200,
                      scale: 2
                    }
                  }}
                  useResizeHandler={true}
                  />
                </Suspense>
              </div>

              {/* Подсказки */}
              <div className="mt-4 flex flex-wrap gap-4 text-xs text-slate-400 justify-center">
                <div className="flex items-center gap-1">
                  <div className="w-3 h-3 bg-blue-400 rounded-full"></div>
                  <span>Исходные данные</span>
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-3 h-1 bg-yellow-500"></div>
                  <span>Сглаженная кривая</span>
                </div>
                {candidates.length > 0 && (
                  <div className="flex items-center gap-1">
                    <div className="w-3 h-1 bg-green-500 border-dashed border"></div>
                    <span>Обнаруженные транзиты ({candidates.length})</span>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
};

export default App;
