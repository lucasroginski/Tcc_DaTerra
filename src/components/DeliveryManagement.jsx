import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { useAuth } from '../context/AuthContext';
import { Truck, Bike, MapPin, Phone, CheckCircle2, Clock, Printer, Search, Package, AlertTriangle, MessageCircle } from 'lucide-react';

const DeliveryManagement = () => {
  const { fetchDeliveries, changeDeliveryStatus, fetchProducerOccurrences } = useApp();
  const { currentUser } = useAuth();
  
  const [deliveries, setDeliveries] = useState([]);
  const [occurrences, setOccurrences] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('todos'); // 'todos', 'fiorino', 'moto', 'entregues'
  const [searchTerm, setSearchTerm] = useState('');

  const loadDeliveries = async () => {
    try {
      setLoading(true);
      const data = await fetchDeliveries(currentUser.id);
      setDeliveries(data);
      
      const occData = await fetchProducerOccurrences(currentUser.id);
      setOccurrences(occData);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDeliveries();
  }, []);

  const handleStatusChange = async (saleId, newStatus) => {
    try {
      await changeDeliveryStatus(saleId, newStatus);
      // Reload deliveries or update local state
      setDeliveries(deliveries.map(d => d.id === saleId ? { ...d, delivery_status: newStatus } : d));
    } catch (error) {
      alert("Erro ao atualizar o status");
    }
  };

  const openWhatsApp = (phone) => {
    const numericPhone = phone.replace(/\D/g, '');
    window.open(`https://wa.me/55${numericPhone}`, '_blank');
  };

  const openMaps = (address) => {
    window.open(`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`, '_blank');
  };

  const printRomaneio = () => {
    window.print();
  };

  const filteredDeliveries = deliveries.filter(d => {
    const matchesSearch = d.client_name.toLowerCase().includes(searchTerm.toLowerCase()) || d.id.toString().includes(searchTerm);
    
    if (filter === 'todos') return d.delivery_status !== 'entregue' && matchesSearch;
    if (filter === 'entregues') return d.delivery_status === 'entregue' && matchesSearch;
    if (filter === 'fiorino') return d.tipo_entrega === 'fiorino' && d.delivery_status !== 'entregue' && matchesSearch;
    if (filter === 'moto') return d.tipo_entrega === 'moto' && d.delivery_status !== 'entregue' && matchesSearch;
    return true;
  });

  const fiorinoCount = deliveries.filter(d => d.tipo_entrega === 'fiorino' && d.delivery_status !== 'entregue').length;
  const motoCount = deliveries.filter(d => d.tipo_entrega === 'moto' && d.delivery_status !== 'entregue').length;
  const completedCount = deliveries.filter(d => d.delivery_status === 'entregue').length;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-sage-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h2 className="text-xl font-black text-sage-900 flex items-center gap-2">
          <Truck className="text-sage-600" />
          Gestão de Entregas & Expedição
        </h2>
        <button 
          onClick={printRomaneio}
          className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-xl font-bold text-sm flex items-center gap-2 transition-colors print:hidden"
        >
          <Printer size={16} />
          Imprimir Rota do Dia
        </button>
      </div>

      {/* Alertas de Ocorrências / Reclamações */}
      {occurrences.length > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-3xl p-5 shadow-sm print:hidden">
          <div className="flex items-center gap-2 mb-4">
            <AlertTriangle className="text-red-650" size={24} />
            <h2 className="font-extrabold text-red-800 text-lg">
              Reclamações e Ocorrências Pendentes ({occurrences.length})
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {occurrences.map(occ => (
              <div key={occ.occurrence_id} className="bg-white p-4 rounded-2xl border border-red-100 shadow-sm flex flex-col justify-between">
                <div>
                  <div className="flex justify-between items-start mb-2">
                    <span className="bg-red-100 text-red-700 text-xs font-bold px-2 py-1 rounded">Pedido #{occ.sale_id}</span>
                    <span className="text-xs text-gray-500">{new Date(occ.created_at).toLocaleDateString('pt-BR')}</span>
                  </div>
                  <h4 className="font-bold text-gray-800">{occ.client_name}</h4>
                  <p className="text-sm font-semibold text-red-600 mt-1">{occ.reason}</p>
                  <p className="text-sm text-gray-600 mt-2 bg-gray-50 p-2 rounded-lg italic">"{occ.details}"</p>
                </div>
                <button 
                  onClick={() => openWhatsApp(occ.client_phone)}
                  className="mt-4 flex items-center justify-center gap-2 bg-[#25D366] hover:bg-[#20bd5a] text-white py-2 px-4 rounded-xl text-sm font-bold transition-colors w-full"
                >
                  <MessageCircle size={16} /> Resolver via WhatsApp
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Resumo do Dia */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 print:hidden">
        <div className="bg-white p-5 rounded-2xl border border-sage-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-sm text-sage-600 font-bold mb-1">Rota Fiorino</p>
            <p className="text-3xl font-black text-sage-900">{fiorinoCount}</p>
          </div>
          <div className="bg-sage-100 p-3 rounded-xl text-sage-600">
            <Truck size={28} />
          </div>
        </div>
        
        <div className="bg-white p-5 rounded-2xl border border-honey-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-sm text-honey-700 font-bold mb-1">Express Moto</p>
            <p className="text-3xl font-black text-honey-900">{motoCount}</p>
          </div>
          <div className="bg-honey-100 p-3 rounded-xl text-honey-600">
            <Bike size={28} />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-500 font-bold mb-1">Concluídas</p>
            <p className="text-3xl font-black text-gray-800">{completedCount}</p>
          </div>
          <div className="bg-green-100 p-3 rounded-xl text-green-600">
            <CheckCircle2 size={28} />
          </div>
        </div>
      </div>

      {/* Filtros e Busca */}
      <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-200 flex flex-col md:flex-row md:items-center justify-between gap-4 print:hidden">
        <div className="flex overflow-x-auto pb-2 md:pb-0 gap-2">
          <button 
            onClick={() => setFilter('todos')}
            className={`px-4 py-2 rounded-xl text-sm font-bold whitespace-nowrap transition-colors ${filter === 'todos' ? 'bg-sage-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
          >
            Todos Pendentes
          </button>
          <button 
            onClick={() => setFilter('fiorino')}
            className={`px-4 py-2 rounded-xl text-sm font-bold whitespace-nowrap transition-colors flex items-center gap-1.5 ${filter === 'fiorino' ? 'bg-sage-600 text-white' : 'bg-sage-50 text-sage-700 hover:bg-sage-100'}`}
          >
            <Truck size={16} /> Rota Fiorino
          </button>
          <button 
            onClick={() => setFilter('moto')}
            className={`px-4 py-2 rounded-xl text-sm font-bold whitespace-nowrap transition-colors flex items-center gap-1.5 ${filter === 'moto' ? 'bg-honey-500 text-white' : 'bg-honey-50 text-honey-700 hover:bg-honey-100'}`}
          >
            <Bike size={16} /> Express Moto
          </button>
          <button 
            onClick={() => setFilter('entregues')}
            className={`px-4 py-2 rounded-xl text-sm font-bold whitespace-nowrap transition-colors flex items-center gap-1.5 ${filter === 'entregues' ? 'bg-gray-800 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
          >
            Histórico / Entregues
          </button>
        </div>

        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input 
            type="text" 
            placeholder="Buscar ID ou Cliente..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-sage-500 w-full md:w-64"
          />
        </div>
      </div>

      {/* Lista de Entregas */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {filteredDeliveries.length === 0 ? (
          <div className="col-span-full py-12 text-center text-gray-500 bg-white rounded-2xl border border-gray-200 border-dashed">
            <Package size={48} className="mx-auto text-gray-300 mb-3" />
            <p>Nenhuma entrega encontrada para este filtro.</p>
          </div>
        ) : (
          filteredDeliveries.map(delivery => (
            <div key={delivery.id} className="bg-white p-5 rounded-2xl shadow-sm border border-gray-200 flex flex-col print:break-inside-avoid print:shadow-none print:border-b">
              
              <div className="flex justify-between items-start mb-4">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="bg-gray-100 text-gray-700 text-xs font-black px-2 py-0.5 rounded uppercase">#{delivery.id}</span>
                    <h3 className="font-bold text-gray-900">{delivery.client_name || 'Cliente Sem Nome'}</h3>
                  </div>
                  {delivery.tipo_entrega === 'moto' ? (
                    <span className="inline-flex items-center gap-1 text-[11px] font-bold bg-honey-100 text-honey-700 px-2 py-1 rounded-md">
                      <Bike size={12} /> ⚡ Entrega Expressa - R$ {delivery.valor_frete.toFixed(2)}
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-[11px] font-bold bg-sage-100 text-sage-700 px-2 py-1 rounded-md">
                      <Truck size={12} /> Frete Padrão - {delivery.valor_frete === 0 ? 'Grátis' : `R$ ${delivery.valor_frete.toFixed(2)}`}
                    </span>
                  )}
                </div>
                
                <div className="text-right">
                  <p className="text-sm font-black text-sage-900">R$ {delivery.total_value.toFixed(2)}</p>
                  <p className="text-xs text-gray-500 capitalize">{delivery.payment_method}</p>
                </div>
              </div>

              <div className="space-y-3 flex-1 mb-5">
                <div className="flex items-start gap-2">
                  <MapPin className="text-gray-400 shrink-0 mt-0.5" size={16} />
                  <p className="text-sm text-gray-600 leading-tight">{delivery.delivery_address || 'Endereço não informado'}</p>
                </div>
                
                <div className="flex items-center gap-2">
                  <Phone className="text-gray-400 shrink-0" size={16} />
                  <p className="text-sm text-gray-600">{delivery.client_phone || 'Telefone não informado'}</p>
                </div>

                <div className="bg-gray-50 rounded-xl p-3 mt-3 border border-gray-100">
                  <p className="text-xs font-bold text-gray-500 mb-2 uppercase tracking-wider">Itens do Pedido</p>
                  <ul className="text-sm text-gray-700 space-y-1">
                    {delivery.items.map((item, idx) => (
                      <li key={idx} className="flex justify-between">
                        <span>{item.quantity}x {item.product_name}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              <div className="pt-4 border-t border-gray-100 flex flex-col sm:flex-row gap-2 justify-between items-center print:hidden">
                <div className="flex items-center w-full sm:w-auto">
                  <select 
                    value={delivery.delivery_status}
                    onChange={(e) => handleStatusChange(delivery.id, e.target.value)}
                    className={`text-xs font-bold px-3 py-2 rounded-xl outline-none w-full appearance-none pr-8 cursor-pointer border-2
                      ${delivery.delivery_status === 'pendente' ? 'bg-orange-50 text-orange-700 border-orange-200' : 
                        delivery.delivery_status === 'em_rota' ? 'bg-blue-50 text-blue-700 border-blue-200' : 
                        'bg-green-50 text-green-700 border-green-200'}
                    `}
                    style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='currentColor'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E")`, backgroundRepeat: 'no-repeat', backgroundPosition: 'right 0.5rem center', backgroundSize: '1em' }}
                  >
                    <option value="pendente">⏳ Pendente / Em Separação</option>
                    <option value="em_rota">🚚 Saiu para Entrega</option>
                    <option value="entregue">✅ Entregue</option>
                  </select>
                </div>
                
                <div className="flex gap-2 w-full sm:w-auto">
                  <button 
                    onClick={() => openWhatsApp(delivery.client_phone)}
                    disabled={!delivery.client_phone}
                    className="flex-1 sm:flex-none bg-green-50 hover:bg-green-100 text-green-700 border border-green-200 px-3 py-2 rounded-xl text-xs font-bold transition-colors disabled:opacity-50"
                  >
                    WhatsApp
                  </button>
                  <button 
                    onClick={() => openMaps(delivery.delivery_address)}
                    disabled={!delivery.delivery_address}
                    className="flex-1 sm:flex-none bg-gray-100 hover:bg-gray-200 text-gray-700 border border-gray-200 px-3 py-2 rounded-xl text-xs font-bold transition-colors disabled:opacity-50"
                  >
                    Maps
                  </button>
                  {delivery.delivery_status !== 'entregue' && (
                    <button 
                      onClick={() => handleStatusChange(delivery.id, 'entregue')}
                      className="flex-1 sm:flex-none bg-sage-600 hover:bg-sage-700 text-white px-3 py-2 rounded-xl text-xs font-bold transition-colors shadow-sm"
                    >
                      Concluir
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>

    </div>
  );
};

export default DeliveryManagement;
