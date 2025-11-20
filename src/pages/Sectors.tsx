import React, { useState } from 'react';
import { Layers, Plus, Trash2, AlertCircle } from 'lucide-react';
import { useApp } from '../store/AppContext';

const Sectors = () => {
  const { sectors, addSector, deleteSector } = useApp();
  const [newSectorName, setNewSectorName] = useState('');

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (newSectorName.trim()) {
      addSector(newSectorName.trim());
      setNewSectorName('');
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-slate-900">Gerenciamento de Setores</h2>
        <p className="text-slate-500 text-sm">Configure os setores físicos e lógicos do laboratório.</p>
      </div>

      {/* Add Form */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
        <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
            <Plus className="text-blue-500" size={18} />
            Adicionar Novo Setor
        </h3>
        <form onSubmit={handleAdd} className="flex gap-4">
            <input 
                type="text"
                value={newSectorName}
                onChange={(e) => setNewSectorName(e.target.value)}
                placeholder="Nome do Setor (Ex: Acabamento, CAD, Forno)"
                className="flex-1 px-4 py-3 rounded-xl border border-slate-200 focus:ring-4 focus:ring-blue-50 focus:border-blue-500 outline-none transition-all"
                required
            />
            <button 
                type="submit"
                className="px-6 py-3 bg-slate-900 text-white rounded-xl hover:bg-blue-600 font-bold transition-all shadow-lg shadow-slate-900/20"
            >
                Adicionar
            </button>
        </form>
      </div>

      {/* List */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex items-center gap-3">
            <div className="p-2 bg-blue-50 text-blue-600 rounded-lg"><Layers size={20} /></div>
            <h3 className="font-bold text-slate-800">Setores Ativos</h3>
        </div>
        <div className="divide-y divide-slate-100">
            {sectors.map((sector) => (
                <div key={sector.id} className="p-5 flex items-center justify-between hover:bg-slate-50 transition-colors">
                    <div className="flex items-center gap-4">
                        <div className="h-10 w-10 rounded-full bg-slate-100 text-slate-500 flex items-center justify-center text-xs font-bold">
                            ID
                        </div>
                        <div>
                            <p className="font-bold text-slate-800">{sector.name}</p>
                            <p className="text-xs text-slate-400 font-mono">#{sector.id}</p>
                        </div>
                    </div>
                    <button 
                        onClick={() => deleteSector(sector.id)}
                        className="p-2 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                        title="Remover Setor"
                    >
                        <Trash2 size={18} />
                    </button>
                </div>
            ))}
            {sectors.length === 0 && (
                <div className="p-8 text-center text-slate-400 flex flex-col items-center gap-2">
                    <AlertCircle size={32} />
                    <p>Nenhum setor cadastrado.</p>
                </div>
            )}
        </div>
      </div>
    </div>
  );
};

export default Sectors;