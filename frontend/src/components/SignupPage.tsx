import { useState } from 'react';
import { supabase } from '../services/supabase';
import { ArrowRight, User, Terminal, Briefcase, Search } from 'lucide-react';

interface SignupPageProps {
  onComplete: () => void;
}

export const SignupPage = ({ onComplete }: SignupPageProps) => {
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [otp, setOtp] = useState('');
  const [answers, setAnswers] = useState({
    who: '',
    purpose: '',
    position: '',
    source: ''
  });
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);

  const handleNext = () => setStep(s => s + 1);

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const { error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          survey_who: answers.who,
          survey_source: answers.source,
          survey_purpose: answers.purpose,
          survey_position: answers.position,
        }
      }
    });

    if (signUpError) {
      setError(signUpError.message);
      setLoading(false);
    } else {
      setLoading(false);
      setStep(6);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const { error: verifyError } = await supabase.auth.verifyOtp({
      email,
      token: otp,
      type: 'signup'
    });

    if (verifyError) {
      setError(verifyError.message);
      setLoading(false);
    } else {
      setLoading(false);
      onComplete();
    }
  };

  const handleResend = async () => {
    if (resendCooldown > 0) return;
    setError(null);
    const { error: resendError } = await supabase.auth.resend({
      type: 'signup',
      email: email
    });
    if (resendError) {
      setError(resendError.message);
    } else {
      setResendCooldown(60);
      const timer = setInterval(() => {
        setResendCooldown(c => {
          if (c <= 1) { clearInterval(timer); return 0; }
          return c - 1;
        });
      }, 1000);
    }
  };

  const renderStep = () => {
    switch(step) {
      case 1:
        return (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-8 duration-500">
            <div className="varko-pill mx-auto">
              <span className="varko-badge">Phase 01</span> Personality Assessment
            </div>
            <h2 className="text-4xl md:text-6xl font-bold text-white tracking-tight">Who are you?</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-2xl mx-auto">
              {['Developer', 'Founder', 'Security Researcher', 'Other'].map((option) => (
                <button
                  key={option}
                  onClick={() => { setAnswers({ ...answers, who: option }); handleNext(); }}
                  className={`p-6 rounded-2xl border transition-all text-left group ${
                    answers.who === option ? 'bg-purple-600/20 border-purple-500 text-white' : 'bg-white/5 border-white/10 text-gray-400 hover:border-white/20'
                  }`}
                >
                  <User className="mb-4 text-purple-400 group-hover:scale-110 transition-transform" />
                  <div className="font-bold text-lg">{option}</div>
                </button>
              ))}
            </div>
          </div>
        );
      case 2:
        return (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-8 duration-500">
            <div className="varko-pill mx-auto">
              <span className="varko-badge">Phase 02</span> Strategic Intent
            </div>
            <h2 className="text-4xl md:text-6xl font-bold text-white tracking-tight">How do you plan to use this?</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-2xl mx-auto">
              {['Professional Projects', 'Learning & Education', 'Commercial SaaS', 'Community Support'].map((option) => (
                <button
                  key={option}
                  onClick={() => { setAnswers({ ...answers, purpose: option }); handleNext(); }}
                  className={`p-6 rounded-2xl border transition-all text-left group ${
                    answers.purpose === option ? 'bg-purple-600/20 border-purple-500 text-white' : 'bg-white/5 border-white/10 text-gray-400 hover:border-white/20'
                  }`}
                >
                  <Terminal className="mb-4 text-purple-400 group-hover:scale-110 transition-transform" />
                  <div className="font-bold text-lg">{option}</div>
                </button>
              ))}
            </div>
          </div>
        );
      case 3:
        return (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-8 duration-500">
            <div className="varko-pill mx-auto">
              <span className="varko-badge">Phase 03</span> Operational Role
            </div>
            <h2 className="text-4xl md:text-6xl font-bold text-white tracking-tight">What position do you hold?</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-2xl mx-auto">
              {['Individual Contributor', 'Team Lead', 'CTO / Director', 'Independent Analyst'].map((option) => (
                <button
                  key={option}
                  onClick={() => { setAnswers({ ...answers, position: option }); handleNext(); }}
                  className={`p-6 rounded-2xl border transition-all text-left group ${
                    answers.position === option ? 'bg-purple-600/20 border-purple-500 text-white' : 'bg-white/5 border-white/10 text-gray-400 hover:border-white/20'
                  }`}
                >
                  <Briefcase className="mb-4 text-purple-400 group-hover:scale-110 transition-transform" />
                  <div className="font-bold text-lg">{option}</div>
                </button>
              ))}
            </div>
          </div>
        );
      case 4:
        return (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-8 duration-500">
            <div className="varko-pill mx-auto">
              <span className="varko-badge">Phase 04</span> Acquisition Channel
            </div>
            <h2 className="text-4xl md:text-6xl font-bold text-white tracking-tight">How did you hear about us?</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-2xl mx-auto">
              {['Social Media', 'Product Hunt', 'Word of Mouth', 'Search Engine'].map((option) => (
                <button
                  key={option}
                  onClick={() => { setAnswers({ ...answers, source: option }); handleNext(); }}
                  className={`p-6 rounded-2xl border transition-all text-left group ${
                    answers.source === option ? 'bg-purple-600/20 border-purple-500 text-white' : 'bg-white/5 border-white/10 text-gray-400 hover:border-white/20'
                  }`}
                >
                  <Search className="mb-4 text-purple-400 group-hover:scale-110 transition-transform" />
                  <div className="font-bold text-lg">{option}</div>
                </button>
              ))}
            </div>
          </div>
        );
      case 5:
        return (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-8 duration-500 max-w-md mx-auto">
            <div className="varko-pill mx-auto">
              <span className="varko-badge">Final Step</span> Secure Your Account
            </div>
            <h2 className="text-4xl font-bold text-white tracking-tight">One last thing.</h2>
            <form onSubmit={handleSignup} className="space-y-4">
              <input
                type="email"
                placeholder="Email Address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-[#0c0c12] border border-white/5 focus:border-purple-500/40 rounded-2xl px-6 py-4 text-white focus:outline-none"
                required
              />
              <input
                type="password"
                placeholder="Secure Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-[#0c0c12] border border-white/5 focus:border-purple-500/40 rounded-2xl px-6 py-4 text-white focus:outline-none"
                required
              />
              {error && <p className="text-red-500 text-xs font-bold uppercase tracking-widest">{error}</p>}
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white py-5 rounded-2xl font-bold text-lg flex items-center justify-center gap-3 transition-all varko-glow-purple shadow-xl disabled:opacity-50"
              >
                {loading ? 'Processing...' : 'Complete Initialization'}
                <ArrowRight size={20} />
              </button>
            </form>
          </div>
        );
      case 6:
        return (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-8 duration-500 max-w-md mx-auto">
            <div className="varko-pill mx-auto">
              <span className="varko-badge">Uplink Verification</span> Sequence Check
            </div>
            <div className="space-y-2">
              <h2 className="text-4xl font-bold text-white tracking-tight">Verify sequence.</h2>
              <p className="text-gray-500 text-sm font-mono uppercase tracking-widest">A 6-digit cryptographic token was sent to <span className="text-purple-400">{email}</span></p>
            </div>
            <form onSubmit={handleVerifyOtp} className="space-y-6">
              <input
                type="text"
                placeholder="0000000"
                maxLength={10}
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                className="w-full bg-[#0c0c12] border border-white/5 focus:border-purple-500/40 rounded-2xl px-6 py-6 text-center text-4xl font-black tracking-[0.2em] text-white focus:outline-none placeholder:text-gray-800"
                required
              />
              {error && <p className="text-red-500 text-xs font-bold uppercase tracking-widest">{error}</p>}
              <div className="space-y-4">
                <button
                  type="submit"
                  disabled={loading || otp.length < 6}
                  className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white py-5 rounded-2xl font-bold text-lg flex items-center justify-center gap-3 transition-all varko-glow-purple shadow-xl disabled:opacity-50"
                >
                  {loading ? 'Verifying...' : 'Authorize Access'}
                  <ArrowRight size={20} />
                </button>
                <button
                  type="button"
                  onClick={handleResend}
                  disabled={resendCooldown > 0}
                  className="w-full text-[10px] font-mono text-gray-500 hover:text-purple-400 uppercase tracking-widest transition-colors disabled:opacity-30"
                >
                  {resendCooldown > 0 ? `Resend available in ${resendCooldown}s` : 'Resend Verification Token'}
                </button>
              </div>
            </form>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-[#08070b] pt-32 pb-24 relative overflow-hidden">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[600px] bg-varko-grid opacity-20 [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-purple-500/5 blur-[120px] rounded-full pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 relative z-10 text-center">
        {renderStep()}
        
        {step < 7 && (
          <div className="mt-12 flex justify-center gap-2">
            {[1, 2, 3, 4, 5, 6].map((s) => (
              <div 
                key={s} 
                className={`w-12 h-1 rounded-full transition-all duration-500 ${s <= step ? 'bg-purple-500 shadow-[0_0_10px_rgba(168,85,247,0.5)]' : 'bg-white/10'}`} 
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
