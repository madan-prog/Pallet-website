// [No change to imports, keep as is]
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { FaUserPlus, FaSignInAlt, FaEye, FaEyeSlash, FaEnvelope, FaCheckCircle, FaExclamationCircle } from 'react-icons/fa';
import { api } from '../context/AuthContext';
import './LoginPage.css';
import Modal from 'react-modal';

const LoginPage = () => {
  const [isLogin, setIsLogin] = useState(true);
  const { login, signup } = useAuth();
  const navigate = useNavigate();

  const { register, handleSubmit, formState: { errors }, watch, setError } = useForm();
  const password = watch('password');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [emailOtpSent, setEmailOtpSent] = useState(false);
  const [emailOtp, setEmailOtp] = useState('');
  const [emailOtpError, setEmailOtpError] = useState('');
  const [emailVerified, setEmailVerified] = useState(false);
  const [emailLoading, setEmailLoading] = useState(false);
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotLoading, setForgotLoading] = useState(false);
  const [forgotMessage, setForgotMessage] = useState('');

  const onLoginSubmit = async (data) => {
    const { email, password } = data;
    const result = await login(email, password);
    if (result.success) {
      toast.success('Logged in successfully!');
      if (result.user.roles && result.user.roles.includes('ROLE_ADMIN')) {
        navigate('/admin/dashboard');
      } else {
        navigate('/quotation');
      }
    } else {
      toast.error('Login failed. Please check your credentials.');
    }
  };

  const onSignupSubmit = async (data) => {
    if (!emailVerified) {
      toast.error('Please verify your email before signing up.');
      return;
    }
    const { fullName, email, username, password } = data;
    try {
      const result = await signup(fullName, email, username, password, null, emailOtp, 'user');
      if (result.success) {
        toast.success('Signup successful! You can now log in.');
        setIsLogin(true);
      } else {
        toast.error(result.message || 'Signup failed. Please try again.');
      }
    } catch (error) {
      toast.error('Signup failed. Please try again.');
    }
  };

  const handleSendEmailOtp = async () => {
    setEmailOtpError('');
    setEmailOtpSent(true);
    setEmailLoading(false);
    toast.success('OTP is being sent! Check your email shortly.');

    const email = watch('email');
    if (!email || !/^\S+@\S+\.\S+$/.test(email)) {
      setEmailOtpError('Please enter a valid email address.');
      setEmailOtpSent(false);
      return;
    }

    api.post('/auth/send-email-otp', { email })
      .then(response => {
        if (!response.data.success) {
          setEmailOtpSent(false);
          setEmailOtpError(response.data.message || 'Failed to send OTP');
          toast.error(response.data.message || 'Failed to send OTP');
        }
      })
      .catch(error => {
        setEmailOtpSent(false);
        let errorMessage = 'Failed to send OTP. Please try again.';
        if (error.response?.status === 429) {
          errorMessage = 'Please wait 30 seconds before requesting another OTP.';
        } else if (error.response?.data?.message) {
          errorMessage = error.response.data.message;
        }
        setEmailOtpError(errorMessage);
        toast.error(errorMessage);
      });
  };

  const handleVerifyEmailOtp = async () => {
    setEmailOtpError('');
    setEmailLoading(true);
    const email = watch('email');
    
    if (!emailOtp || emailOtp.length !== 6 || !/^\d{6}$/.test(emailOtp)) {
      setEmailOtpError('Please enter a valid 6-digit OTP');
      setEmailLoading(false);
      return;
    }
    
    try {
      const response = await api.post('/auth/verify-email-otp', { 
        email, 
        otp: emailOtp 
      });
      
      if (response.data.success) {
        setEmailVerified(true);
        setEmailOtpError('');
        toast.success('Email verified successfully!');
      } else {
        setEmailOtpError(response.data.message || 'Invalid OTP');
        toast.error(response.data.message || 'Invalid OTP');
      }
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Failed to verify OTP. Please try again.';
      setEmailOtpError(errorMessage);
      toast.error(errorMessage);
    }
    setEmailLoading(false);
  };

  const handleResendOtp = async () => {
    setEmailOtpSent(false);
    setEmailOtp('');
    setEmailOtpError('');
    await handleSendEmailOtp();
  };

  const handleForgotPassword = async (e) => {
    e.preventDefault();
    setForgotLoading(true);
    setForgotMessage('');
    try {
      const response = await api.post('/auth/forgot-password', { email: forgotEmail });
      if (response.data.success) {
        setForgotMessage('Password reset instructions sent to your email.');
      } else {
        setForgotMessage(response.data.message || 'Failed to send reset instructions.');
      }
    } catch (error) {
      setForgotMessage('Failed to send reset instructions.');
    }
    setForgotLoading(false);
  };

  return (
    <div className="container-fluid d-flex justify-content-center align-items-center vh-100"
      style={{
        background: '#1a202c',
        minHeight: '100vh',
        padding: '0',
      }}
    >
      <div className="card shadow-lg border-0"
        style={{
          width: '100%',
          maxWidth: '520px',
          marginTop: '90px',
          marginBottom: '40px',
          minHeight: 'auto',
          background: 'rgba(45, 55, 72, 0.98)',
          color: 'white',
          borderRadius: '1.5rem',
          boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.37)',
          padding: '0',
        }}
      >
        <div className="card-body px-5 py-4" style={{ borderRadius: '1.5rem' }}>
          <h2 className="text-center text-warning fw-bold mb-4" style={{ fontSize: '2.2rem', letterSpacing: '1px' }}>{isLogin ? 'Login' : 'Create User Account'}</h2>
          <form onSubmit={handleSubmit(isLogin ? onLoginSubmit : onSignupSubmit)}>
            {!isLogin && (
              <>
                <div className="mb-4">
                  <label className="form-label fw-semibold" style={{ fontSize: '1.08rem' }}>Full Name</label>
                  <input
                    placeholder="Enter your full name"
                    {...register('fullName', { required: 'Full Name is required' })}
                    className="form-control bg-dark text-white rounded-4 py-3 px-4 input-glow"
                  />
                  {errors.fullName && <p className="text-danger small mt-1">{errors.fullName.message}</p>}
                </div>
                <div className="mb-4">
                  <label className="form-label fw-semibold" style={{ fontSize: '1.08rem' }}>Email Address</label>
                  <div className="d-flex align-items-center gap-3">
                    <input
                      placeholder="example@domain.com"
                      {...register('email', {
                        required: 'Email is required',
                        pattern: { value: /^\S+@\S+\.\S+$/, message: 'Invalid email address' },
                      })}
                      className="form-control bg-dark text-white rounded-4 py-3 px-4 input-glow"
                      disabled={emailVerified}
                    />
                    <button
                      type="button"
                      className={`btn rounded-3 px-4 fw-bold d-flex align-items-center justify-content-center ${emailVerified ? 'btn-success' : 'btn-success'}`}
                      style={{ minWidth: '110px', fontSize: '1.08rem', height: '48px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', boxShadow: '0 2px 8px #0002', letterSpacing: '0.5px', border: 'none', background: emailVerified ? '#22c55e' : '#15803d', color: '#fff', transition: 'background 0.2s' }}
                      onClick={handleSendEmailOtp}
                      disabled={emailOtpSent || emailVerified || emailLoading}
                    >
                      {emailLoading ? 'Sending...' : emailOtpSent ? (emailVerified ? 'Verified' : 'OTP Sent') : 'Verify'}
                    </button>
                  </div>
                  {errors.email && <p className="text-danger small mt-1">{errors.email.message}</p>}
                  {emailOtpError && !(emailOtpSent && !emailVerified) && <p className="text-danger small mt-1">{emailOtpError}</p>}
                </div>
                {emailOtpSent && !emailVerified && (
                  <div className="mb-4">
                    <label className="form-label fw-semibold" style={{ fontSize: '1.08rem' }}>OTP</label>
                    <div className="d-flex align-items-center gap-3 flex-wrap">
                      <input
                        placeholder="Enter the 6-digit OTP"
                        className="form-control bg-dark text-white rounded-4 py-3 px-4 input-glow"
                        style={{ fontSize: '1.08rem', minWidth: 0, flex: 1, boxShadow: '0 2px 8px #0002', border: '1.5px solid #2dd4bf' }}
                        value={emailOtp}
                        onChange={e => setEmailOtp(e.target.value)}
                        maxLength={6}
                      />
                      <button
                        type="button"
                        className="btn btn-primary rounded-3 fw-bold d-flex align-items-center justify-content-center"
                        style={{ fontSize: '1.08rem', height: '48px', minWidth: '110px', padding: '0 1.5rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', boxShadow: '0 2px 8px #0002', letterSpacing: '0.5px', border: 'none', background: '#2563eb', color: '#fff', transition: 'background 0.2s' }}
                        onClick={handleVerifyEmailOtp}
                        disabled={emailLoading}
                      >
                        {emailLoading ? 'Verifying...' : 'Submit'}
                      </button>
                    </div>
                    <div className="d-flex flex-column align-items-center mt-2 w-100">
                      <button
                        type="button"
                        className="btn btn-link resend-otp-btn text-success p-0 mt-1"
                        style={{ fontWeight: 700, fontSize: '1rem', textAlign: 'center', textDecoration: 'underline', letterSpacing: '0.2px', transition: 'color 0.2s' }}
                        onClick={handleResendOtp}
                        disabled={emailLoading}
                      >
                        Resend OTP
                      </button>
                    </div>
                    {emailOtpError && <p className="text-danger small mt-1">{emailOtpError}</p>}
                  </div>
                )}
              </>
            )}

            {isLogin && (
              <div className="mb-4">
                <label className="form-label fw-semibold" style={{ fontSize: '1.08rem' }}>Email Address</label>
                <input
                  placeholder="Enter your email"
                  {...register('email', { required: 'Email is required', pattern: { value: /^\S+@\S+\.\S+$/, message: 'Invalid email address' } })}
                  className="form-control bg-dark text-white rounded-4 py-3 px-4 input-glow"
                  style={{ fontSize: '1.08rem' }}
                />
                {errors.email && <p className="text-danger small mt-1">{errors.email.message}</p>}
              </div>
            )}

            <div className="mb-4">
              <label className="form-label fw-semibold" style={{ fontSize: '1.08rem' }}>Password</label>
              <div className="position-relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Enter your password"
                  {...register('password', { required: 'Password is required' })}
                  className="form-control bg-dark text-white rounded-4 py-3 px-4 input-glow"
                />
                <button
                  type="button"
                  className="btn btn-link position-absolute top-50 end-0 translate-middle-y px-2"
                  style={{ color: '#ccc', fontSize: '1.2rem' }}
                  tabIndex={-1}
                  onClick={() => setShowPassword((v) => !v)}
                >
                  {showPassword ? <FaEyeSlash /> : <FaEye />}
                </button>
              </div>
              {errors.password && <p className="text-danger small mt-1">{errors.password.message}</p>}
              {isLogin && (
                <div className="text-end mt-2">
                  <button type="button" className="btn btn-link text-warning p-0 fw-semibold" style={{ fontSize: '1rem' }} onClick={() => window.location.href = '/forgot-password'}>
                    Forgot Password?
                  </button>
                </div>
              )}
            </div>

            {!isLogin && (
              <div className="mb-4">
                <label className="form-label fw-semibold" style={{ fontSize: '1.08rem' }}>Confirm Password</label>
                <div className="position-relative">
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    placeholder="Re-enter your password"
                    {...register('confirmPassword', {
                      required: 'Please confirm your password',
                      validate: value => value === password || 'Passwords do not match',
                    })}
                    className="form-control bg-dark text-white rounded-4 py-3 px-4 input-glow"
                    style={{ fontSize: '1.08rem' }}
                  />
                  <button
                    type="button"
                    className="btn btn-link position-absolute top-50 end-0 translate-middle-y px-2"
                    style={{ color: '#ccc', fontSize: '1.2rem' }}
                    tabIndex={-1}
                    onClick={() => setShowConfirmPassword((v) => !v)}
                  >
                    {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
                  </button>
                </div>
                {errors.confirmPassword && <p className="text-danger small mt-1">{errors.confirmPassword.message}</p>}
              </div>
            )}

            <button type="submit" className="btn btn-warning w-100 fw-bold py-3 rounded-4 mb-2" style={{ fontSize: '1.18rem', letterSpacing: '0.5px', boxShadow: '0 2px 12px #ffd60055' }}>
              {isLogin ? (
                <>
                  <FaSignInAlt className="me-2" /> Login to Your Account
                </>
              ) : (
                <>
                  <FaUserPlus className="me-2" /> Sign Up & Create Account
                </>
              )}
            </button>
          </form>

          <p className="text-center mt-4 mb-0" style={{ fontSize: '1.05rem' }}>
            {isLogin ? "Don't have an account?" : 'Already have an account?'}
            <button onClick={() => setIsLogin(!isLogin)} className="btn btn-link text-warning fw-semibold p-0 ms-2" style={{ fontSize: '1.05rem' }}>
              {isLogin ? 'Click here to Sign Up' : 'Click here to Login'}
            </button>
          </p>
        </div>
      </div>
      <div id="recaptcha-container"></div>
      <Modal
        isOpen={showForgotModal}
        onRequestClose={() => setShowForgotModal(false)}
        contentLabel="Forgot Password"
        ariaHideApp={false}
        style={{
          overlay: { backgroundColor: 'rgba(0,0,0,0.6)' },
          content: {
            maxWidth: 380,
            minWidth: 320,
            minHeight: 260,
            maxHeight: 320,
            margin: 'auto',
            borderRadius: 18,
            padding: '28px 28px 20px 28px',
            background: 'linear-gradient(135deg, #23272f 80%, #2d3748 100%)',
            color: '#fff',
            boxShadow: '0 8px 32px 0 rgba(31,38,135,0.25)',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
          }
        }}
      >
        <div className="d-flex flex-column align-items-center mb-2" style={{gap: 6}}>
          <FaEnvelope size={38} className="mb-2 text-warning" style={{ filter: 'drop-shadow(0 2px 8px #FFD60088)' }} />
          <h3 className="mb-2 text-warning fw-bold" style={{ fontSize: '1.35rem', letterSpacing: '0.5px' }}>Forgot Password?</h3>
          <p className="text-secondary mb-2 text-center" style={{ fontSize: '1.05rem', lineHeight: 1.35, maxWidth: 320 }}>
            Enter your registered email address and we'll send you a link to reset your password.
          </p>
        </div>
        <form onSubmit={handleForgotPassword} className="w-100" style={{maxWidth: 320}}>
          <div className="mb-3">
            <label className="form-label fw-semibold">Email Address</label>
            <input
              type="email"
              className="form-control bg-dark text-white rounded-4 py-3 px-4 input-glow"
              value={forgotEmail}
              onChange={e => setForgotEmail(e.target.value)}
              required
              placeholder="example@domain.com"
              style={{ fontSize: '1.08rem' }}
            />
          </div>
          {forgotMessage && (
            <div className={`mb-2 d-flex align-items-center gap-2 ${forgotMessage.includes('sent') ? 'text-success' : 'text-danger'}`} style={{ fontWeight: 500, fontSize: '1.01rem' }}>
              {forgotMessage.includes('sent') ? <FaCheckCircle /> : <FaExclamationCircle />} {forgotMessage}
            </div>
          )}
          <div className="d-flex justify-content-end gap-2 mt-2">
            <button type="button" className="btn btn-outline-secondary px-4" onClick={() => setShowForgotModal(false)}>Cancel</button>
            <button type="submit" className="btn btn-warning px-4 fw-bold" disabled={forgotLoading}>{forgotLoading ? 'Sending...' : 'Send Reset Link'}</button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default LoginPage;
