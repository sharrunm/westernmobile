import { useState, useEffect } from 'react';
import { Search, FileText, Eye, TrendingUp, DollarSign, Wrench, Smartphone, CheckCircle, Package, AlertCircle } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import api from '../api';

export default function Dashboard() {
    const [invoices, setInvoices] = useState([]);
    const [stats, setStats] = useState({
        monthly_income: 0,
        total_income: 0,
        active_repairs: 0,
        total_bills: 0,
        repairs_completed_today: 0,
        total_income_today: 0,
        delivered_today: 0,
        pending_jobs: 0,
        monthly_profit: 0,
        total_profit: 0,
        today_profit: 0
    });
    const [search, setSearch] = useState('');
    const [loading, setLoading] = useState(true);
    const [currencySymbol, setCurrencySymbol] = useState('$');
    const [statusFilter, setStatusFilter] = useState('All'); // 'All', 'Paid', 'Pending', 'Completed', 'Delivered', 'PendingJobs'
    const location = useLocation();

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
    }, [location.pathname]);

    useEffect(() => {
        const fetchDashboardData = async () => {
            setLoading(true);
            try {
                const [invRes, statsRes] = await Promise.all([
                    api.get(`/invoices/?search=${search}`),
                    api.get('/invoices/stats')
                ]);
                setInvoices(invRes.data);
                setStats(statsRes.data);
            } catch (err) {
                console.error("Failed to fetch dashboard data:", err);
            } finally {
                setLoading(false);
            }
        };
        
        const timer = setTimeout(() => { fetchDashboardData(); }, 300);
        return () => clearTimeout(timer);
    }, [search, location.pathname]);



    // Filter invoices array client-side based on active card filter
    const filteredInvoices = invoices.filter(inv => {
        if (statusFilter === 'All') return true;
        if (statusFilter === 'Paid') return inv.payment_status === 'Paid';
        if (statusFilter === 'Pending') return inv.payment_status === 'Pending';
        if (statusFilter === 'Completed') return inv.repair_status === 'Completed';
        if (statusFilter === 'Delivered') return inv.repair_status === 'Delivered';
        if (statusFilter === 'PendingJobs') {
            return inv.repair_status !== 'Delivered' && inv.repair_status !== 'Completed';
        }
        return true;
    });

    return (
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
            {/* Header Area */}
            <div className="animate-fade-in-up" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
                <div>
                    <h1 style={{ fontSize: '2rem' }}>Dashboard</h1>
                    <p style={{ color: 'var(--text-secondary)' }}>Western Mobile Service Ops & Repair CRM</p>
                </div>
                <Link to="/new-bill" className="btn-primary" style={{ textDecoration: 'none' }}>
                    <FileText size={20} /> New Job Ticket
                </Link>
            </div>

            {/* Daily Operational Mini-Widgets (First Row) */}
            <h4 style={{ margin: '0 0 16px 0', color: 'var(--text-secondary)', textTransform: 'uppercase', fontSize: '0.8rem', letterSpacing: '0.1em' }} className="animate-fade-in-up">
                Today's Daily Operations
            </h4>
            <div className="grid-4 animate-fade-in-up delay-100" style={{ marginBottom: '32px' }}>
                {/* 1. Repairs Completed Today */}
                <div 
                    onClick={() => setStatusFilter(statusFilter === 'Completed' ? 'All' : 'Completed')}
                    style={{
                        padding: '16px 20px', borderRadius: '16px', background: 'rgba(16, 185, 129, 0.04)',
                        border: statusFilter === 'Completed' ? '1.5px solid var(--success)' : '1px solid var(--border)',
                        cursor: 'pointer', transition: 'all 0.2s',
                        boxShadow: statusFilter === 'Completed' ? '0 4px 15px rgba(16, 185, 129, 0.15)' : 'none',
                        transform: statusFilter === 'Completed' ? 'translateY(-2px)' : 'none'
                    }}
                >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                        <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 600 }}>Completed Today</span>
                        <CheckCircle size={18} color="var(--success)" />
                    </div>
                    <h3 style={{ margin: 0, fontSize: '1.75rem', color: 'white' }}>{stats.repairs_completed_today || 0}</h3>
                </div>

                {/* 2. Delivered Devices Today */}
                <div 
                    onClick={() => setStatusFilter(statusFilter === 'Delivered' ? 'All' : 'Delivered')}
                    style={{
                        padding: '16px 20px', borderRadius: '16px', background: 'rgba(59, 130, 246, 0.04)',
                        border: statusFilter === 'Delivered' ? '1.5px solid #3b82f6' : '1px solid var(--border)',
                        cursor: 'pointer', transition: 'all 0.2s',
                        boxShadow: statusFilter === 'Delivered' ? '0 4px 15px rgba(59, 130, 246, 0.15)' : 'none',
                        transform: statusFilter === 'Delivered' ? 'translateY(-2px)' : 'none'
                    }}
                >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                        <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 600 }}>Delivered Today</span>
                        <Package size={18} color="#3b82f6" />
                    </div>
                    <h3 style={{ margin: 0, fontSize: '1.75rem', color: 'white' }}>{stats.delivered_today || 0}</h3>
                </div>

                {/* 3. Pending Jobs */}
                <div 
                    onClick={() => setStatusFilter(statusFilter === 'PendingJobs' ? 'All' : 'PendingJobs')}
                    style={{
                        padding: '16px 20px', borderRadius: '16px', background: 'rgba(245, 158, 11, 0.04)',
                        border: statusFilter === 'PendingJobs' ? '1.5px solid #f59e0b' : '1px solid var(--border)',
                        cursor: 'pointer', transition: 'all 0.2s',
                        boxShadow: statusFilter === 'PendingJobs' ? '0 4px 15px rgba(245, 158, 11, 0.15)' : 'none',
                        transform: statusFilter === 'PendingJobs' ? 'translateY(-2px)' : 'none'
                    }}
                >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                        <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 600 }}>Total Active / Queued</span>
                        <AlertCircle size={18} color="#f59e0b" />
                    </div>
                    <h3 style={{ margin: 0, fontSize: '1.75rem', color: 'white' }}>{stats.pending_jobs || 0}</h3>
                </div>

                {/* 4. Total Income / Profit Today */}
                <div style={{ padding: '16px 20px', borderRadius: '16px', background: 'rgba(239, 68, 68, 0.04)', border: '1px solid var(--border)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                        <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 600 }}>Income & Profit Today</span>
                        <DollarSign size={18} color="var(--primary)" />
                    </div>
                    <h3 style={{ margin: 0, fontSize: '1.45rem', color: 'white', fontWeight: 700 }}>
                        Inc: {currencySymbol}{(stats.total_income_today || 0).toFixed(2)}
                    </h3>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginTop: '6px', fontSize: '0.9rem', color: 'var(--success)' }}>
                        <span style={{ fontWeight: 600 }}>Prof: {currencySymbol}{(stats.today_profit || 0).toFixed(2)}</span>
                    </div>
                </div>
            </div>

            {/* Financial Performance Summary (Second Row) */}
            <div className="grid-3 animate-fade-in-up delay-150" style={{ marginBottom: '32px' }}>
                
                {/* Monthly Income Summary (Filters to 'Paid') */}
                <div 
                    className="widget-card"
                    onClick={() => setStatusFilter(statusFilter === 'Paid' ? 'All' : 'Paid')}
                    style={{
                        cursor: 'pointer',
                        transition: 'all 0.3s ease',
                        border: statusFilter === 'Paid' ? '1.5px solid var(--success)' : '1px solid var(--border)',
                        boxShadow: statusFilter === 'Paid' ? '0 0 20px rgba(16, 185, 129, 0.15)' : 'none',
                        transform: statusFilter === 'Paid' ? 'translateY(-4px)' : 'none',
                        position: 'relative'
                    }}
                >
                    <div style={{ position: 'absolute', top: '-20px', right: '-20px', opacity: 0.05, transform: 'scale(3)' }}>
                        <DollarSign size={64} />
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <div>
                            <p style={{ margin: '0 0 8px 0', color: 'var(--text-secondary)', fontWeight: 600, fontSize: '0.85rem', textTransform: 'uppercase' }}>Monthly Performance</p>
                            <h2 style={{ margin: 0, fontSize: '1.75rem', color: 'var(--text-primary)', fontWeight: 700 }}>
                                Inc: {currencySymbol}{(stats.monthly_income || 0).toFixed(2)}
                            </h2>
                            <h3 style={{ margin: '6px 0 0 0', fontSize: '1.3rem', color: 'var(--success)', fontWeight: 700 }}>
                                Prof: {currencySymbol}{(stats.monthly_profit || 0).toFixed(2)}
                            </h3>
                        </div>
                        <div className="widget-icon-box" style={{ background: 'linear-gradient(135deg, #10b981, #059669)' }}>
                            <TrendingUp size={24} />
                        </div>
                    </div>
                    <div style={{ marginTop: '16px', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.85rem', color: 'var(--success)' }}>
                        <span style={{ padding: '2px 8px', background: 'rgba(16, 185, 129, 0.1)', borderRadius: '12px', fontWeight: 600 }}>This Month Only</span>
                    </div>
                </div>

                {/* Active Unpaid Billing Records */}
                <div 
                    className="widget-card"
                    onClick={() => setStatusFilter(statusFilter === 'Pending' ? 'All' : 'Pending')}
                    style={{
                        cursor: 'pointer',
                        transition: 'all 0.3s ease',
                        border: statusFilter === 'Pending' ? '1.5px solid #f59e0b' : '1px solid var(--border)',
                        boxShadow: statusFilter === 'Pending' ? '0 0 20px rgba(245, 158, 11, 0.15)' : 'none',
                        transform: statusFilter === 'Pending' ? 'translateY(-4px)' : 'none',
                        position: 'relative'
                    }}
                >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <div>
                            <p style={{ margin: '0 0 8px 0', color: 'var(--text-secondary)', fontWeight: 600, fontSize: '0.85rem', textTransform: 'uppercase' }}>Pending Payments</p>
                            <h2 style={{ margin: 0, fontSize: '2.2rem', color: 'var(--text-primary)' }}>
                                {stats.active_repairs || 0}
                            </h2>
                        </div>
                        <div className="widget-icon-box" style={{ background: 'linear-gradient(135deg, #f59e0b, #d97706)' }}>
                            <Wrench size={24} />
                        </div>
                    </div>
                    <div style={{ marginTop: '16px', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.85rem', color: '#f59e0b' }}>
                        <div className="pulse-dot" style={{ backgroundColor: '#f59e0b' }}></div>
                        <span style={{ fontWeight: 600 }}>Awaiting Customer Settlement</span>
                    </div>
                </div>

                {/* Gross Revenue Lifetime */}
                <div 
                    className="widget-card"
                    onClick={() => setStatusFilter('All')}
                    style={{
                        cursor: 'pointer',
                        transition: 'all 0.3s ease',
                        border: statusFilter === 'All' ? '1.5px solid var(--primary)' : '1px solid var(--border)',
                        boxShadow: statusFilter === 'All' ? '0 0 20px rgba(220, 38, 38, 0.15)' : 'none',
                        transform: statusFilter === 'All' ? 'translateY(-4px)' : 'none',
                        position: 'relative'
                    }}
                >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <div>
                            <p style={{ margin: '0 0 8px 0', color: 'var(--text-secondary)', fontWeight: 600, fontSize: '0.85rem', textTransform: 'uppercase' }}>Lifetime Performance</p>
                            <h2 style={{ margin: 0, fontSize: '1.75rem', color: 'var(--text-primary)', fontWeight: 700 }}>
                                Rev: {currencySymbol}{(stats.total_income || 0).toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2})}
                            </h2>
                            <h3 style={{ margin: '6px 0 0 0', fontSize: '1.3rem', color: 'var(--success)', fontWeight: 700 }}>
                                Prof: {currencySymbol}{(stats.total_profit || 0).toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2})}
                            </h3>
                        </div>
                        <div className="widget-icon-box" style={{ background: 'linear-gradient(135deg, #dc2626, #991b1b)' }}>
                            <DollarSign size={24} />
                        </div>
                    </div>
                    <div style={{ marginTop: '16px', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                        <span style={{ fontWeight: 600, color: 'var(--primary)' }}>Overall Collected</span>
                    </div>
                </div>

            </div>



            {/* Main Table Interface */}
            <div className="glass-panel animate-fade-in-up delay-250">
                <div style={{ display: 'flex', marginBottom: '24px', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <h3 style={{ margin: 0 }}>Repair Jobs & Billing Records</h3>
                        {statusFilter !== 'All' && (
                            <span 
                                onClick={() => setStatusFilter('All')}
                                style={{
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    gap: '6px',
                                    background: 'rgba(220, 38, 38, 0.1)',
                                    color: 'var(--primary)',
                                    padding: '6px 14px',
                                    borderRadius: '20px',
                                    fontSize: '0.8rem',
                                    fontWeight: 700,
                                    cursor: 'pointer',
                                    border: '1px solid transparent',
                                    transition: 'all 0.2s',
                                    boxShadow: '0 2px 8px rgba(0,0,0,0.2)'
                                }}
                                onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'currentColor'; }}
                                onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'transparent'; }}
                                title="Click to clear filter"
                            >
                                Filter: {statusFilter} Invoices ✕
                            </span>
                        )}
                    </div>
                    <div style={{ position: 'relative', width: '100%', maxWidth: '300px' }}>
                        <Search size={18} color="var(--text-secondary)" style={{ position: 'absolute', left: '12px', top: '12px' }} />
                        <input 
                            type="text" 
                            className="input-field" 
                            style={{ paddingLeft: '40px', borderRadius: '30px', background: 'rgba(255,255,255,0.03)' }} 
                            placeholder="Search by Customer, Phone, IMEI, Job ID..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>
                </div>

                {loading ? (
                    <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-secondary)' }}>Syncing data...</div>
                ) : filteredInvoices.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '60px 0', color: 'var(--text-secondary)' }}>
                        <FileText size={48} style={{ opacity: 0.2, marginBottom: '16px' }} />
                        <p style={{ margin: 0, fontSize: '1.1rem' }}>No matching repair records found.</p>
                    </div>
                ) : (
                    <div style={{ overflowX: 'auto' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: '850px' }}>
                            <thead>
                                <tr style={{ borderBottom: '1px solid var(--border)', color: 'var(--text-secondary)', fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                                    <th style={{ padding: '16px 12px' }}>Job ID</th>
                                    <th style={{ padding: '16px 12px' }}>Date</th>
                                    <th style={{ padding: '16px 12px' }}>Customer</th>
                                    <th style={{ padding: '16px 12px' }}>Device Details</th>
                                    <th style={{ padding: '16px 12px' }}>Total Amount</th>
                                    <th style={{ padding: '16px 12px' }}>Repair Status</th>
                                    <th style={{ padding: '16px 12px' }}>Payment</th>
                                    <th style={{ padding: '16px 12px', textAlign: 'right' }}>Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredInvoices.map(inv => {
                                    // Assign custom colors based on repair status
                                    let repairStatusColor = 'var(--text-secondary)';
                                    let repairStatusBg = 'rgba(255,255,255,0.05)';
                                    
                                    if (inv.repair_status === 'Received') { repairStatusColor = '#3b82f6'; repairStatusBg = 'rgba(59, 130, 246, 0.1)'; }
                                    else if (inv.repair_status === 'Under Inspection') { repairStatusColor = '#a855f7'; repairStatusBg = 'rgba(168, 85, 247, 0.1)'; }
                                    else if (inv.repair_status === 'Waiting for Parts') { repairStatusColor = '#ec4899'; repairStatusBg = 'rgba(236, 72, 153, 0.1)'; }
                                    else if (inv.repair_status === 'Repairing') { repairStatusColor = '#f59e0b'; repairStatusBg = 'rgba(245, 158, 11, 0.1)'; }
                                    else if (inv.repair_status === 'Completed') { repairStatusColor = 'var(--success)'; repairStatusBg = 'rgba(16, 185, 129, 0.1)'; }
                                    else if (inv.repair_status === 'Delivered') { repairStatusColor = '#10b981'; repairStatusBg = 'rgba(16, 185, 129, 0.2)'; }

                                    return (
                                        <tr key={inv.id} style={{ borderBottom: '1px solid var(--border)', transition: 'background-color 0.2s' }}>
                                            <td style={{ padding: '16px 12px', fontWeight: 600, color: 'var(--text-primary)' }}>{inv.invoice_number}</td>
                                            <td style={{ padding: '16px 12px', color: 'var(--text-secondary)' }}>{new Date(inv.created_at).toLocaleDateString()}</td>
                                            <td style={{ padding: '16px 12px' }}>
                                                <div style={{ fontWeight: 500 }}>{inv.customer_name}</div>
                                                <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{inv.customer_phone}</div>
                                            </td>
                                            <td style={{ padding: '16px 12px' }}>
                                                <div style={{ color: 'var(--text-primary)', fontWeight: 500 }}>{inv.mobile_brand} {inv.mobile_model}</div>
                                                <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>IMEI: {inv.imei || 'N/A'}</div>
                                            </td>
                                            <td style={{ padding: '16px 12px', fontWeight: 'bold' }}>{currencySymbol}{inv.total_amount.toFixed(2)}</td>
                                            
                                            {/* Repair Status Badge */}
                                            <td style={{ padding: '16px 12px' }}>
                                                <span style={{
                                                    display: 'inline-flex', padding: '4px 10px', borderRadius: '12px',
                                                    fontSize: '0.8rem', fontWeight: 600, color: repairStatusColor, background: repairStatusBg
                                                }}>
                                                    {inv.repair_status}
                                                </span>
                                            </td>

                                            {/* Payment Badge */}
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
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
}
