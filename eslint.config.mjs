import { dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { FlatCompat } from "@eslint/eslintrc";

const __dirname = dirname(fileURLToPath(import.meta.url));

const compat = new FlatCompat({ baseDirectory: __dirname });

/**
 * El repositorio declaraba `eslint`, `eslint-config-next` y `typescript-eslint`
 * y un script `lint`, pero no existía fichero de configuración, así que el
 * comando fallaba antes de analizar nada.
 */
const eslintConfig = [
  {
    ignores: [
      ".next/**",
      "coverage/**",
      "node_modules/**",
      "next-env.d.ts",
      // Fichero generado por la CLI de Supabase.
      "src/lib/types/db.types.d.ts",
      "data/lang/en.d.json.ts",
    ],
  },
  ...compat.extends("next/core-web-vitals", "next/typescript"),
];

export default eslintConfig;
