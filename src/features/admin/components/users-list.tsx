"use client";

import { useMemo, useState } from "react";

import { UserRound } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { AdminFilterBar } from "@/features/admin/components/admin-filter-bar";
import { AdminPageHeader } from "@/features/admin/components/admin-page-header";
import { AdminSelect } from "@/features/admin/components/admin-select";
import { useI18n } from "@/i18n/client";
import type { Governorate, PlatformRole, PlatformUser } from "@/lib/types";
import { cn } from "@/lib/utils";

const ALL = "all";

/** every account on the platform, filterable by who they are and their standing */
export function AdminUsersList({
  users,
  governorates,
}: {
  users: PlatformUser[];
  governorates: Governorate[];
}) {
  const { t, lang } = useI18n();

  const [query, setQuery] = useState("");
  const [role, setRole] = useState(ALL);
  const [status, setStatus] = useState(ALL);

  const roleLabel: Record<PlatformRole, string> = {
    user: t.admin.roleUser,
    owner: t.admin.roleOwner,
    agent: t.admin.roleAgent,
    waiter: t.admin.roleWaiter,
    admin: t.admin.roleAdmin,
  };

  const hasFilters = query.trim() !== "" || role !== ALL || status !== ALL;

  const clear = () => {
    setQuery("");
    setRole(ALL);
    setStatus(ALL);
  };

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return users.filter((user) => {
      if (role !== ALL && user.role !== role) return false;
      if (status !== ALL && user.status !== status) return false;
      if (
        q &&
        !user.name.toLowerCase().includes(q) &&
        !user.phone.replace(/\s/g, "").includes(q.replace(/\s/g, ""))
      )
        return false;
      return true;
    });
  }, [users, query, role, status]);

  const governorateName = (id?: string) =>
    governorates.find((g) => g.id === id)?.name[lang] ?? "";

  const dateFormat = new Intl.DateTimeFormat(
    lang === "ar" ? "ar-SY" : "en-GB",
    {
      day: "numeric",
      month: "short",
      year: "numeric",
    },
  );

  return (
    <div className="space-y-5">
      <AdminPageHeader title={t.admin.users} count={users.length} />

      <AdminFilterBar
        query={query}
        onQueryChange={setQuery}
        placeholder={t.admin.searchUsers}
        hasFilters={hasFilters}
        onClear={clear}
      >
        <AdminSelect
          value={role}
          onChange={setRole}
          label={t.admin.allRoles}
          items={{ [ALL]: t.admin.allRoles, ...roleLabel }}
        />
        <AdminSelect
          value={status}
          onChange={setStatus}
          label={t.admin.allStatuses}
          items={{
            [ALL]: t.admin.allStatuses,
            active: t.admin.statusActive,
            banned: t.admin.statusBanned,
          }}
        />
      </AdminFilterBar>

      <p
        className="text-sm font-semibold text-muted-foreground"
        aria-live="polite"
      >
        {filtered.length}
      </p>

      {filtered.length === 0 ? (
        <p className="rounded-2xl border border-dashed border-border p-14 text-center text-sm text-muted-foreground">
          {t.admin.noResults}
        </p>
      ) : (
        <ul className="space-y-2.5">
          {filtered.map((user) => (
            <li
              key={user.id}
              className="flex flex-wrap items-center gap-3 rounded-2xl border border-border/60 bg-card p-3.5"
            >
              <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-[#ffd9de] font-heading text-sm font-bold text-[#90003b]">
                {user.name.trim().charAt(0)}
              </span>

              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-bold">{user.name}</p>
                <p
                  className="mt-0.5 truncate text-xs text-muted-foreground"
                  dir="ltr"
                >
                  {user.phone}
                </p>
              </div>

              <Badge className="shrink-0 bg-surface-container text-foreground/70">
                <UserRound className="me-1 size-3" />
                {roleLabel[user.role]}
              </Badge>

              {user.governorateId && (
                <span className="hidden shrink-0 text-xs text-muted-foreground sm:block">
                  {governorateName(user.governorateId)}
                </span>
              )}

              <span className="hidden shrink-0 text-xs text-muted-foreground md:block">
                {t.admin.joinedOn} {dateFormat.format(new Date(user.joinedAt))}
              </span>

              <Badge
                className={cn(
                  "shrink-0",
                  user.status === "active"
                    ? "bg-success/10 text-success"
                    : "bg-destructive/10 text-destructive",
                )}
              >
                {user.status === "active"
                  ? t.admin.statusActive
                  : t.admin.statusBanned}
              </Badge>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
