"use client";

import Image from "next/image";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useEffect, useState } from "react";
import { buttonStyles } from "@/components/ui/button";

const slides = [
  {
    image:
      "https://lagpvwdlpjmuuxzukczh.supabase.co/storage/v1/render/image/public/Accelixy-Bucket/Hero%20section/1.png?width=1600&quality=55",
    title: "Secure Crypto Investing Built on Trust",
    description:
      "Protect your capital with disciplined strategies, transparent analytics, and a security-first investment platform.",
  },
  {
    image:
      "https://lagpvwdlpjmuuxzukczh.supabase.co/storage/v1/render/image/public/Accelixy-Bucket/Hero%20section/2.png?width=1600&quality=55",
    title: "Fast Deposits, Fast Withdrawals, Global Access",
    description:
      "Move in and out of positions quickly with responsive account operations designed for investors worldwide.",
  },
  {
    image:
      "https://lagpvwdlpjmuuxzukczh.supabase.co/storage/v1/render/image/public/Accelixy-Bucket/Hero%20section/3.png?width=1600&quality=55",
    title: "Plans That Scale with Your Growth",
    description:
      "Start with the right plan, track performance in real time, and grow with support tailored to your goals.",
  },
];

const AUTO_ADVANCE_MS = 9000;

export function HeroCarousel() {
  const [index, setIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [failedSlides, setFailedSlides] = useState<Record<number, boolean>>({});
  const [loadedSlides, setLoadedSlides] = useState<Record<number, boolean>>({});

  useEffect(() => {
    if (isPaused) {
      return;
    }

    const timer = setInterval(() => {
      setIndex((prev) => (prev + 1) % slides.length);
    }, AUTO_ADVANCE_MS);

    return () => clearInterval(timer);
  }, [isPaused]);

  const goNext = () => {
    setIndex((prev) => (prev + 1) % slides.length);
  };

  const goPrev = () => {
    setIndex((prev) => (prev - 1 + slides.length) % slides.length);
  };

  const activeSlide = slides[index];
  const activeSlideImage = failedSlides[index] ? "/brand/whitedown.png" : activeSlide.image;
  const isSlideLoaded = Boolean(loadedSlides[index]);

  return (
    <section
      className="relative min-h-[74vh] overflow-hidden sm:min-h-[82vh] lg:min-h-[90vh]"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      <AnimatePresence mode="wait">
        <motion.div
          key={`${index}-${activeSlideImage}`}
          className="absolute inset-0 z-0"
          initial={{ opacity: 0, scale: 1.06 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 1.02 }}
          transition={{ duration: 0.9, ease: "easeOut" }}
        >
          <div
            className={`absolute inset-0 bg-linear-to-r from-card via-background to-card bg-size-[200%_100%] animate-pulse transition-opacity duration-300 ${
              isSlideLoaded ? "opacity-0" : "opacity-100"
            }`}
          />
          <Image
            src={activeSlideImage}
            alt={activeSlide.title}
            fill
            unoptimized
            className="object-cover object-center"
            sizes="100vw"
            priority={index === 0}
            loading={index === 0 ? "eager" : "lazy"}
            onLoad={() =>
              setLoadedSlides((prev) => ({
                ...prev,
                [index]: true,
              }))
            }
            onError={() =>
              setFailedSlides((prev) => ({
                ...prev,
                [index]: true,
              }))
            }
          />
        </motion.div>
      </AnimatePresence>

      <div className="absolute inset-0 z-10 bg-black/60" />

      <div className="relative z-20 mx-auto flex min-h-[74vh] w-full max-w-6xl items-center px-4 py-14 sm:min-h-[82vh] sm:py-16 md:px-6 lg:min-h-[90vh] lg:py-20">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeSlide.title}
            className="max-w-2xl space-y-6"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -24 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
          >
            <p className="inline-flex rounded-full border border-border bg-card/70 px-3 py-1 text-xs font-medium text-muted backdrop-blur">
              Smart Crypto Investing
            </p>
            <h1 className="text-4xl font-bold leading-tight text-white md:text-6xl">
              {activeSlide.title}
            </h1>
            <p className="text-base text-zinc-200 md:text-lg">{activeSlide.description}</p>

            <motion.div
              className="flex flex-wrap gap-3"
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.45, delay: 0.15 }}
            >
              <Link href="/register" className={buttonStyles("gradient")}>
                Get Started
              </Link>
              <Link
                href="#plans"
                className={buttonStyles("ghost", "border-white/40 text-white hover:border-primary")}
              >
                View Plans
              </Link>
            </motion.div>
          </motion.div>
        </AnimatePresence>
      </div>

      <div className="absolute inset-x-0 bottom-5 z-30 mx-auto flex w-full max-w-6xl items-center justify-between px-4 sm:bottom-7 md:px-6 lg:bottom-8">
        <div className="flex items-center gap-2">
          {slides.map((slide, slideIndex) => (
            <button
              key={slide.image}
              type="button"
              aria-label={`Go to slide ${slideIndex + 1}`}
              onClick={() => setIndex(slideIndex)}
              className={`h-2.5 rounded-full transition-all ${
                slideIndex === index ? "w-8 bg-primary" : "w-2.5 bg-white/50 hover:bg-white/80"
              }`}
            />
          ))}
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            aria-label="Previous slide"
            onClick={goPrev}
            className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/40 bg-black/30 text-white backdrop-blur transition hover:border-primary"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <button
            type="button"
            aria-label="Next slide"
            onClick={goNext}
            className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/40 bg-black/30 text-white backdrop-blur transition hover:border-primary"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
        </div>
      </div>
    </section>
  );
}
