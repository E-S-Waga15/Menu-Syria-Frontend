"use client";

import { useQuery } from "@tanstack/react-query";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { Skeleton } from "@/components/ui/skeleton";
import { getMyAnalytics } from "@/features/restaurant-dashboard/services";
import { useI18n } from "@/i18n/client";
import { queryKeys } from "@/lib/api/query-keys";

const CHART_COLORS = [
  "var(--chart-1)",
  "var(--chart-2)",
  "var(--chart-3)",
  "var(--chart-4)",
  "var(--chart-5)",
];

const dayLabels: Record<string, { ar: string; en: string }> = {
  sat: { ar: "السبت", en: "Sat" },
  sun: { ar: "الأحد", en: "Sun" },
  mon: { ar: "الاثنين", en: "Mon" },
  tue: { ar: "الثلاثاء", en: "Tue" },
  wed: { ar: "الأربعاء", en: "Wed" },
  thu: { ar: "الخميس", en: "Thu" },
  fri: { ar: "الجمعة", en: "Fri" },
};

const categoryLabels: Record<string, { ar: string; en: string }> = {
  grills: { ar: "المشاوي", en: "Grills" },
  mains: { ar: "الرئيسية", en: "Mains" },
  appetizers: { ar: "المقبلات", en: "Appetizers" },
  desserts: { ar: "الحلويات", en: "Desserts" },
  beverages: { ar: "المشروبات", en: "Beverages" },
};

function ChartCard({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-2xl border border-border/60 bg-card p-5">
      <h2 className="font-heading text-base font-semibold">{title}</h2>
      <div className="mt-4 h-64" dir="ltr">
        {children}
      </div>
    </section>
  );
}

const tooltipStyle = {
  borderRadius: 12,
  border: "1px solid var(--border)",
  background: "var(--popover)",
  color: "var(--popover-foreground)",
  fontSize: 12,
  fontWeight: 600,
};

export function AnalyticsView() {
  const { t, lang } = useI18n();

  const { data } = useQuery({
    queryKey: queryKeys.restaurants.analytics("r1"),
    queryFn: getMyAnalytics,
  });

  if (!data) {
    return (
      <div className="grid gap-6 lg:grid-cols-2">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-80 rounded-2xl" />
        ))}
      </div>
    );
  }

  const visits = data.visitsByDay.map((d) => ({
    ...d,
    label: dayLabels[d.label]?.[lang] ?? d.label,
  }));

  const sales = data.salesByCategory.map((d) => ({
    ...d,
    label: categoryLabels[d.label]?.[lang] ?? d.label,
  }));

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <ChartCard title={t.dashboard.revenueGrowth}>
        <ResponsiveContainer>
          <AreaChart data={data.revenueByMonth}>
            <defs>
              <linearGradient id="revFill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="var(--chart-1)" stopOpacity={0.3} />
                <stop offset="100%" stopColor="var(--chart-1)" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid stroke="var(--border)" strokeDasharray="4 4" vertical={false} />
            <XAxis dataKey="label" stroke="var(--muted-foreground)" fontSize={11} tickLine={false} axisLine={false} />
            <YAxis stroke="var(--muted-foreground)" fontSize={11} tickLine={false} axisLine={false} width={32} />
            <Tooltip contentStyle={tooltipStyle} cursor={{ stroke: "var(--border)" }} />
            <Area
              type="monotone"
              dataKey="value"
              stroke="var(--chart-1)"
              strokeWidth={2.5}
              fill="url(#revFill)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </ChartCard>

      <ChartCard title={t.dashboard.visitsChart}>
        <ResponsiveContainer>
          <BarChart data={visits}>
            <CartesianGrid stroke="var(--border)" strokeDasharray="4 4" vertical={false} />
            <XAxis dataKey="label" stroke="var(--muted-foreground)" fontSize={11} tickLine={false} axisLine={false} />
            <YAxis stroke="var(--muted-foreground)" fontSize={11} tickLine={false} axisLine={false} width={36} />
            <Tooltip contentStyle={tooltipStyle} cursor={{ fill: "var(--surface-container)" }} />
            <Bar dataKey="value" fill="var(--chart-2)" radius={[6, 6, 0, 0]} maxBarSize={36} />
          </BarChart>
        </ResponsiveContainer>
      </ChartCard>

      <ChartCard title={t.dashboard.salesByCategory}>
        <ResponsiveContainer>
          <PieChart>
            <Tooltip contentStyle={tooltipStyle} />
            <Pie
              data={sales}
              dataKey="value"
              nameKey="label"
              innerRadius="55%"
              outerRadius="85%"
              paddingAngle={3}
              strokeWidth={0}
            >
              {sales.map((entry, index) => (
                <Cell
                  key={entry.label}
                  fill={CHART_COLORS[index % CHART_COLORS.length]}
                />
              ))}
            </Pie>
          </PieChart>
        </ResponsiveContainer>
      </ChartCard>

      <section className="flex flex-col justify-center gap-3 rounded-2xl border border-border/60 bg-card p-5">
        <h2 className="font-heading text-base font-semibold">
          {t.dashboard.salesByCategory}
        </h2>
        <ul className="space-y-3">
          {sales.map((entry, index) => (
            <li key={entry.label} className="flex items-center gap-3">
              <span
                className="size-3 shrink-0 rounded-full"
                style={{
                  backgroundColor: CHART_COLORS[index % CHART_COLORS.length],
                }}
              />
              <span className="flex-1 text-sm font-semibold">
                {entry.label}
              </span>
              <span className="text-sm font-bold" dir="ltr">
                {entry.value}%
              </span>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
