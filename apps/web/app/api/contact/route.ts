type ContactPayload = {
  name?: string;
  company?: string;
  email?: string;
  phone?: string;
  service?: string;
  message?: string;
  website?: string;
};

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function readText(value: unknown, maxLength: number) {
  return typeof value === "string" ? value.trim().slice(0, maxLength) : "";
}

function normalizePayload(payload: ContactPayload) {
  return {
    name: readText(payload.name, 120),
    company: readText(payload.company, 160),
    email: readText(payload.email, 254).toLowerCase(),
    phone: readText(payload.phone, 60),
    service: readText(payload.service, 120),
    message: readText(payload.message, 4000),
    website: readText(payload.website, 120),
  };
}

export async function POST(request: Request) {
  let rawPayload: ContactPayload;

  try {
    rawPayload = (await request.json()) as ContactPayload;
  } catch {
    return Response.json({ ok: false, message: "Solicitud invalida." }, { status: 400 });
  }

  const payload = normalizePayload(rawPayload);

  if (payload.website) {
    return Response.json({ ok: true });
  }

  if (
    !payload.name ||
    !payload.company ||
    !payload.phone ||
    !payload.service ||
    !emailPattern.test(payload.email) ||
    payload.message.length < 20
  ) {
    return Response.json(
      { ok: false, message: "Completa todos los campos y detalla el requerimiento con mayor contexto." },
      { status: 400 },
    );
  }

  const webhookUrl = process.env.CONTACT_SUBMISSIONS_WEBHOOK_URL;

  if (!webhookUrl) {
    return Response.json({ ok: false, message: "El canal de contacto no esta configurado." }, { status: 503 });
  }

  try {
    const upstream = await fetch(webhookUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...payload,
        website: undefined,
        receivedAt: new Date().toISOString(),
        source: "northacoustics-web",
      }),
    });

    if (!upstream.ok) {
      return Response.json({ ok: false, message: "No fue posible enviar la solicitud." }, { status: 502 });
    }
  } catch {
    return Response.json({ ok: false, message: "No fue posible enviar la solicitud." }, { status: 502 });
  }

  return Response.json({ ok: true });
}
