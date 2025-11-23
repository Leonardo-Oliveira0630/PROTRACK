import React, { useState } from 'react';
import { useApp } from '../store/AppContext';
import { Job } from '../types';
import { StatusBadge } from '../components/StatusBadge';
import { CalendarClock, AlertTriangle, Bell, CheckCircle2, Star, Clock, Stethoscope, CheckCircle, Box } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

// ... (SectionHeader component remains same)

interface JobCardProps {
  job: Job;
  sectorName: string;
  isEditing: boolean;
  tempNote: string;
  setTempNote: (note: string) => void;
  onSave: (jobId: string) => void;
  onCancel: () => void;
  onEdit: (job: Job) => void;
  onFinish: (jobId: string) => void;
  onNavigate: (jobId: string) => void;
}

const JobCard: React.FC<JobCardProps> = ({ job, sectorName, isEditing, tempNote, setTempNote, onSave, onCancel, onEdit, onFinish, onNavigate }) => {
    const today = new Date();
    today.setHours(0,0,0,0);
    const isLate = new Date(job.deliveryDate) < today;

    // Helper function to determine text color based on background luminance
    const getContrastColor = (hexColor: string) => {
        if (!hexColor) return '#FFFFFF';
        const r = parseInt(hexColor.substr(1, 2), 16);
        const g = parseInt(hexColor.substr(3, 2), 16);
        const b = parseInt(hexColor.substr(5, 2), 16);
        const yiq = ((r * 299) + (g * 587) + (b * 114)) / 1000;
        return (yiq >= 128) ? '#0f172a' : '#FFFFFF'; 
    };
    
    return (
        <div 
            onClick={() => onNavigate(job.id)}
            className={`bg-white rounded-xl p-4 shadow-sm border-l-4 transition-all hover:shadow-md cursor-pointer ${
            isLate ? 'border-l-red-500 border-y border-r border-slate-200' : 'border-l-yellow-400 border-y border-r border-slate-200'
        }`}>
            <div className="flex gap-4 items-center">
                {/* Box Highlight - AGORA COM CONTRASTE CORRETO */}
                <div 
                    className="w-20 h-20 rounded-xl flex flex-col items-center justify-center shrink-0 shadow-sm border border-slate-100 transform group-hover:scale-105 transition-transform"
                    style={{ backgroundColor: job.boxColor || '#94a3b8' }}
                >
                    <span 
                      className="text-[10px] font-bold uppercase tracking-widest mb-1"
                      style={{ color: getContrastColor(job.boxColor || '#94a3b8'), opacity: 0.8 }}
                    >CAIXA</span>
                    <span 
                      className="text-4xl font-black leading-none drop-shadow-sm"
                      style={{ color: getContrastColor(job.boxColor || '#94a3b8') }}
                    >{job.boxNumber || '?'}</span>
                </div>

                <div className="flex-1 flex flex-col md:flex-row justify-between gap-4">
                    {/* Info */}
                    <div className="flex flex-col justify-center">
                        <div className="flex items-center gap-2 mb-1">
                            <span className="text-xs font-mono font-bold text-slate-400">#{job.code}</span>
                            {isLate && <span className="text-xs font-bold text-red-600 flex items-center gap-1 bg-red-50 px-1.5 rounded"><AlertTriangle size={10} /> ATRASADO</span>}
                        </div>
                        <h4 className="font-bold text-slate-900 text-lg hover:text-blue-600 transition-colors leading-tight">{job.patientName}</h4>
                        <p className="text-sm text-slate-600 font-medium mt-1">{job.prosthesisType}</p>
                        
                        <div className="flex items-center gap-3 mt-2 text-xs text-slate-500">
                            <div className="flex items-center gap-1">
                                <Stethoscope size={12} /> {job.dentistName}
                            </div>
                            <div className="flex items-center gap-1 px-2 py-0.5 rounded bg-slate-50 border border-slate-100">
                                <div className={`w-1.5 h-1.5 rounded-full ${job.currentSectorId ? 'bg-green-500' : 'bg-amber-400 animate-pulse'}`}></div>
                                <span className="font-semibold">{sectorName}</span>
                            </div>
                        </div>
                    </div>

                    {/* Actions & Status */}
                    <div className="flex flex-col items-end justify-between gap-2 py-1">
                        <div className="text-right">
                            <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Entrega</div>
                            <div className={`font-bold text-sm ${isLate ? 'text-red-600' : 'text-slate-800'}`}>
                                {new Date(job.deliveryDate).toLocaleDateString()}
                            </div>
                        </div>

                        <div className="flex gap-2 items-center w-full md:w-auto justify-end mt-2 md:mt-0">
                            <button 
                                onClick={(e) => {
                                    e.stopPropagation();
                                    onFinish(job.id);
                                }}
                                className="p-2 bg-slate-100 text-slate-400 hover:bg-green-50 hover:text-green-600 rounded-lg transition-colors"
                                title="Finalizar"
                            >
                                <CheckCircle size={18} />
                            </button>

                            <div onClick={e => e.stopPropagation()} className="bg-yellow-50 rounded-lg border border-yellow-100 p-2 cursor-pointer hover:bg-yellow-100 transition-colors min-w-[180px]">
                                {isEditing ? (
                                    <div className="flex flex-col gap-2">
                                        <textarea 
                                            value={tempNote}
                                            onChange={(e) => setTempNote(e.target.value)}
                                            className="w-full text-xs p-1 rounded border border-yellow-300 focus:outline-none"
                                            rows={2}
                                            autoFocus
                                        />
                                        <button onClick={() => onSave(job.id)} className="text-xs bg-slate-800 text-white px-2 py-1 rounded font-bold">OK</button>
                                    </div>
                                ) : (
                                    <div onClick={() => onEdit(job)} className="flex gap-2 items-center">
                                        <Bell size={14} className={job.reminderNote ? 'text-yellow-600' : 'text-slate-300'} />
                                        <p className="text-xs text-slate-600 truncate max-w-[140px]">
                                            {job.reminderNote || 'Nota do gestor...'}
                                        </p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

// ... (PromisedJobs component remains mostly same, just using updated JobCard)
const PromisedJobs = () => {
  // ... (rest of the component code)
  // Certifique-se de incluir o componente SectionHeader e a lógica principal
  // Vou incluir apenas o retorno principal para brevidade, já que a lógica não mudou, apenas o card.
  
  const { jobs, sectors, updateJobReminder, finishJob } = useApp();
  const navigate = useNavigate();
  const [editingNoteId, setEditingNoteId] = useState<string | null>(null);
  const [tempNote, setTempNote] = useState('');

  // Filter only Promised Jobs
  const promisedJobs = jobs.filter(job => job.isPromised && !job.isFinished);

  // ... (sorting logic same as before) ...
  const today = new Date();
  today.setHours(0,0,0,0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  const groups = {
    late: [] as Job[],
    today: [] as Job[],
    tomorrow: [] as Job[],
    upcoming: [] as Job[]
  };

  promisedJobs.forEach(job => {
    const delivery = new Date(job.deliveryDate);
    delivery.setHours(0,0,0,0);

    if (delivery < today) {
      groups.late.push(job);
    } else if (delivery.getTime() === today.getTime()) {
      groups.today.push(job);
    } else if (delivery.getTime() === tomorrow.getTime()) {
      groups.tomorrow.push(job);
    } else {
      groups.upcoming.push(job);
    }
  });
  
  // ... sorting functions ...

  const getSectorName = (id: string | null) => {
    if (!id) return "Em Trânsito";
    return sectors.find(s => s.id === id)?.name || "Desconhecido";
  };

  const startEditing = (job: Job) => {
    setEditingNoteId(job.id);
    setTempNote(job.reminderNote || '');
  };

  const saveNote = (jobId: string) => {
    updateJobReminder(jobId, tempNote);
    setEditingNoteId(null);
  };

  return (
    <div className="max-w-5xl mx-auto pb-12">
       {/* Header */}
       <div className="flex items-center justify-between mb-6">
        <div>
            <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
                <Star className="text-yellow-400 fill-yellow-400" />
                Casos Prometidos / VIP
            </h2>
        </div>
      </div>

      {promisedJobs.length === 0 ? (
          <div className="p-12 text-center text-slate-400 bg-white rounded-xl border border-dashed">Nenhum caso VIP ativo.</div>
      ) : (
        <div className="space-y-8">
            {groups.late.length > 0 && (
                <section>
                    <SectionHeader title="ATRASADOS" count={groups.late.length} icon={AlertTriangle} colorClass="text-red-600 border-red-200" />
                    <div className="space-y-3">{groups.late.map(job => <JobCard key={job.id} job={job} sectorName={getSectorName(job.currentSectorId)} isEditing={editingNoteId === job.id} tempNote={tempNote} setTempNote={setTempNote} onSave={saveNote} onCancel={() => setEditingNoteId(null)} onEdit={startEditing} onFinish={finishJob} onNavigate={(id) => navigate(`/jobs/${id}`)} />)}</div>
                </section>
            )}
            {/* ... other sections (today, tomorrow, upcoming) follow same pattern using JobCard ... */}
             {groups.today.length > 0 && (
                <section>
                    <SectionHeader title="Entrega Hoje" count={groups.today.length} icon={Clock} colorClass="text-slate-800 border-slate-200" />
                    <div className="space-y-3">{groups.today.map(job => <JobCard key={job.id} job={job} sectorName={getSectorName(job.currentSectorId)} isEditing={editingNoteId === job.id} tempNote={tempNote} setTempNote={setTempNote} onSave={saveNote} onCancel={() => setEditingNoteId(null)} onEdit={startEditing} onFinish={finishJob} onNavigate={(id) => navigate(`/jobs/${id}`)} />)}</div>
                </section>
            )}
             {groups.tomorrow.length > 0 && (
                <section>
                    <SectionHeader title="Amanhã" count={groups.tomorrow.length} icon={CalendarClock} colorClass="text-blue-600 border-blue-200" />
                    <div className="space-y-3">{groups.tomorrow.map(job => <JobCard key={job.id} job={job} sectorName={getSectorName(job.currentSectorId)} isEditing={editingNoteId === job.id} tempNote={tempNote} setTempNote={setTempNote} onSave={saveNote} onCancel={() => setEditingNoteId(null)} onEdit={startEditing} onFinish={finishJob} onNavigate={(id) => navigate(`/jobs/${id}`)} />)}</div>
                </section>
            )}
             {groups.upcoming.length > 0 && (
                <section>
                    <SectionHeader title="Futuros" count={groups.upcoming.length} icon={CheckCircle2} colorClass="text-slate-500 border-slate-200" />
                    <div className="space-y-3">{groups.upcoming.map(job => <JobCard key={job.id} job={job} sectorName={getSectorName(job.currentSectorId)} isEditing={editingNoteId === job.id} tempNote={tempNote} setTempNote={setTempNote} onSave={saveNote} onCancel={() => setEditingNoteId(null)} onEdit={startEditing} onFinish={finishJob} onNavigate={(id) => navigate(`/jobs/${id}`)} />)}</div>
                </section>
            )}
        </div>
      )}
    </div>
  );
};

export default PromisedJobs;