"use client";

import Link from "next/link";
import { useState } from "react";

const DEPOSIT_AMOUNT = 200;

export default function BookingPaymentPage() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handlePayment() {
    try {
      setLoading(true);
      setError("");

      const response = await fetch(
        "/api/stripe/create-checkout-session",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            depositAmount: DEPOSIT_AMOUNT,
          }),
        },
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error || "Unable to start payment.",
        );
      }

      if (!data.url) {
        throw new Error(
          "Stripe checkout URL was not returned.",
        );
      }

      window.location.href = data.url;
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Unable to start payment.",
      );
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-black px-5 py-10 text-white md:px-8">
      <div className="mx-auto max-w-3xl">
        <div className="mb-10 flex items-center justify-between">
          <Link
            href="/"
            className="text-2xl font-bold tracking-widest text-yellow-400"
          >
            SONG
          </Link>

          <Link
            href="/booking"
            className="text-sm text-gray-300 transition hover:text-yellow-400"
          >
            Back to Booking
          </Link>
        </div>

        <section className="rounded-3xl border border-white/10 bg-white/5 p-6 shadow-2xl md:p-10">
          <div className="text-center">
            <p className="text-sm tracking-[0.35em] text-yellow-400">
              SECURE YOUR EVENT
            </p>

            <h1 className="mt-4 text-4xl font-bold md:text-6xl">
              Booking Deposit
            </h1>

            <p className="mx-auto mt-5 max-w-2xl leading-7 text-gray-400">
              A non-refundable deposit is required before your
              event request can be reserved.
            </p>
          </div>

          <div className="mt-10 rounded-2xl border border-yellow-400/30 bg-yellow-400/10 p-6">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-sm uppercase tracking-widest text-gray-400">
                  Non-refundable deposit
                </p>

                <p className="mt-2 text-sm leading-6 text-gray-300">
                  This deposit will be applied toward your final
                  event balance.
                </p>
              </div>

              <p className="text-4xl font-bold text-yellow-400">
                ${DEPOSIT_AMOUNT}
              </p>
            </div>
          </div>

          <div className="mt-8 space-y-4 rounded-2xl border border-white/10 bg-black/30 p-6">
            <h2 className="text-xl font-bold text-white">
              Before You Pay
            </h2>

            <p className="text-sm leading-6 text-gray-300">
              By continuing, you understand that the $
              {DEPOSIT_AMOUNT} deposit is non-refundable.
            </p>

            <p className="text-sm leading-6 text-gray-300">
              Your booking is not fully confirmed until Song
              Teppanyaki reviews your event details and contacts
              you.
            </p>

            <p className="text-sm leading-6 text-gray-300">
              After successful payment, a confirmation email
              will be sent to you and the booking details will
              be sent to songsteppanyaki@gmail.com.
            </p>
          </div>

          {error && (
            <div className="mt-6 rounded-xl border border-red-500/40 bg-red-500/10 p-4 text-sm text-red-300">
              {error}
            </div>
          )}

          <button
            type="button"
            onClick={handlePayment}
            disabled={loading}
            className="mt-8 w-full rounded-full bg-yellow-500 px-8 py-4 text-lg font-bold text-black transition hover:bg-yellow-400 disabled:cursor-not-allowed disabled:bg-gray-600 disabled:text-gray-300"
          >
            {loading
              ? "OPENING SECURE PAYMENT..."
              : `PAY $${DEPOSIT_AMOUNT} DEPOSIT`}
          </button>

          <p className="mt-5 text-center text-xs leading-5 text-gray-500">
            Payment will be processed securely through Stripe.
          </p>
        </section>
      </div>
    </main>
  );
}
