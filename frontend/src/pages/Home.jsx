import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../services/api";

export default function Home() {
  const [popularBooks, setPopularBooks] = useState([]);
  const [classicBooks, setClassicBooks] = useState([]);

  const classicIds = [39, 40, 41, 42, 43, 44, 48, 9, 16, 10];

  // Livros populares
  useEffect(() => {
    async function loadPopular() {
      try {
        const res = await api.get("/public-books/popular?limit=10");
        setPopularBooks(res.data || []);
      } catch (err) {
        console.error("Erro ao carregar populares:", err);
        setPopularBooks([]);
      }
    }
    loadPopular();
  }, []);

  // Livros clássicos
  useEffect(() => {
    async function loadClassics() {
      try {
        const results = await Promise.all(
          classicIds.map(async (id) => {
            try {
              const res = await api.get(`/public-books/${id}`);
              return res.data;
            } catch {
              return null;
            }
          })
        );
        setClassicBooks(results.filter((b) => b !== null));
      } catch (err) {
        console.error("Erro ao carregar clássicos:", err);
        setClassicBooks([]);
      }
    }

    loadClassics();
  }, []);

  return (
    <div className="min-h-screen bg-brand-cream text-brand-text p-4 sm:p-10">
      {/* Título */}
      <h1 className="text-3xl sm:text-4xl font-bold mb-3 text-brand-purple">
        Bem-vindo ao Litto!
      </h1>

      <p className="text-brand-softtext mb-8 text-base sm:text-lg">
        Acompanhe sua leitura, descubra novos livros e mergulhe em histórias incríveis.
      </p>

      {/* Ações principais */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-10">
        <Link
          to="/library"
          className="
            p-4 sm:p-6 rounded-xl
            bg-brand-sand
            border border-brand-taupe
            hover:bg-brand-purple hover:text-brand-cream
            transition duration-200 shadow-sm
          "
        >
          <h2 className="text-lg sm:text-2xl font-semibold mb-1 sm:mb-2">
            Minha Biblioteca
          </h2>
          <p className="text-sm sm:text-base text-brand-softtext">
            Gerencie seus livros salvos.
          </p>
        </Link>

        <Link
          to="/explore"
          className="
            p-4 sm:p-6 rounded-xl
            bg-brand-sand
            border border-brand-taupe
            hover:bg-brand-purple hover:text-brand-cream
            transition duration-200 shadow-sm
          "
        >
          <h2 className="text-lg sm:text-2xl font-semibold mb-1 sm:mb-2">
            Explorar Livros
          </h2>
          <p className="text-sm sm:text-base text-brand-softtext">
            Encontre novos livros para ler.
          </p>
        </Link>
      </div>

      {/* Livros populares */}
      <section className="mb-14">
        <h2 className="text-2xl sm:text-3xl font-bold mb-6 text-brand-purple">
          Livros Mais Populares
        </h2>

        {popularBooks.length === 0 ? (
          <p className="text-brand-softtext">Nenhum livro popular encontrado.</p>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 sm:gap-6">
            {popularBooks.map((book) => (
              <Link
                key={book.id}
                to={`/book/${book.id}`}
                className="
                  bg-brand-sand p-3 sm:p-4 rounded-xl
                  shadow-sm border border-brand-taupe
                  hover:bg-brand-cream hover:scale-105
                  transition
                "
              >
                <img
                  src={book.cover_url || "/default-cover.png"}
                  alt={book.title}
                  className="
                    w-full
                    h-48 sm:h-56 lg:h-72
                    object-cover
                    rounded
                    mb-3
                    shadow
                  "
                />

                <h3 className="text-sm sm:text-md font-semibold line-clamp-2 text-brand-text">
                  {book.title}
                </h3>

                <p className="text-xs sm:text-sm text-brand-softtext">
                  {book.author || "Autor desconhecido"}
                </p>
              </Link>
            ))}
          </div>
        )}
      </section>

      {/* Clássicos */}
      <section className="mb-10">
        <h2 className="text-2xl sm:text-3xl font-bold mb-6 text-brand-purple">
          Clássicos Recomendados
        </h2>

        {classicBooks.length === 0 ? (
          <p className="text-brand-softtext">Carregando clássicos...</p>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 sm:gap-6">
            {classicBooks.map((book) => (
              <Link
                key={book.id}
                to={`/book/${book.id}`}
                className="
                  bg-brand-sand p-3 sm:p-4 rounded-xl
                  shadow-sm border border-brand-taupe
                  hover:bg-brand-cream hover:scale-105
                  transition
                "
              >
                <img
                  src={book.cover_url || "/default-cover.png"}
                  alt={book.title}
                  className="
                    w-full
                    h-48 sm:h-56 lg:h-72
                    object-cover
                    rounded
                    mb-3
                    shadow
                  "
                />

                <h3 className="text-sm sm:text-md font-semibold line-clamp-2 text-brand-text">
                  {book.title}
                </h3>

                <p className="text-xs sm:text-sm text-brand-softtext">
                  {book.author || "Autor desconhecido"}
                </p>
              </Link>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
