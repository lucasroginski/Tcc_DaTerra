// =========================================================================
//            DASHBOARD.JSX - PAINEL DE CONTROLE DO PRODUTOR
// =========================================================================
// O que faz: Serve como container principal e centralizador de inteligência
// comercial e controle operacional para o microprodutor rural.
// Por que foi implementado assim: Exibe cartões consolidados de faturamento mensal,
// contagem de vendas e alertas piscantes de estoque baixo (< 5 unidades).
// Também serve como painel de abas integrando a Gestão de Estoque, a Frente de Caixa 
// (PDV) e a timeline de Auditoria e Logs de Atividades dos clientes.

import React from 'react';
import { useApp } from '../context/AppContext';
import { useAuth } from '../context/AuthContext';

import { TrendingUp, ShoppingBag, AlertTriangle, Package, ShoppingCart, Users } from 'lucide-react';
import Inventory from './Inventory';
import POS from './POS';
import ClientActivities from './ClientActivities';

const Dashboard = () => {
  const { currentScreen, setCurrentScreen, getMonthlyRevenue, getTotalSalesCount, getLowStockItems, products, getProductStock, createSale } = useApp();
  const { currentUser } = useAuth();

  const handleSimulateSale = () => {
    const availableProducts = products.filter(p => getProductStock(p.id) > 0);
    if (availableProducts.length === 0) {
      alert("Todos os produtos estão esgotados! Insira estoque antes de simular.");
      return;
    }
    const randomProduct = availableProducts[Math.floor(Math.random() * availableProducts.length)];
    const quantity = Math.min(2, getProductStock(randomProduct.id));
    
    const saleItems = [{
      product_id: randomProduct.id,
      product_name: randomProduct.name,
      price: randomProduct.price,
      quantity: quantity
    }];
    
    try {
      createSale(saleItems);
    } catch (e) {
      alert(e.message);
    }
  };

  const monthlyRevenue = getMonthlyRevenue();
  const totalSales = getTotalSalesCount();
  const lowStockItems = getLowStockItems();

  const activeTab = (currentScreen === 'dashboard' || currentScreen === 'catalog') ? 'inventory' : currentScreen;

  const renderActiveTab = () => {
    switch (activeTab) {
      case 'inventory':
        return <Inventory />;
      case 'pos':
        return <POS />;
      case 'activities':
        return <ClientActivities />;
      default:
        return <Inventory />;
    }
  };

  return (
    <div className="min-h-screen bg-sage-50 pb-24">
      {/* Upper Dashboard Banner */}
      <div className="bg-sage-600 text-white p-6 pb-28 rounded-b-[2.5rem] shadow-lg relative">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-black tracking-tight">Painel de Controle</h1>
            <p className="text-sage-100 text-xs mt-0.5 font-medium">Gestão Operacional Integrada DaTerra</p>
          </div>
          <div className="flex items-center gap-3 shrink-0 self-start md:self-auto">
            <button
              onClick={handleSimulateSale}
              className="bg-honey-500 hover:bg-honey-600 active:bg-honey-700 text-white text-xs font-black px-4 py-2.5 rounded-2xl shadow-md transition-all flex items-center gap-1.5 border border-honey-400/40 hover:scale-105"
              title="Simular compra de cliente para testar a notificação em tempo real"
            >
              <span>Simular Compra 🤖</span>
            </button>
            <div className="bg-white/10 backdrop-blur-md px-4 py-2.5 rounded-2xl border border-white/20 text-xs font-bold shadow-inner">
              <span>Produtor: <strong className="text-honey-300 font-extrabold">{currentUser?.name}</strong></span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Console Content (Offset upward to overlap the banner) */}
      <div className="max-w-6xl mx-auto px-4 -mt-20 space-y-6 relative z-10">
        
        {/* Resumo Financeiro (Stats Grid) */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          
          {/* Revenue Card */}
          <div className="bg-white rounded-3xl p-5 shadow-lg border border-sage-100/60 flex items-center justify-between transition-all hover:scale-[1.02] hover:shadow-xl">
            <div className="space-y-1">
              <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider block">Receita do Mês</span>
              <p className="text-2xl font-black text-sage-800">
                R$ {monthlyRevenue.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </p>
              <p className="text-[10px] text-sage-600 font-medium">Faturamento acumulado</p>
            </div>
            <div className="bg-sage-50 text-sage-600 p-3 rounded-2xl">
              <TrendingUp size={24} />
            </div>
          </div>

          {/* Sales Count Card */}
          <div className="bg-white rounded-3xl p-5 shadow-lg border border-sage-100/60 flex items-center justify-between transition-all hover:scale-[1.02] hover:shadow-xl">
            <div className="space-y-1">
              <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider block">Vendas Realizadas</span>
              <p className="text-2xl font-black text-sage-800">{totalSales}</p>
              <p className="text-[10px] text-sage-650 font-medium">Pedidos registrados</p>
            </div>
            <div className="bg-honey-50 text-honey-600 p-3 rounded-2xl">
              <ShoppingBag size={24} />
            </div>
          </div>

          {/* Low Stock Alerts Card */}
          <div 
            onClick={() => setCurrentScreen('inventory')}
            className={`bg-white rounded-3xl p-5 shadow-lg border flex items-center justify-between cursor-pointer transition-all hover:scale-[1.02] hover:shadow-xl ${
              lowStockItems.length > 0 ? 'border-red-200 ring-2 ring-red-500/10' : 'border-sage-100/60'
            }`}
          >
            <div className="space-y-1">
              <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider block">Estoque Crítico</span>
              <p className={`text-2xl font-black ${lowStockItems.length > 0 ? 'text-red-650' : 'text-sage-800'}`}>
                {lowStockItems.length}
              </p>
              <p className="text-[10px] text-gray-550 font-medium">
                {lowStockItems.length > 0 ? 'Estoque < 5 unidades' : 'Estoque adequado'}
              </p>
            </div>
            <div className={`p-3 rounded-2xl ${lowStockItems.length > 0 ? 'bg-red-50 text-red-600 animate-pulse' : 'bg-green-50 text-green-600'}`}>
              <AlertTriangle size={24} />
            </div>
          </div>

        </div>

        {/* Low Stock Warnings Banner */}
        {lowStockItems.length > 0 && (
          <div className="bg-red-50 border border-red-200 rounded-3xl p-4 shadow-sm animate-fadeIn">
            <div className="flex items-center gap-2 mb-2">
              <AlertTriangle className="text-red-650" size={18} />
              <h2 className="font-extrabold text-red-800 text-xs sm:text-sm">
                Atenção: Os seguintes produtos necessitam de reposição imediata:
              </h2>
            </div>
            <div className="flex flex-wrap gap-2">
              {lowStockItems.map(item => (
                <span 
                  key={item.id} 
                  className="bg-white border border-red-200 text-red-750 text-[11px] font-bold px-3 py-1 rounded-full flex items-center gap-1.5 shadow-sm"
                >
                  <span className="w-1.5 h-1.5 bg-red-500 rounded-full"></span>
                  <span>{item.product_name} ({item.current_quantity} un)</span>
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Console Navigation Tab Bar */}
        <div className="bg-white p-1.5 rounded-2xl shadow-md border border-sage-100 flex overflow-x-auto gap-1">
          <button
            onClick={() => setCurrentScreen('inventory')}
            className={`flex-1 py-3 px-4 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center justify-center gap-2 whitespace-nowrap ${
              activeTab === 'inventory'
                ? 'bg-sage-500 text-white shadow-md'
                : 'text-sage-700 hover:text-sage-900 hover:bg-sage-50'
            }`}
          >
            <Package size={18} />
            <span>Gestão de Estoque</span>
          </button>
          <button
            onClick={() => setCurrentScreen('pos')}
            className={`flex-1 py-3 px-4 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center justify-center gap-2 whitespace-nowrap ${
              activeTab === 'pos'
                ? 'bg-sage-500 text-white shadow-md'
                : 'text-sage-700 hover:text-sage-900 hover:bg-sage-50'
            }`}
          >
            <ShoppingCart size={18} />
            <span>Frente de Caixa (PDV)</span>
          </button>
          <button
            onClick={() => setCurrentScreen('activities')}
            className={`flex-1 py-3 px-4 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center justify-center gap-2 whitespace-nowrap ${
              activeTab === 'activities'
                ? 'bg-sage-500 text-white shadow-md'
                : 'text-sage-700 hover:text-sage-900 hover:bg-sage-50'
            }`}
          >
            <Users size={18} />
            <span>Atividades dos Clientes</span>
          </button>
        </div>

        {/* Dynamic Tab Content Area */}
        <div className="bg-white rounded-[2rem] shadow-lg border border-sage-100 overflow-hidden">
          {renderActiveTab()}
        </div>

      </div>
    </div>
  );
};

export default Dashboard;
