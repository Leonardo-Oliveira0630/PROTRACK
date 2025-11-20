import React, { useState } from 'react';
import { FileText, Plus, Trash2, AlertCircle } from 'lucide-react';
import { useApp } from '../store/AppContext';

const JobTypes = () => {
  const { jobTypes, addJobType, deleteJobType } = useApp();
  const [name, setName] = useState('');

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim()) {
      await addJobType(name.trim());
      setName('');
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-slate-900">Tipos de Trabalho</h2>
        <p className="text-slate-500 text-sm">Cadastre os serviços oferecidos pelo laboratório (ex: Coroa, Lente, Protocolo).</p>
      </div>

      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
        <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
            <Plus className="text-purple-500" size={18} />
            Novo Tipo / Variação
        </h3>
        <form onSubmit={handleAdd} className="flex gap-4">
            <input 
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Nome do Serviço (Ex: Coroa Zircônia)"
                className="flex-1 px-4 py-3 rounded-xl border border-slate-200 focus:ring-4 focus:ring-purple-50 focus:border-purple-500 outline-none transition-all"
                required
            />
            <button 
                type="submit"
                className="px-6 py-3 bg-slate-900 text-white rounded-xl hover:bg-purple-600 font-bold transition-all shadow-lg shadow-slate-900/20"
            >
                Adicionar
            </button>
        </form>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex items-center gap-3">
            <div className="p-2 bg-purple-50 text-purple-600 rounded-lg"><FileText size={20} /></div>
            <h3 className="font-bold text-slate-800">Serviços Cadastrados</h3>
        </div>
        <div className="divide-y divide-slate-100">
            {jobTypes.map((t) => (
                <div key={t.id} className="p-5 flex items-center justify-between hover:bg-slate-50 transition-colors">
                    <div className="flex items-center gap-4">
                        <div className="h-8 w-8 rounded-full bg-purple-50 text-purple-600 flex items-center justify-center">
                            <FileText size={14} />
                        </div>
                        <p className="font-bold text-slate-800">{t.name}</p>
                    </div>
                    <button 
                        onClick={() => deleteJobType(t.id)}
                        className="p-2 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                    >
                        <Trash2 size={18} />
                    </button>
                </div>
            ))}
            {jobTypes.length === 0 && (
                <div className="p-8 text-center text-slate-400 flex flex-col items-center gap-2">
                    <AlertCircle size={32} />
                    <p>Nenhum tipo de trabalho cadastrado.</p>
                </div>
            )}
        </div>
      </div>
    </div>
  );
};

export default JobTypes;