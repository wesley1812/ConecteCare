import React from "react";
import { IconPill, IconClock, IconDoctor } from "../styles/icons";
import type { Paciente, HealthIndicatorType, MedicamentoType, Consulta } from "../types/interfaces";

export const CardPacienteInfo = ({ paciente }: { paciente: Paciente }) => (
    <div className="bg-white p-6 rounded-2xl shadow-lg border-l-4 border-blue-500 mb-6 transition-all duration-300 hover:shadow-xl">
        <div className="flex items-center space-x-4">
            <span className="p-3 rounded-full bg-blue-100 text-blue-600">
                <IconDoctor className="h-6 w-6" />
            </span>
            <div>
                <h2 className="text-xl font-bold text-gray-800">
                    {paciente.nome}
                </h2>
                <p className="text-sm text-gray-500">
                    CPF: {paciente.cpfPaciente} | {paciente.idade} anos
                </p>
            </div>
        </div>
        <div className="mt-4 pt-4 border-t border-gray-100">
            <p className="text-sm font-medium text-gray-600">Patologia Principal:</p>
            <p className="text-base font-semibold text-blue-700">{paciente.patologia}</p>
        </div>
    </div>
);


// Card para Indicadores de Saúde (Design Aprimorado)
export const CardIndicadorSaude = ({ indicator }: { indicator: HealthIndicatorType }) => {
    // Forçamos a tipagem do ícone para SVGProps, o que permite adicionar className e style
    const iconElement = indicator.icon as React.ReactElement<React.SVGProps<SVGSVGElement>>;
    const statusText = indicator.percentage >= 70 ? 'Ótimo' : indicator.percentage >= 50 ? 'Estável' : 'Atenção';
    const statusColor = indicator.percentage >= 70 ? 'text-green-600' : indicator.percentage >= 50 ? 'text-yellow-600' : 'text-red-600';

    return (
        <div className="bg-white p-5 rounded-2xl shadow-md transition-all duration-300 hover:shadow-lg flex flex-col">
            <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-semibold text-gray-600 uppercase tracking-wider">{indicator.name}</h3>
                {iconElement && React.cloneElement(iconElement, { className: "h-5 w-5", style: { color: indicator.color } })}
            </div>
            
            <div className="flex items-end justify-between">
                <div className="flex flex-col">
                    <p className="text-2xl font-bold text-gray-800">{indicator.value}</p>
                    <p className={`text-xs font-medium ${statusColor} mt-1`}>Status: {statusText}</p>
                </div>
                
                {/* Barra de Progresso Visual */}
                <div className="w-1/3 ml-4">
                    <div className="h-1 bg-gray-200 rounded-full">
                        <div 
                            className="h-1 rounded-full transition-all duration-500" 
                            style={{ width: `${indicator.percentage}%`, backgroundColor: indicator.color }} 
                        />
                    </div>
                    <p className="text-xs text-gray-500 mt-1 text-right">{indicator.percentage}%</p>
                </div>
            </div>
        </div>
    );
};


// Card para Medicamentos
export const CardMedicamento = ({ medicamento }: { medicamento: MedicamentoType }) => {
    const isUrgent = medicamento.proximaDose === "Hoje" && parseInt(medicamento.horario.split(':')[0]) <= new Date().getHours() + 2; // Dose nas próximas 2h
    
    return (
        <div className={`bg-white p-5 rounded-2xl shadow-md border-l-4 transition-all duration-300 
                        ${medicamento.ativo ? 'border-cyan-500 hover:shadow-lg' : 'opacity-60 border-gray-400'}`}>
            <div className="flex items-start justify-between">
                <div className="flex items-center space-x-3">
                    <IconPill className={`h-6 w-6 ${medicamento.ativo ? 'text-cyan-500' : 'text-gray-400'}`} />
                    <div>
                        <h3 className="text-lg font-bold text-gray-800">{medicamento.nome}</h3>
                        <p className="text-sm text-gray-600">{medicamento.dosagem} - {medicamento.frequencia}</p>
                    </div>
                </div>
                {medicamento.ativo && (
                    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${isUrgent ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
                        {isUrgent ? 'URGENTE' : 'Ativo'}
                    </span>
                )}
            </div>
            {medicamento.ativo && (
                <div className="mt-4 border-t border-gray-100 pt-3 flex items-center justify-between">
                    <div className="flex items-center text-sm font-medium text-gray-600">
                        <IconClock className="h-4 w-4 mr-2 text-cyan-500" />
                        Próxima Dose: <span className="ml-1 font-semibold text-gray-800">{medicamento.horario}</span>
                    </div>
                </div>
            )}
        </div>
    );
};


// Card para Consultas (Sem integração IA)
export const CardConsulta = ({ appointment }: { 
    appointment: Consulta, 
}) => (
    <div className="bg-white p-5 rounded-2xl shadow-lg border border-gray-100 hover:shadow-xl transition-shadow duration-300 flex flex-col justify-between h-full">
        <div className="mb-4">
            <h3 className="text-xl font-bold text-blue-700">{appointment.type}</h3>
            <p className="text-sm text-gray-600 mt-1">Dr(a). {appointment.doctorName}</p>
        </div>
        
        <div className="space-y-2 text-sm text-gray-700 mb-4">
            <p className="flex items-center font-semibold text-cyan-600">
                <IconClock className="h-4 w-4 mr-2" />
                {appointment.date} às {appointment.time}
            </p>
        </div>
    </div>
);