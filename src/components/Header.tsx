import { Link } from "react-router-dom";

export default function Header() {
  return (
    <header className="bg-white shadow-md border-b border-gray-200 px-6 py-4">
      <div className="max-w-5xl mx-auto flex items-center justify-between">
        <Link to="/" className="text-green-700 text-2xl font-bold">Al Furqan</Link>
        <nav className="flex gap-6 text-lg">
          <Link to="/quran" className="text-gray-700 hover:text-green-700 transition">Quran</Link>
          <Link to="/prayer" className="text-gray-700 hover:text-green-700 transition">Prayer Times</Link>
        </nav>
      </div>
    </header>
  );
}
