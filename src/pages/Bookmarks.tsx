import { useEffect, useState } from "react";

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
      (b) =>
        b.ayahNumber !== ayah.ayahNumber ||
        b.surahId !== ayah.surahId
    );
    setBookmarks(updated);
    localStorage.setItem("bookmarked_ayahs", JSON.stringify(updated));
  };

  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">🔖 Bookmarked Ayahs</h2>
      {bookmarks.length === 0 && <p>No bookmarks yet.</p>}
      <ul className="space-y-6">
        {bookmarks.map((b, index) => (
          <li key={index} className="p-4 border rounded bg-white dark:bg-gray-800">
            <p className="font-arabic text-green-700 text-xl mb-2">{b.arabicText}</p>
            <p className="text-sm text-gray-600 dark:text-gray-300">
              Surah {b.surahName} (#{b.surahId}), Ayah {b.ayahNumber}
            </p>
            {b.translationText && (
              <p className="text-sm mt-1">{b.translationText}</p>
            )}
            <button
              className="mt-2 text-sm text-red-500 underline"
              onClick={() => removeBookmark(b)}
            >
              Remove Bookmark
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
