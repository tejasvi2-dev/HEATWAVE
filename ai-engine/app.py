"""
HEATGUARD AI - Flask Application Entrypoint
===========================================
Exposes AI prediction, thermal stress, and vulnerability assessment endpoints.
"""

from flask import Flask, jsonify
from flask_cors import CORS
from config import Config
from routes.prediction_routes import prediction_bp
from routes.analysis_routes import analysis_bp

app = Flask(__name__)
CORS(app)

# Register blueprints
app.register_blueprint(prediction_bp, url_prefix="/api")
app.register_blueprint(analysis_bp, url_prefix="/api/analysis")


@app.route("/predict", methods=["GET"])
def predict_root():
    from routes.prediction_routes import predict_heat_risk
    return predict_heat_risk()


@app.route("/health", methods=["GET"])
@app.route("/api/health", methods=["GET"])
def health():
    return jsonify({
        "status": "online",
        "service": "HEATGUARD AI Engine",
        "city": Config.CITY_NAME,
        "coordinates": {"lat": Config.PUNE_LATITUDE, "lng": Config.PUNE_LONGITUDE},
    })


@app.errorhandler(404)
def not_found(e):
    return jsonify({"success": False, "error": "Endpoint not found"}), 404


@app.errorhandler(500)
def server_error(e):
    return jsonify({"success": False, "error": "Internal AI server error"}), 500


if __name__ == "__main__":
    print(f"🔥 HEATGUARD AI Engine starting on port {Config.FLASK_PORT}...")
    app.run(host="0.0.0.0", port=Config.FLASK_PORT, debug=Config.DEBUG)
