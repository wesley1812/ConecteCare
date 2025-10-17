import type { VantagensConecteProps } from "../types/interfaces";
import type { DepoimentoProps } from "../types/interfaces";
import type { FAQItemProps } from '../types/interfaces';
import type { TermoProps } from "../types/interfaces";

export function VantagensConecte({ title, description, icon }: VantagensConecteProps) {
  return (
    <div className="bg-white p-6 rounded-lg shadow-md text-center">
      <div className="text-4xl mb-4">{icon}</div>
      <h3 className="text-xl font-semibold text-gray-900 mb-2">{title}</h3>
      <p className="text-gray-600">{description}</p>
    </div>
  );
};

export function Depoimento({ text, author }: DepoimentoProps) {
  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <p className="text-gray-700 italic mb-4">"{text}"</p>
      <p className="text-gray-900 font-semibold">- {author}</p>
    </div>
  );
};

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
