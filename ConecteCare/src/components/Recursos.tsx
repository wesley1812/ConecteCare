import type { DepoimentoProps, VantagemProps } from "../types/interfaces";
import type { FAQItemProps } from '../types/interfaces';
import type { TermoProps } from "../types/interfaces";

export const VantagensConecte = ({ title, description, icon }: VantagemProps) => (
    <div className="bg-white p-6 md:p-8 rounded-3xl shadow-2xl border border-gray-100 
                    hover:shadow-3xl transition-all duration-500 transform hover:-translate-y-2 
                    h-full flex flex-col items-start ease-in-out cursor-pointer">
        
        <div className="text-4xl mb-6 bg-gradient-to-r from-blue-500 to-cyan-500 p-4 rounded-xl shadow-lg transform rotate-[-4deg] group-hover:rotate-0 transition-transform duration-500">
            {icon}
        </div>

        <h3 className="text-2xl font-extrabold text-gray-900 mb-3">{title}</h3>
        <p className="text-gray-600 flex-grow text-base leading-relaxed">{description}</p>
    </div>
);

export const Depoimento = ({ text, author }: DepoimentoProps) => (
    <div className="bg-gray-100 p-8 rounded-3xl shadow-xl hover:shadow-2xl transition-shadow duration-300 h-full flex flex-col justify-between border-l-4 border-cyan-500">
        
        {/* Aspas grandes e estilizadas */}
        <svg className="w-10 h-10 text-cyan-500 mb-4 opacity-75" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path d="M13.473 21.84c-3.235 0-5.748-1.577-7.533-4.73C4.157 14.156 3 11.238 3 8.32V3h6.587v5.32c0 1.25.178 2.22.535 2.91.356.687 1.05 1.03 2.08 1.03 1.107 0 1.838-.343 2.195-1.03.356-.69.534-1.66.534-2.91V3H21v5.32c0 2.918-1.157 5.836-3.09 8.783-1.785 3.153-4.298 4.73-7.537 4.73z"/>
        </svg>

        <blockquote className="text-gray-800 mb-6 text-xl font-medium leading-relaxed italic">
            {text}
        </blockquote>
        <p className="font-extrabold text-lg text-blue-700">
            — {author}
        </p>
    </div>
);

export function FaqItemComponent({ item, isOpen, onToggle }: FAQItemProps) {
  console.log("Renderizando FaqItem:", item.question);
  
  return (
    <div className="border border-gray-200 rounded-lg">
      <button
        onClick={onToggle}
        className="bg-white w-full px-6 py-4 text-left flex justify-between items-center hover:bg-blue-50 focus:outline-none"
      >
        <h3 className="text-lg font-medium text-gray-900">{item.question}</h3>
        <span
          className={`transform transition-transform duration-200 ${
            isOpen ? 'rotate-180' : 'rotate-0'
          }`}
        >
          ▼
        </span>
      </button>
      {isOpen && (
        <div className="bg-white px-6 pb-4">
          <p className="text-gray-700">{item.answer}</p>
        </div>
      )}
    </div>
  );
};

export function Termo({ isOpen, onClose, children }: TermoProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-8 rounded-lg max-w-2xl max-h-96 overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-bold">Termo de Compromisso</h3>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700 text-2xl">
            ×
          </button>
        </div>
        {children}
      </div>
    </div>
  );
};
