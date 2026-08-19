import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useApp } from '../context/AppContext';
import { X, Crown, Sparkles, CheckCircle2, ShieldCheck, Zap, PackagePlus, AlertTriangle } from 'lucide-react';

const PlansModal = () => {
  const {
    plansModalOpen,
    closePlansModal,
    currentUser,
    getTrialDaysRemaining,
    upgradeToVip,
    addExtraLimit,
    isAdmin
  } = useAuth();

  const { products } = useApp();
  const [successMessage, setSuccessMessage] = useState('');

  if (!plansModalOpen || !currentUser) return null;

  const trialDays = getTrialDaysRemaining(currentUser);
  const currentProductLimit = currentUser.productLimit || 10;
  const usedProductsCount = products.length;
  const isVip = currentUser.plan === 'vip';
  const isUserAdmin = isAdmin();

  const handleUpgradeVip = () => {
    const res = upgradeToVip();
    if (res.success) {
      setSuccessMessage('🎉 Pagamento Aprovado! Você agora é um Produtor VIP com limite liberado!');
      setTimeout(() => {
        setSuccessMessage('');
      }, 4000);
    }
  };

  const handleBuyLimit = () => {
    const res = addExtraLimit(10);
    if (res.success) {
      setSuccessMessage('✅ Limite de Estoque expandido em +10 produtos com sucesso!');
      setTimeout(() => {
        setSuccessMessage('');
      }, 4000);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/65 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fadeIn">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden relative border border-sage-100 max-h-[90vh] flex flex-col">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-sage-700 via-sage-600 to-honey-600 p-6 text-white relative">
          <button
            onClick={closePlansModal}
            className="absolute top-4 right-4 text-white/80 hover:text-white bg-black/20 hover:bg-black/40 p-2 rounded-full transition-colors"
            aria-label="Fechar"
          >
            <X size={20} />
          </button>
          
          <div className="flex items-center gap-2 text-honey-300 text-xs font-bold uppercase tracking-wider mb-1">
            <Crown size={18} />
            <span>Monetização & Assinaturas SaaS</span>
          </div>
          <h2 className="text-2xl font-black">Planos e Limites DaTerra</h2>
          <p className="text-xs text-sage-100 mt-1">
            Gerencie sua assinatura, aumente o estoque e alavanque suas vendas regionais.
          </p>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-5">

          {/* Toast Notification */}
          {successMessage && (
            <div className="bg-green-50 border border-green-300 text-green-800 p-3.5 rounded-2xl text-xs font-semibold flex items-center gap-2 animate-bounce">
              <CheckCircle2 size={20} className="text-green-600 shrink-0" />
              <span>{successMessage}</span>
            </div>
          )}

          {/* Current Account Status Box */}
          <div className="bg-sage-50 border border-sage-200 rounded-2xl p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-sage-600 uppercase">Seu Plano Atual</span>
              {isUserAdmin ? (
                <span className="bg-purple-100 text-purple-800 text-[11px] font-black px-2.5 py-0.5 rounded-full flex items-center gap-1">
                  <ShieldCheck size={14} /> Admin Geral
                </span>
              ) : isVip ? (
                <span className="bg-honey-100 text-honey-800 text-[11px] font-black px-2.5 py-0.5 rounded-full flex items-center gap-1">
                  <Crown size={14} /> VIP Ativo
                </span>
              ) : (
                <span className="bg-sage-200 text-sage-800 text-[11px] font-black px-2.5 py-0.5 rounded-full">
                  Teste Grátis
                </span>
              )}
            </div>

            <div className="grid grid-cols-2 gap-3 mt-3">
              <div className="bg-white p-3 rounded-xl border border-sage-100">
                <p className="text-[11px] text-gray-500 font-medium">Capacidade do Estoque</p>
                <p className="text-lg font-bold text-sage-800">
                  {usedProductsCount} <span className="text-xs text-gray-400 font-normal">/ {isUserAdmin ? '∞' : currentProductLimit} un</span>
                </p>
              </div>

              <div className="bg-white p-3 rounded-xl border border-sage-100">
                <p className="text-[11px] text-gray-500 font-medium">Status de Validade</p>
                <p className="text-sm font-bold text-sage-800">
                  {isUserAdmin ? (
                    <span className="text-purple-600">Acesso Vitalício</span>
                  ) : isVip ? (
                    <span className="text-green-600">Ativo (Mensal)</span>
                  ) : (
                    <span className="text-honey-600">{trialDays} dias restantes</span>
                  )}
                </p>
              </div>
            </div>
          </div>

          {/* SaaS Plan Options */}
          <div className="space-y-4">
            
            {/* Option 1: VIP Plan */}
            <div className={`rounded-2xl p-5 border transition-all ${
              isVip 
                ? 'bg-honey-50/50 border-honey-300 ring-2 ring-honey-400/20' 
                : 'bg-white border-sage-200 hover:border-honey-400 shadow-sm'
            }`}>
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <Crown className="text-honey-500" size={20} />
                    <h3 className="font-bold text-sage-800 text-base">Plano VIP (Produtor Pro)</h3>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    Direito ao cadastro de até 10 produtos no estoque e selo de produtor oficial.
                  </p>
                </div>
                <div className="text-right shrink-0 ml-2">
                  <span className="text-xs text-gray-400">R$</span>
                  <span className="text-xl font-black text-honey-600">10,00</span>
                  <span className="text-[10px] text-gray-400 block">/mês</span>
                </div>
              </div>

              <ul className="mt-3 space-y-1.5 text-xs text-gray-600">
                <li className="flex items-center gap-1.5">
                  <CheckCircle2 size={14} className="text-sage-500 shrink-0" />
                  <span>Até 10 produtos no catálogo oficial</span>
                </li>
                <li className="flex items-center gap-1.5">
                  <CheckCircle2 size={14} className="text-sage-500 shrink-0" />
                  <span>Destaque nas buscas e suporte prioritário</span>
                </li>
              </ul>

              <button
                onClick={handleUpgradeVip}
                disabled={isVip || isUserAdmin}
                className={`w-full mt-4 py-3 rounded-xl text-xs font-bold transition-all shadow-sm flex items-center justify-center gap-2 ${
                  isVip || isUserAdmin
                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed border border-gray-200'
                    : 'bg-honey-500 hover:bg-honey-600 active:bg-honey-700 text-white'
                }`}
              >
                <Zap size={16} />
                <span>{isVip ? 'Plano VIP Ativo' : isUserAdmin ? 'Acesso Admin (Livre)' : 'Assinar Plano VIP (R$ 10,00)'}</span>
              </button>
            </div>

            {/* Option 2: Extra Stock Limit */}
            <div className="bg-white rounded-2xl p-5 border border-sage-200 hover:border-sage-400 shadow-sm transition-all">
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <PackagePlus className="text-sage-600" size={20} />
                    <h3 className="font-bold text-sage-800 text-base">Comprar Limite Extra</h3>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    Adicione capacidade extra de estoque em blocos adicionais de 10 produtos.
                  </p>
                </div>
                <div className="text-right shrink-0 ml-2">
                  <span className="text-xs text-gray-400">R$</span>
                  <span className="text-xl font-black text-sage-700">5,00</span>
                  <span className="text-[10px] text-gray-400 block">por +10 un</span>
                </div>
              </div>

              <ul className="mt-3 space-y-1.5 text-xs text-gray-600">
                <li className="flex items-center gap-1.5">
                  <CheckCircle2 size={14} className="text-sage-500 shrink-0" />
                  <span>Expansão imediata do limite de produtos (+10 unidades)</span>
                </li>
                <li className="flex items-center gap-1.5">
                  <CheckCircle2 size={14} className="text-sage-500 shrink-0" />
                  <span>Sem mensalidades adicionais recorrentes</span>
                </li>
              </ul>

              <button
                onClick={handleBuyLimit}
                disabled={isUserAdmin}
                className={`w-full mt-4 py-3 rounded-xl text-xs font-bold transition-all shadow-sm flex items-center justify-center gap-2 ${
                  isUserAdmin
                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed border border-gray-200'
                    : 'bg-sage-500 hover:bg-sage-600 active:bg-sage-700 text-white'
                }`}
              >
                <PackagePlus size={16} />
                <span>{isUserAdmin ? 'Admin Possui Capacidade Ilimitada' : 'Comprar +10 Produtos (R$ 5,00)'}</span>
              </button>
            </div>

          </div>

        </div>

        {/* Footer */}
        <div className="p-4 bg-gray-50 border-t border-gray-100 text-center">
          <p className="text-[11px] text-gray-500 font-medium">
            Simulação de Regra de Negócio SaaS para apresentação de TCC DaTerra.
          </p>
        </div>

      </div>
    </div>
  );
};

export default PlansModal;
