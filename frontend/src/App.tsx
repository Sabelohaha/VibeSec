import { useState, useEffect } from 'react';
import { LandingPage } from './components/LandingPage';
import { ProductPage } from './components/ProductPage';
import { SignupPage } from './components/SignupPage';
import { AdvancedProductDashboard } from './components/AdvancedProductDashboard';
import { PricingPage } from './components/PricingPage';
import { AboutPage } from './components/AboutPage';
import { ScannerView } from './components/ScannerView';
import { DashboardView } from './components/DashboardView';
import { FixModal } from './components/FixModal';
import { X } from 'lucide-react';
import { AuthModal, NavBar } from './components/AuthModal';
import { supabase } from './services/supabase';
import { submitScan, submitWebsiteScan, pollScan } from './services/api';
import type { Vulnerability, ScanResult } from './types';
import './index.css';

type ViewState = 'landing' | 'signup' | 'pricing' | 'product' | 'scanning' | 'results' | 'about';

function App() {
  const [view, setView] = useState<ViewState>('landing');
  const [scanId, setScanId] = useState<string | null>(null);
  const [scanResult, setScanResult] = useState<ScanResult | null>(null);
  const [selectedVuln, setSelectedVuln] = useState<Vulnerability | null>(null);
  const [user, setUser] = useState<any>(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastFixTime, setLastFixTime] = useState<number>(0);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => setError(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [error]);

  const handleStartScan = async (url: string, mode: 'repo' | 'website' = 'repo') => {
    if (!user) {
      setError("Please create an account or log in to scan.");
      setIsAuthModalOpen(true);
      return;
    }
    
    try {
      setError(null);
      const { scan_id } = mode === 'repo' ? await submitScan(url) : await submitWebsiteScan(url);
      setScanId(scan_id);
      setView('scanning');
    } catch (err: any) {
      setError(err.response?.data?.error || "Failed to initiate scan matrix.");
    }
  };

  const handleScanComplete = (result: ScanResult) => {
    setScanResult({ ...result, vulnerabilities: result.vulnerabilities || [] });
    setView('results');
  };

  const handleLoadScan = async (id: string) => {
    try {
      setError(null);
      const result = await pollScan(id);
      setScanResult({ ...result, vulnerabilities: result.vulnerabilities || [] });
      setView('results');
    } catch (err: any) {
      setError("Failed to load historical scan matrix.");
    }
  };

  const handleReset = () => {
    setView('product');
    setScanId(null);
    setScanResult(null);
    setSelectedVuln(null);
    setError(null);
  };

  const getCooldownRemaining = () => {
    const now = Date.now();
    const waitTime = 60 * 1000; // Reduced to 60s to allow 2/min flow
    const elapsed = now - lastFixTime;
    return Math.max(0, Math.ceil((waitTime - elapsed) / 1000));
  };

  return (
    <div className="min-h-screen bg-background text-gray-200 font-sans selection:bg-vibepurple-500/30">
      <NavBar 
        user={user} 
        onAuthClick={() => setIsAuthModalOpen(true)} 
        currentView={view} 
        navigate={setView} 
      />

      <main className="pt-16">
        {view === 'landing' && (
          <LandingPage 
            onGetStarted={() => user ? setView('product') : setView('signup')} 
            onNavigateProduct={() => setView('product')} 
            user={user}
          />
        )}

        {view === 'signup' && (
          <SignupPage onComplete={() => setView('product')} />
        )}

        {view === 'pricing' && (
          <PricingPage user={user} onAuthClick={() => setIsAuthModalOpen(true)} />
        )}

        {view === 'about' && (
          <AboutPage />
        )}

        {view === 'product' && (
          user ? (
            <AdvancedProductDashboard 
              onStartScan={handleStartScan} 
              onLoadScan={handleLoadScan}
              user={user} 
              cooldown={getCooldownRemaining()}
            />
          ) : (
            <ProductPage onStart={handleStartScan} />
          )
        )}
        
        {view === 'scanning' && scanId && (
          <ScannerView scanId={scanId} onComplete={handleScanComplete} onFailed={() => setView('product')} />
        )}
        
        {view === 'results' && scanResult && (
          <DashboardView 
            result={scanResult} 
            onFix={setSelectedVuln} 
            onReset={handleReset}
            user={user}
            cooldown={getCooldownRemaining()}
          />
        )}
      </main>

      {/* Error Toast */}
      {error && (
        <div className="fixed bottom-10 left-1/2 -translate-x-1/2 z-[100] animate-in fade-in slide-in-from-bottom-5 duration-300">
          <div className="varko-glass px-6 py-4 rounded-2xl border-red-500/30 bg-red-500/10 shadow-[0_0_30px_rgba(239,68,68,0.2)] flex items-center gap-4 border">
            <div className="w-8 h-8 rounded-lg bg-red-500/20 flex items-center justify-center border border-red-500/30">
              <span className="text-red-500 font-bold text-lg">!</span>
            </div>
            <div className="flex flex-col">
              <span className="text-[10px] font-bold text-red-500/70 uppercase tracking-widest mb-0.5">Matrix Exception</span>
              <span className="text-sm font-bold text-white pr-4">{error}</span>
            </div>
            <button 
              onClick={() => setError(null)}
              className="text-gray-500 hover:text-white transition-colors"
            >
              <X size={16} />
            </button>
          </div>
        </div>
      )}

      <AuthModal 
        isOpen={isAuthModalOpen} 
        onClose={() => setIsAuthModalOpen(false)} 
        onNavigateToSignup={() => setView('signup')}
      />

      {selectedVuln && (
        <FixModal 
          vulnerability={selectedVuln} 
          onClose={() => setSelectedVuln(null)} 
          onNavigatePricing={() => {
            setSelectedVuln(null);
            setView('pricing');
          }}
          onFixGenerated={(fixMarkdown) => {
            setLastFixTime(Date.now());
            if (scanResult) {
              setScanResult({
                ...scanResult,
                vulnerabilities: scanResult.vulnerabilities.map(v => 
                  v.id === selectedVuln.id ? { ...v, ai_fix: fixMarkdown } : v
                )
              });
            }
          }}
        />
      )}
    </div>
  );
}

export default App;
