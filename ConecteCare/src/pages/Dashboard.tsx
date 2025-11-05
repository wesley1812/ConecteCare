import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { Layout } from "../components/Layout";
import type { Paciente, HealthIndicatorType } from "../types/interfaces";
import { useAuth } from "../context/auth-context";
import { useCadastro } from "../context/cadastro-context";
import { useConsultas } from "../context/consultas-context";

export function Dashboard() {
  const { id } = useParams<{ id: string }>(); // ID do Paciente vindo da URL
  const { user: loggedInUserEmail } = useAuth(); // [cite: auth-context.tsx]
  const { cuidador: listaCuidadores, paciente: listaPacientes } = useCadastro(); // [cite: cadastro-context.tsx]
  // Usa o novo contexto de consultas
  const { getConsultasPorPaciente } = useConsultas(); // [cite: consultas-context.tsx]

  const [paciente, setPaciente] = useState<Paciente | null>(null);
  const [healthIndicators, setHealthIndicators] = useState<HealthIndicatorType[]>([]);
  // O estado 'appointments' agora será preenchido pelo contexto
  const [, setIsLoading] = useState(true); // Loading combinado (paciente + consultas)
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Só executa se tiver ID, email do utilizador logado e as listas carregadas
    if (id && loggedInUserEmail && listaCuidadores.length > 0 && listaPacientes.length > 0) {
      setIsLoading(true); // Garante que começa a carregar
      setError(null); // Limpa erros anteriores

      // 1. Encontra o paciente solicitado pela URL
      const pacienteEncontrado = listaPacientes.find(
        p => p.id === id
      ); // [cite: cadastro-context.tsx]

      if (!pacienteEncontrado) {
        setError("Paciente não encontrado.");
        setIsLoading(false);
        return;
      }

      let temPermissao = false;
      let pacienteParaMostrar: Paciente | null = null;

      // 2. Verifica se o utilizador logado é o Cuidador deste paciente
      const cuidadorLogado = listaCuidadores.find(
        c => c.email === loggedInUserEmail,
      ); // [cite: auth-context.tsx, cadastro-context.tsx]

      if (cuidadorLogado) {
        // É um cuidador. Verifica se o paciente encontrado é o vinculado a ele.
        if (pacienteEncontrado.cpfPaciente === cuidadorLogado.cpfPaciente) {
          console.log("Acesso como Cuidador autorizado.");
          temPermissao = true;
          pacienteParaMostrar = pacienteEncontrado;
        } else {
          console.log("Acesso como Cuidador NEGADO. Paciente não vinculado.");
          setError("Você não tem permissão para ver os dados deste paciente.");
        }
      } else {
        // 3. Se não for cuidador, verifica se é o PRÓPRIO Paciente
        if (pacienteEncontrado.email === loggedInUserEmail) {
          console.log("Acesso como Paciente autorizado.");
          temPermissao = true;
          pacienteParaMostrar = pacienteEncontrado;
        } else {
          console.log("Acesso como Paciente NEGADO. Não é o utilizador logado.");
          setError("Você não tem permissão para ver os dados deste paciente.");
        }
      }

      // 4. Se tem permissão, define o estado do paciente e busca as consultas
      if (temPermissao && pacienteParaMostrar) {
        setPaciente(pacienteParaMostrar);

        // --- BUSCA CONSULTAS DO CONTEXTO ---
        // --- FIM DA BUSCA DE CONSULTAS ---

        // --- DADOS MOCADOS (Health Indicators - permanecem iguais) ---
        const healthData: HealthIndicatorType[] = [
          { name: "Pressão Arterial", value: "120/80 mmHg", percentage: 80, color: "#2e7d32" },
          { name: "Glicemia", value: "140 mg/dL", percentage: 60, color: "#f9a825" },
          { name: "Hidratação", value: "Baixa ingestão", percentage: 40, color: "#c62828" }
        ];
        setHealthIndicators(healthData);
        // --- Fim dos Dados Mocados ---

      } else if (!error) { // Se não tem permissão mas ainda não houve erro explícito
          setError("Erro inesperado ao verificar permissões.");
      }

      setIsLoading(false); // Terminou o processo
    } else if (!loggedInUserEmail) {
        // Caso o utilizador não esteja logado (ProtectedRoute deveria impedir, mas é uma segurança extra)
        setError("Utilizador não autenticado.");
        setIsLoading(false);
    }
    // Adiciona isLoadingConsultas às dependências para reavaliar se as consultas carregarem depois
  }, [id, loggedInUserEmail, listaCuidadores, listaPacientes, getConsultasPorPaciente]);


  // --- Telas de Carregamento e Erro ---
  // Mostra loading se isLoading (verificação de paciente/permissão) OU isLoadingConsultas (contexto a carregar)


  if (error || !paciente) {
    // Mesma tela de erro de antes
     return (
       <Layout>
         <div className="py-20 bg-gray-50 min-h-screen flex items-center justify-center text-center">
           <div>
             <h1 className="text-2xl font-bold text-red-600">Erro ao Carregar</h1>
             <p className="text-lg text-gray-600 mt-2">{error || "Não foi possível encontrar os dados necessários."}</p>
             {/* O link de voltar deve ir para o painel correto (cuidador ou paciente) */}
             {/* Poderia usar a lógica do Header aqui, mas simplificando para /login por enquanto */}
             <Link to="/" className="mt-4 inline-block px-6 py-2 bg-blue-600 text-white font-semibold rounded-lg shadow-md hover:bg-blue-700">
               Voltar
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
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">

          <div className="mb-6">
            {/* O Link de voltar agora deve ir para o painel genérico ou login se der erro */}
            {/* Como estamos na página do dashboard, voltar pode ir para a home ou login */}
            <Link
              to="/" // Ou para o painel específico se conseguir determinar
              className="hover:cursor-pointer text-gray-600 hover:text-indigo-600 flex items-center transition-colors text-base font-medium group"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2 group-hover:-translate-x-1 transition-transform"><path d="m15 18-6-6 6-6"/></svg>
              Voltar
            </Link>
          </div>

          <section className="bg-white p-6 rounded-lg shadow-md mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Informações do Paciente
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <p className="text-gray-700"><strong>Nome:</strong> {paciente.nome}</p>
              <p className="text-gray-700"><strong>Idade:</strong> {paciente.idade} anos</p>
              <p className="text-gray-700"><strong>Patologia:</strong> {paciente.patologia}</p>
            </div>
          </section>

          {/* Seção Health Indicators (ainda mocada) */}
          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Indicadores de Saúde</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {healthIndicators.map((indicator, index) => (
                 <div key={index} className="bg-white p-4 rounded-lg shadow-md text-center">
                   <h3 className="text-lg font-semibold text-gray-900 mb-2">{indicator.name}</h3>
                   <div className="relative bg-gray-200 rounded-full h-20 mb-2">
                     <div
                       className={`absolute bottom-0 rounded-full transition-all duration-500`}
                       style={{ height: `${indicator.percentage}%`, backgroundColor: indicator.color, width: '100%' }}
                     />
                   </div>
                   <p className="text-sm font-medium text-gray-700">{indicator.value}</p>
                 </div>
              ))}
            </div>
          </section>
        </div>
      </div>
    </Layout>
  );
};

