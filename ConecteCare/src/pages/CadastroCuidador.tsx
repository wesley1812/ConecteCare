import { useState, type FormEvent } from "react";
import { useNavigate } from "react-router-dom"; 
import {Layout} from "../components/Layout";
import FormularioCadastro from "../components/FormularioCadastro";
import {Termo} from "../components/Recursos";
import { useForm } from "../types/useForm";

export function CadastroCuidador() {
  const navigate = useNavigate();
  
  const { formData, handleInputChange, handleSubmit } = useForm();
  
  const [isTermoOpen, setIsTermoOpen] = useState(false);

  const toggleTermo = () => setIsTermoOpen((prev) => !prev);

  const handleFinalSubmit = async (event: FormEvent<Element>) => {
    await handleSubmit(event);
    navigate('/menu-cuidador'); 
  };

  return (
    <Layout>
      <div className="py-12 bg-gray-50 min-h-screen">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold text-center text-gray-900 mb-8">
            Cadastro do Cuidador
          </h1>

          <FormularioCadastro
            formData={formData}
            handleInputChange={handleInputChange}
            onSubmit={handleFinalSubmit} 
            onTermoOpen={toggleTermo}
          />

          <Termo isOpen={isTermoOpen} onClose={toggleTermo}>
             <div className="text-sm text-gray-700 space-y-4">
              <p>
                <strong>Declaração de Responsabilidade:</strong> Eu, cuidador acima identificado, assumo total compromisso com o cuidado e acompanhamento do paciente sob minha responsabilidade em telemedicina...
              </p>
              <p>
                <strong>Responsabilidades:</strong>
              </p>
              <ul className="list-disc pl-6 space-y-1">
                <li>Seguir as recomendações médicas corretamente.</li>
                <li>Comparecer às consultas remotas e comunicar dificuldades.</li>
                <li>Manter contato com a equipe médica em casos de emergência.</li>
                <li>Zelar pela segurança e bem-estar do paciente.</li>
                <li>Fornecer informações corretas sobre o estado do paciente.</li>
              </ul>
              <p>Ao aceitar este termo, declaro estar ciente de todas as responsabilidades envolvidas e me comprometo a seguir as diretrizes médicas.</p>
            </div>
          </Termo>
        </div>
      </div>
    </Layout>
  );
};

export default CadastroCuidador;