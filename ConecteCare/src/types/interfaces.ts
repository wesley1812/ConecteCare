export interface TeamMember {
  name: string;
  rm: string;
  turma: string;
  github: string;
  linkedin: string;
  image: string;
}

export interface FAQItemProps {
  item: FAQItem;
  isOpen: boolean;
  onToggle: () => void;
}

export interface FAQItem {
  question: string;
  answer: string;
}

export interface TermoProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
}

export interface VantagensConecteProps {
  title: string;
  description: string;
  icon: string;
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

export interface ContactInfo {
  title: string;
  content: string;
  icon: string;
}

export interface CardContatos {
  info: ContactInfo;
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

export interface DepoimentoProps {
  text: string;
  author: string;
}

export interface FormProps {
  formData: {
    nome: string;
    idade: number;
    cpf: string;
    cpfPaciente: string;
    email: string;
    telefone: string;
    parentesco: string;
    aceitarTermo: boolean;
  };
  
  handleInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onSubmit: (e: React.FormEvent) => void;
  onTermoOpen: () => void;
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
