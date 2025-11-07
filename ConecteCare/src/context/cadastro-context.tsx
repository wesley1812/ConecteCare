import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";

import type { Paciente, Cuidador } from "../types/interfaces";
import { API_CONECTE_CARE } from "../api/conecte-care-api";

interface CadastroContextProps {
  paciente: Paciente[];
  cuidador: Cuidador[]
  savePaciente: (paciente: Paciente) => void;
  removePaciente: (id: string) => void;
  updatePaciente: (paciente: Paciente) => void; // <-- ADICIONADO
  saveCuidador: (cuidador: Cuidador) => void;
  removeCuidador: (id: string) => void;
  updateCuidador: (cuidador: Cuidador) => void; // <-- ADICIONADO
  iscpfCuidadorCadastrado: (cpfCuidador: string) => boolean;
  iscpfPacienteCadastrado: (cpfCuidador: string) => boolean;
}

const CadastroContext = createContext<CadastroContextProps | null>(null);

export function CadastroProvider({ children }: { children: React.ReactNode }) {
  const [paciente, setPaciente] = useState<Paciente[]>([]);
  const [cuidador, setCuidador] = useState<Cuidador[]>([]);

  const fetchPacientes = useCallback(async () => {
    const response = await fetch(`${API_CONECTE_CARE}/pacientes`, {
      headers: {
        "Content-type": "application/json",
      },
      method: "GET",
    });

    const data: Paciente[] = await response.json();

    setPaciente(data);
  }, []);

  const savePaciente = useCallback(async (paciente: Paciente) => {
    await fetch(`${API_CONECTE_CARE}/pacientes`, {
      method: "POST",
      body: JSON.stringify(paciente),
      headers: {
        "Content-type": "application/json",
      },
    });

    await fetchPacientes();
  }, [fetchPacientes]);

  const removePaciente = useCallback(async (id: string) => {
    await fetch(`${API_CONECTE_CARE}/pacientes/${id}`, {
      method: "DELETE",
    });

    await fetchPacientes();
  }, [fetchPacientes]);

  const updatePaciente = useCallback(async (paciente: Paciente) => {
    // A rota padrão REST para update é PUT ou PATCH com o ID
    await fetch(`${API_CONECTE_CARE}/pacientes/${paciente.id}`, {
      method: "PUT", 
      body: JSON.stringify(paciente),
      headers: {
        "Content-type": "application/json",
      },
    });

    // Re-busca os dados para manter o contexto atualizado
    await fetchPacientes();
  }, [fetchPacientes]);
  // --- FIM DA ADIÇÃO ---


  const fetchCuidador = useCallback(async () => {
    const response = await fetch(`${API_CONECTE_CARE}/cuidador`, {
      headers: {
        "Content-type": "application/json",
      },
      method: "GET",
    });

    const data: Cuidador[] = await response.json();

    setCuidador(data)
  }, []);

  const saveCuidador = useCallback(async (cuidador: Cuidador) => {
    await fetch(`${API_CONECTE_CARE}/cuidador`, {
      method: "POST",
      body: JSON.stringify(cuidador),
      headers: {
        "Content-type": "application/json",
      },
    });

    await fetchCuidador();
  }, [fetchCuidador]); //

  const removeCuidador = useCallback(async (id: string) => {
    await fetch(`${API_CONECTE_CARE}/cuidador/${id}`, {
      method: "DELETE",
    });

    await fetchCuidador();
  }, [fetchCuidador]); //

  // --- FUNÇÃO ADICIONADA ---
  const updateCuidador = useCallback(async (cuidador: Cuidador) => {
    // A rota padrão REST para update é PUT ou PATCH com o ID
    await fetch(`${API_CONECTE_CARE}/cuidador/${cuidador.id}`, {
      method: "PUT", 
      body: JSON.stringify(cuidador),
      headers: {
        "Content-type": "application/json",
      },
    });

    // Re-busca os dados para manter o contexto atualizado
    await fetchCuidador();
  }, [fetchCuidador]);
  // --- FIM DA ADIÇÃO ---


  useEffect(() => {
    fetchPacientes();
  }, [fetchPacientes]);

  useEffect(() => {
    fetchCuidador()
  }, [fetchCuidador]);

  const iscpfCuidadorCadastrado = useCallback((cpfCuidador: string): boolean => {
    return cuidador.some(c => c.cpfCuidador === cpfCuidador);
  }, [cuidador]); //

  const iscpfPacienteCadastrado = useCallback((cpfCuidador: string): boolean => {
    return paciente.some(p => p.cpfPaciente === cpfCuidador);
  }, [paciente]); //


  return (
    <CadastroContext.Provider
      value={{
        paciente,
        savePaciente,
        removePaciente,
        iscpfPacienteCadastrado,
        updatePaciente,
        cuidador,
        saveCuidador,
        removeCuidador,
        iscpfCuidadorCadastrado,
        updateCuidador, 
      }}
    >
      {children}
    </CadastroContext.Provider>
  );
}

export function useCadastro() {
  const ctx = useContext<CadastroContextProps | null>(CadastroContext);

  if (!ctx) {
    throw new Error("useCadastro deve ser usado dentro de CadastroProvider");
  }

  return ctx;
}