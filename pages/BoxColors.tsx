
import React, { useState } from 'react';
import { Package, Plus, Trash2, AlertCircle } from 'lucide-react';
import { useApp } from '../store/AppContext';

const BoxColors = () => {
  const { boxColors, addBoxColor, deleteBoxColor } = useApp();
  const [name, setName] = useState('');
  const [hex, setHex] = useState('#3b82f6');

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim()) {
      await addBoxColor(name.trim(), hex);
      setName('');
      setHex('#3b82f6');
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-slate-900">Cores de Caixa</h2>
        <p className="text-slate-500 text-sm">Gerencie as cores das caixas físicas usadas na produção.</p>
      </div>

      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
        <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
            <Plus className="text-green-500" size={18} />
            Nova Cor
        </h3>
        <form onSubmit={handleAdd} className="flex flex-col md:flex-row gap-4 items-end">
            <div className="flex-1 w-full">
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Nome da Cor</label>
                <input 
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Ex: Azul Principal"
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-4 focus:ring-green-50 focus:border-green-500 outline-none transition-all"
                    required
                />
            </div>
            <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Seletor</label>
                <div className="flex items-center gap-2 h-[50px] px-2 bg-white border border-slate-200 rounded-xl">
                    <input 
                        type="color"
                        value={hex}
                        onChange={(e) => setHex(e.target.value)}
                        className="w-10 h-8 cursor-pointer bg-transparent border-none"
                    />
                    <span className="text-xs font-mono text-slate-500 w-16">{hex}</span>
                </div>
            </div>
            <button 
                type="submit"
                className="px-6 py-3 bg-slate-900 text-white rounded-xl hover:bg-green-600 font-bold transition-all shadow-lg shadow-slate-900/20 w-full md:w-auto"
            >
                Adicionar
            </button>
        </form>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex items-center gap-3">
            <div className="p-2 bg-green-50 text-green-600 rounded-lg"><Package size={20} /></div>
            <h3 className="font-bold text-slate-800">Cores Disponíveis</h3>
        </div>
        <div className="divide-y divide-slate-100">
            {boxColors.map((c) => (
                <div key={c.id} className="p-5 flex items-center justify-between hover:bg-slate-50 transition-colors">
                    <div className="flex items-center gap-4">
                        <div className="h-8 w-8 rounded-full shadow-sm border border-slate-200" style={{ backgroundColor: c.hex }}></div>
                        <p className="font-bold text-slate-800">{c.name}</p>
                        <span className="text-xs text-slate-400 font-mono">{c.hex}</span>
                    </div>
                    <button 
                        onClick={() => deleteBoxColor(c.id)}
                        className="p-2 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                    >
                        <Trash2 size={18} />
                    </button>
                </div>
            ))}
            {boxColors.length === 0 && (
                <div className="p-8 text-center text-slate-400 flex flex-col items-center gap-2">
                    <AlertCircle size={32} />
                    <p>Nenhuma cor de caixa cadastrada.</p>
                </div>
            )}
        </div>
      </div>
    </div>
  );
};

export default BoxColors;
