
import React, { useState } from 'react';
import { Stethoscope, Plus, Trash2, AlertCircle, Mail, Phone, Building2 } from 'lucide-react';
import { useApp } from '../store/AppContext';

const Dentists = () => {
  const { dentists, addDentist, deleteDentist } = useApp();
  const [formData, setFormData] = useState({
    name: '',
    clinicName: '',
    email: '',
    phone: ''
  });

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.name.trim()) {
      await addDentist(formData);
      setFormData({ name: '', clinicName: '', email: '', phone: '' });
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-slate-900">Cadastro de Dentistas</h2>
        <p className="text-slate-500 text-sm">Gerencie a lista de parceiros e clínicas.</p>
      </div>

      {/* Add Form */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
        <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
            <Plus className="text-blue-500" size={18} />
            Adicionar Novo Dentista
        </h3>
        <form onSubmit={handleAdd} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input 
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                placeholder="Nome do Dentista *"
                className="px-4 py-3 rounded-xl border border-slate-200 focus:ring-4 focus:ring-blue-50 focus:border-blue-500 outline-none transition-all"
                required
            />
            <input 
                type="text"
                value={formData.clinicName}
                onChange={(e) => setFormData({...formData, clinicName: e.target.value})}
                placeholder="Nome da Clínica"
                className="px-4 py-3 rounded-xl border border-slate-200 focus:ring-4 focus:ring-blue-50 focus:border-blue-500 outline-none transition-all"
            />
            <input 
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
                placeholder="Email (opcional)"
                className="px-4 py-3 rounded-xl border border-slate-200 focus:ring-4 focus:ring-blue-50 focus:border-blue-500 outline-none transition-all"
            />
            <input 
                type="text"
                value={formData.phone}
                onChange={(e) => setFormData({...formData, phone: e.target.value})}
                placeholder="Telefone (opcional)"
                className="px-4 py-3 rounded-xl border border-slate-200 focus:ring-4 focus:ring-blue-50 focus:border-blue-500 outline-none transition-all"
            />
            <div className="md:col-span-2 flex justify-end">
                <button 
                    type="submit"
                    className="px-6 py-3 bg-slate-900 text-white rounded-xl hover:bg-blue-600 font-bold transition-all shadow-lg shadow-slate-900/20"
                >
                    Salvar Dentista
                </button>
            </div>
        </form>
      </div>

      {/* List */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex items-center gap-3">
            <div className="p-2 bg-blue-50 text-blue-600 rounded-lg"><Stethoscope size={20} /></div>
            <h3 className="font-bold text-slate-800">Dentistas Cadastrados</h3>
        </div>
        <div className="divide-y divide-slate-100">
            {dentists.map((d) => (
                <div key={d.id} className="p-5 flex items-center justify-between hover:bg-slate-50 transition-colors">
                    <div className="flex flex-col md:flex-row md:items-center gap-4">
                        <div className="h-10 w-10 rounded-full bg-slate-100 text-slate-500 flex items-center justify-center font-bold">
                            {d.name.charAt(0)}
                        </div>
                        <div>
                            <p className="font-bold text-slate-800">{d.name}</p>
                            {d.clinicName && (
                                <div className="flex items-center gap-1 text-xs text-slate-500">
                                    <Building2 size={12} /> {d.clinicName}
                                </div>
                            )}
                        </div>
                        {(d.email || d.phone) && (
                            <div className="flex gap-3 text-xs text-slate-400 md:ml-4">
                                {d.email && <span className="flex items-center gap-1"><Mail size={12} /> {d.email}</span>}
                                {d.phone && <span className="flex items-center gap-1"><Phone size={12} /> {d.phone}</span>}
                            </div>
                        )}
                    </div>
                    <button 
                        onClick={() => deleteDentist(d.id)}
                        className="p-2 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                    >
                        <Trash2 size={18} />
                    </button>
                </div>
            ))}
            {dentists.length === 0 && (
                <div className="p-8 text-center text-slate-400 flex flex-col items-center gap-2">
                    <AlertCircle size={32} />
                    <p>Nenhum dentista cadastrado.</p>
                </div>
            )}
        </div>
      </div>
    </div>
  );
};

export default Dentists;
