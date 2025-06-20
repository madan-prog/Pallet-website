import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import RippleButton from './RippleButton';

const AdminPanel = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [quotes, setQuotes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState('all');
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('adminToken');
    if (token) {
      setIsLoggedIn(true);
      loadQuotes();
    }
  }, []);

  const loadQuotes = () => {
    setLoading(true);
    try {
      const storedQuotes = JSON.parse(localStorage.getItem('palletQuotes') || '[]');
      setQuotes(storedQuotes);
    } catch (error) {
      console.error('Error loading quotes:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = (e) => {
    e.preventDefault();
    if (email === 'admin@palletco.com' && password === 'admin123') {
      localStorage.setItem('adminToken', 'demo-token');
      setIsLoggedIn(true);
      loadQuotes();
    } else {
      alert('Invalid credentials');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    setIsLoggedIn(false);
  };

  const updateQuoteStatus = (id, status) => {
    const updatedQuotes = quotes.map(quote =>
      quote.id === id ? { ...quote, status } : quote
    );
    localStorage.setItem('palletQuotes', JSON.stringify(updatedQuotes));
    setQuotes(updatedQuotes);
  };

  const filteredQuotes = filter === 'all' ? quotes : quotes.filter(quote => quote.status === filter);

  if (!isLoggedIn) {
    return (
      <div className="container my-5">
        <h2 className="mb-4">Admin Login</h2>
        <form onSubmit={handleLogin}>
          <div className="mb-3">
            <label className="form-label">Email</label>
            <input type="email" className="form-control" value={email} onChange={e => setEmail(e.target.value)} required />
          </div>
          <div className="mb-3">
            <label className="form-label">Password</label>
            <input type="password" className="form-control" value={password} onChange={e => setPassword(e.target.value)} required />
          </div>
          <RippleButton className="btn btn-primary w-100" type="submit">Login</RippleButton>
        </form>
      </div>
    );
  }

  return (
    <div className="container my-5">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>Admin Dashboard</h2>
        <RippleButton className="btn btn-danger" onClick={handleLogout}>Logout</RippleButton>
      </div>

      <div className="mb-4">
        {['all', 'pending', 'approved', 'rejected'].map(status => (
          <RippleButton
            key={status}
            className={`btn me-2 ${filter === status ? 'btn-primary' : 'btn-outline-secondary'}`}
            onClick={() => setFilter(status)}
          >
            {status.charAt(0).toUpperCase() + status.slice(1)}
          </RippleButton>
        ))}
      </div>

      {loading ? (
        <div className="text-center py-4">Loading...</div>
      ) : (
        <div className="table-responsive">
          <table className="table table-bordered bg-white">
            <thead className="table-light">
              <tr>
                <th>ID</th>
                <th>Customer</th>
                <th>Specs</th>
                <th>Qty</th>
                <th>Date</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredQuotes.length === 0 ? (
                <tr>
                  <td colSpan="7" className="text-center">No quotes found</td>
                </tr>
              ) : filteredQuotes.map(quote => (
                <tr key={quote.id}>
                  <td>{quote.id}</td>
                  <td>
                    <div>{quote.name}</div>
                    <small className="text-muted">{quote.email}</small>
                  </td>
                  <td>{quote.palletSpecs.material}, {quote.palletSpecs.length}x{quote.palletSpecs.width}x{quote.palletSpecs.height}cm</td>
                  <td>{quote.quantity}</td>
                  <td>{new Date(quote.date).toLocaleDateString()}</td>
                  <td>
                    <span className={`badge ${
                      quote.status === 'approved' ? 'bg-success' :
                      quote.status === 'rejected' ? 'bg-danger' :
                      'bg-warning text-dark'
                    }`}>
                      {quote.status}
                    </span>
                  </td>
                  <td>
                    <div className="btn-group btn-group-sm">
                      <RippleButton className="btn btn-success" onClick={() => updateQuoteStatus(quote.id, 'approved')}>Approve</RippleButton>
                      <RippleButton className="btn btn-danger" onClick={() => updateQuoteStatus(quote.id, 'rejected')}>Reject</RippleButton>
                      <RippleButton className="btn btn-primary" onClick={() => navigate('/builder', { state: { editSpecs: quote.palletSpecs } })}>View</RippleButton>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default AdminPanel;
