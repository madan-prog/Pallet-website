// Footer.jsx
import React from 'react';
import { FaPhone, FaEnvelope, FaMapMarkerAlt } from 'react-icons/fa';
import './Footer.css';

function Footer() {
  return (
    <footer className="footer text-light pt-4 pb-2">
      <div className="container">
        {/* Contact Info */}
        <div className="row justify-content-center mb-4">
          <div className="col-auto mx-3">
            <div className="d-flex align-items-center">
              <FaPhone className="me-2" />
              <span>+91 98765 43210</span>
            </div>
          </div>
          <div className="col-auto mx-3">
            <div className="d-flex align-items-center">
              <FaEnvelope className="me-2" />
              <span>info@saravanatimbers.com</span>
            </div>
          </div>
          <div className="col-auto mx-3">
            <div className="d-flex align-items-center">
              <FaMapMarkerAlt className="me-2" />
              <span>123 Industrial Area, Chennai, Tamil Nadu 600001</span>
            </div>
          </div>
        </div>

        <hr className="my-4 bg-secondary" />

        {/* Copyright */}
       {/* Copyright */}
<div className="text-center">
  © {new Date().getFullYear()} Saravana Timbers. All rights reserved.
</div>

      </div>
    </footer>
  );
}

export default Footer;