import { useNavigate } from "react-router-dom";
import {Layout} from "../components/Layout";
import {VantagensConecte} from "../components/Recursos";
import {Depoimento} from "../components/Recursos";

export function Home() {
  const navigate = useNavigate();

  const vantagens = [
    {
      title: "Agendamento Simples",
      description: "Garanta que pacientes nunca percam suas consultas com lembretes automáticos.",
      icon: "📅"
    },
    {
      title: "Acessibilidade Garantida",
      description: "Facilidade para pacientes com dificuldades tecnológicas ou limitações físicas.",
      icon: "♿"
    },
    {
      title: "Suporte ao Cuidador",
      description: "Orientações claras para acompanhar os atendimentos e otimizar os cuidados médicos.",
      icon: "👥"
    }
  ];

  const depoimentosUsuarios = [
    {
      text: "A plataforma melhorou muito a gestão das consultas médicas da minha mãe. Agora ela nunca perde um atendimento!",
      author: "Maria Silva, Cuidadora"
    },
    {
      text: "Como médico, percebo que os pacientes chegam às consultas mais preparados e sem atrasos.",
      author: "Dr. Carlos Mendes"
    },
    {
      text: "Com o suporte ao cuidador, ficou mais fácil acompanhar as consultas dos meus pacientes idosos.",
      author: "Enfermeira Ana Souza"
    }
  ];

  const handleCadastroClick = () => {
    navigate("/cadastro");
  };

  return (
    <Layout>
      <section className="bg-blue-600 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-6">
            Facilitando o Acesso à Saúde
          </h1>
          <p className="text-xl mb-8 max-w-3xl mx-auto">
            Uma plataforma intuitiva para melhorar o cuidado médico e reduzir faltas em consultas.
          </p>
          <button 
            onClick={handleCadastroClick}
            className="hover:cursor-pointer bg-white text-blue-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
          >
            Comece Agora
          </button>
        </div>
      </section>

      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
            Por que utilizar nossa plataforma?
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {vantagens.map((vantagem, index) => (
              <VantagensConecte
                key={index}
                title={vantagem.title}
                description={vantagem.description}
                icon={vantagem.icon}
              />
            ))}
          </div>
        </div>
      </section>

      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
            O que dizem sobre nós?
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {depoimentosUsuarios.map((depoimento, index) => (
              <Depoimento
                key={index}
                text={depoimento.text}
                author={depoimento.author}
              />
            ))}
          </div>
        </div>
      </section>
    </Layout>
  );
};


