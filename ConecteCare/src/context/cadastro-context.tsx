import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";

import type { Paciente, Cuidador } from "../types/interfaces";

interface CadastroContextValues {
  paciente: Paciente[];
  cuidador: Cuidador[]
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
  savePaciente: (input: Omit<Paciente, "id" | "userID">) => void;
  removePaciente: (id: ID) => Promise<void>;
  saveCuidador: (input: Omit<Cuidador, "id" | "userID">) => void;
  removeCuidador: (id: ID) => Promise<void>;
  clearCache: () => void;
}

const CadastroContext = createContext<CadastroContextValues | null>(null);
const API = import.meta.env.VITE_API_URL as string;

export function CadastroProvider({ children }: { children: React.ReactNode }) {
  const {user} = useAuth();
  const [paciente, setPaciente] = useState<Paciente[]>([]);
  const [cuidador, setCuidador] = useState<Cuidador[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const refresh = useCallback(async () => {
      if (!user) {
        setPaciente([]);
        return;
      }
      try{
        setLoading(true);
        setError(null);
        const res = await fetch(`${API}/pacientes?userId=${user.id}`, {
          headers: { "Content-Type": "application/json" },
        });
        if (!res.ok) throw new Error("Falha ao buscar pacientes");
        const data: Paciente[] = await res.json();
        setPaciente(data);
      } catch (err : any) {
        setError(error.message ?? "Erro ao carregar pacientes");
      } finally {
        setLoading(false);
      }
    }, [user]);

  useEffect(() => { void refresh(); }, [refresh]);


  const savePaciente = useCallback(async (input: Omit<Paciente, "id" | "userID">) => {
    if (!user) return;
    const res = await fetch(`${API}/pacientes`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...input, userID: user.id }),
    });
    if (!res.ok) throw new Error("Falha ao salvar paciente");
    await refresh();
  }, [user, refresh]);

  const removePaciente = useCallback(async (id: ID) => {
    await fetch(`${API}/pacientes/${id}`, {method: "DELETE",});
    if (!res.ok) throw new Error("Falha ao remover paciente");
    await refresh();
  }, [refresh]);

  const clearCache = useCallback(() => {
    setPaciente([]);
    setError(null);
  }, []);

  const value = useMemo(
    () => ({ paciente, loading, error, refresh, savePaciente, removePaciente, clearCache }),
    [paciente, loading, error, refresh, savePaciente, removePaciente, clearCache]
  );


  const saveCuidador = useCallback(async (input: Omit<Cuidador, "id" | "userID">) => {
    if (!user) return;
    const res = await fetch(`${API}/cuidador`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...input, userID: user.id }),
    });
    if (!res.ok) throw new Error("Falha ao salvar cuidador");
    await refresh();
  }, [user, refresh]); 

  const removeCuidador = useCallback(async (id: ID) => {
      const res = await fetch(`${API}/cuidador/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Falha ao remover cuidador");
      await refresh();
    }, [refresh]);

  return (
    <CadastroContext.Provider value={value}>{children} </CadastroContext.Provider>
  );
}

export function useCadastro() {
  const ctx = useContext(CadastroContext);
  if (!ctx) {
    throw new Error("useCadastro deve ser usado dentro de CadastroProvider");
  }
  return ctx;
}