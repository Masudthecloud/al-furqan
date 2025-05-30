/* const API_BASE = "https://api.alquran.cloud/v1";

interface Surah {
  number: number;
  name: string;
  englishName: string;
  englishNameTranslation: string;
  revelationType: "Meccan" | "Medinan";
}

interface Ayah {
  number: number;
  text: string;
  audio?: string;
}

export async function fetchSurahList(): Promise<Surah[]> {
  try {
    const res = await fetch(`${API_BASE}/surah`);
    if (!res.ok) throw new Error("Failed to fetch Surah list");
    const { data } = await res.json();
    return data;
  } catch (error) {
    console.error("Error fetching surah list:", error);
    throw error;
  }
}

export async function fetchSurahByIdWithTranslation(
  id: string, 
  translation: string = "en.sahih"
): Promise<{ 
  name: string;
  englishName: string;
  englishNameTranslation: string;
  number: number;
  ayahs: Ayah[];
}> {
  try {
    const res = await fetch(`${API_BASE}/surah/${id}/${translation}`);
    if (!res.ok) throw new Error("Failed to fetch Surah translation");
    const { data } = await res.json();
    return data;
  } catch (error) {
    console.error(`Error fetching surah ${id}:`, error);
    throw error;
  }
}

export async function fetchSurahAudio(
  surahNumber: string, 
  reciter: string = "ar.alafasy"
): Promise<Ayah[]> {
  try {
    const res = await fetch(`${API_BASE}/surah/${surahNumber}/${reciter}`);
    if (!res.ok) throw new Error("Failed to fetch recitation");
    const { data } = await res.json();
    return data.ayahs;
  } catch (error) {
    console.error(`Error fetching audio for surah ${surahNumber}:`, error);
    throw error;
  }
} */

// src/services/quranService.tsx

const API_BASE = "https://api.alquran.cloud/v1";

// Only Sheikh Abdur-Rahman as-Sudâis needs manual URL building.
// All other reciters use the API’s built-in audio endpoint.
const reciterBaseUrls: Record<string,string> = {
  "ar.sudais": "https://verses.quran.com/Sudais/mp3",
};

export interface Surah {
  number: number;
  name: string;
  englishName: string;
  englishNameTranslation: string;
  revelationType: "Meccan" | "Medinan";
}

export interface Ayah {
  number: number;     // verse index within the surah
  text: string;       // Arabic text of the verse
  audio?: string;     // URL to MP3 (if available)
}

// Shape returned by /surah/{id}/{reciter} for “normal” reciters
interface ApiAyah {
  numberInSurah: number;
  text:         string;
  audio:        string;
}

// Shape returned by /surah/{id}/ar for the Sudâis fallback
interface ArabicApiAyah {
  numberInSurah: number;
  text:          string;
}

export async function fetchSurahList(): Promise<Surah[]> {
  const res = await fetch(`${API_BASE}/surah`);
  if (!res.ok) throw new Error("Failed to fetch Surah list");
  const { data } = await res.json();
  return data as Surah[];
}

export async function fetchSurahByIdWithTranslation(
  id: string,
  translation: string = "en.sahih"
): Promise<{
  name: string;
  englishName: string;
  englishNameTranslation: string;
  number: number;
  ayahs: Ayah[];
}> {
  const res = await fetch(`${API_BASE}/surah/${id}/${translation}`);
  if (!res.ok) throw new Error(`Failed to fetch Surah ${id} with translation`);
  const { data } = await res.json();
  return data;
}

export async function fetchSurahAudio(
  surahNumber: string,
  reciter: string = "ar.alafasy"
): Promise<Ayah[]> {
  // 1) Manual fallback only for Sheikh as-Sudâis
  if (reciter === "ar.sudais") {
    const resMeta = await fetch(`${API_BASE}/surah/${surahNumber}/ar`);
    if (!resMeta.ok) throw new Error("Failed to fetch metadata for Sudâis");
    const { data: arabicData } = await resMeta.json();
    const rawAyahs = arabicData.ayahs as ArabicApiAyah[];

    return rawAyahs.map(raw => {
      const idx = raw.numberInSurah;
      const fileName =
        String(arabicData.number).padStart(3, "0") +
        String(idx).padStart(3, "0") +
        ".mp3";

      return {
        number: idx,
        text:   raw.text,
        audio:  `${reciterBaseUrls["ar.sudais"]}/${fileName}`,
      };
    });
  }

  // 2) Everyone else — use the API’s audio endpoint
  const res = await fetch(`${API_BASE}/surah/${surahNumber}/${reciter}`);
  if (!res.ok) throw new Error("Failed to fetch recitation");
  const { data } = await res.json();
  const apiAyahs = data.ayahs as ApiAyah[];

  return apiAyahs.map(a => ({
    number: a.numberInSurah,
    text:   a.text,
    audio:  a.audio,
  }));
}
