import {Layout} from "../components/Layout";
import { PhoneIcon } from "../styles/icons";


export function Contato() {

    const handleWhatsAppClick = () => {
        window.open("https://wa.me/551130535131", "_blank");
    };

    const googleMapsUrl = "https://maps.google.com/?q=Rua+Desembargador+Eliseu+Guilherme,+147+-+Paraíso,+São+Paulo+-+SP";

    return (
        <Layout>
            <div className="bg-gray-50 min-h-screen">
                
                <div className="bg-gradient-to-r from-blue-700 to-cyan-500 text-white py-16 sm:py-20 shadow-xl">
                    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                        <span className="text-cyan-200 uppercase tracking-widest text-sm font-bold">Canais de Atendimento</span>
                        <h1 className="text-4xl sm:text-5xl font-extrabold mt-2 tracking-tight">
                            Fale Conosco
                        </h1>
                        <p className="mt-4 text-xl text-blue-100 max-w-2xl mx-auto">
                            Entre em contato com a nossa equipe de suporte. Estamos prontos para ajudar.
                        </p>
                    </div>
                </div>

                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 -mt-8 pb-12"> 
                    <div className="flex items-center justify-center">
                        
                        <div className="w-full max-w-lg bg-white rounded-3xl shadow-3xl overflow-hidden p-8 sm:p-12 
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
                            
                            <div className="mb-8">
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

                            <div className="flex items-center justify-center my-6">
                                <span className="border-t border-gray-200 w-1/4"></span>
                                <span className="px-4 text-gray-400 text-sm uppercase font-semibold">Outros Canais</span>
                                <span className="border-t border-gray-200 w-1/4"></span>
                            </div>


                            <div className="grid grid-cols-3 gap-4 text-center">
                                
                                <a href="tel:+551130535131" className="group p-2 rounded-lg hover:bg-gray-100 transition-colors">
                                    <div className="inline-block p-3 bg-gray-100 rounded-xl group-hover:bg-blue-100 transition-colors">
                                        <span className="text-3xl">📞</span>
                                    </div>
                                    <h3 className="text-sm font-bold text-gray-800 mt-2">telefoneContato</h3>
                                    <p className="text-xs text-gray-500 group-hover:text-blue-600 transition-colors">Ligar agora</p>
                                </a>

                                <a href="mailto:ouvidoria@hcor.com.br" className="group p-2 rounded-lg hover:bg-gray-100 transition-colors">
                                    <div className="inline-block p-3 bg-gray-100 rounded-xl group-hover:bg-blue-100 transition-colors">
                                        <span className="text-3xl">📧</span>
                                    </div>
                                    <h3 className="text-sm font-bold text-gray-800 mt-2">Email</h3>
                                    <p className="text-xs text-gray-500 group-hover:text-blue-600 transition-colors">Enviar email</p>
                                </a>

                                <a href={googleMapsUrl} target="_blank" rel="noopener noreferrer" className="group p-2 rounded-lg hover:bg-gray-100 transition-colors">
                                    <div className="inline-block p-3 bg-gray-100 rounded-xl group-hover:bg-blue-100 transition-colors">
                                        <span className="text-3xl">📍</span>
                                    </div>
                                    <h3 className="text-sm font-bold text-gray-800 mt-2">Endereço</h3>
                                    <p className="text-xs text-gray-500 group-hover:text-blue-600 transition-colors">Ver no mapa</p>
                                </a>
                                
                            </div>

                        </div>
                    </div>
                </div>
            </div>
        </Layout>
    );
}