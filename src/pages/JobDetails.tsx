
import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useApp } from '../store/AppContext';
import { UrgencyLevel, UserRole } from '../types';
import { ArrowLeft, Calendar, User, FileText, Activity, AlertCircle, CheckCircle2, MapPin, Clock, Edit, Save, ArrowRight, Box, Star, X, ScanBarcode, BellRing, Send } from 'lucide-react';
import { StatusBadge } from '../components/StatusBadge';

const JobDetails = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { getJobById, updateJob, finishJob, currentUser, dentists, jobTypes, boxColors, triggerManualScan, createAlert, users, sectors } = useApp();
  
  const job = getJobById(id || '');
  
  // Edit State
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    patientName: '',
    dentistName: '',
    prosthesisType: '',
    description: '',
    deliveryDate: '',
    urgency: UrgencyLevel.MEDIUM,
    boxNumber: '',
    boxColor: '',
    isPromised: false
  });

  // Alert Modal State
  const [isAlertModalOpen, setIsAlertModalOpen] = useState(false);
  const [alertForm, setAlertForm] = useState({
      title: 'URGÊNCIA DE PRODUÇÃO',
      message: '',
      targetDate: new Date().toISOString().slice(0, 16), // datetime-local format
      targetSectorId: '',
      targetUserId: ''
  });

  const isManagement = currentUser?.role === UserRole.ADMIN || currentUser?.role === UserRole.MANAGER;

  if (!job) {
      return (
          <div className="text-center p-10">
              <h2 className="text-xl font-bold text-slate-700">Trabalho não encontrado</h2>
              <button onClick={() => navigate('/jobs')} className="mt-4 text-blue-600 hover:underline">Voltar para lista</button>
          </div>
      );
  }

  const sortedHistory = [...job.history].sort((a, b) => 
      new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  );

  const handleEditToggle = () => {
      if (!isEditing) {
          setEditForm({
              patientName: job.patientName,
              dentistName: job.dentistName,
              prosthesisType: job.prosthesisType,
              description: job.description,
              deliveryDate: new Date(job.deliveryDate).toISOString().split('T')[0],
              urgency: job.urgency,
              boxNumber: job.boxNumber || '',
              boxColor: job.boxColor || '#cccccc',
              isPromised: job.isPromised || false
          });
      }
      setIsEditing(!isEditing);
  };

  const handleSave = async () => {
      await updateJob(job.id, {
          patientName: editForm.patientName,
          dentistName: editForm.dentistName,
          prosthesisType: editForm.prosthesisType,
          description: editForm.description,
          deliveryDate: new Date(editForm.deliveryDate).toISOString(),
          urgency: editForm.urgency,
          boxNumber: editForm.boxNumber,
          boxColor: editForm.boxColor,
          isPromised: editForm.isPromised
      });
      setIsEditing(false);
  };

  const handleCreateAlert = async (e: React.FormEvent) => {
      e.preventDefault();
      await createAlert({
          title: alertForm.title,
          message: alertForm.message,
          targetDate: new Date(alertForm.targetDate).toISOString(),
          jobId: job.code,
          targetSectorId: alertForm.targetSectorId || undefined,
          targetUserId: alertForm.targetUserId || undefined
      });
      setIsAlertModalOpen(false);
      alert("Alarme agendado com sucesso!");
  };

  return (
    <div className="max-w-5xl mx-auto pb-12 relative">
      
      {/* Alert Creation Modal */}
      {isAlertModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
              <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95">
                  <div className="bg-red-600 p-4 flex justify-between items-center text-white">
                      <h3 className="font-bold flex items-center gap-2">
                          <BellRing size={20} /> Criar Alerta de Urgência
                      </h3>
                      <button onClick={() => setIsAlertModalOpen(false)} className="hover:bg-red-700 p-1 rounded-full"><X size={20}/></button>
                  </div>
                  <form onSubmit={handleCreateAlert} className="p-6 space-y-4">
                      <div>
                          <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Título do Alerta</label>
                          <input 
                              type="text" 
                              value={alertForm.title}
                              onChange={e => setAlertForm({...alertForm, title: e.target.value})}
                              className="w-full px-3 py-2 border border-slate-300 rounded-lg font-bold text-red-700"
                              required
                          />
                      </div>
                      <div>
                          <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Mensagem</label>
                          <textarea 
                              value={alertForm.message}
                              onChange={e => setAlertForm({...alertForm, message: e.target.value})}
                              placeholder="Ex: Prioridade máxima, cliente aguardando na recepção!"
                              className="w-full px-3 py-2 border border-slate-300 rounded-lg h-24 resize-none"
                              required
                          />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                          <div>
                              <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Data/Hora Disparo</label>
                              <input 
                                  type="datetime-local"
                                  value={alertForm.targetDate}
                                  onChange={e => setAlertForm({...alertForm, targetDate: e.target.value})}
                                  className="w-full px-2 py-2 border border-slate-300 rounded-lg text-xs"
                                  required
                              />
                          </div>
                          <div>
                              <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Setor Alvo (Opcional)</label>
                              <select 
                                  value={alertForm.targetSectorId}
                                  onChange={e => setAlertForm({...alertForm, targetSectorId: e.target.value, targetUserId: ''})}
                                  className="w-full px-2 py-2 border border-slate-300 rounded-lg text-xs"
                              >
                                  <option value="">Todos os Setores</option>
                                  {sectors.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                              </select>
                          </div>
                      </div>
                      <div>
                          <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Colaborador Específico (Opcional)</label>
                          <select 
                              value={alertForm.targetUserId}
                              onChange={e => setAlertForm({...alertForm, targetUserId: e.target.value, targetSectorId: ''})}
                              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
                          >
                              <option value="">Qualquer um do setor</option>
                              {users.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
                          </select>
                      </div>
                      <button type="submit" className="w-full py-3 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl shadow-lg flex items-center justify-center gap-2">
                          <Send size={18} /> Agendar Alerta
                      </button>
                  </form>
              </div>
          </div>
      )}

      <div className="flex items-center gap-4 mb-6">
        <button onClick={() => navigate(-1)} className="p-2 hover:bg-slate-100 rounded-full transition-colors text-slate-500">
            <ArrowLeft size={20} />
        </button>
        <h2 className="text-lg md:text-2xl font-bold text-slate-900 truncate">Detalhes do Caso #{job.code}</h2>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column: Main Info */}
        <div className="lg:col-span-2 space-y-6">
            
            {/* Card Principal */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 relative">
                {/* Actions Header */}
                <div className="absolute top-6 right-6 flex gap-2">
                    {isManagement && !isEditing && !job.isFinished && (
                        <button 
                            onClick={() => setIsAlertModalOpen(true)}
                            className="flex items-center gap-1 px-3 py-1.5 bg-red-50 text-red-600 rounded-lg text-xs font-bold hover:bg-red-100 transition-colors border border-red-100"
                            title="Criar Alerta de Urgência"
                        >
                            <BellRing size={14} /> <span className="hidden sm:inline">Alerta</span>
                        </button>
                    )}
                    
                    {isEditing ? (
                        <>
                            <button onClick={handleSave} className="flex items-center gap-1 px-3 py-1.5 bg-green-600 text-white rounded-lg text-xs font-bold hover:bg-green-700 transition-colors shadow-md">
                                <Save size={14} /> <span className="hidden sm:inline">Salvar</span>
                            </button>
                            <button onClick={() => setIsEditing(false)} className="flex items-center gap-1 px-3 py-1.5 bg-slate-100 text-slate-500 rounded-lg text-xs font-bold hover:bg-slate-200 transition-colors">
                                <X size={14} /> <span className="hidden sm:inline">Cancelar</span>
                            </button>
                        </>
                    ) : (
                        <button onClick={handleEditToggle} className="flex items-center gap-1 px-3 py-1.5 bg-blue-50 text-blue-600 rounded-lg text-xs font-bold hover:bg-blue-100 transition-colors">
                            <Edit size={14} /> <span className="hidden sm:inline">Editar Caso</span>
                        </button>
                    )}
                </div>

                {isEditing ? (
                    <div className="space-y-4 mt-2">
                         <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Nome do Paciente</label>
                            <input 
                                type="text" 
                                value={editForm.patientName} 
                                onChange={e => setEditForm({...editForm, patientName: e.target.value})}
                                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                            />
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Dentista</label>
                                <select 
                                    value={editForm.dentistName}
                                    onChange={e => setEditForm({...editForm, dentistName: e.target.value})}
                                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm bg-white"
                                >
                                    <option value="">Selecione...</option>
                                    {dentists.map(d => <option key={d.id} value={d.name}>{d.name}</option>)}
                                </select>
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Tipo de Trabalho</label>
                                <select 
                                    value={editForm.prosthesisType}
                                    onChange={e => setEditForm({...editForm, prosthesisType: e.target.value})}
                                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm bg-white"
                                >
                                     <option value="">Selecione...</option>
                                     {jobTypes.map(t => <option key={t.id} value={t.name}>{t.name}</option>)}
                                </select>
                            </div>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Urgência</label>
                                <select 
                                    value={editForm.urgency}
                                    onChange={e => setEditForm({...editForm, urgency: e.target.value as UrgencyLevel})}
                                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm bg-white"
                                >
                                    {Object.values(UrgencyLevel).map(u => <option key={u} value={u}>{u}</option>)}
                                </select>
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Data de Entrega (Prometimento)</label>
                                <input 
                                    type="date"
                                    value={editForm.deliveryDate}
                                    onChange={e => setEditForm({...editForm, deliveryDate: e.target.value})}
                                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
                                />
                            </div>
                        </div>
                        
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 bg-slate-50 rounded-xl border border-slate-100">
                             <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Nº Caixa</label>
                                <input 
                                    type="text"
                                    value={editForm.boxNumber}
                                    onChange={e => setEditForm({...editForm, boxNumber: e.target.value})}
                                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
                                />
                             </div>
                             <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Cor da Caixa</label>
                                <div className="flex flex-wrap gap-2">
                                    {boxColors.map(c => (
                                        <button
                                            key={c.id}
                                            type="button"
                                            onClick={() => setEditForm({...editForm, boxColor: c.hex})}
                                            className={`w-6 h-6 rounded-full border-2 transition-all ${editForm.boxColor === c.hex ? 'ring-2 ring-slate-400 scale-110' : 'border-transparent opacity-50 hover:opacity-100'}`}
                                            style={{ backgroundColor: c.hex, borderColor: editForm.boxColor === c.hex ? '#fff' : 'transparent' }}
                                        />
                                    ))}
                                </div>
                             </div>
                        </div>

                        <div className="flex items-center gap-2">
                             <input 
                                type="checkbox"
                                id="promisedCheck"
                                checked={editForm.isPromised}
                                onChange={e => setEditForm({...editForm, isPromised: e.target.checked})}
                                className="w-4 h-4"
                             />
                             <label htmlFor="promisedCheck" className="text-sm font-bold text-slate-700 flex items-center gap-1">
                                <Star size={14} className="text-yellow-500 fill-yellow-500" />
                                Marcar como Prometido / VIP
                             </label>
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Descrição</label>
                            <textarea 
                                value={editForm.description}
                                onChange={e => setEditForm({...editForm, description: e.target.value})}
                                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm h-24 resize-none"
                            />
                        </div>
                    </div>
                ) : (
                    <>
                        <div className="flex flex-col sm:flex-row justify-between items-start mb-6 gap-4">
                            <div className="pr-20 sm:pr-0">
                                <h3 className="text-xl font-bold text-slate-900">{job.patientName}</h3>
                                <div className="flex items-center gap-2 text-slate-500 mt-1">
                                    <User size={14} />
                                    <span className="text-sm font-medium">{job.dentistName || 'Sem dentista vinculado'}</span>
                                </div>
                            </div>
                            <div className="flex flex-wrap sm:flex-col items-start sm:items-end gap-2">
                                <StatusBadge status={job.status} />
                                <StatusBadge urgency={job.urgency} />
                                {job.boxNumber && (
                                    <div 
                                        className="px-2 py-1 rounded-lg border flex items-center gap-1.5 text-xs font-bold mt-2 shadow-sm"
                                        style={{ 
                                            backgroundColor: job.boxColor || '#f1f5f9', 
                                            borderColor: 'rgba(0,0,0,0.1)', 
                                            color: '#FFFFFF',
                                            textShadow: '0px 1px 2px rgba(0,0,0,0.3)'
                                        }}
                                    >
                                        <Box size={12} /> Caixa {job.boxNumber}
                                    </div>
                                )}
                                {job.isPromised && (
                                    <div className="flex items-center gap-1 text-xs font-bold text-yellow-600 bg-yellow-50 px-2 py-0.5 rounded-full border border-yellow-100">
                                        <Star size={10} fill="currentColor" /> VIP
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-6">
                            <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2 mb-2">
                                    <FileText size={14} /> Tipo de Prótese
                                </span>
                                <p className="font-bold text-slate-800">{job.prosthesisType}</p>
                            </div>
                            <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2 mb-2">
                                    <Calendar size={14} /> Entrega Prevista
                                </span>
                                <p className={`font-bold ${new Date(job.deliveryDate) < new Date() ? 'text-red-600' : 'text-slate-800'}`}>
                                    {new Date(job.deliveryDate).toLocaleDateString()}
                                </p>
                            </div>
                        </div>

                        <div className="mb-4">
                            <h4 className="text-sm font-bold text-slate-700 mb-2">Descrição / Observações</h4>
                            <p className="text-slate-600 bg-slate-50 p-4 rounded-xl text-sm leading-relaxed border border-slate-100">
                                {job.description}
                            </p>
                        </div>
                    </>
                )}

                {!job.isFinished && !isEditing && (
                    <div className="border-t border-slate-100 pt-6 mt-6 flex flex-col sm:flex-row justify-end gap-3">
                        <button 
                            onClick={() => triggerManualScan(job.code)}
                            className="w-full sm:w-auto flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-bold transition-colors shadow-lg shadow-blue-900/20"
                        >
                            <ScanBarcode size={20} />
                            Movimentar (Scanner Manual)
                        </button>
                        <button 
                            onClick={() => finishJob(job.id)}
                            className="w-full sm:w-auto flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-xl font-bold transition-colors shadow-lg shadow-green-900/20"
                        >
                            <CheckCircle2 size={20} />
                            Finalizar Trabalho
                        </button>
                    </div>
                )}
            </div>
        </div>

        {/* Right Column: Timeline */}
        <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 h-full">
                <h3 className="text-lg font-bold text-slate-800 mb-6 flex items-center gap-2">
                    <Activity className="text-blue-500" />
                    Linha do Tempo
                </h3>

                <div className="relative space-y-8 before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-slate-200 before:to-transparent">
                    {sortedHistory.map((event, index) => {
                        const isFinish = event.action === 'FINISHED';
                        const isEdit = event.action === 'EDIT';
                        const isCreated = event.action === 'CREATED';
                        const isEntry = event.action === 'ENTRY';
                        
                        return (
                            <div key={event.id} className="relative flex items-start group">
                                <div className={`absolute left-0 h-10 w-10 flex items-center justify-center rounded-full border-4 border-white shadow-sm z-10 ${
                                    isFinish ? 'bg-green-500 text-white' :
                                    isEdit ? 'bg-amber-500 text-white' :
                                    isCreated ? 'bg-blue-500 text-white' :
                                    isEntry ? 'bg-purple-500 text-white' : 'bg-slate-400 text-white'
                                }`}>
                                    {isFinish ? <CheckCircle2 size={16} /> :
                                     isEdit ? <Edit size={16} /> :
                                     isCreated ? <FileText size={16} /> :
                                     isEntry ? <ArrowRight size={16} /> : <ArrowLeft size={16} />
                                    }
                                </div>
                                <div className="ml-16 w-full">
                                    <div className="flex flex-col">
                                        <span className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-0.5">
                                            {new Date(event.timestamp).toLocaleString()}
                                        </span>
                                        <h4 className="font-bold text-slate-800 text-sm">
                                            {isFinish ? 'Trabalho Finalizado' :
                                             isEdit ? 'Edição de Dados' :
                                             isCreated ? 'Trabalho Criado' :
                                             event.action === 'ENTRY' ? 'Entrada no Setor' : 'Saída do Setor'}
                                        </h4>
                                        <div className="text-xs font-medium text-blue-600 mt-0.5 mb-2">
                                            {event.sectorName} • {event.userName}
                                        </div>
                                        
                                        {event.changes && event.changes.length > 0 && (
                                            <div className="bg-amber-50 p-2 rounded border border-amber-100 text-xs text-amber-800 space-y-1">
                                                {event.changes.map((change, i) => (
                                                    <div key={i}>• {change}</div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>

      </div>
    </div>
  );
};

export default JobDetails;
