export default function Home() {
  return (
    <main className="min-h-screen bg-black text-white">
      <section className="flex min-h-screen flex-col items-center justify-center px-6 text-center">
        <h1 className="text-5xl font-bold tracking-wide md:text-7xl">
          SONG TEPPANYAKI
        </h1>

        <p className="mt-6 max-w-2xl text-lg text-gray-300 md:text-2xl">
          Private Teppanyaki Experience
          <br />
          Brought To Your Home
        </p>

        <button className="mt-10 rounded-full bg-yellow-500 px-8 py-4 text-lg font-semibold text-black transition hover:bg-yellow-400">
          BOOK NOW
        </button>
      </section>

      <section className="bg-white px-6 py-20 text-center text-black">
        <h2 className="text-4xl font-bold">
          Authentic Japanese Teppanyaki
        </h2>

        <p className="mx-auto mt-6 max-w-3xl text-gray-600">
          Professional private hibachi chef experience for birthdays,
          weddings, corporate events, and unforgettable celebrations.
        </p>
      </section>
    </main>
  );
}