import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { CardConsulta } from "../components/CardsDashboard";
import { CardIndicadorSaude } from "../components/CardSaude";
import { CardPacienteInfo, CardMedicamento } from "../components/CardsDashboard";
import { Layout } from "../components/Layout";
import { useAuth } from "../context/auth-context";
import { useCadastro } from "../context/cadastro-context";
import { useConsultas } from "../context/consultas-context";
import { IconAlertTriangle, IconPill, IconClock } from "../styles/icons";
import type { Paciente, HealthIndicatorType, MedicamentoType, Consulta } from "../types/interfaces";
import { MOCKED_MEDICATION } from "../types/mocked-data";

const IconBloodPressure: React.FC<React.SVGProps<SVGSVGElement>> = (props) => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M12 2v20M12 4l3 3M12 4l-3 3M4 14h16M4 18h16M4 10h16" /></svg>;
const IconBloodSugar: React.FC<React.SVGProps<SVGSVGElement>> = (props) => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M12 2L12 12M12 12L18 18M12 12L6 18M3 3L21 3L18 6L6 6L3 3Z" /></svg>;
const IconHydration: React.FC<React.SVGProps<SVGSVGElement>> = (props) => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M18 10a6 6 0 1 0 0-12 6 6 0 0 0 0 12zM12 18v2m-6-6h-2m14 0h2m-6 6h-2" /></svg>;


export function Dashboard() {
  const { id } = useParams<{ id: string }>();

  const { user: loggedInUserEmail } = useAuth();
  const { cuidador: listaCuidadores, paciente: listaPacientes } = useCadastro();

  const { getConsultasPorPaciente } = useConsultas();
  const [paciente, setPaciente] = useState<Paciente | null>(null);

  const [healthIndicators, setHealthIndicators] = useState<HealthIndicatorType[]>([]);
  const [appointments, setAppointments] = useState<Consulta[]>([]);
  const [medication, setMedication] = useState<MedicamentoType[]>([]);
  const [, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (id && loggedInUserEmail && listaCuidadores.length > 0 && listaPacientes.length > 0) {
      setIsLoading(true);

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

      const cuidadorLogado = listaCuidadores.find(
        c => c.email === loggedInUserEmail
      );

      if (cuidadorLogado) {
        // É um cuidador. Verifica se o paciente encontrado é o vinculado a ele.
        if (pacienteEncontrado.cpfPaciente === cuidadorLogado.cpfPaciente) {
          console.log("Acesso como Cuidador autorizado.");
          temPermissao = true;
          pacienteParaMostrar = pacienteEncontrado;
          setAppointments(getConsultasPorPaciente(pacienteEncontrado.cpfPaciente));
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
          setAppointments(getConsultasPorPaciente(pacienteEncontrado.cpfPaciente));

        } else {
          console.log("Acesso como Paciente NEGADO. Não é o utilizador logado.");
          setError("Você não tem permissão para ver os dados deste paciente.");
        }
      }

      if (temPermissao && pacienteParaMostrar) {
        setPaciente(pacienteParaMostrar);


      } else if (!error) { // Se não tem permissão mas ainda não houve erro explícito
        setError("Erro inesperado ao verificar permissões.");
      }

      setIsLoading(false); // Terminou o processo
    } else if (!loggedInUserEmail) {
      // Caso o utilizador não esteja logado (ProtectedRoute deveria impedir, mas é uma segurança extra)
      setError("Utilizador não autenticado.");
      setIsLoading(false);
    }

    const healthData: HealthIndicatorType[] = [
      { name: "Pressão Arterial", value: "120/80 mmHg", percentage: 80, color: "#2e7d32", icon: <IconBloodPressure /> },
      { name: "Glicemia", value: "140 mg/dL", percentage: 60, color: "#f9a825", icon: <IconBloodSugar /> },
      { name: "Hidratação", value: "Baixa ingestão", percentage: 40, color: "#c62828", icon: <IconHydration /> }
    ]; setHealthIndicators(healthData);

    setMedication(MOCKED_MEDICATION);

  }, [id, loggedInUserEmail, listaCuidadores, listaPacientes, getConsultasPorPaciente]);




  if (error || !paciente) {
    return (
      <Layout>
        <div className="py-20 bg-gray-50 min-h-screen flex items-center justify-center text-center">
          <div className="bg-white p-8 rounded-xl shadow-xl max-w-sm">
            <IconAlertTriangle className="h-10 w-10 text-red-500 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-red-600">Erro de Acesso</h1>
            <p className="text-lg text-gray-600 mt-2">{error || "Não foi possível encontrar o paciente ou o acesso não foi autorizado."}</p>
            <Link to="/perfil-cuidador" className="mt-6 inline-block px-6 py-2 bg-blue-600 text-white font-semibold rounded-lg shadow-md hover:bg-blue-700 transition-colors">
              Voltar ao Painel
            </Link>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="py-8 md:py-12 min-h-screen">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

            <div className="lg:col-span-1 space-y-8">
              <CardPacienteInfo paciente={paciente} />
              <div>
                <h2 className="text-xl font-bold text-gray-800 mb-4 border-b border-gray-200 pb-2">
                  <IconPill className="h-5 w-5 inline mr-2 text-cyan-600" />
                  Plano de Medicação Atual
                </h2>
                <div className="space-y-4">
                  {medication.length > 0 ? (
                    medication.map((m) => (
                      <CardMedicamento key={m.id} medicamento={m} />
                    ))
                  ) : (
                    <div className="bg-white p-5 rounded-xl text-center text-gray-500 shadow-md">
                      Nenhum medicamento ativo registrado.
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* COLUNA 2/3: Indicadores e Consultas */}
            <div className="lg:col-span-2 space-y-8">

              {/* Seção Indicadores de Saúde */}
              <section>
                <h2 className="text-xl font-bold text-gray-800 mb-4 border-b border-gray-200 pb-2">
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="inline mr-2 text-red-500"><path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" /></svg>
                  Indicadores de Saúde (Últimas Leituras)
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {healthIndicators.map((indicator, index) => (
                    <CardIndicadorSaude key={index} indicador={indicator} />
                  ))}
                </div>
              </section>

              {/* Seção Próximas Consultas */}
              <section>
                <h2 className="text-xl font-bold text-gray-800 mb-4 border-b border-gray-200 pb-2">
                  <IconClock className="h-5 w-5 inline mr-2 text-blue-600" />
                  Próximas Consultas Agendadas
                </h2>
                {appointments.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {appointments.map((appointment) => (
                      <CardConsulta
                        key={appointment.id}
                        appointment={appointment}

                      />
                    ))}
                  </div>
                ) : (
                  <div className="bg-white p-6 rounded-xl shadow-md text-center text-gray-500 border border-gray-100">
                    Nenhuma consulta agendada para este paciente.
                  </div>
                )}
              </section>
            </div>
          </div>

        </div>
      </div>
    </Layout>
  );
};