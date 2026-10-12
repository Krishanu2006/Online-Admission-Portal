
import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
} from "react";

import {
  getCurrentUser,
  loginStudent,
  loginAdmin,
} from "../services/auth.api";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const refreshUser = useCallback(async () => {
    const token = localStorage.getItem("iem_token");

    if (!token) {
      setUser(null);
      throw new Error("Authentication required.");
    }

    const response = await getCurrentUser();
    const currentUser = response.data?.data ?? response.data;

    if (!currentUser) {
      throw new Error("Unable to retrieve the current user.");
    }

    const storedRole = localStorage.getItem("iem_role");

    if (currentUser.role !== storedRole) {
      throw new Error("Session role mismatch.");
    }

    setUser(currentUser);
    return currentUser;
  }, []);

  const login = async (email, password, role) => {
    const response =
      role === "ADMIN"
        ? await loginAdmin({ email, password })
        : await loginStudent({ email, password });

    const result = response.data?.data ?? response.data;

    if (!result?.token || !result?.user) {
      throw new Error("The server returned an invalid login response.");
    }

    if (result.user.role !== role) {
      throw new Error("You do not have access to this portal.");
    }

    localStorage.setItem("iem_token", result.token);
    localStorage.setItem("iem_role", result.user.role);

    setUser(result.user);

    return result.user;
  };

  const logout = useCallback(() => {
    localStorage.removeItem("iem_token");
    localStorage.removeItem("iem_role");
    setUser(null);
  }, []);

  useEffect(() => {
    let active = true;

    const restoreSession = async () => {
      const token = localStorage.getItem("iem_token");

      if (!token) {
        if (active) {
          setUser(null);
          setLoading(false);
        }
        return;
      }

      try {
        const response = await getCurrentUser();
        const currentUser = response.data?.data ?? response.data;

        if (!currentUser) {
          throw new Error("Unable to restore the user session.");
        }

        if (
          currentUser.role !== localStorage.getItem("iem_role")
        ) {
          throw new Error("Session role mismatch.");
        }

        if (active) {
          setUser(currentUser);
        }
      } catch (error) {
        localStorage.removeItem("iem_token");
        localStorage.removeItem("iem_role");

        if (active) {
          setUser(null);
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };

    restoreSession();

    return () => {
      active = false;
    };
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        logout,
        refreshUser,
        isAuthenticated: Boolean(user),
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }

  return context;
}
