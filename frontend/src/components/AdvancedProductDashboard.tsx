import { useState, useEffect } from 'react';
import { supabase } from '../services/supabase';
import { 
  Plus, 
  History, 
  ShieldCheck, 
  Zap, 
  Settings, 
  ChevronRight, 
  GitBranch, 
  Clock, 
  FileCheck, 
  LayoutDashboard,
  Box,
  Terminal,
  Search,
  Globe,
  Mail,
  Lock,
  Database,
  FileText,
  Fingerprint,
  Hash,
  Binary
} from 'lucide-react';

interface AdvancedProductDashboardProps {
  onStartScan: (url: string, mode?: 'repo' | 'website') => void;
  onLoadScan: (id: string) => void;
  user: any;
  cooldown?: number;
}

export const AdvancedProductDashboard = ({ onStartScan, onLoadScan, user, cooldown }: AdvancedProductDashboardProps) => {
  const [scans, setScans] = useState<any[]>([]);
  const [fixes, setFixes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeView, setActiveView] = useState<'dashboard' | 'fixes' | 'history' | 'settings'>('dashboard');
  const [newScanUrl, setNewScanUrl] = useState('');
  const [scanMode, setScanMode] = useState<'repo' | 'website'>('repo');

  const isPro = user.app_metadata?.tier === 'pro' || user.user_metadata?.is_pro || false;

  useEffect(() => {
    const fetchData = async () => {
      const [{ data: scansData }, { data: fixesData }] = await Promise.all([
        supabase.from('scans').select('*').eq('user_id', user.id).order('created_at', { ascending: false }),
        supabase.from('ai_fixes').select('*, vulnerability:vulnerabilities(*)').eq('user_id', user.id).order('created_at', { ascending: false })
      ]);

      if (scansData) setScans(scansData);
      if (fixesData) setFixes(fixesData);
      setLoading(false);
    };

    fetchData();
  }, [user.id]);

  const renderDashboard = () => (
    <>
        {/* Header / New Scan */}
        <div className="mb-12 flex flex-col md:flex-row justify-between items-end gap-6">
            <div className="space-y-2">
                <h1 className="text-4xl font-bold text-white tracking-tight">Operation <span className="varko-gradient-text">Matrix</span></h1>
                <p className="text-gray-500 font-medium font-mono text-sm uppercase tracking-tighter">
                  System Status: {cooldown && cooldown > 0 ? `Orbital Reentry (${cooldown}s)` : 'Optimized & Ready'}
                </p>
            </div>
            
            <div className="flex flex-col gap-3 w-full md:w-[480px]">
              <div className="flex bg-[#0c0c12] p-1 rounded-xl border border-white/5 w-fit">
                <button 
                  onClick={() => setScanMode('repo')}
                  className={`px-4 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-widest transition-all ${scanMode === 'repo' ? 'bg-purple-600 text-white shadow-lg' : 'text-gray-500 hover:text-gray-300'}`}
                >
                  GitHub Repo
                </button>
                <button 
                  onClick={() => setScanMode('website')}
                  className={`px-4 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-widest transition-all ${scanMode === 'website' ? 'bg-purple-600 text-white shadow-lg' : 'text-gray-500 hover:text-gray-300'}`}
                >
                  Live Website
                </button>
              </div>

              <form 
                onSubmit={(e) => { e.preventDefault(); if (newScanUrl) onStartScan(newScanUrl, scanMode); }}
                className="flex items-center gap-3 bg-[#0c0c12] border border-white/5 focus-within:border-purple-500/40 rounded-2xl p-2 pl-6 transition-all shadow-inner w-full"
              >
                {scanMode === 'repo' ? <GitBranch className="text-purple-400/50" size={20} /> : <Globe className="text-purple-400/50" size={20} />}
                <input 
                  type="text" 
                  placeholder={scanMode === 'repo' ? "https://github.com/varkohq/core-infra" : "https://getvibesec.com"}
                  value={newScanUrl}
                  onChange={(e) => setNewScanUrl(e.target.value)}
                  className="flex-1 bg-transparent border-none text-sm text-white focus:outline-none placeholder:text-gray-700 font-mono"
                />
                <button 
                  type="submit"
                  className="bg-purple-600 hover:bg-purple-500 p-3 rounded-xl transition-all shadow-lg active:scale-95"
                >
                  <Plus size={20} className="text-white" />
                </button>
              </form>
            </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
            {[
                { label: 'Total Scans', value: scans.length, icon: Search, color: 'text-blue-400' },
                { label: 'Security Score', value: scans.length > 0 ? '94%' : 'N/A', icon: Box, color: 'text-purple-400' },
                { label: 'AI Remediations', value: fixes.length, icon: Zap, color: 'text-yellow-400' },
                { label: 'Active Targets', value: [...new Set(scans.map(s => s.repo_url))].length, icon: ShieldCheck, color: 'text-green-400' }
            ].map((stat, i) => (
                <div key={i} className="varko-glass p-6 rounded-3xl border-white/[0.03] group hover:border-purple-500/10 transition-all">
                    <div className="flex justify-between items-start mb-4">
                        <div className={`p-2.5 rounded-xl bg-gray-950 border border-white/5 ${stat.color}`}>
                            <stat.icon size={20} />
                        </div>
                    </div>
                    <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1">{stat.label}</p>
                    <p className="text-2xl font-black text-white tracking-widest">{stat.value}</p>
                </div>
            ))}
        </div>
        {/* Tool Lab Grid */}
        <div className="mb-12">
            <div className="flex items-center gap-6 border-b border-white/5 mb-8 pb-4">
                <span className="text-sm font-bold text-white relative">
                    Security Lab Tools
                    <div className="absolute bottom-[-17px] left-0 w-4/5 h-[2px] bg-purple-500 shadow-[0_0_10px_rgba(168,85,247,0.5)]" />
                </span>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {[
                    { title: 'SSL Certificate Checker', icon: Lock, desc: 'Check validity, expiry, and TLS protocol health.', color: 'text-green-400' },
                    { title: 'Email Security Checker', icon: Mail, desc: 'Audit SPF, DMARC, and MX record hardening.', color: 'text-blue-400' },
                    { title: 'Password Strength', icon: Fingerprint, desc: 'Analyze password entropy 100% client-side.', color: 'text-purple-400' },
                    { title: 'Cloud Config Auditor', icon: Database, desc: 'Identify exposed Supabase or Firebase tables.', color: 'text-orange-400' },
                    { title: 'DNS Security Audit', icon: Globe, desc: 'Verify CAA records and DNSSEC configuration.', color: 'text-indigo-400' },
                    { title: 'security.txt Validator', icon: FileText, desc: 'Ensure responsible disclosure paths exist.', color: 'text-emerald-400' },
                    { title: 'SRI Hash Generator', icon: Fingerprint, desc: 'Secure CDN scripts with integrity hashes.', color: 'text-pink-400' },
                    { title: 'Hash Matrix', icon: Hash, desc: 'MD5, SHA-256, and SHA-512 generator.', color: 'text-yellow-400' },
                    { title: 'Base64 Decoder', icon: Binary, desc: 'Inspect tokens and encoded web payloads.', color: 'text-gray-400' }
                ].map((tool, i) => (
                    <div 
                        key={i} 
                        className="varko-glass p-5 rounded-2xl border-white/[0.02] hover:border-purple-500/20 transition-all cursor-pointer group"
                        onClick={() => {
                            if (tool.title.includes('SSL') || tool.title.includes('Cloud')) setScanMode('website');
                        }}
                    >
                        <div className="flex items-center gap-4 mb-3">
                            <div className={`p-2 rounded-lg bg-gray-950 border border-white/5 ${tool.color} group-hover:scale-110 transition-transform`}>
                                <tool.icon size={18} />
                            </div>
                            <h4 className="text-xs font-black text-gray-200 uppercase tracking-widest">{tool.title}</h4>
                        </div>
                        <p className="text-[10px] text-gray-500 leading-relaxed font-medium">{tool.desc}</p>
                    </div>
                ))}
            </div>
        </div>

        {/* Security Matrix List */}
        <div className="space-y-6 mb-12">
            <div className="flex items-center gap-6 border-b border-white/5 mb-8 pb-4">
                <span className="text-sm font-bold text-white relative">
                    Recent Security Matrices
                    <div className="absolute bottom-[-17px] left-0 w-full h-[2px] bg-purple-500 shadow-[0_0_10px_rgba(168,85,247,0.5)]" />
                </span>
            </div>

            {loading ? (
                <div className="p-20 text-center text-gray-500 font-mono text-xs uppercase tracking-widest animate-pulse">
                    Synchronizing Data Layers...
                </div>
            ) : (
                <div className="space-y-4">
                    {scans.length === 0 ? (
                        <div className="varko-glass rounded-3xl p-12 text-center text-gray-500">No security nodes mapped yet.</div>
                    ) : (
                        scans.map((scan) => (
                            <div 
                              key={scan.id} 
                              onClick={() => onLoadScan(scan.id)}
                              className="varko-glass p-5 rounded-2xl flex items-center justify-between group hover:border-purple-500/20 transition-all cursor-pointer"
                            >
                                <div className="flex items-center gap-6">
                                    <div className="w-12 h-12 rounded-xl bg-gray-950 border border-white/5 flex items-center justify-center text-purple-400 group-hover:border-purple-500/30 transition-all">
                                        <Terminal size={22} />
                                    </div>
                                    <div>
                                        <h4 className="text-lg font-bold text-white group-hover:text-purple-400 transition-colors uppercase tracking-widest">{scan.repo_name}</h4>
                                        <div className="flex items-center gap-3 text-[10px] font-mono text-gray-500 mt-1 uppercase">
                                            <span className="flex items-center gap-1 text-purple-400/70"><Clock size={10} /> {new Date(scan.created_at).toLocaleDateString()}</span>
                                            <span className="flex items-center gap-1"><FileCheck size={10} /> {scan.status}</span>
                                        </div>
                                    </div>
                                </div>
                                <div className="p-3 rounded-xl bg-white/5 border border-white/5 group-hover:border-purple-500/20 text-gray-400 group-hover:text-white transition-all shadow-inner">
                                    <ChevronRight size={18} />
                                </div>
                            </div>
                        ))
                    )}
                </div>
            )}
        </div>
    </>
  );

  const renderFixes = () => (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
        <div className="space-y-2 mb-10">
            <h1 className="text-3xl font-bold text-white tracking-tight">AI <span className="varko-gradient-text">Remediations</span></h1>
            <p className="text-gray-500 font-mono text-[10px] uppercase tracking-widest">Active Intelligence Patch Pipeline</p>
        </div>

        <div className="space-y-4">
            {fixes.length === 0 ? (
                <div className="varko-glass rounded-3xl p-12 text-center text-gray-500">No remediation logs identified.</div>
            ) : (
                fixes.map((fix) => (
                    <div key={fix.id} className="varko-glass p-5 rounded-2xl flex items-center justify-between group hover:border-purple-500/20 transition-all">
                        <div className="flex items-center gap-6">
                            <div className="w-12 h-12 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-yellow-500 shadow-inner">
                                <Zap size={22} className="fill-yellow-500" />
                            </div>
                            <div>
                                <h4 className="text-lg font-bold text-white uppercase tracking-widest">{fix.vulnerability?.title || 'Unknown Fix'}</h4>
                                <div className="flex items-center gap-3 text-[10px] font-mono text-gray-500 mt-1 uppercase">
                                    <span className="flex items-center gap-1 text-purple-400/70"><Clock size={10} /> {new Date(fix.created_at).toLocaleDateString()}</span>
                                    <span className="flex items-center gap-1 text-gray-400">{fix.vulnerability?.file_path || 'Main Application Node'}</span>
                                </div>
                            </div>
                        </div>
                        <div 
                            onClick={() => fix.vulnerability_id && onLoadScan(fix.vulnerability.scan_id)}
                            className="px-4 py-2 rounded-xl bg-purple-600/10 border border-purple-500/20 text-purple-400 text-[10px] font-bold uppercase tracking-widest hover:bg-purple-600/20 transition-all shadow-sm cursor-pointer"
                        >
                            Retrieve Source
                        </div>
                    </div>
                ))
            )}
        </div>
    </div>
  );

  const renderHistory = () => (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
        <div className="space-y-2 mb-10">
            <h1 className="text-3xl font-bold text-white tracking-tight">Audit <span className="varko-gradient-text">Logs</span></h1>
            <p className="text-gray-500 font-mono text-[10px] uppercase tracking-widest">Chronological Security Activity Feed</p>
        </div>

        <div className="space-y-4">
            {[...scans, ...fixes].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()).slice(0, 15).map((item, i) => {
                const isScan = 'status' in item;
                return (
                    <div key={i} className="varko-glass p-4 rounded-xl flex items-center gap-4 border-white/[0.02] hover:border-purple-500/10 transition-all">
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${isScan ? 'bg-blue-500/10 text-blue-400' : 'bg-yellow-500/10 text-yellow-400'}`}>
                            {isScan ? <Search size={14} /> : <Zap size={14} />}
                        </div>
                        <div className="flex-1">
                            <p className="text-sm font-bold text-gray-200">
                                {isScan ? `Matrix scan initiated for ${item.repo_name}` : `AI remediation generated for ${item.vulnerability?.title}`}
                            </p>
                            <p className="text-[10px] text-gray-500 font-mono uppercase mt-0.5">{new Date(item.created_at).toLocaleString()}</p>
                        </div>
                        <span className={`text-[9px] font-bold uppercase px-2 py-0.5 rounded-full border ${isScan ? 'border-blue-500/20 text-blue-400' : 'border-yellow-500/20 text-yellow-400'}`}>
                            {isScan ? 'Scanning' : 'Remediation'}
                        </span>
                    </div>
                );
            })}
        </div>
    </div>
  );

  const renderSettings = () => (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
        <div className="space-y-2 mb-10">
            <h1 className="text-3xl font-bold text-white tracking-tight">System <span className="varko-gradient-text">Config</span></h1>
            <p className="text-gray-500 font-mono text-[10px] uppercase tracking-widest">Node Parameters & Authorization</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="varko-glass p-8 rounded-3xl space-y-6">
                <div>
                    <h3 className="text-sm font-bold text-white mb-4 uppercase tracking-widest">Identity Node</h3>
                    <div className="p-4 rounded-2xl bg-white/5 border border-white/5 space-y-3">
                        <div className="flex justify-between">
                            <span className="text-[10px] text-gray-500 uppercase">Status</span>
                            <span className="text-[10px] text-green-400 uppercase font-bold">Authorized</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-[10px] text-gray-500 uppercase">Provider</span>
                            <span className="text-[10px] text-gray-300">Vibesec Ghost-ID</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-[10px] text-gray-500 uppercase">Level</span>
                            <span className={isPro ? "varko-badge" : "text-[10px] font-bold text-purple-400 uppercase tracking-widest"}>
                                {isPro ? "Unlimited Pro" : "Free Hacker Node"}
                            </span>
                        </div>
                    </div>
                </div>
                
                <button className="w-full py-3 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-[10px] font-bold uppercase tracking-widest transition-all shadow-lg active:scale-95">
                    Sync Identity Hub
                </button>
            </div>

            <div className="varko-glass p-8 rounded-3xl space-y-6">
                <div>
                    <h3 className="text-sm font-bold text-white mb-4 uppercase tracking-widest">Intelligence Uplink</h3>
                    <div className="p-4 rounded-2xl bg-white/5 border border-white/5 space-y-3">
                        <div className="flex justify-between">
                            <span className="text-[10px] text-gray-500 uppercase">Gemini-Core</span>
                            <span className="text-[10px] text-purple-400 uppercase font-bold">Connected</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-[10px] text-gray-500 uppercase">Latency</span>
                            <span className="text-[10px] text-gray-300 font-mono">142ms</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-[10px] text-gray-500 uppercase">Rate Limit</span>
                            <span className="text-[10px] text-gray-300 font-mono">2,000 RPM</span>
                        </div>
                    </div>
                </div>
                
                <div className="flex gap-4">
                    <button className="flex-1 py-3 rounded-xl border border-white/10 hover:bg-white/5 text-gray-400 text-[10px] font-bold uppercase tracking-widest transition-all">
                        Reset API Keys
                    </button>
                </div>
            </div>
        </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#08070b] flex pt-4 overflow-hidden">
      {/* Sidebar - Asymmetric Left (25-30%) */}
      <aside className="w-[320px] h-[calc(100vh-5rem)] ml-6 mb-6 varko-glass rounded-[2rem] border-purple-500/10 flex flex-col p-6 sticky top-20">
        <div className="flex items-center gap-3 mb-10 px-2">
            <div className="w-10 h-10 rounded-xl bg-purple-500/20 flex items-center justify-center border border-purple-500/30">
                <ShieldCheck size={20} className="text-purple-400" />
            </div>
            <div className="flex flex-col">
                <span className="text-sm font-bold text-white uppercase tracking-tighter">Security Node</span>
                <span className="text-[10px] font-mono text-gray-500 truncate w-32">{user.email}</span>
            </div>
        </div>

        <nav className="flex-1 space-y-2">
            {[
                { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
                { id: 'fixes', label: 'AI Remediations', icon: Zap },
                { id: 'history', label: 'Audit Logs', icon: History },
                { id: 'settings', label: 'System Config', icon: Settings }
            ].map((item) => (
                <button
                    key={item.id}
                    onClick={() => {
                        if (item.id === 'fixes') setActiveView('fixes');
                        else if (item.id === 'dashboard') setActiveView('dashboard');
                        else if (item.id === 'history') setActiveView('history');
                        else if (item.id === 'settings') setActiveView('settings');
                    }}
                    className={`w-full flex items-center justify-between p-3.5 rounded-xl transition-all group ${
                        activeView === item.id 
                        ? 'bg-purple-600/10 text-white border border-purple-500/20' 
                        : 'text-gray-400 hover:text-white hover:bg-white/5 border border-transparent'
                    }`}
                >
                    <div className="flex items-center gap-3">
                        <item.icon size={18} className="group-hover:text-purple-400 transition-colors" />
                        <span className="text-sm font-bold">{item.label}</span>
                    </div>
                    <ChevronRight size={14} className="opacity-0 group-hover:opacity-100 transition-opacity" />
                </button>
            ))}
        </nav>

        <div className="mt-auto border-t border-white/5 pt-6 space-y-4">
            <div className="varko-pill justify-start">
                <span className="varko-badge">{isPro ? "Pro Plan" : "Free Tier"}</span> {isPro ? "Active" : "Active"}
            </div>
            <div className="p-4 rounded-2xl bg-gradient-to-br from-purple-600/10 to-indigo-600/10 border border-purple-500/20">
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">Resource Usage</p>
                <div className="h-1 w-full bg-white/5 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-purple-500 shadow-[0_0_10px_rgba(168,85,247,0.5)] transition-all duration-1000" 
                      style={{ width: `${Math.min(100, (scans.length / 20) * 100)}%` }}
                    />
                </div>
                <p className="mt-2 text-[10px] text-gray-500 font-mono">{scans.length} / {isPro ? 'Unlimited' : '20'} Scans used</p>
            </div>
        </div>
      </aside>

      <main className="flex-1 px-8 overflow-y-auto h-[calc(100vh-5rem)] custom-scrollbar pb-10">
          {activeView === 'dashboard' && renderDashboard()}
          {activeView === 'fixes' && renderFixes()}
          {activeView === 'history' && renderHistory()}
          {activeView === 'settings' && renderSettings()}
      </main>
    </div>
  );
};
