
import React, { useState } from 'react';
import { useApp } from '../store/AppContext';
import { Job } from '../types';
import { StatusBadge } from '../components/StatusBadge';
import { CalendarClock, AlertTriangle, Bell, CheckCircle2, Star, Clock, Stethoscope, CheckCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface SectionHeaderProps {
  title: string;
  count: number;
  icon: React.ElementType;
  colorClass: string;
}

const SectionHeader: React.FC<SectionHeaderProps> = ({ title, count, icon: Icon, colorClass }) => (
  <div className={`flex items-center gap-3 mb-4 mt-8 pb-2 border-b ${colorClass}`}>
      <Icon className={`w-6 h-6`} />
      <h3 className="text-lg font-bold text-slate-800">{title}</h3>
      <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 text-xs font-bold">{count}</span>
  </div>
);

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
    
    return (
        <div 
            onClick={() => onNavigate(job.id)}
            className={`bg-white rounded-xl p-5 shadow-sm border-l-4 transition-all hover:shadow-md cursor-pointer ${
            isLate ? 'border-l-red-500 border-y border-r border-slate-200' : 'border-l-yellow-400 border-y border-r border-slate-200'
        }`}>
            <div className="flex flex-col md:flex-row justify-between gap-4">
                {/* Left Info */}
                <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs font-mono font-bold text-slate-400 bg-slate-50 px-1.5 py-0.5 rounded border border-slate-100">#{job.code}</span>
                        {isLate && <span className="text-xs font-bold text-red-600 flex items-center gap-1"><AlertTriangle size={10} /> ATRASADO</span>}
                    </div>
                    <h4 className="font-bold text-slate-900 text-lg hover:text-blue-600 transition-colors">{job.patientName}</h4>
                    
                    <div className="flex items-center gap-1 text-xs text-slate-500 font-medium mb-1">
                        <Stethoscope size={12} />
                        {job.dentistName || 'Sem dentista'}
                    </div>

                    <p className="text-sm text-slate-600 font-medium">{job.prosthesisType}</p>
                    
                    <div className="mt-3 flex flex-wrap items-center gap-2 text-xs text-slate-500">
                        <div className="flex items-center gap-1 px-2 py-1 rounded bg-slate-50 border border-slate-100">
                             <div className={`w-2 h-2 rounded-full ${job.currentSectorId ? 'bg-green-500' : 'bg-amber-400 animate-pulse'}`}></div>
                             <span className="font-semibold">{sectorName}</span>
                        </div>
                        <StatusBadge status={job.status} />
                    </div>
                </div>

                {/* Right Info & Actions */}
                <div className="flex flex-col md:items-end justify-between gap-4 mt-4 md:mt-0 border-t md:border-t-0 pt-4 md:pt-0 border-slate-100">
                    <div className="flex md:flex-col justify-between items-end">
                        <div className="text-left md:text-right">
                            <div className="text-xs text-slate-400 font-bold uppercase tracking-wider">Entrega</div>
                            <div className={`font-bold ${isLate ? 'text-red-600' : 'text-slate-800'}`}>
                                {new Date(job.deliveryDate).toLocaleDateString()}
                            </div>
                        </div>
                    </div>

                    <div className="flex gap-2 items-end w-full md:w-auto">
                         {/* Finish Button */}
                        <button 
                            onClick={(e) => {
                                e.stopPropagation();
                                onFinish(job.id);
                            }}
                            className="p-2 bg-slate-100 text-slate-400 hover:bg-green-50 hover:text-green-600 rounded-lg transition-colors h-[40px] shrink-0"
                            title="Finalizar Agora"
                        >
                            <CheckCircle size={20} />
                        </button>

                        {/* Reminder Section */}
                        <div onClick={e => e.stopPropagation()} className="flex-1 md:w-64 bg-yellow-50/50 rounded-lg border border-yellow-100 p-3 relative group">
                            {isEditing ? (
                                <div className="flex flex-col gap-2">
                                    <textarea 
                                        value={tempNote}
                                        onChange={(e) => setTempNote(e.target.value)}
                                        className="w-full text-xs p-2 rounded border border-yellow-300 focus:outline-none focus:ring-2 focus:ring-yellow-200 bg-white"
                                        rows={2}
                                        placeholder="Nota do gestor..."
                                        autoFocus
                                    />
                                    <div className="flex gap-2 justify-end">
                                        <button onClick={onCancel} className="text-xs text-slate-400 font-medium hover:text-slate-600">Cancelar</button>
                                        <button onClick={() => onSave(job.id)} className="text-xs bg-slate-900 text-white px-3 py-1 rounded font-bold hover:bg-slate-700">Salvar</button>
                                    </div>
                                </div>
                            ) : (
                                <div onClick={() => onEdit(job)} className="cursor-pointer min-h-[40px] flex gap-2 items-start">
                                    <Bell size={14} className={`mt-0.5 shrink-0 ${job.reminderNote ? 'text-yellow-600 fill-yellow-600' : 'text-slate-300'}`} />
                                    {job.reminderNote ? (
                                        <p className="text-xs text-slate-700 leading-relaxed italic">{job.reminderNote}</p>
                                    ) : (
                                        <p className="text-xs text-slate-400 italic">Adicionar lembrete do gestor...</p>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

const PromisedJobs = () => {
  const { jobs, sectors, updateJobReminder, finishJob } = useApp();
  const navigate = useNavigate();
  const [editingNoteId, setEditingNoteId] = useState<string | null>(null);
  const [tempNote, setTempNote] = useState('');

  // Filter only Promised Jobs
  const promisedJobs = jobs.filter(job => job.isPromised && !job.isFinished);

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

  const sortFn = (a: Job, b: Job) => new Date(a.deliveryDate).getTime() - new Date(b.deliveryDate).getTime();
  groups.late.sort(sortFn);
  groups.today.sort(sortFn);
  groups.tomorrow.sort(sortFn);
  groups.upcoming.sort(sortFn);

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
      <div className="flex items-center justify-between mb-2">
        <div>
            <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
                <Star className="text-yellow-400 fill-yellow-400" />
                Casos Prometidos / VIP
            </h2>
            <p className="text-slate-500 text-sm">Monitoramento prioritário de casos com data marcada.</p>
        </div>
      </div>

      {promisedJobs.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 bg-white rounded-2xl border border-slate-200 border-dashed mt-8">
              <div className="p-4 bg-yellow-50 rounded-full text-yellow-400 mb-4">
                  <Star size={32} />
              </div>
              <h3 className="text-lg font-bold text-slate-700">Nenhum caso prometido ativo</h3>
              <p className="text-slate-400 text-sm">Marque a opção "Trabalho Prometido" ao criar um caso.</p>
          </div>
      ) : (
        <>
            {/* Late Jobs */}
            {groups.late.length > 0 && (
                <section>
                    <SectionHeader title="ATRASADOS / CRÍTICOS" count={groups.late.length} icon={AlertTriangle} colorClass="text-red-600 border-red-100" />
                    <div className="space-y-4">
                        {groups.late.map(job => (
                            <JobCard
                                key={job.id}
                                job={job}
                                sectorName={getSectorName(job.currentSectorId)}
                                isEditing={editingNoteId === job.id}
                                tempNote={tempNote}
                                setTempNote={setTempNote}
                                onSave={saveNote}
                                onCancel={() => setEditingNoteId(null)}
                                onEdit={startEditing}
                                onFinish={finishJob}
                                onNavigate={(id) => navigate(`/jobs/${id}`)}
                            />
                        ))}
                    </div>
                </section>
            )}

            {/* Today Jobs */}
            {groups.today.length > 0 && (
                <section>
                    <SectionHeader title="Entrega Hoje" count={groups.today.length} icon={Clock} colorClass="text-slate-800 border-slate-200" />
                    <div className="space-y-4">
                        {groups.today.map(job => (
                            <JobCard
                                key={job.id}
                                job={job}
                                sectorName={getSectorName(job.currentSectorId)}
                                isEditing={editingNoteId === job.id}
                                tempNote={tempNote}
                                setTempNote={setTempNote}
                                onSave={saveNote}
                                onCancel={() => setEditingNoteId(null)}
                                onEdit={startEditing}
                                onFinish={finishJob}
                                onNavigate={(id) => navigate(`/jobs/${id}`)}
                            />
                        ))}
                    </div>
                </section>
            )}

            {/* Tomorrow Jobs */}
            {groups.tomorrow.length > 0 && (
                <section>
                    <SectionHeader title="Entrega Amanhã" count={groups.tomorrow.length} icon={CalendarClock} colorClass="text-blue-600 border-blue-100" />
                    <div className="space-y-4">
                        {groups.tomorrow.map(job => (
                            <JobCard
                                key={job.id}
                                job={job}
                                sectorName={getSectorName(job.currentSectorId)}
                                isEditing={editingNoteId === job.id}
                                tempNote={tempNote}
                                setTempNote={setTempNote}
                                onSave={saveNote}
                                onCancel={() => setEditingNoteId(null)}
                                onEdit={startEditing}
                                onFinish={finishJob}
                                onNavigate={(id) => navigate(`/jobs/${id}`)}
                            />
                        ))}
                    </div>
                </section>
            )}

             {/* Upcoming Jobs */}
             {groups.upcoming.length > 0 && (
                <section>
                    <SectionHeader title="Próximas Entregas" count={groups.upcoming.length} icon={CheckCircle2} colorClass="text-slate-500 border-slate-100" />
                    <div className="space-y-4">
                        {groups.upcoming.map(job => (
                            <JobCard
                                key={job.id}
                                job={job}
                                sectorName={getSectorName(job.currentSectorId)}
                                isEditing={editingNoteId === job.id}
                                tempNote={tempNote}
                                setTempNote={setTempNote}
                                onSave={saveNote}
                                onCancel={() => setEditingNoteId(null)}
                                onEdit={startEditing}
                                onFinish={finishJob}
                                onNavigate={(id) => navigate(`/jobs/${id}`)}
                            />
                        ))}
                    </div>
                </section>
            )}
        </>
      )}
    </div>
  );
};

export default PromisedJobs;
