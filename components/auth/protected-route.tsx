"use client";

import { useAuth } from "@/lib/store";
import { useRouter } from "next/navigation";
import { useEffect, useRef } from "react";
import { Loader2 } from "lucide-react";

export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isPaid, loading } = useAuth();
  const router = useRouter();

  // Use a ref to track if we've already verified the user once
  // This prevents the "jump" during internal navigation
  const hasVerified = useRef(false);

  useEffect(() => {
    if (!loading) {
      if (!isPaid) {
        router.push("/");
      } else {
        hasVerified.current = true;
      }
    }
  }, [isPaid, loading, router]);

  // 1. Initial Load: Show the loader only on the very first mount
  if (loading && !hasVerified.current) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
      </div>
    );
  }

  // 2. Prevent UI "Flicker": If we aren't loading but not paid yet,
  // return null briefly while the router.push executes
  if (!isPaid && !loading) {
    return null;
  }

  // 3. Persistent Render: We return the children.
  // Even if 'loading' becomes true briefly in the background later,
  // the children stay mounted, preserving scroll position.
  return <>{children}</>;
}
