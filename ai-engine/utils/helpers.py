"""
HEATGUARD AI - Utility Helpers
===============================
Temperature conversion utilities, date/time helpers,
data validation functions, and risk level color mappings.
"""

import math
from datetime import datetime, timezone, timedelta
from typing import Optional, Union


# ---------------------------------------------------------------------------
# Temperature Conversions
# ---------------------------------------------------------------------------

def celsius_to_fahrenheit(celsius: float) -> float:
    """Convert Celsius to Fahrenheit.

    Formula: F = C * 9/5 + 32
    """
    return celsius * 9.0 / 5.0 + 32.0


def fahrenheit_to_celsius(fahrenheit: float) -> float:
    """Convert Fahrenheit to Celsius.

    Formula: C = (F - 32) * 5/9
    """
    return (fahrenheit - 32.0) * 5.0 / 9.0


def kelvin_to_celsius(kelvin: float) -> float:
    """Convert Kelvin to Celsius."""
    return kelvin - 273.15


def celsius_to_kelvin(celsius: float) -> float:
    """Convert Celsius to Kelvin."""
    return celsius + 273.15


# ---------------------------------------------------------------------------
# Date / Time Helpers
# ---------------------------------------------------------------------------

IST = timezone(timedelta(hours=5, minutes=30))


def get_ist_now() -> datetime:
    """Return current datetime in Indian Standard Time (UTC+5:30)."""
    return datetime.now(IST)


def format_date(dt: datetime, fmt: str = "%Y-%m-%d") -> str:
    """Format a datetime to a string."""
    return dt.strftime(fmt)


def format_datetime(dt: datetime, fmt: str = "%Y-%m-%d %H:%M:%S") -> str:
    """Format a datetime with time component."""
    return dt.strftime(fmt)


def parse_date(date_str: str, fmt: str = "%Y-%m-%d") -> Optional[datetime]:
    """Safely parse a date string, returning None on failure."""
    try:
        return datetime.strptime(date_str, fmt)
    except (ValueError, TypeError):
        return None


def date_range_days(start: datetime, days: int) -> list:
    """Generate a list of date strings starting from *start* for *days* days."""
    return [format_date(start + timedelta(days=i)) for i in range(days)]


def day_of_year_cyclical(day_of_year: int) -> tuple:
    """Return (sin, cos) cyclical encoding for day-of-year (1-366).

    Cyclical encoding prevents the model from treating Dec 31 and Jan 1
    as maximally distant.

    Returns:
        Tuple of (sin_component, cos_component) both in [-1, 1].
    """
    angle = 2 * math.pi * day_of_year / 365.25
    return math.sin(angle), math.cos(angle)


# ---------------------------------------------------------------------------
# Data Validation
# ---------------------------------------------------------------------------

def validate_temperature(temp: Union[float, int, None], min_val: float = -20.0, max_val: float = 60.0) -> bool:
    """Check if temperature value is within a physically plausible range for Pune."""
    if temp is None:
        return False
    try:
        return min_val <= float(temp) <= max_val
    except (TypeError, ValueError):
        return False


def validate_humidity(rh: Union[float, int, None]) -> bool:
    """Check if relative humidity is within 0-100 %."""
    if rh is None:
        return False
    try:
        return 0.0 <= float(rh) <= 100.0
    except (TypeError, ValueError):
        return False


def validate_wind_speed(ws: Union[float, int, None]) -> bool:
    """Check if wind speed is non-negative and plausible (< 200 km/h)."""
    if ws is None:
        return False
    try:
        return 0.0 <= float(ws) <= 200.0
    except (TypeError, ValueError):
        return False


def validate_radiation(rad: Union[float, int, None]) -> bool:
    """Check if shortwave radiation sum is non-negative."""
    if rad is None:
        return False
    try:
        return 0.0 <= float(rad)
    except (TypeError, ValueError):
        return False


def safe_float(value, default: float = 0.0) -> float:
    """Safely convert a value to float, returning *default* on failure."""
    if value is None:
        return default
    try:
        v = float(value)
        if math.isnan(v) or math.isinf(v):
            return default
        return v
    except (TypeError, ValueError):
        return default


# ---------------------------------------------------------------------------
# Risk Level Color Mappings
# ---------------------------------------------------------------------------

RISK_COLORS: dict = {
    "Low": {
        "primary": "#22c55e",       # green-500
        "background": "#f0fdf4",    # green-50
        "text": "#166534",          # green-800
        "label": "Low Risk",
    },
    "Moderate": {
        "primary": "#eab308",       # yellow-500
        "background": "#fefce8",    # yellow-50
        "text": "#854d0e",          # yellow-800
        "label": "Moderate Risk",
    },
    "High": {
        "primary": "#f97316",       # orange-500
        "background": "#fff7ed",    # orange-50
        "text": "#9a3412",          # orange-800
        "label": "High Risk",
    },
    "Very High": {
        "primary": "#ef4444",       # red-500
        "background": "#fef2f2",    # red-50
        "text": "#991b1b",          # red-800
        "label": "Very High Risk",
    },
    "Extreme": {
        "primary": "#7f1d1d",       # red-900
        "background": "#450a0a",    # custom dark red
        "text": "#ffffff",          # white
        "label": "Extreme Risk",
    },
}


def get_risk_color(risk_category: str) -> dict:
    """Return colour palette for a risk category, defaulting to Moderate if unknown."""
    return RISK_COLORS.get(risk_category, RISK_COLORS["Moderate"])


def get_risk_emoji(risk_category: str) -> str:
    """Return an emoji indicator for a risk category."""
    mapping = {
        "Low": "🟢",
        "Moderate": "🟡",
        "High": "🟠",
        "Very High": "🔴",
        "Extreme": "🔴🔴",
    }
    return mapping.get(risk_category, "⚪")


def risk_to_numeric(risk_category: str) -> int:
    """Map risk category string to integer (0-4)."""
    mapping = {"Low": 0, "Moderate": 1, "High": 2, "Very High": 3, "Extreme": 4}
    return mapping.get(risk_category, 1)


def numeric_to_risk(value: int) -> str:
    """Map integer (0-4) back to risk category string."""
    mapping = {0: "Low", 1: "Moderate", 2: "High", 3: "Very High", 4: "Extreme"}
    return mapping.get(value, "Moderate")
