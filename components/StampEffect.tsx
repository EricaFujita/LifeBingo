
import React from 'react';
import { StampIcon } from '../constants';

export const StampEffect: React.FC = () => {
  return (
    <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10 transform rotate-12 scale-90" style={{ color: 'var(--primary)' }}>
      <StampIcon />
    </div>
  );
};
