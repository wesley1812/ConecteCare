import { useState, useEffect, useCallback } from "react";
import { CardConsulta } from "../components/CardSaude";
import { Layout } from "../components/Layout";
import { useAuth } from "../context/auth-context";
import { useCadastro } from "../context/cadastro-context";
import { useConsultas } from "../context/consultas-context";
import type { Consulta, Paciente } from "../types/interfaces";
import { CalendarIcon, FormulariosConsulta, type ActiveForm } from "../components/FormulariosConsulta";

export function MinhasConsultas() {
    const { user: loggedInUserEmail } = useAuth();
    const { paciente: listaPacientes } = useCadastro();
    const { getConsultasPorPaciente} = useConsultas();

    const [appointments, setAppointments] = useState<Consulta[]>([]);
    const [isLoadingPatient, setIsLoadingPatient] = useState(true); 
    const [error, setError] = useState<string | null>(null);
    const [pacienteLogado, setPacienteLogado] = useState<Paciente | null>(null);

    const [activeForm, setActiveForm] = useState<ActiveForm>(null);
    const [selectedConsulta, setSelectedConsulta] = useState<Consulta | null>(null);
    const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);


    // Lógica de busca e carregamento (inalterada)
    useEffect(() => {
        setIsLoadingPatient(true);
        setError(null);
        
        if (!loggedInUserEmail || listaPacientes.length === 0) {
            if (!loggedInUserEmail) { setError("Utilizador não autenticado."); }
            setIsLoadingPatient(false);
            return;
        }
        
        const foundPaciente = listaPacientes.find(p => p.email === loggedInUserEmail);
        
        if (!foundPaciente) { setError("Paciente logado não encontrado no sistema de cadastro."); setIsLoadingPatient(false); return; }
        
        setPacienteLogado(foundPaciente);

        const consultasDoPaciente = getConsultasPorPaciente(foundPaciente.cpfPaciente);
        setAppointments(consultasDoPaciente);

        setIsLoadingPatient(false);
    }, [loggedInUserEmail, listaPacientes, getConsultasPorPaciente]);

    const handleAction = useCallback((action: 'remarcar' | 'cancelar', consulta: Consulta) => {
        setSelectedConsulta(consulta);
        setActiveForm(action);
        setMessage(null);
    }, []);

    const handleFormSuccess = useCallback((msg: string, type: 'success' | 'error' = 'success') => {
        setMessage({ type, text: msg });
        setActiveForm(null); 
        setSelectedConsulta(null); 
    }, []);

    // --- Telas de Carregamento e Erro ---
    if (isLoadingPatient) {
        return <Layout><div className="py-20 bg-gray-50 min-h-screen flex items-center justify-center"><div className="text-center text-lg text-gray-600">A carregar suas consultas...</div></div></Layout>;
    }
    if (error || !pacienteLogado) {
        return <Layout><div className="py-20 bg-gray-50 min-h-screen flex items-center justify-center text-center"><div><h1 className="text-2xl font-bold text-red-600">Erro de Acesso</h1><p className="text-lg text-gray-600 mt-2">{error}</p></div></div></Layout>;
    }

    // --- Página Principal ---
    return (
        <Layout>
            <div className="py-12 bg-gray-50 min-h-screen">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">

                    {/* CABEÇALHO E BOTÃO AGENDAR */}
                    <div className="flex justify-between items-center mb-10 border-b pb-4">
                        <h1 className="text-3xl font-bold text-gray-900 flex items-center">
                            <CalendarIcon />
                            Minhas Próximas Consultas
                        </h1>
                        <button 
                            onClick={() => setActiveForm('agendar')}
                            className="px-4 py-2 bg-indigo-600 text-white font-semibold rounded-lg shadow-md hover:bg-indigo-700 transition-colors"
                        >
                            + Agendar Nova
                        </button>
                    </div>

                    {/* Feedback de Mensagem */}
                    {message && (
                        <div className={`p-4 mb-6 rounded-lg shadow-md ${message.type === 'success' ? 'bg-green-100 border-l-4 border-green-600 text-green-800' : 'bg-red-100 border-l-4 border-red-600 text-red-800'}`}>
                            <p className="font-bold">{message.text}</p>
                        </div>
                    )}


                    {/* 1. SEÇÃO FORMULÁRIO ATIVO (USANDO FormulariosConsulta) */}
                    {activeForm && pacienteLogado && (
                        <div className="mb-10">
                            <button onClick={() => setActiveForm(null)} className="text-sm text-gray-500 hover:text-gray-800 mb-3 flex items-center">
                                &larr; Fechar Formulário
                            </button>
                            
                            <FormulariosConsulta
                                formType={activeForm}
                                cpfPaciente={pacienteLogado.cpfPaciente}
                                selectedConsulta={selectedConsulta}
                                onSuccess={handleFormSuccess}
                            />
                        </div>
                    )}


                    {/* 2. LISTA DE CONSULTAS */}
                    <section>
                        <h2 className="text-2xl font-bold text-gray-900 mb-6">Consultas Agendadas</h2>
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
                                <p className="text-lg mb-3">Nenhuma consulta agendada para este paciente.</p>
                                <button onClick={() => setActiveForm('agendar')} className="px-4 py-2 bg-indigo-600 text-white font-semibold rounded-lg shadow-md hover:bg-indigo-700 transition-colors">
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