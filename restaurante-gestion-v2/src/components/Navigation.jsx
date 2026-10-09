import React from 'react';
import {
  LayoutDashboard,
  Boxes,
  CookingPot,
  Truck,
  ClipboardList,
  ShoppingCart,
  WalletCards,
  BarChart3
} from 'lucide-react';

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

export function Navigation({ activeTab, onSelectTab, lowStockCount }) {
  return (
    <nav className="app-nav" aria-label="Navegación principal">
      {TABS.map((tab) => {
        const Icon = tab.icon;
        const isActive = activeTab === tab.id;
        const hasAlert = tab.id === 'dash' && lowStockCount > 0;

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
