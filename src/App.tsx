import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, onAuthStateChanged, signInWithPopup, signOut } from 'firebase/auth';
import { doc, getDoc, setDoc, onSnapshot } from 'firebase/firestore';
import { auth, db, googleProvider, OperationType, handleFirestoreError } from './firebase';
import { UserProfile } from './types';
import Layout from './components/Layout';
import Dashboard from './components/Dashboard';
import ReportForm from './components/ReportForm';
import SafetyResources from './components/SafetyResources';
import Profile from './components/Profile';
import { Shield, Loader2, LogIn } from 'lucide-react';

interface FirebaseContextType {
  user: User | null;
  profile: UserProfile | null;
  loading: boolean;
  signIn: () => Promise<void>;
  logout: () => Promise<void>;
}

const FirebaseContext = createContext<FirebaseContextType | undefined>(undefined);

export const useFirebase = () => {
  const context = useContext(FirebaseContext);
  if (!context) throw new Error('useFirebase must be used within a FirebaseProvider');
  return context;
};

type Tab = 'dashboard' | 'report' | 'resources' | 'profile';

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<Tab>('dashboard');

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        // Fetch or create user profile
        const userDocRef = doc(db, 'users', currentUser.uid);
        try {
          const userDoc = await getDoc(userDocRef);
          if (userDoc.exists()) {
            setProfile(userDoc.data() as UserProfile);
          } else {
            const newProfile: UserProfile = {
              uid: currentUser.uid,
              email: currentUser.email || '',
              displayName: currentUser.displayName || 'User',
              sosContacts: [],
              role: 'user',
            };
            await setDoc(userDocRef, newProfile);
            setProfile(newProfile);
          }
        } catch (error) {
          handleFirestoreError(error, OperationType.GET, `users/${currentUser.uid}`);
        }
      } else {
        setProfile(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const signIn = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (error) {
      console.error("Sign in error:", error);
    }
  };

  const logout = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-zinc-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 bg-emerald-600 rounded-2xl flex items-center justify-center text-white shadow-xl shadow-emerald-200 animate-pulse">
            <Shield size={32} />
          </div>
          <div className="flex items-center gap-2 text-zinc-400">
            <Loader2 size={16} className="animate-spin" />
            <span className="text-xs font-bold uppercase tracking-widest">Initializing Safety...</span>
          </div>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-zinc-50 flex items-center justify-center p-6">
        <div className="max-w-md w-full bg-white p-10 rounded-[40px] shadow-2xl shadow-zinc-200 border border-zinc-100 text-center space-y-8">
          <div className="w-20 h-20 bg-emerald-600 rounded-3xl flex items-center justify-center text-white shadow-2xl shadow-emerald-200 mx-auto transform -rotate-6">
            <Shield size={48} />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-zinc-900 tracking-tight">GuardianLink</h1>
            <p className="text-zinc-500 mt-3 leading-relaxed">
              A secure platform to combat human trafficking. Sign in to access emergency tools and report incidents.
            </p>
          </div>
          <button
            onClick={signIn}
            className="w-full py-4 bg-zinc-900 text-white rounded-2xl font-bold flex items-center justify-center gap-3 hover:bg-zinc-800 transition-all shadow-xl shadow-zinc-200 active:scale-95"
          >
            <LogIn size={20} />
            Continue with Google
          </button>
          <p className="text-[10px] text-zinc-400 uppercase tracking-widest font-bold">
            Secure • Confidential • Real-time
          </p>
        </div>
      </div>
    );
  }

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <Dashboard />;
      case 'report':
        return <ReportForm onSubmit={(report) => console.log('Report submitted:', report)} />;
      case 'resources':
        return <SafetyResources />;
      case 'profile':
        return <Profile />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <FirebaseContext.Provider value={{ user, profile, loading, signIn, logout }}>
      <Layout activeTab={activeTab} setActiveTab={setActiveTab}>
        {renderContent()}
      </Layout>
    </FirebaseContext.Provider>
  );
}
