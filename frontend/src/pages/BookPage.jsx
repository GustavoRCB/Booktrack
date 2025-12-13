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

  // ===========================
  // FAVORITOS
  // ===========================
  const [isFavorite, setIsFavorite] = useState(false);

  useEffect(() => {
    async function loadFavorites() {
      try {
        const res = await api.get("/favorites");
        const favIds = (res.data || []).map((b) => Number(b.id));
        setIsFavorite(favIds.includes(Number(id)));
      } catch (err) {
        console.error("Erro ao carregar favoritos:", err);
      }
    }

    loadFavorites();
  }, [id]);

  async function addFavorite() {
    try {
      await api.post(`/favorites/${id}`);
      setIsFavorite(true);
    } catch {
      alert("Erro ao favoritar.");
    }
  }

  async function removeFavorite() {
    try {
      await api.delete(`/favorites/${id}`);
      setIsFavorite(false);
    } catch {
      alert("Erro ao remover dos favoritos.");
    }
  }

  // ===========================
  // 1) Carregar livro
  // ===========================
  useEffect(() => {
    async function loadBook() {
      try {
        const res = await api.get(`/public-books/${id}`);
        setBook(res.data || null);
      } catch {
        setBook(null);
      } finally {
        setLoading(false);
      }
    }

    loadBook();
  }, [id]);

  // ===========================
  // 2) Verificar biblioteca
  // ===========================
  useEffect(() => {
    async function checkLibrary() {
      try {
        const res = await api.get("/users/books");
        const found = (res.data || []).find(
          (b) => String(b.book_id) === String(id)
        );

        if (found) {
          setInLibrary(true);
          setUserBookId(found.user_book_id);
          setProgress(found.status);
        } else {
          setInLibrary(false);
          setUserBookId(null);
          setProgress("want");
        }
      } catch (err) {
        console.error("Erro ao verificar biblioteca:", err);
      }
    }

    if (book) checkLibrary();
  }, [book, id]);

  // ===========================
  // 3) Adicionar à biblioteca
  // ===========================
  async function addToLibrary() {
    setProcessing(true);
    try {
      const res = await api.post(`/users/books/add/${id}`);
      setInLibrary(true);
      setUserBookId(res.data.id);
      setProgress("want");
    } catch {
      alert("Erro ao adicionar à biblioteca.");
    } finally {
      setProcessing(false);
    }
  }

  // ===========================
  // 4) Remover da biblioteca
  // ===========================
  async function removeFromLibrary() {
    if (!userBookId) return;

    try {
      await api.delete(`/users/books/remove/${userBookId}`);
      setInLibrary(false);
      setUserBookId(null);
      setProgress("want");
    } catch {
      alert("Erro ao remover da biblioteca.");
    }
  }

  // ===========================
  // 5) Atualizar progresso
  // ===========================
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

  // ===========================
  // UI
  // ===========================
  if (loading) {
    return <p className="text-brand-purple p-8">Carregando...</p>;
  }

  if (!book) {
    return (
      <p className="text-brand-purple p-8">
        Livro não encontrado.
      </p>
    );
  }

  return (
    <div className="min-h-screen bg-brand-cream text-brand-text p-10">
      <h1 className="text-4xl font-bold mb-6 text-brand-purple">
        {book.title || "Título Desconhecido"}
      </h1>

      <div className="bg-brand-sand border border-brand-taupe p-6 rounded-xl shadow flex gap-8">
        <img
          src={book.cover_url || ""}
          alt={book.title}
          className="w-48 h-72 object-cover rounded-xl shadow"
        />

        <div className="flex flex-col gap-2">
          <p className="text-brand-softtext">
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

          {isFavorite ? (
            <button
              onClick={removeFavorite}
              className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700"
            >
              ❤️ Remover dos Favoritos
            </button>
          ) : (
            <button
              onClick={addFavorite}
              className="bg-brand-purple text-white px-4 py-2 rounded-lg hover:bg-brand-royal"
            >
              🤍 Adicionar aos Favoritos
            </button>
          )}

          {!inLibrary ? (
            <button
              onClick={addToLibrary}
              disabled={processing}
              className="bg-brand-purple text-white px-4 py-2 rounded-lg hover:bg-brand-royal disabled:opacity-60"
            >
              {processing ? "Adicionando..." : "➕ Adicionar à Biblioteca"}
            </button>
          ) : (
            <button
              onClick={removeFromLibrary}
              className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700"
            >
              🗑️ Remover da Biblioteca
            </button>
          )}

          {inLibrary && (
            <div className="mt-4">
              <h3 className="font-bold text-brand-purple mb-2">
                Status de Leitura
              </h3>

              <div className="flex gap-3">
                {["want", "reading", "finished"].map((s) => (
                  <button
                    key={s}
                    onClick={() => updateProgress(s)}
                    className={`px-3 py-1 rounded-lg ${
                      progress === s
                        ? "bg-brand-purple text-white"
                        : "bg-brand-cream border border-brand-taupe"
                    }`}
                  >
                    {s === "want"
                      ? "Quero Ler"
                      : s === "reading"
                      ? "Lendo"
                      : "Terminado"}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="mt-10 bg-brand-sand border border-brand-taupe p-6 rounded-xl shadow">
        <h2 className="text-xl font-bold text-brand-purple mb-2">
          Descrição
        </h2>
        <p className="text-brand-softtext">
          {book.description || "Nenhuma descrição disponível."}
        </p>
      </div>

      {book.id && (
        <div className="mt-10">
          <ReviewSection bookId={book.id} userBookId={userBookId} />
        </div>
      )}
    </div>
  );
}
