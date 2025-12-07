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
      const res = await api.post("/external-books/add", book);
      navigate(`/book/${res.data.id}`);
    } catch (err) {
      console.error("Erro ao salvar livro:", err);
      alert("Não foi possível salvar o livro.");
    }
  }

  return (
    <div className="min-h-screen bg-brand-cream text-brand-text p-8">

      {/* Título */}
      <h1 className="text-3xl font-bold mb-6 text-brand-purple">
        🔍 Explorar Livros
      </h1>

      {/* Barra de busca */}
      <div className="flex gap-2 mb-6">
        <input
          className="
            p-3 rounded w-full
            bg-brand-sand
            border border-brand-taupe
            text-brand-text
            placeholder-brand-softtext
            focus:outline-none focus:ring-2 focus:ring-brand-purple
            transition
          "
          placeholder="Buscar livros..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />

        <button
          onClick={searchBooks}
          className="
            bg-brand-purple 
            text-brand-cream 
            px-5 rounded 
            hover:bg-brand-royal 
            transition
          "
        >
          Buscar
        </button>
      </div>

      {loading && (
        <p className="text-brand-softtext">Buscando...</p>
      )}

      {/* Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6 mt-6">
        {results.map((book, i) => (
          <div
            key={i}
            className="
              bg-brand-sand 
              p-4 rounded-xl 
              border border-brand-taupe 
              cursor-pointer 
              hover:scale-105 
              hover:bg-brand-cream
              transition shadow-sm
            "
            onClick={() => openBookPage(book)}
          >
            <img
              src={book.cover_url || '/default-cover.png'}
              className="w-full h-64 object-cover rounded shadow"
              alt={book.title}
            />

            <h2 className="text-lg font-bold mt-3 text-brand-text">
              {book.title}
            </h2>

            <p className="text-brand-softtext text-sm">
              {book.author || "Autor desconhecido"}
            </p>

            {book.published_year && (
              <p className="text-brand-text text-xs mt-1">
                📅 {book.published_year}
              </p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
