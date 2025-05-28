import { useEffect, useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
// JSON from https://raw.githubusercontent.com/wafaaelmaandy/Hisn-Muslim-Json/master/husn_en.json
import duaData from "../data/hisnulMuslim.json";

interface Dua {
  id: string;
  arabic: string;
  translation: string;
  audioUrl?: string | null;
}

interface Category {
  name: string;
  duas: Dua[];
}

export default function HisnulMuslim() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [expanded, setExpanded] = useState<Set<string>>(new Set());

  useEffect(() => {
    const rawCats = (duaData as any).English;
    if (Array.isArray(rawCats)) {
      const mapped: Category[] = rawCats.map((cat: any) => ({
        name: cat.TITLE,
        duas: Array.isArray(cat.TEXT)
          ? cat.TEXT.map((d: any) => ({
              id: d.ID.toString(),
              arabic: d.ARABIC_TEXT,
              translation: d.TRANSLATED_TEXT,
              audioUrl: d.AUDIO || null,
            }))
          : [],
      }));
      setCategories(mapped);
    }
  }, []);

  const toggleCategory = (name: string) => {
    setExpanded(prev => {
      const nxt = new Set(prev);
      if (nxt.has(name)) nxt.delete(name);
      else nxt.add(name);
      return nxt;
    });
  };

  return (
    <div className="p-4 max-w-4xl mx-auto bg-white dark:bg-gray-900 min-h-[calc(100vh-80px)]">
      <h1 className="text-3xl font-bold mb-6 text-gray-800 dark:text-gray-100">
        Fortress of the Muslim (Hisnul Muslim)
      </h1>

      {categories.length ? (
        <div className="space-y-4">
          {categories.map((cat) => {
            const isOpen = expanded.has(cat.name);
            return (
              <div
                key={cat.name}
                className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden"
              >
                <button
                  onClick={() => toggleCategory(cat.name)}
                  className="w-full flex items-center justify-between px-4 py-2 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition"
                >
                  <span className="text-lg font-medium text-gray-800 dark:text-gray-100">
                    {cat.name}
                  </span>
                  {isOpen ? (
                    <ChevronUp className="text-gray-600 dark:text-gray-300" />
                  ) : (
                    <ChevronDown className="text-gray-600 dark:text-gray-300" />
                  )}
                </button>
                {isOpen && (
                  <ul className="divide-y divide-gray-200 dark:divide-gray-700">
                    {cat.duas.map((dua) => (
                      <li
                        key={dua.id}
                        className="p-4 bg-gray-50 dark:bg-gray-800"
                      >
                        <p className="font-arabic text-xl mb-2 leading-relaxed text-gray-900 dark:text-gray-100">
                          {dua.arabic}
                        </p>
                        <p className="text-gray-600 dark:text-gray-300 mb-2">
                          {dua.translation}
                        </p>
                        {dua.audioUrl && (
                          <audio
                            src={dua.audioUrl}
                            controls
                            className="w-full mt-2"
                          />
                        )}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            );
          })}
        </div>
      ) : (
        <p className="text-center text-gray-500 dark:text-gray-400">
          No supplications found.
        </p>
      )}
    </div>
  );
}
