import React, { useState } from 'react';
import { Search, Filter, ChevronRight, Layers, CheckCircle, History, FileDown, Box, ScanBarcode, Calendar, User, X } from 'lucide-react';
import { useApp } from '../store/AppContext';
import { StatusBadge } from '../components/StatusBadge';
import { JobStatus, UrgencyLevel, UserRole } from '../types';
import { Link, useNavigate } from 'react-router-dom';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

const JobsList = () => {
  const { jobs, sectors, users, finishJob, currentUser, triggerManualScan } = useApp();
  const navigate = useNavigate();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('ALL');
  const [filterUrgency, setFilterUrgency] = useState<string>('ALL');
  const [filterSector, setFilterSector] = useState<string>('ALL');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [filterCollaborator, setFilterCollaborator] = useState<string>('ALL');

  const isManagement = currentUser?.role === UserRole.ADMIN || currentUser?.role === UserRole.MANAGER;

  // Helper function to determine text color based on background luminance
  const getContrastColor = (hexColor: string) => {
    if (!hexColor) return '#FFFFFF';
    
    // Convert hex to RGB
    const r = parseInt(hexColor.substr(1, 2), 16);
    const g = parseInt(hexColor.substr(3, 2), 16);
    const b = parseInt(hexColor.substr(5, 2), 16);
    
    // Calculate luminance (standard formula)
    const yiq = ((r * 299) + (g * 587) + (b * 114)) / 1000;
    
    // Return black for bright colors, white for dark colors
    return (yiq >= 128) ? '#0f172a' : '#FFFFFF'; // slate-900 or white
  };

  const filteredJobs = jobs.filter(job => {
    const matchesSearch = 
        job.description.toLowerCase().includes(searchTerm.toLowerCase()) || 
        job.code.includes(searchTerm) ||
        job.patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        job.dentistName?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = filterStatus === 'ALL' || job.status === filterStatus;
    const matchesUrgency = filterUrgency === 'ALL' || job.urgency === filterUrgency;
    const matchesSector = 
        filterSector === 'ALL' || 
        (filterSector === 'TRANSIT' ? job.currentSectorId === null : job.currentSectorId === filterSector);

    let matchesDate = true;
    if (startDate) {
        const jobDate = new Date(job.createdAt).setHours(0,0,0,0);
        const start = new Date(startDate).setHours(0,0,0,0);
        if (jobDate < start) matchesDate = false;
    }
    if (endDate) {
        const jobDate = new Date(job.createdAt).setHours(0,0,0,0);
        const end = new Date(endDate).setHours(23,59,59,999);
        if (jobDate > end) matchesDate = false;
    }

    let matchesCollaborator = true;
    if (filterCollaborator !== 'ALL') {
        const hasWorkedOnJob = job.history.some(h => h.userId === filterCollaborator);
        if (!hasWorkedOnJob) matchesCollaborator = false;
    }

    return matchesSearch && matchesStatus && matchesUrgency && matchesSector && matchesDate && matchesCollaborator;
  });

  const getSectorName = (id: string | null) => {
      if (!id) return "Em Trânsito / Transporte";
      return sectors.find(s => s.id === id)?.name || "Desconhecido";
  };

  const handleFinish = (e: React.MouseEvent, jobId: string) => {
      e.stopPropagation();
      finishJob(jobId);
  };

  const handleManualScan = (e: React.MouseEvent, code: string) => {
      e.stopPropagation();
      triggerManualScan(code);
  };

  const clearFilters = () => {
      setSearchTerm('');
      setFilterStatus('ALL');
      setFilterUrgency('ALL');
      setFilterSector('ALL');
      setStartDate('');
      setEndDate('');
      setFilterCollaborator('ALL');
  };

  const handleExportPDF = () => {
    const doc = new jsPDF();
    doc.setFillColor(15, 23, 42);
    doc.rect(0, 0, 210, 40, 'F');
    doc.setFontSize(22);
    doc.setTextColor(255, 255, 255);
    doc.text("Relatório de Produção", 14, 20);
    doc.setFontSize(10);
    doc.setTextColor(148, 163, 184);
    doc.text(`Gerado em: ${new Date().toLocaleString()}`, 14, 28);
    doc.text(`Solicitado por: ${currentUser?.name || 'Usuário'}`, 14, 34);

    const tableColumn = ["Caixa", "OS/Cod", "Paciente", "Trabalho", "Setor Atual", "Status", "Entrega"];
    const tableRows = filteredJobs.map(job => [
        job.boxNumber || '-',
        job.code,
        job.patientName,
        job.prosthesisType,
        getSectorName(job.currentSectorId),
        job.status,
        new Date(job.deliveryDate).toLocaleDateString()
    ]);

    autoTable(doc, {
        head: [tableColumn],
        body: tableRows,
        startY: 45,
        theme: 'grid',
        headStyles: { fillColor: [37, 99, 235], textColor: 255, fontStyle: 'bold' },
        styles: { fontSize: 8, cellPadding: 3 },
        alternateRowStyles: { fillColor: [241, 245, 249] },
    });

    doc.save('relatorio-producao-protrack.pdf');
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
            <h2 className="text-2xl font-bold text-slate-900">Lista de Casos</h2>
            <p className="text-slate-500 text-sm">Gerencie todos os trabalhos do laboratório</p>
        </div>
        <button 
            onClick={handleExportPDF}
            className="flex items-center justify-center gap-2 bg-slate-900 text-white px-4 py-2.5 rounded-xl hover:bg-slate-800 transition-colors font-bold text-sm shadow-lg shadow-slate-900/10 w-full lg:w-auto"
        >
            <FileDown size={18} />
            Exportar Relatório PDF
        </button>
      </div>

      <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200 space-y-4">
        <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                <input 
                    type="text" 
                    placeholder="Buscar por paciente, dentista, código, caixa..." 
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all text-sm"
                />
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                <select 
                    value={filterSector}
                    onChange={(e) => setFilterSector(e.target.value)}
                    className="px-4 py-2.5 rounded-xl border border-slate-200 focus:border-blue-500 outline-none bg-white text-slate-700 text-sm font-medium"
                >
                    <option value="ALL">Todos os Setores</option>
                    <option value="TRANSIT">Em Trânsito</option>
                    {sectors.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                </select>
                <select 
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                    className="px-4 py-2.5 rounded-xl border border-slate-200 focus:border-blue-500 outline-none bg-white text-slate-700 text-sm font-medium"
                >
                    <option value="ALL">Todos Status</option>
                    {Object.values(JobStatus).map(s => <option key={s} value={s}>{s}</option>)}
                </select>
                <select 
                    value={filterUrgency}
                    onChange={(e) => setFilterUrgency(e.target.value)}
                    className="px-4 py-2.5 rounded-xl border border-slate-200 focus:border-blue-500 outline-none bg-white text-slate-700 text-sm font-medium col-span-2 md:col-span-1"
                >
                    <option value="ALL">Todas Urgências</option>
                    {Object.values(UrgencyLevel).map(u => <option key={u} value={u}>{u}</option>)}
                </select>
            </div>
        </div>
        
        <div className="flex flex-col md:flex-row gap-4 pt-4 border-t border-slate-100 items-end">
            <div className="flex gap-2 items-center flex-1 w-full">
                <div className="flex-1">
                    <label className="text-xs font-bold text-slate-400 uppercase mb-1 block">De (Cadastro)</label>
                    <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm outline-none" />
                </div>
                <div className="flex-1">
                    <label className="text-xs font-bold text-slate-400 uppercase mb-1 block">Até</label>
                    <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm outline-none" />
                </div>
            </div>
            <button onClick={clearFilters} className="px-4 py-2 bg-slate-100 text-slate-600 hover:bg-slate-200 rounded-lg text-sm font-bold flex items-center gap-2 h-[38px]"><X size={16} /> Limpar</button>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[800px]">
                <thead>
                    <tr className="bg-slate-50/80 border-b border-slate-200">
                        <th className="p-5 font-bold text-slate-600 text-xs uppercase tracking-wider w-28">Caixa</th>
                        <th className="p-5 font-bold text-slate-600 text-xs uppercase tracking-wider">Caso / Paciente</th>
                        <th className="p-5 font-bold text-slate-600 text-xs uppercase tracking-wider">Trabalho</th>
                        <th className="p-5 font-bold text-slate-600 text-xs uppercase tracking-wider">Localização</th>
                        <th className="p-5 font-bold text-slate-600 text-xs uppercase tracking-wider">Status</th>
                        <th className="p-5 font-bold text-slate-600 text-xs uppercase tracking-wider">Entrega</th>
                        <th className="p-5 font-bold text-slate-600 text-xs uppercase tracking-wider text-right">Ações</th>
                    </tr>
                </thead>
                <tbody>
                    {filteredJobs.map(job => (
                        <tr 
                            key={job.id} 
                            onClick={() => navigate(`/jobs/${job.id}`)}
                            className="border-b border-slate-100 hover:bg-blue-50/30 transition-colors cursor-pointer group"
                        >
                            <td className="p-5">
                                <div 
                                    className="h-14 w-16 rounded-lg flex flex-col items-center justify-center shadow-sm border border-white/20 relative overflow-hidden group-hover:scale-105 transition-transform"
                                    style={{ backgroundColor: job.boxColor || '#94a3b8' }}
                                >
                                    <span 
                                      className="text-[10px] uppercase font-bold tracking-widest"
                                      style={{ color: getContrastColor(job.boxColor || '#94a3b8'), opacity: 0.8 }}
                                    >CX</span>
                                    <span 
                                      className="text-2xl font-black leading-none drop-shadow-sm"
                                      style={{ color: getContrastColor(job.boxColor || '#94a3b8') }}
                                    >{job.boxNumber || '?'}</span>
                                </div>
                            </td>
                            <td className="p-5">
                                <div className="font-bold text-slate-900 group-hover:text-blue-700 transition-colors text-base">
                                    {job.patientName}
                                </div>
                                <div className="text-xs text-slate-500 font-medium mt-1 flex items-center gap-1">
                                    <User size={10} /> {job.dentistName || 'Sem dentista'}
                                    <span className="bg-slate-100 px-1 rounded text-[10px] font-mono ml-1">#{job.code}</span>
                                </div>
                            </td>
                            <td className="p-5">
                                <div className="font-bold text-slate-800 text-sm">{job.prosthesisType}</div>
                                <div className="text-xs text-slate-500 max-w-[180px] truncate mt-0.5">{job.description}</div>
                            </td>
                            <td className="p-5">
                                <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold border ${
                                    job.currentSectorId 
                                    ? 'bg-white border-slate-200 text-slate-700' 
                                    : 'bg-amber-50 border-amber-200 text-amber-700'
                                }`}>
                                    <div className={`w-1.5 h-1.5 rounded-full ${job.currentSectorId ? 'bg-green-500' : 'bg-amber-500 animate-pulse'}`}></div>
                                    {getSectorName(job.currentSectorId)}
                                </div>
                            </td>
                            <td className="p-5">
                                <div className="flex flex-col gap-1 items-start">
                                    <StatusBadge status={job.status} />
                                    <StatusBadge urgency={job.urgency} />
                                </div>
                            </td>
                            <td className="p-5 text-sm text-slate-600 font-bold">
                                {new Date(job.deliveryDate).toLocaleDateString()}
                            </td>
                            <td className="p-5">
                                <div className="flex items-center justify-end gap-2">
                                    {!job.isFinished && (
                                        <button 
                                            onClick={(e) => handleManualScan(e, job.code)}
                                            className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                            title="Movimentar"
                                        >
                                            <ScanBarcode size={18} />
                                        </button>
                                    )}
                                    <div className="p-2 text-slate-300 group-hover:text-blue-500 transition-colors">
                                        <ChevronRight size={18} />
                                    </div>
                                </div>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
      </div>
    </div>
  );
};

export default JobsList;