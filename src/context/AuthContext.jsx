// =========================================================================
//            AUTHCONTEXT.JSX - CONTEXTO GLOBAL DE AUTENTICAÇÃO E SAAS
// =========================================================================
// O que faz: Gerencia centralizadamente o estado de login, cadastro, papéis
// de acesso (roles) e a monetização do modelo SaaS da plataforma.
// Por que foi implementado assim: Em aplicações React de página única (SPA), 
// passar dados de login entre componentes distantes via props ("prop drilling")
// gera acoplamento ruim. O Context API resolve isso disponibilizando dados de
// sessão de maneira uniforme e reativa para qualquer tela que precise.

import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth deve ser envelopado por um AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [activities, setActivities] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const fetchActivities = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/activities');
      if (response.ok) {
        const data = await response.json();
        setActivities(data);
      }
    } catch (error) {
      console.error('Erro ao buscar atividades:', error);
    }
  };

  // Load user from localStorage on mount
  useEffect(() => {
    const storedUser = localStorage.getItem('currentUser');
    if (storedUser) {
      setCurrentUser(JSON.parse(storedUser));
      setIsAuthenticated(true);
    }
    fetchActivities();
  }, []);

  // Auth Modal State
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authModalTab, setAuthModalTab] = useState('login'); // 'login' or 'register'
  const [authModalMessage, setAuthModalMessage] = useState('');

  // SaaS Plans Modal State
  const [plansModalOpen, setPlansModalOpen] = useState(false);

  const openAuthModal = (tab = 'login', message = '') => {
    setAuthModalTab(tab);
    setAuthModalMessage(message);
    setAuthModalOpen(true);
  };

  const closeAuthModal = () => {
    setAuthModalOpen(false);
    setAuthModalMessage('');
  };

  const openPlansModal = () => {
    setPlansModalOpen(true);
  };

  const closePlansModal = () => {
    setPlansModalOpen(false);
  };

  // Helper: Calculate trial days remaining (15 days free trial)
  const getTrialDaysRemaining = (user = currentUser) => {
    if (!user || !user.createdAt) return 15;
    if (user.role === 'admin' || user.plan === 'vip') return null; // Unlimited or VIP

    const createdDate = new Date(user.createdAt);
    const today = new Date();
    const diffTime = today - createdDate;
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    
    return Math.max(0, 15 - diffDays);
  };

  // =========================================================================
  //        AÇÕES DE MONETIZAÇÃO SAAS (REGRAS COMERCIAIS DA PLATAFORMA)
  // =========================================================================
  // O que faz: Simula transações financeiras e alteração de planos dos produtores.
  // Por que foi implementado assim: Demonstra na prática o modelo de negócios do TCC.
  // O produtor pode realizar upgrade para VIP para expandir seu limite de produtos,
  // ou pagar avulso por capacidade excedente.

  // Upgrade do Produtor para Plano VIP (R$ 10,00/mês)
  const upgradeToVip = async () => {
    if (!currentUser) return { success: false, error: 'Usuário não autenticado' };

    try {
      const response = await fetch(`http://localhost:5000/api/users/${currentUser.id}/upgrade`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plan: 'vip' })
      });
      
      const updatedUser = await response.json();
      if (response.ok) {
        setCurrentUser(updatedUser);
        localStorage.setItem('currentUser', JSON.stringify(updatedUser));
        await logActivity(currentUser.id, currentUser.name, 'upgrade_vip', 'Assinou o Plano VIP (R$ 10,00/mês)');
        return { success: true, user: updatedUser };
      }
      return { success: false, error: updatedUser.error };
    } catch (error) {
      return { success: false, error: 'Erro de conexão' };
    }
  };

  // Compra avulsa de limite de capacidade (+10 produtos por R$ 5,00)
  const addExtraLimit = async (extraAmount = 10) => {
    if (!currentUser) return { success: false, error: 'Usuário não autenticado' };

    try {
      const response = await fetch(`http://localhost:5000/api/users/${currentUser.id}/upgrade`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ extraLimit: extraAmount })
      });
      
      const updatedUser = await response.json();
      if (response.ok) {
        setCurrentUser(updatedUser);
        localStorage.setItem('currentUser', JSON.stringify(updatedUser));
        await logActivity(currentUser.id, currentUser.name, 'buy_limit', `Comprou limite extra (+${extraAmount} produtos)`);
        return { success: true, user: updatedUser };
      }
      return { success: false, error: updatedUser.error };
    } catch (error) {
      return { success: false, error: 'Erro de conexão' };
    }
  };

  // =========================================================================
  //                    SISTEMA DE AUTENTICAÇÃO E CADASTRO
  // =========================================================================
  // O que faz: Gerencia a entrada de credenciais e a criação de novas contas.
  // Ao logar ou cadastrar, dispara eventos que alimentam o log de auditoria
  // que o produtor poderá visualizar no dashboard.

  // Login
  const login = async (email, password) => {
    try {
      const response = await fetch('http://localhost:5000/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      const data = await response.json();

      if (response.ok) {
        setCurrentUser(data);
        setIsAuthenticated(true);
        localStorage.setItem('currentUser', JSON.stringify(data));
        closeAuthModal();
        logActivity(data.id, data.name, 'login', 'Usuário fez login');
        return { success: true, user: data };
      } else {
        return { success: false, error: data.error };
      }
    } catch (error) {
      return { success: false, error: 'Erro ao conectar com o servidor' };
    }
  };

  // Logout
  const logout = () => {
    if (currentUser) {
      logActivity(currentUser.id, currentUser.name, 'logout', 'Usuário fez logout');
    }
    setCurrentUser(null);
    setIsAuthenticated(false);
    localStorage.removeItem('currentUser');
    closePlansModal();
  };

  // Registro de nova conta
  const register = async (name, email, password, role = 'client') => {
    try {
      const response = await fetch('http://localhost:5000/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password, role })
      });
      const data = await response.json();

      if (response.ok) {
        // Auto-login logic
        const newUser = {
          id: data.userId, name, email, role, plan: 'free', productLimit: role === 'producer' ? 10 : 0
        };
        setCurrentUser(newUser);
        setIsAuthenticated(true);
        localStorage.setItem('currentUser', JSON.stringify(newUser));
        closeAuthModal();
        logActivity(data.userId, name, 'register', 'Novo usuário cadastrado');
        return { success: true, user: newUser };
      } else {
        return { success: false, error: data.error };
      }
    } catch (error) {
      return { success: false, error: 'Erro ao conectar com o servidor' };
    }
  };

  // =========================================================================
  //              LOG DE ATIVIDADES DE CLIENTES (AUDITORIA EM TEMPO REAL)
  // =========================================================================
  // O que faz: Registra as ações cruciais de clientes no sistema.
  // Permite ao Produtor ver na Timeline o comportamento de navegação (visualizou, comprou).
  const logActivity = async (userId, userName, action, details) => {
    try {
      const response = await fetch('http://localhost:5000/api/activities', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, userName, action, details })
      });
      if (response.ok) {
        fetchActivities();
      }
    } catch (error) {
      console.error('Erro ao registrar atividade:', error);
    }
  };

  // Get activities for a specific user (for producers to see)
  const getUserActivities = (userId) => {
    return activities.filter(a => a.userId === userId);
  };

  // Get all activities (for producers)
  const getAllActivities = () => {
    return activities;
  };

  // Get all clients (for producers)
  const getAllClients = () => {
    return []; // Funcionalidade de listar todos clientes (somente mock)
  };

  // Check if current user is admin
  const isAdmin = () => {
    return currentUser && (currentUser.role === 'admin' || currentUser.plan === 'admin');
  };

  // Check if current user is producer or admin
  const isProducer = () => {
    return currentUser && (currentUser.role === 'producer' || currentUser.role === 'admin');
  };

  // Check if current user is client
  const isClient = () => {
    return currentUser && currentUser.role === 'client';
  };

  const value = {
    users: [],
    activities,
    currentUser,
    isAuthenticated,
    authModalOpen,
    authModalTab,
    authModalMessage,
    plansModalOpen,
    setAuthModalTab,
    openAuthModal,
    closeAuthModal,
    openPlansModal,
    closePlansModal,
    getTrialDaysRemaining,
    upgradeToVip,
    addExtraLimit,
    login,
    logout,
    register,
    logActivity,
    getUserActivities,
    getAllActivities,
    getAllClients,
    isAdmin,
    isProducer,
    isClient
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
