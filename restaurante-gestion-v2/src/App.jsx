import React, { useState, useEffect } from 'react';
import { useRestaurantState } from './hooks/useRestaurantState';
import { Header } from './components/Header';
import { Navigation } from './components/Navigation';
import { Toast } from './components/Toast';
import { DashboardView } from './components/views/DashboardView';
import { IngredientsView } from './components/views/IngredientsView';
import { DishesView } from './components/views/DishesView';
import { SuppliersView } from './components/views/SuppliersView';
import { OrdersView } from './components/views/OrdersView';
import { PurchasesView } from './components/views/PurchasesView';
import { FinancesView } from './components/views/FinancesView';
import { ReportsView } from './components/views/ReportsView';

export default function App() {
  const [activeTab, setActiveTab] = useState('dash');
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem('rest_theme') || (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
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

  return (
    <div className="app-container">
      <Header theme={theme} onToggleTheme={toggleTheme} />
      <Navigation
        activeTab={activeTab}
        onSelectTab={setActiveTab}
        lowStockCount={lowStockItems.length}
      />

      <main className="app-main">
        {activeTab === 'dash' && (
          <DashboardView
            data={data}
            lowStockItems={lowStockItems}
            getFinancialSum={getFinancialSum}
          />
        )}

        {activeTab === 'ing' && (
          <IngredientsView
            data={data}
            onAddIngredient={addIngredient}
            onRecordMovement={recordMovement}
            onDeleteItem={deleteItem}
          />
        )}

        {activeTab === 'plat' && (
          <DishesView
            data={data}
            onAddDish={addDish}
            onDeleteItem={deleteItem}
            getIngredient={getIngredient}
          />
        )}

        {activeTab === 'prov' && (
          <SuppliersView
            data={data}
            onAddSupplier={addSupplier}
            onDeleteItem={deleteItem}
          />
        )}

        {activeTab === 'ped' && (
          <OrdersView
            data={data}
            onRecordOrder={recordOrder}
          />
        )}

        {activeTab === 'comp' && (
          <PurchasesView
            data={data}
            onRecordPurchase={recordPurchase}
            showToast={showToast}
          />
        )}

        {activeTab === 'fin' && (
          <FinancesView
            data={data}
            onAddFinanceRecord={addFinanceRecord}
            getFinancialSum={getFinancialSum}
          />
        )}

        {activeTab === 'rep' && (
          <ReportsView
            data={data}
            getFinancialSum={getFinancialSum}
            onResetToSeed={resetToSeed}
          />
        )}
      </main>

      <Toast message={toastMessage} />
    </div>
  );
}
