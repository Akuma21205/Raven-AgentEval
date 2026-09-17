import os
from dotenv import load_dotenv
from sqlmodel import create_engine, Session

load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./agenteval.db")

# Add check_same_thread=False when using SQLite in multi-threaded FastAPI
connect_args = {"check_same_thread": False} if DATABASE_URL.startswith("sqlite") else {}
engine = create_engine(DATABASE_URL, echo=False, connect_args=connect_args)


def get_session():
    """
    Yields a database session and closes it automatically when done.
    FastAPI routes use this as a dependency via Depends(get_session).
    """
    with Session(engine) as session:
        yield session
