import { useEffect, useState } from "react";
import api from "../services/api";
import { Link, useNavigate } from "react-router-dom";

export default function ProfilePage() {
  const navigate = useNavigate();

  const [profile, setProfile] = useState(null);
  const [favorites, setFavorites] = useState([]);
  const [recent, setRecent] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadProfile() {
      const token = localStorage.getItem("token");

      if (!token) {
        navigate("/");
        return;
      }

      try {
        const res = await api.get("/profile/me");

        setProfile(res.data.profile);
        setFavorites(res.data.favorites || []);
        setRecent(res.data.recent_books || []);
        setStats(res.data.stats);

      } catch (err) {
        console.error("Erro ao carregar perfil:", err);
        navigate("/");
      } finally {
        setLoading(false);
      }
    }

    loadProfile();
  }, [navigate]);

  // ==============================
  // ESTADOS: CARREGANDO OU ERRO
  // ==============================
  if (loading) {
    return <p className="text-brand-purple p-8">Carregando perfil...</p>;
  }

  if (!profile) {
    return (
      <p className="text-red-600 p-8">
        Erro ao carregar perfil. Tente novamente.
      </p>
    );
  }

  // ==============================
  // UI PRINCIPAL
  // ==============================
  return (
    <div className="min-h-screen bg-brand-cream text-brand-text p-10">

      {/* CABEÇALHO */}
      <div className="flex flex-col sm:flex-row items-center gap-6 mb-12">
        <img
          src={profile.avatar_url || "/default-avatar.png"}
          alt="avatar"
          className="w-32 h-32 rounded-full object-cover border-2 border-brand-purple shadow-lg"
        />

        <div className="text-center sm:text-left">
          <h1 className="text-4xl font-bold text-brand-purple">{profile.name}</h1>
          <p className="text-brand-softtext">
            {profile.bio || "Sem biografia ainda."}
          </p>
        </div>
      </div>

      {/* ESTATÍSTICAS */}
      <section className="mb-14">
        <h2 className="text-2xl font-semibold mb-4 text-brand-marrom">
          📊 Suas Estatísticas
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">

          <div className="bg-brand-sand p-6 rounded-xl text-center border border-brand-taupe shadow">
            <p className="text-4xl font-bold text-brand-purple">
              {stats.books_read}
            </p>
            <p className="text-brand-softtext mt-2">Livros lidos</p>
          </div>

          <div className="bg-brand-sand p-6 rounded-xl text-center border border-brand-taupe shadow">
            <p className="text-4xl font-bold text-brand-royal">
              {stats.pages_read}
            </p>
            <p className="text-brand-softtext mt-2">Páginas lidas</p>
          </div>

          <div className="bg-brand-sand p-6 rounded-xl text-center border border-brand-taupe shadow">
            <p className="text-4xl font-bold text-brand-gold">
              {stats.average_rating ? stats.average_rating.toFixed(1) : "-"}
            </p>
            <p className="text-brand-softtext mt-2">Nota média</p>
          </div>

        </div>
      </section>

      {/* FAVORITOS */}
      <section className="mb-14">
        <h2 className="text-2xl font-semibold mb-4 text-brand-marrom">⭐ Favoritos</h2>

        {favorites.length === 0 ? (
          <p className="text-brand-softtext">Você ainda não marcou favoritos.</p>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-6">
            {favorites.map((book) => (
              <Link
                key={book.id}
                to={`/book/${book.id}`}
                className="
                  bg-brand-sand 
                  p-4 rounded-xl 
                  shadow border border-brand-taupe 
                  hover:bg-brand-cream 
                  transition
                "
              >
                <img
                  src={book.cover_url}
                  alt={book.title}
                  className="w-full h-40 object-cover rounded mb-3 shadow"
                />
                <p className="font-semibold text-sm line-clamp-2">{book.title}</p>
              </Link>
            ))}
          </div>
        )}
      </section>

      {/* RECENTES */}
      <section>
        <h2 className="text-2xl font-semibold mb-4 text-brand-marrom">
          📚 Últimos adicionados
        </h2>

        {recent.length === 0 ? (
          <p className="text-brand-softtext">Nenhum livro recente.</p>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-6">
            {recent.map((book) => (
              <Link
                key={book.id}
                to={`/book/${book.id}`}
                className="
                  bg-brand-sand 
                  p-4 rounded-xl 
                  shadow border border-brand-taupe 
                  hover:bg-brand-cream 
                  transition
                "
              >
                <img
                  src={book.cover_url}
                  alt={book.title}
                  className="w-full h-40 object-cover rounded mb-3 shadow"
                />
                <p className="font-semibold text-sm line-clamp-2">{book.title}</p>
              </Link>
            ))}
          </div>
        )}
      </section>

    </div>
  );
}
