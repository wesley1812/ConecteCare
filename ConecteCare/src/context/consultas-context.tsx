import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";

import type { AppointmentType } from "../types/interfaces"; // Certifique-se que seu 'interfaces.ts' exporta AppointmentType
import { API_CONECTE_CARE } from "../api/conecte-care-api"; // Sua URL da API

interface ConsultasContextProps {
  consultas: AppointmentType[]; // Lista de TODAS as consultas
  getConsultasPorPaciente: (cpfPaciente: string) => AppointmentType[]; // Função para filtrar
  isLoading: boolean;
}

const ConsultasContext = createContext<ConsultasContextProps | null>(null);

export function ConsultasProvider({ children }: { children: React.ReactNode }) {
  const [consultas, setConsultas] = useState<AppointmentType[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Função para buscar todas as consultas da API
  const fetchConsultas = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`${API_CONECTE_CARE}/consultasHC`, { // Assumindo que o endpoint é '/consultas'
        headers: {
          "Content-type": "application/json",
        },
        method: "GET",
      });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data: AppointmentType[] = await response.json();
      setConsultas(data);
    } catch (error) {
      console.error("Erro ao buscar consultas:", error);
      // Você pode adicionar um estado de erro aqui se desejar
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Busca as consultas quando o provider é montado
  useEffect(() => {
    fetchConsultas();
  }, [fetchConsultas]);

  // Função para filtrar as consultas pelo CPF do paciente
  // (Assume que cada consulta no db.json tem uma propriedade 'cpfPaciente')
  const getConsultasPorPaciente = useCallback((cpfPaciente: string): AppointmentType[] => {
    return consultas.filter(consulta => consulta.cpfPaciente === cpfPaciente); // Ajuste 'cpfPaciente' se o nome da chave for diferente no db.json
  }, [consultas]);


  return (
    <ConsultasContext.Provider
      value={{
        consultas,
        getConsultasPorPaciente,
        isLoading,
      }}
    >
      {children}
    </ConsultasContext.Provider>
  );
}

// Hook customizado para usar o contexto
export function useConsultas() {
  const ctx = useContext<ConsultasContextProps | null>(ConsultasContext);

  if (!ctx) {
    throw new Error("useConsultas deve ser usado dentro de ConsultasProvider");
  }

  return ctx;
}
