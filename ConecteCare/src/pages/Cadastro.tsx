import { useState } from "react";
import { Layout } from "../components/Layout.tsx"; 
import { FormularioCuidador } from "../components/FormularioCuidador.tsx"; 
import { FormularioPaciente } from "../components/FormularioPaciente.tsx";
import { Termo } from "../components/Recursos.tsx";

interface MenuCadastroProps {
    navigate: (path: string) => void;
}

const UserPlusIcon = () => (
    <svg className="w-10 h-10 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-6-3a9 9 0 11-9 9m9 0a9 9 0 01-9-9"></path>
    </svg>
);

export function MenuCadastro({ navigate }: MenuCadastroProps) {
    
    const [registrationType, setRegistrationType] = useState<'cuidador' | 'paciente' | null>(null);
    const [message, setMessage] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    
    const [, setTermoType] = useState<'cuidador' | 'paciente'>('cuidador');

    const handleSuccess = (type: 'cuidador' | 'paciente') => {
        const typeLabel = type === 'cuidador' ? 'Cuidador' : 'Paciente';
        setMessage(`Cadastro de ${typeLabel} realizado com sucesso! Redirecionando...`);

        const targetPath = type === 'cuidador' ? '/menu-cuidador' : '/menu-paciente';

        setTimeout(() => {
            setMessage(''); 
            navigate(targetPath);
        }, 2000);
    };

    const handleTermoOpen = () => {
        if (registrationType) {
            setTermoType(registrationType);
        }
        setIsModalOpen(true);
    };
    
    const handleTermoClose = () => {
        setIsModalOpen(false);
    };

    const SelectionPanel = () => (
        <>
            <div className="text-center mb-10">
                <div className="inline-block p-4 bg-indigo-100 rounded-2xl mb-4 shadow-inner">
                    <UserPlusIcon />
                </div>
                <h1 className="text-3xl font-black text-gray-900 mb-2">
                    Registro na ConecteCare
                </h1>
                <p className="text-gray-500 text-lg">
                    Escolha seu perfil para continuar o cadastro.
                </p>
            </div>
            
            <div className="flex flex-col gap-6">
                <button
                    onClick={() => setRegistrationType('cuidador')}
                    className="hover:cursor-pointer flex-1 w-full bg-indigo-600 text-white p-6 rounded-xl text-xl font-bold 
                                hover:bg-indigo-700 transition-all transform hover:scale-[1.01] shadow-xl focus:outline-none focus:ring-4 focus:ring-indigo-300"
                >
                    Sou Cuidador
                    <p className="text-base font-normal mt-1 opacity-95">Responsável pelo acompanhamento do paciente.</p>
                </button>
                <button
                    onClick={() => setRegistrationType('paciente')}
                    className="hover:cursor-pointer flex-1 w-full bg-teal-600 text-white p-6 rounded-xl text-xl font-bold 
                                hover:bg-teal-700 transition-all transform hover:scale-[1.01] shadow-xl focus:outline-none focus:ring-4 focus:ring-teal-300"
                >
                    Sou Paciente
                    <p className="text-base font-normal mt-1 opacity-95">Para registro direto de pacientes.</p>
                </button>
            </div>

            <div className="mt-8 pt-6 border-t border-gray-100 text-center text-base">
                <p className="text-gray-600">
                    Já tem uma conta?
                    <button 
                        onClick={() => navigate('/')} 
                        className="font-extrabold text-blue-700 hover:text-cyan-600 ml-2 transition-colors hover:underline"
                    >
                        Fazer Login
                    </button>
                </p>
            </div>
        </>
    );

    const renderForm = () => {
        if (registrationType === 'cuidador') {
            return (
                <FormularioCuidador 
                    onTermoOpen={handleTermoOpen} 
                    onSuccess={() => handleSuccess('cuidador')} 
                />
            );
        }
        if (registrationType === 'paciente') {
            return (
                <FormularioPaciente 
                    onTermoOpen={handleTermoOpen} 
                    onSuccess={() => handleSuccess('paciente')}
                />
            );
        }
        
        return <SelectionPanel />;
    };

    return (
        <Layout>
            <div className="min-h-[90vh] flex">

                <div className="hidden lg:flex w-full lg:w-1/2 items-center justify-center 
                                bg-gradient-to-br from-indigo-900 to-blue-900 
                                relative overflow-hidden p-12">

                    <div className="absolute inset-0 opacity-10">
                        <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
                            <defs>
                                <pattern id="grid-reg" width="80" height="80" patternUnits="userSpaceOnUse">
                                    <path d="M 80 0 L 0 0 0 80" fill="none" stroke="#4a5568" strokeWidth="0.5" />
                                </pattern>
                            </defs>
                            <rect width="100%" height="100%" fill="url(#grid-reg)" />
                        </svg>
                    </div>

                    <div className="text-white text-center relative z-10 max-w-md">
                        <h2 className="text-5xl font-extrabold mb-4 tracking-tight">
                            Comece Sua Jornada de Cuidado
                        </h2>
                        <p className="text-xl text-indigo-200 mt-4">
                            Cadastre-se para acessar todas as ferramentas e monitorar o bem-estar do paciente em tempo real.
                        </p>
                        <div className="mt-8">
                            <button
                                onClick={() => navigate('/')}
                                className="inline-block px-8 py-3 bg-cyan-500 text-blue-900 font-bold rounded-full 
                                           transition-transform duration-300 hover:scale-105 shadow-lg hover:shadow-cyan-400/50"
                            >
                                Voltar para o Login
                            </button>
                        </div>
                    </div>
                </div>

                <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-12 lg:p-16 bg-gray-50">

                    <div className="max-w-md w-full bg-white rounded-3xl shadow-3xl overflow-hidden p-8 sm:p-12 
                                    border border-gray-100 transition-shadow duration-500">
                        
                        {message && (
                            <div className="bg-green-100 border-l-4 border-green-600 text-green-800 p-4 mb-6 rounded-lg shadow-md animate-pulse" role="alert">
                                <p className="font-bold">✨ {message}</p>
                            </div>
                        )}

                        {registrationType && (
                            <div className="mb-6">
                                <button
                                    onClick={() => { setRegistrationType(null); setMessage(''); }}
                                    className="hover:cursor-pointer text-gray-600 hover:text-indigo-600 flex items-center transition-colors text-base font-medium group"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2 group-hover:-translate-x-1 transition-transform"><path d="m15 18-6-6 6-6"/></svg>
                                    Voltar para Seleção de Perfil
                                </button>
                            </div>
                        )}

                        {renderForm()}
                    </div>
                </div>
            </div>

            {isModalOpen && <Termo isOpen={isModalOpen} onClose={handleTermoClose} children={undefined} />}
        </Layout>
    );
}
