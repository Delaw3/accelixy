"use client";

import { Languages } from "lucide-react";
import { useEffect, useId, useRef } from "react";

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

export function SiteTranslator() {
  const initializedRef = useRef(false);
  const rawId = useId();
  const containerId = `google_translate_${rawId.replace(/[:]/g, "")}`;

  useEffect(() => {
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
        window.clearInterval(poll);
        existingScript.removeEventListener("load", initTranslator);
      };
    }

    const script = document.createElement("script");
    script.id = SCRIPT_ID;
    script.src = SCRIPT_SRC;
    script.async = true;
    script.addEventListener("load", initTranslator);
    document.body.appendChild(script);

    return () => {
      script.removeEventListener("load", initTranslator);
    };
  }, [containerId]);

  return (
    <div className="translator-shell inline-flex h-7 items-center gap-1 rounded-md border border-border bg-card px-1.5 transition hover:border-primary">
      <Languages className="h-3 w-3 shrink-0 text-primary" />
      <div className="min-w-23">
        <div id={containerId} />
      </div>
    </div>
  );
}
