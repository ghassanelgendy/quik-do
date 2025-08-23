import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { auth } from "@/lib/firebase";
import {
  User,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  updateProfile,
  GoogleAuthProvider,
  signInWithPopup,
} from "firebase/auth";

type AuthContextValue = {
  user: User | null;
  loading: boolean;
  authToken: string | null;
  registerWithEmail: (email: string, password: string, displayName?: string) => Promise<void>;
  loginWithEmail: (email: string, password: string) => Promise<void>;
  loginWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [authToken, setAuthToken] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (fbUser) => {
      setUser(fbUser);
      
      if (fbUser) {
        // Get Firebase ID token for API authentication
        try {
          const token = await fbUser.getIdToken();
          setAuthToken(token);
          sessionStorage.setItem('authToken', token);
        } catch (error) {
          console.error('Error getting auth token:', error);
          setAuthToken(null);
          sessionStorage.removeItem('authToken');
        }
      } else {
        setAuthToken(null);
        sessionStorage.removeItem('authToken');
      }
      
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  // Periodic token refresh every 30 minutes
  useEffect(() => {
    if (!user) return;
    const intervalId = setInterval(async () => {
      try {
        const refreshed = await auth.currentUser?.getIdToken(true);
        if (refreshed) {
          setAuthToken(refreshed);
          sessionStorage.setItem('authToken', refreshed);
        }
      } catch (err) {
        console.error('Failed to refresh auth token:', err);
      }
    }, 30 * 60 * 1000);
    return () => clearInterval(intervalId);
  }, [user]);

  const registerWithEmail = async (email: string, password: string, displayName?: string) => {
    const credential = await createUserWithEmailAndPassword(auth, email, password);
    if (displayName) {
      await updateProfile(credential.user, { displayName });
    }
  };

  const loginWithEmail = async (email: string, password: string) => {
    await signInWithEmailAndPassword(auth, email, password);
  };

  const loginWithGoogle = async () => {
    const provider = new GoogleAuthProvider();
    await signInWithPopup(auth, provider);
  };

  const logout = async () => {
    await signOut(auth);
    sessionStorage.removeItem('authToken');
  };

  const value = useMemo<AuthContextValue>(() => ({
    user,
    loading,
    authToken,
    registerWithEmail,
    loginWithEmail,
    loginWithGoogle,
    logout,
  }), [user, loading, authToken]);

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
};



