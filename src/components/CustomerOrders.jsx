import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useApp } from '../context/AppContext';
import { Package, Truck, Bike, CheckCircle, Clock, AlertTriangle, MessageCircle, HelpCircle, X, MessageSquare, Check, EyeOff } from 'lucide-react';
import ChatWindow from './ChatWindow';

const CustomerOrders = () => {
  const { currentUser } = useAuth();
  const { fetchClientOrders, reportIssue, resolveIssue, hideOrder } = useApp();
  
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Modal states
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // Chat states
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [chatProducerId, setChatProducerId] = useState(null);
  
  // Form states
  const [issueReason, setIssueReason] = useState('Pedido atrasado');
  const [issueDetails, setIssueDetails] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  useEffect(() => {
    const loadOrders = async () => {
      if (currentUser?.id) {
        try {
          setLoading(true);
          const data = await fetchClientOrders(currentUser.id);
          setOrders(data);
        } catch (error) {
          console.error("Erro ao carregar pedidos", error);
        } finally {
          setLoading(false);
        }
      }
    };
    loadOrders();
  }, [currentUser]);

  const openHelpModal = (order) => {
    setSelectedOrder(order);
    setIsModalOpen(true);
    setSubmitSuccess(false);
    setIssueDetails('');
    setIssueReason('Pedido atrasado');
  };

  const closeHelpModal = () => {
    setIsModalOpen(false);
    setSelectedOrder(null);
  };

  const handleWhatsAppClick = () => {
    if (!selectedOrder) return;
    const msg = `Olá! Gostaria de informações sobre meu pedido #DAT-2026-${String(selectedOrder.id).padStart(3, '0')} na plataforma DaTerra.`;
    // Simulando número do suporte ou produtor
    const phone = '5511999999999'; 
    window.open(`https://wa.me/${phone}?text=${encodeURIComponent(msg)}`, '_blank');
  };

  const handleIssueSubmit = async (e) => {
    e.preventDefault();
    if (!selectedOrder) return;
    
    setIsSubmitting(true);
    try {
      await reportIssue(selectedOrder.id, {
        reason: issueReason,
        details: issueDetails
      });
      setSubmitSuccess(true);
      setTimeout(() => {
        closeHelpModal();
      }, 3000);
    } catch (error) {
      alert("Erro ao registrar ocorrência. Tente novamente.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Helper function for the Tracking Stepper
  const getStepperStatus = (status) => {
    const steps = [
      { id: 'pendente', label: 'Pedido Confirmado', icon: Clock },
      { id: 'em_separacao', label: 'Em Separação', icon: Package },
      { id: 'em_rota', label: 'Saiu para Entrega', icon: Truck },
      { id: 'entregue', label: 'Entregue', icon: CheckCircle }
    ];

    const currentIndex = steps.findIndex(s => s.id === status) !== -1 
                         ? steps.findIndex(s => s.id === status) 
                         : 0; // Default to 'pendente' se não achar

    return { steps, currentIndex };
  };

  const handleResolveIssue = async (occurrenceId) => {
    try {
      await resolveIssue(occurrenceId);
      alert('Reclamação marcada como resolvida!');
      loadOrders(); // Recarrega para sumir o botão de reclamação
    } catch (error) {
      alert('Erro ao resolver reclamação.');
    }
  };

  const handleHideOrder = async (saleId) => {
    if (confirm('Tem certeza que deseja ocultar este pedido do seu histórico?')) {
      try {
        await hideOrder(saleId);
        loadOrders(); // Recarrega para sumir com o pedido
      } catch (error) {
        alert('Erro ao ocultar pedido.');
      }
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-sage-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 pb-24">
      <div className="flex items-center gap-3 mb-8">
        <div className="bg-sage-100 p-3 rounded-2xl text-sage-600">
          <Package size={28} />
        </div>
        <div>
          <h1 className="text-2xl font-extrabold text-sage-800">Meus Pedidos</h1>
          <p className="text-gray-500 text-sm mt-1">Acompanhe suas compras em tempo real</p>
        </div>
      </div>

      {orders.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-3xl shadow-sm border border-sage-100">
          <Package size={48} className="mx-auto text-gray-300 mb-4" />
          <h3 className="text-lg font-bold text-gray-700">Nenhum pedido encontrado</h3>
          <p className="text-gray-500 mt-2">Você ainda não realizou nenhuma compra.</p>
        </div>
      ) : (
        <div className="space-y-6">
          {orders.map((order) => {
            const { steps, currentIndex } = getStepperStatus(order.delivery_status);
            const isDelivered = order.delivery_status === 'entregue';
            
            return (
              <div key={order.id} className="bg-white rounded-3xl p-6 shadow-sm border border-sage-100 hover:shadow-md transition-shadow">
                
                {/* Header do Card */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-gray-100 pb-4 mb-6">
                  <div>
                    <h3 className="font-bold text-lg text-sage-800">Pedido #DAT-2026-{String(order.id).padStart(3, '0')}</h3>
                    <p className="text-xs text-gray-500 mt-1">
                      {new Date(order.date).toLocaleString('pt-BR')}
                    </p>
                  </div>
                  <div className="mt-3 sm:mt-0 flex items-center gap-2 bg-sage-50 text-sage-700 px-4 py-2 rounded-xl text-sm font-semibold">
                    {order.tipo_entrega === 'fiorino' ? <Truck size={16} /> : <Bike size={16} />}
                    <span className="capitalize">Rota {order.tipo_entrega}</span>
                  </div>
                </div>

                {/* Timeline Stepper */}
                <div className="relative mb-8">
                  {/* Linha de fundo */}
                  <div className="absolute top-5 left-8 right-8 h-1 bg-gray-100 rounded-full z-0 hidden sm:block"></div>
                  {/* Linha de progresso */}
                  <div 
                    className="absolute top-5 left-8 h-1 bg-honey-500 rounded-full z-0 transition-all duration-500 hidden sm:block" 
                    style={{ width: `${(currentIndex / (steps.length - 1)) * 100}%` }}
                  ></div>

                  <div className="flex flex-col sm:flex-row justify-between relative z-10 gap-4 sm:gap-0">
                    {steps.map((step, index) => {
                      const Icon = step.icon;
                      const isActive = index <= currentIndex;
                      const isCurrent = index === currentIndex;

                      return (
                        <div key={step.id} className="flex sm:flex-col items-center gap-4 sm:gap-2">
                          <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors ${
                            isActive ? 'bg-honey-500 text-white shadow-md' : 'bg-gray-100 text-gray-400'
                          } ${isCurrent ? 'ring-4 ring-honey-100' : ''}`}>
                            <Icon size={18} />
                          </div>
                          <span className={`text-xs font-semibold ${isActive ? 'text-sage-700' : 'text-gray-400'}`}>
                            {step.label}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {order.delivery_status === 'em_rota' && (
                  <div className="mb-6 bg-honey-50 border border-honey-200 text-honey-700 p-4 rounded-xl flex items-start gap-3">
                    <Truck size={20} className="shrink-0 mt-0.5" />
                    <p className="text-sm font-medium">Seu pedido está a caminho na {order.tipo_entrega === 'fiorino' ? 'Fiorino' : 'Moto'}! Fique atento(a) para recebê-lo.</p>
                  </div>
                )}

                {/* Itens do Pedido */}
                <div className="bg-gray-50 rounded-2xl p-4 mb-6">
                  <h4 className="text-sm font-bold text-gray-700 mb-3 uppercase tracking-wider">Resumo dos Itens</h4>
                  <ul className="space-y-2">
                    {order.items.map((item, idx) => (
                      <li key={idx} className="flex justify-between text-sm">
                        <span className="text-gray-600">{item.quantity}x {item.product_name}</span>
                        <span className="font-medium text-gray-800">R$ {(item.price * item.quantity).toFixed(2)}</span>
                      </li>
                    ))}
                  </ul>
                  <div className="border-t border-gray-200 mt-3 pt-3 flex flex-col gap-1">
                    <div className="flex justify-between text-sm text-gray-500">
                      <span>Subtotal</span>
                      <span>R$ {(order.total_value - order.valor_frete).toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-sm text-gray-500">
                      <span>Frete</span>
                      <span>R$ {order.valor_frete.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between font-bold text-sage-800 mt-1 text-base">
                      <span>Total Pago</span>
                      <span>R$ {order.total_value.toFixed(2)}</span>
                    </div>
                  </div>
                </div>

                {/* Ações */}
                <div className="flex justify-end gap-3 mt-4">
                  <button 
                    onClick={() => {
                      setChatProducerId(order.producer_id);
                      setIsChatOpen(true);
                    }}
                    className="flex items-center gap-2 text-sm font-bold bg-sage-50 text-sage-600 px-4 py-2 rounded-xl hover:bg-sage-100 transition-colors"
                  >
                    <MessageSquare size={16} />
                    Chat Interno
                  </button>
                  {order.occurrence_id ? (
                    <button 
                      onClick={() => handleResolveIssue(order.occurrence_id)}
                      className="flex items-center gap-2 text-sm font-bold bg-green-50 text-green-700 hover:bg-green-100 transition-colors px-4 py-2 rounded-xl"
                    >
                      <Check size={16} />
                      Marcar Problema como Resolvido
                    </button>
                  ) : (
                    <button 
                      onClick={() => openHelpModal(order)}
                      className="flex items-center gap-2 text-sm font-bold text-gray-500 hover:text-red-600 transition-colors px-4 py-2"
                    >
                      <AlertTriangle size={16} />
                      Reportar Problema
                    </button>
                  )}
                  {order.delivery_status === 'entregue' && (
                    <button 
                      onClick={() => handleHideOrder(order.id)}
                      className="flex items-center gap-2 text-sm font-bold bg-gray-100 text-gray-600 hover:bg-red-50 hover:text-red-600 transition-colors px-4 py-2 rounded-xl ml-auto"
                    >
                      <EyeOff size={16} />
                      Ocultar Pedido
                    </button>
                  )}
                </div>

              </div>
            );
          })}
        </div>
      )}

      {/* Modal de Suporte */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-gray-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-xl w-full max-w-md overflow-hidden animate-fadeIn">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-sage-50">
              <div className="flex items-center gap-3">
                <AlertTriangle size={24} className="text-honey-600" />
                <h2 className="font-extrabold text-lg text-sage-800">Central de Ajuda</h2>
              </div>
              <button onClick={closeHelpModal} className="text-gray-400 hover:text-gray-700">
                <X size={20} />
              </button>
            </div>

            <div className="p-6">
              {submitSuccess ? (
                <div className="text-center py-6">
                  <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
                    <CheckCircle size={32} />
                  </div>
                  <h3 className="font-bold text-lg text-gray-800">Ocorrência Enviada!</h3>
                  <p className="text-gray-500 mt-2 text-sm">O produtor foi notificado e entrará em contato em breve.</p>
                </div>
              ) : (
                <>
                  <p className="text-sm text-gray-600 mb-6">Como podemos ajudar com o pedido <strong>#DAT-2026-{String(selectedOrder?.id).padStart(3, '0')}</strong>?</p>
                  
                  {/* Opção WhatsApp */}
                  <button 
                    onClick={handleWhatsAppClick}
                    className="w-full flex items-center justify-center gap-2 bg-[#25D366] hover:bg-[#20bd5a] text-white font-bold py-3 px-4 rounded-xl transition-colors mb-6"
                  >
                    <MessageCircle size={20} />
                    Falar com o Produtor via WhatsApp
                  </button>

                  <div className="relative flex items-center justify-center mb-6">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-gray-200"></div>
                    </div>
                    <span className="relative bg-white px-4 text-xs font-medium text-gray-400 uppercase">Ou registre uma ocorrência</span>
                  </div>

                  {/* Formulário de Ocorrência */}
                  <form onSubmit={handleIssueSubmit} className="space-y-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-1">Motivo</label>
                      <select 
                        value={issueReason}
                        onChange={(e) => setIssueReason(e.target.value)}
                        className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-sage-500 focus:ring-1 focus:ring-sage-500 bg-gray-50"
                      >
                        <option value="Pedido atrasado">Pedido atrasado</option>
                        <option value="Não recebi meu pedido">Não recebi meu pedido</option>
                        <option value="Item danificado / faltando">Item danificado / faltando</option>
                        <option value="Outro">Outro</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-1">Detalhes Adicionais</label>
                      <textarea 
                        value={issueDetails}
                        onChange={(e) => setIssueDetails(e.target.value)}
                        placeholder="Explique o que aconteceu..."
                        rows={3}
                        className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-sage-500 focus:ring-1 focus:ring-sage-500 bg-gray-50 resize-none"
                      ></textarea>
                    </div>
                    <button 
                      type="submit" 
                      disabled={isSubmitting}
                      className="w-full bg-sage-600 hover:bg-sage-700 disabled:opacity-70 text-white font-bold py-3 px-4 rounded-xl transition-colors mt-2"
                    >
                      {isSubmitting ? 'Enviando...' : 'Enviar Ocorrência'}
                    </button>
                  </form>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Chat Window */}
      {isChatOpen && (
        <ChatWindow 
          isOpen={isChatOpen}
          onClose={() => setIsChatOpen(false)}
          currentUserId={currentUser.id}
          otherUserId={chatProducerId}
          otherUserName="Produtor DaTerra"
        />
      )}
    </div>
  );
};

export default CustomerOrders;
