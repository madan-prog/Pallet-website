import React from 'react';
import './RippleButton.css'; // Step 2: create this CSS

const RippleButton = ({ children, className = '', onClick, ...props }) => {
  const handleClick = (e) => {
    const btn = e.currentTarget;
    const x = e.nativeEvent.offsetX;
    const y = e.nativeEvent.offsetY;
    btn.style.setProperty('--x', `${x}px`);
    btn.style.setProperty('--y', `${y}px`);
    onClick?.(e); // Call parent onClick if exists
  };

  return (
    <button
      {...props}
      onClick={handleClick}
      className={`ripple-btn ${className}`}
    >
      {children}
    </button>
  );
};

export default RippleButton;
