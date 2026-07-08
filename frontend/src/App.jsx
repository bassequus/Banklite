import { Routes, Route } from "react-router-dom";
import LoginPage from "./pages/LoginPage";
import CustomerDashboard from "./pages/CustomerDashboard";
import LoanApplicationForm from "./pages/LoanApplicationForm";
import OfficerDashboard from "./pages/OfficerDashboard";
import UnderwritingConsole from "./pages/UnderwritingConsole";
import ProtectedRoute from "./components/ProtectedRoute";

function App() {
  return (
    <Routes>
      <Route path="/" element={<LoginPage />} />

      <Route
        path="/customer"
        element={
          <ProtectedRoute allowedRole="customer">
            <CustomerDashboard />
          </ProtectedRoute>
        }
      />

      <Route
        path="/apply"
        element={
          <ProtectedRoute allowedRole="customer">
            <LoanApplicationForm />
          </ProtectedRoute>
        }
      />

      <Route
        path="/officer"
        element={
          <ProtectedRoute allowedRole="credit_officer">
            <OfficerDashboard />
          </ProtectedRoute>
        }
      />

      <Route
        path="/underwrite/:id"
        element={
          <ProtectedRoute allowedRole="credit_officer">
            <UnderwritingConsole />
          </ProtectedRoute>
        }
      />
    </Routes>
  );
}

export default App;