"use client";

import Image from "next/image";
import { useRef, useState } from "react";

import { useQuery } from "@tanstack/react-query";
import {
  Camera,
  CalendarClock,
  Check,
  Crown,
  Globe,
  Image as ImageIcon,
  Link2,
  MapPin,
  MoreVertical,
  Palette,
  Pencil,
  Plus,
  Printer,
  QrCode,
  Save,
  Share2,
  User,
  X,
} from "lucide-react";
import { toast } from "@/lib/toast";

import { GoogleLocationPicker } from "@/components/shared/google-location-picker";
import { GovernorateRegionSelect } from "@/components/shared/governorate-region-select";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { useAuthStore } from "@/features/auth/store";
import { getGovernorates, getRegions } from "@/features/marketing/services";
import { getMyRestaurant } from "@/features/restaurant-dashboard/services";
import { fmt, useI18n } from "@/i18n/client";
import { queryKeys } from "@/lib/api/query-keys";
import type { Restaurant } from "@/lib/types";
import { cn } from "@/lib/utils";

type I18n = ReturnType<typeof useI18n>;

/** Card wrapper every section shares: a title, and a "⋯" menu that shows
 * "Edit" while at rest and swaps to "Save changes" / "Cancel" once the
 * section is being edited — the same three-dot chrome throughout, only its
 * menu contents change with the section's own edit state. */
function ProfileSection({
  title,
  icon: Icon,
  editing,
  onEdit,
  onSave,
  onCancel,
  editable = true,
  children,
  t,
}: {
  title: string;
  icon: React.ComponentType<{ className?: string }>;
  editing: boolean;
  onEdit: () => void;
  onSave: () => void;
  onCancel: () => void;
  editable?: boolean;
  children: React.ReactNode;
  t: I18n["t"];
}) {
  return (
    <section className="rounded-2xl border border-border/60 bg-card p-6">
      <div className="flex items-center justify-between gap-3">
        <h2 className="flex items-center gap-2 font-heading text-lg font-semibold">
          <Icon className="size-5 text-primary" />
          {title}
        </h2>
        {editable && (
          <DropdownMenu>
            <DropdownMenuTrigger
              render={<Button variant="ghost" size="icon-sm" aria-label="⋯" />}
            >
              <MoreVertical className="size-4" />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {editing ? (
                <>
                  <DropdownMenuItem onClick={onSave}>
                    <Save className="size-4" />
                    {t.common.save}
                  </DropdownMenuItem>
                  <DropdownMenuItem variant="destructive" onClick={onCancel}>
                    <X className="size-4" />
                    {t.common.cancel}
                  </DropdownMenuItem>
                </>
              ) : (
                <DropdownMenuItem onClick={onEdit}>
                  <Pencil className="size-4" />
                  {t.common.edit}
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>
      <div className="mt-5">{children}</div>
    </section>
  );
}

/** Confirms an image before it's actually applied: pick a file → preview it
 * here → "تأكيد" commits, "إلغاء" discards and re-opens nothing. */
function ImagePreviewDialog({
  src,
  onConfirm,
  onCancel,
  t,
}: {
  src: string | null;
  onConfirm: () => void;
  onCancel: () => void;
  t: I18n["t"];
}) {
  return (
    <Dialog open={!!src} onOpenChange={(open) => !open && onCancel()}>
      <DialogContent showCloseButton={false}>
        <DialogHeader>
          <DialogTitle>{t.dashboard.previewPhotoTitle}</DialogTitle>
        </DialogHeader>
        {src && (
          <div className="relative aspect-square w-full overflow-hidden rounded-xl border border-border/60">
            <Image src={src} alt="" fill unoptimized className="object-cover" />
          </div>
        )}
        <div className="flex gap-2">
          <Button
            type="button"
            variant="outline"
            className="flex-1"
            onClick={onCancel}
          >
            {t.common.cancel}
          </Button>
          <Button type="button" className="flex-1" onClick={onConfirm}>
            {t.common.confirm}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function AccountInfoSection({
  restaurant,
  isStore,
  t,
  lang,
}: {
  restaurant: Restaurant;
  isStore: boolean;
  t: I18n["t"];
  lang: I18n["lang"];
}) {
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(restaurant.name[lang]);
  const [description, setDescription] = useState(restaurant.description[lang]);
  const [specialty, setSpecialty] = useState(restaurant.cuisine[lang]);
  const snapshot = useRef({ name, description, specialty });

  return (
    <ProfileSection
      title={t.dashboard.accountInfoTab}
      icon={User}
      editing={editing}
      t={t}
      onEdit={() => {
        snapshot.current = { name, description, specialty };
        setEditing(true);
      }}
      onSave={() => {
        setEditing(false);
        toast.success(t.common.done);
      }}
      onCancel={() => {
        setName(snapshot.current.name);
        setDescription(snapshot.current.description);
        setSpecialty(snapshot.current.specialty);
        setEditing(false);
      }}
    >
      <div className="grid gap-5 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="p-name">{t.auth.restaurantNameLabel}</Label>
          <Input
            id="p-name"
            className="h-11"
            disabled={!editing}
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="p-specialty">
            {isStore
              ? t.dashboard.categorySpecialtyLabel
              : t.dashboard.cuisineLabel}
          </Label>
          <Input
            id="p-specialty"
            className="h-11"
            disabled={!editing}
            value={specialty}
            onChange={(e) => setSpecialty(e.target.value)}
          />
        </div>
      </div>
      <div className="mt-5 space-y-2">
        <Label htmlFor="p-desc">{t.auth.descriptionLabel}</Label>
        <Textarea
          id="p-desc"
          rows={3}
          disabled={!editing}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
      </div>
    </ProfileSection>
  );
}

function ContactInfoSection({
  restaurant,
  t,
  lang,
}: {
  restaurant: Restaurant;
  t: I18n["t"];
  lang: I18n["lang"];
}) {
  const { data: governorates } = useQuery({
    queryKey: queryKeys.governorates,
    queryFn: getGovernorates,
  });
  const { data: regions } = useQuery({
    queryKey: queryKeys.regions,
    queryFn: getRegions,
  });

  const [editing, setEditing] = useState(false);
  const [phone, setPhone] = useState(restaurant.phone);
  const [address, setAddress] = useState(restaurant.address[lang]);
  const [governorateId, setGovernorateId] = useState(restaurant.governorateId);
  const [regionId, setRegionId] = useState(restaurant.regionId);
  const [lat, setLat] = useState(restaurant.location.lat);
  const [lng, setLng] = useState(restaurant.location.lng);
  const [mapOpen, setMapOpen] = useState(false);
  const snapshot = useRef({
    phone,
    address,
    governorateId,
    regionId,
    lat,
    lng,
  });

  const regionChoices = (regions ?? []).filter(
    (r) => r.governorateId === governorateId,
  );

  return (
    <ProfileSection
      title={t.restaurant.contactInfo}
      icon={MapPin}
      editing={editing}
      t={t}
      onEdit={() => {
        snapshot.current = {
          phone,
          address,
          governorateId,
          regionId,
          lat,
          lng,
        };
        setEditing(true);
      }}
      onSave={() => {
        setEditing(false);
        toast.success(t.common.done);
      }}
      onCancel={() => {
        setPhone(snapshot.current.phone);
        setAddress(snapshot.current.address);
        setGovernorateId(snapshot.current.governorateId);
        setRegionId(snapshot.current.regionId);
        setLat(snapshot.current.lat);
        setLng(snapshot.current.lng);
        setEditing(false);
      }}
    >
      <div className="grid gap-5 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="p-phone">{t.auth.phoneLabel}</Label>
          <Input
            id="p-phone"
            dir="ltr"
            className="h-11"
            disabled={!editing}
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
          />
        </div>
        <div className="space-y-2">
          <Label>{t.auth.governorateLabel}</Label>
          <GovernorateRegionSelect
            triggerClassName="h-11"
            className="grid gap-2 sm:grid-cols-2"
            governorateValue={governorateId}
            onGovernorateChange={(v) => {
              setGovernorateId(v);
              setRegionId("");
            }}
            governorateItems={Object.fromEntries(
              (governorates ?? []).map((g) => [g.id, g.name[lang]]),
            )}
            governorateAriaLabel={t.auth.governorateLabel}
            regionValue={regionId}
            onRegionChange={setRegionId}
            regionItems={Object.fromEntries(
              regionChoices.map((r) => [r.id, r.name[lang]]),
            )}
            regionAriaLabel={t.restaurantsPage.regionLabel}
            regionDisabled={!editing || !governorateId}
          />
        </div>
      </div>

      <div className="mt-5 space-y-2">
        <Label htmlFor="p-address">{t.auth.addressLabel}</Label>
        <Textarea
          id="p-address"
          rows={2}
          disabled={!editing}
          value={address}
          onChange={(e) => setAddress(e.target.value)}
        />
      </div>

      {editing && (
        <div className="mt-5 space-y-2">
          <Label>{t.auth.pickLocation}</Label>
          <Dialog open={mapOpen} onOpenChange={setMapOpen}>
            <DialogTrigger
              render={
                <Button
                  type="button"
                  variant="outline"
                  className="h-14 w-full justify-start gap-3 border-dashed"
                />
              }
            >
              <span
                className={cn(
                  "flex size-9 items-center justify-center rounded-full",
                  lat
                    ? "bg-success/10 text-success"
                    : "bg-berry-soft text-berry-soft-foreground",
                )}
              >
                {lat ? (
                  <Check className="size-4.5" />
                ) : (
                  <MapPin className="size-4.5" />
                )}
              </span>
              <span className="text-start">
                <span className="block text-sm font-semibold">
                  {lat ? t.auth.locationPicked : t.auth.openMapPicker}
                </span>
                {lat && (
                  <span
                    className="block text-xs text-muted-foreground"
                    dir="ltr"
                  >
                    {lat.toFixed(5)}, {lng.toFixed(5)}
                  </span>
                )}
              </span>
            </DialogTrigger>
            <DialogContent className="max-w-lg">
              <DialogHeader>
                <DialogTitle>{t.auth.pickLocation}</DialogTitle>
              </DialogHeader>
              <GoogleLocationPicker
                initialCoords={{ lat, lng }}
                selectedGovernorateId={governorateId}
                governorates={governorates}
                onLocationChange={({ lat: pickedLat, lng: pickedLng }) => {
                  setLat(pickedLat);
                  setLng(pickedLng);
                }}
              />
              <Button
                type="button"
                className="w-full"
                onClick={() => setMapOpen(false)}
              >
                {t.common.done}
              </Button>
            </DialogContent>
          </Dialog>
        </div>
      )}
    </ProfileSection>
  );
}

function SocialMediaSection({
  restaurant,
  t,
}: {
  restaurant: Restaurant;
  t: I18n["t"];
}) {
  const [editing, setEditing] = useState(false);
  const [whatsapp, setWhatsapp] = useState(restaurant.whatsapp);
  const [instagram, setInstagram] = useState(restaurant.instagram ?? "");
  const [facebook, setFacebook] = useState(restaurant.facebook ?? "");
  const snapshot = useRef({ whatsapp, instagram, facebook });

  return (
    <ProfileSection
      title={t.dashboard.socialMediaTab}
      icon={Globe}
      editing={editing}
      t={t}
      onEdit={() => {
        snapshot.current = { whatsapp, instagram, facebook };
        setEditing(true);
      }}
      onSave={() => {
        setEditing(false);
        toast.success(t.common.done);
      }}
      onCancel={() => {
        setWhatsapp(snapshot.current.whatsapp);
        setInstagram(snapshot.current.instagram);
        setFacebook(snapshot.current.facebook);
        setEditing(false);
      }}
    >
      <div className="grid gap-5 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="p-wa">{t.auth.whatsappLabel}</Label>
          <Input
            id="p-wa"
            dir="ltr"
            className="h-11"
            disabled={!editing}
            value={whatsapp}
            onChange={(e) => setWhatsapp(e.target.value)}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="p-ig">{t.auth.instagramLabel}</Label>
          <Input
            id="p-ig"
            dir="ltr"
            className="h-11"
            disabled={!editing}
            value={instagram}
            onChange={(e) => setInstagram(e.target.value)}
          />
        </div>
      </div>
      <div className="mt-5 space-y-2">
        <Label htmlFor="p-fb">{t.auth.facebookLabel}</Label>
        <Input
          id="p-fb"
          dir="ltr"
          className="h-11"
          disabled={!editing}
          value={facebook}
          onChange={(e) => setFacebook(e.target.value)}
        />
      </div>
    </ProfileSection>
  );
}

function GallerySection({
  restaurant,
  t,
}: {
  restaurant: Restaurant;
  t: I18n["t"];
}) {
  const [editing, setEditing] = useState(false);
  const [images, setImages] = useState(restaurant.coverImages);
  const [pendingImage, setPendingImage] = useState<string | null>(null);
  const snapshot = useRef(images);
  const inputRef = useRef<HTMLInputElement>(null);

  const pickImage = (file: File | undefined) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setPendingImage(reader.result as string);
    reader.readAsDataURL(file);
  };

  const confirmImage = () => {
    if (pendingImage) setImages((prev) => [...prev, pendingImage]);
    setPendingImage(null);
    if (inputRef.current) inputRef.current.value = "";
  };

  const cancelImage = () => {
    setPendingImage(null);
    if (inputRef.current) inputRef.current.value = "";
  };

  return (
    <ProfileSection
      title={t.restaurant.gallery}
      icon={ImageIcon}
      editing={editing}
      t={t}
      onEdit={() => {
        snapshot.current = images;
        setEditing(true);
      }}
      onSave={() => {
        setEditing(false);
        toast.success(t.common.done);
      }}
      onCancel={() => {
        setImages(snapshot.current);
        setEditing(false);
      }}
    >
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
        {images.map((src, i) => (
          <div
            key={`${src}-${i}`}
            className="group relative aspect-square overflow-hidden rounded-xl border border-border/60"
          >
            <Image
              src={src}
              alt=""
              fill
              priority={i < 4}
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
              className="object-cover"
            />
            {editing && (
              <button
                type="button"
                aria-label={t.dashboard.removePhoto}
                onClick={() =>
                  setImages((prev) => prev.filter((_, idx) => idx !== i))
                }
                className="absolute top-2 end-2 flex size-7 items-center justify-center rounded-full bg-black/60 text-white transition-opacity hover:bg-black/80"
              >
                <X className="size-4" />
              </button>
            )}
          </div>
        ))}
        {editing && (
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            className="flex aspect-square flex-col items-center justify-center gap-1.5 rounded-xl border-2 border-dashed border-border text-muted-foreground transition-colors hover:border-primary/50 hover:text-primary"
          >
            <Plus className="size-6" />
            <span className="text-xs font-semibold">
              {t.dashboard.addPhoto}
            </span>
            <input
              ref={inputRef}
              type="file"
              accept="image/*"
              className="sr-only"
              onChange={(e) => pickImage(e.target.files?.[0])}
            />
          </button>
        )}
      </div>

      <ImagePreviewDialog
        src={pendingImage}
        onConfirm={confirmImage}
        onCancel={cancelImage}
        t={t}
      />
    </ProfileSection>
  );
}

function AppearanceSection({
  restaurant,
  t,
}: {
  restaurant: Restaurant;
  t: I18n["t"];
}) {
  const [editing, setEditing] = useState(false);
  const [primary, setPrimary] = useState(restaurant.theme.primaryColor);
  const [secondary, setSecondary] = useState(restaurant.theme.secondaryColor);
  const snapshot = useRef({ primary, secondary });

  return (
    <ProfileSection
      title={t.dashboard.appearanceTab}
      icon={Palette}
      editing={editing}
      t={t}
      onEdit={() => {
        snapshot.current = { primary, secondary };
        setEditing(true);
      }}
      onSave={() => {
        setEditing(false);
        toast.success(t.common.done);
      }}
      onCancel={() => {
        setPrimary(snapshot.current.primary);
        setSecondary(snapshot.current.secondary);
        setEditing(false);
      }}
    >
      <div className="grid grid-cols-2 gap-5">
        <div className="space-y-2">
          <Label htmlFor="p-primary">{t.auth.primaryColorLabel}</Label>
          <div className="flex items-center gap-2">
            <input
              id="p-primary"
              type="color"
              disabled={!editing}
              value={primary}
              onChange={(e) => setPrimary(e.target.value)}
              className="size-11 cursor-pointer rounded-lg border border-input bg-transparent p-1 disabled:cursor-not-allowed disabled:opacity-60"
            />
            <span className="font-mono text-sm" dir="ltr">
              {primary}
            </span>
          </div>
        </div>
        <div className="space-y-2">
          <Label htmlFor="p-secondary">{t.auth.secondaryColorLabel}</Label>
          <div className="flex items-center gap-2">
            <input
              id="p-secondary"
              type="color"
              disabled={!editing}
              value={secondary}
              onChange={(e) => setSecondary(e.target.value)}
              className="size-11 cursor-pointer rounded-lg border border-input bg-transparent p-1 disabled:cursor-not-allowed disabled:opacity-60"
            />
            <span className="font-mono text-sm" dir="ltr">
              {secondary}
            </span>
          </div>
        </div>
      </div>

      <div className="mt-6 overflow-hidden rounded-xl border border-border/60">
        <div
          className="flex items-center justify-between px-5 py-4 text-white"
          style={{ backgroundColor: primary }}
        >
          <span className="font-heading font-bold">{restaurant.name.ar}</span>
          <span
            className="rounded-full px-3 py-1 text-xs font-bold"
            style={{ backgroundColor: secondary, color: "#2c1600" }}
          >
            {t.menu.popular}
          </span>
        </div>
        <div className="flex items-center justify-between bg-background px-5 py-3.5">
          <span className="text-sm font-semibold">
            {t.auth.previewDishName}
          </span>
          <span
            className="text-sm font-bold"
            style={{ color: primary }}
            dir="ltr"
          >
            45,000 {t.common.currency}
          </span>
        </div>
      </div>
    </ProfileSection>
  );
}

function SubscriptionSection({
  restaurant,
  t,
  lang,
}: {
  restaurant: Restaurant;
  t: I18n["t"];
  lang: I18n["lang"];
}) {
  return (
    <ProfileSection
      title={t.dashboard.planTab}
      icon={Crown}
      editing={false}
      editable={false}
      t={t}
      onEdit={() => {}}
      onSave={() => {}}
      onCancel={() => {}}
    >
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <span className="flex size-12 items-center justify-center rounded-xl bg-zest-soft text-zest-soft-foreground">
            <Crown className="size-6" />
          </span>
          <div>
            <p className="flex items-center gap-2 font-heading font-bold">
              Premium
              <Badge className="bg-success/10 text-success">
                {t.common.active}
              </Badge>
            </p>
            <p className="mt-1 flex items-center gap-1.5 text-sm text-muted-foreground">
              <CalendarClock className="size-4" />
              {fmt(t.dashboard.planExpires, {
                date: new Date(restaurant.planExpiresAt).toLocaleDateString(
                  lang === "ar" ? "ar-SY" : "en-US",
                  { year: "numeric", month: "long", day: "numeric" },
                ),
              })}
            </p>
          </div>
        </div>
        <Button className="min-w-36">{t.dashboard.renewPlan}</Button>
      </div>
    </ProfileSection>
  );
}

export function BusinessProfile() {
  const { t, lang } = useI18n();
  const businessType = useAuthStore(
    (s) => s.session?.businessType ?? "restaurant",
  );
  const isStore = businessType === "store";

  const { data: restaurant } = useQuery({
    queryKey: queryKeys.restaurants.detail("yasmeen-house"),
    queryFn: getMyRestaurant,
  });
  const { data: governorates } = useQuery({
    queryKey: queryKeys.governorates,
    queryFn: getGovernorates,
  });
  const { data: regions } = useQuery({
    queryKey: queryKeys.regions,
    queryFn: getRegions,
  });

  const [logoUrl, setLogoUrl] = useState<string | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const logoInputRef = useRef<HTMLInputElement>(null);

  if (!restaurant) return <Skeleton className="h-96 rounded-2xl" />;

  const basePath = isStore ? "store" : "menu";
  const publicUrl =
    typeof window !== "undefined"
      ? `${window.location.origin}/${lang}/${basePath}/${restaurant.slug}`
      : "";

  const locationLabel = [
    governorates?.find((g) => g.id === restaurant.governorateId)?.name[lang],
    regions?.find((r) => r.id === restaurant.regionId)?.name[lang],
  ]
    .filter(Boolean)
    .join(lang === "ar" ? "، " : ", ");

  const pickLogo = (file: File | undefined) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setLogoPreview(reader.result as string);
    reader.readAsDataURL(file);
  };

  const confirmLogo = () => {
    setLogoUrl(logoPreview);
    setLogoPreview(null);
    if (logoInputRef.current) logoInputRef.current.value = "";
    toast.success(t.common.done);
  };

  const cancelLogo = () => {
    setLogoPreview(null);
    if (logoInputRef.current) logoInputRef.current.value = "";
  };

  const copyLink = async () => {
    await navigator.clipboard.writeText(publicUrl);
    toast.success(t.common.copied);
  };

  const shareProfile = async () => {
    if (navigator.share) {
      await navigator
        .share({ title: restaurant.name[lang], url: publicUrl })
        .catch(() => {});
    } else {
      await copyLink();
    }
  };

  return (
    <div className="space-y-6">
      {/* header */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex min-w-0 items-center gap-4">
          <div className="relative shrink-0">
            <Image
              src={logoUrl ?? restaurant.logoUrl}
              alt=""
              width={112}
              height={112}
              unoptimized={!!logoUrl}
              className="size-16 rounded-2xl border border-border object-cover sm:size-24 md:size-28"
            />
            <button
              type="button"
              aria-label={t.dashboard.updatePhoto}
              onClick={() => logoInputRef.current?.click()}
              className="absolute bottom-0 end-0 flex size-6 items-center justify-center rounded-full border-2 border-card bg-primary text-primary-foreground sm:size-8"
            >
              <Camera className="size-3.5 sm:size-4" />
            </button>
            <input
              ref={logoInputRef}
              type="file"
              accept="image/*"
              className="sr-only"
              onChange={(e) => pickLogo(e.target.files?.[0])}
            />
          </div>
          <div className="min-w-0">
            <h1 className="truncate font-heading text-lg font-bold sm:text-xl md:text-2xl">
              {restaurant.name[lang]}
            </h1>
            {locationLabel && (
              <p className="mt-1 flex items-center gap-1.5 truncate text-sm text-muted-foreground">
                <MapPin className="size-3.5 shrink-0" />
                <span className="truncate">{locationLabel}</span>
              </p>
            )}
          </div>
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger
            render={
              <Button
                variant="ghost"
                size="icon"
                className="shrink-0"
                aria-label="⋯"
              />
            }
          >
            <MoreVertical className="size-5" />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="min-w-64">
            <DropdownMenuItem
              render={
                <a href={publicUrl} target="_blank" rel="noopener noreferrer" />
              }
            >
              <User className="size-4" />
              {t.dashboard.viewAsPublic}
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => logoInputRef.current?.click()}>
              <Camera className="size-4" />
              {t.dashboard.updatePhoto}
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={copyLink}>
              <Link2 className="size-4" />
              {t.dashboard.copyProfileLink}
            </DropdownMenuItem>
            <DropdownMenuItem onClick={shareProfile}>
              <Share2 className="size-4" />
              {t.dashboard.shareProfile}
            </DropdownMenuItem>
            <DropdownMenuItem render={<a href={`/${lang}/dashboard/qr`} />}>
              <QrCode className="size-4" />
              {t.dashboard.showQrCode}
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => window.print()}>
              <Printer className="size-4" />
              {t.dashboard.printProfile}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <ImagePreviewDialog
        src={logoPreview}
        onConfirm={confirmLogo}
        onCancel={cancelLogo}
        t={t}
      />

      {/* sections */}
      <Tabs defaultValue="account" className="gap-6">
        <div className="scrollbar-none overflow-x-auto">
          <TabsList className="w-max flex-nowrap rounded-xl p-2 group-data-horizontal/tabs:h-14">
            <TabsTrigger
              value="account"
              className="shrink-0 rounded-lg px-6 py-2.5 font-semibold"
            >
              {t.dashboard.accountInfoTab}
            </TabsTrigger>
            <TabsTrigger
              value="contact"
              className="shrink-0 rounded-lg px-6 py-2.5 font-semibold"
            >
              {t.restaurant.contactInfo}
            </TabsTrigger>
            <TabsTrigger
              value="social"
              className="shrink-0 rounded-lg px-6 py-2.5 font-semibold"
            >
              {t.dashboard.socialMediaTab}
            </TabsTrigger>
            <TabsTrigger
              value="gallery"
              className="shrink-0 rounded-lg px-6 py-2.5 font-semibold"
            >
              {t.restaurant.gallery}
            </TabsTrigger>
            <TabsTrigger
              value="appearance"
              className="shrink-0 rounded-lg px-6 py-2.5 font-semibold"
            >
              {t.dashboard.appearanceTab}
            </TabsTrigger>
            <TabsTrigger
              value="plan"
              className="shrink-0 rounded-lg px-6 py-2.5 font-semibold"
            >
              {t.dashboard.planTab}
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="account">
          <AccountInfoSection
            restaurant={restaurant}
            isStore={isStore}
            t={t}
            lang={lang}
          />
        </TabsContent>
        <TabsContent value="contact">
          <ContactInfoSection restaurant={restaurant} t={t} lang={lang} />
        </TabsContent>
        <TabsContent value="social">
          <SocialMediaSection restaurant={restaurant} t={t} />
        </TabsContent>
        <TabsContent value="gallery">
          <GallerySection restaurant={restaurant} t={t} />
        </TabsContent>
        <TabsContent value="appearance">
          <AppearanceSection restaurant={restaurant} t={t} />
        </TabsContent>
        <TabsContent value="plan">
          <SubscriptionSection restaurant={restaurant} t={t} lang={lang} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
