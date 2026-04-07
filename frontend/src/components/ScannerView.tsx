import { Loader2, Terminal, AlertCircle } from 'lucide-react';
import { useState, useEffect } from 'react';
import { pollScan } from '../services/api';
import type { ScanResult } from '../types';

interface ScannerViewProps {
  scanId: string;
  onComplete: (data: ScanResult) => void;
  onFailed: () => void;
}

export const ScannerView = ({ scanId, onComplete, onFailed }: ScannerViewProps) => {
  const [logs, setLogs] = useState<string[]>(["[SYSTEM] Initializing scan infrastructure..."]);
  const [progress, setProgress] = useState(0);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    let pollAttempts = 0;
    
    const interval = setInterval(async () => {
      try {
        pollAttempts++;
        const result = await pollScan(scanId);
        
        // Progress bar heuristic
        setProgress((prev) => {
          if (result.status === 'complete') return 100;
          if (prev < 90) return prev + Math.floor(Math.random() * 8) + 1;
          return 90;
        });

        const statusLogs: Record<string, string> = {
          'pending': 'Scan queued. Connecting to GitHub...',
          'scanning': 'Fetching repository files... Running detectors...',
          'complete': 'Scan complete. Vulnerabilities found.',
          'failed': 'Scan failed. Check repo URL and try again.'
        };

        const currentLog = statusLogs[result.status];
        setLogs(prev => prev[prev.length - 1] === `[STATUS] ${currentLog}` ? prev : [...prev, `[STATUS] ${currentLog}`]);

        if (result.status === 'complete') {
          clearInterval(interval);
          onComplete(result);
        } else if (result.status === 'failed' || pollAttempts > 100) {
          clearInterval(interval);
          setErrorMsg("Scan encountered an error or timed out.");
        }
      } catch (err: any) {
        clearInterval(interval);
        setErrorMsg(err.response?.data?.error || "Network error polling scan status.");
      }
    }, 3000);

    return () => clearInterval(interval);
  }, [scanId, onComplete]);

  return (
    <div className="max-w-4xl mx-auto px-4 py-20 flex flex-col items-center">
      <div className="relative w-80 h-80 mb-12 flex items-center justify-center">
        {/* Radar Animation */}
        <div className="absolute inset-0 rounded-full border border-vibepurple-500/20 glow-purple-sm transition-all" />
        <div className="absolute inset-4 rounded-full border border-vibepurple-500/10" />
        <div className="absolute inset-8 rounded-full border border-vibepurple-500/10" />
        <div className="absolute inset-0 rounded-full bg-gradient-to-t from-vibepurple-500/10 to-transparent animate-spin duration-[3000ms]" />
        
        <div className="relative z-10 flex flex-col items-center">
          <Loader2 className="animate-spin text-vibepurple-500 mb-4" size={48} />
          <span className="text-2xl font-black text-white font-mono">{progress}%</span>
        </div>
      </div>

      <div className="w-full max-w-2xl">
        <div className="h-1 bg-gray-900 rounded-full overflow-hidden mb-8 border border-white/5">
          <div 
            className="h-full bg-vibepurple-500 shadow-[0_0_12px_rgba(124,58,237,0.5)] transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>

        {errorMsg ? (
          <div className="glass-effect rounded-2xl p-8 border-red-500/20 text-center">
            <AlertCircle className="mx-auto text-red-500 mb-4" size={40} />
            <h3 className="text-xl font-bold text-white mb-2">Scan Failed</h3>
            <p className="text-gray-400 mb-6 font-mono text-sm">{errorMsg}</p>
            <button 
              onClick={onFailed}
              className="bg-red-500 hover:bg-red-600 text-white px-8 py-3 rounded-xl font-bold transition-all shadow-lg active:scale-95"
            >
              Start Over
            </button>
          </div>
        ) : (
          <div className="glass-effect rounded-2xl overflow-hidden border-white/5 shadow-2xl shadow-indigo-500/5">
            <div className="bg-gray-950/80 px-4 py-2 flex items-center gap-2 border-b border-white/5">
              <Terminal size={14} className="text-vibepurple-500" />
              <span className="text-[10px] font-mono text-gray-500 uppercase tracking-widest font-bold">Scanning Event Logs</span>
            </div>
            <div className="p-6 font-mono text-xs space-y-2 h-48 overflow-y-auto">
              {logs.map((log, i) => (
                <div key={i} className="flex gap-4">
                  <span className="text-gray-600">[{new Date().toLocaleTimeString([], { hour12: false })}]</span>
                  <span className={log.startsWith('[S') ? "text-vibepurple-500" : "text-gray-300"}>{log}</span>
                </div>
              ))}
              <div className="animate-pulse text-vibepurple-500/50">_</div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
