import "@/App.css";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import LobbyDisplay from "./pages/LobbyDisplay";
import AdminPanel from "./pages/AdminPanel";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LobbyDisplay />} />
        <Route path="/admin" element={<AdminPanel />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
