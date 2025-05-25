import { useEffect, useState, useRef } from "react";
import { useParams } from "react-router-dom";
import { fetchSurahByIdWithTranslation, fetchSurahAudio } from "../services/quranService";

interface Ayah {
  number: number;
  arabicText: string;
  translationText?: string;
  audio?: string;
}

interface SurahData {
  name: string;
  englishName: string;
  englishNameTranslation: string;
  numberOfAyahs: number;
  ayahs: Ayah[];
}

const RECITERS = [
  { label: "Mishary Alafasy", code: "ar.alafasy" },
  { label: "Abdul Basit", code: "ar.abdulbasitmurattal" },
  { label: "Al-Minshawi", code: "ar.minshawi" },
  { label: "Saud Al-Shuraim", code: "ar.saoodshuraym" },
];

const TRANSLATIONS = [
  { label: "Sahih International", code: "en.sahih" },
  { label: "Pickthall", code: "en.pickthall" },
  { label: "Yusuf Ali", code: "en.yusufali" },
  { label: "Bengali", code: "bn.bengali" },
  { label: "Urdu", code: "ur.jalandhry" },
];

export default function SurahDetail() {
  const { id } = useParams();
  const [surah, setSurah] = useState<SurahData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [translation, setTranslation] = useState(localStorage.getItem("translation") || "en.sahih");
  const [reciter, setReciter] = useState(localStorage.getItem("reciter") || "ar.alafasy");
  const [showTranslation, setShowTranslation] = useState(true);
  const audioQueue = useRef<HTMLAudioElement[]>([]);

  useEffect(() => {
    if (!id) return;
    setLoading(true);

    Promise.all([
      fetchSurahByIdWithTranslation(id, translation),
      fetchSurahAudio(id, reciter),
    ])
      .then(([translatedData, audioData]) => {
        const merged = translatedData.ayahs.map((tAyah, index) => ({
          number: tAyah.number,
          translationText: tAyah.text,
          arabicText: audioData[index]?.text || "",
          audio: audioData[index]?.audio || "",
        }));
        setSurah({ ...translatedData, ayahs: merged });
      })
      .catch(() => setError("Failed to load Surah"))
      .finally(() => setLoading(false));
  }, [id, translation, reciter]);

  const handlePlayAll = () => {
    if (!surah) return;
    audioQueue.current = surah.ayahs
      .map((ayah) => new Audio(ayah.audio))
      .filter((a) => a.src);
    playSequential(0);
  };

  const playSequential = (index: number) => {
    if (index >= audioQueue.current.length) return;
    const audio = audioQueue.current[index];
    audio.play();
    audio.onended = () => playSequential(index + 1);
  };

  const toggleBookmark = (number: number) => {
    if (!surah) return;

    const targetAyah = surah.ayahs.find((a) => a.number === number);
    const saved = JSON.parse(localStorage.getItem("bookmarked_ayahs") || "[]");

    const exists = saved.find(
      (b: any) => b.ayahNumber === number && b.surahId === Number(id)
    );

    let updated;
    if (exists) {
      updated = saved.filter((b: any) => !(b.ayahNumber === number && b.surahId === Number(id)));
    } else {
      updated = [
        ...saved,
        {
          surahName: surah.englishName,
          surahId: Number(id),
          ayahNumber: number,
          arabicText: targetAyah?.arabicText,
          translationText: targetAyah?.translationText,
        },
      ];
    }

    localStorage.setItem("bookmarked_ayahs", JSON.stringify(updated));
  };

  useEffect(() => {
    localStorage.setItem("reciter", reciter);
  }, [reciter]);

  useEffect(() => {
    localStorage.setItem("translation", translation);
  }, [translation]);

  if (loading) return <p>Loading Surah...</p>;
  if (error || !surah) return <p className="text-red-600">{error}</p>;

  const bookmarks = JSON.parse(localStorage.getItem("bookmarked_ayahs") || "[]");

  return (
    <div>
      <h1 className="text-2xl font-bold text-green-800 dark:text-green-300 mb-2">
        📖 {surah.englishName} ({surah.name})
      </h1>
      <p className="text-gray-600 dark:text-gray-400 mb-4 italic">
        {surah.englishNameTranslation}
      </p>

      <div className="mb-6 flex flex-col sm:flex-row gap-4 items-start sm:items-center">
        <label className="flex gap-2 items-center text-sm">
          <input
            type="checkbox"
            checked={showTranslation}
            onChange={(e) => setShowTranslation(e.target.checked)}
          />
          Show Translation
        </label>

        <select
          value={translation}
          onChange={(e) => setTranslation(e.target.value)}
          className="border p-2 rounded text-sm dark:bg-gray-800 dark:text-white"
        >
          {TRANSLATIONS.map((t) => (
            <option key={t.code} value={t.code}>{t.label}</option>
          ))}
        </select>

        <select
          value={reciter}
          onChange={(e) => setReciter(e.target.value)}
          className="border p-2 rounded text-sm dark:bg-gray-800 dark:text-white"
        >
          {RECITERS.map((r) => (
            <option key={r.code} value={r.code}>{r.label}</option>
          ))}
        </select>

        <button
          onClick={handlePlayAll}
          className="bg-green-600 text-white px-4 py-2 rounded shadow"
        >
          ▶️ Play All
        </button>
      </div>

      <ul className="space-y-6">
        {surah.ayahs.map((ayah) => {
          const isBookmarked = bookmarks.some(
            (b: any) => b.ayahNumber === ayah.number && b.surahId === Number(id)
          );

          return (
            <li
              key={ayah.number}
              className={`p-4 rounded shadow-sm border relative bg-white dark:bg-gray-800 ${
                isBookmarked ? "border-yellow-400" : ""
              }`}
            >
              <p className="font-arabic text-green-800 dark:text-green-200 mb-2 text-xl">{ayah.arabicText}</p>

              {showTranslation && (
                <p className="text-sm text-gray-700 dark:text-gray-300">
                  Ayah {ayah.number}: {ayah.translationText}
                </p>
              )}

              {ayah.audio && (
                <audio controls className="mt-2 w-full">
                  <source src={ayah.audio} type="audio/mp3" />
                </audio>
              )}

              <button
                onClick={() => toggleBookmark(ayah.number)}
                className="absolute top-2 right-2 text-yellow-500 text-lg"
                title="Bookmark"
              >
                {isBookmarked ? "★" : "☆"}
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
