import type { IndicadorSaudeCardProps } from "../types/interfaces";

export function CardIndicadorSaude({ indicador }: IndicadorSaudeCardProps) {
  return (
    <div className="bg-white p-4 rounded-lg shadow-md text-center">
      <h3 className="text-lg font-semibold text-gray-900 mb-2">{indicador.name}</h3>
      <div className="relative bg-gray-200 rounded-full h-20 mb-2">
        <div 
          className={`absolute bottom-0 rounded-full transition-all duration-500`}
          style={{
            height: `${indicador.percentage}%`,
            backgroundColor: indicador.color,
            width: '100%'
          }}
        />
      </div>
      <p className="text-sm font-medium text-gray-700">{indicador.value}</p>
    </div>
  );
};
