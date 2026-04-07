import { Check, ShieldAlert, Sparkles, Zap, HelpCircle } from 'lucide-react';
import { createCheckoutSession } from '../services/api';

interface PricingPageProps {
  user: any;
  onAuthClick: () => void;
}

export const PricingPage = ({ user, onAuthClick }: PricingPageProps) => {
  const handleUpgrade = async () => {
    if (!user) {
      onAuthClick();
      return;
    }

    try {
      const { url } = await createCheckoutSession();
      window.location.href = url;
    } catch (err) {
      console.error('Failed to initiate checkout', err);
    }
  };

  return (
    <div className="min-h-screen bg-[#08070b] pt-32 pb-24">
      <div className="max-w-7xl mx-auto px-4">
        <div className="text-center mb-20">
          <div className="varko-pill mb-8">
            <span className="varko-badge">Pricing</span> Scalable Packages For Every Stage
          </div>
          <h1 className="text-5xl md:text-7xl font-bold tracking-tight text-white mb-8">
            Scalable Packages For <br />
            <span className="varko-gradient-text">Every Stage</span>
          </h1>
          <p className="text-gray-400 text-lg md:text-xl max-w-2xl mx-auto font-medium">
            We have a plan that fits your needs each package includes powerful features built for modern development.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-stretch max-w-6xl mx-auto">

          {/* Hacker Tier */}
          <div className="varko-glass rounded-[2rem] p-10 flex flex-col group hover:border-white/10 transition-all">
            <div className="mb-10">
              <h3 className="text-2xl font-bold text-white mb-2">Hacker</h3>
              <p className="text-gray-500 font-medium">Perfect for indie devs testing out application analysis.</p>
              <div className="mt-8 flex items-baseline gap-1">
                <span className="text-5xl font-bold text-white">$0</span>
                <span className="text-gray-500 font-medium">/mo</span>
              </div>
            </div>
            <ul className="space-y-5 mb-10 flex-1">
              <li className="flex items-center gap-3 text-gray-300 font-medium">
                <div className="w-6 h-6 rounded-full bg-purple-500/10 flex items-center justify-center text-purple-400 border border-purple-500/20">
                  <Check size={14} />
                </div>
                1 Matrix Scan per Repo
              </li>
              <li className="flex items-center gap-3 text-gray-300 font-medium">
                <div className="w-6 h-6 rounded-full bg-purple-500/10 flex items-center justify-center text-purple-400 border border-purple-500/20">
                  <Check size={14} />
                </div>
                Basic Secret Detection
              </li>
              <li className="flex items-center gap-3 text-gray-400 font-medium opacity-50">
                <div className="w-6 h-6 rounded-full bg-white/5 flex items-center justify-center text-gray-600 border border-white/10">
                  <Check size={14} />
                </div>
                AI Remediation [Locked]
              </li>
            </ul>
            <button
              disabled
              className="w-full py-4 px-6 rounded-2xl font-bold text-gray-500 bg-white/5 border border-white/5 cursor-not-allowed"
            >
              Current Plan
            </button>
          </div>

          {/* Pro Tier */}
          <div className="relative group flex flex-col">
            <div className="absolute -inset-1 bg-gradient-to-r from-purple-600 to-indigo-600 rounded-[2rem] blur opacity-25 group-hover:opacity-40 transition duration-1000 group-hover:duration-200"></div>
            <div className="relative varko-glass rounded-[2rem] p-10 flex flex-col h-full border-purple-500/30 shadow-[0_0_40px_rgba(139,92,246,0.15)] bg-[#0c0c12]">
              <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-gradient-to-r from-purple-600 to-indigo-600 text-white text-[10px] font-black px-4 py-1.5 rounded-full uppercase tracking-widest border border-white/20 shadow-lg">
                Most Popular
              </div>
              
              <div className="mb-10">
                <h3 className="text-2xl font-bold text-white mb-2 flex items-center gap-2">
                  <Zap size={24} className="text-purple-400 fill-purple-400/20" />
                  Pro
                </h3>
                <p className="text-gray-400 font-medium">Unlimited power for securing production targets.</p>
                <div className="mt-8 flex items-baseline gap-1">
                  <span className="text-6xl font-bold text-white tracking-tight">$15</span>
                  <span className="text-gray-500 font-medium">/mo</span>
                </div>
              </div>
              
              <ul className="space-y-5 mb-10 flex-1">
                {[
                  { icon: <Zap size={14} />, text: "Unlimited Matrix Scans" },
                  { icon: <Sparkles size={14} />, text: "Unlimited AI Remediations" },
                  { icon: <ShieldAlert size={14} />, text: "Deep Configuration Analysis" },
                  { icon: <Check size={14} />, text: "Priority Support" }
                ].map((item, i) => (
                  <li key={i} className="flex items-center gap-3 text-white font-medium">
                    <div className="w-6 h-6 rounded-full bg-purple-500/20 flex items-center justify-center text-purple-300 border border-purple-500/30">
                      {item.icon}
                    </div>
                    {item.text}
                  </li>
                ))}
              </ul>
              
              <button
                onClick={handleUpgrade}
                className="w-full py-5 px-6 rounded-2xl font-bold text-white bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 transition-all varko-glow-purple shadow-xl active:scale-95"
              >
                Upgrade to Pro
              </button>
            </div>
          </div>

          {/* Enterprise Tier */}
          <div className="varko-glass rounded-[2rem] p-10 flex flex-col group hover:border-white/10 transition-all">
            <div className="mb-10 text-left">
              <h3 className="text-2xl font-bold text-white mb-2">Enterprise</h3>
              <p className="text-gray-500 font-medium">Custom deployment hardware and strict compliance.</p>
              <div className="mt-8">
                <span className="text-4xl font-bold text-white">Contact Us</span>
              </div>
            </div>
            <ul className="space-y-5 mb-10 flex-1">
              <li className="flex items-center gap-3 text-gray-400 font-medium">
                <div className="w-6 h-6 rounded-full bg-white/5 flex items-center justify-center text-gray-500 border border-white/10">
                  <Check size={14} />
                </div>
                On-Premise Deployment
              </li>
              <li className="flex items-center gap-3 text-gray-400 font-medium">
                <div className="w-6 h-6 rounded-full bg-white/5 flex items-center justify-center text-gray-500 border border-white/10">
                  <Check size={14} />
                </div>
                Custom API Hooks
              </li>
              <li className="flex items-center gap-3 text-gray-400 font-medium">
                <div className="w-6 h-6 rounded-full bg-white/5 flex items-center justify-center text-gray-500 border border-white/10">
                  <Check size={14} />
                </div>
                SOC2 Compliance Audits
              </li>
            </ul>
            <button
              onClick={() => window.open('mailto:enterprise@vibesec.com')}
              className="w-full py-4 px-6 rounded-2xl font-bold text-white bg-white/5 border border-white/10 hover:bg-white/10 transition-all"
            >
              Contact Sales
            </button>
          </div>

        </div>

        <div className="mt-20 text-center">
            <p className="text-gray-500 flex items-center justify-center gap-2 font-medium">
                <HelpCircle size={18} />
                Have questions? Speak to our team at support@vibesec.com
            </p>
        </div>
      </div>
    </div>
  );
};
