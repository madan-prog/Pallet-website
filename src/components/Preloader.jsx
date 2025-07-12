import { useEffect, useRef } from 'react';
import gsap from 'gsap';

const Preloader = ({ size = 60, fullscreen = true, style = {} }) => {
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

  const wrapperStyle = fullscreen
    ? {
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        backgroundColor: '#111',
        position: 'fixed',
        width: '100%',
        zIndex: 9999,
        top: 0,
        left: 0,
        ...style,
      }
    : {
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        width: '100%',
        minHeight: size + 20,
        background: 'none',
        ...style,
      };

  return (
    <div style={wrapperStyle}>
      <div
        ref={loaderRef}
        style={{
          width: size,
          height: size,
          borderRadius: '50%',
          border: `${Math.max(4, Math.floor(size / 10))}px solid #ffc107`,
          borderTop: `${Math.max(4, Math.floor(size / 10))}px solid transparent`,
        }}
      />
    </div>
  );
};

export default Preloader;