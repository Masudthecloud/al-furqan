import { useParams } from "react-router-dom";
import { useEffect, useState, useRef } from "react";
import {
  fetchSurahByIdWithTranslation,
  fetchSurahAudio,
} from "../services/quranService";
import { FaRegStar, FaStar } from "react-icons/fa";

interface Ayah {
  number: number;
  text: string; // Arabic
  englishText?: string;
  audio?: string;
  ayahId?: number;
}

interface Surah {
  name: string;
  englishName: string;
  englishNameTranslation: string;
  number: number;
  ayahs: Ayah[];
}

const SurahDetail = () => {
  const { id } = useParams();
  const [surah, setSurah] = useState<Surah | null>(null);
  const [loading, setLoading] = useState(true);
  const [translation, setTranslation] = useState("en.sahih");
  const [reciter, setReciter] = useState("ar.alafasy");
  const [showTranslation, setShowTranslation] = useState(true);
  const [bookmarks, setBookmarks] = useState<number[]>([]);
  const [startAyah, setStartAyah] = useState(1);
  const [endAyah, setEndAyah] = useState<number | null>(null);
  const [repeatEach, setRepeatEach] = useState(false);
  const [playingIndex, setPlayingIndex] = useState<number | null>(null);
  const audioRefs = useRef<(HTMLAudioElement | null)[]>([]);

  useEffect(() => {
    const saved = localStorage.getItem("bookmarks");
    if (saved) setBookmarks(JSON.parse(saved));
  }, []);

  useEffect(() => {
    if (!id) return;

    const loadData = async () => {
      try {
        setLoading(true);
        const [translated, arabic, audio] = await Promise.all([
          fetchSurahByIdWithTranslation(id, translation),
          fetchSurahByIdWithTranslation(id, "ar"),
          fetchSurahAudio(id, reciter),
        ]);

        const mergedAyahs: Ayah[] = arabic.ayahs.map((ayah: Ayah, idx: number) => ({
          number: ayah.number,
          text: ayah.text,
          englishText: translated.ayahs[idx]?.text,
          audio: audio[idx]?.audio,
          ayahId: translated.ayahs[idx]?.ayahId || arabic.ayahs[idx]?.ayahId,
        }));

        setSurah({
          name: arabic.name,
          englishName: arabic.englishName,
          englishNameTranslation: arabic.englishNameTranslation,
          number: arabic.number,
          ayahs: mergedAyahs,
        });

        setEndAyah(mergedAyahs.length);
      } catch (err) {
        console.error("Failed to load surah", err);
        setSurah(null);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [id, translation, reciter]);

  const toggleBookmark = (ayahNum: number) => {
    const updated = bookmarks.includes(ayahNum)
      ? bookmarks.filter((b) => b !== ayahNum)
      : [...bookmarks, ayahNum];
    setBookmarks(updated);
    localStorage.setItem("bookmarks", JSON.stringify(updated));
  };

  const playAll = async () => {
    if (!surah) return;
    const ayahsToPlay = surah.ayahs.slice(startAyah - 1, endAyah ?? surah.ayahs.length);

    for (let i = 0; i < ayahsToPlay.length; i++) {
      const audio = audioRefs.current[startAyah - 1 + i];
      if (!audio) continue;

      setPlayingIndex(startAyah - 1 + i);
      await new Promise((resolve) => {
        audio.currentTime = 0;
        audio.play();
        audio.onended = () => {
          if (repeatEach) {
            audio.play();
          } else {
            resolve(null);
          }
        };
      });
    }

    setPlayingIndex(null);
  };

  if (loading) return <p className="text-center mt-10">Loading Surah...</p>;
  if (!surah) return <p className="text-center mt-10 text-red-600">Surah not found.</p>;

  return (
    <div className="p-4 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold text-green-600 mb-1">
        📖 {surah.englishName}{" "}
        <span className="text-sm text-green-300">({surah.name})</span>
      </h1>
      <p className="italic text-sm text-gray-500 dark:text-gray-300 mb-4">
        {surah.englishNameTranslation}
      </p>

      <div className="flex flex-wrap items-center gap-2 mb-4">
        <label className="flex items-center gap-1">
          <input
            type="checkbox"
            checked={showTranslation}
            onChange={() => setShowTranslation((prev) => !prev)}
          />
          Show Translation
        </label>

        <select
        value={translation}
        onChange={(e) => setTranslation(e.target.value)}
        className="bg-white text-black dark:bg-gray-800 dark:text-white border rounded px-2 py-1"
        >
        <option value="en.sahih">English - Sahih International</option>
        <option value="en.yusufali">English - Yusuf Ali</option>
        <option value="bn.bengali">Bengali</option>
        <option value="ur.jalandhry">Urdu</option>
        <option value="id.indonesian">Indonesian</option>
        <option value="tr.golpinarli">Turkish - Ali Riza Safa Golpinarli</option>
        <option value="fr.hamidullah">French - Muhammad Hamidullah</option>
        <option value="de.bubenheim">German - Bubenheim & Elyas</option>
        <option value="es.cortes">Spanish - Julio Cortes</option>
        <option value="ru.kuliev">Russian - Elmir Kuliev</option>
        <option value="zh.jian">Chinese (Simplified)</option>
        </select>


        <select
          value={reciter}
          onChange={(e) => setReciter(e.target.value)}
          className="bg-white text-black dark:bg-gray-800 dark:text-white border rounded px-2 py-1"
        >
          <option value="ar.alafasy">Mishary Alafasy</option>
          <option value="ar.husary">Mahmoud Al-Hussary</option>
          <option value="ar.abdulbasitmurattal">Abdul Basit</option>
          <option value="ar.minshawi">Al-Minshawi</option>
          <option value="ar.saoodshuraym">Saud Al-Shuraim</option>
        </select>

        <button
          onClick={playAll}
          className="bg-green-600 text-white px-3 py-1 rounded hover:bg-green-700"
        >
          ▶️ Play All
        </button>
      </div>

      <div className="flex items-center gap-2 mb-4 text-sm">
        <label>
          Start Ayah:
          <input
            type="number"
            value={startAyah}
            onChange={(e) => setStartAyah(Number(e.target.value))}
            className="ml-1 border rounded w-16 px-1 py-0.5"
          />
        </label>
        <label>
          End Ayah:
          <input
            type="number"
            value={endAyah ?? ""}
            onChange={(e) => setEndAyah(Number(e.target.value))}
            className="ml-1 border rounded w-16 px-1 py-0.5"
          />
        </label>
        <label className="flex items-center gap-1">
          <input
            type="checkbox"
            checked={repeatEach}
            onChange={() => setRepeatEach((prev) => !prev)}
          />
          Repeat each verse
        </label>
      </div>

      {surah.ayahs.map((ayah, index) => (
        <div
          key={ayah.number}
          className={`mb-4 p-4 rounded shadow ${
            index === playingIndex
              ? "bg-yellow-100"
              : "bg-white dark:bg-gray-900"
          } border border-gray-200 dark:border-gray-800`}
        >
          <p className="font-arabic text-right text-green-700 text-xl mb-2">{ayah.text}</p>

          {showTranslation && (
            <p className="text-sm text-gray-600 dark:text-gray-300 mb-1">
              <strong>Ayah {ayah.number}:</strong> {ayah.englishText || ""}
            </p>
          )}

          <audio
            ref={(el) => {
              audioRefs.current[index] = el;
            }}
            controls
            className="w-full mb-2"
          >
            <source src={ayah.audio} type="audio/mp3" />
            Your browser does not support the audio element.
          </audio>

          <div className="flex items-center justify-between">
            <button
              onClick={() => toggleBookmark(ayah.number)}
              className="text-yellow-500 hover:text-yellow-400"
              title="Bookmark"
            >
              {bookmarks.includes(ayah.number) ? <FaStar /> : <FaRegStar />}
            </button>
          </div>
        </div>
      ))}
    </div>
  );
};

export default SurahDetail;
