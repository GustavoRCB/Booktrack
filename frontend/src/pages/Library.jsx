import { useEffect, useState } from "react";
import api, { setAuthToken } from "../services/api";
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

    setAuthToken(token);

    api
      .get("/users/books")
      .then((res) => {
        setBooks(res.data);
        setFiltered(res.data);
      })
      .catch(() => navigate("/"));
  }, []);

  // 🎯 Aplicar filtro quando mudar o select
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
    <div className="min-h-screen bg-gray-900 text-white p-8">
      <h1 className="text-4xl font-bold mb-10 text-center">
        📚 Minha Biblioteca
      </h1>

      {/* 🔎 FILTRO DE STATUS */}
      {books.length > 0 && (
        <div className="flex justify-center mb-8">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-gray-800 border border-gray-700 text-white px-4 py-2 rounded-lg"
          >
            <option value="all">Todos</option>
            <option value="want">Quero ler</option>
            <option value="reading">Lendo</option>
            <option value="finished">Terminado</option>
          </select>
        </div>
      )}

      {filtered.length === 0 ? (
        <p className="text-center text-gray-400 text-lg">
          {statusFilter === "all"
            ? "Sua biblioteca está vazia. Adicione livros na página Explorar."
            : "Nenhum livro encontrado com esse status."}
        </p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filtered.map((book) => (
            <div
              key={book.user_book_id}
              className="bg-gray-800 p-5 rounded-2xl shadow-xl hover:shadow-2xl transition-all border border-gray-700"
            >
              {/* Capa */}
              <Link to={`/book/${book.book_id}`}>
                <div className="w-full aspect-[3/4] mb-4">
                  <img
                    src={book.cover_url || "/default-cover.png"}
                    alt={book.title}
                    className="w-full h-full object-cover rounded-xl hover:opacity-80 transition"
                  />
                </div>
              </Link>

              <h2 className="text-xl font-semibold mb-2 line-clamp-2">
                {book.title}
              </h2>

              <p className="text-gray-400 text-sm mb-1">
                ✍ {book.author || "Autor desconhecido"}
              </p>

              {/* STATUS DO LIVRO */}
              <p className="text-sm mt-2 mb-3">
                <b>Status: </b>{" "}
                {book.status === "want"
                  ? "📘 Quero ler"
                  : book.status === "reading"
                  ? "📖 Lendo"
                  : "✅ Terminado"}
              </p>

              <div className="flex items-center justify-between mt-6">
                <Link
                  to={`/book/${book.book_id}`}
                  className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 px-3 py-2 rounded-lg transition text-sm"
                >
                  <BookOpen size={18} />
                  Ver mais
                </Link>

                <button
                  className="bg-red-600 hover:bg-red-700 p-2 rounded-lg transition"
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
