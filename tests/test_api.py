from fastapi.testclient import TestClient
from sqlmodel import SQLModel, create_engine, Session
from sqlmodel.pool import StaticPool

import backend.db_models  # ensures models are loaded
from backend.database import get_session
from backend.api import app

# In-memory SQLite engine for hermetic test execution
test_engine = create_engine(
    "sqlite://",
    connect_args={"check_same_thread": False},
    poolclass=StaticPool,
)
SQLModel.metadata.create_all(test_engine)


def get_test_session():
    with Session(test_engine) as session:
        yield session


app.dependency_overrides[get_session] = get_test_session

client = TestClient(app)


def test_health_endpoint():
    response = client.get("/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "ok"


def test_evaluate_endpoint_validation():
    # Test invalid payload returns 422
    response = client.post("/evaluate", json={})
    assert response.status_code == 422


def test_compare_endpoint_validation():
    # Test missing payload
    response = client.post("/compare", json={})
    assert response.status_code == 422


def test_agents_endpoints():
    response = client.get("/agents")
    assert response.status_code == 200
    assert isinstance(response.json(), list)


def test_datasets_endpoints():
    response = client.get("/datasets")
    assert response.status_code == 200
    assert isinstance(response.json(), list)
