import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";

// Componentes
import Navbar from "./components/Navbar";

// Páginas
import Login from "./pages/Login";
import Register from "./pages/Register";
import Library from "./pages/Library";
import Home from "./pages/Home";
import BookPage from "./pages/BookPage";
import Explore from "./pages/Explore";
import ProfilePage from "./pages/ProfilePage";
import EditProfilePage from "./pages/EditProfilePage";
import AboutPage from "./pages/AboutPage"; // ✅ NOVA PÁGINA

// ==============================
// Wrapper para esconder a navbar
// ==============================
function Layout({ children }) {
  const location = useLocation();

  const noNavbarRoutes = ["/", "/register"];
  const hideNavbar = noNavbarRoutes.includes(location.pathname);

  return (
    <>
      {!hideNavbar && <Navbar />}
      {children}
    </>
  );
}

function App() {
  return (
    <BrowserRouter>
      <Layout>
        <Routes>

          {/* Públicas */}
          <Route path="/" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Privadas */}
          <Route path="/home" element={<Home />} />
          <Route path="/library" element={<Library />} />
          <Route path="/explore" element={<Explore />} />

          {/* Livro */}
          <Route path="/book/:id" element={<BookPage />} />
          <Route path="/book/google/:gid" element={<BookPage />} />

          {/* Perfil */}
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/profile/edit" element={<EditProfilePage />} />

          {/* Institucional */}
          <Route path="/about" element={<AboutPage />} /> {/* ✅ */}

        </Routes>
      </Layout>
    </BrowserRouter>
  );
}

export default App;
