// api/webhook.js - Tu bot de WhatsApp
const respuestas = {
  'precio': `💰 Precios:
• 1 par: $1500 (promo 2x$2600)
• 1 par premium: $1690 (promo 2x$2990)
• Promo 2x$2600
• Promo 2x$2990

¿Te ayudo a elegir? Envíame la foto del par que te gusta ✨`,

  'envío': `📦 Envíos a todo el país:
• Todos los días
• Agencias: DAC, TURIL, COPAY
• Costo según ubicación

¿Necesitas el costo a tu localidad? Escríbeme tu ciudad 🚚`,

  'talle': `👟 Para confirmar el talle necesito:
1️⃣ Foto de la ETIQUETA de tu calzado
2️⃣ Foto de la PLANTILLA con centímetros

📏 Talles disponibles: 36 al 45 (EUROPA)
⚠️ No trabajamos con cambios, por eso medimos con exactitud

¿Me envías las fotos? 📸`,
};

const mensajePorDefecto = `¡Hola! 😊

Te ayudo con tus consultas:

💰 PRECIOS - ¿Cuánto cuestan?
📦 ENVÍOS - ¿Llegan a mi ciudad?
👟 TALLES - ¿Cómo elijo el correcto?
📝 PEDIDO - ¿Cómo compro?
💳 PAGOS - ¿Qué medios aceptan?

Solo escríbeme la palabra clave y te respondo al instante 💜`;

async function enviarMensaje(numero, mensaje) {
  const url = `https://graph.facebook.com/v22.0/${process.env.WHATSAPP_PHONE_NUMBER_ID}/messages`;
  
  const respuesta = await fetch(url, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${process.env.WHATSAPP_ACCESS_TOKEN}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      messaging_product: 'whatsapp',
      to: numero,
      type: 'text',
      text: { body: mensaje }
    })
  });
  
  return await respuesta.json();
}

export async function GET(request) {
  const url = new URL(request.url);
  const modo = url.searchParams.get('hub.mode');
  const token = url.searchParams.get('hub.verify_token');
  const challenge = url.searchParams.get('hub.challenge');

  if (modo === 'subscribe' && token === process.env.WEBHOOK_VERIFY_TOKEN) {
    return new Response(challenge, { status: 200 });
  }
  return new Response('Token inválido', { status: 403 });
}

export async function POST(request) {
  try {
    const body = await request.json();
    const mensaje = body.entry?.[0]?.changes?.[0]?.value?.messages?.[0];
    
    if (!mensaje || mensaje.type !== 'text') {
      return new Response('OK', { status: 200 });
    }
    
    const numeroCliente = mensaje.from;
    const textoCliente = mensaje.text.body.toLowerCase();
    
    let respuesta = null;
    for (const [palabra, respuestaAsignada] of Object.entries(respuestas)) {
      if (textoCliente.includes(palabra)) {
        respuesta = respuestaAsignada;
        break;
      }
    }
    
    if (!respuesta) {
      respuesta = mensajePorDefecto;
    }
    
    await enviarMensaje(numeroCliente, respuesta);
    return new Response('OK', { status: 200 });
    
  } catch (error) {
    console.error('Error:', error);
    return new Response('Error', { status: 500 });
  }
}
