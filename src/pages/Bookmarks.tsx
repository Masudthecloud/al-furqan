import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

interface Bookmark {
  surahName: string;
  surahId: number;
  ayahNumber: number;
  arabicText: string;
  translationText?: string;
}

export default function Bookmarks() {
  const [bookmarks, setBookmarks] = useState<Bookmark[]>([]);

  useEffect(() => {
    const saved = localStorage.getItem("bookmarked_ayahs");
    if (saved) setBookmarks(JSON.parse(saved));
  }, []);

  const removeBookmark = (ayah: Bookmark) => {
    const updated = bookmarks.filter(
      (b) => b.ayahNumber !== ayah.ayahNumber || b.surahId !== ayah.surahId
    );
    setBookmarks(updated);
    localStorage.setItem("bookmarked_ayahs", JSON.stringify(updated));
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="mb-8 text-center">
        <h2 className="text-3xl font-bold mb-2 bg-gradient-to-r from-green-600 to-teal-500 bg-clip-text text-transparent">
          🔖 Bookmarked Ayahs
        </h2>
        <p className="text-gray-500 dark:text-gray-400">
          Your saved verses from the Quran
        </p>
      </div>

      {bookmarks.length === 0 ? (
        <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
          <p className="text-gray-500 dark:text-gray-400 mb-4">
            You haven't bookmarked any ayahs yet
          </p>
          <Link
            to="/quran"
            className="inline-block px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
          >
            Explore Quran
          </Link>
        </div>
      ) : (
        <ul className="space-y-4">
          {bookmarks.map((b, index) => (
            <li 
              key={index} 
              className="bg-white dark:bg-gray-800 rounded-xl shadow-sm hover:shadow-md transition-shadow border border-gray-200 dark:border-gray-700 overflow-hidden"
            >
              <div className="p-5">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <p className="font-arabic text-2xl text-gray-800 dark:text-gray-200 mb-2">
                      {b.arabicText}
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-300">
                      <Link 
                        to={`/quran/${b.surahId}`} 
                        className="hover:text-green-600 dark:hover:text-green-400"
                      >
                        Surah {b.surahName} (Ayah {b.ayahNumber})
                      </Link>
                    </p>
                  </div>
                  <button
                    onClick={() => removeBookmark(b)}
                    className="text-red-500 hover:text-red-700 dark:hover:text-red-400 transition-colors"
                  >
                    Remove
                  </button>
                </div>
                
                {b.translationText && (
                  <div className="mt-3 pt-3 border-t border-gray-100 dark:border-gray-700">
                    <p className="text-gray-600 dark:text-gray-300 text-sm">
                      {b.translationText}
                    </p>
                  </div>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}