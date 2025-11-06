import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useCadastro } from "../context/cadastro-context.tsx";
import { type FormSchemaPaciente, formSchemaPaciente } from "../schemas/forms-schema";
import type { Paciente } from "../types/interfaces"; 


interface FormularioPacienteProps {
    onTermoOpen: () => void;
    onSuccess: () => void;
}

export function FormularioPaciente({ onTermoOpen, onSuccess }: FormularioPacienteProps) {
    const { savePaciente, isCpfPacienteCadastrado } = useCadastro();
    
    const {
        register,
        handleSubmit,
        formState: { errors },
        setError,
    } = useForm<FormSchemaPaciente>({
        resolver: zodResolver(formSchemaPaciente),
        defaultValues: { aceitarTermo: false }
    });

    async function onSubmit({
        nome,
        idade,
        cpfPaciente,
        email,
        senha,
        telefone,
        patologia,
        aceitarTermo,
        cepPaciente
    }: FormSchemaPaciente) : Promise<void> {
        if (isCpfPacienteCadastrado(cpfPaciente)) {
            setError("cpfPaciente", {
                type: "manual",
                message: "Este CPF já está cadastrado como paciente.",
            });
            return; 
        }
        
        
        const paciente: Paciente = {
            id: crypto.randomUUID(),
            nome,
            idade,
            cpfPaciente,
            email,
            senha,
            telefone,
            patologia,
            cepPaciente,
            aceitarTermo
        };
        await savePaciente(paciente);
        
        onSuccess();
    }

    const inputClass = "w-full px-5 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-600 transition duration-200 ease-in-out shadow-sm text-base";
    const labelClass = "block text-sm font-semibold text-gray-700 mb-1";
    const errorClass = "text-red-600 text-xs mt-1 font-medium";
    const sectionTitleClass = "text-xl font-bold text-teal-700 border-b pb-2 mb-4";

    return (
        <form
            onSubmit={handleSubmit(onSubmit)}
            className="bg-white p-6 md:p-10 rounded-2xl shadow-2xl space-y-8 max-w-full md:max-w-5xl mx-auto border border-teal-200 font-inter"
        >
            <script src="https://cdn.tailwindcss.com"></script>
            <style>
                {`
                    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@100..900&display=swap');
                    .font-inter {
                        font-family: 'Inter', sans-serif;
                    }
                `}
            </style>
            
            <h2 className="text-4xl font-extrabold text-teal-800 text-center mb-8">
                Cadastro de Paciente
            </h2>

            <div className="p-5 border border-gray-100 rounded-xl bg-teal-50/50 space-y-4">
                <h3 className={sectionTitleClass}>1. Dados Pessoais e Contato</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    
                    <div className="md:col-span-2">
                        <label htmlFor="paciente-nome" className={labelClass}>Nome Completo do Paciente:</label>
                        <input type="text" id="paciente-nome" {...register("nome")} className={inputClass} placeholder="Nome completo" />
                        {errors.nome && <p className={errorClass}>{errors.nome.message}</p>}
                    </div>

                    <div>
                        <label htmlFor="paciente-cpf" className={labelClass}>CPF do Paciente:</label>
                        <input type="text" id="paciente-cpf" {...register("cpfPaciente")} placeholder="000.000.000-00" className={inputClass} />
                        {errors.cpfPaciente && <p className={errorClass}>{errors.cpfPaciente.message}</p>}
                    </div>

                    <div>
                        <label htmlFor="paciente-idade" className={labelClass}>Idade:</label>
                        <input type="number" id="paciente-idade" {...register("idade", { valueAsNumber: true })} className={inputClass} placeholder="Ex: 72" />
                        {errors.idade && <p className={errorClass}>{errors.idade.message}</p>}
                    </div>
                    
                    <div>
                        <label htmlFor="paciente-telefone" className={labelClass}>Telefone para Contato:</label>
                        <input type="tel" id="paciente-telefone" {...register("telefone")} placeholder="(99) 99999-9999" className={inputClass} />
                        {errors.telefone && <p className={errorClass}>{errors.telefone.message}</p>}
                    </div>

                    <div>
                        <label htmlFor="paciente-cep" className={labelClass}>CEP da Residência:</label>
                        <input type="text" id="paciente-cep" {...register("cepPaciente")} placeholder="00000-000" className={inputClass} />
                        {errors.cepPaciente && <p className={errorClass}>{errors.cepPaciente.message}</p>}
                    </div>
                </div>
            </div>

            <div className="p-5 border border-gray-100 rounded-xl bg-teal-50/50 space-y-4">
                <h3 className={sectionTitleClass}>2. Dados Clínicos e de Acesso à Plataforma</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    
                    <div className="md:col-span-2">
                        <label htmlFor="paciente-patologia" className={labelClass}>Patologia Principal ou Condição Crônica:</label>
                        <input type="text" id="paciente-patologia" {...register("patologia")} className={inputClass} placeholder="Ex: Doença de Alzheimer, Diabetes, Hipertensão" />
                        {errors.patologia && <p className={errorClass}>{errors.patologia.message}</p>}
                    </div>

                    <div>
                        <label htmlFor="paciente-email" className={labelClass}>Email (Será o Login do Paciente):</label>
                        <input type="email" id="paciente-email" {...register("email")} className={inputClass} placeholder="email.de.acesso@exemplo.com" />
                        {errors.email && <p className={errorClass}>{errors.email.message}</p>}
                    </div>

                    <div>
                        <label htmlFor="paciente-senha" className={labelClass}>Senha:</label>
                        <input type="password" id="paciente-senha" {...register("senha")} className={inputClass} placeholder="Mínimo 6 caracteres" />
                        {errors.senha && <p className={errorClass}>{errors.senha.message}</p>}
                    </div>
                </div>
            </div>

            <div className="pt-6 border-t border-gray-200">
                <h3 className="text-xl font-semibold text-gray-900 mb-4">3. Termo de Consentimento</h3>
                
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <button
                        type="button"
                        onClick={onTermoOpen}
                        className="w-full sm:w-auto flex-shrink-0 bg-teal-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-teal-700 transition-colors shadow-md transform hover:scale-[1.02] text-center"
                    >
                         <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 inline mr-2" viewBox="0 0 20 20" fill="currentColor">
                             <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 4a1 1 0 100 2h6a1 1 0 100-2H7z" clipRule="evenodd" />
                         </svg>
                        Ler Termo de Consentimento
                    </button>
                    
                    <div className="flex items-center flex-shrink-0"> 
                        <input
                            type="checkbox"
                            id="aceitarTermoPaciente"
                            {...register("aceitarTermo")}
                            className="mr-3 h-5 w-5 text-teal-600 border-gray-300 rounded focus:ring-teal-500 cursor-pointer flex-shrink-0"
                        />
                        <label htmlFor="aceitarTermoPaciente" className="text-sm text-gray-700 select-none font-medium cursor-pointer">
                            Declaro que li e concordo.
                        </label>
                    </div>
                </div>
                {errors.aceitarTermo && <p className={`${errorClass} mt-2 text-sm`}>{errors.aceitarTermo.message}</p>}
            </div>

            <button
                type="submit"
                className="hover:cursor-pointer w-full mt-8 bg-green-600 text-white py-3 rounded-lg font-bold hover:bg-green-700 transition-all text-xl shadow-xl hover:shadow-2xl tracking-wide transform hover:-translate-y-0.5"
            >
                Finalizar Cadastro de Paciente
            </button>
        </form>
    );
}