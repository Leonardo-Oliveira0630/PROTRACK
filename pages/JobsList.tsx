
import React, { useState } from 'react';
import { Search, Filter, ChevronRight, Layers, CheckCircle, History, FileDown } from 'lucide-react';
import { useApp } from '../store/AppContext';
import { StatusBadge } from '../components/StatusBadge';
import { JobStatus, UrgencyLevel } from '../types';
import { Link, useNavigate } from 'react-router-dom';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

const JobsList = () => {
  const { jobs, sectors, finishJob, currentUser } = useApp();
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('ALL');
  const [filterUrgency, setFilterUrgency] = useState<string>('ALL');
  const [filterSector, setFilterSector] = useState<string>('ALL');

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

    return matchesSearch && matchesStatus && matchesUrgency && matchesSector;
  });

  const getSectorName = (id: string | null) => {
      if (!id) return "Em Trânsito / Transporte";
      return sectors.find(s => s.id === id)?.name || "Desconhecido";
  };

  const handleFinish = (e: React.MouseEvent, jobId: string) => {
      e.stopPropagation();
      finishJob(jobId);
  };

  const handleExportPDF = () => {
    const doc = new jsPDF();

    // Header
    doc.setFillColor(15, 23, 42); // Slate 900
    doc.rect(0, 0, 210, 40, 'F');
    
    doc.setFontSize(22);
    doc.setTextColor(255, 255, 255);
    doc.text("Relatório de Produção", 14, 20);
    
    doc.setFontSize(10);
    doc.setTextColor(148, 163, 184); // Slate 400
    doc.text(`Gerado em: ${new Date().toLocaleString()}`, 14, 28);
    doc.text(`Solicitado por: ${currentUser?.name || 'Usuário'}`, 14, 34);

    // Table Data
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

    // Generate Table
    autoTable(doc, {
        head: [tableColumn],
        body: tableRows,
        startY: 45,
        theme: 'grid',
        headStyles: { fillColor: [37, 99, 235], textColor: 255, fontStyle: 'bold' }, // Blue 600
        styles: { fontSize: 8, cellPadding: 3 },
        alternateRowStyles: { fillColor: [241, 245, 249] }, // Slate 100
    });

    // Footer Stats
    const finalY = (doc as any).lastAutoTable.finalY + 10;
    doc.setFontSize(10);
    doc.setTextColor(0, 0, 0);
    doc.text(`Total de registros listados: ${filteredJobs.length}`, 14, finalY);

    doc.save('relatorio-producao-protrack.pdf');
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
            <h2 className="text-2xl font-bold text-slate-900">Lista de Casos</h2>
            <p className="text-slate-500 text-sm">Gerencie todos os trabalhos do laboratório</p>
        </div>
        <button 
            onClick={handleExportPDF}
            className="flex items-center gap-2 bg-slate-900 text-white px-4 py-2.5 rounded-xl hover:bg-slate-800 transition-colors font-bold text-sm shadow-lg shadow-slate-900/10"
        >
            <FileDown size={18} />
            Exportar Relatório PDF
        </button>
      </div>

      {/* Filters Area */}
      <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200 flex flex-col lg:flex-row gap-4">
        
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

        <div className="flex flex-wrap gap-3">
            
            <div className="relative min-w-[180px]">
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
                className="px-4 py-2.5 rounded-xl border border-slate-200 focus:border-blue-500 outline-none bg-white text-slate-700 cursor-pointer text-sm font-medium"
            >
                <option value="ALL">Todas Urgências</option>
                {Object.values(UrgencyLevel).map(u => <option key={u} value={u}>{u}</option>)}
            </select>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
                <thead>
                    <tr className="bg-slate-50/80 border-b border-slate-200">
                        <th className="p-5 font-bold text-slate-600 text-xs uppercase tracking-wider">Caso / Dentista</th>
                        <th className="p-5 font-bold text-slate-600 text-xs uppercase tracking-wider">Tipo de Trabalho</th>
                        <th className="p-5 font-bold text-slate-600 text-xs uppercase tracking-wider">Localização Atual</th>
                        <th className="p-5 font-bold text-slate-600 text-xs uppercase tracking-wider">Status</th>
                        <th className="p-5 font-bold text-slate-600 text-xs uppercase tracking-wider">Entrega</th>
                        <th className="p-5 font-bold text-slate-600 text-xs uppercase tracking-wider w-20 text-right">Ações</th>
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
                                        <div className="font-bold text-slate-900 group-hover:text-blue-700 transition-colors">{job.patientName}</div>
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
                                        <button 
                                            onClick={(e) => handleFinish(e, job.id)}
                                            className="p-2 text-slate-400 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                                            title="Finalizar Trabalho"
                                        >
                                            <CheckCircle size={18} />
                                        </button>
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
