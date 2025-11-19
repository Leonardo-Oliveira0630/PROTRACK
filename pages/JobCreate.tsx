
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../store/AppContext';
import { Job, JobStatus, UrgencyLevel } from '../types';
import { Save, ArrowLeft, User, FileText, Calendar, Star, Stethoscope } from 'lucide-react';

const JobCreate = () => {
  const navigate = useNavigate();
  const { addJob, sectors, currentUser } = useApp();
  
  const [formData, setFormData] = useState({
    code: '',
    patientName: '',
    dentistName: '',
    prosthesisType: '',
    description: '',
    deliveryDate: '',
    urgency: UrgencyLevel.MEDIUM,
    startSectorId: sectors[0]?.id || '',
    isPromised: false
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const newJob: Job = {
        id: Date.now().toString(),
        code: formData.code,
        patientName: formData.patientName,
        dentistName: formData.dentistName,
        prosthesisType: formData.prosthesisType,
        description: formData.description,
        createdAt: new Date().toISOString(),
        deliveryDate: new Date(formData.deliveryDate).toISOString(),
        urgency: formData.urgency,
        currentSectorId: formData.startSectorId,
        status: JobStatus.PENDING,
        isFinished: false,
        isPromised: formData.isPromised,
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
    <div className="max-w-4xl mx-auto">
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
        <div className="lg:col-span-2 space-y-8">
            {/* Section 1: Patient/Client Info */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
                <div className="flex items-center gap-2 mb-6 pb-4 border-b border-slate-100">
                    <User className="text-blue-500" size={20} />
                    <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">Dados do Caso</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="md:col-span-2">
                        <label className="block text-sm font-bold text-slate-700 mb-2">Nome do Paciente</label>
                        <input 
                            required
                            type="text" 
                            value={formData.patientName}
                            onChange={e => setFormData({...formData, patientName: e.target.value})}
                            className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-4 focus:ring-blue-50 focus:border-blue-500 outline-none transition-all"
                            placeholder="Nome completo do paciente"
                        />
                    </div>
                    <div className="md:col-span-1">
                        <label className="block text-sm font-bold text-slate-700 mb-2">Dentista / Clínica</label>
                        <div className="relative">
                            <Stethoscope className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                            <input 
                                required
                                type="text" 
                                value={formData.dentistName}
                                onChange={e => setFormData({...formData, dentistName: e.target.value})}
                                className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 focus:ring-4 focus:ring-blue-50 focus:border-blue-500 outline-none transition-all"
                                placeholder="Dr(a). Solicitante"
                            />
                        </div>
                    </div>
                    <div className="md:col-span-1">
                        <label className="block text-sm font-bold text-slate-700 mb-2">Código OS / Pan</label>
                        <input 
                            required
                            type="text" 
                            value={formData.code}
                            onChange={e => setFormData({...formData, code: e.target.value})}
                            className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-4 focus:ring-blue-50 focus:border-blue-500 outline-none transition-all font-mono font-medium"
                            placeholder="Ex: 8050"
                        />
                    </div>
                </div>
            </div>

            {/* Section 2: Job Details */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
                <div className="flex items-center gap-2 mb-6 pb-4 border-b border-slate-100">
                    <FileText className="text-purple-500" size={20} />
                    <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">Especificações Técnicas</h3>
                </div>
                <div className="grid grid-cols-1 gap-6">
                    <div>
                        <label className="block text-sm font-bold text-slate-700 mb-2">Tipo de Prótese</label>
                        <input 
                            required
                            type="text" 
                            value={formData.prosthesisType}
                            onChange={e => setFormData({...formData, prosthesisType: e.target.value})}
                            className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-4 focus:ring-purple-50 focus:border-purple-500 outline-none transition-all"
                            placeholder="Ex: Coroa Zircônia, Lente E-max, Protocolo..."
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-bold text-slate-700 mb-2">Observações / Cor / Dentes</label>
                        <textarea 
                            required
                            rows={4}
                            value={formData.description}
                            onChange={e => setFormData({...formData, description: e.target.value})}
                            className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-4 focus:ring-purple-50 focus:border-purple-500 outline-none transition-all resize-none"
                            placeholder="Descreva detalhes técnicos: Escala de cor (A1, BL3), tipo de implante, antagonista..."
                        />
                    </div>
                </div>
            </div>
        </div>

        {/* Sidebar Options */}
        <div className="space-y-6">
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
                <div className="flex items-center gap-2 mb-6 pb-4 border-b border-slate-100">
                    <Calendar className="text-green-500" size={20} />
                    <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">Planejamento</h3>
                </div>
                
                <div className="space-y-5">
                    <div>
                        <label className="block text-sm font-bold text-slate-700 mb-2">Data de Entrega</label>
                        <input 
                            required
                            type="date" 
                            value={formData.deliveryDate}
                            onChange={e => setFormData({...formData, deliveryDate: e.target.value})}
                            className="w-full px-4 py-2.5 rounded-lg border border-slate-200 focus:border-green-500 outline-none transition-all"
                        />
                    </div>
                    
                    <div>
                        <label className="block text-sm font-bold text-slate-700 mb-2">Nível de Urgência</label>
                        <select 
                            value={formData.urgency}
                            onChange={e => setFormData({...formData, urgency: e.target.value as UrgencyLevel})}
                            className="w-full px-4 py-2.5 rounded-lg border border-slate-200 focus:border-green-500 outline-none bg-white"
                        >
                            {Object.values(UrgencyLevel).map(l => <option key={l} value={l}>{l}</option>)}
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-bold text-slate-700 mb-2">Setor Inicial</label>
                        <select 
                            value={formData.startSectorId}
                            onChange={e => setFormData({...formData, startSectorId: e.target.value})}
                            className="w-full px-4 py-2.5 rounded-lg border border-slate-200 focus:border-green-500 outline-none bg-white"
                        >
                            {sectors.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                        </select>
                    </div>

                    <div className="pt-4 border-t border-slate-100">
                        <label className="flex items-center gap-3 cursor-pointer group">
                            <div className="relative flex items-center">
                                <input 
                                    type="checkbox" 
                                    checked={formData.isPromised}
                                    onChange={e => setFormData({...formData, isPromised: e.target.checked})}
                                    className="peer h-5 w-5 cursor-pointer appearance-none rounded-md border-2 border-slate-300 transition-all checked:border-yellow-500 checked:bg-yellow-500"
                                />
                                <Star className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-white opacity-0 peer-checked:opacity-100" size={12} strokeWidth={3} />
                            </div>
                            <span className="text-sm font-bold text-slate-700 group-hover:text-yellow-600 transition-colors">
                                Trabalho Prometido (VIP)
                            </span>
                        </label>
                        <p className="text-xs text-slate-400 mt-1 pl-8">
                            Marca o caso para acompanhamento prioritário pelo gestor.
                        </p>
                    </div>
                </div>

                <button 
                    type="submit"
                    className="w-full mt-8 flex items-center justify-center gap-2 px-6 py-4 bg-slate-900 text-white rounded-xl hover:bg-blue-600 font-bold transition-all shadow-xl shadow-slate-900/20"
                >
                    <Save size={20} />
                    Criar Ordem de Serviço
                </button>
            </div>
        </div>

      </form>
    </div>
  );
};

export default JobCreate;
