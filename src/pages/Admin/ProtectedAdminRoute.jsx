import { Navigate } from 'react-router-dom';
import { isAdminAuthenticated, isAdmin } from '@/lib/adminAuth';
import { AlertCircle } from 'lucide-react';

const ProtectedAdminRoute = ({ children }) => {
  // Check if admin is authenticated
  if (!isAdminAuthenticated()) {
    return <Navigate to="/admin/login" replace />;
  }

  // Check if user has admin privileges
  if (!isAdmin()) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full">
          <div className="flex items-center justify-center w-16 h-16 bg-red-100 rounded-full mx-auto mb-4">
            <AlertCircle className="w-8 h-8 text-red-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2 text-center">
            Access Denied
          </h2>
          <p className="text-gray-600 mb-6 text-center">
            You don't have permission to access the admin panel.
          </p>
          <div className="flex gap-3">
            <a href="/"
              className="flex-1 text-center bg-gray-200 text-gray-900 px-6 py-2 rounded-lg hover:bg-gray-300"
            >Go HOme</a>
            <a href="/admin/login"
              className="flex-1 text-center bg-gray-900 text-white px-6 py-2 rounded-lg hover:bg-gray-800">Login as Admin</a>

          </div>
        </div>
      </div>
    );
  }

  return children;
};

export default ProtectedAdminRoute;