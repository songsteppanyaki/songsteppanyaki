
"use client";

import { useState, FormEvent } from "react";
import Link from "next/link";

export default function QuickDepositPage() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const formData = new FormData(e.currentTarget);

      const fullName = String(formData.get("fullName") || "");
      const address = String(formData.get("address") || "");
      const eventDate = String(formData.get("eventDate") || "");
      const eventTime = String(formData.get("eventTime") || "");
      const adults = Number(formData.get("adults") || 0);
      const children = Number(formData.get("children") || 0);

      const totalGuests = adults + children;

      const guests = [
        {
          category: "Adults",
          ageRange: "Ages 14 and up",
          quantity: adults,
          pricePerGuest: 60,
          subtotal: adults * 60,
        },
        {
          category: "Children",
          ageRange: "Ages 5–12",
          quantity: children,
          pricePerGuest: 30,
          subtotal: children * 30,
        },
      ].filter((guest) => guest.quantity > 0);

      const bookingData = {
        fullName,
        phone: "",
        email: "",

        address,
        completeEventAddress: address,
        city: "",
        zipCode: "",

        eventDate,
        eventTime,
        occasion: "Quick Deposit Booking",

        guests,
        totalGuests,

        serviceType: "traditional",
        serviceName: "Traditional Hibachi",

        proteins: [],
        buffetProteins: [],
        addOns: [],
        allergies: [],
        dietaryPreferences: [],

        specialRequests: "Quick Deposit Booking",

        distanceMiles: 0,
        travelFee: 0,
        subtotal: adults * 60 + children * 30,
        salesTax: 0,
        salesTaxRate: 0,
        estimatedTotal: adults * 60 + children * 30,
      };

      const response = await fetch(
        "/api/stripe/create-checkout-session",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            depositAmount: 100,
            bookingData,
          }),
        },
      );

      const data = await response.json();

      if (!response.ok || !data.url) {
        throw new Error(
          data.error || "Unable to start payment.",
        );
      }

      window.location.href = data.url;
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to start payment.",
      );
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-neutral-950 px-5 py-16 text-white">
      <div className="mx-auto max-w-2xl rounded-3xl border border-amber-400/30 bg-zinc-900 p-8">

        <div className="mb-8 flex justify-between">
          <Link href="/" className="text-xl font-black text-amber-400">
            SONG TEPPANYAKI
          </Link>
          <Link href="/" className="text-sm text-neutral-400">
            Home
          </Link>
        </div>

        <h1 className="text-center text-3xl font-black text-amber-400">
          QUICK DEPOSIT
        </h1>

        <p className="mt-3 text-center text-neutral-300">
          Reserve Your Private Hibachi Experience
        </p>

        <form onSubmit={handleSubmit} className="mt-8 space-y-5">

          <div>
            <label className="mb-2 block">Full Name</label>
            <input
              required
              name="fullName"
              placeholder="Your full name"
              className="w-full rounded-xl bg-neutral-800 p-4 text-white"
            />
          </div>

          <div>
            <label className="mb-2 block">Event Address</label>
            <input
              required
              name="address"
              placeholder="Street, City, State, ZIP"
              className="w-full rounded-xl bg-neutral-800 p-4 text-white"
            />
          </div>

          <div>
            <label className="mb-2 block">Party Date</label>
            <input
              required
              type="date"
              name="eventDate"
              min={new Date().toISOString().split("T")[0]}
              className="w-full rounded-xl bg-neutral-800 p-4 text-white"
            />
          </div>

          <div>
            <label className="mb-2 block">Party Time</label>
            <input
              required
              type="time"
              name="eventTime"
              className="w-full rounded-xl bg-neutral-800 p-4 text-white"
            />
          </div>

          <div>
            <label className="mb-2 block">Adults (Ages 14+)</label>
            <input
              required
              type="number"
              name="adults"
              min="1"
              step="1"
              defaultValue="1"
              className="w-full rounded-xl bg-neutral-800 p-4 text-white"
            />
          </div>

          <div>
            <label className="mb-2 block">
              Children (Ages 5–12)
            </label>
            <input
              required
              type="number"
              name="children"
              min="0"
              step="1"
              defaultValue="0"
              className="w-full rounded-xl bg-neutral-800 p-4 text-white"
            />
          </div>

          <div className="border-t border-white/10 pt-6 text-center">
            <p className="text-neutral-300">Booking Deposit</p>
            <p className="mt-2 text-4xl font-black text-amber-400">
              $100.00
            </p>
            <p className="mt-2 text-xs text-neutral-400">
              Your deposit will be applied toward your final event balance.
            </p>
          </div>

          {error && (
            <p className="rounded-xl bg-red-900/30 p-4 text-sm text-red-300">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-full bg-amber-400 py-4 font-black text-black transition hover:bg-amber-300 disabled:opacity-50"
          >
            {loading
              ? "PROCESSING..."
              : "CONTINUE TO $100 DEPOSIT"}
          </button>

        </form>
      </div>
    </main>
  );
}
