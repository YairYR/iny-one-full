import { UserRepository } from "@/infra/db/user.repository";
import { verifyPassword } from "@/core/utils/validation";

export async function loginUser(email: string, password: string) {
  const user = await UserRepository.findByEmail(email);
  if (!user) throw new Error("Usuario no encontrado");

  // if (!verifyPassword(password, user.passwordHash)) {
  //   throw new Error("Contraseña incorrecta");
  // }

  return { success: true, user };
}

