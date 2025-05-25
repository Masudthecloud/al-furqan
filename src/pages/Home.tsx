import { Link } from "react-router-dom";

export default function Home() {
  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 text-gray-900 dark:text-white flex flex-col justify-center items-center px-4">
      <div className="text-center max-w-md w-full">
        <h1 className="text-3xl sm:text-4xl font-bold text-green-700 dark:text-green-400 mb-3">
          🌙 Welcome to <span className="text-green-600 dark:text-green-300">Al Furqan</span>
        </h1>
        <p className="text-gray-600 dark:text-gray-300 text-sm mb-8">
          Your gateway to the Quran, prayer times, recitations, and spiritual connection.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Link to="/quran" className="bg-green-600 hover:bg-green-700 text-white py-3 px-4 rounded shadow text-sm text-center">
            📖 Read Quran
          </Link>
          <Link to="/prayer" className="bg-blue-600 hover:bg-blue-700 text-white py-3 px-4 rounded shadow text-sm text-center">
            🕋 Prayer Times
          </Link>
          <Link to="/bookmarks" className="bg-yellow-600 hover:bg-yellow-700 text-white py-3 px-4 rounded shadow text-sm text-center">
            🔖 My Bookmarks
          </Link>
        </div>
      </div>
    </div>
  );
}
