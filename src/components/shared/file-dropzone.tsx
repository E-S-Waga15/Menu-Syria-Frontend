"use client";

import Image from "next/image";
import { useRef, useState } from "react";

import { CloudUpload, X } from "lucide-react";

import { useI18n } from "@/i18n/client";
import { cn } from "@/lib/utils";

export function FileDropzone({
  label,
  hint,
  onFile,
  className,
}: {
  label: string;
  hint?: string;
  onFile?: (file: File | null) => void;
  className?: string;
}) {
  const { t } = useI18n();
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);

  const accept = (file: File | undefined) => {
    if (!file) return;
    setFileName(file.name);
    onFile?.(file);
    if (file.type.startsWith("image/")) {
      const reader = new FileReader();
      reader.onload = () => setPreview(reader.result as string);
      reader.readAsDataURL(file);
    } else {
      setPreview(null);
    }
  };

  const clear = (e: React.MouseEvent) => {
    e.stopPropagation();
    setPreview(null);
    setFileName(null);
    onFile?.(null);
    if (inputRef.current) inputRef.current.value = "";
  };

  return (
    <button
      type="button"
      onClick={() => inputRef.current?.click()}
      onDragOver={(e) => {
        e.preventDefault();
        setDragging(true);
      }}
      onDragLeave={() => setDragging(false)}
      onDrop={(e) => {
        e.preventDefault();
        setDragging(false);
        accept(e.dataTransfer.files[0]);
      }}
      className={cn(
        "relative flex min-h-32 w-full flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed p-5 text-center transition-[border-color,background-color] duration-200",
        dragging
          ? "border-primary bg-berry-soft/30 scale-[1.01]"
          : "border-border hover:border-primary/50 hover:bg-surface-container-low",
        className,
      )}
    >
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="sr-only"
        onChange={(e) => accept(e.target.files?.[0])}
        tabIndex={-1}
      />

      {preview ? (
        <>
          <Image
            src={preview}
            alt=""
            width={72}
            height={72}
            className="size-18 rounded-xl object-cover shadow-soft"
            unoptimized
          />
          <p className="max-w-full truncate text-xs font-semibold">
            {fileName}
          </p>
          <span
            role="button"
            aria-label={t.common.delete}
            onClick={clear}
            className="absolute top-2 end-2 flex size-6 items-center justify-center rounded-full bg-muted text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
          >
            <X className="size-3.5" />
          </span>
        </>
      ) : (
        <>
          <span className="flex size-11 items-center justify-center rounded-full bg-berry-soft text-berry-soft-foreground">
            <CloudUpload className="size-5" />
          </span>
          <p className="text-sm font-semibold">{label}</p>
          <p className="text-xs text-muted-foreground">
            {hint ?? t.auth.dropzoneHint}
          </p>
        </>
      )}
    </button>
  );
}
