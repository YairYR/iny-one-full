# iny.one — auditoría de Supabase

*20 de agosto de 2026. Proyecto `xgdjnvzzzmowapxscpak`, PostgreSQL 17.6.1, región `us-east-2`.*

Todo lo que sigue está **medido contra la base de producción** salvo donde digo lo contrario. No se ejecutó ninguna consulta que devolviera filas personales: sólo catálogo, agregados y una medición dentro de una transacción abortada.

---

## 0. Retrato del sistema, para calibrar

15 usuarios registrados. 2.651 enlaces, de los cuales **2.637 anónimos y 14 con cuenta**. Un solo enlace tiene alias. 35.331 clics registrados. La base ocupa unos 330 MB.

Esto importa antes de hablar de escalabilidad: **hoy nada va lento por volumen**. Lo que sí hay son decisiones de forma que son gratis de cambiar ahora y caras después, un par de cosas rotas, y agujeros de configuración que no dependen del tamaño. Ordeno por eso, no por lo espectacular que suene cada hallazgo.

---

## 1. Seguridad

### 1.1 Los GRANT que dimos por revocados en agosto siguen ahí, vía `PUBLIC`

Estado real hoy:

| Objeto | Concedido a | Privilegio |
|---|---|---|
| `public.short_links` | **PUBLIC** | SELECT |
| `public.short_links` | authenticated | SELECT, UPDATE |
| `public.history_clicks` | **PUBLIC** | SELECT |
| `public.domains_to_check` | **PUBLIC** | SELECT |
| `security.blocked_url` | **PUBLIC** | SELECT |
| `security.blocklist_url_phishing_active` | **PUBLIC** | SELECT |
| `security.cached_blocked_url` | **PUBLIC** | SELECT |
| `security.whitelist_url` | **PUBLIC** | SELECT, **INSERT** |

Es exactamente la trampa que documentamos en agosto para funciones, aplicada a tablas y sin que la viéramos: `revoke all ... from anon, authenticated` **no toca lo concedido a `PUBLIC`**, y `anon` y `authenticated` lo heredan por ahí. La remediación de agosto fue en buena parte cosmética.

En `public` el agujero está tapado por RLS, y por eso la prueba con la clave anónima devolvió `[]` y la dimos por buena: esa prueba demostraba que RLS deniega, no que los permisos estuvieran quitados. Son cosas distintas y confundirlas nos costó creer que estaba cerrado. Hoy basta con que alguien desactive RLS en una tabla por error, o escriba una política permisiva de más, para que quede expuesta entera.

### 1.2 El esquema `security` es legible por cualquiera — corrijo lo que dije en agosto

Las cuatro tablas de `security` tienen una política llamada **«Enable read access for all users» con `USING (true)` para el rol `public`**. Sumado al GRANT de arriba, a nivel de base de datos **cualquiera con la clave anónima puede leer el blocklist entero**.

En agosto escribí que el esquema `security` estaba «limpio, no hizo falta tocarlo». Esa conclusión era falsa: miré los grants a `anon` y `authenticated`, no los de `PUBLIC`, y no miré las políticas. El método fue el error, no el dato.

Por qué importa aunque no sean datos personales: es un **oráculo sobre la defensa antiabuso**. Quien quiera colar un dominio de phishing puede preguntar primero si ya está en la lista, y elegir uno que no lo esté. Además `whitelist_url` tiene INSERT concedido a `PUBLIC` (hoy RLS lo frena porque no hay política de INSERT, pero el permiso no debería existir).

**No verificado:** si el esquema `security` está en «Exposed schemas» de la API. Eso no se lee desde SQL. Si no lo está, PostgREST no lo sirve y el riesgo se queda en potencial. Compruébalo así, con la clave publicable, que es pública por diseño:

```bash
curl -s "https://xgdjnvzzzmowapxscpak.supabase.co/rest/v1/blocked_url?select=domain&limit=1" \
  -H "apikey: sb_publishable_yCxoTaakSvDrFCWftXKtHA_3eTqoLY_" \
  -H "Accept-Profile: security"
```

Si devuelve un dominio, está expuesto. Si devuelve un error de esquema no expuesto, no lo está — y aun así conviene quitar la política y el grant, porque hoy lo único que te separa del problema es una casilla de configuración.

### 1.3 Dos funciones `SECURITY DEFINER` ejecutables por `anon`

`public.authorize(app_permission)` y `public.fn_log_audit()` son `SECURITY DEFINER` y su `EXECUTE` alcanza a `anon`, `authenticated` y `public`. `fn_log_audit` es el trigger de auditoría de `subscriptions`: llamarla por RPC falla por falta de contexto de trigger, pero no hay ninguna razón para que esté publicada.

**Buena noticia, y corrijo `CLAUDE.md`:** `public.get_page_traffic` y `security.insert_blocked_url` **ya están cerradas** — hoy sólo las ejecuta `service_role`. El paso 3 de agosto sí funcionó. El fichero sigue diciendo «ABIERTO» y eso ya es documentación que miente.

### 1.4 El whitelist se auto-alimenta y gana al blocklist

`security.is_domain_secure` consulta en este orden: caché de bloqueados → **whitelist** → blocklist → phishing. Y si un dominio no aparece en ninguna lista, **lo inserta en el whitelist**.

Consecuencia: un dominio comprobado una sola vez mientras estaba limpio queda permitido de forma permanente, y si más tarde entra en el blocklist la comprobación ya no lo mira, porque el whitelist se consulta antes. Es un bypass persistente que se activa simplemente siendo temprano.

### 1.5 Menor

Protección de contraseñas filtradas (HaveIBeenPwned) desactivada en Auth. Se activa con una casilla.

---

## 2. Correctitud: dos cosas rotas, verificadas ejecutándolas

### 2.1 `security.is_domain_secure` está rota justo en la rama que importa

La rama que se ejecuta cuando el dominio **sí** aparece en `blocked_url` hace esto:

```sql
insert into security.cached_blocked_url (domain, is_custom)
  values (domain_to_check, domain_is_custom, domain_is_custom);
```

Dos columnas, tres valores. Comprobado ejecutando un `EXPLAIN` de esa misma sentencia dentro de un bloque que captura el error, sin escribir nada:

```
rama blocked_url -> 42601 :: INSERT has more expressions than target columns
rama phishing    -> sin-error
```

Qué pasa en la práctica: cuando un dominio realmente está en la lista de 2,3 millones, la función **lanza excepción en lugar de devolver `false`**. La aplicación lo trata como error y rechaza el enlace, así que **falla cerrada y no se cuela nada** — pero el usuario ve «Error when validating url» en vez de un bloqueo, y el resultado no se cachea nunca.

El dato que lo confirma desde otro ángulo: `security.blocked_url` acumula **6 escaneos de índice en toda su vida**, y `blocklist_url_phishing_active` **cero**. La rama principal del blocklist no ha funcionado nunca.

### 2.2 El desfase de contadores: causa encontrada

347 enlaces tienen `short_links.clicks` distinto de `short_links_stats.total_clicks`, y la cifra crece (eran 315 en agosto). La causa está en las dos funciones:

- `click_short_link` hace `UPDATE short_links SET clicks = clicks + 1` **siempre**.
- El trigger `update_short_links_stats` empieza con `IF new.is_bot THEN RETURN new;`.

Es decir: **`short_links.clicks` cuenta bots y `short_links_stats.total_clicks` no.** No son dos contadores desincronizados, son dos métricas distintas con el mismo nombre. Y el ranking de mejores enlaces del dashboard usa el inflado por bots.

Hay que elegir cuál es la verdad. Lo razonable es que el número que se le enseña al usuario excluya bots, es decir `total_clicks`, y que `short_links.clicks` pase a ser lo que ya es: un contador bruto interno, renombrado o retirado.

### 2.3 Menor

2.131 enlaces caducados siguen con `status = true` (1.892 en agosto). No rompe nada porque el resolver mira `expires_at`, pero `status` es estado derivado duplicado y ya diverge.

---

## 3. Escalabilidad, con las cifras delante

### 3.1 El clic es la consulta más cara de la base, con diferencia

`pg_stat_statements` sobre la RPC `click_short_link`:

| llamadas | media | máximo | total acumulado |
|---|---|---|---|
| 4.261 | **173 ms** | 3.710 ms | **737 segundos** |

737 s es más de cinco veces la siguiente consulta de la lista. Medí el desglose del SQL puro dentro de una transacción abortada:

| paso | tiempo |
|---|---|
| `select` del destino por clave primaria | **0,34 ms** |
| `update short_links.clicks` | 7,08 ms |
| `insert history_clicks` + sus dos triggers | **18,56 ms** |
| total | 25,98 ms |

**Menos del 2% del coste es resolver la redirección; el resto es escribir analítica.** La diferencia entre esos 26 ms y los 173 ms medios es sobrecarga de PostgREST, pooler y caché fría —el máximo de 3,7 s huele a arranque en frío— y no la desgloso porque no la he medido.

Esto hoy no le duele al usuario: el resolver usa `after()`, así que la escritura ocurre tras enviar la redirección. Pero mantiene viva la función de Vercel esos 173 ms, que es tiempo facturado y concurrencia ocupada. A un millón de clics al mes son unas 48 horas de tiempo de base de datos.

El origen del coste es el diseño del trigger: `update_short_links_stats` hace `jsonb_set` sobre **cuatro columnas jsonb** de `short_links_stats` en cada clic, y cada `jsonb_set` reescribe el documento entero. Más los upserts de la tabla diaria y la mensual. Un clic son un insert y cuatro updates repartidos en cuatro tablas.

### 3.2 Faltan dos índices y se nota en las cifras

`public.short_links`: **557 recorridos secuenciales que han leído 1.464.797 filas** sobre una tabla de 2.651. Es decir, la tabla entera cada vez. Son las consultas de cuota (`countLinksByIpInLastMonth`, `countLinksByUserInLastMonth`, en cada creación de enlace) y las del dashboard, que filtran por `user_id` y por `ip_user` y no tienen índice.

`index_advisor` sobre las tres consultas reales:

| consulta | coste ahora | con índice | índice |
|---|---|---|---|
| cuota por usuario | 216,7 | 2,3 | `short_links(user_id)` |
| cuota por IP | 216,7 | 2,3 | `short_links(ip_user)` |
| listado del dashboard | 196,9 | 2,3 | `short_links(user_id)` |

En agosto decidimos no crearlos porque con 2.636 filas tardaban 0,45 ms, y esa decisión era correcta con el dato de entonces. Lo que cambia el cálculo no es el tiempo, es que **el coste crece con el total de enlaces de la plataforma, no con los del usuario**. Es la diferencia entre una consulta que aguanta el crecimiento y otra que no. Y ahora cuestan dos líneas.

### 3.3 El 88% de la base es un blocklist que casi no se consulta

| tabla | tamaño | filas | escaneos de índice en su vida |
|---|---|---|---|
| `security.blocked_url` | **251 MB** | 2.308.462 | 6 |
| `security.blocklist_url_phishing_active` | **39 MB** | 454.569 | **0** |
| `public.history_clicks` | 11 MB | 34.228 | 7.477 |
| `public.short_links` | 1,4 MB | 2.634 | 21.569 |

290 MB de ~330 MB son listas frías. Y no es que estén frías por accidente: el filtro de Bloom del `public/bloom.bin` resuelve la mayoría de comprobaciones sin tocar la base, que es justo lo que se diseñó. La consecuencia es que estás pagando almacenamiento, copias de seguridad y tiempo de restauración por datos que sirven seis consultas.

La lista de phishing con **cero** escaneos merece una pregunta directa: ¿la usa algo? Si su única lectura es desde `is_domain_secure` —que se rompe antes de llegar a ella en el caso frecuente—, es 39 MB de nada.

### 3.4 Otros

`history_clicks` no tiene índice por fecha; `index_advisor` recomienda `(created_at)` para las consultas por rango. Con 35k filas no urge. Cuando la analítica por rango crezca, el índice útil será `(slug, created_at)`, no `(created_at)` solo.

---

## 4. Gestión: lo que más me preocupa a medio plazo

**No hay historial de migraciones.** La base sólo registra dos entradas, ambas llamadas `remote_schema`, que son instantáneas generadas por `db pull`. El esquema se ha construido a mano en el panel.

Eso significa que hoy no existe forma de reconstruir esta base desde cero, ni de revisar un cambio antes de aplicarlo, ni de deshacerlo. Los scripts de `scripts/sql/` documentan lo que hicimos, que es mucho mejor que nada, pero no están enlazados a la base ni se aplican de forma ordenada. Para un producto con datos personales en producción es la deuda más incómoda de la lista: no rompe nada hoy y hace cara cada corrección futura.

El camino ordenado es adoptar el CLI de Supabase con `supabase/migrations/`, partiendo de un `db pull` como línea base, y que a partir de ahí todo cambio entre por ahí. No hay que reescribir el pasado, sólo dejar de añadirle.

Aparte: la región es `us-east-2` y el público es chileno, con la función de Vercel resolviendo en `iad1`. Está bien emparejado entre función y base; el salto de latencia lo pone el usuario, y para una redirección con `after()` no es crítico.

---

## 5. Qué features chocan con el esquema actual

### 5.1 Dominio propio — la decisión más cara de posponer

`short_links` tiene `PRIMARY KEY (slug)` global, y cuelgan de esa clave **cuatro claves foráneas**: `history_clicks`, `short_links_stats`, `short_links_daily_stats` y `short_links_monthly_stats`.

Con dominio propio, la unicidad deja de ser `slug` y pasa a ser `(dominio, slug)` — dos clientes pueden querer `/promo` en dominios distintos. Cambiar la clave primaria arrastra las cuatro foráneas y todas las filas que las referencian.

Hacerlo hoy, con 2.651 enlaces y 35 mil clics, es un rato. Hacerlo con dos millones de clics es una migración con ventana de mantenimiento. **Si el dominio propio está en el plan a doce meses, la forma de la clave se decide ahora.** La opción barata que no cierra puertas: añadir ya una columna `domain_id` nullable con un dominio por defecto, y un índice único `(domain_id, slug)` conviviendo con la PK actual.

### 5.2 Borrar un enlace es imposible hoy

Las cuatro foráneas apuntan a `short_links(slug)` **sin `ON DELETE`**. Un `delete` sobre un enlace con clics falla. Es decir: **un usuario no puede borrar sus propios enlaces**, y tú no puedes borrar los de nadie sin tocar cuatro tablas a mano.

Es un hueco de producto y también de datos personales: `history_clicks` guarda IP, ciudad y coordenadas, y no hay forma limpia de atender una petición de supresión. Se arregla decidiendo el comportamiento por tabla —`cascade` en las de estadísticas, y en `history_clicks` cascade o anonimización— y declarándolo.

### 5.3 Claves de API

No hay tabla ni nada que estorbe; es aditivo. El único roce es que el límite mensual se calcula con la consulta por `user_id` que hoy recorre la tabla entera, y una API multiplica esas llamadas. El índice de 3.2 deja de ser opcional el día que exista la API.

### 5.4 Atribución de conversión

Aquí sí falta una pieza. Hoy el clic se registra en `history_clicks` con un `bigserial` que **no sale de la base**: la redirección no devuelve ninguna identidad de clic, así que no hay nada a lo que atar una conversión posterior. Habría que emitir un identificador de clic en la redirección y aceptarlo de vuelta en un endpoint. Es aditivo, pero no es sólo una tabla nueva: toca el camino más caliente del producto.

### 5.5 Equipos o espacios de trabajo

Todo cuelga de `user_id` → `auth.users`, y las políticas RLS de `short_links` comparan directamente `user_id = auth.uid()`. Meter `workspace_id` después obliga a reescribir esas políticas y toda consulta que filtre por usuario. Mismo razonamiento que el dominio propio: barato ahora, caro con volumen. La diferencia es que equipos no está anunciado en ningún sitio, así que aquí sí es previsión y no urgencia.

### 5.6 Slug propio (lo que acabamos de implementar)

Verificado: `slug` es `text` **sin longitud máxima**, así que el límite de 32 caracteres de la implementación cabe sin tocar la columna. Los slugs actuales miden 6 o 7. El paso 0 de mi script de la semana pasada ya está respondido: no hace falta ampliar nada.

Lo que sí falta es un `CHECK` de formato en la base. Hoy la única validación vive en la aplicación, y el service role escribe sin pasar por ella si alguien se salta la ruta.

---

## 6. Orden que propongo

**Ahora, y son minutos:**

1. Quitar la política `USING (true)` y los grants a `PUBLIC` del esquema `security`, y revocar a `PUBLIC` en `public`. Es el hallazgo 1.1 y 1.2 y no rompe nada: la aplicación usa service role para todo eso.
2. Arreglar el `INSERT` de `is_domain_secure`. Una coma. Con eso el blocklist empieza a funcionar por primera vez.
3. Los dos índices de `short_links`. Dos líneas, coste 216 → 2,3.
4. Activar la protección de contraseñas filtradas.
5. Corregir `CLAUDE.md`, que dice «ABIERTO» de dos funciones ya cerradas.

**Esta semana:**

6. Decidir cuál contador es la verdad y dejar de mostrar el que cuenta bots.
7. Revocar `EXECUTE` a `anon` en `authorize` y `fn_log_audit`.
8. Invertir el orden de `is_domain_secure` —blocklist antes que whitelist— o dejar de auto-whitelistear.
9. Declarar `ON DELETE` en las cuatro foráneas, para que borrar un enlace sea posible.

**Antes de crecer, no cuando duela:**

10. Adoptar migraciones con el CLI, partiendo de un `db pull` como línea base.
11. Decidir la forma de la clave de `short_links` de cara al dominio propio.
12. Decidir qué hacer con los 290 MB de blocklist: podarlo, moverlo fuera de la base, o confirmar que el filtro de Bloom lo hace prescindible.
13. Sacar la agregación de estadísticas del camino síncrono del clic.

---

## 7. Lo que no está verificado

Si el esquema `security` está expuesto en la API de PostgREST: no se lee desde SQL, va en la configuración del panel. De ahí depende que 1.2 sea un problema real o sólo potencial, y el `curl` de arriba lo resuelve en diez segundos.

El desglose de los 173 ms de la RPC: he medido los 26 ms de SQL puro, no la sobrecarga restante.

El estado de copias de seguridad y PITR, que tampoco se ve desde SQL.

Y una nota de método sobre la medición del clic: se hizo dentro de una transacción abortada, así que no quedó ninguna fila. La única huella es un hueco en la secuencia de `history_clicks.id`, porque las secuencias no se revierten.
