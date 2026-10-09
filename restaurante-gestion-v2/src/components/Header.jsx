import React from 'react';
import { Sun, Moon, UtensilsCrossed } from 'lucide-react';

export function Header({ theme, onToggleTheme }) {
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
      <div className="band" />
    </header>
  );
}