"use client";

import { useState } from "react";

interface TelegramConnectProps {
  ownerId: string; // In production, get this from auth
}

export default function TelegramConnect({ ownerId }: TelegramConnectProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [deepLink, setDeepLink] = useState("");
  const [error, setError] = useState("");
  const [isConnected, setIsConnected] = useState(false);

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
        body: JSON.stringify({ ownerId }),
      });

      const data = await response.json();

      if (data.success) {
        setDeepLink(data.deepLink);
        setIsConnected(true);
      } else {
        setError(data.error || "Failed to generate connection link");
      }
    } catch (err) {
      setError("Failed to connect to Telegram");
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenTelegram = () => {
    if (deepLink) {
      window.open(deepLink, "_blank");
    }
  };

  return (
    <div className="bg-white rounded-lg border border-zinc-200 p-6 shadow-sm">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
          <svg
            className="w-6 h-6 text-blue-600"
            fill="currentColor"
            viewBox="0 0 24 24"
          >
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.64 6.56l-1.68 7.92c-.12.57-.54.71-.97.44l-2.67-2-1.29 1.26c-.14.14-.26.26-.54.26l.19-2.79 4.95-4.48c.22-.19-.05-.3-.34-.11l-6.12 3.85-2.64-.82c-.57-.18-.58-.57.12-.84l10.32-3.97c.48-.17.89.12.74.83z"/>
          </svg>
        </div>
        <div>
          <h3 className="text-lg font-semibold text-zinc-900">
            Connect Telegram
          </h3>
          <p className="text-sm text-zinc-500">
            Receive rent payment notifications
          </p>
        </div>
      </div>

      {!isConnected ? (
        <div>
          <button
            onClick={handleConnectTelegram}
            disabled={isLoading}
            className="w-full bg-blue-600 text-white rounded-md px-4 py-2 text-sm font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? "Generating Link..." : "Connect Telegram Bot"}
          </button>
          
          {error && (
            <p className="mt-2 text-sm text-red-600">{error}</p>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          <div className="bg-green-50 border border-green-200 rounded-md p-3">
            <p className="text-sm text-green-800 font-medium">
              ✅ Connection link generated!
            </p>
          </div>
          
          <button
            onClick={handleOpenTelegram}
            className="w-full bg-blue-600 text-white rounded-md px-4 py-2 text-sm font-medium hover:bg-blue-700"
          >
            Open Telegram & Connect
          </button>
          
          <div className="bg-zinc-50 rounded-md p-3">
            <p className="text-xs text-zinc-600 font-medium mb-2">
              Instructions:
            </p>
            <ol className="text-xs text-zinc-600 space-y-1 list-decimal list-inside">
              <li>Click the button above to open Telegram</li>
              <li>Click "Start" or send /start to the bot</li>
              <li>You'll receive a confirmation message</li>
              <li>Done! You'll now get notifications</li>
            </ol>
          </div>
        </div>
      )}
    </div>
  );
}
