import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '../context/AppContext';
import { X, Send, User } from 'lucide-react';

const ChatWindow = ({ isOpen, onClose, currentUserId, otherUserId, otherUserName, isFloating = true }) => {
  const { fetchChatConversation, sendChatMessage } = useApp();
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const messagesEndRef = useRef(null);

  // Polling para carregar mensagens novas
  useEffect(() => {
    let intervalId;

    const loadMessages = async () => {
      if (isOpen && currentUserId && otherUserId) {
        try {
          const data = await fetchChatConversation(currentUserId, otherUserId);
          setMessages(data);
        } catch (error) {
          console.error("Erro ao carregar chat", error);
        } finally {
          setLoading(false);
        }
      }
    };

    if (isOpen) {
      setLoading(true);
      loadMessages();
      intervalId = setInterval(loadMessages, 5000); // Polling a cada 5 segundos
    }

    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, [isOpen, currentUserId, otherUserId]);

  // Scroll to bottom always
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    try {
      await sendChatMessage(currentUserId, otherUserId, newMessage);
      setNewMessage('');
      // Recarrega logo em seguida para ver a própria mensagem
      const data = await fetchChatConversation(currentUserId, otherUserId);
      setMessages(data);
    } catch (error) {
      alert("Erro ao enviar mensagem.");
    }
  };

  if (!isOpen) return null;

  const floatingClasses = isFloating 
    ? "fixed bottom-20 right-4 sm:right-8 w-[350px] max-w-[calc(100vw-2rem)] h-[500px] max-h-[70vh] shadow-2xl z-[60] animate-slideUp border border-sage-100"
    : "w-full h-full border border-gray-200";

  return (
    <div className={`bg-white rounded-3xl flex flex-col overflow-hidden ${floatingClasses}`}>
      {/* Header */}
      <div className="bg-sage-600 text-white p-4 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
            <User size={20} />
          </div>
          <div>
            <h3 className="font-bold text-sm leading-tight">{otherUserName}</h3>
            <p className="text-[10px] text-sage-100 font-medium">Chat Interno DaTerra</p>
          </div>
        </div>
        <button onClick={onClose} className="text-sage-100 hover:text-white p-1 rounded-lg transition-colors bg-white/10 hover:bg-white/20">
          <X size={18} />
        </button>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 bg-sage-50 space-y-4">
        {loading && messages.length === 0 ? (
          <div className="flex justify-center py-10">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-sage-600"></div>
          </div>
        ) : messages.length === 0 ? (
          <div className="text-center py-10 text-gray-500 text-sm">
            Nenhuma mensagem ainda. Inicie a conversa!
          </div>
        ) : (
          messages.map((msg) => {
            const isMe = msg.sender_id === currentUserId;
            return (
              <div key={msg.id} className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
                <div className={`max-w-[85%] rounded-2xl px-4 py-2 text-sm shadow-sm ${
                  isMe 
                    ? 'bg-sage-600 text-white rounded-tr-sm' 
                    : 'bg-white text-gray-800 border border-gray-100 rounded-tl-sm'
                }`}>
                  {msg.content}
                </div>
                <span className="text-[10px] text-gray-400 mt-1 px-1">
                  {new Date(msg.created_at).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="p-3 bg-white border-t border-gray-100 shrink-0">
        <form onSubmit={handleSend} className="flex gap-2">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Digite uma mensagem..."
            className="flex-1 bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-sage-500 transition-all"
          />
          <button 
            type="submit"
            disabled={!newMessage.trim()}
            className="bg-honey-500 hover:bg-honey-600 disabled:opacity-50 text-white w-10 h-10 rounded-xl flex items-center justify-center transition-colors shrink-0 shadow-sm"
          >
            <Send size={18} className="ml-1" />
          </button>
        </form>
      </div>
    </div>
  );
};

export default ChatWindow;
