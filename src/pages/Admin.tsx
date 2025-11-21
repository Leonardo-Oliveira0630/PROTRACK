
import React from 'react';
import { Settings, ShieldCheck, Database, Copy, AlertTriangle } from 'lucide-react';

const Admin = () => {

  const firestoreRules = `rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    
    // Função para verificar login
    function isAuthenticated() { return request.auth != null; }
    
    // Função para verificar Admin
    function isAdmin() {
      return isAuthenticated() &&
        get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'ADMIN';
    }
    
    // Função para verificar Gestor ou Admin
    function isManager() {
      return isAuthenticated() &&
        (get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'ADMIN' ||
         get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'GESTOR');
    }

    // REGRAS DE USUÁRIOS
    match /users/{userId} {
      allow read: if isAuthenticated();
      allow create: if isAuthenticated(); // Permite cadastro inicial
      allow update, delete: if isAdmin(); // Apenas Admin muda permissões
    }

    // REGRAS DE TRABALHOS (JOBS)
    match /jobs/{jobId} {
      allow read, create, update: if isAuthenticated();
      allow delete: if isAdmin();
    }

    // REGRAS DE SETORES
    match /sectors/{sectorId} {
      allow read: if isAuthenticated();
      allow write: if isAdmin();
    }

    // REGRAS NOVAS (DENTISTAS, TIPOS, CORES)
    match /dentists/{id} {
      allow read: if isAuthenticated();
      allow write: if isManager();
    }
    match /job_types/{id} {
      allow read: if isAuthenticated();
      allow write: if isManager();
    }
    match /box_colors/{id} {
      allow read: if isAuthenticated();
      allow write: if isManager();
    }
  }
}`;

  const handleCopyRules = () => {
    navigator.clipboard.writeText(firestoreRules);
    alert("Regras copiadas! Cole no Firebase Console.");
  };

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
      </div>

      {/* Database Rules Section (THE FIX) */}
      <div className="bg-slate-900 text-slate-300 rounded-xl p-6 border border-slate-800">
        <div className="flex items-center gap-3 mb-4 text-yellow-400">
            <AlertTriangle size={24} />
            <h3 className="text-lg font-bold">Correção de Erros de Salvamento</h3>
        </div>
        <p className="text-sm mb-4">
            Se você não está conseguindo salvar <strong>Dentistas, Tipos de Trabalho ou Cores</strong>, é porque as Regras de Segurança do Firebase estão desatualizadas.
            <br/><br/>
            Copie o código abaixo e cole na aba <strong>"Regras"</strong> do seu <strong>Firestore Database</strong> no Console do Firebase.
        </p>

        <div className="relative bg-black/50 p-4 rounded-lg font-mono text-xs overflow-auto max-h-64 border border-slate-700">
            <button 
                onClick={handleCopyRules}
                className="absolute top-2 right-2 bg-slate-700 hover:bg-slate-600 text-white px-3 py-1 rounded text-xs flex items-center gap-2 transition-colors"
            >
                <Copy size={12} /> Copiar Regras
            </button>
            <pre className="whitespace-pre-wrap text-green-400">
                {firestoreRules}
            </pre>
        </div>
      </div>

      {/* User Instructions */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
        <div className="flex items-center gap-2 mb-4 pb-4 border-b border-slate-100">
            <Settings className="text-slate-400" size={20} />
            <h3 className="font-bold text-slate-800">Instruções de Cadastro</h3>
        </div>
        <ul className="text-sm text-slate-600 space-y-3 list-disc pl-5">
            <li>Para cadastrar novos usuários, vá para a aba <strong>Colaboradores</strong>.</li>
            <li>Cadastre o Nome, <strong>Email</strong> e Setor do funcionário.</li>
            <li>Peça para o funcionário acessar o sistema e clicar em <strong>"Cadastrar-se"</strong> usando o mesmo email.</li>
            <li>O sistema vinculará automaticamente as permissões.</li>
        </ul>
      </div>
    </div>
  );
};

export default Admin;
