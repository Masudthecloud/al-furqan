// src/pages/Bookmarks.tsx

import { useState, useEffect, type JSX } from "react";
import { Trash2 } from "lucide-react";
import { useNavigate } from "react-router-dom";

// Simplified Surah metadata lookup
const surahInfo: Record<
  number,
  { name: string; englishName: string }
> = {
  1: { name: "الفاتحة", englishName: "Al-Fatihah" },
  2: { name: "البقرة", englishName: "Al-Baqarah" },
  3: { name: "آل عمران", englishName: "Al-`Imran" },
  4: { name: "النساء", englishName: "An-Nisa’" },
  5: { name: "المائدة", englishName: "Al-Ma’idah" },
  6: { name: "الأنعام", englishName: "Al-An`am" },
  7: { name: "الأعراف", englishName: "Al-A`raf" },
  8: { name: "الأنفال", englishName: "Al-Anfal" },
  9: { name: "التوبة", englishName: "At-Tawbah" },
  10: { name: "يونس", englishName: "Yunus" },
  11: { name: "هود", englishName: "Hud" },
  12: { name: "يوسف", englishName: "Yusuf" },
  13: { name: "الرعد", englishName: "Ar-Ra`d" },
  14: { name: "إبراهيم", englishName: "Ibrahim" },
  15: { name: "الحجر", englishName: "Al-Hijr" },
  16: { name: "النحل", englishName: "An-Nahl" },
  17: { name: "الإسراء", englishName: "Al-Isra’" },
  18: { name: "الكهف", englishName: "Al-Kahf" },
  19: { name: "مريم", englishName: "Maryam" },
  20: { name: "طه", englishName: "Ta Ha" },
  21: { name: "الأنبياء", englishName: "Al-Anbiya’" },
  22: { name: "الحج", englishName: "Al-Hajj" },
  23: { name: "المؤمنون", englishName: "Al-Mu’minun" },
  24: { name: "النور", englishName: "An-Nur" },
  25: { name: "الفرقان", englishName: "Al-Furqan" },
  26: { name: "الشعراء", englishName: "Ash-Shu‘ara’" },
  27: { name: "النمل", englishName: "An-Naml" },
  28: { name: "القصص", englishName: "Al-Qasas" },
  29: { name: "العنكبوت", englishName: "Al-‘Ankabut" },
  30: { name: "الروم", englishName: "Ar-Rum" },
  31: { name: "لقمان", englishName: "Luqman" },
  32: { name: "السجدة", englishName: "As-Sajdah" },
  33: { name: "الأحزاب", englishName: "Al-Ahzab" },
  34: { name: "سبأ", englishName: "Saba’" },
  35: { name: "فاطر", englishName: "Fatir" },
  36: { name: "يس", englishName: "Ya Sin" },
  37: { name: "الصافات", englishName: "As-Saffat" },
  38: { name: "ص", englishName: "Sad" },
  39: { name: "الزمر", englishName: "Az-Zumar" },
  40: { name: "غافر", englishName: "Ghafir" },
  41: { name: "فصلت", englishName: "Fussilat" },
  42: { name: "الشورى", englishName: "Ash-Shura" },
  43: { name: "الزخرف", englishName: "Az-Zukhruf" },
  44: { name: "الدخان", englishName: "Ad-Dukhan" },
  45: { name: "الجاثية", englishName: "Al-Jathiyah" },
  46: { name: "الأحقاف", englishName: "Al-Ahqaf" },
  47: { name: "محمد", englishName: "Muhammad" },
  48: { name: "الفتح", englishName: "Al-Fath" },
  49: { name: "الحجرات", englishName: "Al-Hujurat" },
  50: { name: "ق", englishName: "Qaf" },
  51: { name: "الذاريات", englishName: "Adh-Dhariyat" },
  52: { name: "الطور", englishName: "At-Tur" },
  53: { name: "النجم", englishName: "An-Najm" },
  54: { name: "القمر", englishName: "Al-Qamar" },
  55: { name: "الرحمن", englishName: "Ar-Rahman" },
  56: { name: "الواقعة", englishName: "Al-Waqi‘ah" },
  57: { name: "الحديد", englishName: "Al-Hadid" },
  58: { name: "المجادلة", englishName: "Al-Mujadila" },
  59: { name: "الحشر", englishName: "Al-Hashr" },
  60: { name: "الممتحنة", englishName: "Al-Mumtahanah" },
  61: { name: "الصف", englishName: "As-Saff" },
  62: { name: "الجمعة", englishName: "Al-Jumu‘ah" },
  63: { name: "المنافقون", englishName: "Al-Munafiqun" },
  64: { name: "التغابن", englishName: "At-Taghabun" },
  65: { name: "الطلاق", englishName: "At-Talaq" },
  66: { name: "التحريم", englishName: "At-Tahrim" },
  67: { name: "الملك", englishName: "Al-Mulk" },
  68: { name: "القلم", englishName: "Al-Qalam" },
  69: { name: "الحاقة", englishName: "Al-Haqqah" },
  70: { name: "المعارج", englishName: "Al-Ma‘arij" },
  71: { name: "نوح", englishName: "Nuh" },
  72: { name: "الجن", englishName: "Al-Jinn" },
  73: { name: "المزمل", englishName: "Al-Muzzammil" },
  74: { name: "المدثر", englishName: "Al-Muddaththir" },
  75: { name: "القيامة", englishName: "Al-Qiyamah" },
  76: { name: "الإنسان", englishName: "Al-Insan" },
  77: { name: "المرسلات", englishName: "Al-Mursalat" },
  78: { name: "النبإ", englishName: "An-Naba’" },
  79: { name: "النازعات", englishName: "An-Nazi‘at" },
  80: { name: "عبس", englishName: "'Abasa" },
  81: { name: "التكوير", englishName: "At-Takwir" },
  82: { name: "الإنفطار", englishName: "Al-Infitar" },
  83: { name: "المطففين", englishName: "Al-Mutaffifin" },
  84: { name: "الانشقاق", englishName: "Al-Inshiqaq" },
  85: { name: "البروج", englishName: "Al-Buruj" },
  86: { name: "الطارق", englishName: "At-Tariq" },
  87: { name: "الأعلى", englishName: "Al-Ala" },
  88: { name: "الغاشية", englishName: "Al-Ghashiyah" },
  89: { name: "الفجر", englishName: "Al-Fajr" },
  90: { name: "البلد", englishName: "Al-Balad" },
  91: { name: "الشمس", englishName: "Ash-Shams" },
  92: { name: "الليل", englishName: "Al-Layl" },
  93: { name: "الضحى", englishName: "Ad-Duha" },
  94: { name: "الشرح", englishName: "Ash-Sharh" },
  95: { name: "التين", englishName: "At-Tin" },
  96: { name: "العلق", englishName: "Al-Alaq" },
  97: { name: "القدر", englishName: "Al-Qadr" },
  98: { name: "البينة", englishName: "Al-Bayyinah" },
  99: { name: "الزلزلة", englishName: "Az-Zalzalah" },
  100: { name: "العاديات", englishName: "Al-Adiyat" },
  101: { name: "القارعة", englishName: "Al-Qari’ah" },
  102: { name: "التكاثر", englishName: "At-Takathur" },
  103: { name: "العصر", englishName: "Al-Asr" },
  104: { name: "الهمزة", englishName: "Al-Humazah" },
  105: { name: "الفيل", englishName: "Al-Fil" },
  106: { name: "قريش", englishName: "Quraysh" },
  107: { name: "الماعون", englishName: "Al-Ma’un" },
  108: { name: "الكوثر", englishName: "Al-Kawthar" },
  109: { name: "الكافرون", englishName: "Al-Kafirun" },
  110: { name: "النصر", englishName: "An-Nasr" },
  111: { name: "المسد", englishName: "Al-Masad" },
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
      // ← CHANGED: read from “quranBookmarks” to match SurahDetail.tsx
      const raw = localStorage.getItem("quranBookmarks");
      let stored: Bookmark[] = [];

      if (raw) {
        try {
          const parsed = JSON.parse(raw);

          // SurahDetail stored an array of { surah: number, ayah: number } objects.
          // We need to convert that into our Bookmark shape { surahNumber, ayahNumber, dateAdded, … }.
          if (Array.isArray(parsed) && parsed.length > 0) {
            // If the array’s items are objects with “surah” and “ayah”:
            if (typeof parsed[0] === "object" && parsed[0] !== null) {
              // Example parsed[0] = { surah: 2, ayah: 23 }
              stored = (parsed as Array<{ surah: number; ayah: number }>).map(
                (item) => ({
                  surahNumber: item.surah,
                  ayahNumber: item.ayah,
                  dateAdded: new Date().toISOString(), // You can overwrite this or keep a dummy date
                })
              );
            }
          }
        } catch (e) {
          console.error("Error parsing quranBookmarks:", e);
        }
      }

      // If no stored bookmarks, we're done loading:
      if (stored.length === 0) {
        setLoading(false);
        return;
      }

      // Now “enrich” each bookmark by fetching Arabic + translation
      const enrichedBookmarks = await Promise.all(
        stored.map(async (bookmark) => {
          const info =
            surahInfo[bookmark.surahNumber] || {
              name: `Surah ${bookmark.surahNumber}`,
              englishName: `Surah ${bookmark.surahNumber}`,
            };

          try {
            // 1) Fetch Arabic text for this single ayah
            const arabicResp = await fetch(
              `https://api.alquran.cloud/v1/ayah/${bookmark.surahNumber}:${bookmark.ayahNumber}`
            );
            const arabicJson = await arabicResp.json();

            // 2) Fetch English translation (e.g., Asad) for this single ayah
            const transResp = await fetch(
              `https://api.alquran.cloud/v1/ayah/${bookmark.surahNumber}:${bookmark.ayahNumber}/en.asad`
            );
            const transJson = await transResp.json();

            return {
              ...bookmark,
              surahName: info.name,
              surahEnglishName: info.englishName,
              arabicText: arabicJson.data?.text || "",
              translationText: transJson.data?.text || "",
            };
          } catch (error) {
            console.error("Failed to fetch ayah details:", error);
            return {
              ...bookmark,
              surahName: info.name,
              surahEnglishName: info.englishName,
              arabicText: "",
              translationText: "",
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
    // Remove from state
    const updated = bookmarks.filter(
      (b) => !(b.surahNumber === surahNumber && b.ayahNumber === ayahNumber)
    );
    setBookmarks(updated);

    // Also update localStorage. We only need to store minimal shape { surah, ayah } now.
    const minimal = updated.map((b) => ({
      surah: b.surahNumber,
      ayah: b.ayahNumber,
    }));
    localStorage.setItem("quranBookmarks", JSON.stringify(minimal));
  };

  const navigateToAyah = (surahNumber: number, ayahNumber: number) => {
    // Navigate to /surah/:surahNumber and scroll to #ayah-<ayahNumber>
    navigate(`/surah/${surahNumber}#ayah-${ayahNumber}`);
  };

  if (loading) {
    return (
      <p className="text-center py-8 text-gray-600 dark:text-gray-300">
        Loading bookmarks...
      </p>
    );
  }

  if (!bookmarks.length) {
    return (
      <p className="text-center py-8 text-gray-600 dark:text-gray-300">
        No bookmarks yet.
      </p>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6 text-gray-900 dark:text-white">
        Bookmarked Ayahs
      </h1>
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
                  Ayah {b.ayahNumber} • Saved{" "}
                  {new Date(b.dateAdded).toLocaleDateString()}
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
              {b.arabicText && (
                <p className="text-right text-2xl leading-snug font-arabic">
                  {b.arabicText}
                </p>
              )}
              {b.translationText && (
                <p className="mt-4 text-gray-800 dark:text-gray-200">
                  {b.translationText}
                </p>
              )}
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
