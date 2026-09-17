"use client";

import { useEffect, useState } from "react";
import { Check, Clock3, X } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { AdminPageHeader } from "@/features/admin/components/admin-page-header";
import {
    getAdminPlans,
    updateRegistrationRequestStatus,
    type RegistrationRequest,
} from "@/features/admin/services";
import { useI18n } from "@/i18n/client";
import { toast } from "@/lib/toast";

export function RegistrationRequestsList({
    initialRequests,
}: {
    initialRequests: RegistrationRequest[];
}) {
    const { t, lang } = useI18n();
    const [requests, setRequests] = useState(initialRequests);
    const [savingId, setSavingId] = useState<string | null>(null);
    const [selectedPlans, setSelectedPlans] = useState<Record<string, string>>({});
    const [plans, setPlans] = useState<{ id: string; name: { ar: string; en: string } }[]>([]);

    useEffect(() => {
        void getAdminPlans().then(setPlans);
    }, []);

    const review = async (request: RegistrationRequest, status: "approved" | "rejected") => {
        setSavingId(request.id);
        try {
            const planId = selectedPlans[request.id] ?? request.planId ?? undefined;
            const updated = await updateRegistrationRequestStatus(request.id, status, planId);
            setRequests((current) => current.map((item) => item.id === request.id ? updated : item));
            toast.success(status === "approved" ? t.admin.requestApproved : t.admin.requestRejected);
        } catch {
            toast.error(t.common.saveFailed);
        } finally {
            setSavingId(null);
        }
    };

    return (
        <div className="space-y-5">
            <AdminPageHeader title={t.admin.registrationRequests} count={requests.length} />
            {requests.length === 0 ? (
                <p className="rounded-2xl border border-dashed border-border p-14 text-center text-sm text-muted-foreground">
                    {t.admin.noRegistrationRequests}
                </p>
            ) : (
                <ul className="space-y-3">
                    {requests.map((request) => (
                        <li key={request.id} className="flex flex-wrap items-center gap-4 rounded-2xl border border-border/60 bg-card p-4">
                            <div className="min-w-0 flex-1">
                                <p className="font-semibold">{request.applicantName}</p>
                                <p className="mt-1 text-sm text-muted-foreground" dir="ltr">{request.phone}</p>
                                <p className="mt-1 text-xs text-muted-foreground">
                                    {request.type} · {new Intl.DateTimeFormat(lang === "ar" ? "ar-SY" : "en-GB").format(new Date(request.createdAt))}
                                </p>
                                {request.status === "pending" ? (
                                    <select
                                        value={selectedPlans[request.id] ?? request.planId ?? ""}
                                        onChange={(event) => setSelectedPlans((current) => ({ ...current, [request.id]: event.target.value }))}
                                        className="mt-2 h-9 rounded-md border border-input bg-background px-2 text-sm"
                                    >
                                        <option value="">{t.admin.selectPlan}</option>
                                        {plans.map((plan) => <option key={plan.id} value={plan.id}>{plan.name[lang]}</option>)}
                                    </select>
                                ) : request.plan ? (
                                    <p className="mt-2 text-sm font-semibold">{request.plan.name}</p>
                                ) : null}
                                {request.notes && <p className="mt-2 text-sm">{request.notes}</p>}
                            </div>
                            <Badge>{request.status}</Badge>
                            {(request.status === "pending" ||
                                (request.status === "approved" && !request.applicantUserId)) && (
                                    <div className="flex gap-2">
                                        <Button size="sm" onClick={() => void review(request, "approved")} disabled={savingId === request.id || !(selectedPlans[request.id] ?? request.planId)}>
                                            <Check className="size-4" /> {t.admin.approveRequest}
                                        </Button>
                                        <Button size="sm" variant="outline" onClick={() => void review(request, "rejected")} disabled={savingId === request.id}>
                                            <X className="size-4" /> {t.admin.rejectRequest}
                                        </Button>
                                    </div>
                                )}
                            {request.status === "pending" && <Clock3 className="size-4 text-muted-foreground" />}
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
}