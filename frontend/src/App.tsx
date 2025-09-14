import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Starfield from './components/Starfield';
import Header from './components/Header';
import Dashboard from './components/Dashboard';
import DataLoader from './components/DataLoader';
import ModelSelector, { type ModelType } from './components/ModelSelector';
import Results from './components/Results';
import { exoplanetApi, type LightcurveData } from './api/exoplanetApi';

type AppStep = 'dashboard' | 'data-loading' | 'model-selection' | 'analysis' | 'results';

interface Candidate {
  id: string;
  period: number;
  depth: number;
  duration: number;
  confidence: number;
  startTime: number;
  endTime: number;
  method: string;
}

const App: React.FC = () => {
  const [currentStep, setCurrentStep] = useState<AppStep>('dashboard');
  const [lightcurveData, setLightcurveData] = useState<LightcurveData | null>(null);
  const [selectedModel, setSelectedModel] = useState<ModelType>('hybrid');
  const [, setIsAnalyzing] = useState(false);
  const [candidates, setCandidates] = useState<Candidate[]>([]);

  const handleStartSearch = () => {
    setCurrentStep('data-loading');
  };

  const handleDataLoaded = (data: LightcurveData) => {
    setLightcurveData(data);
    setCurrentStep('model-selection');
  };

  const handleModelChange = (model: ModelType) => {
    setSelectedModel(model);
  };

  const handleStartAnalysis = async () => {
    if (!lightcurveData) return;

    setIsAnalyzing(true);
    setCurrentStep('analysis');

    try {
      // Выполняем анализ через API
      const response = await exoplanetApi.analyzeLightcurve(lightcurveData, selectedModel);
      
      if (response.success) {
        // Конвертируем кандидатов в формат компонента Results
        const convertedCandidates: Candidate[] = response.candidates.map(candidate => ({
          id: candidate.id,
          period: candidate.period,
          depth: candidate.depth,
          duration: candidate.duration,
          confidence: candidate.confidence,
          startTime: candidate.start_time,
          endTime: candidate.end_time,
          method: candidate.method
        }));
        
        setCandidates(convertedCandidates);
        setCurrentStep('results');
      } else {
        console.error('Analysis failed:', response.error);
        setCurrentStep('data-loading');
      }
    } catch (error) {
      console.error('Analysis failed:', error);
      setCurrentStep('data-loading');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleReset = () => {
    setCurrentStep('dashboard');
    setLightcurveData(null);
    setCandidates([]);
    setIsAnalyzing(false);
  };

  const renderCurrentStep = () => {
    switch (currentStep) {
      case 'dashboard':
        return <Dashboard onStartSearch={handleStartSearch} />;
      
      case 'data-loading':
        return (
          <div className="min-h-screen flex items-center justify-center px-6">
            <DataLoader onDataLoaded={handleDataLoaded} />
          </div>
        );
      
      case 'model-selection':
        return (
          <div className="min-h-screen flex items-center justify-center px-6 py-20">
            <ModelSelector
              selectedModel={selectedModel}
              onModelChange={handleModelChange}
              onStartAnalysis={handleStartAnalysis}
              isAnalyzing={false}
            />
          </div>
        );
      
      case 'analysis':
        return (
          <div className="min-h-screen flex items-center justify-center px-6">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="space-card max-w-2xl mx-auto text-center"
            >
              <div className="mb-8">
                <div className="w-20 h-20 mx-auto mb-6 relative">
                  <div className="absolute inset-0 border-4 border-cyan-500/30 rounded-full"></div>
                  <div className="absolute inset-0 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin"></div>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-8 h-8 bg-gradient-to-r from-cyan-500 to-purple-600 rounded-full animate-pulse"></div>
                  </div>
                </div>
                <h2 className="text-3xl font-bold text-white mb-4">
                  Анализ в процессе
                </h2>
                <p className="text-slate-400 mb-6">
                  Модель {selectedModel} анализирует кривую блеска...
                </p>
                <div className="space-y-2 text-sm text-slate-500">
                  <div className="flex items-center justify-center space-x-2">
                    <div className="w-2 h-2 bg-cyan-400 rounded-full animate-pulse"></div>
                    <span>Предобработка данных</span>
                  </div>
                  <div className="flex items-center justify-center space-x-2">
                    <div className="w-2 h-2 bg-purple-400 rounded-full animate-pulse"></div>
                    <span>Поиск периодических сигналов</span>
                  </div>
                  <div className="flex items-center justify-center space-x-2">
                    <div className="w-2 h-2 bg-yellow-400 rounded-full animate-pulse"></div>
                    <span>Классификация кандидатов</span>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        );
      
      case 'results':
        return (
          <div className="min-h-screen px-6 py-20">
            <Results
              lightcurveData={lightcurveData!}
              candidates={candidates}
              modelType={selectedModel}
              onReset={handleReset}
            />
          </div>
        );
      
      default:
        return <Dashboard onStartSearch={handleStartSearch} />;
    }
  };

  return (
    <div className="min-h-screen cosmic-gradient relative overflow-hidden">
      <Starfield />
      
      <div className="relative z-10">
        <Header />
        
        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.5 }}
          >
            {renderCurrentStep()}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Background Elements */}
      <div className="fixed top-1/4 left-10 w-32 h-32 opacity-10 pointer-events-none">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
          className="w-full h-full"
        >
          <div className="w-full h-full border-2 border-cyan-400 rounded-full"></div>
        </motion.div>
      </div>

      <div className="fixed bottom-1/4 right-20 w-24 h-24 opacity-10 pointer-events-none">
        <motion.div
          animate={{ rotate: -360 }}
          transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
          className="w-full h-full"
        >
          <div className="w-full h-full border-2 border-purple-400 rounded-full"></div>
        </motion.div>
      </div>
    </div>
  );
};

export default App;