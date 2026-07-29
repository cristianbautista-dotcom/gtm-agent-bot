# Plantilla de intake — PO anuncia un lanzamiento

Fuente de los campos: tabla "Inputs mínimos del Product Owner" de la skill `alegra-pmkt`
(§3.1) y `skills/SKILL-F0-clasificacion.md` — son la misma tabla, no se inventó nada nuevo aquí.

Uso hoy: pegar este mensaje (con el nombre del PO y la funcionalidad reemplazados) como
respuesta en el canal de Google Chat `tp-prenotificacion-lanzamientos-product`
(space `AAQAwfo1Cd4`) cuando alguien anuncie un lanzamiento nuevo.

Uso futuro: este es el texto que debe devolver `api/bot.js` cuando detecte un mensaje
sin todos los campos — ver `ROADMAP.md` en esta misma carpeta para el plan de conexión.

---

## Mensaje a enviar

```
👋 ¡Hola [NOMBRE PO]! Para arrancar el GTM de *[NOMBRE FUNCIONALIDAD]* necesitamos estos datos —
así el equipo de Product Marketing clasifica el lanzamiento y arranca sin ida y vuelta:

*Siempre necesario:*
📝 Nombre técnico de la funcionalidad
📅 Fecha de lanzamiento
📊 Taxonomía Amplitude (evento que mide adopción)
🌎 Versión / país(es)
🧩 Producto principal (Contabilidad, POS, Nómina, etc.)
📄 One Pager (link)

*Si es una funcionalidad nueva (no una mejora a algo que ya existe):*
📘 Manual del usuario
🎥 Video explicativo
🎨 Figma
🚀 Fecha de Early Adopters

No te preocupes si no sabes si es "nueva funcionalidad" o "mejora" — eso lo clasificamos
nosotros con el One Pager. Entre más completo llegue, más rápido sale el GTM. 🙌
```

## Versión corta (campos faltantes, cuando ya hay algo pero incompleto)

```
⚠️ Casi listo — solo nos faltan estos campos para arrancar el GTM de *[NOMBRE FUNCIONALIDAD]*:
- [campo 1]
- [campo 2]
Apenas los tengamos, arrancamos la clasificación. 🙌
```

## Reglas al armar el mensaje

1. Los 6 campos de "Siempre necesario" aplican a los 4 tipos de GTM (1-4).
2. Manual del usuario, Video explicativo, Figma y Fecha de Early Adopters **solo** aplican
   a GTM tipo 1 y 2 (Nueva Funcionalidad) — GTM 3 y 4 (Mejora de Valor / Mejora Técnica) no
   los necesitan y no hay que pedirlos.
3. Nunca inventar ni asumir un campo que el PO no mandó — si falta, se pide.
4. Un catch-up frente a competencia (aunque el PO diga "primera vez") baja igual a GTM (2).
