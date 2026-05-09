'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Signal, Eye, EyeOff, Lock, User, ArrowRight, Shield, Smartphone } from 'lucide-react';

interface LoginScreenProps {
  onLogin: () => void;
}

export default function LoginScreen({ onLogin }: LoginScreenProps) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    // Simulate network delay for feel
    await new Promise((r) => setTimeout(r, 800));

    // Simple client-side auth — replace with real API call
    if (username === 'admin' && password === 'admin123') {
      // Success animation delay
      await new Promise((r) => setTimeout(r, 300));
      localStorage.setItem('sim-manager-auth', 'true');
      onLogin();
    } else {
      setError('Usuario o contraseña incorrectos');
      setIsLoading(false);
    }
  };

  return (
    <div className="login-container">
      {/* Animated gradient orbs */}
      <div className="login-bg">
        <div className="orb orb-1" />
        <div className="orb orb-2" />
        <div className="orb orb-3" />
        <div className="orb orb-4" />
        <div className="grid-overlay" />
      </div>

      {/* Floating phone mockups in background */}
      <AnimatePresence>
        {mounted && (
          <>
            <motion.div
              className="floating-phone floating-phone-1"
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, duration: 1, ease: 'easeOut' }}
            >
              <div className="mini-phone">
                <div className="mini-phone-screen">
                  <div className="mini-phone-island" />
                  <div className="mini-phone-content">
                    <div className="mini-sim-bar" style={{ background: 'linear-gradient(90deg, #3b82f6, #60a5fa)' }} />
                    <div className="mini-sim-bar" style={{ background: 'linear-gradient(90deg, #22c55e, #4ade80)', width: '70%' }} />
                    <div className="mini-sim-bar" style={{ background: 'linear-gradient(90deg, #a855f7, #c084fc)', width: '55%' }} />
                  </div>
                </div>
              </div>
            </motion.div>
            <motion.div
              className="floating-phone floating-phone-2"
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8, duration: 1, ease: 'easeOut' }}
            >
              <div className="mini-phone">
                <div className="mini-phone-screen">
                  <div className="mini-phone-island" />
                  <div className="mini-phone-content">
                    <div className="mini-sim-bar" style={{ background: 'linear-gradient(90deg, #f59e0b, #fbbf24)' }} />
                    <div className="mini-sim-bar" style={{ background: 'linear-gradient(90deg, #ef4444, #f87171)', width: '60%' }} />
                  </div>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Login card */}
      <motion.div
        className="login-card"
        initial={{ opacity: 0, y: 30, scale: 0.96 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      >
        {/* Logo */}
        <motion.div
          className="login-logo"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2, duration: 0.5 }}
        >
          <div className="login-logo-icon">
            <Signal size={22} className="text-white" />
            <div className="login-logo-pulse" />
          </div>
          <div className="login-logo-text">
            <h1>SIM Manager</h1>
            <span>Pro · Inventario</span>
          </div>
        </motion.div>

        {/* Subtitle */}
        <motion.p
          className="login-subtitle"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.35 }}
        >
          Inicia sesión para gestionar tu inventario de dispositivos, SIMs y cuentas digitales.
        </motion.p>

        {/* Form */}
        <motion.form
          onSubmit={handleSubmit}
          className="login-form"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
        >
          {/* Username */}
          <div className="login-field">
            <label htmlFor="login-username">
              <User size={13} />
              Usuario
            </label>
            <div className="login-input-wrap">
              <input
                id="login-username"
                type="text"
                value={username}
                onChange={(e) => { setUsername(e.target.value); setError(''); }}
                placeholder="Ingresa tu usuario"
                autoComplete="username"
                autoFocus
                required
              />
            </div>
          </div>

          {/* Password */}
          <div className="login-field">
            <label htmlFor="login-password">
              <Lock size={13} />
              Contraseña
            </label>
            <div className="login-input-wrap">
              <input
                id="login-password"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => { setPassword(e.target.value); setError(''); }}
                placeholder="••••••••"
                autoComplete="current-password"
                required
              />
              <button
                type="button"
                className="login-eye"
                onClick={() => setShowPassword(!showPassword)}
                tabIndex={-1}
              >
                {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            </div>
          </div>

          {/* Error */}
          <AnimatePresence>
            {error && (
              <motion.div
                className="login-error"
                initial={{ opacity: 0, y: -5, height: 0 }}
                animate={{ opacity: 1, y: 0, height: 'auto' }}
                exit={{ opacity: 0, y: -5, height: 0 }}
              >
                <Shield size={13} />
                {error}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Submit */}
          <button
            type="submit"
            className="login-submit"
            disabled={isLoading || !username || !password}
          >
            {isLoading ? (
              <div className="login-spinner" />
            ) : (
              <>
                Iniciar Sesión
                <ArrowRight size={16} />
              </>
            )}
          </button>
        </motion.form>

        {/* Footer hint */}
        <motion.div
          className="login-footer"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
        >
          <div className="login-footer-badge">
            <Shield size={11} />
            Acceso seguro · Datos encriptados
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
}
