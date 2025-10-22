import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";

import type { Paciente, Cuidador } from "../types/interfaces";

interface CadastroContextProps {
  paciente: Paciente[];
  cuidador: Cuidador[]
  savePaciente: (paciente: Paciente) => void;
  removePaciente: (id: string) => void;
  saveCuidador: (cuidador: Cuidador) => void;
  removeCuidador: (id: string) => void;
  isCpfCuidadorCadastrado: (cpf: string) => boolean;
  isCpfPacienteCadastrado: (cpf: string) => boolean;
}

const CadastroContext = createContext<CadastroContextProps | null>(null);

export function CadastroProvider({ children }: { children: React.ReactNode }) {
  const [paciente, setPaciente] = useState<Paciente[]>([]);
  const [cuidador, setCuidador] = useState<Cuidador[]>([]);

  const fetchPacientes = useCallback(async () => {
    const response = await fetch("http://localhost:4000/pacientes", {
      headers: {
        "Content-type": "application/json",
      },
      method: "GET",
    });

    const data: Paciente[] = await response.json();

    setPaciente(data);
  }, []); 

  const savePaciente = useCallback(async (paciente: Paciente) => {
    await fetch("http://localhost:4000/pacientes", {
      method: "POST",
      body: JSON.stringify(paciente),
      headers: {
         "Content-type": "application/json",
      },
    });

    await fetchPacientes();
  }, [fetchPacientes]); 

  const removePaciente = useCallback(async (id: string) => {
    await fetch(`http://localhost:4000/pacientes/${id}`, {
      method: "DELETE",
    });

    await fetchPacientes();
  }, [fetchPacientes]);

  const fetchCuidador = useCallback(async () => {
    const response = await fetch("http://localhost:4000/cuidador", {
      headers: {
        "Content-type": "application/json",
      },
      method: "GET",
    });

    const data: Cuidador[] = await response.json();

    setCuidador(data);
  }, []); 

  const saveCuidador = useCallback(async (cuidador: Cuidador) => {
    await fetch("http://localhost:4000/cuidador", {
      method: "POST",
      body: JSON.stringify(cuidador),
      headers: {
         "Content-type": "application/json",
      },
    });

    await fetchCuidador();
  }, [fetchCuidador]); 

  const removeCuidador = useCallback(async (id: string) => {
    await fetch(`http://localhost:4000/cuidador/${id}`, {
      method: "DELETE",
    });

    await fetchCuidador();
  }, [fetchCuidador]);

  useEffect(() => {
    fetchPacientes();
  }, [fetchPacientes]);

  useEffect(() => {
    fetchCuidador();
  }, [fetchCuidador]);

  const isCpfCuidadorCadastrado = useCallback((cpf: string): boolean => {
    return cuidador.some(c => c.cpf === cpf); 
  }, [cuidador]);

  const isCpfPacienteCadastrado = useCallback((cpf: string): boolean => {
    return paciente.some(p => p.cpfPaciente === cpf);
  }, [paciente]);


  return (
    <CadastroContext.Provider
      value={{
        paciente,
        savePaciente,
        removePaciente,
        isCpfPacienteCadastrado,
        cuidador,
        saveCuidador,
        removeCuidador,
        isCpfCuidadorCadastrado,
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