export interface SearchRequest {
  targetName: string
  catalog: 'TIC' | 'KIC' | 'EPIC'
  mission: 'TESS' | 'Kepler' | 'K2'
  periodMin: number
  periodMax: number
  durationMin: number
  durationMax: number
  snrThreshold: number
}

export interface SearchResult {
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
  analysisType: 'amateur' | 'pro' | 'bls'
  metrics: {
    transitCount: number
    falsePositiveProbability: number
    signalSignificance: number
  }
}

export interface LightCurveData {
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

export interface Target {
  ticId: string
  targetName: string
  coordinates: {
    ra: number
    dec: number
  }
  magnitude: {
    tmag: number
    vmag?: number
    kmag?: number
  }
  properties: {
    teff?: number
    logg?: number
    radius?: number
    mass?: number
  }
}

export interface HealthStatus {
  status: 'healthy' | 'degraded' | 'unhealthy'
  timestamp: string
  servicesAvailable: boolean
  databaseAvailable: boolean
  services: {
    api: string
    database: string
    aiModels: string
    dataIngestion: string
  }
}

export type ExportFormat = 'csv' | 'json' | 'pdf' | 'fits'

export interface AnalysisParameters {
  targetId: string
  analysisType: 'amateur' | 'pro' | 'bls'
  parameters: {
    periodMin?: number
    periodMax?: number
    durationMin?: number
    durationMax?: number
    snrThreshold?: number
    blsParams?: {
      minPeriod: number
      maxPeriod: number
      frequencyFactor: number
      duration: number
    }
  }
}

export interface AnalysisResult {
  id: string
  targetId: string
  targetName: string
  status: 'pending' | 'processing' | 'completed' | 'failed'
  analysisType: 'amateur' | 'pro' | 'bls'
  createdAt: string
  updatedAt: string
  parameters: AnalysisParameters['parameters']
  results: {
    period?: number
    duration?: number
    depth?: number
    snr?: number
    confidence?: number
    transitCount?: number
    lightCurve?: LightCurveData
    phaseFoldedCurve?: {
      phase: number[]
      flux: number[]
      fluxErr: number[]
    }
  }
  metrics: {
    falsePositiveProbability: number
    signalSignificance: number
    transitDepth: number
    transitDuration: number
  }
  error?: string
}

export interface CatalogEntry {
  id: string
  ticId: string
  targetName: string
  coordinates: {
    ra: number
    dec: number
  }
  magnitude: {
    tmag: number
    vmag?: number
    kmag?: number
  }
  properties: {
    teff?: number
    logg?: number
    radius?: number
    mass?: number
    distance?: number
  }
  mission: 'TESS' | 'Kepler' | 'K2'
  sector?: number
  camera?: number
  ccd?: number
  priority: number
  status: 'observed' | 'planned' | 'completed'
}

export interface BLSResult {
  period: number
  duration: number
  depth: number
  snr: number
  significance: number
  powerSpectrum: {
    frequency: number[]
    power: number[]
    peakFrequency: number
    peakPower: number
  }
  parameters: {
    minPeriod: number
    maxPeriod: number
    frequencyFactor: number
    duration: number
  }
}

export interface FeedbackRequest {
  analysisId: string
  targetName: string
  feedbackType: 'positive' | 'negative' | 'correction'
  isCorrect: boolean
  userClassification?: string
  comments?: string
}
