"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Moon, Sun } from "lucide-react";
import { GoogleIcon } from "@/components/icons";
import { useTheme } from "@/components/theme-provider";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001";

export default function LoginPage() {
  const router = useRouter();
  const { theme, toggleTheme } = useTheme();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleGuestLogin() {
    setError(null);
    setIsSubmitting(true);
    try {
      const res = await fetch(`${API_URL}/auth/guest`, {
        method: "POST",
        credentials: "include",
      });
      if (!res.ok) throw new Error("Guest login failed");
      router.push("/tasks");
    } catch {
      setError("Couldn't reach the server. Is the backend running?");
      setIsSubmitting(false);
    }
  }

  function handleGoogleLogin() {
    window.location.href = `${API_URL}/auth/google`;
  }

  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center bg-background px-4 py-12">
      {/* Dark mode switch */}
      <button
        type="button"
        onClick={toggleTheme}
        aria-label={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
        className="fixed right-6 top-6 flex h-8 w-14 cursor-pointer items-center rounded-full border border-border bg-muted px-1 transition-colors"
      >
        <span
          className={`flex h-6 w-6 items-center justify-center rounded-full bg-background text-foreground shadow-sm transition-transform ${
            theme === "dark" ? "translate-x-6" : "translate-x-0"
          }`}
        >
          {theme === "dark" ? (
            <Moon className="h-3.5 w-3.5" />
          ) : (
            <Sun className="h-3.5 w-3.5" />
          )}
        </span>
      </button>

      {/* Logo */}
      <div className="mb-6 flex items-center gap-1.5">
        <span className="inline-block h-8 w-8 overflow-hidden rounded-[22%]">
          <Image
            src={theme === "dark" ? "/pyramid-logo-dark.png" : "/pyramid-logo-light.png"}
            alt="Pyramid"
            width={48}
            height={48}
            className="h-full w-full object-cover"
          />
        </span>
        <span className="text-lg font-semibold leading-none text-foreground">
          Pyramid
        </span>
      </div>

      {/* Auth card */}
      <div className="w-96 rounded-[26px] border border-border bg-card p-6 text-center shadow-[0_1px_2px_0_rgba(0,0,0,0.05)]">
        <div className="flex flex-col gap-1.5">
          <h1 className="text-xl font-semibold leading-none tracking-normal text-foreground">
            Let&apos;s get back on track
          </h1>
          <p className="text-sm font-normal text-muted-foreground">
            Enter your email below to login to your account.
          </p>
        </div>

        <div className="mt-6 flex flex-col gap-3">
          <button
            type="button"
            onClick={handleGuestLogin}
            disabled={isSubmitting}
            className="flex h-9 w-full items-center justify-center rounded-full bg-primary px-3 py-2 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-60"
          >
            {isSubmitting ? "Signing in…" : "Continue as Guest"}
          </button>

          <button
            type="button"
            onClick={handleGoogleLogin}
            className="flex h-9 w-full items-center justify-center gap-1.5 rounded-full border border-border bg-background px-3 py-2 text-sm font-medium text-foreground transition-colors hover:bg-accent"
          >
            <GoogleIcon className="h-4 w-4" />
            Login with Google
          </button>

          {error && <p className="text-xs text-red-500">{error}</p>}
        </div>
      </div>

      {/* Legal */}
      <p className="mt-6 max-w-[220px] text-center text-xs font-normal text-muted-foreground">
        By clicking continue, you agree to our{" "}
        <Link href="/terms" className="underline underline-offset-2">
          Terms of Service
        </Link>{" "}
        and{" "}
        <Link href="/privacy" className="underline underline-offset-2">
          Privacy Policy
        </Link>
      </p>
    </div>
  );
}
