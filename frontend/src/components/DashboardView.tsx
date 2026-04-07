import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';
import { ShieldCheck, GitBranch, Zap, ArrowLeft, Terminal, Clock, ShieldOff, Info, Lock } from 'lucide-react';
import type { ScanResult, Vulnerability } from '../types';
import { trustPath } from '../services/api';

interface DashboardViewProps {
  result: ScanResult;
  onFix: (vuln: Vulnerability) => void;
  onReset: () => void;
  user: any;
  cooldown?: number;
}

export const DashboardView = ({ result, onFix, onReset, user, cooldown = 0 }: DashboardViewProps) => {
  const allVulns = result.vulnerabilities || [];
  
  // Surgical Filtering
  const confirmedVulns = allVulns.filter(v => !v.is_false_positive && !v.is_ignored);
  const filteredVulns = allVulns.filter(v => v.is_false_positive && !v.is_ignored);

  const handleTrust = async (vuln: Vulnerability) => {
    try {
      if (result.id) {
        await trustPath(result.id, vuln.file_path);
        // Normally we'd refresh the scan data here
        alert(`Trust verified for ${vuln.file_path}. This node will be bypassed in future scans.`);
        onReset(); // Trigger fresh state
      }
    } catch (e) {
      console.error(e);
    }
  };
  
  const stats = [
    { name: 'Critical', value: confirmedVulns.filter(v => v.severity === 'Critical').length, color: '#ef4444' },
    { name: 'High', value: confirmedVulns.filter(v => v.severity === 'High').length, color: '#f97316' },
    { name: 'Medium', value: confirmedVulns.filter(v => v.severity === 'Medium').length, color: '#eab308' },
    { name: 'Low', value: confirmedVulns.filter(v => v.severity === 'Low').length, color: '#10b981' },
  ].filter(s => s.value > 0);

  const totalVulns = confirmedVulns.length;
  const score = result.score || Math.max(0, 100 - (confirmedVulns.filter(v => v.severity === 'Critical').length * 25) - (confirmedVulns.filter(v => v.severity === 'High').length * 15));

  const renderVulnCard = (vuln: Vulnerability, isNeutralized = false) => (
    <div key={vuln.id} className={`glass-effect rounded-3xl p-6 border-white/5 transition-all group relative overflow-hidden ${
      isNeutralized ? 'opacity-60 saturate-[0.2] hover:opacity-100 hover:saturate-100' : 'hover:border-vibepurple-500/30'
    }`}>
      <div className="absolute top-0 right-0 p-4 flex gap-2">
        <button 
          onClick={(e) => { e.stopPropagation(); handleTrust(vuln); }}
          className="p-1 px-2 rounded-lg bg-white/5 border border-white/5 text-[9px] font-mono text-gray-500 hover:text-white transition-all uppercase flex items-center gap-1"
          title="Trust this file path"
        >
          <Lock size={10} /> Trust Path
        </button>
        <div className={`px-3 py-1 rounded-full text-[10px] font-mono font-bold uppercase tracking-widest border ${
          vuln.severity === 'Critical' ? 'bg-red-500/10 border-red-500/50 text-red-500' :
          vuln.severity === 'High' ? 'bg-orange-500/10 border-orange-500/50 text-orange-500' :
          vuln.severity === 'Medium' ? 'bg-yellow-500/10 border-yellow-500/50 text-yellow-500' :
          'bg-vibepurple-500/10 border-vibepurple-500/50 text-vibepurple-500'
        }`}>
          {vuln.severity}
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-6">
        <div className="flex-1 space-y-4">
          <div>
            <h3 className="text-xl font-bold text-white mb-1 group-hover:text-vibepurple-500 transition-colors pr-32">{vuln.title}</h3>
            <div className="flex flex-wrap items-center gap-2 text-[11px] font-mono text-gray-500 mt-2">
              <Terminal size={12} className="text-vibepurple-500" />
              <span className="bg-gray-950 px-2 py-0.5 rounded border border-gray-800 break-all">{vuln.file_path}:{vuln.line_number}</span>
              <span className="bg-gray-950 px-2 py-0.5 rounded border border-gray-800 text-gray-400">{vuln.type}</span>
            </div>
          </div>
          <p className="text-sm text-gray-400 leading-relaxed max-w-2xl">{vuln.description}</p>
          
          {isNeutralized && vuln.verification_reason && (
            <div className="p-3 rounded-xl bg-blue-500/5 border border-blue-500/20 flex gap-3 items-start">
               <Info size={14} className="text-blue-400 mt-0.5 flex-shrink-0" />
               <p className="text-[10px] text-blue-300 font-mono italic">Neutralization Reason: {vuln.verification_reason}</p>
            </div>
          )}
        </div>

        {!isNeutralized && (
          <div className="md:w-48 flex flex-col justify-end mt-4 md:mt-0">
            <button 
              onClick={() => onFix(vuln)}
              disabled={!user || (cooldown > 0 && !vuln.ai_fix)}
              className={`w-full group/btn py-3 px-4 rounded-xl flex items-center justify-center gap-2 font-bold transition-all border ${
                !user 
                  ? 'bg-gray-900 border-gray-800 text-gray-500 cursor-not-allowed' 
                  : cooldown > 0 && !vuln.ai_fix
                  ? 'bg-gray-900 border-gray-800 text-gray-500 cursor-not-allowed'
                  : vuln.ai_fix
                  ? 'bg-gray-800 hover:bg-gray-700 text-white border-transparent shadow shadow-black/50 active:scale-95'
                  : 'bg-vibepurple-500 hover:bg-vibepurple-600 text-white border-transparent shadow-[0_0_15px_rgba(124,58,237,0.3)] active:scale-95'
              }`}
            >
              {!user ? <ShieldCheck size={18} /> : (cooldown > 0 && !vuln.ai_fix) ? <Clock size={18} /> : vuln.ai_fix ? <ShieldCheck size={18} className="text-vibepurple-400" /> : <Zap size={18} className="fill-white group-hover/btn:-translate-y-0.5 transition-transform" />}
              {!user ? 'Sign in to Fix' : (cooldown > 0 && !vuln.ai_fix) ? `Wait ${cooldown}s` : vuln.ai_fix ? 'View Solution' : 'Fix with AI'}
            </button>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12">
        <div className="space-y-1">
          <button 
            onClick={onReset}
            className="flex items-center gap-2 text-xs font-mono text-gray-500 hover:text-vibepurple-500 transition-colors uppercase tracking-widest mb-2"
          >
            <ArrowLeft size={14} /> Start Over
          </button>
          <div className="flex items-center gap-3">
            <h1 className="text-4xl font-black text-white tracking-tight">{result.repo_name}</h1>
            <div className="p-1.5 rounded-lg bg-gray-950 border border-gray-800">
              <GitBranch size={20} className="text-gray-400" />
            </div>
          </div>
          <p className="text-gray-500 font-mono text-xs">Target: {result.repo_url}</p>
        </div>

        <div className="flex gap-4 items-stretch">
          <div className="glass-effect rounded-2xl p-4 flex items-center gap-4 border-white/5 glow-purple-sm">
            <div className="relative w-16 h-16 flex items-center justify-center">
              <span className="text-2xl font-black text-white z-10">{score}</span>
              <div className="absolute inset-0 rounded-full border-4 border-vibepurple-500/20" />
              <div 
                className="absolute inset-0 rounded-full border-4 border-vibepurple-500 transition-all duration-1000" 
                style={{ clipPath: `inset(${100 - score}% 0 0 0)` }}
              />
            </div>
            <div>
              <div className="text-[10px] font-mono text-gray-500 uppercase tracking-widest font-bold">Security Score</div>
              <div className="text-sm font-bold text-vibepurple-500">{score >= 90 ? 'A - Secure' : score >= 70 ? 'B - Moderate' : 'C - Vulnerable'}</div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 mb-12">
        <div className="lg:col-span-1 glass-effect rounded-3xl p-8 space-y-8 border-white/5 h-fit">
          <div className="text-center">
            <div className="relative w-48 h-48 mx-auto mb-4">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={stats.length > 0 ? stats : [{ name: 'Secure', value: 1, color: '#1f2937' }]}
                    innerRadius={65}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {(stats.length > 0 ? stats : [{ name: 'Secure', value: 1, color: '#1f2937' }]).map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} stroke="none" />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-4xl font-black text-white">{totalVulns}</span>
                <span className="text-[10px] font-mono text-gray-500 uppercase tracking-widest font-bold">Verified Issues</span>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            {stats.map((stat, i) => (
              <div key={i} className="flex items-center justify-between p-3 rounded-xl bg-gray-950/50 border border-white/5">
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 rounded-full" style={{ backgroundColor: stat.color }} />
                  <span className="text-sm font-medium text-gray-300">{stat.name}</span>
                </div>
                <span className="text-xs font-mono font-bold text-white bg-white/5 px-2 py-1 rounded-md">{stat.value}</span>
              </div>
            ))}
          </div>

          <div className="pt-6 border-t border-white/5">
             <div className="flex items-center justify-between text-[10px] font-mono text-gray-500 uppercase mb-3">
               <span>Heuristic Noise</span>
               <span>{filteredVulns.length} Blocked</span>
             </div>
             <div className="p-3 rounded-xl bg-white/5 border border-white/5 flex items-center gap-3">
                <ShieldOff size={16} className="text-gray-600" />
                <span className="text-[11px] text-gray-400">DeepSeek successfully neutralized {filteredVulns.length} potential false positives.</span>
             </div>
          </div>
        </div>

        <div className="lg:col-span-3 space-y-12">
          <div className="space-y-4">
            <h2 className="text-xl font-bold text-white flex items-center gap-2 px-4 italic underline decoration-vibepurple-500/50 underline-offset-8">
              Verified Vulnerabilities
            </h2>

            {confirmedVulns.length === 0 ? (
              <div className="glass-effect rounded-3xl p-16 text-center border-dashed border-gray-800">
                <ShieldCheck className="mx-auto text-vibepurple-500 mb-4" size={48} />
                <h3 className="text-xl font-bold text-white mb-2">No Vulnerabilities Found</h3>
                <p className="text-gray-500">Your codebase adheres to all current security matrices and static checks.</p>
              </div>
            ) : (
              confirmedVulns.map(v => renderVulnCard(v))
            )}
          </div>

          {filteredVulns.length > 0 && (
            <div className="space-y-4 pt-12 border-t border-white/5">
              <div className="px-4">
                <h2 className="text-lg font-bold text-gray-500 uppercase tracking-widest flex items-center gap-3">
                   <ShieldOff size={20} className="text-gray-600" />
                   Neutralized Artifacts (False Positives)
                </h2>
                <p className="text-[10px] font-mono text-gray-600 mt-2">The following nodes were flagged by heuristics but rejected by DeepSeek V3 as non-exploitable noise.</p>
              </div>
              
              <div className="space-y-4">
                {filteredVulns.map(v => renderVulnCard(v, true))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
