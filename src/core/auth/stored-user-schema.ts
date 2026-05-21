import { z } from "zod";

export const storedUserSchema = z.object({
  first_name: z.string().optional(),
  last_name: z.string().optional(),
  username: z.string().optional(),
  role: z.union([z.string(), z.number()]).optional(),
});

export type StoredUser = z.infer<typeof storedUserSchema>;

export function parseStoredUser(raw: string | null): StoredUser | null {
  if (!raw) return null;
  try {
    const parsed: unknown = JSON.parse(raw);
    const result = storedUserSchema.safeParse(parsed);
    return result.success ? result.data : null;
  } catch {
    return null;
  }
}
