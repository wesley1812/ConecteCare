import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { Layout } from "../components/Layout";
// Importa CardConsulta e o tipo AppointmentType
import { CardConsulta } from "../components/CardSaude";
import type { Paciente, HealthIndicatorType, AppointmentType } from "../types/interfaces";
import { useAuth } from "../context/auth-context";
import { useCadastro } from "../context/cadastro-context";
// Importa o novo hook
import { useConsultas } from "../context/consultas-context";
// Você pode remover CardIndicadorSaude se não for mais usar
// import { CardIndicadorSaude } from "../components/CardSaude";

// Renomeado para Dashboard
export function Dashboard() {
  const { id } = useParams<{ id: string }>();

  const { user: loggedInUserEmail } = useAuth(); // [cite: auth-context.tsx]
  const { cuidador: listaCuidadores, paciente: listaPacientes } = useCadastro(); // [cite: cadastro-context.tsx]
  // Usa o novo contexto de consultas
  const { getConsultasPorPaciente, isLoading: isLoadingConsultas } = useConsultas(); // [cite: consultas-context.tsx]

  const [paciente, setPaciente] = useState<Paciente | null>(null);
  const [healthIndicators, setHealthIndicators] = useState<HealthIndicatorType[]>([]);
  // O estado 'appointments' agora será preenchido pelo contexto
  const [appointments, setAppointments] = useState<AppointmentType[]>([]);
  const [isLoading, setIsLoading] = useState(true); // Loading dos dados de paciente/cuidador
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Só executa se os dados básicos (cuidador, paciente) estiverem carregados
    if (id && loggedInUserEmail && listaCuidadores.length > 0 && listaPacientes.length > 0) {
      setIsLoading(true); // Reinicia o loading para buscar consultas

      const cuidadorLogado = listaCuidadores.find(
        c => c.email === loggedInUserEmail
      ); // [cite: auth-context.tsx, cadastro-context.tsx]

      const pacienteEncontrado = listaPacientes.find(
        p => p.id === id
      ); // [cite: cadastro-context.tsx]

      if (!pacienteEncontrado) {
        setError("Paciente não encontrado.");
        setIsLoading(false);
        return;
      }

      if (!cuidadorLogado) {
        setError("Cuidador não autenticado.");
        setIsLoading(false);
        return;
      }

      if (pacienteEncontrado.cpfPaciente === cuidadorLogado.cpfPaciente) {
        setPaciente(pacienteEncontrado);

        // --- BUSCA CONSULTAS DO CONTEXTO ---
        // Pega as consultas APENAS deste paciente
        const consultasDoPaciente = getConsultasPorPaciente(pacienteEncontrado.cpfPaciente); // [cite: consultas-context.tsx]
        setAppointments(consultasDoPaciente);
        // --- FIM DA BUSCA DE CONSULTAS ---

      } else {
        setError("Você não tem permissão para ver este paciente.");
      }

      // --- DADOS MOCADOS (Health Indicators - permanecem iguais) ---
      const healthData: HealthIndicatorType[] = [
        { name: "Pressão Arterial", value: "120/80 mmHg", percentage: 80, color: "#2e7d32" },
        { name: "Glicemia", value: "140 mg/dL", percentage: 60, color: "#f9a825" },
        { name: "Hidratação", value: "Baixa ingestão", percentage: 40, color: "#c62828" }
      ];
      setHealthIndicators(healthData);
      // --- Fim dos Dados Mocados ---

      setIsLoading(false); // Terminou de carregar paciente e consultas (se encontradas)
    }
  }, [id, loggedInUserEmail, listaCuidadores, listaPacientes, getConsultasPorPaciente]); // Adiciona getConsultasPorPaciente como dependência

  const handleContactDoctor = (appointmentId: number) => {
    alert(`Entrando em contato sobre a consulta ID: ${appointmentId}`);
  };

  // --- Telas de Carregamento e Erro ---
  // Mostra loading se estiver buscando paciente OU consultas
  if (isLoading || isLoadingConsultas) {
    return (
      <Layout>
        <div className="py-20 bg-gray-50 min-h-screen flex items-center justify-center">
          <div className="text-center text-lg text-gray-600">Carregando dados...</div>
        </div>
      </Layout>
    );
  }

  if (error || !paciente) {
    // Mesma tela de erro de antes
     return (
       <Layout>
         <div className="py-20 bg-gray-50 min-h-screen flex items-center justify-center text-center">
           <div>
             <h1 className="text-2xl font-bold text-red-600">Erro ao Carregar</h1>
             <p className="text-lg text-gray-600 mt-2">{error || "Não foi possível encontrar o paciente."}</p>
             <Link to="/perfil/cuidador" className="mt-4 inline-block px-6 py-2 bg-blue-600 text-white font-semibold rounded-lg shadow-md hover:bg-blue-700">
               Voltar ao Painel
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
            <Link
              to="/perfil-cuidador"
              className="hover:cursor-pointer text-gray-600 hover:text-indigo-600 flex items-center transition-colors text-base font-medium group"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2 group-hover:-translate-x-1 transition-transform"><path d="m15 18-6-6 6-6"/></svg>
              Voltar ao Painel
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
              {/* Renderiza os indicadores mocados */}
              {/* Se quiser remover, apenas delete este map */}
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

          {/* Seção Próximas Consultas (AGORA COM DADOS DA API) */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Próximas Consultas</h2>
            {appointments.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {appointments.map((appointment) => (
                  <CardConsulta
                    key={appointment.id} // Assumindo que consulta tem 'id'
                    appointment={appointment}
                    onContact={handleContactDoctor}
                  />
                ))}
              </div>
            ) : (
              <div className="bg-white p-6 rounded-lg shadow-md text-center text-gray-500">
                Nenhuma consulta agendada para este paciente.
              </div>
            )}
          </section>
        </div>
      </div>
    </Layout>
  );
};
