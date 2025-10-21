import {Layout} from "../components/Layout";
import {TeamCard} from "../components/CardEquipe";
import joaoImage from "/assets/midia/joao.jpg";
import wesleyImage from "/assets/midia/wesley.jpg";
import gabrielImage from "/assets/midia/gabriel.jpg"; 
import type { TeamMember } from "../types/interfaces";


export function QuemSomos() {
  const teamMembers: TeamMember[] = [
    {
      name: "João Pedro Scarpin Carvalho",
      rm: "565421",
      turma: "TDSPX",
      github: "https://github.com/Scarpin12",
      linkedin: "https://www.linkedin.com/in/joão-pedro-scarpin-6337ab356/",
      image: joaoImage
    },
    {
      name: "Wesley Silva de Andrade",
      rm: "563593",
      turma: "TDSPX",
      github: "https://github.com/wesley1812",
      linkedin: "https://www.linkedin.com/in/wesley-silva-de-andrade/",
      image: wesleyImage 
    },
    {
      name: "Gabriel Otávio Wince Souza",
      rm: "566150",
      turma: "TDSPX",
      github: "https://github.com/wince1910",
      linkedin: "https://www.linkedin.com/in/gabriel-wince-47114b286/",
      image: gabrielImage
    }
  ];

  return (
    <Layout>
      <div className="py-12 bg-gray-50 min-h-screen">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold text-center text-gray-900 mb-12">
            Nossa Equipe
          </h1>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {teamMembers.map((member, index) => (
              <TeamCard key={index} member={member} />
            ))}
          </div>

          <div className="mt-16 bg-white p-8 rounded-lg shadow-md">
            <h2 className="text-2xl font-bold text-gray-900 mb-4 text-center">
              Sobre o Projeto ConecteCare
            </h2>
            <p className="text-gray-700 text-center max-w-4xl mx-auto leading-relaxed">
              O ConecteCare é uma plataforma desenvolvida por estudantes de Tecnologia em
              Desenvolvimento de Sistemas para facilitar o acesso à saúde através da telemedicina.
              Nosso objetivo é conectar pacientes, cuidadores e profissionais de saúde de forma
              simples e eficiente, garantindo que ninguém perca uma consulta importante.
            </p>
          </div>
        </div>
      </div>
    </Layout>
  );
};
