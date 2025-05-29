import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Header from "./components/Header";
import Home from "./pages/Home";
import Quran from "./pages/Quran";
import Prayer from "./pages/Prayer";
// import Qibla from "./pages/Qibla";
import HisnulMuslim from "./pages/HisnulMuslim";
import SurahDetail from "./pages/SurahDetail";
import Bookmarks from "./pages/Bookmarks";
import Footer from "./components/Footer";
import NotFound from "./pages/NotFound";

function App() {
  return (
    <Router>
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-grow container mx-auto px-4 py-8 animate-fadeIn">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/quran" element={<Quran />} />
            <Route path="/prayer" element={<Prayer />} />
            {/* <Route path="/qibla" element={<Qibla />} /> */}
            <Route path="/hisnul" element={<HisnulMuslim />} />
            <Route path="/bookmarks" element={<Bookmarks />} />
            <Route path="/quran/:id" element={<SurahDetail />} />
            <Route path="/surah/:id" element={<SurahDetail />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </Router>
  );
}

export default App;