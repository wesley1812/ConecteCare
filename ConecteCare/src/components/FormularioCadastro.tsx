import React from "react";
import type { FormProps } from "../types/interfaces";

const FormularioCadastro: React.FC<FormProps> = ({
  formData,
  handleInputChange,
  onSubmit,
  onTermoOpen,
}) => {


  return (
    <form onSubmit={onSubmit} className="bg-white p-8 rounded-lg shadow-md">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Aqui são os dados do formulário - commit */}
        <div>
          <label htmlFor="nome" className="block text-sm font-medium text-gray-700 mb-2">
            Nome Completo:
          </label>
          <input
            type="text"
            id="nome"
            name="nome"
            value={formData.nome}
            onChange={handleInputChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label htmlFor="idade" className="block text-sm font-medium text-gray-700 mb-2">
            Idade:
          </label>
          <input
            type="number"
            id="idade"
            name="idade"
            value={formData.idade}
            onChange={handleInputChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div>
          <label htmlFor="cpf" className="block text-sm font-medium text-gray-700 mb-2">
            CPF do Cuidador:
          </label>
          <input
            type="text"
            id="cpf"
            name="cpf"
            value={formData.cpf}
            onChange={handleInputChange}
            placeholder="XXX.XXX.XXX-XX"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        
        <div>
          <label htmlFor="cpfPaciente" className="block text-sm font-medium text-gray-700 mb-2">
            CPF do Paciente:
          </label>
          <input
            type="text"
            id="cpfPaciente"
            name="cpfPaciente"
            value={formData.cpfPaciente}
            onChange={handleInputChange}
            placeholder="XXX.XXX.XXX-XX"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
            Email do Cuidador:
          </label>
          <input
            type="email"
            id="email"
            name="email"
            value={formData.email }
            onChange={handleInputChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        
        <div>
          <label htmlFor="idade" className="block text-sm font-medium text-gray-700 mb-2">
            Relação com o Paciente:
          </label>
          <input
            type="string"
            id="parentesco"
            name="parentesco"
            value={formData.parentesco}
            onChange={handleInputChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label htmlFor="telefone" className="block text-sm font-medium text-gray-700 mb-2">
            Telefone para Contato:
          </label>
          <input
            type="tel"
            id="telefone"
            name="telefone"
            value={formData.telefone}
            onChange={handleInputChange}
            placeholder="(XX) XXXXX-XXXX"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        
        <div>
          <label htmlFor="residencia" className="block text-sm font-medium text-gray-700 mb-2">
            Comprovante de Residência (Foto):
          </label>
          <input
            type="file"
            id="residencia"
            name="residencia"
            accept="image/*"
            onChange={handleInputChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        
        <div>
          <label htmlFor="foto" className="block text-sm font-medium text-gray-700 mb-2">
            Foto 3x4:
          </label>
          <input
            type="file"
            id="foto"
            name="foto"
            accept="image/*"
            onChange={handleInputChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>
      
      {/* aqui é o Termo de Compromisso - commit */}
      <div className="mt-8">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Termo de Compromisso do Cuidador</h2>
        <button
          type="button"
          onClick={onTermoOpen}
          className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 transition-colors"
        >
          Ler Termo de Compromisso
        </button>
        <div className="mt-4 flex items-center">
          <input
            type="checkbox"
            id="aceitarTermo"
            name="aceitarTermo"
            checked={formData.aceitarTermo}
            onChange={handleInputChange}
            className="mr-2"
          />
          <label htmlFor="aceitarTermo" className="text-sm text-gray-700">
            Declaro que li e concordo com o Termo de Compromisso.
          </label>
        </div>
      </div>
      <button
        type="submit"
        className="w-full mt-8 bg-green-600 text-white py-3 rounded-md font-semibold hover:bg-green-700 transition-colors"
      >
        Enviar Cadastro
      </button>
    </form>
  );
};

export default FormularioCadastro;