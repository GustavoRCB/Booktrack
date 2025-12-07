import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import api from "../services/api";
import ReviewSection from "../components/ReviewSection";

export default function BookPage() {
  const { id } = useParams();

  const [book, setBook] = useState(null);
  const [loading, setLoading] = useState(true);

  const [inLibrary, setInLibrary] = useState(false);
  const [userBookId, setUserBookId] = useState(null);
  const [progress, setProgress] = useState("want");
  const [processing, setProcessing] = useState(false);

  // ---------------------------
  // FAVORITOS
  // ---------------------------
  const [isFavorite, setIsFavorite] = useState(false);

  useEffect(() => {
    async function loadFavorite() {
      try {
        const res = await api.get("/favorites");
        const favIds = res.data.map((b) => b.id);
        setIsFavorite(favIds.includes(Number(id)));
      } catch (err) {
        console.log("Erro ao carregar favoritos:", err);
      }
    }

    loadFavorite();
  }, [id]);

  async function addFavorite() {
    try {
      await api.post(`/favorites/${id}`);
      setIsFavorite(true);
    } catch (err) {
      console.error(err);
      alert("Erro ao favoritar.");
    }
  }

  async function removeFavorite() {
    try {
      await api.delete(`/favorites/${id}`);
      setIsFavorite(false);
    } catch (err) {
      console.error(err);
      alert("Erro ao remover dos favoritos.");
    }
  }

  // -------------------------------------------------------
  // 1) Carregar livro
  // -------------------------------------------------------
  useEffect(() => {
    async function loadBook() {
      try {
        const res = await api.get(`/public-books/${id}`);
        setBook(res.data || null);
      } catch (error) {
        console.error("Erro ao carregar livro:", error);
        setBook(null);
      }
      setLoading(false);
    }
    loadBook();
  }, [id]);

  // -------------------------------------------------------
  // 2) Verificar se está na biblioteca
  // -------------------------------------------------------
  useEffect(() => {
    async function checkLibrary() {
      try {
        const res = await api.get("/users/books");
        const found = res.data.find((b) => String(b.book_id) === String(id));
        if (found) {
          setInLibrary(true);
          setUserBookId(found.user_book_id);
          setProgress(found.status);
        }
      } catch (error) {
        console.error("Erro ao verificar biblioteca:", error);
      }
    }
    if (book) checkLibrary();
  }, [id, book]);

  // -------------------------------------------------------
  // 3) Adicionar
  // -------------------------------------------------------
  async function addToLibrary() {
    setProcessing(true);
    try {
      const res = await api.post(`/users/books/add/${id}`);
      setInLibrary(true);
      setUserBookId(res.data.id);
      setProgress("want");
    } catch (err) {
      alert("Erro ao adicionar.");
    }
    setProcessing(false);
  }

  // -------------------------------------------------------
  // 4) Remover
  // -------------------------------------------------------
  async function removeFromLibrary() {
    if (!userBookId) return;

    try {
      await api.delete(`/users/books/remove/${userBookId}`);
      setInLibrary(false);
      setUserBookId(null);
      setProgress("want");
    } catch {
      alert("Erro ao remover.");
    }
  }

  // -------------------------------------------------------
  // 5) Atualizar progresso
  // -------------------------------------------------------
  async function updateProgress(newStatus) {
    if (!userBookId) return;

    try {
      await api.put(`/users/books/${userBookId}/progress`, {
        status: newStatus,
      });
      setProgress(newStatus);
    } catch {
      alert("Erro ao atualizar progresso.");
    }
  }

  // -------------------------------------------------------
  // UI
  // -------------------------------------------------------
  if (loading)
    return <p className="text-brand-purple p-8">Carregando...</p>;

  if (!book)
    return (
      <p className="text-brand-purple p-8">
        Livro não encontrado.
      </p>
    );

  return (
    <div className="min-h-screen bg-brand-cream text-brand-text p-10">

      <h1 className="text-4xl font-bold mb-6 text-brand-purple">
        {book.title || "Título Desconhecido"}
      </h1>

      <div className="bg-brand-sand border border-brand-taupe p-6 rounded-xl shadow flex gap-8">

        <img
          src={book.cover_url || ""}
          alt={book.title || "Capa do livro"}
          className="w-48 h-72 object-cover rounded-xl shadow"
        />

        <div className="flex flex-col gap-2">
          <p className="text-brand-softtext text-lg">
            <b className="text-brand-purple">Autor:</b>{" "}
            {book.author || "Desconhecido"}
          </p>

          <p className="text-brand-softtext">
            <b className="text-brand-purple">Ano:</b>{" "}
            {book.published_year || "N/A"}
          </p>

          <p className="text-brand-softtext mb-4">
            <b className="text-brand-purple">Páginas:</b>{" "}
            {book.page_count || "N/A"}
          </p>

          {/* ------------------------- */}
          {/* BOTÃO FAVORITAR */}
          {/* ------------------------- */}
          {isFavorite ? (
            <button
              onClick={removeFavorite}
              className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition"
            >
              ❤️ Remover dos Favoritos
            </button>
          ) : (
            <button
              onClick={addFavorite}
              className="bg-brand-purple text-white px-4 py-2 rounded-lg hover:bg-brand-royal transition"
            >
              🤍 Adicionar aos Favoritos
            </button>
          )}

          {/* ------------------------- */}
          {/* BIBLIOTECA */}
          {/* ------------------------- */}
          {!inLibrary ? (
            <button
              onClick={addToLibrary}
              disabled={processing}
              className="
                  bg-brand-purple text-white px-4 py-2 rounded-lg 
                  hover:bg-brand-royal transition disabled:bg-brand-softtext
                "
            >
              {processing ? "Adicionando..." : "➕ Adicionar à Biblioteca"}
            </button>
          ) : (
            <button
              onClick={removeFromLibrary}
              className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition"
            >
              🗑️ Remover da Biblioteca
            </button>
          )}

          {/* STATUS */}
          {inLibrary && (
            <div className="mt-4">
              <h3 className="text-lg font-bold text-brand-purple mb-2">
                Status de Leitura
              </h3>

              <div className="flex gap-3">
                <button
                  onClick={() => updateProgress("want")}
                  className={`px-3 py-1 rounded-lg ${
                    progress === "want"
                      ? "bg-brand-purple text-white"
                      : "bg-brand-cream border border-brand-taupe hover:bg-brand-purple hover:text-white"
                  }`}
                >
                  Quero Ler
                </button>

                <button
                  onClick={() => updateProgress("reading")}
                  className={`px-3 py-1 rounded-lg ${
                    progress === "reading"
                      ? "bg-brand-royal text-white"
                      : "bg-brand-cream border border-brand-taupe hover:bg-brand-royal hover:text-white"
                  }`}
                >
                  Lendo
                </button>

                <button
                  onClick={() => updateProgress("finished")}
                  className={`px-3 py-1 rounded-lg ${
                    progress === "finished"
                      ? "bg-brand-green text-white"
                      : "bg-brand-cream border border-brand-taupe hover:bg-brand-green hover:text-white"
                  }`}
                >
                  Terminado
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* DESCRIÇÃO */}
      <div className="mt-10 bg-brand-sand border border-brand-taupe p-6 rounded-xl shadow">
        <h2 className="text-xl font-bold mb-2 text-brand-purple">
          Descrição
        </h2>
        <p className="text-brand-softtext">
          {book.description || "Nenhuma descrição disponível."}
        </p>
      </div>

      {/* REVIEWS */}
      {book.id && (
        <div className="mt-10">
          <ReviewSection bookId={book.id} userBookId={userBookId} />
        </div>
      )}

      <a
        href="/explore"
        className="inline-block mt-6 text-brand-purple hover:text-brand-royal underline"
      >
        ← Voltar à exploração
      </a>
    </div>
  );
}
