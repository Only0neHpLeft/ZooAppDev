import React, { createContext, useContext, useEffect, useState } from 'react';
import { User } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';
import { useNotifications } from './NotificationContext';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, username: string) => Promise<{ email: string }>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  verifyOTP: (email: string, token: string) => Promise<void>;
}

interface NotificationPayload {
  id: string;
  title: string;
  message: string;
  type: 'success' | 'warning';
}

const ALLOWED_EMAIL_DOMAIN = '@educanet.cz';
const AUTH_ERROR_MESSAGES = {
  INVALID_DOMAIN: `Lze použít pouze email s doménou ${ALLOWED_EMAIL_DOMAIN}`,
  INVALID_CODE: 'Neplatný kód',
  UNKNOWN_ERROR: 'Neznámá chyba'
} as const;

const createNotificationId = (type: string) => `${type}_${Date.now()}`;

const createNotification = (
  type: string, 
  title: string, 
  message: string, 
  notificationType: NotificationPayload['type']
): NotificationPayload => ({
  id: createNotificationId(type),
  title,
  message,
  type: notificationType
});

const getErrorMessage = (error: unknown): string => {
  return error instanceof Error ? error.message : AUTH_ERROR_MESSAGES.UNKNOWN_ERROR;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const { addNotification } = useNotifications();

  useEffect(() => {
    const initializeAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setUser(session?.user ?? null);
      setLoading(false);
    };

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    initializeAuth();
    return () => subscription.unsubscribe();
  }, []);

  const handleAuthError = (error: unknown, operation: string) => {
    addNotification(createNotification(
      `${operation}_error`,
      `Chyba ${operation}`,
      getErrorMessage(error),
      'warning'
    ));
    throw error;
  };

  const signIn = async (email: string, password: string) => {
    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
      
      addNotification(createNotification(
        'login_success',
        'Přihlášení úspěšné',
        'Vítejte zpět!',
        'success'
      ));
    } catch (error) {
      handleAuthError(error, 'přihlášení');
    }
  };

  const signUp = async (email: string, password: string, username: string): Promise<{ email: string }> => {
    if (!email.endsWith(ALLOWED_EMAIL_DOMAIN)) {
      throw new Error(AUTH_ERROR_MESSAGES.INVALID_DOMAIN);
    }

    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: { data: { username } }
      });

      if (error) throw error;

      addNotification(createNotification(
        'verification_sent',
        'Ověřovací kód odeslán',
        'Zadejte 6-místný kód, který jsme vám poslali na email',
        'success'
      ));

      return { email: data.user?.email || email };
    } catch (error) {
      handleAuthError(error, 'registrace');
      throw error;
    }
  };

  const signOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
    } catch (error) {
      console.error('Error signing out:', error);
      throw error;
    }
  };

  const resetPassword = async (email: string) => {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email);
      if (error) throw error;
    } catch (error) {
      console.error('Error resetting password:', error);
      throw error;
    }
  };

  const verifyOTP = async (email: string, token: string) => {
    try {
      const { error } = await supabase.auth.verifyOtp({
        email,
        token,
        type: 'signup'
      });

      if (error) throw error;

      addNotification(createNotification(
        'verification_success',
        'Email ověřen',
        'Úspěšně jste se registrovali',
        'success'
      ));
    } catch (error) {
      handleAuthError(error, 'ověření');
    }
  };

  const contextValue: AuthContextType = {
    user,
    loading,
    signIn,
    signUp,
    signOut,
    resetPassword,
    verifyOTP
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};