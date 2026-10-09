import {
  PanelSkeleton,
  StatRowSkeleton,
} from "@/components/shared/skeletons";

/** the agent dashboard's shell stays; its content area waits here */
export default function AgentLoading() {
  return (
    <div className="space-y-6">
      <StatRowSkeleton count={3} />
      <PanelSkeleton rows={4} />
    </div>
  );
}
