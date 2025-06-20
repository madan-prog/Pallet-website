import { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import gsap from 'gsap';
import RippleButton from '../components/RippleButton';
import Chatbot from '../components/Chatbot';
import "../App.css";

function Home() {
  const headingRef = useRef();
  const subTextRef = useRef();
  const buttonRef = useRef();

  useEffect(() => {
    gsap.fromTo(headingRef.current, { opacity: 0, scale: 0.9 }, { opacity: 1, scale: 1, duration: 1, ease: 'power3.out' });
    // Animate each word in the subtext
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

  const animatedText = "Build custom pallets, request quotations, and visualize your designs with ease.".split(' ').map((word, idx) => (
    <span key={idx} className="animated-word" style={{ display: 'inline-block', marginRight: '6px' }}>{word}</span>
  ));

  return (
    <div
      className="hero-section text-light d-flex align-items-center justify-content-center"
      style={{
        backgroundImage: 'url("/images/pallet-bg.png")',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        position: 'relative',
        overflow: 'hidden',
        minHeight: '100vh',
      }}
    >
      {/* Overlay */}
      <div style={{
        position: 'absolute',
        inset: 0,
        background: 'linear-gradient(to bottom right, rgba(0,0,0,0.40), rgba(0,0,0,0.40))',
        zIndex: 1
      }} />

      {/* Content */}
      <div className="text-center position-relative" style={{ zIndex: 2 }}>
        <h1
          ref={headingRef}
          className="fw-bold display-3 text-uppercase mb-4"
          style={{ textShadow: '2px 2px 8px rgba(0, 0, 0, 0.8)', letterSpacing: '2px' }}
        >
          <span className="text-warning">SARAVANA</span> TIMBERS
        </h1>

        <p
          ref={subTextRef}
          className="fs-5 mt-3 mx-auto px-3"
          style={{
            maxWidth: '650px',
            color: 'rgba(255,255,255,0.9)',
            textShadow: '1px 1px 6px rgba(0, 0, 0, 0.6)',
            lineHeight: '1.6'
          }}
        >
          {animatedText}
        </p>

        <div className="mt-5" ref={buttonRef}>
          <RippleButton className="btn btn-warning btn-lg px-5 py-3 shadow fw-semibold">
            <Link to="/builder" className="text-dark text-decoration-none">
              Get Started
            </Link>
          </RippleButton>
        </div>
      </div>
      <Chatbot />
    </div>
  );
}

export default Home;
