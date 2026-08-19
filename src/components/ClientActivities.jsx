// =========================================================================
//         CLIENTACTIVITIES.JSX - AUDITORIA & REGISTRO DE ATIVIDADES
// =========================================================================
// O que faz: Exibe a timeline completa de ações realizadas pelos clientes.
// Por que foi implementado assim: Serve como ferramenta de inteligência de 
// mercado (CRM/Analytics) para o produtor rural. Ele consegue filtrar e visualizar
// em tempo real ações como logins, visualizações de produtos e compras.
// Auxilia o produtor a compreender o comportamento do consumidor regional,
// otimizando a colheita de acordo com os produtos mais visualizados/desejados.

import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';

import { Users, Activity, ShoppingCart, Eye, LogIn, LogOut, UserPlus, Filter } from 'lucide-react';

const ClientActivities = () => {
  const { getAllClients, getAllActivities, getUserActivities } = useAuth();
  const [selectedClient, setSelectedClient] = useState(null);
  const [filter, setFilter] = useState('all');

  const clients = getAllClients();
  const allActivities = getAllActivities();

  const getFilteredActivities = () => {
    let activities = selectedClient 
      ? getUserActivities(selectedClient.id)
      : allActivities;

    if (filter !== 'all') {
      activities = activities.filter(a => a.action === filter);
    }

    return activities;
  };

  const getActivityIcon = (action) => {
    switch (action) {
      case 'purchase':
        return <ShoppingCart className="text-honey-500" size={18} />;
      case 'view_product':
        return <Eye className="text-blue-500" size={18} />;
      case 'login':
        return <LogIn className="text-green-500" size={18} />;
      case 'logout':
        return <LogOut className="text-gray-500" size={18} />;
      case 'register':
        return <UserPlus className="text-purple-500" size={18} />;
      default:
        return <Activity className="text-sage-500" size={18} />;
    }
  };

  const getActivityColor = (action) => {
    switch (action) {
      case 'purchase':
        return 'bg-honey-50 border-honey-200';
      case 'view_product':
        return 'bg-blue-50 border-blue-200';
      case 'login':
        return 'bg-green-50 border-green-200';
      case 'logout':
        return 'bg-gray-50 border-gray-200';
      case 'register':
        return 'bg-purple-50 border-purple-200';
      default:
        return 'bg-sage-50 border-sage-200';
    }
  };

  const formatTimestamp = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleString('pt-BR');
  };

  const getActivityCount = (action) => {
    return allActivities.filter(a => a.action === action).length;
  };

  return (
    <div className="bg-white">
      <div className="p-6 space-y-6 max-w-4xl mx-auto">
        <div className="border-b border-gray-100 pb-4">
          <h2 className="text-lg font-black text-sage-800 flex items-center gap-2">
            <Users className="text-sage-600" size={20} />
            <span>Atividades dos Clientes</span>
          </h2>
          <p className="text-xs text-gray-500 mt-0.5 font-medium">Acompanhe logs de navegação e compras dos clientes em tempo real</p>
        </div>
        {/* Stats Cards */}
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-white rounded-2xl p-4 shadow-md">
            <div className="flex items-center gap-2 mb-2">
              <Users className="text-sage-500" size={20} />
              <span className="text-xs text-gray-500">Total</span>
            </div>
            <p className="text-2xl font-bold text-sage-700">{clients.length}</p>
            <p className="text-xs text-gray-500 mt-1">Clientes</p>
          </div>

          <div className="bg-white rounded-2xl p-4 shadow-md">
            <div className="flex items-center gap-2 mb-2">
              <Activity className="text-honey-500" size={20} />
              <span className="text-xs text-gray-500">Total</span>
            </div>
            <p className="text-2xl font-bold text-sage-700">{allActivities.length}</p>
            <p className="text-xs text-gray-500 mt-1">Atividades</p>
          </div>
        </div>

        {/* Activity Type Stats */}
        <div className="bg-white rounded-2xl p-4 shadow-md">
          <h3 className="font-semibold text-sage-700 mb-3">Resumo de Atividades</h3>
          <div className="grid grid-cols-3 gap-2">
            <div className="text-center p-2 bg-honey-50 rounded-lg">
              <ShoppingCart className="text-honey-500 mx-auto mb-1" size={20} />
              <p className="text-lg font-bold text-sage-700">{getActivityCount('purchase')}</p>
              <p className="text-xs text-gray-500">Compras</p>
            </div>
            <div className="text-center p-2 bg-blue-50 rounded-lg">
              <Eye className="text-blue-500 mx-auto mb-1" size={20} />
              <p className="text-lg font-bold text-sage-700">{getActivityCount('view_product')}</p>
              <p className="text-xs text-gray-500">Visualizações</p>
            </div>
            <div className="text-center p-2 bg-green-50 rounded-lg">
              <LogIn className="text-green-500 mx-auto mb-1" size={20} />
              <p className="text-lg font-bold text-sage-700">{getActivityCount('login')}</p>
              <p className="text-xs text-gray-500">Logins</p>
            </div>
          </div>
        </div>

        {/* Filter */}
        <div className="bg-white rounded-2xl p-4 shadow-md">
          <div className="flex items-center gap-2 mb-3">
            <Filter className="text-sage-500" size={20} />
            <h3 className="font-semibold text-sage-700">Filtrar</h3>
          </div>
          <div className="flex gap-2 flex-wrap">
            {['all', 'purchase', 'view_product', 'login', 'logout', 'register'].map((filterType) => (
              <button
                key={filterType}
                onClick={() => setFilter(filterType)}
                className={`px-3 py-1 rounded-full text-sm transition-colors ${
                  filter === filterType
                    ? 'bg-sage-500 text-white'
                    : 'bg-sage-100 text-sage-700 hover:bg-sage-200'
                }`}
              >
                {filterType === 'all' ? 'Todas' : 
                 filterType === 'purchase' ? 'Compras' :
                 filterType === 'view_product' ? 'Visualizações' :
                 filterType === 'login' ? 'Logins' :
                 filterType === 'logout' ? 'Logouts' : 'Cadastros'}
              </button>
            ))}
          </div>
        </div>

        {/* Client Selection */}
        <div className="bg-white rounded-2xl p-4 shadow-md">
          <div className="flex items-center gap-2 mb-3">
            <Users className="text-sage-500" size={20} />
            <h3 className="font-semibold text-sage-700">Selecionar Cliente</h3>
          </div>
          <div className="flex gap-2 overflow-x-auto pb-2">
            <button
              onClick={() => setSelectedClient(null)}
              className={`px-4 py-2 rounded-full text-sm whitespace-nowrap transition-colors ${
                !selectedClient
                  ? 'bg-sage-500 text-white'
                  : 'bg-sage-100 text-sage-700 hover:bg-sage-200'
              }`}
            >
              Todos os Clientes
            </button>
            {clients.map((client) => (
              <button
                key={client.id}
                onClick={() => setSelectedClient(client)}
                className={`px-4 py-2 rounded-full text-sm whitespace-nowrap transition-colors ${
                  selectedClient?.id === client.id
                    ? 'bg-sage-500 text-white'
                    : 'bg-sage-100 text-sage-700 hover:bg-sage-200'
                }`}
              >
                {client.name}
              </button>
            ))}
          </div>
        </div>

        {/* Activities List */}
        <div className="bg-white rounded-2xl p-4 shadow-md">
          <h3 className="font-semibold text-sage-700 mb-3">
            {selectedClient ? `Atividades de ${selectedClient.name}` : 'Todas as Atividades'}
          </h3>
          
          {getFilteredActivities().length === 0 ? (
            <p className="text-gray-500 text-sm py-4 text-center">
              Nenhuma atividade encontrada.
            </p>
          ) : (
            <div className="space-y-3">
              {getFilteredActivities().map((activity) => (
                <div
                  key={activity.id}
                  className={`p-3 rounded-lg border ${getActivityColor(activity.action)}`}
                >
                  <div className="flex items-start gap-3">
                    <div className="mt-1">
                      {getActivityIcon(activity.action)}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <p className="font-semibold text-sage-700 text-sm">{activity.userName}</p>
                        <p className="text-xs text-gray-500">{formatTimestamp(activity.timestamp)}</p>
                      </div>
                      <p className="text-sm text-gray-600">{activity.details}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ClientActivities;
