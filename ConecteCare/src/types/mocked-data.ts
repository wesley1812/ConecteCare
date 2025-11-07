import type { MedicamentoType } from "./interfaces";

export const MOCKED_MEDICATION: MedicamentoType[] = [
    { id: 1, nome: "Losartana", dosagem: "50mg", frequencia: "1x ao dia", proximaDose: "Hoje", horario: "08:00h", ativo: true },
    { id: 2, nome: "Metformina", dosagem: "850mg", frequencia: "2x ao dia", proximaDose: "Hoje", horario: "19:00h", ativo: true },
    { id: 3, nome: "Amoxicilina", dosagem: "500mg", frequencia: "3x ao dia", proximaDose: "Amanhã", horario: "07:00h", ativo: true },
];

export const ESPECIALIDADES_DISPONIVEIS = [
    'Cardiologia',
    'Neurologia',
    'Psiquiatria',
    'Fisioterapia',
    'Clínica Geral'
];

export const MEDICOS_DISPONIVEIS = [
    'Dr. João Silva',
    'Drª. Ana Pereira',
    'Dr. Carlos Santos',
    'Drª. Lúcia Mendes',
    'Drª Beatriz Claudino Rosa'
];

export const PATOLOGIAS_EXISTENTES = [
    "Câncer de Mama",
    "Câncer de Próstata",
    "Câncer de Pulmão de Células Não Pequenas",
    "Câncer Colorretal",
    "Câncer de Pele(Melanoma)",
    "Câncer de Pele(Não Melanoma)",
    "Câncer de Bexiga",
    "Linfoma Não Hodgkin",
    "Câncer do Rim",
    "Leucemia Mieloide Aguda(LMA)",
    "Câncer de Pâncreas",
    "Câncer de Tireoide",
    "Câncer de Endométrio",
    "Câncer de Estômago",
    "Câncer de Ovário"
]