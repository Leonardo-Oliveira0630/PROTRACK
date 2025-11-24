import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useApp } from '../store/AppContext';
import { Alert, UrgencyLevel, UserRole, JobItem } from '../types';
import { ArrowLeft, Calendar, User, FileText, Activity, CheckCircle2, Edit, Save, ArrowRight, Box, Star, X, ScanBarcode, BellRing, Send, Plus, Trash2, ShoppingCart, RefreshCw } from 'lucide-react';
import { StatusBadge } from '../components/StatusBadge';

const JobDetails = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { getJobById, updateJob, finishJob, reopenJob, currentUser, dentists, jobTypes, boxColors, createAlert, users, sectors } = useApp();
  
  const job = getJobById(id || '');
  
  const [isEditing, setIsEditing] = useState(false);
  
  // Estado do formulário de edição
  const [editForm, setEditForm] = useState({
    patientName: '',
    dentistName: '',
    description: '',
    deliveryDate: '',
    urgency: UrgencyLevel.MEDIUM,
    boxNumber: '',
    boxColor: '',
    isPromised: false,
    items: [] as JobItem[]
  });

  // Estado para adicionar novos itens na edição
  const [newItemType, setNewItemType] = useState('');
  const [newItemQty, setNewItemQty] = useState(1);

  const [isAlertModalOpen, setIsAlertModalOpen] = useState(false);
  const [alertForm, setAlertForm] = useState({
      title: 'URGÊNCIA DE PRODUÇÃO',
      message: '',
      targetDate: new Date().toISOString().slice(0, 16),
      targetType: 'SECTOR', // SECTOR or USER
      targetId: ''
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

  const sortedHistory = [...(job.history || [])].sort((a, b) => 
      new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  );

  const handleEditToggle = () => {
      if (!isEditing) {
          // Prepara o formulário com os dados atuais
          setEditForm({
              patientName: job.patientName,
              dentistName: job.dentistName,
              description: job.description,
              deliveryDate: new Date(job.deliveryDate).toISOString().split('T')[0],
              urgency: job.urgency,
              boxNumber: job.boxNumber || '',
              boxColor: job.boxColor || '#cccccc',
              isPromised: job.isPromised || false,
              // Se job.items não existir (casos antigos), cria um item baseado no prosthesisType antigo
              items: job.items && job.items.length > 0 
                ? [...job.items] 
                : [{ type: job.prosthesisType, quantity: 1 }]
          });
      }
      setIsEditing(!isEditing);
  };

  // Funções de manipulação da lista de itens na edição
  const handleAddItem = () => {
      if (!newItemType) return;
      setEditForm(prev => ({
          ...prev,
          items: [...prev.items, { type: newItemType, quantity: newItemQty }]
      }));
      setNewItemType('');
      setNewItemQty(1);
  };

  const handleRemoveItem = (index: number) => {
      const newItems = [...editForm.items];
      newItems.splice(index, 1);
      setEditForm(prev => ({ ...prev, items: newItems }));
  };

  const handleSave = async () => {
      // Gera o resumo visual (string) para compatibilidade
      const typeSummary = editForm.items.length > 0 
        ? editForm.items.map(i => `${i.quantity}x ${i.type}`).join(', ')
        : 'Trabalho não especificado';

      await updateJob(job.id, {
          patientName: editForm.patientName,
          dentistName: editForm.dentistName,
          prosthesisType: typeSummary, // Atualiza o resumo
          items: editForm.items,      // Salva a lista real
          description: editForm.description,
          deliveryDate: new Date(editForm.deliveryDate).toISOString(),
          urgency: editForm.urgency,
          boxNumber: editForm.boxNumber,
          boxColor: editForm.boxColor,
          isPromised: editForm.isPromised
      });
      setIsEditing(false);
  };

  const handleReopen = async () => {
      if (window.confirm("Tem certeza que deseja reabrir este caso? Ele voltará para 'Em Produção'.")) {
          await reopenJob(job.id);
      }
  };

  const handleCreateAlert = async (e: React.FormEvent) => {
      e.preventDefault();
      const alertPayload: any = {
          title: alertForm.title,
          message: alertForm.message,
          targetDate: new Date(alertForm.targetDate).toISOString(),
          jobId: job.code,
      };
      if (alertForm.targetType === 'SECTOR' && alertForm.targetId) alertPayload.targetSectorId = alertForm.targetId;
      if (alertForm.targetType === 'USER' && alertForm.targetId) alertPayload.targetUserId = alertForm.targetId;

      await createAlert(alertPayload);
      setIsAlertModalOpen(false);
      alert("Alarme agendado com sucesso!");
  };

  // Verifica se tem itens, senão usa o tipo antigo para exibição
  const displayItems = job.items && job.items.length > 0 
    ? job.items 
    : [{ type: job.prosthesisType, quantity: 1 }];

  return (
    <div className="max-w-5xl mx-auto pb-12 relative">
      
      {/* Modal de Alerta (MANTIDO IGUAL) */}
      {isAlertModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
              <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95">
                  <div className="bg-red-600 p-4 flex justify-between items-center text-white">
                      <h3 className="font-bold flex items-center gap-2"><BellRing size={20} /> Criar Alerta de Urgência</h3>
                      <button onClick={() => setIsAlertModalOpen(false)} className="hover:bg-red-700 p-1 rounded-full"><X size={20}/></button>
                  </div>
                  <form onSubmit={handleCreateAlert} className="p-6 space-y-4">
                      <div><label className="block text-xs font-bold text-slate-500 uppercase mb-1">Título</label><input type="text" value={alertForm.title} onChange={e => setAlertForm({...alertForm, title: e.target.value})} className="w-full px-3 py-2 border border-slate-300 rounded-lg font-bold text-red-700" required /></div>
                      <div><label className="block text-xs font-bold text-slate-500 uppercase mb-1">Mensagem</label><textarea value={alertForm.message} onChange={e => setAlertForm({...alertForm, message: e.target.value})} className="w-full px-3 py-2 border border-slate-300 rounded-lg h-24 resize-none" required /></div>
                      <div className="grid grid-cols-2 gap-4">
                          <div><label className="block text-xs font-bold text-slate-500 uppercase mb-1">Data/Hora</label><input type="datetime-local" value={alertForm.targetDate} onChange={e => setAlertForm({...alertForm, targetDate: e.target.value})} className="w-full px-2 py-2 border border-slate-300 rounded-lg text-xs" required /></div>
                          <div><label className="block text-xs font-bold text-slate-500 uppercase mb-1">Alvo</label><select value={alertForm.targetType} onChange={e => setAlertForm({...alertForm, targetType: e.target.value, targetId: ''})} className="w-full px-2 py-2 border border-slate-300 rounded-lg text-xs bg-white"><option value="SECTOR">Setor</option><option value="USER">Usuário</option></select></div>
                      </div>
                      <div><label className="block text-xs font-bold text-slate-500 uppercase mb-1">Destinatário</label><select value={alertForm.targetId} onChange={e => setAlertForm({...alertForm, targetId: e.target.value})} className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm bg-white"><option value="">{alertForm.targetType === 'SECTOR' ? 'Todos' : 'Qualquer'}</option>{alertForm.targetType === 'SECTOR' ? sectors.map(s => <option key={s.id} value={s.id}>{s.name}</option>) : users.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}</select></div>
                      <button type="submit" className="w-full py-3 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl shadow-lg">Agendar Alerta</button>
                  </form>
              </div>
          </div>
      )}

      <div className="flex items-center gap-4 mb-6">
        <button onClick={() => navigate(-1)} className="p-2 hover:bg-slate-100 rounded-full transition-colors text-slate-500">
            <ArrowLeft size={20} />
        </button>
        <h2 className="text-lg md:text-2xl font-bold text-slate-900 truncate">
            <span className="inline-block mr-3 px-3 py-1 rounded-lg text-white text-sm align-middle shadow-sm" style={{ backgroundColor: job.boxColor || '#94a3b8' }}>CX {job.boxNumber || '?'}</span>
            Detalhes do Caso #{job.code}
        </h2>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 relative">
                
                {/* BOTÕES DE AÇÃO NO TOPO */}
                <div className="absolute top-6 right-6 flex gap-2 flex-wrap justify-end pl-12">
                    {isManagement && job.isFinished && (
                        <button onClick={handleReopen} className="flex items-center gap-1 px-3 py-1.5 bg-orange-50 text-orange-600 rounded-lg text-xs font-bold hover:bg-orange-100 transition-colors border border-orange-100">
                            <RefreshCw size={14} /> Reabrir Caso
                        </button>
                    )}

                    {!job.isFinished && !isEditing && (
                        <button onClick={() => finishJob(job.id)} className="flex items-center gap-1 px-3 py-1.5 bg-green-50 text-green-600 rounded-lg text-xs font-bold hover:bg-green-100 transition-colors border border-green-100">
                            <CheckCircle2 size={14} /> Finalizar
                        </button>
                    )}

                    {isManagement && !isEditing && !job.isFinished && (
                        <button onClick={() => setIsAlertModalOpen(true)} className="flex items-center gap-1 px-3 py-1.5 bg-red-50 text-red-600 rounded-lg text-xs font-bold hover:bg-red-100 transition-colors border border-red-100">
                            <BellRing size={14} /> Alerta
                        </button>
                    )}

                    {isEditing ? (
                        <>
                            <button onClick={handleSave} className="flex items-center gap-1 px-3 py-1.5 bg-green-600 text-white rounded-lg text-xs font-bold hover:bg-green-700 transition-colors shadow-md">
                                <Save size={14} /> Salvar
                            </button>
                            <button onClick={() => setIsEditing(false)} className="flex items-center gap-1 px-3 py-1.5 bg-slate-100 text-slate-500 rounded-lg text-xs font-bold hover:bg-slate-200 transition-colors">
                                <X size={14} /> Cancelar
                            </button>
                        </>
                    ) : (
                        <button onClick={handleEditToggle} className="flex items-center gap-1 px-3 py-1.5 bg-blue-50 text-blue-600 rounded-lg text-xs font-bold hover:bg-blue-100 transition-colors">
                            <Edit size={14} /> Editar
                        </button>
                    )}
                </div>
                
                <div className="space-y-6 mt-2">
                    {isEditing ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div><label className="block text-xs font-bold text-slate-500 uppercase mb-1">Paciente</label><input type="text" value={editForm.patientName} onChange={e => setEditForm({...editForm, patientName: e.target.value})} className="w-full px-3 py-2 border border-slate-200 rounded-lg" /></div>
                            <div><label className="block text-xs font-bold text-slate-500 uppercase mb-1">Dentista</label><select value={editForm.dentistName} onChange={e => setEditForm({...editForm, dentistName: e.target.value})} className="w-full px-3 py-2 border border-slate-200 rounded-lg bg-white"><option value="">Selecione...</option>{dentists.map(d => <option key={d.id} value={d.name}>{d.name}</option>)}</select></div>
                            
                            {/* Edição de Data e Urgência */}
                            <div><label className="block text-xs font-bold text-slate-500 uppercase mb-1">Entrega</label><input type="date" value={editForm.deliveryDate} onChange={e => setEditForm({...editForm, deliveryDate: e.target.value})} className="w-full px-3 py-2 border border-slate-200 rounded-lg" /></div>
                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Urgência</label>
                                <select value={editForm.urgency} onChange={e => setEditForm({...editForm, urgency: e.target.value as UrgencyLevel})} className="w-full px-3 py-2 border border-slate-200 rounded-lg bg-white">
                                    {Object.values(UrgencyLevel).map(l => <option key={l} value={l}>{l}</option>)}
                                </select>
                            </div>

                            {/* EDIÇÃO DE ITENS (LISTA) */}
                            <div className="col-span-2 bg-slate-50 p-3 rounded-xl border border-slate-100">
                                <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Itens do Trabalho</label>
                                <div className="space-y-2 mb-3">
                                    {editForm.items.map((item, index) => (
                                        <div key={index} className="flex justify-between items-center bg-white p-2 rounded border border-slate-200 text-sm">
                                            <span><span className="font-bold bg-slate-100 px-1.5 rounded text-xs mr-2">{item.quantity}x</span> {item.type}</span>
                                            <button onClick={() => handleRemoveItem(index)} className="text-red-500 hover:bg-red-50 p-1 rounded"><Trash2 size={14}/></button>
                                        </div>
                                    ))}
                                </div>
                                <div className="flex gap-2 items-end">
                                    <div className="flex-1">
                                        <select value={newItemType} onChange={e => setNewItemType(e.target.value)} className="w-full px-2 py-1.5 border border-slate-200 rounded text-sm bg-white">
                                            <option value="">Adicionar serviço...</option>
                                            {jobTypes.map(t => <option key={t.id} value={t.name}>{t.name}</option>)}
                                        </select>
                                    </div>
                                    <div className="w-16"><input type="number" min="1" value={newItemQty} onChange={e => setNewItemQty(parseInt(e.target.value))} className="w-full px-2 py-1.5 border border-slate-200 rounded text-sm text-center" /></div>
                                    <button onClick={handleAddItem} type="button" className="px-3 py-1.5 bg-blue-600 text-white rounded text-sm font-bold"><Plus size={14}/></button>
                                </div>
                            </div>

                            <div className="col-span-2"><label className="block text-xs font-bold text-slate-500 uppercase mb-1">Descrição</label><textarea value={editForm.description} onChange={e => setEditForm({...editForm, description: e.target.value})} className="w-full px-3 py-2 border border-slate-200 rounded-lg h-24" /></div>
                             <div className="grid grid-cols-2 gap-4 col-span-2">
                                <div><label className="block text-xs font-bold text-slate-500 uppercase mb-1">Caixa #</label><input type="text" value={editForm.boxNumber} onChange={e => setEditForm({...editForm, boxNumber: e.target.value})} className="w-full px-3 py-2 border border-slate-200 rounded-lg text-center font-bold" /></div>
                                <div><label className="block text-xs font-bold text-slate-500 uppercase mb-1">Cor</label><div className="flex gap-2 flex-wrap">{boxColors.map(c => (<button key={c.id} onClick={() => setEditForm({...editForm, boxColor: c.hex})} type="button" className={`w-8 h-8 rounded-full border-2 ${editForm.boxColor === c.hex ? 'border-slate-800 scale-110' : 'border-transparent'}`} style={{backgroundColor: c.hex}} />))}</div></div>
                            </div>
                            <div className="col-span-2 border-t border-slate-100 pt-4">
                                <label className="flex items-center gap-3 cursor-pointer bg-yellow-50 p-3 rounded-lg border border-yellow-100 hover:bg-yellow-100 transition-colors">
                                    <div className="relative flex items-center">
                                        <input type="checkbox" checked={editForm.isPromised} onChange={e => setEditForm({...editForm, isPromised: e.target.checked})} className="peer h-5 w-5 cursor-pointer appearance-none rounded-md border-2 border-yellow-400 transition-all checked:bg-yellow-500" />
                                        <Star className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-white opacity-0 peer-checked:opacity-100" size={12} strokeWidth={3} />
                                    </div>
                                    <span className="text-sm font-bold text-yellow-800">Marcar como Caso Prometido (VIP)</span>
                                </label>
                            </div>
                        </div>
                    ) : (
                        <>
                            <div>
                                <div className="flex items-center gap-2 mb-1">
                                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${job.isPromised ? 'bg-yellow-100 text-yellow-800' : 'bg-slate-100 text-slate-600'}`}>{job.isPromised ? 'VIP / Prometido' : 'Padrão'}</span>
                                    <StatusBadge status={job.status} />
                                </div>
                                <h1 className="text-3xl font-bold text-slate-900">{job.patientName}</h1>
                                <p className="text-slate-500 font-medium flex items-center gap-1 mt-1"><User size={16} /> Dr(a). {job.dentistName}</p>
                            </div>

                            <div className="bg-slate-50 rounded-xl p-4 border border-slate-100 grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <span className="text-xs font-bold text-slate-400 uppercase block mb-2 flex items-center gap-1"><ShoppingCart size={14}/> Itens do Serviço</span>
                                    <div className="space-y-1">
                                        {displayItems.map((item, idx) => (
                                            <div key={idx} className="flex items-center gap-2 font-bold text-slate-800">
                                                <span className="bg-white border border-slate-200 px-1.5 rounded text-xs text-slate-500">{item.quantity}x</span>
                                                {item.type}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                                <div><span className="text-xs font-bold text-slate-400 uppercase block mb-1">Entrega Prevista</span><p className="font-bold text-slate-800 flex items-center gap-2"><Calendar size={16} className="text-blue-500" />{new Date(job.deliveryDate).toLocaleDateString()}</p></div>
                                <div className="md:col-span-2 border-t border-slate-200 pt-4 mt-2"><span className="text-xs font-bold text-slate-400 uppercase block mb-1">Observações Técnicas</span><p className="text-slate-700 text-sm leading-relaxed whitespace-pre-line">{job.description}</p></div>
                            </div>
                        </>
                    )}
                </div>
            </div>
        </div>

        <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 h-full">
                <h3 className="text-lg font-bold text-slate-800 mb-6 flex items-center gap-2"><Activity className="text-blue-500" /> Linha do Tempo</h3>
                <div className="relative space-y-8 before:absolute before:inset-0 before:ml-5 before:-translate-x-px before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-slate-200 before:to-transparent">
                    {sortedHistory.length === 0 ? (<p className="text-sm text-slate-400 italic ml-12">Nenhum histórico registrado.</p>) : (
                        sortedHistory.map((event) => {
                            const isFinish = event.action === 'FINISHED';
                            const isEdit = event.action === 'EDIT';
                            const isCreated = event.action === 'CREATED';
                            const isEntry = event.action === 'ENTRY';
                            const isReopen = event.action === 'REOPENED';
                            
                            let icon = <ArrowLeft size={16} />;
                            let colorClass = 'bg-slate-400';
                            
                            if (isFinish) { icon = <CheckCircle2 size={16} />; colorClass = 'bg-green-500'; }
                            else if (isEdit) { icon = <Edit size={16} />; colorClass = 'bg-amber-500'; }
                            else if (isCreated) { icon = <FileText size={16} />; colorClass = 'bg-blue-500'; }
                            else if (isEntry) { icon = <ArrowRight size={16} />; colorClass = 'bg-purple-500'; }
                            else if (isReopen) { icon = <RefreshCw size={16} />; colorClass = 'bg-orange-500'; }

                            return (
                                <div key={event.id} className="relative flex items-start group">
                                    <div className={`absolute left-0 h-10 w-10 flex items-center justify-center rounded-full border-4 border-white shadow-sm z-10 text-white ${colorClass}`}>
                                        {icon}
                                    </div>
                                    <div className="ml-16 w-full">
                                        <div className="flex flex-col">
                                            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-0.5">{new Date(event.timestamp).toLocaleString()}</span>
                                            <h4 className="font-bold text-slate-800 text-sm">
                                                {isFinish ? 'Trabalho Finalizado' : isEdit ? 'Edição de Dados' : isCreated ? 'Trabalho Criado' : isReopen ? 'Trabalho Reaberto' : event.action === 'ENTRY' ? 'Entrada no Setor' : 'Saída do Setor'}
                                            </h4>
                                            <div className="text-xs font-medium text-blue-600 mt-0.5 mb-2">{event.sectorName} • {event.userName}</div>
                                            {event.changes && event.changes.length > 0 && (
                                                <div className="bg-amber-50 p-2 rounded border border-amber-100 text-xs text-amber-800 space-y-1">
                                                    {event.changes.map((change, i) => (<div key={i}>• {change}</div>))}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            );
                        })
                    )}
                </div>
            </div>
        </div>
      </div>
    </div>
  );
};

export default JobDetails;