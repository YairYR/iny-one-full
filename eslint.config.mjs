import { dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const eslintConfig = [
  ...compat.extends("next/core-web-vitals", "next/typescript"),
  ...compat.config({
    ignorePatterns: ['src/lib/types/db.types.d.ts']
  }),
  // {
  //   rules: {
  //     "no-restricted-imports": [
  //       "error",
  //       {
  //         name: "@supabase/ssr",
  //         importNames: ["createBrowserClient"],
  //         message: "Please do not use 'createBrowserClient' from '@supabase/ssr'. Use 'createServerClient' instead."
  //       }
  //     ]
  //   }
  // }
];

export default eslintConfig;
