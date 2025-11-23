import React, { useState } from 'react';
import { useApp } from '../store/AppContext';
import { X, User, Lock, ArrowRight, Users } from 'lucide-react';

const QuickSwitchModal = () => {
  const { 
    isQuickSwitchOpen, 
    setQuickSwitchOpen, 
    users, 
    currentUser, 
    login 
  } = useApp();
  
  const [selectedUserEmail, setSelectedUserEmail] = useState<string | null>(null);
  const [manualEmail, setManualEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [mode, setMode] = useState<'LIST' | 'MANUAL'>('LIST');

  if (!isQuickSwitchOpen || !currentUser) return null;

  // Filter users in the same sector (or all if admin/manager/global sector)
  const sameSectorUsers = users.filter(u => 
    u.id !== currentUser.id && // Exclude self
    (
      currentUser.role === 'ADMIN' || 
      currentUser.role === 'GESTOR' ||
      !currentUser.sectorId || // Global user sees everyone
      u.sectorId === currentUser.sectorId // Same sector
    )
  );

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    const emailToUse = mode === 'LIST' ? selectedUserEmail : manualEmail;
    
    if (!emailToUse || !password) return;

    setLoading(true);
    setError('');

    try {
      // Using the context login which handles signout first
      await login(emailToUse, password);
      
      // Success actions
      setQuickSwitchOpen(false);
      setPassword('');
      setSelectedUserEmail(null);
      setManualEmail('');
      setMode('LIST');
    } catch (err: any) {
      console.error("Switch error:", err);
      setError(err.code === 'auth/wrong-password' ? 'Senha incorreta.' : 'Falha ao autenticar.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
        
        <div className="bg-slate-900 p-6 flex justify-between items-center text-white">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-600 rounded-lg">
              <Users size={20} />
            </div>
            <div>
              <h3 className="text-lg font-bold">Troca Rápida</h3>
              <p className="text-xs text-slate-400">Alternar operador neste posto</p>
            </div>
          </div>
          <button 
            onClick={() => setQuickSwitchOpen(false)}
            className="p-1 hover:bg-white/10 rounded-full transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        <div className="p-6">
          {mode === 'LIST' && !selectedUserEmail ? (
            <div className="space-y-4">
              <p className="text-sm text-slate-500 font-medium mb-2">Selecione o operador:</p>
              <div className="grid gap-2 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                {sameSectorUsers.length > 0 ? sameSectorUsers.map(u => (
                  <button
                    key={u.id}
                    onClick={() => setSelectedUserEmail(u.email || '')}
                    className="flex items-center gap-3 p-3 rounded-xl border border-slate-200 hover:border-blue-500 hover:bg-blue-50 transition-all text-left group"
                  >
                    <div className="h-10 w-10 rounded-full bg-slate-100 text-slate-500 flex items-center justify-center font-bold group-hover:bg-blue-200 group-hover:text-blue-700">
                      {u.name.charAt(0)}
                    </div>
                    <div>
                      <p className="font-bold text-slate-800 group-hover:text-blue-800">{u.name}</p>
                      <p className="text-xs text-slate-400">{u.role}</p>
                    </div>
                    <ArrowRight className="ml-auto text-slate-300 group-hover:text-blue-500 opacity-0 group-hover:opacity-100 transition-opacity" size={16} />
                  </button>
                )) : (
                  <div className="text-center py-8 text-slate-400 bg-slate-50 rounded-xl border border-dashed border-slate-200">
                    <p>Nenhum outro operador listado para este setor.</p>
                  </div>
                )}
              </div>
              <button 
                onClick={() => setMode('MANUAL')}
                className="w-full py-3 text-blue-600 font-bold text-sm hover:bg-blue-50 rounded-xl transition-colors border border-dashed border-blue-200 hover:border-blue-300"
              >
                Entrar com outro email
              </button>
            </div>
          ) : (
            <form onSubmit={handleLogin} className="space-y-4">
              {mode === 'LIST' ? (
                <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl border border-slate-100 mb-4">
                  <div className="h-10 w-10 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold">
                    <User size={20} />
                  </div>
                  <div className="flex-1">
                    <p className="text-xs text-slate-400 uppercase font-bold">Entrando como</p>
                    <p className="font-bold text-slate-800 truncate">
                      {users.find(u => u.email === selectedUserEmail)?.name}
                    </p>
                  </div>
                  <button 
                    type="button"
                    onClick={() => setSelectedUserEmail(null)}
                    className="text-xs text-blue-600 font-bold hover:underline"
                  >
                    Trocar
                  </button>
                </div>
              ) : (
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Email</label>
                  <input 
                    type="email"
                    value={manualEmail}
                    onChange={(e) => setManualEmail(e.target.value)}
                    className="w-full pl-4 pr-4 py-3 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="email@exemplo.com"
                    autoFocus
                    required
                  />
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Senha de Acesso</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                  <input 
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 focus:ring-4 focus:ring-blue-50 focus:border-blue-500 outline-none transition-all"
                    placeholder="Digite a senha..."
                    autoFocus={mode === 'LIST'}
                    required
                  />
                </div>
              </div>

              {error && <p className="text-red-500 text-sm text-center font-bold bg-red-50 p-2 rounded-lg">{error}</p>}

              <div className="flex gap-3 mt-6">
                {mode === 'MANUAL' && (
                    <button 
                        type="button" 
                        onClick={() => setMode('LIST')}
                        className="flex-1 py-3 bg-slate-100 text-slate-600 rounded-xl font-bold hover:bg-slate-200 transition-colors"
                    >
                        Voltar
                    </button>
                )}
                <button 
                    type="submit"
                    disabled={loading}
                    className="flex-[2] py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold shadow-lg shadow-blue-900/20 transition-all flex items-center justify-center gap-2 disabled:opacity-70"
                >
                    {loading ? 'Autenticando...' : 'Confirmar Troca'}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default QuickSwitchModal;