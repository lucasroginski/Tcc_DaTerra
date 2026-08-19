// =========================================================================
//            POS.JSX - FRENTE DE CAIXA / PDV (PONTO DE VENDA FÍSICO)
// =========================================================================
// O que faz: Simula um terminal de Ponto de Venda (PDV / Frente de Caixa)
// para registro ágil de vendas presenciais (feiras físicas locais, porteira).
// Por que foi implementado assim: Segue uma abordagem Mobile-First estrita, 
// otimizada para telas de celulares e tablets usados no campo.
// Permite seleção rápida com cliques, ajuste de unidades e fechamento imediato.
// Evita vendas sem estoque e atualiza instantaneamente a base relacional.

import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { useAuth } from '../context/AuthContext';

import { ShoppingCart, Plus, Minus, Check, X } from 'lucide-react';

const POS = () => {
  const { products, getProductStock, createSale, setCurrentScreen } = useApp();
  const { currentUser, logActivity, isClient } = useAuth();
  const [cart, setCart] = useState([]);
  const [showSuccess, setShowSuccess] = useState(false);

  const addToCart = (product) => {
    // Log activity when client views/interacts with product
    if (isClient() && currentUser) {
      logActivity(currentUser.id, currentUser.name, 'view_product', `Visualizou ${product.name}`);
    }

    const existingItem = cart.find(item => item.product_id === product.id);
    const availableStock = getProductStock(product.id);

    if (existingItem) {
      if (existingItem.quantity < availableStock) {
        setCart(cart.map(item =>
          item.product_id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        ));
      }
    } else {
      if (availableStock > 0) {
        setCart([...cart, {
          product_id: product.id,
          product_name: product.name,
          price: product.price,
          quantity: 1
        }]);
      }
    }
  };

  const removeFromCart = (productId) => {
    setCart(cart.filter(item => item.product_id !== productId));
  };

  const updateQuantity = (productId, newQuantity) => {
    const availableStock = getProductStock(productId);
    const validQuantity = Math.max(0, Math.min(newQuantity, availableStock));
    
    if (validQuantity === 0) {
      removeFromCart(productId);
    } else {
      setCart(cart.map(item =>
        item.product_id === productId
          ? { ...item, quantity: validQuantity }
          : item
      ));
    }
  };

  const getTotal = () => {
    return cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  };

  const handleConfirmSale = () => {
    try {
      createSale(cart);
      
      // Log purchase activity for clients
      if (isClient() && currentUser) {
        const itemsSummary = cart.map(item => `${item.product_name} (${item.quantity}x)`).join(', ');
        logActivity(currentUser.id, currentUser.name, 'purchase', `Comprou ${itemsSummary}`);
      }
      
      setCart([]);
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 2000);
    } catch (error) {
      alert(error.message);
    }
  };

  const availableProducts = products.filter(p => getProductStock(p.id) > 0);

  return (
    <div className="bg-white">
      <div className="p-6 space-y-6 max-w-4xl mx-auto">
        <div className="border-b border-gray-100 pb-4">
          <h2 className="text-lg font-black text-sage-800 flex items-center gap-2">
            <ShoppingCart className="text-sage-600" size={20} />
            <span>Frente de Caixa (PDV)</span>
          </h2>
          <p className="text-xs text-gray-500 mt-0.5 font-medium">Registre vendas presenciais/diretas para clientes locais</p>
        </div>
        {/* Cart Section */}
        <div className="bg-white rounded-2xl p-4 shadow-md">
          <div className="flex items-center gap-2 mb-3">
            <ShoppingCart className="text-sage-500" size={20} />
            <h2 className="font-semibold text-sage-700">Carrinho</h2>
          </div>

          {cart.length === 0 ? (
            <p className="text-gray-500 text-sm py-4 text-center">
              Carrinho vazio. Selecione produtos abaixo.
            </p>
          ) : (
            <div className="space-y-3">
              {cart.map((item) => {
                const availableStock = getProductStock(item.product_id);
                return (
                  <div key={item.product_id} className="flex items-center justify-between p-3 bg-sage-50 rounded-lg">
                    <div className="flex-1">
                      <p className="font-medium text-sage-700 text-sm">{item.product_name}</p>
                      <p className="text-xs text-gray-500">R$ {item.price.toFixed(2)} / un</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => updateQuantity(item.product_id, item.quantity - 1)}
                        className="bg-sage-200 hover:bg-sage-300 text-sage-700 rounded-full p-1 transition-colors"
                      >
                        <Minus size={16} />
                      </button>
                      <span className="font-semibold text-sage-700 w-8 text-center">{item.quantity}</span>
                      <button
                        onClick={() => updateQuantity(item.product_id, item.quantity + 1)}
                        className="bg-sage-200 hover:bg-sage-300 text-sage-700 rounded-full p-1 transition-colors"
                        disabled={item.quantity >= availableStock}
                      >
                        <Plus size={16} />
                      </button>
                      <button
                        onClick={() => removeFromCart(item.product_id)}
                        className="ml-2 bg-red-100 hover:bg-red-200 text-red-600 rounded-full p-1 transition-colors"
                      >
                        <X size={16} />
                      </button>
                    </div>
                  </div>
                );
              })}

              <div className="border-t border-gray-200 pt-3 mt-3">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-sage-700">Total:</span>
                  <span className="text-2xl font-bold text-sage-700">R$ {getTotal().toFixed(2)}</span>
                </div>
                <button
                  onClick={handleConfirmSale}
                  className="w-full mt-3 bg-honey-500 hover:bg-honey-600 text-white rounded-lg p-3 transition-colors font-semibold flex items-center justify-center gap-2"
                >
                  <Check size={20} />
                  Confirmar Venda
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Products Grid */}
        <div>
          <h2 className="font-semibold text-sage-700 mb-3">Produtos Disponíveis</h2>
          
          {availableProducts.length === 0 ? (
            <p className="text-gray-500 text-sm text-center py-4">
              Nenhum produto disponível em estoque.
            </p>
          ) : (
            <div className="grid grid-cols-2 gap-3">
              {availableProducts.map((product) => {
                const stock = getProductStock(product.id);
                return (
                  <button
                    key={product.id}
                    onClick={() => addToCart(product)}
                    className="bg-white rounded-2xl p-4 shadow-md hover:shadow-lg transition-shadow text-left"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="font-semibold text-sage-700 text-sm leading-tight">
                        {product.name}
                      </h3>
                      <span className="text-xs bg-sage-100 text-sage-700 px-2 py-1 rounded-full">
                        {stock} un
                      </span>
                    </div>
                    <p className="text-xs text-gray-500 mb-2">{product.category}</p>
                    <p className="font-bold text-honey-600">R$ {product.price.toFixed(2)}</p>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Out of Stock Products */}
        {products.filter(p => getProductStock(p.id) === 0).length > 0 && (
          <div>
            <h2 className="font-semibold text-gray-500 mb-3">Produtos Esgotados</h2>
            <div className="grid grid-cols-2 gap-3 opacity-60">
              {products.filter(p => getProductStock(p.id) === 0).map((product) => (
                <div
                  key={product.id}
                  className="bg-gray-100 rounded-2xl p-4 text-left"
                >
                  <h3 className="font-semibold text-gray-700 text-sm">{product.name}</h3>
                  <p className="text-xs text-gray-500">{product.category}</p>
                  <p className="font-bold text-gray-600 mt-1">Esgotado</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Success Modal */}
      {showSuccess && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 m-4 text-center">
            <div className="bg-green-100 rounded-full p-3 w-16 h-16 flex items-center justify-center mx-auto mb-4">
              <Check className="text-green-600" size={32} />
            </div>
            <h3 className="font-bold text-sage-700 text-xl mb-2">Venda Confirmada!</h3>
            <p className="text-gray-500">Estoque atualizado automaticamente.</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default POS;
