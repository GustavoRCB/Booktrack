import { useEffect, useState } from "react";

export default function Books() {
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("http://127.0.0.1:8000/books") // chama a API do backend
      .then(res => res.json())
      .then(data => {
        setBooks(data); // salva os livros no estado
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  }, []); // [] garante que rode apenas 1 vez ao montar o componente

  if (loading) return <p>Carregando livros...</p>;

  return (
    <div>
      <h2> Livros</h2>
      {books.length === 0 && <p>Nenhum livro cadastrado.</p>}
      <ul>
        {books.map(book => (
          <li key={book.id}>
            <strong>{book.title}</strong> - {book.author} ({book.total_pages} páginas)
          </li>
        ))}
      </ul>
    </div>
  );
}
