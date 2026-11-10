"""
HEATGUARD AI - Prediction Routes
================================
Flask endpoints serving AI predictions, thermal stress indices, and hourly activity windows.
"""

from flask import Blueprint, jsonify, request
from config import Config
from models.predictor import predictor
from services.thermal_stress import (
    calculate_heat_index,
    estimate_wbgt,
    calculate_thermal_stress_index,
    get_safe_hours_advisory,
)
from services.weather_fetcher import get_current_weather, get_hourly_forecast

prediction_bp = Blueprint("predictions", __name__)


@prediction_bp.route("/predict", methods=["GET"])
def predict_heat_risk():
    """Return 3 to 5 day AI heat-health risk forecast."""
    try:
        forecast = predictor.predict_5_day()
        return jsonify({
            "success": True,
            "data": forecast,
            "is_ml_active": predictor.is_ml_active(),
            "meta": {
                "city": "Pune",
                "days": len(forecast),
            }
        })
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500


@prediction_bp.route("/thermal-stress", methods=["GET"])
def current_thermal_stress():
    """Return real-time thermal stress biometeorology for Pune."""
    try:
        current = get_current_weather()
        t = current["temperature"]
        rh = current["humidity"]
        solar = current["solar_radiation"]
        wind = current["wind_speed"]

        hi = calculate_heat_index(t, rh)
        wbgt = estimate_wbgt(t, rh, solar)
        tsi = calculate_thermal_stress_index(hi, wbgt["value"], wind)

        return jsonify({
            "success": True,
            "data": {
                "temperature": t,
                "humidity": rh,
                "solar_radiation": solar,
                "wind_speed": wind,
                "heat_index": hi,
                "wbgt_estimate": wbgt["value"],
                "wbgt_is_estimate": True,
                "wbgt_methodology": "Liljegren empirical approximation (outdoors)",
                "thermal_stress_index": tsi["index"],
                "risk_category": tsi["category"],
                "components": {
                    "heat_index_contribution": round(0.45 * max(0, (hi - 25) / 30) * 100, 1) if hi else 0,
                    "wbgt_contribution": round(0.40 * max(0, (wbgt["value"] - 20) / 20) * 100, 1),
                    "wind_mitigation": round(min(15, (wind / 50) * 15), 1),
                }
            }
        })
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500


@prediction_bp.route("/safe-hours", methods=["GET"])
def safe_hours():
    """Return 24-hour outdoor activity safety timeline."""
    try:
        hourly = get_hourly_forecast(hours=24)
        advisory = get_safe_hours_advisory(hourly)
        return jsonify({
            "success": True,
            "data": advisory
        })
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500


@prediction_bp.route("/model/metrics", methods=["GET"])
def model_metrics():
    """Return authentic model evaluation metrics."""
    return jsonify({
        "success": True,
        "data": predictor.get_model_metrics()
    })


@prediction_bp.route("/model/status", methods=["GET"])
def model_status():
    """Return whether trained ML model or thermodynamic rule fallback is active."""
    return jsonify({
        "success": True,
        "data": {
            "ml_active": predictor.is_ml_active(),
            "model_type": "XGBoost / Gradient Boosting" if predictor.is_ml_active() else "Rule-based thermodynamic engine",
            "model_path": Config.MODEL_FILE,
        }
    })
