"use client";

import { useRef, useState } from "react";

import { Download, QrCode, Share2 } from "lucide-react";
import { QRCodeCanvas } from "qrcode.react";

import logoMark from "@/assets/logo.png";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useI18n } from "@/i18n/client";
import { toast } from "@/lib/toast";

/**
 * Export geometry, in device pixels. The code is rendered at this size and
 * merely displayed smaller, so the PNG stays crisp when printed.
 */
const QR_PX = 440;
/** on-screen size; QRCodeCanvas renders at QR_PX and is scaled down by CSS */
const QR_DISPLAY = 176;
const PAD = 48;
const CAPTION_H = 56;
const URL_H = 40;
const CARD = { w: QR_PX + PAD * 2, h: PAD * 2 + QR_PX + CAPTION_H + URL_H };

/**
 * The two round actions on an agent page: share the page, or open its QR.
 *
 * The QR carries the mark in its centre at error-correction level H, which
 * reserves enough redundancy that the excavated middle still scans.
 *
 * Export composes a fresh canvas rather than screenshotting the DOM: the
 * on-screen card and the exported PNG are laid out from the same constants, so
 * there is no third-party rasteriser to disagree with, and no dependency
 * beyond the QR generator already in the project.
 *
 * The URL is whatever page the visitor is actually on. It is captured in the
 * click handler rather than an effect: reading `window` during render would
 * break SSR, and the lint rules (rightly) reject setState inside an effect.
 * The dialog only mounts once open, so the value is always there in time.
 */
export function AgentShareActions({
  agentName,
  agentRole,
  agentPhotoUrl,
}: {
  agentName: string;
  /** e.g. "Menu Syria agent in Damascus, Bab Touma" — the share text */
  agentRole: string;
  /** centred in the code; falls back to the platform mark when the agent
   * has none */
  agentPhotoUrl?: string;
}) {
  const { t, lang } = useI18n();
  const [open, setOpen] = useState(false);
  const [url, setUrl] = useState("");
  const qrWrapRef = useRef<HTMLDivElement>(null);

  const openQr = () => {
    setUrl(window.location.href);
    setOpen(true);
  };

  /** platform first, then the person — one line under the code */
  const caption = `${t.common.brand} | ${agentName}`;

  /** name and role, e.g. "Ahmad — Menu Syria agent in Damascus, Bab Touma" */
  const headline = `${agentName} — ${agentRole}`;

  const sharePage = async () => {
    const pageUrl = window.location.href;
    const data = { title: caption, text: headline, url: pageUrl };

    if (navigator.share) {
      try {
        await navigator.share(data);
        return;
      } catch (error) {
        // dismissing the share sheet is not a failure worth reporting
        if (error instanceof DOMException && error.name === "AbortError")
          return;
      }
    }

    try {
      await navigator.clipboard.writeText(pageUrl);
      toast.success(t.agentPage.linkCopied);
    } catch {
      toast.error(t.agentPage.shareFailed);
    }
  };

  /** draws the card: the code, then the caption, then the link */
  const composeCard = async (): Promise<HTMLCanvasElement | null> => {
    const qr = qrWrapRef.current?.querySelector("canvas");
    if (!qr) return null;

    // without this the first export can land before Cairo/Epilogue are ready
    // and fall back to a system face
    try {
      await document.fonts.ready;
    } catch {
      /* font loading API unavailable — the fallback stack still renders */
    }

    const canvas = document.createElement("canvas");
    canvas.width = CARD.w;
    canvas.height = CARD.h;
    const ctx = canvas.getContext("2d");
    if (!ctx) return null;

    const family = getComputedStyle(document.body).fontFamily;
    const centre = CARD.w / 2;

    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, CARD.w, CARD.h);

    ctx.drawImage(qr, PAD, PAD, QR_PX, QR_PX);

    ctx.textAlign = "center";
    ctx.direction = lang === "ar" ? "rtl" : "ltr";
    ctx.fillStyle = "#191c1d";
    ctx.font = `700 28px ${family}`;
    ctx.fillText(caption, centre, PAD + QR_PX + 44, CARD.w - PAD);

    ctx.direction = "ltr";
    ctx.fillStyle = "#6b7280";
    ctx.font = `500 18px ${family}`;
    ctx.fillText(url, centre, PAD + QR_PX + CAPTION_H + 30, CARD.w - PAD);

    return canvas;
  };

  const fileName = `${agentName.replace(/\s+/g, "-")}-qr.png`;

  // a remote photo without CORS headers taints the canvas: it still draws
  // and displays fine, it just can't be read back for export — so the
  // download/share actions fail closed with a toast instead of throwing
  const downloadCard = async () => {
    const canvas = await composeCard();
    if (!canvas) return;
    try {
      const link = document.createElement("a");
      link.download = fileName;
      link.href = canvas.toDataURL("image/png");
      link.click();
    } catch {
      toast.error(t.agentPage.shareFailed);
    }
  };

  const shareCard = async () => {
    const canvas = await composeCard();
    if (!canvas) return;

    const blob = await new Promise<Blob | null>((resolve) => {
      try {
        canvas.toBlob(resolve, "image/png");
      } catch {
        resolve(null);
      }
    });
    if (!blob) {
      toast.error(t.agentPage.shareFailed);
      return;
    }

    const file = new File([blob], fileName, { type: "image/png" });

    // sharing files is the newest of these APIs — fall back to a download,
    // which every browser can do
    if (navigator.canShare?.({ files: [file] })) {
      try {
        await navigator.share({
          files: [file],
          title: caption,
          // a PNG carries no link and no context of its own, so the name, the
          // role with its governorate and region, and the URL ride along in
          // the share text — on WhatsApp that becomes the caption under the photo
          text: `${headline}\n${url}`,
        });
        return;
      } catch (error) {
        if (error instanceof DOMException && error.name === "AbortError")
          return;
      }
    }

    await downloadCard();
  };

  const roundButton =
    "flex size-10 shrink-0 items-center justify-center rounded-full border border-border text-muted-foreground transition-colors duration-200 hover:border-primary/40 hover:bg-berry-soft/30 hover:text-primary focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none";

  return (
    <>
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={sharePage}
          aria-label={t.agentPage.shareLabel}
          title={t.agentPage.shareLabel}
          className={roundButton}
        >
          <Share2 className="size-4.5" />
        </button>
        <button
          type="button"
          onClick={openQr}
          aria-label={t.agentPage.qrLabel}
          title={t.agentPage.qrLabel}
          className={roundButton}
        >
          <QrCode className="size-4.5" />
        </button>
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle className="text-base">
              {t.agentPage.qrTitle}
            </DialogTitle>
          </DialogHeader>

          {/* mirrors the exported card: code, caption, link */}
          <div className="mt-1 flex flex-col items-center">
            <div
              ref={qrWrapRef}
              className="w-full max-w-[200px] rounded-2xl border border-border/60 bg-white p-3"
            >
              <QRCodeCanvas
                value={url}
                size={QR_PX}
                level="H"
                fgColor="#191c1d"
                bgColor="#ffffff"
                // QRCodeCanvas sets an inline style of `size` px, which beats
                // any class; it spreads a passed style last, so this overrides
                // it with a responsive size instead of a fixed pixel value —
                // the 440px canvas stays crisp while scaling to fit any
                // dialog width down to the smallest phone
                style={{ width: "100%", height: "100%", aspectRatio: "1 / 1" }}
                imageSettings={{
                  src: agentPhotoUrl || logoMark.src,
                  width: agentPhotoUrl ? 90 : 80,
                  height: agentPhotoUrl ? 90 : 100,
                  excavate: true,
                  ...(agentPhotoUrl ? { crossOrigin: "anonymous" } : {}),
                }}
              />
            </div>

            <p className="mt-4 text-center text-sm font-bold">{caption}</p>
            <p
              className="mt-2 max-w-full truncate rounded-full bg-surface-container px-3.5 py-1.5 text-xs text-muted-foreground"
              dir="ltr"
            >
              {url}
            </p>
          </div>

          <div className="mt-5 flex gap-2">
            <Button className="h-10 flex-1" onClick={shareCard}>
              <Share2 className="size-4" />
              {t.agentPage.qrShare}
            </Button>
            <Button
              variant="outline"
              className="h-10 flex-1 border-[1.5px]"
              onClick={downloadCard}
            >
              <Download className="size-4" />
              {t.agentPage.qrDownload}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
