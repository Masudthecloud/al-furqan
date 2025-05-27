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

const SurahDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [surah, setSurah] = useState<Surah | null>(null);
  const [surahList, setSurahList] = useState<SurahInfo[]>([]);
  const [filteredSurahList, setFilteredSurahList] = useState<SurahInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [translation, setTranslation] = useState("en.sahih");
  const [reciter, setReciter] = useState("ar.alafasy");
  const [showTranslation, setShowTranslation] = useState(true);
  const [bookmarks, setBookmarks] = useState<number[]>([]);
  const [startAyah, setStartAyah] = useState(1);
  const [endAyah, setEndAyah] = useState<number | null>(null);
  const [repeatEach, setRepeatEach] = useState(false);
  const [playingIndex, setPlayingIndex] = useState<number | null>(null);
  const [isPlayingAll, setIsPlayingAll] = useState(false);
  const [currentPlayingAyah, setCurrentPlayingAyah] = useState<number | null>(null);
  const [volume, setVolume] = useState(0.7);
  const [isMuted, setIsMuted] = useState(false);
  const [isSurahDropdownOpen, setIsSurahDropdownOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const currentAyahIndex = useRef<number>(0);
  const ayahsToPlay = useRef<Ayah[]>([]);
  const [currentSurahNumber, setCurrentSurahNumber] = useState<number | null>(null);

  const reciterBaseUrls: { [key: string]: string } = {
    "ar.alafasy": "https://verses.quran.com/Alafasy/mp3",
    "ar.husary": "https://verses.quran.com/Husary/mp3",
    "ar.abdulbasitmurattal": "https://verses.quran.com/AbdulBasetMurattal/mp3",
    "ar.minshawi": "https://verses.quran.com/Minshawy/mp3",
    "ar.saoodshuraym": "https://verses.quran.com/Shuraym/mp3",
  };

  useEffect(() => {
    const saved = localStorage.getItem("bookmarks");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          setBookmarks(parsed);
        }
      } catch (e) {
        console.error("Error parsing bookmarks:", e);
      }
    }
    
    fetchSurahList().then((list) => {
      setSurahList(list);
      setFilteredSurahList(list);
    });
  }, []);

  useEffect(() => {
    if (!id) return;
    setCurrentSurahNumber(parseInt(id));
  }, [id]);

  useEffect(() => {
    if (!currentSurahNumber) return;

    const loadData = async () => {
      try {
        setLoading(true);
        const [translated, arabic, audio] = await Promise.all([
          fetchSurahByIdWithTranslation(currentSurahNumber.toString(), translation),
          fetchSurahByIdWithTranslation(currentSurahNumber.toString(), "ar"),
          fetchSurahAudio(currentSurahNumber.toString(), reciter),
        ]);

        const mergedAyahs: Ayah[] = arabic.ayahs.map((ayah: Ayah, idx: number) => ({
          number: idx + 1,
          text: ayah.text,
          englishText: translated.ayahs[idx]?.text,
          audio: audio[idx]?.audio,
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
  }, [currentSurahNumber, translation, reciter]);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = isMuted ? 0 : volume;
    }
  }, [volume, isMuted]);

  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, []);

  const toggleBookmark = (ayahNum: number) => {
    const surahNumber = parseInt(id || "1");
    const bookmarkId = surahNumber * 1000 + ayahNum;
    
    let updated: number[] = [];
    if (bookmarks.includes(bookmarkId)) {
      updated = bookmarks.filter(b => b !== bookmarkId);
    } else {
      updated = [...bookmarks, bookmarkId];
    }
    
    setBookmarks(updated);
    localStorage.setItem("bookmarks", JSON.stringify(updated));
  };

  const isAyahBookmarked = (ayahNum: number) => {
    const surahNumber = parseInt(id || "1");
    const bookmarkId = surahNumber * 1000 + ayahNum;
    return bookmarks.includes(bookmarkId);
  };

  const playAyah = async (ayah: Ayah, index: number) => {
    if (!surah) return;

    if (playingIndex === index && audioRef.current) {
      if (audioRef.current.paused) {
        await audioRef.current.play();
        setIsPlayingAll(true);
      } else {
        audioRef.current.pause();
        setIsPlayingAll(false);
      }
      return;
    }

    if (audioRef.current) {
      audioRef.current.pause();
    }

    setPlayingIndex(index);
    setCurrentPlayingAyah(ayah.number);
    currentAyahIndex.current = index - startAyah + 1;
    setIsPlayingAll(true);

    const audioElement = new Audio(ayah.audio!);
    audioRef.current = audioElement;
    audioElement.volume = isMuted ? 0 : volume;

    await audioElement.play();
    audioElement.onended = () => {
      setPlayingIndex(null);
      setCurrentPlayingAyah(null);
      setIsPlayingAll(false);
    };
  };

  const playAll = async () => {
    if (!surah) return;

    if (isPlayingAll) {
      if (audioRef.current) {
        audioRef.current.pause();
      }
      setIsPlayingAll(false);
      setPlayingIndex(null);
      setCurrentPlayingAyah(null);
      return;
    }

    ayahsToPlay.current = surah.ayahs.slice(startAyah - 1, endAyah ?? surah.ayahs.length);
    currentAyahIndex.current = 0;
    setIsPlayingAll(true);
    await playNextAyah();
  };

  const playNextAyah = async () => {
    if (!isPlayingAll || !ayahsToPlay.current.length || currentAyahIndex.current >= ayahsToPlay.current.length) {
      setIsPlayingAll(false);
      setPlayingIndex(null);
      setCurrentPlayingAyah(null);
      return;
    }

    const ayah = ayahsToPlay.current[currentAyahIndex.current];
    const index = startAyah - 1 + currentAyahIndex.current;
    setPlayingIndex(index);
    setCurrentPlayingAyah(ayah.number);

    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }

    if (
      currentAyahIndex.current === 0 &&
      startAyah === 1 &&
      surah &&
      surah.number !== 1 &&
      surah.number !== 9 &&
      reciterBaseUrls[reciter]
    ) {
      const bismillahAudio = new Audio(`${reciterBaseUrls[reciter]}/001001.mp3`);
      audioRef.current = bismillahAudio;
      bismillahAudio.volume = isMuted ? 0 : volume;

      await new Promise<void>((resolve) => {
        bismillahAudio.play();
        bismillahAudio.onended = () => resolve();
      });
    }

    const audioElement = new Audio(ayah.audio!);
    audioRef.current = audioElement;
    audioElement.volume = isMuted ? 0 : volume;

    await audioElement.play();
    audioElement.onended = () => {
      if (repeatEach) {
        audioElement.play();
      } else {
        currentAyahIndex.current++;
        playNextAyah();
      }
    };
  };

  const playNext = () => {
    if (!surah) return;

    if (isPlayingAll) {
      if (currentAyahIndex.current < ayahsToPlay.current.length - 1) {
        if (audioRef.current) {
          audioRef.current.pause();
        }
        currentAyahIndex.current++;
        playNextAyah();
      } else {
        nextSurah();
      }
    } else if (playingIndex !== null && playingIndex < surah.ayahs.length - 1) {
      playAyah(surah.ayahs[playingIndex + 1], playingIndex + 1);
    } else {
      nextSurah();
    }
  };

  const playPrevious = () => {
    if (!surah) return;

    if (isPlayingAll) {
      if (currentAyahIndex.current > 0) {
        if (audioRef.current) {
          audioRef.current.pause();
        }
        currentAyahIndex.current--;
        playNextAyah();
      } else {
        prevSurah();
      }
    } else if (playingIndex !== null && playingIndex > 0) {
      playAyah(surah.ayahs[playingIndex - 1], playingIndex - 1);
    } else {
      prevSurah();
    }
  };

  const navigateToSurah = (surahNumber: number) => {
    setCurrentSurahNumber(surahNumber);
    navigate(`/surah/${surahNumber}`);
    if (isPlayingAll && surah) {
      setStartAyah(1);
      setEndAyah(null);
      setTimeout(() => playAll(), 500);
    }
  };

  const nextSurah = () => {
    if (!surahList.length) return;
    const next = currentSurahNumber && currentSurahNumber < 114 ? currentSurahNumber + 1 : 1;
    navigateToSurah(next);
  };

  const prevSurah = () => {
    if (!surahList.length) return;
    const prev = currentSurahNumber && currentSurahNumber > 1 ? currentSurahNumber - 1 : 114;
    navigateToSurah(prev);
  };

  const toggleMute = () => {
    setIsMuted(!isMuted);
    if (audioRef.current) {
      audioRef.current.volume = isMuted ? volume : 0;
    }
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = parseFloat(e.target.value);
    setVolume(newVolume);
    setIsMuted(newVolume === 0);
  };

  const handleSurahSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value.toLowerCase();
    setSearchQuery(query);
    if (query === "") {
      setFilteredSurahList(surahList);
    } else {
      const filtered = surahList.filter(s => 
        s.englishName.toLowerCase().includes(query) || 
        s.name.toLowerCase().includes(query) ||
        s.number.toString().includes(query)
      );
      setFilteredSurahList(filtered);
    }
  };

  if (loading) return <p className="text-center mt-10 text-gray-600 dark:text-gray-300">Loading Surah...</p>;
  if (!surah) return <p className="text-center mt-10 text-red-600 dark:text-red-400">Surah not found.</p>;

  return (
    <div className="p-4 max-w-4xl mx-auto dark:bg-gray-900 min-h-[calc(100vh-80px)] pb-24">
      {/* Header Section */}
      <div className="mb-6">
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center gap-4">
            {/* Enhanced Surah Dropdown with Search */}
            <div className="relative">
              <button
                onClick={() => setIsSurahDropdownOpen(!isSurahDropdownOpen)}
                className="flex items-center gap-2 text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 text-sm font-medium"
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
                  {/* Search Input */}
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
                  
                  {/* Filtered Surah List */}
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
          <div className="flex items-center gap-2">
            <label className="flex items-center gap-1 text-sm text-gray-600 dark:text-gray-300">
              <input
                type="checkbox"
                checked={showTranslation}
                onChange={() => setShowTranslation(!showTranslation)}
                className="rounded text-blue-600 dark:text-blue-400 focus:ring-blue-500 dark:focus:ring-blue-600"
              />
              Translation
            </label>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3 mb-4">
          <select
            value={translation}
            onChange={(e) => setTranslation(e.target.value)}
            className="bg-white dark:bg-gray-800 text-gray-800 dark:text-white border border-gray-300 dark:border-gray-600 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="en.sahih">Sahih International</option>
            <option value="en.yusufali">Yusuf Ali</option>
            <option value="bn.bengali">Bengali</option>
            <option value="ur.jalandhry">Urdu</option>
          </select>
          <select
            value={reciter}
            onChange={(e) => setReciter(e.target.value)}
            className="bg-white dark:bg-gray-800 text-gray-800 dark:text-white border border-gray-300 dark:border-gray-600 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="ar.alafasy">Mishary Alafasy</option>
            <option value="ar.husary">Mahmoud Al-Hussary</option>
            <option value="ar.abdulbasitmurattal">Abdul Basit</option>
            <option value="ar.minshawi">Al-Minshawi</option>
          </select>
        </div>

        <div className="flex items-center gap-3 mb-4 text-sm">
          <label className="text-gray-700 dark:text-gray-300">
            From:
            <input
              type="number"
              min="1"
              max={surah.ayahs.length}
              value={startAyah}
              onChange={(e) => {
                const val = Math.max(1, Math.min(surah.ayahs.length, Number(e.target.value)));
                setStartAyah(val);
              }}
              className="ml-1 border border-gray-300 dark:border-gray-600 rounded w-12 px-2 py-1 bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </label>
          <label className="text-gray-700 dark:text-gray-300">
            To:
            <input
              type="number"
              min="1"
              max={surah.ayahs.length}
              value={endAyah ?? ""}
              onChange={(e) => {
                const val =
                  e.target.value === ""
                    ? null
                    : Math.max(1, Math.min(surah.ayahs.length, Number(e.target.value)));
                setEndAyah(val);
              }}
              className="ml-1 border border-gray-300 dark:border-gray-600 rounded w-12 px-2 py-1 bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </label>
          <label className="flex items-center gap-1 text-gray-700 dark:text-gray-300">
            <input
              type="checkbox"
              checked={repeatEach}
              onChange={() => setRepeatEach(!repeatEach)}
              className="rounded text-blue-600 dark:text-blue-400 focus:ring-blue-500 dark:focus:ring-blue-600"
            />
            Repeat
          </label>
        </div>
      </div>

      {/* Bismillah - with null check */}
      {surah && surah.number !== 1 && surah.number !== 9 && (
        <div className="w-full flex justify-center my-6">
          <p className="font-arabic text-3xl text-center text-gray-800 dark:text-gray-200">
            بِسْمِ اللَّهِ الرَّحْمَـٰنِ الرَّحِيمِ
          </p>
        </div>
      )}

      {/* Ayahs List */}
      <div className="space-y-5">
        {surah.ayahs.map((ayah, index) => {
          const showArabic =
            index === 0 && surah.number !== 1 && surah.number !== 9
              ? ayah.text.replace(/^بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ[\s\u200C]*[,،]?/u, "")
              : ayah.text;

          return (
            <div
              key={ayah.number}
              id={`ayah-${ayah.number}`}
              className={`p-4 rounded-lg transition-all duration-200 ${
                index === playingIndex
                  ? "bg-blue-50 dark:bg-blue-900/50 border-l-4 border-blue-500"
                  : "bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700"
              }`}
            >
              <div className="flex justify-between items-start mb-2">
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

              <p className="font-arabic text-right text-2xl leading-loose mb-3 text-gray-800 dark:text-gray-200">
                {showArabic}
              </p>

              {showTranslation && (
                <p className="text-gray-600 dark:text-gray-300 text-sm mb-3">
                  {ayah.englishText || ""}
                </p>
              )}

              <div className="flex justify-end">
                <button
                  onClick={() => playAyah(ayah, index)}
                  className={`flex items-center justify-center w-10 h-10 rounded-full ${
                    playingIndex === index
                      ? "bg-blue-500 text-white"
                      : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300"
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

      {/* Fixed Mini Player */}
      <div className="fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 p-3 shadow-lg z-50 h-[80px] backdrop-blur-sm bg-opacity-90 dark:bg-opacity-90">
        <div className="max-w-4xl mx-auto h-full">
          <div className="flex items-center justify-between gap-4 h-full">
            {/* Surah Navigation */}
            <div className="flex items-center gap-2">
              <button
                onClick={prevSurah}
                className="p-2 rounded-full text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                title="Previous Surah"
              >
                <FaStepBackward />
              </button>
              <div className="text-sm font-medium text-gray-700 dark:text-gray-300 min-w-[120px] text-center">
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

            {/* Ayah Navigation */}
            <div className="flex items-center gap-2">
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
                  if (isPlayingAll || playingIndex !== null) {
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
                title={isPlayingAll ? "Pause" : "Play"}
              >
                {isPlayingAll ? <FaPause /> : <FaPlay />}
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

            {/* Volume Controls */}
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

            {/* Current Ayah Info */}
            <div className="text-sm text-gray-700 dark:text-gray-300 min-w-[80px] text-right">
              {currentPlayingAyah ? `Ayah ${currentPlayingAyah}` : "Not Playing"}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SurahDetail;