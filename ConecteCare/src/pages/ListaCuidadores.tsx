import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Layout } from "../components/Layout";
// Importa os tipos necessários
import type { Paciente, Cuidador } from "../types/interfaces";
import { useAuth } from "../context/auth-context";
import { useCadastro } from "../context/cadastro-context";

// Ícone simples para o cartão do cuidador
const UserIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-indigo-500 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
    </svg>
);

// Componente para exibir um cartão de cuidador
function CardCuidador({ cuidador }: { cuidador: Cuidador }) {
    return (
        <div className="bg-white p-5 rounded-lg shadow-md border border-gray-100 hover:shadow-lg transition-shadow duration-200">
            <div className="flex items-center mb-3">
                <UserIcon />
                <h3 className="text-xl font-bold text-gray-800">{cuidador.nome}</h3>
            </div>
            <div className="space-y-2 text-gray-600">
                <p><strong className="font-medium text-gray-700">Parentesco:</strong> {cuidador.parentesco}</p>
                <p><strong className="font-medium text-gray-700">Telefone:</strong> {cuidador.telefone}</p>
                <p><strong className="font-medium text-gray-700">Email:</strong> {cuidador.email}</p>
            </div>
        </div>
    );
}


export function ListaCuidadores() {
  const { user: loggedInUserEmail } = useAuth(); // [cite: auth-context.tsx]
  // Acede às listas completas
  const { cuidador: listaTodosCuidadores, paciente: listaPacientes } = useCadastro(); // [cite: cadastro-context.tsx]

  const [pacienteLogado, setPacienteLogado] = useState<Paciente | null>(null);
  const [meusCuidadores, setMeusCuidadores] = useState<Cuidador[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Só executa se o email do utilizador logado e as listas estiverem disponíveis
    if (loggedInUserEmail && listaPacientes.length > 0 && listaTodosCuidadores.length > 0) {
      setIsLoading(true);
      setError(null);

      // 1. Encontra o paciente logado
      const foundPaciente = listaPacientes.find(
        p => p.email === loggedInUserEmail
      ); // [cite: cadastro-context.tsx, auth-context.tsx]

      if (!foundPaciente) {
        setError("Utilizador não encontrado como paciente no sistema.");
        setIsLoading(false);
        return;
      }

      setPacienteLogado(foundPaciente);

      // 2. Filtra a lista de cuidadores para encontrar aqueles associados a este paciente
      const foundCuidadores = listaTodosCuidadores.filter(
        c => c.cpfPaciente === foundPaciente.cpfPaciente // Compara pelo CPF do paciente [cite: cadastro-context.tsx, interfaces.ts]
      );

      setMeusCuidadores(foundCuidadores);
      console.log(`Encontrados ${foundCuidadores.length} cuidadores para o paciente ${foundPaciente.nome}`);
      setIsLoading(false);

    } else if (!loggedInUserEmail) {
        setError("Utilizador não autenticado.");
        setIsLoading(false);
    }
    // Depende do email do utilizador e das listas
  }, [loggedInUserEmail, listaPacientes, listaTodosCuidadores]);

  // --- Telas de Carregamento e Erro ---
  if (isLoading) {
    return (
      <Layout>
        <div className="py-20 bg-gray-50 min-h-screen flex items-center justify-center">
          <div className="text-center text-lg text-gray-600">A carregar informações dos cuidadores...</div>
        </div>
      </Layout>
    );
  }

  if (error) {
     return (
       <Layout>
         <div className="py-20 bg-gray-50 min-h-screen flex items-center justify-center text-center">
           <div>
             <h1 className="text-2xl font-bold text-red-600">Erro</h1>
             <p className="text-lg text-gray-600 mt-2">{error}</p>
             <Link to="/" className="mt-4 inline-block px-6 py-2 bg-blue-600 text-white font-semibold rounded-lg shadow-md hover:bg-blue-700">
               Voltar à Página Inicial
             </Link>
           </div>
         </div>
       </Layout>
     );
   }

  // --- Página Principal ---
  return (
    <Layout>
      <div className="py-12 bg-gray-50 min-h-screen">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">

          {/* Cabeçalho */}
          <div className="mb-8 text-center border-b pb-4">
            <h1 className="text-3xl font-bold text-gray-900">
              Meus Cuidadores
            </h1>
            {pacienteLogado && (
                 <p className="mt-2 text-lg text-gray-600">
                    Cuidadores associados a <span className="font-semibold">{pacienteLogado.nome}</span>.
                 </p>
            )}
          </div>

          {/* Lista de Cuidadores */}
          {meusCuidadores.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {meusCuidadores.map((cuidador) => (
                <CardCuidador key={cuidador.id} cuidador={cuidador} /> // Usa o componente CardCuidador
              ))}
            </div>
          ) : (
            // Mensagem se não houver cuidadores
            <div className="bg-white p-6 rounded-lg shadow-md text-center text-gray-500">
              Não há cuidadores associados ao seu perfil no momento.
            </div>
          )}

           {/* Botão de Voltar (opcional, pode voltar para um painel do paciente) */}
           <div className="mt-8 text-center">
               <Link
                 // Esta rota precisa existir ou ser ajustada
                 to={pacienteLogado ? `/dashboard/${pacienteLogado.id}` : "/"}
                 className="hover:cursor-pointer text-indigo-600 hover:text-indigo-800 font-medium transition-colors"
               >
                 &larr; Voltar ao meu Dashboard
               </Link>
           </div>

        </div>
      </div>
    </Layout>
  );
};
