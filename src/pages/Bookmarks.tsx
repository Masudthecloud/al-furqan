import { useState, useEffect, type JSX } from "react";
import { Trash2 } from "lucide-react";
import { useNavigate } from "react-router-dom";

// Simplified Surah metadata lookup (expand to all 114 surahs)
const surahInfo: Record<number, { name: string; englishName: string }> = {
  1: { name: "الفاتحة", englishName: "Al-Fatihah" },
  2: { name: "البقرة", englishName: "Al-Baqarah" },
  // ... add all surahs
  112: { name: "الإخلاص", englishName: "Al-Ikhlas" },
  113: { name: "الفلق", englishName: "Al-Falaq" },
  114: { name: "الناس", englishName: "An-Nas" },
};

interface Bookmark {
  surahNumber: number;
  ayahNumber: number;
  dateAdded: string;
  surahName?: string;
  surahEnglishName?: string;
  arabicText?: string;
  translationText?: string;
}

export default function Bookmarks(): JSX.Element {
  const [bookmarks, setBookmarks] = useState<Bookmark[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const loadBookmarks = async () => {
      const raw = localStorage.getItem("bookmarks");
      let stored: Bookmark[] = [];
      
      if (raw) {
        try {
          const parsed = JSON.parse(raw);
          
          // Handle both old format (array of numbers) and new format (array of objects)
          if (Array.isArray(parsed)) {
            if (typeof parsed[0] === 'number') {
              // Convert old format to new format
              stored = parsed.map(id => ({
                surahNumber: Math.floor(id / 1000),
                ayahNumber: id % 1000,
                dateAdded: new Date().toISOString()
              }));
            } else {
              // Already in new format
              stored = parsed.map((item: Bookmark) => ({
                surahNumber: item.surahNumber,
                ayahNumber: item.ayahNumber,
                dateAdded: item.dateAdded || new Date().toISOString()
              }));
            }
          }
        } catch (e) {
          console.error("Error parsing bookmarks:", e);
        }
      }

      if (stored.length === 0) {
        setLoading(false);
        return;
      }

      // Fetch details for each bookmark
      const enrichedBookmarks = await Promise.all(
        stored.map(async (bookmark) => {
          const info = surahInfo[bookmark.surahNumber] || { 
            name: `Surah ${bookmark.surahNumber}`, 
            englishName: `Surah ${bookmark.surahNumber}` 
          };

          try {
            // Fetch Arabic text
            const arabicResp = await fetch(
              `https://api.alquran.cloud/v1/ayah/${bookmark.surahNumber}:${bookmark.ayahNumber}`
            );
            const arabicJson = await arabicResp.json();
            
            // Fetch translation
            const transResp = await fetch(
              `https://api.alquran.cloud/v1/ayah/${bookmark.surahNumber}:${bookmark.ayahNumber}/en.asad`
            );
            const transJson = await transResp.json();

            return {
              ...bookmark,
              surahName: info.name,
              surahEnglishName: info.englishName,
              arabicText: arabicJson.data?.text,
              translationText: transJson.data?.text
            };
          } catch (error) {
            console.error("Failed to fetch ayah details:", error);
            return {
              ...bookmark,
              surahName: info.name,
              surahEnglishName: info.englishName,
              arabicText: "",
              translationText: ""
            };
          }
        })
      );

      setBookmarks(enrichedBookmarks);
      setLoading(false);
    };

    loadBookmarks();
  }, []);

  const removeBookmark = (surahNumber: number, ayahNumber: number) => {
    const updated = bookmarks.filter(
      b => !(b.surahNumber === surahNumber && b.ayahNumber === ayahNumber)
    );
    
    setBookmarks(updated);
    
    // Update localStorage with minimal data
    const minimal = updated.map(b => ({
      surahNumber: b.surahNumber,
      ayahNumber: b.ayahNumber,
      dateAdded: b.dateAdded
    }));
    
    localStorage.setItem("bookmarks", JSON.stringify(minimal));
  };

  const navigateToAyah = (surahNumber: number, ayahNumber: number) => {
    navigate(`/surah/${surahNumber}#ayah-${ayahNumber}`);
  };

  if (loading) {
    return <p className="text-center py-8 text-gray-600 dark:text-gray-300">Loading bookmarks...</p>;
  }

  if (!bookmarks.length) {
    return <p className="text-center py-8 text-gray-600 dark:text-gray-300">No bookmarks yet.</p>;
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6 text-gray-900 dark:text-white">Bookmarked Ayahs</h1>
      <ul className="space-y-6">
        {bookmarks.map((b) => (
          <li 
            key={`${b.surahNumber}-${b.ayahNumber}-${b.dateAdded}`} 
            className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow border border-gray-200 dark:border-gray-700"
          >
            <div className="flex justify-between items-start mb-4">
              <div 
                className="cursor-pointer hover:underline"
                onClick={() => navigateToAyah(b.surahNumber, b.ayahNumber)}
              >
                <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
                  {b.surahEnglishName} ({b.surahName})
                </h2>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Ayah {b.ayahNumber} • Saved {new Date(b.dateAdded).toLocaleDateString()}
                </p>
              </div>
              <button 
                onClick={() => removeBookmark(b.surahNumber, b.ayahNumber)} 
                className="text-red-600 dark:text-red-400 hover:underline" 
                title="Remove bookmark"
              >
                <Trash2 size={20} />
              </button>
            </div>
            <div className="prose prose-lg dark:prose-invert max-w-none">
              <p className="text-right text-2xl leading-snug font-arabic">{b.arabicText}</p>
              <p className="mt-4 text-gray-800 dark:text-gray-200">{b.translationText}</p>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}