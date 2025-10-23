import {Layout} from "../components/Layout";
import {CardContato} from "../components/CardContato";
import type { ContactInfo } from "../types/interfaces";

const PhoneIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="w-10 h-10 text-cyan-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.63A2 2 0 0 1 3.08 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
);

export function Contato() {

    const contactInfo: ContactInfo[] = [
        {
            title: "Telefone",
            content: "Central de Atendimento: +55 11 3053-5131",
            icon: "📞"
        },
        {
            title: "Email", 
            content: "Suporte: ouvidoria@hcor.com.br",
            icon: "📧"
        },
        {
            title: "Endereço",
            content: "Rua Desembargador Eliseu Guilherme, 147 - Paraíso, São Paulo - SP",
            icon: "📍"
        }
    ];

    // aqui agente vai mandar para o whatsapp
    const handleWhatsAppClick = () => {
        window.open("https://wa.me/551130535131", "_blank");
    };

    return (
        <Layout>
            <div className="min-h-[90vh] flex">
                
                <div className="hidden lg:flex w-full lg:w-1/2 items-center justify-center 
                                bg-gradient-to-r from-blue-700 to-cyan-600 
                                relative overflow-hidden p-12">

                    <div className="absolute inset-0 opacity-10">
                        <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
                            <defs>
                                <pattern id="grid-contato" width="80" height="80" patternUnits="userSpaceOnUse">
                                    <path d="M 80 0 L 0 0 0 80" fill="none" stroke="#2c5282" strokeWidth="0.5" />
                                </pattern>
                            </defs>
                            <rect width="100%" height="100%" fill="url(#grid-contato)" />
                        </svg>
                    </div>

                    <div className="text-white text-center relative z-10 max-w-md">
                        <h2 className="text-5xl font-extrabold mb-4 tracking-tight">
                            Tire Suas Dúvidas
                        </h2>
                        <p className="text-xl text-blue-200 mt-4">
                            Nossa equipe de suporte está pronta para ajudá-lo com qualquer questão relacionada à plataforma.
                        </p>
                    </div>
                </div>

                <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-12 lg:p-16 bg-gray-50">
                    <div className="max-w-md w-full bg-white rounded-3xl shadow-3xl overflow-hidden p-8 sm:p-12 
                                    border border-gray-100 transition-shadow duration-500">
                        
                        <div className="text-center mb-10">
                            <div className="inline-block p-4 bg-blue-100 rounded-2xl mb-4 shadow-inner">
                                <PhoneIcon />
                            </div>
                            <h1 className="text-3xl font-black text-gray-900 mb-2">
                                Canais de Atendimento
                            </h1>
                            <p className="text-gray-500 text-lg">
                                Escolha a melhor forma de falar com a nossa equipe.
                            </p>
                        </div>
                        
                        <div className="grid grid-cols-1 gap-6 mb-8">
                            {contactInfo.map((info, index) => (
                                <CardContato key={index} info={info} />
                            ))}
                        </div>

                        <div className="mt-8 pt-6 border-t border-gray-100 text-center">
                            <h2 className="text-xl font-bold text-gray-800 mb-4">Suporte Rápido via WhatsApp</h2>
                            <button 
                                onClick={handleWhatsAppClick}
                                className="
                                    hover:cursor-pointer
                                    group inline-flex items-center justify-center w-full
                                    bg-gradient-to-r from-green-500 to-green-600 text-white 
                                    px-12 py-3 rounded-xl font-extrabold text-xl 
                                    shadow-xl shadow-green-500/50 
                                    transition-all duration-300 transform hover:scale-[1.02] hover:shadow-green-400/80
                                "
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6 mr-2" viewBox="0 0 24 24" fill="currentColor"><path d="M12.04 2c-5.54 0-10 4.46-10 10 0 1.95.55 3.82 1.58 5.42l-1.03 3.8 3.8-.99c1.58.87 3.33 1.34 5.65 1.34 5.54 0 10-4.46 10-10 0-5.54-4.46-10-10-10zm.01 18.2c-1.89 0-3.6-.52-5.08-1.42l-.36-.21-3.51.92.94-3.4-.22-.35c-.88-1.47-1.34-3.15-1.34-4.88 0-4.57 3.7-8.28 8.28-8.28 4.57 0 8.28 3.7 8.28 8.28 0 4.57-3.7 8.28-8.28 8.28zm4.1-5.74c-.23-.12-.87-.43-.99-.48-.12-.05-.22-.07-.31.07-.09.15-.35.48-.42.58-.07.1-.15.12-.27.05-.12-.05-.51-.19-.97-.6-.36-.34-.61-.76-.68-.88-.07-.12 0-.19.05-.31.04-.08.09-.12.13-.21.04-.08.02-.15-.01-.22-.04-.07-.31-.75-.43-1.02-.12-.26-.24-.22-.32-.22-.09 0-.19-.01-.29-.01-.07 0-.19.03-.29.15-.1.12-.38.37-.38.91 0 .54.39 1.05.44 1.13.05.08.77 1.18 1.86 1.6.26.1.47.16.63.2.16.04.4.03.55.03.15 0 .42-.06.51-.16.09-.09.28-.43.35-.71.07-.28.07-.52.05-.58-.02-.06-.09-.1-.19-.15z"/></svg>
                                Enviar Mensagem
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </Layout>
    );
}
