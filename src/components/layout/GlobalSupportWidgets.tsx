"use client";

import Script from "next/script";
import { usePathname } from "next/navigation";

export function GlobalSupportWidgets() {
  const pathname = usePathname();
  const isAdminRoute = pathname?.startsWith("/admin");

  if (isAdminRoute) {
    return null;
  }

  return (
    <>
      <a
        href="https://wa.me/447478036237"
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Chat with us on WhatsApp"
        className="fixed bottom-5 left-5 z-[60] inline-flex h-14 w-14 items-center justify-center rounded-full border border-border bg-gradient-to-br from-primaryGradientStart to-primaryGradientEnd text-white shadow-[0_10px_30px_hsla(var(--primary),0.45)] transition-transform motion-safe:animate-[whatsappBreath_2.4s_ease-in-out_infinite] hover:scale-105 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 sm:bottom-6 sm:left-6"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 32 32"
          fill="currentColor"
          className="h-7 w-7"
          aria-hidden="true"
        >
          <path d="M19.11 17.2c-.27-.13-1.59-.78-1.84-.87-.25-.09-.43-.13-.61.13-.18.27-.7.87-.86 1.05-.16.18-.31.2-.58.07-.27-.13-1.13-.42-2.15-1.34-.8-.71-1.34-1.58-1.5-1.85-.16-.27-.02-.41.12-.54.12-.12.27-.31.4-.47.13-.16.18-.27.27-.45.09-.18.04-.34-.02-.47-.07-.13-.61-1.47-.84-2.02-.22-.53-.45-.45-.61-.46-.16-.01-.34-.01-.52-.01-.18 0-.47.07-.72.34-.25.27-.95.92-.95 2.24 0 1.31.97 2.58 1.1 2.76.13.18 1.9 2.89 4.59 4.04.64.28 1.14.44 1.53.56.64.2 1.22.17 1.68.1.51-.08 1.59-.65 1.81-1.28.22-.63.22-1.17.16-1.28-.07-.11-.25-.18-.52-.31z" />
          <path d="M16.01 3.2c-7.06 0-12.79 5.73-12.79 12.79 0 2.25.59 4.44 1.7 6.37L3.2 28.8l6.62-1.7c1.85 1 3.93 1.52 6.19 1.52h.01c7.05 0 12.78-5.73 12.78-12.79 0-3.42-1.33-6.63-3.75-9.05a12.7 12.7 0 0 0-9.04-3.58zm0 23.27h-.01a10.4 10.4 0 0 1-5.31-1.45l-.38-.23-3.93 1.01 1.05-3.83-.25-.39a10.51 10.51 0 0 1-1.62-5.59c0-5.8 4.72-10.52 10.53-10.52 2.81 0 5.45 1.09 7.43 3.08a10.45 10.45 0 0 1 3.09 7.44c0 5.81-4.72 10.53-10.52 10.53z" />
        </svg>
      </a>
      <Script id="smartsupp-chat" strategy="afterInteractive">
        {`
          var _smartsupp = _smartsupp || {};
          _smartsupp.key = 'eba8e936474e150d8ed100fb53dcf739ab12ea94';
          window.smartsupp || (function(d) {
            var s, c, o = smartsupp = function() { o._.push(arguments) };
            o._ = [];
            s = d.getElementsByTagName('script')[0];
            c = d.createElement('script');
            c.type = 'text/javascript';
            c.charset = 'utf-8';
            c.async = true;
            c.src = 'https://www.smartsuppchat.com/loader.js?';
            s.parentNode.insertBefore(c, s);
          })(document);
        `}
      </Script>
      <noscript>
        Powered by{" "}
        <a href="https://www.smartsupp.com" target="_blank" rel="noopener noreferrer">
          Smartsupp
        </a>
      </noscript>
    </>
  );
}
