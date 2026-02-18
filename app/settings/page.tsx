"use client";

import { useState, useEffect } from "react";
import TelegramSettings from "@/components/TelegramSettings";
import { useLanguage } from "@/contexts/LanguageContext";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

const translations = {
  en: {
    title: "Settings",
    subtitle: "Manage your account preferences and integrations",
    backToHome: "Back to Home",
    account: "Account",
    logout: "Log out",
    loggingOut: "Logging out...",
    logoutFailed: "Logout failed. Please try again.",
    moreSettings: "More Settings",
    moreSettingsText: "Additional settings will be added here in the future.",
  },
  am: {
    title: "ቅንብሮች",
    subtitle: "የመለያ ምርጫዎችዎን እና እንደተማማኙ ያስተዳድሩ",
    backToHome: "ወደ ቤት ይመለሱ",
    account: "መለያ",
    logout: "ይውጡ",
    loggingOut: "በመውጣት ላይ...",
    logoutFailed: "መውጣት አልተሳካም። እባክዎ በድጋሜ ይሞክሩ።",
    moreSettings: "ተጨማማሪ ቅንብሮች",
    moreSettingsText: "በወደፊት ተጨማማሪ ቅንብሮች ይታከላሉ።",
  },
};

export default function SettingsPage() {
  const { language } = useLanguage();
  const t = translations[language];
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [telegramStatus, setTelegramStatus] = useState<{
    connected: boolean;
    telegramUserId?: string;
    language?: string;
  } | null>(null);

  useEffect(() => {
    fetch("/api/telegram/status")
      .then((res) => res.json())
      .then((data) => setTelegramStatus(data))
      .catch(() => setTelegramStatus({ connected: false }));
  }, []);

  async function handleLogout(e: React.FormEvent) {
    e.preventDefault();
    setIsLoggingOut(true);
    try {
      const res = await fetch("/api/auth/logout", { method: "POST" });
      if (res.ok) {
        window.location.href = "/auth/login";
      } else {
        alert(t.logoutFailed);
      }
    } catch (err) {
      alert(t.logoutFailed);
    } finally {
      setIsLoggingOut(false);
    }
  }

  return (
    <div className="min-h-screen grid-bg-pattern text-zinc-950">
      <div className="mx-auto w-full max-w-4xl px-4 py-6">
        {/* Back to Home Button */}
        <div className="mb-4">
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-2 text-sm text-zinc-600 hover:text-zinc-900 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            {t.backToHome}
          </Link>
        </div>

        <div className="mb-6">
          <h1 className="text-2xl font-semibold text-zinc-900">{t.title}</h1>
          <p className="text-sm text-zinc-600">{t.subtitle}</p>
        </div>

        <div className="space-y-6">
          {/* Telegram status and test */}
          <div className="bg-white rounded-lg border border-zinc-200 p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-zinc-900 mb-4">
              Telegram Bot
            </h2>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div
                  className={`w-3 h-3 rounded-full ${
                    telegramStatus?.connected ? "bg-green-500" : "bg-red-500"
                  }`}
                />
                <span className="text-sm text-zinc-700">
                  {telegramStatus?.connected
                    ? `Connected (User ${telegramStatus.telegramUserId})`
                    : "Not connected"}
                </span>
              </div>
              {telegramStatus?.connected && (
                <button
                  onClick={async () => {
                    try {
                      const res = await fetch("/api/telegram/test", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({
                          message: "Test notification from SalTenant 🏠",
                        }),
                      });
                      const data = await res.json();
                      if (data.success) {
                        alert("Test message sent!");
                      } else {
                        alert("Failed to send: " + (data.error ?? "Unknown"));
                      }
                    } catch {
                      alert("Failed to send test message");
                    }
                  }}
                  className="px-3 py-1 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700"
                >
                  Test Notification
                </button>
              )}
            </div>
          </div>

          <TelegramSettings />

          {/* Account section with logout */}
          <div className="bg-white rounded-lg border border-zinc-200 p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-zinc-900 mb-4">
              {t.account}
            </h2>
            <form onSubmit={handleLogout}>
              <button
                type="submit"
                disabled={isLoggingOut}
                className="w-full sm:w-auto px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoggingOut ? t.loggingOut : t.logout}
              </button>
            </form>
          </div>

          {/* Add more settings sections here in the future */}
          <div className="bg-white rounded-lg border border-zinc-200 p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-zinc-900 mb-4">
              {t.moreSettings}
            </h2>
            <p className="text-sm text-zinc-500">{t.moreSettingsText}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
