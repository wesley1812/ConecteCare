import { z } from "zod";

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


export const formSchemaAgendar  = z.object({
    doctorName: z
        .string()
        .min(1, "Selecione um médico disponível."),
        
    especialidade: z
        .string()
        .min(1, "Especialidade é obrigatória. Selecione uma opção"),
        
    data: z.string().min(1, "A data é obrigatória."),
    
    horario: z.string().min(1, "O horário é obrigatório.")
});

export type FormSchemaAgendar  = z.infer<typeof formSchemaAgendar>

export const formSchemaRemarcar  = z.object({
    doctorName: z
        .string()
        .min(1, "Selecione um médico disponível."),

    especialidade: z
        .string()
        .min(1, "Especialidade é obrigatória. Selecione uma opção"),
        
    novaData: z.string().min(1, "A nova data é obrigatória."),
    
    novoHorario: z.string().min(1, "O novo horário é obrigatório.")
});

export type FormSchemaRemarcar  = z.infer<typeof formSchemaRemarcar>

export const formSchemaCancelar  = z.object({
    razaoCancelamento: z.string().optional(),
})

export type FormSchemaCancelar  = z.infer<typeof formSchemaCancelar>