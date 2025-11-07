import { useState, useEffect } from "react";
import { Link, } from "react-router-dom";
import { useForm, type SubmitHandler } from "react-hook-form";
import { Layout } from "../components/Layout";
import type { Paciente, Cuidador } from "../types/interfaces";
import { useAuth } from "../context/auth-context";
import { useCadastro } from "../context/cadastro-context";
import { formSchemaAtualizarPaciente, type FormSchemaAtualizarPaciente } from "../schemas/forms-schema";
import { zodResolver } from "@hookform/resolvers/zod";

// Ícone simples para o cartão do cuidador
const UserIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-indigo-500 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
  </svg>
);

// Ícone de Perfil (Avatar)
const ProfileIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M5.121 17.804A13.937 13.937 0 0112 16c2.5 0 4.847.655 6.879 1.804M15 10a3 3 0 11-6 0 3 3 0 016 0zm6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

// Componente para exibir um cartão de cuidador
function CardCuidador({ cuidador }: { cuidador: Cuidador }) {
  return (
    <div className="bg-white p-5 rounded-lg shadow-md border border-gray-100 hover:shadow-lg transition-shadow duration-200">
      <div className="flex items-center mb-3">
        <UserIcon />
        <h3 className="text-xl font-bold text-gray-800">{cuidador.nome}</h3>
      </div>
      <div className="space-y-2 text-gray-600 text-sm">
        <p><strong className="font-medium text-gray-700">correlacaoPaciente:</strong> {cuidador.correlacaoPaciente}</p>
        <p><strong className="font-medium text-gray-700">telefoneContato:</strong> {cuidador.telefoneContato}</p>
        <p><strong className="font-medium text-gray-700">Email:</strong> {cuidador.email}</p>
      </div>
    </div>
  );
}

// ----------------------------------------------------------------------
// COMPONENTE PRINCIPAL: Combina Perfil e Lista
// ----------------------------------------------------------------------

export function AtualizarPerfilPaciente() {

  const { user: loggedInUserEmail } = useAuth();
  const {
    paciente: listaPacientes,
    cuidador: listaTodosCuidadores,
    updatePaciente
  } = useCadastro();

  const [pacienteAtual, setPacienteAtual] = useState<Paciente | null>(null);
  const [meusCuidadores, setMeusCuidadores] = useState<Cuidador[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [globalError, setGlobalError] = useState<string | null>(null);
  const [mensagemSucesso, setMensagemSucesso] = useState("");

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormSchemaAtualizarPaciente>({
    resolver: zodResolver(formSchemaAtualizarPaciente),
  });

  // Efeito para carregar dados do paciente e dos cuidadores
  useEffect(() => {
    if (loggedInUserEmail && listaPacientes.length > 0 && listaTodosCuidadores.length > 0) {
      setIsLoading(true);
      setGlobalError(null);

      const foundPaciente = listaPacientes.find(
        p => p.email === loggedInUserEmail
      );

      if (!foundPaciente) {
        setGlobalError("Utilizador não encontrado como paciente no sistema.");
        setIsLoading(false);
        return;
      }

      setPacienteAtual(foundPaciente);

      // 1. Preenche o formulário
      reset({
        nome: foundPaciente.nome,
        idade: foundPaciente.idade,
        telefoneContato: foundPaciente.telefoneContato,
        cpfPaciente: foundPaciente.cpfPaciente
      });

      // 2. Filtra os cuidadores
      const foundCuidadores = listaTodosCuidadores.filter(
        c => c.cpfPaciente === foundPaciente.cpfPaciente
      );
      setMeusCuidadores(foundCuidadores);

      setIsLoading(false);

    } else if (!loggedInUserEmail) {
      setGlobalError("Utilizador não autenticado.");
      setIsLoading(false);
    }
  }, [loggedInUserEmail, listaPacientes, listaTodosCuidadores, reset]);

  const onSubmit: SubmitHandler<FormSchemaAtualizarPaciente> = async (data) => {
    if (!pacienteAtual) return;

    const pacienteAtualizado: Paciente = {
      ...pacienteAtual,
      ...data,
    };


    await updatePaciente(pacienteAtualizado);

    setMensagemSucesso("Perfil atualizado com sucesso!");
    setTimeout(() => {
      setMensagemSucesso("");
    }, 5000);
  };

  const inputClass = "w-full px-4 py-2 bg-gray-50 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 transition";
  const labelClass = "block text-sm font-semibold text-gray-700 mb-1";
  const errorClass = "text-red-600 text-xs mt-1";

  // --- Telas de Carregamento e Erro ---

  if (isLoading || !pacienteAtual) {
    return (
      <Layout>
        <div className="py-20 bg-gray-100 min-h-screen flex items-center justify-center">
          <p className="text-lg text-gray-600">{globalError || "A carregar perfil e cuidadores..."}</p>
        </div>
      </Layout>
    );
  }

  if (globalError) {
    // Usa a tela de erro da ListaCuidadores
    return (
      <Layout>
        <div className="py-20 bg-gray-50 min-h-screen flex items-center justify-center text-center">
          <div>
            <h1 className="text-2xl font-bold text-red-600">Erro</h1>
            <p className="text-lg text-gray-600 mt-2">{globalError}</p>
            <Link to="/" className="mt-4 inline-block px-6 py-2 bg-blue-600 text-white font-semibold rounded-lg shadow-md hover:bg-blue-700">
              Voltar à Página Inicial
            </Link>
          </div>
        </div>
      </Layout>
    );
  }


  // --- Layout Unificado ---
  return (
    <Layout>
      <div className="py-12 bg-gray-100 min-h-screen">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">

          {/* TÍTULO PRINCIPAL */}
          <div className="flex items-center justify-start bg-indigo-600 p-6 sm:p-8 rounded-xl shadow-2xl mb-8">
            <div className="p-3 bg-indigo-700 rounded-full mr-4">
              <ProfileIcon />
            </div>
            <div>
              <h1 className="text-3xl sm:text-4xl font-extrabold text-white">
                Painel do Paciente
              </h1>
              <p className="text-indigo-200 mt-1">Gerencie seu perfil e visualize seus cuidadores.</p>
            </div>
          </div>


          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

            {/* COLUNA 1: ATUALIZAR PERFIL (MAIS IMPORTANTE) */}
            <section className="lg:col-span-1 bg-white p-6 sm:p-8 rounded-xl shadow-lg h-fit lg:sticky lg:top-4">
              <h2 className="text-2xl font-bold text-gray-900 mb-6 border-b pb-4 flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-indigo-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                Atualizar Meu Perfil
              </h2>

              {mensagemSucesso && (
                <div className="bg-green-100 border-l-4 border-green-600 text-green-800 p-4 mb-6 rounded-lg shadow-md" role="alert">
                  <p className="font-bold">✅ {mensagemSucesso}</p>
                </div>
              )}

              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <div>
                  <label htmlFor="nome" className={labelClass}>Nome Completo</label>
                  <input type="text" id="nome" {...register("nome")} className={inputClass} />
                  {errors.nome && <p className={errorClass}>{errors.nome.message}</p>}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="idade" className={labelClass}>Idade</label>
                    <input type="number" id="idade" {...register("idade", { valueAsNumber: true })} className={inputClass} />
                    {errors.idade && <p className={errorClass}>{errors.idade.message}</p>}
                  </div>
                  <div>
                    <label htmlFor="telefoneContato" className={labelClass}>telefoneContato</label>
                    <input type="tel" id="telefoneContato" {...register("telefoneContato")} className={inputClass} />
                    {errors.telefoneContato && <p className={errorClass}>{errors.telefoneContato.message}</p>}
                  </div>
                </div>

                <div>
                  <label htmlFor="email" className={labelClass}>Email</label>
                  <input type="email" id="email" value={pacienteAtual.email} className={`${inputClass} bg-gray-200 cursor-not-allowed`} readOnly />
                </div>

                <div>
                  <label htmlFor="cpfPaciente" className={labelClass}>CPF</label>
                  <input type="text" id="cpfPaciente" value={pacienteAtual.cpfPaciente} className={`${inputClass} bg-gray-200 cursor-not-allowed`} readOnly />
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="hover:cursor-pointer w-full mt-4 bg-indigo-600 text-white py-3 rounded-lg font-semibold hover:bg-indigo-700 transition-colors text-lg shadow-md focus:outline-none focus:ring-4 focus:ring-indigo-300 disabled:bg-gray-400"
                >
                  {isSubmitting ? "Salvando..." : "Salvar Alterações"}
                </button>
              </form>
            </section>

            <section className="lg:col-span-2">
              <h2 className="text-2xl font-bold text-gray-900 mb-6 border-b pb-4 flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-indigo-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M17 20h-5m-5 0h10m-8 0v-4m0 0a2 2 0 11-4 0v-4m4 4h4m4 0a2 2 0 10-4 0v-4m4 4v-4m0 0a2 2 0 10-4 0v-4M17 11v-4m0 0a2 2 0 10-4 0v-4m4 4h4m4 0a2 2 0 10-4 0v-4" /></svg>
                Meus Cuidadores ({meusCuidadores.length})
              </h2>

              {meusCuidadores.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  {meusCuidadores.map((cuidador) => (
                    <CardCuidador key={cuidador.id} cuidador={cuidador} />
                  ))}
                </div>
              ) : (
                <div className="bg-white p-6 rounded-lg shadow-md border border-gray-100 text-center text-gray-500">
                  Nenhum cuidador associado ao seu perfil no momento.
                </div>
              )}
            </section>

          </div>
        </div>
      </div>
    </Layout>
  );
}