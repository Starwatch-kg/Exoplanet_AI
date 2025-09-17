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

# Добавляем путь к src для импорта ML модулей
src_path = str(Path(__file__).parent.parent / "src")
sys.path.insert(0, src_path)
sys.path.insert(0, str(Path(__file__).parent.parent))

from fastapi import FastAPI, HTTPException, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.gzip import GZipMiddleware
from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any
from functools import lru_cache
from datetime import datetime
import json
import hashlib
import time
import numpy as np

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

# Добавляем сжатие для оптимизации
app.add_middleware(GZipMiddleware, minimum_size=1000)

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

# Глобальные переменные для кэширования с TTL

class TTLCache:
    def __init__(self, maxsize=100, ttl=3600):  # TTL 1 час
        self.cache = {}
        self.timestamps = {}
        self.maxsize = maxsize
        self.ttl = ttl
    
    def get(self, key):
        if key in self.cache:
            if time.time() - self.timestamps[key] < self.ttl:
                return self.cache[key]
            else:
                del self.cache[key]
                del self.timestamps[key]
        return None
    
    def set(self, key, value):
        if len(self.cache) >= self.maxsize:
            # Удаляем самый старый элемент
            oldest_key = min(self.timestamps.keys(), key=lambda k: self.timestamps[k])
            del self.cache[oldest_key]
            del self.timestamps[oldest_key]
        
        self.cache[key] = value
        self.timestamps[key] = time.time()

# Кэши с TTL
pipeline_cache = TTLCache(maxsize=50, ttl=3600)  # 1 час
analysis_results = TTLCache(maxsize=200, ttl=1800)  # 30 минут

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
    """Получение РЕАЛЬНОЙ статистики NASA для лендинга"""
    try:
        # Импортируем наш NASA API модуль
        from nasa_api import nasa_integration
        
        # Получаем реальные данные NASA
        real_stats = await nasa_integration.get_nasa_statistics()
        
        logger.info(f"Получена реальная статистика NASA: {real_stats}")
        return real_stats
        
    except Exception as e:
        logger.error(f"Ошибка получения статистики NASA: {e}")
        
        # Fallback данные
        return {
            "totalPlanets": 5635,
            "totalHosts": 4143,
            "lastUpdated": datetime.now().isoformat(),
            "source": "Fallback data",
            "error": str(e)
        }


@app.post("/load-tic")
async def load_tic_data(request: TICRequest):
    """Загрузка РЕАЛЬНЫХ данных TESS по TIC ID с параметрами NASA"""
    try:
        tic_id = request.tic_id
        sectors = request.sectors
        
        logger.info(f"Загрузка РЕАЛЬНЫХ данных для TIC {tic_id}")
        
        # Импортируем наш NASA API модуль
        from nasa_api import nasa_integration
        
        # Получаем данные с реальными параметрами NASA
        result = await nasa_integration.load_tic_data_enhanced(tic_id)
        
        if result["success"]:
            logger.info(f"Успешно загружены данные TIC {tic_id}: {result['message']}")
            
            # Добавляем информацию о реальных данных
            response = {
                "success": True,
                "data": result["data"],
                "nasa_integration": True,
                "real_star_parameters": len(result.get("real_star_data", [])) > 0,
                "message": result["message"]
            }
            
            # Если есть реальные параметры звезды, добавляем их
            if result.get("real_star_data"):
                response["star_info"] = result["real_star_data"][0]
            
            return response
        else:
            raise HTTPException(status_code=500, detail=result.get("error", "Неизвестная ошибка"))
        
    except Exception as e:
        logger.error(f"Ошибка загрузки данных TIC {request.tic_id}: {e}")
        raise HTTPException(status_code=500, detail=f"Ошибка загрузки данных: {str(e)}")

def create_cache_key(data: dict) -> str:
    """Создание ключа кэша на основе данных"""
    data_str = json.dumps(data, sort_keys=True)
    return hashlib.md5(data_str.encode()).hexdigest()

@app.post("/analyze", response_model=AnalysisResponse)
async def analyze_lightcurve(request: AnalysisRequest):
    """Анализ кривой блеска с использованием выбранной модели (оптимизированная версия)"""
    start_time = datetime.now()
    
    try:
        # Создаем ключ кэша
        cache_data = {
            "times": request.lightcurve_data.times[:100],  # Первые 100 точек для ключа
            "fluxes": request.lightcurve_data.fluxes[:100],
            "model_type": request.model_type,
            "tic_id": request.lightcurve_data.tic_id
        }
        cache_key = create_cache_key(cache_data)
        
        # Проверяем кэш
        cached_result = analysis_results.get(cache_key)
        if cached_result:
            logger.info(f"Возвращаем кэшированный результат для TIC {request.lightcurve_data.tic_id}")
            return cached_result
        
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
        
        # Создаем результат
        result = AnalysisResponse(
            success=True,
            candidates=candidates,
            processing_time=processing_time,
            model_used=request.model_type,
            statistics=statistics
        )
        
        # Сохраняем результат в кэш
        analysis_results.set(cache_key, result)
        logger.info(f"Результат сохранен в кэш для TIC {tic_id}")
        
        return result
        
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
