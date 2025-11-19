
import React, { useState } from 'react';
import { useApp } from '../store/AppContext';
import { Layers, ArrowRight, LogOut, AlertCircle, Loader2 } from 'lucide-react';

const SectorSelection = () => {
  const { sectors, currentUser, changeUserSector, logout } = useApp();
  const [selectedId, setSelectedId] = useState(currentUser?.sectorId || '');
  const [isLoading, setIsLoading] = useState(false);

  const handleConfirm = async () => {
    if (selectedId) {
      setIsLoading(true);
      try {
        await changeUserSector(selectedId);
      } catch (error) {
        console.error("Erro ao confirmar setor:", error);
      } finally {
        // Se falhar, o loading para. Se der certo, a rota muda e o loading não importa.
        setIsLoading(false);
      }
    }
  };

  if (!currentUser) return null;

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-6 relative overflow-hidden">
       {/* Background */}
       <div className="absolute top-0 left-0 w-full h-full">
          <div className="absolute top-[-20%] right-[-10%] w-[50%] h-[50%] bg-blue-600/10 rounded-full blur-[120px]"></div>
       </div>

       <div className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl z-10 overflow-hidden animate-in fade-in zoom-in-95 duration-300">
          
          <div className="p-8 border-b border-slate-100 text-center bg-slate-50">
             <div className="inline-flex items-center justify-center p-4 bg-white rounded-2xl shadow-sm mb-4">
                <Layers className="w-10 h-10 text-blue-600" />
             </div>
             <h1 className="text-2xl font-bold text-slate-900">Olá, {currentUser.name}!</h1>
             <p className="text-slate-500 text-lg mt-2">Em qual setor você vai trabalhar hoje?</p>
          </div>

          <div className="p-8">
             {sectors.length === 0 ? (
                 <div className="text-center py-10">
                     <AlertCircle className="mx-auto text-slate-300 mb-4" size={48} />
                     <p className="text-slate-500">Nenhum setor cadastrado no sistema.</p>
                     <p className="text-sm text-slate-400 mt-2">Peça ao administrador para configurar os setores.</p>
                 </div>
             ) : (
                 <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {sectors.map(sector => (
                        <button
                            key={sector.id}
                            onClick={() => setSelectedId(sector.id)}
                            className={`p-6 rounded-2xl border-2 text-left transition-all group hover:shadow-lg ${
                                selectedId === sector.id 
                                ? 'border-blue-500 bg-blue-50 ring-2 ring-blue-200' 
                                : 'border-slate-100 bg-white hover:border-blue-200'
                            }`}
                        >
                            <div className={`font-bold text-lg mb-1 ${selectedId === sector.id ? 'text-blue-700' : 'text-slate-800 group-hover:text-blue-600'}`}>
                                {sector.name}
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-xs text-slate-400 font-medium uppercase tracking-wider">Posto de Trabalho</span>
                                {selectedId === sector.id && <ArrowRight size={16} className="text-blue-500" />}
                            </div>
                        </button>
                    ))}
                 </div>
             )}

             <div className="mt-8 flex flex-col items-center gap-4">
                 <button 
                    onClick={handleConfirm}
                    disabled={!selectedId || isLoading}
                    className="w-full max-w-sm py-4 bg-slate-900 hover:bg-blue-600 text-white rounded-xl font-bold shadow-xl shadow-slate-900/10 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                 >
                    {isLoading ? (
                        <>
                            <Loader2 className="animate-spin" size={20} />
                            Entrando...
                        </>
                    ) : (
                        <>
                            Acessar Sistema <ArrowRight size={20} />
                        </>
                    )}
                 </button>
                 
                 <button 
                    onClick={logout}
                    className="text-slate-400 hover:text-red-500 text-sm font-medium flex items-center gap-2 transition-colors"
                 >
                    <LogOut size={14} /> Entrar com outra conta
                 </button>
             </div>
          </div>
       </div>
    </div>
  );
};

export default SectorSelection;
