import React from 'react';
import { Outlet } from 'react-router-dom';
import WeavoThreads from '../components/WeavoThreads';
import Logo from '../components/Logo';

const AuthLayout = () => (
  <div
    className="min-h-screen relative overflow-hidden flex items-center justify-center px-4 py-12"
    style={{ background: '#080B14' }}
  >
    {/* Weavo thread animation — lives behind the card */}
    <WeavoThreads />

    {/* Card */}
    <div className="relative w-full max-w-md" style={{ zIndex: 10 }}>
      {/* Logo */}
      <div className="text-center mb-8">
        <Logo iconSize={32} fontSize={20} />
      </div>

      {/* Glass card — low opacity background so backdrop-filter blur is visible */}
      <div
        className="glass p-8"
        style={{
          // increase blur and saturation for a stronger glass effect
          backdropFilter: 'blur(20px) saturate(220%)',
          WebkitBackdropFilter: 'blur(20px) saturate(220%)',
          // make background more transparent so the backdrop blur is more visible
          background: 'rgba(12, 8, 24, 0.02)',
          // slightly subtler inner highlight so the card reads as more translucent
          boxShadow: '0 28px 70px rgba(0,0,0,0.45), inset 0 1px 0 rgba(255,255,255,0.04)',
          border: '1px solid rgba(255,255,255,0.035)'
        }}
      >
        <Outlet />
      </div>

      <p
        className="text-center text-xs mt-5"
        style={{ color: 'rgba(255,255,255,0.18)' }}
      >
        Intelligent scheduling for modern service businesses
      </p>
    </div>
  </div>
);

export default AuthLayout;
