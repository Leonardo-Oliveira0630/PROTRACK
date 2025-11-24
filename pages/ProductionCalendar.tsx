import React, { useState } from 'react';
import { useApp } from '../store/AppContext';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, Star } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const ProductionCalendar = () => {
  const { jobs } = useApp();
  const navigate = useNavigate();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDay, setSelectedDay] = useState<number | null>(new Date().getDate());

  const getDaysInMonth = (year: number, month: number) => new Date(year, month + 1, 0).getDate();
  const getFirstDayOfMonth = (year: number, month: number) => new Date(year, month, 1).getDay();

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const daysInMonth = getDaysInMonth(year, month);
  const firstDay = getFirstDayOfMonth(year, month);

  const prevMonth = () => setCurrentDate(new Date(year, month - 1, 1));
  const nextMonth = () => setCurrentDate(new Date(year, month + 1, 1));

  const monthNames = ["Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho", "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"];

  const getJobsForDay = (day: number) => {
    return jobs.filter(job => {
      const d = new Date(job.deliveryDate);
      return d.getDate() === day && d.getMonth() === month && d.getFullYear() === year;
    });
  };

  const isToday = (day: number) => {
    const today = new Date();
    return day === today.getDate() && month === today.getMonth() && year === today.getFullYear();
  };

  const getContrastColor = (hexColor: string) => {
    if (!hexColor) return '#FFFFFF';
    const r = parseInt(hexColor.substr(1, 2), 16);
    const g = parseInt(hexColor.substr(3, 2), 16);
    const b = parseInt(hexColor.substr(5, 2), 16);
    const yiq = ((r * 299) + (g * 587) + (b * 114)) / 1000;
    return (yiq >= 128) ? '#0f172a' : '#FFFFFF'; 
  };

  const renderCalendarGrid = () => {
    const days = [];
    for (let i = 0; i < firstDay; i++) {
      days.push(<div key={`empty-${i}`} className="h-24 md:h-32 bg-slate-50/50 border border-slate-100"></div>);
    }
    for (let day = 1; day <= daysInMonth; day++) {
      const dayJobs = getJobsForDay(day);
      const isSelected = selectedDay === day;
      const promisedCount = dayJobs.filter(j => j.isPromised).length;
      const normalCount = dayJobs.length - promisedCount;

      days.push(
        <div 
          key={day} 
          onClick={() => setSelectedDay(day)}
          className={`h-24 md:h-32 border border-slate-100 p-2 relative cursor-pointer transition-all hover:bg-blue-50/50 ${
             isSelected ? 'bg-blue-50 ring-2 ring-blue-500 ring-inset z-10' : 'bg-white'
          }`}
        >
          <div className={`text-sm font-bold mb-2 ${isToday(day) ? 'bg-blue-600 text-white w-7 h-7 rounded-full flex items-center justify-center shadow-lg shadow-blue-500/30' : 'text-slate-700'}`}>
            {day}
          </div>
          <div className="flex flex-col gap-1">
            {promisedCount > 0 && (
              <div className="bg-yellow-100 text-yellow-800 text-[10px] font-bold px-1.5 py-0.5 rounded-md border border-yellow-200 flex items-center gap-1 truncate">
                <Star size={8} fill="currentColor" />
                {promisedCount} VIPs
              </div>
            )}
            {normalCount > 0 && (
               <div className="bg-slate-100 text-slate-600 text-[10px] font-bold px-1.5 py-0.5 rounded-md border border-slate-200 truncate">
                 {normalCount} Normais
               </div>
            )}
          </div>
        </div>
      );
    }
    return days;
  };

  const selectedJobs = selectedDay ? getJobsForDay(selectedDay) : [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <CalendarIcon className="text-blue-500" />
            Calendário de Produção
          </h2>
          <p className="text-slate-500 text-sm">Visualize entregas e planeje o fluxo de trabalho.</p>
        </div>
        <div className="flex items-center gap-4 bg-white px-4 py-2 rounded-xl shadow-sm border border-slate-200">
          <button onClick={prevMonth} className="p-1 hover:bg-slate-100 rounded-full transition-colors"><ChevronLeft /></button>
          <span className="font-bold text-slate-800 w-32 text-center select-none">{monthNames[month]} {year}</span>
          <button onClick={nextMonth} className="p-1 hover:bg-slate-100 rounded-full transition-colors"><ChevronRight /></button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
           <div className="grid grid-cols-7 bg-slate-50 border-b border-slate-200">
              {['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'].map(d => (
                <div key={d} className="py-3 text-center text-xs font-bold text-slate-500 uppercase tracking-wider">{d}</div>
              ))}
           </div>
           <div className="grid grid-cols-7">
              {renderCalendarGrid()}
           </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 flex flex-col h-[600px]">
          <h3 className="font-bold text-lg text-slate-800 mb-4 flex items-center gap-2 pb-4 border-b border-slate-100">
             Entregas para dia {selectedDay}/{month + 1}
             <span className="bg-blue-100 text-blue-700 text-xs px-2 py-1 rounded-full ml-auto">{selectedJobs.length}</span>
          </h3>
          
          <div className="flex-1 overflow-y-auto space-y-3 pr-2 custom-scrollbar">
            {selectedJobs.length === 0 ? (
               <div className="text-center text-slate-400 mt-10">
                  <p>Nenhuma entrega agendada.</p>
               </div>
            ) : (
               selectedJobs.map(job => (
                 <div 
                    key={job.id} 
                    onClick={() => navigate(`/jobs/${job.id}`)}
                    className={`p-3 rounded-xl border cursor-pointer transition-all hover:shadow-md flex items-center gap-3 ${
                       job.isPromised ? 'bg-yellow-50 border-yellow-200' : 'bg-slate-50 border-slate-100'
                    }`}
                 >
                    {/* BOX NUMBER HIGHLIGHT */}
                    <div 
                        className="h-12 w-12 rounded-lg flex items-center justify-center shrink-0 shadow-sm border border-black/5"
                        style={{ backgroundColor: job.boxColor || '#94a3b8' }}
                    >
                        <span 
                            className="text-lg font-black leading-none drop-shadow-sm"
                            style={{ color: getContrastColor(job.boxColor || '#94a3b8') }}
                        >
                            {job.boxNumber || '?'}
                        </span>
                    </div>

                    <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-start mb-0.5">
                            <span className="font-bold text-slate-800 text-sm truncate pr-2">{job.patientName}</span>
                            {job.isFinished && <span className="text-[10px] bg-green-100 text-green-700 px-1.5 rounded font-bold">OK</span>}
                        </div>
                        <p className="text-xs text-slate-500 truncate mb-1">{job.prosthesisType}</p>
                        <div className="flex justify-between items-center text-[10px] font-medium text-slate-400">
                            <span>#{job.code}</span>
                            <span className="truncate max-w-[80px]">{job.dentistName}</span>
                        </div>
                    </div>
                 </div>
               ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductionCalendar;