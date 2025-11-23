
import React from 'react';
import { BellRing, X, Clock, AlertCircle, CheckCircle2 } from 'lucide-react';
import { useApp } from '../store/AppContext';

const UrgencyAlertModal = () => {
  const { activeAlert, dismissAlert } = useApp();

  if (!activeAlert) return null;

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center bg-red-900/40 backdrop-blur-sm p-4 animate-in fade-in duration-300">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-300 border-2 border-red-500 relative">
        
        {/* Header */}
        <div className="bg-red-600 p-6 flex items-start justify-between">
            <div className="flex gap-3 items-center text-white">
                <div className="p-2 bg-red-500 rounded-lg shadow-sm animate-bounce">
                    <BellRing size={28} />
                </div>
                <div>
                    <h3 className="text-xl font-bold">Alerta de Urgência</h3>
                    <p className="text-red-100 text-xs font-medium">Mensagem da Gestão</p>
                </div>
            </div>
        </div>

        {/* Body */}
        <div className="p-6">
            <h4 className="text-xl font-bold text-slate-900 mb-3">{activeAlert.title}</h4>
            
            <div className="bg-red-50 p-4 rounded-xl border border-red-100 mb-4">
                <p className="text-red-900 font-medium leading-relaxed">
                    {activeAlert.message}
                </p>
            </div>

            <div className="flex flex-col gap-2 text-sm text-slate-500">
                <div className="flex items-center gap-2">
                    <Clock size={16} className="text-slate-400" />
                    <span>Disparado em: {new Date(activeAlert.targetDate).toLocaleString()}</span>
                </div>
                {activeAlert.jobId && (
                    <div className="flex items-center gap-2">
                        <AlertCircle size={16} className="text-slate-400" />
                        <span>Relativo ao caso: <span className="font-mono font-bold text-slate-700">#{activeAlert.jobId}</span></span>
                    </div>
                )}
            </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-100">
            <button 
                onClick={() => dismissAlert(activeAlert.id)}
                className="w-full py-3 bg-red-600 hover:bg-red-700 text-white rounded-xl font-bold shadow-lg shadow-red-900/20 transition-all flex items-center justify-center gap-2 active:scale-95"
            >
                <CheckCircle2 size={20} />
                Estou Ciente
            </button>
        </div>

      </div>
    </div>
  );
};

export default UrgencyAlertModal;
