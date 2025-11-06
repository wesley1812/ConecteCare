import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Layout } from "../components/Layout";
import type { Paciente } from "../types/interfaces";
import { useAuth } from "../context/auth-context.tsx";
import { useCadastro } from "../context/cadastro-context.tsx";
import { UserCircleIcon, HeartIcon, VideoCameraIcon, ClipboardListIcon } from "../styles/icons.tsx";

interface ActionCardProps {
  to: string;
  icon: React.ReactNode;
  title: string;
  description: string;
  colorRing: string;
}

function Redirecionador({ to, icon, title, description, colorRing }: ActionCardProps) {
  return (
    <Link
      to={to}
      className={`group bg-white p-6 rounded-2xl shadow-xl border border-gray-100
                    transition-all duration-300 ease-in-out
                    hover:scale-[1.03] hover:shadow-2xl
                    focus:outline-none focus:ring-4 ${colorRing} focus:ring-opacity-50`}
    >
      <div className="flex flex-col h-full">
        <div className="mb-4">{icon}</div>
        <div className="flex-1">
          <h3 className="text-2xl font-bold text-gray-900 mb-2">{title}</h3>
          <p className="text-gray-600 text-base">{description}</p>
        </div>
        <div className="mt-5">
          <span className="font-semibold text-blue-600 group-hover:text-blue-700 transition-colors">
            Acessar agora
          </span>
        </div>
      </div>
    </Link>
  );
}

export function PerfilPaciente() {
  // Acessa os contextos
  const { user: loggedInUserEmail } = useAuth(); //
  const { cuidador: listaCuidadores, paciente: listaPacientes } = useCadastro(); //

  // Estados para o usuário logado e seu paciente
  const [pacienteAtual, setPacienteAtual] = useState<Paciente | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Aguarda os contextos carregarem
    if (loggedInUserEmail) {
      // 1. Encontra o cuidador logado (assumindo que 'user' é o email)
      const foundPaciente = listaPacientes.find(
        p => p.email === loggedInUserEmail
      ); //

      if (foundPaciente) {
        setPacienteAtual(foundPaciente);
      } else {
        console.error("Usuário logado não encontrado na lista de pacientes.");
      }
      setIsLoading(false);
    } else if (!loggedInUserEmail) {
      setIsLoading(false);
    }
  }, [loggedInUserEmail, listaCuidadores, listaPacientes]);

  if (isLoading) {
    return (
      <Layout>
        <div className="py-20 bg-gray-100 min-h-screen flex items-center justify-center">
          <p className="text-lg text-gray-600">Carregando dados do usuário...</p>
        </div>
      </Layout>
    );
  }

  if (!pacienteAtual) {
    return (
      <Layout>
        <div className="py-20 bg-gray-100 min-h-screen flex items-center justify-center text-center">
          <div>
            <h1 className="text-2xl font-bold text-red-600">Acesso Negado</h1>
            <p className="text-lg text-gray-600 mt-2">
              Não foi possível encontrar seus dados de paciente vinculado.
              <br />
              Por favor, <Link to="/perfil-paciente/atualizar-perfil-cuidador" className="text-blue-600 underline">verifique os dados de cadastro.</Link>
            </p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="bg-gradient-to-r from-blue-700 to-cyan-500 py-12 md:py-20 bg-gray-100 min-h-screen">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">

          <div className="mb-12 text-center">
            <h1 className="text-4xl md:text-5xl font-extrabold text-white tracking-tight">
              Painel do Paciente
            </h1>
            <p className="mt-3 text-xl text-white">
              Boas vindas, <span className="font-bold text-white">{pacienteAtual.nome}</span>!
            </p>
            <p className="mt-1 text-lg text-white">
              O que você gostaria de fazer hoje?
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8">

            <Redirecionador
              to="/perfil-paciente/atualizar-perfil-paciente" 
              icon={<UserCircleIcon />}
              title="Meu Perfil"
              description="Atualize seus dados pessoais e consulte seus cuidadores."
              colorRing="focus:ring-indigo-400"
            />

            <Redirecionador
              to={`/dashboard/${pacienteAtual.id}`} //
              icon={<HeartIcon />}
              title="Minha Saúde"
              description={`Consultar dados de ${pacienteAtual.nome}.`}
              colorRing="focus:ring-cyan-400"
            />

            <Redirecionador
              to="/teleconsulta/"
              icon={<VideoCameraIcon />}
              title="Acessar Guia Teleconsulta"
              description="Entre na sala de consulta virtual para orientações de como utilizar a câmera."
              colorRing="focus:ring-blue-400"
            />

            <Redirecionador
              to="/minhas-consultas/"
              icon={<ClipboardListIcon/>}
              title="Organizar Consultas"
              description="Entenda como funciona o agendamento e a consulta."
              colorRing="focus:ring-gray-400"
            />

          </div>
        </div>
      </div>
    </Layout>
  );
}