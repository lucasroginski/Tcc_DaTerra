import React from 'react';
import { X, Sparkles, CheckCircle2, QrCode } from 'lucide-react';

const SubscriptionSafraModal = ({ isOpen, onClose, onSubscribe }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fadeIn">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden relative border border-sage-100">
        <button onClick={onClose} className="absolute top-4 right-4 text-white hover:text-gray-200 z-10 p-2 bg-black/20 hover:bg-black/40 rounded-full transition-colors">
          <X size={20} />
        </button>

        <div className="bg-gradient-to-br from-honey-400 to-honey-600 p-8 text-center text-white">
          <Sparkles className="mx-auto mb-3" size={48} />
          <h2 className="text-2xl font-bold mb-2">Desbloqueie Safras Ilimitadas no DaTerra</h2>
          <p className="text-honey-50 text-sm font-medium">Eleve sua gestão agrícola para o próximo nível com o módulo Safra Pro.</p>
        </div>

        <div className="p-6">
          <div className="space-y-4 mb-8 bg-sage-50 rounded-2xl p-6 border border-sage-100">
            <div className="flex items-center gap-3">
              <CheckCircle2 className="text-sage-600 shrink-0" size={20} />
              <span className="text-sm text-gray-700 font-medium">Múltiplos lotes simultâneos</span>
            </div>
            <div className="flex items-center gap-3">
              <CheckCircle2 className="text-sage-600 shrink-0" size={20} />
              <span className="text-sm text-gray-700 font-medium">Alertas climáticos por região</span>
            </div>
            <div className="flex items-center gap-3">
              <CheckCircle2 className="text-sage-600 shrink-0" size={20} />
              <span className="text-sm text-gray-700 font-medium">Cálculo de custo da safra</span>
            </div>
            <div className="flex items-center gap-3">
              <QrCode className="text-sage-600 shrink-0" size={20} />
              <span className="text-sm text-gray-700 font-medium">Etiquetas QR Code ilimitadas</span>
            </div>
          </div>

          <div className="text-center mb-6">
            <p className="text-4xl font-black text-sage-800 tracking-tight">R$ 10,00<span className="text-sm text-gray-500 font-medium tracking-normal">/mês</span></p>
          </div>

          <button onClick={onSubscribe} className="w-full bg-sage-600 hover:bg-sage-700 text-white font-bold py-4 rounded-2xl shadow-lg transition-all hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-2">
            Assinar via PIX Instantâneo
          </button>
        </div>
      </div>
    </div>
  );
};
export default SubscriptionSafraModal;
