import { useState, useMemo } from "react";
import { useForm, type SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod"; 

import { useConsultas } from "../context/consultas-context";
import type { Consulta, Medico } from "../types/interfaces";
import type { FormSchemaAgendar, FormSchemaRemarcar, FormSchemaCancelar } from "../schemas/forms-consulta-schema";


interface SelectOption { 
    value: string; 
    label: string; 
}

// PLACEHOLDERS para simular dados de lookup
const ESPECIALIDADES: SelectOption[] = [
    { value: "ClinicaGeral", label: "Clínica Geral" },
    { value: "Fisioterapia", label: "Fisioterapia" },
    { value: "Cardiologia", label: "Cardiologia" },
];

const MEDICOS: Medico[] = [
    { id: "doc1", nome: "Dra. Beatriz Claudino Rosa", especialidade: "ClinicaGeral" },
    { id: "doc2", nome: "Dra. Clara Rocha", especialidade: "Fisioterapia" },
    { id: "doc3", nome: "Dr. Lucas Mendes", especialidade: "Cardiologia" },
    { id: "doc4", nome: "Dr(a). Maria Oliveira", especialidade: "Fisioterapia" },
];

// ----------------------------------------------------------------------
// TIPOS DE FORMULÁRIO (Substituir por Schemas Zod Reais)
// ----------------------------------------------------------------------

// Placeholder Resolver (Ajuste para usar zodResolver real quando os schemas estiverem prontos)
const placeholderResolver = (data: any) => ({ values: data, errors: {} }); 

// ----------------------------------------------------------------------
// COMPONENTES DE VISUALIZAÇÃO E UTILIDADE
// ----------------------------------------------------------------------

export const CalendarIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-indigo-500 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
    </svg>
);

export function CardConsulta({ appointment, onAction }: { appointment: Consulta, onAction: (action: 'remarcar' | 'cancelar', c: Consulta) => void }) {
    const statusText = "Agendada"; 

    return (
        <div className="bg-white p-5 rounded-xl shadow-lg border-l-4 border-indigo-500">
            <div className="flex items-start justify-between mb-3">
                <div className="flex items-center">
                    <CalendarIcon />
                    <h3 className="text-xl font-bold text-gray-800">{appointment.type}</h3>
                </div>
                <div className="text-xs font-medium text-white bg-green-500 px-3 py-1 rounded-full">{statusText}</div>
            </div>

            <div className="space-y-2 text-gray-600 text-sm pl-9">
                <p><strong className="font-medium text-gray-700">Data:</strong> {appointment.date} às {appointment.time}</p>
                <p><strong className="font-medium text-gray-700">Profissional:</strong> {appointment.doctorName || 'Não Informado'} ({appointment.doctorSpecialty || 'N/A'})</p>
            </div>

            <div className="flex justify-end space-x-3 mt-4 border-t pt-3">
                <button
                    onClick={() => onAction('remarcar', appointment)}
                    className="text-sm text-indigo-600 hover:text-indigo-800 font-medium transition-colors"
                >
                    Remarcar
                </button>
                <button
                    onClick={() => onAction('cancelar', appointment)}
                    className="text-sm text-red-600 hover:text-red-800 font-medium transition-colors"
                >
                    Cancelar
                </button>
            </div>
        </div>
    );
}

// ----------------------------------------------------------------------
// COMPONENTES DE FORMULÁRIO
// ----------------------------------------------------------------------

const inputClass = "w-full px-4 py-2 border rounded-lg focus:ring-indigo-500 focus:border-indigo-500";
const errorClass = "text-red-600 text-sm mt-1";

// --- Form: Agendar Nova Consulta ---
export function AgendarForm({ cpfPaciente, onSuccess }: { cpfPaciente: string, onSuccess: (msg: string) => void }) {
    const { agendarConsulta } = useConsultas();
    const [error, setError] = useState<string | null>(null);

    const { register, handleSubmit, watch, formState: { errors, isSubmitting } } = useForm<FormSchemaAgendar>({ 
        resolver: placeholderResolver as any 
    });

    const selectedSpecialty = watch('specialty');
    const availableDoctors = useMemo(() => {
        return PLACEHOLDER_DOCTORS.filter(doc => doc.especialidade === selectedSpecialty);
    }, [selectedSpecialty]);
    
    const onSubmit: SubmitHandler<FormSchemaAgendar> = async (data) => {
        const { date, time, specialty, doctorId } = data;
        
        const selectedDoctor = PLACEHOLDER_DOCTORS.find(d => d.id === doctorId);
        const selectedSpecialtyLabel = PLACEHOLDER_SPECIALTIES.find(s => s.value === specialty)?.label;

        if (!selectedDoctor || !selectedSpecialtyLabel) {
             setError("Erro de seleção. Tente novamente.");
             return;
        }

        const novaConsulta: Consulta = {
            id: randomUUID(), // ID Gerado com randomUUID()
            cpfPaciente: cpfPaciente,
            date: date,
            time: time,
            type: `Consulta de ${selectedSpecialtyLabel}`,
            doctorName: selectedDoctor.nome,
            doctorSpecialty: selectedSpecialtyLabel,
        };

        try {
            await agendarConsulta(novaConsulta);
            onSuccess("Consulta agendada com sucesso!");
        } catch (err) {
            setError("Erro ao agendar consulta.");
            console.error(err);
        }
    };

    return (
        <div className="p-6 bg-white rounded-xl shadow-lg border-t-4 border-indigo-500">
            <h3 className="text-xl font-bold text-gray-800 mb-4">Agendar Nova Consulta</h3>
            {error && <div className="bg-red-100 text-red-700 p-3 rounded-lg mb-4">{error}</div>}

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Especialidade */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Especialidade</label>
                        <select {...register("specialty")} className={inputClass}>
                            <option value="">Selecione a Especialidade</option>
                            {PLACEHOLDER_SPECIALTIES.map(s => (<option key={s.value} value={s.value}>{s.label}</option>))}
                        </select>
                        {errors.specialty && <p className={errorClass}>{errors.specialty.message}</p>}
                    </div>

                    {/* Médico */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Médico</label>
                        <select {...register("doctorId")} className={inputClass} disabled={!selectedSpecialty || availableDoctors.length === 0}>
                            <option value="">{selectedSpecialty ? 'Selecione o Médico' : 'Escolha a Especialidade'}</option>
                            {availableDoctors.map(doc => (<option key={doc.id} value={doc.id}>{doc.nome}</option>))}
                        </select>
                        {errors.doctorId && <p className={errorClass}>{errors.doctorId.message}</p>}
                    </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Data */}
                    <div><label className="block text-sm font-medium text-gray-700">Data</label><input type="date" {...register("date")} className={inputClass} />{errors.date && <p className={errorClass}>{errors.date.message}</p>}</div>
                    {/* Hora */}
                    <div><label className="block text-sm font-medium text-gray-700">Hora</label><input type="time" {...register("time")} className={inputClass} />{errors.time && <p className={errorClass}>{errors.time.message}</p>}</div>
                </div>

                <button type="submit" disabled={isSubmitting} className="w-full bg-indigo-600 text-white py-2 rounded-lg font-semibold hover:bg-indigo-700 transition-colors disabled:bg-gray-400">{isSubmitting ? 'Agendando...' : 'Confirmar Agendamento'}</button>
            </form>
        </div>
    );
}

// --- Form: Remarcar Consulta ---
export function RemarcarForm({ initialConsulta, onSuccess }: { initialConsulta: Consulta, onSuccess: (msg: string) => void }) {
    const { remarcarConsulta } = useConsultas();
    const [error, setError] = useState<string | null>(null);

    const initialSpecialtyValue = PLACEHOLDER_SPECIALTIES.find(s => s.label === initialConsulta.doctorSpecialty)?.value || "";
    const initialDoctorId = PLACEHOLDER_DOCTORS.find(d => d.nome === initialConsulta.doctorName)?.id || "";

    const { register, handleSubmit, watch, formState: { errors, isSubmitting } } = useForm<FormSchemaRemarcar>({
        resolver: placeholderResolver as any,
        defaultValues: {
            consultaId: initialConsulta.id,
            newDate: initialConsulta.date,
            newTime: initialConsulta.time,
            specialty: initialSpecialtyValue,
            doctorId: initialDoctorId,
        }
    });

    const selectedSpecialty = watch('specialty');
    const availableDoctors = useMemo(() => {
        return PLACEHOLDER_DOCTORS.filter(doc => doc.especialidade === selectedSpecialty);
    }, [selectedSpecialty]);


    const onSubmit: SubmitHandler<FormSchemaRemarcar> = async (data) => {
        const { newDate, newTime, doctorId, specialty } = data;
        
        const selectedDoctor = PLACEHOLDER_DOCTORS.find(d => d.id === doctorId);
        const selectedSpecialtyLabel = PLACEHOLDER_SPECIALTIES.find(s => s.value === specialty)?.label;

        if (!selectedDoctor || !selectedSpecialtyLabel) { setError("Erro de seleção. Tente novamente."); return; }

        const consultaAtualizada: Consulta = {
            ...initialConsulta,
            id: initialConsulta.id,
            date: newDate,
            time: newTime,
            doctorName: selectedDoctor.nome,
            doctorSpecialty: selectedSpecialtyLabel,
            type: `Consulta de ${selectedSpecialtyLabel}`,
        };

        try {
            await remarcarConsulta(consultaAtualizada);
            onSuccess(`Consulta ${initialConsulta.id} remarcada com sucesso!`);
        } catch (err) {
            setError("Erro ao remarcar consulta.");
            console.error(err);
        }
    };

    return (
        <div className="p-6 bg-white rounded-xl shadow-lg border-t-4 border-indigo-500">
            <h3 className="text-xl font-bold text-gray-800 mb-4">Remarcar Consulta ID: {initialConsulta.id}</h3>
            {error && <div className="bg-red-100 text-red-700 p-3 rounded-lg mb-4">{error}</div>}

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Especialidade */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Nova Especialidade</label>
                        <select {...register("specialty")} className={inputClass}>
                            <option value="">Selecione a Especialidade</option>
                            {PLACEHOLDER_SPECIALTIES.map(s => (<option key={s.value} value={s.value}>{s.label}</option>))}
                        </select>
                        {errors.specialty && <p className={errorClass}>{errors.specialty.message}</p>}
                    </div>

                    {/* Médico */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Novo Médico</label>
                        <select {...register("doctorId")} className={inputClass} disabled={!selectedSpecialty || availableDoctors.length === 0}>
                            <option value="">{selectedSpecialty ? 'Selecione o Médico' : 'Escolha a Especialidade'}</option>
                            {availableDoctors.map(doc => (<option key={doc.id} value={doc.id}>{doc.nome}</option>))}
                        </select>
                        {errors.doctorId && <p className={errorClass}>{errors.doctorId.message}</p>}
                    </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Nova Data */}
                    <div><label className="block text-sm font-medium text-gray-700">Nova Data</label><input type="date" {...register("newDate")} className={inputClass} />{errors.newDate && <p className={errorClass}>{errors.newDate.message}</p>}</div>
                    {/* Nova Hora */}
                    <div><label className="block text-sm font-medium text-gray-700">Nova Hora</label><input type="time" {...register("newTime")} className={inputClass} />{errors.newTime && <p className={errorClass}>{errors.newTime.message}</p>}</div>
                </div>

                <button type="submit" disabled={isSubmitting} className="w-full bg-indigo-600 text-white py-2 rounded-lg font-semibold hover:bg-indigo-700 transition-colors disabled:bg-gray-400">{isSubmitting ? 'Remarcando...' : 'Confirmar Remarcação'}</button>
            </form>
        </div>
    );
}

// --- Form: Cancelar Consulta ---
export function CancelarForm({ initialConsulta, onSuccess }: { initialConsulta: Consulta, onSuccess: (msg: string) => void }) {
    const { desmarcarConsulta } = useConsultas();
    const [error, setError] = useState<string | null>(null);
    
    const { handleSubmit, formState: { isSubmitting } } = useForm<FormSchemaCancelar>({
        resolver: placeholderResolver as any,
        defaultValues: { id: initialConsulta.id }
    });

    const onSubmit: SubmitHandler<FormSchemaCancelar> = async () => {
        try {
            await desmarcarConsulta(initialConsulta.id as any); 
            onSuccess(`Consulta ${initialConsulta.id} cancelada com sucesso.`);
        } catch (err) {
            setError("Erro ao cancelar consulta.");
            console.error(err);
        }
    };

    return (
        <div className="p-6 bg-white rounded-xl shadow-lg border-t-4 border-red-500">
            <h3 className="text-xl font-bold text-gray-800 mb-4 text-red-600">Cancelar Consulta</h3>
            <p className="text-lg text-gray-700 mb-4">Tem certeza que deseja cancelar a consulta:</p>
            <div className="bg-red-50 p-4 rounded-lg border border-red-200 mb-6">
                <p className="font-semibold text-red-700">{initialConsulta.type}</p>
                <p className="text-sm text-red-600">Dia {initialConsulta.date} às {initialConsulta.time}</p>
            </div>
            {error && <div className="bg-red-100 text-red-700 p-3 rounded-lg mb-4">{error}</div>}

            <form onSubmit={handleSubmit(onSubmit)}>
                <button type="submit" disabled={isSubmitting} className="w-full bg-red-600 text-white py-2 rounded-lg font-semibold hover:bg-red-700 transition-colors disabled:bg-gray-400">
                    {isSubmitting ? 'Cancelando...' : 'Confirmar Cancelamento'}
                </button>
            </form>
        </div>
    );
}

// ----------------------------------------------------------------------
// NOVO COMPONENTE: Gerenciador de Exibição de Formulários
// ----------------------------------------------------------------------

export type ActiveForm = 'agendar' | 'remarcar' | 'cancelar' | null;

interface FormulariosConsultaProps {
    formType: ActiveForm;
    cpfPaciente: string;
    selectedConsulta: Consulta | null;
    onSuccess: (msg: string) => void;
}

export function FormulariosConsulta({ formType, cpfPaciente, selectedConsulta, onSuccess }: FormulariosConsultaProps) {
    
    // Lógica IF/RETURN para renderização condicional dos formulários
    
    if (formType === 'agendar') {
        return (
            <AgendarForm 
                cpfPaciente={cpfPaciente} 
                onSuccess={onSuccess} 
            />
        );
    }

    if (formType === 'remarcar' && selectedConsulta) {
        return (
            <RemarcarForm 
                initialConsulta={selectedConsulta} 
                onSuccess={onSuccess} 
            />
        );
    }

    if (formType === 'cancelar' && selectedConsulta) {
        return (
            <CancelarForm 
                initialConsulta={selectedConsulta} 
                onSuccess={onSuccess} 
            />
        );
    }
    
    return null;
}


// ----------------------------------------------------------------------
// PÁGINA PRINCIPAL: MINHAS CONSULTAS
// ----------------------------------------------------------------------

