// Footer.jsx
import React from 'react';
import { FaPhone, FaEnvelope, FaMapMarkerAlt, FaFacebook, FaInstagram, FaLinkedin, FaWhatsapp, FaYoutube } from 'react-icons/fa';
import './Footer.css';

const socialLinks = [
  { icon: <FaFacebook />, url: 'https://facebook.com/saravanatimbers', label: 'Facebook', color: '#1877f3' },
  { icon: <FaInstagram />, url: 'https://instagram.com/saravanatimbers', label: 'Instagram', color: '#e4405f' },
  { icon: <FaLinkedin />, url: 'https://linkedin.com/company/saravanatimbers', label: 'LinkedIn', color: '#0a66c2' },
  { icon: <FaWhatsapp />, url: 'https://wa.me/919876543210', label: 'WhatsApp', color: '#25d366' },
  { icon: <FaYoutube />, url: 'https://youtube.com/@saravanatimbers', label: 'YouTube', color: '#ff0000' },
];

function Footer() {
  return (
    <footer className="footer text-light pt-4 pb-2" style={{ backgroundColor: '#151c26' }}>
      <div className="container">
        {/* Contact Info */}
        <div className="row justify-content-center mb-3">
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

        {/* Social Media Icons */}
        <div className="row justify-content-center mb-3">
          <div className="col-auto">
            <div className="d-flex gap-3 justify-content-center align-items-center">
              {socialLinks.map((s, i) => (
                <a
                  key={s.label}
                  href={s.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  title={s.label}
                  style={{
                    color: s.color,
                    background: '#232b39',
                    borderRadius: '50%',
                    width: 44,
                    height: 44,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: 22,
                    boxShadow: '0 2px 8px #0003',
                    transition: 'background 0.2s, color 0.2s, box-shadow 0.2s',
                  }}
                  className="footer-social-icon"
                >
                  {s.icon}
                </a>
              ))}
            </div>
          </div>
        </div>

        <hr className="my-4 bg-secondary" />

       {/* Copyright */}
<div className="text-center">
  © {new Date().getFullYear()} Saravana Timbers. All rights reserved.
</div>
      </div>
    </footer>
  );
}

export default Footer;