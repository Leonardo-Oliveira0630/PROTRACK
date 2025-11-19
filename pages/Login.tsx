
import React, { useState } from 'react';
import { useApp } from '../store/AppContext';
import { Hexagon, ArrowRight, Mail, Lock, User as UserIcon, Loader2 } from 'lucide-react';

const Login = () => {
  const { login, register } = useApp();
  const [isRegistering, setIsRegistering] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  // Form States
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      if (isRegistering) {
        await register(name, email, password);
      } else {
        await login(email, password);
      }
    } catch (err: any) {
        console.error("Login error:", err);
        if (err.code === 'auth/invalid-credential' || err.code === 'auth/user-not-found' || err.code === 'auth/wrong-password') {
            setError("Email ou senha incorretos.");
        } else if (err.code === 'auth/email-already-in-use') {
            setError("Este email já está cadastrado.");
        } else if (err.code === 'auth/weak-password') {
            setError("A senha deve ter pelo menos 6 caracteres.");
        } else if (err.code === 'permission-denied') {
             setError("Permissão negada. Contate o administrador.");
        } else {
            setError("Ocorreu um erro. Tente novamente.");
        }
    } finally {
        setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4 relative overflow-hidden">
       {/* Background effects */}
       <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0">
          <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-600/20 rounded-full blur-[100px]"></div>
          <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-600/20 rounded-full blur-[100px]"></div>
       </div>

       <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl z-10 overflow-hidden animate-in fade-in zoom-in-95 duration-300">
          <div className="p-8 bg-slate-50 border-b border-slate-100 text-center">
             <div className="inline-flex items-center justify-center p-4 bg-white rounded-2xl shadow-sm mb-4">
                <Hexagon className="w-10 h-10 text-blue-600 fill-blue-600/10" />
             </div>
             <h1 className="text-2xl font-bold text-slate-900">Dental Lab ProTrack</h1>
             <p className="text-slate-500 text-sm mt-2">
                 {isRegistering ? 'Crie sua conta de acesso' : 'Entre para gerenciar a produção'}
             </p>
          </div>

          <div className="p-8">
             <form onSubmit={handleSubmit} className="space-y-4">
                
                {isRegistering && (
                    <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Nome Completo</label>
                        <div className="relative">
                            <UserIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                            <input 
                                type="text"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 focus:ring-4 focus:ring-blue-50 focus:border-blue-500 outline-none transition-all"
                                placeholder="Seu nome"
                                required={isRegistering}
                            />
                        </div>
                    </div>
                )}

                <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Email Corporativo</label>
                    <div className="relative">
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                        <input 
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 focus:ring-4 focus:ring-blue-50 focus:border-blue-500 outline-none transition-all"
                            placeholder="seu@email.com"
                            required
                        />
                    </div>
                </div>

                <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Senha</label>
                    <div className="relative">
                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                        <input 
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 focus:ring-4 focus:ring-blue-50 focus:border-blue-500 outline-none transition-all"
                            placeholder="••••••••"
                            required
                        />
                    </div>
                </div>

                {error && (
                    <div className="p-3 bg-red-50 text-red-600 text-sm rounded-lg text-center font-medium">
                        {error}
                    </div>
                )}

                <button 
                    type="submit"
                    disabled={isLoading}
                    className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold shadow-lg shadow-blue-600/20 transition-all flex items-center justify-center gap-2 disabled:opacity-70"
                >
                    {isLoading ? <Loader2 className="animate-spin" size={20} /> : <ArrowRight size={20} />}
                    {isRegistering ? 'Cadastrar Conta' : 'Acessar Sistema'}
                </button>
             </form>
             
             <div className="mt-6 text-center">
                 <button 
                    type="button"
                    onClick={() => {
                        setIsRegistering(!isRegistering);
                        setError('');
                    }}
                    className="text-sm text-slate-500 hover:text-blue-600 font-medium transition-colors"
                 >
                    {isRegistering ? 'Já tem uma conta? Faça Login' : 'Primeiro acesso? Cadastre-se'}
                 </button>
             </div>

             {isRegistering && (
                <div className="mt-4 p-3 bg-blue-50 text-blue-700 text-xs rounded-lg text-center">
                    💡 O primeiro usuário cadastrado no sistema será automaticamente definido como <strong>Administrador</strong>.
                </div>
             )}
          </div>
          
          <div className="p-4 bg-slate-50 border-t border-slate-100 text-center">
             <p className="text-xs text-slate-400">Dental Lab ProTrack • v1.1.0</p>
          </div>
       </div>
    </div>
  );
};

export default Login;
