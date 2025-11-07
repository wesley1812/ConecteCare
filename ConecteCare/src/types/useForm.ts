import { useState } from "react";
import { useNavigate } from "react-router-dom";

interface FormData {
  nome: string;
  idade: number;
  cpfCuidador: string;
  cpfPaciente: string;
  email: string;
  telefoneContato: string;
  correlacaoPaciente: string;
  residencia: File | null;
  foto: File | null;
  aceitarTermo: boolean;
}

const initialFormData: FormData = {
  nome: "",
  idade: 0,
  cpfCuidador: "",
  cpfPaciente: "",
  email: "",
  telefoneContato: "",
  correlacaoPaciente: "",
  residencia: null,
  foto: null,
  aceitarTermo: false,
};

// aqui são os "regex" nossos
const validatecpfCuidador = (cpfCuidador: string): boolean => /^\d{3}\.\d{3}\.\d{3}-\d{2}$/.test(cpfCuidador);
const validatePhone = (phone: string): boolean => /^\(\d{2}\) \d{5}-\d{4}$/.test(phone);
const validateEmail = (email: string): boolean => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

export const useForm = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState<FormData>(initialFormData);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked, files } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : type === "file" ? (files ? files[0] : null) : value,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Aqui são as nossas validações para os inputs no forms
    if (!formData.nome.trim()) return alert("Por favor, preencha o Nome Completo.");
    if (!formData.cpfCuidador.trim() || !validatecpfCuidador(formData.cpfCuidador)) return alert("Por favor, insira um cpfCuidador do Cuidador válido (XXX.XXX.XXX-XX).");
    if (!formData.cpfPaciente.trim() || !validatecpfCuidador(formData.cpfPaciente)) return alert("Por favor, insira um cpfCuidador do Paciente válido (XXX.XXX.XXX-XX).");
    if (!formData.email.trim() || !validateEmail(formData.email)) return alert("Por favor, insira um email válido.");
    if (!formData.telefoneContato.trim() || !validatePhone(formData.telefoneContato)) return alert("Por favor, insira um telefoneContato válido ((XX) XXXXX-XXXX).");
    if (!formData.residencia) return alert("Por favor, selecione uma imagem para o Comprovante de Residência.");
    if (!formData.foto) return alert("Por favor, selecione uma imagem para a Foto 3x4.");
    if (!formData.aceitarTermo) return alert("Você deve aceitar o Termo de Compromisso para concluir o cadastro.");

    alert("Cadastro realizado com sucesso!");
    const newId = Math.floor(Math.random() * 1000) + 1;
    navigate(`/menu-cuidador/${newId}`);
  };

  return { formData, handleInputChange, handleSubmit };
};