import { useEffect, useState } from "react";
import api from "../services/api";

export default function AboutPage() {
  const [visits, setVisits] = useState(0);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    api.get("/analytics/visits")
      .then(res => {
        setVisits(res.data?.visits ?? 0);
        setLoaded(true);
      })
      .catch(() => {
        setLoaded(true);
      });
  }, []);

  return (
    <div className="max-w-4xl mx-auto px-4 py-10 space-y-8">
      
      {/* Título */}
      <header>
        <h1 className="text-2xl font-semibold text-gray-900">
          Sobre o BookTrack
        </h1>
        <p className="text-gray-600 mt-2">
          Uma plataforma para acompanhar e organizar sua jornada de leitura.
        </p>
      </header>

      {/* Sobre */}
      <section className="bg-white rounded-xl shadow-sm p-6 space-y-3">
        <h2 className="text-lg font-medium">📖 O que é o BookTrack</h2>
        <p className="text-gray-700 text-sm leading-relaxed">
          O BookTrack é um projeto web desenvolvido com o objetivo de ajudar
          leitores a registrar livros, acompanhar o progresso de leitura e
          escrever resenhas de forma simples e organizada.
        </p>
      </section>

      {/* Objetivos */}
      <section className="bg-white rounded-xl shadow-sm p-6 space-y-3">
        <h2 className="text-lg font-medium">🎯 Objetivos</h2>
        <ul className="list-disc list-inside text-sm text-gray-700 space-y-1">
          <li>Organizar leituras em um único lugar</li>
          <li>Estimular o hábito da leitura</li>
          <li>Oferecer uma experiência limpa e intuitiva</li>
          <li>Servir como projeto educacional e de portfólio</li>
        </ul>
      </section>

      {/* Metas */}
      <section className="bg-white rounded-xl shadow-sm p-6 space-y-3">
        <h2 className="text-lg font-medium">🚀 Metas futuras</h2>
        <ul className="list-disc list-inside text-sm text-gray-700 space-y-1">
          <li>Sistema de favoritos</li>
          <li>Recomendações personalizadas</li>
          <li>Estatísticas avançadas de leitura</li>
          <li>Melhorias contínuas de usabilidade</li>
        </ul>
      </section>

      {/* Contato */}
      <section className="bg-white rounded-xl shadow-sm p-6 space-y-3">
        <h2 className="text-lg font-medium">📬 Contato e feedback</h2>
        <p className="text-sm text-gray-700">
          Encontrou um problema ou tem alguma sugestão?
        </p>
        <p className="text-sm text-gray-700">
          GitHub:{" "}
          <a
            href="https://github.com/seu-usuario"
            className="text-brand-purple hover:underline"
            target="_blank"
            rel="noreferrer"
          >
            github.com/seu-usuario
          </a>
        </p>
        <p className="text-sm text-gray-700">
          Email: seuemail@email.com
        </p>
      </section>

      {/* Contador */}
      {loaded && (
        <footer className="text-center text-sm text-gray-500 pt-4 space-y-1">
          <p>👀 {visits} acessos ao projeto</p>
          <p className="text-xs text-gray-400">
            Métrica anônima utilizada apenas para fins educacionais.
          </p>
        </footer>
      )}
    </div>
  );
}
