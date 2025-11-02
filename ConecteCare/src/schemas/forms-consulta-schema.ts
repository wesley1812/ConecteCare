import { z } from "zod";

export const formSchemaAgendar  = z.object({
    especialidade: z
        .string()
        .min(1, "Especialidade é obrigatória. Selecione uma opção"),
    data: z
    .string(),
    horario: z.
    string()
})

export type FormSchemaAgendar  = z.infer<typeof formSchemaAgendar>

export const formSchemaRemarcar  = z.object({
    especialidade: z
        .string()
        .min(1, "Especialidade é obrigatória. Selecione uma opção"),
    novaData: z
    .string(),
    novoHorario: z.
    string()
})

export type FormSchemaRemarcar  = z.infer<typeof formSchemaRemarcar>

export const formSchemaCancelar  = z.object({
    especialidade: z
        .string()
        .min(1, "Especialidade é obrigatória. Selecione uma opção"),
    novaData: z
    .string(),
    novoHorario: z.
    string()
})

export type FormSchemaCancelar  = z.infer<typeof formSchemaCancelar>

