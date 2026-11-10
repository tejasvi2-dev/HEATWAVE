"""
HEATGUARD AI - Analysis Routes
==============================
Vulnerability assessment, ward-level heat risk breakdown, and heat trends.
"""

from flask import Blueprint, jsonify
from services.weather_fetcher import get_current_weather
from services.thermal_stress import calculate_heat_index, estimate_wbgt, calculate_thermal_stress_index

analysis_bp = Blueprint("analysis", __name__)

PUNE_WARD_VULNERABILITY = [
    {"name": "Kasba-Vishrambaug", "density_factor": 1.35, "green_cover_factor": 0.45, "elderly_pct": 16.5, "outdoor_workers_pct": 28.0},
    {"name": "Bhavani Peth", "density_factor": 1.40, "green_cover_factor": 0.35, "elderly_pct": 14.8, "outdoor_workers_pct": 32.5},
    {"name": "Shivajinagar-Ghole Road", "density_factor": 1.15, "green_cover_factor": 0.70, "elderly_pct": 13.2, "outdoor_workers_pct": 18.0},
    {"name": "Kothrud-Bavdhan", "density_factor": 1.10, "green_cover_factor": 0.85, "elderly_pct": 15.0, "outdoor_workers_pct": 14.5},
    {"name": "Hadapsar-Mundhwa", "density_factor": 1.25, "green_cover_factor": 0.60, "elderly_pct": 10.5, "outdoor_workers_pct": 26.0},
    {"name": "Aundh-Baner", "density_factor": 0.95, "green_cover_factor": 0.90, "elderly_pct": 11.0, "outdoor_workers_pct": 13.0},
    {"name": "Yerawada-Kalas", "density_factor": 1.30, "green_cover_factor": 0.50, "elderly_pct": 12.8, "outdoor_workers_pct": 29.0},
]


@analysis_bp.route("/vulnerable-groups", methods=["GET"])
def vulnerable_groups():
    """Evaluate heat stress impact across sensitive demographic populations."""
    current = get_current_weather()
    t = current["temperature"]
    rh = current["humidity"]
    hi = calculate_heat_index(t, rh) or t

    return jsonify({
        "success": True,
        "data": {
            "current_temperature": t,
            "heat_index": hi,
            "groups": [
                {
                    "group": "Outdoor & Construction Workers",
                    "risk_level": "Extreme" if hi >= 40 else "High" if hi >= 36 else "Moderate",
                    "primary_hazard": "Exertional heat stroke, severe dehydration, rhabdomyolysis",
                    "advisory": "Mandatory 15-min shaded rest breaks per hour; hydrate with ORS/electrolyte solutions.",
                },
                {
                    "group": "Elderly (Aged 65+)",
                    "risk_level": "Very High" if hi >= 38 else "Moderate",
                    "primary_hazard": "Impaired thermoregulatory perspiration, cardiovascular strain",
                    "advisory": "Maintain ambient room temp below 28°C; monitor chronic medication interactions.",
                },
                {
                    "group": "School Children & Infants",
                    "risk_level": "High" if hi >= 37 else "Moderate",
                    "primary_hazard": "Higher surface-area-to-mass ratio, rapid dehydration",
                    "advisory": "Curtail mid-day sports between 11 AM - 4 PM; ensure water stations in classrooms.",
                },
            ]
        }
    })


@analysis_bp.route("/ward-risk", methods=["GET"])
def ward_heat_risk():
    """Return ward-level composite vulnerability ratings."""
    current = get_current_weather()
    t = current["temperature"]
    rh = current["humidity"]
    solar = current["solar_radiation"]
    wind = current["wind_speed"]

    hi = calculate_heat_index(t, rh)
    wbgt = estimate_wbgt(t, rh, solar)["value"]
    base_tsi = calculate_thermal_stress_index(hi, wbgt, wind)["index"]

    results = []
    for ward in PUNE_WARD_VULNERABILITY:
        # Microclimate vulnerability modifier
        mod = (ward["density_factor"] * 0.6) + ((1.0 - ward["green_cover_factor"]) * 0.4)
        ward_tsi = min(100.0, round(base_tsi * mod, 1))

        if ward_tsi >= 80:
            cat = "Extreme"
        elif ward_tsi >= 65:
            cat = "Very High"
        elif ward_tsi >= 50:
            cat = "High"
        elif ward_tsi >= 35:
            cat = "Moderate"
        else:
            cat = "Low"

        results.append({
            "ward_name": ward["name"],
            "ward_tsi": ward_tsi,
            "risk_category": cat,
            "density_multiplier": ward["density_factor"],
            "green_cover_multiplier": ward["green_cover_factor"],
            "elderly_percentage": ward["elderly_pct"],
            "outdoor_worker_percentage": ward["outdoor_workers_pct"],
        })

    return jsonify({"success": True, "data": results})
