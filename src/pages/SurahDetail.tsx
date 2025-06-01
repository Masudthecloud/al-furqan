// src/pages/SurahDetail.tsx

import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState, useRef } from "react";
import {
  fetchSurahByIdWithTranslation,
  fetchSurahAudio,
  fetchSurahList,
} from "../services/quranService";
import {
  FaPlay,
  FaPause,
  FaBackward,
  FaForward,
  FaCopy,
  FaShare,
  FaCheck,
  FaStar,
  FaRegStar,
  FaChevronDown,
  FaSearch,
} from "react-icons/fa";
import PageView from "../components/PageView";

interface Ayah {
  number: number;
  text: string;
  englishText?: string;
  audio?: string;
  page: number;
}

interface Surah {
  name: string;
  englishName: string;
  englishNameTranslation: string;
  number: number;
  ayahs: Ayah[];
}

interface SurahInfo {
  number: number;
  name: string;
  englishName: string;
}

// Mushaf page lookup (not relevant to audio logic)
const SURAH_TO_PAGE: Record<number, number> = {
  1: 1,
  2: 2,
  3: 50,
  4: 77,
  5: 106,
  6: 128,
  7: 151,
  8: 177,
  9: 187,
  10: 208,
  11: 221,
  12: 235,
  13: 249,
  14: 255,
  15: 262,
  16: 267,
  17: 282,
  18: 293,
  19: 305,
  20: 312,
  21: 322,
  22: 332,
  23: 342,
  24: 350,
  25: 359,
  26: 367,
  27: 377,
  28: 385,
  29: 396,
  30: 404,
  31: 411,
  32: 415,
  33: 418,
  34: 428,
  35: 434,
  36: 440,
  37: 446,
  38: 453,
  39: 458,
  40: 467,
  41: 477,
  42: 483,
  43: 489,
  44: 496,
  45: 499,
  46: 502,
  47: 507,
  48: 511,
  49: 515,
  50: 518,
  51: 520,
  52: 523,
  53: 526,
  54: 528,
  55: 531,
  56: 534,
  57: 537,
  58: 542,
  59: 545,
  60: 549,
  61: 551,
  62: 553,
  63: 554,
  64: 556,
  65: 558,
  66: 560,
  67: 562,
  68: 564,
  69: 566,
  70: 568,
  71: 570,
  72: 572,
  73: 574,
  74: 575,
  75: 577,
  76: 578,
  77: 580,
  78: 582,
  79: 583,
  80: 585,
  81: 586,
  82: 587,
  83: 587,
  84: 589,
  85: 590,
  86: 591,
  87: 591,
  88: 592,
  89: 593,
  90: 594,
  91: 595,
  92: 595,
  93: 596,
  94: 596,
  95: 597,
  96: 597,
  97: 598,
  98: 598,
  99: 599,
  100: 599,
  101: 600,
  102: 600,
  103: 601,
  104: 601,
  105: 601,
  106: 602,
  107: 602,
  108: 603,
  109: 603,
  110: 603,
  111: 603,
  112: 604,
  113: 604,
  114: 604,
};

export default function SurahDetail() {
  const { id } = useParams();
  const navigate = useNavigate();

  // ─── STATE ──────────────────────────────────────────────────────────────────
  const [surah, setSurah] = useState<Surah | null>(null);
  const [surahList, setSurahList] = useState<SurahInfo[]>([]);
  const [filteredSurahList, setFilteredSurahList] = useState<SurahInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [translation, setTranslation] = useState("en.sahih");
  const [reciter, setReciter] = useState("ar.alafasy");
  const [viewMode, setViewMode] = useState<"translation" | "page">(
    "translation"
  );
  const [bookmarks, setBookmarks] = useState<{ surah: number; ayah: number }[]>(
    []
  );
  const [settingsVerse, setSettingsVerse] = useState<number | null>(null);
  const [repeatCountMap, setRepeatCountMap] = useState<Record<number, number>>(
    {}
  );
  const [startAyah] = useState(1);
  const [endAyah, setEndAyah] = useState<number | null>(null);
  const [repeatEach] = useState(false);
  const [repeatCount] = useState(1);
  const [playingIndex, setPlayingIndex] = useState<number | null>(null);
  const [isPlayingAll, setIsPlayingAll] = useState(false);
  const [, setCurrentPlayingAyah] = useState<number | null>(
    null
  );
  const [volume] = useState(0.7);
  const [isMuted] = useState(false);
  const [isSurahDropdownOpen, setIsSurahDropdownOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentSurahNumber, setCurrentSurahNumber] = useState<number | null>(
    null
  );
  const [copiedAyah, setCopiedAyah] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  // ─── REFS ────────────────────────────────────────────────────────────────────
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const ayahsToPlay = useRef<Ayah[]>([]);
  const currentAyahIndex = useRef(0);
  const verseRepeatCounterRef = useRef(0);
  const selectionRepeatCounterRef = useRef(0);
  const isPlayingAllRef = useRef(false);
  const activeSingleVerseRef = useRef<number | null>(null);

  const reciterBaseUrls: { [key: string]: string } = {
    "ar.alafasy": "https://verses.quran.com/Alafasy/mp3",
    "ar.minshawi": "https://verses.quran.com/Minshawy/mp3",
    "ar.husary": "https://verses.quran.com/Husary/mp3",
    "ar.abdulbasitmurattal": "https://verses.quran.com/AbdulBasetMurattal/mp3",
    "ar.saoodshuraym": "https://verses.quran.com/Shuraym/mp3",
    "ar.abdullahbasfar": "https://verses.quran.com/Basfar/mp3",
    "ar.abdulsamad": "https://verses.quran.com/AbdulSamad/mp3",
    "ar.shaatree": "https://verses.quran.com/Shaatree/mp3",
    "ar.ahmedajamy": "https://verses.quran.com/AhmedIbnAliAlAjami/mp3",
    "ar.hanirifai": "https://verses.quran.com/HaniRifai/mp3",
    "ar.ibrahimakhbar": "https://verses.quran.com/IbrahimAkhdar/mp3",
    "ar.mahermuaiqly": "https://verses.quran.com/MaherAlMuaiqly/mp3",
    "ar.muhammadayyoub": "https://verses.quran.com/MuhammadAyyoub/mp3",
    "ar.muhammadjibreel": "https://verses.quran.com/MuhammadJibreel/mp3",
  };

  // ─── 1) Fetch list of all Surahs for dropdown search ───────────────────────────
  useEffect(() => {
    const loadSurahList = async () => {
      try {
        const list = await fetchSurahList();
        setSurahList(list);
        setFilteredSurahList(list);
      } catch (e) {
        console.error("Failed to load surah list:", e);
      }
    };
    loadSurahList();
  }, []);

  // ─── 2) On mount, load bookmarks from localStorage ─────────────────────────────
  useEffect(() => {
    const saved = localStorage.getItem("quranBookmarks");
    if (saved) {
      try {
        setBookmarks(JSON.parse(saved));
      } catch {
        setBookmarks([]);
      }
    }
  }, []);

  // ─── 3) Whenever bookmarks change, write back to localStorage ─────────────────
  useEffect(() => {
    localStorage.setItem("quranBookmarks", JSON.stringify(bookmarks));
  }, [bookmarks]);

  // ─── 4) Track route param “id” → set currentSurahNumber ──────────────────────
  useEffect(() => {
    if (!id) return;
    setCurrentSurahNumber(parseInt(id, 10));
  }, [id]);

  // ─── 5) Whenever currentSurahNumber, translation, or reciter changes, fetch Surah ─
  useEffect(() => {
    if (!currentSurahNumber) return;
    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const [trans, arabic, audio] = await Promise.all([
          fetchSurahByIdWithTranslation(
            currentSurahNumber.toString(),
            translation
          ),
          fetchSurahByIdWithTranslation(currentSurahNumber.toString(), "ar"),
          fetchSurahAudio(currentSurahNumber.toString(), reciter),
        ]);

        const merged = (arabic.ayahs as Ayah[]).map((ayah: Ayah, i: number) => ({
          number: i + 1,
          text: ayah.text,
          englishText: trans.ayahs[i]?.text,
          audio: audio[i]?.audio,
          page: ayah.page,
        }));

        setSurah({
          name: arabic.name,
          englishName: arabic.englishName,
          englishNameTranslation: arabic.englishNameTranslation,
          number: arabic.number,
          ayahs: merged,
        });
        setEndAyah(merged.length);
      } catch (e) {
        console.error(e);
        setSurah(null);
        setError("Failed to load surah. Please try again.");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [currentSurahNumber, translation, reciter]);

  // ─── 6) Sync volume/mute to the current <audio> element (though we will not expose it) ─
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = isMuted ? 0 : volume;
      audioRef.current.setAttribute("playsinline", "true");
      audioRef.current.setAttribute("webkit-playsinline", "true");
    }
  }, [volume, isMuted]);

  // ─── 7) Cleanup on unmount ─────────────────────────────────────────────────────
  useEffect(
    () => () => {
      audioRef.current?.pause();
      audioRef.current = null;
    },
    []
  );

  // ─── Bookmark toggle: add/remove { surah, ayah } ─────────────────────────────────
  const handleBookmarkToggle = (surahNumber: number, ayahNumber: number) => {
    const exists = bookmarks.findIndex(
      (b) => b.surah === surahNumber && b.ayah === ayahNumber
    );
    if (exists > -1) {
      setBookmarks((prev) =>
        prev.filter((b) => !(b.surah === surahNumber && b.ayah === ayahNumber))
      );
    } else {
      setBookmarks((prev) => [
        ...prev,
        { surah: surahNumber, ayah: ayahNumber },
      ]);
    }
  };
  const isAyahBookmarked = (surahNum: number, ayahNum: number) =>
    bookmarks.some((b) => b.surah === surahNum && b.ayah === ayahNum);

  // ─── Verse settings popover control ─────────────────────────────────────────────
  const openVerseSettings = (ayahNumber: number) => {
    setSettingsVerse(ayahNumber);
  };
  const closeVerseSettings = () => {
    setSettingsVerse(null);
  };

  // ─── Scroll a specific Ayah into view ──────────────────────────────────────────
  const scrollToAyah = (ayahNumber: number) => {
    const element = document.getElementById(`ayah-${ayahNumber}`);
    if (element) {
      element.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  };

  // ─── Play a single Ayah with optional repeat‐count ─────────────────────────────
  const playAyah = async (ayah: Ayah, idx: number) => {
    // If this same verse is currently playing, stop immediately
    if (playingIndex === idx && audioRef.current) {
      stopPlayback();
      return;
    }

    // Otherwise, begin fresh playback for this exact verse
    audioRef.current?.pause();
    setPlayingIndex(idx);
    setCurrentPlayingAyah(ayah.number);
    scrollToAyah(ayah.number);
    isPlayingAllRef.current = false;
    setIsPlayingAll(false);
    activeSingleVerseRef.current = ayah.number;

    const countForThisVerse = repeatCountMap[ayah.number] ?? 1;
    let playedSoFar = 0;
    const infiniteLoop = countForThisVerse === 0;

    const playSingle = () => {
      // If user stopped mid‐loop, bail out
      if (activeSingleVerseRef.current !== ayah.number) {
        return;
      }

      const a = new Audio(ayah.audio!);
      audioRef.current = a; // <─ Assign to audioRef so “pause” works
      a.setAttribute("playsinline", "true");
      a.setAttribute("webkit-playsinline", "true");
      a.volume = isMuted ? 0 : volume;

      a
        .play()
        .then(() => {
          playedSoFar++;
          a.onended = () => {
            if (activeSingleVerseRef.current !== ayah.number) {
              return;
            }
            if (infiniteLoop || playedSoFar < countForThisVerse) {
              playSingle();
            } else {
              setPlayingIndex(null);
              setCurrentPlayingAyah(null);
              activeSingleVerseRef.current = null;
            }
          };
        })
        .catch((err) => {
          console.error("Audio playback error:", err);
          setPlayingIndex(null);
          setCurrentPlayingAyah(null);
          activeSingleVerseRef.current = null;
        });
    };

    playSingle();
  };

  // ─── Should we play “Bismillah” before first Ayah? ──────────────────────────────
  const shouldPlayBismillah = () =>
    currentAyahIndex.current === 0 &&
    startAyah === 1 &&
    surah &&
    ![1, 9].includes(surah.number) &&
    reciter === "ar.alafasy";

  const playBismillah = () =>
    new Promise<void>((resolve) => {
      const url = `${reciterBaseUrls[reciter]}/001001.mp3`;
      const b = new Audio(url);
      audioRef.current = b; // <─ assign to audioRef
      b.setAttribute("playsinline", "true");
      b.setAttribute("webkit-playsinline", "true");
      b.volume = isMuted ? 0 : volume;
      b.onerror = () => {
        resolve(); // skip if missing
      };
      b.onended = () => resolve();
      b.play().catch(() => resolve());
    });

  // ─── Stop all playback ─────────────────────────────────────────────────────────
  const stopPlayback = () => {
    audioRef.current?.pause();
    isPlayingAllRef.current = false;
    setIsPlayingAll(false);
    setPlayingIndex(null);
    setCurrentPlayingAyah(null);
    verseRepeatCounterRef.current = 0;
    selectionRepeatCounterRef.current = 0;
    activeSingleVerseRef.current = null;
  };

  // ─── Play next Ayah in a selection (handles repeatEach & repeatCount) ────────
  const playNextAyah = async () => {
    if (!ayahsToPlay.current.length) {
      stopPlayback();
      return;
    }

    const localIdx = currentAyahIndex.current;
    const ayah = ayahsToPlay.current[localIdx];
    const globalIdx = startAyah - 1 + localIdx;

    setPlayingIndex(globalIdx);
    setCurrentPlayingAyah(ayah.number);
    scrollToAyah(ayah.number);

    audioRef.current?.pause();
    audioRef.current = null;
    activeSingleVerseRef.current = null;

    const kickOff = () => {
      const a = new Audio(ayah.audio!);
      audioRef.current = a; // <─ assign to audioRef so stopPlayback can pause
      a.setAttribute("playsinline", "true");
      a.setAttribute("webkit-playsinline", "true");
      a.volume = isMuted ? 0 : volume;
      a.play();
      a.onended = () => {
        if (repeatEach) {
          if (verseRepeatCounterRef.current < repeatCount - 1) {
            verseRepeatCounterRef.current++;
            a.play();
          } else {
            verseRepeatCounterRef.current = 0;
            currentAyahIndex.current++;
            if (currentAyahIndex.current < ayahsToPlay.current.length) {
              playNextAyah();
            } else {
              stopPlayback();
            }
          }
        } else {
          currentAyahIndex.current++;
          if (currentAyahIndex.current < ayahsToPlay.current.length) {
            playNextAyah();
          } else {
            selectionRepeatCounterRef.current++;
            if (selectionRepeatCounterRef.current < repeatCount) {
              currentAyahIndex.current = 0;
              playNextAyah();
            } else {
              stopPlayback();
            }
          }
        }
      };
    };

    if (shouldPlayBismillah()) {
      try {
        await playBismillah();
      } catch {
        // skip if Bismillah fails
      }
    }
    kickOff();
  };

  // ─── Play All (entire Surah or selected range) or stop if already playing ─────
  const playAll = () => {
    if (!surah) return;
    if (isPlayingAllRef.current) {
      stopPlayback();
      return;
    }
    ayahsToPlay.current = surah.ayahs.slice(
      startAyah - 1,
      endAyah ?? surah.ayahs.length
    );
    currentAyahIndex.current = 0;
    verseRepeatCounterRef.current = 0;
    selectionRepeatCounterRef.current = 0;
    isPlayingAllRef.current = true;
    setIsPlayingAll(true);
    playNextAyah();
  };

  // ─── Play next/previous Ayah in single‐verse mode; or wrap Surah ────────────
  const playNext = () => {
    if (isPlayingAllRef.current) return;
    if (
      playingIndex !== null &&
      surah &&
      playingIndex < surah.ayahs.length - 1
    ) {
      playAyah(surah.ayahs[playingIndex + 1], playingIndex + 1);
    } else {
      nextSurah();
    }
  };
  const playPrevious = () => {
    if (isPlayingAllRef.current) return;
    if (playingIndex !== null && playingIndex > 0 && surah) {
      playAyah(surah.ayahs[playingIndex - 1], playingIndex - 1);
    } else {
      prevSurah();
    }
  };

  // ─── Navigate between Surahs ─────────────────────────────────────────────────
  const navigateToSurah = (surahNumber: number) => {
    setCurrentSurahNumber(surahNumber);
    navigate(`/surah/${surahNumber}`);
    setViewMode("translation");
    if (isPlayingAllRef.current) {
      setTimeout(playAll, 300);
    }
  };
  const nextSurah = () => {
    if (!surahList.length || !currentSurahNumber) return;
    const nxt = currentSurahNumber < 114 ? currentSurahNumber + 1 : 1;
    navigateToSurah(nxt);
  };
  const prevSurah = () => {
    if (!surahList.length || !currentSurahNumber) return;
    const prev = currentSurahNumber > 1 ? currentSurahNumber - 1 : 114;
    navigateToSurah(prev);
  };

  // ─── Surah search input handler ──────────────────────────────────────────────
  const handleSurahSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const q = e.target.value.toLowerCase();
    setSearchQuery(q);
    setFilteredSurahList(
      q
        ? surahList.filter(
            (s) =>
              s.englishName.toLowerCase().includes(q) ||
              s.name.toLowerCase().includes(q) ||
              s.number.toString().includes(q)
          )
        : surahList
    );
  };

  // ─── Copy an Ayah's text (with translation) ──────────────────────────────────
  const copyAyah = async (ayah: Ayah) => {
    const text =
      viewMode === "translation"
        ? `${ayah.text}\n\n${ayah.englishText}\n\n${surah?.englishName} ${
            ayah.number
          }`
        : `${ayah.text}\n\n${surah?.englishName} ${ayah.number}`;
    try {
      await navigator.clipboard.writeText(text);
      setCopiedAyah(ayah.number);
      setTimeout(() => setCopiedAyah(null), 2000);
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  };

  // ─── Share an Ayah's text ────────────────────────────────────────────────────
  const shareAyah = async (ayah: Ayah) => {
    const shareText =
      viewMode === "translation"
        ? `${ayah.text}\n\n${ayah.englishText}\n\n${surah?.englishName} ${
            ayah.number
          }`
        : `${ayah.text}\n\n${surah?.englishName} ${ayah.number}`;
    try {
      if (navigator.share) {
        await navigator.share({
          title: `${surah?.englishName} ${ayah.number}`,
          text: shareText,
        });
      } else {
        await navigator.clipboard.writeText(shareText);
        setCopiedAyah(ayah.number);
        setTimeout(() => setCopiedAyah(null), 2000);
        alert("Ayah copied to clipboard!");
      }
    } catch (err) {
      console.error("Failed to share:", err);
    }
  };

  // ─── RENDER: loading / error / "no surah" ────────────────────────────────────
  if (loading)
    return (
      <div className="flex justify-center items-center h-screen dark:bg-gray-900">
        <p className="text-center dark:text-gray-200">Loading Surah…</p>
      </div>
    );

  if (error)
    return (
      <div className="flex flex-col justify-center items-center h-screen dark:bg-gray-900">
        <p className="text-center text-red-600 dark:text-red-400 mb-4">
          {error}
        </p>
        <button
          onClick={() => navigate("/")}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Return to Home
        </button>
      </div>
    );

  if (!surah)
    return (
      <div className="flex flex-col justify-center items-center h-screen dark:bg-gray-900">
        <p className="text-center text-red-600 dark:text-red-400 mb-4">
          Surah not found.
        </p>
        <button
          onClick={() => navigate("/")}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Return to Home
        </button>
      </div>
    );

  // ─── Compute Mushaf page if needed (Reading view) ─────────────────────────────
  const startingMushafPage =
    currentSurahNumber && SURAH_TO_PAGE[currentSurahNumber]
      ? SURAH_TO_PAGE[currentSurahNumber]
      : 1;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-800 dark:text-gray-200">
      {/* ─── HEADER ─────────────────────────────────────────────────────────────────── */}
      <div className="bg-white dark:bg-gray-800 shadow-sm sticky top-0 z-40">
        <div className="max-w-5xl mx-auto px-4 py-4">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            {/* Surah selector (only in Translation view) */}
            {viewMode === "translation" && (
              <div className="flex items-center gap-4">
                <div className="relative">
                  <button
                    onClick={() =>
                      setIsSurahDropdownOpen(!isSurahDropdownOpen)
                    }
                    className="flex items-center gap-2 text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 text-sm font-medium"
                  >
                    {surah.englishName} ({surah.name})
                    <FaChevronDown
                      className={`transition-transform ${
                        isSurahDropdownOpen ? "transform rotate-180" : ""
                      }`}
                      size={12}
                    />
                  </button>
                  {isSurahDropdownOpen && (
                    <div className="absolute z-50 mt-1 w-56 max-h-96 overflow-y-auto bg-white dark:bg-gray-800 rounded-md shadow-lg border border-gray-200 dark:border-gray-700">
                      <div className="sticky top-0 p-2 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
                        <div className="relative">
                          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <FaSearch className="text-gray-400" />
                          </div>
                          <input
                            type="text"
                            value={searchQuery}
                            onChange={handleSurahSearch}
                            placeholder="Search surahs..."
                            className="w-full pl-10 pr-3 py-2 text-sm bg-white dark:bg-gray-800 text-gray-800 dark:text-white border border-gray-300 dark:border-gray-600 rounded focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                            autoFocus
                          />
                        </div>
                      </div>
                      <div className="py-1">
                        {filteredSurahList.length > 0 ? (
                          filteredSurahList.map((s) => (
                            <button
                              key={s.number}
                              onClick={() => {
                                navigateToSurah(s.number);
                                setIsSurahDropdownOpen(false);
                              }}
                              className={`block w-full text-left px-4 py-2 text-sm ${
                                s.number === surah.number
                                  ? "bg-emerald-100 dark:bg-emerald-900 text-emerald-800 dark:text-emerald-200"
                                  : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                              }`}
                            >
                              {s.number}. {s.englishName} ({s.name})
                            </button>
                          ))
                        ) : (
                          <div className="px-4 py-2 text-sm text-gray-500 dark:text-gray-400">
                            No surahs found
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* View Mode / Translation / Reciter / Play Audio */}
            <div className="flex flex-wrap items-center gap-3">
              {/* View Mode Buttons */}
              <div className="flex rounded-md shadow-sm">
                <button
                  onClick={() => setViewMode("translation")}
                  className={`px-3 py-2 text-sm font-medium flex items-center gap-2 ${
                    viewMode === "translation"
                      ? "bg-emerald-500 text-white"
                      : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300"
                  } rounded-l-md`}
                >
                  Translation
                </button>
                <button
                  onClick={() => setViewMode("page")}
                  className={`px-3 py-2 text-sm font-medium rounded-r-md flex items-center gap-2 ${
                    viewMode === "page"
                      ? "bg-emerald-500 text-white"
                      : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300"
                  }`}
                >
                  Reading
                </button>
              </div>

              {/* Translation Selector */}
              {viewMode === "translation" && (
                <select
                  value={translation}
                  onChange={(e) => setTranslation(e.target.value)}
                  className="bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200 border border-gray-300 dark:border-gray-600 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                >
                  <option value="en.sahih">English</option>
                  <option value="bn.bengali">Bengali</option>
                  <option value="ur.jalandhry">Urdu</option>
                  <option value="fr.hamidullah">French (Hamidullah)</option>
                  <option value="de.aburida">German (Abu Rida)</option>
                  <option value="tr.diyanet">Turkish (Diyanet)</option>
                  <option value="id.muntakhab">Indonesian</option>
                  <option value="ms.basmeih">Malay</option>
                  <option value="hi.hindi">Hindi</option>
                  <option value="ta.tamil">Tamil</option>
                  <option value="ru.kuliev">Russian (Kuliev)</option>
                  <option value="zh.jian">Chinese (Jian)</option>
                  <option value="es.cortes">Spanish (Cortes)</option>
                  <option value="pt.elhayek">Portuguese (El-Hayek)</option>
                  <option value="fa.ghomshei">Persian (Ghomshei)</option>
                </select>
              )}

              {/* Reciter Selector */}
              {viewMode === "translation" && (
                <select
                  value={reciter}
                  onChange={(e) => setReciter(e.target.value)}
                  className="bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200 border border-gray-300 dark:border-gray-600 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 w-48"
                >
                  <option value="ar.alafasy">Mishary Alafasy</option>
                  <option value="ar.minshawi">Al-Minshawi</option>
                  <option value="ar.husary">Mahmoud Al-Hussary</option>
                  <option value="ar.abdulbasitmurattal">Abdul Basit</option>
                  <option value="ar.saoodshuraym">Saood Shuraym</option>
                  <option value="ar.abdullahbasfar">Abdullah Basfar</option>
                  <option value="ar.abdulsamad">Abdul Samad</option>
                  <option value="ar.shaatree">Abu Bakr Ash-Shaatree</option>
                  <option value="ar.ahmedajamy">Ahmed ibn Ali al-Ajamy</option>
                  <option value="ar.hanirifai">Hani Rifai</option>
                  <option value="ar.ibrahimakhbar">Ibrahim Akhdar</option>
                  <option value="ar.mahermuaiqly">Maher al-Muaiqly</option>
                  <option value="ar.muhammadayyoub">Muhammad Ayyoub</option>
                  <option value="ar.muhammadjibreel">Muhammad Jibreel</option>
                </select>
              )}

              {/* Play All (“Play Audio”) Button */}
              {viewMode === "translation" && (
                <button
                  onClick={playAll}
                  className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium ${
                    isPlayingAll
                      ? "bg-red-500 hover:bg-red-600 text-white"
                      : "bg-emerald-500 hover:bg-emerald-600 text-white"
                  }`}
                >
                  {isPlayingAll ? "Stop Playback" : "Play Audio"}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ─── SURAH CONTENT ──────────────────────────────────────────────────────────── */}
      <div className="max-w-5xl mx-auto px-4 py-6">
        {/* Bismillah (only in translation view, excluding Surah 1 & 9) */}
        {surah &&
          ![1, 9].includes(surah.number) &&
          viewMode === "translation" && (
            <div className="w-full flex justify-center my-6">
              <p className="font-arabic text-4xl text-center text-gray-800 dark:text-gray-100">
                بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ
              </p>
            </div>
          )}

        {viewMode === "translation" ? (
          <div className="space-y-6">
            {surah.ayahs.map((ayah, index) => {
              const showArabic =
                index === 0 && ![1, 9].includes(surah.number)
                  ? ayah.text.replace(
                      /^بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ[\s\u200C]*[,،]?/u,
                      ""
                    )
                  : ayah.text;

              return (
                <div
                  key={ayah.number}
                  id={`ayah-${ayah.number}`}
                  className={`
                    relative
                    flex flex-col w-full gap-4 px-3 py-4 rounded-lg transition-all duration-200 group
                    ${
                      playingIndex === index
                        ? "bg-emerald-100 dark:bg-emerald-900"
                        : "border border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800"
                    }
                    ${
                      copiedAyah === ayah.number
                        ? "border-2 border-emerald-500 dark:border-emerald-400"
                        : ""
                    }
                  `}
                >
                  {/* Top row: verse number + play + bookmark (left) and ⋯ (right) */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {/* Verse number (just the ayah number) */}
                      <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
                        {ayah.number}
                      </span>

                      {/* Play / Stop button for single verse */}
                      <button
                        onClick={() => playAyah(ayah, index)}
                        className={`
                          flex items-center justify-center w-7 h-7 rounded-full
                          ${
                            playingIndex === index
                              ? "bg-emerald-500 text-white"
                              : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"
                          }
                        `}
                        title={
                          playingIndex === index
                            ? "Stop Playback"
                            : "Play Verse"
                        }
                      >
                        {playingIndex === index ? (
                          <FaPause size={12} />
                        ) : (
                          <FaPlay size={12} />
                        )}
                      </button>

                      {/* Bookmark button */}
                      <button
                        onClick={() =>
                          handleBookmarkToggle(surah.number, ayah.number)
                        }
                        className="w-7 h-7 flex items-center justify-center rounded-full text-gray-500 hover:text-emerald-500 dark:text-gray-400 dark:hover:text-emerald-400"
                        title={
                          isAyahBookmarked(surah.number, ayah.number)
                            ? "Remove Bookmark"
                            : "Add Bookmark"
                        }
                      >
                        {isAyahBookmarked(surah.number, ayah.number) ? (
                          <FaStar className="text-emerald-500" />
                        ) : (
                          <FaRegStar size={12} />
                        )}
                      </button>
                    </div>

                    {/* More (⋯) menu button */}
                    <button
                      onClick={() => openVerseSettings(ayah.number)}
                      className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-300 dark:hover:text-gray-100"
                      title="More Settings"
                    >
                      <span className="text-xl leading-none">⋯</span>
                    </button>
                  </div>

                  {/* Arabic text (full width) */}
                  <p className="w-full font-arabic text-right text-2xl leading-loose text-gray-800 dark:text-gray-100">
                    {showArabic}
                  </p>

                  {/* English translation (full width) */}
                  <p className="w-full text-gray-700 dark:text-gray-300 text-base leading-relaxed break-words">
                    {ayah.englishText}
                  </p>

                  {settingsVerse === ayah.number && (
                    <div
                      className="absolute top-0 right-0 mt-10 mr-4 w-64 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg z-10"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <div className="p-4">
                        <h2 className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-3">
                          Verse {ayah.number} Settings
                        </h2>
                        <div className="mb-4">
                          <p className="text-sm text-gray-700 dark:text-gray-300 mb-2">
                            Play Count
                          </p>
                          <div className="flex items-center gap-2 flex-wrap">
                            {[
                              { label: "1×", value: 1 },
                              { label: "2×", value: 2 },
                              { label: "3×", value: 3 },
                              { label: "5×", value: 5 },
                              { label: "7×", value: 7 },
                              { label: "∞", value: 0 },
                            ].map((opt) => (
                              <button
                                key={opt.label}
                                onClick={() => {
                                  setRepeatCountMap((prev) => ({
                                    ...prev,
                                    [ayah.number]: opt.value,
                                  }));
                                }}
                                className={`px-3 py-1 border rounded text-sm ${
                                  (repeatCountMap[ayah.number] ?? 1) === opt.value
                                    ? "bg-emerald-500 text-white"
                                    : "bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-600"
                                }`}
                              >
                                {opt.label}
                              </button>
                            ))}
                          </div>
                        </div>
                        <div className="mb-4">
                          <p className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-2">
                            Actions
                          </p>
                          <div className="flex flex-col gap-2">
                            <button
                              onClick={() => {
                                copyAyah(ayah);
                                closeVerseSettings();
                              }}
                              className="flex items-center gap-2 px-3 py-2 text-sm bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded hover:bg-gray-300 dark:hover:bg-gray-600"
                            >
                              {copiedAyah === ayah.number ? (
                                <FaCheck className="text-emerald-500" size={12} />
                              ) : (
                                <FaCopy size={12} />
                              )}
                              {copiedAyah === ayah.number
                                ? "Copied!"
                                : "Copy Verse"}
                            </button>
                            <button
                              onClick={() => {
                                shareAyah(ayah);
                                closeVerseSettings();
                              }}
                              className="flex items-center gap-2 px-3 py-2 text-sm bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded hover:bg-gray-300 dark:hover:bg-gray-600"
                            >
                              <FaShare size={12} />
                              Share Verse
                            </button>
                          </div>
                        </div>
                        <div className="flex justify-end space-x-2">
                          <button
                            onClick={closeVerseSettings}
                            className="px-3 py-1 text-sm bg-gray-300 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded hover:bg-gray-400 dark:hover:bg-gray-600"
                          >
                            Cancel
                          </button>
                          <button
                            onClick={closeVerseSettings}
                            className="px-3 py-1 text-sm bg-emerald-500 text-white rounded hover:bg-emerald-600"
                          >
                            OK
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        ) : (
          /* ─── READING (Mushaf) VIEW ───────────────────────────────────────── */
          <div className="pl-12">
            <PageView initialPage={startingMushafPage} />
          </div>
        )}
      </div>

      {/* ─── SIMPLIFIED AUDIO PLAYER (bottom fixed, only in Translation view) ───────────────────── */}
      {viewMode === "translation" && (
        <div className="fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 shadow-lg z-50">
          <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between">
            {/* Previous Surah button */}
            <button
              onClick={playPrevious}
              className="p-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={
                surah != null &&
                currentSurahNumber === 1 &&
                !isPlayingAllRef.current
              }
              title="Previous Surah"
            >
              <FaBackward size={20} />
            </button>

            {/* Play / Pause entire Surah */}
            <button
              onClick={
                playingIndex !== null || isPlayingAll ? stopPlayback : playAll
              }
              className={`
                flex items-center justify-center w-12 h-12 rounded-full
                ${
                  playingIndex !== null || isPlayingAll
                    ? "bg-red-500 hover:bg-red-600 text-white"
                    : "bg-emerald-500 hover:bg-emerald-600 text-white"
                }
              `}
              title={
                playingIndex !== null || isPlayingAll
                  ? "Stop Playback"
                  : "Play Surah"
              }
            >
              {playingIndex !== null || isPlayingAll ? (
                <FaPause size={18} />
              ) : (
                <FaPlay size={18} />
              )}
            </button>

            {/* Next Surah button */}
            <button
              onClick={playNext}
              className="p-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={
                surah != null &&
                currentSurahNumber === 114 &&
                !isPlayingAllRef.current
              }
              title="Next Surah"
            >
              <FaForward size={20} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
