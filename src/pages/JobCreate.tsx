import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useApp } from '../store/AppContext';
import { Job, JobStatus, UrgencyLevel, JobItem } from '../types';
import { Save, ArrowLeft, User, FileText, Calendar, Star, Stethoscope, Box, Plus, Trash2, ShoppingCart } from 'lucide-react';

const JobCreate = () => {
  const navigate = useNavigate();
  const { addJob, sectors, currentUser, dentists, jobTypes, boxColors } = useApp();
  
  const [formData, setFormData] = useState({
    code: '',
    patientName: '',
    dentistName: '',
    description: '',
    deliveryDate: '',
    urgency: UrgencyLevel.MEDIUM,
    startSectorId: '',
    isPromised: false,
    boxNumber: '',
    boxColor: boxColors[0]?.hex || '#cccccc'
  });

  // Estado para os itens
  const [items, setItems] = useState<JobItem[]>([]);
  const [currentItemType, setCurrentItemType] = useState('');
  const [currentQuantity, setCurrentQuantity] = useState(1);

  useEffect(() => {
    if (sectors.length > 0 && !formData.startSectorId) {
        setFormData(prev => ({ ...prev, startSectorId: sectors[0].id }));
    }
  }, [sectors]);

  const handleAddItem = () => {
      if (!currentItemType) return;
      setItems([...items, { type: currentItemType, quantity: currentQuantity }]);
      setCurrentItemType('');
      setCurrentQuantity(1);
  };

  const handleRemoveItem = (index: number) => {
      const newItems = [...items];
      newItems.splice(index, 1);
      setItems(newItems);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Create summary string
    const typeSummary = items.length > 0 
        ? items.map(i => `${i.quantity}x ${i.type}`).join(', ')
        : 'Trabalho não especificado';

    const newJob: Job = {
        id: Date.now().toString(),
        code: formData.code,
        patientName: formData.patientName || 'Paciente não informado',
        dentistName: formData.dentistName || 'Dentista não informado',
        prosthesisType: typeSummary, // Resumo visual
        items: items, // Lista real
        description: formData.description || 'Sem observações.',
        createdAt: new Date().toISOString(),
        deliveryDate: new Date(formData.deliveryDate).toISOString(),
        urgency: formData.urgency,
        currentSectorId: formData.startSectorId,
        status: JobStatus.PENDING,
        isFinished: false,
        isPromised: formData.isPromised,
        boxNumber: formData.boxNumber,
        boxColor: formData.boxColor,
        history: [
            {
                id: Date.now().toString(),
                timestamp: new Date().toISOString(),
                action: 'CREATED',
                sectorName: 'Cadastro',
                userId: currentUser?.id || 'system',
                userName: currentUser?.name || 'System'
            }
        ]
    };

    addJob(newJob);
    navigate('/jobs');
  };

  return (
    <div className="max-w-4xl mx-auto pb-12">
      <div className="flex items-center gap-4 mb-8">
        <button onClick={() => navigate(-1)} className="p-2 hover:bg-slate-100 rounded-full transition-colors text-slate-500">
            <ArrowLeft size={20} />
        </button>
        <div>
            <h2 className="text-2xl font-bold text-slate-900">Entrada de Novo Caso</h2>
            <p className="text-slate-500 text-sm">Registre os detalhes da ordem de serviço</p>
        </div>
      </div>
      
      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Main Form Area */}
        <div className="lg:col-span-2 space-y-8 order-2 lg:order-1">
            {/* Section 1: Patient Info (MANTIDO IGUAL) */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
                <div className="flex items-center gap-2 mb-6 pb-4 border-b border-slate-100">
                    <User className="text-blue-500" size={20} />
                    <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">Dados do Caso</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="md:col-span-2">
                        <label className="block text-sm font-bold text-slate-700 mb-2">Nome do Paciente</label>
                        <input type="text" value={formData.patientName} onChange={e => setFormData({...formData, patientName: e.target.value})} className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-4 focus:ring-blue-50 outline-none transition-all" placeholder="Nome completo" />
                    </div>
                    <div className="md:col-span-1">
                        <label className="flex justify-between text-sm font-bold text-slate-700 mb-2">
                            Dentista / Clínica
                            {dentists.length === 0 && <Link to="/dentists" className="text-blue-600 text-xs font-normal flex items-center"><Plus size={12}/> Cadastrar</Link>}
                        </label>
                        <div className="relative">
                            <Stethoscope className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                            {dentists.length > 0 ? (
                                <select value={formData.dentistName} onChange={e => setFormData({...formData, dentistName: e.target.value})} className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 bg-white">
                                    <option value="">Selecione...</option>
                                    {dentists.map(d => <option key={d.id} value={d.name}>{d.name}</option>)}
                                </select>
                            ) : (
                                <input type="text" value={formData.dentistName} onChange={e => setFormData({...formData, dentistName: e.target.value})} className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200" placeholder="Nome do Dentista" />
                            )}
                        </div>
                    </div>
                    <div className="md:col-span-1">
                        <label className="block text-sm font-bold text-slate-700 mb-2">Código OS / Pan *</label>
                        <input required type="text" value={formData.code} onChange={e => setFormData({...formData, code: e.target.value})} className="w-full px-4 py-3 rounded-xl border border-slate-200 font-mono font-medium" placeholder="Ex: 8050" />
                    </div>
                </div>
            </div>

            {/* Section 2: Job Items (ALTERADO PARA MULTIPLOS) */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
                <div className="flex items-center gap-2 mb-6 pb-4 border-b border-slate-100">
                    <ShoppingCart className="text-purple-500" size={20} />
                    <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">Itens do Trabalho</h3>
                </div>
                
                {/* Add Item Form */}
                <div className="flex flex-col md:flex-row gap-4 mb-6 items-end bg-slate-50 p-4 rounded-xl border border-slate-100">
                    <div className="flex-1 w-full">
                         <label className="flex justify-between text-xs font-bold text-slate-500 uppercase mb-1">
                            Tipo de Serviço
                            {jobTypes.length === 0 && <Link to="/job-types" className="text-purple-600 text-[10px] font-normal flex items-center"><Plus size={10}/> Cadastrar</Link>}
                        </label>
                        {jobTypes.length > 0 ? (
                            <select 
                                value={currentItemType}
                                onChange={e => setCurrentItemType(e.target.value)}
                                className="w-full px-3 py-2 rounded-lg border border-slate-200 outline-none bg-white text-sm"
                            >
                                <option value="">Selecione...</option>
                                {jobTypes.map(t => <option key={t.id} value={t.name}>{t.name}</option>)}
                            </select>
                        ) : (
                            <input 
                                type="text"
                                value={currentItemType}
                                onChange={e => setCurrentItemType(e.target.value)}
                                className="w-full px-3 py-2 rounded-lg border border-slate-200 outline-none text-sm"
                                placeholder="Ex: Coroa"
                            />
                        )}
                    </div>
                    <div className="w-20">
                        <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Qtd.</label>
                        <input 
                            type="number" 
                            min="1" 
                            value={currentQuantity} 
                            onChange={e => setCurrentQuantity(parseInt(e.target.value))}
                            className="w-full px-3 py-2 rounded-lg border border-slate-200 outline-none text-center text-sm"
                        />
                    </div>
                    <button 
                        type="button"
                        onClick={handleAddItem}
                        className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-bold text-sm flex items-center gap-1 h-[38px]"
                    >
                        <Plus size={16} /> Add
                    </button>
                </div>

                {/* Items List */}
                {items.length > 0 ? (
                    <div className="space-y-2 mb-6">
                        {items.map((item, index) => (
                            <div key={index} className="flex items-center justify-between p-3 bg-white border border-slate-200 rounded-lg shadow-sm">
                                <div className="flex items-center gap-3">
                                    <span className="bg-purple-100 text-purple-700 text-xs font-bold px-2 py-1 rounded-md">{item.quantity}x</span>
                                    <span className="font-medium text-slate-800">{item.type}</span>
                                </div>
                                <button type="button" onClick={() => handleRemoveItem(index)} className="text-red-400 hover:text-red-600 p-1"><Trash2 size={16} /></button>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-4 text-slate-400 text-sm mb-6">Nenhum item adicionado ainda.</div>
                )}

                <div className="border-t border-slate-100 pt-4">
                    <label className="block text-sm font-bold text-slate-700 mb-2">Observações Gerais</label>
                    <textarea 
                        rows={3}
                        value={formData.description}
                        onChange={e => setFormData({...formData, description: e.target.value})}
                        className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-4 focus:ring-purple-50 focus:border-purple-500 outline-none transition-all resize-none"
                        placeholder="Detalhes técnicos, cor, etc."
                    />
                </div>
            </div>

            {/* Section 3: Box Info (MANTIDO) */}
             <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
                <div className="flex items-center gap-2 mb-6 pb-4 border-b border-slate-100">
                    <Box className="text-amber-500" size={20} />
                    <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">Identificação Física (Caixa)</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="block text-sm font-bold text-slate-700 mb-2">Número da Caixa</label>
                        <input 
                            type="text"
                            value={formData.boxNumber}
                            onChange={e => setFormData({...formData, boxNumber: e.target.value})}
                            className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-4 focus:ring-amber-50 focus:border-amber-500 outline-none transition-all text-center font-mono font-bold text-lg"
                            placeholder="#"
                        />
                    </div>
                    <div>
                        <label className="flex justify-between text-sm font-bold text-slate-700 mb-2">
                            Cor da Caixa
                            {boxColors.length === 0 && <Link to="/box-colors" className="text-amber-600 text-xs font-normal flex items-center"><Plus size={12}/> Cadastrar</Link>}
                        </label>
                        <div className="flex flex-wrap gap-2">
                            {boxColors.length > 0 ? boxColors.map(c => (
                                <button
                                    key={c.id}
                                    type="button"
                                    onClick={() => setFormData({...formData, boxColor: c.hex})}
                                    className={`w-10 h-10 rounded-full border-2 transition-all ${formData.boxColor === c.hex ? 'ring-2 ring-offset-2 ring-slate-400 scale-110' : 'border-transparent opacity-70 hover:opacity-100'}`}
                                    style={{ backgroundColor: c.hex, borderColor: formData.boxColor === c.hex ? '#fff' : 'transparent' }}
                                    title={c.name}
                                ></button>
                            )) : (
                                <p className="text-xs text-slate-400">Cadastre cores para selecionar.</p>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>

        {/* Sidebar Options (MANTIDO) */}
        <div className="space-y-6 order-1 lg:order-2">
             <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
                {/* ... Campos de Data, Urgência, Setor e Checkbox Prometido ... */}
                {/* Copie do código anterior ou mantenha igual, apenas o botão final muda */}
                
                {/* ... */}
                
                 <div className="space-y-5">
                    <div>
                        <label className="block text-sm font-bold text-slate-700 mb-2">Data de Entrega *</label>
                        <input required type="date" value={formData.deliveryDate} onChange={e => setFormData({...formData, deliveryDate: e.target.value})} className="w-full px-4 py-2.5 rounded-lg border border-slate-200 focus:border-green-500 outline-none transition-all" />
                    </div>
                    <div>
                        <label className="block text-sm font-bold text-slate-700 mb-2">Nível de Urgência *</label>
                        <select value={formData.urgency} onChange={e => setFormData({...formData, urgency: e.target.value as UrgencyLevel})} className="w-full px-4 py-2.5 rounded-lg border border-slate-200 focus:border-green-500 outline-none bg-white">
                            {Object.values(UrgencyLevel).map(l => <option key={l} value={l}>{l}</option>)}
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-bold text-slate-700 mb-2">Setor Inicial *</label>
                        <select value={formData.startSectorId} onChange={e => setFormData({...formData, startSectorId: e.target.value})} className="w-full px-4 py-2.5 rounded-lg border border-slate-200 focus:border-green-500 outline-none bg-white" required>
                            <option value="">Selecione...</option>
                            {sectors.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                        </select>
                    </div>
                     <div className="pt-4 border-t border-slate-100">
                        <label className="flex items-center gap-3 cursor-pointer group">
                            <div className="relative flex items-center">
                                <input type="checkbox" checked={formData.isPromised} onChange={e => setFormData({...formData, isPromised: e.target.checked})} className="peer h-5 w-5 cursor-pointer appearance-none rounded-md border-2 border-slate-300 transition-all checked:border-yellow-500 checked:bg-yellow-500" />
                                <Star className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-white opacity-0 peer-checked:opacity-100" size={12} strokeWidth={3} />
                            </div>
                            <span className="text-sm font-bold text-slate-700 group-hover:text-yellow-600 transition-colors">Trabalho Prometido (VIP)</span>
                        </label>
                    </div>
                </div>

                <button type="submit" className="w-full mt-8 flex items-center justify-center gap-2 px-6 py-4 bg-slate-900 text-white rounded-xl hover:bg-blue-600 font-bold transition-all shadow-xl shadow-slate-900/20">
                    <Save size={20} /> Criar Ordem de Serviço
                </button>
            </div>
        </div>

      </form>
    </div>
  );
};

export default JobCreate;