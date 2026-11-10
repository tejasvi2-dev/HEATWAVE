"""
HEATGUARD AI - Thermal Stress Calculation Service
=================================================
Calculates biometeorological human thermal stress indices:
1. Heat Index (HI): Rothfusz 9-parameter regression equation (NWS / NOAA)
2. Wet-Bulb Globe Temperature (WBGT): Simplified Liljegren (2008) approximation
   combining Stull (2011) psychrometric wet-bulb and solar radiative balance.
   (Clearly labeled as ESTIMATE)
3. Composite Thermal Stress Index (0-100 scale)
"""

import math
from typing import Dict, Optional, Union, List


def safe_float(val, default=0.0) -> float:
    try:
        return float(val) if val is not None else default
    except (ValueError, TypeError):
        return default


def calculate_heat_index(temperature_c: float, relative_humidity: float) -> float:
    """Calculate the Heat Index using the Rothfusz regression equation (NWS / NOAA).

    Reference:
    Rothfusz, L.P., 1990: The Heat Index Equation. NWS Technical Attachment SR 90-23.
    """
    T_c = safe_float(temperature_c)
    RH = safe_float(relative_humidity)

    # Convert Celsius to Fahrenheit
    T = (T_c * 9.0 / 5.0) + 32.0

    # Steadman simple equation for lower heat index
    HI = 0.5 * (T + 61.0 + ((T - 68.0) * 1.2) + (RH * 0.094))

    # If simple average >= 80°F, apply full Rothfusz regression
    if (HI + T) / 2.0 >= 80.0:
        HI = (
            -42.379
            + 2.04901523 * T
            + 10.14333127 * RH
            - 0.22475541 * T * RH
            - 0.00683783 * T * T
            - 0.05481717 * RH * RH
            + 0.00122874 * T * T * RH
            + 0.00085282 * T * RH * RH
            - 0.00000199 * T * T * RH * RH
        )

        # Low humidity adjustment
        if RH < 13.0 and 80.0 <= T <= 112.0:
            adj = ((13.0 - RH) / 4.0) * math.sqrt(max(0.0, (17.0 - abs(T - 95.0)) / 17.0))
            HI -= adj

        # High humidity adjustment
        elif RH > 85.0 and 80.0 <= T <= 87.0:
            adj = ((RH - 85.0) / 10.0) * ((87.0 - T) / 5.0)
            HI += adj

    # Convert back to Celsius and round to 1 decimal place
    HI_c = (HI - 32.0) * 5.0 / 9.0
    return round(HI_c, 1)


def estimate_wet_bulb_temperature(temperature_c: float, relative_humidity: float) -> float:
    """Estimate Natural Wet-Bulb Temperature (Tw) using Stull (2011) psychrometric approximation.

    Reference: Stull, R., 2011. Wet-Bulb Temperature from Relative Humidity and Air Temperature. JAMC.
    """
    T = safe_float(temperature_c)
    RH = safe_float(relative_humidity)

    Tw = (
        T * math.atan(0.151977 * math.sqrt(max(0.0, RH + 8.313659)))
        + math.atan(T + RH)
        - math.atan(RH - 1.676331)
        + 0.00391838 * (RH ** 1.5) * math.atan(0.023101 * RH)
        - 4.686035
    )
    return round(Tw, 1)


def estimate_globe_temperature(temperature_c: float, solar_radiation_wm2: float) -> float:
    """Estimate 150mm Black Globe Temperature (Tg) from ambient temperature and solar insolation."""
    T = safe_float(temperature_c)
    S = safe_float(solar_radiation_wm2)
    Tg = 1.006 * T + 0.004 * S - 0.3
    return round(Tg, 1)


def calculate_wbgt(temperature_c: float, relative_humidity: float, solar_radiation_wm2: float = 0, wind_speed_ms: Optional[float] = None) -> Dict:
    """Estimate Wet Bulb Globe Temperature (WBGT) for outdoor conditions.

    Standard formula: WBGT = 0.7 * Tw + 0.2 * Tg + 0.1 * Ta
    """
    Ta = safe_float(temperature_c)
    RH = safe_float(relative_humidity)
    S = safe_float(solar_radiation_wm2)

    Tw = estimate_wet_bulb_temperature(Ta, RH)
    Tg = estimate_globe_temperature(Ta, S)
    wbgt = 0.7 * Tw + 0.2 * Tg + 0.1 * Ta
    wbgt_rounded = round(wbgt, 1)

    return {
        "wbgt": wbgt_rounded,
        "value": wbgt_rounded,
        "wet_bulb_temp": Tw,
        "globe_temp": Tg,
        "dry_bulb_temp": Ta,
        "is_estimate": True,
        "is_estimated": True,
    }


def estimate_wbgt(temperature_c: float, relative_humidity: float, solar_radiation_wm2: float = 0, wind_speed_ms: Optional[float] = None) -> Dict:
    """Alias for calculate_wbgt returning {'value': ..., 'is_estimate': True}."""
    return calculate_wbgt(temperature_c, relative_humidity, solar_radiation_wm2, wind_speed_ms)


def calculate_thermal_stress_index(
    arg1: float,
    arg2: float = 50.0,
    wind_speed_kmh: float = 10.0,
    solar_radiation_wm2: Optional[float] = None
) -> Dict:
    """Compute composite Thermal Stress Index on 0-100 scale.

    Supports either:
    1) calculate_thermal_stress_index(heat_index, wbgt, wind_speed)
    2) calculate_thermal_stress_index(temperature_c, relative_humidity, wind_speed_kmh, solar_radiation_wm2)

    Normalisation:
    - Heat Index: 25°C to 55°C (weight: 45%)
    - WBGT estimate: 20°C to 40°C (weight: 40%)
    - Wind mitigation benefit: up to 15 points subtracted
    """
    if solar_radiation_wm2 is not None:
        Ta = safe_float(arg1)
        RH = safe_float(arg2, 50.0)
        W = safe_float(wind_speed_kmh, 10.0)
        S = safe_float(solar_radiation_wm2, 500.0)
        hi = calculate_heat_index(Ta, RH)
        wbgt_res = calculate_wbgt(Ta, RH, S)
        wbgt = wbgt_res["wbgt"]
    else:
        # Called as (heat_index, wbgt, wind_speed)
        hi = safe_float(arg1, 35.0)
        wbgt = safe_float(arg2, 28.0)
        W = safe_float(wind_speed_kmh, 10.0)

    # Normalization
    hi_norm = min(100.0, max(0.0, ((hi - 25.0) / 30.0) * 100.0))
    wbgt_norm = min(100.0, max(0.0, ((wbgt - 20.0) / 20.0) * 100.0))
    wind_benefit = min(15.0, (W / 50.0) * 15.0)

    score = 0.45 * hi_norm + 0.40 * wbgt_norm - wind_benefit
    index = min(100.0, max(0.0, round(score, 1)))
    cat = get_risk_category(index)

    return {
        "index": index,
        "thermal_stress_index": index,
        "category": cat,
        "risk_category": cat,
        "heat_index": round(hi, 1),
        "wbgt": round(wbgt, 1),
        "wbgt_estimate": round(wbgt, 1),
        "wbgt_is_estimate": True,
    }


def get_risk_category(thermal_stress_index: float) -> str:
    """Map numeric thermal stress index (0-100) to standard public health risk level."""
    score = safe_float(thermal_stress_index)
    if score >= 80.0:
        return "Extreme"
    elif score >= 65.0:
        return "Very High"
    elif score >= 50.0:
        return "High"
    elif score >= 35.0:
        return "Moderate"
    return "Low"


def get_safe_hours_advisory(hourly_data: list) -> list:
    """Generate 24-hour diurnal safety timeline from hourly observations or forecasts."""
    results = []
    for item in hourly_data:
        t = safe_float(item.get("temperature", 30))
        rh = safe_float(item.get("humidity", 50))
        w = safe_float(item.get("wind_speed", 10))
        s = safe_float(item.get("solar_radiation", 300))

        tsi_res = calculate_thermal_stress_index(t, rh, w, s)
        score = tsi_res["index"]

        rating = max(10, min(100, int(100 - score)))
        if score >= 65:
            cat_label = "Dangerous"
            color = "red"
            rec = "Peak heat hazard. Outdoor labor prohibited."
        elif score >= 50:
            cat_label = "Avoid"
            color = "orange"
            rec = "High strain. Seek shade and hydration."
        elif score >= 35:
            cat_label = "Caution"
            color = "yellow"
            rec = "Moderate conditions. Limit strenuous activity."
        else:
            cat_label = "Safe"
            color = "green"
            rec = "Optimal condition for outdoor transit."

        hour = item.get("hour", 0)
        results.append({
            "hour": hour,
            "label": f"{str(hour).zfill(2)}:00",
            "temperature": t,
            "safetyRating": rating,
            "category": cat_label,
            "color": color,
            "recommendation": rec,
        })
    return results
