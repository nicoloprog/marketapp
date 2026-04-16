"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  type ReactNode,
} from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase/client";
import type { User } from "@supabase/supabase-js";

// ─── TYPES ───────────────────────────────────────────────────────────────────

interface CustomUser extends User {
  name?: string;
  role?: string;
  isAdmin: boolean;
  isPaid: boolean;
}

interface AuthState {
  user: CustomUser | null;
  isAdmin: boolean;
  isPaid: boolean;
  loading: boolean;
  login: (
    email: string,
    password: string,
  ) => Promise<{ success: boolean; message: string }>;
  register: (
    email: string,
    password: string,
    name: string,
    confirmPassword: string,
  ) => Promise<{ success: boolean; message: string }>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthState | null>(null);

// ─── LOCKED FORM LOGIC (RATE LIMITING & VALIDATION) ──────────────────────────

const registerAttempts = new Map<
  string,
  { count: number; lastAttempt: number }
>();
const MAX_ATTEMPTS = 5;
const LOCKOUT_MS = 15 * 60 * 1000;

function isRateLimited(email: string) {
  const now = Date.now();
  const entry = registerAttempts.get(email);
  if (!entry) return false;
  if (now - entry.lastAttempt > LOCKOUT_MS) {
    registerAttempts.delete(email);
    return false;
  }
  return entry.count >= MAX_ATTEMPTS;
}

function trackAttempt(email: string) {
  const now = Date.now();
  const entry = registerAttempts.get(email);
  if (!entry || now - entry.lastAttempt > LOCKOUT_MS) {
    registerAttempts.set(email, { count: 1, lastAttempt: now });
  } else {
    entry.count += 1;
    entry.lastAttempt = now;
  }
}

// ─── AUTH PROVIDER ────────────────────────────────────────────────────────────

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<CustomUser | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const refreshUser = async () => {
    try {
      const {
        data: { user: authUser },
      } = await supabase.auth.getUser();
      if (!authUser) {
        setUser(null);
        return null;
      }

      // Fetch profile where role and is_paid are STRINGS
      const { data: profile } = await supabase
        .from("profiles")
        .select("name, role, is_paid")
        .eq("id", authUser.id)
        .single();

      // Convert String values to Booleans
      const roleStr = String(profile?.role || "USER").toUpperCase();
      const isPaidStr = String(profile?.is_paid || "false").toLowerCase();

      const formattedUser: CustomUser = {
        ...authUser,
        name: profile?.name || authUser.user_metadata?.name || "User",
        role: roleStr,
        isAdmin: roleStr === "ADMIN", // Compare string to "ADMIN"
        isPaid: isPaidStr === "true", // Compare string to "true"
      };

      setUser(formattedUser);
      return formattedUser;
    } catch (err) {
      setUser(null);
      return null;
    }
  };

  useEffect(() => {
    const initAuth = async () => {
      setLoading(true);
      await refreshUser();
      setLoading(false);
    };
    initAuth();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event) => {
      setLoading(true);
      const updatedUser = await refreshUser();
      if (event === "SIGNED_IN" && updatedUser) {
        router.push(updatedUser.isAdmin ? "/admin" : "/shop");
      } else if (event === "SIGNED_OUT") {
        router.push("/");
      }
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, [router]);

  // ─── ACTIONS ───────────────────────────────────────────────────────────────

  const login = async (email: string, password: string) => {
    const cleanEmail = email.trim().toLowerCase();
    if (isRateLimited(cleanEmail))
      return { success: false, message: "Rate limited. Try later." };

    trackAttempt(cleanEmail);
    setLoading(true);
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email: cleanEmail,
        password,
      });
      if (error) return { success: false, message: error.message };
      return { success: true, message: "Logged in" };
    } catch {
      return { success: false, message: "Error" };
    }
  };

  const register = async (
    email: string,
    password: string,
    name: string,
    confirmPassword: string,
  ) => {
    if (password !== confirmPassword)
      return { success: false, message: "Passwords mismatch" };
    setLoading(true);
    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: { data: { name } },
      });
      if (error) return { success: false, message: error.message };
      return { success: true, message: "Verify email" };
    } catch {
      return { success: false, message: "Error" };
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    setLoading(true);
    await supabase.auth.signOut();
    setUser(null);
    setLoading(false);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAdmin: user?.isAdmin || false,
        isPaid: user?.isPaid || false,
        loading,
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
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}

// interface CartContextType {

//   items: CartItem[];

//   addItem: (product: Product, quantity?: number) => void;

//   removeItem: (productId: string) => void;

//   updateQuantity: (productId: string, quantity: number) => void;

//   clearCart: () => void;

//   getTotal: () => number;

//   getItemCount: () => number;

//   products: Product[];

//   vehicle: { make: string; model: string; year: string } | null;

//   setVehicle: (v: { make: string; model: string; year: string } | null) => void;

// }

// const CartContext = createContext<CartContextType | null>(null);

// export function CartProvider({ children }: { children: ReactNode }) {

//   const [items, setItems] = useState<CartItem[]>([]);

//   const [products, setProducts] = useState<Product[]>([]);

//   const [vehicle, setVehicle] = useState<{

//     make: string;

//     model: string;

//     year: string;

//   } | null>(null);

//   useEffect(() => {

//     const fetchProducts = async () => {

//       try {

//         let data: Product[] = [];

//         if (vehicle) {

//           try {

//             const res = await fetch(

//               `/api/vehicle-parts?make=${vehicle.make}&model=${vehicle.model}&year=${vehicle.year}`,

//             );

//             if (!res.ok) throw new Error("Vehicle API failed");

//             data = await res.json();

//           } catch (err) {

//             console.warn(

//               "Vehicle-specific products not found, loading full catalog",

//               err,

//             );

//             toast.info(

//               "Vehicle-specific products not found, loading full catalog",

//             );

//           }

//         }

//         if (data.length === 0) {

//           const res = await fetch("/api/products");

//           if (!res.ok) throw new Error("Local products fetch failed");

//           data = await res.json();

//         }

//         setProducts(data);

//       } catch (err) {

//         console.error("Failed to load products:", err);

//         toast.error("Failed to load products");

//         setProducts([]);

//       }

//     };

//     fetchProducts();

//   }, [vehicle]);

//   const addItem = useCallback((product: Product, quantity = 1) => {

//     setItems((prev) => {

//       const existing = prev.find((i) => i.productId === product.id);

//       if (existing)

//         return prev.map((i) =>

//           i.productId === product.id

//             ? { ...i, quantity: i.quantity + quantity }

//             : i,

//         );

//       return [...prev, { productId: product.id, quantity, product }];

//     });

//   }, []);

//   const removeItem = useCallback(

//     (productId: string) =>

//       setItems((prev) => prev.filter((i) => i.productId !== productId)),

//     [],

//   );

//   const updateQuantity = useCallback(

//     (productId: string, quantity: number) => {

//       if (quantity <= 0) return removeItem(productId);

//       setItems((prev) =>

//         prev.map((i) => (i.productId === productId ? { ...i, quantity } : i)),

//       );

//     },

//     [removeItem],

//   );

//   const clearCart = useCallback(() => setItems([]), []);

//   const getTotal = useCallback(

//     () =>

//       items.reduce(

//         (sum, item) => sum + (item.product?.price ?? 0) * item.quantity,

//         0,

//       ),

//     [items],

//   );

//   const getItemCount = useCallback(

//     () => items.reduce((sum, item) => sum + item.quantity, 0),

//     [items],

//   );

//   return (

//     <CartContext.Provider

//       value={{

//         items,

//         addItem,

//         removeItem,

//         updateQuantity,

//         clearCart,

//         getTotal,

//         getItemCount,

//         products,

//         vehicle,

//         setVehicle,

//       }}

//     >

//       {children}

//     </CartContext.Provider>

//   );

// }
