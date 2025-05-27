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

export default function Quran() {
  const [surahs, setSurahs] = useState<Surah[]>([]);
  const [filteredSurahs, setFilteredSurahs] = useState<Surah[]>([]);
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState("default");

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
      sorted.sort((a, b) => a.englishName.localeCompare(b.englishName));
    } else {
      // both "default" and "reveal" fall back to numeric
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
          onChange={(e) => setSort(e.target.value)}
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
