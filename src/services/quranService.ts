// function to fetch the list of all Surahs
export async function fetchSurahList() {
  const res = await fetch("https://api.alquran.cloud/v1/surah");
  if (!res.ok) throw new Error("Failed to fetch Surah list");
  const data = await res.json();
  return data.data;
}
// function to fetch a specific Surah by ID with translation
export async function fetchSurahByIdWithTranslation(id: string, translation: string = "en.sahih") {
  const res = await fetch(`https://api.alquran.cloud/v1/surah/${id}/${translation}`);
  if (!res.ok) throw new Error("Failed to fetch Surah translation");
  const data = await res.json();
  return data.data;
}
// function to fetch audio for a specific Surah
export async function fetchSurahAudio(surahNumber: string, reciter: string = "ar.alafasy") {
  const res = await fetch(`https://api.alquran.cloud/v1/surah/${surahNumber}/${reciter}`);
  if (!res.ok) throw new Error("Failed to fetch recitation");
  const data = await res.json();
  return data.data.ayahs;
}
