// src/components/PageView.tsx

import { useEffect, useState } from "react";
import { fetchPage } from "../services/quranService";
import type { PageAyah } from "../services/quranService";

// Define a minimal type for the data returned by the single ayah endpoint
interface SingleAyahData {
  text: string;
  // Add other properties if you access them, e.g., number: number;
}

interface PageViewProps {
  initialPage?: number;
}

export default function PageView({ initialPage = 1 }: PageViewProps) {
  // ─── State ──────────────────────────────────────────────────────────────────
  const [page, setPage] = useState<number>(initialPage);
  const [ayahs, setAyahs] = useState<PageAyah[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // If the Mushaf‐page endpoint does NOT return Ayah 1, fetch it explicitly:
  const [explicitVerseOne, setExplicitVerseOne] = useState<string | null>(null);

  // If this page is the first page of a new Sūrah, fetch that Sūrah's Arabic name:
  const [surahName, setSurahName] = useState<string | null>(null);

  // There are 604 pages in the Uthmānī Mushaf.
  const MAX_PAGE = 604;

  // ─── 1) Fetch Mushaf page whenever `page` changes ─────────────────────────────────
  useEffect(() => {
    let cancelled = false;

    setLoading(true);
    setError(null);
    setExplicitVerseOne(null);
    setSurahName(null);

    fetchPage(page, "quran-uthmani")
      .then((data) => {
        if (!cancelled) {
          // console.log("Data received in PageView:", data); // Keep or remove this log as needed
          setAyahs(data);
          setLoading(false);
        }
      })
      .catch((err) => {
        if (!cancelled) {
          // console.error("Error fetching page in PageView:", err); // Keep or remove this log as needed
          setError(err.message);
          setLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [page]);

  // ─── 2) Figure out the first Ayah on this page ──────────────────────────────────────
  const firstAyah = ayahs.length > 0 ? ayahs[0] : null;
  const surahNumber = firstAyah?.surah.number ?? null;
  // Determine if this page is the beginning of a Surah (Ayah 1 is the first ayah on the page)
  const isBeginningOfSurah = firstAyah !== null && firstAyah.numberInSurah === 1;

  // ─── 3) Only show Basmalah if this page "starts" a new Sūrah, except Sūrah 9 ─────────────
  const isSurahNine = surahNumber === 9;
  // showBismillah is true if it's the beginning of a Surah (and not Surah 9) and data is loaded without error
  const showBismillah =
    !loading && !error && isBeginningOfSurah && !isSurahNine;

  // ─── 4) If this page is the start of a new Sūrah, fetch the Sūrah's Arabic name ──────────
  useEffect(() => {
    if (showBismillah && surahNumber !== null) {
      fetch(`https://api.alquran.cloud/v1/surah/${surahNumber}/ar`)
        .then((res) => res.json())
        .then((json) => {
          setSurahName(json.data.name); // e.g. "سورة البقرة"
        })
        .catch(() => {
          setSurahName(null);
        });
    } else {
      setSurahName(null);
    }
  }, [showBismillah, surahNumber]);

  // ─── 5) If Sūrah > 1 and Mushaf‐page skipped Ayah 1 entirely, fetch it explicitly ─────────
  useEffect(() => {
    // This condition should only trigger if the API *didn't* return Ayah 1 at all,
    // but the page *should* start with Ayah 1 (i.e., it's the beginning of a Surah > 1).
    if (
      showBismillah && // It's the beginning of a Surah (and not Surah 9)
      surahNumber !== null &&
      surahNumber > 1 &&
      firstAyah &&
      firstAyah.numberInSurah > 1 // The first ayah returned is NOT Ayah 1
    ) {
      console.log(`Fetching explicit Verse 1 for Surah ${surahNumber}`); // Log explicit fetch
      fetch(`https://api.alquran.cloud/v1/ayah/${surahNumber}:1/ar`)
        .then((res) => res.json())
        .then((json) => {
          // Use the defined type instead of 'any'
          setExplicitVerseOne((json.data as SingleAyahData).text.trim());
        })
        .catch(() => {
          setExplicitVerseOne(null);
        });
    } else {
      setExplicitVerseOne(null);
    }
  }, [showBismillah, surahNumber, firstAyah]);

  // ─── 6) A more robust function to strip EXACTLY the Basmalah prefix ───────────────────
  // The "standard" Uthmānī Basmalah is:
  //   بِسْمِ ٱللَّٰهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ
  // We use a Unicode‐aware pattern \p{Zs}+ to match any Arabic whitespace (often U+00A0).
  // Made the dagger Alif (ٰ) optional in the regex to match the API's text.
  const BASMALAH_REGEX = /^بِسْمِ\p{Zs}+ٱللَّهِٰ?\p{Zs}+ٱلرَّحْمَٰنِ\p{Zs}+ٱلرَّحِيمِ\p{Zs}*/u;

  const stripBismillahPrefix = (text: string) => {
    const stripped = text.replace(BASMALAH_REGEX, "").trim();
    console.log(`Stripping Bismillah: Input="${text}", Output="${stripped}"`); // Log stripping
    return stripped;
  };

  // ─── 7) Determine "finalVerseOneText" (the "remainder" after Basmalah) ─────────────────
  let finalVerseOneText: string | null = null;

  if (showBismillah && surahNumber === 1) {
    // Sūrah 1: Basmalah itself IS Ayah 1 → no separate remainder
    finalVerseOneText = null;
  } else if (
    showBismillah &&
    surahNumber! > 1 &&
    firstAyah &&
    firstAyah.numberInSurah === 1
  ) {
    // The Mushaf page returned Ayah 1 as one combined chunk (e.g. "بِسْمِ … ٱلْم").
    // Strip off exactly the Basmalah prefix; what remains is Verse 1 (e.g. "ٱلْم").
    const raw = firstAyah.text.trim();
    const remainder = stripBismillahPrefix(raw);
    finalVerseOneText = remainder.length > 0 ? remainder : null;
  } else if (showBismillah && explicitVerseOne) {
    // Ayah 1 was not in Mushaf‐page at all → we fetched it above
    finalVerseOneText = explicitVerseOne;
  } else {
    finalVerseOneText = null;
  }

  console.log("finalVerseOneText:", finalVerseOneText); // Log finalVerseOneText

  // ─── 8) Build the array of verses (“displayAyahs”) we actually show below Basmalah/Verse 1 ─
  let displayAyahs: PageAyah[];
  // If this page starts a Surah (and it's not Surah 1), the first ayah returned by the API
  // is likely Ayah 1 combined with Bismillah. We handle Ayah 1 separately above,
  // so displayAyahs should start from the second ayah returned by the API.
  // We only slice if the first ayah returned is indeed Ayah 1 of the Surah > 1
  if (showBismillah && surahNumber !== 1 && firstAyah && firstAyah.numberInSurah === 1) {
      // For Surahs > 1 starting on this page, the first ayah returned contains Bismillah + Verse 1.
      // We will render the standalone Bismillah centered above.
      // We need to create a synthetic Ayah 1 object with the stripped text (remainder)
      // and then include the rest of the ayahs from the API response.
      const syntheticVerseOne: PageAyah = {
          ...firstAyah, // Keep original surah info etc.
          text: finalVerseOneText || '', // Use the stripped text
          numberInSurah: 1,
          isSyntheticVerseOne: true, // Add a flag to identify this synthetic ayah
      };
      displayAyahs = [syntheticVerseOne, ...ayahs.slice(1)];
  } else {
      // Otherwise, display all ayahs returned by the API. This includes Surah 1 Ayah 1.
      displayAyahs = ayahs;
  }

  console.log("displayAyahs count:", displayAyahs.length); // Log displayAyahs count

  // ─── 9) Navigation Handlers ──────────────────────────────────────────────────────
  const handlePreviousPage = () => {
    if (page > 1) {
      setPage(page - 1);
    }
  };

  const handleNextPage = () => {
    if (page < MAX_PAGE) {
      setPage(page + 1);
    }
  };

  return (
    <div className="flex flex-col items-center gap-8 py-8 px-4">
      {/* ─── Top Navigation (Previous Page — Page X — Next Page) ────────────────────────── */}
      <div className="flex items-center gap-4">
        <button
          onClick={handlePreviousPage}
          disabled={page <= 1}
          // Replaced blue background/hover classes with emerald
          className={`px-4 py-2 rounded-md text-sm font-medium ${
            page <= 1
              ? "bg-gray-300 dark:bg-gray-600 text-gray-500 dark:text-gray-400 cursor-not-allowed"
              : "bg-emerald-500 hover:bg-emerald-600 text-white"
          }`}
        >
          Previous Page
        </button>
        <span className="text-lg font-semibold text-gray-800 dark:text-gray-200">
          Page {page}
        </span>
        <button
          onClick={handleNextPage}
          disabled={page >= MAX_PAGE}
          // Replaced blue background/hover classes with emerald
          className={`px-4 py-2 rounded-md text-sm font-medium ${
            page >= MAX_PAGE
              ? "bg-gray-300 dark:bg-gray-600 text-gray-500 dark:text-gray-400 cursor-not-allowed"
              : "bg-emerald-500 hover:bg-emerald-600 text-white"
          }`}
        >
          Next Page
        </button>
      </div>

      {/* ─── Loading / Error States ───────────────────────────────────────────────────── */}
      {loading && (
        <p className="text-gray-700 dark:text-gray-300 mt-6">
          Loading Mushaf page {page}…
        </p>
      )}
      {error && (
        <p className="text-red-500 dark:text-red-400 mt-6">Error: {error}</p>
      )}

      {/* ─── Mushaf Content (only when not loading & no error) ───────────────────────────── */}
      {!loading && !error && (
        <div className="w-full max-w-3xl flex flex-col gap-8">
          {/* ─── Part A: If this page starts a new Sūrah (≠9), print:
                       1) Surah Name (centered)
                       2) Underline
                       3) Basmalah (no circle if Sūrah >1; circle‍"1" if Sūrah =1)
                       4) If Sūrah >1, print the remainder of Verse 1 with circle‍"1"
              ────────────────────────────────────────────────────────────────────────── */}
          {showBismillah && surahName && (
            <div className="flex flex-col items-center gap-2">
              {/* 1) Surah Name (calligraphic) */}
              {/* Adjusted size and leading for a more prominent Surah name */}
              <h2 className="font-noto text-6xl text-gray-900 dark:text-gray-100 leading-normal">
                {surahName}
              </h2>

              {/* 2) Decorative underline */}
              <div className="w-20 h-px bg-gray-500 dark:bg-gray-600 my-2" />

              {/* 3) Basmalah */}
              {/* Render standalone Bismillah centered only for Surahs > 1 */}
              {/* Adjusted size and leading for Basmalah */}
              {showBismillah && surahNumber! > 1 && (
                <p className="font-noto text-4xl text-center text-gray-700 dark:text-gray-300 leading-loose tracking-tight">
                  بِسْمِ ٱللَّٰهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ
                </p>
              )}
            </div>
          )}

          {/* ─── Part B: Render the remaining verses on this page ───────────────────────── */}
          <div dir="rtl" lang="ar" className="flex flex-col gap-6">
            {/*
              This loop now renders all verses that should appear below the Surah name/Bismillah section.
              For Surah 1, it includes Ayah 1 (Bismillah).
              For Surahs > 1 starting on this page, it includes a synthetic Ayah 1 (remainder after Bismillah)
              followed by the rest of the ayahs from the API response.
              For pages not starting a Surah, it includes all ayahs from the API response.
            */}
            {displayAyahs.map((ayah) => (
              <div
                key={`${ayah.surah.number}-${ayah.numberInSurah}`}
                className="relative flex justify-center items-center"
              >
                <p className="font-noto text-3xl leading-loose text-gray-900 dark:text-gray-100 text-right w-full">
                  {/* Render the text for the current ayah */}
                  {ayah.text.trim()}
                </p>
                {/* Verse‐number ornament (circle) */}
                {/* Render the ornament for all ayahs in displayAyahs */}
                <div className="absolute left-0 transform -translate-x-5 -translate-y-3">
                  <div className="w-10 h-10 rounded-full border-2 border-gray-400 dark:border-gray-600 bg-transparent flex items-center justify-center">
                    <span className="text-lg font-medium text-gray-500 dark:text-gray-400">
                      {ayah.numberInSurah}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ─── Part C: Bottom Navigation (duplicate) ───────────────────────────────────────── */}
      <div className="flex items-center gap-4">
        <button
          onClick={handlePreviousPage}
          disabled={page <= 1}
          // Replaced blue background/hover classes with emerald
          className={`px-4 py-2 rounded-md text-sm font-medium ${
            page <= 1
              ? "bg-gray-300 dark:bg-gray-600 text-gray-500 dark:text-gray-400 cursor-not-allowed"
              : "bg-emerald-500 hover:bg-emerald-600 text-white"
          }`}
        >
          Previous Page
        </button>
        <span className="text-lg font-semibold text-gray-800 dark:text-gray-200">
          Page {page}
        </span>
        <button
          onClick={handleNextPage}
          disabled={page >= MAX_PAGE}
          // Replaced blue background/hover classes with emerald
          className={`px-4 py-2 rounded-md text-sm font-medium ${
            page >= MAX_PAGE
              ? "bg-gray-300 dark:bg-gray-600 text-gray-500 dark:text-gray-400 cursor-not-allowed"
              : "bg-emerald-500 hover:bg-emerald-600 text-white"
          }`}
        >
          Next Page
        </button>
      </div>
    </div>
  );
}
