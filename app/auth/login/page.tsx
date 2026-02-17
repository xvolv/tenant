"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";

type FormState = {
  email: string;
  password: string;
  rememberMe: boolean;
};

export default function LoginPage() {
  const router = useRouter();

  const [form, setForm] = useState<FormState>({
    email: "",
    password: "",
    rememberMe: true,
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);

  const canSubmit = useMemo(() => {
    if (!form.email.trim()) return false;
    if (!form.password) return false;
    return true;
  }, [form]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (!canSubmit) {
      setError("Please enter your email and password.");
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: form.email.trim(),
          password: form.password,
          rememberMe: form.rememberMe,
        }),
      });

      if (!res.ok) {
        const data = (await res.json().catch(() => null)) as {
          message?: string;
        } | null;
        throw new Error(data?.message || "Login failed.");
      }

      setSuccess("Welcome back. Redirecting...");
      setTimeout(() => router.push("/dashboard"), 500);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="relative min-h-screen bg-zinc-950">
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: "url(/login-bg.png)" }}
      />
      <div className="absolute inset-0 bg-gradient-to-b from-black/55 via-black/55 to-black/70" />

      <div className="relative mx-auto flex min-h-screen w-full max-w-md flex-col px-4 py-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-white/10 text-white ring-1 ring-white/15 backdrop-blur">
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M4 7.5L12 3l8 4.5V16.5L12 21l-8-4.5V7.5Z"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
            <div>
              <div className="text-sm font-semibold text-white">
                Tenant Management
              </div>
              <div className="text-xs text-white/70">Sign in</div>
            </div>
          </div>
        </div>

        <div className="mt-10">
          <h1 className="text-2xl font-semibold tracking-tight text-white">
            Welcome back
          </h1>
          <p className="mt-2 text-sm leading-6 text-white/75">
            Log in to continue to your rent matrix.
          </p>
        </div>

        <div className="mt-6 rounded-2xl border border-white/15 bg-white/10 p-4 shadow-sm backdrop-blur-md">
          <form onSubmit={onSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-white/80">
                Email
              </label>
              <input
                value={form.email}
                onChange={(e) =>
                  setForm((s) => ({ ...s, email: e.target.value }))
                }
                className="mt-1 w-full rounded-xl border border-white/15 bg-white/10 px-3 py-3 text-sm text-white placeholder:text-white/55 focus:border-blue-400 focus:ring-2 focus:ring-blue-400"
                placeholder="you@example.com"
                autoComplete="email"
                inputMode="email"
                type="email"
                required
              />
            </div>

            <div>
              <div className="flex items-center justify-between">
                <label className="block text-xs font-semibold text-white/80">
                  Password
                </label>
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="text-xs font-semibold text-white/80 hover:text-white"
                >
                  {showPassword ? "Hide" : "Show"}
                </button>
              </div>
              <input
                value={form.password}
                onChange={(e) =>
                  setForm((s) => ({ ...s, password: e.target.value }))
                }
                className="mt-1 w-full rounded-xl border border-white/15 bg-white/10 px-3 py-3 text-sm text-white placeholder:text-white/55 focus:border-blue-400 focus:ring-2 focus:ring-blue-400"
                placeholder="Your password"
                autoComplete="current-password"
                type={showPassword ? "text" : "password"}
                required
              />
            </div>

            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 text-xs text-white/75">
                <input
                  type="checkbox"
                  checked={form.rememberMe}
                  onChange={(e) =>
                    setForm((s) => ({ ...s, rememberMe: e.target.checked }))
                  }
                  className="h-4 w-4"
                />
                Remember me
              </label>

              <button
                type="button"
                className="text-xs font-semibold text-white/80 hover:text-white"
                onClick={() =>
                  setError("Password reset is not implemented yet.")
                }
              >
                Forgot?
              </button>
            </div>

            {error && (
              <div className="rounded-xl border border-red-300/30 bg-red-500/10 px-3 py-2 text-sm text-red-100">
                {error}
              </div>
            )}
            {success && (
              <div className="rounded-xl border border-emerald-300/30 bg-emerald-500/10 px-3 py-2 text-sm text-emerald-50">
                {success}
              </div>
            )}

            <button
              type="submit"
              disabled={!canSubmit || submitting}
              className="w-full rounded-xl bg-blue-500 px-3 py-3 text-sm font-semibold text-white shadow-sm hover:bg-blue-600 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {submitting ? "Signing in..." : "Log in"}
            </button>

            <div className="text-center text-sm text-white/75">
              New here?{" "}
              <Link
                href="/auth/signup"
                className="font-semibold text-white hover:text-white/90"
              >
                Create account
              </Link>
            </div>
          </form>
        </div>

        <div className="mt-auto pt-8 text-center text-xs text-white/65">
          Your data is kept separate per owner.
        </div>
      </div>
    </div>
  );
}
