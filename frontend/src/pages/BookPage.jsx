import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import api from "../services/api";

export default function BookPage() {
  const { id } = useParams();

  const [book, setBook] = useState(null);
  const [loading, setLoading] = useState(true);

  const [inLibrary, setInLibrary] = useState(false);
  const [userBookId, setUserBookId] = useState(null);
  const [progress, setProgress] = useState("want"); // want | reading | finished

  const [processing, setProcessing] = useState(false);

  // =========================================================
  // 1. Buscar o livro específico
  // =========================================================
  useEffect(() => {
    async function loadBook() {
      try {
        const res = await api.get(`/public-books/${id}`);
        setBook(res.data);
      } catch (error) {
        console.error("Erro ao carregar livro:", error);
        setBook(null);
      }
      setLoading(false);
    }

    loadBook();
  }, [id]);

  // =========================================================
  // 2. Checar se o livro está na biblioteca do usuário
  // =========================================================
  useEffect(() => {
    async function checkLibrary() {
      try {
        const res = await api.get("/users/books");

        const found = res.data.find((b) => b.book_id == id);

        if (found) {
          setInLibrary(true);
          setUserBookId(found.user_book_id);
          setProgress(found.status); // pega o progresso correto
        }
      } catch (error) {
        console.error("Erro ao verificar biblioteca:", error);
      }
    }

    checkLibrary();
  }, [id]);

  // =========================================================
  // 3. ADICIONAR À BIBLIOTECA
  // =========================================================
  async function addToLibrary() {
    setProcessing(true);

    try {
      const res = await api.post(`/users/books/add/${id}`);

      setInLibrary(true);
      setUserBookId(res.data.id);
      setProgress("want");

      alert("📚 Livro adicionado à sua biblioteca!");
    } catch (error) {
      console.error("Erro ao adicionar livro:", error);
      alert("❌ Erro ao adicionar o livro.");
    }

    setProcessing(false);
  }

  // =========================================================
  // 4. REMOVER DA BIBLIOTECA
  // =========================================================
  async function removeFromLibrary() {
    if (!userBookId) return;

    try {
      await api.delete(`/users/books/remove/${userBookId}`);

      setInLibrary(false);
      setUserBookId(null);
      setProgress("want");

      alert("🗑️ Livro removido da biblioteca.");
    } catch (error) {
      console.error("Erro ao remover livro:", error);
      alert("❌ Não foi possível remover.");
    }
  }

  // =========================================================
  // 5. ATUALIZAR PROGRESSO
  // =========================================================
  async function updateProgress(newStatus) {
    try {
      await api.put(`/users/books/${userBookId}/progress`, { status: newStatus });
      setProgress(newStatus);
    } catch (error) {
      console.error("Erro ao atualizar progresso:", error);
      alert("❌ Não foi possível atualizar o progresso.");
    }
  }

  // =========================================================

  if (loading) return <p className="text-white p-8">Carregando...</p>;

  if (!book)
    return (
      <p className="text-white p-8">
        Livro não encontrado no sistema (salve o livro antes!).
      </p>
    );

  return (
    <div className="min-h-screen bg-gray-900 text-white p-10">
      <h1 className="text-3xl font-bold mb-4">📖 {book.title}</h1>

      <div className="bg-gray-800 rounded-xl p-6 shadow-lg flex gap-6">
        <img
          src={book.cover_url}
          alt={book.title}
          className="w-48 h-72 object-cover rounded shadow"
        />

        <div>
          <p className="text-gray-300 text-lg mb-2">
            <b>Autor:</b> {book.author || "Desconhecido"}
          </p>
          <p className="text-gray-400 mb-2">
            <b>Ano:</b> {book.published_year || "N/A"}
          </p>
          <p className="text-gray-400 mb-4">
            <b>Páginas:</b> {book.page_count || "Não informado"}
          </p>

          {/* BOTÃO PRINCIPAL */}
          {!inLibrary ? (
            <button
              onClick={addToLibrary}
              disabled={processing}
              className="bg-blue-600 px-4 py-2 rounded hover:bg-blue-700 disabled:bg-gray-600"
            >
              {processing ? "Adicionando..." : "➕ Adicionar à Minha Biblioteca"}
            </button>
          ) : (
            <button
              onClick={removeFromLibrary}
              className="bg-red-600 px-4 py-2 rounded hover:bg-red-700"
            >
              🗑️ Remover da Biblioteca
            </button>
          )}

          {/* PROGRESSO – aparece somente se estiver na biblioteca */}
          {inLibrary && (
            <div className="mt-6">
              <h3 className="text-lg font-semibold mb-2">Status de Leitura</h3>

              <div className="flex gap-3">
                <button
                  onClick={() => updateProgress("want")}
                  className={`px-3 py-1 rounded ${
                    progress === "want"
                      ? "bg-purple-600"
                      : "bg-gray-700 hover:bg-gray-600"
                  }`}
                >
                  Quero Ler
                </button>

                <button
                  onClick={() => updateProgress("reading")}
                  className={`px-3 py-1 rounded ${
                    progress === "reading"
                      ? "bg-yellow-600"
                      : "bg-gray-700 hover:bg-gray-600"
                  }`}
                >
                  Lendo
                </button>

                <button
                  onClick={() => updateProgress("finished")}
                  className={`px-3 py-1 rounded ${
                    progress === "finished"
                      ? "bg-green-600"
                      : "bg-gray-700 hover:bg-gray-600"
                  }`}
                >
                  Terminado
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="mt-8 bg-gray-800 p-6 rounded-xl shadow">
        <h2 className="text-xl font-semibold mb-2">Descrição</h2>
        <p className="text-gray-300">
          {book.description || "Nenhuma descrição disponível."}
        </p>
      </div>

      <a
        href="/explore"
        className="inline-block mt-6 text-blue-400 hover:text-blue-300 underline"
      >
        ← Voltar à exploração
      </a>
    </div>
  );
}
