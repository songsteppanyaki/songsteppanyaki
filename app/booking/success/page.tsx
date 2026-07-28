import Link from "next/link";

export default function BookingSuccessPage() {
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