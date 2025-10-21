import { useState } from "react";
import {Layout} from "../components/Layout";
import {FormularioCuidador} from "../components/FormularioCuidador";
import { FormularioPaciente } from "../components/FormularioPaciente";
import type { FormSchemaCuidador, FormSchemaPaciente } from "../schemas/forms-schema";
import { Termo } from "../components/Recursos";

interface MenuCadastroProps {
    navigate: (path: string) => void;
}

export function MenuCadastro({ navigate }: MenuCadastroProps) {
    const [registrationType, setRegistrationType] = useState<'cuidador' | 'paciente' | null>(null);
    const [message, setMessage] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    
    const [, setTermoType] = useState<'cuidador' | 'paciente'>('cuidador');

    const handleRegistration = (data: FormSchemaCuidador | FormSchemaPaciente) => {
        console.log(`Dados de ${registrationType} enviados:`, data);
        
        const typeLabel = registrationType === 'cuidador' ? 'Cuidador' : 'Paciente';
        setMessage(`Cadastro de ${typeLabel} realizado com sucesso! Redirecionando...`);

        if (registrationType == 'cuidador')
        setTimeout(() => {
            setMessage(''); 
            navigate('/menu-cuidador');
        }, 2000);
        else
        setTimeout(() => {
            setMessage(''); 
            navigate('/menu-paciente');
        }, 2000);
    };

    const handleTermoOpen = () => {
        setTermoType(registrationType === 'cuidador' ? 'cuidador' : 'paciente');
        setIsModalOpen(true);
    };
    
    const handleTermoClose = () => {
        setIsModalOpen(false);
    };

    const renderForm = () => {
    if (registrationType === 'cuidador') {
        return (
            <FormularioCuidador 
                onAdd={handleRegistration} 
                onTermoOpen={handleTermoOpen} 
            />
        );
    }
    if (registrationType === 'paciente') {
        return (
            <FormularioPaciente 
                onAdd={handleRegistration} 
                onTermoOpen={handleTermoOpen} 
            />
        );
    }
        
        return (
            <div className= "flex justify-center items-center min-h-screen">
                <div className="flex flex-col md:flex-row gap-8 justify-center items-center p-8 bg-white rounded-2xl shadow-xl max-w-4xl mx-auto border-t-8 border-gray-300">
                <button
                    onClick={() => setRegistrationType('cuidador')}
                    className="hover:cursor-pointer flex-1 w-full bg-indigo-600 text-white p-8 rounded-xl text-2xl font-bold hover:bg-indigo-700 transition-all transform hover:scale-[1.02] shadow-xl focus:outline-none focus:ring-4 focus:ring-indigo-300"
                >
                    Sou Cuidador
                    <p className="text-base font-normal mt-2 opacity-95">Responsável por acompanhar o paciente.</p>
                </button>
                <button
                    onClick={() => setRegistrationType('paciente')}
                    className="hover:cursor-pointer flex-1 w-full bg-teal-600 text-white p-8 rounded-xl text-2xl font-bold hover:bg-teal-700 transition-all transform hover:scale-[1.02] shadow-xl focus:outline-none focus:ring-4 focus:ring-teal-300"
                >
                    Sou Paciente
                    <p className="text-base font-normal mt-2 opacity-95">Para pacientes que se registram diretamente.</p>
                </button>
            </div>
            </div>
            
        );
    };

    return (
        <Layout>
                {message && (
                    <div className="bg-green-100 border-l-4 border-green-600 text-green-800 p-4 mb-8 rounded-lg shadow-lg max-w-4xl mx-auto animate-bounce" role="alert">
                        <p className="font-bold">✨ {message}</p>
                    </div>
                )}
                
                {registrationType && (
                    <div className="mb-8 max-w-4xl mx-auto">
                        <button
                            onClick={() => { setRegistrationType(null); setMessage(''); }}
                            className="hover:cursor-pointer text-gray-600 hover:text-indigo-600 flex items-center transition-colors text-base font-medium"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2"><path d="m15 18-6-6 6-6"/></svg>
                            Voltar para a Seleção
                        </button>
                    </div>
                )}
                
                {renderForm()}

            {isModalOpen && <Termo isOpen={isModalOpen} onClose={handleTermoClose} children={undefined} />}
        </Layout>
    );
}