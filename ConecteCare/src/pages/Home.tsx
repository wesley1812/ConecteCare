import { useNavigate } from "react-router-dom";
import { Layout } from "../components/Layout";
import { Depoimento, VantagensConecte } from "../components/Recursos";

const ArrowRightIcon = () => (
    <svg className="w-5 h-5 ml-2 -mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3"></path>
    </svg>
);

export function Home() {
    const navigate = useNavigate();

    const vantagens = [
        {
            title: "Agendamento Inteligente",
            description: "Sistema automatizado com notificações via WhatsApp/SMS, garantindo 99% de presença e otimização da agenda.",
            icon: "✅" 
        },
        {
            title: "Design Ultra-Acessível",
            description: "Interface desenhada sob medida para idosos e pessoas com dificuldades, focando em contraste, tamanho de fonte e simplicidade.",
            icon: "♿"
        },
        {
            title: "Monitoramento Completo",
            description: "O cuidador tem acesso a um dashboard completo, visualizando histórico de consultas, medicamentos e relatórios de progresso.",
            icon: "📊"
        }
    ];

    const depoimentosUsuarios = [
        {
            text: "A ConecteCare transformou a rotina de saúde do meu pai. É intuitiva e extremamente confiável. Não troco por nada!",
            author: "Felipe Costa, Cuidador (5 estrelas)"
        },
        {
            text: "Finalmente, uma plataforma que entende a importância da acessibilidade. Meus pacientes idosos estão mais engajados e independentes.",
            author: "Dra. Helena Torres, Geriatra"
        },
        {
            text: "O recurso de lembretes automáticos reduziu em 80% as faltas no meu consultório. Profissionalismo e eficiência garantidos.",
            author: "Hospital Santa Maria, Gestão Médica"
        }
    ];

    const handleCadastroClick = () => {
        navigate("/cadastro");
    };

    return (
        <Layout>
            <section className="bg-gradient-to-r from-blue-700 to-cyan-600  text-white min-h-[85vh] flex items-center relative overflow-hidden">
                <svg className="absolute inset-0 w-full h-full opacity-5" viewBox="0 0 1440 320" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg">
                    <path fill="#ffffff" fillOpacity="1" d="M0,192L48,197.3C96,203,192,213,288,208C384,203,480,181,576,170.7C672,160,768,160,864,170.7C960,181,1056,203,1152,213.3C1248,224,1344,224,1392,224L1440,224L1440,0L1392,0C1344,0,1248,0,1152,0C1056,0,960,0,864,0C768,0,672,0,576,0C480,0,384,0,288,0C192,0,96,0,48,0L0,0Z"></path>
                </svg>

                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10 py-20">
                    <span className="inline-block text-cyan-400 text-base font-semibold uppercase tracking-widest mb-4">
                        Inovação em Cuidado Médico
                    </span>
                    <h1 className="text-6xl md:text-7xl font-black mb-8 tracking-tight leading-tight">
                        Saúde Acessível. <br className="hidden sm:inline" /> Conexão Imediata.
                    </h1>
                    <p className="text-2xl mb-12 max-w-4xl mx-auto font-light text-blue-200">
                        Maximize a adesão ao tratamento e simplifique a comunicação entre pacientes, cuidadores e profissionais de saúde.
                    </p>
                    <button 
                        onClick={handleCadastroClick}
                        className="
                            hover: cursor-pointer
                            inline-flex items-center 
                            bg-gradient-to-r from-cyan-400 to-teal-400 text-blue-900 
                            px-12 py-4 rounded-full font-extrabold text-xl 
                            shadow-2xl shadow-cyan-500/50 
                            transition-all duration-300 transform hover:scale-105 hover:shadow-cyan-400/80
                        "
                    >
                        Começar Minha Jornada Agora
                        <ArrowRightIcon />
                    </button>
                </div>
            </section>

            <section className="py-24 bg-gray-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <h2 className="text-4xl font-extrabold text-center text-gray-900 mb-6">
                        Recursos que Impulsionam o Cuidado
                    </h2>
                    <p className="text-xl text-center text-gray-500 mb-16 max-w-3xl mx-auto">
                        Desenvolvido pensando na família e nos profissionais, oferecendo soluções que realmente fazem a diferença.
                    </p>
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                        {vantagens.map((vantagem, index) => (
                            <VantagensConecte
                                key={index}
                                title={vantagem.title}
                                description={vantagem.description}
                                icon={vantagem.icon}
                            />
                        ))}
                    </div>
                </div>
            </section>

            <section className="py-24 bg-white">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <h2 className="text-4xl font-extrabold text-center text-gray-900 mb-16">
                        Quem Confia e Recomenda
                    </h2>
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                        {depoimentosUsuarios.map((depoimento, index) => (
                            <Depoimento
                                key={index}
                                text={depoimento.text}
                                author={depoimento.author}
                            />
                        ))}
                    </div>
                </div>
            </section>

             <section className="bg-blue-800 py-20">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col items-center text-center">
                    <h3 className="text-4xl font-black text-white mb-4">
                        Sua Próxima Geração de Cuidado Começa Aqui.
                    </h3>
                    <p className="text-xl text-blue-200 mb-8 max-w-2xl">
                        Cadastre-se hoje e descubra como a ConecteCare pode simplificar a saúde e o bem-estar.
                    </p>
                    <button 
                        onClick={handleCadastroClick}
                        className="
                            hover: cursor-pointer
                            inline-flex items-center 
                            bg-white text-blue-800 
                            px-12 py-4 rounded-full font-extrabold text-xl 
                            shadow-2xl hover:bg-gray-200 transition-all duration-300 
                            transform hover:scale-105
                        "
                    >
                        Acessar Cadastro
                        <ArrowRightIcon />
                    </button>
                </div>
            </section>
        </Layout>
    );
}
