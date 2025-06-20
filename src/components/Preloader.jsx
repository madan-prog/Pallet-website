import { useEffect, useRef } from 'react';
import gsap from 'gsap';

const Preloader = () => {
  const loaderRef = useRef(null);

  useEffect(() => {
    gsap.fromTo(
      loaderRef.current,
      { scale: 0, opacity: 0 },
      { scale: 1, opacity: 1, duration: 1.2, ease: 'back.out(1.7)' }
    );

    gsap.to(loaderRef.current, {
      rotation: 360,
      duration: 1.4,
      repeat: -1,
      ease: 'linear'
    });
  }, []);

  return (
    <div className="d-flex justify-content-center align-items-center" style={{ height: '100vh', backgroundColor: '#111', position: 'fixed', width: '100%', zIndex: 9999 }}>
      <div
        ref={loaderRef}
        style={{
          width: '60px',
          height: '60px',
          borderRadius: '50%',
          border: '6px solid #ffc107',
          borderTop: '6px solid transparent',
        }}
      />
    </div>
  );
};

export default Preloader;