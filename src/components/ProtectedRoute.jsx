import { Navigate } from 'react-router-dom';
import { getAuth } from '@/lib/auth';

const ProtectedRoute = ({ children }) => {
  const { access, user } = getAuth();

  // Check if user is authenticated
  if (!access || !user) {
    // Not logged in, redirect to auth page
    return <Navigate to="/auth" replace />;
  }

  // User is authenticated, render the protected component
  return children;
};

export default ProtectedRoute;