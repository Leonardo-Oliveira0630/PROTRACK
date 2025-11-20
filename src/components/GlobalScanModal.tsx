import React, { useEffect, useRef } from 'react';
import { useApp } from '../store/AppContext';
import { ArrowRight, ArrowLeft, AlertTriangle, CheckCircle2, X, Package } from 'lucide-react';
import { JobStatus } from '../types';

const GlobalScanModal = () => {
  const { scanModalState, closeScanModal, confirmScanModal } = useApp();
  const { isOpen, analysis, code } = scanModalState;
  const confirmButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (isOpen) {
      // Focus confirm button when modal opens for quick "Enter" confirmation
      setTimeout(() => {
        confirmButtonRef.current?.focus();
      }, 100);
    }
  }, [isOpen]);

  if (!isOpen || !analysis) return null;

  const isEntry = analysis.action === 'ENTRY';
  const isExit = analysis.action === 'EXIT';
  const isError = analysis.action === 'ERROR';
  const isInfo = analysis.action === 'INFO';

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className={`p-6 flex justify-between items-start ${
          isError ? 'bg-red-50' : isEntry ? 'bg-green-50' : isExit ? 'bg-blue-50' : 'bg-slate-50'
        }`}>
          <div className="flex gap-4">
            <div className={`p-3 rounded-xl shadow-sm ${
              isError ? 'bg-red-100 text-red-600' : 
              isEntry ? 'bg-green-100 text-green-600' : 
              isExit ? 'bg-blue-100 text-blue-600' : 'bg-slate-100 text-slate-600'
            }`}>
              {isError && <AlertTriangle size={32} />}
              {isEntry && <ArrowRight size={32} />}
              {isExit && <ArrowLeft size={32} />}
              {isInfo && <Package size={32} />}
            </div>
            <div>
              <h3 className={`text-xl font-bold ${
                isError ? 'text-red-900' : 
                isEntry ? 'text-green-900' : 
                isExit ? 'text-blue-900' : 'text-slate-900'
              }`}>
                {isError ? 'Erro na Leitura' : 
                 isEntry ? 'Entrada de Material' : 
                 isExit ? 'Saída de Material' : 'Detalhes do Caso'}
              </h3>
              <p className="text-sm font-mono text-slate-500 mt-1 font-bold">#{code}</p>
            </div>
          </div>
          <button onClick={closeScanModal} className="text-slate-400 hover:text-slate-600 p-1 rounded-full hover:bg-white/50 transition-colors">
            <X size={24} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          {analysis.job ? (
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
              <div className="flex justify-between items-start mb-2">
                <span className="text-xs font-bold text-slate-400 uppercase">Paciente</span>
                <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                    analysis.job.status === JobStatus.LATE ? 'bg-red-100 text-red-700' : 'bg-slate-200 text-slate-600'
                }`}>
                    {analysis.job.status}
                </span>
              </div>
              <p className="text-lg font-bold text-slate-800">{analysis.job.patientName}</p>
              {analysis.job.dentistName && (
                 <p className="text-xs text-slate-500 font-medium">Dr(a). {analysis.job.dentistName}</p>
              )}
              <p className="text-sm text-slate-600 mt-2 border-t border-slate-200 pt-2">{analysis.job.prosthesisType}</p>
            </div>
          ) : null}

          <div className="text-center py-2">
             <p className="text-lg font-medium text-slate-700">{analysis.message}</p>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 bg-slate-50 border-t border-slate-100 flex gap-3">
          <button 
            onClick={closeScanModal}
            className="flex-1 py-3 px-4 rounded-xl text-slate-600 font-bold hover:bg-slate-200 transition-colors"
          >
            Cancelar (ESC)
          </button>
          
          {!isError && (
            <button 
              ref={confirmButtonRef}
              onClick={confirmScanModal}
              className={`flex-1 py-3 px-4 rounded-xl text-white font-bold shadow-lg transition-all transform active:scale-95 ${
                isEntry ? 'bg-green-600 hover:bg-green-700 shadow-green-900/20' : 
                isExit ? 'bg-blue-600 hover:bg-blue-700 shadow-blue-900/20' : 'bg-slate-800 hover:bg-slate-900'
              }`}
            >
              Confirmar (ENTER)
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default GlobalScanModal;