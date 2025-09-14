#!/bin/bash

# Скрипт для запуска backend сервера

echo "🚀 Запуск Exoplanet AI Backend..."

# Переходим в директорию backend
cd backend

# Проверяем наличие виртуального окружения
if [ ! -d "venv" ]; then
    echo "📦 Создание виртуального окружения..."
    python3 -m venv venv
fi

# Активируем виртуальное окружение
echo "🔧 Активация виртуального окружения..."
source venv/bin/activate

# Устанавливаем зависимости
echo "📥 Установка зависимостей..."
pip install -r requirements.txt

# Запускаем сервер
echo "🌐 Запуск FastAPI сервера на http://localhost:8000"
python main.py
