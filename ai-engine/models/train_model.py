"""
HEATGUARD AI - Model Training Pipeline
======================================
Trains an XGBoost / Gradient Boosting multi-class classifier to predict
heat-health risk categories for 1 to 5 days ahead.
Computes real evaluation metrics (Accuracy, F1-macro, confusion matrix).
Never fabricates metrics.
"""

import os
import sys
import json

# Ensure project root is on sys.path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

import joblib
import numpy as np
import pandas as pd
from sklearn.model_selection import TimeSeriesSplit
from sklearn.metrics import classification_report, accuracy_score, f1_score, confusion_matrix
from sklearn.preprocessing import LabelEncoder

from config import Config
from data.data_processor import fetch_historical_archive, save_processed_data
from data.feature_engineering import create_features, get_feature_columns

try:
    from xgboost import XGBClassifier
    HAS_XGBOOST = True
except ImportError:
    from sklearn.ensemble import GradientBoostingClassifier
    HAS_XGBOOST = False


def train_heat_risk_model():
    """Execute end-to-end training pipeline and record verified metrics."""
    print(">> Step 1: Fetching or preparing historical Pune climate records...")
    raw_df = fetch_historical_archive()
    save_processed_data(raw_df)

    print(">> Step 2: Engineering lag, biometeorological & cyclical features...")
    featured_df = create_features(raw_df)

    feature_cols = get_feature_columns()
    X = featured_df[feature_cols]
    y_raw = featured_df["target_risk_category"]

    # Target encoding
    le = LabelEncoder()
    # Explicit class order to ensure consistent mapping
    categories_order = ["Low", "Moderate", "High", "Very High", "Extreme"]
    present_categories = [c for c in categories_order if c in y_raw.unique()]
    le.fit(present_categories)
    y = le.transform(y_raw)

    # Time series split: 80% train, 20% test (strict temporal ordering, no shuffling)
    split_idx = int(len(X) * 0.8)
    X_train, X_test = X.iloc[:split_idx], X.iloc[split_idx:]
    y_train, y_test = y[:split_idx], y[split_idx:]

    print(f">> Step 3: Training classifier on {len(X_train)} samples (evaluating on {len(X_test)} samples)...")
    if HAS_XGBOOST:
        model = XGBClassifier(
            n_estimators=120,
            max_depth=4,
            learning_rate=0.08,
            subsample=0.85,
            colsample_bytree=0.85,
            objective="multi:softprob",
            random_state=42,
            eval_metric="mlogloss",
        )
    else:
        model = GradientBoostingClassifier(
            n_estimators=100,
            max_depth=4,
            learning_rate=0.1,
            random_state=42,
        )

    model.fit(X_train, y_train)

    # Step 4: Strict evaluation on out-of-sample test set
    y_pred = model.predict(X_test)

    acc = float(accuracy_score(y_test, y_pred))
    f1_macro = float(f1_score(y_test, y_pred, average="macro", zero_division=0))
    f1_weighted = float(f1_score(y_test, y_pred, average="weighted", zero_division=0))

    cm = confusion_matrix(y_test, y_pred).tolist()
    report = classification_report(
        y_test,
        y_pred,
        labels=list(range(len(le.classes_))),
        target_names=[str(c) for c in le.classes_],
        output_dict=True,
        zero_division=0,
    )

    # Feature importances
    if hasattr(model, "feature_importances_"):
        importances = {
            col: float(imp) for col, imp in zip(feature_cols, model.feature_importances_)
        }
        # Sort descending
        importances = dict(sorted(importances.items(), key=lambda item: item[1], reverse=True))
    else:
        importances = {}

    metrics = {
        "model_type": "XGBoost Classifier" if HAS_XGBOOST else "Gradient Boosting Classifier",
        "dataset_size": len(featured_df),
        "train_samples": len(X_train),
        "test_samples": len(X_test),
        "accuracy": round(acc, 4),
        "f1_score_macro": round(f1_macro, 4),
        "f1_score_weighted": round(f1_weighted, 4),
        "classes": [str(c) for c in le.classes_],
        "confusion_matrix": cm,
        "classification_report": report,
        "feature_importances": importances,
        "is_simulated_metrics": False,
        "trained_at": pd.Timestamp.now().isoformat(),
    }

    # Save artifacts
    os.makedirs(Config.MODEL_DIR, exist_ok=True)
    pipeline_bundle = {
        "model": model,
        "label_encoder": le,
        "feature_columns": feature_cols,
        "metrics": metrics,
    }
    joblib.dump(pipeline_bundle, Config.MODEL_FILE)

    with open(Config.METRICS_FILE, "w") as f:
        json.dump(metrics, f, indent=2)

    print(f">> Training complete! Accuracy: {acc:.2%}, Macro-F1: {f1_macro:.2%}")
    print(f">> Artifact saved to: {Config.MODEL_FILE}")
    return metrics


if __name__ == "__main__":
    train_heat_risk_model()
