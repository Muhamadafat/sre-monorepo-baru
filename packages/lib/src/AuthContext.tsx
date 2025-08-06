// packages/lib/src/auth/AuthContext.tsx
'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { createClient } from './supabase'; // Import yang benar
import { User } from '@supabase/supabase-js';

interface AuthContextValue {
  user: User | null;
  loading: boolean;
  signOut: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const refreshUser = async () => {
    try {
      const supabase = createClient(); // Gunakan nama yang benar
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
    } catch (error) {
      console.error('Error fetching user:', error);
      setUser(null);
    }
  };

  const signOut = async () => {
    try {
      const supabase = createClient(); // Gunakan nama yang benar
      await supabase.auth.signOut();
      setUser(null);
      
      // Redirect ke main app signin - check if running in browser
      if (typeof window !== 'undefined') {
        const loginUrl = `${process.env.NEXT_PUBLIC_MAIN_APP_URL || 'http://main.lvh.me:3000'}/signin`;
        window.location.href = loginUrl;
      }
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  useEffect(() => {
    const initAuth = async () => {
      try {
        const supabase = createClient(); // Gunakan nama yang benar
        
        // Get initial session
        const { data: { session } } = await supabase.auth.getSession();
        setUser(session?.user ?? null);

        // Listen for auth changes
        const { data: { subscription } } = supabase.auth.onAuthStateChange(
          async (event, session) => {
            console.log('Auth state changed:', event, session?.user?.email);
            setUser(session?.user ?? null);
            setLoading(false);
          }
        );

        return () => {
          subscription.unsubscribe();
        };
      } catch (error) {
        console.error('Error initializing auth:', error);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    initAuth();
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, signOut, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
}

// Hook untuk mendapatkan user data yang sudah di-transform
export function useUserData() {
  const { user, loading } = useAuth();
  
  return {
    user: user ? {
      id: user.id,
      email: user.email || '',
      name: user.user_metadata?.name || user.email?.split('@')[0] || 'Unknown'
    } : null,
    loading
  };
}