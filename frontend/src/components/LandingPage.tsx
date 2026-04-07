import { Zap, Lock, Database, Key, EyeOff, Sparkles, FolderSearch, AlertTriangle, Bot } from 'lucide-react';

interface LandingPageProps {
  onGetStarted: () => void;
  onNavigateProduct: () => void;
  user: any;
}

export const LandingPage = ({ onGetStarted, onNavigateProduct, user }: LandingPageProps) => {
  return (
    <div className="min-h-screen bg-[#08070b] selection:bg-purple-500/30 overflow-x-hidden">
      {/* Hero Section */}
      <section className="relative pt-32 pb-20 flex flex-col items-center">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[800px] bg-varko-grid opacity-20 [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] pointer-events-none" />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-purple-500/10 blur-[120px] rounded-full pointer-events-none" />
        
        <div className="max-w-7xl mx-auto px-4 relative z-10 text-center flex flex-col items-center">
          <div className="varko-pill mb-8">
            <span className="varko-badge">Vibesec</span> {user ? `Welcome back, Operator.` : 'Next-Gen Security Experience.'}
          </div>
          <h1 className="text-5xl md:text-8xl font-bold tracking-tight text-white mb-8 leading-[1.1]">
            Helping Teams Build Better<br />
            <span className="varko-gradient-text">Software & Solutions</span>
          </h1>
          <p className="text-gray-400 text-lg md:text-xl max-w-2xl mx-auto font-medium mb-12">
            Build, launch, and scale your SaaS faster with a platform designed for modern teams. Secure code at the speed of thought.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 w-full max-w-md">
            <button 
              onClick={onGetStarted}
              className="flex-1 px-8 py-4 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold rounded-xl transition-all varko-glow-purple shadow-xl active:scale-95"
            >
              {user ? 'Go to Dashboard' : 'Get Started'}
            </button>
            <button 
              onClick={onNavigateProduct}
              className="flex-1 px-8 py-4 bg-white/5 border border-white/10 hover:bg-white/10 text-white font-bold rounded-xl transition-all active:scale-95"
            >
              {user ? 'Security History' : 'Live Demo'}
            </button>
          </div>
        </div>
      </section>

      {/* Problem Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            { icon: <Bot className="text-purple-400" />, title: "Automated Scanning", desc: "Public repositories are continuously scanned by bots, meaning vulnerabilities are often discovered shortly after." },
            { icon: <AlertTriangle className="text-purple-400" />, title: "Configuration Slips", desc: "Fast iterations can occasionally leave behind loose configurations, exposed tokens, or untested auth patterns." },
            { icon: <Zap className="text-purple-400" />, title: "Rapid Deployment", desc: "Modern development relies on AI and scaffolding, which often outpaces traditional, slower security reviews." }
          ].map((item, i) => (
            <div key={i} className="varko-glass p-8 rounded-2xl group hover:border-purple-500/30 transition-all">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-lg bg-purple-500/10 flex items-center justify-center border border-purple-500/20">
                  {item.icon}
                </div>
                <h3 className="text-lg font-bold text-white uppercase tracking-tight">{item.title}</h3>
              </div>
              <p className="text-gray-500 font-medium leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 border-t border-white/5 bg-white/[0.01]">
        <div className="max-w-7xl mx-auto px-4 text-center mb-16">
          <div className="varko-pill mb-8">
            <span className="varko-badge">Features</span> Simple. Smart. Scalable.
          </div>
          <h2 className="text-4xl md:text-6xl font-bold text-white tracking-tight mb-8">
            Advanced Features, Simple Experience <br />
            <span className="varko-gradient-text">Built For Speed And Scale</span>
          </h2>
          <p className="text-gray-400 text-lg max-w-3xl mx-auto">
            Powered by modern cloud technology, our SaaS platform combines speed, security and scalability. Each feature is thoughtfully engineered to deliver reliable performance.
          </p>
        </div>

        <div className="max-w-7xl mx-auto px-4 grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            { icon: <FolderSearch />, title: "Repo Scanning", desc: "Connects directly to your GitHub repository. No manual uploading or copy-pasting code required." },
            { icon: <Database />, title: "SQL Guardrails", desc: "Real-time analytics provide instant visibility into unsafe database query patterns and unsanitized inputs." },
            { icon: <Key />, title: "Exposed Secrets", desc: "Our intelligent data integration scans every file to find hardcoded API keys, ensuring a unified security posture." },
            { icon: <Lock />, title: "Auth Confidence", desc: "Make confident decisions backed by data. We flag broken authentication patterns and insecure session handling." },
            { icon: <EyeOff />, title: "IDOR Detection", desc: "Our platform tracks endpoints and request patterns to provide actionable alerts against unauthorized access routing." },
            { icon: <Sparkles />, title: "AI-Powered Fixes", desc: "Generate a precise, context-aware before-and-after code fix for every single issue it finds, in seconds." }
          ].map((feature, i) => (
            <div key={i} className="varko-glass p-10 rounded-[2rem] group hover:border-purple-500/30 transition-all text-left">
              <div className="w-16 h-16 rounded-2xl bg-white/5 flex items-center justify-center text-purple-400 mb-8 border border-white/5 group-hover:border-purple-500/20 group-hover:bg-purple-500/5 transition-all shadow-inner">
                {feature.icon}
              </div>
              <h3 className="text-xl font-bold text-white mb-3">{feature.title}</h3>
              <p className="text-gray-500 font-medium leading-relaxed">{feature.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-32 relative text-center">
        <div className="varko-pill mb-8 mx-auto">
            <span className="varko-badge">{user ? 'Launch' : 'Get Started'}</span> {user ? 'Return to Command' : 'Seamlessly Integrate'}
        </div>
        <h2 className="text-5xl md:text-7xl font-bold tracking-tight text-white mb-12">
            {user ? 'Resume your security' : 'Ready to secure your'} <br />
            <span className="varko-gradient-text">{user ? 'Audit History' : 'Production target?'}</span>
          </h2>
        <button 
          onClick={onGetStarted}
          className="px-10 py-5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold rounded-2xl transition-all varko-glow-purple scale-110 active:scale-105"
        >
          {user ? 'Open Dashboard' : 'Secure Your Application'}
        </button>
      </section>

      {/* Footer */}
      <footer className="py-12 border-t border-white/5 bg-[#08070b]">
        <div className="max-w-7xl mx-auto px-4 flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="flex items-center gap-2 font-bold text-xl">
            <div className="w-8 h-8 rounded-lg bg-purple-500/20 flex items-center justify-center border border-purple-500/30">
              <span className="text-purple-400 font-mono text-sm tracking-tighter">VS</span>
            </div>
            <span className="text-white">Vibesec</span>
          </div>
          <p className="text-gray-500 text-sm">
            &copy; {new Date().getFullYear()} Vibesec. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
};
