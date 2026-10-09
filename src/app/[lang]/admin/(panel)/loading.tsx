import {
  PanelSkeleton,
  StatRowSkeleton,
} from "@/components/shared/skeletons";

/** the console's sidebar stays; the panel area waits here */
export default function AdminPanelLoading() {
  return (
    <div className="space-y-6">
      <StatRowSkeleton />
      <PanelSkeleton rows={5} />
    </div>
  );
}
