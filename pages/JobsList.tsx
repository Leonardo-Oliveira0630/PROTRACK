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
  
  // Existing Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('ALL');
  const [filterUrgency, setFilterUrgency] = useState<string>('ALL');
  const [filterSector, setFilterSector] = useState<string>('ALL');

  // New Filters
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [filterCollaborator, setFilterCollaborator] = useState<string>('ALL');

  const isManagement = currentUser?.role === UserRole.ADMIN || currentUser?.role === UserRole.MANAGER;

  const filteredJobs = jobs.filter(job => {
    // 1. Text Search
    const matchesSearch = 
        job.description.toLowerCase().includes(searchTerm.toLowerCase()) || 
        job.code.includes(searchTerm) ||
        job.patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        job.dentistName?.toLowerCase().includes(searchTerm.toLowerCase());

    // 2. Dropdown Filters
    const matchesStatus = filterStatus === 'ALL' || job.status === filterStatus;
    const matchesUrgency = filterUrgency === 'ALL' || job.urgency === filterUrgency;
    const matchesSector = 
        filterSector === 'ALL' || 
        (filterSector === 'TRANSIT' ? job.currentSectorId === null : job.currentSectorId === filterSector);

    // 3. Date Range Filter (Created At)
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

    // 4. Collaborator Filter (Check History)
    let matchesCollaborator = true;
    if (filterCollaborator !== 'ALL') {
        // Check if the selected user appears anywhere in the job history
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

    // Add Filter Info to PDF
    let filterText = "";
    if (startDate || endDate) filterText += `Período: ${startDate || 'Inicio'} até ${endDate || 'Fim'}. `;
    if (filterCollaborator !== 'ALL') {
        const user = users.find(u => u.id === filterCollaborator);
        filterText += `Colaborador: ${user?.name}. `;
    }
    if (filterText) {
        doc.text(`Filtros: ${filterText}`, 14, 39);
    }

    const tableColumn = ["OS/Cod", "Paciente", "Dentista", "Trabalho", "Setor Atual", "Status", "Entrega"];
    const tableRows = filteredJobs.map(job => [
        job.code,
        job.patientName,
        job.dentistName || '-',
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

    const finalY = (doc as any).lastAutoTable.finalY + 10;
    doc.setFontSize(10);
    doc.setTextColor(0, 0, 0);
    doc.text(`Total de registros listados: ${filteredJobs.length}`, 14, finalY);
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

      {/* Filters Container */}
      <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200 space-y-4">
        
        {/* Row 1: Search and Quick Selects */}
        <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                <input 
                    type="text" 
                    placeholder="Buscar por paciente, dentista, código..." 
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all text-sm"
                />
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                <div className="relative min-w-[160px]">
                    <Layers className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                    <select 
                        value={filterSector}
                        onChange={(e) => setFilterSector(e.target.value)}
                        className="w-full pl-10 pr-8 py-2.5 rounded-xl border border-slate-200 focus:border-blue-500 outline-none bg-white text-slate-700 cursor-pointer text-sm appearance-none font-medium"
                    >
                        <option value="ALL">Todos os Setores</option>
                        <option value="TRANSIT">Em Trânsito</option>
                        {sectors.map(s => (
                            <option key={s.id} value={s.id}>{s.name}</option>
                        ))}
                    </select>
                    <Filter className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-300 pointer-events-none" size={12} />
                </div>
                <select 
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                    className="px-4 py-2.5 rounded-xl border border-slate-200 focus:border-blue-500 outline-none bg-white text-slate-700 cursor-pointer text-sm font-medium"
                >
                    <option value="ALL">Todos Status</option>
                    {Object.values(JobStatus).map(s => <option key={s} value={s}>{s}</option>)}
                </select>
                <select 
                    value={filterUrgency}
                    onChange={(e) => setFilterUrgency(e.target.value)}
                    className="px-4 py-2.5 rounded-xl border border-slate-200 focus:border-blue-500 outline-none bg-white text-slate-700 cursor-pointer text-sm font-medium col-span-2 md:col-span-1"
                >
                    <option value="ALL">Todas Urgências</option>
                    {Object.values(UrgencyLevel).map(u => <option key={u} value={u}>{u}</option>)}
                </select>
            </div>
        </div>

        {/* Row 2: Advanced Filters (Dates & Collaborator) */}
        <div className="flex flex-col md:flex-row gap-4 pt-4 border-t border-slate-100 items-end">
            <div className="flex gap-2 items-center flex-1 w-full">
                <div className="flex-1">
                    <label className="text-xs font-bold text-slate-400 uppercase mb-1 block">De (Cadastro)</label>
                    <div className="relative">
                        <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                        <input 
                            type="date" 
                            value={startDate}
                            onChange={(e) => setStartDate(e.target.value)}
                            className="w-full pl-10 pr-2 py-2 rounded-lg border border-slate-200 text-sm focus:border-blue-500 outline-none"
                        />
                    </div>
                </div>
                <div className="flex-1">
                    <label className="text-xs font-bold text-slate-400 uppercase mb-1 block">Até</label>
                    <div className="relative">
                        <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                        <input 
                            type="date" 
                            value={endDate}
                            onChange={(e) => setEndDate(e.target.value)}
                            className="w-full pl-10 pr-2 py-2 rounded-lg border border-slate-200 text-sm focus:border-blue-500 outline-none"
                        />
                    </div>
                </div>
            </div>

            {isManagement && (
                <div className="flex-1 w-full">
                    <label className="text-xs font-bold text-slate-400 uppercase mb-1 block">Filtrar por Colaborador (Histórico)</label>
                    <div className="relative">
                        <User className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                        <select 
                            value={filterCollaborator}
                            onChange={(e) => setFilterCollaborator(e.target.value)}
                            className="w-full pl-10 pr-8 py-2 rounded-lg border border-slate-200 text-sm focus:border-blue-500 outline-none bg-white appearance-none"
                        >
                            <option value="ALL">Qualquer Colaborador</option>
                            {users.map(u => (
                                <option key={u.id} value={u.id}>{u.name}</option>
                            ))}
                        </select>
                        <ChevronRight className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-300 rotate-90 pointer-events-none" size={12} />
                    </div>
                </div>
            )}

            <button 
                onClick={clearFilters}
                className="px-4 py-2 bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-800 rounded-lg text-sm font-bold transition-colors flex items-center gap-2 whitespace-nowrap h-[38px]"
                title="Limpar todos os filtros"
            >
                <X size={16} /> Limpar
            </button>
        </div>
      </div>

      {/* Results Info */}
      <div className="flex justify-between items-center text-xs text-slate-400 px-2">
          <span>Exibindo {filteredJobs.length} resultados</span>
          {(startDate || endDate || filterCollaborator !== 'ALL') && (
              <span className="text-blue-500 font-medium">Filtros avançados ativos</span>
          )}
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[800px]">
                <thead>
                    <tr className="bg-slate-50/80 border-b border-slate-200">
                        <th className="p-5 font-bold text-slate-600 text-xs uppercase tracking-wider">Caso / Dentista</th>
                        <th className="p-5 font-bold text-slate-600 text-xs uppercase tracking-wider">Tipo de Trabalho</th>
                        <th className="p-5 font-bold text-slate-600 text-xs uppercase tracking-wider">Localização Atual</th>
                        <th className="p-5 font-bold text-slate-600 text-xs uppercase tracking-wider">Status</th>
                        <th className="p-5 font-bold text-slate-600 text-xs uppercase tracking-wider">Entrega</th>
                        <th className="p-5 font-bold text-slate-600 text-xs uppercase tracking-wider w-24 text-right">Ações</th>
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
                                <div className="flex items-center gap-3">
                                    <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-blue-100 to-blue-50 text-blue-700 flex items-center justify-center font-bold text-xs border border-blue-200 shadow-sm shrink-0">
                                        {job.code.slice(-3)}
                                    </div>
                                    <div>
                                        <div className="font-bold text-slate-900 group-hover:text-blue-700 transition-colors flex items-center gap-2">
                                            {job.patientName}
                                            {job.boxNumber && (
                                                <span 
                                                    className="text-[10px] px-1.5 py-0.5 rounded-md border flex items-center gap-1 shadow-sm"
                                                    style={{ 
                                                        backgroundColor: job.boxColor || '#f1f5f9', 
                                                        borderColor: 'rgba(0,0,0,0.1)', 
                                                        color: '#FFFFFF',
                                                        textShadow: '0px 1px 2px rgba(0,0,0,0.3)' 
                                                    }}
                                                >
                                                    <Box size={8} /> {job.boxNumber}
                                                </span>
                                            )}
                                        </div>
                                        <div className="text-xs text-slate-500 font-medium">
                                           {job.dentistName || 'Sem dentista'} • <span className="font-mono">#{job.code}</span>
                                        </div>
                                    </div>
                                </div>
                            </td>
                            <td className="p-5">
                                <div className="font-bold text-slate-800 text-sm">{job.prosthesisType}</div>
                                <div className="text-xs text-slate-500 max-w-[200px] truncate mt-0.5">{job.description}</div>
                            </td>
                            <td className="p-5 text-slate-700">
                                {job.isFinished ? (
                                    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold border shadow-sm bg-green-100 border-green-200 text-green-700">
                                        <CheckCircle size={12} /> Finalizado
                                    </span>
                                ) : (
                                    <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold border shadow-sm ${
                                        job.currentSectorId 
                                        ? 'bg-white border-slate-200 text-slate-700' 
                                        : 'bg-amber-50 border-amber-200 text-amber-700'
                                    }`}>
                                        <div className={`w-1.5 h-1.5 rounded-full ${job.currentSectorId ? 'bg-green-500' : 'bg-amber-500 animate-pulse'}`}></div>
                                        {getSectorName(job.currentSectorId)}
                                    </span>
                                )}
                            </td>
                            <td className="p-5">
                                <div className="flex flex-col gap-1.5 items-start">
                                    <StatusBadge status={job.status} />
                                    <StatusBadge urgency={job.urgency} />
                                </div>
                            </td>
                            <td className="p-5 text-sm text-slate-500 font-semibold">
                                {new Date(job.deliveryDate).toLocaleDateString()}
                            </td>
                            <td className="p-5">
                                <div className="flex items-center justify-end gap-2">
                                    {!job.isFinished && (
                                        <>
                                            <button 
                                                onClick={(e) => handleManualScan(e, job.code)}
                                                className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                                title="Movimentar Manualmente (Scan)"
                                            >
                                                <ScanBarcode size={18} />
                                            </button>
                                            <button 
                                                onClick={(e) => handleFinish(e, job.id)}
                                                className="p-2 text-slate-400 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                                                title="Finalizar Trabalho"
                                            >
                                                <CheckCircle size={18} />
                                            </button>
                                        </>
                                    )}
                                    <div className="p-2 text-slate-300 group-hover:text-blue-500 transition-colors">
                                        <History size={18} />
                                    </div>
                                </div>
                            </td>
                        </tr>
                    ))}
                    {filteredJobs.length === 0 && (
                        <tr>
                            <td colSpan={7} className="p-16 text-center">
                                <div className="flex flex-col items-center gap-3">
                                    <div className="p-4 bg-slate-50 rounded-full">
                                        <Search className="text-slate-300" size={32} />
                                    </div>
                                    <p className="text-slate-500 font-medium">Nenhum caso encontrado com os filtros atuais.</p>
                                    <button onClick={clearFilters} className="text-blue-500 text-sm hover:underline">
                                        Limpar filtros
                                    </button>
                                </div>
                            </td>
                        </tr>
                    )}
                </tbody>
            </table>
        </div>
      </div>
    </div>
  );
};

export default JobsList;