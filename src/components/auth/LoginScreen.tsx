'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Signal, Eye, EyeOff, Lock, User, ArrowRight, Shield,
  ArrowLeft, HelpCircle, CheckCircle2, KeyRound
} from 'lucide-react';

interface LoginScreenProps {
  onLogin: () => void;
}

type AuthMode = 'login' | 'register' | 'recover-step1' | 'recover-step2' | 'success';

const SECURITY_QUESTIONS = [
  '¿Cuál es el nombre de tu primera mascota?',
  '¿En qué ciudad naciste?',
  '¿Cuál es el nombre de tu escuela primaria?',
  '¿Cuál es tu comida favorita?',
  '¿Cuál es el nombre de tu mejor amigo de la infancia?',
];

export default function LoginScreen({ onLogin }: LoginScreenProps) {
  const [mode, setMode] = useState<AuthMode>('login');
  
  // Form fields
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [recoveryQuestion, setRecoveryQuestion] = useState(SECURITY_QUESTIONS[0]);
  const [recoveryAnswer, setRecoveryAnswer] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  
  // Security question fetched during recovery
  const [fetchedQuestion, setFetchedQuestion] = useState('');

  // UI state
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmNewPassword, setShowConfirmNewPassword] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Clear fields and error when switching modes
  const handleSwitchMode = (newMode: AuthMode) => {
    setError('');
    setSuccessMessage('');
    setUsername('');
    setPassword('');
    setConfirmPassword('');
    setRecoveryAnswer('');
    setNewPassword('');
    setConfirmNewPassword('');
    setShowPassword(false);
    setShowConfirmPassword(false);
    setShowNewPassword(false);
    setShowConfirmNewPassword(false);
    setMode(newMode);
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Usuario o contraseña incorrectos');
      }

      // Success animation delay
      await new Promise((r) => setTimeout(r, 300));
      localStorage.setItem('sim-manager-auth', 'true');
      onLogin();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al iniciar sesión');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      setError('Las contraseñas no coinciden');
      return;
    }

    if (!recoveryAnswer.trim()) {
      setError('La respuesta de seguridad es requerida');
      return;
    }

    setIsLoading(true);

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username,
          password,
          recoveryQuestion,
          recoveryAnswer,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Error al crear la cuenta');
      }

      setSuccessMessage('¡Cuenta creada con éxito! Ahora puedes iniciar sesión.');
      setMode('success');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al registrar usuario');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRecoverStep1 = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const res = await fetch(`/api/auth/recover?username=${encodeURIComponent(username)}`);
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Usuario no encontrado');
      }

      setFetchedQuestion(data.recoveryQuestion);
      setMode('recover-step2');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al buscar el usuario');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRecoverStep2 = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (newPassword !== confirmNewPassword) {
      setError('Las contraseñas no coinciden');
      return;
    }

    setIsLoading(true);

    try {
      const res = await fetch('/api/auth/recover', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username,
          recoveryAnswer,
          newPassword,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Respuesta incorrecta o error al restablecer');
      }

      setSuccessMessage('Tu contraseña ha sido restablecida. Inicia sesión con la nueva contraseña.');
      setMode('success');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al restablecer la contraseña');
    } finally {
      setIsLoading(false);
    }
  };

  const formVariants = {
    hidden: { opacity: 0, x: 20 },
    visible: { opacity: 1, x: 0, transition: { duration: 0.3, ease: 'easeOut' as any } },
    exit: { opacity: 0, x: -20, transition: { duration: 0.2, ease: 'easeIn' as any } }
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
            <h1>Gestor de SIMs PRO V1</h1>
            <span>Pro · Inventario</span>
          </div>
        </motion.div>

        {/* Dynamic Card Content */}
        <AnimatePresence mode="wait">
          {mode === 'login' && (
            <motion.div
              key="login"
              initial="hidden"
              animate="visible"
              exit="exit"
              variants={formVariants}
            >
              <p className="login-subtitle">
                Inicia sesión para gestionar tu inventario de dispositivos, SIMs y cuentas digitales.
              </p>

              <form onSubmit={handleLogin} className="login-form">
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

                {/* Recovery / Forgot link */}
                <div className="flex justify-end -mt-2">
                  <button
                    type="button"
                    onClick={() => handleSwitchMode('recover-step1')}
                    className="text-xs text-indigo-400 hover:text-indigo-300 transition-colors cursor-pointer"
                  >
                    ¿Olvidaste tu contraseña?
                  </button>
                </div>

                {/* Error */}
                {error && (
                  <motion.div
                    className="login-error"
                    initial={{ opacity: 0, y: -5, height: 0 }}
                    animate={{ opacity: 1, y: 0, height: 'auto' }}
                  >
                    <Shield size={13} />
                    {error}
                  </motion.div>
                )}

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

                {/* Switch to Register */}
                <div className="text-center mt-3">
                  <p className="text-xs text-zinc-500">
                    ¿No tienes una cuenta?{' '}
                    <button
                      type="button"
                      onClick={() => handleSwitchMode('register')}
                      className="text-indigo-400 hover:text-indigo-300 font-semibold cursor-pointer"
                    >
                      Regístrate
                    </button>
                  </p>
                </div>
              </form>
            </motion.div>
          )}

          {mode === 'register' && (
            <motion.div
              key="register"
              initial="hidden"
              animate="visible"
              exit="exit"
              variants={formVariants}
            >
              <div className="flex items-center gap-2 mb-2">
                <button
                  type="button"
                  onClick={() => handleSwitchMode('login')}
                  className="text-zinc-500 hover:text-white transition-colors cursor-pointer p-1"
                >
                  <ArrowLeft size={16} />
                </button>
                <h2 className="text-base font-bold text-white">Crear Cuenta</h2>
              </div>
              <p className="login-subtitle mb-4">
                Regístrate para crear tu cuenta de acceso a la base de datos de inventario.
              </p>

              <form onSubmit={handleRegister} className="login-form">
                {/* Username */}
                <div className="login-field">
                  <label htmlFor="reg-username">
                    <User size={13} />
                    Usuario
                  </label>
                  <div className="login-input-wrap">
                    <input
                      id="reg-username"
                      type="text"
                      value={username}
                      onChange={(e) => { setUsername(e.target.value); setError(''); }}
                      placeholder="Crea un nombre de usuario"
                      required
                    />
                  </div>
                </div>

                {/* Password */}
                <div className="login-field">
                  <label htmlFor="reg-password">
                    <Lock size={13} />
                    Contraseña
                  </label>
                  <div className="login-input-wrap">
                    <input
                      id="reg-password"
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => { setPassword(e.target.value); setError(''); }}
                      placeholder="Mínimo 6 caracteres"
                      minLength={6}
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

                {/* Confirm Password */}
                <div className="login-field">
                  <label htmlFor="reg-confirm-password">
                    <Lock size={13} />
                    Confirmar Contraseña
                  </label>
                  <div className="login-input-wrap">
                    <input
                      id="reg-confirm-password"
                      type={showConfirmPassword ? 'text' : 'password'}
                      value={confirmPassword}
                      onChange={(e) => { setConfirmPassword(e.target.value); setError(''); }}
                      placeholder="Repite tu contraseña"
                      required
                    />
                    <button
                      type="button"
                      className="login-eye"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      tabIndex={-1}
                    >
                      {showConfirmPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                    </button>
                  </div>
                </div>

                {/* Security Question */}
                <div className="login-field">
                  <label htmlFor="reg-question">
                    <HelpCircle size={13} />
                    Pregunta de Seguridad (Recuperación)
                  </label>
                  <div className="login-input-wrap">
                    <select
                      id="reg-question"
                      value={recoveryQuestion}
                      onChange={(e) => setRecoveryQuestion(e.target.value)}
                      className="w-full bg-zinc-900/60 border border-zinc-800 rounded-xl p-3 text-sm text-white focus:border-indigo-500/50 outline-none transition-colors"
                      required
                    >
                      {SECURITY_QUESTIONS.map((q) => (
                        <option key={q} value={q} className="bg-zinc-950 text-white">
                          {q}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Security Answer */}
                <div className="login-field">
                  <label htmlFor="reg-answer">
                    <Shield size={13} />
                    Respuesta de Seguridad
                  </label>
                  <div className="login-input-wrap">
                    <input
                      id="reg-answer"
                      type="text"
                      value={recoveryAnswer}
                      onChange={(e) => { setRecoveryAnswer(e.target.value); setError(''); }}
                      placeholder="Respuesta sensible a mayúsculas"
                      required
                    />
                  </div>
                </div>

                {/* Error */}
                {error && (
                  <motion.div
                    className="login-error"
                    initial={{ opacity: 0, y: -5, height: 0 }}
                    animate={{ opacity: 1, y: 0, height: 'auto' }}
                  >
                    <Shield size={13} />
                    {error}
                  </motion.div>
                )}

                {/* Submit */}
                <button
                  type="submit"
                  className="login-submit"
                  disabled={isLoading || !username || !password || !confirmPassword || !recoveryAnswer}
                >
                  {isLoading ? (
                    <div className="login-spinner" />
                  ) : (
                    <>
                      Registrar Cuenta
                      <ArrowRight size={16} />
                    </>
                  )}
                </button>
              </form>
            </motion.div>
          )}

          {mode === 'recover-step1' && (
            <motion.div
              key="recover-step1"
              initial="hidden"
              animate="visible"
              exit="exit"
              variants={formVariants}
            >
              <div className="flex items-center gap-2 mb-2">
                <button
                  type="button"
                  onClick={() => handleSwitchMode('login')}
                  className="text-zinc-500 hover:text-white transition-colors cursor-pointer p-1"
                >
                  <ArrowLeft size={16} />
                </button>
                <h2 className="text-base font-bold text-white">Recuperar Contraseña</h2>
              </div>
              <p className="login-subtitle mb-4">
                Ingresa tu nombre de usuario para obtener tu pregunta de seguridad.
              </p>

              <form onSubmit={handleRecoverStep1} className="login-form">
                {/* Username */}
                <div className="login-field">
                  <label htmlFor="recover-username">
                    <User size={13} />
                    Usuario
                  </label>
                  <div className="login-input-wrap">
                    <input
                      id="recover-username"
                      type="text"
                      value={username}
                      onChange={(e) => { setUsername(e.target.value); setError(''); }}
                      placeholder="Nombre de tu usuario"
                      autoFocus
                      required
                    />
                  </div>
                </div>

                {/* Error */}
                {error && (
                  <motion.div
                    className="login-error"
                    initial={{ opacity: 0, y: -5, height: 0 }}
                    animate={{ opacity: 1, y: 0, height: 'auto' }}
                  >
                    <Shield size={13} />
                    {error}
                  </motion.div>
                )}

                {/* Submit */}
                <button
                  type="submit"
                  className="login-submit"
                  disabled={isLoading || !username}
                >
                  {isLoading ? (
                    <div className="login-spinner" />
                  ) : (
                    <>
                      Obtener Pregunta
                      <ArrowRight size={16} />
                    </>
                  )}
                </button>
              </form>
            </motion.div>
          )}

          {mode === 'recover-step2' && (
            <motion.div
              key="recover-step2"
              initial="hidden"
              animate="visible"
              exit="exit"
              variants={formVariants}
            >
              <div className="flex items-center gap-2 mb-2">
                <button
                  type="button"
                  onClick={() => handleSwitchMode('recover-step1')}
                  className="text-zinc-500 hover:text-white transition-colors cursor-pointer p-1"
                >
                  <ArrowLeft size={16} />
                </button>
                <h2 className="text-base font-bold text-white">Pregunta de Seguridad</h2>
              </div>
              
              <div className="mb-4 p-3.5 bg-indigo-500/10 border border-indigo-500/20 rounded-2xl flex gap-2.5 items-start">
                <HelpCircle size={18} className="text-indigo-400 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-[11px] text-indigo-400 font-semibold uppercase tracking-wider">Pregunta de {username}</p>
                  <p className="text-sm text-white font-medium mt-0.5">{fetchedQuestion}</p>
                </div>
              </div>

              <form onSubmit={handleRecoverStep2} className="login-form">
                {/* Security Answer */}
                <div className="login-field">
                  <label htmlFor="recover-answer">
                    <Shield size={13} />
                    Tu Respuesta
                  </label>
                  <div className="login-input-wrap">
                    <input
                      id="recover-answer"
                      type="text"
                      value={recoveryAnswer}
                      onChange={(e) => { setRecoveryAnswer(e.target.value); setError(''); }}
                      placeholder="Ingresa la respuesta"
                      autoFocus
                      required
                    />
                  </div>
                </div>

                {/* New Password */}
                <div className="login-field">
                  <label htmlFor="new-password">
                    <KeyRound size={13} />
                    Nueva Contraseña
                  </label>
                  <div className="login-input-wrap">
                    <input
                      id="new-password"
                      type={showNewPassword ? 'text' : 'password'}
                      value={newPassword}
                      onChange={(e) => { setNewPassword(e.target.value); setError(''); }}
                      placeholder="Mínimo 6 caracteres"
                      minLength={6}
                      required
                    />
                    <button
                      type="button"
                      className="login-eye"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                      tabIndex={-1}
                    >
                      {showNewPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                    </button>
                  </div>
                </div>

                {/* Confirm New Password */}
                <div className="login-field">
                  <label htmlFor="confirm-new-password">
                    <Lock size={13} />
                    Confirmar Nueva Contraseña
                  </label>
                  <div className="login-input-wrap">
                    <input
                      id="confirm-new-password"
                      type={showConfirmNewPassword ? 'text' : 'password'}
                      value={confirmNewPassword}
                      onChange={(e) => { setConfirmNewPassword(e.target.value); setError(''); }}
                      placeholder="Repite tu contraseña"
                      required
                    />
                    <button
                      type="button"
                      className="login-eye"
                      onClick={() => setShowConfirmNewPassword(!showConfirmNewPassword)}
                      tabIndex={-1}
                    >
                      {showConfirmNewPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                    </button>
                  </div>
                </div>

                {/* Error */}
                {error && (
                  <motion.div
                    className="login-error"
                    initial={{ opacity: 0, y: -5, height: 0 }}
                    animate={{ opacity: 1, y: 0, height: 'auto' }}
                  >
                    <Shield size={13} />
                    {error}
                  </motion.div>
                )}

                {/* Submit */}
                <button
                  type="submit"
                  className="login-submit"
                  disabled={isLoading || !recoveryAnswer || !newPassword || !confirmNewPassword}
                >
                  {isLoading ? (
                    <div className="login-spinner" />
                  ) : (
                    <>
                      Restablecer Contraseña
                      <ArrowRight size={16} />
                    </>
                  )}
                </button>
              </form>
            </motion.div>
          )}

          {mode === 'success' && (
            <motion.div
              key="success"
              initial="hidden"
              animate="visible"
              exit="exit"
              variants={formVariants}
              className="text-center py-4 flex flex-col items-center"
            >
              <div className="h-16 w-16 bg-emerald-500/10 border border-emerald-500/25 rounded-2xl flex items-center justify-center text-emerald-400 mb-4 animate-drop">
                <CheckCircle2 size={32} />
              </div>
              <h2 className="text-lg font-bold text-white mb-2">¡Operación Exitosa!</h2>
              <p className="text-xs text-zinc-400 leading-relaxed mb-6 px-2">
                {successMessage}
              </p>

              <button
                type="button"
                onClick={() => handleSwitchMode('login')}
                className="login-submit"
              >
                Volver a Iniciar Sesión
                <ArrowRight size={16} />
              </button>
            </motion.div>
          )}
        </AnimatePresence>

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
