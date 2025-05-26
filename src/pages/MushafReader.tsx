import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";

interface Ayah {
  numberInSurah: number;
  text: string;
}

interface SurahData {
  number: number;
  name: string;
  englishName: string;
  numberOfAyahs: number;
  ayahs: Ayah[];
}

// Official Dar Al-Maarifah Tajweed Color System (corrected)
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

export default function MushafReader() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [surah, setSurah] = useState<SurahData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showTajweed, setShowTajweed] = useState(true);
  const [fontSize, setFontSize] = useState(2);

  const fontSizes = [
    "text-xl",
    "text-2xl",
    "text-3xl",
    "text-4xl",
    "text-5xl",
  ];

  const applyTajweedColors = (text: string) => {
    if (!showTajweed) return text;

    const elements = [];
    let i = 0;
    
    while (i < text.length) {
      let matched = false;
      
      // Check for multi-character patterns first
      for (const rule in tajweedRules) {
        if (text.startsWith(rule, i)) {
          elements.push(
            <span key={i} className={tajweedRules[rule]}>
              {text.substr(i, rule.length)}
            </span>
          );
          i += rule.length;
          matched = true;
          break;
        }
      }
      
      if (!matched) {
        elements.push(text[i]);
        i++;
      }
    }
    
    return elements;
  };

  const fetchArabicSurah = async (surahId: string) => {
    try {
      const res = await fetch(`https://api.alquran.cloud/v1/surah/${surahId}/ar.alafasy`);
      const data = await res.json();
      if (data?.data?.ayahs) {
        setSurah({
          number: data.data.number,
          name: data.data.name,
          englishName: data.data.englishName,
          numberOfAyahs: data.data.numberOfAyahs,
          ayahs: data.data.ayahs,
        });
      } else {
        throw new Error("Invalid surah data");
      }
    } catch (err) {
      setError("Failed to load surah. Please try again later.");
      console.error(err);
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

  const goToSurahSelect = (surahNumber: number) => {
    navigate(`/mushaf/${surahNumber}`);
  };

  if (loading) return (
    <div className="flex justify-center items-center h-screen">
      <div className="animate-pulse text-2xl text-green-600">Loading surah...</div>
    </div>
  );

  if (error || !surah) return (
    <div className="text-center py-10">
      <p className="text-red-600 text-xl mb-4">{error}</p>
      <button 
        onClick={() => window.location.reload()}
        className="bg-green-600 text-white px-4 py-2 rounded"
      >
        Retry
      </button>
    </div>
  );

  return (
    <div className="px-4 py-8 max-w-3xl mx-auto">
      <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
        <h1 className="text-2xl font-bold text-green-700 text-center">
          🕋 {surah.name} ({surah.englishName}) - Surah {surah.number}
        </h1>
        
        <div className="flex items-center gap-4">
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={showTajweed}
              onChange={() => setShowTajweed(!showTajweed)}
              className="rounded"
            />
            <span className="text-sm">Tajweed Colors</span>
          </label>
          
          <div className="flex items-center gap-2">
            <button 
              onClick={() => setFontSize(Math.max(1, fontSize - 1))}
              disabled={fontSize === 1}
              className="px-2 py-1 bg-gray-200 rounded disabled:opacity-50"
            >
              A-
            </button>
            <span className="text-sm w-8 text-center">{fontSize}</span>
            <button 
              onClick={() => setFontSize(Math.min(5, fontSize + 1))}
              disabled={fontSize === 5}
              className="px-2 py-1 bg-gray-200 rounded disabled:opacity-50"
            >
              A+
            </button>
          </div>
        </div>
      </div>

      {/* Surah Selection Dropdown */}
      <div className="mb-6">
        <select
          value={surah.number}
          onChange={(e) => goToSurahSelect(parseInt(e.target.value))}
          className="w-full p-2 border border-green-300 rounded bg-white"
        >
          {Array.from({ length: 114 }, (_, i) => i + 1).map((num) => (
            <option key={num} value={num}>
              {num}. {getSurahName(num)}
            </option>
          ))}
        </select>
      </div>

      {/* Tajweed Disclaimer */}
      <div className="p-4 bg-yellow-50 text-sm mb-6 rounded-lg">
        <p className="font-bold text-yellow-700">Important:</p>
        <p>This follows Dar Al-Maarifah's color system. Colors are approximate - proper recitation requires learning from a qualified teacher.</p>
      </div>

      <div className={`space-y-6 text-right mb-8 ${fontSizes[fontSize - 1]}`}>
        {surah.ayahs.map((ayah) => (
          <div key={ayah.numberInSurah} className="relative">
            <p
              className="font-arabic text-right text-green-900 dark:text-green-200 leading-loose mb-2"
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
              {applyTajweedColors(ayah.text)}{" "}
              <span className="text-sm text-gray-400 inline-flex items-center justify-center w-6 h-6 rounded-full bg-gray-100">
                {ayah.numberInSurah}
              </span>
            </p>

          </div>
        ))}
      </div>

      {/* Tajweed Legend */}
      {showTajweed && (
        <div className="mt-8 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
          <h3 className="font-bold mb-2">Dar Al-Maarifah Tajweed Guide:</h3>
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

      <div className="flex justify-between items-center sticky bottom-4 bg-white/90 dark:bg-gray-800/90 p-2 rounded-lg shadow-lg">
        {hasPrevious ? (
          <button
            onClick={() => goToSurah(-1)}
            className="bg-yellow-500 text-white py-2 px-4 rounded-full hover:bg-yellow-600 flex items-center gap-1"
          >
            ← {getSurahName(currentSurahId - 1)}
          </button>
        ) : <div />}

        {hasNext ? (
          <button
            onClick={() => goToSurah(1)}
            className="bg-green-600 text-white py-2 px-4 rounded-full hover:bg-green-700 flex items-center gap-1"
          >
            {getSurahName(currentSurahId + 1)} →
          </button>
        ) : <div />}
      </div>
    </div>
  );
}

// Complete list of all 114 Surah names
function getSurahName(number: number): string {
  const surahNames: Record<number, string> = {
    1: "Al-Fatiha",
    2: "Al-Baqarah",
    3: "Ali Imran",
    4: "An-Nisa",
    5: "Al-Ma'idah",
    6: "Al-An'am",
    7: "Al-A'raf",
    8: "Al-Anfal",
    9: "At-Tawbah",
    10: "Yunus",
    11: "Hud",
    12: "Yusuf",
    13: "Ar-Ra'd",
    14: "Ibrahim",
    15: "Al-Hijr",
    16: "An-Nahl",
    17: "Al-Isra",
    18: "Al-Kahf",
    19: "Maryam",
    20: "Taha",
    21: "Al-Anbiya",
    22: "Al-Hajj",
    23: "Al-Mu'minun",
    24: "An-Nur",
    25: "Al-Furqan",
    26: "Ash-Shu'ara",
    27: "An-Naml",
    28: "Al-Qasas",
    29: "Al-Ankabut",
    30: "Ar-Rum",
    31: "Luqman",
    32: "As-Sajda",
    33: "Al-Ahzab",
    34: "Saba",
    35: "Fatir",
    36: "Ya-Sin",
    37: "As-Saffat",
    38: "Sad",
    39: "Az-Zumar",
    40: "Ghafir",
    41: "Fussilat",
    42: "Ash-Shura",
    43: "Az-Zukhruf",
    44: "Ad-Dukhan",
    45: "Al-Jathiya",
    46: "Al-Ahqaf",
    47: "Muhammad",
    48: "Al-Fath",
    49: "Al-Hujurat",
    50: "Qaf",
    51: "Adh-Dhariyat",
    52: "At-Tur",
    53: "An-Najm",
    54: "Al-Qamar",
    55: "Ar-Rahman",
    56: "Al-Waqi'a",
    57: "Al-Hadid",
    58: "Al-Mujadila",
    59: "Al-Hashr",
    60: "Al-Mumtahina",
    61: "As-Saff",
    62: "Al-Jumu'a",
    63: "Al-Munafiqun",
    64: "At-Taghabun",
    65: "At-Talaq",
    66: "At-Tahrim",
    67: "Al-Mulk",
    68: "Al-Qalam",
    69: "Al-Haqqa",
    70: "Al-Ma'arij",
    71: "Nuh",
    72: "Al-Jinn",
    73: "Al-Muzzammil",
    74: "Al-Muddathir",
    75: "Al-Qiyama",
    76: "Al-Insan",
    77: "Al-Mursalat",
    78: "An-Naba",
    79: "An-Nazi'at",
    80: "Abasa",
    81: "At-Takwir",
    82: "Al-Infitar",
    83: "Al-Mutaffifin",
    84: "Al-Inshiqaq",
    85: "Al-Buruj",
    86: "At-Tariq",
    87: "Al-A'la",
    88: "Al-Ghashiya",
    89: "Al-Fajr",
    90: "Al-Balad",
    91: "Ash-Shams",
    92: "Al-Layl",
    93: "Ad-Duha",
    94: "Ash-Sharh",
    95: "At-Tin",
    96: "Al-Alaq",
    97: "Al-Qadr",
    98: "Al-Bayyina",
    99: "Az-Zalzala",
    100: "Al-Adiyat",
    101: "Al-Qari'a",
    102: "At-Takathur",
    103: "Al-Asr",
    104: "Al-Humaza",
    105: "Al-Fil",
    106: "Quraysh",
    107: "Al-Ma'un",
    108: "Al-Kawthar",
    109: "Al-Kafirun",
    110: "An-Nasr",
    111: "Al-Masad",
    112: "Al-Ikhlas",
    113: "Al-Falaq",
    114: "An-Nas"
  };
  return surahNames[number];
}