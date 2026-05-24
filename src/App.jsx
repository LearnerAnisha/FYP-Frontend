import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import "@/App.css";

// Public Pages
import LandingPage from "@/pages/LandingPage";
import AuthPage from "@/pages/AuthPage";
import VerifyOTP from "@/pages/VerifyOTP";
import ForgotPassword from "@/pages/ForgotPassword";   
import ResetPassword from "@/pages/ResetPassword";     

// User Pages
import Dashboard from "@/pages/Dashboard";
import DiseaseDetection from "@/pages/DiseaseDetection";
import WeatherIrrigation from "@/pages/WeatherIrrigation";
import PricePredictor from "@/pages/PricePredictor";
import ChatbotPage from "@/pages/ChatbotPage";
import ProfilePage from "@/pages/ProfilePage";
import PricingPage from "@/pages/PricingPage";
import PaymentCallback from "@/pages/PaymentCallback";

// Admin Pages
import AdminLogin from "@/pages/Admin/AdminLogin";
import AdminDashboard from "@/pages/Admin/AdminDashboard";
import AdminLayout from "@/components/AdminLayout";
import UserManagement from "@/pages/Admin/UserManagement";
import AdminSettings from "@/pages/Admin/AdminSettings";
import ChatConversationManager from "@/pages/Admin/ChatConversationManager";
import PricePredictorManager from "@/pages/Admin/PricePredictorManager";
import ScanResultManager from "@/pages/Admin/ScanResultManager";
import ProtectedAdminRoute from "@/pages/Admin/ProtectedAdminRoute";
import SubscriptionManager from "@/pages/Admin/SubscriptionManager";

// Components
import { Toaster } from "@/components/ui/toaster";
import ProtectedRoute from "@/components/ProtectedRoute";

function App() {
  return (
    <div className="App">
      <BrowserRouter>
        <Routes>
          {/* PUBLIC ROUTES */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/auth" element={<AuthPage />} />
          <Route path="/verify-otp" element={<VerifyOTP />} />
          <Route path="/pricing" element={<PricingPage />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />  {/* NEW */}
          <Route path="/reset-password" element={<ResetPassword />} />    {/* NEW */}
          <Route path="/payment/callback" element={<PaymentCallback />} />
          
          {/* PROTECTED USER ROUTES */}
          <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
          <Route path="/disease-detection" element={<ProtectedRoute><DiseaseDetection /></ProtectedRoute>} />
          <Route path="/weather-irrigation" element={<ProtectedRoute><WeatherIrrigation /></ProtectedRoute>} />
          <Route path="/price-predictor" element={<ProtectedRoute><PricePredictor /></ProtectedRoute>} />
          <Route path="/chatbot" element={<ProtectedRoute><ChatbotPage /></ProtectedRoute>} />
          <Route path="/profile" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />

          {/* ADMIN ROUTES */}
          <Route path="/admin/login" element={<AdminLogin />} />
          <Route
            path="/admin/*"
            element={
              <ProtectedAdminRoute>
                <AdminLayout>
                  <Routes>
                    <Route path="dashboard" element={<AdminDashboard />} />
                    <Route path="users" element={<UserManagement />} />
                    <Route path="chat-conversations" element={<ChatConversationManager />} />
                    <Route path="scan-results" element={<ScanResultManager />} />
                    <Route path="price-predictor" element={<PricePredictorManager />} />
                    <Route path="settings" element={<AdminSettings />} />
                    <Route path="subscriptions" element={<SubscriptionManager />} />
                    <Route path="" element={<Navigate to="/admin/dashboard" replace />} />
                    <Route path="*" element={<Navigate to="/admin/dashboard" replace />} />
                  </Routes>
                </AdminLayout>
              </ProtectedAdminRoute>
            }
          />
          <Route path="/admin" element={<Navigate to="/admin/dashboard" replace />} />

          {/* 404 */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
      <Toaster />
    </div>
  );
}

const NotFound = () => (
  <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
    <div className="text-center">
      <h1 className="text-6xl font-bold text-gray-900 mb-4">404</h1>
      <p className="text-xl text-gray-600 mb-8">Page not found</p>
      <div className="space-x-4">
        <a href="/" className="inline-block bg-gray-900 text-white px-6 py-3 rounded-lg hover:bg-gray-800">Go Home</a>
        <a href="/dashboard" className="inline-block bg-gray-200 text-gray-900 px-6 py-3 rounded-lg hover:bg-gray-300">Go to Dashboard</a>
      </div>
    </div>
  </div>
);

export default App;