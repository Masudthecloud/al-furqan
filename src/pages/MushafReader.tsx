import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";

interface Ayah {
  numberInSurah: number;
  text: string;
}

interface SurahData {
  name: string;
  englishName: string;
  numberOfAyahs: number;
  ayahs: Ayah[];
}

export default function MushafReader() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [surah, setSurah] = useState<SurahData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchArabicSurah = async (surahId: string) => {
    try {
      const res = await fetch(`https://api.alquran.cloud/v1/surah/${surahId}/ar`);
      const data = await res.json();
      if (data?.data?.ayahs) {
        setSurah({
          name: data.data.name,
          englishName: data.data.englishName,
          numberOfAyahs: data.data.numberOfAyahs,
          ayahs: data.data.ayahs,
        });
      } else {
        throw new Error("Invalid surah data");
      }
    } catch {
      setError("Failed to load Arabic-only surah.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) {
      setLoading(true);
      fetchArabicSurah(id);
    }
  }, [id]);

  const currentSurahId = parseInt(id || "1");
  const hasNext = currentSurahId < 114;
  const hasPrevious = currentSurahId > 1;

  const goToSurah = (offset: number) => {
    navigate(`/mushaf/${currentSurahId + offset}`);
  };

  if (loading) return <p className="text-center">Loading surah...</p>;
  if (error || !surah) return <p className="text-red-600">{error}</p>;

  return (
    <div className="px-4 py-8 max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold text-green-700 text-center mb-4">
        🕋 {surah.name} ({surah.englishName})
      </h1>

      <div className="space-y-6 text-right mb-8">
        {surah.ayahs.map((ayah) => (
          <p
            key={ayah.numberInSurah}
            className="font-arabic text-2xl text-green-900 leading-loose dark:text-green-200"
          >
            {ayah.text}{" "}
            <span className="text-sm text-gray-400">({ayah.numberInSurah})</span>
          </p>
        ))}
      </div>

      <div className="flex justify-between items-center">
        {hasPrevious ? (
          <button
            onClick={() => goToSurah(-1)}
            className="bg-yellow-500 text-white py-2 px-4 rounded hover:bg-yellow-600"
          >
            ← Previous
          </button>
        ) : <span />}

        {hasNext ? (
          <button
            onClick={() => goToSurah(1)}
            className="bg-green-600 text-white py-2 px-4 rounded hover:bg-green-700"
          >
            Next →
          </button>
        ) : <span />}
      </div>
    </div>
  );
}
