import { Navigate, Outlet } from 'react-router-dom';

export default function ProtectedRoute() {
    const isAuthenticated = localStorage.getItem('wm_crm_auth') === 'authenticated';

    if (!isAuthenticated) {
        return <Navigate to="/login" replace />;
    }

    return <Outlet />;
}
