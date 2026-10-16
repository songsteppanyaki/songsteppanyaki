
"use client";

import { useState } from "react";
import Link from "next/link";

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
  }
}

export default function BookingInquiryPage() {
  const [form, setForm] = useState({
    name: "",
    phone: "",
    email: "",
    date: "",
    time: "",
    address: "",
    adults: "10",
    children: "0",
    occasion: "",
    menu: "",
    notes: "",
  });

  const [status, setStatus] = useState("");
  const [success, setSuccess] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  function update(
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    if (submitting || success) return;

    setSubmitting(true);
    setStatus("");
    setSuccess(false);

    try {
      const response = await fetch("/api/booking-inquiry", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Submission failed.");
      }

      setSuccess(true);

// Track Google Ads conversion only after the inquiry API succeeds.
if (typeof window !== "undefined" && window.gtag) {
  window.gtag("event", "conversion", {
    send_to: "AW-18454208775/W3WtCMmeq58dEIfC099E",
  });
}

setStatus(
  "Thank you! Your booking inquiry has been submitted successfully. Our team will contact you to confirm availability and details before any deposit is requested."
);
    } catch (error) {
      setStatus(
        error instanceof Error
          ? error.message
          : "Unable to submit your inquiry. Please try again."
      );
    } finally {
      setSubmitting(false);
    }
  }

  const inputClass =
    "w-full rounded-lg border border-white/20 bg-black/70 px-4 py-3 text-white outline-none focus:border-amber-400";

  return (
    <main className="min-h-screen bg-black px-4 py-12 text-white">
      <div className="mx-auto max-w-3xl">
        <Link
          href="/"
          className="text-sm text-amber-400 hover:text-amber-300"
        >
          ← Back to Home
        </Link>

        <div className="mt-6 rounded-2xl border border-amber-400/40 bg-zinc-950 p-6 shadow-2xl sm:p-10">
          <p className="text-sm font-bold uppercase tracking-[0.25em] text-amber-400">
            Song Teppanyaki
          </p>

          <h1 className="mt-3 text-3xl font-black sm:text-4xl">
            Booking Inquiry
          </h1>

          <p className="mt-4 leading-7 text-zinc-300">
            Tell us about your event. Submitting this form is free and does
            not require a deposit. Our team will contact you to confirm
            availability, menu choices, and event details before requesting
            payment.
          </p>

          {status && (
            <div
              role={success ? "status" : "alert"}
              aria-live="polite"
              className={`mt-6 rounded-lg border p-4 text-sm leading-6 ${
                success
                  ? "border-green-500/50 bg-green-500/10 text-green-300"
                  : "border-red-500/50 bg-red-500/10 text-red-300"
              }`}
            >
              <p className="font-bold">
                {success
                  ? "✓ Inquiry Submitted Successfully"
                  : "Submission Error"}
              </p>
              <p className="mt-1">{status}</p>
            </div>
          )}

          <form onSubmit={submit} className="mt-8 space-y-5">
            <div className="grid gap-5 sm:grid-cols-2">
              <label className="block text-sm">
                Full Name *
                <input
                  className={`${inputClass} mt-2`}
                  name="name"
                  value={form.name}
                  onChange={update}
                  autoComplete="name"
                  required
                  maxLength={100}
                />
              </label>

              <label className="block text-sm">
                Phone Number *
                <input
                  className={`${inputClass} mt-2`}
                  name="phone"
                  value={form.phone}
                  onChange={update}
                  type="tel"
                  autoComplete="tel"
                  required
                  maxLength={30}
                />
              </label>

              <label className="block text-sm">
                Email
                <input
                  className={`${inputClass} mt-2`}
                  name="email"
                  value={form.email}
                  onChange={update}
                  type="email"
                  autoComplete="email"
                  maxLength={254}
                />
              </label>

              <label className="block text-sm">
                Event Date *
                <input
                  className={`${inputClass} mt-2`}
                  name="date"
                  type="date"
                  value={form.date}
                  onChange={update}
                  min={new Date().toLocaleDateString("en-CA")}
                  required
                />
              </label>

              <label className="block text-sm">
                Preferred Time *
                <input
                  className={`${inputClass} mt-2`}
                  name="time"
                  type="time"
                  value={form.time}
                  onChange={update}
                  required
                />
              </label>

              <label className="block text-sm">
                Occasion
                <select
                  className={`${inputClass} mt-2`}
                  name="occasion"
                  value={form.occasion}
                  onChange={update}
                >
                  <option value="">Select an occasion</option>
                  <option>Birthday</option>
                  <option>Anniversary</option>
                  <option>Family Gathering</option>
                  <option>Corporate Event</option>
                  <option>Other</option>
                </select>
              </label>
            </div>

            <label className="block text-sm">
              Event Address *
              <input
                className={`${inputClass} mt-2`}
                name="address"
                value={form.address}
                onChange={update}
                autoComplete="street-address"
                required
                maxLength={300}
              />
            </label>

            <div className="grid gap-5 sm:grid-cols-2">
              <label className="block text-sm">
                Number of Adults *
                <input
                  className={`${inputClass} mt-2`}
                  name="adults"
                  type="number"
                  min="0"
                  max="500"
                  step="1"
                  value={form.adults}
                  onChange={update}
                  required
                />
              </label>

              <label className="block text-sm">
                Children Ages 5–13
                <input
                  className={`${inputClass} mt-2`}
                  name="children"
                  type="number"
                  min="0"
                  max="500"
                  step="1"
                  value={form.children}
                  onChange={update}
                  required
                />
              </label>
            </div>

            <label className="block text-sm">
              Menu or Protein Preferences
              <textarea
                className={`${inputClass} mt-2`}
                name="menu"
                value={form.menu}
                onChange={update}
                rows={3}
                maxLength={2000}
                placeholder="For example: steak, chicken, shrimp, or special requests"
              />
            </label>

            <label className="block text-sm">
              Additional Details
              <textarea
                className={`${inputClass} mt-2`}
                name="notes"
                value={form.notes}
                onChange={update}
                rows={4}
                maxLength={3000}
                placeholder="Dietary needs, allergies, venue details, or questions"
              />
            </label>

            <button
              type="submit"
              disabled={submitting || success}
              className="w-full rounded-full bg-amber-400 px-6 py-4 font-black text-black transition hover:bg-amber-300 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {submitting
                ? "SENDING..."
                : success
                  ? "INQUIRY SUBMITTED ✓"
                  : "SUBMIT FREE INQUIRY"}
            </button>

            <p className="text-center text-sm text-zinc-400">
              No deposit is charged when you submit an inquiry. Payment is
              requested only after our team confirms your event details.
            </p>
          </form>

          <div className="mt-6 text-center text-sm">
            Ready to book directly?{" "}
            <Link
              href="/booking"
              className="font-bold text-amber-400 underline"
            >
              Book Now
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
