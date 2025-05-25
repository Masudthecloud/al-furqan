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
    } else if (sort === "reveal") {
      sorted.sort((a, b) => a.number - b.number); // Update when real revelation order is sourced
    } else {
      sorted.sort((a, b) => a.number - b.number);
    }

    setFilteredSurahs(
      sorted.filter(
        (s) =>
          s.englishName.toLowerCase().includes(term) ||
          s.name.includes(term) ||
          s.englishNameTranslation.toLowerCase().includes(term)
      )
    );
  }, [search, sort, surahs]);

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4 text-green-800 dark:text-green-300">
        📖 Surahs of the Quran
      </h1>

      <div className="flex flex-col md:flex-row items-start md:items-center gap-4 mb-6">
        <input
          type="text"
          placeholder="Search Surahs..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="p-2 border rounded dark:bg-gray-800 dark:text-white w-full max-w-sm"
        />

        <select
          value={sort}
          onChange={(e) => setSort(e.target.value)}
          className="p-2 border rounded dark:bg-gray-800 dark:text-white"
        >
          <option value="default">Sort: Default (1–114)</option>
          <option value="alpha">Sort: A → Z</option>
          <option value="reveal">Sort: Revelation Order</option>
        </select>
      </div>

      <ul className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredSurahs.map((surah) => (
          <Link to={`/quran/${surah.number}`} key={surah.number}>
            <li className="p-4 border rounded shadow-sm hover:shadow-md bg-white dark:bg-gray-800 cursor-pointer">
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Surah {surah.englishName}
                  </p>
                  <p className="text-base font-medium text-gray-900 dark:text-white">
                    {surah.englishNameTranslation}
                  </p>
                  <span
                    className={`inline-block mt-1 text-xs font-semibold px-2 py-1 rounded ${
                      surah.revelationType === "Meccan"
                        ? "bg-purple-100 text-purple-700 dark:bg-purple-800 dark:text-purple-200"
                        : "bg-blue-100 text-blue-700 dark:bg-blue-800 dark:text-blue-200"
                    }`}
                  >
                    {surah.revelationType === "Meccan" ? "🕋 Makki" : "🕌 Madani"}
                  </span>
                </div>

                <p className="text-green-700 dark:text-green-300 font-bold text-lg text-right">
                  {surah.name}
                </p>
              </div>
            </li>
          </Link>
        ))}
      </ul>
    </div>
  );
}
