from sqlalchemy import create_engine
from sqlalchemy.orm import declarative_base
from sqlalchemy.orm import sessionmaker
import os

DATABASE_URL = os.getenv("DATABASE_URL")
if not DATABASE_URL:
    # Fallback to local sqlite DB in the parent directory
    base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    # SQLite on Windows needs three slashes, followed by path
    db_path = os.path.join(base_dir, "western_mobile.db").replace("\\", "/")
    DATABASE_URL = f"sqlite:///{db_path}"

engine = create_engine(DATABASE_URL)

SessionLocal = sessionmaker(
    autocommit=False,
    autoflush=False,
    bind=engine
)

Base = declarative_base()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()