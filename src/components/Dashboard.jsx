// =========================================================================
//            DASHBOARD.JSX - PAINEL DE CONTROLE DO PRODUTOR
// =========================================================================
// O que faz: Serve como container principal e centralizador de inteligência
// comercial e controle operacional para o microprodutor rural.
// Por que foi implementado assim: Exibe cartões consolidados de faturamento mensal,
// contagem de vendas e alertas piscantes de estoque baixo (< 5 unidades).
// Também serve como painel de abas integrando a Gestão de Estoque, a Frente de Caixa 
// (PDV) e a timeline de Auditoria e Logs de Atividades dos clientes.

import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { useAuth } from '../context/AuthContext';

import { TrendingUp, ShoppingBag, AlertTriangle, Package, ShoppingCart, Users, FileText, Printer, X, Loader2, Truck } from 'lucide-react';
import Inventory from './Inventory';
import POS from './POS';
import ClientActivities from './ClientActivities';
import DeliveryManagement from './DeliveryManagement';

const Dashboard = () => {
  const { currentScreen, setCurrentScreen, getMonthlyRevenue, getTotalSalesCount, getLowStockItems, products, getProductStock, createSale } = useApp();
  const { currentUser } = useAuth();

  const [showReportModal, setShowReportModal] = useState(false);
  const [reportData, setReportData] = useState(null);
  const [isGeneratingReport, setIsGeneratingReport] = useState(false);

  const handleGenerateReport = async () => {
    setIsGeneratingReport(true);
    setShowReportModal(true);
    try {
      const response = await fetch(`http://localhost:5000/api/reports/producer/${currentUser.id}`);
      if (!response.ok) throw new Error('Falha ao buscar relatório');
      const data = await response.json();
      setReportData(data);
    } catch (error) {
      console.error(error);
      alert('Erro ao carregar o relatório de vendas e estoque.');
      setShowReportModal(false);
    } finally {
      setIsGeneratingReport(false);
    }
  };

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
      case 'deliveries':
        return <DeliveryManagement />;
      default:
        return <Inventory />;
    }
  };

  return (
    <div className="min-h-screen bg-sage-50 pb-24 print:bg-white print:pb-0">
      {/* Upper Dashboard Banner */}
      <div className="bg-sage-600 text-white p-6 pb-28 rounded-b-[2.5rem] shadow-lg relative print:hidden">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-black tracking-tight">Painel de Controle</h1>
            <p className="text-sage-100 text-xs mt-0.5 font-medium">Gestão Operacional Integrada DaTerra</p>
          </div>
          <div className="flex items-center gap-3 shrink-0 self-start md:self-auto">
            <button
              onClick={handleGenerateReport}
              className="bg-white text-sage-700 hover:bg-sage-50 text-xs font-black px-4 py-2.5 rounded-2xl shadow-md transition-all flex items-center gap-1.5 hover:scale-105"
              title="Gerar relatório de vendas e estoque"
            >
              <FileText size={16} />
              <span>Gerar Relatório</span>
            </button>
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
      <div className="max-w-6xl mx-auto px-4 -mt-20 space-y-6 relative z-10 print:hidden">
        
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
          <button
            onClick={() => setCurrentScreen('deliveries')}
            className={`flex-1 py-3 px-4 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center justify-center gap-2 whitespace-nowrap ${
              activeTab === 'deliveries'
                ? 'bg-sage-500 text-white shadow-md'
                : 'text-sage-700 hover:text-sage-900 hover:bg-sage-50'
            }`}
          >
            <Truck size={18} />
            <span>Entregas / Expedição</span>
          </button>
        </div>

        {/* Dynamic Tab Content Area */}
        <div className="bg-white rounded-[2rem] shadow-lg border border-sage-100 overflow-hidden">
          {renderActiveTab()}
        </div>
      </div>

      {/* MODAL DE RELATÓRIO */}
      {showReportModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 print:static print:bg-white print:p-0 print:block">
          <div className="bg-white w-full max-w-3xl rounded-3xl shadow-2xl max-h-[90vh] overflow-y-auto print:max-h-none print:shadow-none print:rounded-none">
            
            {/* Modal Header */}
            <div className="p-6 border-b border-gray-100 flex items-center justify-between print:hidden">
              <h2 className="text-xl font-black text-sage-800 flex items-center gap-2">
                <FileText className="text-sage-600" />
                Relatório Gerencial
              </h2>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => window.print()}
                  disabled={isGeneratingReport}
                  className="bg-sage-100 hover:bg-sage-200 text-sage-700 px-4 py-2 rounded-xl text-sm font-bold flex items-center gap-2 transition-colors disabled:opacity-50"
                >
                  <Printer size={16} />
                  Imprimir / PDF
                </button>
                <button
                  onClick={() => setShowReportModal(false)}
                  className="bg-gray-100 hover:bg-gray-200 text-gray-700 p-2 rounded-xl transition-colors"
                >
                  <X size={20} />
                </button>
              </div>
            </div>

            {/* Print Header (Only visible on print) */}
            <div className="hidden print:block p-8 border-b-2 border-sage-200 mb-6">
              <h1 className="text-3xl font-black text-sage-900">Relatório de Vendas e Estoque</h1>
              <p className="text-gray-500 mt-1">Produtor: {currentUser?.name} | Gerado em: {new Date().toLocaleDateString('pt-BR')} às {new Date().toLocaleTimeString('pt-BR')}</p>
            </div>

            <div className="p-6 print:p-8">
              {isGeneratingReport ? (
                <div className="py-20 flex flex-col items-center justify-center text-sage-500">
                  <Loader2 size={40} className="animate-spin mb-4" />
                  <p className="font-medium text-sm">Agregando dados financeiros e de estoque...</p>
                </div>
              ) : reportData ? (
                <div className="space-y-8">
                  {/* Resumo Financeiro */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-sage-50 rounded-2xl p-5 border border-sage-100 print:bg-white print:border-sage-300">
                      <p className="text-xs font-bold text-gray-500 uppercase">Faturamento (Mês Atual)</p>
                      <p className="text-3xl font-black text-sage-800 mt-1">
                        R$ {reportData.totalRevenue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </p>
                    </div>
                    <div className="bg-honey-50 rounded-2xl p-5 border border-honey-100 print:bg-white print:border-honey-300">
                      <p className="text-xs font-bold text-gray-500 uppercase">Total de Vendas</p>
                      <p className="text-3xl font-black text-honey-700 mt-1">
                        {reportData.salesCount} <span className="text-sm font-bold text-honey-600/60">pedidos</span>
                      </p>
                    </div>
                  </div>

                  {/* Mais Vendidos */}
                  <div>
                    <h3 className="font-bold text-lg text-sage-800 mb-4 border-b border-gray-100 pb-2">Top 5 Produtos Mais Vendidos</h3>
                    {reportData.topProducts.length > 0 ? (
                      <table className="w-full text-left border-collapse">
                        <thead>
                          <tr className="bg-gray-50 print:bg-gray-100 text-xs text-gray-500 uppercase">
                            <th className="p-3 font-bold rounded-l-xl">Produto</th>
                            <th className="p-3 font-bold text-right rounded-r-xl">Qtd. Vendida</th>
                          </tr>
                        </thead>
                        <tbody>
                          {reportData.topProducts.map((p, i) => (
                            <tr key={i} className="border-b border-gray-50 last:border-0">
                              <td className="p-3 font-semibold text-sage-900">{p.name}</td>
                              <td className="p-3 font-bold text-honey-600 text-right">{p.total_sold} un</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    ) : (
                      <p className="text-gray-500 text-sm">Nenhuma venda registrada neste mês.</p>
                    )}
                  </div>

                  {/* Estoque Crítico */}
                  <div>
                    <h3 className="font-bold text-lg text-red-700 mb-4 border-b border-red-100 pb-2 flex items-center gap-2">
                      <AlertTriangle size={20} />
                      Alerta de Estoque Crítico
                    </h3>
                    {reportData.lowStock.length > 0 ? (
                      <table className="w-full text-left border-collapse">
                        <thead>
                          <tr className="bg-red-50 text-xs text-red-600 uppercase">
                            <th className="p-3 font-bold rounded-l-xl">Produto</th>
                            <th className="p-3 font-bold text-right rounded-r-xl">Estoque Atual</th>
                          </tr>
                        </thead>
                        <tbody>
                          {reportData.lowStock.map((p, i) => (
                            <tr key={i} className="border-b border-red-50 last:border-0">
                              <td className="p-3 font-semibold text-gray-800">{p.name}</td>
                              <td className="p-3 font-black text-red-600 text-right">{p.current_quantity} un</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    ) : (
                      <p className="text-gray-500 text-sm">Todos os produtos estão com estoque adequado.</p>
                    )}
                  </div>

                  <div className="hidden print:block text-center text-xs text-gray-400 pt-8 mt-8 border-t border-gray-200">
                    Documento gerado pelo sistema DaTerra - Apoio ao Produtor Rural
                  </div>
                </div>
              ) : null}
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default Dashboard;
