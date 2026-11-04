import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useApp } from '../context/AppContext';
import NewCycleModal from './NewCycleModal';
import SubscriptionSafraModal from './SubscriptionSafraModal';
import { Sprout, Lock, CheckCircle2, QrCode, AlertTriangle, Calendar, Sun, ArrowRight, ShieldCheck, FileText, X, Leaf } from 'lucide-react';

const cultureData = {
  'Alface': { days: 45, stages: [ { percent: 15, name: 'Muda/Germinação' }, { percent: 70, name: 'Desenvolvimento Vegetativo' }, { percent: 100, name: 'Ponto de Colheita' } ] },
  'Feijão': { days: 90, stages: [ { percent: 15, name: 'Emergência' }, { percent: 45, name: 'Crescimento' }, { percent: 75, name: 'Floração' }, { percent: 100, name: 'Maturação' } ] },
  'Milho': { days: 120, stages: [ { percent: 10, name: 'Germinação' }, { percent: 50, name: 'Crescimento Vegetativo' }, { percent: 75, name: 'Pendoamento' }, { percent: 100, name: 'Maturação' } ] },
  'Tomate': { days: 100, stages: [ { percent: 20, name: 'Mudas' }, { percent: 50, name: 'Desenvolvimento' }, { percent: 75, name: 'Floração/Frutificação' }, { percent: 100, name: 'Maturação' } ] },
  'Cenoura': { days: 100, stages: [ { percent: 20, name: 'Germinação' }, { percent: 60, name: 'Crescimento Foliar' }, { percent: 90, name: 'Engrossamento da Raiz' }, { percent: 100, name: 'Ponto de Colheita' } ] }
};

const PlantingCycle = () => {
  const { currentUser } = useAuth();
  const { products, addStock, addProduct } = useApp();
  
  const [cycles, setCycles] = useState([]);
  const [isSafraPro, setIsSafraPro] = useState(false);
  const [isNewCycleModalOpen, setIsNewCycleModalOpen] = useState(false);
  const [isSubscriptionModalOpen, setIsSubscriptionModalOpen] = useState(false);
  const [harvestModal, setHarvestModal] = useState({ isOpen: false, cycleId: null });
  const [qrModal, setQrModal] = useState({ isOpen: false, data: null });
  const [simulatedDays, setSimulatedDays] = useState(0);

  // Load from backend
  const fetchCycles = async () => {
    if (!currentUser) return;
    try {
      const res = await fetch(`http://localhost:5000/api/cycles/${currentUser.id}`);
      if (res.ok) {
        const data = await res.json();
        setCycles(data);
      }
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    fetchCycles();
    if (currentUser?.safraPro) {
      setIsSafraPro(true);
    } else if (currentUser) {
      const storedPro = localStorage.getItem(`user_${currentUser.id}_safra_pro`);
      if (storedPro) setIsSafraPro(JSON.parse(storedPro));
    }
  }, [currentUser]);

  const handleStartNewCycle = () => {
    if (cycles.length >= 1 && !isSafraPro) {
      setIsSubscriptionModalOpen(true);
    } else {
      setIsNewCycleModalOpen(true);
    }
  };

  const handleSaveCycle = async (cycleData) => {
    try {
      const payload = { ...cycleData, producerId: currentUser.id };
      const res = await fetch('http://localhost:5000/api/cycles', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (res.ok) {
        const newCycle = await res.json();
        setCycles([...cycles, newCycle]);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleSubscribe = async () => {
    try {
      const res = await fetch(`http://localhost:5000/api/users/${currentUser.id}/upgrade`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ safraPro: true })
      });
      if (res.ok) {
        setIsSafraPro(true);
        localStorage.setItem(`user_${currentUser.id}_safra_pro`, 'true');
      }
    } catch (e) {
      console.error(e);
    }
    
    setIsSubscriptionModalOpen(false);
    setTimeout(() => {
      setIsNewCycleModalOpen(true);
    }, 300);
  };

  const handleHarvest = async (e) => {
    e.preventDefault();
    const cycle = cycles.find(c => c.id === harvestModal.cycleId);
    if (!cycle) return;

    const quantityInput = e.target.quantity.value;
    const losses = e.target.losses.value;
    
    // Extrair apenas os números (ex: "400 maços" -> 400)
    const numericQuantity = parseInt(quantityInput.replace(/\\D/g, ''), 10) || 0;

    try {
      const res = await fetch(`http://localhost:5000/api/cycles/${cycle.id}/harvest`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ harvestedAmount: quantityInput, losses })
      });
      if (res.ok) {
        const updatedCycles = cycles.map(c => 
          c.id === cycle.id ? { ...c, status: 'harvested', harvestedAmount: quantityInput, losses } : c
        );
        setCycles(updatedCycles);
        
        // INTEGRAÇÃO COM ESTOQUE:
        if (numericQuantity > 0) {
          // Procura se o produtor já tem esse produto cadastrado (busca por nome)
          const existingProduct = products.find(p => 
            p.name.toLowerCase() === cycle.culture.toLowerCase() && p.producer_id === currentUser.id
          );
          
          const harvestDate = new Date().toISOString().split('T')[0];

          if (existingProduct) {
             await addStock(existingProduct.id, numericQuantity, harvestDate);
          } else {
             // Produto não existe, cadastra primeiro com estoque inicial 0, depois adiciona o estoque
             const newProductData = await addProduct({
               name: cycle.culture,
               category: 'Hortaliças',
               price: 5.00,
               isPromo: false,
               promoPrice: 0
             });
             
             if (newProductData && newProductData.productId) {
               await addStock(newProductData.productId, numericQuantity, harvestDate);
             }
          }
        }

        alert(`Colheita de ${quantityInput} ${cycle.culture} registrada com sucesso e adicionada ao estoque!`);
      }
    } catch (e) {
      console.error(e);
    }

    setHarvestModal({ isOpen: false, cycleId: null });
  };

  const calculateDaysPassed = (dateString) => {
    const start = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now - start);
    return Math.floor(diffTime / (1000 * 60 * 60 * 24)) + simulatedDays;
  };

  const checkCareStatus = (cycle) => {
    if (cycle.pestControl !== 'chemical') return null;
    const daysPassed = calculateDaysPassed(cycle.startDate);
    const careDays = parseInt(cycle.careDays, 10);
    if (daysPassed < careDays) {
      return {
        isLocked: true,
        daysLeft: careDays - daysPassed,
        message: `Carência Química: Faltam ${careDays - daysPassed} dias para liberar a colheita.`
      };
    }
    return { isLocked: false, message: 'Carência concluída. Seguro para colheita.' };
  };

  const getGrowthProgress = (cycle) => {
    const data = cultureData[cycle.culture] || { days: 90, stages: [{percent: 100, name: 'Em Andamento'}] };
    const start = new Date(cycle.startDate);
    const now = new Date();
    const diffTime = now - start;
    let daysPassed = Math.floor(diffTime / (1000 * 60 * 60 * 24)) + simulatedDays;
    if (daysPassed < 0) daysPassed = 0; // Fix negative if newly created
    
    let progress = (daysPassed / data.days) * 100;
    if (progress > 100) progress = 100;
    if (progress < 0) progress = 0;

    let currentStage = 'Em andamento';
    for (const stage of data.stages) {
      if (progress <= stage.percent) {
        currentStage = stage.name;
        break;
      }
    }
    
    if (cycle.status === 'harvested') {
      progress = 100;
      currentStage = 'Colheita Concluída';
    }

    const estimatedHarvest = new Date(start.getTime() + (data.days * 24 * 60 * 60 * 1000));
    return { progress, daysPassed, currentStage, estimatedHarvest, totalDays: data.days };
  };

  const getNextAction = (cycle) => {
    if (cycle.status === 'harvested') return 'Ciclo finalizado.';
    
    const daysPassed = calculateDaysPassed(cycle.startDate);
    
    if (cycle.pestControl === 'manual') {
      if (daysPassed < 15) return `Próxima ação: 1ª Capina em ${15 - daysPassed} dia(s).`;
      if (daysPassed < 30) return `Próxima ação: 2ª Capina em ${30 - daysPassed} dia(s).`;
    }
    if (cycle.coverFertilizer) {
      const cover = parseInt(cycle.coverDays, 10);
      if (daysPassed < cover) return `Próxima ação: Adubação de cobertura em ${cover - daysPassed} dia(s).`;
    }
    return 'Acompanhamento contínuo. Nenhuma ação agendada.';
  };

  return (
    <div className="animate-fadeIn">
      {/* Badge Topo */}
      <div className={`mb-6 p-5 rounded-[2rem] shadow-sm border flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${isSafraPro ? 'bg-gradient-to-br from-sage-600 to-sage-800 text-white border-sage-500' : 'bg-white border-sage-200 text-sage-800'}`}>
        <div className="flex items-center gap-4">
          <div className={`p-3 rounded-2xl ${isSafraPro ? 'bg-white/20' : 'bg-sage-100'}`}>
            {isSafraPro ? <CheckCircle2 size={32} className="text-honey-400" /> : <Sprout size={32} className="text-sage-600" />}
          </div>
          <div>
            <h2 className="font-black text-xl">{isSafraPro ? 'Plano Safra Pro Ativo' : 'Ciclo de Teste Gratuito'}</h2>
            <p className={`text-sm font-medium mt-1 ${isSafraPro ? 'text-sage-100' : 'text-gray-500'}`}>
              {isSafraPro ? 'Safras e recursos ilimitados liberados.' : `${cycles.length}/1 ciclo utilizado. Upgrade necessário para múltiplos lotes.`}
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          {cycles.length > 0 && (
            <button
              onClick={() => setSimulatedDays(prev => prev + 15)}
              className="px-4 py-3 bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 rounded-2xl font-bold transition-all shadow-sm text-xs flex items-center gap-1"
              title="Avançar o tempo em 15 dias para testes"
            >
              ⏳ +15 Dias {simulatedDays > 0 && `(+${simulatedDays})`}
            </button>
          )}
          <button 
            onClick={handleStartNewCycle}
            className={`px-6 py-3 rounded-2xl font-bold flex items-center justify-center gap-2 transition-all hover:scale-105 shadow-md ${
              isSafraPro 
                ? 'bg-honey-500 hover:bg-honey-600 text-white'
                : 'bg-sage-600 hover:bg-sage-700 text-white'
            }`}
          >
            <Sprout size={20} />
            <span>Iniciar Novo Plantio</span>
          </button>
        </div>
      </div>

      {/* Lista de Lotes */}
      {cycles.length === 0 ? (
        <div className="bg-white rounded-3xl p-10 text-center shadow-md border border-sage-100 mt-8">
          <div className="w-24 h-24 bg-sage-50 rounded-full flex items-center justify-center mx-auto mb-6">
            <Sprout size={48} className="text-sage-400" />
          </div>
          <h3 className="text-2xl font-bold text-sage-800 mb-3">Nenhum plantio registrado</h3>
          <p className="text-gray-500 mb-8 max-w-md mx-auto text-sm">Comece a rastrear sua produção com a inteligência DaTerra. O primeiro ciclo é totalmente gratuito!</p>
          <button onClick={handleStartNewCycle} className="bg-sage-600 hover:bg-sage-700 text-white font-bold py-4 px-8 rounded-2xl transition-all shadow-md hover:scale-105">
            Iniciar Meu Primeiro Ciclo
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {cycles.map(cycle => {
            const careStatus = checkCareStatus(cycle);
            const isLocked = careStatus?.isLocked;
            const nextAction = getNextAction(cycle);
            const isHarvested = cycle.status === 'harvested';
            const growth = getGrowthProgress(cycle);

            return (
              <div key={cycle.id} className="bg-white rounded-3xl p-6 shadow-md border border-sage-100/60 transition-all hover:shadow-xl relative overflow-hidden group flex flex-col">
                {isHarvested && (
                  <div className="absolute top-0 right-0 bg-sage-500 text-white text-[10px] font-bold px-4 py-1.5 rounded-bl-2xl z-10 shadow-sm">
                    COLHIDO
                  </div>
                )}
                <div className="flex justify-between items-start mb-6">
                  <div>
                    <h3 className="text-2xl font-black text-sage-800 flex items-center gap-2">
                      {cycle.culture}
                      {cycle.pestControl === 'manual' && (
                         <span className="bg-green-100 text-green-700 text-[10px] px-2 py-0.5 rounded-full flex items-center gap-1">
                           <ShieldCheck size={12} /> Orgânico
                         </span>
                      )}
                    </h3>
                    <p className="text-sm font-medium text-gray-500 flex items-center gap-1.5 mt-1">
                      <Sun size={14} className="text-honey-500" /> {cycle.region}
                    </p>
                  </div>
                  <div className="text-right bg-sage-50 p-2 rounded-xl">
                    <p className="text-sm font-black text-sage-700">{cycle.quantity}</p>
                    <p className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">Estimativa</p>
                  </div>
                </div>

                {/* Barra de Progresso do Crescimento */}
                <div className="mb-6 bg-sage-50 rounded-2xl p-4 border border-sage-100">
                  <div className="flex justify-between items-end mb-2">
                    <div>
                      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-0.5">Estágio Atual</p>
                      <p className="text-sm font-black text-sage-800 flex items-center gap-1.5">
                        <Leaf size={16} className="text-green-500" /> {growth.currentStage}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-black text-sage-700 leading-none">{Math.round(growth.progress)}%</p>
                    </div>
                  </div>
                  
                  <div className="w-full bg-gray-200 rounded-full h-2.5 mb-2 overflow-hidden shadow-inner">
                    <div 
                      className={`h-2.5 rounded-full transition-all duration-1000 ${isHarvested ? 'bg-honey-500' : 'bg-gradient-to-r from-green-400 to-sage-600'}`}
                      style={{ width: `${growth.progress}%` }}
                    ></div>
                  </div>
                  
                  <div className="flex justify-between text-[11px] font-medium text-gray-500">
                    <span>Dia {growth.daysPassed} de {growth.totalDays}</span>
                    {!isHarvested && (
                      <span>Previsão: {growth.estimatedHarvest.toLocaleDateString('pt-BR')}</span>
                    )}
                  </div>
                </div>

                {/* Timeline */}
                <div className="space-y-4 mb-8 flex-grow">
                  <div className="flex items-start gap-3">
                    <div className="mt-1 w-8 h-8 rounded-full bg-sage-100 text-sage-600 flex items-center justify-center shrink-0">
                      <Calendar size={14} />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-gray-800">Preparo & Plantio</p>
                      <p className="text-xs font-medium text-gray-500">{new Date(cycle.startDate).toLocaleDateString('pt-BR')}</p>
                    </div>
                  </div>
                  
                  {!isHarvested && (
                    <div className="flex items-start gap-3 relative before:absolute before:left-4 before:-top-4 before:-bottom-1 before:w-[2px] before:bg-gray-100 before:-z-10">
                      <div className="mt-1 w-8 h-8 rounded-full bg-honey-100 border-4 border-white text-honey-600 flex items-center justify-center shrink-0 z-10">
                        <ArrowRight size={14} />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-gray-800">Acompanhamento</p>
                        <p className="text-xs font-medium text-gray-500">{nextAction}</p>
                      </div>
                    </div>
                  )}

                  {careStatus && !isHarvested && (
                    <div className={`flex items-start gap-3 p-4 rounded-2xl border ${isLocked ? 'bg-red-50 border-red-200' : 'bg-green-50 border-green-200'} ml-11`}>
                      <div className={`mt-0.5 ${isLocked ? 'text-red-600' : 'text-green-600'}`}>
                        {isLocked ? <Lock size={18} /> : <CheckCircle2 size={18} />}
                      </div>
                      <div>
                        <p className={`text-xs font-bold ${isLocked ? 'text-red-700' : 'text-green-700'}`}>
                          {careStatus.message}
                        </p>
                      </div>
                    </div>
                  )}

                  {isHarvested && (
                    <div className="flex items-start gap-3 relative before:absolute before:left-4 before:-top-4 before:-bottom-1 before:w-[2px] before:bg-gray-100 before:-z-10">
                      <div className="mt-1 w-8 h-8 rounded-full bg-green-100 border-4 border-white text-green-600 flex items-center justify-center shrink-0 z-10">
                        <CheckCircle2 size={14} />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-gray-800">Colheita Registrada</p>
                        <p className="text-xs font-medium text-gray-500">Rendimento: {cycle.harvestedAmount}</p>
                        {cycle.losses && <p className="text-xs font-medium text-red-500">Perdas: {cycle.losses}</p>}
                      </div>
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div className="flex gap-3 mt-auto">
                  <button 
                    onClick={() => setQrModal({ isOpen: true, data: cycle })}
                    className="flex-1 bg-white border-2 border-sage-100 hover:border-sage-300 hover:bg-sage-50 text-sage-700 text-sm font-bold py-3.5 rounded-2xl transition-colors flex items-center justify-center gap-2"
                  >
                    <QrCode size={18} />
                    Etiqueta
                  </button>
                  {!isHarvested && (
                    <button 
                      onClick={() => !isLocked && setHarvestModal({ isOpen: true, cycleId: cycle.id })}
                      disabled={isLocked}
                      className={`flex-1 text-sm font-bold py-3.5 rounded-2xl transition-all flex items-center justify-center gap-2 ${
                        isLocked 
                          ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                          : 'bg-honey-500 hover:bg-honey-600 text-white shadow-lg shadow-honey-500/30'
                      }`}
                    >
                      <Sprout size={18} />
                      {isLocked ? 'Bloqueado' : 'Colher'}
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Harvest Modal */}
      {harvestModal.isOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fadeIn">
          <div className="bg-white rounded-3xl p-8 shadow-2xl w-full max-w-sm relative">
            <h3 className="text-xl font-black text-sage-800 mb-6 flex items-center gap-2">
              <Sprout className="text-honey-500"/> Registrar Colheita
            </h3>
            <form onSubmit={handleHarvest} className="space-y-5">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1.5">Quantidade Real Colhida</label>
                <input type="text" name="quantity" required className="w-full p-4 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-sage-500 focus:outline-none" placeholder="Ex: 400 maços" />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1.5">Houve perdas? (Opcional)</label>
                <input type="text" name="losses" className="w-full p-4 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-sage-500 focus:outline-none" placeholder="Ex: Perda de 10% por geada" />
              </div>
              <div className="flex gap-3 mt-8">
                <button type="button" onClick={() => setHarvestModal({ isOpen: false, cycleId: null })} className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-600 py-4 rounded-2xl font-bold transition-colors">Cancelar</button>
                <button type="submit" className="flex-1 bg-honey-500 hover:bg-honey-600 text-white py-4 rounded-2xl font-bold transition-colors shadow-lg">Confirmar</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* QR Code Modal */}
      {qrModal.isOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fadeIn">
          <div className="bg-white rounded-[2.5rem] p-10 shadow-2xl w-full max-w-sm relative text-center">
            <button onClick={() => setQrModal({ isOpen: false, data: null })} className="absolute top-6 right-6 text-gray-400 hover:bg-gray-100 p-2 rounded-full transition-colors">
              <X size={20} />
            </button>
            <h3 className="text-2xl font-black text-sage-800 mb-2">Rastreabilidade</h3>
            <p className="text-sm font-medium text-gray-500 mb-8">Lote de {qrModal.data?.culture}</p>
            
            <div className="bg-white border-2 border-sage-100 w-56 h-56 mx-auto rounded-3xl flex items-center justify-center mb-8 shadow-sm">
              <QrCode size={160} className="text-sage-800" strokeWidth={1} />
            </div>
            
            <button onClick={() => window.print()} className="w-full bg-sage-600 hover:bg-sage-700 text-white py-4 rounded-2xl font-bold flex items-center justify-center gap-2 transition-transform hover:scale-105 shadow-lg">
              <FileText size={20} /> Imprimir Etiqueta
            </button>
          </div>
        </div>
      )}

      <NewCycleModal 
        isOpen={isNewCycleModalOpen} 
        onClose={() => setIsNewCycleModalOpen(false)} 
        onSave={handleSaveCycle}
      />
      <SubscriptionSafraModal
        isOpen={isSubscriptionModalOpen}
        onClose={() => setIsSubscriptionModalOpen(false)}
        onSubscribe={handleSubscribe}
      />
    </div>
  );
};

export default PlantingCycle;
