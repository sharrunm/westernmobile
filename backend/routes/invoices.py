from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from sqlalchemy import desc, func
from datetime import datetime

import schemas
import models
import database

router = APIRouter()

@router.post("/", response_model=schemas.InvoiceOut)
def create_invoice(invoice: schemas.InvoiceCreate, db: Session = Depends(database.get_db)):
    last_invoice = db.query(models.Invoice).order_by(desc(models.Invoice.id)).first()
    next_num = 1001
    if last_invoice and last_invoice.invoice_number.startswith("WM-"):
        try:
            next_num = int(last_invoice.invoice_number.split("-")[1]) + 1
        except:
            pass

    gen_inv_number = f"WM-{next_num}"
    
    # Billing calculation - ONLY Service Charge (service_rate) is billed to the customer
    subtotal = invoice.service_rate
    tax_amount = subtotal * (invoice.tax_rate / 100.0)
    total_amount = subtotal + tax_amount

    try:
        invoice_data = invoice.model_dump()
    except AttributeError:
        invoice_data = invoice.dict()

    new_invoice = models.Invoice(
        **invoice_data,
        invoice_number=gen_inv_number,
        user_id=None,
        total_amount=total_amount
    )
    db.add(new_invoice)
    db.commit()
    db.refresh(new_invoice)
    return new_invoice

@router.get("/", response_model=List[schemas.InvoiceOut])
def get_invoices(skip: int = 0, limit: int = 100, search: str = "", db: Session = Depends(database.get_db)):
    query = db.query(models.Invoice)
    if search:
        query = query.filter(
            (models.Invoice.customer_name.contains(search)) |
            (models.Invoice.customer_phone.contains(search)) |
            (models.Invoice.invoice_number.contains(search)) |
            (models.Invoice.imei.contains(search))
        )
    invoices = query.order_by(desc(models.Invoice.created_at)).offset(skip).limit(limit).all()
    return invoices

# IMPORTANT: /stats MUST be defined BEFORE /{invoice_id} to avoid route conflict
@router.get("/stats")
def get_stats(db: Session = Depends(database.get_db)):
    now = datetime.utcnow()
    start_of_month = now.replace(day=1, hour=0, minute=0, second=0, microsecond=0)
    start_of_today = now.replace(hour=0, minute=0, second=0, microsecond=0)

    monthly_income = db.query(func.sum(models.Invoice.total_amount)).filter(
        models.Invoice.payment_status == "Paid",
        models.Invoice.created_at >= start_of_month
    ).scalar() or 0.0

    total_income = db.query(func.sum(models.Invoice.total_amount)).filter(
        models.Invoice.payment_status == "Paid"
    ).scalar() or 0.0

    active_repairs = db.query(models.Invoice).filter(
        (models.Invoice.repair_status != "Delivered") | (models.Invoice.payment_status == "Pending")
    ).count()

    total_bills = db.query(models.Invoice).count()

    # Daily Stats for Repair Shop
    repairs_completed_today = db.query(models.Invoice).filter(
        models.Invoice.repair_status == "Completed",
        models.Invoice.created_at >= start_of_today
    ).count()

    total_income_today = db.query(func.sum(models.Invoice.total_amount)).filter(
        models.Invoice.payment_status == "Paid",
        models.Invoice.created_at >= start_of_today
    ).scalar() or 0.0

    delivered_today = db.query(models.Invoice).filter(
        models.Invoice.repair_status == "Delivered",
        models.Invoice.actual_delivered_at >= start_of_today
    ).count()

    pending_jobs = db.query(models.Invoice).filter(
        models.Invoice.repair_status != "Delivered",
        models.Invoice.repair_status != "Completed"
    ).count()

    # Profit calculations: (service_rate - parts_cost) for paid invoices
    monthly_profit = db.query(func.sum(func.coalesce(models.Invoice.service_rate, 0.0) - func.coalesce(models.Invoice.parts_cost, 0.0))).filter(
        models.Invoice.payment_status == "Paid",
        models.Invoice.created_at >= start_of_month
    ).scalar() or 0.0

    total_profit = db.query(func.sum(func.coalesce(models.Invoice.service_rate, 0.0) - func.coalesce(models.Invoice.parts_cost, 0.0))).filter(
        models.Invoice.payment_status == "Paid"
    ).scalar() or 0.0

    today_profit = db.query(func.sum(func.coalesce(models.Invoice.service_rate, 0.0) - func.coalesce(models.Invoice.parts_cost, 0.0))).filter(
        models.Invoice.payment_status == "Paid",
        models.Invoice.created_at >= start_of_today
    ).scalar() or 0.0

    return {
        "monthly_income": monthly_income,
        "total_income": total_income,
        "active_repairs": active_repairs,
        "total_bills": total_bills,
        "repairs_completed_today": repairs_completed_today,
        "total_income_today": total_income_today,
        "delivered_today": delivered_today,
        "pending_jobs": pending_jobs,
        "monthly_profit": monthly_profit,
        "total_profit": total_profit,
        "today_profit": today_profit
    }

@router.patch("/{invoice_id}/status", response_model=schemas.InvoiceOut)
def update_invoice_status(invoice_id: int, status_update: schemas.InvoiceStatusUpdate, db: Session = Depends(database.get_db)):
    invoice = db.query(models.Invoice).filter(models.Invoice.id == invoice_id).first()
    if not invoice:
        raise HTTPException(status_code=404, detail="Invoice not found")
    invoice.payment_status = status_update.payment_status
    db.commit()
    db.refresh(invoice)
    return invoice

@router.patch("/{invoice_id}/repair-status", response_model=schemas.InvoiceOut)
def update_invoice_repair_status(invoice_id: int, status_update: schemas.InvoiceRepairStatusUpdate, db: Session = Depends(database.get_db)):
    invoice = db.query(models.Invoice).filter(models.Invoice.id == invoice_id).first()
    if not invoice:
        raise HTTPException(status_code=404, detail="Invoice not found")
    
    invoice.repair_status = status_update.repair_status
    if status_update.tech_notes is not None:
        invoice.tech_notes = status_update.tech_notes
    
    if status_update.repair_status == "Delivered":
        invoice.actual_delivered_at = datetime.utcnow()
        
    db.commit()
    db.refresh(invoice)
    return invoice

@router.get("/{invoice_id}", response_model=schemas.InvoiceOut)
def get_invoice(invoice_id: int, db: Session = Depends(database.get_db)):
    invoice = db.query(models.Invoice).filter(models.Invoice.id == invoice_id).first()
    if not invoice:
        raise HTTPException(status_code=404, detail="Invoice not found")
    return invoice
