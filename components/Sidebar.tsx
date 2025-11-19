
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, Package, ScanBarcode, Users, LogOut, PlusCircle, Hexagon, Layers, UserCog, Star, CalendarDays, Stethoscope, FileText, Palette, Settings } from 'lucide-react';
import { useApp } from '../store/AppContext';
import { UserRole } from '../types';

const Sidebar = () => {
  const { pathname } = useLocation();
  const { currentUser, logout } = useApp();

  const isActive = (path: string) => pathname === path 
    ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-lg shadow-blue-900/50 border-l-4 border-white' 
    : 'text-slate-400 hover:bg-slate-800/50 hover:text-white border-l-4 border-transparent';

  const isManagement = currentUser?.role === UserRole.ADMIN || currentUser?.role === UserRole.MANAGER;

  return (
    <div className="h-screen w-64 bg-[#0f172a] flex flex-col fixed left-0 top-0 z-50 shadow-2xl transition-all duration-300 border-r border-slate-800/50">
      {/* Header with Tech Gradient Text */}
      <div className="p-8 border-b border-slate-800/50 bg-[#0f172a]">
        <h1 className="text-2xl font-bold text-white flex items-center gap-3 tracking-tight">
          <div className="relative">
             <Hexagon className="w-8 h-8 text-blue-500 fill-blue-500/20" />
             <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-[10px] font-bold text-blue-300">DL</span>
             </div>
          </div>
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-400 via-purple-400 to-white">
            ProTrack
          </span>
        </h1>
        <div className="mt-6 flex flex-col pl-1">
            <span className="text-[10px] text-slate-500 uppercase tracking-[0.2em] font-bold mb-1">
                {currentUser?.role === UserRole.ADMIN ? 'Administrador' : 
                 currentUser?.role === UserRole.MANAGER ? 'Gestor de Produção' : 'Operador Técnico'}
            </span>
            <span className="text-sm text-slate-200 font-medium truncate">
                {currentUser?.name}
            </span>
        </div>
      </div>

      <nav className="flex-1 px-4 py-6 space-y-3 overflow-y-auto no-scrollbar">
        <div className="px-4 pb-2 text-[10px] font-bold text-slate-600 uppercase tracking-widest">
            Controle de Produção
        </div>
        <Link to="/" className={`flex items-center gap-3 px-4 py-3 rounded-r-xl transition-all duration-200 font-medium text-sm ${isActive('/')}`}>
          <LayoutDashboard size={18} />
          <span>Visão Geral</span>
        </Link>

        <Link to="/scanner" className={`flex items-center gap-3 px-4 py-3 rounded-r-xl transition-all duration-200 font-medium text-sm ${isActive('/scanner')}`}>
          <ScanBarcode size={18} />
          <span>Leitor / Scanner</span>
        </Link>

        <Link to="/jobs" className={`flex items-center gap-3 px-4 py-3 rounded-r-xl transition-all duration-200 font-medium text-sm ${isActive('/jobs')}`}>
          <Package size={18} />
          <span>Lista de Casos</span>
        </Link>

        <Link to="/promised" className={`flex items-center gap-3 px-4 py-3 rounded-r-xl transition-all duration-200 font-medium text-sm ${isActive('/promised')}`}>
          <Star size={18} className={pathname === '/promised' ? 'text-yellow-300 fill-yellow-300/20' : 'text-slate-400'} />
          <span>Casos Prometidos</span>
        </Link>
        
        <Link to="/calendar" className={`flex items-center gap-3 px-4 py-3 rounded-r-xl transition-all duration-200 font-medium text-sm ${isActive('/calendar')}`}>
          <CalendarDays size={18} />
          <span>Calendário</span>
        </Link>

        {isManagement && (
          <>
            <div className="mt-8 px-4 pb-2 text-[10px] font-bold text-slate-600 uppercase tracking-widest">
                Gestão de Fluxo
            </div>
            <Link to="/create-job" className={`flex items-center gap-3 px-4 py-3 rounded-r-xl transition-all duration-200 font-medium text-sm ${isActive('/create-job')}`}>
              <PlusCircle size={18} />
              <span>Entrada de Caso</span>
            </Link>
            
            <div className="mt-4 px-4 pb-2 text-[10px] font-bold text-slate-600 uppercase tracking-widest">
                Cadastros
            </div>

            <Link to="/dentists" className={`flex items-center gap-3 px-4 py-3 rounded-r-xl transition-all duration-200 font-medium text-sm ${isActive('/dentists')}`}>
              <Stethoscope size={18} />
              <span>Dentistas</span>
            </Link>
            
            <Link to="/job-types" className={`flex items-center gap-3 px-4 py-3 rounded-r-xl transition-all duration-200 font-medium text-sm ${isActive('/job-types')}`}>
              <FileText size={18} />
              <span>Tipos de Trabalho</span>
            </Link>

            <Link to="/box-colors" className={`flex items-center gap-3 px-4 py-3 rounded-r-xl transition-all duration-200 font-medium text-sm ${isActive('/box-colors')}`}>
              <Palette size={18} />
              <span>Cores de Caixa</span>
            </Link>

            <Link to="/sectors" className={`flex items-center gap-3 px-4 py-3 rounded-r-xl transition-all duration-200 font-medium text-sm ${isActive('/sectors')}`}>
              <Layers size={18} />
              <span>Setores</span>
            </Link>
            <Link to="/collaborators" className={`flex items-center gap-3 px-4 py-3 rounded-r-xl transition-all duration-200 font-medium text-sm ${isActive('/collaborators')}`}>
              <UserCog size={18} />
              <span>Colaboradores</span>
            </Link>

            {currentUser?.role === UserRole.ADMIN && (
                <Link to="/admin" className={`flex items-center gap-3 px-4 py-3 rounded-r-xl transition-all duration-200 font-medium text-sm ${isActive('/admin')}`}>
                <Settings size={18} />
                <span>Configurações</span>
                </Link>
            )}
          </>
        )}
      </nav>

      <div className="p-4 border-t border-slate-800/50 bg-[#0f172a]">
        <button 
          onClick={logout}
          className="flex items-center gap-3 px-4 py-3 rounded-lg text-slate-400 hover:bg-red-950/30 hover:text-red-400 w-full transition-colors font-medium text-sm"
        >
          <LogOut size={18} />
          <span>Sair do Sistema</span>
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
