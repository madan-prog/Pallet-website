import { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from "./pages/Home";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import Preloader from "./components/Preloader";
import Quotation from "./components/QuotationForm";
import Simulator from "./components/LoadSimulator";
import Builder from "./components/PalletBuilder";

function App() {
  const [loading, setLoading] = useState(true);

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
      <div className="d-flex flex-column min-vh-100">
        <Navbar />
        <main className="flex-grow-1">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/quotation" element={<Quotation />} />
            <Route path="/simulator" element={<Simulator />} />
            <Route path="/builder" element={<Builder />} />
            {/* Add other routes here, e.g., for admin, catalogue */}
          </Routes>
        </main>
        <Footer />
      </div>
    </Router>
  );
}

export default App;
