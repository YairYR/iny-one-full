# iny.one

Acortador de URLs con soporte para parámetros UTM, analítica básica de clics y arquitectura modular basada en Next.js App Router.

## Arquitectura

El proyecto sigue esta dirección de dependencias:

```txt
UI -> API -> Feature -> Core -> Infra

Capas
app/: punto de entrada del sistema. Define rutas, layouts, metadata, handlers y pages.
features/: módulos funcionales por dominio. Aquí vive la UI específica, hooks y servicios de cada feature.
core/: lógica de dominio pura. Entidades, contratos y casos de uso sin dependencias de framework.
infra/: implementaciones concretas. Base de datos, auth, pagos, storage y adaptadores externos.
lib/: utilidades transversales, middlewares, helpers y configuración compartida.

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
│  │  │  │  └─ layout.tsx            # noindex for cart flows
│  │  │  └─ auth/
│  │  │     ├─ layout.tsx            # noindex for auth routes
│  │  │     ├─ login/
│  │  │     ├─ register/
│  │  │     └─ callback/
│  │  └─ dashboard/
│  │     ├─ layout.tsx               # noindex for dashboard area
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
│  ├─ reserved-slugs.ts              # Hard denylist for system/public routes
│  └─ utils/
│
├─ hooks/                            # Global hooks
├─ config/                           # App-wide configuration
├─ styles/                           # Global styles
├─ types/                            # Shared TypeScript types
└─ tests/                            # Unit, integration and e2e tests
Routing model

El proyecto separa las rutas públicas de la implementación interna.

Rutas públicas canónicas

Estas son las URLs oficiales del sitio:

/
/about
/plans
/piscolas
/auth/login
/auth/register
/dashboard
/cart
Rutas internas

La carpeta app/ui/* contiene la implementación interna de las páginas.
Estas rutas no deben promocionarse ni tratarse como canónicas.

Ejemplos:

/ui
/ui/about
/ui/plans
/ui/piscolas
/ui/auth/login

## Enfoque

Regla general
Las rutas públicas limpias se exponen al usuario.
next.config.ts usa rewrites para mapear esas rutas públicas a /ui/*.
El acceso directo a /ui/* se corrige con redirects hacia la ruta pública correspondiente.

SEO strategy

El proyecto usa una estrategia SEO enfocada en consistencia canónica y separación entre páginas indexables y privadas.

Host canónico
Dominio canónico: https://iny.one
www.iny.one redirige al apex
Sitemap

sitemap.ts incluye solo rutas públicas canónicas e indexables:

/
/about
/plans
/piscolas
Robots

robots.txt:

permite rastreo del sitio público
bloquea zonas privadas o administrativas
referencia el sitemap canónico
Metadata

Se usa la Metadata API de Next.js para:

metadata global en app/layout.tsx
metadata específica por página en:
home
about
plans
piscolas
Structured data

La home incorpora JSON-LD para reforzar señales de sitio y producto.

Noindex

Las siguientes áreas quedan fuera del índice:

auth
dashboard
cart

Esto se aplica con robots: { index: false, follow: false } en layouts específicos.

Short links

Las rutas cortas resueltas por app/[short]/route.ts:

no deben indexarse
responden con X-Robots-Tag: noindex

Reserved slugs

El proyecto protege rutas críticas mediante una denylist centralizada en:

src/lib/reserved-slugs.ts
Objetivo

Evitar que slugs cortos “roben” rutas del sistema o páginas públicas.

La denylist se aplica en dos puntos
Creación de short links
src/app/api/shorten/route.ts
los slugs autogenerados se regeneran si caen en una ruta reservada
Resolución de short links
src/app/[short]/route.ts
si el slug solicitado está reservado, se responde 404 antes de consultar la base
Ejemplos de rutas reservadas
about
plans
piscolas
auth
login
register
dashboard
cart
api
_next
robots.txt
sitemap.xml
favicon.ico

Enfoque de diseño
1. Feature-first

Cada módulo de negocio vive en features/.

Ejemplos:

features/auth
features/users
features/payments

Esto evita un proyecto con lógica distribuida de forma caótica entre components/ y lib/.

2. Separación de responsabilidades

Inspirado en Clean Architecture:

core/ → reglas de negocio puras
infra/ → integraciones concretas
features/ → UI + orquestación funcional
app/ → routing, layouts, metadata, handlers

Esto permite cambiar infraestructura sin reescribir la lógica de negocio.

3. Adaptadores

Los casos de uso del dominio dependen de interfaces; la infraestructura implementa esos contratos.

Ejemplo:

// core/repositories/UserRepository.ts
export interface IUserRepository {
  findByEmail(email: string): Promise<User | null>;
  create(user: User): Promise<User>;
}
// infra/db/UserRepositorySupabase.ts
import { supabase } from "@/lib/supabase";

export class UserRepositorySupabase implements IUserRepository {
  async findByEmail(email: string) {
    const { data } = await supabase
      .from("users")
      .select("*")
      .eq("email", email)
      .single();

    return data;
  }

  async create(user: User) {
    // ...
  }
}
// core/use-cases/RegisterUser.ts
import { IUserRepository } from "../repositories/UserRepository";

export class RegisterUser {
  constructor(private repo: IUserRepository) {}

  async execute(data: RegisterUserDTO) {
    const existing = await this.repo.findByEmail(data.email);
    if (existing) throw new Error("Email already registered");
    return this.repo.create(data);
  }
}
Technical notes
Validación con Zod para payloads y esquemas
Middlewares centralizados para sesión, auth y control de rutas
Rutas públicas limpias con rewrites
Protección dura de slugs reservados
Metadata y canonicalización controladas desde App Router
Recommended conventions
Usar page.tsx para vistas
Usar layout.tsx para composición y metadata compartida
Usar route.ts para route handlers HTTP
Mantener /ui/* como implementación interna, no como superficie pública
Centralizar reglas de routing en lib/routes.ts
Centralizar slugs reservados en lib/reserved-slugs.ts
Future improvements
Alias custom para short links con validación contra denylist
Panel de analítica por enlace
QR generator
Gestión avanzada de campañas UTM
Metadata/Open Graph específicas por herramienta o landing
Tests de integración para rutas críticas y auth flow

```

### Recomendaciones

* Usa Zod para validar esquemas (lib/env.ts, inputs de APIs, etc.)
* Usa React Query o SWR para data fetching.
* Usa Context Providers dentro de app/layout.tsx para temas globales (auth, theme, etc.)


