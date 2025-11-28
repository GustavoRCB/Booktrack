import { BrowserRouter, Routes, Route } from "react-router-dom";

// Componentes
import Navbar from "./components/Navbar";

// Páginas
import Login from "./pages/Login";
import Register from "./pages/Register";
import Library from "./pages/Library";
import Home from "./pages/Home";
import BookPage from "./pages/BookPage";
import Explore from "./pages/Explore";

function App() {
  return (
    <BrowserRouter>
      <Navbar />

      <Routes>
        {/* Acesso público */}
        <Route path="/" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Páginas do usuário */}
        <Route path="/home" element={<Home />} />
        <Route path="/library" element={<Library />} />
        <Route path="/explore" element={<Explore />} />

        {/* Página individual do livro */}
        <Route path="/book/:id" element={<BookPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
