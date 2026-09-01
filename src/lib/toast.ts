import { useToastStore, type ToastAction, type ToastType } from "@/stores/toast-store";

const DEFAULT_DURATION = 4000;

interface ToastOptions {
  duration?: number;
  action?: ToastAction;
}

function newId() {
  return typeof crypto !== "undefined" && crypto.randomUUID
    ? crypto.randomUUID()
    : `${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

function emit(message: string, type: ToastType, opts?: ToastOptions) {
  const id = newId();
  useToastStore.getState().show({
    id,
    message,
    type,
    duration: opts?.duration ?? DEFAULT_DURATION,
    action: opts?.action,
  });
  return id;
}

type ToastFn = ((message: string, opts?: ToastOptions) => string) & {
  success: (message: string, opts?: ToastOptions) => string;
  error: (message: string, opts?: ToastOptions) => string;
  warning: (message: string, opts?: ToastOptions) => string;
  info: (message: string, opts?: ToastOptions) => string;
  dismiss: (id?: string) => void;
};

/** Drop-in replacement for sonner's `toast` — same call shape, backed by
 * our own stacked-card UI (`ToastStack`) instead of a third-party library. */
const toast = ((message: string, opts?: ToastOptions) =>
  emit(message, "default", opts)) as ToastFn;
toast.success = (message, opts) => emit(message, "success", opts);
toast.error = (message, opts) => emit(message, "error", opts);
toast.warning = (message, opts) => emit(message, "warning", opts);
toast.info = (message, opts) => emit(message, "info", opts);
toast.dismiss = (id) => {
  const store = useToastStore.getState();
  if (id) store.hide(id);
  else store.clear();
};

export { toast };
