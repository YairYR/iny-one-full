# Iny.One

## UI -> API → Feature → Core → Infra

## Project structure

```txt
src/
├─ app/                              # App Router, pages, route handlers and layouts
│  ├─ layout.tsx                     # Root layout (html, body, global metadata defaults)
│  ├─ page.tsx                       # Public home page
│  ├─ [short]/route.ts               # Short-link resolver
│  ├─ api/                           # API routes
│  │  ├─ auth/
│  │  ├─ shorten/
│  │  ├─ users/
│  │  └─ payments/
│  ├─ ui/                            # Internal implementation layer behind public rewrites
│  │  ├─ layout.tsx                  # Section layout (without html/body)
│  │  ├─ (main)/                     # Public-facing pages implemented internally
│  │  │  ├─ page.tsx
│  │  │  ├─ about/
│  │  │  ├─ plans/
│  │  │  ├─ piscolas/
│  │  │  ├─ cart/
│  │  │  └─ auth/
│  │  │     ├─ login/
│  │  │     ├─ register/
│  │  │     └─ callback/
│  │  └─ dashboard/
│  │     ├─ page.tsx
│  │     ├─ users/
│  │     └─ settings/
│  ├─ robots.txt                     # Crawl rules
│  └─ sitemap.ts                     # Canonical sitemap
│
├─ components/                       # Shared UI components
│  ├─ ui/
│  ├─ layout/
│  └─ feedback/
│
├─ features/                         # Feature/domain modules
│  ├─ auth/
│  ├─ payments/
│  ├─ users/
│  └─ ...
│
├─ core/                             # Domain layer
│  ├─ entities/
│  ├─ repositories/
│  ├─ use-cases/
│  └─ errors/
│
├─ infra/                            # Infrastructure adapters
│  ├─ db/
│  ├─ auth/
│  ├─ payments/
│  └─ storage/
│
├─ lib/                              # Shared utilities and runtime helpers
│  ├─ api/
│  ├─ middlewares/
│  ├─ supabase/
│  ├─ routes.ts
│  ├─ reserved-slugs.ts
│  └─ utils/
│
├─ hooks/                            # Global hooks
├─ config/                           # App-wide configuration
├─ styles/                           # Global styles
├─ types/                            # Shared TypeScript types
└─ tests/                            # Unit, integration and e2e tests

## Enfoque

1. Feature-first

Cada módulo de negocio (auth, users, payments, etc.) vive en /features/
→ encapsula su UI, hooks, y lógica, evitando un components/ gigante y caótico.

2. Separación de capas

Inspirado en “Clean Architecture”:

```
core/ → reglas de negocio puras, sin dependencias externas.

infra/ → conectores (Supabase, Stripe, APIs externas).

features/ → lo que ve el usuario (UI + integración).

app/ → punto de entrada (rutas y layouts).
```

Así, podrías cambiar de Supabase a Prisma sin tocar core/ ni features/.

3. Adaptadores

Los casos de uso en core/use-cases dependen de interfaces (repositories/),
y infra las implementa. Ejemplo:

```ts
// core/repositories/UserRepository.ts
export interface IUserRepository {
  findByEmail(email: string): Promise<User | null>;
  create(user: User): Promise<User>;
}

// infra/db/UserRepositorySupabase.ts
import { supabase } from "@/lib/supabase";
export class UserRepositorySupabase implements IUserRepository {
  async findByEmail(email: string) {
    const { data } = await supabase.from("users").select("*").eq("email", email).single();
    return data;
  }
  async create(user) { /* ... */ }
}
```

Y luego en un caso de uso:

```ts
import { IUserRepository } from "../repositories/UserRepository";

export class RegisterUser {
  constructor(private repo: IUserRepository) {}
  async execute(data: RegisterUserDTO) {
    const existing = await this.repo.findByEmail(data.email);
    if (existing) throw new Error("Email already registered");
    return this.repo.create(data);
  }
}
```

### Recomendaciones

* Usa Zod para validar esquemas (lib/env.ts, inputs de APIs, etc.)
* Usa React Query o SWR para data fetching.
* Usa Context Providers dentro de app/layout.tsx para temas globales (auth, theme, etc.)


