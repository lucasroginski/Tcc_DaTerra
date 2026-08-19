import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useApp } from '../context/AppContext';
import { X, LogIn, User, Lock, Mail, AlertCircle, CheckCircle2 } from 'lucide-react';

const AuthModal = () => {
  const {
    authModalOpen,
    authModalTab,
    authModalMessage,
    setAuthModalTab,
    closeAuthModal,
    login,
    register
  } = useAuth();
  const { setCurrentScreen } = useApp();

  // Login form state
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginError, setLoginError] = useState('');

  // Register form state
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regConfirmPassword, setRegConfirmPassword] = useState('');
  const [regRole, setRegRole] = useState('client');
  const [regError, setRegError] = useState('');

  // Reset fields when tab changes
  useEffect(() => {
    setLoginError('');
    setRegError('');
  }, [authModalTab]);

  if (!authModalOpen) return null;

  const handleLoginSubmit = (e) => {
    e.preventDefault();
    setLoginError('');
    const result = login(loginEmail, loginPassword);
    if (result.success) {
      if (result.user.role === 'producer' || result.user.role === 'admin') {
        setCurrentScreen('dashboard');
      } else {
        setCurrentScreen('catalog');
      }
    } else {
      setLoginError(result.error);
    }
  };

  const handleRegisterSubmit = (e) => {
    e.preventDefault();
    setRegError('');

    if (regPassword !== regConfirmPassword) {
      setRegError('As senhas não coincidem');
      return;
    }

    if (regPassword.length < 6) {
      setRegError('A senha deve ter pelo menos 6 caracteres');
      return;
    }

    const result = register(regName, regEmail, regPassword, regRole);
    if (result.success) {
      if (result.user.role === 'producer' || result.user.role === 'admin') {
        setCurrentScreen('dashboard');
      } else {
        setCurrentScreen('catalog');
      }
    } else {
      setRegError(result.error);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fadeIn">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden relative border border-sage-100">
        
        {/* Close Button */}
        <button
          onClick={closeAuthModal}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 bg-gray-100 hover:bg-gray-200 p-2 rounded-full transition-colors z-10"
          aria-label="Fechar"
        >
          <X size={20} />
        </button>

        {/* Modal Header & Tabs */}
        <div className="pt-8 px-8 pb-4 text-center">
          <h2 className="text-2xl font-bold text-sage-700">DaTerra</h2>
          <p className="text-xs text-gray-500 mt-1">Conectando você aos produtores locais</p>

          {/* Action Prompt Message (e.g., Guest tried to buy) */}
          {authModalMessage && (
            <div className="mt-4 p-3 bg-honey-50 border border-honey-200 rounded-xl text-honey-800 text-xs font-medium flex items-center gap-2 text-left">
              <AlertCircle size={18} className="text-honey-600 shrink-0" />
              <span>{authModalMessage}</span>
            </div>
          )}

          {/* Tab Selector Header */}
          <div className="flex bg-sage-50 p-1.5 rounded-2xl mt-5 border border-sage-100">
            <button
              onClick={() => setAuthModalTab('login')}
              className={`flex-1 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                authModalTab === 'login'
                  ? 'bg-sage-500 text-white shadow-md'
                  : 'text-sage-700 hover:text-sage-900'
              }`}
            >
              Fazer Login
            </button>
            <button
              onClick={() => setAuthModalTab('register')}
              className={`flex-1 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                authModalTab === 'register'
                  ? 'bg-honey-500 text-white shadow-md'
                  : 'text-sage-700 hover:text-sage-900'
              }`}
            >
              Cadastre-se
            </button>
          </div>
        </div>

        {/* Modal Content / Forms */}
        <div className="px-8 pb-8">
          {authModalTab === 'login' ? (
            <form onSubmit={handleLoginSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Email</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                  <input
                    type="email"
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-sage-500"
                    placeholder="seu@email.com"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Senha</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                  <input
                    type="password"
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-sage-500"
                    placeholder="••••••••"
                    required
                  />
                </div>
              </div>

              {loginError && (
                <div className="bg-red-50 border border-red-200 text-red-600 p-3 rounded-xl text-xs font-medium flex items-center gap-2">
                  <AlertCircle size={16} />
                  <span>{loginError}</span>
                </div>
              )}

              <button
                type="submit"
                className="w-full bg-sage-500 hover:bg-sage-600 text-white rounded-xl py-3 transition-colors font-semibold text-sm flex items-center justify-center gap-2 shadow-md mt-2"
              >
                <LogIn size={18} />
                Entrar
              </button>

              <div className="text-center pt-2">
                <p className="text-xs text-gray-500">
                  Ainda não tem conta?{' '}
                  <button
                    type="button"
                    onClick={() => setAuthModalTab('register')}
                    className="text-honey-600 hover:text-honey-700 font-bold underline"
                  >
                    Cadastre-se agora
                  </button>
                </p>
              </div>

              {/* Demo Credentials Box */}
              <div className="mt-4 p-3 bg-sage-50 rounded-xl border border-sage-200/60 text-xs">
                <p className="text-sage-800 font-semibold mb-1">Credenciais de Teste:</p>
                <p className="text-purple-700 font-mono">Admin: admin@daterra.com | admin123</p>
                <p className="text-gray-600 font-mono">Produtor: joao@daterra.com | admin123</p>
                <p className="text-gray-600 font-mono">Cliente: carlos@email.com | cliente123</p>
              </div>
            </form>
          ) : (
            <form onSubmit={handleRegisterSubmit} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Nome Completo</label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                  <input
                    type="text"
                    value={regName}
                    onChange={(e) => setRegName(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-honey-500"
                    placeholder="Seu nome"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Email</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                  <input
                    type="email"
                    value={regEmail}
                    onChange={(e) => setRegEmail(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-honey-500"
                    placeholder="seu@email.com"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Tipo de Conta</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setRegRole('client')}
                    className={`py-2 px-3 rounded-xl border text-xs font-semibold transition-all ${
                      regRole === 'client'
                        ? 'border-honey-500 bg-honey-50 text-honey-700 ring-2 ring-honey-500/20'
                        : 'border-gray-200 text-gray-500 hover:bg-gray-50'
                    }`}
                  >
                    Cliente / Comprador
                  </button>
                  <button
                    type="button"
                    onClick={() => setRegRole('producer')}
                    className={`py-2 px-3 rounded-xl border text-xs font-semibold transition-all ${
                      regRole === 'producer'
                        ? 'border-sage-500 bg-sage-50 text-sage-700 ring-2 ring-sage-500/20'
                        : 'border-gray-200 text-gray-500 hover:bg-gray-50'
                    }`}
                  >
                    Produtor Regional
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Senha</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                  <input
                    type="password"
                    value={regPassword}
                    onChange={(e) => setRegPassword(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-honey-500"
                    placeholder="Mínimo 6 caracteres"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Confirmar Senha</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                  <input
                    type="password"
                    value={regConfirmPassword}
                    onChange={(e) => setRegConfirmPassword(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-honey-500"
                    placeholder="Confirme sua senha"
                    required
                  />
                </div>
              </div>

              {regError && (
                <div className="bg-red-50 border border-red-200 text-red-600 p-3 rounded-xl text-xs font-medium flex items-center gap-2">
                  <AlertCircle size={16} />
                  <span>{regError}</span>
                </div>
              )}

              <button
                type="submit"
                className="w-full bg-honey-500 hover:bg-honey-600 text-white rounded-xl py-3 transition-colors font-semibold text-sm flex items-center justify-center gap-2 shadow-md mt-2"
              >
                <CheckCircle2 size={18} />
                Criar Minha Conta
              </button>

              <div className="text-center pt-2">
                <p className="text-xs text-gray-500">
                  Já possui uma conta?{' '}
                  <button
                    type="button"
                    onClick={() => setAuthModalTab('login')}
                    className="text-sage-600 hover:text-sage-700 font-bold underline"
                  >
                    Fazer Login
                  </button>
                </p>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default AuthModal;
