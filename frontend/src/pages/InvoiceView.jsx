import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Printer, ArrowLeft, CheckCircle, Smartphone, User, FileText, Send, Calendar, ShieldAlert } from 'lucide-react';
import api from '../api';

export default function InvoiceView() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [invoice, setInvoice] = useState(null);
    const [loading, setLoading] = useState(true);
    const [printMode, setPrintMode] = useState('Invoice'); // 'Invoice' or 'JobSheet'
    const [updating, setUpdating] = useState(false);
    
    // Editable state for diagnostics & status
    const [repairStatus, setRepairStatus] = useState('Received');
    const [techNotes, setTechNotes] = useState('');

    const [shopSettings, setShopSettings] = useState({
        shopName: 'Western Mobile',
        shopAddress: '123 Tech Avenue, Cityville',
        shopPhone: '+1 (555) 019-8273',
        shopEmail: 'support@westernmobile.com',
        currencySymbol: '$',
        warrantyPeriod: '30-day warranty'
    });

    useEffect(() => {
        const stored = localStorage.getItem('shop_settings');
        if (stored) {
            try {
                const parsed = JSON.parse(stored);
                setShopSettings(prev => ({ ...prev, ...parsed }));
            } catch (e) {
                console.error(e);
            }
        }
    }, []);

    useEffect(() => {
        const fetchInvoice = async () => {
            try {
                const res = await api.get(`/invoices/${id}`);
                setInvoice(res.data);
                setRepairStatus(res.data.repair_status);
                setTechNotes(res.data.tech_notes || '');
            } catch (err) {
                console.error("Not found");
            } finally {
                setLoading(false);
            }
        };
        fetchInvoice();
    }, [id]);

    const handleMarkPaid = async () => {
        try {
            const res = await api.patch(`/invoices/${id}/status`, { payment_status: 'Paid' });
            setInvoice(prev => ({ ...prev, payment_status: 'Paid' }));
        } catch (error) {
            alert("Failed to update payment status.");
        }
    };

    const handleUpdateRepairStatus = async () => {
        setUpdating(true);
        try {
            const res = await api.patch(`/invoices/${id}/repair-status`, {
                repair_status: repairStatus,
                tech_notes: techNotes
            });
            setInvoice(res.data);
            alert("Repair ticket details updated successfully!");
        } catch (error) {
            alert("Failed to update repair status.");
        } finally {
            setUpdating(false);
        }
    };

    const handleWhatsApp = () => {
        if (!invoice) return;
        const cleanPhone = invoice.customer_phone.replace(/\D/g, '');
        const message = `Hi ${invoice.customer_name},\n\nYour device repair status for ${invoice.mobile_brand} ${invoice.mobile_model} is now: *${invoice.repair_status}*.\nJob ID: *${invoice.invoice_number}*\nTotal Charge: *${shopSettings.currencySymbol}${invoice.total_amount.toFixed(2)}*\n\nPlease collect it from our shop.\n\nThank you,\n-${shopSettings.shopName}`;
        window.open(`https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`, '_blank');
    };

    if (loading) return <div style={{ padding: '40px' }}>Loading Repair Ticket...</div>;
    if (!invoice) return <div style={{ padding: '40px', color: 'var(--danger)' }}>Repair Ticket Not Found</div>;

    const subtotal = invoice.service_rate;
    const taxAmount = subtotal * (invoice.tax_rate / 100);
    const warrantyExpiry = new Date(new Date(invoice.created_at).getTime() + (invoice.warranty_days * 24 * 60 * 60 * 1000));

    return (
        <div style={{ maxWidth: '950px', margin: '0 auto', paddingBottom: '80px' }}>
            
            {/* Top Toolbar (Hidden during Print) */}
            <div className="no-print" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '16px' }}>
                <button className="btn-secondary" onClick={() => navigate('/')}>
                    <ArrowLeft size={20} /> Dashboard
                </button>

                {/* Print Layout Toggle */}
                <div style={{ display: 'flex', background: 'var(--surface-color)', padding: '4px', borderRadius: '10px', border: '1px solid var(--border)' }}>
                    <button 
                        style={{
                            padding: '8px 16px', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 600,
                            background: printMode === 'Invoice' ? 'var(--primary)' : 'transparent',
                            color: printMode === 'Invoice' ? 'white' : 'var(--text-secondary)'
                        }}
                        onClick={() => setPrintMode('Invoice')}
                    >
                        Print Invoice Mode
                    </button>
                    <button 
                        style={{
                            padding: '8px 16px', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 600,
                            background: printMode === 'JobSheet' ? 'var(--primary)' : 'transparent',
                            color: printMode === 'JobSheet' ? 'white' : 'var(--text-secondary)'
                        }}
                        onClick={() => setPrintMode('JobSheet')}
                    >
                        Print Job Sheet Mode
                    </button>
                </div>

                <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                    {invoice.payment_status === 'Pending' ? (
                        <button className="btn-secondary" onClick={handleMarkPaid} style={{ color: 'var(--success)', borderColor: 'var(--success)', background: 'rgba(16, 185, 129, 0.1)' }}>
                            <CheckCircle size={20} /> Mark Paid
                        </button>
                    ) : (
                        <span style={{ display: 'inline-flex', alignItems: 'center', color: 'var(--success)', gap: '8px', padding: '10px 16px', background: 'rgba(16, 185, 129, 0.1)', borderRadius: '10px', fontWeight: 600 }}>
                            <CheckCircle size={20} /> Paid / Settled
                        </span>
                    )}

                    <button className="btn-secondary" onClick={handleWhatsApp} style={{ color: '#25D366', borderColor: '#25D366', background: 'rgba(37, 211, 102, 0.1)' }}>
                        <Send size={20} /> Send WhatsApp
                    </button>

                    <button className="btn-primary" onClick={() => window.print()}>
                        <Printer size={20} /> Print / Save PDF
                    </button>
                </div>
            </div>

            {/* Main Flex Grid layout for CRM editing options on right & Printed invoice on left */}
            <div style={{ display: 'flex', gap: '24px', alignItems: 'flex-start' }} className="crm-layout">
                
                {/* 1. Printed Job Sheet / Invoice Container (Takes full width during Print) */}
                <div className="glass-panel print-text-dark print-full-width" style={{ flexGrow: 1, background: 'white', color: 'black', padding: '48px', position: 'relative', minHeight: '800px', borderRadius: '16px' }}>
                    
                    {/* Watermark Paid */}
                    {printMode === 'Invoice' && invoice.payment_status === 'Paid' && (
                        <div style={{
                            position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%) rotate(-30deg)',
                            fontSize: '8rem', color: 'rgba(16, 185, 129, 0.06)', fontWeight: 900, pointerEvents: 'none', zIndex: 0
                        }}>
                            PAID
                        </div>
                    )}

                    {/* Header */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '2px solid #e2e8f0', paddingBottom: '24px', zIndex: 1, position: 'relative' }}>
                        <div>
                            <h1 style={{ color: '#0f172a', margin: '0 0 8px 0', fontSize: '2.2rem', fontWeight: 800 }}>{shopSettings.shopName}</h1>
                            <p style={{ margin: 0, color: '#475569', fontSize: '0.95rem' }}>{shopSettings.shopAddress}</p>
                            <p style={{ margin: 0, color: '#475569', fontSize: '0.95rem' }}>Phone: {shopSettings.shopPhone}</p>
                            {shopSettings.shopEmail && <p style={{ margin: 0, color: '#475569', fontSize: '0.95rem' }}>Email: {shopSettings.shopEmail}</p>}
                        </div>
                        <div style={{ textAlign: 'right' }}>
                            <h2 style={{ color: '#dc2626', margin: '0 0 8px 0', fontSize: '1.75rem', fontWeight: 800 }}>
                                {printMode === 'Invoice' ? 'INVOICE' : 'REPAIR JOB SHEET'}
                            </h2>
                            <p style={{ margin: 0, fontWeight: 'bold', fontSize: '1.1rem' }}>Job ID: #{invoice.invoice_number}</p>
                            <p style={{ margin: 0, color: '#475569', fontSize: '0.9rem' }}>Date: {new Date(invoice.created_at).toLocaleDateString()}</p>
                            <p style={{ margin: 0, color: '#475569', fontSize: '0.9rem' }}>Time: {new Date(invoice.created_at).toLocaleTimeString()}</p>
                        </div>
                    </div>

                    {/* Customer & Device Meta Grid */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '32px 0', borderBottom: '1px solid #f1f5f9', zIndex: 1, position: 'relative' }}>
                        <div>
                            <h4 style={{ color: '#94a3b8', margin: '0 0 8px 0', textTransform: 'uppercase', fontSize: '0.75rem', letterSpacing: '0.05em', fontWeight: 700 }}>Customer Details</h4>
                            <p style={{ margin: 0, fontWeight: 'bold', fontSize: '1.15rem', color: '#0f172a' }}>{invoice.customer_name}</p>
                            <p style={{ margin: 0, color: '#475569', fontSize: '0.95rem' }}>Phone: {invoice.customer_phone}</p>
                            {invoice.customer_email && <p style={{ margin: 0, color: '#475569', fontSize: '0.95rem' }}>Email: {invoice.customer_email}</p>}
                            {invoice.customer_address && <p style={{ margin: 0, color: '#475569', fontSize: '0.95rem' }}>Address: {invoice.customer_address}</p>}
                        </div>
                        <div style={{ textAlign: 'right' }}>
                            <h4 style={{ color: '#94a3b8', margin: '0 0 8px 0', textTransform: 'uppercase', fontSize: '0.75rem', letterSpacing: '0.05em', fontWeight: 700 }}>Device Diagnosis</h4>
                            <p style={{ margin: 0, fontWeight: 'bold', fontSize: '1.1rem', color: '#0f172a' }}>{invoice.mobile_brand} {invoice.mobile_model}</p>
                            <p style={{ margin: 0, color: '#475569', fontSize: '0.95rem' }}>IMEI: {invoice.imei || 'N/A'}</p>
                            <p style={{ margin: '8px 0 0 0', color: '#dc2626', fontSize: '0.95rem', fontWeight: 600 }}>Expected: {invoice.expected_delivery ? new Date(invoice.expected_delivery).toLocaleDateString() : 'Immediate'}</p>
                        </div>
                    </div>

                    {/* Table Details */}
                    <div style={{ zIndex: 1, position: 'relative' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '24px' }}>
                            <thead>
                                <tr style={{ background: '#f8fafc', color: '#475569', borderBottom: '2px solid #e2e8f0', textAlign: 'left', textTransform: 'uppercase', fontSize: '0.8rem', fontWeight: 700 }}>
                                    <th style={{ padding: '14px 12px' }}>Service / Repair Job</th>
                                    {printMode === 'Invoice' && <th style={{ padding: '14px 12px', textAlign: 'right' }}>Service Charge</th>}
                                </tr>
                            </thead>
                            <tbody>
                                <tr style={{ borderBottom: '1px solid #e2e8f0', verticalAlign: 'top' }}>
                                    <td style={{ padding: '20px 12px', color: '#0f172a', fontWeight: 600 }}>{invoice.service_type}</td>
                                    
                                    {/* Print Mode Billing Charge Columns */}
                                    {printMode === 'Invoice' && (
                                        <td style={{ padding: '20px 12px', textAlign: 'right', color: '#0f172a', fontWeight: 600 }}>
                                            {shopSettings.currencySymbol}{invoice.service_rate.toFixed(2)}
                                        </td>
                                    )}
                                </tr>
                            </tbody>
                        </table>

                        {/* Calculations Row / Signature Row */}
                        {printMode === 'Invoice' ? (
                            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '32px' }}>
                                <div style={{ width: '300px' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', color: '#475569' }}>
                                        <span>Subtotal</span>
                                        <span style={{ fontWeight: 500 }}>{shopSettings.currencySymbol}{subtotal.toFixed(2)}</span>
                                    </div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', color: '#475569', borderBottom: '2px solid #e2e8f0' }}>
                                        <span>Tax ({invoice.tax_rate}%)</span>
                                        <span style={{ fontWeight: 500 }}>{shopSettings.currencySymbol}{taxAmount.toFixed(2)}</span>
                                    </div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '16px 0', fontWeight: 'bold', fontSize: '1.4rem', color: '#dc2626' }}>
                                        <span>Total Amount</span>
                                        <span>{shopSettings.currencySymbol}{invoice.total_amount.toFixed(2)}</span>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '120px', padding: '0 24px' }}>
                                <div style={{ borderTop: '1px dashed #94a3b8', width: '220px', textAlign: 'center', paddingTop: '10px' }}>
                                    <p style={{ margin: 0, fontSize: '0.85rem', color: '#475569', fontWeight: 600 }}>Customer Signature</p>
                                </div>
                                <div style={{ borderTop: '1px dashed #94a3b8', width: '220px', textAlign: 'center', paddingTop: '10px' }}>
                                    <p style={{ margin: 0, fontSize: '0.85rem', color: '#475569', fontWeight: 600 }}>Technician Signature</p>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Warranty Tag */}
                    {printMode === 'Invoice' && (
                        <div style={{ marginTop: '32px', display: 'inline-flex', alignItems: 'center', gap: '8px', background: '#f0fdf4', border: '1px solid #bbf7d0', padding: '8px 16px', borderRadius: '8px', color: '#16a34a', fontSize: '0.9rem', fontWeight: 600 }}>
                            🛡️ Repair Warranty Active: {invoice.warranty_days} Days (Expires: {warrantyExpiry.toLocaleDateString()})
                        </div>
                    )}

                    {/* Bottom Disclaimer */}
                    <div style={{ marginTop: '80px', textAlign: 'center', color: '#94a3b8', fontSize: '0.85rem', borderTop: '1px solid #f1f5f9', paddingTop: '24px', zIndex: 1, position: 'relative' }}>
                        <p style={{ margin: '0 0 4px 0', color: '#64748b', fontWeight: 600 }}>Thank you for choosing {shopSettings.shopName}!</p>
                        <p style={{ margin: 0 }}>All repairs come with a standard {shopSettings.warrantyPeriod} unless otherwise stated.</p>
                    </div>
                </div>

                {/* 2. Right CRM Operational Sidebar Panel (Hidden during Print) */}
                <div className="glass-panel no-print" style={{ width: '320px', flexShrink: 0, padding: '24px', background: 'var(--surface-color)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px', color: 'var(--primary)' }}>
                        <Smartphone size={20} />
                        <h4 style={{ margin: 0 }}>Operation Status</h4>
                    </div>

                    {/* Repair Status selector */}
                    <div className="input-group" style={{ marginBottom: '16px' }}>
                        <label style={{ fontSize: '0.85rem', marginBottom: '6px', color: 'var(--text-secondary)' }}>Repair Tracker State</label>
                        <select 
                            value={repairStatus} 
                            onChange={(e) => setRepairStatus(e.target.value)} 
                            className="input-field"
                            style={{ background: 'rgba(0,0,0,0.2)' }}
                        >
                            <option>Repairing</option>
                            <option>Completed</option>
                            <option>Delivered</option>
                        </select>
                    </div>

                    <button 
                        className="btn-primary" 
                        style={{ width: '100%', padding: '12px' }} 
                        onClick={handleUpdateRepairStatus}
                        disabled={updating}
                    >
                        {updating ? 'Updating...' : 'Update Repair Status'}
                    </button>

                    {/* Details overview list */}
                    <hr style={{ border: 'none', borderTop: '1px solid var(--border)', margin: '24px 0' }} />
                    
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '0.85rem' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                            <span style={{ color: 'var(--text-secondary)' }}>Job Received:</span>
                            <span style={{ fontWeight: 600, color: 'white' }}>{new Date(invoice.created_at).toLocaleDateString()}</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                            <span style={{ color: 'var(--text-secondary)' }}>Expected Work:</span>
                            <span style={{ fontWeight: 600, color: 'var(--primary)' }}>
                                {invoice.expected_delivery ? new Date(invoice.expected_delivery).toLocaleDateString() : 'N/A'}
                            </span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                            <span style={{ color: 'var(--text-secondary)' }}>Delivered On:</span>
                            <span style={{ fontWeight: 600, color: 'var(--success)' }}>
                                {invoice.actual_delivered_at ? new Date(invoice.actual_delivered_at).toLocaleDateString() : 'Awaiting Delivery'}
                            </span>
                        </div>
                    </div>
                </div>

            </div>

            {/* Custom stylesheet specifically targeting paper media prints */}
            <style>{`
                @media print {
                    body { background: white !important; color: black !important; }
                    .no-print { display: none !important; }
                    .crm-layout { display: block !important; }
                    .print-full-width { 
                        width: 100% !important; 
                        box-shadow: none !important; 
                        border: none !important; 
                        padding: 0 !important;
                        background: transparent !important;
                    }
                    .print-text-dark * { color: black !important; }
                }
            `}</style>
        </div>
    );
}
