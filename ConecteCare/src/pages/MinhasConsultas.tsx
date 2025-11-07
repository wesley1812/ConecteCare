import { useState, useEffect, useCallback } from "react";
import { useParams } from "react-router-dom"; 
import { CardConsulta } from "../components/CardConsulta.tsx";
import { Layout } from "../components/Layout.tsx"; 
import { useAuth } from "../context/auth-context.tsx"; 
import { useCadastro } from "../context/cadastro-context.tsx"; 
import { useConsultas } from "../context/consultas-context.tsx"; 
import type { Consulta, Paciente } from "../types/interfaces";
import { FormulariosConsulta, type ActiveForm } from "../components/FormulariosConsulta.tsx"; 
import { CalendarIcon } from "../styles/icons.tsx"; 

export function MinhasConsultas() {
    const { id: pacienteIDURL } = useParams<{ id: string }>();
    
    const { user: emailUserLogado } = useAuth();
    const { paciente: listaPacientes } = useCadastro();
    const { getConsultasPorPaciente } = useConsultas();

    const [appointments, setAppointments] = useState<Consulta[]>([]);
    const [isLoadingPatient, setIsLoadingPatient] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [pacienteExibido, setPacienteExibido] = useState<Paciente | null>(null);

    const [activeForm, setActiveForm] = useState<ActiveForm>(null);
    const [selectedConsulta, setSelectedConsulta] = useState<Consulta | null>(null);
    const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);


    useEffect(() => {
        setIsLoadingPatient(true);
        setError(null);

        if (!emailUserLogado || listaPacientes.length === 0) {
            if (!pacienteIDURL) {
                setError("Por favor, faça login ou acesse a partir do Perfil.");
                setIsLoadingPatient(false);
            }
            return;
        }

        let pacienteEncontrado: Paciente | undefined;

        if (pacienteIDURL) {
            // CUIDADOR: Busca o paciente pelo ID fornecido na URL
            pacienteEncontrado = listaPacientes.find(p => p.id === pacienteIDURL);
            if (!pacienteEncontrado) {
                setError("Paciente não encontrado com o ID fornecido.");
            }
        } else {
            // PACIENTE: Busca o paciente pelo email logado (acesso direto)
            pacienteEncontrado = listaPacientes.find(p => p.email === emailUserLogado);
            if (!pacienteEncontrado) {
                // Se o usuário logado não for paciente, mas for cuidador, pode não ter um ID na URL (erro no fluxo)
                setError("Seu perfil de paciente não foi encontrado ou a rota está incorreta.");
            }
        }

        if (pacienteEncontrado) {
            setPacienteExibido(pacienteEncontrado);
            // Busca as consultas se o paciente foi encontrado
            setAppointments(getConsultasPorPaciente(pacienteEncontrado.cpfPaciente));
        } else {
            setPacienteExibido(null);
            setAppointments([]);
        }
        
        setIsLoadingPatient(false);
        
        setMessage(null);

    }, [emailUserLogado, listaPacientes, pacienteIDURL, getConsultasPorPaciente]);


    // Função de tratamento de sucesso após ação no formulário (agendar/remarcar/cancelar)
    const handleSuccess = useCallback((text: string, type: 'success' | 'error' = 'success') => {
        setMessage({ type, text });
        setActiveForm(null); // Fecha o formulário após a ação bem-sucedida
        setSelectedConsulta(null);

        // Força a atualização da lista após o sucesso
        if (pacienteExibido) {
             setAppointments(getConsultasPorPaciente(pacienteExibido.cpfPaciente));
        }
    }, [pacienteExibido, getConsultasPorPaciente]);

    // Função para lidar com cliques de ação (Remarcar/Cancelar) no CardConsulta
    const handleAction = useCallback((type: 'remarcar' | 'cancelar', appointment: Consulta) => {
        setActiveForm(type);
        setSelectedConsulta(appointment);
        setMessage(null); // Limpa a mensagem de status anterior
    }, []);

    const handleFormClose = () => {
        setActiveForm(null);
        setSelectedConsulta(null);
    };


    // Renderização de carregamento e erro
    if (isLoadingPatient) {
        // Assume que o Layout está configurado para receber children sem title/icon, ou que CalendarIcon está no escopo
        return <Layout title="Carregando Consultas..." icon={<CalendarIcon />}> 
            <div className="text-center py-10 text-lg text-gray-500">
                Aguarde, buscando dados do paciente...
            </div>
        </Layout>;
    }

    if (error || !pacienteExibido) {
        return <Layout title="Minhas Consultas" icon={<CalendarIcon />}>
            <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded-lg shadow-md" role="alert">
                <p className="font-bold">Erro ao Carregar Dados</p>
                <p>{error || "Paciente não encontrado."}</p>
            </div>
        </Layout>;
    }
    
    // Texto de cabeçalho para diferenciar o acesso
    const isCaregiverAccess = !!pacienteIDURL;
    const headerTitle = isCaregiverAccess 
        ? `Consultas de ${pacienteExibido.nome}` 
        : `Minhas Consultas (${pacienteExibido.nome})`;

    return (
        <Layout 
            title={headerTitle}
            icon={<CalendarIcon />}
        >
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="space-y-10">

                    {/* Mensagem de Status (Sucesso/Erro) */}
                    {message && (
                        <div className={`p-4 rounded-lg shadow-md ${message.type === 'success' ? 'bg-green-100 border-l-4 border-green-600 text-green-800' : 'bg-red-100 border-l-4 border-red-600 text-red-800'}`} role="alert">
                            <p className="font-bold">{message.type === 'success' ? 'Sucesso!' : 'Erro!'}</p>
                            <p>{message.text}</p>
                        </div>
                    )}

                    {/* Formulário Ativo (Agendar/Remarcar/Cancelar) */}
                    {activeForm && (
                        <div className="relative">
                            <button onClick={handleFormClose} className="absolute top-0 right-0 p-2 text-gray-500 hover:text-gray-900 transition-colors">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                            <FormulariosConsulta 
                                formType={activeForm}
                                cpfPaciente={pacienteExibido.cpfPaciente}
                                selectedConsulta={selectedConsulta}
                                onSuccess={handleSuccess}
                            />
                        </div>
                    )}


                    {/* 2. LISTA DE CONSULTAS */}
                    <section>
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-2xl font-bold text-gray-900">Consultas Agendadas</h2>
                            {pacienteExibido && (
                                <button onClick={() => { setActiveForm('agendar'); setSelectedConsulta(null); }} className="hover:cursor-pointer px-4 py-2 bg-indigo-600 text-white font-semibold rounded-lg shadow-md hover:bg-indigo-700 transition-colors text-sm">
                                    + Agendar Nova
                                </button>
                            )}
                        </div>
                        
                        {appointments.length > 0 ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {appointments.map((appointment) => (
                                    <CardConsulta
                                        key={appointment.id}
                                        appointment={appointment}
                                        onAction={handleAction}
                                    />
                                ))}
                            </div>
                        ) : (
                            <div className="bg-white p-6 rounded-lg shadow-md text-center text-gray-500">
                                <p className="text-lg mb-3">Nenhuma consulta agendada para {isCaregiverAccess ? pacienteExibido.nome : 'você'}.</p>
                                <button onClick={() => setActiveForm('agendar')} className="hover:cursor-pointer px-4 py-2 bg-indigo-600 text-white font-semibold rounded-lg shadow-md hover:bg-indigo-700 transition-colors">
                                    Agendar Agora
                                </button>
                            </div>
                        )}
                    </section>
                </div>
            </div>
        </Layout>
    );
}