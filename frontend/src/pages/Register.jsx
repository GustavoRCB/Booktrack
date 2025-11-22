import { useState } from "react";
import api from "../services/api";
import { useNavigate } from "react-router-dom";

export default function Register() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  async function handleRegister(e) {
    e.preventDefault();

    try {
      await api.post("/users/", { email, password });
      alert("Conta criada com sucesso!");
      navigate("/");
    } catch (err) {
      alert("Erro ao criar conta");
    }
  }

  return (
    <div className="h-screen flex items-center justify-center bg-gray-900">
      <form
        onSubmit={handleRegister}
        className="bg-gray-800 p-8 rounded-xl shadow-lg w-80"
      >
        <h1 className="text-white text-2xl mb-6 font-bold">Criar Conta</h1>

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

        <button className="w-full bg-green-600 hover:bg-green-700 p-2 rounded text-white font-bold">
          Registrar
        </button>

        <p
          className="text-blue-400 mt-3 cursor-pointer"
          onClick={() => navigate("/")}
        >
          Já tenho conta
        </p>
      </form>
    </div>
  );
}
