import { BrowserRouter, Routes, Route } from "react-router-dom";
import "@/App.css";
import LandingPage from "@/pages/LandingPage";
import Dashboard from "@/pages/Dashboard";
import DiseaseDetection from "@/pages/DiseaseDetection";
import WeatherIrrigation from "@/pages/WeatherIrrigation";
import PricePredictor from "@/pages/PricePredictor";
import ChatbotPage from "@/pages/ChatbotPage";
import AuthPage from "@/pages/AuthPage";
import ProfilePage from "@/pages/ProfilePage";
import VerifyOTP from "@/pages/VerifyOTP";
import AdminDashboard from "@/pages/Admin/AdminDashboard";
import UserManagement from "@/pages/Admin/UserManagement";
import Analytics from "@/pages/Admin/Analytics";
import AdminSettings from "@/pages/Admin/AdminSettings";
import { Toaster } from "@/components/ui/sonner";

function App() {
  return (
    <div className="App">
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/auth" element={<AuthPage />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/disease-detection" element={<DiseaseDetection />} />
          <Route path="/weather-irrigation" element={<WeatherIrrigation />} />
          <Route path="/price-predictor" element={<PricePredictor />} />
          <Route path="/chatbot" element={<ChatbotPage />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/verify-otp" element={<VerifyOTP />} />

          {/* Admin Routes */}
          <Route path="/admin/dashboard" element={<AdminDashboard />} />
          <Route path="/admin/users" element={<UserManagement />} />
          <Route path="/admin/analytics" element={<Analytics />} />
          <Route path="/admin/settings" element={<AdminSettings />} />

        </Routes>
      </BrowserRouter>
      <Toaster />
    </div>
  );
}

export default App;