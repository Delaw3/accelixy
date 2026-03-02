"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { BadgeCheck, Star } from "lucide-react";

type Testimonial = {
  id: string;
  nameMasked: string;
  country: string;
  rating: 4 | 5;
  message: string;
  timeLabel: string;
  verified?: boolean;
};

const TESTIMONIALS: Testimonial[] = [
  { id: "t1", nameMasked: "J*** S.", country: "United States", rating: 5, message: "Started with a small amount and scaled up steadily. Dashboard is clear and easy to track.", timeLabel: "2 days ago", verified: true },
  { id: "t2", nameMasked: "M*** A.", country: "United Kingdom", rating: 5, message: "Payout cycle was exactly as shown. I like how simple the investment flow is.", timeLabel: "1 week ago", verified: true },
  { id: "t3", nameMasked: "C*** R.", country: "Spain", rating: 4, message: "Support replied quickly when I had a wallet question. Smooth experience overall.", timeLabel: "3 days ago", verified: true },
  { id: "t4", nameMasked: "L*** K.", country: "Canada", rating: 5, message: "Withdrawal request was processed fast. The process felt transparent from start to finish.", timeLabel: "5 days ago", verified: true },
  { id: "t5", nameMasked: "N*** B.", country: "Germany", rating: 4, message: "I appreciate the plan details and risk visibility before committing funds.", timeLabel: "1 day ago", verified: true },
  { id: "t6", nameMasked: "A*** P.", country: "France", rating: 5, message: "Joined recently and already seeing consistent progress. Interface feels reliable.", timeLabel: "6 days ago", verified: true },
  { id: "t7", nameMasked: "R*** T.", country: "Italy", rating: 5, message: "Deposit confirmation and account updates are very clear. Great for active monitoring.", timeLabel: "2 weeks ago", verified: true },
  { id: "t8", nameMasked: "D*** V.", country: "Netherlands", rating: 4, message: "Good balance between simplicity and detailed stats. Easy to manage from mobile.", timeLabel: "4 days ago", verified: true },
  { id: "t9", nameMasked: "S*** H.", country: "Switzerland", rating: 5, message: "Portfolio tracking is clean and the returns were credited without delays.", timeLabel: "8 days ago", verified: true },
  { id: "t10", nameMasked: "K*** M.", country: "UAE", rating: 5, message: "Fast onboarding and clear communication. The platform is straightforward to use.", timeLabel: "10 days ago", verified: true },
  { id: "t11", nameMasked: "T*** L.", country: "Singapore", rating: 4, message: "I started cautiously and moved to a bigger plan later. Everything has been smooth.", timeLabel: "3 weeks ago", verified: true },
  { id: "t12", nameMasked: "E*** W.", country: "Australia", rating: 5, message: "Support and account notifications are timely. Great confidence for long-term use.", timeLabel: "9 days ago", verified: true },
  { id: "t13", nameMasked: "Y*** N.", country: "Japan", rating: 5, message: "The payout timeline matched expectations and withdrawals were handled quickly.", timeLabel: "12 days ago", verified: true },
];

type VisibleSet = {
  featured: Testimonial;
  others: Testimonial[];
};

function pickRandomSet(source: Testimonial[]): VisibleSet {
  const shuffled = [...source].sort(() => Math.random() - 0.5);
  return {
    featured: shuffled[0],
    others: shuffled.slice(1, 4),
  };
}

function RatingStars({ rating }: { rating: 4 | 5 }) {
  return (
    <div className="flex items-center gap-1">
      {Array.from({ length: 5 }).map((_, index) => (
        <Star
          key={`star-${rating}-${index}`}
          className={`h-4 w-4 ${index < rating ? "fill-primary text-primary" : "text-muted"}`}
        />
      ))}
    </div>
  );
}

function TestimonialCard({
  item,
  featured = false,
}: {
  item: Testimonial;
  featured?: boolean;
}) {
  return (
    <article
      className={[
        "rounded-xl border border-border bg-card p-5 text-foreground",
        featured ? "h-full md:p-6" : "h-full",
      ].join(" ")}
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className={featured ? "text-lg font-semibold" : "text-base font-semibold"}>{item.nameMasked}</p>
          <p className="text-sm text-muted">{item.country}</p>
        </div>
        <span className="text-xs text-muted">{item.timeLabel}</span>
      </div>

      <div className="mt-3">
        <RatingStars rating={item.rating} />
      </div>

      <p className={featured ? "mt-4 text-base text-foreground" : "mt-3 text-sm text-foreground"}>
        {item.message}
      </p>

      {item.verified ? (
        <div className="mt-4 inline-flex items-center gap-1.5 rounded-full border border-primary/40 px-3 py-1 text-xs font-medium text-primary">
          <BadgeCheck className="h-3.5 w-3.5" />
          Verified Investor
        </div>
      ) : null}
    </article>
  );
}

export function TestimonialsRotator() {
  const initialSet = useMemo<VisibleSet>(
    () => ({
      featured: TESTIMONIALS[0],
      others: TESTIMONIALS.slice(1, 4),
    }),
    []
  );

  const [visibleSet, setVisibleSet] = useState<VisibleSet>(initialSet);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const rotate = () => {
      setVisibleSet(pickRandomSet(TESTIMONIALS));
      const nextDelay = Math.floor(Math.random() * (45000 - 25000 + 1)) + 25000;
      timerRef.current = setTimeout(rotate, nextDelay);
    };

    timerRef.current = setTimeout(rotate, 1200);

    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, []);

  const viewKey = `${visibleSet.featured.id}-${visibleSet.others.map((item) => item.id).join("-")}`;

  return (
    <section id="testimonials" className="mx-auto w-full max-w-6xl px-4 pb-14 md:px-6">
      <h2 className="text-center text-2xl font-semibold md:text-3xl">What Investors Are Saying</h2>
      <p className="mt-3 text-center text-sm text-muted md:text-base">
        Real stories from users who started small and grew steadily with Accelixy.
      </p>

      <div className="mt-8">
        <AnimatePresence mode="wait">
          <motion.div
            key={viewKey}
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.45, ease: "easeOut" }}
            className="grid gap-4 lg:grid-cols-5"
          >
            <div className="lg:col-span-3">
              <TestimonialCard item={visibleSet.featured} featured />
            </div>

            <div className="grid gap-4 sm:grid-cols-2 lg:col-span-2 lg:grid-cols-1">
              {visibleSet.others.slice(0, 2).map((item) => (
                <TestimonialCard key={item.id} item={item} />
              ))}
              {visibleSet.others[2] ? (
                <div className="sm:col-span-2 lg:col-span-1">
                  <TestimonialCard item={visibleSet.others[2]} />
                </div>
              ) : null}
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </section>
  );
}
