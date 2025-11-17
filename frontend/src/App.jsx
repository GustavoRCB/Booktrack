import { useEffect, useState } from "react";

function App() {
  const [msg, setMsg] = useState("Carregando...");
  const [books, setBooks] = useState([]);
  const [users, setUsers] = useState([]);
  const [loadingBooks, setLoadingBooks] = useState(true);
  const [loadingUsers, setLoadingUsers] = useState(true);

  // Mensagem da rota raiz
  useEffect(() => {
    fetch("http://127.0.0.1:8000/") // ajuste para a porta do seu backend
      .then(res => res.json())
      .then(data => setMsg(data.message))
      .catch(err => setMsg("Erro ao conectar com o backend"));
  }, []);

  // Carregar livros
  useEffect(() => {
    fetch("http://127.0.0.1:8000/books")
      .then(res => res.json())
      .then(data => {
        setBooks(data);
        setLoadingBooks(false);
      })
      .catch(err => {
        console.error(err);
        setLoadingBooks(false);
      });
  }, []);

  // Carregar usuários
  useEffect(() => {
    fetch("http://127.0.0.1:8000/users")
      .then(res => res.json())
      .then(data => {
        setUsers(data);
        setLoadingUsers(false);
      })
      .catch(err => {
        console.error(err);
        setLoadingUsers(false);
      });
  }, []);

  return (
    <div style={{ padding: 20 }}>
      <h1>📚 BookTrack</h1>
      <p>{msg}</p>

      <h2>👤 Usuários</h2>
      {loadingUsers ? (
        <p>Carregando usuários...</p>
      ) : users.length === 0 ? (
        <p>Nenhum usuário cadastrado.</p>
      ) : (
        <ul>
          {users.map(user => (
            <li key={user.id}>
              <strong>{user.name}</strong> - {user.email}
            </li>
          ))}
        </ul>
      )}

      <h2>📚 Livros</h2>
      {loadingBooks ? (
        <p>Carregando livros...</p>
      ) : books.length === 0 ? (
        <p>Nenhum livro cadastrado.</p>
      ) : (
        <ul>
          {books.map(book => (
            <li key={book.id}>
              <strong>{book.title}</strong> - {book.author} ({book.total_pages} páginas)
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default App;
