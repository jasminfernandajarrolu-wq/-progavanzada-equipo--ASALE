import React, { useState, useEffect } from 'react';
import { useRestaurantState } from './hooks/useRestaurantState';
import { Header } from './components/Header';
import { Navigation } from './components/Navigation';
import { Toast } from './components/Toast';
import { LoginView } from './components/LoginView';
import { DashboardView } from './components/views/DashboardView';
import { IngredientsView } from './components/views/IngredientsView';
import { DishesView } from './components/views/DishesView';
import { SuppliersView } from './components/views/SuppliersView';
import { OrdersView } from './components/views/OrdersView';
import { PurchasesView } from './components/views/PurchasesView';
import { FinancesView } from './components/views/FinancesView';
import { ReportsView } from './components/views/ReportsView';
import { ROLE_PERMISSIONS } from './data/authData';

/**
 * Extrae la ruta solicitada desde la URL (hash `#ped`, pathname `/ped`, o query `?tab=ped`)
 */
function getRouteFromUrl() {
  if (typeof window === 'undefined') return '';

  // 1. Hash (ej: #comp, #/comp)
  const hash = window.location.hash.replace(/^#\/?/, '').trim().toLowerCase();
  if (hash) return hash;

  // 2. Pathname (ej: /comp)
  const path = window.location.pathname.replace(/^\//, '').split('/')[0].trim().toLowerCase();
  if (path && path !== 'index.html') return path;

  // 3. Parámetro query (ej: ?tab=comp)
  const params = new URLSearchParams(window.location.search);
  const tabParam = params.get('tab');
  if (tabParam) return tabParam.trim().toLowerCase();

  return '';
}

export default function App() {
  const [currentUser, setCurrentUser] = useState(() => {
    try {
      const savedUser = localStorage.getItem('rest_user');
      return savedUser ? JSON.parse(savedUser) : null;
    } catch (e) {
      console.error('Error reading user session', e);
      return null;
    }
  });

  const roleConfig = currentUser ? ROLE_PERMISSIONS[currentUser.role] : null;
  const allowedTabs = roleConfig ? roleConfig.allowedTabs : [];

  const [activeTab, setActiveTab] = useState(() => {
    const requested = getRouteFromUrl();
    if (!currentUser) return 'dash';
    const cfg = ROLE_PERMISSIONS[currentUser.role];
    if (requested && cfg?.allowedTabs?.includes(requested)) {
      return requested;
    }
    return cfg?.defaultTab || 'dash';
  });

  const [theme, setTheme] = useState(() => {
    return (
      localStorage.getItem('rest_theme') ||
      (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light')
    );
  });

  const {
    data,
    toastMessage,
    showToast,
    getIngredient,
    lowStockItems,
    getFinancialSum,
    addIngredient,
    recordMovement,
    addDish,
    addSupplier,
    recordPurchase,
    addFinanceRecord,
    deleteItem,
    recordOrder,
    resetToSeed
  } = useRestaurantState();

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('rest_theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));
  };

  /**
   * REGLA 2: Si el usuario escribe la ruta a mano (hash o URL) y no tiene permiso,
   * debe redirigirlo automáticamente al Inicio ('dash').
   */
  useEffect(() => {
    if (!currentUser) return;

    const handleRouteVerification = () => {
      const requested = getRouteFromUrl();
      if (!requested) return;

      if (!allowedTabs.includes(requested)) {
        // Redirección forzosa al Inicio
        console.warn(`Ruta no autorizada "${requested}" para rol ${currentUser.role}. Redirigiendo a Inicio.`);
        window.history.replaceState(null, '', '#dash');
        setActiveTab('dash');
        showToast(`Módulo "${requested}" no autorizado para ${currentUser.role}. Redirigido a Inicio.`);
      } else {
        setActiveTab(requested);
      }
    };

    handleRouteVerification();

    window.addEventListener('hashchange', handleRouteVerification);
    window.addEventListener('popstate', handleRouteVerification);

    return () => {
      window.removeEventListener('hashchange', handleRouteVerification);
      window.removeEventListener('popstate', handleRouteVerification);
    };
  }, [currentUser, allowedTabs, showToast]);

  const handleSelectTab = (tabId) => {
    if (!allowedTabs.includes(tabId)) {
      // Si intenta seleccionar un módulo no permitido, redirigir a Inicio
      setActiveTab('dash');
      window.location.hash = '#dash';
      return;
    }
    setActiveTab(tabId);
    window.location.hash = `#${tabId}`;
  };

  const handleLogin = (user) => {
    setCurrentUser(user);
    try {
      localStorage.setItem('rest_user', JSON.stringify(user));
    } catch (e) {
      console.error('Error saving user session', e);
    }
    const cfg = ROLE_PERMISSIONS[user.role];
    const targetTab = cfg?.defaultTab || cfg?.allowedTabs?.[0] || 'dash';
    setActiveTab(targetTab);
    window.location.hash = `#${targetTab}`;
    showToast(`¡Bienvenido(a), ${user.name}! Sesión iniciada como ${user.role}.`);
  };

  const handleLogout = () => {
    const prevName = currentUser?.name;
    setCurrentUser(null);
    try {
      localStorage.removeItem('rest_user');
    } catch (e) {
      console.error('Error clearing user session', e);
    }
    window.location.hash = '';
    showToast(prevName ? `Sesión cerrada: Hasta pronto, ${prevName}.` : 'Sesión cerrada.');
  };

  // Si no hay sesión iniciada, mostrar Login
  if (!currentUser) {
    return (
      <>
        <LoginView
          onLogin={handleLogin}
          theme={theme}
          onToggleTheme={toggleTheme}
        />
        <Toast message={toastMessage} />
      </>
    );
  }

  return (
    <div className="app-container">
      <Header
        theme={theme}
        onToggleTheme={toggleTheme}
        currentUser={currentUser}
        onLogout={handleLogout}
      />

      <Navigation
        activeTab={activeTab}
        onSelectTab={handleSelectTab}
        lowStockCount={lowStockItems.length}
        allowedTabs={allowedTabs}
        currentUser={currentUser}
      />

      <main className="app-main">
        {allowedTabs.includes('dash') && activeTab === 'dash' && (
          <DashboardView
            data={data}
            lowStockItems={lowStockItems}
            getFinancialSum={getFinancialSum}
          />
        )}

        {allowedTabs.includes('ing') && activeTab === 'ing' && (
          <IngredientsView
            data={data}
            onAddIngredient={addIngredient}
            onRecordMovement={recordMovement}
            onDeleteItem={deleteItem}
            readOnly={!roleConfig?.canEditIng}
          />
        )}

        {allowedTabs.includes('plat') && activeTab === 'plat' && (
          <DishesView
            data={data}
            onAddDish={addDish}
            onDeleteItem={deleteItem}
            getIngredient={getIngredient}
            readOnly={!roleConfig?.canEditPlat}
          />
        )}

        {allowedTabs.includes('prov') && activeTab === 'prov' && (
          <SuppliersView
            data={data}
            onAddSupplier={addSupplier}
            onDeleteItem={deleteItem}
          />
        )}

        {allowedTabs.includes('ped') && activeTab === 'ped' && (
          <OrdersView
            data={data}
            onRecordOrder={recordOrder}
          />
        )}

        {allowedTabs.includes('comp') && activeTab === 'comp' && (
          <PurchasesView
            data={data}
            onRecordPurchase={recordPurchase}
            showToast={showToast}
          />
        )}

        {allowedTabs.includes('fin') && activeTab === 'fin' && (
          <FinancesView
            data={data}
            onAddFinanceRecord={addFinanceRecord}
            getFinancialSum={getFinancialSum}
          />
        )}

        {allowedTabs.includes('rep') && activeTab === 'rep' && (
          <ReportsView
            data={data}
            getFinancialSum={getFinancialSum}
            onResetToSeed={resetToSeed}
            salesOnly={!!roleConfig?.salesOnlyReports}
          />
        )}

        {/* Redirección / aviso si por alguna razón intenta ver un tab no permitido */}
        {!allowedTabs.includes(activeTab) && (
          <div className="content-box text-center" style={{ padding: '40px 20px' }}>
            <h3>Módulo restringido</h3>
            <p className="text-mut" style={{ marginTop: '8px' }}>
              Tu usuario ({currentUser.role}) no tiene permisos para este módulo.
            </p>
            <button
              type="button"
              className="btn btn-pri"
              style={{ marginTop: '16px' }}
              onClick={() => handleSelectTab('dash')}
            >
              Ir al Inicio
            </button>
          </div>
        )}
      </main>

      <Toast message={toastMessage} />
    </div>
  );
}
