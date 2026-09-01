import { ConciergeBell, Handshake, Store, UserRound } from "lucide-react";

import type { Dictionary } from "@/i18n/get-dictionary";
import type { UserRole } from "@/features/auth/store";

export interface RoleMeta {
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  label: string;
  desc: string;
  chip: string;
}

/** Single source of role → icon/label/chip styling, shared by the role
 * picker modal and the credentials tab's inline role chips. */
export function getRoleMeta(t: Dictionary): Record<UserRole, RoleMeta> {
  return {
    owner: {
      icon: Store,
      label: t.auth.roleOwner,
      desc: t.auth.roleOwnerDesc,
      chip: "bg-berry-soft text-berry-soft-foreground",
    },
    agent: {
      icon: Handshake,
      label: t.auth.roleAgent,
      desc: t.auth.roleAgentDesc,
      chip: "bg-success/10 text-success",
    },
    waiter: {
      icon: ConciergeBell,
      label: t.auth.roleWaiter,
      desc: t.auth.roleWaiterDesc,
      chip: "bg-zest-soft text-zest-soft-foreground",
    },
    user: {
      icon: UserRound,
      label: t.auth.roleUser,
      desc: t.auth.roleUserDesc,
      chip: "bg-primary/10 text-primary",
    },
    admin: {
      icon: UserRound,
      label: t.auth.roleAdmin,
      desc: t.auth.roleAdminDesc,
      chip: "bg-foreground/10 text-foreground",
    },
  };
}
