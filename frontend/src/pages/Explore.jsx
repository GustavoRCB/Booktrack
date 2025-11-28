import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";

export default function Explore() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  async function searchBooks() {
    if (!query.trim()) return;

    setLoading(true);

    try {
      const res = await api.get(`/external-books/search?q=${query}`);
      setResults(res.data);
    } catch (err) {
      console.error("Erro ao buscar livros", err);
      alert("Erro ao buscar livros");
    }

    setLoading(false);
  }

  async function openBookPage(book) {
    try {
      // 1. salvar no Supabase
      const res = await api.post("/external-books/add", book);

      const bookId = res.data.id;

      // 2. redirecionar para a página do livro
      navigate(`/book/${bookId}`);

    } catch (err) {
      console.error("Erro ao salvar livro:", err);
      alert("Não foi possível salvar o livro.");
    }
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white p-8">
      <h1 className="text-3xl font-bold mb-6">🔍 Explorar Livros</h1>

      <div className="flex gap-2 mb-6">
        <input
          className="p-2 bg-gray-700 rounded w-full"
          placeholder="Buscar livros..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <button
          onClick={searchBooks}
          className="bg-blue-600 px-4 rounded hover:bg-blue-700 transition"
        >
          Buscar
        </button>
      </div>

      {loading && <p className="text-gray-400">Buscando...</p>}

      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6 mt-6">
        {results.map((book, i) => (
          <div
            key={i}
            className="bg-gray-800 p-4 rounded-xl border border-gray-700 cursor-pointer hover:scale-105 transition"
            onClick={() => openBookPage(book)}
          >
            <img
              src={book.cover_url || "/default-cover.png"}
              className="w-full h-64 object-cover rounded"
              alt={book.title}
            />

            <h2 className="text-lg font-bold mt-3">{book.title}</h2>
            <p className="text-gray-400 text-sm">
              {book.author || "Autor desconhecido"}
            </p>

            {book.published_year && (
              <p className="text-gray-500 text-xs mt-1">📅 {book.published_year}</p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
