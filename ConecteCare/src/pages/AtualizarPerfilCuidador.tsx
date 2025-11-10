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
          telefoneContato: foundCuidador.telefoneContato,
          correlacaoPaciente: foundCuidador.correlacaoPaciente,
          cpfPaciente: foundCuidador.cpfPaciente,
          cepCuidador: foundCuidador.cepCuidador,
          cepPaciente:foundCuidador.cepPaciente
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

  const inputClass = "w-full px-5 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-600 transition duration-200 ease-in-out shadow-sm text-base bg-white";
  const inputReadOnlyClass = `${inputClass} bg-gray-100 cursor-not-allowed text-gray-500`;
  const labelClass = "block text-sm font-semibold text-gray-700 mb-1";
  const errorClass = "text-red-600 text-xs mt-1 font-medium";
  const sectionTitleClass = "text-xl font-bold text-indigo-700 border-b pb-2 mb-4";


  if (!cuidadorAtual) {
    return (
      <Layout>
        <div className="py-20 bg-gray-50 min-h-screen flex items-center justify-center">
          <p className="text-lg text-gray-600">Carregando perfil...</p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="py-12 bg-gray-50 min-h-screen font-inter">
        <style>
            {`
                @import url('https://fonts.googleapis.com/css2?family=Inter:wght@100..900&display=swap');
                .font-inter {
                    font-family: 'Inter', sans-serif;
                }
            `}
        </style>
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="mb-6">
            <Link
              to="/perfil-cuidador"
              className="text-indigo-600 hover:text-indigo-800 flex items-center transition-colors text-base font-semibold group"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2 group-hover:-translate-x-1 transition-transform"><path d="m15 18-6-6 6-6"/></svg>
              Voltar ao Painel
            </Link>
          </div>

          <section className="bg-white p-6 md:p-10 rounded-2xl shadow-2xl space-y-8 border border-indigo-200">
            <h1 className="text-4xl font-extrabold text-indigo-800 text-center mb-8 border-b pb-4">
              Atualizar Perfil do Cuidador
            </h1>

            {mensagemSucesso && (
              <div className="bg-green-100 border-l-4 border-green-600 text-green-800 p-4 mb-6 rounded-lg shadow-md" role="alert">
                <p className="font-bold">✨ {mensagemSucesso}</p>
              </div>
            )}

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
              
              <div className="p-5 border border-gray-100 rounded-xl bg-indigo-50/50 space-y-4">
                <h3 className={sectionTitleClass}>1. Dados Pessoais e Contato</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div className="md:col-span-2">
                    <label htmlFor="nome" className={labelClass}>Nome Completo:</label>
                    <input type="text" id="nome" {...register("nome")} className={inputClass} />
                    {errors.nome && <p className={errorClass}>{errors.nome.message}</p>}
                  </div>
                  
                  <div className="md:col-span-2">
                    <label htmlFor="email" className={labelClass}>Email (Login - Não editável)</label>
                    <input type="email" id="email" value={cuidadorAtual.email} className={inputReadOnlyClass} readOnly/>
                  </div>

                  <div>
                    <label htmlFor="cpfCuidador" className={labelClass}>CPF Cuidador (Não editável)</label>
                    <input type="text" id="cpfCuidador" value={cuidadorAtual.cpfCuidador} className={inputReadOnlyClass} readOnly />
                  </div>
                  
                  <div>
                    <label htmlFor="idade" className={labelClass}>Idade:</label>
                    <input type="number" id="idade" {...register("idade", { valueAsNumber: true })} className={inputClass} />
                    {errors.idade && <p className={errorClass}>{errors.idade.message}</p>}
                  </div>

                  <div>
                    <label htmlFor="telefoneContato" className={labelClass}>telefoneContato:</label>
                    <input type="tel" id="telefoneContato" {...register("telefoneContato")} className={inputClass} />
                    {errors.telefoneContato && <p className={errorClass}>{errors.telefoneContato.message}</p>}
                  </div>
                  
                  <div>
                    <label htmlFor="cepCuidador" className={labelClass}>CEP da Sua Residência:</label>
                    <input type="text" id="cepCuidador" {...register("cepCuidador")} className={inputClass}/>
                    {errors.cepCuidador && <p className={errorClass}>{errors.cepCuidador.message}</p>}
                  </div>
                </div>
              </div>

              <div className="p-5 border border-gray-100 rounded-xl bg-indigo-50/50 space-y-4">
                <h3 className={sectionTitleClass}>2. Dados do Paciente Associado</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div>
                    <label htmlFor="cpfPaciente" className={labelClass}>CPF Paciente</label>
                    <input type="text" id="cpfPaciente" {...register("cpfPaciente")} className={inputClass}/>
                    {errors.cpfPaciente && <p className={errorClass}>{errors.cpfPaciente.message}</p>}
                  </div>
                  
                  <div>
                    <label htmlFor="cepPaciente" className={labelClass}>CEP da Residência do Paciente:</label>
                    <input type="text" id="cepPaciente" {...register("cepPaciente")} className={inputClass}/>
                    {errors.cepPaciente && <p className={errorClass}>{errors.cepPaciente.message}</p>}
                  </div>
                  
                  <div className="md:col-span-2">
                    <label htmlFor="correlacaoPaciente" className={labelClass}>Relação com Paciente:</label>
                    <input type="text" id="correlacaoPaciente" {...register("correlacaoPaciente")} className={inputClass} placeholder="Ex: Filho, Cônjuge, Amigo" />
                    {errors.correlacaoPaciente && <p className={errorClass}>{errors.correlacaoPaciente.message}</p>}
                  </div>
                </div>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="hover:cursor-pointer w-full mt-8 bg-green-600 text-white py-3 rounded-lg font-bold hover:bg-green-700 transition-all text-xl shadow-xl hover:shadow-2xl tracking-wide transform hover:-translate-y-0.5 disabled:bg-gray-400 disabled:hover:translate-y-0 disabled:shadow-md"
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