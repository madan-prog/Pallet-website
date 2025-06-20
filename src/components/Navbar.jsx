import { Link, NavLink } from 'react-router-dom';
import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import './Navbar.css';

function Navbar() {
  const navbarRef = useRef();

  // Optional GSAP entrance animation
  // useEffect(() => {
  //   gsap.from(navbarRef.current, {
  //     y: -60,
  //     opacity: 0,
  //     duration: 1,
  //     ease: 'power2.out',
  //   });
  // }, []);

  return (
    <nav
      ref={navbarRef}
      className="navbar navbar-expand-lg fixed-top navbar-dark custom-navbar px-4"
    >
      <div className="container-fluid">
        <Link className="navbar-brand fw-bold d-flex align-items-center logo-animate" to="/">
          <img src="/images/logo.svg" alt="logo" className="navbar-logo-img" />
          <span className="text-warning">PRECISION-</span>POWER-PALLETS
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

        <div className="collapse navbar-collapse justify-content-end" id="navbarNav">
          <ul className="navbar-nav">
            {['Home', 'Builder', 'Quotation', 'Catalogue', 'Simulator', 'Admin'].map((item) => (
              <li className="nav-item mx-2" key={item}>
                <NavLink
                  to={item === 'Home' ? '/' : `/${item.toLowerCase()}`}
                  className={({ isActive }) =>
                    `nav-link text-uppercase fw-semibold px-2${isActive ? ' active' : ''}`
                  }
                >
                  {item}
                </NavLink>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
