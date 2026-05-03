import React, { createContext, useContext, useEffect, useState } from 'react';
import { 
  User, 
  onAuthStateChanged, 
  signInWithPopup, 
  GoogleAuthProvider, 
  signOut 
} from 'firebase/auth';
import { 
  doc, 
  getDoc, 
  setDoc, 
  onSnapshot,
  Timestamp
} from 'firebase/firestore';
import { auth, db } from '../lib/firebase';

interface UserProfile {
  email: string | null;
  subscriptionExpiry: Timestamp | null;
  subscriptionStatus: 'active' | 'expired' | 'none';
  packageType: '1month' | '6months' | '1year' | 'none';
}

interface AuthContextType {
  user: User | null;
  profile: UserProfile | null;
  loading: boolean;
  login: () => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setUser(user);
      
      if (user) {
        // Sync user profile from Firestore
        const userRef = doc(db, 'users', user.uid);
        
        // Use onSnapshot for real-time subscription status updates
        const unsubProfile = onSnapshot(userRef, (snapshot) => {
          if (snapshot.exists()) {
            const data = snapshot.data() as UserProfile;
            
            // Check if expired
            if (data.subscriptionExpiry && data.subscriptionExpiry.toMillis() < Date.now()) {
              setProfile({ ...data, subscriptionStatus: 'expired' });
            } else {
              setProfile(data);
            }
          } else {
            // New user, create initial profile
            const newProfile: UserProfile = {
              email: user.email,
              subscriptionExpiry: null,
              subscriptionStatus: 'none',
              packageType: 'none'
            };
            setDoc(userRef, newProfile);
            setProfile(newProfile);
          }
          setLoading(false);
        }, (error) => {
          console.error("Firestore Listen error:", error);
          setLoading(false);
        });

        return () => unsubProfile();
      } else {
        setProfile(null);
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  const login = async () => {
    const provider = new GoogleAuthProvider();
    await signInWithPopup(auth, provider);
  };

  const logout = () => signOut(auth);

  return (
    <AuthContext.Provider value={{ user, profile, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
