import { useState, useEffect } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { LayoutDashboard, FileText, Phone, Settings as SettingsIcon, Menu, X, LogOut } from 'lucide-react';

export default function Layout() {
    const location = useLocation();
    const navigate = useNavigate();
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [shopName, setShopName] = useState('Western Mobile');

    // Dynamically sync shop name from settings in real-time
    useEffect(() => {
        const stored = localStorage.getItem('shop_settings');
        if (stored) {
            try {
                const parsed = JSON.parse(stored);
                if (parsed.shopName) setShopName(parsed.shopName);
            } catch (e) {
                console.error(e);
            }
        }
    }, [location.pathname]); // Update name if navigation occurs (e.g. returning from Settings page)

    return (
        <div style={{ display: 'flex', minHeight: '100vh', position: 'relative' }}>
            
            {/* Mobile Header (Hidden on Desktop) */}
            <div className="no-print" style={{ 
                display: 'none', position: 'absolute', top: 0, width: '100%', 
                padding: '16px 20px', background: 'var(--surface-color)', zIndex: 50, borderBottom: '1px solid var(--border)',
                alignItems: 'center', justifyContent: 'space-between',
            }} id="mobile-header">
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{ background: 'linear-gradient(135deg, #dc2626, #991b1b)', padding: '6px', borderRadius: '6px', color:'white' }}>
                        <Phone size={18} />
                    </div>
                    <h2 style={{ margin: 0, fontSize: '1.2rem', color: 'white' }}>{shopName}</h2>
                </div>
                <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} style={{ background: 'transparent', border: 'none', color: 'white', cursor: 'pointer' }}>
                    {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
                </button>
            </div>

            {/* Sidebar Navigation */}
            <nav className={`glass-panel no-print sidebar ${mobileMenuOpen ? 'open' : ''}`} style={{ 
                width: '260px', borderRadius: '0', borderTop: 'none', 
                borderBottom: 'none', borderLeft: 'none', display: 'flex',
                flexDirection: 'column', padding: '32px 24px', zIndex: 40,
                background: 'var(--bg-color)'
            }}>
                <div style={{ marginBottom: '48px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{ background: 'linear-gradient(135deg, #dc2626, #991b1b)', padding: '10px', borderRadius: '10px', color:'white', boxShadow: '0 4px 12px rgba(220, 38, 38, 0.3)' }}>
                        <Phone size={24} />
                    </div>
                    <div>
                        <h2 style={{ margin: 0, fontSize: '1.3rem', color: 'white', letterSpacing: '-0.5px', wordBreak: 'break-word', maxHeight: '52px', overflow: 'hidden' }}>{shopName}</h2>
                        <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '1px' }}>Billing Ops</span>
                    </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', flexGrow: 1 }}>
                    <Link to="/" onClick={() => setMobileMenuOpen(false)} style={{
                        display: 'flex', alignItems: 'center', gap: '12px', padding: '14px 16px',
                        textDecoration: 'none', borderRadius: '12px',
                        color: location.pathname === '/' ? 'white' : 'var(--text-secondary)',
                        background: location.pathname === '/' ? 'linear-gradient(90deg, rgba(220,38,38,0.15), transparent)' : 'transparent',
                        borderLeft: location.pathname === '/' ? '3px solid var(--primary)' : '3px solid transparent',
                        fontWeight: location.pathname === '/' ? 600 : 500,
                        transition: 'all 0.2s'
                    }}>
                        <LayoutDashboard size={20} color={location.pathname === '/' ? 'var(--primary)' : 'currentColor'} /> Dashboard
                    </Link>
                    
                    <Link to="/short-bills" onClick={() => setMobileMenuOpen(false)} style={{
                        display: 'flex', alignItems: 'center', gap: '12px', padding: '14px 16px',
                        textDecoration: 'none', borderRadius: '12px',
                        color: location.pathname === '/short-bills' ? 'white' : 'var(--text-secondary)',
                        background: location.pathname === '/short-bills' ? 'linear-gradient(90deg, rgba(220,38,38,0.15), transparent)' : 'transparent',
                        borderLeft: location.pathname === '/short-bills' ? '3px solid var(--primary)' : '3px solid transparent',
                        fontWeight: location.pathname === '/short-bills' ? 600 : 500,
                        transition: 'all 0.2s'
                    }}>
                        <FileText size={20} color={location.pathname === '/short-bills' ? 'var(--primary)' : 'currentColor'} /> Short Bills
                    </Link>

                    <Link to="/settings" onClick={() => setMobileMenuOpen(false)} style={{
                        display: 'flex', alignItems: 'center', gap: '12px', padding: '14px 16px',
                        textDecoration: 'none', borderRadius: '12px',
                        color: location.pathname === '/settings' ? 'white' : 'var(--text-secondary)',
                        background: location.pathname === '/settings' ? 'linear-gradient(90deg, rgba(220,38,38,0.15), transparent)' : 'transparent',
                        borderLeft: location.pathname === '/settings' ? '3px solid var(--primary)' : '3px solid transparent',
                        fontWeight: location.pathname === '/settings' ? 600 : 500,
                        transition: 'all 0.2s'
                    }}>
                        <SettingsIcon size={20} color={location.pathname === '/settings' ? 'var(--primary)' : 'currentColor'} /> Settings
                    </Link>

                    <button 
                        onClick={() => {
                            if (window.confirm("Are you sure you want to sign out?")) {
                                localStorage.removeItem('wm_crm_auth');
                                navigate('/login');
                            }
                        }}
                        style={{
                            display: 'flex', alignItems: 'center', gap: '12px', padding: '14px 16px',
                            background: 'transparent', border: 'none', borderRadius: '12px',
                            color: 'var(--text-secondary)', width: '100%', cursor: 'pointer',
                            textAlign: 'left', fontSize: '1rem', fontWeight: 500,
                            marginTop: '24px', borderLeft: '3px solid transparent',
                            transition: 'all 0.2s'
                        }}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.color = '#ef4444';
                            e.currentTarget.style.background = 'rgba(239, 68, 68, 0.08)';
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.color = 'var(--text-secondary)';
                            e.currentTarget.style.background = 'transparent';
                        }}
                    >
                        <LogOut size={20} /> Sign Out
                    </button>
                </div>
            </nav>

            <main className="main-content" style={{ flexGrow: 1, padding: '40px', overflowY: 'auto' }}>
                <Outlet />
            </main>

            <style>{`
                @media (max-width: 768px) {
                    #mobile-header { display: flex !important; }
                    .main-content { padding: 80px 20px 20px 20px !important; }
                    .sidebar {
                        position: absolute;
                        left: -260px;
                        height: 100vh;
                        transition: left 0.3s ease;
                        box-shadow: 10px 0 20px rgba(0,0,0,0.5);
                    }
                    .sidebar.open {
                        left: 0;
                    }
                }
            `}</style>
        </div>
    );
}
