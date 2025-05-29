import { Link } from "react-router-dom";
// import { MapPin } from "lucide-react"; #UNCOMMENT THIS TO ACTIVATE QIBLA

export default function Home() {
  // Base64 SVG pattern for subtle background
  const bgPattern = `url("data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI1MCIgaGVpZ2h0PSI1MCIgdmlld0JveD0iMCAwIDUwIDUwIj48cGF0aCBkPSJNMjUgMTVMMTUgMjVMMjUgMzVMMzUgMjVMMjUgMTVaIiBzdHJva2U9IiMwMDAiIHN0cm9rZS13aWR0aD0iMSIgZmlsbD0ibm9uZSIgLz48L3N2Zz4=")`;

  return (
    <div className="relative min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 overflow-hidden">
      {/* Subtle background pattern */}
      <div
        className="absolute inset-0 opacity-[0.03] dark:opacity-[0.02]"
        style={{ backgroundImage: bgPattern }}
      />

      <div className="relative z-10 w-full max-w-4xl mx-auto px-5 py-12 sm:py-16 lg:py-20">
        {/* Header */}
        <div className="mb-12 text-center">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-4 text-gray-800 dark:text-white">
            <span className="text-green-600 dark:text-green-400">Al</span> Furqan
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            Your spiritual companion for Quran, Prayer, and Reflection
          </p>
        </div>

        {/* Bismillah */}
        <div className="relative max-w-2xl mx-auto mb-16">
          <div className="relative flex items-center justify-center">
            <div className="absolute left-0 right-0 top-1/2 h-px bg-gray-200 dark:bg-gray-700" />
            <div className="relative bg-white dark:bg-gray-800 px-6 py-4 rounded-full shadow-sm border border-gray-100 dark:border-gray-700 hover:shadow-md transition-shadow">
              <p className="font-arabic text-3xl text-gray-800 dark:text-gray-200 leading-loose">
                بِسْمِ ٱللَّٰهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ
              </p>
            </div>
          </div>
          <div className="text-center mt-6">
            <p className="italic text-gray-700 dark:text-gray-400">
              "The best among you are those who learn the Quran and teach it."
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-500 mt-2">
              - Prophet Muhammad ﷺ (Bukhari)
            </p>
          </div>
        </div>

        {/* Feature Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-5 max-w-4xl mx-auto">
          {/* Quran */}
          <Link
            to="/quran"
            className="group bg-white dark:bg-gray-800 rounded-lg shadow hover:shadow-md border border-gray-200 dark:border-gray-700 p-8 transition-all duration-200 hover:border-green-300 dark:hover:border-green-700"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6 mb-5 text-green-600 dark:text-green-400 mx-auto"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
              />
            </svg>
            <h3 className="text-lg font-medium text-gray-800 dark:text-white mb-2 text-center">
              Holy Quran
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 text-center">
              Read with translations
            </p>
          </Link>

          {/* Prayer Times */}
          <Link
            to="/prayer"
            className="group bg-white dark:bg-gray-800 rounded-lg shadow hover:shadow-md border border-gray-200 dark:border-gray-700 p-8 transition-all duration-200 hover:border-blue-300 dark:hover:border-blue-700"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6 mb-5 text-blue-600 dark:text-blue-400 mx-auto"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
              />
            </svg>
            <h3 className="text-lg font-medium text-gray-800 dark:text-white mb-2 text-center">
              Prayer Times
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 text-center">
              Accurate salah times
            </p>
          </Link>

          {/* Qibla */}
          {/* <Link
            to="/qibla"
            className="group bg-white dark:bg-gray-800 rounded-lg shadow hover:shadow-md border border-gray-200 dark:border-gray-700 p-8 transition-all duration-200 hover:border-pink-300 dark:hover:border-pink-700"
          >
            <MapPin className="h-6 w-6 mb-5 text-pink-600 dark:text-pink-400 mx-auto" />
            <h3 className="text-lg font-medium text-gray-800 dark:text-white mb-2 text-center">
              Qibla
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 text-center">
              Find Qibla direction
            </p>
          </Link> */}

          {/* Hisnul Muslim */}
          <Link
            to="/hisnul"
            className="group bg-white dark:bg-gray-800 rounded-lg shadow hover:shadow-md border border-gray-200 dark:border-gray-700 p-8 transition-all duration-200 hover:border-purple-300 dark:hover:border-purple-700"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6 mb-5 text-purple-600 dark:text-purple-400 mx-auto"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <h3 className="text-lg font-medium text-gray-800 dark:text-white mb-2 text-center">
              Hisnul Muslim
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 text-center">
              Daily du'as and adhkār
            </p>
          </Link>

          {/* Bookmarks */}
          <Link
            to="/bookmarks"
            className="group bg-white dark:bg-gray-800 rounded-lg shadow hover:shadow-md border border-gray-200 dark:border-gray-700 p-8 transition-all duration-200 hover:border-amber-300 dark:hover:border-amber-700"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6 mb-5 text-amber-600 dark:text-amber-400 mx-auto"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z"
              />
            </svg>
            <h3 className="text-lg font-medium text-gray-800 dark:text-white mb-2 text-center">
              Bookmarks
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 text-center">
              Save your favorite verses
            </p>
          </Link>
        </div>
      </div>
    </div>
  );
}