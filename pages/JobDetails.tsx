
import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useApp } from '../store/AppContext';
import { JobStatus, UrgencyLevel } from '../types';
import { ArrowLeft, Calendar, User, FileText, Activity, AlertCircle, CheckCircle2, MapPin, Clock, Edit, Save, ArrowRight, Box } from 'lucide-react';
import { StatusBadge } from '../components/StatusBadge';

const JobDetails = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { getJobById, updateJob, finishJob, currentUser } = useApp();
  
  const job = getJobById(id || '');
  const [isEditingDate, setIsEditingDate] = useState(false);
  const [newDate, setNewDate] = useState('');

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

  const handleSaveDate = async () => {
      if (newDate) {
          await updateJob(job.id, { deliveryDate: new Date(newDate).toISOString() });
          setIsEditingDate(false);
      }
  };

  return (
    <div className="max-w-5xl mx-auto pb-12">
      <div className="flex items-center gap-4 mb-6">
        <button onClick={() => navigate(-1)} className="p-2 hover:bg-slate-100 rounded-full transition-colors text-slate-500">
            <ArrowLeft size={20} />
        </button>
        <h2 className="text-2xl font-bold text-slate-900">Detalhes do Caso #{job.code}</h2>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column: Main Info */}
        <div className="lg:col-span-2 space-y-6">
            
            {/* Card Principal */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
                <div className="flex justify-between items-start mb-6">
                    <div>
                        <h3 className="text-xl font-bold text-slate-900">{job.patientName}</h3>
                        <div className="flex items-center gap-2 text-slate-500 mt-1">
                            <User size={14} />
                            <span className="text-sm font-medium">{job.dentistName || 'Sem dentista vinculado'}</span>
                        </div>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                        <StatusBadge status={job.status} />
                        <StatusBadge urgency={job.urgency} />
                        {job.boxNumber && (
                            <div 
                                className="px-2 py-1 rounded-lg border flex items-center gap-1.5 text-xs font-bold mt-2"
                                style={{ backgroundColor: job.boxColor || '#f1f5f9', borderColor: 'rgba(0,0,0,0.1)', color: '#334155' }}
                            >
                                <Box size={12} /> Caixa {job.boxNumber}
                            </div>
                        )}
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-6 mb-6">
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
                        {isEditingDate ? (
                            <div className="flex items-center gap-2">
                                <input 
                                    type="date" 
                                    value={newDate} 
                                    onChange={e => setNewDate(e.target.value)}
                                    className="bg-white border border-slate-300 rounded px-2 py-1 text-sm"
                                />
                                <button onClick={handleSaveDate} className="p-1 bg-green-100 text-green-600 rounded hover:bg-green-200"><Save size={16} /></button>
                                <button onClick={() => setIsEditingDate(false)} className="p-1 bg-red-100 text-red-600 rounded hover:bg-red-200"><ArrowLeft size={16} /></button>
                            </div>
                        ) : (
                            <div className="flex items-center justify-between">
                                <p className={`font-bold ${new Date(job.deliveryDate) < new Date() ? 'text-red-600' : 'text-slate-800'}`}>
                                    {new Date(job.deliveryDate).toLocaleDateString()}
                                </p>
                                <button onClick={() => setIsEditingDate(true)} className="text-blue-500 hover:bg-blue-50 p-1 rounded"><Edit size={14} /></button>
                            </div>
                        )}
                    </div>
                </div>

                <div className="mb-4">
                    <h4 className="text-sm font-bold text-slate-700 mb-2">Descrição / Observações</h4>
                    <p className="text-slate-600 bg-slate-50 p-4 rounded-xl text-sm leading-relaxed border border-slate-100">
                        {job.description}
                    </p>
                </div>

                {!job.isFinished && (
                    <div className="border-t border-slate-100 pt-6 mt-6 flex justify-end">
                        <button 
                            onClick={() => finishJob(job.id)}
                            className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-xl font-bold transition-colors shadow-lg shadow-green-900/20"
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
