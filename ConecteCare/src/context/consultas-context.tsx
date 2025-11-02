import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";

import type { Consulta } from "../types/interfaces";
import { API_CONECTE_CARE } from "../api/conecte-care-api";

interface ConsultasContextProps {
  consulta: Consulta[];
  agendarConsulta: (consulta: Consulta) => void;
  desmarcarConsulta: (id: string ) => void;
  remarcarConsulta: (consulta: Consulta) => void;
  getConsultasPorPaciente: (cpfPaciente: string) => Consulta[];
}

const ConsultasContext = createContext<ConsultasContextProps | null>(null);

export function ConsultasProvider({ children }: { children: React.ReactNode }) {
  const [consulta, setConsultas] = useState<Consulta[]>([]);

  const fetchConsultas = useCallback(async () => {
    const response = await fetch(`${API_CONECTE_CARE}/consultasHC`, {
      headers: {
        "Content-type": "application/json",
      },
      method: "GET",
    });

    const data: Consulta[] = await response.json();

    setConsultas(data);
  }, []);

  const agendarConsulta = useCallback(async (consulta: Consulta) => {
    await fetch(`${API_CONECTE_CARE}/consultasHC`, {
      method: "POST",
      body: JSON.stringify(consulta),
      headers: {
        "Content-type": "application/json",
      },
    });

    await fetchConsultas();
  }, [fetchConsultas]);

  const desmarcarConsulta = useCallback(async (id: string) => {
    await fetch(`${API_CONECTE_CARE}/consultasHC/${id}`, {
      method: "DELETE",
    });

    await fetchConsultas();
  }, [fetchConsultas]);

  const remarcarConsulta = useCallback(async (consulta: Consulta) => {
      await fetch(`${API_CONECTE_CARE}/consultasHC/${consulta.id}`, {
        method: "PUT", 
        body: JSON.stringify(consulta),
        headers: {
          "Content-type": "application/json",
        },
      });
  
      await fetchConsultas();
    }, [fetchConsultas]);

  useEffect(() => {
    fetchConsultas();
  }, [fetchConsultas]);

  const getConsultasPorPaciente = useCallback((cpfPaciente: string): Consulta[] => {
    return consulta.filter(consulta => consulta.cpfPaciente === cpfPaciente);
  }, [consulta]);

  return (
    <ConsultasContext.Provider
      value={{
        consulta,
        agendarConsulta,
        desmarcarConsulta,
        remarcarConsulta,
        getConsultasPorPaciente
      }}
    >
      {children}
    </ConsultasContext.Provider>
  );
}

export function useConsultas() {
  const ctx = useContext<ConsultasContextProps | null>(ConsultasContext);

  if (!ctx) {
    throw new Error("useConsultas deve ser usado dentro de ConsultasProvider");
  }

  return ctx;
}
