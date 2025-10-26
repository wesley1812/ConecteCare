import { useState } from "react";
import { Layout } from "../components/Layout.tsx";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/auth-context.tsx";
import { useCadastro } from "../context/cadastro-context.tsx";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import {  loginSchema, type LoginFormData } from "../schemas/login-schema.ts";
import type { Paciente, Cuidador } from "../types/interfaces.ts";

const ArrowRightIcon = () => (
    <svg className="w-5 h-5 ml-2 transition-transform duration-300 group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3"></path>
    </svg>
);

const LockIcon = () => (
    <svg className="w-10 h-10 text-cyan-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2z"></path>
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 9V5a3 3 0 00-6 0v4"></path>
    </svg>
);

export function Login() {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const navigate = useNavigate();
    const { login } = useAuth();
    const { paciente: pacientes, cuidador: cuidadores } = useCadastro();

    const {
        register,
        handleSubmit,
    } = useForm<LoginFormData>({
        resolver: zodResolver(loginSchema),
    });

    async function onSubmit(data: LoginFormData): Promise<void> {
        setIsLoading(true);
        setError(null);

        const { email, password } = data;

        const allUsers: (Paciente | Cuidador)[] = [...pacientes, ...cuidadores];

        const user = allUsers.find(
            u => u.email.toLowerCase() === email.toLowerCase()
        );

        if (!user || password !== user.senha) {
            setError("E-mail ou senha incorretos.");
            setIsLoading(false);
            return;
        }

        login(user.email);

        navigate((user as Cuidador).parentesco ? '/perfil-cuidador' : '/menu-paciente');
    }
    return (
        <Layout>
            <div className="min-h-[90vh] flex">

                <div className="hidden lg:flex w-full lg:w-1/2 items-center justify-center 
                                bg-gradient-to-r from-blue-700 to-cyan-500 
                                relative overflow-hidden p-12">

                    <div className="absolute inset-0 opacity-10">
                        <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
                            <defs>
                                <pattern id="grid" width="80" height="80" patternUnits="userSpaceOnUse">
                                    <path d="M 80 0 L 0 0 0 80" fill="none" stroke="#2c5282" strokeWidth="0.5" />
                                </pattern>
                            </defs>
                            <rect width="100%" height="100%" fill="url(#grid)" />
                        </svg>
                    </div>

                    <div className="text-white text-center relative z-10 max-w-md">
                        <h2 className="text-5xl font-extrabold mb-4 tracking-tight">
                            Acesso ao Seu Painel de Cuidado
                        </h2>
                        <p className="text-xl text-blue-200 mt-4">
                            Sua segurança e a integridade dos dados dos pacientes são nossa prioridade máxima.
                        </p>
                        <div className="mt-8">
                            <Link
                                to="/"
                                className="inline-block px-8 py-3 bg-cyan-500 text-white-900 font-bold rounded-full 
                                           transition-transform duration-300 hover:scale-105 shadow-lg hover:shadow-cyan-400/50"
                             >
                                Voltar para a Início
                            </Link>
                        </div>
                    </div>
                </div>

                <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-12 lg:p-16 bg-gray-50">

                    <div className="max-w-md w-full bg-white rounded-3xl shadow-3xl overflow-hidden p-8 sm:p-12 
                                    border border-gray-100 transition-shadow duration-500">

                        <div className="text-center mb-10">
                            <div className="inline-block p-4 bg-blue-100 rounded-2xl mb-4 shadow-inner">
                                <LockIcon />
                            </div>
                            <h1 className="text-3xl font-black text-gray-900 mb-2">
                                Login na ConecteCare
                            </h1>
                            <p className="text-gray-500 text-lg">
                                Use seu email e senha para entrar.
                            </p>
                        </div>

                        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">

                            {error && (
                                <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded-lg" role="alert">
                                    <p className="font-semibold">Erro de Login:</p>
                                    <p className="text-sm">{error}</p>
                                </div>
                            )}

                            <div>
                                <label htmlFor="email" className="block text-sm font-bold text-gray-700 mb-2">Email</label>
                                <input
                                    type="email"
                                    id="email"
                                    {...register("email")}
                                    placeholder="seu@email.com"
                                    required
                                    disabled={isLoading}
                                    className="w-full px-5 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-4 focus:ring-cyan-500/50 focus:border-cyan-500 transition duration-300 ease-in-out text-lg shadow-inner disabled:bg-gray-50"
                                />
                            </div>

                            <div>
                                <label htmlFor="password" className="block text-sm font-bold text-gray-700 mb-2">Senha</label>
                                <input
                                    type="password"
                                    id="password"
                                    placeholder="******"
                                    {...register("password")}
                                    required
                                    disabled={isLoading}
                                    className="w-full px-5 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-4 focus:ring-cyan-500/50 focus:border-cyan-500 transition duration-300 ease-in-out text-lg shadow-inner disabled:bg-gray-50"
                                />
                            </div>

                            <div className="flex justify-between items-center text-sm">
                                <label className="flex items-center">
                                    <input type="checkbox" className="h-4 w-4 text-cyan-600 border-gray-300 rounded focus:ring-cyan-500 mr-2" />
                                    <span className="text-gray-600">Lembrar-me</span>
                                </label>
                                <a
                                    href="#"
                                    className="font-semibold text-blue-700 hover:text-cyan-600 transition-colors"
                                >
                                    Esqueceu a senha?
                                </a>
                            </div>

                            <div>
                                <button
                                    type="submit"
                                    disabled={isLoading}
                                    className="
                                        hover:cursor-pointer
                                        group inline-flex items-center justify-center w-full
                                        bg-gradient-to-r from-cyan-400 to-teal-400 text-blue-900 
                                        px-12 py-3 rounded-xl font-extrabold text-xl 
                                        shadow-xl shadow-cyan-500/50 
                                        transition-all duration-300 transform hover:scale-[1.02] hover:shadow-cyan-400/80
                                        disabled:from-gray-400 disabled:to-gray-500 disabled:shadow-none disabled:cursor-not-allowed disabled:scale-100
                                    "
                                >
                                    {isLoading ? (
                                        <>
                                            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-blue-900" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                            </svg>
                                            Carregando...
                                        </>
                                    ) : (
                                        <>
                                            Entrar
                                            <ArrowRightIcon />
                                        </>
                                    )}
                                </button>
                            </div>
                        </form>

                        <div className="mt-8 pt-6 border-t border-gray-100 text-center text-base">
                            <p className="text-gray-600">
                                Não tem uma conta?
                                <Link to="/cadastro" className="font-extrabold text-blue-700 hover:text-cyan-600 ml-2 transition-colors">
                                    Cadastre-se agora
                                </Link>
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </Layout>
    );
}
