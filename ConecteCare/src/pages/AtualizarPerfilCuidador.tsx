import { useEffect, useState } from "react";
import { useForm, type SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Link, useNavigate } from "react-router-dom";
import { Layout } from "../components/Layout";
import { useAuth } from "../context/auth-context";
import { useCadastro } from "../context/cadastro-context";
import type { Cuidador } from "../types/interfaces";
import { formSchemaAtualizarCuidador, type FormSchemaAtualizarCuidador } from "../schemas/forms-schema";

export function AtualizarPerfilCuidador() {
  const navigate = useNavigate();
  
  const { user } = useAuth();
  const { cuidador: listaCuidadores, updateCuidador } = useCadastro(); 

  const [cuidadorAtual, setCuidadorAtual] = useState<Cuidador | null>(null);
  const [mensagemSucesso, setMensagemSucesso] = useState("");

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormSchemaAtualizarCuidador>({
    resolver: zodResolver(formSchemaAtualizarCuidador),
  });

  useEffect(() => {
    if (user && listaCuidadores.length > 0) {
      const foundCuidador = listaCuidadores.find(
        (c) => c.email === user
      ); 

      if (foundCuidador) {
        setCuidadorAtual(foundCuidador);
        reset({
          nome: foundCuidador.nome,
          idade: foundCuidador.idade,
          telefone: foundCuidador.telefone,
          parentesco: foundCuidador.parentesco,
          cpfPaciente: foundCuidador.cpfPaciente
        }); 
      }
    }
  }, [user, listaCuidadores, reset]);

  const onSubmit: SubmitHandler<FormSchemaAtualizarCuidador> = async (data) => {
    if (!cuidadorAtual) return;

    const cuidadorAtualizado: Cuidador = {
      ...cuidadorAtual,
      ...data,
    };
    
    await updateCuidador(cuidadorAtualizado); 

    setMensagemSucesso("Perfil atualizado com sucesso!");
    setTimeout(() => {
      setMensagemSucesso("");
      navigate("/perfil-cuidador");
    }, 2000);
  };

  const inputClass = "w-full px-4 py-2 bg-gray-50 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 transition";
  const labelClass = "block text-sm font-semibold text-gray-700 mb-1";
  const errorClass = "text-red-600 text-xs mt-1";

  if (!cuidadorAtual) {
    return (
      <Layout>
        <div className="py-20 bg-gray-100 min-h-screen flex items-center justify-center">
          <p className="text-lg text-gray-600">Carregando perfil...</p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="py-12 bg-gray-100 min-h-screen">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="mb-4">
            <Link
              to="/perfil-cuidador"
              className="hover:cursor-pointer text-gray-600 hover:text-indigo-600 flex items-center transition-colors text-base font-medium group"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2 group-hover:-translate-x-1 transition-transform"><path d="m15 18-6-6 6-6"/></svg>
              Voltar ao Painel
            </Link>
          </div>

          <section className="bg-white p-6 sm:p-8 rounded-xl shadow-lg">
            <h1 className="text-3xl font-bold text-gray-900 mb-6 border-b pb-4">
              Atualizar Perfil
            </h1>

            {mensagemSucesso && (
              <div className="bg-green-100 border-l-4 border-green-600 text-green-800 p-4 mb-6 rounded-lg shadow-md" role="alert">
                <p className="font-bold">✨ {mensagemSucesso}</p>
              </div>
            )}

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="nome" className={labelClass}>Nome Completo</label>
                  <input type="text" id="nome" {...register("nome")} className={inputClass} />
                  {errors.nome && <p className={errorClass}>{errors.nome.message}</p>}
                </div>
                <div>
                  <label htmlFor="idade" className={labelClass}>Idade</label>
                  <input type="number" id="idade" {...register("idade", { valueAsNumber: true })} className={inputClass} />
                  {errors.idade && <p className={errorClass}>{errors.idade.message}</p>}
                </div>
              </div>

              <div>
                <label htmlFor="email" className={labelClass}>Email (Não editável)</label>
                <input type="email" id="email" value={cuidadorAtual.email} className={`${inputClass} bg-gray-200 cursor-not-allowed`} readOnly/>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="telefone" className={labelClass}>Telefone</label>
                  <input type="tel" id="telefone" {...register("telefone")} className={inputClass} />
                  {errors.telefone && <p className={errorClass}>{errors.telefone.message}</p>}
                </div>
                <div>
                  <label htmlFor="parentesco" className={labelClass}>Relação com Paciente</label>
                  <input type="text" id="parentesco" {...register("parentesco")} className={inputClass} />
                  {errors.parentesco && <p className={errorClass}>{errors.parentesco.message}</p>}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="cpf" className={labelClass}>CPF (Não editável)</label>
                  <input type="text" id="cpf" value={cuidadorAtual.cpf} className={`${inputClass} bg-gray-200 cursor-not-allowed`} readOnly />
                </div>
                <div>
                  <label htmlFor="cpfPaciente" className={labelClass}>CPF Paciente</label>
                  <input type="text" id="cpfPaciente" {...register("cpfPaciente")} className={inputClass}/>
                  {errors.cpfPaciente && <p className={errorClass}>{errors.cpfPaciente.message}</p>}
                </div>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="hover:cursor-pointer w-full mt-4 bg-green-600 text-white py-3 rounded-lg font-semibold hover:bg-green-700 transition-colors text-lg shadow-xl focus:outline-none focus:ring-4 focus:ring-green-300 disabled:bg-gray-400"
              >
                {isSubmitting ? "Salvando..." : "Salvar Alterações"}
              </button>
            </form>
          </section>
        </div>
      </div>
    </Layout>
  );
}