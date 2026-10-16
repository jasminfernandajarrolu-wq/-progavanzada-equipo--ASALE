import React from 'react';
import {
  LayoutDashboard,
  Boxes,
  CookingPot,
  Truck,
  ClipboardList,
  ShoppingCart,
  WalletCards,
  BarChart3,
  ShieldCheck,
  Utensils,
  User
} from 'lucide-react';
import { ROLE_PERMISSIONS } from '../data/authData';

export const TABS = [
  { id: 'dash', label: 'Inicio', icon: LayoutDashboard },
  { id: 'ing', label: 'Ingredientes', icon: Boxes },
  { id: 'plat', label: 'Platos', icon: CookingPot },
  { id: 'prov', label: 'Proveedores', icon: Truck },
  { id: 'ped', label: 'Pedidos', icon: ClipboardList },
  { id: 'comp', label: 'Compras', icon: ShoppingCart },
  { id: 'fin', label: 'Ingresos y egresos', icon: WalletCards },
  { id: 'rep', label: 'Reportes', icon: BarChart3 }
];

export function Navigation({
  activeTab,
  onSelectTab,
  lowStockCount,
  allowedTabs,
  currentUser
}) {
  // Filtrar los módulos permitidos según el rol del usuario conectado
  const visibleTabs = allowedTabs
    ? TABS.filter((tab) => allowedTabs.includes(tab.id))
    : TABS;

  const roleConfig = currentUser ? ROLE_PERMISSIONS[currentUser.role] : null;

  const renderRoleIcon = () => {
    if (!currentUser) return <User size={14} />;
    switch (currentUser.role) {
      case 'Administrador':
        return <ShieldCheck size={14} />;
      case 'Mesero':
        return <Utensils size={14} />;
      case 'Cajero':
        return <WalletCards size={14} />;
      default:
        return <User size={14} />;
    }
  };

  return (
    <nav className="app-nav" aria-label="Navegación principal">
      {currentUser && (
        <div className="nav-role-header">
          <div className="nav-role-title">
            {renderRoleIcon()}
            <span>Menú de {currentUser.role}</span>
          </div>
          <span className="nav-role-count">
            {visibleTabs.length} {visibleTabs.length === 1 ? 'módulo' : 'módulos'}
          </span>
        </div>
      )}

      {visibleTabs.map((tab) => {
        const Icon = tab.icon;
        const isActive = activeTab === tab.id;
        // La alerta de stock bajo se muestra en Inicio si es Administrador
        const hasAlert =
          tab.id === 'dash' &&
          lowStockCount > 0 &&
          (!currentUser || currentUser.role === 'Administrador');

        return (
          <button
            key={tab.id}
            type="button"
            className={isActive ? 'active' : ''}
            onClick={() => onSelectTab(tab.id)}
          >
            <Icon size={16} />
            <span>{tab.label}</span>
            {hasAlert && <span className="badge">{lowStockCount}</span>}
          </button>
        );
      })}
    </nav>
  );
}
