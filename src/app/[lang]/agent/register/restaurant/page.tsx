import { Suspense } from "react";

import { AgentRegisterIntro } from "@/features/agent-dashboard/components/agent-register-intro";
import { RestaurantRegisterForm } from "@/features/auth/components/restaurant-register-form";

export default function AgentRegisterRestaurantPage() {
  return (
    // centred and width-capped: the shared form is built for the auth
    // layout, which centres it; the dashboard content area does not, so it
    // otherwise hugged the inline-start edge
    <div className="mx-auto w-full max-w-3xl space-y-6">
      <AgentRegisterIntro kind="restaurant" />
      {/* the shared form reads ?ref= via useSearchParams, which needs a boundary */}
      <Suspense>
        <RestaurantRegisterForm />
      </Suspense>
    </div>
  );
}
