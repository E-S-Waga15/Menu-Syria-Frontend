"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { getRoleMeta } from "@/features/auth/role-meta";
import type { PhoneRole } from "@/features/auth/mock-directory";
import { useI18n } from "@/i18n/client";

/**
 * Shown when a verified phone number holds more than one role — lets the
 * visitor pick which account to continue into instead of guessing.
 */
export function RolePickerModal({
  roles,
  onSelect,
  onOpenChange,
}: {
  roles: PhoneRole[] | null;
  onSelect: (role: PhoneRole) => void;
  onOpenChange: (open: boolean) => void;
}) {
  const { t } = useI18n();
  const roleMeta = getRoleMeta(t);

  return (
    <Dialog open={!!roles} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="text-center text-lg">
            {t.auth.chooseLoginTitle}
          </DialogTitle>
        </DialogHeader>

        <div className="grid gap-2 pt-2">
          {roles?.map((item) => {
            const meta = roleMeta[item.role];
            return (
              <button
                key={item.role}
                type="button"
                onClick={() => onSelect(item)}
                className="flex items-center gap-3 rounded-2xl border border-border/60 bg-card p-3.5 text-start transition-[translate,scale,border-color,background-color] duration-200 ease-smooth hover:-translate-y-0.5 hover:border-primary/35 hover:bg-berry-soft/20"
              >
                <span
                  className={`flex size-11 shrink-0 items-center justify-center rounded-xl ${meta.chip}`}
                >
                  <meta.icon className="size-5.5" />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm font-bold">
                    {meta.label}
                  </span>
                  <span className="block truncate text-xs text-muted-foreground">
                    {item.label}
                  </span>
                </span>
              </button>
            );
          })}
        </div>
      </DialogContent>
    </Dialog>
  );
}
