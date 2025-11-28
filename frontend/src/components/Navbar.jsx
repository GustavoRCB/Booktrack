import { Link, useNavigate } from "react-router-dom";

export default function Navbar() {
  const navigate = useNavigate();

  function logout() {
    localStorage.removeItem("token");
    navigate("/");
  }

  return (
    <nav className="bg-gray-800 text-white px-6 py-4 flex items-center justify-between shadow-lg">
      <Link to="/home" className="text-2xl font-bold">
        BookTrack
      </Link>

      <div className="flex gap-6">
        <Link to="/home" className="hover:text-blue-400 duration-150">Home</Link>
        <Link to="/library" className="hover:text-blue-400 duration-150">Biblioteca</Link>
        <Link to="/explore" className="hover:text-blue-400 duration-150">Explorar</Link>

        <button
          onClick={logout}
          className="bg-red-600 px-3 py-1 rounded hover:bg-red-700 duration-150"
        >
          Sair
        </button>
      </div>
    </nav>
  );
}
