import { Suspense } from "react";

import { RestaurantRegisterForm } from "@/features/auth/components/restaurant-register-form";

export default function RestaurantRegisterPage() {
  return (
    // useSearchParams (the ?ref= handoff from an agent page) requires a
    // Suspense boundary, or the build fails on this route
    <Suspense>
      <RestaurantRegisterForm />
    </Suspense>
  );
}
