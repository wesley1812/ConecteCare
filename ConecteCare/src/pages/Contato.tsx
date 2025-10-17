import {Layout} from "../components/Layout";
import {CardContato} from "../components/CardContato";
import type { ContactInfo } from "../types/interfaces";

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

  // aqui vai mandar para o whatsapp
  const handleWhatsAppClick = () => {
    window.open("https://wa.me/551130535131", "_blank");
  };

  return (
    <Layout>
      <div className="py-12 bg-gray-50 min-h-screen">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold text-center text-gray-900 mb-12">
            Entre em Contato
          </h1>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
            {contactInfo.map((info, index) => (
              <CardContato key={index} info={info} />
            ))}
          </div>

          <div className="bg-white p-6 rounded-lg shadow-md text-center max-w-md mx-auto">
            <div className="text-3xl mb-4">💬</div>
            <h2 className="text-xl font-semibold text-gray-900 mb-4">WhatsApp</h2>
            <button 
              onClick={handleWhatsAppClick}
              className="bg-green-500 text-white px-6 py-3 rounded-lg font-semibold hover:bg-green-600 transition-colors"
            >
              Fale pelo WhatsApp
            </button>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Contato;