
from flask import Flask, jsonify, render_template
import psutil
import os
import time
from datetime import datetime, timezone

app = Flask(__name__)

APP_VERSION = os.getenv("APP_VERSION", "1.0.0")
APP_START_TIME = time.time()


@app.route("/")
def dashboard():
    return render_template("index.html")


@app.route("/health")
def health():
    return jsonify({
        "status": "healthy",
        "application": "DevOps Control Center",
        "version": APP_VERSION,
        "timestamp": datetime.now(timezone.utc).isoformat()
    }), 200


@app.route("/api/metrics")
def metrics():
    memory = psutil.virtual_memory()

    return jsonify({
        "cpu_usage": psutil.cpu_percent(interval=0.5),
        "memory_usage": memory.percent,
        "memory_total_mb": round(memory.total / (1024 * 1024), 2),
        "memory_used_mb": round(memory.used / (1024 * 1024), 2),
        "uptime_seconds": round(time.time() - APP_START_TIME, 2),
        "timestamp": datetime.now(timezone.utc).isoformat()
    })


@app.route("/api/status")
def status():
    return jsonify({
        "application": "DevOps Control Center",
        "status": "running",
        "version": APP_VERSION,
        "environment": os.getenv("ENVIRONMENT", "local"),
        "hostname": os.getenv("HOSTNAME", "localhost")
    })


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000)
