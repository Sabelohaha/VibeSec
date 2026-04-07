import { useState } from 'react';
import { LogOut, X } from 'lucide-react';
import { supabase } from '../services/supabase';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigateToSignup?: () => void;
}

export const AuthModal = ({ isOpen, onClose, onNavigateToSignup }: AuthModalProps) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const { error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) {
      setError(error.message);
    } else {
      onClose();
    }
    setLoading(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md transition-all duration-300">
      <div className="relative w-full max-w-md varko-glass rounded-2xl p-8 shadow-2xl border-white/10">
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-500 hover:text-white transition-colors">
          <X size={20} />
        </button>
        
        <h2 className="text-2xl font-bold text-white mb-6 tracking-tight">Access <span className="varko-gradient-text">Matrix</span></h2>
        
        <form onSubmit={handleSignIn} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-gray-500 mb-1 uppercase tracking-widest">Security Email</label>
            <input 
              type="email" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-[#08070b] border border-white/5 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-purple-500/50 transition-colors"
              placeholder="operator@vibesec.com"
              required
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-500 mb-1 uppercase tracking-widest">Access Key</label>
            <input 
              type="password" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-[#08070b] border border-white/5 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-purple-500/50 transition-colors"
              placeholder="••••••••"
              required
            />
          </div>
          
          {error && <p className="text-red-400 text-[10px] font-bold uppercase tracking-widest bg-red-400/5 p-2 rounded-lg border border-red-400/10">{error}</p>}
          
          <button 
            type="submit" 
            disabled={loading}
            className="w-full py-4 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold rounded-xl transition-all varko-glow-purple disabled:opacity-50 shadow-lg active:scale-95"
          >
            {loading ? 'Authorizing...' : 'Initialize Access'}
          </button>
        </form>
        
        <p className="mt-8 text-center text-xs font-bold text-gray-500 uppercase tracking-widest">
          New Operator?
          <button 
            onClick={() => { onClose(); onNavigateToSignup?.(); }}
            className="ml-2 text-purple-400 hover:text-purple-300 transition-colors"
          >
            Request Access
          </button>
        </p>
      </div>
    </div>
  );
};

export const NavBar = ({ user, onAuthClick, currentView, navigate }: { user: any, onAuthClick: () => void, currentView?: string, navigate?: (v: any) => void }) => {
  const handleSignOut = async () => {
    await supabase.auth.signOut();
  };

  return (
    <nav className="fixed top-0 w-full z-40 bg-[#08070b]/80 backdrop-blur-xl border-b border-white/5">
      <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
        <div 
          className="flex items-center gap-2 font-bold text-xl cursor-pointer group"
          onClick={() => navigate?.('landing')}
        >
          <div className="w-8 h-8 rounded-lg bg-purple-500/20 flex items-center justify-center border border-purple-500/30 varko-glow-purple group-hover:scale-110 transition-transform">
            <span className="text-purple-400 font-mono text-xs tracking-tighter">VS</span>
          </div>
          <span className="text-white tracking-tight">Vibesec</span>
        </div>
        
        {navigate && (
          <div className="hidden md:flex items-center gap-8 text-[11px] font-bold uppercase tracking-widest">
            {[
              { id: 'landing', label: 'Home' },
              { id: 'about', label: 'About' },
              { id: 'product', label: 'Matrix' },
              { id: 'pricing', label: 'Upgrade' }
            ].map((item) => (
              <button 
                key={item.id}
                onClick={() => navigate(item.id as any)}
                className={`transition-all hover:text-white ${
                  currentView === item.id || (item.id === 'product' && (currentView === 'results' || currentView === 'scanning'))
                    ? 'text-purple-400' 
                    : 'text-gray-500'
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>
        )}
        
        <div className="flex items-center gap-4">
          {user ? (
            <div className="flex items-center gap-4 group">
              <div className="hidden sm:flex flex-col items-end">
                <span className="text-[10px] font-bold text-purple-400 uppercase tracking-tighter">Verified Node</span>
                <span className="text-[9px] font-mono text-gray-500 truncate w-24 text-right opacity-50 group-hover:opacity-100 transition-opacity">{user.email}</span>
              </div>
              <button 
                onClick={handleSignOut}
                className="flex items-center gap-2 px-3 py-2 rounded-xl bg-white/5 border border-white/5 hover:bg-white/10 hover:border-white/10 text-gray-300 transition-all text-[10px] font-bold uppercase tracking-widest shadow-inner active:scale-95"
              >
                <LogOut size={14} className="text-purple-400" />
                <span>Logout</span>
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-3">
               <button 
                onClick={onAuthClick}
                className="text-xs font-bold text-gray-500 hover:text-white transition-colors uppercase tracking-widest px-2"
              >
                Login
              </button>
              <button 
                onClick={() => navigate?.('signup')}
                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 text-white hover:from-purple-500 hover:to-indigo-500 transition-all font-bold text-[10px] uppercase tracking-widest varko-glow-purple border border-white/10 active:scale-95 shadow-xl"
              >
                Get Started
              </button>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};
