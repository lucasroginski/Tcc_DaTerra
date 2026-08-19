import React from 'react';
import { useAuth } from '../context/AuthContext';
import { useApp } from '../context/AppContext';
import { Leaf, LogIn, UserPlus, LogOut, Crown, ShieldCheck, Clock, ShoppingCart } from 'lucide-react';

const Header = () => {
  const { currentUser, isAuthenticated, logout, openAuthModal, openPlansModal, getTrialDaysRemaining, isAdmin, isProducer } = useAuth();
  const { setCurrentScreen, setCartDrawerOpen, getTotalCartItemsCount } = useApp();

  const handleLogout = () => {
    logout();
    setCurrentScreen('catalog');
  };

  const trialDays = getTrialDaysRemaining(currentUser);
  const isVip = currentUser?.plan === 'vip';
  const isUserAdmin = isAdmin();
  const isUserProducer = isProducer();
  const totalCartCount = getTotalCartItemsCount();

  return (
    <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-sage-100 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
        
        {/* Brand / Logo */}
        <button
          onClick={() => setCurrentScreen(isUserProducer ? 'dashboard' : 'catalog')}
          className="flex items-center gap-2 text-left group focus:outline-none"
        >
          <div className="bg-sage-500 text-white p-2 rounded-2xl shadow-sm group-hover:scale-105 transition-transform">
            <Leaf size={22} />
          </div>
          <div>
            <h1 className="text-xl font-bold text-sage-700 tracking-tight leading-none">DaTerra</h1>
            <p className="text-[10px] text-sage-600 font-medium tracking-wide">PRODUTOS REGIONAIS</p>
          </div>
        </button>

        {/* Right Action Section */}
        <div className="flex items-center gap-2 sm:gap-3">
          
          {/* Header Cart Button with Realtime Count Badge */}
          {!isUserProducer && (
            <button
              onClick={() => setCartDrawerOpen(true)}
              className="relative bg-sage-50 hover:bg-sage-100 border border-sage-200 text-sage-700 p-2 sm:px-3 sm:py-2 rounded-xl transition-all flex items-center gap-1.5 focus:outline-none"
              title="Ver Carrinho de Compras"
            >
              <ShoppingCart size={20} className="text-sage-600" />
              <span className="hidden sm:inline text-xs font-bold text-sage-800">Carrinho</span>
              {totalCartCount > 0 && (
                <span className="absolute -top-1.5 -right-1.5 bg-honey-500 text-white text-[10px] font-black w-5 h-5 rounded-full flex items-center justify-center shadow-md animate-scaleIn">
                  {totalCartCount}
                </span>
              )}
            </button>
          )}

          {!isAuthenticated ? (
            /* Guest Mode: "Entrar" e "Criar Conta" lado a lado */
            <div className="flex items-center gap-2">
              <button
                onClick={() => openAuthModal('login')}
                className="bg-sage-500 hover:bg-sage-600 active:bg-sage-700 text-white px-3 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all shadow-sm flex items-center gap-1.5"
                title="Fazer Login"
              >
                <LogIn size={16} />
                <span>Entrar</span>
              </button>

              <button
                onClick={() => openAuthModal('register')}
                className="bg-honey-500 hover:bg-honey-600 active:bg-honey-700 text-white px-3 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all shadow-sm flex items-center gap-1.5"
                title="Criar Conta"
              >
                <UserPlus size={16} />
                <span className="hidden xs:inline">Criar Conta</span>
              </button>
            </div>
          ) : (
            /* Authenticated Mode: Status do Plano, "Olá, [Nome]" & Logout */
            <div className="flex items-center gap-2 sm:gap-3">
              
              {/* SaaS Plan Status Badge */}
              <button
                onClick={openPlansModal}
                className="transition-transform hover:scale-105 focus:outline-none"
                title="Gerenciar Plano e Limites SaaS"
              >
                {isUserProducer ? (
                  isVip || isUserAdmin ? (
                    <div className="bg-honey-50 hover:bg-honey-100 border border-honey-300 text-honey-850 px-2.5 py-1.5 rounded-xl text-[11px] font-extrabold flex items-center gap-1.5 shadow-sm">
                      <Crown size={14} className="text-honey-600 shrink-0" />
                      <span>Produtor VIP</span>
                    </div>
                  ) : (
                    <div className="bg-sage-50 hover:bg-sage-100 border border-sage-200 text-sage-850 px-2.5 py-1.5 rounded-xl text-[11px] font-extrabold flex items-center gap-1.5 shadow-sm">
                      <ShieldCheck size={14} className="text-sage-650 shrink-0" />
                      <span>Perfil: Produtor Rural</span>
                    </div>
                  )
                ) : isUserAdmin ? (
                  <div className="bg-purple-50 hover:bg-purple-100 border border-purple-300 text-purple-800 px-2.5 py-1.5 rounded-xl text-[11px] font-bold flex items-center gap-1.5 shadow-sm">
                    <ShieldCheck size={14} className="text-purple-600 shrink-0" />
                    <span className="hidden md:inline">Admin (Ilimitado)</span>
                    <span className="md:hidden">Admin</span>
                  </div>
                ) : null}
              </button>

              {/* User Profile Badge */}
              <div className="flex items-center gap-2 bg-sage-50 border border-sage-200 px-2.5 py-1.5 rounded-xl">
                <div className="w-6 h-6 rounded-full bg-sage-500 text-white flex items-center justify-center text-xs font-bold">
                  {currentUser?.name?.charAt(0).toUpperCase()}
                </div>
                <div className="text-left hidden lg:block">
                  <p className="text-xs font-bold text-sage-800 leading-tight">
                    Olá, {currentUser?.name}
                  </p>
                  <span className="text-[10px] text-sage-600 font-medium">
                    {isUserAdmin ? 'Administrador' : currentUser?.role === 'producer' ? 'Produtor' : 'Cliente'}
                  </span>
                </div>
              </div>

              {/* Logout Button */}
              <button
                onClick={handleLogout}
                className="bg-gray-100 hover:bg-red-50 text-gray-600 hover:text-red-600 p-2 sm:px-3 sm:py-2 rounded-xl text-xs sm:text-sm font-semibold transition-colors flex items-center gap-1.5 border border-gray-200"
                title="Encerrar sessão"
              >
                <LogOut size={16} />
                <span className="hidden md:inline">Sair</span>
              </button>

            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
