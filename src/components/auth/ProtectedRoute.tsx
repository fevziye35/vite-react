import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { type ReactElement } from 'react';

export function ProtectedRoute({ children }: { children: ReactElement }) {
    const { isAuthenticated } = useAuth();
    const location = useLocation();

    // Ideally we would have a loading state in auth context too, 
    // but for this mock implementation we can check user existence directly
    // If you add real async auth check, uncomment below:
    // if (isLoading) return <LoadingScreen />

    if (!isAuthenticated) {
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    return children;
}
