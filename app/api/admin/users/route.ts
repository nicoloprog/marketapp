import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { createClient } from "@supabase/supabase-js";

type ProfileRow = {
  id: string;
  name: string | null;
  role: string | null;
  is_paid: boolean | null;
  updated_at: string | null;
  email: string | null;
};

type AdminUser = {
  id: string;
  name: string;
  role: string;
  isPaid: boolean;
  updatedAt: string | null;
  email: string | null;
};

async function createRouteClient() {
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll() {},
      },
    },
  );
}

function createAdminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    },
  );
}

async function requireAdmin() {
  const routeClient = await createRouteClient();

  const {
    data: { user },
    error: userError,
  } = await routeClient.auth.getUser();

  if (userError || !user) {
    return {
      error: NextResponse.json({ error: "Unauthorized" }, { status: 401 }),
    };
  }

  const { data: profile, error: profileError } = await routeClient
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .maybeSingle();

  const role = String(
    profile?.role || user.app_metadata?.role || user.user_metadata?.role || "",
  ).toUpperCase();

  if (profileError || role !== "ADMIN") {
    return {
      error: NextResponse.json({ error: "Forbidden" }, { status: 403 }),
    };
  }

  return { user };
}

export async function GET() {
  const auth = await requireAdmin();
  if ("error" in auth) {
    return auth.error;
  }

  const adminClient = createAdminClient();
  const { data, error } = await adminClient
    .from("profiles")
    .select("id, name, role, is_paid, updated_at, email")
    .order("updated_at", { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const users: AdminUser[] = ((data ?? []) as ProfileRow[]).map((profile) => ({
    id: profile.id,
    name: profile.name?.trim() || "User",
    role: String(profile.role || "USER").toUpperCase(),
    isPaid: Boolean(profile.is_paid),
    updatedAt: profile.updated_at,
    email: profile.email,
  }));

  return NextResponse.json({ users });
}

export async function PATCH(request: NextRequest) {
  const auth = await requireAdmin();
  if ("error" in auth) {
    return auth.error;
  }

  const body = await request.json();
  const userId = String(body.userId || "");
  const nextRole = body.role ? String(body.role).toUpperCase() : undefined;
  const nextName =
    typeof body.name === "string" ? body.name.trim().slice(0, 120) : undefined;
  const nextIsPaid =
    typeof body.isPaid === "boolean" ? body.isPaid : undefined;

  if (!userId) {
    return NextResponse.json({ error: "User id is required" }, { status: 400 });
  }

  if (nextRole && nextRole !== "ADMIN" && nextRole !== "USER") {
    return NextResponse.json({ error: "Invalid role" }, { status: 400 });
  }

  if (auth.user.id === userId && nextRole === "USER") {
    return NextResponse.json(
      { error: "You cannot remove your own admin access." },
      { status: 400 },
    );
  }

  if (
    nextRole === undefined &&
    nextName === undefined &&
    nextIsPaid === undefined
  ) {
    return NextResponse.json({ error: "No updates provided" }, { status: 400 });
  }

  const adminClient = createAdminClient();
  const profileUpdate: Record<string, unknown> = {};

  if (nextRole !== undefined) profileUpdate.role = nextRole;
  if (nextName !== undefined) profileUpdate.name = nextName;
  if (nextIsPaid !== undefined) profileUpdate.is_paid = nextIsPaid;

  const { error: updateError } = await adminClient
    .from("profiles")
    .update(profileUpdate)
    .eq("id", userId);

  if (updateError) {
    return NextResponse.json({ error: updateError.message }, { status: 500 });
  }

  try {
    const currentUserResult = await adminClient.auth.admin.getUserById(userId);

    if (!currentUserResult.error) {
      const existingUser = currentUserResult.data.user;

      await adminClient.auth.admin.updateUserById(userId, {
        user_metadata: {
          ...existingUser.user_metadata,
          ...(nextName !== undefined ? { name: nextName } : {}),
          ...(nextRole !== undefined ? { role: nextRole } : {}),
          ...(nextIsPaid !== undefined ? { is_paid: nextIsPaid } : {}),
        },
        app_metadata: {
          ...existingUser.app_metadata,
          ...(nextRole !== undefined ? { role: nextRole } : {}),
        },
      });
    }
  } catch {
    // The profiles table is the secure source of truth.
  }

  return NextResponse.json({ success: true });
}

export async function DELETE(request: NextRequest) {
  const auth = await requireAdmin();
  if ("error" in auth) {
    return auth.error;
  }

  const body = await request.json();
  const userId = String(body.userId || "");

  if (!userId) {
    return NextResponse.json({ error: "User id is required" }, { status: 400 });
  }

  if (auth.user.id === userId) {
    return NextResponse.json(
      { error: "You cannot delete your own admin account." },
      { status: 400 },
    );
  }

  const adminClient = createAdminClient();
  const { error } = await adminClient.auth.admin.deleteUser(userId);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
