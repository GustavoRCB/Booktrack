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

  const [showDateInput, setShowDateInput] = useState(false);
  const [completionDate, setCompletionDate] = useState("");

  const [isFavorite, setIsFavorite] = useState(false);
  const [favLoading, setFavLoading] = useState(false);

  // ===========================
  // Favoritos
  // ===========================
  useEffect(() => {
    async function loadFavorites() {
      try {
        const res = await api.get("/profile/favorites");
        const favIds = (res.data || []).map((b) => Number(b.id));
        setIsFavorite(favIds.includes(Number(id)));
      } catch (err) {
        console.error("Erro ao carregar favoritos:", err);
      }
    }
    loadFavorites();
  }, [id]);

  async function addFavorite() {
    if (favLoading) return;
    setFavLoading(true);
    try {
      await api.post(`/profile/favorites/${id}`);
      setIsFavorite(true);
    } catch {
      alert("Erro ao favoritar.");
    } finally {
      setFavLoading(false);
    }
  }

  async function removeFavorite() {
    if (favLoading) return;
    setFavLoading(true);
    try {
      await api.delete(`/profile/favorites/${id}`);
      setIsFavorite(false);
    } catch {
      alert("Erro ao remover dos favoritos.");
    } finally {
      setFavLoading(false);
    }
  }

  // ===========================
  // Carregar livro
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
  // Biblioteca
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
          setCompletionDate(found.completion_date || "");
        } else {
          setInLibrary(false);
          setUserBookId(null);
          setProgress("want");
          setCompletionDate("");
        }
      } catch (err) {
        console.error("Erro ao verificar biblioteca:", err);
      }
    }
    if (book) checkLibrary();
  }, [book, id]);

  async function addToLibrary() {
    if (processing) return;
    setProcessing(true);
    try {
      const res = await api.post(`/users/books/add/${id}`);
      setInLibrary(true);
      setUserBookId(res.data.id);
    } catch {
      alert("Erro ao adicionar à biblioteca.");
    } finally {
      setProcessing(false);
    }
  }

  async function removeFromLibrary() {
    if (!userBookId) return;
    try {
      await api.delete(`/users/books/remove/${userBookId}`);
      setInLibrary(false);
      setUserBookId(null);
      setProgress("want");
      setCompletionDate("");
    } catch {
      alert("Erro ao remover da biblioteca.");
    }
  }

  async function updateProgress(newStatus) {
    if (!userBookId) return;

    if (newStatus === "finished") {
      const confirmDate = window.confirm(
        "Deseja adicionar a data de conclusão?"
      );
      if (confirmDate) {
        setShowDateInput(true);
        return;
      }
    }

    try {
      await api.put(`/users/books/${userBookId}/progress`, {
        status: newStatus,
        completion_date: null,
      });
      setProgress(newStatus);
      setCompletionDate("");
      setShowDateInput(false);
    } catch {
      alert("Erro ao atualizar progresso.");
    }
  }

  async function saveCompletionDate() {
    if (!completionDate) return alert("Selecione uma data válida.");

    try {
      await api.put(`/users/books/${userBookId}/progress`, {
        status: "finished",
        completion_date: completionDate,
      });
      setProgress("finished");
      setShowDateInput(false);
    } catch {
      alert("Erro ao salvar data de conclusão.");
    }
  }

  // ===========================
  // UI
  // ===========================
  if (loading) {
    return <p className="text-brand-purple p-8">Carregando...</p>;
  }

  if (!book) {
    return <p className="text-brand-purple p-8">Livro não encontrado.</p>;
  }

  return (
    <div className="min-h-screen bg-brand-cream text-brand-text p-6 sm:p-10">
      <h1 className="text-4xl font-bold mb-6 text-brand-purple">
        {book.title || "Título Desconhecido"}
      </h1>

      {/* CARD PRINCIPAL */}
      <div className="bg-brand-sand border border-brand-taupe p-6 rounded-xl shadow flex flex-col sm:flex-row gap-6 sm:gap-8">
        {/* CAPA */}
        <img
          src={book.cover_url || ""}
          alt={book.title}
          className="w-40 h-60 sm:w-48 sm:h-72 object-cover rounded-xl shadow mx-auto sm:mx-0"
        />

        {/* CONTEÚDO */}
        <div className="flex flex-col gap-4 w-full">
          {/* INFOS */}
          <div>
            <p className="text-brand-softtext">
              <b className="text-brand-purple">Autor:</b>{" "}
              {book.author || "Desconhecido"}
            </p>
            <p className="text-brand-softtext">
              <b className="text-brand-purple">Ano:</b>{" "}
              {book.published_year || "N/A"}
            </p>
            <p className="text-brand-softtext">
              <b className="text-brand-purple">Páginas:</b>{" "}
              {book.page_count || "N/A"}
            </p>
          </div>

          {/* BOTÕES (mobile: entre capa e descrição) */}
          <div className="flex flex-col gap-3 sm:w-fit">
            {isFavorite ? (
              <button
                onClick={removeFavorite}
                disabled={favLoading}
                className="bg-brand-cream border border-brand-purple text-brand-purple px-4 py-2 rounded-lg hover:bg-brand-sand disabled:opacity-60 transition"

              >
                Remover dos Favoritos
              </button>
            ) : (
              <button
                onClick={addFavorite}
                disabled={favLoading}
                className="bg-brand-purple text-white px-4 py-2 rounded-lg hover:bg-brand-royal disabled:opacity-60"
              >
                Adicionar aos Favoritos
              </button>
            )}

            {!inLibrary ? (
              <button
                onClick={addToLibrary}
                disabled={processing}
                className="bg-brand-purple text-white px-4 py-2 rounded-lg hover:bg-brand-royal disabled:opacity-60"
              >
                {processing ? "Adicionando..." : "Adicionar à Biblioteca"}
              </button>
            ) : (
              <button
                onClick={removeFromLibrary}
                className="bg-brand-cream border border-brand-purple text-brand-purple px-4 py-2 rounded-lg hover:bg-brand-sand disabled:opacity-60 transition"

              >
                Remover da Biblioteca
              </button>
            )}
          </div>

          {/* STATUS */}
          {inLibrary && (
            <div>
              <h3 className="font-bold text-brand-purple mb-2">
                Status de Leitura
              </h3>

              <div className="flex gap-3 flex-wrap">
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

              {showDateInput && (
                <div className="mt-3">
                  <input
                    type="date"
                    value={completionDate}
                    onChange={(e) => setCompletionDate(e.target.value)}
                    className="border border-brand-taupe rounded px-2 py-1"
                  />
                  <button
                    onClick={saveCompletionDate}
                    className="ml-2 bg-brand-purple text-white px-3 py-1 rounded-lg hover:bg-brand-royal"
                  >
                    Salvar
                  </button>
                </div>
              )}

              {progress === "finished" && completionDate && (
                <p className="text-sm text-brand-softtext mt-2">
                  Concluído em{" "}
                  {new Date(completionDate).toLocaleDateString("pt-BR")}
                </p>
              )}
            </div>
          )}
        </div>
      </div>

      {/* DESCRIÇÃO */}
      <div className="mt-10 bg-brand-sand border border-brand-taupe p-6 rounded-xl shadow">
        <h2 className="text-xl font-bold text-brand-purple mb-2">
          Descrição
        </h2>
        <p className="text-brand-softtext">
          {book.description || "Nenhuma descrição disponível."}
        </p>
      </div>

      {/* REVIEW */}
      {book.id && (
        <div className="mt-10">
          <ReviewSection bookId={book.id} userBookId={userBookId} />
        </div>
      )}
    </div>
  );
}
