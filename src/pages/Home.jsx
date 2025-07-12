import { useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import gsap from 'gsap';
import { useInView } from 'react-intersection-observer';
import { FaWrench, FaFileInvoiceDollar, FaBookOpen, FaCube, FaArrowRight } from 'react-icons/fa';
import RippleButton from '../components/RippleButton';
import Chatbot from '../components/Chatbot';
import "../App.css";
import { useAuth } from '../context/AuthContext';

// ✅ Ensure these images are placed in /public/images/ folder
const backgroundImages = [
  '/images/pallet-bg.png',
  '/images/pallet-slideshow-1.png', // ✅ Ensure this exists in public/images
  '/images/pallet-slideshow-2.png', // ✅ Ensure this exists in public/images
  '/images/pallet-slideshow-3.png', // ✅ Ensure this exists in public/images
];

function Home() {
  const headingRef = useRef();
  const subTextRef = useRef();
  const buttonRef = useRef();
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const bgRefs = useRef([]);
  const navigate = useNavigate();
  const { user } = useAuth();

  const { ref: toolsRef, inView: toolsInView } = useInView({ triggerOnce: true, threshold: 0.1 });
  const { ref: statsRef, inView: statsInView } = useInView({ triggerOnce: true, threshold: 0.5 });
  const { ref: ctaRef, inView: ctaInView } = useInView({ triggerOnce: true, threshold: 0.5 });

  // Animate text on load
  useEffect(() => {
    gsap.fromTo(headingRef.current, { opacity: 0, scale: 0.9 }, { opacity: 1, scale: 1, duration: 1, ease: 'power3.out' });
    const words = subTextRef.current.querySelectorAll('.animated-word');
    gsap.set(words, { opacity: 0, y: 20 });
    gsap.to(words, {
      opacity: 1,
      y: 0,
      stagger: 0.12,
      duration: 0.7,
      ease: 'power2.out',
      delay: 0.4,
    });
    gsap.fromTo(buttonRef.current, { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 1, delay: 1.2, ease: 'power2.out' });
  }, []);

  // GSAP Animations for sections
  useEffect(() => {
    if (toolsInView) {
      gsap.fromTo('.tool-card', 
        { opacity: 0, y: 50 }, 
        { opacity: 1, y: 0, stagger: 0.2, duration: 0.8, ease: 'power3.out' }
      );
    }
  }, [toolsInView]);

  useEffect(() => {
    if (statsInView) {
      gsap.fromTo('.stat-item', { opacity: 0, y: 50 }, {
        opacity: 1,
        y: 0,
        stagger: 0.2,
        duration: 0.8,
        ease: 'power3.out'
      });

      gsap.utils.toArray('.stat-number').forEach(target => {
        const endValStr = target.dataset.val;

        if (endValStr === '24/7') {
          target.textContent = '24/7';
          gsap.from(target, { opacity: 0, duration: 1, delay: 0.5 });
          return;
        }

        const endValue = parseInt(endValStr, 10);
        if (isNaN(endValue)) return;

        let counter = { val: 0 };

        const plusStatVals = ["1000000", "500", "35"];

        gsap.to(counter, {
          val: endValue,
          duration: 2,
          ease: 'power2.out',
          onUpdate: () => {
            const num = Math.ceil(counter.val);
            let text = num.toLocaleString();
            if (plusStatVals.includes(endValStr)) {
              text += '+';
            }
            target.textContent = text;
          },
          onComplete: () => {
            let text = endValue.toLocaleString();
            if (plusStatVals.includes(endValStr)) {
              text += '+';
            }
            target.textContent = text;
          }
        });
      });
    }
  }, [statsInView]);

  useEffect(() => {
    if (ctaInView) {
      gsap.fromTo('.cta-section', 
        { opacity: 0, scale: 0.95 }, 
        { opacity: 1, scale: 1, duration: 1, ease: 'power3.out' }
      );
    }
  }, [ctaInView]);

  // Rotate background image
  useEffect(() => {
    const intervalId = setInterval(() => {
      setCurrentImageIndex(prevIndex => (prevIndex + 1) % backgroundImages.length);
    }, 5000);
    return () => clearInterval(intervalId);
  }, []);

  // Animate background fade
  useEffect(() => {
    bgRefs.current.forEach((el, index) => {
      if (el) {
        gsap.to(el, {
          opacity: index === currentImageIndex ? 1 : 0,
          duration: 1.5,
          ease: 'power2.inOut'
        });
      }
    });
  }, [currentImageIndex]);

  const animatedText = "Build custom pallets, request quotations, and visualize your designs with ease.".split(' ').map((word, idx) => (
    <span key={idx} className="animated-word" style={{ display: 'inline-block', marginRight: '6px' }}>{word}</span>
  ));

  return (
    <>
    <div
        className="hero-section text-light"
      style={{
        position: 'relative',
        overflow: 'hidden',
        minHeight: '100vh',
      }}
    >
      {/* Background Slideshow */}
      {backgroundImages.map((image, index) => (
        <div
          key={index}
          ref={el => bgRefs.current[index] = el}
          style={{
            backgroundImage: `url(${image})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            opacity: 0,
          }}
        />
      ))}

      {/* Dark overlay */}
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        background: 'linear-gradient(to bottom right, rgba(0,0,0,0.4), rgba(0,0,0,0.4))',
        zIndex: 1
      }} />

      {/* Main Content */}
        <div className="text-center" style={{
          position: 'absolute',
          width: '100%',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          zIndex: 2
        }}>
        <h1
          ref={headingRef}
            className="fw-bolder display-3 text-uppercase mb-4"
            style={{ textShadow: '2px 2px 10px rgba(0, 0, 0, 0.9)', letterSpacing: '3px' }}
        >
          <span className="text-warning">SARAVANA</span> TIMBERS
        </h1>

        <p
          ref={subTextRef}
          className="fs-5 mt-3 mx-auto px-3"
          style={{
            maxWidth: '650px',
              color: '#fff',
              textShadow: '1px 1px 8px rgba(0, 0, 0, 0.8)',
            lineHeight: '1.6'
          }}
        >
          {user && user.roles && user.roles.includes('ROLE_ADMIN') ? 'Welcome, Admin. Manage users, orders, and business insights from your dashboard.' : animatedText}
        </p>

        <div className="mt-5" ref={buttonRef}>
            <RippleButton
              className="btn btn-warning btn-lg px-5 py-3 shadow fw-bold text-dark d-inline-flex align-items-center"
              onClick={() => {
                if (user && user.roles && user.roles.includes('ROLE_ADMIN')) {
                  navigate('/admin/dashboard');
                } else if (user) {
                  navigate('/quotation');
                } else {
                  navigate('/login');
                }
              }}
            >
              Get Started <FaArrowRight className="ms-2" />
            </RippleButton>
          </div>
        </div>
      </div>

      {/* Only show these sections if not admin */}
      {!(user && user.roles && user.roles.includes('ROLE_ADMIN')) && (
        <>
      {/* Advanced Tools Section */}
      <section ref={toolsRef} className="advanced-tools-section bg-dark text-light py-5">
        <div className="container">
          <div className="text-center mb-5">
            <h2 className="fw-bold display-5"><span className="text-warning">Advanced</span> Tools</h2>
            <p className="text-muted">Cutting-edge technology for precision pallet manufacturing</p>
          </div>
          <div className="row g-4">
            {/* Custom Builder */}
            <div className="col-md-3">
              <div className="tool-card h-100 p-4 rounded text-center">
                <FaWrench className="display-4 text-warning mb-3" />
                <h4 className="fw-semibold">Custom Builder</h4>
                <p className="small">Design pallets with precise dimensions and specifications</p>
                <Link to="/builder" className="text-warning text-decoration-none fw-semibold">Explore →</Link>
              </div>
            </div>
            {/* Instant Quotation */}
            <div className="col-md-3">
              <div className="tool-card h-100 p-4 rounded text-center">
                <FaFileInvoiceDollar className="display-4 text-warning mb-3" />
                <h4 className="fw-semibold">Instant Quotation</h4>
                <p className="small">Get real-time pricing for your custom pallet designs</p>
                <Link to="/quotation" className="text-warning text-decoration-none fw-semibold">Explore →</Link>
              </div>
            </div>
            {/* Product Catalogue */}
            <div className="col-md-3">
              <div className="tool-card h-100 p-4 rounded text-center">
                <FaBookOpen className="display-4 text-warning mb-3" />
                <h4 className="fw-semibold">Product Catalogue</h4>
                <p className="small">Browse our extensive range of standard pallet designs</p>
                <Link to="/catalogue" className="text-warning text-decoration-none fw-semibold">Explore →</Link>
              </div>
            </div>
            {/* 3D Simulator */}
            <div className="col-md-3">
              <div className="tool-card h-100 p-4 rounded text-center">
                <FaCube className="display-4 text-warning mb-3" />
                <h4 className="fw-semibold">3D Simulator</h4>
                <p className="small">Visualize your pallets in interactive 3D environment</p>
                <Link to="/simulator" className="text-warning text-decoration-none fw-semibold">Explore →</Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section ref={statsRef} className="stats-section bg-dark text-light py-5">
        <div className="container">
          <div className="row text-center">
            <div className="col-md-3 stat-item">
              <h3 className="display-4 fw-bold stat-number" data-val="1000000">0+</h3>
              <p className="text-muted">Pallets Manufactured</p>
            </div>
            <div className="col-md-3 stat-item">
              <h3 className="display-4 fw-bold stat-number" data-val="500">0</h3>
              <p className="text-muted">Happy Customers</p>
            </div>
            <div className="col-md-3 stat-item">
              <h3 className="display-4 fw-bold stat-number" data-val="35">0+</h3>
              <p className="text-muted">Years Experience</p>
            </div>
            <div className="col-md-3 stat-item">
              <h3 className="display-4 fw-bold stat-number" data-val="24/7">0</h3>
              <p className="text-muted">Customer Support</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section ref={ctaRef} className="cta-section bg-warning text-dark py-5">
        <div className="container text-center">
          <h2 className="fw-bold">Ready to Build Your Perfect Pallet?</h2>
          <p>Start designing with our advanced tools and get instant pricing</p>
          <div className="mt-4">
                <RippleButton className="btn btn-dark btn-lg px-5 py-3 shadow fw-semibold me-3" onClick={() => navigate('/pallet-builder')}>
                Start Building
            </RippleButton>
            <RippleButton className="btn btn-light btn-lg px-5 py-3 shadow fw-semibold">
              <Link to="/quotation" className="text-dark text-decoration-none">
                Get Quote
              </Link>
            </RippleButton>
          </div>
        </div>
      </section>

      <Chatbot />
        </>
      )}
    </>
  );
}

export default Home;
