import { Layout } from "../components/Layout";

export function Login() {
  return (
    <Layout>
    <div class="min-h-screen flex items-center justify-center bg-gray-100 p-4 sm:p-6">
    <div class="max-w-md w-full bg-white rounded-xl shadow-2xl overflow-hidden md:max-w-lg lg:max-w-xl">
        <div class="md:flex">
            <div class="hidden md:block md:w-1/2 bg-indigo-700 p-8 flex flex-col justify-center text-white">
                <h2 class="text-3xl font-extrabold mb-2">Boas vindas ao painel de login</h2>
                <p class="text-indigo-200">Acesse sua conta para continuar gerenciando seus dados.</p>
                <div class="mt-8">
                    <svg class="w-12 h-12 text-indigo-300 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2z"></path><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9V7a3 3 0 00-6 0v2m6-2V7a3 3 0 016 0v2"></path></svg>
                </div>
            </div>

            <div class="w-full md:w-1/2 p-8 md:p-10">
                <h2 class="text-3xl font-bold text-gray-800 text-center mb-6">Login</h2>
                
                <form onsubmit="event.preventDefault();"> 
                    
                    <div class="mb-5">
                        <label for="email" class="block text-sm font-medium text-gray-700 mb-2">E-mail</label>
                        <input 
                            type="text" 
                            id="email" 
                            placeholder="seu.email@exemplo.com"
                            class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition duration-150 ease-in-out"
                        />
                    </div>

                    <div class="mb-6">
                        <label for="password" class="block text-sm font-medium text-gray-700 mb-2">Senha</label>
                        <input 
                            type="password" 
                            id="password" 
                            placeholder="*****"
                            class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition duration-150 ease-in-out"
                        />
                    </div>

                    <div class="flex justify-between items-center mb-6 text-sm">
                        <a href="#" class="font-medium text-indigo-600 hover:text-indigo-500">
                            Esqueceu a senha?
                        </a>
                    </div>

                    <div>
                        <button 
                            type="submit" 
                            class="w-full bg-indigo-600 text-white py-2 px-4 rounded-lg font-semibold text-lg hover:bg-indigo-700 focus:outline-none focus:ring-4 focus:ring-indigo-500 focus:ring-opacity-50 transition duration-150 ease-in-out shadow-md"
                        >
                            Entrar
                        </button>
                    </div>
                </form>

                <div class="mt-6 text-center text-sm">
                    <p class="text-gray-600">
                        Não tem uma conta? 
                        <a href="/cadastro" class="font-medium text-indigo-600 hover:text-indigo-500">
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
