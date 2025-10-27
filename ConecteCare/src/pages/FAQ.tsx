import { useState } from "react";
import {Layout} from "../components/Layout";
import {FaqItemComponent} from "../components/Recursos";
import type { FAQItem } from "../types/interfaces";


export function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const faqInfo: FAQItem[] = [
    {
      question: "Não consigo iniciar a chamada. O que pode estar acontecendo?",
      answer: "Verifique sua conexão com a internet e confira se o navegador está atualizado (Chrome, Firefox ou Edge). Certifique-se também de que não há outro aplicativo usando sua câmera ou microfone."
    },
    {
      question: "A câmera e o microfone não estão funcionando. Como configuro?",
      answer: "Você deve dar permissão ao navegador para acessar a câmera e o microfone. Geralmente, uma notificação aparece no canto superior esquerdo. Se não aparecer, verifique as configurações de privacidade e segurança do seu navegador para liberar o acesso ao nosso domínio."
    },
    {
      question: "Qual a velocidade mínima de internet recomendada para a teleconsulta?",
      answer: "Para garantir uma experiência fluida e sem interrupções de vídeo/áudio, recomendamos uma conexão de internet estável com velocidade mínima de 10 Mbps de download e upload."
    },
    {
      question: "Como confirmo se minha consulta foi agendada corretamente?",
      answer: "Após o agendamento, você receberá uma confirmação automática por e-mail com todos os detalhes. Você também pode verificar o status e a data da sua consulta na 'Área do Usuário' da plataforma."
    },
    {
      question: "Esqueci minha senha. Como posso recuperá-la?",
      answer: "Na tela de login, clique na opção 'Esqueci minha senha'. Informe o seu e-mail cadastrado e enviaremos um link seguro para que você possa redefinir uma nova senha."
    },
    {
      question: "Há algum número de telefone para suporte técnico?",
      answer: "Sim! Para suporte imediato, você pode entrar em contato através do telefone: +55 11 3053-5131 ou utilizar nosso canal de atendimento via WhatsApp, ambos disponíveis na nossa página de Contato."
    },
    {
      question: "A teleconsulta é segura? Meus dados estão protegidos?",
      answer: "Com certeza! A segurança é nossa prioridade. Todas as teleconsultas são criptografadas de ponta a ponta e seguimos rigorosamente a Lei Geral de Proteção de Dados (LGPD) e protocolos de sigilo médico."
    }
  ];

  const handleToggle = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <Layout>
      <div className="bg-gray-50 min-h-screen">
        
        <div className="bg-gradient-to-r from-blue-700 to-cyan-500 text-white py-16 sm:py-20 shadow-xl">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                <span className="text-cyan-200 uppercase tracking-widest text-sm font-bold">Ajuda & Suporte</span>
                <h1 className="text-4xl sm:text-5xl font-extrabold mt-2 tracking-tight">
                    Perguntas Frequentes (FAQ)
                </h1>
                <p className="mt-4 text-xl text-blue-100 max-w-2xl mx-auto">
                    Encontre respostas rápidas para as dúvidas mais comuns sobre o uso da nossa plataforma de telemedicina.
                </p>
            </div>
        </div>

        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 -mt-8 pb-12"> 
          
          <div className="bg-white p-6 sm:p-10 rounded-2xl shadow-2xl border border-gray-100">
            <div className="space-y-4">
              {faqInfo.map((item, index) => (
                <FaqItemComponent
                  key={index}
                  item={item}
                  isOpen={openIndex === index}
                  onToggle={() => handleToggle(index)}
                />
              ))}
            </div>
          </div>
          
          <div className="mt-12 text-center p-8 bg-blue-50 rounded-2xl border border-blue-200 shadow-md">
                <h2 className="text-2xl font-bold text-blue-800 mb-2">Ainda Tem Dúvidas?</h2>
                <p className="text-gray-600 mb-6">
                    Se sua pergunta não foi respondida, nossa equipe de suporte está pronta para ajudar.
                </p>
                <a 
                    href="/contato" 
                    className="inline-flex items-center justify-center 
                                bg-cyan-600 text-white px-8 py-3 rounded-xl font-bold text-lg 
                                shadow-lg shadow-cyan-500/50 
                                transition-all duration-300 transform hover:scale-[1.02] hover:bg-cyan-700"
                >
                    Falar com o Suporte
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 ml-2" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"/><path d="M12 5l7 7-7 7"/></svg>
                </a>
          </div>

        </div>
      </div>
    </Layout>
  );
}
