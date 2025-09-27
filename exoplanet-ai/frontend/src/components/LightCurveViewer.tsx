import React, { useState, useEffect, useMemo, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Play,
  Pause,
  RotateCcw,
  Download,
  Share2,
  Maximize2,
  Settings,
  Activity,
  TrendingUp,
  BarChart3,
  Zap,
  Eye,
  EyeOff,
  Filter,
  X
} from 'lucide-react'
import { createPlotlyComponent } from 'react-plotly.js'
import Plotly from 'plotly.js-dist-min'

const Plot = createPlotlyComponent(Plotly)

interface LightCurveData {
  time: number[]
  flux: number[]
  fluxErr: number[]
  quality: number[]
  metadata: {
    targetId: string
    sector?: number
    camera?: number
    ccd?: number
  }
}

interface TransitResult {
  period: number
  duration: number
  depth: number
  phase: number[]
  modelFlux: number[]
  confidence: number
}

interface LightCurveViewerProps {
  data: LightCurveData
  transitResult?: TransitResult
  isLoading?: boolean
  onPlay?: () => void
  onPause?: () => void
  onReset?: () => void
  className?: string
}

export const LightCurveViewer: React.FC<LightCurveViewerProps> = ({
  data,
  transitResult,
  isLoading = false,
  onPlay,
  onPause,
  onReset,
  className = ''
}) => {
  const [isPlaying, setIsPlaying] = useState(false)
  const [showTransitModel, setShowTransitModel] = useState(true)
  const [showErrors, setShowErrors] = useState(true)
  const [currentPhase, setCurrentPhase] = useState(0)
  const [viewMode, setViewMode] = useState<'time' | 'phase'>('time')
  const [selectedPoint, setSelectedPoint] = useState<number | null>(null)
  const [showSettings, setShowSettings] = useState(false)

  // Animation timer for phase folding
  useEffect(() => {
    if (!isPlaying || !transitResult) return

    const interval = setInterval(() => {
      setCurrentPhase(prev => (prev + 0.01) % 1)
    }, 100)

    return () => clearInterval(interval)
  }, [isPlaying, transitResult])

  // Memoized data processing
  const processedData = useMemo(() => {
    if (!data || !data.time || !data.flux) return null

    // Filter out invalid points
    const validMask = data.quality.map(q => q === 0)
    const time = data.time.filter((_, i) => validMask[i])
    const flux = data.flux.filter((_, i) => validMask[i])
    const fluxErr = data.fluxErr.filter((_, i) => validMask[i])

    return { time, flux, fluxErr }
  }, [data])

  // Phase-folded data
  const phaseFoldedData = useMemo(() => {
    if (!processedData || !transitResult || viewMode !== 'phase') return null

    const { time, flux, fluxErr } = processedData
    const { period } = transitResult

    // Calculate phases
    const phases = time.map(t => ((t % period) / period))
    const sortedIndices = phases.map((_, i) => i).sort((a, b) => phases[a] - phases[b])

    return {
      phases: sortedIndices.map(i => phases[i]),
      flux: sortedIndices.map(i => flux[i]),
      fluxErr: sortedIndices.map(i => fluxErr[i])
    }
  }, [processedData, transitResult, viewMode])

  // Plotly configuration
  const plotConfig = useMemo(() => ({
    displayModeBar: true,
    displaylogo: false,
    modeBarButtonsToRemove: ['pan2d', 'lasso2d', 'select2d'],
    modeBarButtonsToAdd: [{
      name: 'toggleModel',
      title: 'Toggle Transit Model',
      icon: Plotly.Icons.home,
      click: () => setShowTransitModel(!showTransitModel)
    }],
    responsive: true
  }), [showTransitModel])

  // Main plot data
  const plotData = useMemo(() => {
    if (!processedData) return []

    const traces = []

    // Raw data points
    if (viewMode === 'time') {
      traces.push({
        x: processedData.time,
        y: processedData.flux,
        mode: 'markers',
        type: 'scatter',
        name: 'Data',
        marker: {
          color: '#3b82f6',
          size: 4,
          opacity: 0.7
        },
        error_y: showErrors ? {
          type: 'data',
          array: processedData.fluxErr,
          visible: true,
          color: '#ef4444'
        } : undefined
      })
    } else if (phaseFoldedData) {
      traces.push({
        x: phaseFoldedData.phases,
        y: phaseFoldedData.flux,
        mode: 'markers',
        type: 'scatter',
        name: 'Phase-folded Data',
        marker: {
          color: '#3b82f6',
          size: 4,
          opacity: 0.7
        },
        error_y: showErrors ? {
          type: 'data',
          array: phaseFoldedData.fluxErr,
          visible: true,
          color: '#ef4444'
        } : undefined
      })
    }

    // Transit model
    if (showTransitModel && transitResult && viewMode === 'phase' && phaseFoldedData) {
      traces.push({
        x: phaseFoldedData.phases,
        y: transitResult.modelFlux,
        mode: 'lines',
        type: 'scatter',
        name: 'Transit Model',
        line: {
          color: '#ef4444',
          width: 3,
          shape: 'spline'
        }
      })
    }

    return traces
  }, [processedData, phaseFoldedData, transitResult, viewMode, showTransitModel, showErrors])

  // Plot layout
  const plotLayout = useMemo(() => ({
    title: {
      text: `Light Curve - ${data?.metadata?.targetId || 'Unknown Target'}`,
      font: { size: 16, color: '#ffffff' }
    },
    paper_bgcolor: 'rgba(0,0,0,0)',
    plot_bgcolor: 'rgba(0,0,0,0)',
    font: { color: '#ffffff' },
    xaxis: {
      title: viewMode === 'time' ? 'Time (BJD)' : 'Phase',
      gridcolor: '#374151',
      linecolor: '#6b7280'
    },
    yaxis: {
      title: 'Normalized Flux',
      gridcolor: '#374151',
      linecolor: '#6b7280'
    },
    margin: { t: 60, r: 30, b: 60, l: 80 },
    showlegend: true,
    legend: {
      x: 1,
      y: 1,
      xanchor: 'right',
      yanchor: 'top',
      bgcolor: 'rgba(0,0,0,0.5)'
    }
  }), [data, viewMode])

  const handlePlayPause = useCallback(() => {
    setIsPlaying(!isPlaying)
    if (isPlaying && onPause) onPause()
    else if (!isPlaying && onPlay) onPlay()
  }, [isPlaying, onPlay, onPause])

  const handleReset = useCallback(() => {
    setIsPlaying(false)
    setCurrentPhase(0)
    if (onReset) onReset()
  }, [onReset])

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96 bg-gray-900/50 rounded-xl border border-gray-700">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-lg text-gray-300">Loading light curve data...</p>
        </div>
      </div>
    )
  }

  if (!processedData) {
    return (
      <div className="flex items-center justify-center h-96 bg-gray-900/50 rounded-xl border border-gray-700">
        <div className="text-center">
          <BarChart3 className="h-16 w-16 text-gray-600 mx-auto mb-4" />
          <p className="text-lg text-gray-400">No data available</p>
        </div>
      </div>
    )
  }

  return (
    <div className={`bg-gray-900/50 rounded-xl border border-gray-700 overflow-hidden ${className}`}>
      {/* Header Controls */}
      <div className="flex items-center justify-between p-4 border-b border-gray-700">
        <div className="flex items-center space-x-4">
          <h3 className="text-lg font-semibold text-white">Light Curve Analysis</h3>

          {/* View Mode Toggle */}
          <div className="flex bg-gray-800 rounded-lg p-1">
            <button
              onClick={() => setViewMode('time')}
              className={`px-3 py-1 text-sm rounded-md transition-colors ${
                viewMode === 'time'
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              Time
            </button>
            <button
              onClick={() => setViewMode('phase')}
              className={`px-3 py-1 text-sm rounded-md transition-colors ${
                viewMode === 'phase'
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              Phase
            </button>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          {/* Animation Controls */}
          {transitResult && (
            <>
              <button
                onClick={handlePlayPause}
                className="p-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                title={isPlaying ? 'Pause animation' : 'Play animation'}
              >
                {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
              </button>

              <button
                onClick={handleReset}
                className="p-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors"
                title="Reset animation"
              >
                <RotateCcw className="h-4 w-4" />
              </button>
            </>
          )}

          {/* Display Options */}
          <button
            onClick={() => setShowSettings(!showSettings)}
            className="p-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors"
            title="Display options"
          >
            <Settings className="h-4 w-4" />
          </button>

          {/* Export Options */}
          <button
            className="p-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors"
            title="Export data"
          >
            <Download className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Settings Panel */}
      <AnimatePresence>
        {showSettings && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="border-b border-gray-700 overflow-hidden"
          >
            <div className="p-4 bg-gray-800/50">
              <div className="flex items-center justify-between mb-4">
                <h4 className="text-sm font-medium text-white">Display Options</h4>
                <button
                  onClick={() => setShowSettings(false)}
                  className="text-gray-400 hover:text-white"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <label className="flex items-center space-x-2 text-sm">
                  <input
                    type="checkbox"
                    checked={showErrors}
                    onChange={(e) => setShowErrors(e.target.checked)}
                    className="rounded border-gray-600 bg-gray-700 text-blue-600"
                  />
                  <span className="text-gray-300">Show Error Bars</span>
                </label>

                <label className="flex items-center space-x-2 text-sm">
                  <input
                    type="checkbox"
                    checked={showTransitModel}
                    onChange={(e) => setShowTransitModel(e.target.checked)}
                    className="rounded border-gray-600 bg-gray-700 text-blue-600"
                  />
                  <span className="text-gray-300">Show Transit Model</span>
                </label>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Plot Container */}
      <div className="relative">
        <Plot
          data={plotData}
          layout={plotLayout}
          config={plotConfig}
          style={{ width: '100%', height: '500px' }}
          useResizeHandler={true}
        />

        {/* Loading Overlay */}
        {isLoading && (
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-2"></div>
              <p className="text-sm text-gray-300">Processing data...</p>
            </div>
          </div>
        )}
      </div>

      {/* Statistics Panel */}
      {transitResult && (
        <div className="p-4 bg-gray-800/50 border-t border-gray-700">
          <h4 className="text-sm font-medium text-white mb-3">Transit Statistics</h4>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div>
              <span className="text-gray-400">Period:</span>
              <span className="ml-2 font-medium text-white">{transitResult.period.toFixed(4)} days</span>
            </div>
            <div>
              <span className="text-gray-400">Duration:</span>
              <span className="ml-2 font-medium text-white">{transitResult.duration.toFixed(4)} days</span>
            </div>
            <div>
              <span className="text-gray-400">Depth:</span>
              <span className="ml-2 font-medium text-white">{(transitResult.depth * 100).toFixed(2)}%</span>
            </div>
            <div>
              <span className="text-gray-400">Confidence:</span>
              <span className="ml-2 font-medium text-green-400">{transitResult.confidence.toFixed(1)}%</span>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default LightCurveViewer
