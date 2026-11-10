"""
HEATGUARD AI - Feature Engineering Module
=========================================
Derives predictive features for heatwave risk estimation:
- Lags (1, 2, 3 days)
- Rolling averages (3-day, 7-day)
- Cyclical calendar encodings
- Physical thermal metrics (Heat Index, WBGT estimate, Thermal Stress)
- Consecutive hot day streaks
"""

import os
import pandas as pd
import numpy as np
from config import Config
from services.thermal_stress import calculate_heat_index, estimate_wbgt, calculate_thermal_stress_index, get_risk_category


def create_features(df: pd.DataFrame) -> pd.DataFrame:
    """Generate time series and meteorological features from cleaned daily records."""
    df = df.copy()
    df = df.sort_values("date").reset_index(drop=True)

    # 1. Physical biometeorological metrics (using temp_max to represent peak stress)
    heat_indices = []
    wbgt_estimates = []
    thermal_stress_scores = []
    risk_categories = []

    for _, row in df.iterrows():
        t = row["temp_max"]
        rh = row["humidity"]
        solar_w_m2 = (row["solar_radiation"] * 1e6) / (12 * 3600) if "solar_radiation" in row else 600
        wind = row["wind_speed"]

        hi = calculate_heat_index(t, rh)
        wbgt_res = estimate_wbgt(t, rh, solar_w_m2)
        wbgt = wbgt_res.get("value", t)
        tsi_res = calculate_thermal_stress_index(hi, wbgt, wind)
        tsi = tsi_res.get("index", 20.0)
        cat = tsi_res.get("category", "Low")

        heat_indices.append(hi)
        wbgt_estimates.append(wbgt)
        thermal_stress_scores.append(tsi)
        risk_categories.append(cat)

    df["heat_index"] = heat_indices
    df["wbgt_estimate"] = wbgt_estimates
    df["thermal_stress_index"] = thermal_stress_scores
    df["target_risk_category"] = risk_categories

    # 2. Lag features
    for lag in [1, 2, 3]:
        df[f"temp_max_lag_{lag}"] = df["temp_max"].shift(lag)
        df[f"humidity_lag_{lag}"] = df["humidity"].shift(lag)
        df[f"thermal_stress_lag_{lag}"] = df["thermal_stress_index"].shift(lag)

    # 3. Rolling metrics
    df["temp_max_roll_3d_mean"] = df["temp_max"].rolling(window=3, min_periods=1).mean()
    df["temp_max_roll_7d_mean"] = df["temp_max"].rolling(window=7, min_periods=1).mean()
    df["temp_max_roll_3d_max"] = df["temp_max"].rolling(window=3, min_periods=1).max()
    df["thermal_stress_roll_3d_mean"] = df["thermal_stress_index"].rolling(window=3, min_periods=1).mean()

    # 4. Diurnal Temperature Range
    df["diurnal_temp_range"] = df["temp_max"] - df["temp_min"]

    # 5. Calendar & Cyclical features
    day_of_year = df["date"].dt.dayofyear
    df["sin_day_of_year"] = np.sin(2 * np.pi * day_of_year / 365.25)
    df["cos_day_of_year"] = np.cos(2 * np.pi * day_of_year / 365.25)
    df["month"] = df["date"].dt.month

    # 6. Consecutive hot days counter (Pune heatwave criteria: temp_max >= 40°C)
    hot_day_mask = (df["temp_max"] >= 40.0).astype(int)
    streaks = []
    current_streak = 0
    for val in hot_day_mask:
        if val == 1:
            current_streak += 1
        else:
            current_streak = 0
        streaks.append(current_streak)
    df["consecutive_hot_days"] = streaks

    # Drop early NA rows caused by 3-day shift
    df = df.dropna().reset_index(drop=True)
    return df


def get_feature_columns() -> list:
    """Return the list of predictor columns used by the ML model."""
    return [
        "temp_max",
        "temp_min",
        "humidity",
        "wind_speed",
        "solar_radiation",
        "heat_index",
        "wbgt_estimate",
        "temp_max_lag_1",
        "temp_max_lag_2",
        "temp_max_lag_3",
        "thermal_stress_lag_1",
        "temp_max_roll_3d_mean",
        "temp_max_roll_7d_mean",
        "diurnal_temp_range",
        "sin_day_of_year",
        "cos_day_of_year",
        "month",
        "consecutive_hot_days",
    ]
