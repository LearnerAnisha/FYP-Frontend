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
        </Routes>
      </BrowserRouter>
      <Toaster />
    </div>
  );
}

export default App;