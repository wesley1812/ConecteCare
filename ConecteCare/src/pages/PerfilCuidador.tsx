  import { useState, useEffect } from "react";
  import { Link } from "react-router-dom";
  import { Layout } from "../components/Layout";
  import type { Cuidador, Paciente } from "../types/interfaces";
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

  export function PerfilCuidador() {
    // Acessa os contextos
    const { user: loggedInUserEmail } = useAuth(); //
    const { cuidador: listaCuidadores, paciente: listaPacientes } = useCadastro(); //

    // Estados para o usuário logado e seu paciente
    const [cuidadorAtual, setCuidadorAtual] = useState<Cuidador | null>(null);
    const [pacienteVinculado, setPacienteVinculado] = useState<Paciente | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
      // Aguarda os contextos carregarem
      if (loggedInUserEmail && listaCuidadores.length > 0 && listaPacientes.length > 0) {
        // 1. Encontra o cuidador logado (assumindo que 'user' é o email)
        const foundCuidador = listaCuidadores.find(
          c => c.email === loggedInUserEmail
        ); //

        if (foundCuidador) {
          setCuidadorAtual(foundCuidador);

          // 2. Encontra o paciente vinculado a esse cuidador
          const foundPaciente = listaPacientes.find(
            p => p.cpfPaciente === foundCuidador.cpfPaciente
          ); //

          if (foundPaciente) {
            setPacienteVinculado(foundPaciente);
          } else {
            console.error("Paciente vinculado não encontrado.");
          }
        } else {
          console.error("Usuário logado não encontrado na lista de cuidadores.");
        }
        setIsLoading(false);
      } else if (!loggedInUserEmail) {
        // Se não há usuário logado, para de carregar
        setIsLoading(false);
      }
      // Roda o efeito se o usuário logado ou as listas da API mudarem
    }, [loggedInUserEmail, listaCuidadores, listaPacientes]);

    // --- Tela de Carregamento ---
    if (isLoading) {
      return (
        <Layout>
          <div className="py-20 bg-gray-100 min-h-screen flex items-center justify-center">
            <p className="text-lg text-gray-600">Carregando dados do usuário...</p>
          </div>
        </Layout>
      );
    }

    // --- Tela de Erro (Usuário não encontrado ou sem paciente) ---
    if (!cuidadorAtual || !pacienteVinculado) {
      return (
        <Layout>
          <div className="py-20 bg-gray-100 min-h-screen flex items-center justify-center text-center">
            <div>
              <h1 className="text-2xl font-bold text-red-600">Acesso Negado</h1>
              <p className="text-lg text-gray-600 mt-2">
                Não foi possível encontrar seus dados de cuidador ou paciente vinculado.
                <br />
                Por favor, <Link to="/perfil-cuidador/atualizar" className="text-blue-600 underline">verifique os dados de cadastro.</Link>
              </p>
            </div>
          </div>
        </Layout>
      );
    }

    // --- Painel Principal (Renderização de Sucesso) ---
    return (
      <Layout>
        <div className="bg-gradient-to-r from-blue-700 to-cyan-500 py-12 md:py-20 bg-gray-100 min-h-screen">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            
            <div className="mb-12 text-center">
              <h1 className="text-4xl md:text-5xl font-extrabold text-white tracking-tight">
                Painel do Cuidador
              </h1>
              <p className="mt-3 text-xl text-white">
                {/* NOME DINÂMICO! */}
                Bem-vinda de volta, <span className="font-bold text-white">{cuidadorAtual.nome}</span>!
              </p>
              {/* <p className="mt-1 text-lg text-white"></p> */}
              <p className="mt-1 text-lg text-white">
                O que você gostaria de fazer hoje?
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8">
              
              {/* *
                * ALTERAÇÃO FEITA AQUI 
                *
              */}
              <Redirecionador
                to="/perfil-cuidador/atualizar-perfil-cuidador" // Rota atualizada para a nova página
                icon={<UserCircleIcon />}
                title="Meu Perfil"
                description="Atualize seus dados pessoais e informações de contato."
                colorRing="focus:ring-indigo-400"
              />

              <Redirecionador
                // LINK DINÂMICO! Baseado no ID do paciente encontrado
                to={`/dashboard/${pacienteVinculado.id}`} //
                icon={<HeartIcon />}
                title="Paciente Vinculado"
                description={`Consultar dados de ${pacienteVinculado.nome}.`}
                colorRing="focus:ring-cyan-400"
              />

              <Redirecionador
                to="/teleconsulta/123" // ID da consulta (ainda mocado)
                icon={<VideoCameraIcon />}
                title="Acessar Teleconsulta"
                description="Entre na sala de consulta virtual para o próximo agendamento."
                colorRing="focus:ring-blue-400"
              />

              <Redirecionador
                to="/processo" // Rota fictícia
                icon={<ClipboardListIcon />}
                title="Etapas do Processo"
                description="Entenda como funciona o agendamento e a consulta."
                colorRing="focus:ring-gray-400"
              />

            </div>
          </div>
        </div>
      </Layout>
    );
  }