import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import MainLayout from "./layouts/MainLayout";
import Home from "./pages/Home";
import Quran from "./pages/Quran";
import Prayer from "./pages/Prayer";
import SurahDetail from "./pages/SurahDetail"; 

function App() {
  return (
    <Router>
      <MainLayout>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/quran" element={<Quran />} />
          <Route path="/prayer" element={<Prayer />} />
          <Route path="/quran/:id" element={<SurahDetail />} /> {/* Dynamic route */}
        </Routes>
      </MainLayout>
    </Router>
  );
}

export default App;
