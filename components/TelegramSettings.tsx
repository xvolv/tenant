"use client";

import { useState, useEffect } from "react";
import {
  MessageCircle,
  AlertCircle,
  RefreshCw,
  Link,
  Bell,
  CheckCircle,
} from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

const translations = {
  en: {
    title: "Telegram Settings",
    subtitle: "Manage your notification preferences",
    checkingStatus: "Checking connection status...",
    connected: "Connected to Telegram",
    languageSettings: "Language Settings",
    languageInstructions:
      "Your notification language is controlled by the language selector in the main dashboard (flag icon). Change it there to update your Telegram notification language.",
    youllReceive: "You'll receive:",
    rentDueReminders: "Rent due reminders",
    latePaymentAlerts: "Late payment alerts",
    paymentConfirmations: "Payment confirmations",
    disconnect: "Disconnect",
    reconnect: "Reconnect to Different Account",
    disconnecting: "Disconnecting...",
    connectTelegram: "Connect Telegram Bot",
    generatingLink: "Generating Link...",
    connectionLinkGenerated: "Connection link generated!",
    openTelegram: "Open Telegram & Connect",
    instructions: "Instructions:",
    instruction1: "Click the button above to open Telegram",
    instruction2: "Click 'Start' or send /start to the bot",
    instruction3: "Choose your language preference",
    instruction4: "You're all set! You'll receive notifications",
    connectToTelegram:
      "Connect to Telegram to receive rent payment notifications directly on your phone.",
  },
  am: {
    title: "ቴሌግራም ቅንብሮች",
    subtitle: "የማስታወቂያ ምርጫዎችዎን ያስተዳድሩ",
    checkingStatus: "የግንኙነት ሁኔታን በመፈለግ ላይ...",
    connected: "ከቴሌግራም ጋር ተገናኝቷል",
    languageSettings: "የቋንቋ ቅንብሮች",
    languageInstructions:
      "የማስታወቂያ ቋንቋዎ በዋናቡ ዳሽቦርድ ውስጥ ያለው የቋንቋ ምርጫው (ባንዲ ምልክት) ይተባባራል። የቴሌግራም ማስታወቂያ ቋንቋዎን ለመቀየር ዛው ይለውጡ።",
    youllReceive: "ይደረስዎታል:",
    rentDueReminders: "የቤት ክፍያ ማስታወቂያዎች",
    latePaymentAlerts: "የዘገተ ክፍያ ማስታወቂያዎች",
    paymentConfirmations: "የክፍያ ማረጋገጫዎች",
    disconnect: "አቋርጥ",
    reconnect: "ወደ ሌላ መለያ ተገናኝ",
    disconnecting: "በማቋረጥ ላይ...",
    connectTelegram: "ቴሌግራም ቦትን ይገናኙ",
    generatingLink: "አገናኛ በመፍጠር ላይ...",
    connectionLinkGenerated: "የግንኙነት አገናኛ ተፈጠረ!",
    openTelegram: "ቴሌግራምን ክፈት & ይገናኙ",
    instructions: "መመሪያዎች:",
    instruction1: "ቴሌግራምን ለመክፈት ከላይ ያለውን ቁልፍ ይጫኑ",
    instruction2: "በቦቱ 'Start' ይጫኑ ወይም /start ይላኩ",
    instruction3: "የቋንቋ ምርጫዎን ይምረጡ",
    instruction4: "ተዘጋጅተዋል! ማስታወቂያዎችን ይደረስዎታል",
    connectToTelegram: "የቤት ክፍያ ማስታወቂያዎችን በቀጥታ በስልክዎ ላይ ለማግኘት ከቴሌግራም ጋር ይገናኙ።",
  },
};

export default function TelegramSettings() {
  const { language } = useLanguage();
  const [isLoading, setIsLoading] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<
    "loading" | "connected" | "disconnected"
  >("loading");
  const [userInfo, setUserInfo] = useState<{
    firstName: string;
    language: string;
  } | null>(null);
  const [deepLink, setDeepLink] = useState("");
  const [error, setError] = useState("");

  const t = translations[language];

  useEffect(() => {
    checkConnectionStatus();
  }, []);

  const checkConnectionStatus = async () => {
    try {
      setIsLoading(true);
      const response = await fetch("/api/telegram/status");
      const data = await response.json();

      if (data.connected) {
        setConnectionStatus("connected");
        setUserInfo({
          firstName: data.firstName,
          language: data.language,
        });
      } else {
        setConnectionStatus("disconnected");
      }
    } catch (err) {
      console.error("Failed to check connection status:", err);
      setConnectionStatus("disconnected");
    } finally {
      setIsLoading(false);
    }
  };

  const handleConnectTelegram = async () => {
    setIsLoading(true);
    setError("");
    setDeepLink("");

    try {
      const response = await fetch("/api/telegram/connect", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({}),
      });

      const data = await response.json();

      if (data.success) {
        setDeepLink(data.deepLink);
      } else {
        setError(data.error || "Failed to generate connection link");
      }
    } catch (err) {
      setError("Failed to connect to Telegram");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDisconnectTelegram = async () => {
    if (
      !confirm(
        "Are you sure you want to disconnect from Telegram? You'll stop receiving rent notifications.",
      )
    ) {
      return;
    }

    try {
      setIsLoading(true);
      const response = await fetch("/api/telegram/disconnect", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({}),
      });

      const data = await response.json();

      if (data.success) {
        setConnectionStatus("disconnected");
        setUserInfo(null);
      } else {
        setError(data.error || "Failed to disconnect");
      }
    } catch (err) {
      setError("Failed to disconnect from Telegram");
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenTelegram = () => {
    if (deepLink) {
      window.open(deepLink, "_blank");
      // Start polling for connection status every 3 seconds for up to 60 seconds
      let attempts = 0;
      const maxAttempts = 20;
      const interval = setInterval(async () => {
        attempts++;
        try {
          const res = await fetch("/api/telegram/status");
          const data = await res.json();
          if (data.connected) {
            setConnectionStatus("connected");
            setDeepLink("");
            clearInterval(interval);
          } else if (attempts >= maxAttempts) {
            clearInterval(interval);
          }
        } catch {
          // ignore
        }
      }, 3000);
    }
  };

  const handleRefreshStatus = () => {
    checkConnectionStatus();
  };

  if (connectionStatus === "loading") {
    return (
      <div className="bg-white rounded-lg border border-zinc-200 p-6 shadow-sm">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
            <RefreshCw className="w-6 h-6 text-blue-600 animate-spin" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-zinc-900">{t.title}</h3>
            <p className="text-sm text-zinc-500">{t.checkingStatus}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg border border-zinc-200 p-6 shadow-sm">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
            <MessageCircle className="w-6 h-6 text-blue-600" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-zinc-900">{t.title}</h3>
            <p className="text-sm text-zinc-500">{t.subtitle}</p>
          </div>
        </div>
        <button
          onClick={handleRefreshStatus}
          disabled={isLoading}
          className="text-zinc-400 hover:text-zinc-600 disabled:opacity-50"
          title="Refresh status"
        >
          <RefreshCw className="w-5 h-5" />
        </button>
      </div>

      {connectionStatus === "connected" && userInfo ? (
        <div className="space-y-6">
          <div className="bg-green-50 border border-green-200 rounded-md p-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                <CheckCircle className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-green-800">
                  {t.connected}
                </p>
                <p className="text-sm text-green-600">
                  {userInfo.firstName} • Language:{" "}
                  {userInfo.language === "en" ? "English" : "አማርኛ"}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-blue-600" />
              <p className="text-sm text-blue-800 font-medium">
                {t.languageSettings}
              </p>
            </div>
            <p className="text-sm text-blue-600 mt-2">
              {t.languageInstructions}
            </p>
          </div>

          <div className="space-y-3">
            <div className="text-sm text-zinc-600">
              <p className="font-medium mb-2">{t.youllReceive}</p>
              <ul className="space-y-1 text-zinc-500">
                <li className="flex items-center gap-2">
                  <Bell className="w-4 h-4" />
                  {t.rentDueReminders}
                </li>
                <li className="flex items-center gap-2">
                  <AlertCircle className="w-4 h-4" />
                  {t.latePaymentAlerts}
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4" />
                  {t.paymentConfirmations}
                </li>
              </ul>
            </div>

            <div className="flex gap-2">
              <button
                onClick={handleDisconnectTelegram}
                disabled={isLoading}
                className="bg-red-600 text-white rounded-md px-4 py-2 text-sm font-medium hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? t.disconnecting : t.disconnect}
              </button>

              <button
                onClick={handleConnectTelegram}
                disabled={isLoading}
                className="bg-zinc-600 text-white rounded-md px-4 py-2 text-sm font-medium hover:bg-zinc-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {t.reconnect}
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {!deepLink ? (
            <div>
              <p className="text-sm text-zinc-600 mb-4">
                {t.connectToTelegram}
              </p>
              <button
                onClick={handleConnectTelegram}
                disabled={isLoading}
                className="w-full bg-blue-600 text-white rounded-md px-4 py-2 text-sm font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? t.generatingLink : t.connectTelegram}
              </button>
              {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
            </div>
          ) : (
            <div className="space-y-3">
              <div className="bg-blue-50 border border-blue-200 rounded-md p-3">
                <div className="flex items-center gap-2">
                  <Link className="w-4 h-4 text-blue-600" />
                  <p className="text-sm text-blue-800 font-medium">
                    {t.connectionLinkGenerated}
                  </p>
                </div>
              </div>

              <button
                onClick={handleOpenTelegram}
                className="w-full bg-blue-600 text-white rounded-md px-4 py-2 text-sm font-medium hover:bg-blue-700"
              >
                {t.openTelegram}
              </button>

              <div className="bg-zinc-50 rounded-md p-3">
                <p className="text-xs text-zinc-600 font-medium mb-2">
                  {t.instructions}
                </p>
                <ol className="text-xs text-zinc-600 space-y-1 list-decimal list-inside">
                  <li>{t.instruction1}</li>
                  <li>{t.instruction2}</li>
                  <li>{t.instruction3}</li>
                  <li>{t.instruction4}</li>
                </ol>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
