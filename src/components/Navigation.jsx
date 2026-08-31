import React from 'react';
import { useApp } from '../context/AppContext';
import { useAuth } from '../context/AuthContext';
import { Store, Package, ShoppingCart, Users, LayoutDashboard, Clock } from 'lucide-react';

const Navigation = () => {
  const { currentScreen, setCurrentScreen } = useApp();
  const { isProducer } = useAuth();

  // Navigation Items
  const navItems = [];

  if (isProducer()) {
    navItems.push(
      { id: 'dashboard', label: 'Painel', icon: LayoutDashboard },
      { id: 'inventory', label: 'Estoque', icon: Package },
      { id: 'pos', label: 'Vendas', icon: ShoppingCart },
      { id: 'activities', label: 'Atividades', icon: Users }
    );
  } else {
    navItems.push(
      { id: 'catalog', label: 'Vitrine', icon: Store },
      { id: 'orders', label: 'Pedidos', icon: Clock }
    );
  }

  // If there's only 1 item and user is a guest/client, we can keep the bottom bar clean or compact
  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-md border-t border-sage-200 shadow-lg z-40">
      <div className="max-w-md mx-auto flex justify-around items-center h-16 px-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentScreen === item.id;
          
          return (
            <button
              key={item.id}
              onClick={() => setCurrentScreen(item.id)}
              className={`flex flex-col items-center justify-center flex-1 py-1 px-2 transition-all rounded-xl ${
                isActive 
                  ? 'text-sage-700 font-bold bg-sage-50 scale-105' 
                  : 'text-gray-400 hover:text-sage-600 font-medium'
              }`}
            >
              <Icon size={22} className={isActive ? 'stroke-[2.5px] text-sage-600' : ''} />
              <span className="text-[11px] mt-1 tracking-tight">{item.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};

export default Navigation;
