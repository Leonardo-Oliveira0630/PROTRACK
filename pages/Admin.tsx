import React from 'react';
import { useApp } from '../store/AppContext';
import { UserRole } from '../types';
import { Users, Settings } from 'lucide-react';

const Admin = () => {
  const { users, currentUser, login } = useApp();

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-slate-900">Administração do Sistema</h2>
        <p className="text-slate-500">Gerencie usuários e simule logins para teste.</p>
      </div>

      {/* User Switcher for Demo Purposes */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex items-center gap-3">
            <div className="p-2 bg-purple-100 text-purple-600 rounded-lg"><Users size={20} /></div>
            <h3 className="font-bold text-slate-800">Simulação de Login (Trocar Usuário)</h3>
        </div>
        <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {users.map(user => (
                    <button
                        key={user.id}
                        onClick={() => login(user.id)}
                        className={`flex flex-col items-start p-4 rounded-lg border transition-all ${
                            currentUser?.id === user.id 
                            ? 'border-blue-500 bg-blue-50 ring-2 ring-blue-200' 
                            : 'border-slate-200 hover:border-blue-300 hover:bg-slate-50'
                        }`}
                    >
                        <span className="font-bold text-slate-800">{user.name}</span>
                        <span className="text-xs font-semibold tracking-wide text-slate-500 uppercase mt-1">
                            {user.role === UserRole.ADMIN ? 'Administrador' : 'Colaborador'}
                        </span>
                        {user.sectorId && (
                            <span className="text-xs mt-2 px-2 py-1 bg-white border border-slate-200 rounded text-slate-600">
                                Setor ID: {user.sectorId}
                            </span>
                        )}
                        {currentUser?.id === user.id && (
                            <span className="mt-3 text-xs font-bold text-blue-600">● Ativo Agora</span>
                        )}
                    </button>
                ))}
            </div>
        </div>
      </div>

      {/* Placeholder for other Admin functions */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-8 text-center">
        <div className="inline-flex p-4 rounded-full bg-slate-50 text-slate-400 mb-4">
            <Settings size={32} />
        </div>
        <h3 className="text-lg font-bold text-slate-800 mb-2">Configurações de Setores</h3>
        <p className="text-slate-500 max-w-md mx-auto">
            Funcionalidade simplificada para esta demonstração. No sistema completo, aqui seria possível cadastrar novos setores, editar fluxos de trabalho e gerenciar permissões avançadas.
        </p>
      </div>
    </div>
  );
};

export default Admin;
