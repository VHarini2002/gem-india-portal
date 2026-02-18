import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import engineHero from '@/assets/engine-hero.jpg';
import { Lock, Mail, User, ArrowRight, AlertCircle } from 'lucide-react';

const Login = () => {
  const [tab, setTab] = useState<'client' | 'kam'>('client');
  const [isRegister, setIsRegister] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (login(email, password)) {
      navigate('/dashboard');
    } else {
      setError('Invalid credentials. Please try again.');
    }
  };

  const quickLogin = (email: string, password: string) => {
    if (login(email, password)) navigate('/dashboard');
  };

  return (
    <div className="min-h-screen flex">
      {/* Left side - Hero */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden items-center justify-center">
        <img src={engineHero} alt="Aerospace Engine" className="absolute inset-0 w-full h-full object-cover" />
        <div className="absolute inset-0" style={{ background: 'linear-gradient(135deg, rgba(30,60,120,0.75) 0%, rgba(10,30,80,0.5) 100%)' }} />
        <div className="relative z-10 px-12">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full mb-6" style={{ background: 'rgba(255,255,255,0.15)', backdropFilter: 'blur(10px)', border: '1px solid rgba(255,255,255,0.25)' }}>
              <span className="text-white text-xs font-heading font-semibold tracking-wider">ENGINE ASSET PLATFORM</span>
            </div>
            <h1 className="font-heading text-5xl font-bold text-white mb-4 leading-tight">GEM India</h1>
            <div className="h-1 w-16 rounded-full bg-white/60 mb-6" />
            <p className="font-body text-lg text-white/85 leading-relaxed max-w-md">
              Digital Engine Asset Visibility Platform
            </p>
            <p className="font-body text-sm text-white/65 mt-4 max-w-sm leading-relaxed">
              Complete lifecycle management for aerospace engine assets — from induction to teardown, repair, and beyond.
            </p>
          </motion.div>
        </div>
      </div>

      {/* Right side - Login Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center px-8 py-12 relative">
        <motion.div
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="relative z-10 w-full max-w-md"
        >
          {/* Mobile branding */}
          <div className="lg:hidden text-center mb-8">
            <h1 className="font-heading text-3xl font-bold text-primary">GEM India</h1>
            <p className="font-body text-sm text-muted-foreground mt-2">Digital Engine Asset Visibility Platform</p>
          </div>

          {/* Tab Switcher */}
          <div className="glass-card flex gap-1 p-1.5 rounded-2xl mb-6">
            {(['client', 'kam'] as const).map(t => (
              <button
                key={t}
                onClick={() => { setTab(t); setError(''); setIsRegister(false); }}
                className={`flex-1 py-2.5 rounded-xl font-heading text-sm font-semibold transition-all duration-300 ${
                  tab === t
                    ? 'bg-primary text-white shadow-sm'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                {t === 'client' ? 'Client Login' : 'KAM Login'}
              </button>
            ))}
          </div>

          {/* Form */}
          <div className="glass-card-glow p-8 rounded-2xl">
            <h2 className="font-heading text-xl font-bold text-foreground mb-1">
              {isRegister ? 'Create Account' : 'Welcome back'}
            </h2>
            <p className="font-body text-sm text-muted-foreground mb-6">
              {tab === 'client' ? 'Access your engine portfolio' : 'Key Account Manager portal'}
            </p>

            <form onSubmit={handleSubmit} className="space-y-4">
              {isRegister && (
                <div className="relative">
                  <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <input
                    type="text"
                    placeholder="Full Name"
                    className="w-full pl-10 pr-4 py-3 rounded-xl bg-white/60 border border-border focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none text-foreground font-body transition-all text-sm"
                  />
                </div>
              )}
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                  type="email"
                  placeholder="Email Address"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 rounded-xl bg-white/60 border border-border focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none text-foreground font-body transition-all text-sm"
                />
              </div>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                  type="password"
                  placeholder="Password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 rounded-xl bg-white/60 border border-border focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none text-foreground font-body transition-all text-sm"
                />
              </div>

              <AnimatePresence>
                {error && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="flex items-center gap-2 text-destructive text-sm font-body bg-destructive/8 p-3 rounded-lg"
                  >
                    <AlertCircle className="w-4 h-4 flex-shrink-0" />
                    {error}
                  </motion.div>
                )}
              </AnimatePresence>

              <button type="submit" className="w-full btn-primary flex items-center justify-center gap-2 py-3 rounded-xl text-sm">
                {isRegister ? 'Create Account' : 'Sign In'}
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>

            {tab === 'kam' && (
              <p className="text-center mt-4 text-sm text-muted-foreground font-body">
                {isRegister ? 'Already have an account?' : "Don't have an account?"}{' '}
                <button onClick={() => { setIsRegister(!isRegister); setError(''); }} className="text-primary font-semibold hover:underline">
                  {isRegister ? 'Sign In' : 'Register'}
                </button>
              </p>
            )}
          </div>

          {/* Quick Demo Access */}
          <div className="mt-4 glass-card p-4 rounded-2xl">
            <p className="font-heading text-xs font-semibold text-muted-foreground mb-3 uppercase tracking-wider">Quick Demo Access</p>
            <div className="grid grid-cols-2 gap-2">
              <button onClick={() => quickLogin('client1@gemindia.com', 'Client@123')} className="btn-secondary text-xs py-2.5 px-3 rounded-xl">
                Client Demo
              </button>
              <button onClick={() => quickLogin('kam@gemindia.com', 'KAM@123')} className="btn-secondary text-xs py-2.5 px-3 rounded-xl">
                KAM Demo
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Login;
