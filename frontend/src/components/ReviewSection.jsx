import { useEffect, useState } from "react";
import api from "../services/api";

export default function ReviewSection({ bookId, userBookId }) {
  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(0);
  const [comment, setComment] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);

  const [hasReview, setHasReview] = useState(false);
  const [isEditing, setIsEditing] = useState(true); // 👈 começa editável só se NÃO tiver review

  // ============================
  // 1) Carregar Review do Usuário
  // ============================
  useEffect(() => {
    async function loadMyReview() {
      if (!bookId || !userBookId) {
        setLoading(false);
        return;
      }

      try {
        const res = await api.get(`/reviews/my/${bookId}`);

        if (!res.data) {
          setIsEditing(true); // 🆕 criar nova review
          setLoading(false);
          return;
        }

        setRating(res.data.rating ?? 0);
        setComment(res.data.comment ?? "");
        setHasReview(true);
        setIsEditing(false); // 🔒 começa em leitura
      } catch (err) {
        if (err.response?.status !== 404) {
          console.error("Erro ao carregar review:", err);
        }
        setIsEditing(true); // 🆕 fallback para edição
      } finally {
        setLoading(false);
      }
    }

    loadMyReview();
  }, [bookId, userBookId]);

  // ============================
  // 2) Salvar / Atualizar Review
  // ============================
  async function handleSubmit(e) {
    e.preventDefault();

    if (!userBookId) {
      setMessage("⚠️ Adicione o livro à biblioteca antes de avaliar.");
      return;
    }

    if (rating < 1) {
      setMessage("⚠️ Escolha uma nota de 1 a 5 estrelas.");
      return;
    }

    try {
      await api.post(`/reviews/${bookId}`, {
        rating,
        comment,
      });

      setHasReview(true);
      setIsEditing(false); // 🔒 trava após salvar
      setMessage("✅ Review salva com sucesso!");
      setTimeout(() => setMessage(""), 3000);
    } catch (err) {
      console.error(err);
      setMessage("❌ Erro ao salvar review.");
    }
  }

  // ============================
  // 3) Excluir Review
  // ============================
  async function handleDelete() {
    if (!userBookId) return;

    try {
      await api.delete(`/reviews/${bookId}`);

      setRating(0);
      setComment("");
      setHasReview(false);
      setIsEditing(true); // 🆕 volta para criação
      setMessage("🗑️ Review removida.");
      setTimeout(() => setMessage(""), 3000);
    } catch (err) {
      console.error(err);
      setMessage("❌ Erro ao remover review.");
    }
  }

  if (loading) {
    return <p className="text-brand-purple">Carregando review...</p>;
  }

  if (!userBookId) {
    return (
      <p className="text-brand-softtext mt-4">
        ⭐ Adicione este livro à sua biblioteca para deixar uma avaliação.
      </p>
    );
  }

  return (
    <div
      className={`p-6 rounded-xl shadow border transition-colors
        ${
          hasReview
            ? "bg-brand-sand border-brand-violet"
            : "bg-brand-sand border-brand-taupe"
        }
      `}
    >
      <h3 className="text-xl font-bold mb-4 text-brand-purple">
        Sua Avaliação
      </h3>

      {/* ⭐ Estrelas */}
      <div className="mb-4 flex gap-1">
        {[1, 2, 3, 4, 5].map((num) => (
          <span
            key={num}
            onClick={() => isEditing && setRating(num)}
            onMouseEnter={() => isEditing && setHover(num)}
            onMouseLeave={() => setHover(0)}
            className={`text-3xl transition-colors duration-200
              ${
                (hover || rating) >= num
                  ? "text-yellow-500"
                  : "text-gray-300"
              }
              ${isEditing ? "cursor-pointer" : "cursor-default"}
            `}
          >
            ★
          </span>
        ))}
      </div>

      {/* Comentário */}
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <textarea
          value={comment}
          onChange={(e) => isEditing && setComment(e.target.value)}
          readOnly={!isEditing}
          placeholder={
            isEditing
              ? "Escreva sua avaliação"
              : "Clique em 'Editar review' para alterar"
          }
          className={`w-full min-h-[80px] p-3 rounded-lg border
            ${
              isEditing
                ? "border-brand-taupe focus:ring-brand-purple focus:border-brand-purple bg-white"
                : "border-brand-violet bg-brand-lavender text-brand-softtext cursor-not-allowed"
            }
            resize-y`}
        />

        <div className="flex gap-3 mt-2">
          {isEditing && (
            <button
              type="submit"
              className="px-4 py-2 bg-brand-purple text-white rounded-lg hover:bg-brand-royal transition"
            >
              Salvar
            </button>
          )}

          {hasReview && !isEditing && (
            <button
              type="button"
              onClick={() => setIsEditing(true)}
              className="px-4 py-2 bg-brand-royal text-white rounded-lg hover:opacity-90 transition"
            >
              Editar review
            </button>
          )}

          {hasReview && (
            <button
              type="button"
              onClick={handleDelete}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
            >
              Excluir
            </button>
          )}
        </div>
      </form>

      {message && (
        <p
          className={`mt-3 font-semibold ${
            message.startsWith("✅")
              ? "text-green-600"
              : message.startsWith("❌")
              ? "text-red-600"
              : "text-brand-text"
          }`}
        >
          {message}
        </p>
      )}
    </div>
  );
}
