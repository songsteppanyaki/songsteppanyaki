"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
  }
}

export default function BookingSuccessPage() {
  const [monthlyOrderNumber, setMonthlyOrderNumber] = useState<string | null>(
    null
  );

  useEffect(() => {
    let cancelled = false;
    let interval: number | undefined;

    async function verifyAndTrackPurchase() {
      const params = new URLSearchParams(window.location.search);
      const sessionId = params.get("session_id");

      if (!sessionId || !sessionId.startsWith("cs_")) return;

      const storageKey = `google_ads_purchase_${sessionId}`;

      try {
        const response = await fetch(
          `/api/stripe/verify-session?session_id=${encodeURIComponent(sessionId)}`,
          { cache: "no-store" }
        );

        if (!response.ok) return;

        const result = await response.json();

        if (cancelled || result.paid !== true) return;

        // Display the order number returned by the server.
        // The verify-session API must return monthlyOrderNumber.
        if (typeof result.monthlyOrderNumber === "string") {
          setMonthlyOrderNumber(result.monthlyOrderNumber);
        }

        // Avoid sending the same Google Ads conversion repeatedly.
        try {
          if (window.sessionStorage.getItem(storageKey) === "sent") {
            return;
          }
        } catch {
          // Continue if sessionStorage is unavailable.
        }

        let attempts = 0;

        const sendPurchaseConversion = () => {
          if (cancelled) return true;
          if (!window.gtag) return false;

          window.gtag("event", "conversion", {
            send_to: "AW-18454208775/CIMVCOCJ8f0cEIfC099E",
            value: 100,
            currency: "USD",
            transaction_id: sessionId,
          });

          try {
            window.sessionStorage.setItem(storageKey, "sent");
          } catch {
            // Conversion was sent even if storage is unavailable.
          }

          return true;
        };

        if (sendPurchaseConversion()) return;

        interval = window.setInterval(() => {
          attempts += 1;

          if (sendPurchaseConversion() || attempts >= 50) {
            if (interval !== undefined) {
              window.clearInterval(interval);
              interval = undefined;
            }
          }
        }, 100);
      } catch (error) {
        console.error("Purchase verification failed:", error);
      }
    }

    void verifyAndTrackPurchase();

    return () => {
      cancelled = true;

      if (interval !== undefined) {
        window.clearInterval(interval);
      }
    };
  }, []);

  return (
    <main className="flex min-h-screen items-center justify-center bg-black px-5 py-12 text-white">
      <div className="w-full max-w-2xl rounded-3xl border border-white/10 bg-white/5 p-8 text-center shadow-2xl md:p-12">
        <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-yellow-400 text-4xl font-black text-black">
          ✓
        </div>

        <p className="mt-8 text-sm font-bold tracking-[0.35em] text-yellow-400">
          BOOKING REQUEST SENT
        </p>

        <h1 className="mt-4 text-4xl font-black md:text-5xl">
          Thank You for Choosing
          <span className="mt-2 block text-yellow-400">
            SONG TEPPANYAKI
          </span>
        </h1>

        <p className="mx-auto mt-6 max-w-xl text-lg leading-8 text-gray-300">
          We have received your booking request. We will review your event
          details and contact you to confirm availability and final pricing.
        </p>

        {monthlyOrderNumber && (
          <div className="mt-8 rounded-2xl border border-yellow-400/40 bg-yellow-400/10 p-6">
            <p className="text-sm font-bold tracking-widest text-yellow-400">
              YOUR MONTHLY ORDER NUMBER
            </p>

            <p className="mt-3 text-3xl font-black tracking-wide text-white sm:text-4xl">
              {monthlyOrderNumber}
            </p>

            <p className="mt-3 text-sm text-gray-300">
              Please keep this number for your reference.
            </p>
          </div>
        )}

        <div className="mt-8 rounded-2xl border border-yellow-400/30 bg-yellow-400/10 p-6 text-left">
          <h2 className="text-lg font-bold text-yellow-400">
            What Happens Next?
          </h2>

          <div className="mt-5 space-y-4 text-gray-300">
            <p>
              <strong className="text-white">1.</strong> We review your event
              date, time, address, guest count, and menu selections.
            </p>

            <p>
              <strong className="text-white">2.</strong> You will receive a
              confirmation email or phone call.
            </p>

            <p>
              <strong className="text-white">3.</strong> Your booking is not
              confirmed until Song Teppanyaki contacts you.
            </p>
          </div>
        </div>

        <div className="mt-8 flex flex-col justify-center gap-4 sm:flex-row">
          <Link
            href="/"
            className="rounded-full bg-yellow-400 px-8 py-4 font-bold text-black transition hover:bg-yellow-300"
          >
            RETURN HOME
          </Link>

          <Link
            href="/booking"
            className="rounded-full border border-white/20 px-8 py-4 font-bold transition hover:border-yellow-400 hover:text-yellow-400"
          >
            NEW BOOKING
          </Link>
        </div>
      </div>
    </main>
  );
}