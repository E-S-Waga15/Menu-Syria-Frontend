"use client";

import { useState } from "react";

import { useQuery } from "@tanstack/react-query";
import { BellRing, Clock3, MapPin } from "lucide-react";

import { LoadingSpinner } from "@/components/shared/loading-spinner";
import { Switch } from "@/components/ui/switch";
import { PlacesManager } from "@/features/admin/components/places-manager";
import { WhatsappOtpCard } from "@/features/admin/components/whatsapp-otp-card";
import { getGovernorates, getRegions } from "@/features/marketing/services";
import { useI18n } from "@/i18n/client";
import { queryKeys } from "@/lib/api/query-keys";

export function SystemSettings() {
  const { t } = useI18n();

  const { data } = useQuery({
    queryKey: queryKeys.governorates,
    queryFn: getGovernorates,
  });
  const { data: regionsData } = useQuery({
    queryKey: queryKeys.regions,
    queryFn: getRegions,
  });

  const [cronJobs, setCronJobs] = useState([
    {
      id: "expiry-reminder",
      label: "تنبيه انتهاء الاشتراك — Subscription expiry reminder",
      schedule: "0 9 * * *",
      enabled: true,
    },
    {
      id: "weekly-report",
      label: "التقرير الأسبوعي للوكلاء — Weekly agents report",
      schedule: "0 8 * * 6",
      enabled: true,
    },
    {
      id: "image-cleanup",
      label: "تنظيف الصور غير المستخدمة — Unused images cleanup",
      schedule: "0 3 * * 0",
      enabled: false,
    },
  ]);

  const [notifications, setNotifications] = useState([
    {
      id: "new-restaurant",
      label: "مطعم جديد بانتظار الموافقة — New restaurant pending approval",
      enabled: true,
    },
    {
      id: "payment-received",
      label: "استلام دفعة — Payment received",
      enabled: true,
    },
    {
      id: "plan-expired",
      label: "انتهاء اشتراك — Plan expired",
      enabled: true,
    },
  ]);

  // Both lists feed one panel, so keep the content consistent until both land.
  if (!data || !regionsData) return <LoadingSpinner />;

  return (
    <div className="grid items-start gap-6 lg:grid-cols-2">
      {/* governorates */}
      <section className="rounded-2xl border border-border/60 bg-card">
        <h2 className="flex items-center gap-2.5 border-b border-border/60 px-5 py-4 font-heading text-lg font-semibold">
          <MapPin className="size-5 text-primary" />
          {t.admin.governorates}
        </h2>
        <div className="p-5">
          <PlacesManager governorates={data} regions={regionsData} />
        </div>
      </section>

      <div className="space-y-6">
        {/* the one panel here backed by a live service rather than local
            state, so it leads the column */}
        <WhatsappOtpCard />

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
                      prev.map((x) =>
                        x.id === n.id ? { ...x, enabled: v } : x,
                      ),
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
