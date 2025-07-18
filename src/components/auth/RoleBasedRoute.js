import { Navigate } from 'react-router-dom';
import { isAuthenticated, getUserRole } from '../../services/auth';

const RoleBasedRoute = ({ children, allowedRoles }) => {
    const userRole = getUserRole();
    const isUserAuthenticated = isAuthenticated();

    if (!isUserAuthenticated) {
        return <Navigate to="/login" />;
    }

    if (allowedRoles && !allowedRoles.includes(userRole)) {
        // Redirect to appropriate dashboard based on role
        switch (userRole) {
            case 'Agent OPS':
                return <Navigate to="/dashboard" />;
            case 'Treasury OPS':
                return <Navigate to="/treasury" />;
            default:
                return <Navigate to="/dashboard" />;
        }
    }

    return children;
};

export default RoleBasedRoute;
