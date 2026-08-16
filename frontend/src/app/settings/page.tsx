"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Check, Moon, Palette, Pencil, Search, Sun, User } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useCurrentUser, type CurrentUser } from "@/hooks/use-current-user";
import { useTheme } from "@/components/theme-provider";
import { COLOR_MODE_ORDER, getColorModeMeta } from "@/lib/color-modes";
import { updateProfile, uploadAvatar } from "@/lib/api-users";
import { cn } from "@/lib/utils";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001";

type ProfileField = "name" | "title" | "username" | "email";

function Row({
  label,
  hint,
  children,
  last,
}: {
  label: string;
  hint?: string;
  children: React.ReactNode;
  last?: boolean;
}) {
  return (
    <div
      className={`flex items-center justify-between px-5 py-4 ${last ? "" : "border-b border-border"}`}
    >
      <div>
        <div className="text-sm font-medium text-foreground">{label}</div>
        {hint && <div className="text-xs text-muted-foreground">{hint}</div>}
      </div>
      {children}
    </div>
  );
}

function EditableField({
  field,
  value,
  placeholder,
  onSave,
}: {
  field: ProfileField;
  value: string;
  placeholder: string;
  onSave: (field: ProfileField, value: string) => Promise<void>;
}) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(value);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  async function commit() {
    const trimmed = draft.trim();
    if (trimmed === value) {
      setEditing(false);
      return;
    }
    setSaving(true);
    setError(null);
    try {
      await onSave(field, trimmed);
      setEditing(false);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to save");
      setDraft(value);
    } finally {
      setSaving(false);
    }
  }

  if (editing) {
    return (
      <div className="flex flex-col items-end gap-1">
        <input
          autoFocus
          value={draft}
          disabled={saving}
          onChange={(e) => setDraft(e.target.value)}
          onBlur={commit}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              commit();
            }
            if (e.key === "Escape") {
              setDraft(value);
              setEditing(false);
              setError(null);
            }
          }}
          className="flex h-8 w-[148px] items-center rounded-[6px] border border-input bg-transparent px-3 text-sm text-foreground outline-none focus-visible:border-ring"
        />
        {error && <span className="text-xs text-destructive">{error}</span>}
      </div>
    );
  }

  return (
    <button
      type="button"
      onClick={() => setEditing(true)}
      className="flex h-8 w-[148px] items-center rounded-[6px] bg-muted px-3 text-sm text-muted-foreground hover:bg-accent"
    >
      {value || placeholder}
    </button>
  );
}

function ProfilePanel({
  user,
  onProfileSave,
  onAvatarUploaded,
  onLeaveWorkspace,
}: {
  user: CurrentUser | null;
  onProfileSave: (field: ProfileField, value: string) => Promise<void>;
  onAvatarUploaded: (user: CurrentUser) => void;
  onLeaveWorkspace: () => void;
}) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [avatarError, setAvatarError] = useState<string | null>(null);
  const [emailEditing, setEmailEditing] = useState(false);
  const [emailDraft, setEmailDraft] = useState(user?.email ?? "");
  const [emailError, setEmailError] = useState<string | null>(null);
  const initials = user?.name?.slice(0, 2).toUpperCase() ?? "?";

  async function handleAvatarChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    setUploading(true);
    setAvatarError(null);
    try {
      const updated = await uploadAvatar(file);
      onAvatarUploaded(updated);
    } catch {
      setAvatarError("Upload failed");
    } finally {
      setUploading(false);
    }
  }

  async function commitEmail() {
    const trimmed = emailDraft.trim();
    if (trimmed === (user?.email ?? "")) {
      setEmailEditing(false);
      return;
    }
    setEmailError(null);
    try {
      await onProfileSave("email", trimmed);
      setEmailEditing(false);
    } catch (e) {
      setEmailError(e instanceof Error ? e.message : "Failed to save");
    }
  }

  return (
    <>
      <h1 className="text-lg text-foreground">Profile</h1>

      <div className="mt-5 rounded-[8px] border border-border">
        <Row label="Profile picture">
          <div className="flex flex-col items-end gap-1">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
              className="group relative"
              aria-label="Change profile picture"
            >
              <Avatar className="h-7 w-7">
                <AvatarImage src={user?.avatarUrl ?? undefined} />
                <AvatarFallback className="text-[10px]">{initials}</AvatarFallback>
              </Avatar>
              <span className="absolute inset-0 hidden items-center justify-center rounded-full bg-black/40 group-hover:flex">
                <Pencil className="h-3 w-3 text-white" />
              </span>
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleAvatarChange}
            />
            {avatarError && (
              <span className="text-xs text-destructive">{avatarError}</span>
            )}
          </div>
        </Row>
        <Row label="Email">
          {emailEditing ? (
            <div className="flex flex-col items-end gap-1">
              <input
                autoFocus
                type="email"
                value={emailDraft}
                onChange={(e) => setEmailDraft(e.target.value)}
                onBlur={commitEmail}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    commitEmail();
                  }
                  if (e.key === "Escape") {
                    setEmailDraft(user?.email ?? "");
                    setEmailEditing(false);
                    setEmailError(null);
                  }
                }}
                placeholder="you@example.com"
                className="h-8 w-[200px] rounded-[6px] border border-input bg-transparent px-3 text-sm text-foreground outline-none focus-visible:border-ring"
              />
              {emailError && (
                <span className="text-xs text-destructive">{emailError}</span>
              )}
            </div>
          ) : (
            <button
              type="button"
              onClick={() => setEmailEditing(true)}
              className="flex items-center gap-2 text-muted-foreground hover:text-foreground"
            >
              {user?.email ?? "Add email"}
              <Pencil className="h-3.5 w-3.5 text-foreground" />
            </button>
          )}
        </Row>
        <Row label="Full name">
          <EditableField
            field="name"
            value={user?.name ?? ""}
            placeholder="Add name"
            onSave={onProfileSave}
          />
        </Row>
        <Row label="Title" hint="Your job title or role">
          <EditableField
            field="title"
            value={user?.title ?? ""}
            placeholder="Add title"
            onSave={onProfileSave}
          />
        </Row>
        <Row
          label="Username"
          hint="One word, like a nickname or first name"
          last
        >
          <EditableField
            field="username"
            value={user?.username ?? ""}
            placeholder="Add username"
            onSave={onProfileSave}
          />
        </Row>
      </div>

      <h2 className="mt-9 text-base text-foreground">Workspace access</h2>
      <div className="mt-4 flex items-center justify-between rounded-[8px] border border-border px-5 py-5">
        <span className="text-muted-foreground">
          Remove yourself from the workspace
        </span>
        <button
          type="button"
          onClick={onLeaveWorkspace}
          className="rounded-[6px] bg-destructive/10 px-3 py-2 font-medium text-destructive hover:bg-destructive/20"
        >
          Leave Workspace
        </button>
      </div>
    </>
  );
}

function ThemePanel() {
  const { theme, setTheme } = useTheme();

  return (
    <>
      <h1 className="text-lg text-foreground">Theme</h1>
      <div className="mt-5 flex gap-3">
        <button
          type="button"
          onClick={() => setTheme("light")}
          className={cn(
            "flex flex-1 flex-col items-center gap-2 rounded-[8px] border px-4 py-5",
            theme === "light" ? "border-foreground" : "border-border",
          )}
        >
          <Sun className="h-5 w-5" />
          <span className="font-medium text-foreground">Light</span>
          {theme === "light" && <Check className="h-3.5 w-3.5" />}
        </button>
        <button
          type="button"
          onClick={() => setTheme("dark")}
          className={cn(
            "flex flex-1 flex-col items-center gap-2 rounded-[8px] border px-4 py-5",
            theme === "dark" ? "border-foreground" : "border-border",
          )}
        >
          <Moon className="h-5 w-5" />
          <span className="font-medium text-foreground">Dark</span>
          {theme === "dark" && <Check className="h-3.5 w-3.5" />}
        </button>
      </div>
    </>
  );
}

function ColorPanel() {
  const { theme, colorMode, setColorMode } = useTheme();

  return (
    <>
      <h1 className="text-lg text-foreground">Color</h1>
      <div className="mt-5 grid grid-cols-3 gap-3">
        {COLOR_MODE_ORDER.map((mode) => {
          const meta = getColorModeMeta(mode, theme);
          const isActive = colorMode === mode;
          return (
            <button
              key={mode}
              type="button"
              onClick={() => setColorMode(mode)}
              className={cn(
                "flex flex-col items-center gap-2 rounded-[8px] border px-4 py-5",
                isActive ? "border-foreground" : "border-border",
              )}
            >
              <span
                className="h-6 w-6 shrink-0 rounded-full ring-1 ring-inset ring-border"
                style={{ backgroundColor: meta.hex }}
              />
              <span className="font-medium text-foreground">{meta.label}</span>
              {isActive && <Check className="h-3.5 w-3.5" />}
            </button>
          );
        })}
      </div>
    </>
  );
}

export default function SettingsPage() {
  const router = useRouter();
  const { user, loading, setUser } = useCurrentUser();
  const [tab, setTab] = useState<"profile" | "theme" | "color">("profile");
  const [navQuery, setNavQuery] = useState("");

  useEffect(() => {
    if (!loading && !user) router.replace("/");
  }, [loading, user, router]);

  async function handleLeaveWorkspace() {
    await fetch(`${API_URL}/auth/logout`, {
      method: "POST",
      credentials: "include",
    });
    router.push("/");
  }

  async function handleProfileSave(field: ProfileField, value: string) {
    const updated = await updateProfile({ [field]: value || undefined });
    setUser(updated);
  }

  const navItems = [
    { key: "profile" as const, label: "Profile", icon: User },
    { key: "theme" as const, label: "Theme", icon: Sun },
    { key: "color" as const, label: "Color", icon: Palette },
  ];

  if (loading || !user) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <p className="text-sm text-muted-foreground">Loading…</p>
      </div>
    );
  }

  return (
    <main className="flex min-h-screen bg-background text-sm">
      <aside className="hidden w-64 shrink-0 border-r border-border bg-muted px-3 py-4 md:block">
        <Link
          href="/tasks"
          className="flex items-center gap-2 rounded-[6px] px-1 py-1 text-foreground hover:bg-accent"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Back to app
        </Link>
        <div className="mt-4 flex h-8 items-center gap-2 rounded-[6px] border border-border px-2 text-muted-foreground focus-within:border-ring">
          <Search className="h-3.5 w-3.5 shrink-0" />
          <input
            value={navQuery}
            onChange={(e) => setNavQuery(e.target.value)}
            placeholder="Search"
            className="min-w-0 flex-1 bg-transparent text-sm text-foreground outline-none placeholder:text-muted-foreground"
          />
        </div>
        <nav className="mt-3 space-y-0.5">
          {navItems
            .filter((item) =>
              item.label.toLowerCase().includes(navQuery.trim().toLowerCase()),
            )
            .map((item) => (
            <button
              key={item.key}
              type="button"
              onClick={() => setTab(item.key)}
              className={cn(
                "flex h-8 w-full items-center gap-2 rounded-[6px] px-2 text-left font-medium",
                tab === item.key
                  ? "bg-background text-foreground shadow-sm"
                  : "text-muted-foreground hover:bg-accent",
              )}
            >
              <item.icon className="h-3.5 w-3.5" />
              {item.label}
            </button>
          ))}
        </nav>
      </aside>

      <section className="min-w-0 flex-1">
        <div className="mx-auto w-full max-w-[520px] px-6 py-[92px]">
          {tab === "profile" && (
            <ProfilePanel
              user={user}
              onProfileSave={handleProfileSave}
              onAvatarUploaded={setUser}
              onLeaveWorkspace={handleLeaveWorkspace}
            />
          )}
          {tab === "theme" && <ThemePanel />}
          {tab === "color" && <ColorPanel />}
        </div>
      </section>
    </main>
  );
}
