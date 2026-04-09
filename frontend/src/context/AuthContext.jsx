import {
  createContext,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import { loginRequest, registerRequest } from "../api/auth";

export const AuthContext = createContext(null);

const readUserFromStorage = () => {
  const rawUser = localStorage.getItem("auth_user");
  if (!rawUser) {
    return null;
  }

  try {
    return JSON.parse(rawUser);
  } catch {
    return null;
  }
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(readUserFromStorage());
  const [token, setToken] = useState(localStorage.getItem("auth_token"));
  const [loading, setLoading] = useState(false);

  const persistSession = useCallback((nextToken, nextUser) => {
    localStorage.setItem("auth_token", nextToken);
    localStorage.setItem("auth_user", JSON.stringify(nextUser));
    setToken(nextToken);
    setUser(nextUser);
  }, []);

  const clearSession = useCallback(() => {
    localStorage.removeItem("auth_token");
    localStorage.removeItem("auth_user");
    setToken(null);
    setUser(null);
  }, []);

  const login = useCallback(
    async (email, password) => {
      setLoading(true);
      try {
        const response = await loginRequest({ email, password });
        persistSession(response.data.token, response.data.user);
      } finally {
        setLoading(false);
      }
    },
    [persistSession],
  );

  const register = useCallback(
    async (payload) => {
      setLoading(true);
      try {
        const response = await registerRequest(payload);
        persistSession(response.data.token, response.data.user);
      } finally {
        setLoading(false);
      }
    },
    [persistSession],
  );

  useEffect(() => {
    const onTokenExpired = () => {
      clearSession();
    };

    window.addEventListener("auth:expired", onTokenExpired);
    return () => {
      window.removeEventListener("auth:expired", onTokenExpired);
    };
  }, [clearSession]);

  const value = useMemo(
    () => ({
      user,
      token,
      loading,
      isAuthenticated: Boolean(token),
      login,
      register,
      logout: clearSession,
    }),
    [user, token, loading, login, register, clearSession],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
