import * as z from "zod"

export const loginSchema = z.object({
  email: z.string().min(8, "Email tidak valid"),
  password: z.string().min(8, "Password wajib berisi 8 karakter"),
})

export type LoginSchema = z.infer<typeof loginSchema>

