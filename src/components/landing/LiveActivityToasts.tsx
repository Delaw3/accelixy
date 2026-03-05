"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useState } from "react";

type ActionType = "invested" | "deposited" | "withdrew";

type ActivityItem = {
  id: number;
  name: string;
  country: string;
  action: ActionType;
  amount: string;
};

const COUNTRIES = [
  "UK",
  "US",
  "Spain",
  "Canada",
  "Germany",
  "France",
  "Italy",
  "Netherlands",
  "Switzerland",
  "UAE",
  "Singapore",
  "Australia",
  "Japan",
] as const;

const INITIALS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");

const ACTIONS: ActionType[] = ["invested", "deposited", "withdrew"];

const VISIBLE_MIN_MS = 3_000;
const VISIBLE_MAX_MS = 5_500;
const NEXT_GAP_MS = 2_200;

function randomInt(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randomPick<T>(items: readonly T[]) {
  return items[Math.floor(Math.random() * items.length)];
}

function formatCurrency(amount: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

function getRandomAmount(action: ActionType) {
  if (action === "invested") {
    return formatCurrency(randomInt(500, 10_000));
  }

  if (action === "deposited") {
    return formatCurrency(randomInt(50, 2_000));
  }

  return formatCurrency(randomInt(200, 5_000));
}

function buildActivity(id: number): ActivityItem {
  const action = randomPick(ACTIONS);
  return {
    id,
    name: `${randomPick(INITIALS)}***`,
    country: randomPick(COUNTRIES),
    action,
    amount: getRandomAmount(action),
  };
}

export function LiveActivityToasts() {
  const [activity, setActivity] = useState<ActivityItem>(() => buildActivity(1));
  const [counter, setCounter] = useState(2);
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    if (!isVisible) {
      return;
    }

    const visibleFor = randomInt(VISIBLE_MIN_MS, VISIBLE_MAX_MS);
    const hideTimer = window.setTimeout(() => {
      setIsVisible(false);
    }, visibleFor);

    return () => window.clearTimeout(hideTimer);
  }, [isVisible, activity.id]);

  useEffect(() => {
    if (isVisible) {
      return;
    }

    const nextTimer = window.setTimeout(() => {
      setActivity(buildActivity(counter));
      setCounter((prev) => prev + 1);
      setIsVisible(true);
    }, NEXT_GAP_MS);

    return () => window.clearTimeout(nextTimer);
  }, [isVisible, counter]);

  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-24 z-40 flex justify-center px-4 sm:bottom-6">
      <AnimatePresence mode="wait">
        {isVisible ? (
          <motion.div
            key={activity.id}
            initial={{ opacity: 0, y: 18, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -14, scale: 0.985 }}
            transition={{ duration: 0.45, ease: "easeOut" }}
            className="w-full max-w-[280px] rounded-xl border border-border bg-card/95 px-3 py-2 text-xs text-foreground shadow-lg backdrop-blur sm:max-w-md sm:px-4 sm:py-3 sm:text-sm"
          >
            <span className="font-semibold text-primary">{activity.name}</span>{" "}
            from <span className="font-medium">{activity.country}</span>{" "}
            {activity.action}{" "}
            <span className="font-semibold text-primary">{activity.amount}</span>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
}
