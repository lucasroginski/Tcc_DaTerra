import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useApp } from '../context/AppContext';
import { Hexagon, Sparkles, Droplets, Calendar, QrCode, ShieldCheck, PlusCircle, Target, X, Check } from 'lucide-react';

const BeekeepingManagement = () => {
  const { currentUser } = useAuth();
  const { products, addStock, addProduct } = useApp();

  const [apiaries, setApiaries] = useState([]);
  const [isNewModalOpen, setIsNewModalOpen] = useState(false);
  const [harvestModal, setHarvestModal] = useState({ isOpen: false, apiaryId: null });
  const [qrModal, setQrModal] = useState({ isOpen: false, data: null });

  // Load from backend
  const fetchApiaries = async () => {
    if (!currentUser) return;
    try {
      const res = await fetch(`http://localhost:5000/api/apiaries/${currentUser.id}`);
      if (res.ok) {
        const data = await res.json();
        setApiaries(data);
      }
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    fetchApiaries();
  }, [currentUser]);

  const handleSaveApiary = async (e) => {
    e.preventDefault();
    const payload = {
      producerId: currentUser.id,
      name: e.target.name.value,
      region: e.target.region.value,
      hivesCount: parseInt(e.target.hivesCount.value, 10),
      beeType: e.target.beeType.value,
      florada: e.target.florada.value
    };

    try {
      const res = await fetch('http://localhost:5000/api/apiaries', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (res.ok) {
        const newApiary = await res.json();
        setApiaries([newApiary, ...apiaries]);
        setIsNewModalOpen(false);
      }
    } catch (error) {
      console.error(error);
    }
  };

  // Metrics
  const totalHives = apiaries.reduce((acc, curr) => acc + curr.hivesCount, 0);
  const totalHoney = apiaries.reduce((acc, curr) => acc + (parseFloat(curr.totalHarvested) || 0), 0);

  return (
    <div className="animate-fadeIn p-2">
      {/* Top Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <div className="bg-honey-50 rounded-3xl p-5 border border-honey-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-[10px] font-bold text-honey-600 uppercase tracking-wider mb-1">Colmeias Ativas</p>
            <p className="text-3xl font-black text-honey-900">{totalHives}</p>
          </div>
          <div className="bg-honey-100 p-3 rounded-2xl text-honey-600">
            <Hexagon size={28} />
          </div>
        </div>
        
        <div className="bg-sage-50 rounded-3xl p-5 border border-sage-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-[10px] font-bold text-sage-600 uppercase tracking-wider mb-1">Produção Total (kg)</p>
            <p className="text-3xl font-black text-sage-900">{totalHoney.toFixed(1)}</p>
          </div>
          <div className="bg-sage-100 p-3 rounded-2xl text-sage-600">
            <Droplets size={28} />
          </div>
        </div>
        
        <div className="bg-white rounded-3xl p-5 border border-gray-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">Próxima Florada</p>
            <p className="text-xl font-black text-gray-800">Primavera</p>
            <p className="text-[10px] text-gray-400 font-medium">Estimativa: Set/Out</p>
          </div>
          <div className="bg-gray-50 p-3 rounded-2xl text-gray-400">
            <Sparkles size={28} />
          </div>
        </div>
      </div>

      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-black text-sage-800 flex items-center gap-2">
          <Hexagon className="text-honey-500" /> Meus Apiários
        </h2>
        <button 
          onClick={() => setIsNewModalOpen(true)}
          className="bg-honey-500 hover:bg-honey-600 text-white px-5 py-2.5 rounded-2xl font-bold flex items-center gap-2 shadow-md hover:scale-105 transition-all text-sm"
        >
          <PlusCircle size={18} /> Registar Apiário
        </button>
      </div>

      {apiaries.length === 0 ? (
        <div className="text-center bg-white p-10 rounded-3xl border border-dashed border-sage-200">
          <Hexagon size={48} className="text-sage-300 mx-auto mb-4" />
          <h3 className="text-lg font-bold text-sage-700">Nenhum apiário registado</h3>
          <p className="text-sm text-gray-500 mt-2">Adicione seu primeiro apiário para começar a rastrear a produção de mel.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {apiaries.map(apiary => (
            <div key={apiary.id} className="bg-white rounded-3xl p-6 shadow-md border border-honey-100 hover:shadow-xl transition-all group">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-2xl font-black text-sage-800">{apiary.name}</h3>
                  <p className="text-sm font-medium text-gray-500 mt-0.5">{apiary.region}</p>
                </div>
                <div className="bg-honey-50 px-3 py-1.5 rounded-xl border border-honey-100 text-center">
                  <p className="text-xl font-black text-honey-700 leading-none">{apiary.hivesCount}</p>
                  <p className="text-[9px] font-bold text-honey-600 uppercase mt-1">Colmeias</p>
                </div>
              </div>
              
              <div className="space-y-3 mb-6">
                <div className="flex items-center justify-between text-sm border-b border-gray-50 pb-2">
                  <span className="text-gray-500 flex items-center gap-2"><Target size={16} className="text-sage-400"/> Tipo de Abelha</span>
                  <span className="font-bold text-sage-700">{apiary.beeType}</span>
                </div>
                <div className="flex items-center justify-between text-sm border-b border-gray-50 pb-2">
                  <span className="text-gray-500 flex items-center gap-2"><Sparkles size={16} className="text-honey-400"/> Florada Predominante</span>
                  <span className="font-bold text-sage-700">{apiary.florada}</span>
                </div>
                <div className="flex items-center justify-between text-sm pb-1">
                  <span className="text-gray-500 flex items-center gap-2"><Calendar size={16} className="text-gray-400"/> Última Cresta</span>
                  <span className="font-bold text-sage-700">
                    {apiary.lastHarvestDate ? new Date(apiary.lastHarvestDate).toLocaleDateString('pt-BR') : 'Nunca colhido'}
                  </span>
                </div>
              </div>

              <div className="flex gap-2">
                <button 
                  onClick={() => setHarvestModal({ isOpen: true, apiaryId: apiary.id })}
                  className="flex-1 bg-honey-500 hover:bg-honey-600 text-white font-bold py-3 rounded-2xl transition-all shadow-md text-xs flex items-center justify-center gap-1.5"
                >
                  <Droplets size={16} /> Registar Cresta
                </button>
                <button 
                  onClick={() => setQrModal({ isOpen: true, data: apiary })}
                  className="bg-white border-2 border-sage-100 text-sage-600 hover:bg-sage-50 font-bold p-3 rounded-2xl transition-all shadow-sm flex items-center justify-center"
                  title="Gerar QR Code de Rastreabilidade"
                >
                  <QrCode size={18} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* NEW APIARY MODAL */}
      {isNewModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl overflow-hidden animate-slideUp">
            <div className="bg-honey-500 p-6 text-white flex justify-between items-center">
              <h2 className="text-xl font-black flex items-center gap-2"><Hexagon size={24} /> Novo Apiário</h2>
              <button onClick={() => setIsNewModalOpen(false)} className="bg-honey-600 p-2 rounded-xl hover:bg-honey-700"><X size={20} /></button>
            </div>
            <form onSubmit={handleSaveApiary} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-sage-700 uppercase mb-1">Nome do Apiário</label>
                <input required name="name" type="text" placeholder="Ex: Sítio Recanto Feliz" className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-honey-500 focus:outline-none" />
              </div>
              <div>
                <label className="block text-xs font-bold text-sage-700 uppercase mb-1">Região / Município</label>
                <input required name="region" type="text" placeholder="Ex: Serra da Mantiqueira" className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-honey-500 focus:outline-none" />
              </div>
              <div>
                <label className="block text-xs font-bold text-sage-700 uppercase mb-1">Quantidade de Colmeias Ativas</label>
                <input required name="hivesCount" type="number" min="1" defaultValue="10" className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-honey-500 focus:outline-none" />
              </div>
              <div>
                <label className="block text-xs font-bold text-sage-700 uppercase mb-1">Tipo de Abelha</label>
                <select name="beeType" className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-honey-500 focus:outline-none text-gray-700">
                  <option value="Apis mellifera (Com Ferrão)">Apis mellifera (Com Ferrão)</option>
                  <option value="Jataí (Sem Ferrão)">Jataí (Sem Ferrão)</option>
                  <option value="Mandaçaia (Sem Ferrão)">Mandaçaia (Sem Ferrão)</option>
                  <option value="Tiúba (Sem Ferrão)">Tiúba (Sem Ferrão)</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-sage-700 uppercase mb-1">Florada Predominante</label>
                <select name="florada" className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-honey-500 focus:outline-none text-gray-700">
                  <option value="Silvestre">Silvestre</option>
                  <option value="Laranjeira">Laranjeira</option>
                  <option value="Eucalipto">Eucalipto</option>
                  <option value="Assa-peixe">Assa-peixe</option>
                </select>
              </div>
              <div className="pt-2">
                <button type="submit" className="w-full bg-honey-500 hover:bg-honey-600 text-white font-bold py-3.5 rounded-xl transition-all shadow-md flex items-center justify-center gap-2">
                  <Check size={20} /> Salvar Apiário
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* HARVEST MODAL COMPONENT */}
      {harvestModal.isOpen && (
        <HarvestModal 
          apiary={apiaries.find(a => a.id === harvestModal.apiaryId)} 
          onClose={() => setHarvestModal({ isOpen: false, apiaryId: null })}
          onHarvestSuccess={fetchApiaries}
          currentUser={currentUser}
          products={products}
          addStock={addStock}
          addProduct={addProduct}
        />
      )}
      
      {/* QR MODAL */}
      {qrModal.isOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-sm rounded-3xl shadow-2xl p-8 text-center relative">
            <button onClick={() => setQrModal({ isOpen: false, data: null })} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"><X size={20}/></button>
            <div className="w-48 h-48 bg-gray-100 rounded-2xl mx-auto mb-6 flex items-center justify-center border-4 border-sage-100">
              <QrCode size={100} className="text-sage-800" />
            </div>
            <h3 className="text-xl font-black text-sage-800">{qrModal.data?.name}</h3>
            <p className="text-sm font-medium text-gray-500 mb-6">{qrModal.data?.region}</p>
            
            <div className="text-left bg-honey-50 p-4 rounded-2xl border border-honey-100 space-y-2 mb-6">
              <p className="text-xs font-bold text-honey-800 flex items-center justify-between">
                <span>Florada:</span> <span>{qrModal.data?.florada}</span>
              </p>
              <p className="text-xs font-bold text-honey-800 flex items-center justify-between">
                <span>Abelha:</span> <span>{qrModal.data?.beeType}</span>
              </p>
              <p className="text-xs font-bold text-honey-800 flex items-center justify-between">
                <span>Pureza:</span> <span className="flex items-center gap-1"><ShieldCheck size={14}/> 100% Natural</span>
              </p>
            </div>
            <button onClick={() => window.print()} className="w-full bg-sage-600 hover:bg-sage-700 text-white font-bold py-3 rounded-xl">Imprimir Etiqueta</button>
          </div>
        </div>
      )}

    </div>
  );
};

// Separated component for complex Harvest Logic
const HarvestModal = ({ apiary, onClose, onHarvestSuccess, currentUser, products, addStock, addProduct }) => {
  const [totalKg, setTotalKg] = useState('');
  const [fractions, setFractions] = useState([{ size: '500g', quantity: '', price: '' }]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleAddFraction = () => setFractions([...fractions, { size: '1kg', quantity: '', price: '' }]);
  
  const handleFractionChange = (index, field, value) => {
    const newF = [...fractions];
    newF[index][field] = value;
    setFractions(newF);
  };

  const handleRemoveFraction = (index) => {
    setFractions(fractions.filter((_, i) => i !== index));
  };

  const submitHarvest = async (e) => {
    e.preventDefault();
    if (!totalKg || fractions.some(f => !f.quantity || !f.price)) {
      alert("Preencha todos os campos obrigatórios.");
      return;
    }
    
    setIsSubmitting(true);
    try {
      // 1. Atualizar apiário (Backend)
      await fetch(`http://localhost:5000/api/apiaries/${apiary.id}/harvest`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ totalHarvested: parseFloat(totalKg) })
      });

      // 2. Integração com Estoque (Para cada fração)
      const harvestDate = new Date().toISOString().split('T')[0];
      
      for (const frac of fractions) {
        const productName = `Mel ${apiary.florada} - ${frac.size}`;
        const existingProduct = products.find(p => p.name.toLowerCase() === productName.toLowerCase() && p.producer_id === currentUser.id);
        
        if (existingProduct) {
          await addStock(existingProduct.id, parseInt(frac.quantity), harvestDate);
          // Opcional: atualizar o preço se quiser
        } else {
          const newProductData = await addProduct({
            name: productName,
            category: 'Mel e Derivados',
            price: parseFloat(frac.price),
            isPromo: false,
            promoPrice: 0
          });
          if (newProductData && newProductData.productId) {
            await addStock(newProductData.productId, parseInt(frac.quantity), harvestDate);
          }
        }
      }

      alert("Cresta registrada com sucesso e potes adicionados ao estoque da Vitrine!");
      onHarvestSuccess();
      onClose();
    } catch (err) {
      console.error(err);
      alert("Erro ao salvar cresta.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fadeIn">
      <div className="bg-white w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden animate-slideUp">
        <div className="bg-gradient-to-r from-honey-500 to-honey-600 p-6 text-white flex justify-between items-center">
          <h2 className="text-xl font-black flex items-center gap-2"><Droplets size={24} /> Registar Cresta (Colheita)</h2>
          <button onClick={onClose} className="bg-white/20 p-2 rounded-xl hover:bg-white/30"><X size={20} /></button>
        </div>
        <form onSubmit={submitHarvest} className="p-6 space-y-6 max-h-[70vh] overflow-y-auto">
          
          <div className="bg-sage-50 p-4 rounded-2xl border border-sage-100 flex items-center justify-between">
            <span className="text-sm font-bold text-sage-800">Apiário: {apiary.name}</span>
            <span className="text-xs bg-sage-200 text-sage-700 px-2 py-1 rounded-lg font-bold">{apiary.florada}</span>
          </div>

          <div>
            <label className="block text-xs font-bold text-sage-700 uppercase mb-1">Total Colhido Bruto (kg ou L)</label>
            <input required value={totalKg} onChange={e => setTotalKg(e.target.value)} type="number" step="0.1" placeholder="Ex: 50.5" className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-honey-500 focus:outline-none font-black text-lg" />
          </div>

          <div>
            <div className="flex justify-between items-end mb-3">
              <label className="block text-xs font-bold text-sage-700 uppercase">Fracionamento para Estoque (Potes)</label>
              <button type="button" onClick={handleAddFraction} className="text-xs font-bold text-honey-600 hover:text-honey-700 flex items-center gap-1 bg-honey-50 px-2 py-1 rounded-lg">
                <PlusCircle size={14}/> Adicionar Tamanho
              </button>
            </div>
            
            <div className="space-y-3">
              {fractions.map((frac, index) => (
                <div key={index} className="flex gap-2 items-center bg-gray-50 p-3 rounded-2xl border border-gray-100">
                  <div className="flex-1">
                    <span className="text-[10px] text-gray-500 font-bold uppercase">Tamanho</span>
                    <select value={frac.size} onChange={e => handleFractionChange(index, 'size', e.target.value)} className="w-full bg-white border border-gray-200 rounded-lg px-2 py-2 text-xs font-bold mt-1">
                      <option value="250g">250g</option>
                      <option value="500g">500g</option>
                      <option value="1kg">1kg</option>
                    </select>
                  </div>
                  <div className="flex-1">
                    <span className="text-[10px] text-gray-500 font-bold uppercase">Qtd (Potes)</span>
                    <input required value={frac.quantity} onChange={e => handleFractionChange(index, 'quantity', e.target.value)} type="number" min="1" className="w-full bg-white border border-gray-200 rounded-lg px-2 py-2 text-xs font-bold mt-1" placeholder="Ex: 60" />
                  </div>
                  <div className="flex-1">
                    <span className="text-[10px] text-gray-500 font-bold uppercase">Preço (R$)</span>
                    <input required value={frac.price} onChange={e => handleFractionChange(index, 'price', e.target.value)} type="number" step="0.1" className="w-full bg-white border border-gray-200 rounded-lg px-2 py-2 text-xs font-bold mt-1" placeholder="Ex: 25.00" />
                  </div>
                  {fractions.length > 1 && (
                    <button type="button" onClick={() => handleRemoveFraction(index)} className="mt-4 text-red-400 hover:text-red-600 p-1">
                      <X size={16}/>
                    </button>
                  )}
                </div>
              ))}
            </div>
            <p className="text-[10px] text-gray-400 mt-2 text-center">Os potes serão enviados automaticamente para a aba Estoque após a cresta.</p>
          </div>

          <div className="pt-2">
            <button disabled={isSubmitting} type="submit" className="w-full bg-honey-500 hover:bg-honey-600 text-white font-bold py-4 rounded-2xl transition-all shadow-md flex items-center justify-center gap-2 disabled:opacity-50 text-lg">
              {isSubmitting ? 'Processando...' : <><Droplets size={20} /> Salvar Cresta e Enviar ao Estoque</>}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default BeekeepingManagement;
