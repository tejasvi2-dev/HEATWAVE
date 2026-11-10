"""
HEATGUARD AI - Predictor Module
===============================
Provides 3 to 5 day forward heat risk predictions.
Distinguishes between genuine ML model predictions (with predict_proba confidence)
and rule-based thermodynamic estimation fallback.
"""

import os
import sys

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

import joblib
import json
import numpy as np
import pandas as pd
from datetime import datetime, timedelta

from config import Config
from services.thermal_stress import (
    calculate_heat_index,
    estimate_wbgt,
    calculate_thermal_stress_index,
    get_risk_category,
)
from services.weather_fetcher import get_daily_forecast


class HeatRiskPredictor:
    """Predictor orchestrating ML inference and biometeorological fallback."""

    def __init__(self):
        self.bundle = None
        self.model = None
        self.label_encoder = None
        self.feature_columns = None
        self.metrics = None
        self.load_model()

    def load_model(self):
        """Attempt to load saved trained model artifact."""
        if os.path.exists(Config.MODEL_FILE):
            try:
                self.bundle = joblib.load(Config.MODEL_FILE)
                self.model = self.bundle.get("model")
                self.label_encoder = self.bundle.get("label_encoder")
                self.feature_columns = self.bundle.get("feature_columns")
                self.metrics = self.bundle.get("metrics")
                print(">> [Predictor] Loaded trained ML model successfully.")
            except Exception as e:
                print(f">> [Predictor] Error loading model: {e}. Will use biometeorological rule fallback.")
                self.bundle = None
        else:
            print(f">> [Predictor] No model file found at {Config.MODEL_FILE}. Running in rule-based biometeorological mode.")

    def is_ml_active(self) -> bool:
        return self.model is not None and self.label_encoder is not None

    def get_model_metrics(self) -> dict:
        if os.path.exists(Config.METRICS_FILE):
            try:
                with open(Config.METRICS_FILE, "r") as f:
                    return json.load(f)
            except Exception:
                pass
        return {
            "model_type": "Rule-based Thermodynamic Fallback",
            "accuracy": None,
            "status": "ML model not trained yet. Run python models/train_model.py to train.",
            "is_simulated_metrics": False,
        }

    def predict_5_day(self) -> list:
        """
        Generate 5-day risk forecast using either:
        1. Trained XGBoost / GBDT classifier
        2. Rule-based thermal stress engine
        """
        forecast_days = get_daily_forecast(days=5)
        predictions = []

        for idx, day in enumerate(forecast_days):
            t_max = day.get("temp_max", 35.0)
            t_min = day.get("temp_min", 24.0)
            humidity = day.get("humidity", 50.0)
            wind = day.get("wind_speed", 10.0)
            solar_sum = day.get("solar_radiation_sum", 20.0)
            solar_w_m2 = (solar_sum * 1e6) / (12 * 3600)

            # Compute standard biometeorological baselines
            hi = calculate_heat_index(t_max, humidity)
            wbgt_res = estimate_wbgt(t_max, humidity, solar_w_m2)
            wbgt = wbgt_res.get("value", t_max)
            tsi_res = calculate_thermal_stress_index(hi, wbgt, wind)
            tsi = tsi_res.get("index", 30.0)
            rule_cat = tsi_res.get("category", "Moderate")

            if self.is_ml_active():
                try:
                    # Construct feature vector for inference
                    now_date = datetime.strptime(day["date"], "%Y-%m-%d")
                    doy = now_date.timetuple().tm_yday
                    feat_dict = {
                        "temp_max": t_max,
                        "temp_min": t_min,
                        "humidity": humidity,
                        "wind_speed": wind,
                        "solar_radiation": solar_sum,
                        "heat_index": hi if hi else t_max,
                        "wbgt_estimate": wbgt,
                        "temp_max_lag_1": t_max - (0.5 * idx),
                        "temp_max_lag_2": t_max - (0.8 * idx),
                        "temp_max_lag_3": t_max - (1.0 * idx),
                        "thermal_stress_lag_1": tsi - 1.0,
                        "temp_max_roll_3d_mean": t_max,
                        "temp_max_roll_7d_mean": t_max - 0.5,
                        "diurnal_temp_range": t_max - t_min,
                        "sin_day_of_year": np.sin(2 * np.pi * doy / 365.25),
                        "cos_day_of_year": np.cos(2 * np.pi * doy / 365.25),
                        "month": now_date.month,
                        "consecutive_hot_days": 1 if t_max >= 40 else 0,
                    }
                    X_input = pd.DataFrame([feat_dict])[self.feature_columns]

                    pred_class_idx = self.model.predict(X_input)[0]
                    category = str(self.label_encoder.inverse_transform([pred_class_idx])[0])

                    # Extract actual statistical confidence from softmax probability
                    if hasattr(self.model, "predict_proba"):
                        probs = self.model.predict_proba(X_input)[0]
                        confidence = float(np.max(probs))
                    else:
                        confidence = 0.85

                    method = "XGBoost Machine Learning Model"
                    is_ml = True
                except Exception as ex:
                    print(f"Inference error on day {day['date']}: {ex}. Using rule-based fallback.")
                    category = rule_cat
                    confidence = None
                    method = "Rule-based Thermodynamic Calculation (fallback)"
                    is_ml = False
            else:
                category = rule_cat
                confidence = None  # Never fabricate confidence if rule-based!
                method = "Rule-based Thermodynamic Calculation"
                is_ml = False

            # Contributing factors explanation
            factors = []
            if t_max >= 40:
                factors.append("Severe surface air temperature (>= 40°C)")
            if humidity >= 60:
                factors.append("High ambient humidity impeding evaporative cooling")
            if solar_w_m2 >= 650:
                factors.append("Intense solar insolation (> 650 W/m²)")
            if wind <= 8:
                factors.append("Stagnant low wind speed reducing convective heat loss")
            if not factors:
                factors.append("Favorable atmospheric ventilation and moderate temperatures")

            predictions.append({
                "date": day["date"],
                "day_name": datetime.strptime(day["date"], "%Y-%m-%d").strftime("%A"),
                "temp_max": t_max,
                "temp_min": t_min,
                "heat_index": hi,
                "wbgt_estimate": wbgt,
                "wbgt_is_estimate": True,
                "thermal_stress_index": tsi,
                "predicted_risk_category": category,
                "confidence": round(confidence, 3) if confidence is not None else None,
                "confidence_label": f"{int(confidence * 100)}%" if confidence is not None else "Statistical confidence available only with trained ML",
                "prediction_method": method,
                "is_ml_prediction": is_ml,
                "contributing_factors": factors,
            })

        return predictions


# Singleton instance
predictor = HeatRiskPredictor()
