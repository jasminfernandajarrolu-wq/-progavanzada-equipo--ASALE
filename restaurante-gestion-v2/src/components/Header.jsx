import React from 'react';
import { Sun, Moon, UtensilsCrossed } from 'lucide-react';

export function Header({ theme, onToggleTheme }) {
  return (
    <header>
      <div className="header-top">
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span className="brand-badge">
              <UtensilsCrossed size={14} /> Cochabamba · Bolivia
            </span>
          </div>
          <h1 style={{ fontSize: '28px', fontWeight: '800', marginTop: '6px' }}>
            🍲 Sabores del Altiplano
          </h1>
          <div className="text-mut" style={{ fontSize: '14px', marginTop: '2px' }}>
            Sistema de gestión gastronómica y control de cocina
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
