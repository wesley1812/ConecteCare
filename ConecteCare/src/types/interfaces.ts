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

export interface Patient {
  id: string;
  name: string;
  age: number;
  medicalHistory: string;
}

export interface HealthIndicatorType {
  name: string;
  value: string;
  percentage: number;
  color: string;
}

export interface AppointmentType {
  id: number;
  type: string;
  date: string;
  time: string;
}

export interface Appointment {
  id: number;
  type: string;
  date: string;
  time: string;
}

export interface AgendamentoConsultaProps {
  appointment: Appointment;
  onContact: (appointmentId: number) => void;
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

export interface IndicadorSaude {
  name: string;
  value: string;
  percentage: number;
  color: string;
}

export interface IndicadorSaudeProps {
  indicador: IndicadorSaude;
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
    cpf: string;
    cpfPaciente: string;
    email: string;
    senha: string;
    telefone: string;
    parentesco: string;
    // residencia: File;
    // foto: File;
    aceitarTermo: boolean;
  };

export interface Paciente {
    id: string;
    nome: string;
    idade: number;
    cpfPaciente: string;
    email: string;
    senha: string;
    telefone: string;
    patologia: string;
    aceitarTermo: boolean;
  };