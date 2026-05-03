import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Loader2, Lock, ShieldAlert, LogOut, ExternalLink, ShieldCheck } from 'lucide-react';
import { motion } from 'motion/react';

export function SubscriptionGuard({ children }: { children: React.ReactNode }) {
  const { user, profile, loading, login, logout } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0A0A0A] flex items-center justify-center">
        <div className="text-center space-y-4">
          <Loader2 className="w-12 h-12 text-emerald-500 animate-spin mx-auto" />
          <p className="text-xs font-mono tracking-[0.3em] text-emerald-500/50 uppercase">Securing Connection...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-[#0A0A0A] flex items-center justify-center p-6 bg-[radial-gradient(circle_at_center,_#111_0%,_#000_100%)]">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-md w-full bg-[#111] border border-white/10 p-10 rounded-3xl text-center space-y-8 shadow-2xl relative overflow-hidden"
        >
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-emerald-500 to-emerald-900" />
          
          <div className="w-20 h-20 bg-emerald-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
            <Lock className="w-10 h-10 text-emerald-500" />
          </div>
          
          <div className="space-y-2">
            <h1 className="text-3xl font-black italic uppercase tracking-tighter text-white">Access Restricted</h1>
            <p className="text-xs text-white/40 font-mono leading-relaxed uppercase tracking-widest">
              Please authenticate to use the Sahasra Order Manager processing unit
            </p>
          </div>

          <button 
            onClick={login}
            className="w-full bg-emerald-500 text-black py-4 rounded-xl font-black uppercase tracking-[0.2em] text-xs hover:shadow-[0_0_30px_rgba(16,185,129,0.4)] hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-3"
          >
            Authenticate with Google
          </button>
        </motion.div>
      </div>
    );
  }

  const isAdmin = user.email === 'sasindusenarath136@gmail.com'; 

  if (!isAdmin && (!profile || profile.subscriptionStatus !== 'active')) {
    return (
      <div className="min-h-screen bg-[#0A0A0A] flex items-center justify-center p-6">
         <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-xl w-full bg-[#111] border border-red-500/20 p-12 rounded-[2rem] text-center space-y-10 shadow-[0_0_50px_rgba(239,68,68,0.1)]"
        >
          <div className="w-24 h-24 bg-red-500/10 rounded-full flex items-center justify-center mx-auto ring-4 ring-red-500/5">
            <ShieldAlert className="w-12 h-12 text-red-500" />
          </div>
          
          <div className="space-y-4">
            <h1 className="text-4xl font-black italic tracking-tighter text-white uppercase">Subscription Required</h1>
            <div className="p-4 bg-red-500/5 rounded-xl border border-red-500/10 inline-block">
              <p className="text-xs font-mono text-red-400 uppercase tracking-widest">
                Status: {profile?.subscriptionStatus === 'expired' ? 'EXPIRED' : 'INACTIVE'}
              </p>
            </div>
          </div>

          <div className="space-y-6 text-white/40 text-sm leading-relaxed max-w-sm mx-auto">
            <p>Your access to the batch processing unit has been suspended. Please contact the system administrator to renew your package.</p>
            
            <div className="flex flex-col gap-3 font-mono text-[10px] uppercase tracking-widest bg-black/40 p-4 rounded-xl border border-white/5">
              <div className="flex justify-between">
                <span>User ID:</span>
                <span className="text-white/60">{user.uid.substring(0, 8)}...</span>
              </div>
              <div className="flex justify-between">
                <span>Email:</span>
                <span className="text-white/60">{user.email}</span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <button 
              onClick={logout}
              className="px-6 py-4 rounded-xl border border-white/10 hover:bg-white/5 font-bold uppercase text-[10px] tracking-widest transition-all flex items-center justify-center gap-2"
            >
              <LogOut className="w-4 h-4" />
              Sign Out
            </button>
            <a 
              href={`mailto:sasindusenarath136@gmail.com?subject=Subscription Renewal Request (UID: ${user.uid})`}
              className="px-6 py-4 rounded-xl bg-white text-black font-black uppercase text-[10px] tracking-widest hover:bg-emerald-400 transition-all flex items-center justify-center gap-2"
            >
              <ExternalLink className="w-4 h-4" />
              Contact Admin
            </a>
          </div>
        </motion.div>
      </div>
    );
  }

  // Active subscription or Admin
  return (
    <div className="relative">
      {isAdmin && (
         <div className="fixed bottom-4 left-4 z-[9999]">
            <div className="bg-emerald-500 text-black px-4 py-2 rounded-full font-black text-[10px] uppercase tracking-widest shadow-2xl flex items-center gap-2">
              <ShieldCheck className="w-3 h-3" />
              ADMIN MODE
            </div>
         </div>
      )}
      <button 
        onClick={logout}
        className="fixed top-4 right-4 z-[9999] opacity-20 hover:opacity-100 transition-all"
        title="Sign Out"
      >
        <div className="w-10 h-10 bg-white/5 backdrop-blur-md rounded-full flex items-center justify-center border border-white/10">
          <LogOut className="w-4 h-4 text-white" />
        </div>
      </button>
      {children}
    </div>
  );
}
