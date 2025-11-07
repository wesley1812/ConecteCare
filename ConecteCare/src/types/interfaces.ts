export interface FAQItemProps {
  item: FAQItem;
  isOpen: boolean;
  onToggle: () => void;
}

export type FAQItem = {
  question: string;
  answer: string;
}

export interface TermoProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
}

export interface VantagemProps {
  title: string;
  description: string;
  icon: string;
}

export interface DepoimentoProps {
  text: string;
  author: string;
}

export interface ContactInfo {
  title: string;
  content: string;
  icon: string;
}

export interface TeamMember {
  name: string;
  rm: string;
  turma: string;
  github: string;
  linkedin: string;
  image: string;
}

export interface TeamCardProps {
  member: TeamMember;
}

export interface HeaderProps {
  isMenuOpen: boolean;
  toggleMenu: () => void;
}

export interface LayoutProps {
  children: React.ReactNode;
}

export interface TeleconsultaData {
  id: string;
  patientName: string;
  patientAge: number;
}

export interface Cuidador {
  id: string;
  nome: string;
  idade: number;
  cpfCuidador: string;
  cpfPaciente: string;
  cepCuidador: string;
  cepPaciente: string;
  email: string;
  senha: string;
  telefoneContato: string;
  correlacaoPaciente: string;
  // residencia: File;
  // foto: File;
  aceitarTermo: boolean;
};

export interface Paciente {
  id: string;
  nome: string;
  idade: number;
  cpfPaciente: string;
  cepPaciente: string;
  email: string;
  senha: string;
  telefoneContato: string;
  patologia: string;
  aceitarTermo: boolean;
};

export interface MedicamentoType {
  id: number;
  nome: string;
  dosagem: string;
  frequencia: string;
  proximaDose: string;
  horario: string;
  ativo: boolean;
}

export interface Consulta {
  id: string;
  type: string;
  date: string;
  time: string;
  cpfPaciente: string;
  doctorName: string;
  doctorSpecialty: string;
}

export interface Medico {
  id: string;
  nome: string;
  especialidade: string;
}

export interface HealthIndicatorType {
  name: string;
  value: string;
  percentage: number;
  color: string;
  icon: React.ReactNode
}