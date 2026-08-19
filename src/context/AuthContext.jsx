// =========================================================================
//            AUTHCONTEXT.JSX - CONTEXTO GLOBAL DE AUTENTICAÇÃO E SAAS
// =========================================================================
// O que faz: Gerencia centralizadamente o estado de login, cadastro, papéis
// de acesso (roles) e a monetização do modelo SaaS da plataforma.
// Por que foi implementado assim: Em aplicações React de página única (SPA), 
// passar dados de login entre componentes distantes via props ("prop drilling")
// gera acoplamento ruim. O Context API resolve isso disponibilizando dados de
// sessão de maneira uniforme e reativa para qualquer tela que precise.

import React, { createContext, useContext, useState } from 'react';
import { initialUsers, initialActivities } from '../data/mockUsers';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth deve ser envelopado por um AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {

  const [users, setUsers] = useState(initialUsers);
  const [activities, setActivities] = useState(initialActivities);
  const [currentUser, setCurrentUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

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
  const upgradeToVip = () => {
    if (!currentUser) return { success: false, error: 'Usuário não autenticado' };

    const updatedUser = {
      ...currentUser,
      plan: 'vip',
      productLimit: Math.max(10, (currentUser.productLimit || 0))
    };

    setCurrentUser(updatedUser);
    setUsers(users.map(u => u.id === currentUser.id ? updatedUser : u));
    logActivity(currentUser.id, currentUser.name, 'upgrade_vip', 'Assinou o Plano VIP (R$ 10,00/mês)');
    
    return { success: true, user: updatedUser };
  };

  // Compra avulsa de limite de capacidade (+10 produtos por R$ 5,00)
  const addExtraLimit = (extraAmount = 10) => {
    if (!currentUser) return { success: false, error: 'Usuário não autenticado' };

    const currentLimit = currentUser.productLimit || 10;
    const updatedUser = {
      ...currentUser,
      productLimit: currentLimit + extraAmount
    };

    setCurrentUser(updatedUser);
    setUsers(users.map(u => u.id === currentUser.id ? updatedUser : u));
    logActivity(currentUser.id, currentUser.name, 'buy_limit', `Comprou limite extra (+${extraAmount} produtos)`);

    return { success: true, user: updatedUser };
  };

  // =========================================================================
  //                    SISTEMA DE AUTENTICAÇÃO E CADASTRO
  // =========================================================================
  // O que faz: Gerencia a entrada de credenciais e a criação de novas contas.
  // Ao logar ou cadastrar, dispara eventos que alimentam o log de auditoria
  // que o produtor poderá visualizar no dashboard.

  // Login
  const login = (email, password) => {
    const user = users.find(u => u.email === email && u.password === password);
    if (user) {
      setCurrentUser(user);
      setIsAuthenticated(true);
      closeAuthModal();
      
      // Registro de Auditoria / Atividade
      logActivity(user.id, user.name, 'login', 'Usuário fez login');
      return { success: true, user };
    }
    return { success: false, error: 'Email ou senha incorretos' };
  };

  // Logout
  const logout = () => {
    if (currentUser) {
      logActivity(currentUser.id, currentUser.name, 'logout', 'Usuário fez logout');
    }
    setCurrentUser(null);
    setIsAuthenticated(false);
    closePlansModal();
  };

  // Registro de nova conta
  const register = (name, email, password, role = 'client') => {
    if (users.find(u => u.email === email)) {
      return { success: false, error: 'Email já cadastrado' };
    }

    const newUser = {
      id: Math.max(...users.map(u => u.id), 0) + 1,
      name,
      email,
      password,
      role,
      createdAt: new Date().toISOString().split('T')[0],
      plan: 'free',
      productLimit: role === 'producer' ? 10 : 0
    };

    setUsers([...users, newUser]);
    setCurrentUser(newUser);
    setIsAuthenticated(true);
    closeAuthModal();
    
    // Registro de Auditoria / Atividade
    logActivity(newUser.id, newUser.name, 'register', 'Novo usuário cadastrado');
    
    return { success: true, user: newUser };
  };

  // =========================================================================
  //              LOG DE ATIVIDADES DE CLIENTES (AUDITORIA EM TEMPO REAL)
  // =========================================================================
  // O que faz: Registra as ações cruciais de clientes no sistema.
  // Permite ao Produtor ver na Timeline o comportamento de navegação (visualizou, comprou).
  const logActivity = (userId, userName, action, details) => {
    const newActivity = {
      id: Math.max(...activities.map(a => a.id), 0) + 1,
      userId,
      userName,
      action,
      details,
      timestamp: new Date().toISOString()
    };
    setActivities([newActivity, ...activities]);
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
    return users.filter(u => u.role === 'client');
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
    users,
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
