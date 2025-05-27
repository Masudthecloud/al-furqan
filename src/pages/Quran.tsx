import { useEffect, useState } from "react";
import { fetchSurahList } from "../services/quranService";
import { Link } from "react-router-dom";

interface Surah {
  number: number;
  englishName: string;
  name: string;
  englishNameTranslation: string;
  revelationType: "Meccan" | "Medinan";
}

// Chronological revelation order (Ibn Abbas / al-Zanjani traditional sequence)
const revelationOrder: number[] = [
  96, 68, 73, 74, 1, 111, 81, 87, 92, 89,
  93, 94, 103, 100, 108, 102, 107, 109, 105, 113,
  114, 112, 53, 80, 97, 91, 85, 95, 106, 101,
  75, 104, 77, 50, 90, 86, 54, 38, 7, 72,
  36, 25, 35, 19, 20, 56, 26, 27, 28, 17,
  10, 11, 12, 15, 6, 37, 31, 34, 39, 40,
  41, 42, 43, 44, 45, 46, 51, 88, 18, 16,
  71, 14, 21, 23, 32, 52, 67, 69, 70, 78,
  79, 82, 84, 30, 29, 83, 2, 8, 3, 33,
  60, 4, 99, 57, 47, 13, 55, 76, 65, 98,
  59, 24, 22, 63, 58, 49, 66, 64, 61, 62,
  48, 5, 9, 110
];

export default function Quran() {
  const [surahs, setSurahs] = useState<Surah[]>([]);
  const [filteredSurahs, setFilteredSurahs] = useState<Surah[]>([]);
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState<"default" | "alpha" | "reveal">("default");

  useEffect(() => {
    fetchSurahList()
      .then((data) => {
        setSurahs(data);
        setFilteredSurahs(data);
      })
      .catch(() => console.error("Failed to load surahs"));
  }, []);

  useEffect(() => {
    const term = search.toLowerCase();
    const sorted = [...surahs];

    if (sort === "alpha") {
      // Alphabetical by English name
      sorted.sort((a, b) => a.englishName.localeCompare(b.englishName));
    } else if (sort === "reveal") {
      // Chronological revelation order
      sorted.sort((a, b) => {
        const ia = revelationOrder.indexOf(a.number);
        const ib = revelationOrder.indexOf(b.number);
        const safeA = ia === -1 ? Number.POSITIVE_INFINITY : ia;
        const safeB = ib === -1 ? Number.POSITIVE_INFINITY : ib;
        return safeA - safeB;
      });
    } else {
      // Default: numeric by surah number
      sorted.sort((a, b) => a.number - b.number);
    }

    setFilteredSurahs(
      sorted.filter(
        (s) =>
          s.englishName.toLowerCase().includes(term) ||
          s.name.toLowerCase().includes(term) ||
          s.englishNameTranslation.toLowerCase().includes(term)
      )
    );
  }, [search, sort, surahs]);

  return (
    <div className="animate-fadeIn">
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold mb-2 bg-gradient-to-r from-green-600 to-teal-500 bg-clip-text text-transparent">
          Surahs of the Quran
        </h1>
        <p className="text-gray-500 dark:text-gray-400">
          Select a surah to begin reading
        </p>
      </div>

      {/* Search & Sort */}
      <div className="flex flex-col md:flex-row gap-4 mb-8 bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm sticky top-16 z-10">
        {/* Search Input */}
        <div className="flex-1">
          <input
            type="text"
            placeholder="Search Surahs..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="
              w-full p-3
              bg-white dark:bg-gray-800
              text-gray-900 dark:text-gray-100
              placeholder-gray-500 dark:placeholder-gray-400
              border border-gray-200 dark:border-gray-700
              rounded-lg
              focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent
            "
          />
        </div>

        {/* Sort Dropdown */}
        <select
          value={sort}
          onChange={(e) => setSort(e.target.value as any)}
          className="
            p-3
            bg-white dark:bg-gray-800
            text-gray-900 dark:text-gray-100
            border border-gray-200 dark:border-gray-700
            rounded-lg
            focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent
          "
        >
          <option value="default">Default Order</option>
          <option value="alpha">Alphabetical</option>
          <option value="reveal">Revelation Order</option>
        </select>
      </div>

      {/* Surah Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredSurahs.map((surah) => (
          <Link
            to={`/surah/${surah.number}`}
            key={surah.number}
            className="card hover:shadow-lg transition-all"
          >
            <div className="p-5">
              <div className="flex justify-between items-start">
                <div>
                  <div
                    className="
                      w-10 h-10 flex items-center justify-center
                      rounded-full
                      bg-green-100 dark:bg-green-900/30
                      text-green-600 dark:text-green-400
                      font-bold mb-2
                    "
                  >
                    {surah.number}
                  </div>
                  <h3 className="text-lg font-semibold text-gray-800 dark:text-white">
                    {surah.englishName}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-300">
                    {surah.englishNameTranslation}
                  </p>
                </div>
                <span className="text-2xl font-arabic text-gray-800 dark:text-gray-200">
                  {surah.name}
                </span>
              </div>
              <div className="mt-3">
                <span
                  className={`
                    text-xs font-medium px-2 py-1 rounded-full
                    ${
                      surah.revelationType === "Meccan"
                        ? "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300"
                        : "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300"
                    }
                  `}
                >
                  {surah.revelationType === "Meccan" ? "Makki" : "Madani"}
                </span>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
