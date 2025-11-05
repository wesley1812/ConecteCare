import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useConsultas } from "../context/consultas-context";
import {
    type FormSchemaAgendar, formSchemaAgendar,
    ESPECIALIDADES_DISPONIVEIS, MEDICOS_DISPONIVEIS,
    type FormSchemaRemarcar, formSchemaRemarcar,
    type FormSchemaCancelar, formSchemaCancelar
} from "../schemas/forms-consulta-schema";
import type { Consulta } from "../types/interfaces";

const inputClass = "w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 transition duration-150 ease-in-out";
const labelClass = "block text-sm font-medium text-gray-700 mb-2";
const errorClass = "text-red-500 text-xs mt-1";


interface FormularioAgendarProps {
    cpfPaciente: string;
    onSuccess: (msg: string, type?: 'success' | 'error') => void;
}

function FormularioAgendar({ cpfPaciente, onSuccess }: FormularioAgendarProps) {
    const { agendarConsulta } = useConsultas();

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<FormSchemaAgendar>({
        resolver: zodResolver(formSchemaAgendar),
        defaultValues: { doctorName: '', especialidade: '', data: '', horario: '' }
    });

    async function onSubmit(data: FormSchemaAgendar): Promise<void> {
        try {
            const doctorSpecialty = data.especialidade;

            const novaConsulta: Consulta = {
                id: crypto.randomUUID(),
                cpfPaciente,
                type: data.especialidade,
                doctorName: data.doctorName,
                doctorSpecialty: doctorSpecialty,
                date: data.data,
                time: data.horario,
            };
            await agendarConsulta(novaConsulta);
            onSuccess("Consulta agendada com sucesso!", 'success');
        } catch (error) {
            console.error("Erro ao agendar consulta:", error);
            onSuccess("Falha ao agendar consulta. Tente novamente.", 'error');
        }
    }

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="bg-white p-8 rounded-xl shadow-lg space-y-6 border border-indigo-100">
            <h3 className="text-2xl font-bold text-indigo-700 mb-4">Agendar Nova Consulta</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

                <div>
                    <label htmlFor="especialidade" className={labelClass}>Especialidade:</label>
                    <select id="especialidade" {...register("especialidade")} className={inputClass}>
                        <option value="">Selecione uma Especialidade</option>
                        {ESPECIALIDADES_DISPONIVEIS.map(esp => (
                            <option key={esp} value={esp}>{esp}</option>
                        ))}
                    </select>
                    {errors.especialidade && <p className={errorClass}>{errors.especialidade.message}</p>}
                </div>

                <div>
                    <label htmlFor="doctorName" className={labelClass}>Médico:</label>
                    <select id="doctorName" {...register("doctorName")} className={inputClass}>
                        <option value="">Selecione um Médico</option>
                        {MEDICOS_DISPONIVEIS.map(medico => (
                            <option key={medico} value={medico}>{medico}</option>
                        ))}
                    </select>
                    {errors.doctorName && <p className={errorClass}>{errors.doctorName.message}</p>}
                </div>

                <div>
                    <label htmlFor="data" className={labelClass}>Data:</label>
                    <input type="date" id="data" {...register("data")} className={inputClass} />
                    {errors.data && <p className={errorClass}>{errors.data.message}</p>}
                </div>
                <div>
                    <label htmlFor="horario" className={labelClass}>Hora:</label>
                    <input type="time" id="horario" {...register("horario")} className={inputClass} />
                    {errors.horario && <p className={errorClass}>{errors.horario.message}</p>}
                </div>
            </div>

            <button
                type="submit"
                className="w-full mt-6 bg-indigo-600 text-white py-3 rounded-lg font-semibold hover:bg-indigo-700 transition-colors text-lg shadow-md"
            >
                Confirmar Agendamento
            </button>
        </form>
    );
}

interface FormularioRemarcarProps {
    selectedConsulta: Consulta;
    onSuccess: (msg: string, type?: 'success' | 'error') => void;
}

function FormularioRemarcar({ selectedConsulta, onSuccess }: FormularioRemarcarProps) {
    const { remarcarConsulta } = useConsultas();

    const defaultEspecialidade = selectedConsulta.type || selectedConsulta.doctorSpecialty || '';
    const defaultDoctorName = selectedConsulta.doctorName || '';

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<FormSchemaRemarcar>({
        resolver: zodResolver(formSchemaRemarcar),
        defaultValues: {
            doctorName: defaultDoctorName,
            especialidade: defaultEspecialidade,
            novaData: selectedConsulta.date,
            novoHorario: selectedConsulta.time,
        },
    });

    async function onSubmit(data: FormSchemaRemarcar): Promise<void> {
        try {
            const doctorSpecialty = data.especialidade;

            const consultaAtualizada: Consulta = {
                ...selectedConsulta,
                type: data.especialidade,
                doctorName: data.doctorName,
                doctorSpecialty: doctorSpecialty,
                date: data.novaData,
                time: data.novoHorario,
            };
            await remarcarConsulta(consultaAtualizada);
            onSuccess("Consulta remarcada com sucesso!", 'success');
        } catch (error) {
            console.error("Erro ao remarcar consulta:", error);
            onSuccess("Falha ao remarcar consulta. Tente novamente.", 'error');
        }
    }

    const remarcarInputClass = "w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 transition duration-150 ease-in-out";

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="bg-white p-8 rounded-xl shadow-lg space-y-6 border border-orange-100">
            <h3 className="text-2xl font-bold text-orange-700 mb-4">Remarcar Consulta</h3>
            <p className="text-gray-600 mb-4">Consulta atual com **{selectedConsulta.doctorName}** ({selectedConsulta.doctorSpecialty}).</p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

                <div>
                    <label htmlFor="especialidade-remarcar" className={labelClass}>Especialidade:</label>
                    <select id="especialidade-remarcar" {...register("especialidade")} className={remarcarInputClass}>
                        <option value="">Selecione uma Especialidade</option>
                        {ESPECIALIDADES_DISPONIVEIS.map(esp => (
                            <option key={esp} value={esp}>{esp}</option>
                        ))}
                    </select>
                    {errors.especialidade && <p className={errorClass}>{errors.especialidade.message}</p>}
                </div>

                <div>
                    <label htmlFor="doctorName-remarcar" className={labelClass}>Médico:</label>
                    <select id="doctorName-remarcar" {...register("doctorName")} className={remarcarInputClass}>
                        <option value="">Selecione um Médico</option>
                        {MEDICOS_DISPONIVEIS.map(medico => (
                            <option key={medico} value={medico}>{medico}</option>
                        ))}
                    </select>
                    {errors.doctorName && <p className={errorClass}>{errors.doctorName.message}</p>}
                </div>

                <div>
                    <label htmlFor="novaData" className={labelClass}>Nova Data:</label>
                    <input type="date" id="novaData" {...register("novaData")} className={remarcarInputClass} />
                    {errors.novaData && <p className={errorClass}>{errors.novaData.message}</p>}
                </div>
                <div>
                    <label htmlFor="novoHorario" className={labelClass}>Nova Hora:</label>
                    <input type="time" id="novoHorario" {...register("novoHorario")} className={remarcarInputClass} />
                    {errors.novoHorario && <p className={errorClass}>{errors.novoHorario.message}</p>}
                </div>
            </div>

            <button
                type="submit"
                className="w-full mt-6 bg-orange-600 text-white py-3 rounded-lg font-semibold hover:bg-orange-700 transition-colors text-lg shadow-md"
            >
                Confirmar Remarcação
            </button>
        </form>
    );
}


interface FormularioCancelarProps {
    selectedConsulta: Consulta;
    onSuccess: (msg: string, type?: 'success' | 'error') => void;
}

function FormularioCancelar({ selectedConsulta, onSuccess }: FormularioCancelarProps) {
    const { desmarcarConsulta } = useConsultas();

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<FormSchemaCancelar>({
        resolver: zodResolver(formSchemaCancelar),
    });

    async function onSubmit(): Promise<void> {
        try {
            await desmarcarConsulta(selectedConsulta.id);
            onSuccess("Consulta cancelada com sucesso!", 'success');
        } catch (error) {
            console.error("Erro ao cancelar consulta:", error);
            onSuccess("Falha ao cancelar consulta. Tente novamente.", 'error');
        }
    }

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="bg-white p-8 rounded-xl shadow-lg space-y-6 border border-red-100">
            <h3 className="text-2xl font-bold text-red-700 mb-4">Confirmar Cancelamento</h3>
            <div className="bg-red-50 p-4 border-l-4 border-red-400 text-red-700 mb-6 rounded-md">
                <p className="font-semibold">Você está prestes a cancelar a seguinte consulta:</p>
                <ul className="list-disc list-inside ml-4 mt-2 text-sm">
                    <li>Tipo: {selectedConsulta.type}</li>
                    <li>Médico:  {selectedConsulta.doctorName}</li>
                    <li>Especialidade:  {selectedConsulta.doctorSpecialty}</li>
                    <li>Data/Hora: {selectedConsulta.date} às {selectedConsulta.time}</li>
                </ul>
            </div>

            <div>
                <label htmlFor="razaoCancelamento" className={labelClass}>Razão do Cancelamento (Opcional):</label>
                <textarea id="razaoCancelamento" {...register("razaoCancelamento")} rows={3} className={`${inputClass} resize-none`} />
                {errors.razaoCancelamento && <p className={errorClass}>{errors.razaoCancelamento.message}</p>}
            </div>

            <button
                type="submit"
                className="w-full mt-6 bg-red-600 text-white py-3 rounded-lg font-semibold hover:cursor-pointer hover:bg-red-700 transition-colors text-lg shadow-md"
            >
                Sim, Cancelar Consulta
            </button>
        </form>
    );
}

interface FormulariosConsultaProps {
    formType: ActiveForm;
    cpfPaciente: string;
    selectedConsulta: Consulta | null;
    onSuccess: (msg: string, type?: 'success' | 'error') => void;
}

export type ActiveForm = 'agendar' | 'remarcar' | 'cancelar' | null;

export function FormulariosConsulta({ formType, cpfPaciente, selectedConsulta, onSuccess }: FormulariosConsultaProps) {

    const renderForm = () => {
        if (formType === 'agendar') {
            return <FormularioAgendar cpfPaciente={cpfPaciente} onSuccess={onSuccess} />;
        }

        if (!selectedConsulta) {
            return <div className="p-6 bg-red-100 text-red-700 rounded-lg">Erro: Nenhuma consulta selecionada para esta ação.</div>;
        }

        if (formType === 'remarcar') {
            return <FormularioRemarcar selectedConsulta={selectedConsulta} onSuccess={onSuccess} />;
        }

        if (formType === 'cancelar') {
            return <FormularioCancelar selectedConsulta={selectedConsulta} onSuccess={onSuccess} />;
        }

        return null;
    };

    return (
        <div className="bg-white p-8 rounded-xl shadow-2xl">
            {renderForm()}
        </div>
    );
}