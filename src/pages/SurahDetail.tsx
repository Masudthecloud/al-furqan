import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState, useRef } from "react";
import {
  fetchSurahByIdWithTranslation,
  fetchSurahAudio,
  fetchSurahList,
} from "../services/quranService";
import {
  FaRegStar,
  FaStar,
  FaPlay,
  FaPause,
  FaStepForward,
  FaStepBackward,
  FaVolumeUp,
  FaVolumeDown,
  FaVolumeMute,
  FaChevronDown,
  FaSearch,
  FaBook,
  FaLanguage,
  FaCopy,
  FaShare,
  FaCheck,
} from "react-icons/fa";

interface Ayah {
  number: number;
  text: string;
  englishText?: string;
  audio?: string;
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

export default function SurahDetail() {
  const { id } = useParams();
  const navigate = useNavigate();

  // State
  const [surah, setSurah] = useState<Surah | null>(null);
  const [surahList, setSurahList] = useState<SurahInfo[]>([]);
  const [filteredSurahList, setFilteredSurahList] = useState<SurahInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [translation, setTranslation] = useState("en.sahih");
  const [reciter, setReciter] = useState("ar.alafasy");
  const [viewMode, setViewMode] = useState<"reading" | "translation">("reading");
  const [bookmarks, setBookmarks] = useState<number[]>([]);
  const [startAyah, setStartAyah] = useState(1);
  const [endAyah, setEndAyah] = useState<number | null>(null);
  const [repeatEach, setRepeatEach] = useState(false);
  const [repeatCount, setRepeatCount] = useState(1);
  const [currentRepeat, setCurrentRepeat] = useState(1);
  const [playingIndex, setPlayingIndex] = useState<number | null>(null);
  const [isPlayingAll, setIsPlayingAll] = useState(false);
  const [currentPlayingAyah, setCurrentPlayingAyah] = useState<number | null>(null);
  const [volume, setVolume] = useState(0.7);
  const [isMuted, setIsMuted] = useState(false);
  const [isSurahDropdownOpen, setIsSurahDropdownOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentSurahNumber, setCurrentSurahNumber] = useState<number | null>(null);
  const [isPlayerExpanded, setIsPlayerExpanded] = useState(false);
  const [isHoveringPlayAll, setIsHoveringPlayAll] = useState(false);
  const [copiedAyah, setCopiedAyah] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Refs
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const ayahsToPlay = useRef<Ayah[]>([]);
  const currentAyahIndex = useRef(0);
  const verseRepeatCounterRef = useRef(0);
  const selectionRepeatCounterRef = useRef(0);
  const isPlayingAllRef = useRef(false);

  const reciterBaseUrls: { [key: string]: string } = {
    "ar.alafasy": "https://verses.quran.com/Alafasy/mp3",
    "ar.minshawi": "https://verses.quran.com/Minshawy/mp3",
    "ar.husary": "https://verses.quran.com/Husary/mp3",
    "ar.abdulbasitmurattal": "https://verses.quran.com/AbdulBasetMurattal/mp3",
    "ar.saoodshuraym": "https://verses.quran.com/Shuraym/mp3",
    "ar.sudais": "https://verses.quran.com/Sudais/mp3",
      // newly added reciters:
    "ar.abdullahbasfar":     "https://verses.quran.com/Basfar/mp3",
    "ar.abdulsamad":         "https://verses.quran.com/AbdulSamad/mp3",
    "ar.shaatree":           "https://verses.quran.com/Shaatree/mp3",
    "ar.ahmedajamy":         "https://verses.quran.com/AhmedIbnAliAlAjami/mp3",
    "ar.hanirifai":          "https://verses.quran.com/HaniRifai/mp3",
    "ar.ibrahimakhbar":      "https://verses.quran.com/IbrahimAkhdar/mp3",
    "ar.mahermuaiqly":       "https://verses.quran.com/MaherAlMuaiqly/mp3",
    "ar.muhammadayyoub":     "https://verses.quran.com/MuhammadAyyoub/mp3",
    "ar.muhammadjibreel":    "https://verses.quran.com/MuhammadJibreel/mp3",
  };

  // Load bookmarks & surah list
  useEffect(() => {
    const saved = localStorage.getItem("bookmarks");
    if (saved) {
      try {
        const arr = JSON.parse(saved);
        if (Array.isArray(arr)) setBookmarks(arr);
      } catch (error) {
        console.error('Failed to parse bookmarks:', error);
      }
    }
    fetchSurahList().then((list) => {
      setSurahList(list);
      setFilteredSurahList(list);
    });
  }, []);

  // Track route param
  useEffect(() => {
    if (!id) return;
    setCurrentSurahNumber(parseInt(id, 10));
  }, [id]);

  // Fetch surah data
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
        const merged = arabic.ayahs.map((ayah: Ayah, i: number) => ({
          number: i + 1,
          text: ayah.text,
          englishText: trans.ayahs[i]?.text,
          audio: audio[i]?.audio,
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

  // Sync volume/mute
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = isMuted ? 0 : volume;
    }
  }, [volume, isMuted]);

  // Cleanup on unmount
  useEffect(
    () => () => {
      audioRef.current?.pause();
      audioRef.current = null;
    },
    []
  );

  // Bookmark helpers
  const toggleBookmark = (ayahNum: number) => {
    const sid = parseInt(id || "1", 10) * 1000 + ayahNum;
    const updated = bookmarks.includes(sid)
      ? bookmarks.filter((b) => b !== sid)
      : [...bookmarks, sid];
    setBookmarks(updated);
    localStorage.setItem("bookmarks", JSON.stringify(updated));
  };
  const isAyahBookmarked = (n: number) =>
    bookmarks.includes(parseInt(id || "1", 10) * 1000 + n);

  // Bismillah logic
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
      audioRef.current = b;
      b.volume = isMuted ? 0 : volume;
      b.onerror = () => {
        console.log(`Bismillah not available for ${reciter}`);
        resolve();
      };
      b.onended = () => resolve();
      b.play().catch(() => resolve());
    });

  // Stop everything
  const stopPlayback = () => {
    audioRef.current?.pause();
    isPlayingAllRef.current = false;
    setIsPlayingAll(false);
    setPlayingIndex(null);
    setCurrentPlayingAyah(null);
    setCurrentRepeat(1);
    verseRepeatCounterRef.current = 0;
    selectionRepeatCounterRef.current = 0;
  };

  // Add this new function in the component
  const scrollToAyah = (ayahNumber: number) => {
    const element = document.getElementById(`ayah-${ayahNumber}`);
    if (element) {
      element.scrollIntoView({
        behavior: 'smooth',
        block: 'center'
      });
    }
  };

  // Update the playNextAyah function to include scrolling
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

    const kickOff = () => {
      const a = new Audio(ayah.audio!);
      audioRef.current = a;
      a.volume = isMuted ? 0 : volume;
      a.play();
      a.onended = () => {
        if (repeatEach) {
          if (verseRepeatCounterRef.current < repeatCount - 1) {
            verseRepeatCounterRef.current++;
            setCurrentRepeat(verseRepeatCounterRef.current + 1);
            a.play();
          } else {
            verseRepeatCounterRef.current = 0;
            setCurrentRepeat(1);
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
              setCurrentRepeat(selectionRepeatCounterRef.current + 1);
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
        // skip if missing
      }
    }
    kickOff();
  };

  // Play All entry
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
    setCurrentRepeat(1);
    isPlayingAllRef.current = true;
    setIsPlayingAll(true);
    playNextAyah();
  };

  // Update the playAyah function to include scrolling
  const playAyah = async (ayah: Ayah, idx: number) => {
    if (playingIndex === idx && audioRef.current) {
      if (audioRef.current.paused) {
        await audioRef.current.play();
      } else {
        audioRef.current.pause();
      }
      return;
    }
    audioRef.current?.pause();
    setPlayingIndex(idx);
    setCurrentPlayingAyah(ayah.number);
    scrollToAyah(ayah.number);
    isPlayingAllRef.current = false;
    setIsPlayingAll(false);

    const a = new Audio(ayah.audio!);
    audioRef.current = a;
    a.volume = isMuted ? 0 : volume;
    await a.play();
    a.onended = () => {
      setPlayingIndex(null);
      setCurrentPlayingAyah(null);
    };
  };

  // Navigation
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
  const navigateToSurah = (num: number) => {
    setCurrentSurahNumber(num);
    navigate(`/surah/${num}`);
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

  // UI handlers
  const toggleMute = () => setIsMuted((m) => !m);
  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const v = parseFloat(e.target.value);
    setVolume(v);
    setIsMuted(v === 0);
  };
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

  const copyAyah = async (ayah: Ayah) => {
    const text = viewMode === "translation" 
      ? `${ayah.text}\n\n${ayah.englishText}\n\n${surah?.englishName} ${ayah.number}`
      : `${ayah.text}\n\n${surah?.englishName} ${ayah.number}`;
    await navigator.clipboard.writeText(text);
    setCopiedAyah(ayah.number);
    setTimeout(() => setCopiedAyah(null), 2000);
  };

  const shareAyah = async (ayah: Ayah) => {
    const text = viewMode === "translation"
      ? `${ayah.text}\n\n${ayah.englishText}\n\n${surah?.englishName} ${ayah.number}`
      : `${ayah.text}\n\n${surah?.englishName} ${ayah.number}`;
    if (navigator.share) {
      try {
        await navigator.share({
          title: `${surah?.englishName} ${ayah.number}`,
          text: text,
        });
      } catch (err) {
        console.error('Error sharing:', err);
      }
    } else {
      // Fallback for browsers that don't support Web Share API
      await copyAyah(ayah);
    }
  };

  if (loading)
    return <div className="flex justify-center items-center h-screen dark:bg-gray-900"><p className="text-center dark:text-gray-200">Loading Surah...</p></div>;
  if (error)
    return (
      <div className="flex flex-col justify-center items-center h-screen dark:bg-gray-900">
        <p className="text-center text-red-600 dark:text-red-400 mb-4">{error}</p>
        <button
          onClick={() => navigate('/')}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Return to Home
        </button>
      </div>
    );
  if (!surah)
    return (
      <div className="flex flex-col justify-center items-center h-screen dark:bg-gray-900">
        <p className="text-center text-red-600 dark:text-red-400 mb-4">Surah not found.</p>
        <button
          onClick={() => navigate('/')}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Return to Home
        </button>
      </div>
    );

  return (
    <div className="relative pb-32 min-h-screen dark:bg-gray-900">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 shadow-sm">
        <div className="max-w-5xl mx-auto px-4 py-3">
          <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
            <div className="flex items-center gap-4">
              <div className="relative">
                <button
                  onClick={() => setIsSurahDropdownOpen(!isSurahDropdownOpen)}
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
                          className="w-full pl-10 pr-3 py-2 text-sm bg-white dark:bg-gray-800 text-gray-800 dark:text-white border border-gray-300 dark:border-gray-600 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
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
                                ? "bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200"
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

            <div className="flex flex-wrap items-center gap-3">
              <div className="flex rounded-md shadow-sm">
                <button
                  onClick={() => setViewMode("reading")}
                  className={`px-3 py-2 text-sm font-medium rounded-l-md flex items-center gap-2 ${
                    viewMode === "reading"
                      ? "bg-blue-500 text-white"
                      : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300"
                  }`}
                >
                  <FaBook size={12} />
                  Reading
                </button>
                <button
                  onClick={() => setViewMode("translation")}
                  className={`px-3 py-2 text-sm font-medium rounded-r-md flex items-center gap-2 ${
                    viewMode === "translation"
                      ? "bg-blue-500 text-white"
                      : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300"
                  }`}
                >
                  <FaLanguage size={12} />
                  Translation
                </button>
              </div>

              {viewMode === "translation" && (
                <select
                  value={translation}
                  onChange={(e) => setTranslation(e.target.value)}
                  className="bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200 border border-gray-300 dark:border-gray-600 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="en.sahih">Sahih International</option>
                  <option value="en.yusufali">Yusuf Ali</option>
                  <option value="bn.bengali">Bengali</option>
                  <option value="ur.jalandhry">Urdu</option>
                </select>
              )}

              <select
                value={reciter}
                onChange={(e) => setReciter(e.target.value)}
                className="bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200 border border-gray-300 dark:border-gray-600 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 w-48"
              >
                <option value="ar.alafasy">Mishary Alafasy</option>
                <option value="ar.minshawi">Al-Minshawi</option>
                <option value="ar.husary">Mahmoud Al-Hussary</option>
                <option value="ar.abdulbasitmurattal">Abdul Basit</option>
                <option value="ar.saoodshuraym">Saood Shuraym</option>
                <option value="ar.sudais">Abdul Rahman as-Sudâis</option>
                  {/* Newly added reciters */}
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

              {/* Play Audio Button */}
              <button
                onClick={playAll}
                onMouseEnter={() => setIsHoveringPlayAll(true)}
                onMouseLeave={() => setIsHoveringPlayAll(false)}
                className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium ${
                  isPlayingAll
                    ? "bg-red-500 hover:bg-red-600 text-white"
                    : "bg-green-500 hover:bg-green-600 text-white"
                }`}
              >
                {isHoveringPlayAll && isPlayingAll ? "Stop Playback" : "Play Audio"}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Surah Content */}
      <div className="max-w-5xl mx-auto px-4 py-6">
        {surah && ![1, 9].includes(surah.number) && (
          <div className="w-full flex justify-center my-6">
            <p className="font-arabic text-4xl text-center text-gray-800 dark:text-gray-100">
              بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ
            </p>
          </div>
        )}

        {viewMode === "reading" ? (
          /* Quran.com Style Reading View */
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
                  className={`p-4 rounded-lg transition-all duration-200 group ${
                    index === playingIndex
                      ? "bg-blue-50 dark:bg-blue-900/20 border-l-4 border-blue-500"
                      : "bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700"
                  }`}
                >
                  {/* Ayah number and bookmark */}
                  <div className="flex justify-between items-center mb-2">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 text-sm font-medium">
                        {ayah.number}
                      </div>
                    </div>
                    <button
                      onClick={() => toggleBookmark(ayah.number)}
                      className="text-gray-400 hover:text-yellow-500 dark:hover:text-yellow-400"
                      title="Bookmark"
                    >
                      {isAyahBookmarked(ayah.number) ? (
                        <FaStar className="text-yellow-500" />
                      ) : (
                        <FaRegStar />
                      )}
                    </button>
                  </div>

                  {/* Arabic text */}
                  <p className="font-arabic text-right text-3xl leading-loose text-gray-800 dark:text-gray-100 mb-2">
                    {showArabic}
                  </p>

                  {/* Ayah controls */}
                  <div className="flex justify-end items-center gap-2">
                    <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => copyAyah(ayah)}
                        className="p-2 text-gray-500 hover:text-blue-500 dark:text-gray-400 dark:hover:text-blue-400"
                        title="Copy verse"
                      >
                        {copiedAyah === ayah.number ? (
                          <FaCheck className="text-green-500" />
                        ) : (
                          <FaCopy />
                        )}
                      </button>
                      <button
                        onClick={() => shareAyah(ayah)}
                        className="p-2 text-gray-500 hover:text-blue-500 dark:text-gray-400 dark:hover:text-blue-400"
                        title="Share verse"
                      >
                        <FaShare />
                      </button>
                    </div>
                    <button
                      onClick={() => playAyah(ayah, index)}
                      className={`flex items-center justify-center w-8 h-8 rounded-full ${
                        playingIndex === index
                          ? "bg-blue-500 text-white"
                          : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300"
                      }`}
                    >
                      {playingIndex === index ? (
                        <FaPause size={12} />
                      ) : (
                        <FaPlay size={12} className="ml-1" />
                      )}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          /* Translation View */
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
                  className={`p-5 rounded-lg transition-all duration-200 group ${
                    index === playingIndex
                      ? "bg-blue-50 dark:bg-blue-900/20 border-l-4 border-blue-500"
                      : "bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700"
                  }`}
                >
                  <div className="flex justify-between items-start mb-3">
                    <div className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 text-sm font-medium">
                      {ayah.number}
                    </div>
                    <button
                      onClick={() => toggleBookmark(ayah.number)}
                      className="text-gray-400 hover:text-yellow-500 dark:hover:text-yellow-400"
                      title="Bookmark"
                    >
                      {isAyahBookmarked(ayah.number) ? (
                        <FaStar className="text-yellow-500" />
                      ) : (
                        <FaRegStar />
                      )}
                    </button>
                  </div>

                  <p className="font-arabic text-right text-3xl leading-loose mb-4 text-gray-800 dark:text-gray-100">
                    {showArabic}
                  </p>

                  <div className="mb-4">
                    <div className="text-xs uppercase text-gray-500 dark:text-gray-400 mb-1">
                      Translation
                    </div>
                    <p className="text-gray-700 dark:text-gray-300">
                      {ayah.englishText}
                    </p>
                  </div>

                  <div className="flex justify-end items-center gap-2">
                    <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => copyAyah(ayah)}
                        className="p-2 text-gray-500 hover:text-blue-500 dark:text-gray-400 dark:hover:text-blue-400"
                        title="Copy verse"
                      >
                        {copiedAyah === ayah.number ? (
                          <FaCheck className="text-green-500" />
                        ) : (
                          <FaCopy />
                        )}
                      </button>
                      <button
                        onClick={() => shareAyah(ayah)}
                        className="p-2 text-gray-500 hover:text-blue-500 dark:text-gray-400 dark:hover:text-blue-400"
                        title="Share verse"
                      >
                        <FaShare />
                      </button>
                    </div>
                    <button
                      onClick={() => playAyah(ayah, index)}
                      className={`flex items-center justify-center w-10 h-10 rounded-full ${
                        playingIndex === index
                          ? "bg-blue-500 text-white"
                          : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"
                      }`}
                    >
                      {playingIndex === index ? (
                        <FaPause size={14} />
                      ) : (
                        <FaPlay size={14} className="ml-1" />
                      )}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Audio Player */}
      <div className={`fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 shadow-lg z-50 transition-all duration-300 ${isPlayerExpanded ? "h-40" : "h-20"}`}>
        <div className="max-w-5xl mx-auto h-full flex flex-col">
          <div className="flex items-center justify-between p-4 h-20">
            <div className="flex items-center gap-4">
              <button
                onClick={() => setIsPlayerExpanded(!isPlayerExpanded)}
                className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
              >
                <FaChevronDown
                  className={`transition-transform ${isPlayerExpanded ? "transform rotate-180" : ""}`}
                />
              </button>
              
              <div className="flex items-center gap-2">
                <button
                  onClick={prevSurah}
                  className="p-2 rounded-full text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                  title="Previous Surah"
                >
                  <FaStepBackward />
                </button>
                <div className="text-sm font-medium text-gray-700 dark:text-gray-300 min-w-[120px]">
                  {surah.englishName} ({surah.name})
                </div>
                <button
                  onClick={nextSurah}
                  className="p-2 rounded-full text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                  title="Next Surah"
                >
                  <FaStepForward />
                </button>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <button
                onClick={playPrevious}
                disabled={!currentPlayingAyah}
                className="p-2 rounded-full text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-50"
                title="Previous Ayah"
              >
                <FaStepBackward />
              </button>
              <button
                onClick={() => {
                  if (isPlayingAllRef.current || playingIndex !== null) {
                    if (audioRef.current?.paused) {
                      audioRef.current.play();
                      setIsPlayingAll(true);
                    } else {
                      audioRef.current?.pause();
                      setIsPlayingAll(false);
                    }
                  } else {
                    playAll();
                  }
                }}
                className="p-3 rounded-full bg-blue-500 text-white hover:bg-blue-600"
              >
                {isPlayingAll || playingIndex !== null ? (
                  <FaPause />
                ) : (
                  <FaPlay />
                )}
              </button>
              <button
                onClick={playNext}
                disabled={!currentPlayingAyah}
                className="p-2 rounded-full text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-50"
                title="Next Ayah"
              >
                <FaStepForward />
              </button>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={toggleMute}
                className="p-2 text-gray-700 dark:text-gray-300"
                title={isMuted ? "Unmute" : "Mute"}
              >
                {isMuted ? (
                  <FaVolumeMute />
                ) : volume > 0.5 ? (
                  <FaVolumeUp />
                ) : (
                  <FaVolumeDown />
                )}
              </button>
              <input
                type="range"
                min="0"
                max="1"
                step="0.01"
                value={volume}
                onChange={handleVolumeChange}
                className="w-20 accent-blue-500"
              />
            </div>
          </div>

          {isPlayerExpanded && (
            <div className="p-4 border-t border-gray-200 dark:border-gray-700 flex-1">
              <div className="flex flex-col md:flex-row md:items-center gap-4 md:gap-6">
                <div className="text-sm text-gray-700 dark:text-gray-300">
                  {currentPlayingAyah
                    ? `Now Playing: Ayah ${currentPlayingAyah}`
                    : "Select verses to play"}
                </div>
                
                <div className="flex flex-wrap items-center gap-4">
                  <div className="flex items-center gap-2">
                    <label className="text-sm text-gray-700 dark:text-gray-300">
                      From:
                      <input
                        type="number"
                        min="1"
                        max={surah.ayahs.length}
                        value={startAyah}
                        onChange={(e) => {
                          const v = Math.max(
                            1,
                            Math.min(surah.ayahs.length, Number(e.target.value))
                          );
                          setStartAyah(v);
                        }}
                        className="ml-1 border border-gray-300 dark:border-gray-600 rounded w-12 px-2 py-1 bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </label>
                    <label className="text-sm text-gray-700 dark:text-gray-300">
                      To:
                      <input
                        type="number"
                        min="1"
                        max={surah.ayahs.length}
                        value={endAyah ?? ""}
                        onChange={(e) => {
                          const v =
                            e.target.value === ""
                              ? null
                              : Math.max(
                                  1,
                                  Math.min(
                                    surah.ayahs.length,
                                    Number(e.target.value)
                                  )
                                );
                          setEndAyah(v);
                        }}
                        className="ml-1 border border-gray-300 dark:border-gray-600 rounded w-12 px-2 py-1 bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </label>
                  </div>

                  <div className="flex items-center gap-2">
                    <label className="flex items-center gap-1 text-sm text-gray-700 dark:text-gray-300">
                      <input
                        type="checkbox"
                        checked={repeatEach}
                        onChange={() => setRepeatEach(!repeatEach)}
                        className="rounded text-blue-600 dark:text-blue-400 focus:ring-blue-500 dark:focus:ring-blue-600"
                      />
                      Repeat Each
                    </label>
                    <label className="text-sm text-gray-700 dark:text-gray-300">
                      Times:
                      <select
                        value={repeatCount}
                        onChange={(e) => setRepeatCount(Number(e.target.value))}
                        className="ml-1 border border-gray-300 dark:border-gray-600 rounded px-2 py-1 bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      >
                        {[1, 2, 3, 4, 5].map((num) => (
                          <option key={num} value={num}>
                            {num}
                          </option>
                        ))}
                      </select>
                    </label>
                  </div>

                  <button
                    onClick={playAll}
                    className={`px-3 py-1 rounded-md text-sm flex items-center gap-2 ${
                      isPlayingAll
                        ? "bg-red-500 hover:bg-red-600 text-white"
                        : "bg-green-500 hover:bg-green-600 text-white"
                    }`}
                  >
                    <FaPlay size={12} />
                    {isPlayingAll ? "Stop Playback" : "Play Selection"}
                  </button>
                </div>
              </div>

              {isPlayingAll && repeatCount > 1 && (
                <div className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                  Repeat {currentRepeat} of {repeatCount}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}