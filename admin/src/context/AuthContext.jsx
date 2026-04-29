import { createContext, useContext, useEffect, useMemo, useState } from "react";
import api, { getCurrentUser, loginRequest } from "../utils/api";

const AuthContext = createContext(null);
const storageKey = "kalab_admin_auth";

function AuthProvider({ children }) {
  const [token, setToken] = useState(
    () => localStorage.getItem(storageKey) || "",
  );
  const [user, setUser] = useState(null);
  const [ready, setReady] = useState(false);

  // Sync token with Axios headers and LocalStorage
  useEffect(() => {
    if (token) {
      api.defaults.headers.common.Authorization = `Bearer ${token}`;
      localStorage.setItem(storageKey, token);
    } else {
      delete api.defaults.headers.common.Authorization;
      localStorage.removeItem(storageKey);
    }
  }, [token]);

  // Hydrate user profile on load/refresh
  useEffect(() => {
    async function hydrate() {
      if (!token) {
        setReady(true);
        return;
      }
      try {
        const nextUser = await getCurrentUser();
        setUser(nextUser);
      } catch (err) {
        console.error("Hydration failed:", err);
        setToken("");
        setUser(null);
      } finally {
        setReady(true);
      }
    }
    hydrate();
  }, [token]);

  const value = useMemo(
    () => ({
      token,
      user,
      ready,
      isAuthenticated: Boolean(token && user),

      async login(identifier, password) {
        try {
          // 1. Send as 'email' to match backend expectation
          // Note: your api.js already returns 'response.data.data'
          const result = await loginRequest({ email: identifier, password });

          console.log("Login Result from API:", result);

          // 2. Since your api.js returns response.data.data directly,
          // result IS the object containing { token, user }
          if (result && result.token) {
            setToken(result.token);
            setUser(result.user);
            return result;
          } else {
            throw new Error("Invalid response format from server");
          }
        } catch (error) {
          console.error("AuthContext Login Error:", error);
          // Standardize error message for the UI
          const message =
            error.response?.data?.message || error.message || "Login failed";
          throw new Error(message);
        }
      },

      logout() {
        setToken("");
        setUser(null);
      },
    }),
    [token, user, ready],
  );

  return (
    <AuthContext.Provider value={value}>
      {ready ? children : null}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}

export default AuthProvider;
