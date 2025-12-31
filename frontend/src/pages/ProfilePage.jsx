import { useEffect, useState } from "react";
import api from "../services/api";
import { Link, useNavigate } from "react-router-dom";

export default function ProfilePage() {
  const navigate = useNavigate();

  const [profile, setProfile] = useState(null);
  const [favorites, setFavorites] = useState([]);
  const [recent, setRecent] = useState([]);
  const [stats, setStats] = useState({
    books_read: 0,
    books_read_this_year: 0,
    pages_read: 0,
    average_rating: null,
  });
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
        setStats(res.data.stats || stats);
      } catch (err) {
        console.error("Erro ao carregar perfil:", err);
        setProfile(null);
      } finally {
        setLoading(false);
      }
    }

    loadProfile();
  }, [navigate]);

  if (loading) {
    return (
      <p className="text-brand-purple p-8 text-center">
        Carregando perfil...
      </p>
    );
  }

  if (!profile) {
    return (
      <p className="text-red-600 p-8 text-center">
        Não foi possível carregar o perfil.
      </p>
    );
  }

  return (
    <div className="min-h-screen bg-brand-cream text-brand-text">
      <div className="max-w-6xl mx-auto px-3 sm:px-6 lg:px-8 py-6 sm:py-10">

        {/* CABEÇALHO */}
        <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-6 mb-6 sm:mb-12">
          <img
            src={profile.avatar_url || "/default-avatar.png"}
            alt="avatar"
            className="
              w-20 h-20 sm:w-32 sm:h-32
              rounded-full object-cover
              border-2 border-brand-purple shadow-lg
            "
          />

          <div className="text-center sm:text-left">
            <h1 className="text-2xl sm:text-4xl font-bold text-brand-purple">
              {profile.name}
            </h1>

            <p className="text-brand-softtext mt-1 text-sm sm:text-base line-clamp-1">
              {profile.bio || "Sem biografia ainda."}
            </p>

            <Link
              to="/profile/edit"
              className="
                inline-block mt-2 sm:mt-4
                px-3 py-1.5 sm:px-4 sm:py-2
                text-sm sm:text-base
                bg-brand-purple text-white
                rounded-lg
                hover:bg-brand-royal transition
              "
            >
              Editar perfil
            </Link>
          </div>
        </div>

        {/* ESTATÍSTICAS */}
        <section className="mb-6 sm:mb-14">
          <h2 className="text-lg sm:text-2xl font-semibold mb-3 sm:mb-4 text-brand-marrom">
            Estatísticas
          </h2>

          <div className="grid grid-cols-2 sm:grid-cols-2 gap-3 sm:gap-6">
            <div className="bg-brand-sand p-3 sm:p-6 rounded-xl text-center border border-brand-taupe shadow">
              <p className="text-xl sm:text-4xl font-bold text-brand-purple">
                {stats.books_read}
              </p>
              <p className="text-brand-softtext mt-1 text-xs sm:text-base">
                Livros lidos (total)
              </p>
            </div>

            <div className="bg-brand-sand p-3 sm:p-6 rounded-xl text-center border border-brand-taupe shadow">
              <p className="text-xl sm:text-4xl font-bold text-brand-royal">
                {stats.books_read_this_year}
              </p>
              <p className="text-brand-softtext mt-1 text-xs sm:text-base">
                Livros lidos em {new Date().getFullYear()}
              </p>
            </div>
          </div>
        </section>

        {/* FAVORITOS */}
        <section className="mb-6 sm:mb-14">
          <h2 className="text-lg sm:text-2xl font-semibold mb-3 sm:mb-6 text-brand-marrom">
            Favoritos
          </h2>

          {favorites.length === 0 ? (
            <p className="text-brand-softtext text-sm">
              Você ainda não marcou favoritos.
            </p>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-3 sm:gap-6">
              {favorites.map((book) => (
                <Link
                  key={book.id}
                  to={`/book/${book.id}`}
                  className="
                    col-span-1 sm:col-span-2 lg:col-span-2
                    bg-brand-sand
                    p-3 sm:p-5
                    rounded-2xl
                    shadow-md
                    border border-brand-taupe
                    hover:bg-brand-cream
                    hover:scale-[1.03]
                    transition
                  "
                >
                  <div className="w-full aspect-[3/4] mb-2 sm:mb-4">
                    <img
                      src={book.cover_url || "/default-cover.png"}
                      alt={book.title}
                      className="
                        w-full h-full
                        object-cover
                        rounded-xl
                        shadow
                      "
                    />
                  </div>

                  <p className="font-semibold text-xs sm:text-base line-clamp-1 text-center">
                    {book.title}
                  </p>
                </Link>
              ))}
            </div>
          )}
        </section>

      </div>
    </div>
  );
}
