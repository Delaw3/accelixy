"use client";

import Image from "next/image";
import { X } from "lucide-react";
import { useEffect, useState } from "react";

type CertificateModalTriggerProps = {
  className: string;
  imageSrc: string;
  imageAlt: string;
};

export function CertificateModalTrigger({
  className,
  imageSrc,
  imageAlt,
}: CertificateModalTriggerProps) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open) {
      return;
    }

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false);
      }
    };

    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [open]);

  return (
    <>
      <button type="button" className={className} onClick={() => setOpen(true)}>
        Certificate
      </button>

      {open ? (
        <div
          className="fixed inset-0 z-[80] flex items-center justify-center bg-background/80 px-4 py-6 backdrop-blur-sm"
          onClick={() => setOpen(false)}
        >
          <div
            className="relative w-full max-w-3xl overflow-hidden rounded-xl border border-border bg-card p-2 shadow-xl"
            onClick={(event) => event.stopPropagation()}
          >
            <button
              type="button"
              aria-label="Close certificate"
              className="absolute right-3 top-3 z-10 inline-flex h-8 w-8 items-center justify-center rounded-full border border-border bg-background text-foreground transition hover:border-primary hover:text-primary"
              onClick={() => setOpen(false)}
            >
              <X className="h-4 w-4" />
            </button>

            <div className="max-h-[85vh] overflow-auto rounded-lg">
              <Image
                src={imageSrc}
                alt={imageAlt}
                width={1400}
                height={1000}
                unoptimized
                className="h-auto w-full rounded-lg object-contain"
              />
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
