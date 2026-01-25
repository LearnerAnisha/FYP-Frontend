import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import "@/App.css";

// Public Pages
import LandingPage from "@/pages/LandingPage";
import AuthPage from "@/pages/AuthPage";
import VerifyOTP from "@/pages/VerifyOTP";

// User Pages
import Dashboard from "@/pages/Dashboard";
import DiseaseDetection from "@/pages/DiseaseDetection";
import WeatherIrrigation from "@/pages/WeatherIrrigation";
import PricePredictor from "@/pages/PricePredictor";
import ChatbotPage from "@/pages/ChatbotPage";
import ProfilePage from "@/pages/ProfilePage";

// Admin Pages
import AdminLogin from "@/pages/Admin/AdminLogin";
import AdminDashboard from "@/pages/Admin/AdminDashboard";
import UserManagement from "@/pages/Admin/UserManagement";
import Analytics from "@/pages/Admin/Analytics";
import AdminSettings from "@/pages/Admin/AdminSettings";

// Components
import { Toaster } from "@/components/ui/sonner";
import ProtectedRoute from "@/components/ProtectedRoute";
import ProtectedAdminRoute from "@/pages/admin/ProtectedAdminRoute";

function App() {
  return (
    <div className="App">
      <BrowserRouter>
        <Routes>
          {/* ============================================
              PUBLIC ROUTES
              ============================================ */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/auth" element={<AuthPage />} />
          <Route path="/verify-otp" element={<VerifyOTP />} />

          {/* ============================================
              PROTECTED USER ROUTES
              ============================================ */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/disease-detection"
            element={
              <ProtectedRoute>
                <DiseaseDetection />
              </ProtectedRoute>
            }
          />
          <Route
            path="/weather-irrigation"
            element={
              <ProtectedRoute>
                <WeatherIrrigation />
              </ProtectedRoute>
            }
          />
          <Route
            path="/price-predictor"
            element={
              <ProtectedRoute>
                <PricePredictor />
              </ProtectedRoute>
            }
          />
          <Route
            path="/chatbot"
            element={
              <ProtectedRoute>
                <ChatbotPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <ProfilePage />
              </ProtectedRoute>
            }
          />

          {/* ============================================
              ADMIN ROUTES
              ============================================ */}
          {/* Admin Login - Public */}
          <Route path="/admin/login" element={<AdminLogin />} />

          {/* Protected Admin Routes */}
          <Route
            path="/admin/dashboard"
            element={
              <ProtectedAdminRoute>
                <AdminDashboard />
              </ProtectedAdminRoute>
            }
          />
          <Route
            path="/admin/users"
            element={
              <ProtectedAdminRoute>
                <UserManagement />
              </ProtectedAdminRoute>
            }
          />
          <Route
            path="/admin/analytics"
            element={
              <ProtectedAdminRoute>
                <Analytics />
              </ProtectedAdminRoute>
            }
          />
          <Route
            path="/admin/settings"
            element={
              <ProtectedAdminRoute>
                <AdminSettings />
              </ProtectedAdminRoute>
            }
          />

          {/* Redirect /admin to /admin/dashboard */}
          <Route path="/admin" element={<Navigate to="/admin/dashboard" replace />} />

          {/* ============================================
              404 - NOT FOUND
              ============================================ */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
      <Toaster />
    </div>
  );
}

// 404 Component
const NotFound = () => {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="text-center">
        <h1 className="text-6xl font-bold text-gray-900 mb-4">404</h1>
        <p className="text-xl text-gray-600 mb-8">Page not found</p>
        <div className="space-x-4">
          <a href="/"
            className="inline-block bg-gray-900 text-white px-6 py-3 rounded-lg hover:bg-gray-800">Go Home</a>
          <a href="/dashboard"
            className="inline-block bg-gray-200 text-gray-900 px-6 py-3 rounded-lg hover:bg-gray-300">Go to Dashboard</a>
        </div>
      </div>
    </div>
  );
};

export default App;