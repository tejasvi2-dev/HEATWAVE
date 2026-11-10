"""
HEATGUARD AI - Configuration Module
====================================
Centralizes all configuration for the AI engine including
Pune geographic coordinates, model paths, and API settings.
"""

import os
from dotenv import load_dotenv

load_dotenv()


class Config:
    """Application configuration loaded from environment variables with sensible defaults."""

    # Flask settings
    FLASK_PORT: int = int(os.getenv("FLASK_PORT", "8000"))
    FLASK_ENV: str = os.getenv("FLASK_ENV", "development")
    DEBUG: bool = FLASK_ENV == "development"

    # Pune, Maharashtra coordinates
    PUNE_LATITUDE: float = 18.5204
    PUNE_LONGITUDE: float = 73.8567
    CITY_NAME: str = "Pune"
    STATE_NAME: str = "Maharashtra"
    COUNTRY: str = "India"
    TIMEZONE: str = "Asia/Kolkata"

    _BASE_DIR = os.path.dirname(os.path.abspath(__file__))

    # Model paths
    MODEL_DIR: str = os.getenv("MODEL_PATH", os.path.join(_BASE_DIR, "models"))
    MODEL_FILE: str = os.path.join(MODEL_DIR, "xgboost_heatwave_model.joblib")
    METRICS_FILE: str = os.path.join(MODEL_DIR, "evaluation_metrics.json")
    PROCESSED_DATA_DIR: str = os.path.join(_BASE_DIR, "data", "processed")
    PROCESSED_DATA_FILE: str = os.path.join(PROCESSED_DATA_DIR, "processed_weather.csv")
    FEATURE_DATA_FILE: str = os.path.join(PROCESSED_DATA_DIR, "feature_engineered.csv")

    # Open-Meteo API settings (no API key required)
    OPEN_METEO_FORECAST_URL: str = "https://api.open-meteo.com/v1/forecast"
    OPEN_METEO_ARCHIVE_URL: str = "https://archive-api.open-meteo.com/v1/archive"

    # Weather variables to fetch
    HOURLY_VARIABLES: list = [
        "temperature_2m",
        "relative_humidity_2m",
        "wind_speed_10m",
        "shortwave_radiation",
        "precipitation",
    ]
    DAILY_VARIABLES: list = [
        "temperature_2m_max",
        "temperature_2m_min",
        "temperature_2m_mean",
        "relative_humidity_2m_mean",
        "wind_speed_10m_max",
        "shortwave_radiation_sum",
        "precipitation_sum",
    ]

    # Thermal stress risk thresholds (thermal stress index 0-100)
    RISK_THRESHOLDS: dict = {
        "Low": (0, 25),
        "Moderate": (25, 40),
        "High": (40, 55),
        "Very High": (55, 75),
        "Extreme": (75, 100),
    }

    # Risk category numeric mapping for ML model
    RISK_CATEGORY_MAP: dict = {
        "Low": 0,
        "Moderate": 1,
        "High": 2,
        "Very High": 3,
        "Extreme": 4,
    }
    RISK_CATEGORY_INVERSE: dict = {v: k for k, v in RISK_CATEGORY_MAP.items()}

    # Pune ward data (representative wards with micro-climate adjustments)
    PUNE_WARDS: list = [
        {"name": "Aundh", "lat": 18.5580, "lon": 73.8077, "urban_heat_factor": 1.05},
        {"name": "Shivajinagar", "lat": 18.5308, "lon": 73.8475, "urban_heat_factor": 1.12},
        {"name": "Kothrud", "lat": 18.5074, "lon": 73.8077, "urban_heat_factor": 1.03},
        {"name": "Hadapsar", "lat": 18.5089, "lon": 73.9260, "urban_heat_factor": 1.08},
        {"name": "Pimpri-Chinchwad", "lat": 18.6298, "lon": 73.7997, "urban_heat_factor": 1.10},
        {"name": "Kondhwa", "lat": 18.4631, "lon": 73.8934, "urban_heat_factor": 1.02},
        {"name": "Viman Nagar", "lat": 18.5679, "lon": 73.9143, "urban_heat_factor": 1.07},
        {"name": "Deccan Gymkhana", "lat": 18.5195, "lon": 73.8403, "urban_heat_factor": 1.11},
        {"name": "Swargate", "lat": 18.5018, "lon": 73.8636, "urban_heat_factor": 1.13},
        {"name": "Hinjewadi", "lat": 18.5912, "lon": 73.7380, "urban_heat_factor": 1.06},
        {"name": "Wakad", "lat": 18.5997, "lon": 73.7627, "urban_heat_factor": 1.04},
        {"name": "Bibwewadi", "lat": 18.4770, "lon": 73.8670, "urban_heat_factor": 1.09},
        {"name": "Yerawada", "lat": 18.5568, "lon": 73.8841, "urban_heat_factor": 1.10},
        {"name": "Koregaon Park", "lat": 18.5362, "lon": 73.8937, "urban_heat_factor": 1.04},
        {"name": "Baner", "lat": 18.5590, "lon": 73.7868, "urban_heat_factor": 1.03},
    ]
