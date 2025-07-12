import { useLocation, Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ProtectedRoute = ({ allowedRoles }) => {
    const { user } = useAuth();
    const location = useLocation();

    return (
        user && user.roles && user.roles.some(role => allowedRoles?.includes(role))
            ? <Outlet />
            : user
                ? <Navigate to="/unauthorized" state={{ from: location }} replace />
                : <Navigate to="/login" state={{ from: location }} replace />
    );
}

export default ProtectedRoute; 