// ============================================================
// AuthContext – Global authentication state
// Tracks the Firebase Auth user + their Firestore profile
// ============================================================

import { createContext, useContext, useEffect, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "../firebase/config";
import { getUserDocument } from "../services/userService";
import { loginUser, logoutUser, registerUser } from "../services/authService";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);   // Firebase Auth user
  const [userProfile, setUserProfile] = useState(null);   // Firestore profile doc
  const [loading, setLoading] = useState(true);

  // Subscribe to Firebase Auth state changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);
      if (user) {
        const profile = await getUserDocument(user.uid);
        setUserProfile(profile);
      } else {
        setUserProfile(null);
      }
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  /**
   * Refresh the Firestore user profile (call after profile updates).
   */
  const refreshProfile = async () => {
    if (currentUser) {
      const profile = await getUserDocument(currentUser.uid);
      setUserProfile(profile);
    }
  };

  const register = async (data) => {
    const user = await registerUser(data);
    return user;
  };

  const login = async (data) => {
    const user = await loginUser(data);
    return user;
  };

  const logout = async () => {
    await logoutUser();
  };

  const value = {
    currentUser,
    userProfile,
    loading,
    register,
    login,
    logout,
    refreshProfile,
    isVendor: userProfile?.isVendor === true,
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
};

export default AuthContext;
