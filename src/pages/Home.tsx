import { Link } from "react-router-dom";

export default function Home() {
  return (
    <div className="relative min-h-screen flex items-center justify-center">
      <div className="absolute inset-0 bg-islamic-pattern" />
      
      <div className="relative z-10 max-w-4xl mx-auto px-4 py-16 text-center">
        <div className="mb-8">
          <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-green-600 to-teal-500 bg-clip-text text-transparent">
            Welcome to Al Furqan
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            A beautifully designed Quran application with translation, audio, and prayer tools
          </p>
        </div>

        <div className="bg-white dark:bg-gray-800/80 backdrop-blur-sm rounded-xl p-6 shadow-lg border border-gray-100 dark:border-gray-700 max-w-2xl mx-auto mb-10">
          <p className="font-arabic text-2xl mb-4 text-gray-800 dark:text-gray-200">
            بِسْمِ ٱللَّٰهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ
          </p>
          <p className="italic text-gray-600 dark:text-gray-300">
            "The best among you are those who learn the Quran and teach it."
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
            - Prophet Muhammad ﷺ (Bukhari)
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-xl mx-auto">
          <Link 
            to="/quran" 
            className="btn-primary bg-green-600 hover:bg-green-700 text-white flex flex-col items-center justify-center p-4"
          >
            <span className="text-2xl mb-1">📖</span>
            <span>Quran</span>
          </Link>
          
          <Link 
            to="/mushaf/1" 
            className="btn-primary bg-purple-600 hover:bg-purple-700 text-white flex flex-col items-center justify-center p-4"
          >
            <span className="text-2xl mb-1">🕌</span>
            <span>Mushaf</span>
          </Link>
          
          <Link 
            to="/prayer" 
            className="btn-primary bg-blue-600 hover:bg-blue-700 text-white flex flex-col items-center justify-center p-4"
          >
            <span className="text-2xl mb-1">🕋</span>
            <span>Prayer</span>
          </Link>
          
          <Link 
            to="/bookmarks" 
            className="btn-primary bg-amber-600 hover:bg-amber-700 text-white flex flex-col items-center justify-center p-4"
          >
            <span className="text-2xl mb-1">🔖</span>
            <span>Bookmarks</span>
          </Link>
        </div>
      </div>
    </div>
  );
}