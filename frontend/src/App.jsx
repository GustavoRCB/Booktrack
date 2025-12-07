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

// ==============================
// Wrapper para esconder a navbar
// em rotas públicas (login/register)
// ==============================
function Layout({ children }) {
  const location = useLocation();
  const noNavbar = ["/", "/register"].includes(location.pathname);

  return (
    <>
      {!noNavbar && <Navbar />}
      {children}
    </>
  );
}

function App() {
  return (
    <BrowserRouter>
      <Layout>
        <Routes>

          {/* Acesso público */}
          <Route path="/" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Rotas privadas */}
          <Route path="/home" element={<Home />} />
          <Route path="/library" element={<Library />} />
          <Route path="/explore" element={<Explore />} />

          {/* Livro do catálogo interno */}
          <Route path="/book/:id" element={<BookPage />} />

          {/* Livro vindo do Google — usando a MESMA BookPage */}
          <Route path="/book/google/:gid" element={<BookPage />} />

          {/* Perfil do usuário */}
          <Route path="/profile" element={<ProfilePage />} />

        </Routes>
      </Layout>
    </BrowserRouter>
  );
}

export default App;
