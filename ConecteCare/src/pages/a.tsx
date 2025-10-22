import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Layout } from "../components/Layout.tsx"; 
import { useAuth } from "../context/auth-context.tsx"; 
import { useCadastro } from "../context/cadastro-context.tsx"; 
import { type Paciente, type Cuidador } from "../types/interfaces"; 
import { loginSchema, type LoginFormData } from "../schemas/login-schema.ts"; 

export function Login() {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const navigate = useNavigate();
    const { login } = useAuth();
    const { paciente: pacientes, cuidador: cuidadores } = useCadastro();
    
    const {
        register,
        handleSubmit,
        formState: { errors },
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

        navigate((user as Cuidador).parentesco ? '/menu-cuidador' : '/menu-paciente');
    }

    const inputClass = "w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition duration-150 ease-in-out";
    const errorClass = "text-red-500 text-sm mt-1";
    
    return (
        <Layout>
            <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4 sm:p-6">
                <div className="max-w-md w-full bg-white rounded-xl shadow-2xl overflow-hidden md:max-w-lg lg:max-w-xl">
                    <div className="md:flex">
                        <div className="hidden md:block md:w-1/2 bg-indigo-700 p-8 flex flex-col justify-center text-white">
                            <h2 className="text-3xl font-extrabold mb-2">Boas vindas ao painel de login</h2>
                            <p className="text-indigo-200">Acesse sua conta para continuar gerenciando seus dados.</p>
                            <div className="mt-8">
                                <svg className="w-12 h-12 text-indigo-300 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v4m0 0l-2-2m2 2l2-2"></path></svg>
                            </div>
                        </div>
                        <div className="w-full md:w-1/2 p-8 sm:p-10">
                            <h2 className="text-3xl font-bold text-gray-900 text-center mb-8">Login</h2>
                            
                            {error && (
                                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">
                                    <span className="block sm:inline">{error}</span>
                                </div>
                            )}

                            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                                <div>
                                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">E-mail</label>
                                    <input
                                        type="email"
                                        id="email"
                                        placeholder="seu.email@exemplo.com"
                                        {...register("email")}
                                        className={inputClass}
                                        disabled={isLoading}
                                    />
                                    {errors.email && <p className={errorClass}>{errors.email.message}</p>}
                                </div>

                                <div>
                                    <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">Senha</label>
                                    <input
                                        type="password"
                                        id="password"
                                        placeholder="••••••••"
                                        {...register("password")}
                                        className={inputClass}
                                        disabled={isLoading}
                                    />
                                    {errors.password && <p className={errorClass}>{errors.password.message}</p>}
                                </div>

                                <div className="flex justify-between items-center mb-6 text-sm">
                                    <a href="#" className="font-medium text-indigo-600 hover:text-indigo-500">
                                        Esqueceu a senha?
                                    </a>
                                </div>

                                <div>
                                    <button 
                                        type="submit" 
                                        className="w-full bg-indigo-600 text-white py-2 px-4 rounded-lg font-semibold text-lg hover:bg-indigo-700 focus:outline-none focus:ring-4 focus:ring-indigo-500 focus:ring-opacity-50 transition duration-150 ease-in-out shadow-md disabled:opacity-50"
                                        disabled={isLoading}
                                    >
                                        {isLoading ? 'Entrando...' : 'Entrar'}
                                    </button>
                                </div>
                            </form>

                            <div className="mt-6 text-center text-sm">
                                <p className="text-gray-600">
                                    Não tem uma conta? 
                                    <a onClick={() => navigate("/cadastro")} className="font-medium text-indigo-600 hover:text-indigo-500 cursor-pointer">
                                        Cadastre-se aqui
                                    </a>
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </Layout>
    );
}