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
    const { saveCuidador } = useCadastro();
    
    const {
        register,
        handleSubmit,
        formState: { errors }
    } = useForm<FormSchemaCuidador>({
        resolver: zodResolver(formSchemaCuidador),
    });

    async function onSubmit({
      nome,
      idade,
      cpf,
      cpfPaciente,
      email,
      telefone,
      parentesco,
      residencia,
      foto,
      aceitarTermo
    } : FormSchemaCuidador): Promise<void> {
        const cuidador: Cuidador = {
            id: crypto.randomUUID(),
            nome,
            idade,
            cpf,
            cpfPaciente,
            email,
            telefone,
            parentesco,
            residencia,
            foto,
            aceitarTermo,
    };
        await saveCuidador(cuidador);

        onSuccess();
    }   

    const inputClass = "w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 transition duration-150 ease-in-out";
    const labelClass = "block text-sm font-medium text-gray-700 mb-2";
    const errorClass = "text-red-500 text-xs mt-1";

    return (
        <form
            onSubmit={handleSubmit(onSubmit)}
            className="bg-white p-8 rounded-xl shadow-2xl space-y-6 max-w-4xl mx-auto border border-indigo-100"
        >
            <h2 className="text-3xl font-bold text-indigo-700 mb-6 border-b pb-3">Cadastro de Cuidador</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                <div>
                    <label htmlFor="nome" className={labelClass}>Nome Completo:</label>
                    <input type="text" id="nome" {...register("nome")} className={inputClass} />
                    {errors.nome && <p className={errorClass}>{errors.nome.message}</p>}
                </div>

                <div>
                    <label htmlFor="idade" className={labelClass}>Idade:</label>
                    <input type="number" id="idade" {...register("idade", { valueAsNumber: true })} className={inputClass} />
                    {errors.idade && <p className={errorClass}>{errors.idade.message}</p>}
                </div>

                <div>
                    <label htmlFor="cpf" className={labelClass}>CPF do Cuidador:</label>
                    <input type="text" id="cpf" {...register("cpf")} placeholder="XXX.XXX.XXX-XX" className={inputClass} />
                    {errors.cpf && <p className={errorClass}>{errors.cpf.message}</p>}
                </div>

                <div>
                    <label htmlFor="cpfPaciente" className={labelClass}>CPF do Paciente:</label>
                    <input type="text" id="cpfPaciente" {...register("cpfPaciente")} placeholder="XXX.XXX.XXX-XX" className={inputClass} />
                    {errors.cpfPaciente && <p className={errorClass}>{errors.cpfPaciente.message}</p>}
                </div>

                <div>
                    <label htmlFor="email" className={labelClass}>Email do Cuidador:</label>
                    <input type="email" id="email" {...register("email")} className={inputClass} />
                    {errors.email && <p className={errorClass}>{errors.email.message}</p>}
                </div>

                <div>
                    <label htmlFor="parentesco" className={labelClass}>Relação com o Paciente:</label>
                    <input type="text" id="parentesco" {...register("parentesco")} className={inputClass} />
                    {errors.parentesco && <p className={errorClass}>{errors.parentesco.message}</p>}
                </div>

                <div>
                    <label htmlFor="telefone" className={labelClass}>Telefone para Contato:</label>
                    <input type="tel" id="telefone" {...register("telefone")} placeholder="(XX) XXXXX-XXXX" className={inputClass} />
                    {errors.telefone && <p className={errorClass}>{errors.telefone.message}</p>}
                </div>

                <div>
                    <label htmlFor="residencia" className={labelClass}>Comprovante de Residência (Foto):</label>
                    <input type="file" id="residencia" {...register("residencia")} accept="image/*" className={inputClass} />
                    {errors.residencia && <p className={errorClass}>{errors.residencia.message}</p>}
                </div>
                
                <div>
                    <label htmlFor="foto" className={labelClass}>Foto 3x4:</label>
                    <input type="file" id="foto" {...register("foto")} accept="image/*" className={inputClass} />
                    {errors.foto && <p className={errorClass}>{errors.foto.message}</p>}
                </div>
            </div>

            <div className="mt-8 border-t pt-6">
                <h3 className="text-xl font-semibold text-gray-900 mb-4">Termo de Compromisso do Cuidador</h3>
                <button
                    type="button"
                    onClick={onTermoOpen}
                    className="hover:cursor-pointer bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700 transition-colors shadow-md"
                >
                    Ler Termo de Compromisso
                </button>
                <div className="mt-4 flex items-center">
                    <input
                        type="checkbox"
                        id="aceitarTermoCuidador"
                        {...register("aceitarTermo")}
                        className="mr-3 h-4 w-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                    />
                    <label htmlFor="aceitarTermoCuidador" className="text-sm text-gray-700 select-none">
                        Declaro que li e concordo com o Termo de Compromisso.
                    </label>
                </div>
                {errors.aceitarTermo && <p className={errorClass}>{errors.aceitarTermo.message}</p>}
            </div>

            <button
                type="submit"
                className="hover:cursor-pointer w-full mt-8 bg-green-600 text-white py-3 rounded-lg font-semibold hover:bg-green-700 transition-colors text-lg shadow-xl"
            >
                Enviar Cadastro de Cuidador
            </button>
        </form>
    );
}