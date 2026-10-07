import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

from app.database import Base, get_db
from app.main import app
from app.models.user import User, UserRole
from app.services.auth import get_password_hash, create_access_token

# In-memory SQLite for high-speed isolated tests
TEST_DATABASE_URL = "sqlite:///:memory:"

engine = create_engine(
    TEST_DATABASE_URL,
    connect_args={"check_same_thread": False},
    poolclass=StaticPool
)
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

@pytest.fixture(scope="function")
def db_session():
    Base.metadata.create_all(bind=engine)
    session = TestingSessionLocal()
    try:
        yield session
    finally:
        session.close()
        Base.metadata.drop_all(bind=engine)

@pytest.fixture(scope="function")
def client(db_session):
    def override_get_db():
        try:
            yield db_session
        finally:
            pass

    app.dependency_overrides[get_db] = override_get_db
    with TestClient(app) as test_client:
        yield test_client
    app.dependency_overrides.clear()

@pytest.fixture
def admin_user(db_session):
    user = User(
        first_name="Admin",
        last_name="System",
        phone="+998900000001",
        email="admin@test.com",
        hashed_password=get_password_hash("AdminPass123!"),
        role=UserRole.ADMIN.value,
        is_active=True,
        is_verified=True
    )
    db_session.add(user)
    db_session.commit()
    db_session.refresh(user)
    return user

@pytest.fixture
def makler_user(db_session):
    user = User(
        first_name="Makler",
        last_name="Broker",
        phone="+998900000002",
        email="makler@test.com",
        hashed_password=get_password_hash("MaklerPass123!"),
        role=UserRole.MAKLER.value,
        is_active=True,
        is_verified=True
    )
    db_session.add(user)
    db_session.commit()
    db_session.refresh(user)
    return user

@pytest.fixture
def client_user(db_session):
    user = User(
        first_name="Mijoz",
        last_name="Client",
        phone="+998900000003",
        email="mijoz@test.com",
        hashed_password=get_password_hash("ClientPass123!"),
        role=UserRole.MIJOZ.value,
        is_active=True,
        is_verified=False
    )
    db_session.add(user)
    db_session.commit()
    db_session.refresh(user)
    return user

@pytest.fixture
def auth_headers(admin_user, makler_user, client_user):
    def _get_headers(role: str):
        if role == "admin":
            user = admin_user
        elif role == "makler":
            user = makler_user
        else:
            user = client_user
        token = create_access_token({"sub": str(user.id), "role": user.role})
        return {"Authorization": f"Bearer {token}"}
    return _get_headers
