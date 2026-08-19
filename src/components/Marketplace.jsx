// =========================================================================
//              MARKETPLACE.JSX - MODO CLIENTE (E-COMMERCE COMPLETO)
// =========================================================================
// O que faz: Apresenta a interface de e-commerce exclusiva para clientes logados.
// Por que foi implementado assim: Adota um design familiar inspirado em grandes
// marketplaces do mercado (como Mercado Livre), exibindo barra de endereço de entrega,
// atalhos de cupons/ofertas do dia, perfil do cliente logado, carrinho interativo e
// fluxo de checkout completo com Pix (código copia e cola simulado) ou Dinheiro.

import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { useAuth } from '../context/AuthContext';

import {
  ShoppingCart,
  Plus,
  Minus,
  Check,
  X,
  Search,
  Filter,
  ShoppingBag,
  Sparkles,
  AlertCircle,
  MapPin,
  ShieldCheck,
  QrCode,
  Banknote,
  Copy,
  CheckCircle2,
  LogOut,
  ChevronRight,
  Tag,
  Store,
  User as UserIcon,
  Crown
} from 'lucide-react';

const Marketplace = () => {
  const {
    products,
    getProductStock,
    createSale,
    cart,
    cartDrawerOpen,
    setCartDrawerOpen,
    addToCart,
    updateCartQuantity,
    removeFromCart,
    clearCart,
    getTotalCartItemsCount,
    getTotalCartPrice
  } = useApp();

  const { currentUser, logout, openPlansModal, logActivity, isClient, getTrialDaysRemaining, isAdmin, isProducer } = useAuth();
  const isUserProducer = isProducer();

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  // Checkout modal states
  const [showCheckoutModal, setShowCheckoutModal] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('pix');
  const [cashChangeNeeded, setCashChangeNeeded] = useState('');
  const [pixCopied, setPixCopied] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  // E-commerce Categories Carousel (Mercado Livre Style)
  const categoryChips = [
    { id: 'all', label: 'Todas as Ofertas', icon: '🔥' },
    { id: 'Ofertas do Dia', label: 'Ofertas do Dia', icon: '🏷️' },
    { id: 'Hortifruti', label: 'Hortifruti', icon: '🥬' },
    { id: 'Mel e Derivados', label: 'Mel e Derivados', icon: '🍯' },
    { id: 'Artesanais', label: 'Artesanais', icon: '🏺' },
    { id: 'Laticínios', label: 'Laticínios', icon: '🧀' }
  ];

  // Filter products by search & category
  const filteredProducts = products.filter(product => {
    const matchesCategory =
      selectedCategory === 'all' ||
      product.category === selectedCategory ||
      (selectedCategory === 'Ofertas do Dia' && product.price < 25);
    const matchesSearch =
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.category.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const handleQuickAdd = (product) => {
    const added = addToCart(product, 1);
    if (added && isClient() && currentUser) {
      logActivity(currentUser.id, currentUser.name, 'view_product', `Adicionou ${product.name} ao carrinho`);
    }
  };

  const handleConfirmOrder = () => {
    try {
      createSale(cart);

      if (isClient() && currentUser) {
        const itemsSummary = cart.map(item => `${item.product_name} (${item.quantity}x)`).join(', ');
        logActivity(
          currentUser.id,
          currentUser.name,
          'purchase',
          `Comprou via ${paymentMethod === 'pix' ? 'Pix' : 'Dinheiro'}: ${itemsSummary}`
        );
      }

      clearCart();
      setShowCheckoutModal(false);
      setShowSuccessModal(true);
    } catch (error) {
      alert(error.message || 'Erro ao finalizar o pedido');
    }
  };

  const handleCopyPixKey = () => {
    setPixCopied(true);
    setTimeout(() => setPixCopied(false), 2500);
  };

  const totalCartCount = getTotalCartItemsCount();
  const isVip = currentUser?.plan === 'vip';
  const trialDays = getTrialDaysRemaining(currentUser);

  return (
    <div className="min-h-screen bg-gray-100 text-gray-800 pb-28 selection:bg-honey-200">
      
      {/* 1. HEADER EM DESTAQUE (ESTILO MERCADO LIVRE) */}
      <header className="bg-sage-600 text-white sticky top-0 z-30 shadow-md border-b border-sage-700">
        <div className="max-w-7xl mx-auto px-4 py-3 space-y-2.5">
          
          {/* Top Bar: Brand, Search Bar, User Profile & Cart */}
          <div className="flex items-center justify-between gap-3 sm:gap-6">
            
            {/* Logo Mercado Livre Style */}
            <div className="flex items-center gap-2 shrink-0">
              <div className="bg-honey-500 text-white p-2 rounded-2xl shadow-sm">
                <Store size={22} />
              </div>
              <div className="hidden sm:block">
                <h1 className="text-xl font-black tracking-tight leading-none text-white">DaTerra</h1>
                <span className="text-[10px] text-honey-300 font-bold tracking-wider">MERCADO REGIONAL</span>
              </div>
            </div>

            {/* Barra de Pesquisa Ampla Centralizada */}
            <div className="flex-1 max-w-2xl relative">
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Buscar produtos frescos, mel, laticínios ou produtores..."
                className="w-full pl-10 pr-10 py-2.5 rounded-xl text-gray-800 text-xs sm:text-sm bg-white focus:outline-none focus:ring-2 focus:ring-honey-500 shadow-inner font-medium placeholder-gray-400"
              />
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  <X size={16} />
                </button>
              )}
            </div>

            {/* Menu do Usuário & Ícone do Carrinho */}
            <div className="flex items-center gap-2 sm:gap-3 shrink-0">
              
              {/* Botão do Carrinho */}
              {!isUserProducer && (
                <button
                  onClick={() => setCartDrawerOpen(true)}
                  className="relative bg-sage-700 hover:bg-sage-800 text-white p-2 sm:px-3 sm:py-2 rounded-xl transition-all flex items-center gap-1.5 focus:outline-none border border-sage-500"
                  title="Ver Carrinho"
                >
                  <ShoppingCart size={20} className="text-honey-400" />
                  <span className="hidden md:inline text-xs font-bold">Carrinho</span>
                  {totalCartCount > 0 && (
                    <span className="absolute -top-1.5 -right-1.5 bg-honey-500 text-white text-[10px] font-black w-5 h-5 rounded-full flex items-center justify-center shadow-md animate-scaleIn">
                      {totalCartCount}
                    </span>
                  )}
                </button>
              )}

              {/* Menu Usuário Logado */}
              <div className="flex items-center gap-2 bg-sage-700 border border-sage-500 px-3 py-1.5 rounded-xl">
                <div className="w-6 h-6 rounded-full bg-honey-500 text-white flex items-center justify-center text-xs font-bold">
                  {currentUser?.name?.charAt(0).toUpperCase()}
                </div>
                <div className="text-left hidden lg:block">
                  <p className="text-xs font-bold leading-tight text-white">
                    Olá, {currentUser?.name?.split(' ')[0]}
                  </p>
                  <span className="text-[10px] text-sage-200 font-medium">
                    {currentUser?.role === 'producer' ? 'Produtor' : 'Cliente'}
                  </span>
                </div>
                <button
                  onClick={logout}
                  className="ml-1 text-sage-200 hover:text-red-300 transition-colors p-1"
                  title="Sair da conta"
                >
                  <LogOut size={16} />
                </button>
              </div>

            </div>

          </div>

          {/* Sub-Header Bar: Localização / Bairro de Entrega & Plan Badge */}
          <div className="flex items-center justify-between text-xs text-sage-100 pt-1 border-t border-sage-500/60">
            <div className="flex items-center gap-1.5 font-medium hover:text-white cursor-pointer transition-colors">
              <MapPin size={14} className="text-honey-400 shrink-0" />
              <span>Entregar em: <strong>Centro, Cidade Regional (CEP 13400-000)</strong></span>
            </div>

            <div className="hidden sm:flex items-center gap-2">
              <button
                onClick={openPlansModal}
                className="text-[11px] bg-honey-500/20 hover:bg-honey-500/30 text-honey-300 border border-honey-400/40 px-2.5 py-0.5 rounded-full font-bold transition-all flex items-center gap-1"
              >
                <Crown size={12} />
                <span>{isVip ? 'Cliente VIP' : `Plano Grátis (${trialDays}d)`}</span>
              </button>
            </div>
          </div>

        </div>
      </header>

      {/* 2. CARROSSEL DE CATEGORIAS (BARRINHA ESTILO E-COMMERCE) */}
      <div className="bg-white border-b border-gray-200 shadow-sm sticky top-[92px] sm:top-[98px] z-20">
        <div className="max-w-7xl mx-auto px-4 py-2.5">
          <div className="flex items-center gap-2 overflow-x-auto scrollbar-none scroll-smooth">
            {categoryChips.map(cat => {
              const isActive = selectedCategory === cat.id;
              return (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all flex items-center gap-1.5 shrink-0 ${
                    isActive
                      ? 'bg-sage-600 text-white shadow-sm scale-105'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200 border border-gray-200'
                  }`}
                >
                  <span className="text-sm">{cat.icon}</span>
                  <span>{cat.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Main Container */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-6">

        {/* Hero Promo Banner E-Commerce */}
        <div className="bg-gradient-to-r from-honey-500 via-honey-600 to-amber-600 text-white rounded-3xl p-6 sm:p-8 shadow-md relative overflow-hidden flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="space-y-2 max-w-lg">
            <div className="inline-flex items-center gap-1 bg-black/20 text-white text-[11px] font-bold px-3 py-1 rounded-full uppercase tracking-wider">
              <Tag size={14} />
              <span>Feira Aberta HOJE</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black leading-tight">
              Ofertas Especiais Direto da Roça
            </h2>
            <p className="text-xs sm:text-sm text-amber-100 font-medium">
              Alimentos colhidos no dia pelos microprodutores regionais parceiros da rede DaTerra.
            </p>
          </div>
          <div className="shrink-0 bg-white/10 backdrop-blur-md p-4 rounded-2xl border border-white/20 text-center">
            <p className="text-xs font-bold text-amber-200 uppercase">Entrega Regional</p>
            <p className="text-lg font-extrabold text-white">Frete Grátis na 1ª Compra</p>
          </div>
        </div>

        {/* 3. GRID DE PRODUTOS (VITRINE ESTILO MERCADO LIVRE) */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base sm:text-xl font-black text-gray-900 flex items-center gap-2">
              <Sparkles className="text-honey-500" size={20} />
              <span>Produtos da Agricultura Familiar</span>
            </h2>
            <span className="text-xs font-bold text-gray-500 bg-white px-3 py-1 rounded-xl border border-gray-200">
              {filteredProducts.length} disponíveis
            </span>
          </div>

          {filteredProducts.length === 0 ? (
            <div className="bg-white rounded-3xl p-12 text-center shadow-sm border border-gray-200 max-w-md mx-auto my-8">
              <ShoppingBag size={48} className="mx-auto text-gray-300 mb-3" />
              <h3 className="text-base font-bold text-gray-800">Nenhum item localizado</h3>
              <p className="text-xs text-gray-500 mt-1">Tente pesquisar com outro termo ou alterar a categoria.</p>
              <button
                onClick={() => {
                  setSearchTerm('');
                  setSelectedCategory('all');
                }}
                className="mt-4 bg-sage-600 text-white text-xs font-bold px-4 py-2 rounded-xl"
              >
                Limpar Filtros
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-5">
              {filteredProducts.map(product => {
                const availableStock = getProductStock(product.id);
                const isOutOfStock = availableStock <= 0;
                const inCart = cart.find(i => i.product_id === product.id);

                return (
                  <div
                    key={product.id}
                    className="bg-white rounded-3xl overflow-hidden shadow-sm hover:shadow-md transition-all border border-gray-200 flex flex-col justify-between group"
                  >
                    {/* Visual Product Cover */}
                    <div className="bg-gradient-to-br from-sage-50 to-sage-100 p-4 h-32 sm:h-36 flex flex-col justify-between relative border-b border-gray-100">
                      
                      {/* Top Badges: Produtor Verificado & Stock */}
                      <div className="flex items-center justify-between gap-1">
                        <span className="bg-emerald-100 text-emerald-800 border border-emerald-300 text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 shadow-sm">
                          <ShieldCheck size={12} className="text-emerald-600" />
                          <span>Produtor Verificado</span>
                        </span>

                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          isOutOfStock ? 'bg-red-100 text-red-700' : 'bg-gray-200 text-gray-700'
                        }`}>
                          {isOutOfStock ? 'Esgotado' : `${availableStock} un`}
                        </span>
                      </div>

                      {/* Product Illustration */}
                      <div className="flex items-center justify-between">
                        <span className="text-3xl sm:text-4xl drop-shadow-sm">
                          {product.category === 'Apicultura' || product.category === 'Mel e Derivados' ? '🍯' :
                           product.category === 'Hortifruti' ? '🥬' :
                           product.category === 'Laticínios' ? '🧀' : '🏺'}
                        </span>
                        <span className="text-[10px] font-bold text-gray-500 bg-white/80 px-2 py-0.5 rounded-md">
                          {product.category}
                        </span>
                      </div>
                    </div>

                    {/* Product Info & Rural Producer Badge */}
                    <div className="p-3.5 sm:p-4 flex-1 flex flex-col justify-between">
                      <div>
                        <h3 className="font-bold text-gray-900 text-xs sm:text-sm leading-snug group-hover:text-sage-600 transition-colors line-clamp-2">
                          {product.name}
                        </h3>

                        {/* Nome do Produtor Rural em Destaque */}
                        <p className="text-[11px] text-sage-700 font-semibold mt-1 flex items-center gap-1">
                          <UserIcon size={12} className="text-sage-500" />
                          <span>João Silva (Produtor Rural)</span>
                        </p>
                      </div>

                      <div className="mt-3">
                        <div className="flex items-baseline gap-1">
                          <span className="text-[10px] font-bold text-gray-400">R$</span>
                          <span className="text-lg sm:text-xl font-black text-honey-600">
                            {product.price.toFixed(2)}
                          </span>
                          <span className="text-[10px] text-gray-400">/ un</span>
                        </div>

                        {/* Botão "+ Adicionar ao Carrinho" */}
                        {!isUserProducer && (
                          <button
                            onClick={() => handleQuickAdd(product)}
                            disabled={isOutOfStock}
                            className={`w-full mt-3 py-2.5 px-3 rounded-xl text-xs font-bold transition-all shadow-sm flex items-center justify-center gap-1.5 ${
                              isOutOfStock
                                ? 'bg-gray-100 text-gray-400 cursor-not-allowed border border-gray-200'
                                : 'bg-sage-600 hover:bg-sage-700 active:bg-sage-800 text-white'
                            }`}
                          >
                            <Plus size={16} />
                            <span>{inCart ? `No Carrinho (${inCart.quantity})` : '+ Adicionar ao Carrinho'}</span>
                          </button>
                        )}
                      </div>
                    </div>

                  </div>
                );
              })}
            </div>
          )}
        </div>

      </main>

      {/* 4. CARRINHO LATERAL (DRAWER FLUTUANTE) */}
      {cartDrawerOpen && (
        <div className="fixed inset-0 bg-black/65 backdrop-blur-sm z-50 flex justify-end animate-fadeIn">
          <div className="bg-white w-full max-w-md h-full flex flex-col justify-between shadow-2xl animate-slideInRight">
            
            {/* Drawer Header */}
            <div className="bg-sage-600 text-white p-5 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ShoppingCart size={22} className="text-honey-400" />
                <h3 className="font-bold text-lg">Seu Carrinho de Compras</h3>
              </div>
              <button
                onClick={() => setCartDrawerOpen(false)}
                className="text-sage-200 hover:text-white bg-sage-700 p-1.5 rounded-full"
              >
                <X size={20} />
              </button>
            </div>

            {/* Items List */}
            <div className="p-5 flex-1 overflow-y-auto space-y-3">
              {cart.length === 0 ? (
                <div className="text-center py-16 text-gray-500">
                  <ShoppingBag size={52} className="mx-auto text-gray-300 mb-3" />
                  <p className="font-bold text-gray-800 text-base">Carrinho Vazio</p>
                  <p className="text-xs text-gray-500 mt-1">
                    Adicione produtos fresquinhos da feira regional.
                  </p>
                </div>
              ) : (
                cart.map(item => {
                  const stock = getProductStock(item.product_id);
                  return (
                    <div
                      key={item.product_id}
                      className="bg-gray-50 border border-gray-200 rounded-2xl p-3.5 flex items-center justify-between"
                    >
                      <div className="flex-1 pr-3">
                        <h4 className="font-bold text-gray-900 text-xs sm:text-sm">{item.product_name}</h4>
                        <p className="text-xs text-honey-600 font-bold mt-0.5">
                          R$ {item.price.toFixed(2)} un
                        </p>
                      </div>

                      {/* Quantity Controls (+ / -) */}
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => updateCartQuantity(item.product_id, item.quantity - 1)}
                          className="bg-white hover:bg-gray-100 text-gray-700 border border-gray-300 rounded-lg p-1.5"
                        >
                          <Minus size={14} />
                        </button>
                        <span className="font-bold text-gray-800 text-sm w-6 text-center">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => updateCartQuantity(item.product_id, item.quantity + 1)}
                          disabled={item.quantity >= stock}
                          className="bg-white hover:bg-gray-100 text-gray-700 border border-gray-300 rounded-lg p-1.5 disabled:opacity-40"
                        >
                          <Plus size={14} />
                        </button>
                        <button
                          onClick={() => removeFromCart(item.product_id)}
                          className="ml-1 text-red-500 hover:text-red-700 p-1"
                        >
                          <X size={16} />
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Total & Checkout Confirmation */}
            {cart.length > 0 && (
              <div className="p-5 border-t border-gray-200 bg-white space-y-3">
                <div className="flex items-center justify-between text-sm text-gray-600">
                  <span>Subtotal</span>
                  <span className="font-bold text-gray-900">R$ {getTotalCartPrice().toFixed(2)}</span>
                </div>
                <div className="flex items-center justify-between text-lg font-extrabold text-gray-900 border-t pt-2">
                  <span>Total do Pedido</span>
                  <span className="text-honey-600">R$ {getTotalCartPrice().toFixed(2)}</span>
                </div>

                <button
                  onClick={() => {
                    setCartDrawerOpen(false);
                    setShowCheckoutModal(true);
                  }}
                  className="w-full bg-honey-500 hover:bg-honey-600 active:bg-honey-700 text-white font-bold py-3.5 rounded-xl shadow-md transition-colors flex items-center justify-center gap-2 text-sm"
                >
                  <Check size={18} />
                  <span>Confirmar Pedido</span>
                </button>
              </div>
            )}

          </div>
        </div>
      )}

      {/* Checkout Modal (Pix / Dinheiro) */}
      {showCheckoutModal && (
        <div className="fixed inset-0 bg-black/65 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fadeIn">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden border border-gray-200 relative max-h-[90vh] flex flex-col">
            
            <div className="bg-sage-600 text-white p-5 flex items-center justify-between">
              <h3 className="font-bold text-lg flex items-center gap-2">
                <CheckCircle2 size={22} className="text-honey-400" />
                <span>Finalizar Compra</span>
              </h3>
              <button
                onClick={() => setShowCheckoutModal(false)}
                className="text-sage-200 hover:text-white bg-sage-700 p-1.5 rounded-full"
              >
                <X size={18} />
              </button>
            </div>

            <div className="p-6 overflow-y-auto space-y-5">
              
              <div className="bg-gray-50 border border-gray-200 p-4 rounded-2xl">
                <h4 className="text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">Resumo dos Produtos</h4>
                <div className="space-y-1 text-xs text-gray-600">
                  {cart.map(item => (
                    <div key={item.product_id} className="flex justify-between">
                      <span>{item.quantity}x {item.product_name}</span>
                      <span className="font-bold">R$ {(item.price * item.quantity).toFixed(2)}</span>
                    </div>
                  ))}
                </div>
                <div className="border-t border-gray-200 mt-3 pt-2 flex justify-between font-bold text-sm text-gray-900">
                  <span>Valor Total:</span>
                  <span className="text-honey-600">R$ {getTotalCartPrice().toFixed(2)}</span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-2 uppercase">Forma de Pagamento</label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('pix')}
                    className={`p-4 rounded-2xl border-2 text-left transition-all ${
                      paymentMethod === 'pix'
                        ? 'border-sage-600 bg-sage-50 text-sage-900 ring-2 ring-sage-600/20'
                        : 'border-gray-200 text-gray-600 hover:bg-gray-50'
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <QrCode className="text-sage-600" size={20} />
                      <span className="font-bold text-xs">Pix (Instantâneo)</span>
                    </div>
                    <p className="text-[11px] text-gray-500">Liberação imediata</p>
                  </button>

                  <button
                    type="button"
                    onClick={() => setPaymentMethod('cash')}
                    className={`p-4 rounded-2xl border-2 text-left transition-all ${
                      paymentMethod === 'cash'
                        ? 'border-sage-600 bg-sage-50 text-sage-900 ring-2 ring-sage-600/20'
                        : 'border-gray-200 text-gray-600 hover:bg-gray-50'
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <Banknote className="text-honey-600" size={20} />
                      <span className="font-bold text-xs">Dinheiro na Entrega</span>
                    </div>
                    <p className="text-[11px] text-gray-500">Pague ao receber</p>
                  </button>
                </div>
              </div>

              {paymentMethod === 'pix' ? (
                <div className="bg-sage-50 p-4 rounded-2xl border border-sage-200 text-center space-y-2">
                  <p className="text-xs font-bold text-sage-800">Chave Pix Simulada DaTerra:</p>
                  <div className="bg-white p-2.5 rounded-xl border border-gray-300 font-mono text-xs text-gray-700 flex items-center justify-between">
                    <span>pix@daterra.com.br</span>
                    <button
                      onClick={handleCopyPixKey}
                      className="text-sage-600 hover:text-sage-800 text-xs font-bold flex items-center gap-1"
                    >
                      <Copy size={14} />
                      <span>{pixCopied ? 'Copiado!' : 'Copiar'}</span>
                    </button>
                  </div>
                </div>
              ) : (
                <div className="bg-honey-50 p-4 rounded-2xl border border-honey-200 space-y-2">
                  <label className="block text-xs font-bold text-honey-900">Precisa de troco? (Opcional)</label>
                  <input
                    type="text"
                    placeholder="Ex: Troco para R$ 50,00"
                    value={cashChangeNeeded}
                    onChange={(e) => setCashChangeNeeded(e.target.value)}
                    className="w-full p-2.5 border border-gray-300 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-honey-500 bg-white"
                  />
                </div>
              )}

              <button
                onClick={handleConfirmOrder}
                className="w-full bg-honey-500 hover:bg-honey-600 active:bg-honey-700 text-white font-bold py-3.5 rounded-xl shadow-md transition-colors flex items-center justify-center gap-2 text-sm"
              >
                <Check size={20} />
                <span>Confirmar Pedido</span>
              </button>

            </div>

          </div>
        </div>
      )}

      {/* Success Modal */}
      {showSuccessModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fadeIn">
          <div className="bg-white rounded-3xl p-6 text-center max-w-sm w-full shadow-2xl border border-gray-200">
            <div className="bg-green-100 text-green-600 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
              <Check size={36} />
            </div>
            <h3 className="font-black text-gray-900 text-xl mb-1">Pedido Concluído!</h3>
            <p className="text-xs text-gray-600 mb-4">
              Obrigado por comprar produtos frescos da feira DaTerra.
            </p>
            <button
              onClick={() => setShowSuccessModal(false)}
              className="w-full bg-sage-600 text-white py-3 rounded-xl text-xs font-bold hover:bg-sage-700 transition-colors shadow-sm"
            >
              Continuar Comprando
            </button>
          </div>
        </div>
      )}

    </div>
  );
};

export default Marketplace;
