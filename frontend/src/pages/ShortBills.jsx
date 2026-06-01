import { useState, useEffect } from 'react';
import { Calendar, ArrowUpDown, Eye, DollarSign, FileText, SlidersHorizontal, ArrowUp, ArrowDown } from 'lucide-react';
import { Link } from 'react-router-dom';
import api from '../api';

export default function ShortBills() {
    const [invoices, setInvoices] = useState([]);
    const [loading, setLoading] = useState(true);
    const [currencySymbol, setCurrencySymbol] = useState('$');
    const [selectedMonth, setSelectedMonth] = useState('All'); // 'All' or a month string like '2026-06'
    const [sortBy, setSortBy] = useState('date-desc'); // 'date-desc', 'date-asc', 'amount-desc', 'amount-asc', 'status-desc'
    
    useEffect(() => {
        const stored = localStorage.getItem('shop_settings');
        if (stored) {
            try {
                const parsed = JSON.parse(stored);
                if (parsed.currencySymbol) setCurrencySymbol(parsed.currencySymbol);
            } catch (e) {
                console.error(e);
            }
        }
    }, []);

    useEffect(() => {
        const fetchInvoices = async () => {
            setLoading(true);
            try {
                const res = await api.get('/invoices/');
                setInvoices(res.data);
            } catch (err) {
                console.error("Failed to load invoices", err);
            } finally {
                setLoading(false);
            }
        };
        fetchInvoices();
    }, []);

    // Extract active months dynamically from invoices list to populate select menu
    const getMonthOptions = () => {
        const months = new Set();
        invoices.forEach(inv => {
            const date = new Date(inv.created_at);
            const yyyy = date.getFullYear();
            const mm = String(date.getMonth() + 1).padStart(2, '0');
            months.add(`${yyyy}-${mm}`);
        });
        
        return Array.from(months).sort().reverse(); // Show newest months first
    };

    // Format Month name (e.g. '2026-06' to 'June 2026')
    const formatMonthName = (monthStr) => {
        if (!monthStr || monthStr === 'All') return 'All Months';
        const [year, month] = monthStr.split('-');
        const date = new Date(year, parseInt(month) - 1, 1);
        return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
    };

    // Filter invoices by the selected month
    const filteredInvoices = invoices.filter(inv => {
        if (selectedMonth === 'All') return true;
        const date = new Date(inv.created_at);
        const yyyy = date.getFullYear();
        const mm = String(date.getMonth() + 1).padStart(2, '0');
        return `${yyyy}-${mm}` === selectedMonth;
    });

    // Sort invoices based on user sorting option
    const sortedInvoices = [...filteredInvoices].sort((a, b) => {
        if (sortBy === 'date-desc') {
            return new Date(b.created_at) - new Date(a.created_at);
        }
        if (sortBy === 'date-asc') {
            return new Date(a.created_at) - new Date(b.created_at);
        }
        if (sortBy === 'amount-desc') {
            return b.total_amount - a.total_amount;
        }
        if (sortBy === 'amount-asc') {
            return a.total_amount - b.total_amount;
        }
        if (sortBy === 'status-desc') {
            // Paid bills first, then pending
            return a.payment_status.localeCompare(b.payment_status);
        }
        return 0;
    });

    // Calculate dynamic totals for the currently selected month
    const getSummary = () => {
        let totalBilled = 0;
        let totalPaid = 0;
        let totalPending = 0;
        
        filteredInvoices.forEach(inv => {
            totalBilled += inv.total_amount;
            if (inv.payment_status === 'Paid') {
                totalPaid += inv.total_amount;
            } else {
                totalPending += inv.total_amount;
            }
        });
        
        return { totalBilled, totalPaid, totalPending, count: filteredInvoices.length };
    };

    const summary = getSummary();

    return (
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
            {/* Header */}
            <div className="animate-fade-in-up" style={{ marginBottom: '32px' }}>
                <h1>Short Bills (Monthly List)</h1>
                <p style={{ color: 'var(--text-secondary)' }}>View, sort, and inspect service bills grouped according to months.</p>
            </div>

            {/* Controls Bar: Select Month & Choose Sort Method */}
            <div className="glass-panel animate-fade-in-up delay-100" style={{ padding: '20px', marginBottom: '24px', display: 'flex', flexWrap: 'wrap', gap: '20px', alignItems: 'center', justifyContent: 'space-between' }}>
                
                {/* Month Picker */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <Calendar size={20} color="var(--primary)" />
                    <label style={{ fontWeight: 600, color: 'var(--text-secondary)' }}>Filter by Month:</label>
                    <select 
                        value={selectedMonth} 
                        onChange={(e) => setSelectedMonth(e.target.value)}
                        className="input-field"
                        style={{ minWidth: '180px', margin: 0, padding: '8px 12px', background: 'rgba(0,0,0,0.2)' }}
                    >
                        <option value="All">All Months (Show All)</option>
                        {getMonthOptions().map(m => (
                            <option key={m} value={m}>{formatMonthName(m)}</option>
                        ))}
                    </select>
                </div>

                {/* Sort Option Selection */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <SlidersHorizontal size={20} color="var(--primary)" />
                    <label style={{ fontWeight: 600, color: 'var(--text-secondary)' }}>Sort Billing List:</label>
                    <select 
                        value={sortBy} 
                        onChange={(e) => setSortBy(e.target.value)}
                        className="input-field"
                        style={{ minWidth: '200px', margin: 0, padding: '8px 12px', background: 'rgba(0,0,0,0.2)' }}
                    >
                        <option value="date-desc">Newest Date first</option>
                        <option value="date-asc">Oldest Date first</option>
                        <option value="amount-desc">Highest Amount first</option>
                        <option value="amount-asc">Lowest Amount first</option>
                        <option value="status-desc">Sort by Payment Status</option>
                    </select>
                </div>
            </div>

            {/* Monthly Financial Health Summary Card */}
            <div className="grid-3 animate-fade-in-up delay-150" style={{ marginBottom: '32px' }}>
                <div className="glass-panel" style={{ display: 'flex', alignItems: 'center', gap: '16px', padding: '20px' }}>
                    <div style={{ background: 'rgba(220, 38, 38, 0.08)', color: 'var(--primary)', padding: '12px', borderRadius: '12px' }}>
                        <FileText size={24} />
                    </div>
                    <div>
                        <p style={{ margin: '0 0 4px 0', fontSize: '0.8rem', color: 'var(--text-secondary)', textTransform: 'uppercase', fontWeight: 600 }}>Total Billed ({formatMonthName(selectedMonth)})</p>
                        <h3 style={{ margin: 0, fontSize: '1.5rem', color: 'white' }}>{currencySymbol}{summary.totalBilled.toFixed(2)} <span style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', fontWeight: 'normal' }}>({summary.count} bills)</span></h3>
                    </div>
                </div>

                <div className="glass-panel" style={{ display: 'flex', alignItems: 'center', gap: '16px', padding: '20px' }}>
                    <div style={{ background: 'rgba(16, 185, 129, 0.08)', color: 'var(--success)', padding: '12px', borderRadius: '12px' }}>
                        <DollarSign size={24} />
                    </div>
                    <div>
                        <p style={{ margin: '0 0 4px 0', fontSize: '0.8rem', color: 'var(--text-secondary)', textTransform: 'uppercase', fontWeight: 600 }}>Collected Cash (Paid)</p>
                        <h3 style={{ margin: 0, fontSize: '1.5rem', color: 'var(--success)' }}>{currencySymbol}{summary.totalPaid.toFixed(2)}</h3>
                    </div>
                </div>

                <div className="glass-panel" style={{ display: 'flex', alignItems: 'center', gap: '16px', padding: '20px' }}>
                    <div style={{ background: 'rgba(245, 158, 11, 0.08)', color: '#f59e0b', padding: '12px', borderRadius: '12px' }}>
                        <ClockIcon size={24} />
                    </div>
                    <div>
                        <p style={{ margin: '0 0 4px 0', fontSize: '0.8rem', color: 'var(--text-secondary)', textTransform: 'uppercase', fontWeight: 600 }}>Receivable Outstanding (Pending)</p>
                        <h3 style={{ margin: 0, fontSize: '1.5rem', color: '#f59e0b' }}>{currencySymbol}{summary.totalPending.toFixed(2)}</h3>
                    </div>
                </div>
            </div>

            {/* List Table */}
            <div className="glass-panel animate-fade-in-up delay-200">
                {loading ? (
                    <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-secondary)' }}>Loading Monthly Records...</div>
                ) : sortedInvoices.length === 0 ? (
                    <div style={{ padding: '60px 0', textAlign: 'center', color: 'var(--text-secondary)' }}>
                        <FileText size={48} style={{ opacity: 0.15, marginBottom: '16px' }} />
                        <p style={{ margin: 0, fontSize: '1.1rem' }}>No bills found for the selected month.</p>
                    </div>
                ) : (
                    <div style={{ overflowX: 'auto' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: '800px' }}>
                            <thead>
                                <tr style={{ borderBottom: '1px solid var(--border)', color: 'var(--text-secondary)', fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                                    <th style={{ padding: '16px 12px' }}>Job ID</th>
                                    <th style={{ padding: '16px 12px' }}>Date</th>
                                    <th style={{ padding: '16px 12px' }}>Customer</th>
                                    <th style={{ padding: '16px 12px' }}>Device</th>
                                    <th style={{ padding: '16px 12px' }}>Total Amount</th>
                                    <th style={{ padding: '16px 12px' }}>Repair Status</th>
                                    <th style={{ padding: '16px 12px' }}>Payment</th>
                                    <th style={{ padding: '16px 12px', textAlign: 'right' }}>Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {sortedInvoices.map(inv => (
                                    <tr key={inv.id} style={{ borderBottom: '1px solid var(--border)', transition: 'background-color 0.2s' }}>
                                        <td style={{ padding: '16px 12px', fontWeight: 600 }}>{inv.invoice_number}</td>
                                        <td style={{ padding: '16px 12px', color: 'var(--text-secondary)' }}>{new Date(inv.created_at).toLocaleDateString()}</td>
                                        <td style={{ padding: '16px 12px' }}>
                                            <div style={{ fontWeight: 500 }}>{inv.customer_name}</div>
                                            <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{inv.customer_phone}</div>
                                        </td>
                                        <td style={{ padding: '16px 12px', color: 'var(--text-secondary)' }}>{inv.mobile_brand} {inv.mobile_model}</td>
                                        <td style={{ padding: '16px 12px', fontWeight: 'bold' }}>{currencySymbol}{inv.total_amount.toFixed(2)}</td>
                                        <td style={{ padding: '16px 12px' }}>
                                            <span style={{
                                                display: 'inline-flex', padding: '4px 10px', borderRadius: '12px',
                                                fontSize: '0.8rem', fontWeight: 600, 
                                                color: inv.repair_status === 'Repairing' ? '#f59e0b' : inv.repair_status === 'Completed' ? 'var(--success)' : '#10b981',
                                                background: inv.repair_status === 'Repairing' ? 'rgba(245, 158, 11, 0.1)' : 'rgba(16, 185, 129, 0.1)'
                                            }}>
                                                {inv.repair_status}
                                            </span>
                                        </td>
                                        <td style={{ padding: '16px 12px' }}>
                                            <div style={{ 
                                                display: 'inline-flex', alignItems: 'center', gap: '6px',
                                                background: inv.payment_status === 'Paid' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                                                color: inv.payment_status === 'Paid' ? 'var(--success)' : 'var(--danger)',
                                                padding: '4px 10px', borderRadius: '12px', fontSize: '0.8rem', fontWeight: 500
                                            }}>
                                                {inv.payment_status}
                                            </div>
                                        </td>
                                        <td style={{ padding: '16px 12px', textAlign: 'right' }}>
                                            <Link to={`/invoice/${inv.id}`} className="btn-secondary" style={{ padding: '6px 12px', textDecoration: 'none', fontSize: '0.85rem' }}>
                                                <Eye size={16} /> View
                                            </Link>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
}

// Simple clock icon replacement inline helper for clock icon
function ClockIcon({ size, color }) {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-clock">
            <circle cx="12" cy="12" r="10" />
            <polyline points="12 6 12 12 16 14" />
        </svg>
    );
}
