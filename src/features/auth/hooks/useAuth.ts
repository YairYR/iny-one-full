"use client";

import { useState } from "react";
import { handleLogin } from "../services/auth.service";

export function useAuth() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function login(email: string, password: string) {
    setLoading(true);
    setError(null);
    try {
      const result = await handleLogin(email, password);
      return result;
    } catch (err) {
      setError(err.message || "Error al iniciar sesión");
      return null;
    } finally {
      setLoading(false);
    }
  }

  return { login, loading, error };
}
