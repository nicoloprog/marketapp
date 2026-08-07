"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { useRouter } from "next/navigation";
import type { User } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabase/client";

interface UserProfile {
  name: string | null;
  role: string | null;
  is_paid: string | boolean | null;
  subscription_plan?: string | null;
  search_limit_override?: number | null;
}

interface CustomUser extends User {
  name?: string;
  role?: string;
  subscriptionPlan?: string;
  searchLimitOverride?: number | null;
  isAdmin: boolean;
  isPaid: boolean;
}

interface AuthResult {
  success: boolean;
  message: string;
  redirectTo?: string;
}

interface AuthState {
  user: CustomUser | null;
  profile: UserProfile | null;
  isAdmin: boolean;
  isPaid: boolean;
  loading: boolean;
  login: (email: string, password: string) => Promise<AuthResult>;
  register: (
    email: string,
    password: string,
    name: string,
    confirmPassword: string,
  ) => Promise<AuthResult>;
  refreshUser: () => Promise<CustomUser | null>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthState | null>(null);

const loginAttempts = new Map<string, { count: number; lastAttempt: number }>();
const MAX_ATTEMPTS = 5;
const LOCKOUT_MS = 15 * 60 * 1000;

function isRateLimited(email: string) {
  const now = Date.now();
  const entry = loginAttempts.get(email);

  if (!entry) return false;

  if (now - entry.lastAttempt > LOCKOUT_MS) {
    loginAttempts.delete(email);
    return false;
  }

  return entry.count >= MAX_ATTEMPTS;
}

function trackAttempt(email: string) {
  const now = Date.now();
  const entry = loginAttempts.get(email);

  if (!entry || now - entry.lastAttempt > LOCKOUT_MS) {
    loginAttempts.set(email, { count: 1, lastAttempt: now });
    return;
  }

  entry.count += 1;
  entry.lastAttempt = now;
}

function toBoolean(value: string | boolean | null | undefined) {
  if (typeof value === "boolean") return value;
  return String(value || "false").toLowerCase() === "true";
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<CustomUser | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const refreshUser = async (): Promise<CustomUser | null> => {
    try {
      const {
        data: { user: authUser },
      } = await supabase.auth.getUser();

      if (!authUser) {
        setUser(null);
        setProfile(null);
        return null;
      }

      const { data: fetchedProfile, error: profileError } = await supabase
        .from("profiles")
        .select("name, role, is_paid, subscription_plan, search_limit_override")
        .eq("id", authUser.id)
        .maybeSingle();

      if (profileError) {
        console.error("Failed to load auth profile", profileError);
      }

      const normalizedProfile: UserProfile | null = fetchedProfile
        ? {
            name: fetchedProfile.name ?? null,
            role: fetchedProfile.role ? String(fetchedProfile.role) : null,
            is_paid: fetchedProfile.is_paid ?? null,
            subscription_plan: fetchedProfile.subscription_plan ?? null,
            search_limit_override: fetchedProfile.search_limit_override ?? null,
          }
        : null;

      const role = String(normalizedProfile?.role || "USER").toUpperCase();
      const formattedUser: CustomUser = {
        ...authUser,
        name: normalizedProfile?.name || authUser.user_metadata?.name || "User",
        role,
        subscriptionPlan: normalizedProfile?.subscription_plan || "free",
        searchLimitOverride: normalizedProfile?.search_limit_override ?? null,
        isAdmin: role === "ADMIN",
        isPaid: toBoolean(normalizedProfile?.is_paid),
      };

      setProfile(normalizedProfile);
      setUser(formattedUser);
      return formattedUser;
    } catch (error) {
      console.error("Failed to refresh auth user", error);
      setUser(null);
      setProfile(null);
      return null;
    }
  };

  useEffect(() => {
    let isMounted = true;

    const initAuth = async () => {
      setLoading(true);
      await refreshUser();
      if (isMounted) {
        setLoading(false);
      }
    };

    void initAuth();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event) => {
      void (async () => {
        if (isMounted) {
          setLoading(true);
        }

        await refreshUser();

        if (
          event === "SIGNED_IN" ||
          event === "SIGNED_OUT" ||
          event === "USER_UPDATED"
        ) {
          router.refresh();
        }

        if (isMounted) {
          setLoading(false);
        }
      })();
    });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, [router]);

  const login = async (
    email: string,
    password: string,
  ): Promise<AuthResult> => {
    const cleanEmail = email.trim().toLowerCase();

    if (isRateLimited(cleanEmail)) {
      return { success: false, message: "Too many attempts. Try again later." };
    }

    trackAttempt(cleanEmail);
    setLoading(true);

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email: cleanEmail,
        password,
      });

      if (error) {
        return { success: false, message: error.message };
      }

      const updatedUser = await refreshUser();
      if (!updatedUser) {
        return {
          success: false,
          message: "Signed in, but failed to load your account.",
        };
      }

      loginAttempts.delete(cleanEmail);

      return {
        success: true,
        message: "Logged in",
        redirectTo: updatedUser.isAdmin ? "/admin" : "/",
      };
    } catch {
      return { success: false, message: "Unable to sign in right now." };
    } finally {
      setLoading(false);
    }
  };

  const register = async (
    email: string,
    password: string,
    name: string,
    confirmPassword: string,
  ): Promise<AuthResult> => {
    const cleanEmail = email.trim().toLowerCase();
    const cleanName = name.trim().slice(0, 120);

    if (!cleanName) {
      return { success: false, message: "Name is required." };
    }

    if (password !== confirmPassword) {
      return { success: false, message: "Passwords do not match." };
    }

    if (password.length < 8) {
      return {
        success: false,
        message: "Password must be at least 8 characters.",
      };
    }

    setLoading(true);

    try {
      const { data, error } = await supabase.auth.signUp({
        email: cleanEmail,
        password,
        options: {
          data: { name: cleanName },
          emailRedirectTo:
            typeof window !== "undefined"
              ? `${window.location.origin}/auth/callback?next=/`
              : undefined,
        },
      });

      if (error) {
        return { success: false, message: error.message };
      }

      if (data.session && data.user) {
        await supabase.from("profiles").upsert(
          {
            id: data.user.id,
            name: cleanName,
            email: cleanEmail,
            role: "USER",
            is_paid: false,
            subscription_plan: "free",
            search_limit_override: null,
          },
          { onConflict: "id" },
        );

        const updatedUser = await refreshUser();

        return {
          success: true,
          message: "Account created successfully.",
          redirectTo: updatedUser?.isAdmin ? "/admin" : "/",
        };
      }

      return { success: true, message: "Verify your email to finish signup." };
    } catch {
      return { success: false, message: "Unable to create your account." };
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    setLoading(true);

    try {
      await supabase.auth.signOut();
      setUser(null);
      setProfile(null);
      router.replace("/");
      router.refresh();
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        isAdmin: user?.isAdmin ?? false,
        isPaid: user?.isPaid ?? false,
        loading,
        refreshUser,
        login,
        register,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);

  if (!ctx) {
    throw new Error("useAuth must be used within AuthProvider");
  }

  return ctx;
}
