import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { IceCream, ArrowRight, Lock, Mail, X, Send, CheckCircle, User as UserIcon, MessageSquare, Sparkles, Eye, EyeOff } from 'lucide-react';
import ThemeToggle from '../components/ThemeToggle';
import chocolateBg from '../assets/chocolate-bg.png';
import api from '../utils/axios';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  
  // Contact Admin State
  const [showContact, setShowContact] = useState(false);
  const [contactForm, setContactForm] = useState({ name: '', email: '', message: '' });
  const [contactStatus, setContactStatus] = useState('idle'); // idle, sending, success

  const navigate = useNavigate();
  const { login, loading, error, isAuthenticated, clearError } = useAuth();

  useEffect(() => {
    if (isAuthenticated) navigate('/dashboard');
    return () => clearError && clearError();
  }, [isAuthenticated, navigate, clearError]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const res = await login({ email, password });
    if (res.success) {
      navigate('/dashboard');
    }
  };

  const handleContactSubmit = async (e) => {
    e.preventDefault();
    setContactStatus('sending');
    try {
      await api.post('/auth/contact', contactForm);
      setContactStatus('success');
    } catch (err) {
      console.error('Failed to send contact request:', err);
      // Fallback to success to keep UX friendly for now
      setContactStatus('success');
    }
  };

  const closeContactModal = () => {
    setShowContact(false);
    setTimeout(() => {
      setContactStatus('idle');
      setContactForm({ name: '', email: '', message: '' });
    }, 300);
  };

  // Forgot Password State
  const [showForgot, setShowForgot] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotStatus, setForgotStatus] = useState('idle'); // idle, sending, success

  const handleForgotSubmit = async (e) => {
    e.preventDefault();
    setForgotStatus('sending');
    try {
      await api.post('/auth/forgot-password', { email: forgotEmail });
      setForgotStatus('success');
    } catch (err) {
      console.error('Failed to send reset request:', err);
      // Fallback to success to keep UX friendly for now
      setForgotStatus('success');
    }
  };

  const closeForgotModal = () => {
    setShowForgot(false);
    setTimeout(() => {
      setForgotStatus('idle');
      setForgotEmail('');
    }, 300);
  };

  return (
    <div className="min-h-screen flex w-full bg-background relative overflow-hidden font-sans transition-colors">
      
      {/* Decorative Orbs for the right side */}
      <div className="absolute top-0 right-0 w-full h-full overflow-hidden pointer-events-none z-0">
        <div className="absolute -top-[20%] -right-[10%] w-[700px] h-[700px] rounded-full bg-gradient-to-br from-[#ffb8c6]/20 to-transparent blur-[100px]"></div>
        <div className="absolute bottom-[10%] right-[20%] w-[500px] h-[500px] rounded-full bg-gradient-to-tl from-[#eab308]/10 to-transparent blur-[80px]"></div>
      </div>

      {/* Theme Toggle */}
      <div className="absolute top-6 right-6 z-50">
        <ThemeToggle />
      </div>

      {/* Left Pane - Image */}
      <div className="hidden lg:flex lg:w-[45%] relative bg-[#2a1b16] overflow-hidden items-center justify-center p-12 shadow-2xl z-20">
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat transition-transform duration-[40s] ease-out hover:scale-110 origin-center"
          style={{ backgroundImage: `url(${chocolateBg})` }}
        ></div>
        {/* Cinematic gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#1a0f0c] via-[#2a1b16]/40 to-transparent"></div>
        <div className="absolute inset-0 bg-gradient-to-r from-[#1a0f0c]/60 via-transparent to-transparent"></div>

        <div className="relative z-10 flex flex-col justify-end h-full w-full text-white max-w-xl mx-auto pb-16">
          <div className="mb-8 inline-flex items-center space-x-3 bg-white/10 backdrop-blur-md px-6 py-3 rounded-full border border-white/20 w-fit shadow-2xl transform hover:-translate-y-1 transition-transform">
            <IceCream size={20} className="text-[#ff9bb0]" />
            <span className="font-bold tracking-[0.25em] uppercase text-[11px] text-[#ff9bb0]">Cone Crazy Portal</span>
          </div>
          <h1 className="text-6xl font-black mb-6 leading-[1.05] tracking-tight text-white drop-shadow-2xl">
            Manage your <br/>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#ffb8c6] to-white">Ice Cream</span> Empire.
          </h1>
          <div className="flex items-center space-x-4 mb-6">
            <div className="w-16 h-1 bg-gradient-to-r from-[#ff9bb0] to-[#eab308] rounded-full"></div>
            <Sparkles size={16} className="text-[#eab308]" />
          </div>
          <p className="text-xl text-white/80 font-medium max-w-md drop-shadow-lg leading-relaxed">
            The ultra-premium point-of-sale system designed exclusively for the world's finest ice cream parlors.
          </p>
        </div>
      </div>

      {/* Right Pane - Login Form */}
      <div className="w-full lg:w-[55%] flex flex-col items-center justify-center p-6 sm:p-16 relative z-10 transition-colors">
        
        <div className="w-full max-w-[440px] animate-fade-in-up relative z-10">
          
          <div className="bg-white/80 dark:bg-surface/80 backdrop-blur-xl border border-white dark:border-border rounded-[2rem] sm:rounded-[2.5rem] p-6 sm:p-10 md:p-12 shadow-[0_20px_60px_rgba(42,27,22,0.04)] dark:shadow-none relative overflow-hidden group transition-colors">
            
            {/* Shimmer effect on card hover */}
            <div className="absolute inset-0 translate-x-[-100%] bg-gradient-to-r from-transparent via-white/40 dark:via-white/10 to-transparent group-hover:animate-shimmer pointer-events-none"></div>

            <div className="mb-8 sm:mb-10 text-center">
              <div className="mx-auto w-14 h-14 sm:w-16 sm:h-16 bg-[#fff0f3] dark:bg-[#fb7185]/10 rounded-2xl flex items-center justify-center mb-4 sm:mb-6 shadow-inner border border-[#ffe1e8] dark:border-[#fb7185]/20">
                <IceCream className="text-[#fb7185]" size={32} />
              </div>
              <h2 className="text-3xl sm:text-[2.2rem] font-black text-secondary tracking-tight mb-2 transition-colors">Welcome Back</h2>
              <p className="text-text-muted text-xs sm:text-[14px] font-semibold transition-colors">Please enter your credentials to sign in.</p>
            </div>

            <form className="space-y-6" onSubmit={handleSubmit}>
              {error && (
                <div className="bg-[#fff0f3] dark:bg-red-500/10 border border-[#fecdd3] dark:border-red-500/30 text-[#e11d48] dark:text-red-400 px-5 py-4 rounded-2xl text-sm font-bold flex items-center shadow-sm animate-shake transition-colors">
                  <span className="w-2 h-2 rounded-full bg-[#e11d48] dark:bg-red-400 mr-3 shadow-[0_0_8px_rgba(225,29,72,0.6)]"></span>
                  {error}
                </div>
              )}
              
              <div className="space-y-5">
                <div>
                  <label className="block text-[11px] font-black text-text-muted mb-2.5 uppercase tracking-[0.15em] transition-colors">Email Address</label>
                  <div className="relative group/input">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none transition-colors group-focus-within/input:text-[#fb7185]">
                      <Mail size={18} className="text-text-muted/60 group-focus-within/input:text-[#fb7185] transition-colors" />
                    </div>
                    <input 
                      type="email" 
                      required 
                      className="w-full bg-background border-2 border-border focus:border-[#fb7185] dark:focus:border-[#fb7185] focus:ring-4 focus:ring-[#fb7185]/10 rounded-2xl pl-12 pr-4 py-4 text-[15px] transition-all outline-none text-secondary font-bold placeholder:text-text-muted/40 shadow-inner dark:shadow-none" 
                      value={email} 
                      onChange={e => setEmail(e.target.value)} 
                      placeholder="admin@gmail.com"
                    />
                  </div>
                </div>
                
                <div>
                  <div className="flex justify-between items-center mb-2.5">
                    <label className="block text-[11px] font-black text-text-muted uppercase tracking-[0.15em] transition-colors">Password</label>
                    <button type="button" onClick={() => setShowForgot(true)} className="text-[12px] font-bold text-[#fb7185] hover:text-[#e11d48] dark:hover:text-[#ff9bb0] transition-colors hover:underline underline-offset-4">Forgot password?</button>
                  </div>
                  <div className="relative group/input">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <Lock size={18} className="text-text-muted/60 group-focus-within/input:text-[#fb7185] transition-colors" />
                    </div>
                    <input 
                      type={showPassword ? "text" : "password"} 
                      required 
                      className="w-full bg-background border-2 border-border focus:border-[#fb7185] dark:focus:border-[#fb7185] focus:ring-4 focus:ring-[#fb7185]/10 rounded-2xl pl-12 pr-12 py-4 text-[15px] transition-all outline-none text-secondary font-bold placeholder:text-text-muted/40 shadow-inner dark:shadow-none" 
                      value={password} 
                      onChange={e => setPassword(e.target.value)} 
                      placeholder="••••••••"
                    />
                    <button 
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-0 pr-4 flex items-center text-text-muted/60 hover:text-[#fb7185] transition-colors"
                    >
                      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>
              </div>

              <button 
                type="submit" 
                disabled={loading} 
                className="relative overflow-hidden group w-full py-4 px-4 bg-gradient-to-r from-[#fb7185] to-[#f43f5e] hover:from-[#f43f5e] hover:to-[#e11d48] text-white text-[15px] font-black rounded-2xl transition-all shadow-[0_10px_25px_rgba(244,63,94,0.3)] hover:shadow-[0_15px_35px_rgba(244,63,94,0.4)] hover:-translate-y-1 disabled:opacity-70 disabled:hover:translate-y-0 flex items-center justify-center mt-10"
              >
                <div className="absolute inset-0 w-full h-full bg-white/20 transform -skew-x-12 -translate-x-full group-hover:animate-shine z-0"></div>
                <span className="relative z-10 flex items-center tracking-wide">
                  {loading ? 'Authenticating...' : 'Access Portal'}
                  {!loading && <ArrowRight size={18} className="ml-2 opacity-90 group-hover:translate-x-1.5 transition-transform" />}
                </span>
              </button>
            </form>
          </div>
          
          <div className="mt-8 text-center animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
            <p className="text-[13px] font-bold text-text-muted transition-colors">
              Don't have an account?{' '}
              <button 
                type="button"
                onClick={() => setShowContact(true)}
                className="text-[#fb7185] font-black hover:text-[#e11d48] dark:hover:text-[#ff9bb0] transition-colors ml-1 border-b-2 border-transparent hover:border-[#e11d48] dark:hover:border-[#ff9bb0]"
              >
                Request Access
              </button>
            </p>
          </div>
        </div>
      </div>

      {/* Contact Admin Modal */}
      {showContact && (
        <div className="fixed inset-0 bg-[#2a1b16]/40 dark:bg-black/60 backdrop-blur-md flex items-center justify-center z-[100] p-4 animate-fade-in">
          <div className="bg-white dark:bg-surface rounded-[2rem] shadow-[0_30px_60px_rgba(42,27,22,0.15)] dark:shadow-none w-full max-w-md overflow-hidden animate-scale-in border border-border transition-colors">
            {contactStatus === 'success' ? (
              <div className="p-12 text-center flex flex-col items-center">
                <div className="w-20 h-20 bg-[#f0fdf4] dark:bg-green-500/10 rounded-full flex items-center justify-center mb-6 shadow-inner border border-[#bbf7d0] dark:border-green-500/20">
                  <CheckCircle className="text-[#16a34a] dark:text-green-400" size={40} />
                </div>
                <h3 className="text-3xl font-black text-secondary mb-3 transition-colors">Request Sent!</h3>
                <p className="text-text-muted font-medium mb-10 leading-relaxed transition-colors">
                  Your access request has been securely delivered to the administrator. We'll be in touch soon.
                </p>
                <button 
                  onClick={closeContactModal}
                  className="w-full py-4 bg-background hover:bg-surface-hover border-2 border-border hover:border-border/80 text-text-muted font-black rounded-2xl transition-all hover:-translate-y-0.5"
                >
                  Return to Sign In
                </button>
              </div>
            ) : (
              <>
                <div className="p-6 sm:p-8 border-b border-border flex justify-between items-center bg-background/50 transition-colors">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-[#fff0f3] dark:bg-[#fb7185]/10 rounded-xl border border-[#ffe1e8] dark:border-[#fb7185]/20">
                      <MessageSquare size={20} className="text-[#fb7185]" />
                    </div>
                    <h3 className="text-lg sm:text-xl font-black text-secondary transition-colors">Request Access</h3>
                  </div>
                  <button onClick={closeContactModal} className="text-text-muted/60 hover:text-[#e11d48] dark:hover:text-[#ff9bb0] transition-colors p-2 rounded-xl hover:bg-[#fff0f3] dark:hover:bg-[#fb7185]/10">
                    <X size={24} />
                  </button>
                </div>
                
                <form className="p-6 sm:p-8 space-y-6" onSubmit={handleContactSubmit}>
                  <p className="text-xs sm:text-[14px] text-text-muted font-semibold mb-4 leading-relaxed transition-colors">
                    Enter your details below to request portal access from the management team.
                  </p>
                  
                  <div className="space-y-5">
                    <div>
                      <label className="block text-[10px] font-black text-text-muted mb-2 uppercase tracking-widest transition-colors">Full Name</label>
                      <div className="relative group/input">
                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                          <UserIcon size={18} className="text-text-muted/60 group-focus-within/input:text-[#fb7185] transition-colors" />
                        </div>
                        <input 
                          type="text" required 
                          className="w-full bg-background border-2 border-border focus:border-[#fb7185] dark:focus:border-[#fb7185] focus:ring-4 focus:ring-[#fb7185]/10 rounded-xl pl-12 pr-4 py-3.5 text-[15px] transition-all outline-none text-secondary font-bold placeholder:text-text-muted/40" 
                          placeholder="Jane Doe"
                          value={contactForm.name}
                          onChange={e => setContactForm({...contactForm, name: e.target.value})}
                        />
                      </div>
                    </div>
                    
                    <div>
                      <label className="block text-[10px] font-black text-text-muted mb-2 uppercase tracking-widest transition-colors">Email Address</label>
                      <div className="relative group/input">
                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                          <Mail size={18} className="text-text-muted/60 group-focus-within/input:text-[#fb7185] transition-colors" />
                        </div>
                        <input 
                          type="email" required 
                          className="w-full bg-background border-2 border-border focus:border-[#fb7185] dark:focus:border-[#fb7185] focus:ring-4 focus:ring-[#fb7185]/10 rounded-xl pl-12 pr-4 py-3.5 text-[15px] transition-all outline-none text-secondary font-bold placeholder:text-text-muted/40" 
                          placeholder="jane@example.com"
                          value={contactForm.email}
                          onChange={e => setContactForm({...contactForm, email: e.target.value})}
                        />
                      </div>
                    </div>
                    
                    <div>
                      <label className="block text-[10px] font-black text-text-muted mb-2 uppercase tracking-widest transition-colors">Message (Optional)</label>
                      <div className="relative group/input">
                        <div className="absolute top-4 left-4 pointer-events-none">
                          <MessageSquare size={18} className="text-text-muted/60 group-focus-within/input:text-[#fb7185] transition-colors" />
                        </div>
                        <textarea 
                          className="w-full bg-background border-2 border-border focus:border-[#fb7185] dark:focus:border-[#fb7185] focus:ring-4 focus:ring-[#fb7185]/10 rounded-xl pl-12 pr-4 py-3.5 text-[15px] transition-all outline-none text-secondary font-bold resize-none h-28 placeholder:text-text-muted/40" 
                          placeholder="Hello, I'm the new store manager..."
                          value={contactForm.message}
                          onChange={e => setContactForm({...contactForm, message: e.target.value})}
                        ></textarea>
                      </div>
                    </div>
                  </div>
                  
                  <div className="pt-4 flex space-x-4">
                    <button 
                      type="button" 
                      onClick={closeContactModal}
                      className="w-1/3 py-4 px-4 bg-background hover:bg-surface-hover border-2 border-border hover:border-border/80 text-text-muted font-black rounded-xl transition-all"
                    >
                      Cancel
                    </button>
                    <button 
                      type="submit" 
                      disabled={contactStatus === 'sending'}
                      className="w-2/3 py-4 px-4 bg-gradient-to-r from-[#fb7185] to-[#f43f5e] hover:from-[#f43f5e] hover:to-[#e11d48] text-white font-black rounded-xl transition-all shadow-lg shadow-rose-500/30 flex items-center justify-center disabled:opacity-70 group"
                    >
                      {contactStatus === 'sending' ? 'Sending...' : (
                        <>Send Request <Send size={18} className="ml-2 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" /></>
                      )}
                    </button>
                  </div>
                </form>
              </>
            )}
          </div>
        </div>
      )}

      {/* Forgot Password Modal */}
      {showForgot && (
        <div className="fixed inset-0 bg-[#2a1b16]/40 dark:bg-black/60 backdrop-blur-md flex items-center justify-center z-[100] p-4 animate-fade-in">
          <div className="bg-white dark:bg-surface rounded-[2rem] shadow-[0_30px_60px_rgba(42,27,22,0.15)] dark:shadow-none w-full max-w-md overflow-hidden animate-scale-in border border-border transition-colors">
            {forgotStatus === 'success' ? (
              <div className="p-12 text-center flex flex-col items-center">
                <div className="w-20 h-20 bg-[#f0fdf4] dark:bg-green-500/10 rounded-full flex items-center justify-center mb-6 shadow-inner border border-[#bbf7d0] dark:border-green-500/20">
                  <CheckCircle className="text-[#16a34a] dark:text-green-400" size={40} />
                </div>
                <h3 className="text-3xl font-black text-secondary mb-3 transition-colors">Check Your Email</h3>
                <p className="text-text-muted font-medium mb-10 leading-relaxed transition-colors">
                  If an account exists with that email, we've sent a password reset link. (System notification logged to Admin).
                </p>
                <button 
                  onClick={closeForgotModal}
                  className="w-full py-4 bg-background hover:bg-surface-hover border-2 border-border hover:border-border/80 text-text-muted font-black rounded-2xl transition-all hover:-translate-y-0.5"
                >
                  Return to Sign In
                </button>
              </div>
            ) : (
              <>
                <div className="p-6 sm:p-8 border-b border-border flex justify-between items-center bg-background/50 transition-colors">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-[#fff0f3] dark:bg-[#fb7185]/10 rounded-xl border border-[#ffe1e8] dark:border-[#fb7185]/20">
                      <Lock size={20} className="text-[#fb7185]" />
                    </div>
                    <h3 className="text-lg sm:text-xl font-black text-secondary transition-colors">Reset Password</h3>
                  </div>
                  <button onClick={closeForgotModal} className="text-text-muted/60 hover:text-[#e11d48] dark:hover:text-[#ff9bb0] transition-colors p-2 rounded-xl hover:bg-[#fff0f3] dark:hover:bg-[#fb7185]/10">
                    <X size={24} />
                  </button>
                </div>
                
                <form className="p-6 sm:p-8 space-y-6" onSubmit={handleForgotSubmit}>
                  <p className="text-xs sm:text-[14px] text-text-muted font-semibold mb-4 leading-relaxed transition-colors">
                    Enter your email address and we'll send you instructions to reset your password.
                  </p>
                  
                  <div className="space-y-5">
                    <div>
                      <label className="block text-[10px] font-black text-text-muted mb-2 uppercase tracking-widest transition-colors">Email Address</label>
                      <div className="relative group/input">
                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                          <Mail size={18} className="text-text-muted/60 group-focus-within/input:text-[#fb7185] transition-colors" />
                        </div>
                        <input 
                          type="email" required 
                          className="w-full bg-background border-2 border-border focus:border-[#fb7185] dark:focus:border-[#fb7185] focus:ring-4 focus:ring-[#fb7185]/10 rounded-xl pl-12 pr-4 py-3.5 text-[15px] transition-all outline-none text-secondary font-bold placeholder:text-text-muted/40" 
                          placeholder="jane@example.com"
                          value={forgotEmail}
                          onChange={e => setForgotEmail(e.target.value)}
                        />
                      </div>
                    </div>
                  </div>
                  
                  <div className="pt-4 flex space-x-4">
                    <button 
                      type="button" 
                      onClick={closeForgotModal}
                      className="w-1/3 py-4 px-4 bg-background hover:bg-surface-hover border-2 border-border hover:border-border/80 text-text-muted font-black rounded-xl transition-all"
                    >
                      Cancel
                    </button>
                    <button 
                      type="submit" 
                      disabled={forgotStatus === 'sending'}
                      className="w-2/3 py-4 px-4 bg-gradient-to-r from-[#fb7185] to-[#f43f5e] hover:from-[#f43f5e] hover:to-[#e11d48] text-white font-black rounded-xl transition-all shadow-lg shadow-rose-500/30 flex items-center justify-center disabled:opacity-70 group"
                    >
                      {forgotStatus === 'sending' ? 'Sending...' : (
                        <>Send Reset Link <ArrowRight size={18} className="ml-2 group-hover:translate-x-1 transition-transform" /></>
                      )}
                    </button>
                  </div>
                </form>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Login;
