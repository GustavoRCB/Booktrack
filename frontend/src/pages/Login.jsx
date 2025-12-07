import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";  // <<< FALTAVA ISSO!

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  async function handleLogin(e) {
    e.preventDefault();

    try {
      const res = await api.post("/auth/login", {
        email,
        password,
      });

      // --- Garantir que o token existe ---
      const token = res.data?.access_token;

      if (!token) {
        alert("Erro: servidor não retornou token");
        return;
      }

      // Salvar token
      localStorage.setItem("token", token);

      // Redirecionar
      navigate("/library");
    } catch (err) {
      console.error("Erro no login:", err);
      alert("Email ou senha inválidos");
    }
  }

  return (
    <div className="h-screen flex items-center justify-center bg-brand-cream">
      <form
        onSubmit={handleLogin}
        className="
          bg-brand-sand 
          p-8 rounded-2xl 
          shadow-md border border-brand-taupe 
          w-80
        "
      >
        <h1 className="text-brand-purple text-3xl mb-6 font-bold text-center">
          Login
        </h1>

        {/* Email */}
        <input
          type="email"
          placeholder="Email"
          className="
            w-full p-3 mb-4 
            rounded-xl 
            bg-brand-cream 
            border border-brand-taupe 
            text-brand-text 
            placeholder-brand-softtext
            focus:outline-none focus:ring-2 focus:ring-brand-royal
          "
          onChange={(e) => setEmail(e.target.value)}
          required
        />

        {/* Senha */}
        <input
          type="password"
          placeholder="Senha"
          className="
            w-full p-3 mb-4 
            rounded-xl 
            bg-brand-cream 
            border border-brand-taupe 
            text-brand-text 
            placeholder-brand-softtext
            focus:outline-none focus:ring-2 focus:ring-brand-royal
          "
          onChange={(e) => setPassword(e.target.value)}
          required
        />

        {/* Botão */}
        <button
          className="
            w-full 
            bg-brand-purple 
            text-brand-cream 
            hover:bg-brand-royal
            p-3 rounded-xl font-semibold 
            transition
          "
        >
          Entrar
        </button>

        {/* Criar conta */}
        <p
          className="
            text-brand-purple mt-4 text-center 
            cursor-pointer hover:text-brand-royal 
            transition font-medium
          "
          onClick={() => navigate("/register")}
        >
          Criar conta
        </p>
      </form>
    </div>
  );
}
