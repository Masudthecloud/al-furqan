import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Header from "./components/Header";
import Home from "./pages/Home";
import Quran from "./pages/Quran";
import Prayer from "./pages/Prayer";
import SurahDetail from "./pages/SurahDetail";
import Bookmarks from "./pages/Bookmarks";
import MushafReader from "./pages/MushafReader";
import Footer from "./components/Footer";

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
            <Route path="/bookmarks" element={<Bookmarks />} />
            <Route path="/quran/:id" element={<SurahDetail />} />
            <Route path="/surah/:id" element={<SurahDetail />} />
            <Route path="/mushaf/:id" element={<MushafReader />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </Router>
  );
}

export default App;