
import React from 'react';
import { Settings, ShieldCheck } from 'lucide-react';

const Admin = () => {

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-slate-900">Administração do Sistema</h2>
        <p className="text-slate-500">Painel de controle e configurações globais.</p>
      </div>

      {/* Info Card */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-8 text-center">
        <div className="inline-flex p-4 rounded-full bg-blue-50 text-blue-500 mb-4">
            <ShieldCheck size={48} />
        </div>
        <h3 className="text-xl font-bold text-slate-800 mb-2">Você é um Administrador</h3>
        <p className="text-slate-500 max-w-lg mx-auto mb-6">
            Você tem acesso total para gerenciar Setores, Colaboradores e Fluxos de Trabalho.
            Utilize o menu lateral para acessar as áreas de cadastro.
        </p>
        
        <div className="bg-slate-50 rounded-lg p-4 text-left max-w-lg mx-auto border border-slate-100">
            <h4 className="font-bold text-slate-700 text-sm mb-2 flex items-center gap-2">
                <Settings size={14} /> Como cadastrar novos usuários?
            </h4>
            <ul className="text-sm text-slate-600 space-y-2 list-disc pl-5">
                <li>Vá para a aba <strong>Colaboradores</strong>.</li>
                <li>Cadastre o Nome, <strong>Email</strong> e Setor do funcionário.</li>
                <li>Peça para o funcionário acessar o sistema e clicar em <strong>"Cadastrar-se"</strong>.</li>
                <li>Ao usar o mesmo email cadastrado, o sistema vinculará automaticamente o Setor e Permissões.</li>
            </ul>
        </div>
      </div>
    </div>
  );
};

export default Admin;
