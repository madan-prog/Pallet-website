import { useState } from 'react';
import { FaEnvelope, FaCheckCircle, FaExclamationCircle } from 'react-icons/fa';
import { api } from '../context/AuthContext';
import './LoginPage.css';
import toast from 'react-hot-toast';

const ForgotPasswordPage = () => {
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotLoading, setForgotLoading] = useState(false);
  const [forgotMessage, setForgotMessage] = useState('');
  const [forgotMessageType, setForgotMessageType] = useState(''); // '', 'success', 'warning', 'error'
  const [isFocused, setIsFocused] = useState(false);

  const handleForgotPassword = async (e) => {
    e.preventDefault();
    setForgotLoading(true);
    setForgotMessage('');
    setForgotMessageType('');
    try {
      const response = await api.post('/auth/forgot-password', { email: forgotEmail });
      if (response.data.success) {
        toast.success('If the email is registered, a reset link has been sent.');
        setForgotMessage('Password reset instructions sent to your email.');
        setForgotMessageType('success');
      } else {
        toast.error(response.data.message || 'Failed to send reset instructions.');
        setForgotMessage(response.data.message || 'Failed to send reset instructions.');
        setForgotMessageType('warning');
      }
    } catch (error) {
      const msg = error.response?.data?.message || 'Failed to send reset instructions.';
      setForgotMessage(msg);
      setForgotMessageType(msg.includes('registered email') ? 'warning' : 'error');
      toast.error(msg);
    }
    setForgotLoading(false);
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
            <FaEnvelope size={38} className="text-warning" style={{ filter: 'drop-shadow(0 2px 8px #FFD60088)' }} />
          </div>
          <h2 className="mb-2 text-warning fw-bold" style={{ fontSize: '1.6rem', letterSpacing: '0.5px', textShadow: '0 2px 8px #0002' }}>Forgot Password?</h2>
          <p className="text-secondary mb-2 text-center" style={{ fontSize: '1.08rem', lineHeight: 1.4, maxWidth: 320, textShadow: '0 1px 4px #0002' }}>
            Enter your registered email address and we'll send you a link to reset your password.
          </p>
        </div>
        <form onSubmit={handleForgotPassword} className="w-100" style={{maxWidth: 320}} autoComplete="off">
          <div className="mb-3 position-relative" style={{height: 70}}>
            <input
              id="forgot-email-input"
              type="email"
              className="form-control bg-dark text-white rounded-4 py-3 px-4 input-glow"
              value={forgotEmail}
              onChange={e => setForgotEmail(e.target.value)}
              onFocus={() => setIsFocused(true)}
              onBlur={() => setIsFocused(false)}
              required
              placeholder=" "
              style={{ fontSize: '1.08rem', boxShadow: '0 2px 8px #0001', border: '1.5px solid #FFD60033', color: '#fff', background: 'rgba(36,40,54,0.98)' }}
            />
            <label
              htmlFor="forgot-email-input"
              style={{
                position: 'absolute',
                left: 22,
                top: (isFocused || forgotEmail) ? -12 : 22,
                fontSize: (isFocused || forgotEmail) ? '0.93rem' : '1.08rem',
                color: (isFocused || forgotEmail) ? '#FFD600' : '#e0e6ed',
                background: (isFocused || forgotEmail) ? 'rgba(36,40,54,0.98)' : 'transparent',
                padding: (isFocused || forgotEmail) ? '0 8px' : '0 6px',
                borderRadius: 6,
                pointerEvents: 'none',
                transition: 'all 0.18s',
                fontWeight: 600,
                zIndex: 2,
                lineHeight: 1.1,
              }}
            >
              Email Address
            </label>
          </div>
          {forgotMessage && (
            <div style={{
              display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
              margin: '18px 0 8px 0',
              animation: 'fadeIn 0.7s',
            }}>
              <div style={{
                background: forgotMessageType === 'success' ? '#22c55e22' : forgotMessageType === 'warning' ? '#ffe06644' : '#ef444422',
                borderRadius: '50%',
                width: 38,
                height: 38,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: 6,
                boxShadow: forgotMessageType === 'success' ? '0 2px 8px #22c55e33' : forgotMessageType === 'warning' ? '0 2px 8px #ffe06644' : '0 2px 8px #ef444433',
              }}>
                {forgotMessageType === 'success' && <FaCheckCircle size={22} color="#22c55e" />}
                {forgotMessageType === 'warning' && <FaExclamationCircle size={22} color="#FFD600" />}
                {forgotMessageType === 'error' && <FaExclamationCircle size={22} color="#ef4444" />}
              </div>
              <div style={{
                background: forgotMessageType === 'success' ? '#1a2a1a' : forgotMessageType === 'warning' ? '#2d2a1a' : '#2a1a1a',
                color: forgotMessageType === 'success' ? '#22c55e' : forgotMessageType === 'warning' ? '#FFD600' : '#ef4444',
                fontWeight: 600,
                fontSize: '1.13rem',
                borderRadius: 18,
                padding: '8px 22px',
                boxShadow: forgotMessageType === 'success' ? '0 2px 12px #22c55e11' : forgotMessageType === 'warning' ? '0 2px 12px #ffe06622' : '0 2px 12px #ef444411',
                textAlign: 'center',
                letterSpacing: '0.01em',
                maxWidth: 320,
                lineHeight: 1.4,
              }}>
                {forgotMessage}
              </div>
              <style>{`
                @keyframes fadeIn {
                  from { opacity: 0; transform: translateY(16px); }
                  to { opacity: 1; transform: none; }
                }
              `}</style>
            </div>
          )}
          <div className="d-flex justify-content-center" style={{ gap: '1.1rem', marginTop: '1.2rem' }}>
            <a href="/login" className="btn btn-outline-secondary px-3 py-2 fw-semibold" style={{borderRadius: 8, fontSize: '0.98rem'}}>
              Back to Login
            </a>
            <button
              type="submit"
              className="btn btn-warning px-3 py-2 fw-bold"
              style={{borderRadius: 8, boxShadow: '0 2px 8px #FFD60044', transition: 'background 0.18s', fontSize: '0.98rem'}}
              disabled={forgotLoading}
              onMouseOver={e => e.currentTarget.style.background = '#ffe066'}
              onMouseOut={e => e.currentTarget.style.background = ''}
            >
              {forgotLoading ? 'Sending...' : 'Send Reset Link'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ForgotPasswordPage;

<style>{`
#forgot-email-input::placeholder, .form-control::placeholder, input[type="email"]::placeholder {
  color: #FFD600 !important;
  opacity: 1 !important;
}
`}</style> 