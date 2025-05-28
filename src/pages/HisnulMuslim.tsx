import { useEffect, useState, useMemo } from "react";
import {
  ChevronDown,
  ChevronUp,
  ChevronLeft,
  Star,
  List,
  Grid,
  BookOpen,
  Sun,
  Heart,
  Shield,
  Utensils,
  BedDouble,
  Users,
  HandCoins,
  CloudSun,
  Globe,
  Briefcase,
  Gift,
  Home,
  Smile,
  AlertTriangle,
  // add more as needed
} from "lucide-react";
// JSON from https://raw.githubusercontent.com/wafaaelmaandy/Hisn-Muslim-Json/master/husn_en.json
import duaData from "../data/hisnulMuslim.json";

interface Dua {
  id: string;
  arabic: string;
  translation: string;
  audioUrl?: string | null;
}

interface Category {
  name: string;
  duas: Dua[];
}

// Main groupings as in the Hisnul Muslim app
const MAIN_GROUPS = [
  "Salah",
  "Morning & Evening",
  "Sleep",
  "Ramadan - Fasting",
  "Quranic Duas",
  "Food & Drink",
  "Illness - Death",
  "Ruqyah",
  "Seeking Refuge",
  "Social Manners",
  "Family",
  "Rizq",
  "Gratitude - Repentance",
  "Purification",
  "Clothes",
  "Hajj - Umrah",
  "Travel",
  "Nature",
  "Other"
];

// Map verbose category titles to main groups
const CATEGORY_TO_GROUP: Record<string, string> = {
  // Morning & Evening
  "Words of remembrance for morning and evening": "Morning & Evening",
  "supplications for when you wake up": "Morning & Evening",
  // Sleep
  "What to say before sleeping": "Sleep",
  "Invocation to say if you stir in the night": "Sleep",
  "What to say if you are afraid to go to sleep or feel lonely and depressed": "Sleep",
  "What to do if you have a bad dream or nightmare": "Sleep",
  // Salah
  "Invocation for going to the mosque": "Salah",
  "Invocation for entering the mosque": "Salah",
  "Invocation for leaving the mosque": "Salah",
  "What to say upon hearing the Athan (call to prayer)": "Salah",
  "How to recite blessings on the Prophet after the Tashahhud": "Salah",
  "What to say after completing the prayer": "Salah",
  "Invocations for rising from the Ruki'": "Salah",
  "Invocations during Sujood": "Salah",
  "Invocations for sitting between two prostrations": "Salah",
  "Supplications for prostrating due to recitation of the Qur'an": "Salah",
  "Invocation for At-Tashahhud (sitting in prayer)": "Salah",
  "Istikharah (seeking Allah's Counsel)": "Salah",
  "Invocations for Qunut in the Witr prayer": "Salah",
  "What to say immediately following the Witr prayer": "Salah",
  // Ramadan - Fasting
  "What to say when you are fasting and someone is rude to you": "Ramadan - Fasting",
  // Quranic Duas
  // (no duplicate here)
  // Food & Drink
  "Invocation when getting dressed": "Clothes",
  "Invocation when putting on new clothes": "Clothes",
  "Invocations for someone who has put on new clothes": "Clothes",
  "Invocation for entering the restroom": "Purification",
  "Invocation for leaving the restroom": "Purification",
  "What to say before performing ablution": "Purification",
  "What to say upon completing ablution": "Purification",
  // Illness - Death
  "Invocation for closing the eyes of the dead": "Illness - Death",
  "Invocations for the dead in the Funeral prayer": "Illness - Death",
  "Invocation for visiting the graves": "Illness - Death",
  "Invocation for the bereaved": "Illness - Death",
  "Invocation to be recited when placing the dead in his grave": "Illness - Death",
  "Invocation to be recited after burying the dead": "Illness - Death",
  "Invocations for a child in the Funeral prayer": "Illness - Death",
  // Ruqyah
  "Invocations in times of worry and grief": "Ruqyah",
  "Invocation against an enemy": "Ruqyah",
  "What to say if you fear people may harm you": "Ruqyah",
  "Invocations for if you are stricken by in your faith": "Ruqyah",
  // Seeking Refuge
  "Invocation against the distractions of Satan during the prayer and recitation of the Quran": "Seeking Refuge",
  "Invocations against the Devil and his promptings": "Seeking Refuge",
  "What to say and do if you commit a sin": "Seeking Refuge",
  // Social Manners
  "Congratulations for new parents and how they should respond": "Family",
  "How to seek Allah's protection for children": "Family",
  "Invocation for someone who does good to you": "Social Manners",
  "How a Muslim should praise another Muslim": "Social Manners",
  "What a Muslim should say when he is praised": "Social Manners",
  "spreading the greetings of Salam (Peace)": "Social Manners",
  "How to reply to a disbeliever if he says Salam to you": "Social Manners",
  // Family
  "Invocation for the groom": "Family",
  "The groom's supplication on the wedding night or when buying an animal": "Family",
  "Invocation to be recited before intercourse": "Family",
  // Rizq
  "Invocations for the setting of a debt": "Rizq",
  // Gratitude - Repentance
  "Repentance and seeking forgiveness": "Gratitude - Repentance",
  // Purification
  // (already mapped above)
  // Hajj - Umrah
  "The pilgrim's announcement of his arrival for Hajj or Umrah": "Hajj - Umrah",
  "Saying Allahu Akbar when passing the Black Stone": "Hajj - Umrah",
  "Invocation to be recited between the Yemenite Corner and the Black Stone": "Hajj - Umrah",
  "Invocation to be recited while standing at Safa and Marwah": "Hajj - Umrah",
  "Invocation to be recited on the Day of Arafat": "Hajj - Umrah",
  "Supplication to be recited at the sacred area of Muzdalifah": "Hajj - Umrah",
  "Saying Allahu Akbar while stoning the three pillars at Mina": "Hajj - Umrah",
  // Travel
  "What to say when leaving the home": "Travel",
  "What to say when entering the home": "Travel",
  // Nature
  "Invocations for when the wind blows": "Nature",
  "Invocation for when it thunder": "Nature",
  "Some invocations for rain": "Nature",
  // Other (catch-all)
};

// Icon map for main groups (use lucide-react icons as placeholders)
const GROUP_ICONS = {
  "Salah": <BookOpen className="w-8 h-8 text-green-600" />,
  "Morning & Evening": <Sun className="w-8 h-8 text-yellow-500" />,
  "Sleep": <BedDouble className="w-8 h-8 text-blue-400" />,
  "Ramadan - Fasting": <Utensils className="w-8 h-8 text-purple-500" />,
  "Quranic Duas": <BookOpen className="w-8 h-8 text-red-500" />,
  "Food & Drink": <Utensils className="w-8 h-8 text-green-700" />,
  "Illness - Death": <Heart className="w-8 h-8 text-blue-500" />,
  "Ruqyah": <Shield className="w-8 h-8 text-amber-700" />,
  "Seeking Refuge": <Shield className="w-8 h-8 text-purple-400" />,
  "Social Manners": <Users className="w-8 h-8 text-indigo-500" />,
  "Family": <Home className="w-8 h-8 text-orange-500" />,
  "Rizq": <HandCoins className="w-8 h-8 text-yellow-600" />,
  "Gratitude - Repentance": <Smile className="w-8 h-8 text-green-400" />,
  "Purification": <Gift className="w-8 h-8 text-teal-500" />,
  "Clothes": <Briefcase className="w-8 h-8 text-pink-500" />,
  "Hajj - Umrah": <Globe className="w-8 h-8 text-emerald-600" />,
  "Travel": <Globe className="w-8 h-8 text-blue-400" />,
  "Nature": <CloudSun className="w-8 h-8 text-green-400" />,
  "Other": <AlertTriangle className="w-8 h-8 text-gray-400" />,
};

export default function HisnulMuslim() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [expanded, setExpanded] = useState<Set<string>>(new Set());
  const [tab, setTab] = useState<'favorites' | 'groups' | 'list'>("groups");
  const [selectedGroup, setSelectedGroup] = useState<string | null>(null);
  const [favorites, setFavorites] = useState<Set<string>>(() => {
    const stored = localStorage.getItem('hisnulMuslimFavorites');
    if (stored) {
      try {
        return new Set(JSON.parse(stored));
      } catch {
        return new Set();
      }
    }
    return new Set();
  });

  useEffect(() => {
    localStorage.setItem('hisnulMuslimFavorites', JSON.stringify(Array.from(favorites)));
  }, [favorites]);

  useEffect(() => {
    type RawDua = {
      ID: string | number;
      ARABIC_TEXT: string;
      TRANSLATED_TEXT: string;
      AUDIO?: string | null;
    };
    type RawCategory = {
      TITLE: string;
      TEXT: RawDua[];
    };
    type DuaData = {
      English: RawCategory[];
    };

    const rawCats = (duaData as DuaData).English;
    if (Array.isArray(rawCats)) {
      const mapped: Category[] = rawCats.map((cat: RawCategory) => ({
        name: cat.TITLE,
        duas: Array.isArray(cat.TEXT)
          ? cat.TEXT.map((d: RawDua) => ({
              id: d.ID.toString(),
              arabic: d.ARABIC_TEXT,
              translation: d.TRANSLATED_TEXT,
              audioUrl: d.AUDIO || null,
            }))
          : [],
      }));
      setCategories(mapped);
    }
  }, []);

  const toggleCategory = (name: string) => {
    setExpanded(prev => {
      const nxt = new Set(prev);
      if (nxt.has(name)) nxt.delete(name);
      else nxt.add(name);
      return nxt;
    });
  };

  // Group categories by main group
  const groupedCategories = useMemo(() => {
    const groupMap: Record<string, Category[]> = {};
    for (const cat of categories) {
      const group = CATEGORY_TO_GROUP[cat.name] || "Other";
      if (!groupMap[group]) groupMap[group] = [];
      groupMap[group].push(cat);
    }
    return groupMap;
  }, [categories]);

  // Add/remove favorite
  const toggleFavorite = (duaId: string) => {
    setFavorites(prev => {
      const next = new Set(prev);
      if (next.has(duaId)) next.delete(duaId);
      else next.add(duaId);
      return next;
    });
  };

  // Get all duas flat
  const allDuas = useMemo(() =>
    categories.flatMap(cat => cat.duas.map(dua => ({ ...dua, category: cat.name }))),
    [categories]
  );

  // Get favorite duas (unordered)
  const favoriteDuas = allDuas.filter(dua => favorites.has(dua.id));

  return (
    <div className="relative min-h-[calc(100vh-80px)] flex flex-col bg-gradient-to-b from-yellow-50 to-green-50 dark:from-gray-900 dark:to-gray-800">
      {/* Top bar and quote */}
      <div className="sticky top-0 z-20 bg-yellow-100/90 dark:bg-gray-900/90 border-b border-yellow-200 dark:border-gray-800 px-4 py-3 flex flex-col items-center shadow-sm">
        <div className="text-lg font-bold text-green-700 dark:text-green-300 tracking-wide mb-1">Hisnul Muslim</div>
        <div className="text-sm text-gray-700 dark:text-gray-300 text-center max-w-2xl mx-auto">
          "Whoever takes a seat or lies down [relaxes] and fails to remember Allah, has incurred upon himself a loss from Allah" <span className="italic">[Abu Dawud 4/264]</span>
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 w-full max-w-3xl mx-auto px-2 sm:px-4 py-6">
        {tab === "groups" && (
          <>
            {!selectedGroup ? (
              <div className="grid grid-cols-3 sm:grid-cols-4 gap-6 py-6">
                {MAIN_GROUPS.map((group) => (
                  <button
                    key={group}
                    className="flex flex-col items-center justify-center bg-white/80 dark:bg-gray-900/80 rounded-2xl shadow border border-gray-100 dark:border-gray-800 p-5 hover:shadow-lg transition-all duration-200 group"
                    onClick={() => setSelectedGroup(group)}
                  >
                    {GROUP_ICONS[group as keyof typeof GROUP_ICONS]}
                    <span className="mt-3 text-base font-semibold text-gray-800 dark:text-gray-100 text-center">
                      {group}
                    </span>
                  </button>
                ))}
              </div>
            ) : (
              <div>
                <button
                  className="mb-4 flex items-center gap-2 text-green-700 dark:text-green-300 hover:underline"
                  onClick={() => setSelectedGroup(null)}
                >
                  <ChevronLeft className="w-5 h-5" /> Back to Groups
                </button>
                <h2 className="text-2xl font-bold mb-4 text-green-700 dark:text-green-300 flex items-center gap-2">
                  {GROUP_ICONS[selectedGroup as keyof typeof GROUP_ICONS]} {selectedGroup}
                </h2>
                <div className="space-y-6">
                  {groupedCategories[selectedGroup]?.map((cat) => {
                    const isOpen = expanded.has(cat.name);
                    return (
                      <div
                        key={cat.name}
                        className={`card transition-all duration-300 overflow-hidden ${isOpen ? "shadow-lg border-green-300 dark:border-green-700" : "hover:shadow-md"}`}
                      >
                        <button
                          onClick={() => toggleCategory(cat.name)}
                          className={`w-full flex items-center justify-between px-6 py-4 bg-gradient-to-r from-green-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 transition-colors group focus:outline-none`}
                        >
                          <span className="text-xl font-semibold text-gray-800 dark:text-gray-100 flex items-center gap-2">
                            <span className="inline-block w-2 h-2 rounded-full bg-gradient-to-r from-green-400 to-purple-400 mr-2 group-hover:scale-125 transition-transform" />
                            {cat.name}
                          </span>
                          {isOpen ? (
                            <ChevronUp className="text-green-600 dark:text-green-400 transition-transform group-hover:-rotate-12" />
                          ) : (
                            <ChevronDown className="text-purple-600 dark:text-purple-400 transition-transform group-hover:rotate-12" />
                          )}
                        </button>
                        <div
                          className={`transition-all duration-300 ${isOpen ? "max-h-[2000px] opacity-100" : "max-h-0 opacity-0"} bg-gradient-to-br from-white via-green-50 to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900`}
                        >
                          {isOpen && (
                            <ul className="divide-y divide-gray-100 dark:divide-gray-800 px-2 py-2 space-y-4">
                              {cat.duas.map((dua) => (
                                <li
                                  key={dua.id}
                                  className="relative p-6 bg-white/80 dark:bg-gray-900/80 rounded-xl shadow border border-gray-100 dark:border-gray-800 hover:shadow-lg transition-all duration-200 group"
                                >
                                  <div className="absolute left-0 top-4 bottom-4 w-1 bg-gradient-to-b from-green-400 via-teal-400 to-purple-400 rounded-full opacity-30 group-hover:opacity-60 transition-opacity" />
                                  <button
                                    className="absolute top-3 right-3 z-10"
                                    onClick={() => toggleFavorite(dua.id)}
                                    title={favorites.has(dua.id) ? "Remove from favorites" : "Add to favorites"}
                                  >
                                    <Star className={`w-6 h-6 ${favorites.has(dua.id) ? "text-yellow-400 fill-yellow-300" : "text-gray-400"}`} fill={favorites.has(dua.id) ? "#fde047" : "none"} />
                                  </button>
                                  <p className="font-arabic text-2xl mb-3 leading-relaxed text-gray-900 dark:text-gray-100">
                                    {dua.arabic}
                                  </p>
                                  <p className="text-gray-700 dark:text-gray-300 mb-2 text-lg">
                                    {dua.translation}
                                  </p>
                                  {dua.audioUrl && (
                                    <audio
                                      src={dua.audioUrl}
                                      controls
                                      className="w-full mt-2"
                                    />
                                  )}
                                </li>
                              ))}
                            </ul>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </>
        )}
        {tab === "list" && (
          <div className="space-y-6 animate-fadeIn">
            {categories.map((cat) => {
              const isOpen = expanded.has(cat.name);
              return (
                <div
                  key={cat.name}
                  className={`card transition-all duration-300 overflow-hidden ${isOpen ? "shadow-lg border-green-300 dark:border-green-700" : "hover:shadow-md"}`}
                >
                  <button
                    onClick={() => toggleCategory(cat.name)}
                    className={`w-full flex items-center justify-between px-6 py-4 bg-gradient-to-r from-green-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 transition-colors group focus:outline-none`}
                  >
                    <span className="text-xl font-semibold text-gray-800 dark:text-gray-100 flex items-center gap-2">
                      <span className="inline-block w-2 h-2 rounded-full bg-gradient-to-r from-green-400 to-purple-400 mr-2 group-hover:scale-125 transition-transform" />
                      {cat.name}
                    </span>
                    {isOpen ? (
                      <ChevronUp className="text-green-600 dark:text-green-400 transition-transform group-hover:-rotate-12" />
                    ) : (
                      <ChevronDown className="text-purple-600 dark:text-purple-400 transition-transform group-hover:rotate-12" />
                    )}
                  </button>
                  <div
                    className={`transition-all duration-300 ${isOpen ? "max-h-[2000px] opacity-100" : "max-h-0 opacity-0"} bg-gradient-to-br from-white via-green-50 to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900`}
                  >
                    {isOpen && (
                      <ul className="divide-y divide-gray-100 dark:divide-gray-800 px-2 py-2 space-y-4">
                        {cat.duas.map((dua) => (
                          <li
                            key={dua.id}
                            className="relative p-6 bg-white/80 dark:bg-gray-900/80 rounded-xl shadow border border-gray-100 dark:border-gray-800 hover:shadow-lg transition-all duration-200 group"
                          >
                            <button
                              className="absolute top-3 right-3 z-10"
                              onClick={() => toggleFavorite(dua.id)}
                              title={favorites.has(dua.id) ? "Remove from favorites" : "Add to favorites"}
                            >
                              <Star className={`w-6 h-6 ${favorites.has(dua.id) ? "text-yellow-400 fill-yellow-300" : "text-gray-400"}`} fill={favorites.has(dua.id) ? "#fde047" : "none"} />
                            </button>
                            <div className="absolute left-0 top-4 bottom-4 w-1 bg-gradient-to-b from-green-400 via-teal-400 to-purple-400 rounded-full opacity-30 group-hover:opacity-60 transition-opacity" />
                            <p className="font-arabic text-2xl mb-3 leading-relaxed text-gray-900 dark:text-gray-100">
                              {dua.arabic}
                            </p>
                            <p className="text-gray-700 dark:text-gray-300 mb-2 text-lg">
                              {dua.translation}
                            </p>
                            {dua.audioUrl && (
                              <audio
                                src={dua.audioUrl}
                                controls
                                className="w-full mt-2"
                              />
                            )}
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
        {tab === "favorites" && (
          <div className="space-y-6 animate-fadeIn">
            {favoriteDuas.length === 0 ? (
              <div className="text-center text-gray-500 dark:text-gray-400 py-12">
                <Star className="w-10 h-10 mx-auto mb-4 text-yellow-300" />
                <div>No favorites yet. Tap the star on any dua to add it here.</div>
              </div>
            ) : (
              <ul className="divide-y divide-gray-100 dark:divide-gray-800 px-2 py-2 space-y-4">
                {favoriteDuas.map((dua) => (
                  <li
                    key={dua.id}
                    className="relative p-6 bg-white/80 dark:bg-gray-900/80 rounded-xl shadow border border-gray-100 dark:border-gray-800 hover:shadow-lg transition-all duration-200 group"
                  >
                    <button
                      className="absolute top-3 right-3 z-10"
                      onClick={() => toggleFavorite(dua.id)}
                      title={favorites.has(dua.id) ? "Remove from favorites" : "Add to favorites"}
                    >
                      <Star className={`w-6 h-6 ${favorites.has(dua.id) ? "text-yellow-400 fill-yellow-300" : "text-gray-400"}`} fill={favorites.has(dua.id) ? "#fde047" : "none"} />
                    </button>
                    <div className="absolute left-0 top-4 bottom-4 w-1 bg-gradient-to-b from-green-400 via-teal-400 to-purple-400 rounded-full opacity-30 group-hover:opacity-60 transition-opacity" />
                    <p className="font-arabic text-2xl mb-3 leading-relaxed text-gray-900 dark:text-gray-100">
                      {dua.arabic}
                    </p>
                    <p className="text-gray-700 dark:text-gray-300 mb-2 text-lg">
                      {dua.translation}
                    </p>
                    {dua.audioUrl && (
                      <audio
                        src={dua.audioUrl}
                        controls
                        className="w-full mt-2"
                      />
                    )}
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}
      </div>

      {/* Bottom navigation bar */}
      <nav className="sticky bottom-0 z-30 w-full bg-white/90 dark:bg-gray-900/90 border-t border-gray-200 dark:border-gray-800 flex justify-around items-center py-2 shadow-inner">
        <button
          className={`flex flex-col items-center px-2 py-1 ${tab === "favorites" ? "text-yellow-500" : "text-gray-500 dark:text-gray-400"}`}
          onClick={() => { setTab("favorites"); setSelectedGroup(null); }}
        >
          <Star className="w-6 h-6 mb-1" fill={tab === "favorites" ? "#fde047" : "none"} />
        </button>
        <button
          className={`flex flex-col items-center px-2 py-1 ${tab === "groups" ? "text-green-600" : "text-gray-500 dark:text-gray-400"}`}
          onClick={() => { setTab("groups"); setSelectedGroup(null); }}
        >
          <Grid className="w-6 h-6 mb-1" />
        </button>
        <button
          className={`flex flex-col items-center px-2 py-1 ${tab === "list" ? "text-purple-600" : "text-gray-500 dark:text-gray-400"}`}
          onClick={() => { setTab("list"); setSelectedGroup(null); }}
        >
          <List className="w-6 h-6 mb-1" />
        </button>
      </nav>
    </div>
  );
}
