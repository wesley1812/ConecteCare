import type { Consulta } from '../types/interfaces';

interface CardConsultaProps {
    appointment: Consulta;
    onAction: (action: 'remarcar' | 'cancelar', consulta: Consulta) => void;
}

const actionButtonClass = (color: 'blue' | 'red') => 
    `px-3 py-2 text-sm font-medium rounded-lg transition-colors shadow-sm 
     ${color === 'blue' ? 'bg-orange-500 text-white hover:bg-orange-600' : 'bg-red-500 text-white hover:bg-red-600'}`;

export function CardConsulta({ appointment, onAction }: CardConsultaProps) {

    const tipoConsulta = appointment.type || appointment.doctorSpecialty;
    const nomeMedico = appointment.doctorName;
    const data = appointment.date;
    const horario = appointment.time;


    return (
        <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-200 hover:shadow-xl transition-shadow duration-300">
            <h3 className="text-xl font-bold text-gray-800 mb-2">{tipoConsulta}</h3>
            <p className="text-md text-gray-600 mb-4">
                Com: <span className="font-semibold text-gray-700">{nomeMedico}</span>
            </p>

            <div className="space-y-1 mb-5 text-sm">
                <p className="flex items-center text-gray-700">
                    <svg className="w-4 h-4 mr-2 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
                    <span className="font-medium">Data: </span> {data}
                </p>
                <p className="flex items-center text-gray-700">
                    <svg className="w-4 h-4 mr-2 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                    <span className="font-medium">Horário: </span> {horario}
                </p>
            </div>

            <div className="flex justify-start space-x-3 border-t pt-4">
                <button
                    onClick={() => onAction('remarcar', appointment)}
                    className={`hover:cursor-pointer ${actionButtonClass('blue')}`}
                >
                    Remarcar
                </button>
                <button
                    onClick={() => onAction('cancelar', appointment)}
                    className={`hover:cursor-pointer ${actionButtonClass('red')}`}
                >
                    Cancelar
                </button>
            </div>
        </div>
    );
}