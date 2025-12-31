import { useEffect, useState } from "react";
import api from "../services/api";

export default function AboutPage() {
  const [visits, setVisits] = useState(0);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    async function loadVisits() {
      try {
        // 1️⃣ Registra a visita
        await api.post("/stats/visit");

        // 2️⃣ Busca o total atualizado
        const res = await api.get("/stats/visits");
        setVisits(res.data?.total_visits ?? 0);
      } catch (err) {
        console.error("Erro ao carregar contador de visitas:", err);
      } finally {
        setLoaded(true);
      }
    }

    loadVisits();
  }, []);

  return (
    <div className="max-w-4xl mx-auto px-4 py-10 space-y-8">
      
      {/* Título */}
      <header>
        <h1 className="text-2xl font-semibold text-gray-900">
          Sobre o Litto
        </h1>
        <p className="text-gray-600 mt-2">
          Uma plataforma para acompanhar e organizar sua jornada de leitura.
        </p>
      </header>

      {/* Sobre */}
      <section className="bg-white rounded-xl shadow-sm p-6 space-y-3">
        <h2 className="text-lg font-medium"> O que é o Litto</h2>
        <p className="text-gray-700 text-sm leading-relaxed">
          O Litto é um projeto web desenvolvido com foco em aprendizado e uso pessoal.
Ele surgiu a partir da minha insatisfação com as plataformas de leitura atuais, que frequentemente apresentam interfaces poluídas e excesso de funcionalidades pouco relevantes.

Por isso, o Litto foi pensado de forma minimalista, concentrando-se apenas nas funcionalidades que considero essenciais para organizar leituras e acompanhar o hábito de leitura de maneira simples e objetiva.

De acordo com o interesse e o retorno do projeto, novas funcionalidades poderão ser adicionadas, e a plataforma continuará evoluindo conforme a demanda dos usuários.
        </p>
      </section>

      {/* metas */}
      <section className="bg-white rounded-xl shadow-sm p-6 space-y-3">
        <h2 className="text-lg font-medium"> Metas futuras</h2>
        <ul className="list-disc list-inside text-sm text-gray-700 space-y-1">
          <li>Melhorias no sistema de busca:
Refinar filtros, relevância dos resultados e desempenho geral da busca por livros.</li>
          <li>Reviews públicas:
Possibilidade de tornar resenhas visíveis para outros usuários, com avaliações e comentários.</li>
          <li>Sistema de recomendação personalizada:
Sugestão de livros com base no histórico de leitura, avaliações, gêneros preferidos e comportamento do usuário.</li>
          <li>Aprimoramento do sistema de perfil e contas:
Expansão das informações do perfil, preferências do usuário e maior controle sobre dados e configurações.</li>
        </ul>
      </section>

      {/* objetivos */}
      <section className="bg-white rounded-xl shadow-sm p-6 space-y-3">
        <h2 className="text-lg font-medium"> Obejetivos</h2>
        <ul className="list-disc list-inside text-sm text-gray-700 space-y-1">
          <li>Organizar leituras em um único lugar</li>
          <li>Estimular o hábito da leitura</li>
          <li>Oferecer uma experiência limpa e intuitiva</li>
          <li>Servir como projeto educacional e de portfólio</li>
        </ul>
      </section>

      {/* Contato */}
      <section className="bg-white rounded-xl shadow-sm p-6 space-y-3">
        <h2 className="text-lg font-medium"> Contato e feedback</h2>
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
            https://github.com/GustavoRCB
          </a>
        </p>
        <p className="text-sm text-gray-700">
          Email: gustavo.rocha.costa.brito@gmail.com
        </p>
      </section>

      {/* Contador de acessos */}
      {loaded && (
        <footer className="text-center text-sm text-gray-500 pt-4 space-y-1">
          <p> {visits} acessos ao projeto</p>
          <p className="text-xs text-gray-400">
           
          </p>
        </footer>
      )}
    </div>
  );
}
