from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .database import engine, Base
from .routes import auth, invoices

# Create tables
Base.metadata.create_all(bind=engine)

# Auto-migration logic for SQLite tables (adds columns to existing tables dynamically)
from sqlalchemy import inspect, text
inspector = inspect(engine)
columns = [col['name'] for col in inspector.get_columns('invoices')]
with engine.begin() as conn:
    # Explicitly check for new fields and add them
    if 'repair_status' not in columns:
        conn.execute(text("ALTER TABLE invoices ADD COLUMN repair_status VARCHAR DEFAULT 'Received'"))
    if 'parts_cost' not in columns:
        conn.execute(text("ALTER TABLE invoices ADD COLUMN parts_cost FLOAT DEFAULT 0.0"))
    if 'tech_notes' not in columns:
        conn.execute(text("ALTER TABLE invoices ADD COLUMN tech_notes TEXT"))
    if 'expected_delivery' not in columns:
        conn.execute(text("ALTER TABLE invoices ADD COLUMN expected_delivery DATETIME"))
    if 'actual_delivered_at' not in columns:
        conn.execute(text("ALTER TABLE invoices ADD COLUMN actual_delivered_at DATETIME"))
    if 'warranty_days' not in columns:
        conn.execute(text("ALTER TABLE invoices ADD COLUMN warranty_days INTEGER DEFAULT 30"))


app = FastAPI(title="Western Mobile Billing API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # For local testing we allow all
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router, prefix="/api/auth", tags=["Auth"])
app.include_router(invoices.router, prefix="/api/invoices", tags=["Invoices"])

@app.get("/")
def root():
    return {"message": "Welcome to Western Mobile Billing API"}
