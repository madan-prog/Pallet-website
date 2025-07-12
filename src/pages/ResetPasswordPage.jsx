import { useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { api } from '../context/AuthContext';
import { FaLock, FaCheckCircle, FaExclamationCircle } from 'react-icons/fa';
import toast from 'react-hot-toast';

const ResetPasswordPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get('token');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    if (!password || !confirmPassword) {
      setMessage('Please enter and confirm your new password.');
      return;
    }
    if (password !== confirmPassword) {
      setMessage('Passwords do not match.');
      return;
    }
    setLoading(true);
    try {
      const res = await api.post('/auth/reset-password', {
        token,
        newPassword: password
      });
      if (res.data.success) {
        setSuccess(true);
        setMessage('Password reset successful! You can now log in.');
        toast.success('Password reset successful! You can now log in.');
        setTimeout(() => navigate('/login'), 2500);
      } else {
        setMessage(res.data.message || 'Failed to reset password.');
      }
    } catch (err) {
      setMessage(err.response?.data?.message || 'Failed to reset password.');
    }
    setLoading(false);
  };

  return (
    <div className="container-fluid d-flex justify-content-center align-items-center vh-100"
      style={{
        background: 'linear-gradient(135deg, #181c24 60%, #23272f 100%)',
        minHeight: '100vh',
        padding: 0,
      }}
    >
      <div
        className="shadow-lg border-0 d-flex flex-column align-items-center justify-content-center glassy-forgot-box"
        style={{
          width: '100%',
          maxWidth: 400,
          minWidth: 320,
          minHeight: 340,
          marginTop: 90,
          marginBottom: 40,
          borderRadius: 22,
          boxShadow: '0 8px 32px 0 rgba(31,38,135,0.22)',
          background: 'rgba(36, 40, 54, 0.88)',
          backdropFilter: 'blur(16px)',
          WebkitBackdropFilter: 'blur(16px)',
          border: '1.5px solid rgba(255,255,255,0.10)',
          padding: '38px 32px 28px 32px',
          position: 'relative',
        }}
      >
        <div className="d-flex flex-column align-items-center mb-3" style={{gap: 10}}>
          <div style={{
            background: 'rgba(255, 214, 0, 0.13)',
            borderRadius: '50%',
            padding: 12,
            marginBottom: 2,
            boxShadow: '0 0 18px 4px #FFD60088',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}>
            <FaLock size={38} className="text-warning" style={{ filter: 'drop-shadow(0 2px 8px #FFD60088)' }} />
          </div>
          <h2 className="mb-2 text-warning fw-bold" style={{ fontSize: '1.6rem', letterSpacing: '0.5px', textShadow: '0 2px 8px #0002' }}>Reset Password</h2>
          <p className="text-secondary mb-2 text-center" style={{ fontSize: '1.08rem', lineHeight: 1.4, maxWidth: 320, textShadow: '0 1px 4px #0002' }}>
            Enter your new password below. Your reset link is valid for 30 minutes.
          </p>
        </div>
        <form onSubmit={handleSubmit} className="w-100" style={{maxWidth: 320}} autoComplete="off">
          <div className="mb-3 position-relative">
            <label className="form-label fw-semibold" style={{ color: '#e0e6ed', fontWeight: 600, fontSize: '1.08rem', marginBottom: 6 }}>New Password</label>
            <input
              type="password"
              className="form-control bg-dark text-white rounded-4 py-3 px-4 input-glow"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
              placeholder="Enter new password"
              style={{ fontSize: '1.08rem', boxShadow: '0 2px 8px #0001', border: '1.5px solid #FFD60033' }}
            />
          </div>
          <div className="mb-3 position-relative">
            <label className="form-label fw-semibold" style={{ color: '#e0e6ed', fontWeight: 600, fontSize: '1.08rem', marginBottom: 6 }}>Confirm Password</label>
            <input
              type="password"
              className="form-control bg-dark text-white rounded-4 py-3 px-4 input-glow"
              value={confirmPassword}
              onChange={e => setConfirmPassword(e.target.value)}
              required
              placeholder="Re-enter new password"
              style={{ fontSize: '1.08rem', boxShadow: '0 2px 8px #0001', border: '1.5px solid #FFD60033' }}
            />
          </div>
          {message && (
            <div className={`mb-2 d-flex align-items-center gap-2 ${success ? 'text-success' : 'text-danger'}`} style={{ fontWeight: 500, fontSize: '1.05rem', textShadow: '0 1px 4px #0002' }}>
              {success ? <FaCheckCircle /> : <FaExclamationCircle />} {message}
            </div>
          )}
          <div className="d-flex justify-content-center" style={{ marginTop: '1.2rem' }}>
            <button
              type="submit"
              className="btn btn-warning px-3 py-2 fw-bold"
              style={{borderRadius: 8, boxShadow: '0 2px 8px #FFD60044', transition: 'background 0.18s', fontSize: '0.98rem'}}
              disabled={loading}
              onMouseOver={e => e.currentTarget.style.background = '#ffe066'}
              onMouseOut={e => e.currentTarget.style.background = ''}
            >
              {loading ? 'Resetting...' : 'Reset Password'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ResetPasswordPage; 