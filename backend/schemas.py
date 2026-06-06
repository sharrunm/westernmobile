from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class UserBase(BaseModel):
    username: str

class UserCreate(UserBase):
    password: str
    role: Optional[str] = "staff"

class UserOut(UserBase):
    id: int
    role: str
    class Config:
        from_attributes = True

class InvoiceCreate(BaseModel):
    customer_name: str
    customer_phone: str
    customer_email: Optional[str] = ""
    customer_address: Optional[str] = ""
    
    mobile_brand: str
    mobile_model: str
    imei: Optional[str] = ""
    
    service_type: str
    problem_desc: Optional[str] = ""
    
    service_rate: float
    parts_cost: Optional[float] = 0.0
    tax_rate: Optional[float] = 0.0
    payment_status: Optional[str] = "Pending"
    repair_status: Optional[str] = "Received"
    tech_notes: Optional[str] = ""
    expected_delivery: Optional[datetime] = None
    actual_delivered_at: Optional[datetime] = None
    warranty_days: Optional[int] = 30

class InvoiceStatusUpdate(BaseModel):
    payment_status: str

class InvoiceRepairStatusUpdate(BaseModel):
    repair_status: str
    tech_notes: Optional[str] = ""

class InvoiceOut(InvoiceCreate):
    id: int
    invoice_number: str
    created_at: datetime
    user_id: Optional[int] = None
    total_amount: float

    class Config:
        from_attributes = True

class Token(BaseModel):
    access_token: str
    token_type: str
