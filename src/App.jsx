// =========================================================================
//                   ARQUIVO PRINCIPAL DE ENTRADA DO FRONTEND
// =========================================================================
// O que faz: Serve como ponto de entrada (bootstrap) da árvore do React.
// Por que foi implementado assim: Este arquivo configura os Providers globais
// de contexto (AuthProvider e AppProvider) para prover o estado compartilhado
// de forma transparente para toda a aplicação. 
// Adota o princípio de Separation of Concerns (SoC), separando os dados do
// negócio da lógica visual de renderização de telas.

import React from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import Header from './components/Header';
import LandingPage from './components/LandingPage';
import Marketplace from './components/Marketplace';
import Dashboard from './components/Dashboard';
import Inventory from './components/Inventory';
import POS from './components/POS';
import ClientActivities from './components/ClientActivities';
import Navigation from './components/Navigation';
import AuthModal from './components/AuthModal';
import PlansModal from './components/PlansModal';
import CustomerOrders from './components/CustomerOrders';
import { ShoppingBag, X } from 'lucide-react';

function AppContent() {
  const { currentScreen, notifications } = useApp();
  const { isAuthenticated, isProducer, currentUser } = useAuth();
  const [activeToast, setActiveToast] = React.useState(null);
  const [lastNotifId, setLastNotifId] = React.useState(null);

  React.useEffect(() => {
    if (isProducer() && notifications.length > 0) {
      const latest = notifications[0];
      if (latest.id !== lastNotifId) {
        setLastNotifId(latest.id);
        setActiveToast(latest);
        
        const timer = setTimeout(() => {
          setActiveToast(null);
        }, 5000);
        
        return () => clearTimeout(timer);
      }
    }
  }, [notifications, lastNotifId, isProducer]);

  // =========================================================================
  //        ROTEAMENTO DINÂMICO DE INTERFACE (ADAPTAÇÃO POR PERFIL LOGADO)
  // =========================================================================
  // O que faz: Decide dinamicamente qual view (tela principal) será exibida.
  // Por que foi implementado assim: Em vez de usar bibliotecas de rota complexas,
  // criamos um gerenciador baseado no estado do Contexto de Autenticação (AuthContext).
  // Isso facilita a apresentação prática e ilustra de forma clara à banca como
  // a tela reage e muda instantaneamente o escopo com base no papel do usuário.
  const renderScreen = () => {
    // 1. MODO VISITANTE / LANDING PAGE: Exibe a página pública de atração
    //    quando o usuário não está autenticado na sessão corrente.
    if (!isAuthenticated) {
      return <LandingPage />;
    }

    // 2. MODO CLIENTE: Direciona para a vitrine de e-commerce (Marketplace)
    //    com carrinho e listagem otimizada de ofertas da região.
    if (currentUser?.role === 'client') {
      if (currentScreen === 'orders') return <CustomerOrders />;
      return <Marketplace />;
    }

    // 3. MODO PRODUTOR: Carrega o console operacional (Dashboard) contendo
    //    estoque, controle de vendas em tempo real e gráficos financeiros.
    if (isProducer()) {
      return <Dashboard />;
    }

    return <Marketplace />;
  };

  return (
    <div className="min-h-screen bg-sage-50 text-gray-800 selection:bg-sage-200">

      
      {/* Persistent App Header (Used when logged in or on management screens) */}
      {isAuthenticated && <Header />}

      {/* Main Screen View */}
      <main className="w-full">
        {renderScreen()}
      </main>

      {/* Real-time Toast Notification for Producer */}
      {activeToast && (
        <div className="fixed top-20 right-4 z-50 bg-white rounded-2xl shadow-2xl border-l-4 border-honey-500 p-4 max-w-sm w-full flex items-start gap-3 animate-slideInRight">
          <div className="bg-honey-100 text-honey-600 p-2.5 rounded-xl shrink-0 shadow-sm">
            <ShoppingBag size={20} />
          </div>
          <div className="flex-1 min-w-0">
            <h4 className="font-extrabold text-sage-800 text-xs sm:text-sm">{activeToast.title}</h4>
            <p className="text-[11px] text-gray-500 mt-1 font-medium">{activeToast.message}</p>
          </div>
          <button 
            onClick={() => setActiveToast(null)} 
            className="text-gray-400 hover:text-gray-650 shrink-0 p-1 hover:bg-gray-50 rounded-lg transition-colors"
          >
            <X size={16} />
          </button>
        </div>
      )}

      {/* Global Auth Pop-up Modal */}
      <AuthModal />

      {/* Global SaaS Plans Modal */}
      <PlansModal />

      {/* Bottom Navigation Bar for Logged-In Users */}
      {isAuthenticated && <Navigation />}

    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <AppProvider>
        <AppContent />
      </AppProvider>
    </AuthProvider>
  );
}

export default App;
