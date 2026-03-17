import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function proxy(request: NextRequest) {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value),
          );
          response = NextResponse.next({
            request,
          });
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options),
          );
        },
      },
    },
  );

  const {
    data: { session },
  } = await supabase.auth.getSession();
  const user = session?.user;
  const pathname = request.nextUrl.pathname;

  // Normalize the role to Uppercase to prevent "admin" vs "ADMIN" bugs
  const rawRole = user?.app_metadata?.role || user?.user_metadata?.role;
  const role = typeof rawRole === "string" ? rawRole.toUpperCase() : null;

  // --- BINARY CHECK LOGS (Check your VS Code Terminal) ---
  if (pathname.startsWith("/admin") || pathname === "/login") {
    console.log("---------------------------------------");
    console.log(`🔍 Path: ${pathname}`);
    console.log(`👤 User: ${user?.email || "Not Logged In"}`);
    console.log(`🔑 Raw Role from DB: "${rawRole}"`);
    console.log(`🤖 Normalized Role: "${role}"`);
    console.log(`✅ Is Admin? ${role === "ADMIN"}`);
    console.log("---------------------------------------");
  }

  // 4. PROTECT THE ADMIN ROUTE
  if (pathname.startsWith("/admin")) {
    if (!user || role !== "ADMIN") {
      return NextResponse.redirect(new URL("/login", request.url));
    }
  }

  // 5. REDIRECT LOGGED-IN USERS AWAY FROM AUTH PAGES
  if ((pathname === "/login" || pathname === "/register") && user) {
    if (role === "ADMIN") {
      return NextResponse.redirect(new URL("/admin", request.url));
    }
    return NextResponse.redirect(new URL("/", request.url));
  }

  return response;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
