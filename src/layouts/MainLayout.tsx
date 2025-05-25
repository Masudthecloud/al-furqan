import { useTheme } from "../context/ThemeContext";
import { Link } from "react-router-dom";


export default function MainLayout({ children }: { children: React.ReactNode }) {
  const { darkMode, toggleDarkMode } = useTheme();

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 text-gray-900 dark:text-white">
      <header className="flex justify-between items-center p-4 shadow-md bg-white dark:bg-gray-800">
        <Link to="/" className="text-xl font-bold hover:underline text-green-600 dark:text-green-400">
  Al Furqan
</Link>

        <button
          onClick={toggleDarkMode}
          className="bg-gray-200 dark:bg-gray-700 text-sm px-3 py-1 rounded"
        >
          {darkMode ? "🌞 Light" : "🌙 Dark"}
        </button>
      </header>
      <main className="p-4">{children}</main>
    </div>
  );
}
