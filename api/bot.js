const GTM_OWNER_NAME = 'Cristian Bautista';

function extractRequest(text) {
  return text
    .replace(/<[^>]+>/g, '')
    .replace(/@gtm-agent/gi, '')
    .trim();
}

function classifyGtm(description) {
  const d = description.toLowerCase();
  if (/paridad|catch.?up|replicar|mismo que|igual que/.test(d)) return '(2) Adopción';
  if (/nuevo|primera vez|lanzamiento|nueva funcionalidad/.test(d)) return '(1) Nueva Funcionalidad';
  if (/mejora|actualización|integración/.test(d)) return '(3) Mejora de Valor';
  return null;
}

export default function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const event = req.body;
  const type = event?.type;

  if (type === 'ADDED_TO_SPACE') {
    return res.json({
      text:
        '👋 Hola equipo PMKT — soy el agente GTM de Alegra.\n\n' +
        'Cuando tengan un lanzamiento nuevo, solo escríbanme:\n' +
        '*@gtm-agent*\n\n' +
        'Les pregunto lo que necesito y arranco el proceso automáticamente.',
    });
  }

  if (type === 'MESSAGE') {
    const text = event?.message?.text ?? '';
    const sender = event?.message?.sender?.displayName ?? 'alguien';
    const description = extractRequest(text);

    if (!description) {
      return res.json({
        text:
          `👋 ¡Hola ${sender}! Cuéntame:\n\n` +
          '¿Qué están lanzando? Descríbelo brevemente:\n' +
          '*feature + países + fecha si la tienen*',
      });
    }

    const gtmType = classifyGtm(description);
    const typeText = gtmType ? `*Tipo detectado:* GTM ${gtmType}\n` : '';

    return res.json({
      text:
        '✅ *Solicitud GTM recibida*\n\n' +
        `📋 *Descripción:* ${description}\n` +
        `${typeText}\n` +
        '🔍 Clasificando y arrancando investigación...\n\n' +
        `@${GTM_OWNER_NAME} recibirá el GTM Framework cuando esté listo.`,
    });
  }

  return res.json({});
}
