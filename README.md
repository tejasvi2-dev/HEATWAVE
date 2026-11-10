# HEATGUARD AI – Extreme Heatwave Early Warning & Human Thermal Stress Index

A full-stack AI-powered heatwave monitoring and early-warning platform for Pune, Maharashtra, India.

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Status](https://img.shields.io/badge/status-prototype-orange.svg)

## 🌡️ Overview

HEATGUARD AI converts weather and environmental data into human thermal stress scores, predicts heat-health risk 3–5 days in advance, visualizes ward-level heat vulnerability, and provides actionable safety recommendations.

### Key Features

- **Command Center** – Real-time weather dashboard with thermal stress monitoring
- **Thermal Stress Analyzer** – Heat Index, WBGT estimation, and composite thermal stress scoring
- **Ward-Level Heat Risk Map** – Interactive Leaflet map with Pune ward risk visualization
- **AI Heat Prediction** – XGBoost-powered 3–5 day heat risk forecasting
- **Smart Alert System** – Threshold-based alert generation with severity levels
- **Heat-Safe Time Advisory** – Safer outdoor activity window recommendations
- **Cooling Center Navigator** – Interactive map of cooling centers with navigation support

## 🏗️ Architecture

```
heatwave_pccoe/
├── frontend/          # React + Vite + Tailwind CSS
├── backend/           # Node.js + Express + MongoDB
├── ai-engine/         # Python + Flask + XGBoost + Scikit-learn
└── README.md
```

### Technology Stack

| Layer       | Technologies                                           |
|-------------|-------------------------------------------------------|
| Frontend    | React.js, Vite, Tailwind CSS, Recharts, React Leaflet |
| Backend     | Node.js, Express.js, MongoDB, Mongoose                |
| AI Engine   | Python, Flask, XGBoost, Scikit-learn, Pandas, NumPy   |
| Weather API | Open-Meteo (no API key required)                      |

## 🚀 Getting Started

### Prerequisites

- **Node.js** v18+ and npm
- **Python** 3.9+
- **MongoDB** (local or Atlas connection string)
- **Git**

### Installation

#### 1. Clone the Repository

```bash
git clone <repository-url>
cd heatwave_pccoe
```

#### 2. Backend Setup

```bash
cd backend
npm install

# Create environment file
cp .env.example .env
# Edit .env with your MongoDB URI if needed

# Start the backend server
npm run dev
```

The backend starts on **http://localhost:5000**

#### 3. AI Engine Setup

```bash
cd ai-engine

# Create virtual environment (recommended)
python -m venv venv
# Windows:
venv\Scripts\activate
# macOS/Linux:
source venv/bin/activate

pip install -r requirements.txt

# Create environment file
cp .env.example .env

# (Optional) Train the ML model
python -m models.train_model

# Start the AI engine
python app.py
```

The AI engine starts on **http://localhost:8000**

#### 4. Frontend Setup

```bash
cd frontend
npm install

# Start the development server
npm run dev
```

The frontend starts on **http://localhost:5173**

### Running All Services

Open three terminal windows and run each service:

```
Terminal 1: cd backend && npm run dev
Terminal 2: cd ai-engine && python app.py
Terminal 3: cd frontend && npm run dev
```

Then open **http://localhost:5173** in your browser.

> **Note:** The frontend works in demo mode even without the backend and AI engine running. It will display clearly labeled demo/simulated data.

## 📊 Thermal Stress Methodology

### Heat Index (Rothfusz Regression)

The Heat Index is calculated using the NWS Rothfusz regression equation:

```
HI = -42.379 + 2.04901523T + 10.14333127RH - 0.22475541TRH 
     - 0.00683783T² - 0.05481717RH² + 0.00122874T²RH 
     + 0.00085282TRH² - 0.00000199T²RH²
```

Where T = temperature (°F) and RH = relative humidity (%).

### WBGT Estimation

> **⚠️ Important:** The WBGT values in this application are **estimates**, not direct measurements. Actual WBGT measurement requires specialized instruments (wet bulb thermometer, globe thermometer, dry bulb thermometer).

Estimated using a simplified approach based on Liljegren et al.:

```
WBGT ≈ 0.7 × Tnwb + 0.2 × Tg + 0.1 × Ta
```

Where:
- Tnwb = Natural wet bulb temperature (estimated from temperature and humidity)
- Tg = Globe temperature (estimated from temperature and solar radiation)
- Ta = Ambient air temperature

### Thermal Stress Index (0–100 Scale)

A composite index combining:
- Normalized heat index (50% weight)
- Normalized WBGT estimate (30% weight)
- Wind factor – inverse relationship (10% weight)
- Solar radiation factor (10% weight)

### Risk Categories

| Thermal Stress Index | Category    | Color  |
|---------------------|-------------|--------|
| 0–25                | Low         | Green  |
| 25–40               | Moderate    | Yellow |
| 40–55               | High        | Orange |
| 55–75               | Very High   | Red    |
| 75–100              | Extreme     | Dark Red |

## 📝 Data Sources & Disclaimers

### Weather Data
- **Source:** [Open-Meteo API](https://open-meteo.com/) – free, open-source weather API
- **Location:** Pune, Maharashtra, India (18.5204°N, 73.8567°E)

### Ward Data
- Ward names are based on Pune Municipal Corporation administrative divisions
- Ward center coordinates are approximate
- **Ward boundary polygons are NOT included** – verified GeoJSON boundaries should be sourced from PMC or authorized geographic data providers

### Cooling Centers
- Cooling center locations are based on known public facilities in Pune
- **Occupancy data is simulated** unless explicitly marked as verified
- Actual occupancy tracking would require integration with facility management systems

### AI Predictions
- When an ML model is trained, predictions include actual model confidence scores
- When no trained model is available, the system falls back to rule-based thermal stress estimation (clearly labeled)
- Model accuracy metrics are from actual evaluation, never fabricated

## 🔧 API Endpoints

### Backend (Port 5000)

| Method | Endpoint                         | Description                     |
|--------|----------------------------------|---------------------------------|
| GET    | /api/weather/current             | Current weather + thermal stress|
| GET    | /api/weather/forecast            | 5-day hourly forecast           |
| GET    | /api/weather/daily               | Daily forecast summary          |
| GET    | /api/alerts                      | Active alerts                   |
| GET    | /api/alerts/generate             | Generate alerts from weather    |
| GET    | /api/wards                       | All wards with risk levels      |
| GET    | /api/wards/:name                 | Specific ward details           |
| GET    | /api/cooling-centers             | All cooling centers             |
| GET    | /api/cooling-centers/nearest     | Nearest centers to location     |
| GET    | /api/predictions                 | AI heat risk predictions        |
| GET    | /api/predictions/thermal-stress  | Detailed thermal stress         |
| GET    | /api/predictions/safe-hours      | Safe outdoor activity hours     |

### AI Engine (Port 8000)

| Method | Endpoint                         | Description                     |
|--------|----------------------------------|---------------------------------|
| GET    | /api/predict                     | 3–5 day risk prediction         |
| GET    | /api/thermal-stress              | Current thermal stress analysis |
| GET    | /api/thermal-stress/hourly       | Hourly thermal stress           |
| GET    | /api/safe-hours                  | Safe activity windows           |
| GET    | /api/model/metrics               | Model evaluation metrics        |
| GET    | /api/model/status                | Model vs rule-based status      |

## 📱 Responsive Design

The application is fully responsive:
- **Desktop:** Full sidebar navigation + main content area
- **Tablet:** Collapsible sidebar
- **Mobile:** Bottom navigation or hamburger menu

## 🛡️ Environment Variables

See `.env.example` files in each service directory for required configuration.

## 📄 License

This project is for educational and research purposes.

---

**Built with ❤️ for climate resilience in Pune, Maharashtra**
