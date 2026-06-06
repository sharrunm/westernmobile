import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { PlusCircle, FileText, Smartphone, User, Wrench, Calendar, ShieldCheck } from 'lucide-react';
import api from '../api';

export default function CreateBill() {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [currencySymbol, setCurrencySymbol] = useState('$');
    const [formData, setFormData] = useState({
        customer_name: '', customer_phone: '', customer_email: '', customer_address: '',
        mobile_brand: '', mobile_model: '', imei: '',
        service_type: 'Screen Repair', problem_desc: '',
        service_rate: '', parts_cost: '0.00', tax_rate: '0', 
        payment_status: 'Pending', repair_status: 'Repairing', 
        tech_notes: '', expected_delivery: '', warranty_days: '30'
    });

    useEffect(() => {
        const stored = localStorage.getItem('shop_settings');
        if (stored) {
            try {
                const parsed = JSON.parse(stored);
                if (parsed.defaultTaxRate) {
                    setFormData(prev => ({ ...prev, tax_rate: parsed.defaultTaxRate }));
                }
                if (parsed.currencySymbol) {
                    setCurrencySymbol(parsed.currencySymbol);
                }
                if (parsed.warrantyPeriod) {
                    // Extract numeric value from "30-day warranty" style strings
                    const match = parsed.warrantyPeriod.match(/\d+/);
                    if (match) {
                        setFormData(prev => ({ ...prev, warranty_days: match[0] }));
                    }
                }
            } catch (e) {
                console.error(e);
            }
        }
        
        // Default expected delivery date: tomorrow
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        const yyyy = tomorrow.getFullYear();
        const mm = String(tomorrow.getMonth() + 1).padStart(2, '0');
        const dd = String(tomorrow.getDate()).padStart(2, '0');
        setFormData(prev => ({ ...prev, expected_delivery: `${yyyy}-${mm}-${dd}` }));
    }, []);

    const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const payload = {
                ...formData,
                service_rate: parseFloat(formData.service_rate || 0),
                parts_cost: parseFloat(formData.parts_cost || 0),
                tax_rate: parseFloat(formData.tax_rate || 0),
                warranty_days: parseInt(formData.warranty_days || 30),
                expected_delivery: formData.expected_delivery ? new Date(formData.expected_delivery).toISOString() : null
            };
            const res = await api.post('/invoices/', payload);
            navigate(`/invoice/${res.data.id}`);
        } catch (err) {
            console.error(err);
            alert("Failed to create repair job. Ensure backend is running and valid data.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ maxWidth: '950px', margin: '0 auto' }}>
            <div style={{ marginBottom: '32px' }}>
                <h1>New Repair Job Ticket</h1>
                <p style={{ color: 'var(--text-secondary)' }}>Log device details, repair issues, and set expectations for dynamic service tracking.</p>
            </div>

            <form onSubmit={handleSubmit} className="glass-panel" autoComplete="off">
                {/* Section 1: Customer Details */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '24px', color: 'var(--primary)' }}>
                    <User size={24} /> <h3>Customer Details</h3>
                </div>
                <div className="grid-2" style={{ marginBottom: '16px' }}>
                    <div className="input-group">
                        <label>Full Name *</label>
                        <input required name="customer_name" value={formData.customer_name} onChange={handleChange} className="input-field" placeholder="John Doe" autoComplete="off" />
                    </div>
                    <div className="input-group">
                        <label>Phone Number *</label>
                        <input required name="customer_phone" value={formData.customer_phone} onChange={handleChange} className="input-field" placeholder="+1 234 567 8900" autoComplete="off" />
                    </div>
                    <div className="input-group">
                        <label>Email Address</label>
                        <input type="email" name="customer_email" value={formData.customer_email} onChange={handleChange} className="input-field" placeholder="john@example.com" autoComplete="off" />
                    </div>
                    <div className="input-group">
                        <label>Address</label>
                        <input name="customer_address" value={formData.customer_address} onChange={handleChange} className="input-field" placeholder="123 Main St, City" autoComplete="off" />
                    </div>
                </div>

                <hr style={{ border: 'none', borderTop: '1px solid var(--border)', margin: '32px 0' }} />

                {/* Section 2: Device Details */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '24px', color: 'var(--primary)' }}>
                    <Smartphone size={24} /> <h3>Device Details</h3>
                </div>
                <div className="grid-3" style={{ marginBottom: '16px' }}>
                    <div className="input-group">
                        <label>Brand *</label>
                        <input required name="mobile_brand" value={formData.mobile_brand} onChange={handleChange} className="input-field" placeholder="e.g. Apple, Samsung" autoComplete="off" />
                    </div>
                    <div className="input-group">
                        <label>Model *</label>
                        <input required name="mobile_model" value={formData.mobile_model} onChange={handleChange} className="input-field" placeholder="e.g. iPhone 13 Pro" autoComplete="off" />
                    </div>
                    <div className="input-group">
                        <label>IMEI / Serial Number *</label>
                        <input required name="imei" value={formData.imei} onChange={handleChange} className="input-field" placeholder="15-digit number or S/N" autoComplete="off" />
                    </div>
                </div>

                <hr style={{ border: 'none', borderTop: '1px solid var(--border)', margin: '32px 0' }} />

                {/* Section 3: Service & Repairs */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '24px', color: 'var(--primary)' }}>
                    <Wrench size={24} /> <h3>Service Details & Repair Status</h3>
                </div>
                <div className="grid-3" style={{ marginBottom: '16px' }}>
                    <div className="input-group">
                        <label>Service Type *</label>
                        <select required name="service_type" value={formData.service_type} onChange={handleChange} className="input-field">
                            <option>Display Replacement</option>
                            <option>Battery Replacement</option>
                            <option>Charging Issue Repair</option>
                            <option>Software Flashing / Unlock</option>
                            <option>Water Damage Repair</option>
                            <option>General Service</option>
                            <option>Other Repair</option>
                        </select>
                    </div>
                    <div className="input-group">
                        <label>Initial Repair Status</label>
                        <select name="repair_status" value={formData.repair_status} onChange={handleChange} className="input-field">
                            <option>Repairing</option>
                            <option>Completed</option>
                            <option>Delivered</option>
                        </select>
                    </div>
                    <div className="input-group">
                        <label>Payment Status</label>
                        <select name="payment_status" value={formData.payment_status} onChange={handleChange} className="input-field">
                            <option>Pending</option>
                            <option>Paid</option>
                        </select>
                    </div>
                </div>

                <hr style={{ border: 'none', borderTop: '1px solid var(--border)', margin: '32px 0' }} />

                {/* Section 4: Timeline & Warranty */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '24px', color: 'var(--primary)' }}>
                    <Calendar size={24} /> <h3>Timeline & Warranty</h3>
                </div>
                <div className="grid-2" style={{ marginBottom: '16px' }}>
                    <div className="input-group">
                        <label>Expected Delivery Date *</label>
                        <input required type="date" name="expected_delivery" value={formData.expected_delivery} onChange={handleChange} className="input-field" autoComplete="off" />
                    </div>
                    <div className="input-group">
                        <label>Repair Service Warranty (Days) *</label>
                        <div style={{ position: 'relative' }}>
                            <input required type="number" min="0" name="warranty_days" value={formData.warranty_days} onChange={handleChange} className="input-field" placeholder="30" autoComplete="off" />
                            <ShieldCheck size={20} style={{ position: 'absolute', right: '12px', top: '12px', color: 'var(--success)' }} />
                        </div>
                    </div>
                </div>

                <hr style={{ border: 'none', borderTop: '1px solid var(--border)', margin: '32px 0' }} />

                {/* Section 5: Billing & Pricing */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '24px', color: 'var(--primary)' }}>
                    <PlusCircle size={24} /> <h3>Parts & Service Pricing</h3>
                </div>
                <div className="grid-3">
                    <div className="input-group">
                        <label>Labor / Service Charge ({currencySymbol}) *</label>
                        <input required type="number" step="0.01" min="0" name="service_rate" value={formData.service_rate} onChange={handleChange} className="input-field" placeholder="0.00" autoComplete="off" />
                    </div>
                    <div className="input-group">
                        <label>Spare Parts Cost ({currencySymbol})</label>
                        <input type="number" step="0.01" min="0" name="parts_cost" value={formData.parts_cost} onChange={handleChange} className="input-field" placeholder="0.00" autoComplete="off" />
                    </div>
                    <div className="input-group">
                        <label>Tax Rate (%)</label>
                        <input type="number" step="0.01" min="0" name="tax_rate" value={formData.tax_rate} onChange={handleChange} className="input-field" placeholder="0" autoComplete="off" />
                    </div>
                </div>

                <div style={{ marginTop: '40px', display: 'flex', justifyContent: 'flex-end' }}>
                    <button type="submit" className="btn-primary" style={{ padding: '14px 40px', fontSize: '1.05rem' }} disabled={loading}>
                        {loading ? 'Creating Ticket...' : <><PlusCircle size={20} /> Create Repair Ticket</>}
                    </button>
                </div>
            </form>
        </div>
    );
}
