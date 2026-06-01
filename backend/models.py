from sqlalchemy import Column, Integer, String, Float, Text, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from datetime import datetime
from .database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, index=True)
    password_hash = Column(String)
    role = Column(String, default="staff")
    
    invoices = relationship("Invoice", back_populates="user")

class Invoice(Base):
    __tablename__ = "invoices"

    id = Column(Integer, primary_key=True, index=True)
    invoice_number = Column(String, unique=True, index=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    user_id = Column(Integer, ForeignKey("users.id"))
    
    customer_name = Column(String)
    customer_phone = Column(String)
    customer_email = Column(String, nullable=True)
    customer_address = Column(String, nullable=True)
    
    mobile_brand = Column(String)
    mobile_model = Column(String)
    imei = Column(String, nullable=True)
    
    service_type = Column(String)
    problem_desc = Column(Text)
    
    service_rate = Column(Float) # acts as Labor Charge
    parts_cost = Column(Float, default=0.0) # spare parts cost
    tax_rate = Column(Float, default=0.0)
    total_amount = Column(Float)
    payment_status = Column(String, default="Pending") # Paid, Pending
    repair_status = Column(String, default="Received") # Received, Under Inspection, Waiting for Parts, Repairing, Completed, Delivered
    tech_notes = Column(Text, nullable=True) # internal tech notes
    
    expected_delivery = Column(DateTime, nullable=True)
    actual_delivered_at = Column(DateTime, nullable=True)
    warranty_days = Column(Integer, default=30) # default 30 days
    
    user = relationship("User", back_populates="invoices")
