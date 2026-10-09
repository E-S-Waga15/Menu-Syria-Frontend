import {
  PanelSkeleton,
  StatRowSkeleton,
} from "@/components/shared/skeletons";

/** the business dashboard's shell stays; its content area waits here */
export default function DashboardLoading() {
  return (
    <div className="space-y-6">
      <StatRowSkeleton />
      <PanelSkeleton rows={4} />
    </div>
  );
}
