import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../services/api";

export default function Home() {
  const [popularBooks, setPopularBooks] = useState([]);
  const [classicBooks, setClassicBooks] = useState([]);

  const classicIds = [39, 40, 41, 42, 43, 44, 48, 9, 16, 10];

  // =============================
  // 1. Buscar livros mais populares
  // =============================
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

  // =============================
  // 2. Buscar clássicos pelo ID
  // =============================
  useEffect(() => {
    async function loadClassics() {
      try {
        const results = await Promise.all(
          classicIds.map(async (id) => {
            try {
              const res = await api.get(`/public-books/${id}`);
              return res.data;
            } catch {
              console.warn(`Livro clássico ${id} não encontrado.`);
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
    <div className="min-h-screen bg-gray-900 text-white p-10">

      {/* ============================
         Título principal
      ============================= */}
      <h1 className="text-4xl font-bold mb-6">📚 Bem-vindo ao BookTrack!</h1>
      <p className="text-gray-300 mb-10 text-lg">
        Acompanhe seu progresso, explore novos livros e organize sua leitura.
      </p>

      {/* ============================
         Ações principais
      ============================= */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-12">

        <Link
          to="/library"
          className="p-6 bg-gray-800 rounded-xl hover:bg-gray-700 transition duration-200 shadow"
        >
          <h2 className="text-2xl font-semibold mb-2">📘 Minha Biblioteca</h2>
          <p>Veja e gerencie seus livros salvos.</p>
        </Link>

        <Link
          to="/explore"
          className="p-6 bg-gray-800 rounded-xl hover:bg-gray-700 transition duration-200 shadow"
        >
          <h2 className="text-2xl font-semibold mb-2">🔍 Explorar Livros</h2>
          <p>Encontre novos livros usando a Google Books API.</p>
        </Link>

      </div>

      {/* ============================
         Livros mais populares
      ============================= */}
      <section className="mb-16">
        <h2 className="text-3xl font-bold mb-6">🔥 Livros Mais Populares</h2>

        {popularBooks.length === 0 ? (
          <p className="text-gray-400">Nenhum livro popular encontrado.</p>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-6">
            {popularBooks.map((book) => (
              <Link
                key={book.id}
                to={`/book/${book.id}`}
                className="bg-gray-800 p-4 rounded-xl shadow hover:bg-gray-700 transition"
              >
                <img
                  src={book.cover_url || "/default-cover.png"}
                  alt={book.title}
                  className="w-full h-48 object-cover rounded mb-3"
                />
                <h3 className="text-md font-semibold line-clamp-2">
                  {book.title}
                </h3>
                <p className="text-sm text-gray-400">
                  {book.author || "Autor desconhecido"}
                </p>
              </Link>
            ))}
          </div>
        )}
      </section>

      {/* ============================
         Clássicos recomendados
      ============================= */}
      <section className="mb-10">
        <h2 className="text-3xl font-bold mb-6">📖 Clássicos Recomendados</h2>

        {classicBooks.length === 0 ? (
          <p className="text-gray-400">Carregando clássicos...</p>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-6">
            {classicBooks.map((book) => (
              <Link
                key={book.id}
                to={`/book/${book.id}`}
                className="bg-gray-800 p-4 rounded-xl shadow hover:bg-gray-700 transition"
              >
                <img
                  src={book.cover_url || "/default-cover.png"}
                  alt={book.title}
                  className="w-full h-48 object-cover rounded mb-3"
                />
                <h3 className="text-md font-semibold line-clamp-2">
                  {book.title}
                </h3>
                <p className="text-sm text-gray-400">
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
