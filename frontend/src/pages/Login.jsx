import { useState } from "react";
import api, { setAuthToken } from "../services/api";
import { useNavigate } from "react-router-dom";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  async function handleLogin(e) {
    e.preventDefault();

    try {
      const res = await api.post("/auth/login", { email, password });
      const token = res.data.access_token;

      localStorage.setItem("token", token);
      setAuthToken(token);

      navigate("/library");
    } catch (err) {
      alert("Email ou senha inválidos");
    }
  }

  return (
    <div className="h-screen flex items-center justify-center bg-gray-900">
      <form
        onSubmit={handleLogin}
        className="bg-gray-800 p-8 rounded-xl shadow-lg w-80"
      >
        <h1 className="text-white text-2xl mb-6 font-bold">Login</h1>

        <input
          type="email"
          placeholder="Email"
          className="w-full p-2 mb-3 rounded bg-gray-700 text-white"
          onChange={(e) => setEmail(e.target.value)}
        />

        <input
          type="password"
          placeholder="Senha"
          className="w-full p-2 mb-3 rounded bg-gray-700 text-white"
          onChange={(e) => setPassword(e.target.value)}
        />

        <button className="w-full bg-blue-600 hover:bg-blue-700 p-2 rounded text-white font-bold">
          Entrar
        </button>

        <p
          className="text-blue-400 mt-3 cursor-pointer"
          onClick={() => navigate("/register")}
        >
          Criar conta
        </p>
      </form>
    </div>
  );
}
