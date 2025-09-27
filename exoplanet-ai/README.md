# ExoplanetAI - Advanced AI-Powered Exoplanet Detection System

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Python 3.11+](https://img.shields.io/badge/python-3.11+-blue.svg)](https://www.python.org/downloads/)
[![React 18+](https://img.shields.io/badge/react-18+-61dafb.svg)](https://reactjs.org/)
[![Docker](https://img.shields.io/badge/docker-ready-2496ed.svg)](https://docker.com)
[![NASA Space Apps](https://img.shields.io/badge/NASA-Space%20Apps-orange.svg)](https://spaceappschallenge.org/)

> 🚀 **Advanced AI-powered system for detecting exoplanets using TESS, Kepler, and K2 mission data**

## 🌟 Features

- **🤖 AI-Powered Analysis**: State-of-the-art machine learning models for transit detection
- **📡 Multi-Mission Support**: TESS, Kepler, and K2 data integration
- **⚡ BLS Algorithm**: Optimized Box Least Squares with ensemble methods
- **📊 Interactive Visualization**: Modern React interface with Plotly charts
- **🔬 Professional Tools**: Advanced analysis tools for astronomers
- **🌐 Real-time Processing**: Live data analysis and results
- **📱 Responsive Design**: Works on desktop, tablet, and mobile
- **🔒 Production Ready**: Docker deployment with monitoring

## 🏗️ Architecture

```
exoplanet-ai/
├── frontend/           # React/TypeScript frontend
│   ├── src/
│   │   ├── components/ # Reusable UI components
│   │   ├── pages/      # Application pages
│   │   ├── services/   # API services
│   │   └── types/      # TypeScript definitions
│   └── public/         # Static assets
├── backend/            # Python FastAPI backend
│   ├── config/         # Configuration files
│   ├── ml/             # Machine learning models
│   ├── services/       # Business logic
│   └── tests/          # Test suite
├── ml/                 # ML algorithms and models
├── docs/               # Documentation
├── config/             # Configuration files
└── scripts/            # Deployment scripts
```

## 🚀 Quick Start

### Prerequisites

- **Docker & Docker Compose** (recommended)
- **Python 3.11+** (for development)
- **Node.js 18+** (for development)
- **Git**

### Option 1: Docker (Recommended)

```bash
# Clone the repository
git clone https://github.com/your-org/exoplanet-ai.git
cd exoplanet-ai

# Start with Docker Compose
docker-compose up -d

# Access the application
# Frontend: http://localhost
# Backend API: http://localhost/api/v1
# Health Check: http://localhost/health
```

### Option 2: Local Development

```bash
# Backend setup
cd exoplanet-ai/backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\\Scripts\\activate
pip install -r requirements.txt
uvicorn main:app --host 0.0.0.0 --port 8001 --reload

# Frontend setup (new terminal)
cd exoplanet-ai/frontend
npm install
npm run dev

# Access the application
# Frontend: http://localhost:5173
# Backend API: http://localhost:8001/api/v1
```

## 📖 Usage Guide

### Basic Analysis

1. **Navigate to Search Page**: Use the navigation menu or visit `/search`
2. **Enter Target ID**: Input a TIC, KIC, or EPIC ID (e.g., "TIC 123456789")
3. **Configure Parameters**: Adjust period range, duration, and SNR threshold
4. **Start Analysis**: Click "Start Search" to begin BLS analysis
5. **View Results**: Examine the light curve and transit parameters

### Advanced Features

- **Phase Folding**: View data folded on the detected period
- **Interactive Plots**: Zoom, pan, and explore light curve data
- **Export Options**: Download results in CSV, JSON, or PDF format
- **History Tracking**: Save and manage analysis history

### API Usage

```python
import requests

# Health check
response = requests.get('http://localhost:8001/api/v1/health')

# Search for exoplanets
search_data = {
    "targetName": "TIC 123456789",
    "catalog": "TIC",
    "mission": "TESS",
    "periodMin": 0.5,
    "periodMax": 50.0,
    "snrThreshold": 7.0
}

response = requests.post('http://localhost:8001/api/v1/search', json=search_data)
results = response.json()
```

## 🔧 Configuration

### Environment Variables

Create a `.env` file in the project root:

```env
# API Configuration
API_V1_STR=/api/v1
SECRET_KEY=your-secret-key-here
ACCESS_TOKEN_EXPIRE_MINUTES=10080

# Database
DATABASE_URL=sqlite:///./exoplanet_ai.db
REDIS_URL=redis://localhost:6379/0

# External APIs
NASA_API_KEY=your-nasa-api-key
MAST_API_TOKEN=your-mast-token

# AI Configuration
ENABLE_AI_FEATURES=true
MODEL_CACHE_DIR=./ml_models
MAX_MODEL_MEMORY_MB=2048

# Monitoring
SENTRY_DSN=your-sentry-dsn
LOG_LEVEL=INFO
```

### BLS Algorithm Configuration

```python
from ml.bls_ensemble import BLSParameters

# Custom BLS parameters
params = BLSParameters(
    min_period=0.5,
    max_period=100.0,
    duration=0.1,
    frequency_factor=1.0,
    snr_threshold=7.0
)
```

## 🧪 Testing

### Run Test Suite

```bash
# Backend tests
cd exoplanet-ai/backend
pytest tests/ -v

# Frontend tests
cd exoplanet-ai/frontend
npm test

# Integration tests
python test_system.py
```

### Performance Testing

```bash
# Load testing
python test_load.py

# Memory profiling
python -m memory_profiler test_memory.py
```

## 📊 Monitoring

### Health Checks

- **Application Health**: `GET /health`
- **Database Status**: `GET /api/v1/health/database`
- **AI Models Status**: `GET /api/v1/health/models`

### Metrics Endpoints

- **Prometheus Metrics**: `GET /metrics`
- **API Statistics**: `GET /api/v1/stats`

## 🚢 Deployment

### Production Deployment

```bash
# Build production image
docker build -t exoplanet-ai:latest .

# Run with production configuration
docker run -d \
  --name exoplanet-ai \
  -p 80:80 \
  -p 8001:8001 \
  -v /path/to/data:/app/data \
  -e DATABASE_URL=postgresql://user:pass@db:5432/exoplanet_ai \
  exoplanet-ai:latest
```

### Kubernetes Deployment

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: exoplanet-ai
spec:
  replicas: 3
  selector:
    matchLabels:
      app: exoplanet-ai
  template:
    metadata:
      labels:
        app: exoplanet-ai
    spec:
      containers:
      - name: exoplanet-ai
        image: exoplanet-ai:latest
        ports:
        - containerPort: 8001
        env:
        - name: DATABASE_URL
          value: "postgresql://..."
---
apiVersion: v1
kind: Service
metadata:
  name: exoplanet-ai-service
spec:
  selector:
    app: exoplanet-ai
  ports:
  - port: 80
    targetPort: 8001
  type: LoadBalancer
```

## 🔬 Science & Algorithms

### BLS Ensemble Algorithm

Our enhanced BLS implementation includes:

- **Parallel Processing**: Multi-core CPU optimization
- **Ensemble Methods**: Multiple parameter combinations for robustness
- **Signal Preprocessing**: Advanced filtering and normalization
- **Statistical Validation**: False positive probability calculation

### Machine Learning Models

- **Transit Classifier**: CNN-based classification model
- **Period Optimization**: Gradient-based period refinement
- **Noise Characterization**: Automated noise modeling

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guide](docs/CONTRIBUTING.md).

### Development Workflow

1. **Fork the repository**
2. **Create a feature branch**: `git checkout -b feature/amazing-feature`
3. **Make your changes**
4. **Add tests**: Ensure test coverage > 90%
5. **Run the test suite**: `pytest tests/`
6. **Submit a pull request**

### Code Style

- **Python**: Black, isort, mypy
- **TypeScript**: ESLint, Prettier
- **Commits**: Conventional commits

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **NASA**: TESS, Kepler, and K2 mission data
- **Space Apps Challenge**: Inspiration and community
- **Astronomy Community**: Scientific guidance and feedback
- **Open Source Contributors**: Libraries and tools

## 📞 Support

- **Issues**: [GitHub Issues](https://github.com/your-org/exoplanet-ai/issues)
- **Discussions**: [GitHub Discussions](https://github.com/your-org/exoplanet-ai/discussions)
- **Documentation**: [Wiki](https://github.com/your-org/exoplanet-ai/wiki)

## 🔄 Changelog

See [CHANGELOG.md](docs/CHANGELOG.md) for version history.

---

**Made with ❤️ for space exploration and scientific discovery**
