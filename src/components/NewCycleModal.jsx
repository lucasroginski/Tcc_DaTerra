import React, { useState } from 'react';
import { X, Sprout, MapPin, Droplets, ShieldAlert, Calendar } from 'lucide-react';

const NewCycleModal = ({ isOpen, onClose, onSave }) => {
  const [culture, setCulture] = useState('');
  const [region, setRegion] = useState('');
  const [quantity, setQuantity] = useState('');
  const [fertilizerType, setFertilizerType] = useState('organic');
  const [coverFertilizer, setCoverFertilizer] = useState(false);
  const [coverDays, setCoverDays] = useState(15);
  const [pestControl, setPestControl] = useState('manual');
  const [careDays, setCareDays] = useState(0);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave({
      culture,
      region,
      quantity,
      fertilizerType,
      coverFertilizer,
      coverDays: coverFertilizer ? coverDays : null,
      pestControl,
      careDays: pestControl === 'chemical' ? careDays : 0,
      startDate: new Date().toISOString(),
      status: 'active',
      harvestedAmount: null
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 overflow-y-auto">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md my-8 relative border border-sage-100 max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white z-10 px-6 py-4 border-b border-gray-100 flex items-center justify-between rounded-t-3xl shadow-sm">
          <h2 className="text-xl font-bold text-sage-800 flex items-center gap-2">
            <Sprout className="text-sage-500" /> Novo Plantio
          </h2>
          <button onClick={onClose} className="p-2 text-gray-400 hover:bg-gray-100 rounded-full transition-colors">
            <X size={20} />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Cultura & Localização */}
          <section className="space-y-4">
            <h3 className="font-semibold text-gray-700 flex items-center gap-2">
              <MapPin size={18} className="text-honey-500" /> Cultura & Localização
            </h3>
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">Cultura</label>
              <select required value={culture} onChange={(e) => setCulture(e.target.value)} className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-sage-500 focus:outline-none">
                <option value="">Selecione...</option>
                <option value="Alface">Alface</option>
                <option value="Feijão">Feijão</option>
                <option value="Milho">Milho</option>
                <option value="Tomate">Tomate</option>
                <option value="Cenoura">Cenoura</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">Região/Clima</label>
              <select required value={region} onChange={(e) => setRegion(e.target.value)} className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-sage-500 focus:outline-none">
                <option value="">Selecione...</option>
                <option value="Sul / Subtropical">Sul / Subtropical</option>
                <option value="Sudeste / Tropical de Altitude">Sudeste / Tropical de Altitude</option>
                <option value="Nordeste / Semiárido">Nordeste / Semiárido</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">Quantidade (Mudas/Sementes ou m²)</label>
              <input type="text" required value={quantity} onChange={(e) => setQuantity(e.target.value)} className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-sage-500 focus:outline-none" placeholder="Ex: 500 mudas" />
            </div>
          </section>

          {/* Nutrição & Adubação */}
          <section className="space-y-4">
            <h3 className="font-semibold text-gray-700 flex items-center gap-2">
              <Droplets size={18} className="text-honey-500" /> Nutrição & Adubação
            </h3>
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-2">Tipo de Adubo de Base</label>
              <div className="flex gap-4">
                <label className="flex items-center gap-2 text-sm cursor-pointer">
                  <input type="radio" value="organic" checked={fertilizerType === 'organic'} onChange={(e) => setFertilizerType(e.target.value)} className="accent-sage-600" /> Orgânica/Natural
                </label>
                <label className="flex items-center gap-2 text-sm cursor-pointer">
                  <input type="radio" value="chemical" checked={fertilizerType === 'chemical'} onChange={(e) => setFertilizerType(e.target.value)} className="accent-sage-600" /> Química/Mineral
                </label>
              </div>
            </div>
            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-gray-600 mb-2 cursor-pointer">
                <input type="checkbox" checked={coverFertilizer} onChange={(e) => setCoverFertilizer(e.target.checked)} className="accent-sage-600 w-4 h-4 rounded" />
                Previsão de Adubação de Cobertura
              </label>
              {coverFertilizer && (
                <div className="flex items-center gap-2 mt-2 ml-6">
                  <span className="text-sm text-gray-500">Em quantos dias?</span>
                  <input type="number" min="1" value={coverDays} onChange={(e) => setCoverDays(e.target.value)} className="w-20 p-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-sage-500 focus:outline-none" />
                </div>
              )}
            </div>
          </section>

          {/* Manejo de Ervas e Pragas */}
          <section className="space-y-4">
            <h3 className="font-semibold text-gray-700 flex items-center gap-2">
              <ShieldAlert size={18} className="text-honey-500" /> Manejo de Ervas e Pragas
            </h3>
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-2">Método de Controle</label>
              <div className="space-y-3">
                <label className="flex items-start gap-2 text-sm cursor-pointer p-3 border border-gray-100 rounded-xl hover:bg-gray-50 transition-colors">
                  <input type="radio" value="manual" checked={pestControl === 'manual'} onChange={(e) => setPestControl(e.target.value)} className="accent-sage-600 mt-1" />
                  <div>
                    <span className="font-medium">Capina Manual / Carpir</span>
                    <p className="text-xs text-gray-500 mt-1">Gera selo orgânico; agenda capina aos 15 e 30 dias.</p>
                  </div>
                </label>
                <label className="flex items-start gap-2 text-sm cursor-pointer p-3 border border-gray-100 rounded-xl hover:bg-gray-50 transition-colors">
                  <input type="radio" value="chemical" checked={pestControl === 'chemical'} onChange={(e) => setPestControl(e.target.value)} className="accent-sage-600 mt-1" />
                  <div>
                    <span className="font-medium">Defensivo / Veneno Convencional</span>
                    <p className="text-xs text-gray-500 mt-1">Exige período de carência para colheita.</p>
                  </div>
                </label>
              </div>
            </div>
            {pestControl === 'chemical' && (
              <div className="ml-6 p-4 bg-red-50 rounded-xl border border-red-100">
                <label className="block text-sm font-bold text-red-700 mb-1">Período de Carência (dias)</label>
                <p className="text-xs text-red-600 mb-2">Tempo necessário antes da colheita segura.</p>
                <input type="number" required min="1" value={careDays} onChange={(e) => setCareDays(e.target.value)} className="w-full p-3 border border-red-200 rounded-xl focus:ring-2 focus:ring-red-500 focus:outline-none" placeholder="Ex: 14 dias" />
              </div>
            )}
          </section>

          <button type="submit" className="w-full bg-sage-600 hover:bg-sage-700 text-white font-bold py-4 rounded-2xl shadow-lg transition-transform hover:scale-[1.02] flex items-center justify-center gap-2 mt-4">
            <Sprout size={20} />
            Iniciar Plantio
          </button>
        </form>
      </div>
    </div>
  );
};
export default NewCycleModal;
