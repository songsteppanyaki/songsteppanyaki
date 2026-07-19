export default function Home() {
  return (
    <main className="min-h-screen bg-black text-white">

      {/* Navigation */}
      <nav className="flex items-center justify-between px-8 py-6">
        <div className="text-2xl font-bold tracking-widest text-yellow-400">
          SONG
        </div>

        <div className="hidden gap-8 text-sm md:flex">
          <a href="#">Home</a>
          <a href="#">Services</a>
          <a href="#">Gallery</a>
          <a href="#">Contact</a>
        </div>
      </nav>


      {/* Hero Section */}
      <section className="flex min-h-[80vh] flex-col items-center justify-center px-6 text-center">

        <p className="mb-5 text-sm tracking-[0.5em] text-yellow-400">
          PRIVATE HIBACHI EXPERIENCE
        </p>


        <h1 className="max-w-5xl text-5xl font-bold leading-tight md:text-8xl">
          SONG
          <br />
          TEPPANYAKI
        </h1>


        <p className="mt-8 max-w-2xl text-lg text-gray-300 md:text-2xl">
          Authentic Japanese Teppanyaki
          <br />
          Brought To Your Home
        </p>


        <button className="mt-10 rounded-full bg-yellow-500 px-10 py-4 text-lg font-semibold text-black transition hover:bg-yellow-400">
          BOOK YOUR EVENT
        </button>

      </section>


      {/* Services Preview */}
      <section className="bg-white px-8 py-20 text-center text-black">

        <p className="text-sm tracking-widest text-yellow-600">
          OUR SERVICES
        </p>


        <h2 className="mt-4 text-4xl font-bold">
          Unforgettable Teppanyaki Moments
        </h2>


        <div className="mx-auto mt-12 grid max-w-5xl gap-8 md:grid-cols-3">

          <div className="rounded-xl border p-8">
            <h3 className="text-xl font-bold">
              Birthday Events
            </h3>
            <p className="mt-4 text-gray-600">
              Celebrate with a private hibachi chef experience.
            </p>
          </div>


          <div className="rounded-xl border p-8">
            <h3 className="text-xl font-bold">
              Corporate Events
            </h3>
            <p className="mt-4 text-gray-600">
              Impress your guests with live Japanese cooking.
            </p>
          </div>


          <div className="rounded-xl border p-8">
            <h3 className="text-xl font-bold">
              Private Parties
            </h3>
            <p className="mt-4 text-gray-600">
              Premium teppanyaki at your location.
            </p>
          </div>

        </div>

      </section>


    </main>
  );
}