import { useEffect, useState } from "react";
import api from "../services/api";

export default function ReviewSection({ bookId, userBookId }) {
  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(0);
  const [comment, setComment] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);

  // ============================
  // 1) Carregar Review do Usuário
  // ============================
  useEffect(() => {
    async function loadMyReview() {
      // Livro não está na biblioteca → não existe review
      if (!bookId || !userBookId) {
        setLoading(false);
        return;
      }

      try {
        const res = await api.get(`/reviews/my/${bookId}`);

        // 🔹 Sem review → backend retorna null / 204 (OK)
        if (!res.data) {
          setLoading(false);
          return;
        }

        setRating(res.data.rating ?? 0);
        setComment(res.data.comment ?? "");
      } catch (err) {
        // 🔹 Ignora ausência de review
        if (err.response?.status !== 404) {
          console.error("Erro ao carregar review:", err);
        }
      } finally {
        setLoading(false);
      }
    }

    loadMyReview();
  }, [bookId, userBookId]);

  // ============================
  // 2) Enviar / Atualizar Review
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
      setMessage("🗑️ Review removida.");

      setTimeout(() => setMessage(""), 3000);
    } catch (err) {
      console.error(err);
      setMessage("❌ Erro ao remover review.");
    }
  }

  // ============================
  // Render
  // ============================
  if (loading) {
    return <p className="text-brand-purple">Carregando review...</p>;
  }

  // Livro não está na biblioteca
  if (!userBookId) {
    return (
      <p className="text-brand-softtext mt-4">
        ⭐ Adicione este livro à sua biblioteca para deixar uma avaliação.
      </p>
    );
  }

  return (
    <div className="bg-brand-sand p-6 rounded-xl shadow border border-brand-taupe">
      <h3 className="text-xl font-bold mb-4 text-brand-purple">
        Sua Avaliação
      </h3>

      {/* ⭐ Estrelas */}
      <div className="mb-4 flex gap-1">
        {[1, 2, 3, 4, 5].map((num) => (
          <span
            key={num}
            onClick={() => setRating(num)}
            onMouseEnter={() => setHover(num)}
            onMouseLeave={() => setHover(0)}
            className={`text-3xl cursor-pointer transition-colors duration-200 ${
              (hover || rating) >= num
                ? "text-yellow-500"
                : "text-gray-300"
            }`}
          >
            ★
          </span>
        ))}
      </div>

      {/* Comentário */}
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <textarea
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder="Escreva um comentário sobre o livro"
          className="w-full min-h-[80px] p-3 rounded-lg border border-brand-taupe 
                     focus:ring-brand-purple focus:border-brand-purple 
                     resize-y bg-white text-brand-text"
        />

        <div className="flex gap-3 mt-2">
          <button
            type="submit"
            className="px-4 py-2 bg-brand-purple text-white rounded-lg hover:bg-brand-royal transition"
          >
            Salvar
          </button>

          {rating > 0 && (
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
