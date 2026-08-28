// =========================================================================
//              INVENTORY.JSX - MÓDULO DE GESTÃO DE ESTOQUE
// =========================================================================
// O que faz: Permite o CRUD (Cadastro, Leitura, Edição e Exclusão) de produtos,
// além do incremento de estoque com indicação de data de colheita.
// Por que foi implementado assim: Este componente executa a validação em tempo real
// do limite de capacidade do plano SaaS do produtor (limite reativo no frontend).
// Caso o limite de produtos do plano gratuito seja atingido, a interface trava
// a inserção de novos produtos e redireciona o fluxo para a tela de planos,
// demonstrando consistência em regras de monetização.

import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { useAuth } from '../context/AuthContext';

import { Package, Plus, X, Calendar, Edit2, Check, AlertTriangle, Crown, ShieldCheck, Trash2 } from 'lucide-react';

const Inventory = () => {
  const { products, getProductStock, addStock, addProduct, updateProduct, deleteProduct } = useApp();
  const { currentUser, openPlansModal, isAdmin } = useAuth();
  
  const [showAddProduct, setShowAddProduct] = useState(false);
  const [showAddStock, setShowAddStock] = useState(null);
  const [editingProduct, setEditingProduct] = useState(null); // { id, name, category, price }
  const [showLimitAlert, setShowLimitAlert] = useState(false);

  const [newProduct, setNewProduct] = useState({ name: '', category: '', price: '', isPromo: false, promoPrice: '' });
  const [stockToAdd, setStockToAdd] = useState({ quantity: '', harvestDate: '' });

  const productLimit = currentUser?.productLimit || 10;
  const isUserAdmin = isAdmin();
  const isAtLimit = !isUserAdmin && products.length >= productLimit;

  const handleOpenAddProduct = () => {
    if (isAtLimit) {
      setShowLimitAlert(true);
      return;
    }
    setShowAddProduct(true);
    setEditingProduct(null);
  };

  const handleAddProduct = (e) => {
    e.preventDefault();
    if (isAtLimit) {
      setShowLimitAlert(true);
      return;
    }

    if (newProduct.name && newProduct.category && newProduct.price) {
      addProduct({
        name: newProduct.name,
        category: newProduct.category,
        price: parseFloat(newProduct.price)
      });
      setNewProduct({ name: '', category: '', price: '' });
      setShowAddProduct(false);
    }
  };

  const handleStartEdit = (product) => {
    setEditingProduct({
      id: product.id,
      name: product.name,
      category: product.category,
      price: product.price.toString()
    });
  };

  const handleSaveEdit = (e) => {
    e.preventDefault();
    if (editingProduct && editingProduct.name && editingProduct.category && editingProduct.price) {
      updateProduct(editingProduct.id, {
        name: editingProduct.name,
        category: editingProduct.category,
        price: editingProduct.price
      });
      setEditingProduct(null);
    }
  };

  const handleAddStock = (productId) => {
    if (stockToAdd.quantity && parseInt(stockToAdd.quantity) > 0) {
      addStock(productId, parseInt(stockToAdd.quantity), stockToAdd.harvestDate);
      setStockToAdd({ quantity: '', harvestDate: '' });
      setShowAddStock(null);
    }
  };

  const handleDeleteProduct = (productId, productName) => {
    if (window.confirm(`Deseja realmente excluir o produto "${productName}"? Esta ação removerá o produto e todo o seu estoque associado de forma permanente.`)) {
      deleteProduct(productId);
    }
  };

  const getStockItem = (productId) => {
    const product = products.find(p => p.id === productId);
    if (product && product.current_quantity !== null) {
      return { 
        current_quantity: product.current_quantity, 
        harvest_date: product.harvest_date 
      };
    }
    return null;
  };

  return (
    <div className="bg-white">
      <div className="p-6 space-y-6 max-w-4xl mx-auto">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-100 pb-4">
          <div>
            <h2 className="text-lg font-black text-sage-800 flex items-center gap-2">
              <Package className="text-sage-600" size={20} />
              <span>Gerenciamento de Estoque</span>
            </h2>
            <p className="text-xs text-gray-500 mt-0.5 font-medium">Cadastre produtos e insira volumes colhidos</p>
          </div>

          {/* Product Limit Indicator Badge */}
          <button
            onClick={openPlansModal}
            className="bg-sage-50 hover:bg-sage-100 border border-sage-200 text-sage-850 px-3.5 py-2 rounded-2xl text-xs font-extrabold transition-all text-right shrink-0 flex flex-col items-end shadow-sm"
            title="Ver limites do plano VIP"
          >
            <span className="text-[9px] text-sage-500 font-medium uppercase tracking-wider">Capacidade do Plano</span>
            <span className="text-sm font-black text-honey-600 mt-0.5">
              {products.length} / {isUserAdmin ? '∞' : productLimit} produtos
            </span>
          </button>
        </div>

        {/* SaaS Limit Capacity Warning Banner if near or at limit */}
        {isAtLimit && (
          <div className="bg-honey-50 border border-honey-300 rounded-2xl p-4 flex items-center justify-between gap-3 text-honey-900 shadow-sm animate-fadeIn">
            <div className="flex items-center gap-3">
              <AlertTriangle className="text-honey-600 shrink-0" size={24} />
              <div>
                <p className="text-xs font-bold">Limite de Produtos Atingido ({products.length} de {productLimit})</p>
                <p className="text-[11px] text-honey-700 mt-0.5">
                  Assine o Plano VIP ou adquira +10 produtos por R$ 5,00 para cadastrar novos itens.
                </p>
              </div>
            </div>
            <button
              onClick={openPlansModal}
              className="bg-honey-500 hover:bg-honey-600 text-white text-xs font-bold px-3 py-2 rounded-xl shrink-0 shadow-sm transition-colors"
            >
              Ver Planos
            </button>
          </div>
        )}

        {/* Add Product Button */}
        <button
          onClick={handleOpenAddProduct}
          className={`w-full rounded-2xl p-4 shadow-md transition-all flex items-center justify-center gap-2 font-semibold text-white ${
            isAtLimit
              ? 'bg-amber-600 hover:bg-amber-700'
              : 'bg-honey-500 hover:bg-honey-600 active:bg-honey-700'
          }`}
        >
          <Plus size={20} />
          <span>{isAtLimit ? 'Cadastrar Novo Produto (Limite Atingido)' : 'Cadastrar Novo Produto'}</span>
        </button>

        {/* Add Product Form Box */}
        {showAddProduct && (
          <div className="bg-white rounded-2xl p-5 shadow-md border border-sage-100 animate-fadeIn">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-sage-700 text-base">Novo Produto</h3>
              <button onClick={() => setShowAddProduct(false)} className="text-gray-400 hover:text-gray-600">
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleAddProduct} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">Nome do Produto</label>
                <input
                  type="text"
                  placeholder="Ex: Mel Silvestre 500g"
                  value={newProduct.name}
                  onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })}
                  className="w-full p-3 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-sage-500"
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">Categoria</label>
                  <input
                    type="text"
                    placeholder="Ex: Apicultura"
                    value={newProduct.category}
                    onChange={(e) => setNewProduct({ ...newProduct, category: e.target.value })}
                    className="w-full p-3 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-sage-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">Preço (R$)</label>
                  <input
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                    value={newProduct.price}
                    onChange={(e) => setNewProduct({ ...newProduct, price: e.target.value })}
                    className="w-full p-3 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-sage-500"
                    required
                  />
                </div>
              </div>
              <div className="bg-sage-50 p-3 rounded-xl border border-sage-100 flex flex-col gap-3">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={newProduct.isPromo}
                    onChange={(e) => setNewProduct({ ...newProduct, isPromo: e.target.checked })}
                    className="w-4 h-4 text-sage-600 rounded border-gray-300 focus:ring-sage-500"
                  />
                  <span className="text-sm font-semibold text-sage-800">Ativar Promoção</span>
                </label>
                {newProduct.isPromo && (
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-1">Preço Promocional (R$)</label>
                    <input
                      type="number"
                      step="0.01"
                      placeholder="0.00"
                      value={newProduct.promoPrice}
                      onChange={(e) => setNewProduct({ ...newProduct, promoPrice: e.target.value })}
                      className="w-full p-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-sage-500"
                      required
                    />
                  </div>
                )}
              </div>
              <button
                type="submit"
                className="w-full bg-sage-500 hover:bg-sage-600 text-white rounded-xl p-3 transition-colors font-semibold text-sm shadow-sm mt-2"
              >
                Adicionar Produto
              </button>
            </form>
          </div>
        )}

        {/* Global Edit Product Modal / Box */}
        {editingProduct && (
          <div className="bg-white rounded-2xl p-5 shadow-lg border-2 border-honey-500 animate-fadeIn">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Edit2 className="text-honey-600" size={18} />
                <h3 className="font-bold text-sage-800 text-base">Editar Produto #{editingProduct.id}</h3>
              </div>
              <button onClick={() => setEditingProduct(null)} className="text-gray-400 hover:text-gray-600">
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleSaveEdit} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">Nome do Produto</label>
                <input
                  type="text"
                  value={editingProduct.name}
                  onChange={(e) => setEditingProduct({ ...editingProduct, name: e.target.value })}
                  className="w-full p-3 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-honey-500"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">Categoria</label>
                  <input
                    type="text"
                    value={editingProduct.category}
                    onChange={(e) => setEditingProduct({ ...editingProduct, category: e.target.value })}
                    className="w-full p-3 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-honey-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">Preço (R$)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={editingProduct.price}
                    onChange={(e) => setEditingProduct({ ...editingProduct, price: e.target.value })}
                    className="w-full p-3 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-honey-500"
                    required
                  />
                </div>
              </div>

              <div className="bg-honey-50 p-3 rounded-xl border border-honey-100 flex flex-col gap-3 mt-3">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={editingProduct.isPromo || false}
                    onChange={(e) => setEditingProduct({ ...editingProduct, isPromo: e.target.checked })}
                    className="w-4 h-4 text-honey-600 rounded border-gray-300 focus:ring-honey-500"
                  />
                  <span className="text-sm font-semibold text-honey-900">Em Promoção</span>
                </label>
                {editingProduct.isPromo && (
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-1">Preço Promocional (R$)</label>
                    <input
                      type="number"
                      step="0.01"
                      placeholder="0.00"
                      value={editingProduct.promoPrice || ''}
                      onChange={(e) => setEditingProduct({ ...editingProduct, promoPrice: e.target.value })}
                      className="w-full p-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-honey-500"
                      required
                    />
                  </div>
                )}
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setEditingProduct(null)}
                  className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl p-3 text-sm font-semibold transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-honey-500 hover:bg-honey-600 text-white rounded-xl p-3 text-sm font-semibold transition-colors shadow-sm flex items-center justify-center gap-1.5"
                >
                  <Check size={18} />
                  <span>Salvar Alterações</span>
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Products List */}
        <div className="space-y-3">
          {products.map((product) => {
            const stockItem = getStockItem(product.id);
            const currentStock = stockItem ? stockItem.current_quantity : 0;
            const harvestDate = stockItem ? stockItem.harvest_date : '-';

            return (
              <div key={product.id} className="bg-white rounded-2xl p-4 shadow-sm border border-sage-100 hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <Package className="text-sage-500" size={18} />
                      <h3 className="font-bold text-sage-800">{product.name}</h3>
                      {product.is_promo && (
                        <span className="bg-honey-500 text-white text-[9px] font-black uppercase px-2 py-0.5 rounded-full tracking-wider animate-pulse">
                          Promoção
                        </span>
                      )}
                    </div>
                    <p className="text-xs font-medium text-sage-600 mb-2">{product.category}</p>
                    <div className="flex items-center gap-4 text-xs">
                      <div>
                        {product.is_promo && product.promo_price ? (
                          <div className="flex items-center gap-2">
                            <p className="text-sm font-black text-honey-600">R$ {parseFloat(product.promo_price).toFixed(2)}</p>
                            <p className="text-[10px] text-gray-400 line-through">R$ {product.price.toFixed(2)}</p>
                          </div>
                        ) : (
                          <p className="text-sm font-black text-sage-600">R$ {product.price.toFixed(2)}</p>
                        )}
                      </div>
                      <div>
                        <span className="text-gray-500">Estoque: </span>
                        <span className={`font-bold ${currentStock < 5 ? 'text-orange-600' : 'text-sage-700'}`}>
                          {currentStock} un
                        </span>
                      </div>
                    </div>
                    {stockItem && (
                      <div className="flex items-center gap-1 mt-2 text-[11px] text-gray-500">
                        <Calendar size={13} />
                        <span>Colhido em: {new Date(harvestDate).toLocaleDateString('pt-BR')}</span>
                      </div>
                    )}
                  </div>

                  {/* Actions: Edit Product, Add Stock & Delete Product */}
                  <div className="flex items-center gap-1.5 sm:gap-2">
                    <button
                      onClick={() => handleStartEdit(product)}
                      className="bg-honey-50 hover:bg-honey-100 text-honey-700 border border-honey-200 rounded-full p-2.5 transition-colors"
                      title="Editar produto"
                    >
                      <Edit2 size={16} />
                    </button>
                    <button
                      onClick={() => setShowAddStock(product.id)}
                      className="bg-sage-50 hover:bg-sage-100 text-sage-700 border border-sage-200 rounded-full p-2.5 transition-colors"
                      title="Adicionar estoque"
                    >
                      <Plus size={16} />
                    </button>
                    <button
                      onClick={() => handleDeleteProduct(product.id, product.name)}
                      className="bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 rounded-full p-2.5 transition-colors"
                      title="Excluir produto"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>

                {/* Add Stock Modal inline */}
                {showAddStock === product.id && (
                  <div className="mt-4 pt-4 border-t border-gray-200 animate-fadeIn">
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex items-center gap-2">
                        <h4 className="font-bold text-sage-800 text-sm">{product.name}</h4>
                        {product.is_promo && (
                          <span className="bg-honey-500 text-white text-[9px] font-black uppercase px-2 py-0.5 rounded-full tracking-wider animate-pulse">
                            Promoção
                          </span>
                        )}
                      </div>
                      <span className="bg-sage-100 text-sage-700 text-xs px-2 py-1 rounded-md font-medium">
                        {product.category}
                      </span>
                    </div>
                    <div className="flex gap-2">
                      <input
                        type="number"
                        placeholder="Qtd"
                        value={stockToAdd.quantity}
                        onChange={(e) => setStockToAdd({ ...stockToAdd, quantity: e.target.value })}
                        className="flex-1 p-2 border border-gray-300 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-sage-500"
                        min="1"
                      />
                      <input
                        type="date"
                        value={stockToAdd.harvestDate}
                        onChange={(e) => setStockToAdd({ ...stockToAdd, harvestDate: e.target.value })}
                        className="flex-1 p-2 border border-gray-300 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-sage-500"
                      />
                      <button
                        onClick={() => handleAddStock(product.id)}
                        className="bg-sage-500 hover:bg-sage-600 text-white rounded-xl px-4 text-xs font-semibold transition-colors"
                      >
                        Salvar
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Trava de Limite Atingido (Alert Modal) */}
      {showLimitAlert && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fadeIn">
          <div className="bg-white rounded-3xl p-6 text-center max-w-sm w-full shadow-2xl border border-honey-200 relative">
            <button
              onClick={() => setShowLimitAlert(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
            >
              <X size={20} />
            </button>
            <div className="bg-honey-100 text-honey-600 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
              <AlertTriangle size={32} />
            </div>
            <h3 className="font-extrabold text-sage-800 text-lg mb-2">Limite Atingido!</h3>
            <p className="text-xs text-gray-600 mb-5 leading-relaxed font-medium">
              Assine o Plano VIP ou adicione +10 produtos por R$ 5,00 para continuar cadastrando novos itens no estoque.
            </p>
            <div className="space-y-2">
              <button
                onClick={() => {
                  setShowLimitAlert(false);
                  openPlansModal();
                }}
                className="w-full bg-honey-500 hover:bg-honey-600 text-white py-3 rounded-xl text-xs font-bold shadow-md transition-colors flex items-center justify-center gap-1.5"
              >
                <Crown size={16} />
                <span>Ver Planos e Assinaturas</span>
              </button>
              <button
                onClick={() => setShowLimitAlert(false)}
                className="w-full bg-gray-100 hover:bg-gray-200 text-gray-600 py-2.5 rounded-xl text-xs font-semibold transition-colors"
              >
                Entendi
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Inventory;
