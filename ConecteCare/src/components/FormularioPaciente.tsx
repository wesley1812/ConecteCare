import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useCadastro } from "../context/cadastro-context";
import { formSchemaPaciente, type FormSchemaPaciente } from "../schemas/forms-schema";
import type { Paciente } from "../types/interfaces";

interface FormularioPacienteProps {
    onTermoOpen: () => void;
}

export function FormularioPaciente({ onTermoOpen }: FormularioPacienteProps) {
    const { savePaciente } = useCadastro();
    
    const {
        register,
        handleSubmit,
        formState: { errors }
    } = useForm<FormSchemaPaciente>({
        resolver: zodResolver(formSchemaPaciente),
    });

    async function onSubmit({
        nome,
        idade,
        cpfPaciente,
        email,
        telefone,
        patologia,
        aceitarTermo
    }: FormSchemaPaciente) : Promise<void> {
        const paciente: Paciente = {
            id: crypto.randomUUID(),
            nome,
            idade,
            cpfPaciente,
            email,
            telefone,
            patologia,
            aceitarTermo
        };
            await savePaciente(paciente);
    }

    const inputClass = "w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500 transition duration-150 ease-in-out";
    const labelClass = "block text-sm font-medium text-gray-700 mb-2";
    const errorClass = "text-red-500 text-xs mt-1";

    return (
        <form
            onSubmit={handleSubmit(onSubmit)}
            className="bg-white p-8 rounded-xl shadow-2xl space-y-6 max-w-4xl mx-auto border border-teal-100"
        >
            <h2 className="text-3xl font-bold text-teal-700 mb-6 border-b pb-3">Cadastro de Paciente</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                    <label htmlFor="paciente-nome" className={labelClass}>Nome Completo:</label>
                    <input type="text" id="paciente-nome" {...register("nome")} className={inputClass} />
                    {errors.nome && <p className={errorClass}>{errors.nome.message}</p>}
                </div>

                <div>
                    <label htmlFor="paciente-idade" className={labelClass}>Idade:</label>
                    <input type="number" id="paciente-idade" {...register("idade", { valueAsNumber: true })} className={inputClass} />
                    {errors.idade && <p className={errorClass}>{errors.idade.message}</p>}
                </div>

                <div>
                    <label htmlFor="paciente-cpf" className={labelClass}>CPF:</label>
                    <input type="text" id="paciente-cpf" {...register("cpfPaciente")} placeholder="XXX.XXX.XXX-XX" className={inputClass} />
                    {errors.cpfPaciente && <p className={errorClass}>{errors.cpfPaciente.message}</p>}
                </div>

                <div>
                    <label htmlFor="paciente-email" className={labelClass}>Email:</label>
                    <input type="email" id="paciente-email" {...register("email")} className={inputClass} />
                    {errors.email && <p className={errorClass}>{errors.email.message}</p>}
                </div>

                <div>
                    <label htmlFor="paciente-telefone" className={labelClass}>Telefone:</label>
                    <input type="tel" id="paciente-telefone" {...register("telefone")} placeholder="(XX) XXXXX-XXXX" className={inputClass} />
                    {errors.telefone && <p className={errorClass}>{errors.telefone.message}</p>}
                </div>

                <div>
                    <label htmlFor="paciente-patologia" className={labelClass}>Patologia:</label>
                    <input type="text" id="paciente-patologia" {...register("patologia")} className={inputClass} />
                    {errors.patologia && <p className={errorClass}>{errors.patologia.message}</p>}
                </div>
            </div>

            <div className="mt-8 border-t pt-6">
                <h3 className="text-xl font-semibold text-gray-900 mb-4">Termo de Consentimento do Paciente</h3>
                <button
                    type="button"
                    onClick={onTermoOpen}
                    className="hover:cursor-pointer bg-teal-600 text-white px-6 py-2 rounded-lg hover:bg-teal-700 transition-colors shadow-md"
                >
                    Ler Termo de Consentimento
                </button>
                <div className="mt-4 flex items-center">
                    <input
                        type="checkbox"
                        id="aceitarTermoPaciente"
                        {...register("aceitarTermo")}
                        className="mr-3 h-4 w-4 text-teal-600 border-gray-300 rounded focus:ring-teal-500"
                    />
                    <label htmlFor="aceitarTermoPaciente" className="text-sm text-gray-700 select-none">
                        Declaro que li e concordo com o Termo de Consentimento.
                    </label>
                </div>
                {errors.aceitarTermo && <p className={errorClass}>{errors.aceitarTermo.message}</p>}
            </div>

            <button
                type="submit"
                className="hover:cursor-pointer w-full mt-8 bg-green-600 text-white py-3 rounded-lg font-semibold hover:bg-green-700 transition-colors text-lg shadow-xl"
            >
                Enviar Cadastro de Paciente
            </button>
        </form>
    );
}