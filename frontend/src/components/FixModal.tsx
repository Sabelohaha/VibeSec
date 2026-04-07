import { useState, useEffect, useRef } from 'react';
import ReactMarkdown from 'react-markdown';
import { X, Copy, Zap, AlertCircle, Send, User, Bot, Crown, Terminal } from 'lucide-react';
import { getAiFix, sendChatMessage, getChatHistory } from '../services/api';
import type { Vulnerability } from '../types';

interface Message {
  role: 'user' | 'model';
  content: string;
}

interface FixModalProps {
  vulnerability: Vulnerability;
  onClose: () => void;
  onNavigatePricing: () => void;
  onFixGenerated?: (fixMarkdown: string) => void;
}

export const FixModal = ({ vulnerability, onClose, onNavigatePricing, onFixGenerated }: FixModalProps) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const [usageCount, setUsageCount] = useState(0);
  const [error, setError] = useState<{ message: string, limit?: number, used?: number } | null>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    const initChat = async () => {
      try {
        setLoading(true);
        const { messages: history, totalUsed } = await getChatHistory(vulnerability.id);
        setUsageCount(totalUsed);

        if (history.length > 0) {
          setMessages(history.map(m => ({ role: m.role, content: m.content })));
        } else {
          // If no history, trigger the initial AI fix as the first message
          const initialFix = await getAiFix(vulnerability.id);
          setMessages([{ role: 'model', content: initialFix.response_markdown }]);
          if (onFixGenerated) onFixGenerated(initialFix.response_markdown);
          // Refresh total used count
          const { totalUsed: newTotal } = await getChatHistory(vulnerability.id);
          setUsageCount(newTotal);
        }
      } catch (err: any) {
        if (err.response?.status === 403 || err.response?.status === 429) {
          const { error: msg, limit, used } = err.response.data;
          setError({ message: msg, limit, used });
          if (used) setUsageCount(used);
        } else {
          setError({ message: err.response?.data?.error || "Failed to establish neural link." });
        }
      } finally {
        setLoading(false);
      }
    };

    initChat();
  }, [vulnerability.id]);

  const handleSend = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!inputValue.trim() || sending) return;

    const userMessage = inputValue.trim();
    setInputValue('');
    setSending(true);
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);

    try {
      const resp = await sendChatMessage(vulnerability.id, userMessage);
      setMessages(prev => [...prev, { role: 'model', content: resp.content }]);
      
      // Update usage count locally
      setUsageCount(prev => prev + 2); // 1 for user, 1 for model
    } catch (err: any) {
      if (err.response?.status === 403) {
        const { error: msg, limit, used } = err.response.data;
        setError({ message: msg, limit, used });
      } else {
        setMessages(prev => [...prev, { role: 'model', content: "SYSTEM ERROR: Connection to DeepSeek interrupted." }]);
      }
    } finally {
      setSending(false);
    }
  };

  const handleUpgrade = () => {
    onNavigatePricing();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-0 sm:p-4 bg-black/90 backdrop-blur-xl animate-in fade-in duration-300">
      <div 
        className="relative w-full max-w-5xl h-full sm:h-[90vh] glass-effect sm:rounded-[2.5rem] overflow-hidden shadow-2xl flex flex-col border border-white/10"
        onMouseDown={(e) => e.stopPropagation()}
      >
        {/* Header with Usage Meter */}
        <div className="bg-gray-950/80 border-b border-white/5 p-4 sm:p-6 flex flex-col sm:flex-row gap-4 sm:items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-vibepurple-500/20 flex items-center justify-center text-vibepurple-500 border border-vibepurple-500/30 overflow-hidden relative group">
              <Zap size={24} className="fill-vibepurple-500 relative z-10" />
              <div className="absolute inset-0 bg-vibepurple-500/10 animate-pulse" />
            </div>
            <div>
              <h2 className="text-xl font-black text-white tracking-tight flex items-center gap-2">
                Deep-Audit AI
                <span className="text-[10px] bg-vibepurple-500 text-white px-2 py-0.5 rounded-full font-mono uppercase">Live</span>
              </h2>
              <p className="text-[10px] font-mono text-gray-500 uppercase tracking-widest font-bold truncate max-w-[200px]">Node: {vulnerability.title}</p>
            </div>
          </div>

          <div className="flex items-center gap-6">
            <div className="flex flex-col items-end gap-1.5 min-w-[120px]">
              <div className="flex justify-between w-full text-[9px] font-mono font-black uppercase text-gray-400">
                <span>Intelligence Meter</span>
                <span className={usageCount >= 10 ? 'text-red-500' : 'text-vibepurple-400'}>{usageCount} / 10 Messages</span>
              </div>
              <div className="w-32 sm:w-48 h-1.5 bg-white/5 rounded-full overflow-hidden border border-white/5">
                <div 
                  className={`h-full transition-all duration-700 ${usageCount >= 10 ? 'bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.5)]' : 'bg-vibepurple-500 shadow-[0_0_10px_rgba(168,85,247,0.5)]'}`}
                  style={{ width: `${Math.min(100, (usageCount / 10) * 100)}%` }}
                />
              </div>
            </div>
            <button 
              onClick={onClose}
              className="p-3 bg-white/5 hover:bg-white/10 rounded-2xl text-gray-500 hover:text-white transition-all border border-white/5"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Chat Area */}
        <div className="flex-1 overflow-y-auto custom-scrollbar p-6 space-y-6 bg-gradient-to-b from-[#08070b] to-[#0d0c12]">
          {loading && (
            <div className="h-full flex flex-col items-center justify-center space-y-6">
              <div className="w-16 h-16 rounded-full border-4 border-vibepurple-500/20 border-t-vibepurple-500 animate-spin" />
              <p className="text-gray-500 font-mono text-sm uppercase tracking-widest animate-pulse">Establishing Secure Uplink...</p>
            </div>
          )}

          {!loading && error && messages.length === 0 && (
             <div className="h-full flex items-center justify-center">
                <div className="max-w-md w-full glass-effect p-8 rounded-3xl border-red-500/20 text-center space-y-6">
                  <AlertCircle size={64} className="text-red-500 mx-auto" />
                  <div className="space-y-2">
                    <h3 className="text-2xl font-black text-white">Access Deferred</h3>
                    <p className="text-gray-400 text-sm">{error.message}</p>
                  </div>
                  <button 
                    onClick={handleUpgrade}
                    className="w-full py-4 bg-vibepurple-600 hover:bg-vibepurple-500 text-white rounded-2xl font-black uppercase tracking-widest text-sm transition-all shadow-lg glow-purple-sm flex items-center justify-center gap-2"
                  >
                    <Crown size={18} />
                    Upgrade for Unlimited Access
                  </button>
                </div>
             </div>
          )}

          {messages.map((msg, idx) => (
            <div 
              key={idx} 
              className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} animate-in fade-in slide-in-from-bottom-2 duration-300`}
            >
              <div className={`flex gap-4 max-w-[85%] ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 border ${
                  msg.role === 'user' 
                    ? 'bg-vibepurple-500/20 border-vibepurple-500/30 text-vibepurple-400' 
                    : 'bg-gray-900 border-white/5 text-gray-500'
                }`}>
                  {msg.role === 'user' ? <User size={18} /> : <Bot size={18} />}
                </div>
                
                <div className={`varko-glass p-5 rounded-[2rem] border-white/5 relative group ${
                  msg.role === 'user' 
                    ? 'bg-vibepurple-500/10 !border-vibepurple-500/20 rounded-tr-none text-white' 
                    : 'bg-transparent rounded-tl-none prose prose-invert'
                }`}>
                  {msg.role === 'model' && (
                    <button 
                      onClick={() => navigator.clipboard.writeText(msg.content)}
                      className="absolute -top-2 -right-2 p-2 bg-gray-900 border border-white/10 rounded-xl text-gray-500 hover:text-white opacity-0 group-hover:opacity-100 transition-all shadow-xl z-20"
                      title="Copy full message"
                    >
                      <Copy size={12} />
                    </button>
                  )}
                  {msg.role === 'model' ? (
                    <ReactMarkdown
                      components={{
                        pre: ({node, ...props}) => (
                          <div className="relative group/code my-4">
                            <pre className="!bg-gray-950 !p-6 rounded-2xl border border-gray-800 overflow-x-auto font-mono text-sm" {...props} />
                            <button 
                              onClick={() => {
                                const code = (node?.children?.[0] as any)?.children?.[0]?.value || "";
                                navigator.clipboard.writeText(code);
                              }}
                              className="absolute top-4 right-4 p-2 bg-gray-900 border border-gray-800 rounded-lg text-gray-500 hover:text-white opacity-0 group-hover/code:opacity-100 transition-all"
                            >
                              <Copy size={14} />
                            </button>
                          </div>
                        ),
                        code: ({node, ...props}) => <code className="bg-gray-900 px-1.5 py-0.5 rounded text-vibepurple-400 font-mono" {...props} />,
                      }}
                    >
                      {msg.content}
                    </ReactMarkdown>
                  ) : (
                    <p className="text-sm font-medium leading-relaxed">{msg.content}</p>
                  )}
                </div>
              </div>
            </div>
          ))}

          {sending && (
            <div className="flex justify-start animate-in fade-in duration-300">
               <div className="flex gap-4">
                 <div className="w-10 h-10 rounded-xl bg-gray-900 border border-white/5 flex items-center justify-center text-gray-500 animate-pulse">
                   <Bot size={18} />
                 </div>
                 <div className="varko-glass px-6 py-4 rounded-[2rem] rounded-tl-none border-white/5 flex items-center gap-2">
                    <span className="w-1.5 h-1.5 bg-vibepurple-500 rounded-full animate-bounce [animation-delay:-0.3s]" />
                    <span className="w-1.5 h-1.5 bg-vibepurple-500 rounded-full animate-bounce [animation-delay:-0.15s]" />
                    <span className="w-1.5 h-1.5 bg-vibepurple-500 rounded-full animate-bounce" />
                 </div>
               </div>
            </div>
          )}
          <div ref={chatEndRef} />
        </div>

        {/* Input Area */}
        <div className="bg-gray-950/80 border-t border-white/5 p-6 sm:p-8">
          <form 
            onSubmit={handleSend}
            className="relative flex items-center gap-4 bg-[#0c0c12] border border-white/10 rounded-3xl p-2 pl-6 focus-within:border-vibepurple-500/50 transition-all shadow-inner"
          >
            <Terminal size={18} className="text-vibepurple-500/50" />
            <input 
              type="text" 
              placeholder={usageCount >= 10 ? "Intelligence quota exceeded..." : "Ask DeepSeek anything about this fix..."}
              disabled={usageCount >= 10 || sending || loading}
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              className="flex-1 bg-transparent border-none text-white text-sm focus:outline-none placeholder:text-gray-700 py-3"
            />
            <button 
              type="submit"
              disabled={usageCount >= 10 || !inputValue.trim() || sending}
              className={`p-3 rounded-2xl transition-all shadow-lg active:scale-95 flex items-center justify-center ${
                !inputValue.trim() || usageCount >= 10 || sending
                  ? 'bg-gray-800 text-gray-500 cursor-not-allowed'
                  : 'bg-vibepurple-600 hover:bg-vibepurple-500 text-white glow-purple-sm'
              }`}
            >
              <Send size={18} />
            </button>
          </form>
          {usageCount >= 10 && (
            <div className="mt-4 text-center">
              <button 
                onClick={handleUpgrade}
                className="text-[10px] font-mono text-vibepurple-400 hover:text-vibepurple-300 uppercase tracking-[0.2em] transition-all"
              >
                ++ DEPLOY PRO NODE FOR UNLIMITED INTELLIGENCE ++
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

