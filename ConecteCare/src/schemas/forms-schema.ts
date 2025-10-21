import { z } from "zod";

export const formSchemaCuidador = z.object({
    nome: z.string()
        .min(1, "Nome é obrigatório"),
    idade: z.number()
        .min(18, "Cuidador deve ter pelo menos 18 anos"),
    cpf: z.string()
        .regex(/^\d{3}\.\d{3}\.\d{3}-\d{2}$/, "CPF inválido"),
    cpfPaciente: z.string()
        .regex(/^\d{3}\.\d{3}\.\d{3}-\d{2}$/, "CPF do Paciente inválido"),
    email: z.string()
        .email("Email inválido"),
    telefone: z.string()
        .regex(/^\(\d{2}\) \d{5}-\d{4}$/, "Telefone inválido"),
    parentesco: z.string()
        .min(1, "Parentesco é obrigatório"),
    residencia: z.instanceof(File,
        { message: "Comprovante de Residência é obrigatório" }),
    foto: z.instanceof(File,
        { message: "Foto 3x4 é obrigatória" }),
    aceitarTermo: z.boolean()
        .refine((val: boolean) => val === true,
        { message: "Você deve aceitar o Termo de Compromisso" }),
})

export type FormSchemaCuidador = z.infer<typeof formSchemaCuidador>;

export const formSchemaPaciente = z.object({
    nome: z.string()
        .min(1, "Nome é obrigatório"),
    idade: z.number()
        .min(0, "Idade deve ser um número positivo"),
    cpfPaciente: z.string()
        .regex(/^\d{3}\.\d{3}\.\d{3}-\d{2}$/, "CPF do Paciente inválido"),
    email: z.string()
        .email("Email inválido"),
    telefone: z.string()
        .regex(/^\(\d{2}\) \d{5}-\d{4}$/, "Telefone inválido"),
    patologia: z.string()
        .min(1, "Patologia é obrigatória"),
    aceitarTermo: z.boolean()
        .refine((val: boolean) => val === true,
        { message: "Você deve aceitar o Termo de Compromisso" }),
})

export type FormSchemaPaciente = z.infer<typeof formSchemaPaciente>;
