"use client";

import RentMatrixMock from "@/components/RentMatrixMock";
import { toEthiopian } from "ethiopian-calendar-new";
import { useLanguage } from "@/contexts/LanguageContext";
import { LANGUAGE_INFO } from "@/lib/localization";
import { useState, useRef, useEffect } from "react";

export default function DashboardPage() {
  const { language, setLanguage } = useLanguage();
  const [showLanguageDropdown, setShowLanguageDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setShowLanguageDropdown(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Calculate Ethiopian current year + 2
  const now = new Date();
  const ethiopianCurrentYear = toEthiopian(
    now.getFullYear(),
    now.getMonth() + 1,
    now.getDate(),
  ).year;
  const endYear = ethiopianCurrentYear + 2;

  return (
    <div className="min-h-screen bg-zinc-50 text-zinc-950">
      <div className="mx-auto w-full max-w-6xl px-4 py-6">
        <section className="mt-6">
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
            <div className="min-w-0">
              <div className="text-xl font-semibold leading-7 text-zinc-900">
                Rent Matrix
              </div>
              <div className="text-sm text-zinc-600 hidden sm:block">
                Showing: 2016–{endYear}
              </div>
            </div>

            <div className="flex items-center justify-end sm:justify-normal gap-2 rounded-lg border border-zinc-200 bg-white p-1 shadow-sm flex-shrink-0">
              {/* Language Selector */}

              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={() => setShowLanguageDropdown(!showLanguageDropdown)}
                  className="h-9 rounded-md px-3 text-sm font-semibold text-zinc-700 hover:bg-zinc-100 flex items-center gap-2 min-w-0"
                >
                  <span>{LANGUAGE_INFO[language].flag}</span>
                  <span className="hidden sm:inline">
                    {LANGUAGE_INFO[language].name}
                  </span>
                  <svg
                    className="w-3 h-3 flex-shrink-0"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </button>

                {showLanguageDropdown && (
                  <div className="absolute right-0 mt-1 w-40 bg-white border border-zinc-200 rounded-md shadow-lg z-50">
                    {Object.entries(LANGUAGE_INFO).map(([langCode, info]) => (
                      <button
                        key={langCode}
                        onClick={() => {
                          setLanguage(langCode as "en" | "am");
                          setShowLanguageDropdown(false);
                        }}
                        className={`w-full flex items-center gap-2 px-3 py-2 text-sm hover:bg-zinc-50 ${
                          language === langCode
                            ? "bg-zinc-100 text-zinc-900"
                            : "text-zinc-700"
                        }`}
                      >
                        <span>{info.flag}</span>
                        <span>{info.name}</span>
                        {language === langCode && (
                          <svg
                            className="w-4 h-4 ml-auto text-blue-600"
                            fill="currentColor"
                            viewBox="0 0 20 20"
                          >
                            <path
                              fillRule="evenodd"
                              d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                              clipRule="evenodd"
                            />
                          </svg>
                        )}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <a
                href="/settings"
                className="h-9 rounded-md px-3 text-sm font-semibold text-zinc-700 hover:bg-zinc-100 flex items-center gap-2 min-w-0"
              >
                <svg
                  className="w-4 h-4 flex-shrink-0"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                </svg>
                <span className="hidden sm:inline">Settings</span>
              </a>
            </div>
          </div>

          <div className="mt-6">
            <RentMatrixMock startYear={2016} yearsCount={6} />
          </div>
        </section>
      </div>
    </div>
  );
}
