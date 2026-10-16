import React, { useState } from 'react';
import {
  LogIn,
  User,
  Lock,
  Eye,
  EyeOff,
  AlertCircle,
  ShieldCheck,
  Utensils,
  WalletCards,
  Sun,
  Moon,
  Sparkles,
  ArrowRight
} from 'lucide-react';
import { TEST_USERS, ROLE_PERMISSIONS, authenticateUser } from '../data/authData';

export function LoginView({ onLogin, theme, onToggleTheme }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    setErrorMessage('');

    const res = authenticateUser(username, password);
    if (!res.success) {
      setErrorMessage(res.error);
      return;
    }

    onLogin(res.user);
  };

  const handleQuickLogin = (testUser) => {
    setUsername(testUser.username);
    setPassword(testUser.password);
    setErrorMessage('');
    onLogin(testUser);
  };

  const handleFillCredentials = (testUser) => {
    setUsername(testUser.username);
    setPassword(testUser.password);
    setErrorMessage('');
  };

  const getRoleIcon = (role) => {
    switch (role) {
      case 'Administrador':
        return ShieldCheck;
      case 'Mesero':
        return Utensils;
      case 'Cajero':
        return WalletCards;
      default:
        return User;
    }
  };

  return (
    <div className="login-wrapper">
      {/* Barra superior con selector de tema */}
      <div className="login-topbar">
        <div className="login-topbar-brand">
          <span className="brand-logo-mini">🍲</span>
          <span className="brand-name-mini">Sabores Bolivianos</span>
        </div>
        <button
          type="button"
          className="theme-toggle"
          onClick={onToggleTheme}
          title={theme === 'dark' ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'}
          aria-label="Alternar tema de color"
        >
          {theme === 'dark' ? (
            <>
              <Sun size={16} color="var(--gold)" />
              <span>Modo claro</span>
            </>
          ) : (
            <>
              <Moon size={16} color="var(--pri)" />
              <span>Modo oscuro</span>
            </>
          )}
        </button>
      </div>

      <div className="login-container">
        {/* Tarjeta principal de Login */}
        <div className="login-card">
          <div className="login-header">
            <div className="login-badge-location">
              <span>Cochabamba · Bolivia</span>
            </div>
            <div className="login-logo-circle">
              <span>🍲</span>
            </div>
            <h1 className="login-title">Sabores Bolivianos</h1>
            <p className="login-subtitle">
              Sistema de Gestión Gastronómica · Control de Acceso por Roles
            </p>
            <div className="band login-band" />
          </div>

          {errorMessage && (
            <div className="login-error-alert" role="alert">
              <AlertCircle size={18} />
              <span>{errorMessage}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="login-form">
            <div className="form-group">
              <label htmlFor="login-username">Usuario</label>
              <div className="input-with-icon">
                <User size={18} className="input-icon" />
                <input
                  id="login-username"
                  type="text"
                  placeholder="Ej: admin, mesero o cajero"
                  value={username}
                  onChange={(e) => {
                    setUsername(e.target.value);
                    if (errorMessage) setErrorMessage('');
                  }}
                  autoFocus
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="login-password">Contraseña</label>
              <div className="input-with-icon">
                <Lock size={18} className="input-icon" />
                <input
                  id="login-password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Contraseña de prueba: 123"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (errorMessage) setErrorMessage('');
                  }}
                  required
                />
                <button
                  type="button"
                  className="password-toggle-btn"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? 'Ocultar contraseña' : 'Ver contraseña'}
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <button type="submit" className="login-submit-btn">
              <LogIn size={18} />
              <span>Iniciar Sesión</span>
            </button>
          </form>

          {/* Sección de Cuentas de Prueba */}
          <div className="login-demo-section">
            <div className="demo-section-header">
              <Sparkles size={16} color="var(--gold)" />
              <span>Cuentas de prueba (Acceso rápido en 1 clic)</span>
            </div>
            <p className="demo-section-desc">
              Selecciona un perfil para ingresar directamente y probar los permisos de cada rol en el menú:
            </p>

            <div className="demo-users-grid">
              {TEST_USERS.map((usr) => {
                const RoleIcon = getRoleIcon(usr.role);
                const roleConfig = ROLE_PERMISSIONS[usr.role];

                return (
                  <div key={usr.id} className="demo-user-card">
                    <div className="demo-user-header">
                      <div className="demo-user-avatar">
                        <span>{usr.avatar}</span>
                      </div>
                      <div className="demo-user-info">
                        <div className="demo-user-name">{usr.name}</div>
                        <span className={`role-badge ${roleConfig.badgeClass}`}>
                          <RoleIcon size={12} />
                          {usr.role}
                        </span>
                      </div>
                    </div>

                    <p className="demo-user-summary">
                      {roleConfig.description}
                    </p>

                    <div className="demo-user-meta">
                      <div className="demo-user-cred">
                        <code>{usr.username}</code> / <code>{usr.password}</code>
                      </div>
                      <span className="demo-user-modules">
                        {roleConfig.allowedTabs.length} módulos
                      </span>
                    </div>

                    <div className="demo-user-actions">
                      <button
                        type="button"
                        className="demo-btn-fill"
                        onClick={() => handleFillCredentials(usr)}
                        title="Completar en el formulario"
                      >
                        Rellenar
                      </button>
                      <button
                        type="button"
                        className="demo-btn-login"
                        onClick={() => handleQuickLogin(usr)}
                        title={`Ingresar inmediatamente como ${usr.role}`}
                      >
                        <span>Ingresar</span>
                        <ArrowRight size={14} />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
