import AsyncStorage from "@react-native-async-storage/async-storage";
import { setAuthTokenGetter, setBaseUrl } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import * as Notifications from "expo-notifications";
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

export interface AppUser {
  id: number;
  name: string;
  email: string;
  role: "student" | "teacher";
  school: string;
  subject?: string | null;
  status: string;
  avatarData?: string | null;
  createdAt: string;
}

interface AuthContextValue {
  user: AppUser | null;
  token: string | null;
  isLoading: boolean;
  setAuth: (token: string, user: AppUser) => Promise<void>;
  logout: () => Promise<void>;
  updateUser: (user: AppUser) => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

const TOKEN_KEY = "@sorucoz/token";
const USER_KEY = "@sorucoz/user";

let _token: string | null = null;

setAuthTokenGetter(() => _token);

async function registerPushToken(authToken: string, baseUrl: string) {
  try {
    const { granted } = await Notifications.requestPermissionsAsync();
    if (!granted) return;

    const tokenData = await Notifications.getExpoPushTokenAsync();
    const pushToken = tokenData.data;

    const url = baseUrl ? `https://${baseUrl}/api/users/me/push-token` : "/api/users/me/push-token";
    await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${authToken}`,
      },
      body: JSON.stringify({ token: pushToken }),
    });
  } catch {
    // Push token registration is non-critical, ignore errors
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AppUser | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const queryClient = useQueryClient();

  useEffect(() => {
    const domain = process.env.EXPO_PUBLIC_DOMAIN;
    if (domain) {
      setBaseUrl(`https://${domain}`);
    }

    AsyncStorage.multiGet([TOKEN_KEY, USER_KEY]).then(([tokenEntry, userEntry]) => {
      const storedToken = tokenEntry[1];
      const storedUser = userEntry[1];
      if (storedToken && storedUser) {
        _token = storedToken;
        setToken(storedToken);
        setUser(JSON.parse(storedUser));
        const domain = process.env.EXPO_PUBLIC_DOMAIN ?? "";
        registerPushToken(storedToken, domain);
      }
      setIsLoading(false);
    });
  }, []);

  const setAuth = useCallback(async (newToken: string, newUser: AppUser) => {
    _token = newToken;
    setToken(newToken);
    setUser(newUser);
    await AsyncStorage.multiSet([
      [TOKEN_KEY, newToken],
      [USER_KEY, JSON.stringify(newUser)],
    ]);
    const domain = process.env.EXPO_PUBLIC_DOMAIN ?? "";
    registerPushToken(newToken, domain);
  }, []);

  const logout = useCallback(async () => {
    _token = null;
    setToken(null);
    setUser(null);
    queryClient.clear();
    await AsyncStorage.multiRemove([TOKEN_KEY, USER_KEY]);
  }, [queryClient]);

  const updateUser = useCallback(
    (updated: AppUser) => {
      setUser(updated);
      AsyncStorage.setItem(USER_KEY, JSON.stringify(updated));
    },
    [],
  );

  const value = useMemo(
    () => ({ user, token, isLoading, setAuth, logout, updateUser }),
    [user, token, isLoading, setAuth, logout, updateUser],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
