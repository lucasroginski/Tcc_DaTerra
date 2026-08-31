import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useApp } from '../context/AppContext';
import { MessageSquare, User, Search, Inbox } from 'lucide-react';
import ChatWindow from './ChatWindow';

const ProducerInbox = () => {
  const { currentUser } = useAuth();
  const { fetchChatInbox } = useApp();
  
  const [inbox, setInbox] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeChat, setActiveChat] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  const loadInbox = async () => {
    if (currentUser?.id) {
      try {
        const data = await fetchChatInbox(currentUser.id);
        setInbox(data);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    }
  };

  useEffect(() => {
    loadInbox();
    const interval = setInterval(loadInbox, 5000);
    return () => clearInterval(interval);
  }, [currentUser]);

  const filteredInbox = inbox.filter(chat => 
    chat.contact_name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="h-[600px] flex flex-col md:flex-row bg-white overflow-hidden">
      
      {/* Sidebar de Conversas */}
      <div className={`w-full md:w-80 flex-shrink-0 border-r border-sage-100 flex flex-col bg-gray-50/50 ${activeChat ? 'hidden md:flex' : 'flex'}`}>
        <div className="p-4 border-b border-sage-100 bg-white">
          <h2 className="text-lg font-black text-sage-900 flex items-center gap-2 mb-4">
            <MessageSquare className="text-sage-600" />
            Caixa de Entrada
          </h2>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
            <input 
              type="text" 
              placeholder="Buscar cliente..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-gray-100 border-none rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-sage-500"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          {loading && inbox.length === 0 ? (
            <div className="flex justify-center p-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-sage-600"></div>
            </div>
          ) : filteredInbox.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-gray-400 p-8 text-center space-y-3">
              <Inbox size={48} className="opacity-20" />
              <p className="text-sm font-medium">Nenhuma conversa encontrada</p>
            </div>
          ) : (
            filteredInbox.map(chat => (
              <button
                key={chat.contact_id}
                onClick={() => {
                  setActiveChat(chat);
                  loadInbox(); // Reload inbox to clear unread counts immediately
                }}
                className={`w-full text-left p-4 border-b border-gray-100 transition-colors flex items-center gap-3 ${
                  activeChat?.contact_id === chat.contact_id ? 'bg-sage-100/50' : 'hover:bg-gray-50'
                }`}
              >
                <div className="relative shrink-0">
                  <div className="w-12 h-12 bg-sage-200 rounded-full flex items-center justify-center text-sage-600">
                    <User size={24} />
                  </div>
                  {chat.unread_count > 0 && (
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-bold w-5 h-5 flex items-center justify-center rounded-full border-2 border-white">
                      {chat.unread_count}
                    </span>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-baseline mb-1">
                    <h4 className="font-bold text-gray-900 truncate pr-2">{chat.contact_name}</h4>
                    <span className="text-[10px] text-gray-400 font-medium shrink-0">
                      {new Date(chat.last_activity).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 truncate">Clique para visualizar o chat</p>
                </div>
              </button>
            ))
          )}
        </div>
      </div>

      {/* Área do Chat */}
      <div className={`flex-1 bg-white ${!activeChat ? 'hidden md:flex' : 'flex'}`}>
        {activeChat ? (
          <div className="h-full w-full flex flex-col">
            {/* Header Mobile para voltar */}
            <div className="md:hidden bg-sage-600 text-white p-3 flex items-center gap-2">
              <button onClick={() => setActiveChat(null)} className="p-2 font-bold bg-white/20 rounded-lg">Voltar</button>
              <span className="font-bold">{activeChat.contact_name}</span>
            </div>
            
            <div className="flex-1 overflow-hidden p-2 sm:p-4">
              <ChatWindow 
                isOpen={true}
                onClose={() => setActiveChat(null)}
                currentUserId={currentUser.id}
                otherUserId={activeChat.contact_id}
                otherUserName={activeChat.contact_name}
                isFloating={false}
              />
            </div>
          </div>
        ) : (
          <div className="h-full w-full flex flex-col items-center justify-center text-gray-400 bg-gray-50/30">
            <MessageSquare size={64} className="mb-4 text-sage-200" />
            <h3 className="text-xl font-bold text-gray-500">Caixa de Entrada</h3>
            <p className="text-sm mt-2 max-w-xs text-center">Selecione uma conversa ao lado para visualizar e enviar mensagens.</p>
          </div>
        )}
      </div>

    </div>
  );
};

export default ProducerInbox;
