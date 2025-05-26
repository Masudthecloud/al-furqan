const API_BASE = "https://api.alquran.cloud/v1";

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
}