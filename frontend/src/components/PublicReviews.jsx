import { useEffect, useState } from "react";
import api from "../services/api";

export default function PublicReviews({ bookId }) {
  const [reviews, setReviews] = useState([]);

  useEffect(() => {
    api
      .get(`/reviews/book/${bookId}`)
      .then((res) => setReviews(res.data || []))
      .catch(() => setReviews([]));
  }, [bookId]);

  if (reviews.length === 0) {
    return <p>Este livro ainda não possui reviews.</p>;
  }

  return (
    <div className="mt-6 flex flex-col gap-4">
      {reviews.map((r, i) => (
        <div
          key={i}
          className="bg-brand-cream border border-brand-taupe p-4 rounded-lg"
        >
          <strong>{r.user_books.users.name}</strong>
          <p className="text-yellow-600">⭐ {r.rating}/5</p>
          <p>{r.comment}</p>
        </div>
      ))}
    </div>
  );
}
