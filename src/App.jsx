import { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Home from "./pages/Home";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import Preloader from "./components/Preloader";
import QuotationForm from "./components/QuotationForm";
import LoadSimulator from "./components/LoadSimulator";
import PalletBuilder from "./components/PalletBuilder";
import ProductCatalogue from "./components/ProductCatalogue";
import AdminPanel from "./components/AdminPanel";
import LoginPage from './pages/LoginPage';
import ProtectedRoute from './components/ProtectedRoute';
import UnauthorizedPage from './pages/UnauthorizedPage';
import { Toaster } from 'react-hot-toast';
import { useAuth } from './context/AuthContext';
import MyOrders from './components/MyOrders';
import EditQuote from './components/EditQuote';
import About from './components/About';
import { useLocation } from 'react-router-dom';
import { SettingsProvider } from './context/SettingsContext';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import ResetPasswordPage from './pages/ResetPasswordPage';

function AppRoutes({ user }) {
  const location = useLocation();
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/about" element={<About />} />
      <Route path="/load-simulator" element={<LoadSimulator />} />
      <Route path="/pallet-builder" element={<PalletBuilder />} />
      <Route path="/catalogue" element={<ProductCatalogue />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/unauthorized" element={<UnauthorizedPage />} />
      <Route path="/forgot-password" element={<ForgotPasswordPage />} />
      <Route path="/reset-password" element={<ResetPasswordPage />} />
      {/* Protected Route for Admin */}
      <Route element={<ProtectedRoute allowedRoles={['ROLE_ADMIN']} />}>
        <Route path="/admin" element={<AdminPanel />} />
        <Route path="/admin/dashboard" element={<AdminPanel />} />
      </Route>
      {/* Protected Route for User */}
      <Route element={<ProtectedRoute allowedRoles={['ROLE_USER', 'ROLE_ADMIN']} />}>
        <Route path="/quotation" element={user && user.roles && user.roles.includes('ROLE_ADMIN') ? <AdminPanel /> : <QuotationForm key={location.pathname} />} />
        <Route path="/my-orders" element={<MyOrders />} />
        <Route path="/edit-quote/:id" element={<EditQuote />} />
      </Route>
    </Routes>
  );
}

function App() {
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    // Fake loading delay (can be adjusted)
    const timer = setTimeout(() => {
      setLoading(false);
    }, 2000); // 2 seconds

    return () => clearTimeout(timer);
  }, []);

  if (loading) {
    return <Preloader />;
  }

  return (
    <Router>
      <SettingsProvider>
      <div className="d-flex flex-column min-vh-100">
        <Toaster position="top-center" reverseOrder={false} />
        <Navbar />
        <main className="flex-grow-1">
            <AppRoutes user={user} />
        </main>
        <Footer />
      </div>
      </SettingsProvider>
    </Router>
  );
}

export default App;
