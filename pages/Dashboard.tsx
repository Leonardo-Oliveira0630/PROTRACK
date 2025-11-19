import React, { useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Sparkles, AlertCircle, Clock, CheckCircle, Activity } from 'lucide-react';
import { useApp } from '../store/AppContext';
import { generateProductionInsights } from '../services/geminiService';
import { JobStatus, UrgencyLevel } from '../types';

const Dashboard = () => {
  const { jobs, sectors } = useApp();
  const [insights, setInsights] = useState<string[]>([]);
  const [loadingInsights, setLoadingInsights] = useState(false);

  // Stats Calculation
  const totalJobs = jobs.length;
  const lateJobs = jobs.filter(j => j.status === JobStatus.LATE).length;
  const urgentJobs = jobs.filter(j => j.urgency === UrgencyLevel.HIGH && !j.isFinished).length;
  const completedJobs = jobs.filter(j => j.status === JobStatus.COMPLETED).length;

  // Prepare chart data
  const sectorData = sectors.map(sector => ({
    name: sector.name.split(' ')[0], // Shorten name for chart
    full: sector.name,
    count: jobs.filter(j => j.currentSectorId === sector.id).length
  }));

  // Add "Transit"
  const inTransitCount = jobs.filter(j => j.currentSectorId === null && !j.isFinished).length;
  if (inTransitCount > 0) {
      sectorData.push({ name: 'Trânsito', full: 'Em Trânsito', count: inTransitCount });
  }

  const urgencyData = [
    { name: 'Alta', value: jobs.filter(j => j.urgency === UrgencyLevel.HIGH).length },
    { name: 'Média', value: jobs.filter(j => j.urgency === UrgencyLevel.MEDIUM).length },
    { name: 'Baixa', value: jobs.filter(j => j.urgency === UrgencyLevel.LOW).length },
  ];

  const COLORS = ['#ef4444', '#f59e0b', '#10b981'];

  const handleGenerateInsights = async () => {
    setLoadingInsights(true);
    const result = await generateProductionInsights(jobs, sectors);
    setInsights(result);
    setLoadingInsights(false);
  };

  return (
    <div className="space-y-6">
      
      <div className="flex items-center justify-between mb-2">
        <h2 className="text-2xl font-bold text-slate-900">Painel de Controle</h2>
        <span className="text-sm text-slate-500 bg-white px-3 py-1 rounded-full border border-slate-200">
            Atualizado em tempo real
        </span>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-4">
                <div className="p-2 bg-blue-50 text-blue-600 rounded-lg"><Activity size={20} /></div>
                <span className="text-xs font-bold text-slate-400 uppercase">Volume</span>
            </div>
            <p className="text-3xl font-bold text-slate-900">{totalJobs}</p>
            <p className="text-sm text-slate-500 mt-1">Casos em sistema</p>
        </div>
        
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-4">
                <div className="p-2 bg-red-50 text-red-600 rounded-lg"><AlertCircle size={20} /></div>
                <span className="text-xs font-bold text-slate-400 uppercase">Atenção</span>
            </div>
            <p className="text-3xl font-bold text-slate-900">{lateJobs}</p>
            <p className="text-sm text-slate-500 mt-1">Casos atrasados</p>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-4">
                <div className="p-2 bg-purple-50 text-purple-600 rounded-lg"><Sparkles size={20} /></div>
                <span className="text-xs font-bold text-slate-400 uppercase">Prioridade</span>
            </div>
            <p className="text-3xl font-bold text-slate-900">{urgentJobs}</p>
            <p className="text-sm text-slate-500 mt-1">Urgências ativas</p>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-4">
                <div className="p-2 bg-green-50 text-green-600 rounded-lg"><CheckCircle size={20} /></div>
                <span className="text-xs font-bold text-slate-400 uppercase">Entrega</span>
            </div>
            <p className="text-3xl font-bold text-slate-900">{completedJobs}</p>
            <p className="text-sm text-slate-500 mt-1">Casos finalizados</p>
        </div>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Sector Distribution */}
        <div className="lg:col-span-2 bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
            <h3 className="text-lg font-bold text-slate-800 mb-6">Carga por Setor</h3>
            <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={sectorData} margin={{ top: 20, right: 30, left: 0, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                        <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} dy={10} />
                        <YAxis axisLine={false} tickLine={false} allowDecimals={false} tick={{fill: '#64748b', fontSize: 12}} />
                        <Tooltip 
                            cursor={{fill: '#f8fafc'}}
                            contentStyle={{borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)'}} 
                            labelStyle={{fontWeight: 'bold', color: '#1e293b'}}
                        />
                        <Bar dataKey="count" fill="#3b82f6" radius={[6, 6, 0, 0]} barSize={50}>
                            {sectorData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={entry.name === 'Trânsito' ? '#cbd5e1' : '#3b82f6'} />
                            ))}
                        </Bar>
                    </BarChart>
                </ResponsiveContainer>
            </div>
        </div>

        {/* Urgency Pie Chart */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
            <h3 className="text-lg font-bold text-slate-800 mb-2">Urgência de Casos</h3>
            <p className="text-sm text-slate-500 mb-6">Distribuição baseada na data de entrega</p>
            <div className="h-56 flex items-center justify-center relative">
                <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                        <Pie
                            data={urgencyData}
                            cx="50%"
                            cy="50%"
                            innerRadius={60}
                            outerRadius={80}
                            paddingAngle={5}
                            dataKey="value"
                        >
                            {urgencyData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} strokeWidth={0} />
                            ))}
                        </Pie>
                        <Tooltip contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}} />
                    </PieChart>
                </ResponsiveContainer>
                {/* Center Text */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-center">
                    <span className="text-3xl font-bold text-slate-800">{totalJobs}</span>
                    <p className="text-xs text-slate-400 uppercase font-bold">Total</p>
                </div>
            </div>
            <div className="flex justify-center gap-4 mt-4">
                {urgencyData.map((entry, index) => (
                    <div key={entry.name} className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full" style={{backgroundColor: COLORS[index]}}></div>
                        <span className="text-xs text-slate-600 font-medium">{entry.name}</span>
                    </div>
                ))}
            </div>
        </div>
      </div>

      {/* Gemini AI Insights */}
      <div className="bg-gradient-to-r from-indigo-600 to-purple-700 text-white p-8 rounded-2xl shadow-lg relative overflow-hidden">
        <div className="absolute top-0 right-0 p-40 bg-white opacity-10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
        
        <div className="relative z-10">
            <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4">
                <div>
                    <div className="flex items-center gap-2 mb-1">
                        <Sparkles className="text-yellow-300 w-5 h-5" />
                        <span className="text-yellow-300 font-bold uppercase tracking-wider text-xs">ProTrack AI</span>
                    </div>
                    <h3 className="text-2xl font-bold">Análise de Fluxo Digital</h3>
                </div>
                <button 
                    onClick={handleGenerateInsights}
                    disabled={loadingInsights}
                    className="px-6 py-3 bg-white text-indigo-700 hover:bg-indigo-50 rounded-xl text-sm font-bold transition-all shadow-lg shadow-indigo-900/20 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {loadingInsights ? 'Analisando Fluxo...' : 'Gerar Relatório Inteligente'}
                </button>
            </div>

            {insights.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 animate-in fade-in slide-in-from-bottom-4">
                    {insights.map((insight, idx) => (
                        <div key={idx} className="bg-white/10 backdrop-blur-md p-5 rounded-xl border border-white/10 hover:bg-white/15 transition-colors">
                            <p className="text-sm leading-relaxed text-white/90 font-medium">{insight}</p>
                        </div>
                    ))}
                </div>
            ) : (
                <p className="text-indigo-100 text-sm max-w-2xl">
                    Utilize a IA para identificar gargalos na fresagem, atrasos no CAD ou sugerir priorização de casos com base nos prazos de entrega e capacidade atual dos setores.
                </p>
            )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;