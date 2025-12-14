import { Link, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import api from "../services/api";

export default function Navbar() {
  const navigate = useNavigate();
  const [avatar, setAvatar] = useState(null);

  function logout() {
    localStorage.removeItem("token");
    navigate("/"); // Redireciona para a tela inicial
  }

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return; // Se não estiver logado, não faz a requisição

    async function loadAvatar() {
      try {
        const res = await api.get("/profile/me"); // Requisição para obter o avatar do perfil
        setAvatar(res.data.profile?.avatar_url || "/default-avatar.png");
      } catch (err) {
        console.error("Erro ao carregar avatar:", err);
      }
    }

    loadAvatar();
  }, []);

  return (
    <nav
      className="w-full backdrop-blur-md bg-white/60 border-b border-brand-taupe/30 shadow-sm px-8 py-4 flex items-center justify-between sticky top-0 z-50"
    >
      {/* LOGO */}
      <Link
        to="/home"
        className="text-3xl font-semibold tracking-tight text-brand-purple"
      >
        Litto
      </Link>

      {/* LINKS */}
      <div className="flex items-center gap-8 text-brand-text font-medium">
        <Link
          to="/home"
          className="hover:text-brand-purple transition-colors"
        >
          Home
        </Link>

        <Link
          to="/library"
          className="hover:text-brand-purple transition"
        >
          Biblioteca
        </Link>

        <Link
          to="/explore"
          className="hover:text-brand-purple transition"
        >
          Explorar
        </Link>

        {/* AVATAR → PERFIL */}
        <Link to="/profile"> {/* Aqui é o link correto para acessar o perfil */}
          <img
            src={avatar || "/default-avatar.png"}
            alt="Perfil"
            className="
              w-10 h-10 
              rounded-full 
              object-cover 
              border border-brand-purple/40 
              hover:ring-2 hover:ring-brand-purple/50
              transition
              cursor-pointer
            "
          />
        </Link>

        {/* SAIR */}
        <button
          onClick={logout}
          className="
            bg-brand-purple 
            text-white 
            px-4 py-2 
            rounded-lg 
            font-medium 
            hover:bg-brand-royal 
            transition
            shadow-sm
          "
        >
          Sair
        </button>
      </div>
    </nav>
  );
}
