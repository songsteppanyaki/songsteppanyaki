"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
const services = [
  {
    number: "01",
    title: "Birthday Parties",
    text: "Celebrate your birthday with live hibachi cooking, entertainment, and a memorable dining experience.",
  },
  {
    number: "02",
    title: "Private Events",
    text: "We bring the complete teppanyaki experience directly to your home, backyard, or private venue.",
  },
  {
    number: "03",
    title: "Corporate Events",
    text: "Create an interactive and exciting dining experience for employees, clients, and company celebrations.",
  },
];

const benefits = [
  "Professional private hibachi chef",
  "Live cooking and entertainment",
  "Fresh ingredients",
  "Custom protein selections",
  "Birthday and celebration experience",
  "Service at your home or venue",
];

const steps = [
  {
    number: "1",
    title: "Choose Your Date",
    text: "Enter your preferred event date, time, occasion, and address.",
  },
  {
    number: "2",
    title: "Select Your Menu",
    text: "Choose the number of guests, proteins, add-ons, allergies, and dietary preferences.",
  },
  {
    number: "3",
    title: "Receive Confirmation",
    text: "We review your request and contact you to confirm availability and event details.",
  },
  {
    number: "4",
    title: "Enjoy the Experience",
    text: "Our chef arrives at your location and creates an unforgettable hibachi event.",
  },
];

const reviews = [
  {
    name: "Birthday Celebration",
    text: "The food was delicious and the chef made the entire party exciting. Everyone had a wonderful time.",
  },
  {
    name: "Family Party",
    text: "A fun and memorable experience for both adults and children. The fire show was amazing.",
  },
  {
    name: "Private Event",
    text: "Professional service, fresh food, and great entertainment. We would definitely book again.",
  },
];

const faqs = [
  {
    question: "What is the minimum booking charge?",
    answer:
      "The minimum booking charge is $600 per event. Add-ons and travel fees are charged separately.",
  },
  {
    question: "How many protein portions are included?",
    answer:
      "Each paying guest includes two protein portions. For parties with fewer than 10 paying guests, each unused minimum guest slot includes two additional protein portions.",
  },
  {
    question: "Do you travel to the customer’s location?",
    answer:
      "Yes. Travel is free within 20 driving miles of 9083 Arcadia Ave, San Gabriel, CA 91775. Each additional mile is charged at $2.",
  },
  {
    question: "Can you accommodate food allergies?",
    answer:
      "Yes. Customers can list allergies and dietary preferences during booking. Serious allergies should also be explained in the special requests section.",
  },
  {
    question: "Does submitting the form confirm the booking?",
    answer:
      "No. Submitting the form sends a booking request. Song Teppanyaki will contact you to confirm availability, menu details, and final pricing.",
  },
];

const galleryImages = [
  { src: "/gallery/gallery-1.jpg", alt: "Song Teppanyaki Event 1" },
  { src: "/gallery/gallery-2.jpg", alt: "Song Teppanyaki Event 2" },
  { src: "/gallery/gallery-3.jpg", alt: "Song Teppanyaki Event 3" },
  { src: "/gallery/gallery-4.jpg", alt: "Song Teppanyaki Event 4" },
  { src: "/gallery/gallery-5.jpg", alt: "Song Teppanyaki Event 5" },
  { src: "/gallery/gallery-6.jpg", alt: "Song Teppanyaki Event 6" },
  { src: "/gallery/gallery-7.png", alt: "Song Teppanyaki Event 7" },
  { src: "/gallery/gallery-8.jpg", alt: "Song Teppanyaki Event 8" },
  { src: "/gallery/gallery-9.jpg", alt: "Song Teppanyaki Event 9" },
  { src: "/gallery/gallery-10.jpg", alt: "Song Teppanyaki Event 10" },
  { src: "/gallery/gallery-11.jpg", alt: "Song Teppanyaki Event 11" },
  { src: "/gallery/gallery-12.jpg", alt: "Song Teppanyaki Event 12" },
  { src: "/gallery/gallery-13.jpg", alt: "Song Teppanyaki Event 13" },
  { src: "/gallery/gallery-14.jpg", alt: "Song Teppanyaki Event 14" },
  { src: "/gallery/gallery-15.jpg", alt: "Song Teppanyaki Event 15" },
];

export default function HomePage() {
  const [currentGallery, setCurrentGallery] = useState(0);

const prevGallery = () => {
  setCurrentGallery((prev) =>
    prev === 0 ? galleryImages.length - 1 : prev - 1
  );
};

const nextGallery = () => {
  setCurrentGallery((prev) =>
    prev === galleryImages.length - 1 ? 0 : prev + 1
  );
};
  return (
    <main className="min-h-screen overflow-hidden bg-neutral-950 text-white">
      <header className="fixed inset-x-0 top-0 z-50 border-b border-white/10 bg-black/80 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4">
          <Link href="/" className="group">
            <p className="text-xl font-black tracking-[0.25em]">SONG</p>
            <p className="text-[10px] tracking-[0.35em] text-amber-400">
              TEPPANYAKI
            </p>
          </Link>

          <nav className="hidden items-center gap-7 text-sm font-semibold lg:flex">
            <a className="transition hover:text-amber-400" href="#services">
              Services
            </a>
            <a className="transition hover:text-amber-400" href="#gallery">
              Gallery
            </a>
            <a className="transition hover:text-amber-400" href="#pricing">
              Pricing
            </a>
            <a className="transition hover:text-amber-400" href="#reviews">
              Reviews
            </a>
            <a className="transition hover:text-amber-400" href="#faq">
              FAQ
            </a>
          </nav>

          <Link
            href="/booking"
            className="rounded-full bg-amber-400 px-5 py-2.5 text-sm font-black text-black transition hover:bg-amber-300"
          >
            BOOK NOW
          </Link>
        </div>
      </header>

      <section
     className="relative flex min-h-screen items-center overflow-hidden px-5 pt-24">
 <video
    autoPlay
  muted
  loop
  playsInline
  className="absolute inset-0 z-0 h-full w-full object-cover"
>
  <source src="/videos/hibachi-bg.mp4" type="video/mp4" />
</video>

<div className="absolute inset-0 z-10 bg-black/10" />
<div className="absolute inset-0 z-10 bg-gradient-to-r from-black/40 via-black/10to-transparent" />

<div className="relative z-20 mx-auto grid w-full max-w-7xl items-center gap-12 lg:grid-cols-[1.15fr_0.85fr]">
          <div>
            <p className="text-sm font-bold tracking-[0.4em] text-amber-400">
              PRIVATE HIBACHI EXPERIENCE
            </p>

            <h1 className="mt-6 text-5xl font-black leading-[0.95] sm:text-6xl md:text-7xl lg:text-8xl">
              SONG
              <br />
              <span className="text-amber-400">TEPPANYAKI</span>
            </h1>

            <p className="mt-7 max-w-2xl text-lg leading-8 text-neutral-200 md:text-xl">
              Authentic Japanese Teppanyaki brought directly to your home,
              backyard, office, or private event venue.
            </p>

            <div className="mt-9 flex flex-col gap-4 sm:flex-row">
              <Link
                href="/booking"
                className="rounded-full bg-amber-400 px-8 py-4 text-center font-black text-black transition hover:bg-amber-300"
              >
                BOOK YOUR EVENT
              </Link>

              <a
                href="#gallery"
                className="rounded-full border border-white/40 bg-black/20 px-8 py-4 text-center font-black backdrop-blur transition hover:border-amber-400 hover:text-amber-400"
              >
                VIEW GALLERY
              </a>
            </div>

            <div className="mt-10 grid max-w-xl grid-cols-3 gap-5 border-t border-white/20 pt-7">
              <div>
                <p className="text-2xl font-black text-amber-400">$60</p>
                <p className="mt-1 text-xs text-neutral-300">Per Adult</p>
              </div>

              <div>
                <p className="text-2xl font-black text-amber-400">$30</p>
                <p className="mt-1 text-xs text-neutral-300">Ages 5–13</p>
              </div>

              <div>
                <p className="text-2xl font-black text-amber-400">$600</p>
                <p className="mt-1 text-xs text-neutral-300">Event Minimum</p>
              </div>
            </div>
          </div>

          <div className="hidden lg:block">
            <div className="rounded-[2.5rem] border border-white/20 bg-black/50 p-5 shadow-2xl backdrop-blur-md">
              <p className="text-xs font-bold tracking-[0.3em] text-amber-400">
                THE EXPERIENCE
              </p>

              <h2 className="mt-5 text-4xl font-black leading-tight">
                Dinner.
                <br />
                Entertainment.
                <br />
                Celebration.
              </h2>

              <div className="mt-8 space-y-4">
                {benefits.map((benefit) => (
                  <div
                    key={benefit}
                    className="flex items-center gap-3 border-b border-white/10 pb-4"
                  >
                    <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-amber-400 text-sm font-black text-black">
                      ✓
                    </span>
                    <span className="text-neutral-200">{benefit}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="services" className="px-5 py-24">
        <div className="mx-auto max-w-7xl">
          <p className="text-sm font-bold tracking-[0.35em] text-amber-400">
            OUR SERVICES
          </p>

          <div className="mt-4 flex flex-col justify-between gap-6 md:flex-row md:items-end">
            <h2 className="max-w-3xl text-4xl font-black leading-tight md:text-5xl">
              Unforgettable Teppanyaki Moments
            </h2>

            <p className="max-w-lg leading-7 text-neutral-400">
              Song Teppanyaki brings delicious food, live cooking, and
              entertainment directly to your event location.
            </p>
          </div>

          <div className="mt-12 grid gap-6 md:grid-cols-3">
            {services.map((service) => (
              <article
                key={service.title}
                className="group rounded-3xl border border-white/10 bg-white/[0.04] p-7 transition duration-300 hover:-translate-y-2 hover:border-amber-400/70"
              >
                <p className="text-sm font-black text-amber-400">
                  {service.number}
                </p>
                <h3 className="mt-6 text-2xl font-black">{service.title}</h3>
                <p className="mt-4 leading-7 text-neutral-400">
                  {service.text}
                </p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section id="gallery" className="bg-white px-5 py-24 text-neutral-950">
        <div className="mx-auto max-w-7xl">
          <div className="text-center">
            <p className="text-sm font-bold tracking-[0.35em] text-amber-600">
              EVENT GALLERY
            </p>

            <h2 className="mt-4 text-4xl font-black md:text-5xl">
              Experience Song Teppanyaki
            </h2>

            <p className="mx-auto mt-5 max-w-2xl leading-7 text-neutral-600">
              Private parties, family celebrations, live cooking, and memorable
              hibachi experiences.
            </p>
          </div>

        <div className="relative mx-auto mt-12 w-full max-w-5xl">
  <div className="relative overflow-hidden rounded-3xl bg-black">

    <img
      src={galleryImages[currentGallery].src}
      alt={galleryImages[currentGallery].alt}
      className="h-[520px] w-full object-cover"
    />

<button
  type="button"
  onClick={prevGallery}
  aria-label="Previous photo"
  style={{
    position: "absolute",
    left: "20px",
    top: "50%",
    transform: "translateY(-50%)",
    zIndex: 999,
    width: "60px",
    height: "60px",
    borderRadius: "50%",
    backgroundColor: "#fbbf24",
    color: "#000",
    fontSize: "32px",
    fontWeight: "bold",
    border: "none",
    cursor: "pointer",
  }}
>
  ←
</button>

<button
  type="button"
  onClick={nextGallery}
  aria-label="Next photo"
  style={{
    position: "absolute",
    right: "20px",
    top: "50%",
    transform: "translateY(-50%)",
    zIndex: 999,
    width: "60px",
    height: "60px",
    borderRadius: "50%",
    backgroundColor: "#fbbf24",
    color: "#000",
    fontSize: "32px",
    fontWeight: "bold",
    border: "none",
    cursor: "pointer",
  }}
>
  →
</button>

    <div className="absolute bottom-5 left-1/2 -translate-x-1/2 rounded-full bg-black/60 px-4 py-2 text-sm font-bold text-white">
      {currentGallery + 1} / {galleryImages.length}
    </div>

  </div>
</div>
</div>
      </section>
{/* FOOD GALLERY */}
<section className="bg-neutral-950 px-5 py-24 text-white">
  <div className="mx-auto max-w-7xl">

    <div className="text-center">
      <p className="text-sm font-bold tracking-[0.35em] text-amber-400">
        OUR FOOD
      </p>

      <h2 className="mt-4 text-4xl font-black md:text-5xl">
        Fresh From The Grill
      </h2>

      <p className="mx-auto mt-5 max-w-2xl text-neutral-400">
        Fresh ingredients prepared live on the hibachi grill.
      </p>
    </div>

    <div className="mt-12 grid grid-cols-2 gap-6 md:grid-cols-3 lg:grid-cols-5">
      {[
        { name: "Fresh Garden Salad", src: "/food/food-1.webp" },
        { name: "Gyoza", src: "/food/food-2.jpg" },
        { name: "Yakisoba Noodles", src: "/food/food-3.jpg" },
        { name: "Sushi Rolls", src: "/food/food-4.jpg" },
        { name: "Hibachi Tofu", src: "/food/food-5.webp" },
        { name: "Edamame", src: "/food/food-6.jpeg" },
        { name: "Hibachi Fried Rice", src: "/food/food-7.png" },
        { name: "Hibachi Vegetables", src: "/food/food-8.png" },
        { name: "Hibachi Steak", src: "/food/food-9.png" },
        { name: "Hibachi Chicken", src: "/food/food-10.png" },
        { name: "Hibachi Shrimp", src: "/food/food-11.png" },
        { name: "Hibachi Scallops", src: "/food/food-12.png" },
        { name: "Grilled Salmon", src: "/food/food-13.png" },
        { name: "Lobster Tail", src: "/food/food-14.png" },
        { name: "Calamari", src: "/food/food-15.jpg" },
      ].map((food) => (
        <div key={food.name} className="group">

          <div className="h-56 overflow-hidden rounded-3xl">
  <img
    src={food.src}
    alt={food.name}
    className="h-full w-full object-cover transition duration-500 group-hover:scale-110"
  />
</div>
          <h3 className="mt-3 text-center text-base font-bold text-white">
            {food.name}
          </h3>

        </div>
      ))}
    </div>

  </div>
</section>

      <section className="px-5 py-24">
        <div className="mx-auto max-w-7xl">
          <div className="text-center">
            <p className="text-sm font-bold tracking-[0.35em] text-amber-400">
              HOW IT WORKS
            </p>

            <h2 className="mt-4 text-4xl font-black md:text-5xl">
              Four Simple Steps
            </h2>
          </div>

          <div className="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {steps.map((step) => (
              <article
                key={step.number}
                className="rounded-3xl border border-white/10 bg-white/[0.04] p-7"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-amber-400 text-lg font-black text-black">
                  {step.number}
                </div>

                <h3 className="mt-6 text-xl font-black">{step.title}</h3>
                <p className="mt-4 leading-7 text-neutral-400">{step.text}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section id="pricing" className="bg-neutral-900 px-5 py-24">
        <div className="mx-auto max-w-6xl">
          <div className="text-center">
            <p className="text-sm font-bold tracking-[0.35em] text-amber-400">
              SIMPLE PRICING
            </p>

            <h2 className="mt-4 text-4xl font-black md:text-5xl">
              Private Hibachi at Your Location
            </h2>
          </div>

          <div className="mt-12 grid gap-6 md:grid-cols-3">
            <PriceCard
              title="Adults"
              price="$60"
              note="Per adult guest"
              featured
            />

            <PriceCard
              title="Ages 5–13"
              price="$30"
              note="Per child guest"
            />

            <PriceCard
              title="Under 5"
              price="Free"
              note="No guest charge"
            />
          </div>

          <div className="mt-8 rounded-3xl border border-amber-400/30 bg-amber-400/10 p-6 text-center">
            <p className="text-xl font-black">$600 minimum per event</p>

            <p className="mx-auto mt-3 max-w-3xl leading-7 text-neutral-300">
              Each paying guest includes two protein portions. For fewer than
              10 paying guests, each unused minimum guest slot includes two
              additional protein portions.
            </p>

            <p className="mx-auto mt-2 max-w-3xl text-neutral-300">
              Travel is free within 20 miles of San Gabriel. Each additional
              mile is $2.
            </p>
          </div>

          <div className="mt-10 text-center">
            <Link
              href="/booking"
              className="inline-block rounded-full bg-amber-400 px-9 py-4 font-black text-black transition hover:bg-amber-300"
            >
              CALCULATE YOUR PRICE
            </Link>
          </div>
        </div>
      </section>

      <section id="reviews" className="bg-white px-5 py-24 text-neutral-950">
        <div className="mx-auto max-w-7xl">
          <div className="text-center">
            <p className="text-sm font-bold tracking-[0.35em] text-amber-600">
              CUSTOMER EXPERIENCES
            </p>

            <h2 className="mt-4 text-4xl font-black md:text-5xl">
              Celebrations to Remember
            </h2>
          </div>

          <div className="mt-12 grid gap-6 md:grid-cols-3">
            {reviews.map((review) => (
              <article
                key={review.name}
                className="rounded-3xl border border-neutral-200 bg-neutral-50 p-7"
              >
                <p className="text-xl tracking-widest text-amber-500">
                  ★★★★★
                </p>

                <p className="mt-5 leading-7 text-neutral-700">
                  “{review.text}”
                </p>

                <p className="mt-6 font-black">{review.name}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section id="faq" className="px-5 py-24">
        <div className="mx-auto max-w-4xl">
          <div className="text-center">
            <p className="text-sm font-bold tracking-[0.35em] text-amber-400">
              FREQUENTLY ASKED QUESTIONS
            </p>

            <h2 className="mt-4 text-4xl font-black md:text-5xl">
              Before You Book
            </h2>
          </div>

          <div className="mt-12 space-y-4">
            {faqs.map((faq) => (
              <details
                key={faq.question}
                className="group rounded-2xl border border-white/10 bg-white/[0.04] p-5"
              >
                <summary className="cursor-pointer list-none text-lg font-bold">
                  <div className="flex items-center justify-between gap-5">
                    <span>{faq.question}</span>
                    <span className="text-2xl text-amber-400 transition group-open:rotate-45">
                      +
                    </span>
                  </div>
                </summary>

                <p className="mt-4 max-w-3xl leading-7 text-neutral-400">
                  {faq.answer}
                </p>
              </details>
            ))}
          </div>
        </div>
      </section>

      <section className="px-5 pb-24">
        <div className="mx-auto max-w-5xl rounded-[2.5rem] bg-amber-400 p-8 text-center text-black md:p-14">
          <p className="text-sm font-black tracking-[0.35em]">
            YOUR EVENT STARTS HERE
          </p>

          <h2 className="mt-5 text-4xl font-black md:text-5xl">
            Ready for the Hibachi Experience?
          </h2>

          <p className="mx-auto mt-5 max-w-2xl text-lg leading-8">
            Select your date, guest count, proteins, add-ons, allergies, and
            event address. Your estimated total updates automatically.
          </p>

          <Link
            href="/booking"
            className="mt-8 inline-block rounded-full bg-black px-9 py-4 font-black text-white transition hover:bg-neutral-800"
          >
            BOOK YOUR EVENT
          </Link>
        </div>
      </section>

      <footer className="border-t border-white/10 px-5 py-9">
        <div className="mx-auto flex max-w-7xl flex-col gap-5 text-sm text-neutral-500 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="font-black tracking-[0.2em] text-white">
              SONG TEPPANYAKI
            </p>

            <p className="mt-1">
              Authentic Japanese Teppanyaki Brought To Your Home
            </p>
          </div>

          <div className="flex gap-6">
            <a href="#services" className="hover:text-white">
              Services
            </a>
            <a href="#gallery" className="hover:text-white">
              Gallery
            </a>
            <Link href="/booking" className="hover:text-white">
              Booking
            </Link>
          </div>

          <p>© 2026 Song Teppanyaki.</p>
        </div>
      </footer>

      <Link
        href="/booking"
        className="fixed bottom-5 right-5 z-50 rounded-full bg-amber-400 px-6 py-4 font-black text-black shadow-2xl transition hover:scale-105 hover:bg-amber-300"
      >
        BOOK NOW
      </Link>
    </main>
  );
}

function PriceCard({
  title,
  price,
  note,
  featured = false,
}: {
  title: string;
  price: string;
  note: string;
  featured?: boolean;
}) {
  return (
    <div
      className={`rounded-3xl border p-7 text-center ${
        featured
          ? "border-amber-400 bg-amber-400 text-black"
          : "border-white/10 bg-white/[0.04]"
      }`}
    >
      <h3 className="text-xl font-black">{title}</h3>

      <p className="mt-5 text-5xl font-black">{price}</p>

      <p
        className={`mt-3 ${
          featured ? "text-black/70" : "text-neutral-400"
        }`}
      >
        {note}
      </p>
    </div>
  );
}