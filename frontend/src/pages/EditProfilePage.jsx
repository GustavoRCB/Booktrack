import { useEffect, useState } from "react";
import api from "../services/api";
import { useNavigate } from "react-router-dom";

export default function EditProfilePage() {
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [bio, setBio] = useState("");
  const [avatar, setAvatar] = useState(null);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // ==============================
  // CARREGAR PERFIL ATUAL
  // ==============================
  useEffect(() => {
    async function loadProfile() {
      try {
        const res = await api.get("/profile/me");
        setName(res.data.profile.name || "");
        setBio(res.data.profile.bio || "");
      } catch (err) {
        console.error("Erro ao carregar perfil:", err);
        navigate("/profile");
      } finally {
        setLoading(false);
      }
    }

    loadProfile();
  }, [navigate]);

  // ==============================
  // SALVAR ALTERAÇÕES
  // ==============================
  async function handleSubmit(e) {
    e.preventDefault();
    setSaving(true);

    try {
      // 1️⃣ Atualiza nome e bio
      await api.put("/profile", {
        name,
        bio,
      });

      // 2️⃣ Atualiza avatar (SE existir)
      if (avatar) {
        const formData = new FormData();
        formData.append("file", avatar);

        // ❗ NÃO definir Content-Type manualmente
        await api.post("/profile/avatar", formData);
      }

      navigate("/profile");
    } catch (err) {
      console.error("Erro ao salvar perfil:", err);
      alert("Erro ao salvar alterações.");
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return <p className="p-8 text-brand-purple">Carregando...</p>;
  }

  // ==============================
  // UI
  // ==============================
  return (
    <div className="min-h-screen bg-brand-cream p-10 flex justify-center">
      <form
        onSubmit={handleSubmit}
        className="bg-white p-8 rounded-xl shadow-lg w-full max-w-lg"
      >
        <h1 className="text-2xl font-bold text-brand-purple mb-6">
          ✏️ Editar Perfil
        </h1>

        {/* NOME */}
        <div className="mb-4">
          <label className="block font-semibold mb-1">Nome</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full border rounded-lg p-2"
            required
          />
        </div>

        {/* BIO */}
        <div className="mb-4">
          <label className="block font-semibold mb-1">Bio</label>
          <textarea
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            rows={3}
            className="w-full border rounded-lg p-2"
          />
        </div>

        {/* AVATAR */}
        <div className="mb-6">
          <label className="block font-semibold mb-1">
            Foto de perfil
          </label>
          <input
            type="file"
            accept="image/*"
            onChange={(e) => setAvatar(e.target.files[0] || null)}
          />
        </div>

        {/* BOTÕES */}
        <div className="flex gap-4">
          <button
            type="submit"
            disabled={saving}
            className="
              flex-1 bg-brand-purple text-white 
              py-2 rounded-lg 
              hover:bg-brand-royal transition
              disabled:opacity-60
            "
          >
            {saving ? "Salvando..." : "Salvar"}
          </button>

          <button
            type="button"
            onClick={() => navigate("/profile")}
            className="
              flex-1 border border-brand-purple 
              text-brand-purple 
              py-2 rounded-lg 
              hover:bg-brand-cream transition
            "
          >
            Cancelar
          </button>
        </div>
      </form>
    </div>
  );
}
