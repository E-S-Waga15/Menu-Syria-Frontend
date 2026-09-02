"use client"

import * as React from "react"
import { Dialog as DialogPrimitive } from "@base-ui/react/dialog"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { XIcon } from "lucide-react"

function Dialog({ ...props }: DialogPrimitive.Root.Props) {
  return <DialogPrimitive.Root data-slot="dialog" {...props} />
}

function DialogTrigger({ ...props }: DialogPrimitive.Trigger.Props) {
  return <DialogPrimitive.Trigger data-slot="dialog-trigger" {...props} />
}

function DialogPortal({ ...props }: DialogPrimitive.Portal.Props) {
  return <DialogPrimitive.Portal data-slot="dialog-portal" {...props} />
}

function DialogClose({ ...props }: DialogPrimitive.Close.Props) {
  return <DialogPrimitive.Close data-slot="dialog-close" {...props} />
}

function DialogOverlay({
  className,
  ...props
}: DialogPrimitive.Backdrop.Props) {
  return (
    <DialogPrimitive.Backdrop
      data-slot="dialog-overlay"
      className={cn(
        "fixed inset-0 isolate z-50 bg-black/10 duration-100 supports-backdrop-filter:backdrop-blur-xs data-open:animate-in data-open:fade-in-0 data-closed:animate-out data-closed:fade-out-0",
        className
      )}
      {...props}
    />
  )
}

function DialogContent({
  className,
  children,
  showCloseButton = false,
  ...props
}: DialogPrimitive.Popup.Props & {
  /**
   * A floating close button in the corner. Off by default: <DialogHeader />
   * carries the close now, so a dialog with a header would otherwise show two.
   * Turn it on only for a dialog that deliberately has no header.
   */
  showCloseButton?: boolean
}) {
  return (
    <DialogPortal>
      <DialogOverlay />
      <DialogPrimitive.Popup
        data-slot="dialog-content"
        className={cn(
          // `width` (not `max-width`) carries the mobile edge margin: a
          // caller's own `max-w-*` only clamps it narrower on large
          // screens, it can never widen the dialog back out to the edges
          "fixed top-1/2 start-1/2 z-50 grid w-[calc(100%-2rem)] max-w-sm -translate-x-1/2 rtl:translate-x-1/2 -translate-y-1/2 gap-4 rounded-xl bg-popover p-4 text-sm text-popover-foreground duration-100 outline-none data-open:animate-in data-open:fade-in-0 data-open:zoom-in-95 data-closed:animate-out data-closed:fade-out-0 data-closed:zoom-out-95",
          className
        )}
        {...props}
      >
        {children}
        {showCloseButton && (
          <DialogPrimitive.Close
            data-slot="dialog-close"
            render={
              <Button
                variant="ghost"
                className="absolute top-2 end-2"
                size="icon-sm"
              />
            }
          >
            <XIcon
            />
            <span className="sr-only">Close</span>
          </DialogPrimitive.Close>
        )}
      </DialogPrimitive.Popup>
    </DialogPortal>
  )
}

/**
 * The bar every dialog is topped by: its title on one side, its close on the
 * other, pinned while the body scrolls underneath.
 *
 * The negative margins pull it back through <DialogContent />'s `p-4` so it
 * spans the popup edge to edge — content then passes *beneath* it rather than
 * beside it. A dialog whose content is unpadded (a full-bleed image gallery,
 * say) cancels them with `mx-0 mt-0`.
 *
 * `sticky` needs the popup itself to be the scroll container, which is what
 * every scrolling dialog here already does with `overflow-y-auto`.
 */
function DialogHeader({
  className,
  children,
  showClose = true,
  flush = false,
  ...props
}: React.ComponentProps<"div"> & {
  showClose?: boolean
  /** set this on a dialog whose <DialogContent /> is `p-0` — see below */
  flush?: boolean
}) {
  return (
    <div
      data-slot="dialog-header"
      className={cn(
        "sticky z-20 flex items-center justify-between gap-3 rounded-t-xl border-b border-border/60 bg-popover px-4 py-3",
        // The sticky offset has to mirror whatever padding sits above the bar,
        // or the bar pins in the wrong place: too low and a sliver of
        // scrolling content shows above it, too high and its own top is
        // clipped. The two cases are the padded popup (`p-4`, pulled back
        // through with negative margins) and the flush one (`p-0`), so the
        // offset and the margins are set together and can never disagree.
        flush ? "top-0" : "-top-4 -mx-4 -mt-4",
        className
      )}
      {...props}
    >
      <div className="flex min-w-0 flex-col gap-1">{children}</div>
      {showClose && (
        <DialogPrimitive.Close
          data-slot="dialog-header-close"
          render={
            <Button
              variant="ghost"
              size="icon-sm"
              className="-me-1.5 shrink-0 text-muted-foreground hover:text-foreground"
            />
          }
        >
          <XIcon />
          <span className="sr-only">Close</span>
        </DialogPrimitive.Close>
      )}
    </div>
  )
}

function DialogFooter({
  className,
  showCloseButton = false,
  children,
  ...props
}: React.ComponentProps<"div"> & {
  showCloseButton?: boolean
}) {
  return (
    <div
      data-slot="dialog-footer"
      className={cn(
        "-mx-4 -mb-4 flex flex-col-reverse gap-2 rounded-b-xl border-t bg-muted/50 p-4 sm:flex-row sm:justify-end",
        className
      )}
      {...props}
    >
      {children}
      {showCloseButton && (
        <DialogPrimitive.Close render={<Button variant="outline" />}>
          Close
        </DialogPrimitive.Close>
      )}
    </div>
  )
}

function DialogTitle({ className, ...props }: DialogPrimitive.Title.Props) {
  return (
    <DialogPrimitive.Title
      data-slot="dialog-title"
      className={cn(
        // `truncate` clips to the line box, so the line height has to leave
        // room for descenders — `leading-none` cropped the tails off Arabic
        // letters like ي and ج in every dialog header.
        "truncate font-heading text-base leading-normal font-bold",
        className
      )}
      {...props}
    />
  )
}

function DialogDescription({
  className,
  ...props
}: DialogPrimitive.Description.Props) {
  return (
    <DialogPrimitive.Description
      data-slot="dialog-description"
      className={cn(
        "text-sm text-muted-foreground *:[a]:underline *:[a]:underline-offset-3 *:[a]:hover:text-foreground",
        className
      )}
      {...props}
    />
  )
}

export {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogOverlay,
  DialogPortal,
  DialogTitle,
  DialogTrigger,
}
