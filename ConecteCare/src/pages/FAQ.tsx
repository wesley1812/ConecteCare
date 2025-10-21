import { useState } from "react";
import {Layout} from "../components/Layout";
import {FaqItemComponent} from "../components/Recursos";
import type { FAQItem } from "../types/interfaces";

export function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const faqInfo: FAQItem[] = [
    {
      question: "Não consigo iniciar a chamada. O que pode estar acontecendo?",
      answer: "Verifique sua conexão com a internet e confira se o navegador está atualizado."
    },
    {
      question: "A câmera e o microfone não estão funcionando. Como configuro?",
      answer: "Dê permissão ao navegador para acessar câmera e microfone nas configurações."
    },
    {
      question: "Qual a velocidade mínima de internet recomendada para a teleconsulta?",
      answer: "Recomenda-se pelo menos 10 Mbps para chamadas em vídeo sem interrupções."
    },
    {
      question: "Como confirmo se minha consulta foi agendada corretamente?",
      answer: "Verifique seu email ou área do usuário na plataforma para a confirmação."
    },
    {
      question: "Esqueci minha senha. Como posso recuperá-la?",
      answer: "Utilize a opção 'Esqueci minha senha' na tela de login para redefinir."
    },
    {
      question: "Há algum número de telefone para suporte técnico?",
      answer: "Sim! Você pode entrar em contato pelo telefone disponível na área de suporte."
    },
    {
      question: "A teleconsulta é segura? Meus dados estão protegidos?",
      answer: "Sim! Todas as consultas seguem protocolos rigorosos de privacidade e criptografia."
    }
  ];

  const handleToggle = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <Layout>
      <div className="py-12 bg-gray-50 min-h-screen">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold text-center text-gray-900 mb-8">
            Perguntas Frequentes sobre Telemedicina
          </h1>
          
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
      </div>
    </Layout>
  );
};
