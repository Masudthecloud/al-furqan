import { Link } from "react-router-dom";

export default function Home() {
  return (
    <div className="relative min-h-screen">
      {/* Pattern overlay */}
      <div className="absolute inset-0 bg-islamic-pattern opacity-10 z-0" />

      {/* Content wrapper */}
      <div className="relative z-10 flex flex-col items-center justify-center text-center px-4 py-16 min-h-screen bg-white dark:bg-gray-900 text-gray-800 dark:text-white">
        <h1 className="text-3xl md:text-4xl font-bold mb-2 text-green-700 dark:text-green-300">
          🌙 Welcome to Al Furqan
        </h1>

        <p className="text-sm md:text-base text-gray-600 dark:text-gray-400 mb-6 max-w-xl">
          Your gateway to the Quran, prayer times, and more — all in one spiritually enriching experience.
        </p>

        <blockquote className="bg-gray-50 dark:bg-gray-800 p-4 rounded shadow max-w-xl mb-8 border-l-4 border-green-500 text-sm md:text-base italic">
          “The best among you are those who learn the Quran and teach it.” <br />
          <span className="block mt-2 text-right text-xs">– Prophet Muhammad ﷺ (Bukhari)</span>
        </blockquote>

    <div className="flex flex-wrap justify-center gap-4 mt-6">
      <Link to="/quran">
        <button className="bg-green-600 text-white px-4 py-2 rounded shadow hover:bg-green-700">
           Read Quran
        </button>
      </Link>

      <Link to="/mushaf/1">
        <button className="bg-purple-600 text-white px-4 py-2 rounded shadow hover:bg-purple-700">
           Mushaf Reader
        </button>
      </Link>

      <Link to="/prayer">
        <button className="bg-blue-600 text-white px-4 py-2 rounded shadow hover:bg-blue-700">
           Prayer Times
        </button>
      </Link>

      <Link to="/bookmarks">
        <button className="bg-amber-600 text-white px-4 py-2 rounded shadow hover:bg-amber-700">
           My Bookmarks
        </button>
      </Link>
    </div>

      </div>
    </div>
  );
}
