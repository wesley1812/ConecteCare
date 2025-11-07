import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useCadastro } from "../context/cadastro-context";
import { formSchemaCuidador, type FormSchemaCuidador } from "../schemas/forms-schema";
import type { Cuidador } from "../types/interfaces";

interface FormularioCuidadorProps {
    onTermoOpen: () => void;
    onSuccess: () => void;
}

export function FormularioCuidador({ onTermoOpen, onSuccess }: FormularioCuidadorProps) {
    const { saveCuidador, iscpfCuidadorCadastrado } = useCadastro(); 
    
    const {
        register,
        handleSubmit,
        formState: { errors },
        setError,
    } = useForm<FormSchemaCuidador>({
        resolver: zodResolver(formSchemaCuidador),
        defaultValues: { aceitarTermo: false }
    });

    async function onSubmit({
      nome,
      idade,
      cpfCuidador,
      cpfPaciente,
      email,
      senha,
      telefoneContato,
      correlacaoPaciente,
      cepPaciente,
      cepCuidador,
      aceitarTermo
    } : FormSchemaCuidador): Promise<void> {
        if (iscpfCuidadorCadastrado(cpfCuidador)) {
            setError("cpfCuidador", {
                type: "manual",
                message: "Este cpfCuidador já está cadastrado como cuidador.",
            });
            return;
        }
        
        const cuidador: Cuidador = {
            id: crypto.randomUUID(),
            nome,
            idade,
            cpfCuidador,
            cpfPaciente,
            email,
            senha,
            telefoneContato,
            correlacaoPaciente,
            cepPaciente,
            cepCuidador,
            aceitarTermo,
        };
        await saveCuidador(cuidador);

        onSuccess();
    } 

    const inputClass = "w-full px-5 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-600 transition duration-200 ease-in-out shadow-sm text-base";
    const labelClass = "block text-sm font-semibold text-gray-700 mb-1";
    const errorClass = "text-red-600 text-xs mt-1 font-medium";
    const sectionTitleClass = "text-xl font-bold text-indigo-700 border-b pb-2 mb-4";

    return (
        <form
            onSubmit={handleSubmit(onSubmit)}
            className="bg-white p-6 md:p-10 rounded-2xl shadow-2xl space-y-8 max-w-full md:max-w-5xl mx-auto border border-indigo-200 font-inter"
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
            
            <h2 className="text-4xl font-extrabold text-indigo-800 text-center mb-8">
                Cadastro de Cuidador
            </h2>

            <div className="p-5 border border-gray-100 rounded-xl bg-indigo-50/50 space-y-4">
                <h3 className={sectionTitleClass}>1. Dados Pessoais, Contato e Endereço</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    
                    <div className="md:col-span-2">
                        <label htmlFor="nome" className={labelClass}>Nome Completo:</label>
                        <input type="text" id="nome" {...register("nome")} className={inputClass} placeholder="Seu nome completo" />
                        {errors.nome && <p className={errorClass}>{errors.nome.message}</p>}
                    </div>

                    <div>
                        <label htmlFor="cpfCuidador" className={labelClass}>cpfCuidador do Cuidador:</label>
                        <input type="text" id="cpfCuidador" {...register("cpfCuidador")} placeholder="000.000.000-00" className={inputClass} />
                        {errors.cpfCuidador && <p className={errorClass}>{errors.cpfCuidador.message}</p>}
                    </div>

                    <div>
                        <label htmlFor="idade" className={labelClass}>Idade:</label>
                        <input type="number" id="idade" {...register("idade", { valueAsNumber: true })} className={inputClass} placeholder="Ex: 35" />
                        {errors.idade && <p className={errorClass}>{errors.idade.message}</p>}
                    </div>
                    
                    <div>
                        <label htmlFor="telefoneContato" className={labelClass}>telefoneContato para Contato:</label>
                        <input type="tel" id="telefoneContato" {...register("telefoneContato")} placeholder="(99) 99999-9999" className={inputClass} />
                        {errors.telefoneContato && <p className={errorClass}>{errors.telefoneContato.message}</p>}
                    </div>

                    <div>
                        <label htmlFor="cepCuidador" className={labelClass}>CEP da Sua Residência:</label>
                        <input type="text" id="cepCuidador" {...register("cepCuidador")} placeholder="00000-000" className={inputClass} />
                        {errors.cepCuidador && <p className={errorClass}>{errors.cepCuidador.message}</p>}
                    </div>
                </div>
            </div>

            <div className="p-5 border border-gray-100 rounded-xl bg-indigo-50/50 space-y-4">
                <h3 className={sectionTitleClass}>2. Dados de Acesso à Plataforma</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    
                    <div>
                        <label htmlFor="email" className={labelClass}>Email (Será seu Login):</label>
                        <input type="email" id="email" {...register("email")} className={inputClass} placeholder="seu.email@exemplo.com" />
                        {errors.email && <p className={errorClass}>{errors.email.message}</p>}
                    </div>

                    <div>
                        <label htmlFor="senha" className={labelClass}>Senha:</label>
                        <input type="password" id="senha" {...register("senha")} className={inputClass} placeholder="Mínimo 6 caracteres" />
                        {errors.senha && <p className={errorClass}>{errors.senha.message}</p>}
                    </div>
                </div>
            </div>

            <div className="p-5 border border-gray-100 rounded-xl bg-indigo-50/50 space-y-4">
                <h3 className={sectionTitleClass}>3. Paciente Associado</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    
                    <div>
                        <label htmlFor="cpfPaciente" className={labelClass}>cpfCuidador do Paciente Cuidado:</label>
                        <input type="text" id="cpfPaciente" {...register("cpfPaciente")} placeholder="000.000.000-00" className={inputClass} />
                        {errors.cpfPaciente && <p className={errorClass}>{errors.cpfPaciente.message}</p>}
                    </div>

                    <div>
                        <label htmlFor="cepPaciente" className={labelClass}>CEP da Residência do Paciente:</label>
                        <input type="text" id="cepPaciente" {...register("cepPaciente")} placeholder="00000-000" className={inputClass} />
                        {errors.cepPaciente && <p className={errorClass}>{errors.cepPaciente.message}</p>}
                    </div>
                    
                    <div className="md:col-span-2">
                        <label htmlFor="correlacaoPaciente" className={labelClass}>Relação com o Paciente (Ex: Filho, Cônjuge, Amigo):</label>
                        <input type="text" id="correlacaoPaciente" {...register("correlacaoPaciente")} className={inputClass} placeholder="Qual seu grau de correlacaoPaciente ou relação?" />
                        {errors.correlacaoPaciente && <p className={errorClass}>{errors.correlacaoPaciente.message}</p>}
                    </div>
                </div>
            </div>


            <div className="pt-6 border-t border-gray-200">
                <h3 className="text-xl font-semibold text-gray-900 mb-4">4. Termo de Compromisso</h3>
                
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <button
                        type="button"
                        onClick={onTermoOpen}
                        className="w-full sm:w-auto flex-shrink-0 bg-indigo-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-indigo-700 transition-colors shadow-md transform hover:scale-[1.02] text-center"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 inline mr-2" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 4a1 1 0 100 2h6a1 1 0 100-2H7z" clipRule="evenodd" />
                        </svg>
                        Ler Termo de Compromisso
                    </button>
                    
                    <div className="flex items-center flex-shrink-0"> 
                        <input
                            type="checkbox"
                            id="aceitarTermoCuidador"
                            {...register("aceitarTermo")}
                            className="mr-3 h-5 w-5 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500 cursor-pointer flex-shrink-0"
                        />
                        <label htmlFor="aceitarTermoCuidador" className="text-sm text-gray-700 select-none font-medium cursor-pointer">
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
                Finalizar Cadastro de Cuidador
            </button>
        </form>
    );
}