"use client";

import { useAuth } from "@/lib/store";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { Loader2 } from "lucide-react";

export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isPaid, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // If loading is finished and user hasn't paid, redirect them
    if (!loading && !isPaid) {
      router.push("/"); // Redirect to home or a pricing page
    }
  }, [isPaid, loading, router]);

  if (loading) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
      </div>
    );
  }

  // Only render children if paid
  return isPaid ? <>{children}</> : null;
}
