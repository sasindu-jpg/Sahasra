import React, { useEffect, useState } from 'react';
import { 
  collection, 
  query, 
  getDocs, 
  doc, 
  updateDoc, 
  Timestamp 
} from 'firebase/firestore';
import { db } from '../lib/firebase';
import { Users, Calendar, Shield, CheckCircle2, XCircle, Clock } from 'lucide-react';
import { motion } from 'motion/react';

interface UserProfile {
  id: string;
  email: string;
  subscriptionExpiry: Timestamp | null;
  subscriptionStatus: 'active' | 'expired' | 'none';
  packageType: '1month' | '6months' | '1year' | 'none';
}

export function AdminPanel() {
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const q = query(collection(db, 'users'));
      const snapshot = await getDocs(q);
      const userList = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as UserProfile[];
      setUsers(userList);
    } catch (error) {
      console.error("Error fetching users:", error);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const activateSubscription = async (userId: string, type: '1month' | '6months' | '1year') => {
    const now = new Date();
    let expiry = new Date();
    
    if (type === '1month') expiry.setMonth(now.getMonth() + 1);
    else if (type === '6months') expiry.setMonth(now.getMonth() + 6);
    else if (type === '1year') expiry.setFullYear(now.getFullYear() + 1);

    try {
      const userRef = doc(db, 'users', userId);
      await updateDoc(userRef, {
        subscriptionStatus: 'active',
        packageType: type,
        subscriptionExpiry: Timestamp.fromDate(expiry)
      });
      fetchUsers(); // Refresh
    } catch (error) {
      console.error("Error updating subscription:", error);
    }
  };

  const deactivateSubscription = async (userId: string) => {
    try {
      const userRef = doc(db, 'users', userId);
      await updateDoc(userRef, {
        subscriptionStatus: 'expired'
      });
      fetchUsers();
    } catch (error) {
      console.error("Error deactivating subscription:", error);
    }
  };

  return (
    <div className="min-h-screen bg-[#050505] text-white p-8">
      <div className="max-w-6xl mx-auto space-y-8">
        <header className="flex justify-between items-center bg-[#111] p-6 rounded-2xl border border-white/5">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-emerald-500/20 rounded-xl flex items-center justify-center">
              <Shield className="text-emerald-500 w-6 h-6" />
            </div>
            <div>
              <h1 className="text-xl font-black uppercase tracking-widest italic">System Control</h1>
              <p className="text-[10px] font-mono text-white/40 uppercase tracking-[0.3em]">User Management Console</p>
            </div>
          </div>
          <button 
            onClick={fetchUsers}
            className="px-4 py-2 bg-white/5 hover:bg-white/10 rounded-lg text-[10px] font-mono uppercase tracking-widest transition-all"
          >
            Refresh Database
          </button>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {users.map((user) => (
            <motion.div 
              key={user.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-[#111] border border-white/5 p-6 rounded-2xl space-y-6 hover:border-emerald-500/30 transition-all"
            >
              <div className="flex justify-between items-start">
                <div className="space-y-1">
                  <p className="text-[10px] font-mono text-emerald-500/60 uppercase tracking-widest">User Identity</p>
                  <p className="font-bold text-sm truncate max-w-[150px]">{user.email}</p>
                </div>
                <div className={`px-2 py-1 rounded text-[8px] font-black uppercase tracking-widest ${
                  user.subscriptionStatus === 'active' ? 'bg-emerald-500/20 text-emerald-400' : 
                  user.subscriptionStatus === 'expired' ? 'bg-red-500/20 text-red-400' : 'bg-white/10 text-white/40'
                }`}>
                  {user.subscriptionStatus}
                </div>
              </div>

              <div className="bg-black/30 p-4 rounded-xl space-y-3">
                <div className="flex justify-between text-[10px] font-mono uppercase tracking-widest text-white/40">
                  <span>Package:</span>
                  <span className="text-white">{user.packageType}</span>
                </div>
                <div className="flex justify-between text-[10px] font-mono uppercase tracking-widest text-white/40">
                  <span>Expires:</span>
                  <span className="text-white">
                    {user.subscriptionExpiry ? user.subscriptionExpiry.toDate().toLocaleDateString() : 'N/A'}
                  </span>
                </div>
              </div>

              <div className="space-y-2">
                <p className="text-[10px] font-mono text-white/40 uppercase tracking-widest mb-3">Provision Access</p>
                <div className="grid grid-cols-3 gap-2">
                  <button 
                    onClick={() => activateSubscription(user.id, '1month')}
                    className="py-2 bg-emerald-500/10 hover:bg-emerald-500 text-emerald-500 hover:text-black rounded-lg text-[9px] font-black uppercase transition-all"
                  >
                    1 Month
                  </button>
                  <button 
                    onClick={() => activateSubscription(user.id, '6months')}
                    className="py-2 bg-emerald-500/10 hover:bg-emerald-500 text-emerald-500 hover:text-black rounded-lg text-[9px] font-black uppercase transition-all"
                  >
                    6 Months
                  </button>
                  <button 
                    onClick={() => activateSubscription(user.id, '1year')}
                    className="py-2 bg-emerald-500/10 hover:bg-emerald-500 text-emerald-500 hover:text-black rounded-lg text-[9px] font-black uppercase transition-all"
                  >
                    1 Year
                  </button>
                </div>
                <button 
                  onClick={() => deactivateSubscription(user.id)}
                  className="w-full py-2 border border-red-500/20 hover:bg-red-500 text-red-500 hover:text-white rounded-lg text-[9px] font-black uppercase transition-all mt-4"
                >
                  Suspend Access
                </button>
              </div>
            </motion.div>
          ))}
        </div>

        {users.length === 0 && !loading && (
          <div className="text-center py-20 bg-[#111] rounded-3xl border border-white/5">
            <Users className="w-12 h-12 text-white/10 mx-auto mb-4" />
            <p className="text-white/40 font-mono text-xs uppercase tracking-[0.2em]">No users detected in sector</p>
          </div>
        )}
      </div>
    </div>
  );
}
