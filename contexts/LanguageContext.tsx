"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { Language, DEFAULT_LANGUAGE } from "@/lib/localization";

interface LanguageContextType {
  language: Language;
  setLanguage: (language: Language) => void;
}

const LanguageContext = createContext<LanguageContextType | undefined>(
  undefined,
);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<Language>(DEFAULT_LANGUAGE);

  // Load language from localStorage on mount (client-side only)
  useEffect(() => {
    if (typeof window !== "undefined") {
      const savedLanguage = localStorage.getItem("app-language") as Language;
      if (savedLanguage && (savedLanguage === "en" || savedLanguage === "am")) {
        setLanguageState(savedLanguage);
      }
    }
  }, []);

  // Save language to localStorage and server when it changes
  const setLanguage = async (newLanguage: Language) => {
    setLanguageState(newLanguage);
    if (typeof window !== "undefined") {
      localStorage.setItem("app-language", newLanguage);
    }

    // Also save to global settings for notifications
    try {
      await fetch("/api/settings/language", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ language: newLanguage }),
      });
    } catch (error) {
      console.error("Failed to save language to server:", error);
    }
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return context;
}
