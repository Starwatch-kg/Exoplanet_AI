#!/usr/bin/env python3
"""
FastAPI Backend для веб-платформы поиска экзопланет
Интегрируется с существующим ML пайплайном
"""

import os
import sys
import asyncio
import logging
from pathlib import Path
from typing import List, Dict, Any, Optional
import json
import numpy as np
from datetime import datetime

# Добавляем путь к src для импорта ML модулей
src_path = str(Path(__file__).parent.parent / "src")
sys.path.insert(0, src_path)
sys.path.insert(0, str(Path(__file__).parent.parent))

from fastapi import FastAPI, HTTPException, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from pydantic import BaseModel, Field
import uvicorn

# Создаем заглушки для ML модулей (временно для запуска)
logging.warning("Используются заглушки для ML модулей")
ExoplanetSearchPipeline = None
TESSDataLoader = None
HybridTransitSearch = None
SelfSupervisedRepresentationLearner = None
AnomalyEnsemble = None
ResultsExporter = None
ExoplanetCandidate = None

# Настройка логирования
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Инициализация FastAPI
app = FastAPI(
    title="Exoplanet AI API",
    description="API для поиска экзопланет с использованием машинного обучения",
    version="1.0.0"
)

# CORS настройки
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000"],  # Vite dev server
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Pydantic модели
class LightcurveData(BaseModel):
    tic_id: str
    times: List[float]
    fluxes: List[float]

class AnalysisRequest(BaseModel):
    lightcurve_data: LightcurveData
    model_type: str = Field(..., description="Тип модели: autoencoder, classifier, hybrid, ensemble")
    parameters: Optional[Dict[str, Any]] = None

class Candidate(BaseModel):
    id: str
    period: float
    depth: float
    duration: float
    confidence: float
    start_time: float
    end_time: float
    method: str

class AnalysisResponse(BaseModel):
    success: bool
    candidates: List[Candidate]
    processing_time: float
    model_used: str
    statistics: Dict[str, Any]
    error: Optional[str] = None

class TICRequest(BaseModel):
    tic_id: str
    sectors: Optional[List[int]] = None

# Глобальные переменные для кэширования
pipeline_cache = {}
analysis_results = {}

# Инициализация ML компонентов
def initialize_ml_components():
    """Инициализация ML компонентов"""
    global pipeline_cache
    
    try:
        if ExoplanetSearchPipeline:
            pipeline_cache['main_pipeline'] = ExoplanetSearchPipeline('src/config.yaml')
            logger.info("Основной пайплайн инициализирован")
        
        if TESSDataLoader:
            pipeline_cache['data_loader'] = TESSDataLoader(cache_dir="backend_cache")
            logger.info("Загрузчик данных TESS инициализирован")
        
        if HybridTransitSearch:
            pipeline_cache['hybrid_search'] = HybridTransitSearch()
            logger.info("Гибридный поиск инициализирован")
            
        logger.info("ML компоненты успешно инициализированы")
        
    except Exception as e:
        logger.error(f"Ошибка инициализации ML компонентов: {e}")

# Инициализация при запуске
@app.on_event("startup")
async def startup_event():
    """Инициализация при запуске приложения"""
    logger.info("Запуск Exoplanet AI API...")
    initialize_ml_components()

# API эндпоинты
@app.get("/")
async def root():
    """Корневой эндпоинт"""
    return {
        "message": "Exoplanet AI API",
        "version": "1.0.0",
        "status": "running",
        "endpoints": {
            "health": "/health",
            "analyze": "/analyze",
            "load_tic": "/load-tic",
            "models": "/models"
        }
    }

@app.get("/health")
async def health_check():
    """Проверка состояния API"""
    return {
        "status": "healthy",
        "timestamp": datetime.now().isoformat(),
        "version": "1.0.0",
        "ml_components": {
            "pipeline": pipeline_cache.get('main_pipeline') is not None,
            "hybrid_search": pipeline_cache.get('hybrid_search') is not None
        }
    }

@app.get("/api/nasa/stats")
async def get_nasa_stats():
    """Получение статистики NASA для лендинга"""
    return {
        "totalPlanets": 10000,  # Примерное количество подтвержденных экзопланет
        "totalHosts": 6000     # Примерное количество звезд-хозяев
    }


@app.post("/load-tic")
async def load_tic_data(request: TICRequest):
    """Загрузка данных TESS по TIC ID"""
    try:
        tic_id = request.tic_id
        sectors = request.sectors
        
        logger.info(f"Загрузка данных для TIC {tic_id}")
        
        # Если есть реальный загрузчик данных
        if "data_loader" in pipeline_cache:
            try:
                # Загружаем реальные данные
                lightcurve = pipeline_cache['data_loader'].load_lightcurve(tic_id, sectors)
                if lightcurve:
                    return {
                        "success": True,
                        "data": {
                            "tic_id": tic_id,
                            "times": lightcurve['times'].tolist(),
                            "fluxes": lightcurve['fluxes'].tolist(),
                            "metadata": lightcurve.get('metadata', {})
                        }
                    }
            except Exception as e:
                logger.warning(f"Ошибка загрузки реальных данных: {e}")
        
        # Генерируем синтетические данные для демонстрации
        logger.info("Генерация синтетических данных для демонстрации")
        
        # Создаем синтетическую кривую блеска
        times = np.linspace(0, 30, 2000)  # 30 дней, 2000 точек
        base_flux = np.ones_like(times)
        
        # Добавляем шум
        noise = np.random.normal(0, 0.01, len(times))
        base_flux += noise
        
        # Добавляем звездную вариацию
        stellar_variation = 0.005 * np.sin(2 * np.pi * times / 5.0)
        base_flux += stellar_variation
        
        # Случайно добавляем транзиты
        if np.random.rand() < 0.7:  # 70% вероятность транзита
            period = np.random.uniform(3, 20)
            depth = np.random.uniform(0.005, 0.03)
            duration = np.random.uniform(0.1, 0.5)
            t0 = np.random.uniform(0, period)
            
            for t in times:
                phase = (t - t0) % period
                if phase < duration or phase > (period - duration):
                    idx = int(t * len(times) / 30)
                    if 0 <= idx < len(base_flux):
                        base_flux[idx] -= depth
        
        return {
            "success": True,
            "data": {
                "tic_id": tic_id,
                "times": times.tolist(),
                "fluxes": base_flux.tolist(),
                "metadata": {
                    "synthetic": True,
                    "generated_at": datetime.now().isoformat()
                }
            }
        }
        
    except Exception as e:
        logger.error(f"Ошибка загрузки данных TIC {request.tic_id}: {e}")
        raise HTTPException(status_code=500, detail=f"Ошибка загрузки данных: {str(e)}")

@app.post("/analyze", response_model=AnalysisResponse)
async def analyze_lightcurve(request: AnalysisRequest):
    """Анализ кривой блеска с использованием выбранной модели (демо версия)"""
    start_time = datetime.now()
    
    try:
        logger.info(f"Начало анализа с моделью {request.model_type}")
        
        # Извлекаем данные
        times = np.array(request.lightcurve_data.times)
        fluxes = np.array(request.lightcurve_data.fluxes)
        tic_id = request.lightcurve_data.tic_id
        
        # Простой алгоритм детекции для демонстрации
        candidates = _simple_transit_detection(times, fluxes, request.model_type)
        
        # Вычисляем статистики
        processing_time = (datetime.now() - start_time).total_seconds()
        
        statistics = {
            "total_candidates": len(candidates),
            "average_confidence": np.mean([c.confidence for c in candidates]) if candidates else 0,
            "processing_time": processing_time,
            "data_points": len(times),
            "time_span": float(times[-1] - times[0]) if len(times) > 1 else 0
        }
        
        # Сохраняем результаты в кэш
        analysis_results[tic_id] = {
            "candidates": [c.dict() for c in candidates],
            "statistics": statistics,
            "timestamp": datetime.now().isoformat()
        }
        
        return AnalysisResponse(
            success=True,
            candidates=candidates,
            processing_time=processing_time,
            model_used=request.model_type,
            statistics=statistics
        )
        
    except Exception as e:
        logger.error(f"Ошибка анализа: {e}")
        return AnalysisResponse(
            success=False,
            candidates=[],
            processing_time=(datetime.now() - start_time).total_seconds(),
            model_used=request.model_type,
            statistics={},
            error=str(e)
        )

def _simple_transit_detection(times: np.ndarray, fluxes: np.ndarray, method: str) -> List[Candidate]:
    """Простой алгоритм детекции транзитов для демонстрации"""
    candidates = []
    
    # Вычисляем статистики
    mean_flux = np.mean(fluxes)
    std_flux = np.std(fluxes)
    threshold = mean_flux - 2 * std_flux
    
    # Ищем области с пониженным потоком
    in_transit = fluxes < threshold
    
    # Группируем соседние точки
    groups = []
    current_group = []
    
    for i, is_transit in enumerate(in_transit):
        if is_transit:
            current_group.append(i)
        else:
            if len(current_group) >= 5:  # Минимум 5 точек для транзита
                groups.append(current_group)
            current_group = []
    
    # Добавляем последнюю группу
    if len(current_group) >= 5:
        groups.append(current_group)
    
    # Создаем кандидатов
    for i, group in enumerate(groups[:3]):  # Максимум 3 кандидата
        start_idx = group[0]
        end_idx = group[-1]
        
        period = np.random.uniform(5, 20)  # Случайный период
        depth = mean_flux - np.min(fluxes[group])
        duration = times[end_idx] - times[start_idx]
        confidence = min(0.9, depth / std_flux * 0.1 + np.random.uniform(0.6, 0.8))
        
        candidates.append(Candidate(
            id=f"{method}_{i}",
            period=period,
            depth=depth,
            duration=duration,
            confidence=confidence,
            start_time=times[start_idx],
            end_time=times[end_idx],
            method=method
        ))
    
    return candidates


if __name__ == "__main__":
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=8000,
        reload=True,
        log_level="info"
    )
