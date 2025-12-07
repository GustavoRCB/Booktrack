import { useEffect, useState } from "react";
import api from "../services/api";

import { useNavigate, Link } from "react-router-dom";
import { Trash, BookOpen } from "lucide-react";

export default function Library() {
  const [books, setBooks] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [statusFilter, setStatusFilter] = useState("all");

  const navigate = useNavigate();

  // 🔌 Carregar biblioteca
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return navigate("/");

   

    api
      .get("/users/books")
      .then((res) => {
        setBooks(res.data);
        setFiltered(res.data);
      })
      .catch(() => navigate("/"));
  }, []);

  // 🎯 Aplicar filtro
  useEffect(() => {
    if (statusFilter === "all") {
      setFiltered(books);
    } else {
      setFiltered(books.filter((b) => b.status === statusFilter));
    }
  }, [statusFilter, books]);

  // 🗑️ Remover livro
  async function deleteBook(userBookId) {
    try {
      await api.delete(`/users/books/remove/${userBookId}`);
      setBooks(books.filter((b) => b.user_book_id !== userBookId));
    } catch {
      alert("Erro ao remover livro");
    }
  }

  return (
    <div className="min-h-screen bg-brand-cream text-brand-text p-10">

      <h1 className="text-4xl font-bold mb-10 text-center text-brand-purple">
        📚 Minha Biblioteca
      </h1>

      {/* 🔎 FILTRO */}
      {books.length > 0 && (
        <div className="flex justify-center mb-8">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="
              bg-brand-sand 
              border border-brand-taupe 
              text-brand-text 
              px-4 py-2 rounded-lg 
              shadow-sm focus:ring-2 focus:ring-brand-royal
            "
          >
            <option value="all">Todos</option>
            <option value="want">Quero ler</option>
            <option value="reading">Lendo</option>
            <option value="finished">Terminado</option>
          </select>
        </div>
      )}

      {/* Lista vazia */}
      {filtered.length === 0 ? (
        <p className="text-center text-brand-softtext text-lg">
          {statusFilter === "all"
            ? "Sua biblioteca está vazia. Adicione livros na página Explorar."
            : "Nenhum livro encontrado com esse status."}
        </p>
      ) : (
        <div className="
          grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 
          gap-8
        ">
          {filtered.map((book) => (
            <div
              key={book.user_book_id}
              className="
                bg-brand-sand p-5 rounded-2xl 
                shadow-sm border border-brand-taupe
                hover:shadow-md hover:scale-[1.02]
                transition-all
              "
            >
              {/* Capa */}
              <Link to={`/book/${book.book_id}`}>
                <div className="w-full aspect-[3/4] mb-4">
                  <img
                    src={book.cover_url || "/default-cover.png"}
                    alt={book.title}
                    className="w-full h-full object-cover rounded-xl transition hover:opacity-90"
                  />
                </div>
              </Link>

              {/* Título */}
              <h2 className="text-xl font-semibold mb-2 line-clamp-2">
                {book.title}
              </h2>

              {/* Autor */}
              <p className="text-brand-softtext text-sm mb-1">
                ✍ {book.author || "Autor desconhecido"}
              </p>

              {/* Status */}
              <p className="text-sm mt-2 mb-3">
                <b>Status: </b>{" "}
                {book.status === "want"
                  ? "📘 Quero ler"
                  : book.status === "reading"
                  ? "📖 Lendo"
                  : "✅ Terminado"}
              </p>

              {/* Botões */}
              <div className="flex items-center justify-between mt-6">

                <Link
                  to={`/book/${book.book_id}`}
                  className="
                    flex items-center gap-2 
                    bg-brand-purple 
                    text-brand-cream
                    hover:bg-brand-royal 
                    px-3 py-2 rounded-lg 
                    transition text-sm
                  "
                >
                  <BookOpen size={18} />
                  Ver mais
                </Link>

                <button
                  className="
                    bg-red-600 hover:bg-red-700 
                    p-2 rounded-lg transition
                  "
                  onClick={() => deleteBook(book.user_book_id)}
                >
                  <Trash size={18} />
                </button>

              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
