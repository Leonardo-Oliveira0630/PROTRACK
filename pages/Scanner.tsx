
import React from 'react';
import { ScanBarcode, Keyboard } from 'lucide-react';
import { useApp } from '../store/AppContext';

const Scanner = () => {
  const { currentUser } = useApp();

  return (
    <div className="min-h-[50vh] h-full flex flex-col items-center justify-center text-center py-8">
      <div className="bg-white p-8 md:p-12 rounded-3xl shadow-xl border border-slate-200 max-w-2xl w-full relative overflow-hidden">
        {/* Background decoration */}
        <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500"></div>
        
        <div className="mb-8 inline-flex p-6 bg-blue-50 text-blue-600 rounded-full ring-8 ring-blue-50/50 animate-pulse">
          <ScanBarcode size={64} />
        </div>

        <h2 className="text-2xl md:text-3xl font-bold text-slate-900 mb-4">Modo de Leitura Ativo</h2>
        <p className="text-slate-500 text-base md:text-lg max-w-md mx-auto mb-8">
          O sistema está pronto para ler códigos de barras. Você pode realizar a leitura em <strong>qualquer tela</strong> do sistema.
        </p>

        <div className="bg-slate-50 p-6 rounded-xl border border-slate-100 inline-block text-left w-full md:w-auto">
          <h3 className="text-sm font-bold text-slate-700 uppercase mb-4 tracking-wider flex items-center gap-2">
            <Keyboard size={16} />
            Status do Operador
          </h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between gap-8">
              <span className="text-slate-500">Operador:</span>
              <span className="font-bold text-slate-900">{currentUser?.name || 'Não logado'}</span>
            </div>
            <div className="flex justify-between gap-8">
              <span className="text-slate-500">Permissão:</span>
              <span className="font-bold text-slate-900">{currentUser?.role}</span>
            </div>
            <div className="flex justify-between gap-8">
              <span className="text-slate-500">Setor Atual:</span>
              <span className="font-bold text-blue-600">
                 {/* Logic to find sector name would require looking up sectorId in sectors list, simplified here */}
                 {currentUser?.sectorId ? 'Setor Vinculado' : 'Acesso Global'}
              </span>
            </div>
          </div>
        </div>
        
        <div className="mt-8 text-xs text-slate-400 font-mono">
          Listening for USB Barcode Scanner Input...
        </div>
      </div>
    </div>
  );
};

export default Scanner;
