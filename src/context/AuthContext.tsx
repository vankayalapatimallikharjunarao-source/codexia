import React, { createContext, useContext, useState, useEffect } from "react";
import { User, sendEmailVerification } from "firebase/auth";
import { 
  auth, 
  signInWithGoogle, 
  loginWithEmail, 
  signupWithEmail, 
  resetPassword, 
  verifyUserEmail,
  logoutUser, 
  onAuthStateChangedListener,
  getAuthErrorMessage
} from "../firebase";
import { isWhitelistedAdminEmail } from "../config/adminEmails";

interface AuthContextType {
  currentUser: User | null;
  loading: boolean;
  isAdmin: boolean;
  authError: string | null;
  setAuthError: (error: string | null) => void;
  loginGoogle: () => Promise<User | null>;
  loginEmail: (email: string, password: string) => Promise<User | null>;
  signupEmail: (email: string, password: string) => Promise<User | null>;
  forgotPassword: (email: string) => Promise<boolean>;
  sendVerificationEmail: () => Promise<boolean>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export const checkIsAdmin = (emailStr?: string | null): boolean => {
  return isWhitelistedAdminEmail(emailStr);
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [authError, setAuthError] = useState<string | null>(null);

  const isAdmin = checkIsAdmin(currentUser?.email);

  useEffect(() => {
    const unsubscribe = onAuthStateChangedListener((user) => {
      setCurrentUser(user);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const loginGoogle = async (): Promise<User | null> => {
    setAuthError(null);
    try {
      const result = await signInWithGoogle();
      return result.user;
    } catch (err: any) {
      const msg = getAuthErrorMessage(err);
      setAuthError(msg);
      throw new Error(msg);
    }
  };

  const loginEmail = async (email: string, password: string): Promise<User | null> => {
    setAuthError(null);
    try {
      const result = await loginWithEmail(email, password);
      return result.user;
    } catch (err: any) {
      const code = err?.code || "";
      if (code === "auth/user-not-found" || code === "auth/invalid-credential") {
        try {
          const signupResult = await signupWithEmail(email, password);
          return signupResult.user;
        } catch (signupErr: any) {
          // Fall through to original error handling if signup also fails
        }
      }
      const msg = getAuthErrorMessage(err);
      setAuthError(msg);
      throw new Error(msg);
    }
  };

  const signupEmail = async (email: string, password: string): Promise<User | null> => {
    setAuthError(null);
    try {
      const result = await signupWithEmail(email, password);
      if (result.user) {
        try {
          await sendEmailVerification(result.user);
        } catch (e) {
          console.warn("Email verification dispatch error:", e);
        }
      }
      return result.user;
    } catch (err: any) {
      const msg = getAuthErrorMessage(err);
      setAuthError(msg);
      throw new Error(msg);
    }
  };

  const forgotPassword = async (email: string): Promise<boolean> => {
    setAuthError(null);
    try {
      await resetPassword(email);
      return true;
    } catch (err: any) {
      const msg = getAuthErrorMessage(err);
      setAuthError(msg);
      throw new Error(msg);
    }
  };

  const sendVerificationEmail = async (): Promise<boolean> => {
    setAuthError(null);
    try {
      await verifyUserEmail();
      return true;
    } catch (err: any) {
      const msg = getAuthErrorMessage(err);
      setAuthError(msg);
      throw new Error(msg);
    }
  };

  const logout = async (): Promise<void> => {
    setAuthError(null);
    try {
      await logoutUser();
    } catch (err: any) {
      const msg = getAuthErrorMessage(err);
      setAuthError(msg);
      throw new Error(msg);
    }
  };

  const value: AuthContextType = {
    currentUser,
    loading,
    isAdmin,
    authError,
    setAuthError,
    loginGoogle,
    loginEmail,
    signupEmail,
    forgotPassword,
    sendVerificationEmail,
    logout
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
