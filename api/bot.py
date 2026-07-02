from http.server import BaseHTTPRequestHandler
import json
import re

GTM_OWNER = "cristian.bautista@alegra.com"
GTM_OWNER_NAME = "Cristian Bautista"

def extract_request(text):
    text = re.sub(r'<[^>]+>', '', text)
    text = re.sub(r'@gtm-agent', '', text, flags=re.IGNORECASE).strip()
    return text

def classify_gtm(description):
    desc = description.lower()
    if any(w in desc for w in ['paridad', 'catch-up', 'replicar', 'mismo que', 'igual que']):
        return '(2) Adopción'
    if any(w in desc for w in ['nuevo', 'primera vez', 'lanzamiento', 'nueva funcionalidad']):
        return '(1) Nueva Funcionalidad'
    if any(w in desc for w in ['mejora', 'actualización', 'integración']):
        return '(3) Mejora de Valor'
    return None

class handler(BaseHTTPRequestHandler):

    def do_POST(self):
        length = int(self.headers.get('Content-Length', 0))
        body = self.rfile.read(length)

        try:
            event = json.loads(body)
        except Exception:
            self.send_response(400)
            self.end_headers()
            return

        response = self.process(event)

        self.send_response(200)
        self.send_header('Content-type', 'application/json')
        self.end_headers()
        self.wfile.write(json.dumps(response).encode())

    def process(self, event):
        event_type = event.get('type', '')

        if event_type == 'ADDED_TO_SPACE':
            space = event.get('space', {}).get('displayName', 'este canal')
            return {
                "text": (
                    f"👋 Hola equipo PMKT — soy el agente GTM de Alegra.\n\n"
                    f"Cuando tengan un lanzamiento nuevo, solo escríbanme:\n"
                    f"*@gtm-agent*\n\n"
                    f"Les pregunto lo que necesito y arranco el proceso automáticamente."
                )
            }

        if event_type == 'MESSAGE':
            message = event.get('message', {})
            text = message.get('text', '')
            sender = message.get('sender', {}).get('displayName', 'alguien')
            thread_name = message.get('thread', {}).get('name', '')

            description = extract_request(text)

            # Just @gtm-agent with no description
            if not description:
                return {
                    "text": (
                        f"👋 ¡Hola {sender}! Cuéntame:\n\n"
                        f"¿Qué están lanzando? Descríbelo brevemente:\n"
                        f"*feature + países + fecha si la tienen*"
                    )
                }

            # @gtm-agent + description
            gtm_type = classify_gtm(description)
            type_text = f"*Tipo detectado:* GTM {gtm_type}\n" if gtm_type else ""

            return {
                "text": (
                    f"✅ *Solicitud GTM recibida*\n\n"
                    f"📋 *Descripción:* {description}\n"
                    f"{type_text}\n"
                    f"🔍 Clasificando y arrancando investigación...\n\n"
                    f"@{GTM_OWNER_NAME} recibirá el GTM Framework cuando esté listo."
                )
            }

        return {}

    def log_message(self, format, *args):
        pass
