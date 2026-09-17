"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef } from "react";

import { LogOut } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuthStore } from "@/features/auth/store";
import { useHydratedSession } from "@/features/auth/use-hydrated-session";
import { AccountIdentityCard } from "@/features/customer/components/account-identity-card";
import { CustomerOrdersCard } from "@/features/customer/components/customer-orders-card";
import { PhoneNumbersCard } from "@/features/customer/components/phone-numbers-card";
import {
  useCustomerProfileMutations,
  useMyAccount,
} from "@/features/customer/hooks/use-my-account";
import { useI18n } from "@/i18n/client";

/**
 * The customer's account page: who they are, how the platform reaches them,
 * and what they have ordered.
 *
 * Redirects to the customer login once hydration confirms there is no customer
 * session — the same guard the dashboards use, so a shared link cannot render
 * an empty account for a signed-out visitor.
 */
export function CustomerProfile() {
  const { t, lang } = useI18n();
  const router = useRouter();
  const { session, hydrated } = useHydratedSession();
  const logout = useAuthStore((s) => s.logout);
  // set right before an intentional logout so the guard below doesn't race its
  // own redirect-to-login against the logout's redirect-home
  const loggingOut = useRef(false);

  const isCustomer = session?.role === "user";
  // held back until hydration says there is a session to send it with, or the
  // request would go out unauthenticated and answer 401
  const account = useMyAccount(hydrated && isCustomer);
  const mutations = useCustomerProfileMutations();

  useEffect(() => {
    if (hydrated && !isCustomer && !loggingOut.current) {
      router.replace(`/${lang}/login/user`);
    }
  }, [hydrated, isCustomer, lang, router]);

  if (!hydrated || !isCustomer) return null;

  const handleLogout = () => {
    loggingOut.current = true;
    logout();
    router.push(`/${lang}`);
  };

  return (
    <div className="mx-auto max-w-4xl">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="label-eyebrow text-primary">{t.account.title}</p>
          <h1 className="text-display mt-2 text-3xl md:text-4xl">
            {session.name}
          </h1>
          <p className="mt-2 text-sm text-muted-foreground md:text-base">
            {t.account.body}
          </p>
        </div>
        <Button
          variant="outline"
          className="h-10 gap-1.5"
          onClick={handleLogout}
        >
          <LogOut className="size-4" />
          {t.auth.logout}
        </Button>
      </header>

      {account.isPending ? (
        <div className="mt-8 space-y-6">
          <Skeleton className="h-64 rounded-3xl" />
          <div className="grid gap-6 lg:grid-cols-2">
            <Skeleton className="h-72 rounded-3xl" />
            <Skeleton className="h-72 rounded-3xl" />
          </div>
        </div>
      ) : !account.data ? (
        <div className="mt-8 rounded-3xl border border-dashed border-border p-12 text-center">
          <p className="text-sm text-muted-foreground">
            {t.account.loadFailed}
          </p>
          <Button
            variant="outline"
            className="mt-4"
            onClick={() => void account.refetch()}
          >
            {t.account.retry}
          </Button>
        </div>
      ) : (
        <div className="mt-8 space-y-6">
          <AccountIdentityCard
            account={account.data}
            onSave={mutations.saveProfileAsync}
            isSaving={mutations.isSavingProfile}
            onAvatarFile={mutations.updateAvatar}
            isUpdatingAvatar={mutations.isUpdatingAvatar}
          />

          <div className="grid items-start gap-6 lg:grid-cols-2">
            <PhoneNumbersCard
              phones={account.data.phones}
              sessionIdentifier={session.identifier}
              onAdd={mutations.addPhoneAsync}
              isAdding={mutations.isAddingPhone}
              onRemove={mutations.removePhone}
              removingPhoneId={mutations.removingPhoneId}
            />
            <CustomerOrdersCard customerId={session.identifier} />
          </div>
        </div>
      )}
    </div>
  );
}