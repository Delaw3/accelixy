"use client";

import { Languages } from "lucide-react";
import { type ChangeEvent, useEffect, useId, useRef, useState } from "react";

declare global {
  interface Window {
    google?: {
      translate?: {
        TranslateElement?: new (
          options: { pageLanguage: string; autoDisplay?: boolean },
          elementId: string
        ) => unknown;
      };
    };
  }
}

const SCRIPT_ID = "google-translate-script";
const SCRIPT_SRC = "https://translate.google.com/translate_a/element.js";
const FALLBACK_LANGUAGES = [
  { value: "es", label: "Spanish" },
  { value: "fr", label: "French" },
  { value: "de", label: "German" },
  { value: "pt", label: "Portuguese" },
  { value: "ar", label: "Arabic" },
  { value: "zh-CN", label: "Chinese" },
] as const;

export function SiteTranslator() {
  const initializedRef = useRef(false);
  const rawId = useId();
  const containerId = `google_translate_${rawId.replace(/[:]/g, "")}`;
  const [showFallback, setShowFallback] = useState(false);

  const activateFallback = () => {
    if (!initializedRef.current) {
      setShowFallback(true);
    }
  };

  useEffect(() => {
    const fallbackTimer = window.setTimeout(activateFallback, 2200);
    const handleScriptError = () => setShowFallback(true);

    const initTranslator = () => {
      if (!window.google?.translate?.TranslateElement || initializedRef.current) {
        return;
      }

      const container = document.getElementById(containerId);
      if (!container || container.childElementCount > 0) {
        initializedRef.current = true;
        return;
      }

      initializedRef.current = true;
      new window.google.translate.TranslateElement(
        { pageLanguage: "en", autoDisplay: false },
        containerId
      );

      window.setTimeout(() => {
        const combo = document.querySelector(`#${containerId} select.goog-te-combo`);
        if (!combo) {
          setShowFallback(true);
        }
      }, 700);
    };

    const existingScript = document.getElementById(SCRIPT_ID) as HTMLScriptElement | null;
    if (existingScript) {
      if (window.google?.translate?.TranslateElement) {
        initTranslator();
        return;
      }

      existingScript.addEventListener("load", initTranslator);
      const poll = window.setInterval(() => {
        if (window.google?.translate?.TranslateElement) {
          initTranslator();
          window.clearInterval(poll);
        }
      }, 200);

      return () => {
        window.clearTimeout(fallbackTimer);
        window.clearInterval(poll);
        existingScript.removeEventListener("load", initTranslator);
      };
    }

    const script = document.createElement("script");
    script.id = SCRIPT_ID;
    script.src = SCRIPT_SRC;
    script.async = true;
    script.addEventListener("load", initTranslator);
    script.addEventListener("error", handleScriptError);
    document.body.appendChild(script);

    return () => {
      window.clearTimeout(fallbackTimer);
      script.removeEventListener("load", initTranslator);
      script.removeEventListener("error", handleScriptError);
    };
  }, [containerId]);

  const handleFallbackSelect = (event: ChangeEvent<HTMLSelectElement>) => {
    const language = event.target.value;
    if (!language) {
      return;
    }

    const googleSelect = document.querySelector(
      `#${containerId} select.goog-te-combo`
    ) as HTMLSelectElement | null;

    if (googleSelect) {
      googleSelect.value = language;
      googleSelect.dispatchEvent(new Event("change"));
      return;
    }

    // Fallback for cases where Google widget markup is delayed:
    // set translation preference cookie and reload same page.
    const cookieValue = `/en/${language}`;
    document.cookie = `googtrans=${cookieValue}; path=/`;
    document.cookie = `googtrans=${cookieValue}; path=/; domain=${window.location.hostname}`;
    window.location.reload();
  };

  return (
    <div className="translator-shell inline-flex h-7 items-center gap-1 rounded-md border border-border bg-card px-1.5 transition hover:border-primary">
      <Languages className="h-3 w-3 shrink-0 text-primary" />
      <div className="min-w-23">
        {showFallback ? (
          <select
            aria-label="Select language"
            className="goog-te-combo"
            defaultValue=""
            onChange={handleFallbackSelect}
          >
            <option value="">Select language</option>
            {FALLBACK_LANGUAGES.map((item) => (
              <option key={item.value} value={item.value}>
                {item.label}
              </option>
            ))}
          </select>
        ) : (
          <div id={containerId} />
        )}
      </div>
    </div>
  );
}
