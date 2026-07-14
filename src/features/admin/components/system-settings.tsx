"use client";

import { useState } from "react";

import { useQuery } from "@tanstack/react-query";
import { BellRing, Clock3, MapPin, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Switch } from "@/components/ui/switch";
import { getGovernorates } from "@/features/marketing/services";
import { useI18n } from "@/i18n/client";
import { queryKeys } from "@/lib/api/query-keys";
import type { Governorate } from "@/lib/types";

export function SystemSettings() {
  const { t, lang } = useI18n();

  const { data } = useQuery({
    queryKey: queryKeys.governorates,
    queryFn: getGovernorates,
  });

  const [governorates, setGovernorates] = useState<Governorate[]>([]);
  const [newName, setNewName] = useState("");

  // Seed the editable copy when the query resolves (adjust-state-during-render pattern)
  const [seeded, setSeeded] = useState<Governorate[] | null>(null);
  if (data && data !== seeded) {
    setSeeded(data);
    setGovernorates(data);
  }

  const [cronJobs, setCronJobs] = useState([
    { id: "expiry-reminder", label: "تنبيه انتهاء الاشتراك — Subscription expiry reminder", schedule: "0 9 * * *", enabled: true },
    { id: "weekly-report", label: "التقرير الأسبوعي للوكلاء — Weekly agents report", schedule: "0 8 * * 6", enabled: true },
    { id: "image-cleanup", label: "تنظيف الصور غير المستخدمة — Unused images cleanup", schedule: "0 3 * * 0", enabled: false },
  ]);

  const [notifications, setNotifications] = useState([
    { id: "new-restaurant", label: "مطعم جديد بانتظار الموافقة — New restaurant pending approval", enabled: true },
    { id: "payment-received", label: "استلام دفعة — Payment received", enabled: true },
    { id: "plan-expired", label: "انتهاء اشتراك — Plan expired", enabled: true },
  ]);

  if (!data) return <Skeleton className="h-96 rounded-2xl" />;

  const addGovernorate = () => {
    const name = newName.trim();
    if (!name) return;
    setGovernorates((prev) => [
      ...prev,
      { id: `gov-${Date.now()}`, name: { ar: name, en: name } },
    ]);
    setNewName("");
    toast.success(t.common.done);
  };

  return (
    <div className="grid items-start gap-6 lg:grid-cols-2">
      {/* governorates */}
      <section className="rounded-2xl border border-border/60 bg-card">
        <h2 className="flex items-center gap-2.5 border-b border-border/60 px-5 py-4 font-heading text-lg font-semibold">
          <MapPin className="size-5 text-primary" />
          {t.admin.governorates}
        </h2>
        <div className="p-5">
          <div className="flex gap-2">
            <Input
              placeholder={t.admin.addGovernorate}
              className="h-10"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && addGovernorate()}
            />
            <Button className="h-10" onClick={addGovernorate}>
              <Plus className="size-4" />
              {t.common.add}
            </Button>
          </div>
          <ul className="mt-4 grid max-h-80 grid-cols-1 gap-2 overflow-y-auto sm:grid-cols-2">
            {governorates.map((gov) => (
              <li
                key={gov.id}
                className="flex items-center justify-between gap-2 rounded-xl border border-border/60 px-3.5 py-2.5 text-sm font-semibold"
              >
                {gov.name[lang]}
                <Button
                  variant="ghost"
                  size="icon-xs"
                  aria-label={t.common.delete}
                  className="text-muted-foreground hover:text-destructive"
                  onClick={() =>
                    setGovernorates((prev) =>
                      prev.filter((g) => g.id !== gov.id),
                    )
                  }
                >
                  <Trash2 className="size-3.5" />
                </Button>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <div className="space-y-6">
        {/* cron jobs */}
        <section className="rounded-2xl border border-border/60 bg-card">
          <h2 className="flex items-center gap-2.5 border-b border-border/60 px-5 py-4 font-heading text-lg font-semibold">
            <Clock3 className="size-5 text-primary" />
            {t.admin.cronJobs}
          </h2>
          <ul className="divide-y divide-border/60">
            {cronJobs.map((job) => (
              <li
                key={job.id}
                className="flex items-center justify-between gap-3 px-5 py-4"
              >
                <div className="min-w-0">
                  <p className="text-sm font-semibold">{job.label}</p>
                  <code
                    className="mt-1 inline-block rounded bg-surface-container px-2 py-0.5 text-xs font-bold text-muted-foreground"
                    dir="ltr"
                  >
                    {job.schedule}
                  </code>
                </div>
                <Switch
                  checked={job.enabled}
                  onCheckedChange={(v) =>
                    setCronJobs((prev) =>
                      prev.map((j) =>
                        j.id === job.id ? { ...j, enabled: v } : j,
                      ),
                    )
                  }
                />
              </li>
            ))}
          </ul>
        </section>

        {/* notifications */}
        <section className="rounded-2xl border border-border/60 bg-card">
          <h2 className="flex items-center gap-2.5 border-b border-border/60 px-5 py-4 font-heading text-lg font-semibold">
            <BellRing className="size-5 text-primary" />
            {t.admin.notifications}
          </h2>
          <ul className="divide-y divide-border/60">
            {notifications.map((n) => (
              <li
                key={n.id}
                className="flex items-center justify-between gap-3 px-5 py-4"
              >
                <p className="text-sm font-semibold">{n.label}</p>
                <Switch
                  checked={n.enabled}
                  onCheckedChange={(v) =>
                    setNotifications((prev) =>
                      prev.map((x) => (x.id === n.id ? { ...x, enabled: v } : x)),
                    )
                  }
                />
              </li>
            ))}
          </ul>
        </section>
      </div>
    </div>
  );
}
