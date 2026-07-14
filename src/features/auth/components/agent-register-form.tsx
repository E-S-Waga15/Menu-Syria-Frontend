"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";

import { FileDropzone } from "@/components/shared/file-dropzone";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { getGovernorates } from "@/features/marketing/services";
import { useI18n } from "@/i18n/client";
import { queryKeys } from "@/lib/api/query-keys";

export function AgentRegisterForm() {
  const { t, lang } = useI18n();
  const router = useRouter();

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [governorateId, setGovernorateId] = useState("");
  const [experience, setExperience] = useState("");

  const { data: governorates } = useQuery({
    queryKey: queryKeys.governorates,
    queryFn: getGovernorates,
  });

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success(t.auth.applicationSent);
    router.push(`/${lang}`);
  };

  return (
    <div className="w-full max-w-2xl">
      <div className="text-center">
        <h1 className="font-heading text-2xl font-bold md:text-3xl">
          {t.auth.agentRegTitle}
        </h1>
        <p className="mx-auto mt-2 max-w-md text-sm text-muted-foreground md:text-base">
          {t.auth.agentRegBody}
        </p>
      </div>

      {/* formal tertiary-toned card */}
      <form
        onSubmit={submit}
        className="mt-8 space-y-6 rounded-3xl border-t-4 border border-border/60 border-t-[#414141] bg-card p-6 shadow-lifted md:p-10 dark:border-t-white/40"
      >
        <div className="grid gap-6 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="a-name">{t.auth.fullNameLabel} *</Label>
            <Input
              id="a-name"
              className="h-11"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="a-phone">{t.auth.phoneLabel} *</Label>
            <Input
              id="a-phone"
              dir="ltr"
              inputMode="tel"
              placeholder="+963 9XX XXX XXX"
              className="h-11"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              required
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label>{t.auth.governorateLabel} *</Label>
          <Select
            value={governorateId || null}
            onValueChange={(v) => v && setGovernorateId(v)}
            items={Object.fromEntries(
              (governorates ?? []).map((g) => [g.id, g.name[lang]]),
            )}
          >
            <SelectTrigger className="h-11 w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {(governorates ?? []).map((g) => (
                <SelectItem key={g.id} value={g.id}>
                  {g.name[lang]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="a-exp">{t.auth.experienceLabel}</Label>
          <Textarea
            id="a-exp"
            rows={3}
            value={experience}
            onChange={(e) => setExperience(e.target.value)}
          />
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <div className="space-y-2">
            <Label>{t.auth.idDocLabel} *</Label>
            <FileDropzone label={t.auth.idDocLabel} />
          </div>
          <div className="space-y-2">
            <Label>{t.auth.personalPhotoLabel} *</Label>
            <FileDropzone label={t.auth.personalPhotoLabel} />
          </div>
        </div>

        <Button
          type="submit"
          disabled={!name.trim() || !phone.trim() || !governorateId}
          className="h-12 w-full bg-[#414141] text-base text-white shadow-soft hover:bg-[#2d2d2d] dark:bg-white/15 dark:hover:bg-white/25"
        >
          {t.auth.submitApplication}
        </Button>
      </form>
    </div>
  );
}
