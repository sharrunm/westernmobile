import { useState, useEffect } from 'react';
import { Save, Building, Smartphone, FileText, CheckCircle } from 'lucide-react';

export default function Settings() {
    const [settings, setSettings] = useState({
        shopName: 'Western Mobile',
        shopAddress: '123 Tech Avenue, Cityville',
        shopPhone: '+1 (555) 019-8273',
        shopEmail: 'support@westernmobile.com',
        currencySymbol: '$',
        warrantyPeriod: '30-day warranty',
        defaultTaxRate: '0'
    });
    const [saved, setSaved] = useState(false);

    useEffect(() => {
        const stored = localStorage.getItem('shop_settings');
        if (stored) {
            try {
                setSettings(JSON.parse(stored));
            } catch (e) {
                console.error("Error loading settings from localStorage", e);
            }
        }
    }, []);

    const handleChange = (e) => {
        setSettings({ ...settings, [e.target.name]: e.target.value });
        setSaved(false);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        localStorage.setItem('shop_settings', JSON.stringify(settings));
        setSaved(true);
        setTimeout(() => setSaved(false), 3000);
    };

    return (
        <div style={{ maxWidth: '850px', margin: '0 auto' }}>
            <div style={{ marginBottom: '32px' }}>
                <h1>Shop Profile & Settings</h1>
                <p style={{ color: 'var(--text-secondary)' }}>Customize your invoices, defaults, and branding details for real-world operations.</p>
            </div>

            <form onSubmit={handleSubmit} className="glass-panel">
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '24px', color: 'var(--primary)' }}>
                    <Building size={24} /> <h3>Shop Details</h3>
                </div>
                
                <div className="grid-2">
                    <div className="input-group">
                        <label>Shop / Business Name</label>
                        <input required name="shopName" value={settings.shopName} onChange={handleChange} className="input-field" placeholder="e.g. Western Mobile" />
                    </div>
                    <div className="input-group">
                        <label>Business Phone Number</label>
                        <input required name="shopPhone" value={settings.shopPhone} onChange={handleChange} className="input-field" placeholder="e.g. +1 (555) 019-8273" />
                    </div>
                    <div className="input-group">
                        <label>Business Email</label>
                        <input type="email" name="shopEmail" value={settings.shopEmail} onChange={handleChange} className="input-field" placeholder="e.g. support@westernmobile.com" />
                    </div>
                    <div className="input-group">
                        <label>Currency Symbol</label>
                        <input required name="currencySymbol" value={settings.currencySymbol} onChange={handleChange} className="input-field" placeholder="e.g. $, ₹, €, £" />
                    </div>
                    <div className="input-group" style={{ gridColumn: '1 / -1' }}>
                        <label>Full Address</label>
                        <input required name="shopAddress" value={settings.shopAddress} onChange={handleChange} className="input-field" placeholder="e.g. 123 Tech Avenue, Cityville" />
                    </div>
                </div>

                <hr style={{ border: 'none', borderTop: '1px solid var(--border)', margin: '32px 0' }} />

                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '24px', color: 'var(--primary)' }}>
                    <FileText size={24} /> <h3>Operational Defaults</h3>
                </div>

                <div className="grid-2">
                    <div className="input-group">
                        <label>Default Warranty Terms</label>
                        <input required name="warrantyPeriod" value={settings.warrantyPeriod} onChange={handleChange} className="input-field" placeholder="e.g. 30-day warranty" />
                    </div>
                    <div className="input-group">
                        <label>Default Tax Rate (%)</label>
                        <input required type="number" step="0.01" min="0" name="defaultTaxRate" value={settings.defaultTaxRate} onChange={handleChange} className="input-field" placeholder="e.g. 5" />
                    </div>
                </div>

                <div style={{ marginTop: '32px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                        {saved && (
                            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', color: 'var(--success)', fontWeight: 600 }}>
                                <CheckCircle size={20} /> Settings saved successfully!
                            </span>
                        )}
                    </div>
                    <button type="submit" className="btn-primary" style={{ padding: '12px 32px' }}>
                        <Save size={20} /> Save Configuration
                    </button>
                </div>
            </form>
        </div>
    );
}
