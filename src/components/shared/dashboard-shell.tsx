"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ComponentType, ReactNode, SVGProps } from "react";

import { ExternalLink, LogOut } from "lucide-react";

import { LanguageSwitcher } from "@/components/shared/language-switcher";
import { Logo } from "@/components/shared/logo";
import { ThemeToggle } from "@/components/shared/theme-toggle";
import { Button } from "@/components/ui/button";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarSeparator,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { useI18n } from "@/i18n/client";

export interface DashboardNavItem {
  href: string;
  label: string;
  icon: ComponentType<SVGProps<SVGSVGElement>>;
  exact?: boolean;
}

export function DashboardShell({
  navItems,
  title,
  previewHref,
  previewLabel,
  children,
}: {
  navItems: DashboardNavItem[];
  title: string;
  previewHref?: string;
  previewLabel?: string;
  children: ReactNode;
}) {
  const { t, lang, dir } = useI18n();
  const pathname = usePathname();

  return (
    <SidebarProvider>
      <Sidebar side={dir === "rtl" ? "right" : "left"} collapsible="offcanvas">
        <SidebarHeader className="px-4 py-4">
          <Logo lang={lang} brand={t.common.brand} />
          <p className="mt-1 text-xs font-semibold text-muted-foreground">
            {title}
          </p>
        </SidebarHeader>
        <SidebarSeparator />
        <SidebarContent>
          <SidebarGroup>
            <SidebarGroupContent>
              <SidebarMenu className="gap-1.5">
                {navItems.map((item) => {
                  const isActive = item.exact
                    ? pathname === item.href
                    : pathname.startsWith(item.href);
                  return (
                    <SidebarMenuItem key={item.href}>
                      <SidebarMenuButton
                        isActive={isActive}
                        className="h-10 gap-3 rounded-xl px-3.5 font-semibold data-[active=true]:bg-sidebar-primary data-[active=true]:text-sidebar-primary-foreground data-[active=true]:shadow-glow"
                        render={<Link href={item.href} />}
                      >
                        <item.icon className="size-4.5" />
                        <span>{item.label}</span>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  );
                })}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>
        <SidebarFooter className="gap-2 p-4">
          {previewHref && (
            <Button
              variant="outline"
              className="w-full justify-center gap-2 font-semibold"
              render={
                <a
                  href={previewHref}
                  target="_blank"
                  rel="noopener noreferrer"
                />
              }
            >
              <ExternalLink className="size-4" />
              {previewLabel ?? t.dashboard.preview}
            </Button>
          )}
          <Button
            variant="ghost"
            className="w-full justify-center gap-2 font-semibold text-muted-foreground hover:text-destructive"
            render={<Link href={`/${lang}`} />}
          >
            <LogOut className="size-4" />
            {t.common.logout}
          </Button>
        </SidebarFooter>
      </Sidebar>

      <SidebarInset className="bg-surface-container-low/60 dark:bg-background">
        <header className="sticky top-0 z-30 flex h-14 items-center gap-2 border-b border-border/60 bg-background/85 px-4 backdrop-blur-xl">
          <SidebarTrigger />
          <h1 className="flex-1 truncate font-heading text-base font-bold md:text-lg">
            {title}
          </h1>
          <LanguageSwitcher />
          <ThemeToggle />
        </header>
        <div className="flex-1 p-4 md:p-6 lg:p-8">{children}</div>
      </SidebarInset>
    </SidebarProvider>
  );
}
