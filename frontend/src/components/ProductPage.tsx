import { ShieldCheck, GitBranch, ArrowRight, Cpu, Globe, Lock, Terminal } from 'lucide-react';
import { useState } from 'react';

interface ProductPageProps {
  onStart: (url: string) => void;
  user: any;
}

export const ProductPage = ({ onStart, user }: ProductPageProps) => {
  const [url, setUrl] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (url.trim()) {
      onStart(url.trim());
    }
  };

  return (
    <div className="min-h-screen bg-[#08070b] pt-32 pb-24 overflow-x-hidden selection:bg-purple-500/30">
      {/* Background decoration */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[600px] bg-varko-grid opacity-20 [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] pointer-events-none" />
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-purple-500/5 blur-[120px] rounded-full pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 relative z-10">
        
        {/* Header Section */}
        <div className="text-center mb-16">
          <div className="varko-pill mb-6">
            <span className="varko-badge">Scanner</span> VibeSec Matrix Engine v3.0
          </div>
          <h1 className="text-4xl md:text-6xl font-bold tracking-tight text-white mb-6">
            Execute Your Deep <br />
            <span className="varko-gradient-text">Matrix Analysis</span>
          </h1>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto font-medium">
            Analyze your target codebase for hidden vulnerabilities, exposed secrets, and logic flaws in seconds using our AI-driven security matrix.
          </p>
        </div>

        {/* Scanner Card */}
        <div className="max-w-3xl mx-auto mb-24">
          <div className="varko-glass rounded-[2rem] p-8 md:p-12 border-purple-500/10 shadow-[0_0_50px_rgba(139,92,246,0.1)] relative group">
            <div className="absolute inset-0 bg-gradient-to-tr from-purple-500/[0.02] to-transparent rounded-[2rem] pointer-events-none" />
            
            <form onSubmit={handleSubmit} className="space-y-6 relative z-10">
              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-500 uppercase tracking-widest ml-1">Repository URL</label>
                <div className="flex items-center gap-4 bg-[#0c0c12] border border-white/5 focus-within:border-purple-500/40 rounded-2xl px-6 py-4 transition-all shadow-inner">
                  <GitBranch className="text-purple-400/50" size={24} />
                  <input 
                    type="text" 
                    placeholder="https://github.com/varkohq/core-infra"
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    className="w-full bg-transparent border-none text-lg text-white focus:outline-none placeholder:text-gray-700 font-medium"
                  />
                </div>
              </div>

              <button 
                type="submit"
                className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white py-5 rounded-2xl font-bold text-lg flex items-center justify-center gap-3 transition-all varko-glow-purple shadow-xl active:scale-[0.98]"
              >
                <Terminal size={22} />
                Initiate Sequence
                <ArrowRight size={20} />
              </button>
            </form>

            <div className="mt-8 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-white/5 pt-8">
              <div className="flex items-center gap-2 text-gray-500 text-xs font-bold uppercase tracking-tighter">
                <ShieldCheck size={14} className="text-purple-400" />
                Authored by Vibesec Intelligence
              </div>

            </div>
          </div>
        </div>

        {/* Feature Highlights (Reduced "Barebones" feel) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
                { icon: <Cpu />, title: "Logic Analysis", desc: "Our engine performs semantic path analysis to find complex IDOR and auth bypass patterns." },
                { icon: <Globe />, title: "Protocol Check", desc: "Validates headers, CORS policies, and TLS configurations against industry best practices." },
                { icon: <Lock />, title: "Secret Scrubbing", desc: "High-entropy detection for over 300+ types of API keys, tokens, and private credentials." }
            ].map((item, i) => (
                <div key={i} className="varko-glass p-8 rounded-3xl border-white/[0.03] group hover:border-purple-500/20 transition-all">
                    <div className="w-12 h-12 rounded-xl bg-purple-500/10 flex items-center justify-center text-purple-400 border border-purple-500/20 mb-6 group-hover:scale-110 transition-transform">
                        {item.icon}
                    </div>
                    <h3 className="text-lg font-bold text-white mb-2">{item.title}</h3>
                    <p className="text-gray-500 text-sm font-medium leading-relaxed">{item.desc}</p>
                </div>
            ))}
        </div>

      </div>
    </div>
  );
};
