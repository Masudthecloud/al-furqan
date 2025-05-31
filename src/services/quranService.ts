// src/services/quranService.tsx
// ────────────────────────────────────────────────────────────────────────────
const API_BASE = "https://api.alquran.cloud/v1";

// ───────────── 1) fetchSurahList (unchanged) ─────────────
export interface Surah {
  number: number;
  name: string;
  englishName: string;
  englishNameTranslation: string;
  revelationType: "Meccan" | "Medinan";
}

export async function fetchSurahList(): Promise<Surah[]> {
  const res = await fetch(`${API_BASE}/surah`);
  if (!res.ok) throw new Error("Failed to fetch Surah list");
  const { data } = await res.json();
  return data as Surah[];
}

// ───────────── 2) fetchSurahByIdWithTranslation (unchanged) ─────────────
export interface Ayah {
  number: number;   // verse index within the surah
  text: string;     // Arabic or translated text
  audio?: string;   // URL to MP3, if available
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

// ───────────── 3) fetchSurahAudio (unchanged; includes Sudâis fallback) ─────────────
// We only need a manual URL for Sheikh as-Sudâis; all other reciters use the API's endpoint.
interface ApiAyah {
  numberInSurah: number;
  text: string;
  audio: string;
}
interface ArabicApiAyah {
  numberInSurah: number;
  text: string;
}

const reciterBaseUrls: Record<string,string> = {
  "ar.sudais": "https://verses.quran.com/Sudais/mp3",
};

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
        text: raw.text,
        audio: `${reciterBaseUrls["ar.sudais"]}/${fileName}`,
      };
    });
  }

  // 2) All others → use the built-in /surah/{surahNumber}/{reciter} endpoint
  const res = await fetch(`${API_BASE}/surah/${surahNumber}/${reciter}`);
  if (!res.ok) throw new Error("Failed to fetch recitation");
  const { data } = await res.json();
  const apiAyahs = data.ayahs as ApiAyah[];

  return apiAyahs.map(a => ({
    number: a.numberInSurah,
    text: a.text,
    audio: a.audio,
  }));
}

// ───────────── 4) fetchPage (NEW!) ─────────────
// GET /page/{pageNumber}/{edition}
// Returns all Ayahs on that Mushaf page. We'll default edition="quran-uthmani".
interface ApiPageAyah {
  number: number;
  text: string;
  numberInSurah: number;
  surah: {
    number: number;
    name: string;
    englishName: string;
  };
}

export interface PageResponse {
  verses: PageAyah[];
  meta: {
    current_page: number;
    total_pages: number;
  };
}

export interface PageAyah {
  number: number;
  text: string;
  numberInSurah: number;
  surah: {
    number: number;
    name: string;
    englishName: string;
  };
}

export async function fetchPage(
  pageNumber: number,
  edition: string = "quran-uthmani"
): Promise<PageAyah[]> {
  const res = await fetch(`${API_BASE}/page/${pageNumber}/${edition}`);
  if (!res.ok) throw new Error(`Failed to fetch page ${pageNumber}`);
  const { data } = await res.json();
  // data.ayahs is an array; we can cast it to PageAyah
  return (data.ayahs as ApiPageAyah[]).map(a => ({
    number: a.number,
    text: a.text,
    numberInSurah: a.numberInSurah,
    surah: a.surah,
  }));
}
