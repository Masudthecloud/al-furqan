import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState, useRef } from "react";
import { applyTajweedColors } from "../utils/tajweed";
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

// Official Dar Al-Maarifah Tajweed Color System
const tajweedRules: Record<string, string> = {
  // RED - Required Madd (6 counts)
  "\u064e\u0627": "text-[#e60000]", // Fatha + Alif
  "\u064f\u0648": "text-[#e60000]", // Damma + Waw
  "\u0650\u064a": "text-[#e60000]", // Kasra + Ya
  "\u064e\u0648\u0654": "text-[#e60000]", // Fatha with Waw Madd
  "\u064f\u0648\u0654": "text-[#e60000]", // Damma with Waw Madd
  "\u0650\u064a\u0654": "text-[#e60000]", // Kasra with Ya Madd

  // GREEN - Ghunnah (Nasalization)
  "\u0646\u0651": "text-[#009900]", // Noon with Shaddah
  "\u0645\u0651": "text-[#009900]", // Meem with Shaddah
  "\u0646\u0652": "text-[#009900]", // Noon Sakinah

  // BLUE - Qalqalah (Echo)
  "\u0642": "text-[#0000cc]",
  "\u0637": "text-[#0000cc]",
  "\u0628": "text-[#0000cc]",
  "\u062c": "text-[#0000cc]",
  "\u062f": "text-[#0000cc]",

  // DARK BLUE - Ikhfa (Concealment)
  "\u0646\u0652\u062a": "text-[#000066]", // Noon Sakinah + Ta
  "\u0646\u0652\u062b": "text-[#000066]", // Noon Sakinah + Tha
  "\u0646\u0652\u062c": "text-[#000066]", // Noon Sakinah + Jeem

  // LIGHT BROWN - Idgham (Merging)
  "\u0644\u0651": "text-[#996633]", // Lam with Shaddah
  "\u0631\u0651": "text-[#996633]", // Ra with Shaddah

  // PINK - Heavy Letters (Tafkheem)
  "\u062e": "text-[#ff66b2]", // Kha
  "\u0635": "text-[#ff66b2]", // Sad
  "\u0636": "text-[#ff66b2]", // Dad
  "\u063a": "text-[#ff66b2]", // Ghain
  "\u0638": "text-[#ff66b2]", // Dha

  // GRAY - Silent Letters
  "\u0652": "text-[#666666]" // Sukoon
};

// Function to apply Tajweed color rules to Arabic text without breaking ligatures (mobile-safe)
/* const applyTajweedColors = (text: string, showTajweed: boolean): React.ReactNode => {
  if (!showTajweed || !text) return <>{text}</>;

  const rules: [RegExp, string][] = Object.entries(tajweedRules).map(
    ([pattern, className]) => [new RegExp(pattern, "g"), className]
  );

  let html = text;

  for (const [regex, cls] of rules) {
    html = html.replace(regex, (match) => `<span class="${cls}">${match}</span>`);
  }

  return <span dangerouslySetInnerHTML={{ __html: html }} />;
}; */

const SurahDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [surah, setSurah] = useState<Surah | null>(null);
  const [surahList, setSurahList] = useState<SurahInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [translation, setTranslation] = useState("en.sahih");
  const [reciter, setReciter] = useState("ar.alafasy");
  const [showTranslation, setShowTranslation] = useState(true);
  const [showTajweed, setShowTajweed] = useState(true);
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
    if (saved) setBookmarks(JSON.parse(saved));

    fetchSurahList().then((list) => setSurahList(list));
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
    const updated = bookmarks.includes(ayahNum)
      ? bookmarks.filter((b) => b !== ayahNum)
      : [...bookmarks, ayahNum];
    setBookmarks(updated);
    localStorage.setItem("bookmarks", JSON.stringify(updated));
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
    
    const audio = new Audio(ayah.audio);
    audioRef.current = audio;
    audio.volume = isMuted ? 0 : volume;
    
    await audio.play();
    
    audio.onended = () => {
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
      surah && // Null check added here
      surah.number !== 1 &&
      surah.number !== 9 &&
      reciterBaseUrls[reciter]
    ) {
      const bismillahAudio = new Audio(`${reciterBaseUrls[reciter]}/001001.mp3`);
      audioRef.current = bismillahAudio;
      audioRef.current.volume = isMuted ? 0 : volume;
      
      await new Promise<void>((resolve) => {
        bismillahAudio.play();
        bismillahAudio.onended = () => resolve();
      });
    }
    
    const audio = new Audio(ayah.audio);
    audioRef.current = audio;
    audio.volume = isMuted ? 0 : volume;
    
    await audio.play();
    
    audio.onended = () => {
      if (repeatEach) {
        audio.play();
      } else {
        currentAyahIndex.current++;
        playNextAyah();
      }
    };
  };

  const playNext = () => {
    if (!surah) return;
    
    if (isPlayingAll) {
      if (currentAyahIndex.current < (ayahsToPlay.current.length - 1)) {
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
    if (isPlayingAll && surah) { // Added surah null check
      setStartAyah(1);
      setEndAyah(null);
      setTimeout(() => {
        playAll();
      }, 500);
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

  if (loading) return <p className="text-center mt-10">Loading Surah...</p>;
  if (!surah) return <p className="text-center mt-10 text-red-600">Surah not found.</p>;

  return (
    <div className="p-4 max-w-4xl mx-auto dark:bg-gray-900 min-h-[calc(100vh-80px)] pb-4">
      {/* Header Section */}
      <div className="mb-6">
        <div className="flex justify-between items-center mb-2">
          <div className="flex items-center gap-4">
            {/* Surah Dropdown Navigation */}
            <div className="relative">
              <button
                onClick={() => setIsSurahDropdownOpen(!isSurahDropdownOpen)}
                className="flex items-center gap-2 text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md px-3 py-1 text-sm font-medium"
              >
                {surah.englishName} ({surah.name})
                <FaChevronDown className={`transition-transform ${isSurahDropdownOpen ? 'transform rotate-180' : ''}`} size={12} />
              </button>
              
              {isSurahDropdownOpen && (
                <div className="absolute z-50 mt-1 w-56 max-h-96 overflow-y-auto bg-white dark:bg-gray-800 rounded-md shadow-lg border border-gray-200 dark:border-gray-700">
                  <div className="py-1">
                    {surahList.map((s) => (
                      <button
                        key={s.number}
                        onClick={() => {
                          navigateToSurah(s.number);
                          setIsSurahDropdownOpen(false);
                        }}
                        className={`block w-full text-left px-4 py-2 text-sm ${
                          s.number === surah.number
                            ? 'bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200'
                            : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                        }`}
                      >
                        {s.number}. {s.englishName} ({s.name})
                      </button>
                    ))}
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
                className="rounded"
              />
              Translation
            </label>
            <label className="flex items-center gap-1 text-sm text-gray-600 dark:text-gray-300">
              <input
                type="checkbox"
                checked={showTajweed}
                onChange={() => setShowTajweed(!showTajweed)}
                className="rounded"
              />
              Tajweed
            </label>
          </div>
        </div>
        
        <div className="flex flex-wrap items-center gap-3 mb-4">
          <select
            value={translation}
            onChange={(e) => setTranslation(e.target.value)}
            className="bg-white dark:bg-gray-800 text-gray-800 dark:text-white border border-gray-300 dark:border-gray-600 rounded px-3 py-1 text-sm"
          >
            <option value="en.sahih">Sahih International</option>
            <option value="en.yusufali">Yusuf Ali</option>
            <option value="bn.bengali">Bengali</option>
            <option value="ur.jalandhry">Urdu</option>
          </select>
          
          <select
            value={reciter}
            onChange={(e) => setReciter(e.target.value)}
            className="bg-white dark:bg-gray-800 text-gray-800 dark:text-white border border-gray-300 dark:border-gray-600 rounded px-3 py-1 text-sm"
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
              className="ml-1 border border-gray-300 dark:border-gray-600 rounded w-12 px-2 py-1 bg-white dark:bg-gray-800 text-gray-800 dark:text-white"
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
                const val = e.target.value === "" ? null : Math.max(1, Math.min(surah.ayahs.length, Number(e.target.value)));
                setEndAyah(val);
              }}
              className="ml-1 border border-gray-300 dark:border-gray-600 rounded w-12 px-2 py-1 bg-white dark:bg-gray-800 text-gray-800 dark:text-white"
            />
          </label>
          <label className="flex items-center gap-1 text-gray-700 dark:text-gray-300">
            <input
              type="checkbox"
              checked={repeatEach}
              onChange={() => setRepeatEach(!repeatEach)}
              className="rounded"
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

      {/* Tajweed Disclaimer */}
      {showTajweed && (
        <div className="p-4 bg-yellow-50 text-sm mb-6 rounded-lg dark:bg-yellow-900/20">
          <p className="font-bold text-yellow-700 dark:text-yellow-300">Note:</p>
          <p className="text-yellow-600 dark:text-yellow-200">
            Tajweed colors follow Dar Al-Maarifah's system. For proper recitation, learn from a qualified teacher.
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
                  {bookmarks.includes(ayah.number) ? (
                    <FaStar className="text-yellow-500" />
                  ) : (
                    <FaRegStar />
                  )}
                </button>
              </div>
              
              {/* <p className="font-arabic text-right text-2xl leading-loose mb-3 text-gray-800 dark:text-gray-200">
                {applyTajweedColors(showArabic, showTajweed)}
              </p> */}

              <p
            className="font-arabic text-right text-2xl leading-loose mb-3 text-gray-800 dark:text-gray-200"
            dir="rtl"
            lang="ar"
            style={{
                unicodeBidi: "isolate",
                letterSpacing: "normal",
                wordSpacing: "normal",
                textTransform: "none",
                WebkitFontSmoothing: "antialiased",
                textRendering: "optimizeLegibility",
            }}
            >
            {applyTajweedColors(showArabic, showTajweed)}
            </p>


              {/* <p className="arabic-text">
                {applyTajweedColors(showArabic, showTajweed)}
             </p> */}


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
                  {playingIndex === index ? <FaPause size={14} /> : <FaPlay size={14} className="ml-1" />}
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Tajweed Legend */}
      {showTajweed && (
        <div className="mt-8 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
          <h3 className="font-bold mb-2">Tajweed Color Guide:</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2 text-sm">
            <div className="flex items-center gap-2">
              <span className="text-[#e60000]">■</span> Madd (6 counts)
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[#009900]">■</span> Ghunnah
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[#0000cc]">■</span> Qalqalah
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[#000066]">■</span> Ikhfa
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[#996633]">■</span> Idgham
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[#ff66b2]">■</span> Heavy Letters
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[#666666]">■</span> Silent
            </div>
          </div>
        </div>
      )}

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