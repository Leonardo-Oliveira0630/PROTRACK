
import React, { useState } from 'react';
import { UserCog, Plus, Trash2, User, Shield, Briefcase, Mail, AlertCircle, ChevronDown, Crown } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useApp } from '../store/AppContext';
import { UserRole } from '../types';

const Collaborators = () => {
  const { users, sectors, addUser, deleteUser, updateAnyUserSector, updateAnyUserRole } = useApp();
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    role: UserRole.COLLABORATOR,
    sectorId: ''
  });

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.email) return;
    
    addUser({
        name: formData.name,
        email: formData.email,
        role: formData.role,
        sectorId: formData.sectorId || undefined
    });

    setFormData({ name: '', email: '', role: UserRole.COLLABORATOR, sectorId: '' });
  };

  const handleSectorChange = async (userId: string, newSectorId: string) => {
      await updateAnyUserSector(userId, newSectorId);
  };

  const handleRoleChange = async (userId: string, newRole: UserRole) => {
      await updateAnyUserRole(userId, newRole);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-slate-900">Gerenciamento de Equipe</h2>
        <p className="text-slate-500 text-sm">Cadastre colaboradores e defina suas permissões (Admin, Gestor, Operador) e setores.</p>
      </div>

      {/* Add Form */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
        <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
            <Plus className="text-blue-500" size={18} />
            Pré-Cadastrar Novo Usuário
        </h3>
        <form onSubmit={handleAdd} className="grid grid-cols-1 md:grid-cols-2 gap-4 items-end">
            <div className="md:col-span-1">
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Nome Completo</label>
                <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                    <input 
                        type="text"
                        value={formData.name}
                        onChange={(e) => setFormData({...formData, name: e.target.value})}
                        placeholder="Ex: João da Silva"
                        className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 focus:ring-4 focus:ring-blue-50 focus:border-blue-500 outline-none transition-all"
                        required
                    />
                </div>
            </div>
            <div className="md:col-span-1">
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Email de Acesso</label>
                <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                    <input 
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData({...formData, email: e.target.value})}
                        placeholder="joao@lab.com"
                        className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 focus:ring-4 focus:ring-blue-50 focus:border-blue-500 outline-none transition-all"
                        required
                    />
                </div>
            </div>
            <div className="md:col-span-1">
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Função</label>
                <select 
                    value={formData.role}
                    onChange={(e) => setFormData({...formData, role: e.target.value as UserRole})}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-blue-500 outline-none bg-white"
                >
                    <option value={UserRole.COLLABORATOR}>Colaborador (Operador)</option>
                    <option value={UserRole.MANAGER}>Gestor (Gerente de Produção)</option>
                    <option value={UserRole.ADMIN}>Administrador (Acesso Total)</option>
                </select>
            </div>
            <div className="md:col-span-1">
                <label className="flex justify-between text-xs font-bold text-slate-500 uppercase mb-1">
                    Setor Inicial
                    {sectors.length === 0 && (
                        <Link to="/sectors" className="text-blue-500 hover:underline font-normal lowercase flex items-center gap-1">
                            <Plus size={10} /> criar setores
                        </Link>
                    )}
                </label>
                <select 
                    value={formData.sectorId}
                    onChange={(e) => setFormData({...formData, sectorId: e.target.value})}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-blue-500 outline-none bg-white"
                >
                    <option value="">{formData.role !== UserRole.COLLABORATOR ? 'Acesso Global (Opcional)' : 'Selecione um Setor...'}</option>
                    {sectors.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                </select>
            </div>
            <div className="md:col-span-2 mt-2">
                <button 
                    type="submit"
                    className="w-full px-6 py-3 bg-slate-900 text-white rounded-xl hover:bg-blue-600 font-bold transition-all shadow-lg shadow-slate-900/20 flex justify-center items-center gap-2"
                >
                    <Plus size={18} /> Salvar Pré-Cadastro
                </button>
                <p className="text-xs text-slate-400 mt-2 text-center">
                    O usuário deverá usar este email ao se cadastrar na tela de login para assumir estas permissões.
                </p>
            </div>
        </form>
      </div>

      {/* List */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex items-center gap-3">
            <div className="p-2 bg-purple-50 text-purple-600 rounded-lg"><UserCog size={20} /></div>
            <h3 className="font-bold text-slate-800">Quadro de Colaboradores</h3>
        </div>
        <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[600px]">
                <thead>
                    <tr className="bg-slate-50/80 border-b border-slate-200 text-xs uppercase text-slate-500 font-bold">
                        <th className="p-4 pl-6">Usuário / Email</th>
                        <th className="p-4">Permissão / Cargo</th>
                        <th className="p-4">Setor Atribuído</th>
                        <th className="p-4 text-right pr-6">Ações</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                    {users.map((user) => (
                        <tr key={user.id} className="hover:bg-slate-50 transition-colors">
                            <td className="p-4 pl-6">
                                <div className="flex items-center gap-3">
                                    <div className="h-9 w-9 rounded-full bg-gradient-to-br from-slate-200 to-slate-300 text-slate-600 flex items-center justify-center shrink-0">
                                        <User size={16} />
                                    </div>
                                    <div className="flex flex-col">
                                        <span className="font-bold text-slate-700">{user.name}</span>
                                        {user.email && <span className="text-xs text-slate-400">{user.email}</span>}
                                    </div>
                                </div>
                            </td>
                            <td className="p-4">
                                <div className="relative max-w-[180px]">
                                    <div className={`absolute left-2 top-1/2 -translate-y-1/2 pointer-events-none ${
                                        user.role === UserRole.ADMIN ? 'text-purple-600' : 
                                        user.role === UserRole.MANAGER ? 'text-amber-600' : 'text-blue-600'
                                    }`}>
                                        {user.role === UserRole.ADMIN ? <Shield size={14} /> : 
                                         user.role === UserRole.MANAGER ? <Crown size={14} /> : <Briefcase size={14} />}
                                    </div>
                                    <select 
                                        value={user.role}
                                        onChange={(e) => handleRoleChange(user.id, e.target.value as UserRole)}
                                        className={`w-full pl-8 pr-8 py-1.5 rounded-lg text-xs font-bold border appearance-none focus:outline-none focus:ring-2 focus:ring-blue-500/20 cursor-pointer transition-colors uppercase tracking-wide ${
                                            user.role === UserRole.ADMIN 
                                            ? 'bg-purple-50 border-purple-200 text-purple-700' 
                                            : user.role === UserRole.MANAGER
                                            ? 'bg-amber-50 border-amber-200 text-amber-700'
                                            : 'bg-blue-50 border-blue-200 text-blue-700'
                                        }`}
                                    >
                                        <option value={UserRole.COLLABORATOR}>Operador</option>
                                        <option value={UserRole.MANAGER}>Gestor</option>
                                        <option value={UserRole.ADMIN}>Admin</option>
                                    </select>
                                    <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={12} />
                                </div>
                            </td>
                            <td className="p-4 text-sm text-slate-600">
                                <div className="relative max-w-[200px]">
                                    <select 
                                        value={user.sectorId || ''}
                                        onChange={(e) => handleSectorChange(user.id, e.target.value)}
                                        className={`w-full pl-3 pr-8 py-1.5 rounded-lg text-sm font-medium border appearance-none focus:outline-none focus:ring-2 focus:ring-blue-500/20 cursor-pointer transition-colors ${
                                            user.sectorId 
                                            ? 'bg-white border-slate-200 text-slate-700 hover:border-blue-300' 
                                            : 'bg-slate-50 border-slate-200 text-slate-400 italic hover:bg-white'
                                        }`}
                                    >
                                        <option value="">Acesso Global / Sem Setor</option>
                                        {sectors.map(s => (
                                            <option key={s.id} value={s.id}>{s.name}</option>
                                        ))}
                                    </select>
                                    <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={14} />
                                </div>
                            </td>
                            <td className="p-4 pr-6 text-right">
                                <button 
                                    onClick={() => deleteUser(user.id)}
                                    className="p-2 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                                    title="Remover Usuário"
                                >
                                    <Trash2 size={18} />
                                </button>
                            </td>
                        </tr>
                    ))}
                    {users.length === 0 && (
                        <tr>
                            <td colSpan={4} className="p-8 text-center text-slate-400">
                                <div className="flex flex-col items-center gap-2">
                                    <AlertCircle size={24} />
                                    <p>Nenhum colaborador cadastrado.</p>
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

export default Collaborators;
