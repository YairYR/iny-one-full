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
  {
    rules: {
      "no-restricted-imports": [
        "error",
        {
          paths: [
            {
              name: "@supabase/ssr",
              importNames: ["createBrowserClient"],
              message: "Don't use the Supabase client in the browser, as it exposes the API Key. Use the server Supabase client or Next.js API (App Router / Route Handlers) instead.",
            }
          ]
        },
      ]
    }
  },
  ...compat.extends("next/core-web-vitals", "next/typescript"),
];

export default eslintConfig;
