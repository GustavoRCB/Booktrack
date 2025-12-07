import { useState } from "react";
import api from "../services/api";
import { useNavigate } from "react-router-dom";

export default function Register() {
  const [name, setName] = useState("");
  const [bio, setBio] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  async function handleRegister(e) {
    e.preventDefault();

    try {
      await api.post("/users/", {
        name,
        email,
        password,
        bio: bio || null,
      });

      alert("Conta criada com sucesso!");
      navigate("/");
    } catch (err) {
      console.error(err);
      alert("Erro ao criar conta");
    }
  }

  return (
    <div className="h-screen flex items-center justify-center bg-brand-cream">

      <form
        onSubmit={handleRegister}
        className="
          bg-brand-sand 
          p-8 
          rounded-2xl 
          shadow-xl 
          w-96 
          border border-brand-taupe
        "
      >
        <h1 className="text-3xl font-bold text-brand-purple mb-6 text-center">
          Criar Conta
        </h1>

        {/* Nome */}
        <input
          type="text"
          placeholder="Nome"
          className="
            w-full p-3 mb-3 rounded-lg 
            bg-brand-cream 
            text-brand-text 
            border border-brand-taupe
            placeholder-brand-softtext
            focus:outline-none focus:ring-2 focus:ring-brand-purple
          "
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />

        {/* Bio */}
        <textarea
          placeholder="Bio (opcional)"
          className="
            w-full p-3 mb-3 rounded-lg 
            bg-brand-cream 
            text-brand-text 
            border border-brand-taupe
            placeholder-brand-softtext
            resize-none
            focus:outline-none focus:ring-2 focus:ring-brand-purple
          "
          value={bio}
          onChange={(e) => setBio(e.target.value)}
        ></textarea>

        {/* Email */}
        <input
          type="email"
          placeholder="Email"
          className="
            w-full p-3 mb-3 rounded-lg 
            bg-brand-cream 
            text-brand-text 
            border border-brand-taupe
            placeholder-brand-softtext
            focus:outline-none focus:ring-2 focus:ring-brand-purple
          "
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />

        {/* Senha */}
        <input
          type="password"
          placeholder="Senha"
          className="
            w-full p-3 mb-5 rounded-lg 
            bg-brand-cream 
            text-brand-text 
            border border-brand-taupe
            placeholder-brand-softtext
            focus:outline-none focus:ring-2 focus:ring-brand-purple
          "
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />

        {/* Botão registrar */}
        <button
          className="
            w-full 
            bg-brand-purple 
            text-white 
            p-3 
            rounded-lg 
            font-semibold 
            hover:bg-brand-royal 
            transition
          "
        >
          Registrar
        </button>

        {/* Já tenho conta */}
        <p
          className="text-brand-purple mt-4 cursor-pointer text-center hover:text-brand-royal"
          onClick={() => navigate("/")}
        >
          Já tenho conta
        </p>
      </form>
    </div>
  );
}
