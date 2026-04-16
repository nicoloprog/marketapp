import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function proxy(request: NextRequest) {
  let response = NextResponse.next({
    request: { headers: request.headers },
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => request.cookies.getAll(),
        setAll: (cookiesToSet) => {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value),
          );
          response = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options),
          );
        },
      },
    },
  );

  // Use getUser() for better security than getSession()
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const pathname = request.nextUrl.pathname;

  let role = "USER";

  if (user) {
    // 1. Check Metadata
    const metaRole = user?.app_metadata?.role || user?.user_metadata?.role;

    if (metaRole) {
      role = String(metaRole).toUpperCase();
    } else {
      // 2. Fallback to Database if metadata is empty
      const { data: profile } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .single();

      role = profile?.role ? String(profile.role).toUpperCase() : "USER";
    }
  }

  // --- DEBUG LOGS ---
  // if (pathname.startsWith("/admin") || pathname === "/login") {
  //   console.log("---------------------------------------");
  //   console.log(`🔍 Path: ${pathname}`);
  //   console.log(`👤 User: ${user?.email || "Not Logged In"}`);
  //   console.log(`🤖 Final Resolved Role: "${role}"`);
  //   console.log(
  //     `✅ Is Admin? ${role === "ADMIN" || user?.email === "doe@gmail.com"}`,
  //   );
  //   console.log("---------------------------------------");
  // }

  // 4. PROTECT THE ADMIN ROUTE
  if (pathname.startsWith("/admin")) {
    const isDeveloper = user?.email === "doe@gmail.com";
    if (!user || role !== "ADMIN") {
      return NextResponse.redirect(new URL("/login", request.url));
    }
  }

  // 5. REDIRECT AWAY FROM LOGIN IF LOGGED IN
  if ((pathname === "/login" || pathname === "/register") && user) {
    const target = role === "ADMIN" ? "/admin" : "/shop";
    return NextResponse.redirect(new URL(target, request.url));
  }

  return response;
}
