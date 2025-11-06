import { useState, useEffect, type JSX } from "react";
// Assumindo que o ambiente React Router está configurado
import { useParams, Link } from "react-router-dom";

// =========================================================================================
// MOCKS E CONTEXTOS (Para tornar o arquivo runnable e focado no design)
// Em um projeto real, estes seriam importados de arquivos externos.
// =========================================================================================

// --- Mocks de Ícones ---
const ArrowLeft = (props: any) => (<svg {...props} xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2 group-hover:-translate-x-1 transition-transform"><path d="m15 18-6-6 6-6"/></svg>);
const MedkitIcon = (props: any) => (<svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 20H6a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v5"/><path d="M18 9h-7a2 2 0 0 0-2 2v7a2 2 0 0 0 2 2h7a2 2 0 0 0 2-2v-7a2 2 0 0 0-2-2Z"/><path d="M14 2h.01"/><path d="M12 2v7"/><path d="M22 19h-2a2 2 0 0 0-2 2v2"/></svg>);
const HeartIcon = (props: any) => (<svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/></svg>);

// --- Mock do Layout ---
const Layout = ({ children }: { children: React.ReactNode }) => (
    <div className="min-h-screen bg-gray-50 font-sans">
        <header className="bg-blue-600 p-4 text-white shadow-lg">
            <div className="max-w-6xl mx-auto">ConecteCare - Painel</div>
        </header>
        {children}
    </div>
);

// --- Tipos necessários ---
type Paciente = { id: string; nome: string; idade: number; patologia: string; cpfPaciente: string; email: string };
type Cuidador = { email: string; cpfPaciente: string; };
type HealthIndicatorType = { name: string; value: string; percentage: number; color: string };

interface Medication {
  id: string;
  name: string;
  dosage: string;
  frequency: string;
  prescribedBy: string;
  prescribedDate: string; 
  status: 'active' | 'inactive' | 'expired';
}

// --- Mocks dos Contextos ---
const useAuth = () => ({ user: "cuidador@conectecare.com" });
const useCadastro = () => ({
    cuidador: [{ email: "cuidador@conectecare.com", cpfPaciente: "12345678900" } as Cuidador],
    paciente: [{ id: "p1", nome: "João Silva", idade: 72, patologia: "Hipertensão e Diabetes", cpfPaciente: "12345678900", email: "paciente@conectecare.com" } as Paciente]
});
const useConsultas = () => ({ getConsultasPorPaciente: () => {} });
// =========================================================================================

// =========================================================================================
// MOCK DE DADOS DA API_CONECTE_CARE (Medicamentos)
// =========================================================================================

const mockMedications: Medication[] = [
    {
        id: "m1",
        name: "Lisinopril",
        dosage: "10mg",
        frequency: "1x ao dia (Manhã)",
        prescribedBy: "Dr. Ana Costa (Cardiologista)",
        prescribedDate: "2024-08-15",
        status: 'active'
    },
    {
        id: "m2",
        name: "Metformina",
        dosage: "500mg",
        frequency: "2x ao dia (Almoço, Janta)",
        prescribedBy: "Dra. Laura Mendes (Clínica Geral)",
        prescribedDate: "2024-07-01",
        status: 'active'
    },
    {
        id: "m3",
        name: "Aspirina",
        dosage: "100mg",
        frequency: "1x ao dia",
        prescribedBy: "Dr. Pedro Santos (Geral)",
        prescribedDate: "2023-01-20",
        status: 'expired'
    },
    {
        id: "m4",
        name: "Omeprazol",
        dosage: "20mg",
        frequency: "1x ao dia (Jejum)",
        prescribedBy: "Dr. Ana Costa (Cardiologista)",
        prescribedDate: "2024-05-10",
        status: 'inactive'
    },
];

// =========================================================================================
// COMPONENTES DE DESIGN (Refatorados com o tema Blue/Cyan)
// =========================================================================================

const PatientInfoCard = ({ paciente }: { paciente: Paciente }) => (
    <div className="bg-white p-8 rounded-3xl shadow-xl border-t-4 border-blue-600 mb-8">
        <h2 className="text-3xl font-extrabold text-gray-900 mb-4 flex items-center gap-3">
            <span className="text-blue-600 text-4xl">👨‍⚕️</span>
            Informações do Paciente
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pt-4 border-t border-gray-100">
            <div className="bg-blue-50 p-4 rounded-xl shadow-inner">
                <p className="text-sm font-semibold text-blue-800">Nome Completo</p>
                <p className="text-xl font-bold text-gray-900">{paciente.nome}</p>
            </div>
            <div className="bg-blue-50 p-4 rounded-xl shadow-inner">
                <p className="text-sm font-semibold text-blue-800">Idade</p>
                <p className="text-xl font-bold text-gray-900">{paciente.idade} anos</p>
            </div>
            <div className="bg-blue-50 p-4 rounded-xl shadow-inner lg:col-span-1 md:col-span-2">
                <p className="text-sm font-semibold text-blue-800">Patologia Principal</p>
                <p className="text-xl font-bold text-gray-900">{paciente.patologia}</p>
            </div>
        </div>
    </div>
);

const HealthIndicatorsSection = ({ indicators }: { indicators: HealthIndicatorType[] }) => (
    <div className="bg-white p-8 rounded-3xl shadow-xl mb-8">
        <h2 className="text-3xl font-extrabold text-gray-900 mb-6 flex items-center gap-3">
            <HeartIcon className="text-cyan-500 w-8 h-8"/>
            Indicadores de Saúde Recentes
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {indicators.map((indicator, index) => (
                <div key={index} className="bg-gray-50 p-6 rounded-xl shadow-md border border-gray-100 hover:shadow-lg transition-shadow duration-300">
                    <h3 className="text-xl font-bold text-gray-900 mb-4">{indicator.name}</h3>
                    
                    <div className="relative pt-10">
                        {/* Indicador Visual (Tubo Vertical com cor) */}
                        <div className="bg-gray-200 w-full h-40 rounded-xl overflow-hidden shadow-inner">
                            <div
                                className={`absolute bottom-0 rounded-xl transition-all duration-700 w-full`}
                                style={{ height: `${indicator.percentage}%`, backgroundColor: indicator.color }}
                                aria-valuenow={indicator.percentage}
                                aria-valuemin={0}
                                aria-valuemax={100}
                                role="progressbar"
                            />
                        </div>

                        {/* Valor sobre o tubo */}
                        <div className={`absolute top-0 left-0 right-0 p-2 text-center rounded-t-xl font-extrabold text-2xl 
                                          ${indicator.percentage > 50 ? 'text-white' : 'text-gray-900'}`}
                        style={{
                            textShadow: indicator.percentage > 50 ? '1px 1px 3px rgba(0,0,0,0.5)' : 'none',
                        }}>
                           {indicator.value}
                        </div>
                    </div>

                    <p className={`text-sm font-medium mt-4 text-center ${indicator.percentage > 60 ? 'text-green-600' : indicator.percentage > 40 ? 'text-yellow-600' : 'text-red-600'}`}>
                        Nível: {indicator.percentage}%
                    </p>
                </div>
            ))}
        </div>
    </div>
);

const MedicationHistorySection = () => {
    // Usando os dados mockados
    const medications = mockMedications;
    
    // Filtra medicamentos ativos
    const activeMeds = medications.filter(m => m.status === 'active');
    // Filtra medicamentos inativos/expirados
    const pastMeds = medications.filter(m => m.status !== 'active');

    const getStatusClasses = (status: Medication['status']) => {
        switch (status) {
            case 'active':
                return 'bg-green-100 text-green-800 border-green-300';
            case 'inactive':
                return 'bg-yellow-100 text-yellow-800 border-yellow-300';
            case 'expired':
            default:
                return 'bg-red-100 text-red-800 border-red-300';
        }
    };

    return (
        <div className="bg-white p-8 rounded-3xl shadow-xl mb-8">
            <h2 className="text-3xl font-extrabold text-gray-900 mb-8 flex items-center gap-3">
                <MedkitIcon className="text-blue-600 w-8 h-8"/>
                Histórico de Medicamentos Prescritos
            </h2>
            
            <div className="space-y-10">
                {/* Medicamentos Ativos */}
                <div>
                    <h3 className="text-2xl font-bold text-blue-700 border-b pb-2 mb-4 flex items-center gap-2">
                        <span className="text-green-500">🟢</span>
                        Medicações Ativas ({activeMeds.length})
                    </h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {activeMeds.length > 0 ? (
                            activeMeds.map(med => (
                                <MedicationCard key={med.id} med={med} getStatusClasses={getStatusClasses} />
                            ))
                        ) : (
                            <p className="text-gray-500 italic md:col-span-3">Nenhum medicamento ativo registrado no momento.</p>
                        )}
                    </div>
                </div>

                {/* Histórico/Inativos/Expirados */}
                <div>
                    <h3 className="text-2xl font-bold text-blue-700 border-b pb-2 mb-4 flex items-center gap-2">
                        <span className="text-orange-500">🟡</span>
                        Histórico e Inativos ({pastMeds.length})
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {pastMeds.length > 0 ? (
                            pastMeds.map(med => (
                                <MedicationCard key={med.id} med={med} getStatusClasses={getStatusClasses} />
                            ))
                        ) : (
                            <p className="text-gray-500 italic md:col-span-2">Nenhum histórico de medicamentos inativos ou expirados.</p>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

// Componente para um card de medicamento
const MedicationCard = ({ med, getStatusClasses }: { med: Medication, getStatusClasses: (status: Medication['status']) => string }) => (
    <div className="bg-cyan-50 p-5 rounded-xl shadow-lg border border-cyan-100 hover:border-cyan-400 transition-all duration-300">
        <div className="flex justify-between items-start mb-3">
            <h4 className="text-xl font-bold text-gray-900">{med.name}</h4>
            <span className={`px-3 py-1 text-xs font-semibold rounded-full border ${getStatusClasses(med.status)}`}>
                {med.status === 'active' ? 'ATIVO' : med.status === 'inactive' ? 'INATIVO' : 'EXPIRADO'}
            </span>
        </div>
        
        <div className="space-y-2 text-sm text-gray-700">
            <p><strong className="text-blue-600">Dose:</strong> {med.dosage}</p>
            <p><strong className="text-blue-600">Frequência:</strong> {med.frequency}</p>
            <p><strong className="text-blue-600">Prescrito por:</strong> {med.prescribedBy}</p>
            <p><strong className="text-blue-600">Data:</strong> {new Date(med.prescribedDate).toLocaleDateString('pt-BR')}</p>
        </div>
    </div>
);

// =========================================================================================
// COMPONENTE PRINCIPAL (Lógica do Usuário + Novo Design)
// =========================================================================================

export function Dashboard(): JSX.Element {
  const { id } = useParams<{ id: string }>(); // ID do Paciente vindo da URL
  const { user: loggedInUserEmail } = useAuth(); // [cite: auth-context.tsx]
  const { cuidador: listaCuidadores, paciente: listaPacientes } = useCadastro(); // [cite: cadastro-context.tsx]
  // Usa o novo contexto de consultas
  const { getConsultasPorPaciente } = useConsultas(); // [cite: consultas-context.tsx]

  const [paciente, setPaciente] = useState<Paciente | null>(null);
  const [healthIndicators, setHealthIndicators] = useState<HealthIndicatorType[]>([]);
  // O estado 'appointments' agora será preenchido pelo contexto
  const [isLoading, setIsLoading] = useState(true); // Loading combinado (paciente + consultas)
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
        // Aqui você chamaria getConsultasPorPaciente(pacienteParaMostrar.id)
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

  if (isLoading) {
    return (
        <Layout>
            <div className="py-20 flex items-center justify-center min-h-[60vh]">
                <div className="flex flex-col items-center">
                    <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-blue-600 mb-4"></div>
                    <p className="text-xl font-semibold text-gray-700">Carregando dados do paciente...</p>
                </div>
            </div>
        </Layout>
    );
  }

  if (error || !paciente) {
    // Mesma tela de erro, mas com design ajustado
    return (
      <Layout>
        <div className="py-20 bg-gray-50 min-h-screen flex items-center justify-center text-center">
          <div className="bg-white p-10 rounded-2xl shadow-2xl max-w-lg border-t-8 border-red-600">
            <h1 className="text-3xl font-bold text-red-700 mb-3">❌ Erro ao Carregar</h1>
            <p className="text-lg text-gray-600 mt-2 leading-relaxed">{error || "Não foi possível encontrar os dados necessários."}</p>
            <Link 
              to="/" 
              className="mt-6 inline-block px-8 py-3 bg-blue-600 text-white font-semibold rounded-xl shadow-lg hover:bg-blue-700 transition-colors duration-200"
            >
              Voltar ao Início
            </Link>
          </div>
        </div>
      </Layout>
    );
  }


  // --- Página Principal (Design Aprimorado) ---
  return (
    <Layout>
      <div className="py-12 min-h-screen">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">

          {/* Cabeçalho e Voltar */}
          <div className="mb-8 flex justify-between items-center">
            <Link
              to="/" 
              className="hover:cursor-pointer text-gray-600 hover:text-cyan-600 flex items-center transition-colors text-lg font-medium group"
              aria-label="Voltar para a página inicial"
            >
              <ArrowLeft className="text-cyan-500 w-6 h-6"/>
              Voltar ao Painel
            </Link>
            <h1 className="text-4xl font-extrabold bg-gradient-to-r from-blue-700 to-cyan-500 bg-clip-text text-transparent tracking-tight">
                Dashboard
            </h1>
          </div>
          
          {/* Seção 1: Informações do Paciente */}
          <PatientInfoCard paciente={paciente} />

          {/* Seção 2: Indicadores de Saúde */}
          <HealthIndicatorsSection indicators={healthIndicators} />
          
          {/* Seção 3: Histórico de Medicamentos (NOVA) */}
          <MedicationHistorySection />
          
          {/* Espaço para futuras seções: Consultas, Relatórios, etc. */}
          <div className="mt-12 p-6 bg-white rounded-3xl shadow-lg border-l-8 border-cyan-500">
            <h3 className="text-2xl font-bold text-gray-800">Próximos Passos</h3>
            <p className="text-gray-600 mt-2">
                Navegue pelas outras seções para ver o histórico de consultas e relatórios de saúde do paciente.
            </p>
          </div>
          
        </div>
      </div>
    </Layout>
  );
};