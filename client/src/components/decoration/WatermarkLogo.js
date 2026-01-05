import React from 'react';
import icLogo from '../../assets/img/ic_logo.png';

const WatermarkLogo = () => (
  <div
    style={{
      position: 'fixed',
      left: '1rem',
      top: '1rem',
      zIndex: '-1',
      pointerEvents: 'none',
      opacity: 0.15,
    }}
  >
    <img
      src={icLogo}
      alt="IC poker"
      style={{
        width: '200px',
        maxWidth: '25vw',
        height: 'auto',
        display: 'block',
      }}
    />
  </div>
);

export default WatermarkLogo;
