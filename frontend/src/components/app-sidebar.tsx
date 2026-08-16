"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Check,
  ChevronDown,
  ChevronsUpDown,
  LayoutGrid,
  Layers,
  LogOut,
  Moon,
  Settings,
  Sun,
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import {
  Collapsible,
  CollapsibleTrigger,
  CollapsiblePanel,
} from "@/components/ui/collapsible";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { useCurrentUser } from "@/hooks/use-current-user";
import { useTheme } from "@/components/theme-provider";
import {
  COLOR_MODE_ORDER,
  getColorModeMeta,
} from "@/lib/color-modes";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001";

const navItems = [
  { title: "Tasks", href: "/tasks", icon: LayoutGrid },
  { title: "Projects", href: "/projects", icon: Layers },
];

export function AppSidebar({ active }: { active: "Tasks" | "Projects" }) {
  const { user } = useCurrentUser();
  const router = useRouter();
  const { theme, setTheme, colorMode, setColorMode } = useTheme();
  const [workspaceOpen, setWorkspaceOpen] = useState(true);

  async function handleLogout() {
    await fetch(`${API_URL}/auth/logout`, {
      method: "POST",
      credentials: "include",
    });
    router.push("/");
  }

  const initials = user?.name?.slice(0, 1).toUpperCase() ?? "?";
  const currentAccentMeta = getColorModeMeta(colorMode, theme);

  return (
    <Sidebar collapsible="offcanvas" className="border-r">
      <SidebarHeader>
        <DropdownMenu>
          <DropdownMenuTrigger className="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left hover:bg-sidebar-accent">
            <Avatar className="h-6 w-6">
              <AvatarImage src={user?.avatarUrl ?? undefined} />
              <AvatarFallback className="text-xs">{initials}</AvatarFallback>
            </Avatar>
            <span className="flex-1 truncate text-sm font-semibold text-sidebar-foreground">
              {user?.name ?? "Loading…"}
            </span>
            <ChevronsUpDown className="h-4 w-4 text-muted-foreground" />
          </DropdownMenuTrigger>
          <DropdownMenuContent
            align="start"
            alignOffset={-8}
            collisionPadding={0}
            className="w-64 rounded-xl p-1 shadow-lg"
          >
            <div className="flex flex-col items-center gap-1.5 px-3 pt-3.5 pb-3 text-center">
              <Avatar className="h-11 w-11">
                <AvatarImage src={user?.avatarUrl ?? undefined} />
                <AvatarFallback className="text-sm font-medium">
                  {initials}
                </AvatarFallback>
              </Avatar>
              <div className="flex flex-col items-center gap-0.5">
                <span className="text-sm font-medium text-foreground">
                  {user?.name ?? "Loading…"}
                </span>
                {user?.email && (
                  <span className="text-xs text-muted-foreground font-normal">
                    {user.email}
                  </span>
                )}
              </div>
            </div>
            <DropdownMenuSeparator className="-mx-1 my-1 opacity-60" />

            <DropdownMenuSub>
              <DropdownMenuSubTrigger className="cursor-pointer px-2.5 py-2.5 gap-2.5 text-sm">
                <Sun className="h-4 w-4 shrink-0" />
                Change Theme
              </DropdownMenuSubTrigger>
              <DropdownMenuSubContent className="w-44 rounded-xl p-1.5 shadow-lg">
                <DropdownMenuGroup>
                  <DropdownMenuLabel className="px-2 py-1 text-xs font-normal text-muted-foreground">
                    Theme
                  </DropdownMenuLabel>
                  <DropdownMenuItem
                    onClick={() => setTheme("light")}
                    className="cursor-pointer justify-between px-2 py-1.5 text-sm"
                  >
                    <span className="flex items-center gap-2">
                      <Sun className="h-4 w-4 shrink-0" />
                      Light
                    </span>
                    {theme === "light" && <Check className="h-4 w-4 ml-auto" />}
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => setTheme("dark")}
                    className="cursor-pointer justify-between px-2 py-1.5 text-sm"
                  >
                    <span className="flex items-center gap-2">
                      <Moon className="h-4 w-4 shrink-0" />
                      Dark
                    </span>
                    {theme === "dark" && <Check className="h-4 w-4 ml-auto" />}
                  </DropdownMenuItem>
                </DropdownMenuGroup>
              </DropdownMenuSubContent>
            </DropdownMenuSub>

            <DropdownMenuSub>
              <DropdownMenuSubTrigger className="cursor-pointer px-2.5 py-2.5 gap-2.5 text-sm">
                <span
                  className="h-3.5 w-3.5 shrink-0 rounded-[4px] ring-1 ring-inset ring-border"
                  style={{ backgroundColor: currentAccentMeta.hex }}
                />
                Color Mode
              </DropdownMenuSubTrigger>
              <DropdownMenuSubContent className="w-44 rounded-xl p-1.5 shadow-lg">
                <DropdownMenuGroup>
                  <DropdownMenuLabel className="px-2 py-1 text-xs font-normal text-muted-foreground">
                    Color Mode
                  </DropdownMenuLabel>
                  {COLOR_MODE_ORDER.map((mode) => {
                    const meta = getColorModeMeta(mode, theme);
                    return (
                      <DropdownMenuItem
                        key={mode}
                        onClick={() => setColorMode(mode)}
                        className="cursor-pointer justify-between px-2 py-1.5 text-sm"
                      >
                        <span className="flex items-center gap-2">
                          <span
                            className="h-3.5 w-3.5 shrink-0 rounded-[4px] ring-1 ring-inset ring-border"
                            style={{ backgroundColor: meta.hex }}
                          />
                          {meta.label}
                        </span>
                        {colorMode === mode && (
                          <Check className="h-4 w-4 ml-auto" />
                        )}
                      </DropdownMenuItem>
                    );
                  })}
                </DropdownMenuGroup>
              </DropdownMenuSubContent>
            </DropdownMenuSub>

            <DropdownMenuItem
              onClick={() => router.push("/settings")}
              className="cursor-pointer px-2.5 py-2.5 gap-2.5 text-sm"
            >
              <Settings className="h-4 w-4 shrink-0" />
              Settings
            </DropdownMenuItem>

            <DropdownMenuSeparator className="-mx-1 my-1 opacity-60" />
            <DropdownMenuItem
              onClick={handleLogout}
              className="cursor-pointer px-2.5 py-2.5 gap-2.5 text-sm"
            >
              <LogOut className="h-4 w-4 shrink-0" />
              Log out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <Collapsible open={workspaceOpen} onOpenChange={setWorkspaceOpen}>
            <CollapsibleTrigger className="flex h-8 w-full shrink-0 items-center justify-between rounded-md px-2 text-xs font-medium text-sidebar-foreground/70 outline-hidden ring-sidebar-ring transition-[margin,opacity] duration-200 ease-linear hover:bg-sidebar-accent focus-visible:ring-2 group-data-[collapsible=icon]:-mt-8 group-data-[collapsible=icon]:opacity-0">
              Workspace
              <ChevronDown
                className={cn(
                  "h-3.5 w-3.5 shrink-0 transition-transform duration-150",
                  !workspaceOpen && "-rotate-90",
                )}
              />
            </CollapsibleTrigger>
            <CollapsiblePanel>
              <SidebarGroupContent>
                <SidebarMenu>
                  {navItems.map((item) => (
                    <SidebarMenuItem key={item.title}>
                      <SidebarMenuButton
                        isActive={active === item.title}
                        onClick={() => router.push(item.href)}
                      >
                        <item.icon />
                        <span>{item.title}</span>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              </SidebarGroupContent>
            </CollapsiblePanel>
          </Collapsible>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
