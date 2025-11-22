import { useEffect, useState } from "react";
import api, { setAuthToken } from "../services/api";
import { useNavigate } from "react-router-dom";

export default function Library() {
  const [books, setBooks] = useState([]);
  const [title, setTitle] = useState("");

  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return navigate("/");

    setAuthToken(token);

    api.get("/books/")
      .then((res) => setBooks(res.data))
      .catch(() => navigate("/"));
  }, []);

  async function addBook() {
    try {
      await api.post("/books/", { title });
      setTitle("");
      const res = await api.get("/books/");
      setBooks(res.data);
    } catch {
      alert("Erro ao adicionar livro");
    }
  }

  async function deleteBook(id) {
    await api.delete(`/books/${id}`);
    setBooks(books.filter((b) => b.id !== id));
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white p-8">
      <h1 className="text-3xl font-bold mb-6">Minha Biblioteca</h1>

      <div className="flex gap-2 mb-4">
        <input
          className="p-2 bg-gray-700 rounded"
          placeholder="Novo livro"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
        <button
          className="bg-blue-600 p-2 rounded"
          onClick={addBook}
        >
          Adicionar
        </button>
      </div>

      <ul>
        {books.map((book) => (
          <li
            key={book.id}
            className="bg-gray-800 p-4 rounded flex justify-between mb-2"
          >
            {book.title}
            <button
              className="bg-red-600 p-1 px-3 rounded"
              onClick={() => deleteBook(book.id)}
            >
              X
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
