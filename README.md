# Iny.One

## UI -> API → Feature → Core → Infra

Folder Structure

```
src/
│
├─ app/                                # App Router (rutas y layouts)
│  ├─ layout.tsx                       # Layout global
│  ├─ page.tsx                         # Página principal (landing o login)
│  ├─ (admin)/                         # Segmento para panel administrativo
│  │   ├─ layout.tsx
│  │   ├─ dashboard/
│  │   │   ├─ page.tsx
│  │   │   ├─ users/
│  │   │   │   ├─ page.tsx
│  │   │   │   └─ components/
│  │   │   └─ settings/
│  │   │       └─ page.tsx
│  │   └─ ...
│  │
│  ├─ api/                             # Endpoints serverless (Next.js API)
│  │   ├─ auth/
│  │   │   └─ route.ts
│  │   ├─ users/
│  │   │   └─ route.ts
│  │   └─ payments/
│  │       └─ route.ts
│  │
│  └─ (auth)/                          # Segmento para login/register
│      ├─ login/
│      │   └─ page.tsx
│      └─ register/
│          └─ page.tsx
│
├─ features/                           # Arquitectura por dominio
│  ├─ auth/
│  │   ├─ components/                  # UI relacionada (formularios, modales)
│  │   ├─ hooks/                       # Hooks de sesión, validaciones
│  │   ├─ services/                    # Integración Supabase / API
│  │   ├─ types/
│  │   └─ index.ts
│  │
│  ├─ payments/
│  │   ├─ components/
│  │   ├─ services/                    # Lógica de subscripciones, billing
│  │   ├─ utils/
│  │   └─ index.ts
│  │
│  ├─ users/
│  │   ├─ components/
│  │   ├─ services/
│  │   └─ index.ts
│  │
│  └─ ...
│
├─ components/                         # Componentes globales o compartidos
│  ├─ ui/                              # Botones, inputs, loaders, etc.
│  ├─ layout/                          # Navbar, Sidebar, etc.
│  └─ feedback/                        # Toasts, modales, alertas
│
├─ core/                               # Capa de dominio y lógica empresarial
│  ├─ entities/                        # Entidades puras (User, Subscription, etc.)
│  ├─ repositories/                    # Interfaces (p. ej. IUserRepository)
│  ├─ use-cases/                       # Casos de uso (registerUser, renewSubscription)
│  └─ errors/
│
├─ infra/                              # Implementaciones concretas (infraestructura)
│  ├─ db/                              # Prisma o Supabase client
│  │   ├─ client.ts
│  │   └─ schema.prisma (si aplica)
│  ├─ auth/                            # Supabase Auth o JWT handlers
│  ├─ payments/                        # Integración Stripe, Flow, etc.
│  └─ storage/                         # Uploads, buckets
│
├─ lib/                                # Herramientas compartidas
│  ├─ supabase.ts                      # Cliente Supabase inicializado
│  ├─ env.ts                           # Variables de entorno validadas (zod)
│  ├─ logger.ts                        # Logger centralizado
│  ├─ fetcher.ts                       # SWR o react-query fetchers
│  └─ utils.ts                         # Helpers simples
│
├─ hooks/                              # Hooks globales (useTheme, useMediaQuery)
│  └─ useClientOnly.ts
│
├─ config/                             # Config global
│  ├─ auth.config.ts
│  ├─ payments.config.ts
│  └─ constants.ts
│
├─ styles/                             # CSS global (Tailwind)
│  ├─ globals.css
│  └─ tailwind.css
│
├─ types/                              # Tipos compartidos (no específicos de feature)
│  ├─ next.d.ts
│  └─ global.d.ts
│
└─ tests/
   ├─ unit/
   ├─ integration/
   └─ e2e/
```

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


