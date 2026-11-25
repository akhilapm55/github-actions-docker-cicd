
import app as application


def setup_function():
    application.app.config["TESTING"] = True


def test_homepage():
    client = application.app.test_client()
    response = client.get("/")
    assert response.status_code == 200
    assert b"DevOps Control Center" in response.data


def test_health_endpoint():
    client = application.app.test_client()
    response = client.get("/health")

    assert response.status_code == 200

    data = response.get_json()
    assert data["status"] == "healthy"
    assert data["application"] == "DevOps Control Center"


def test_metrics_endpoint():
    client = application.app.test_client()
    response = client.get("/api/metrics")

    assert response.status_code == 200

    data = response.get_json()
    assert "cpu_usage" in data
    assert "memory_usage" in data
    assert "uptime_seconds" in data


def test_status_endpoint():
    client = application.app.test_client()
    response = client.get("/api/status")

    assert response.status_code == 200

    data = response.get_json()
    assert data["status"] == "running"
    assert data["version"] == application.APP_VERSION
