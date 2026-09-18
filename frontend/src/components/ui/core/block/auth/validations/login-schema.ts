import * as z from "zod"

export const loginSchema = z.object({
  username: z
    .string()
    .min(3, "Username minimal 3 karakter")
    .max(32, "Username maksimal 32 karakter")
    .regex(/^[a-z0-9_.]+$/, "Username hanya huruf kecil, angka, titik, underscore"),
  password: z.string().min(8, "Password wajib berisi 8 karakter"),
})

export type LoginSchema = z.infer<typeof loginSchema>

