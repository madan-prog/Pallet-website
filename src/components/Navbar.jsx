import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import './Navbar.css';
import { useAuth } from '../context/AuthContext';
import MyInfo from './MyInfo';
import { User, CheckCircle, AlertCircle } from 'lucide-react';
import { api } from '../context/AuthContext';

function Navbar() {
  const navbarRef = useRef();
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [showDropdown, setShowDropdown] = useState(false);
  const [showMyInfo, setShowMyInfo] = useState(false);
  const [userInfoComplete, setUserInfoComplete] = useState(false);
  const avatarRef = useRef();

  // Optional GSAP entrance animation
  // useEffect(() => {
  //   gsap.from(navbarRef.current, {
  //     y: -60,
  //     opacity: 0,
  //     duration: 1,
  //     ease: 'power2.out',
  //   });
  // }, []);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const handleMyInfoClick = () => {
    setShowDropdown(false);
    setShowMyInfo(true);
  };

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event) {
      if (avatarRef.current && !avatarRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Function to check profile completeness from backend
  const refreshUserInfoComplete = async () => {
    if (!user) return;
    try {
      const response = await api.get(`/user-info/${user.email}/exists`);
      setUserInfoComplete(!!response.data.exists);
    } catch (error) {
      setUserInfoComplete(false);
    }
  };

  // When user logs in, check profile completeness
  useEffect(() => {
    refreshUserInfoComplete();
    // eslint-disable-next-line
  }, [user]);

  const navItems = [
    { path: '/', label: 'Home' },
    { path: '/about', label: 'About' },
    { path: '/pallet-builder', label: 'Pallet Builder' },
    { path: '/catalogue', label: 'Catalogue' },
    { path: '/load-simulator', label: 'Load Simulator' },
  ];

  return (
    <>
      <nav
        ref={navbarRef}
        className="navbar navbar-expand-lg fixed-top navbar-dark custom-navbar px-4 shadow-lg glass-navbar"
        style={{ backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)', boxShadow: '0 4px 24px 0 rgba(0,0,0,0.18)' }}
      >
        <div className="container-fluid align-items-center">
          <Link className="navbar-brand fw-bold d-flex flex-column align-items-start logo-animate position-relative" to="/" style={{ gap: 0, minWidth: 0 }}>
            <div className="d-flex align-items-center gap-2 position-relative" style={{ minWidth: 0 }}>
              <img src="/images/logo.svg" alt="logo" className="navbar-logo-img" style={{ height: 38, marginRight: 14, filter: 'drop-shadow(0 0 8px #FFD60088)' }} />
              <span className="text-warning" style={{ fontSize: '1.5rem', letterSpacing: '1px', fontWeight: 800 }}>PRECISION-</span>
              <span className="text-light" style={{ fontSize: '1.5rem', letterSpacing: '1px', fontWeight: 800 }}>POWER-PALLETS</span>
              <img src="/images/company-logo.png" alt="company-logo" style={{ height: 32, width: 32, borderRadius: '50%', marginLeft: 12, objectFit: 'cover', boxShadow: '0 2px 8px #FFD60055' }} />
            </div>
            <span className="navbar-tagline text-secondary fw-semibold mt-1 mx-auto w-100 text-center" style={{ fontSize: '0.95rem', letterSpacing: '0.5px', marginLeft: 0, display: 'block' }}>Engineered for Excellence</span>
          </Link>

          <button
            className="navbar-toggler"
            type="button"
            data-bs-toggle="collapse"
            data-bs-target="#navbarNav"
            aria-controls="navbarNav"
            aria-expanded="false"
            aria-label="Toggle navigation"
          >
            <span className="navbar-toggler-icon"></span>
          </button>

          <div className="collapse navbar-collapse justify-content-end align-items-center" id="navbarNav">
            <ul className="navbar-nav align-items-center mb-2 mb-lg-0">
              {navItems.map((item) => (
                <li className="nav-item mx-2" key={item.path}>
                  <NavLink
                    to={item.path}
                    className={({ isActive }) =>
                      `nav-link text-uppercase fw-semibold px-2${isActive ? ' active' : ''}`
                    }
                  >
                    {item.label}
                  </NavLink>
                </li>
              ))}
              <li className="nav-item mx-2 d-none d-lg-block">
                <div style={{ width: 2, height: 32, background: 'rgba(255,255,255,0.12)', borderRadius: 2, margin: '0 10px' }} />
              </li>
              {user && user.roles && user.roles.includes('ROLE_USER') && (
                <li className="nav-item mx-2">
                  <NavLink
                    to="/quotation"
                    className={({ isActive }) =>
                      `nav-link text-uppercase fw-semibold px-2${isActive ? ' active' : ''}`
                    }
                  >
                    Get Quote
                  </NavLink>
                </li>
              )}
              {user && user.roles && user.roles.includes('ROLE_USER') && (
                <li className="nav-item mx-2">
                  <NavLink
                    to="/my-orders"
                    className={({ isActive }) =>
                      `nav-link text-uppercase fw-semibold px-2${isActive ? ' active' : ''}`
                    }
                  >
                    My Orders
                  </NavLink>
                </li>
              )}
              {user && user.roles && user.roles.includes('ROLE_ADMIN') && (
                <li className="nav-item mx-2">
                  <NavLink
                    to="/admin"
                    className={({ isActive }) =>
                      `nav-link text-uppercase fw-semibold px-2${isActive ? ' active' : ''}`
                    }
                  >
                    Admin
                  </NavLink>
                </li>
              )}
              <li className="nav-item mx-2 position-relative" ref={avatarRef}>
                {user ? (
                  <>
                    <button
                      className="btn p-0 d-flex align-items-center justify-content-center rounded-circle avatar-enhanced"
                      onClick={() => setShowDropdown((v) => !v)}
                    >
                      {user.fullName ? user.fullName.charAt(0).toUpperCase() : (user.username ? user.username.charAt(0).toUpperCase() : 'U')}
                    </button>
                    {showDropdown && (
                      <div
                        className="user-info-dropdown-card position-absolute end-0"
                        style={{ minWidth: 240, zIndex: 1000 }}
                      >
                        <div className="mb-3 fw-bold text-center user-name" style={{ fontSize: 16 }}>
                          {user.fullName && <div>{user.fullName}</div>}
                          {user.email && <div className="user-email">{user.email}</div>}
                          {!user.fullName && user.username && <div>{user.username}</div>}
                        </div>
                        {/* My Info Button */}
                        <button 
                          className="info-btn"
                          onClick={handleMyInfoClick}
                          style={{ fontSize: '0.9rem' }}
                        >
                          <User size={16} />
                          My Info
                          {userInfoComplete ? (
                            <CheckCircle className="text-green-500" size={14} />
                          ) : (
                            <AlertCircle className="text-red-500" size={14} />
                          )}
                        </button>
                        <button className="logout-btn" onClick={handleLogout}>
                          Logout
                        </button>
                      </div>
                    )}
                  </>
                ) : (
                  <NavLink className="btn btn-warning" to="/login">Login</NavLink>
                )}
              </li>
            </ul>
          </div>
        </div>
      </nav>

      {/* MyInfo Modal */}
      <MyInfo 
        isOpen={showMyInfo}
        onClose={() => setShowMyInfo(false)}
        onComplete={refreshUserInfoComplete}
      />
    </>
  );
}

export default Navbar;
