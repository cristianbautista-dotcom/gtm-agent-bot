# Roadmap — de "bot de juguete" a "@agente GTM" en producción

Estado real al 28-jul-2026 (verificado leyendo el código, no asumido):

## Lo que ya existe
- `api/bot.js`: handler de Vercel que responde a eventos `ADDED_TO_SPACE` y `MESSAGE`
  de Google Chat. Extrae el texto después de `@gtm-agent`, corre una clasificación
  por regex muy básica (`classifyGtm()`) y devuelve un mensaje de "recibido, clasificando...".
  No valida campos de la Bitácora, no toca Linear, no llama a ningún modelo.
- Proyecto Vercel enlazado: `gtm-agent-bot-v2` (org `team_KmR61ozFz89qhcjLvYCOGO7z`).
- Repo GitHub: `cristianbautista-dotcom/gtm-agent-bot`.
- `intake-template.md` (esta carpeta): el texto real de intake, ya alineado con la
  tabla de campos de la skill `alegra-pmkt` §3.1 / `skills/SKILL-F0-clasificacion.md`.

## Lo que falta para que "@agente GTM" funcione de verdad en Google Chat

1. **Registrar la Google Chat App en Google Cloud Console** (esto es lo que hace que
   Google Chat de verdad le pegue al endpoint de Vercel cuando alguien escribe
   `@agente GTM`). Sin este paso, el código de `bot.js` nunca se ejecuta por más que
   esté desplegado. Pasos:
   - Crear/usar un proyecto GCP, habilitar la Google Chat API.
   - En la configuración de la Chat API: tipo de conexión "HTTP endpoint URL" →
     apuntar a la URL de despliegue de Vercel (`https://gtm-agent-bot-v2.vercel.app/api/bot`
     o la que Vercel asigne).
   - Definir nombre visible del bot (ej. "Agente GTM"), avatar, descripción.
   - Publicar/instalar la app en el espacio `tp-prenotificacion-lanzamientos-product`
     (space `AAQAwfo1Cd4`) — puede quedar privada a la organización de Alegra, no
     necesita publicarse en el Marketplace público.
2. **Reemplazar `classifyGtm()` (regex) por la lógica real de F0** — usar el mismo
   criterio que `skills/SKILL-F0-clasificacion.md`: llamar al modelo (Anthropic API,
   ya hay `ANTHROPIC_API_KEY` en `.env.example` del repo padre) con el One Pager /
   descripción, devolver el JSON de clasificación + `missing_fields`.
3. **Validar campos de la Bitácora contra la tabla real** (no está implementado hoy)
   — si faltan campos, responder con la plantilla de `intake-template.md`
   ("Versión corta (campos faltantes)"), no con el placeholder actual.
4. **Conectar a Linear** para crear el proyecto GTM automáticamente una vez los
   campos estén completos y clasificados (usar `LINEAR_API_KEY`, ya está en
   `.env.example`) — esto es lo que ata el bot al flujo de `pmkt-framework` /
   `pmkt-activacion`.
5. **Variables de entorno en Vercel:** `ANTHROPIC_API_KEY`, `LINEAR_API_KEY` deben
   configurarse en el proyecto Vercel (Settings → Environment Variables), no solo
   en el `.env` local — hoy `bot.js` no las usa todavía porque no llama a ningún API.

## Actualización 28-jul: endpoint de edición en vivo — ya escrito, falta desplegar

Se construyó `api/update-project.js`: recibe `{ projectId, targetDate }` por POST,
valida un secreto compartido (header `X-Bot-Secret`) y llama a la mutación
`projectUpdate` de Linear para escribir la fecha real. El HTML del Roadmap
(`Priorización GTM/2-workbench-puntuacion-4-ejes.html`) ya tiene el lado cliente
listo: un panel "🔌 Edición en vivo" (arriba de las pestañas) donde se pega la URL
del endpoint + el secreto (se guardan en `localStorage`, una sola vez por
navegador) — una vez conectado, la columna "Fecha tentativa" de Julio y Agosto
se vuelve editable con un botón 💾 que escribe directo en el proyecto real de
Linear.

**Falta para que quede vivo de verdad (pasos manuales, no los puedo hacer yo):**

1. En el dashboard de Vercel, proyecto `gtm-agent-bot-v2` → Settings → Environment
   Variables, agregar:
   - `LINEAR_API_KEY` (la misma que ya está en `.env` local del repo padre)
   - `BOT_SHARED_SECRET` (cualquier string largo random que solo tú conozcas —
     este es el que se pega en el panel de "Edición en vivo" del HTML)
2. Confirmar que haga commit + push de `api/update-project.js` a
   `cristianbautista-dotcom/gtm-agent-bot` (main) — Vercel redeploya solo al
   detectar el push, porque el repo ya está enlazado al proyecto.
3. Copiar la URL de despliegue de Vercel (algo como
   `https://gtm-agent-bot-v2.vercel.app`) y pegarla en el panel "🔌 Edición en
   vivo" del HTML, junto con el `BOT_SHARED_SECRET` del paso 1.
4. **Importante:** esto solo funciona si el HTML está alojado fuera de un
   Artifact de claude.ai — el CSP de los Artifacts bloquea llamadas `fetch` a
   dominios externos como Vercel. Tiene que ser la versión que subes a Netlify
   (como ya venías haciendo) o cualquier hosting normal, no el link de
   `claude.ai/code/artifact/...`.

## Relación con el sistema "Hermes" ya documentado

Ya existe una visión completa de este agente en `HERMES-SYSTEM-PROMPT.md` +
`memoria.md` + `skills/SKILL-F0..F7` + `hermes-daemon.js` — pero `hermes-daemon.js`
solo hace **polling saliente** (revisa Linear cada 30 min y empuja mensajes a un
webhook entrante de Google Chat, `GOOGLE_CHAT_WEBHOOK`), no puede **recibir**
menciones (`@agente GTM`) porque un webhook entrante de Chat es de una sola vía.
Para menciones en tiempo real se necesita sí o sí una Google Chat App (pasos de
arriba), que es justamente lo que `gtm-agent-bot/api/bot.js` empezó a construir.

**Conclusión:** son dos piezas complementarias, no competidoras — `hermes-daemon.js`
para el loop autónomo de seguimiento (26/7, revisa Linear, notifica proactivamente),
y `gtm-agent-bot` para la interacción reactiva por mención en el chat. El paso 1
de arriba (registrar la Chat App en GCP) es el bloqueante real hoy.
