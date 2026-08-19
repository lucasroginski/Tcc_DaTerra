// =========================================================================
//            CATALOG.JSX - VITRINE DO E-COMMERCE (MODO CATALOGO ABERTO)
// =========================================================================
// O que faz: Renderiza a vitrine de produtos da feira regional, permitindo
// buscas rápidas, filtragem de categorias por chips e inserção rápida no carrinho.
// Por que foi implementado assim: Permite que tanto visitantes quanto clientes
// naveguem livremente nos produtos. O checkout induz o usuário a fazer login
// apenas no momento final do fechamento da compra, reduzindo a fricção e 
// simulando uma experiência premium de e-commerce moderno.

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
  QrCode,
  Banknote,
  Copy,
  CheckCircle2,
  Leaf,
  Store,
  ChevronRight
} from 'lucide-react';

const Catalog = () => {
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

  const { currentUser, isAuthenticated, openAuthModal, logActivity, isClient } = useAuth();

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  // Checkout modal states
  const [showCheckoutModal, setShowCheckoutModal] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('pix'); // 'pix' or 'cash'
  const [cashChangeNeeded, setCashChangeNeeded] = useState('');
  const [pixCopied, setPixCopied] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  // Defined Categories with visual icons
  const defaultCategories = [
    { id: 'all', label: 'Todos os Produtos', icon: '🌱' },
    { id: 'Mel e Derivados', label: 'Mel e Derivados', icon: '🍯' },
    { id: 'Hortifruti', label: 'Hortifruti', icon: '🥬' },
    { id: 'Artesanais', label: 'Artesanais', icon: '🏺' },
    { id: 'Laticínios', label: 'Laticínios', icon: '🧀' }
  ];

  // Extract all categories from products dynamically
  const uniqueProductCategories = Array.from(new Set(products.map(p => p.category)));
  const allCategories = [
    ...defaultCategories,
    ...uniqueProductCategories
      .filter(cat => !defaultCategories.some(c => c.id === cat))
      .map(cat => ({ id: cat, label: cat, icon: '📦' }))
  ];

  // Filter products by search and category
  const filteredProducts = products.filter(product => {
    const matchesCategory = selectedCategory === 'all' || product.category === selectedCategory;
    const matchesSearch =
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.category.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  // Action handler for "+ Adicionar ao Carrinho"
  const handleQuickAdd = (product) => {
    const added = addToCart(product, 1);
    if (added && isClient() && currentUser) {
      logActivity(currentUser.id, currentUser.name, 'view_product', `Adicionou ${product.name} ao carrinho`);
    }
  };

  // Checkout Trigger Rule Check
  const handleInitiateCheckout = () => {
    if (!isAuthenticated) {
      setCartDrawerOpen(false);
      openAuthModal('login', 'Faça login para concluir sua compra');
      return;
    }

    if (cart.length === 0) return;

    setCartDrawerOpen(false);
    setShowCheckoutModal(true);
  };

  // Confirm Sale in Checkout Modal
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

  // Category Banner Visual Helpers
  const getCategoryTheme = (category) => {
    switch (category) {
      case 'Apicultura':
      case 'Mel e Derivados':
        return { bg: 'from-amber-400 to-amber-600', icon: '🍯', label: 'Feira do Mel' };
      case 'Hortifruti':
      case 'Verduras':
        return { bg: 'from-emerald-500 to-green-700', icon: '🥬', label: 'Horta Orgânica' };
      case 'Laticínios':
        return { bg: 'from-yellow-400 to-amber-500', icon: '🧀', label: 'Laticínios da Roça' };
      case 'Artesanais':
        return { bg: 'from-orange-500 to-amber-700', icon: '🏺', label: 'Feito à Mão' };
      default:
        return { bg: 'from-sage-600 to-sage-800', icon: '🌱', label: 'Colheita Fresta' };
    }
  };

  return (
    <div className="min-h-screen bg-sage-50 pb-28">
      
      {/* 1. ESTRUTURA VISUAL DA VITRINE: Banner Principal Rústico/Agrotech */}
      <div className="bg-gradient-to-br from-sage-600 via-sage-500 to-sage-700 text-white relative overflow-hidden shadow-lg rounded-b-[2.5rem]">
        
        {/* Agrotech Rustic Texture Overlay */}
        <div className="absolute inset-0 bg-[radial-gradient(#D4A373_1px,transparent_1px)] [background-size:16px_16px] opacity-15 pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 sm:py-10 relative z-10">
          
          <div className="flex items-center gap-2 bg-honey-500/20 text-honey-300 border border-honey-400/30 px-3 py-1 rounded-full text-xs font-bold w-fit mb-3 backdrop-blur-sm">
            <Sparkles size={14} className="text-honey-400" />
            <span>Feira Virtual Agrotech &amp; Produtores Locais</span>
          </div>

          <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-white leading-tight">
            Vitrine Rústica <span className="text-honey-300">DaTerra</span>
          </h1>

          <p className="text-sage-100 text-xs sm:text-sm mt-2 max-w-xl leading-relaxed">
            Compre produtos frescos, orgânicos e artesanais direto da agricultura familiar regional sem intermediários.
          </p>

          {/* Barra de Pesquisa Rápida em Tempo Real */}
          <div className="mt-6 relative max-w-lg">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Pesquisar produtos (ex: Mel, Tomate, Queijo)..."
              className="w-full pl-11 pr-4 py-3.5 rounded-2xl text-gray-800 text-sm bg-white/95 focus:bg-white focus:outline-none focus:ring-2 focus:ring-honey-500 shadow-md font-medium placeholder-gray-400 transition-all"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 bg-gray-100 p-1 rounded-full"
              >
                <X size={14} />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Main Container */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-6">

        {/* Filtro por Categoria em Carrossel de Chips */}
        <div>
          <div className="flex items-center justify-between mb-2 px-1">
            <span className="text-xs font-bold text-sage-700 uppercase tracking-wider flex items-center gap-1.5">
              <Filter size={14} className="text-sage-600" />
              <span>Categorias da Feira</span>
            </span>
            <span className="text-xs text-gray-400">Deslize para ver mais &rarr;</span>
          </div>

          <div className="flex items-center gap-2 overflow-x-auto pb-3 pt-1 scrollbar-none scroll-smooth">
            {allCategories.map(cat => {
              const isActive = selectedCategory === cat.id;
              return (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`px-4 py-2.5 rounded-2xl text-xs font-bold whitespace-nowrap transition-all shadow-sm flex items-center gap-2 shrink-0 ${
                    isActive
                      ? 'bg-sage-500 text-white ring-2 ring-sage-500/30 scale-105'
                      : 'bg-white text-sage-800 hover:bg-sage-100 border border-sage-200'
                  }`}
                >
                  <span className="text-sm">{cat.icon}</span>
                  <span>{cat.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* 2. CARDS DE PRODUTOS REDESENHADOS: Grid Responsivo (2 colunas mobile, 3-4 desktop) */}
        <div>
          <div className="flex items-center justify-between mb-4 px-1">
            <h2 className="text-base sm:text-lg font-bold text-sage-800 flex items-center gap-2">
              <Store size={20} className="text-sage-600" />
              <span>Catálogo Disponível</span>
            </h2>
            <span className="text-xs font-semibold text-gray-500 bg-white px-3 py-1 rounded-full border border-sage-200 shadow-sm">
              {filteredProducts.length} {filteredProducts.length === 1 ? 'item' : 'itens'}
            </span>
          </div>

          {filteredProducts.length === 0 ? (
            <div className="bg-white rounded-3xl p-10 text-center shadow-sm border border-sage-100 max-w-md mx-auto my-8">
              <div className="w-16 h-16 bg-sage-50 text-sage-400 rounded-full flex items-center justify-center mx-auto mb-3">
                <ShoppingBag size={32} />
              </div>
              <h3 className="text-base font-bold text-sage-800">Nenhum produto encontrado</h3>
              <p className="text-xs text-gray-500 mt-1">
                Tente ajustar o termo digitado na busca ou selecionar outra categoria.
              </p>
              <button
                onClick={() => {
                  setSearchTerm('');
                  setSelectedCategory('all');
                }}
                className="mt-4 bg-sage-500 text-white text-xs font-bold px-4 py-2 rounded-xl hover:bg-sage-600 transition-colors"
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
                const theme = getCategoryTheme(product.category);

                return (
                  <div
                    key={product.id}
                    className="bg-white rounded-3xl overflow-hidden shadow-sm hover:shadow-md transition-all border border-sage-100 flex flex-col justify-between group"
                  >
                    {/* Visual Cover / Image Header */}
                    <div className={`bg-gradient-to-br ${theme.bg} p-4 text-white relative h-28 sm:h-32 flex flex-col justify-between`}>
                      
                      {/* Top Badges */}
                      <div className="flex items-center justify-between gap-1">
                        <span className="bg-black/25 backdrop-blur-md text-white text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                          <Leaf size={10} className="text-green-300" />
                          <span>Produtor Local</span>
                        </span>
                        
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          isOutOfStock
                            ? 'bg-red-500/90 text-white'
                            : availableStock < 5
                            ? 'bg-amber-500/90 text-white'
                            : 'bg-black/25 backdrop-blur-md text-white'
                        }`}>
                          {isOutOfStock ? 'Esgotado' : `${availableStock} un dispo.`}
                        </span>
                      </div>

                      {/* Visual Category Illustration */}
                      <div className="flex items-center justify-between">
                        <span className="text-3xl drop-shadow-md">{theme.icon}</span>
                        <span className="text-[10px] font-bold text-white/80 bg-black/20 px-2 py-0.5 rounded-md uppercase tracking-wider">
                          {product.category}
                        </span>
                      </div>
                    </div>

                    {/* Card Content Body */}
                    <div className="p-3.5 sm:p-4 flex-1 flex flex-col justify-between">
                      <div>
                        <h3 className="font-bold text-sage-900 text-xs sm:text-sm leading-snug line-clamp-2 group-hover:text-sage-600 transition-colors">
                          {product.name}
                        </h3>
                        <p className="text-[11px] text-gray-500 mt-0.5">
                          Cultivado na região
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

                        {/* Botão de Adição Rápida "+ Adicionar ao Carrinho" */}
                        <button
                          onClick={() => handleQuickAdd(product)}
                          disabled={isOutOfStock}
                          className={`w-full mt-3 py-2.5 px-3 rounded-xl text-xs font-bold transition-all shadow-sm flex items-center justify-center gap-1.5 ${
                            isOutOfStock
                              ? 'bg-gray-100 text-gray-400 cursor-not-allowed border border-gray-200'
                              : 'bg-sage-500 hover:bg-sage-600 active:bg-sage-700 text-white'
                          }`}
                        >
                          <Plus size={16} />
                          <span>{inCart ? `Adicionado (${inCart.quantity})` : '+ Adicionar'}</span>
                        </button>
                      </div>
                    </div>

                  </div>
                );
              })}
            </div>
          )}
        </div>

      </div>

      {/* Bar Flutuante do Carrinho (Em dispositivos móveis) */}
      {cart.length > 0 && !cartDrawerOpen && (
        <div className="fixed bottom-20 left-4 right-4 max-w-md mx-auto z-30 animate-bounce">
          <button
            onClick={() => setCartDrawerOpen(true)}
            className="w-full bg-sage-700 text-white p-3.5 rounded-2xl shadow-2xl hover:bg-sage-800 transition-all flex items-center justify-between border border-sage-600"
          >
            <div className="flex items-center gap-3">
              <div className="relative bg-honey-500 text-white p-2 rounded-xl">
                <ShoppingCart size={20} />
                <span className="absolute -top-2 -right-2 bg-red-500 text-white text-[10px] font-black rounded-full w-5 h-5 flex items-center justify-center shadow">
                  {getTotalCartItemsCount()}
                </span>
              </div>
              <div className="text-left">
                <p className="text-[11px] font-semibold text-sage-200">Subtotal do Carrinho</p>
                <p className="text-sm font-bold text-white">
                  R$ {getTotalCartPrice().toFixed(2)}
                </p>
              </div>
            </div>
            <span className="text-xs font-bold bg-honey-500 hover:bg-honey-600 text-white px-3 py-2 rounded-xl shadow-sm flex items-center gap-1">
              <span>Ver Carrinho</span>
              <ChevronRight size={16} />
            </span>
          </button>
        </div>
      )}

      {/* 3. CARRINHO FLUTUANTE (DRAWER / MODAL LATERAL) */}
      {cartDrawerOpen && (
        <div className="fixed inset-0 bg-black/65 backdrop-blur-sm z-50 flex justify-end animate-fadeIn">
          <div className="bg-white w-full max-w-md h-full flex flex-col justify-between shadow-2xl animate-slideInRight">
            
            {/* Drawer Header */}
            <div className="bg-sage-500 text-white p-5 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ShoppingCart size={22} />
                <h3 className="font-bold text-lg">Meu Carrinho da Feira</h3>
              </div>
              <button
                onClick={() => setCartDrawerOpen(false)}
                className="text-sage-200 hover:text-white bg-sage-600 p-1.5 rounded-full transition-colors"
                aria-label="Fechar carrinho"
              >
                <X size={20} />
              </button>
            </div>

            {/* Cart Selected Items List */}
            <div className="p-5 flex-1 overflow-y-auto space-y-3">
              {cart.length === 0 ? (
                <div className="text-center py-16 text-gray-500">
                  <ShoppingBag size={52} className="mx-auto text-gray-300 mb-3" />
                  <p className="font-bold text-gray-700 text-base">Seu carrinho está vazio</p>
                  <p className="text-xs mt-1 max-w-xs mx-auto text-gray-500">
                    Navegue pela vitrine e adicione os melhores produtos da agricultura familiar.
                  </p>
                </div>
              ) : (
                cart.map(item => {
                  const stock = getProductStock(item.product_id);
                  return (
                    <div
                      key={item.product_id}
                      className="bg-sage-50/70 border border-sage-200/80 rounded-2xl p-3.5 flex items-center justify-between"
                    >
                      <div className="flex-1 pr-3">
                        <h4 className="font-bold text-sage-900 text-xs sm:text-sm">{item.product_name}</h4>
                        <p className="text-xs text-honey-600 font-bold mt-0.5">
                          R$ {item.price.toFixed(2)} un
                        </p>
                      </div>

                      {/* Quantity Controls (+ / -) */}
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => updateCartQuantity(item.product_id, item.quantity - 1)}
                          className="bg-white hover:bg-gray-100 text-sage-700 border border-gray-300 rounded-lg p-1.5 transition-colors"
                          aria-label="Diminuir"
                        >
                          <Minus size={14} />
                        </button>
                        <span className="font-bold text-sage-800 text-sm w-6 text-center">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => updateCartQuantity(item.product_id, item.quantity + 1)}
                          disabled={item.quantity >= stock}
                          className="bg-white hover:bg-gray-100 text-sage-700 border border-gray-300 rounded-lg p-1.5 transition-colors disabled:opacity-40"
                          aria-label="Aumentar"
                        >
                          <Plus size={14} />
                        </button>
                        <button
                          onClick={() => removeFromCart(item.product_id)}
                          className="ml-1 text-red-500 hover:text-red-700 p-1"
                          title="Remover produto"
                        >
                          <X size={16} />
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Drawer Subtotal & Finalizar Pedido Button */}
            {cart.length > 0 && (
              <div className="p-5 border-t border-gray-200 bg-white space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-500 font-medium">Subtotal dos produtos</span>
                  <span className="font-bold text-sage-800">R$ {getTotalCartPrice().toFixed(2)}</span>
                </div>
                <div className="flex items-center justify-between text-lg font-bold text-sage-900 border-t pt-2">
                  <span>Total</span>
                  <span className="text-honey-600">R$ {getTotalCartPrice().toFixed(2)}</span>
                </div>

                {!isAuthenticated && (
                  <div className="bg-honey-50 border border-honey-200 p-2.5 rounded-xl text-[11px] text-honey-800 flex items-center gap-2">
                    <AlertCircle size={16} className="text-honey-600 shrink-0" />
                    <span>Faça login para concluir sua compra na etapa seguinte.</span>
                  </div>
                )}

                <button
                  onClick={handleInitiateCheckout}
                  className="w-full bg-honey-500 hover:bg-honey-600 active:bg-honey-700 text-white font-bold py-3.5 rounded-xl shadow-md transition-colors flex items-center justify-center gap-2 text-sm"
                >
                  <Check size={18} />
                  <span>Finalizar Pedido</span>
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* 4. FLUXO DE CHECKOUT E MONETIZAÇÃO SIMULADA (Modal de Confirmação e Pagamento) */}
      {showCheckoutModal && (
        <div className="fixed inset-0 bg-black/65 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fadeIn">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden border border-sage-100 relative max-h-[90vh] flex flex-col">
            
            {/* Header */}
            <div className="bg-sage-500 text-white p-5 flex items-center justify-between">
              <h3 className="font-bold text-lg flex items-center gap-2">
                <CheckCircle2 size={22} className="text-honey-300" />
                <span>Confirmação de Pedido</span>
              </h3>
              <button
                onClick={() => setShowCheckoutModal(false)}
                className="text-sage-200 hover:text-white bg-sage-600 p-1.5 rounded-full"
              >
                <X size={18} />
              </button>
            </div>

            <div className="p-6 overflow-y-auto space-y-5">
              
              {/* Items Summary */}
              <div className="bg-sage-50 border border-sage-200 p-4 rounded-2xl">
                <h4 className="text-xs font-bold text-sage-800 uppercase tracking-wider mb-2">Resumo da Compra</h4>
                <div className="space-y-1 text-xs text-gray-700">
                  {cart.map(item => (
                    <div key={item.product_id} className="flex justify-between">
                      <span>{item.quantity}x {item.product_name}</span>
                      <span className="font-bold">R$ {(item.price * item.quantity).toFixed(2)}</span>
                    </div>
                  ))}
                </div>
                <div className="border-t border-sage-200 mt-3 pt-2 flex justify-between font-bold text-sm text-sage-900">
                  <span>Valor Total:</span>
                  <span className="text-honey-600">R$ {getTotalCartPrice().toFixed(2)}</span>
                </div>
              </div>

              {/* Payment Method Selector */}
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-2 uppercase">Escolha a Forma de Pagamento</label>
                <div className="grid grid-cols-2 gap-3">
                  
                  {/* Pix Option */}
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('pix')}
                    className={`p-4 rounded-2xl border-2 text-left transition-all ${
                      paymentMethod === 'pix'
                        ? 'border-sage-500 bg-sage-50 text-sage-800 ring-2 ring-sage-500/20'
                        : 'border-gray-200 text-gray-600 hover:bg-gray-50'
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <QrCode className="text-sage-600" size={20} />
                      <span className="font-bold text-xs">Pix (Instantâneo)</span>
                    </div>
                    <p className="text-[11px] text-gray-500">Aprovação imediata simulada</p>
                  </button>

                  {/* Cash Option */}
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('cash')}
                    className={`p-4 rounded-2xl border-2 text-left transition-all ${
                      paymentMethod === 'cash'
                        ? 'border-sage-500 bg-sage-50 text-sage-800 ring-2 ring-sage-500/20'
                        : 'border-gray-200 text-gray-600 hover:bg-gray-50'
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <Banknote className="text-honey-600" size={20} />
                      <span className="font-bold text-xs">Dinheiro na Entrega</span>
                    </div>
                    <p className="text-[11px] text-gray-500">Pagamento no ato do recebimento</p>
                  </button>
                </div>
              </div>

              {/* Payment Details Form */}
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

              {/* Confirm Button */}
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
          <div className="bg-white rounded-3xl p-6 text-center max-w-sm w-full shadow-2xl border border-sage-100">
            <div className="bg-green-100 text-green-600 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
              <Check size={36} />
            </div>
            <h3 className="font-black text-sage-800 text-xl mb-1">Pedido Confirmado!</h3>
            <p className="text-xs text-gray-600 mb-4">
              Obrigado por apoiar os produtores regionais da feira DaTerra.
            </p>
            <button
              onClick={() => setShowSuccessModal(false)}
              className="w-full bg-sage-500 text-white py-3 rounded-xl text-xs font-bold hover:bg-sage-600 transition-colors shadow-sm"
            >
              Continuar Comprando
            </button>
          </div>
        </div>
      )}

    </div>
  );
};

export default Catalog;
