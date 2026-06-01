import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Phone, Lock, User, Eye, EyeOff, AlertTriangle } from 'lucide-react';

export default function Login() {
    const navigate = useNavigate();
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleLogin = (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        // Simulating artificial premium loading latency
        setTimeout(() => {
            if (username.trim() === 'western' && password === 'western@123') {
                localStorage.setItem('wm_crm_auth', 'authenticated');
                navigate('/');
            } else {
                setError('Invalid username or password. Please try again.');
                setLoading(false);
            }
        }, 800);
    };

    return (
        <div style={{
            display: 'flex', justifyContent: 'center', alignItems: 'center',
            minHeight: '100vh', width: '100%',
            background: 'radial-gradient(circle at center, #1e1b1b 0%, #0a0505 100%)',
            fontFamily: 'system-ui, -apple-system, sans-serif'
        }}>
            
            <div className="glass-panel" style={{
                width: '100%', maxWidth: '420px', padding: '40px',
                borderRadius: '24px', background: 'rgba(25, 20, 20, 0.65)',
                border: '1px solid rgba(220, 38, 38, 0.15)',
                boxShadow: '0 20px 40px rgba(0,0,0,0.6), inset 0 1px 0 rgba(255,255,255,0.05)',
                textAlign: 'center',
                animation: 'fadeInUp 0.6s cubic-bezier(0.16, 1, 0.3, 1)'
            }}>
                
                {/* Logo Branding Icon */}
                <div style={{
                    display: 'inline-flex', background: 'linear-gradient(135deg, #dc2626, #991b1b)',
                    padding: '16px', borderRadius: '20px', color: 'white',
                    marginBottom: '24px', boxShadow: '0 8px 24px rgba(220, 38, 38, 0.4)'
                }}>
                    <Phone size={32} />
                </div>

                <h2 style={{ margin: '0 0 8px 0', fontSize: '1.8rem', color: 'white', fontWeight: 800 }}>Western Mobile</h2>
                <p style={{ margin: '0 0 32px 0', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                    Service CRM & Repair Billing System
                </p>

                {/* Error Banner */}
                {error && (
                    <div style={{
                        display: 'flex', alignItems: 'center', gap: '10px',
                        background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.2)',
                        padding: '12px 16px', borderRadius: '12px', color: 'var(--danger)',
                        fontSize: '0.85rem', marginBottom: '24px', textAlign: 'left'
                    }}>
                        <AlertTriangle size={18} style={{ flexShrink: 0 }} />
                        <span>{error}</span>
                    </div>
                )}

                {/* Login Form */}
                <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                    
                    {/* Username Field */}
                    <div className="input-group" style={{ textAlign: 'left' }}>
                        <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '8px', fontWeight: 600 }}>
                            Username
                        </label>
                        <div style={{ position: 'relative' }}>
                            <input 
                                required
                                type="text"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                className="input-field"
                                style={{ paddingLeft: '40px', background: 'rgba(0,0,0,0.3)', margin: 0 }}
                                placeholder="Enter username"
                                disabled={loading}
                            />
                            <User size={18} style={{ position: 'absolute', left: '14px', top: '14px', color: 'var(--text-secondary)' }} />
                        </div>
                    </div>

                    {/* Password Field */}
                    <div className="input-group" style={{ textAlign: 'left' }}>
                        <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '8px', fontWeight: 600 }}>
                            Password
                        </label>
                        <div style={{ position: 'relative' }}>
                            <input 
                                required
                                type={showPassword ? 'text' : 'password'}
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="input-field"
                                style={{ paddingLeft: '40px', paddingRight: '40px', background: 'rgba(0,0,0,0.3)', margin: 0 }}
                                placeholder="••••••••"
                                disabled={loading}
                            />
                            <Lock size={18} style={{ position: 'absolute', left: '14px', top: '14px', color: 'var(--text-secondary)' }} />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                style={{
                                    position: 'absolute', right: '12px', top: '12px',
                                    background: 'transparent', border: 'none', color: 'var(--text-secondary)',
                                    cursor: 'pointer', display: 'flex', alignItems: 'center'
                                }}
                            >
                                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                            </button>
                        </div>
                    </div>

                    {/* Submit Button */}
                    <button
                        type="submit"
                        className="btn-primary"
                        style={{
                            width: '100%', padding: '14px', fontSize: '1rem',
                            fontWeight: 700, borderRadius: '12px', marginTop: '12px',
                            cursor: 'pointer'
                        }}
                        disabled={loading}
                    >
                        {loading ? 'Authenticating...' : 'Sign In'}
                    </button>
                </form>

                <p style={{ marginTop: '24px', fontSize: '0.75rem', color: 'rgba(255,255,255,0.2)' }}>
                    Secure Staff Session • Western Mobile Inc.
                </p>
            </div>

            <style>{`
                @keyframes fadeInUp {
                    from { opacity: 0; transform: translateY(20px); }
                    to { opacity: 1; transform: translateY(0); }
                }
            `}</style>
        </div>
    );
}
