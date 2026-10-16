import React from 'react';
import {
  Sun,
  Moon,
  UtensilsCrossed,
  LogOut,
  ShieldCheck,
  Utensils,
  WalletCards,
  User
} from 'lucide-react';
import { ROLE_PERMISSIONS } from '../data/authData';

export function Header({ theme, onToggleTheme, currentUser, onLogout }) {
  const roleConfig = currentUser ? ROLE_PERMISSIONS[currentUser.role] : null;

  const renderRoleIcon = () => {
    if (!currentUser) return <User size={13} />;
    switch (currentUser.role) {
      case 'Administrador':
        return <ShieldCheck size={13} />;
      case 'Mesero':
        return <Utensils size={13} />;
      case 'Cajero':
        return <WalletCards size={13} />;
      default:
        return <User size={13} />;
    }
  };

  return (
    <header className="app-header">
      <div className="header-top">
        <div className="brand">
          <span className="brand-logo" aria-hidden="true">🍲</span>
          <div>
            <span className="brand-badge">
              <UtensilsCrossed size={14} /> Cochabamba · Bolivia
            </span>
            <h1 className="brand-title">Sabores Bolivianos</h1>
            <div className="brand-subtitle">
              Comida típica boliviana · Sistema de gestión del restaurante
            </div>
          </div>
        </div>

        <div className="header-actions">
          {currentUser && (
            <div className="user-session-pill">
              <div className="user-avatar-badge">{currentUser.avatar || '👤'}</div>
              <div className="user-details">
                <span className="user-name">{currentUser.name}</span>
                <span className={`role-badge ${roleConfig?.badgeClass || 'role-badge-admin'}`}>
                  {renderRoleIcon()}
                  <span>{currentUser.role}</span>
                </span>
              </div>
              <button
                type="button"
                className="logout-button"
                onClick={onLogout}
                title="Cerrar sesión"
                aria-label="Cerrar sesión"
              >
                <LogOut size={15} />
                <span className="logout-text">Cerrar sesión</span>
              </button>
            </div>
          )}

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
      </div>
      <div className="band" />
    </header>
  );
}