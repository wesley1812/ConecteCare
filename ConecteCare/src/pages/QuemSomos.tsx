import { Layout } from "../components/Layout";
import { TeamCard } from "../components/CardEquipe";
import type { TeamMember } from "../types/interfaces";



export function QuemSomos() {
  const joaoImage = "/assets/midia/joao.jpg";
  const wesleyImage = "/assets/midia/wesley.jpg";
  const gabrielImage = "/assets/midia/gabriel.jpg";

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
      <div className="bg-gray-50 min-h-screen">

        <div className="bg-gradient-to-r from-blue-700 to-cyan-600  text-white py-20 sm:py-24 shadow-2xl">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <span className="text-cyan-300 uppercase tracking-widest text-lg font-bold">Por Trás do ConecteCare</span>
            <h1 className="text-5xl sm:text-6xl font-black mt-2 tracking-tighter">
              Nossa Equipe
            </h1>
            <p className="mt-4 text-xl text-blue-200 max-w-3xl mx-auto">
              Conheça os estudantes de Tecnologia em Desenvolvimento de Sistemas responsáveis pela criação e evolução desta plataforma.
            </p>
          </div>
        </div>

        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 -mt-10 pb-16">

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {teamMembers.map((member, index) => (
              <TeamCard key={index} member={member} />
            ))}
          </div>

          <div className="mt-20 p-8 sm:p-12 rounded-3xl bg-white shadow-3xl border border-gray-100">
            <div className="text-center">
              <span className="text-sm font-bold uppercase text-blue-600 tracking-wider">Missão & Visão</span>
              <h2 className="text-3xl font-black text-gray-900 mt-2 mb-6">
                Sobre o Projeto ConecteCare
              </h2>
              <p className="text-lg text-gray-700 max-w-4xl mx-auto leading-relaxed">
                O **ConecteCare** é uma plataforma inovadora desenvolvida por estudantes focados em facilitar o acesso à saúde através da telemedicina. Nosso principal objetivo é **conectar pacientes, cuidadores e profissionais de saúde** de forma simples, eficiente e, acima de tudo, segura. Utilizando tecnologia de ponta, garantimos que a distância não seja um obstáculo para o acompanhamento médico importante, promovendo cuidado contínuo e acessível.
              </p>
            </div>
            <div className="mt-8 flex justify-center">
              <div className="w-16 h-1 bg-cyan-400 rounded-full shadow-lg"></div>
            </div>
          </div>

        </div>
      </div>
    </Layout>
  );
}
