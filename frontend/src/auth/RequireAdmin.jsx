import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from './AuthContext.jsx';

function RequireAdmin({ children }) {
  const { isAuthenticated, role } = useAuth();
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to="/admin/login" state={{ from: location.pathname }} replace />;
  }

  if (role !== 'ADMIN') {
    return <Navigate to="/" replace />;
  }

  return children;
}

export default RequireAdmin;
