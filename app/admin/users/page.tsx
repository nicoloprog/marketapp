"use client";

import { useEffect, useMemo, useState } from "react";
import { AdminLayout } from "@/components/admin/admin-layout";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "@/hooks/use-toast";
import { BarChart3, RefreshCw, Search, Shield, Trash2, Users } from "lucide-react";

type AdminUser = {
  id: string;
  name: string;
  role: string;
  isPaid: boolean;
  subscriptionPlan: "free" | "beginner" | "standard" | "business" | "custom";
  searchLimitOverride: number | null;
  monthlySearchLimit: number;
  monthlySearchUsed: number;
  updatedAt: string | null;
  email: string | null;
};

const planOptions = [
  { value: "free", label: "Free", limit: 0 },
  { value: "beginner", label: "Beginner", limit: 100 },
  { value: "standard", label: "Standard", limit: 500 },
  { value: "business", label: "Business", limit: 3000 },
  { value: "custom", label: "Custom", limit: null },
] as const;

function getPlanLimit(plan: AdminUser["subscriptionPlan"], customLimit: number | null) {
  if (plan === "custom") return Math.max(0, Math.floor(Number(customLimit || 0)));
  return planOptions.find((entry) => entry.value === plan)?.limit ?? 0;
}

function formatDate(value: string | null) {
  if (!value) return "Unknown";

  return new Intl.DateTimeFormat("en-CA", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

function shortId(value: string) {
  return `${value.slice(0, 8)}...${value.slice(-4)}`;
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [draftNames, setDraftNames] = useState<Record<string, string>>({});
  const [draftCustomLimits, setDraftCustomLimits] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("ALL");

  const fetchUsers = async () => {
    setLoading(true);

    try {
      const response = await fetch("/api/admin/users", { cache: "no-store" });
      const payload = await response.json();

      if (!response.ok) {
        throw new Error(payload.error || "Failed to load users");
      }

      const nextUsers = payload.users ?? [];
      setUsers(nextUsers);
      setDraftNames(
        Object.fromEntries(
          nextUsers.map((user: AdminUser) => [user.id, user.name]),
        ),
      );
      setDraftCustomLimits(
        Object.fromEntries(
          nextUsers.map((user: AdminUser) => [
            user.id,
            user.searchLimitOverride?.toString() ?? "",
          ]),
        ),
      );
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Failed to load users";
      toast({
        title: "Users unavailable",
        description: message,
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void fetchUsers();
  }, []);

  const filteredUsers = useMemo(() => {
    return users.filter((user) => {
      const haystack =
        `${user.name} ${user.email ?? ""} ${user.id}`.toLowerCase();
      const matchesSearch =
        search.trim() === "" || haystack.includes(search.trim().toLowerCase());
      const matchesRole = roleFilter === "ALL" || user.role === roleFilter;

      return matchesSearch && matchesRole;
    });
  }, [roleFilter, search, users]);

  const totalMonthlySearches = useMemo(
    () =>
      users.reduce((total, user) => total + Number(user.monthlySearchUsed || 0), 0),
    [users],
  );

  const updateUser = async (
    userId: string,
    updates: {
      name?: string;
      role?: string;
      isPaid?: boolean;
      subscriptionPlan?: AdminUser["subscriptionPlan"];
      searchLimitOverride?: number | null;
    },
  ) => {
    const previousUsers = users;
    setSavingId(userId);

    setUsers((current) =>
      current.map((user) =>
        user.id === userId
          ? {
              ...user,
              ...(updates.name !== undefined ? { name: updates.name } : {}),
              ...(updates.role !== undefined ? { role: updates.role } : {}),
              ...(updates.isPaid !== undefined
                ? { isPaid: updates.isPaid }
                : {}),
              ...(updates.subscriptionPlan !== undefined
                ? {
                    subscriptionPlan: updates.subscriptionPlan,
                    monthlySearchLimit: getPlanLimit(
                      updates.subscriptionPlan,
                      updates.searchLimitOverride ?? user.searchLimitOverride,
                    ),
                    isPaid: updates.subscriptionPlan !== "free",
                  }
                : {}),
              ...(updates.searchLimitOverride !== undefined
                ? {
                    searchLimitOverride: updates.searchLimitOverride,
                    monthlySearchLimit: getPlanLimit(
                      updates.subscriptionPlan ?? user.subscriptionPlan,
                      updates.searchLimitOverride,
                    ),
                  }
                : {}),
            }
          : user,
      ),
    );

    try {
      const response = await fetch("/api/admin/users", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId,
          name: updates.name,
          role: updates.role,
          isPaid: updates.isPaid,
          subscriptionPlan: updates.subscriptionPlan,
          searchLimitOverride: updates.searchLimitOverride,
        }),
      });

      const payload = await response.json();
      if (!response.ok) {
        throw new Error(payload.error || "Failed to update user");
      }

      toast({
        title: "User updated",
        description: "Profile access was saved securely.",
      });
    } catch (error) {
      setUsers(previousUsers);
      const message =
        error instanceof Error ? error.message : "Failed to update user";
      toast({
        title: "Update failed",
        description: message,
      });
    } finally {
      setSavingId(null);
    }
  };

  const deleteUser = async (userId: string, userLabel: string) => {
    const confirmed = window.confirm(
      `Delete ${userLabel}? This will permanently remove the user account.`,
    );

    if (!confirmed) return;

    const previousUsers = users;
    setSavingId(userId);
    setUsers((current) => current.filter((user) => user.id !== userId));

    try {
      const response = await fetch("/api/admin/users", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId }),
      });

      const payload = await response.json();
      if (!response.ok) {
        throw new Error(payload.error || "Failed to delete user");
      }

      toast({
        title: "User deleted",
        description: "The account was removed successfully.",
      });
    } catch (error) {
      setUsers(previousUsers);
      const message =
        error instanceof Error ? error.message : "Failed to delete user";
      toast({
        title: "Delete failed",
        description: message,
      });
    } finally {
      setSavingId(null);
    }
  };

  return (
    <AdminLayout>
      <div className="mb-8 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white">Users</h1>
          <p className="mt-1 text-sm text-slate-400">
            Securely manage names, roles, subscription plans, and monthly search
            limits from the profiles table.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="rounded-2xl border border-white/[.07] bg-white/[.03] px-4 py-3 text-sm text-slate-300">
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-blue-400" />
              {users.length} profiles
            </div>
          </div>
          <div className="rounded-2xl border border-white/[.07] bg-white/[.03] px-4 py-3 text-sm text-slate-300">
            <div className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4 text-emerald-400" />
              {totalMonthlySearches} searches this month
            </div>
          </div>
          <Button
            onClick={() => void fetchUsers()}
            disabled={loading}
            className="gap-2 bg-blue-600 text-white hover:bg-blue-500"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </Button>
        </div>
      </div>

      <div className="rounded-2xl border border-white/[.07] bg-[#080f1e] p-4">
        <div className="flex flex-col gap-3 lg:flex-row">
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
            <Input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search by name, email, or user id"
              className="border-white/[.08] bg-white/[.04] pl-9 text-white placeholder:text-slate-500"
            />
          </div>
          <Select value={roleFilter} onValueChange={setRoleFilter}>
            <SelectTrigger className="w-full border-white/[.08] bg-white/[.04] text-white lg:w-44">
              <SelectValue placeholder="Role" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All roles</SelectItem>
              <SelectItem value="ADMIN">Admins</SelectItem>
              <SelectItem value="USER">Users</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="mt-6 overflow-hidden rounded-2xl border border-white/[.07] bg-[#080f1e]">
        <div className="hidden lg:block">
          <table className="w-full">
            <thead className="border-b border-white/[.07] text-left text-[11px] uppercase tracking-[0.2em] text-slate-500">
              <tr>
                <th className="px-5 py-4">Profile</th>
                <th className="px-5 py-4">Email</th>
                <th className="px-5 py-4">Updated</th>
                <th className="px-5 py-4">Role</th>
                <th className="px-5 py-4">Plan</th>
                <th className="px-5 py-4">Monthly searches</th>
                <th className="px-5 py-4">Save</th>
                <th className="px-5 py-4">Delete</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map((user) => {
                const isSaving = savingId === user.id;
                const currentDraftName = draftNames[user.id] ?? user.name;
                const currentDraftLimit =
                  draftCustomLimits[user.id] ??
                  user.searchLimitOverride?.toString() ??
                  "";
                const searchRemaining = Math.max(
                  0,
                  user.monthlySearchLimit - user.monthlySearchUsed,
                );

                return (
                  <tr
                    key={user.id}
                    className="border-b border-white/[.06] last:border-0"
                  >
                    <td className="px-5 py-4">
                      <div className="space-y-2">
                        <Input
                          value={currentDraftName}
                          onChange={(event) =>
                            setDraftNames((current) => ({
                              ...current,
                              [user.id]: event.target.value,
                            }))
                          }
                          className="border-white/[.08] bg-white/[.04] text-white"
                        />
                        <p className="text-xs text-slate-500">{shortId(user.id)}</p>
                      </div>
                    </td>
                    <td className="px-5 py-4 text-sm text-slate-300">
                      {user.email ?? "No email"}
                    </td>
                    <td className="px-5 py-4 text-sm text-slate-400">
                      {formatDate(user.updatedAt)}
                    </td>
                    <td className="px-5 py-4">
                      <Select
                        value={user.role}
                        onValueChange={(value) =>
                          setUsers((current) =>
                            current.map((entry) =>
                              entry.id === user.id ? { ...entry, role: value } : entry,
                            ),
                          )
                        }
                        disabled={isSaving}
                      >
                        <SelectTrigger className="w-36 border-white/[.08] bg-white/[.04] text-white">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="USER">User</SelectItem>
                          <SelectItem value="ADMIN">Admin</SelectItem>
                        </SelectContent>
                      </Select>
                    </td>
                    <td className="px-5 py-4">
                      <div className="space-y-2">
                        <Select
                          value={user.subscriptionPlan}
                          onValueChange={(value: AdminUser["subscriptionPlan"]) =>
                            setUsers((current) =>
                              current.map((entry) =>
                                entry.id === user.id
                                  ? {
                                      ...entry,
                                      subscriptionPlan: value,
                                      isPaid: value !== "free",
                                      monthlySearchLimit: getPlanLimit(
                                        value,
                                        entry.searchLimitOverride,
                                      ),
                                    }
                                  : entry,
                              ),
                            )
                          }
                          disabled={isSaving}
                        >
                          <SelectTrigger className="w-36 border-white/[.08] bg-white/[.04] text-white">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {planOptions.map((plan) => (
                              <SelectItem key={plan.value} value={plan.value}>
                                {plan.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <Input
                          type="number"
                          min={0}
                          max={100000}
                          value={currentDraftLimit}
                          onChange={(event) =>
                            setDraftCustomLimits((current) => ({
                              ...current,
                              [user.id]: event.target.value,
                            }))
                          }
                          disabled={isSaving || user.subscriptionPlan !== "custom"}
                          placeholder="Custom limit"
                          className="w-36 border-white/[.08] bg-white/[.04] text-white disabled:opacity-40"
                        />
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <div className="space-y-1 text-sm">
                        <p className="font-medium text-slate-200">
                          {user.monthlySearchUsed} / {user.monthlySearchLimit}
                        </p>
                        <p className="text-xs text-slate-500">
                          {searchRemaining} remaining this month
                        </p>
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <Button
                        disabled={isSaving}
                        onClick={() =>
                          void updateUser(user.id, {
                            name: currentDraftName.trim() || "User",
                            role: user.role,
                            subscriptionPlan: user.subscriptionPlan,
                            searchLimitOverride:
                              user.subscriptionPlan === "custom"
                                ? Number(currentDraftLimit || 0)
                                : null,
                          })
                        }
                        className="gap-2 bg-blue-600 text-white hover:bg-blue-500"
                      >
                        <Shield className="h-4 w-4" />
                        Save
                      </Button>
                    </td>
                    <td className="px-5 py-4">
                      <Button
                        type="button"
                        variant="outline"
                        disabled={isSaving}
                        onClick={() =>
                          void deleteUser(user.id, currentDraftName.trim() || user.email || "this user")
                        }
                        className="border-red-500/30 bg-red-500/10 text-red-300 hover:bg-red-500/20"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <div className="grid gap-4 p-4 lg:hidden">
          {filteredUsers.map((user) => {
            const isSaving = savingId === user.id;
            const currentDraftName = draftNames[user.id] ?? user.name;
            const currentDraftLimit =
              draftCustomLimits[user.id] ??
              user.searchLimitOverride?.toString() ??
              "";
            const searchRemaining = Math.max(
              0,
              user.monthlySearchLimit - user.monthlySearchUsed,
            );

            return (
              <div
                key={user.id}
                className="rounded-2xl border border-white/[.07] bg-white/[.03] p-4"
              >
                <div className="mb-3 flex items-start justify-between gap-3">
                  <Badge
                    className={
                      user.role === "ADMIN"
                        ? "bg-blue-500/10 text-blue-300 hover:bg-blue-500/10"
                        : "bg-white/[.08] text-slate-200 hover:bg-white/[.08]"
                    }
                  >
                    {user.role}
                  </Badge>
                  <span className="text-xs text-slate-500">{shortId(user.id)}</span>
                </div>

                <div className="space-y-3">
                  <Input
                    value={currentDraftName}
                    onChange={(event) =>
                      setDraftNames((current) => ({
                        ...current,
                        [user.id]: event.target.value,
                      }))
                    }
                    className="border-white/[.08] bg-white/[.04] text-white"
                  />
                  <p className="text-xs text-slate-400">{user.email ?? "No email"}</p>
                  <p className="text-xs text-slate-500">
                    Updated {formatDate(user.updatedAt)}
                  </p>
                  <Select
                    value={user.role}
                    onValueChange={(value) =>
                      setUsers((current) =>
                        current.map((entry) =>
                          entry.id === user.id ? { ...entry, role: value } : entry,
                        ),
                      )
                    }
                    disabled={isSaving}
                  >
                    <SelectTrigger className="border-white/[.08] bg-white/[.04] text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="USER">User</SelectItem>
                      <SelectItem value="ADMIN">Admin</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select
                    value={user.subscriptionPlan}
                    onValueChange={(value: AdminUser["subscriptionPlan"]) =>
                      setUsers((current) =>
                        current.map((entry) =>
                          entry.id === user.id
                            ? {
                                ...entry,
                                subscriptionPlan: value,
                                isPaid: value !== "free",
                                monthlySearchLimit: getPlanLimit(
                                  value,
                                  entry.searchLimitOverride,
                                ),
                              }
                            : entry,
                        ),
                      )
                    }
                    disabled={isSaving}
                  >
                    <SelectTrigger className="border-white/[.08] bg-white/[.04] text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {planOptions.map((plan) => (
                        <SelectItem key={plan.value} value={plan.value}>
                          {plan.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Input
                    type="number"
                    min={0}
                    max={100000}
                    value={currentDraftLimit}
                    onChange={(event) =>
                      setDraftCustomLimits((current) => ({
                        ...current,
                        [user.id]: event.target.value,
                      }))
                    }
                    disabled={isSaving || user.subscriptionPlan !== "custom"}
                    placeholder="Custom monthly search limit"
                    className="border-white/[.08] bg-white/[.04] text-white disabled:opacity-40"
                  />
                  <div className="rounded-lg border border-white/[.07] bg-white/[.03] p-3 text-sm text-slate-300">
                    <p className="font-medium text-slate-100">
                      {user.monthlySearchUsed} / {user.monthlySearchLimit} searches
                    </p>
                    <p className="text-xs text-slate-500">
                      {searchRemaining} remaining this month
                    </p>
                  </div>
                  <Button
                    disabled={isSaving}
                    onClick={() =>
                      void updateUser(user.id, {
                        name: currentDraftName.trim() || "User",
                        role: user.role,
                        subscriptionPlan: user.subscriptionPlan,
                        searchLimitOverride:
                          user.subscriptionPlan === "custom"
                            ? Number(currentDraftLimit || 0)
                            : null,
                      })
                    }
                    className="w-full gap-2 bg-blue-600 text-white hover:bg-blue-500"
                  >
                    <Shield className="h-4 w-4" />
                    Save Changes
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    disabled={isSaving}
                    onClick={() =>
                      void deleteUser(
                        user.id,
                        currentDraftName.trim() || user.email || "this user",
                      )
                    }
                    className="w-full border-red-500/30 bg-red-500/10 text-red-300 hover:bg-red-500/20"
                  >
                    <Trash2 className="h-4 w-4" />
                    Delete User
                  </Button>
                </div>
              </div>
            );
          })}
        </div>

        {!loading && filteredUsers.length === 0 && (
          <div className="p-10 text-center text-sm text-slate-500">
            No profiles matched your search.
          </div>
        )}

        {loading && (
          <div className="p-10 text-center text-sm text-slate-500">
            Loading secure profile controls...
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
