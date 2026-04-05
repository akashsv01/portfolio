import { NextResponse } from "next/server";

const MAX_NAME = 200;
const MAX_MESSAGE = 8000;

function isValidEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export async function POST(req: Request) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  if (!body || typeof body !== "object") {
    return NextResponse.json({ error: "Invalid body" }, { status: 400 });
  }

  const b = body as Record<string, unknown>;
  const name = String(b.name ?? "").trim();
  const email = String(b.email ?? "").trim();
  const message = String(b.message ?? "").trim();

  if (!name || name.length > MAX_NAME) {
    return NextResponse.json({ error: "Please enter a valid name." }, { status: 400 });
  }
  if (!email || !isValidEmail(email)) {
    return NextResponse.json({ error: "Please enter a valid email address." }, { status: 400 });
  }
  if (message.length < 10 || message.length > MAX_MESSAGE) {
    return NextResponse.json(
      { error: "Message should be at least 10 characters." },
      { status: 400 }
    );
  }

  const key = process.env.WEB3FORMS_ACCESS_KEY;
  if (!key) {
    return NextResponse.json({ ok: false, fallback: true }, { status: 501 });
  }

  const res = await fetch("https://api.web3forms.com/submit", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      access_key: key,
      name,
      email,
      message,
      subject: `Portfolio: ${name}`,
      from_name: name,
      replyto: email,
    }),
  });

  const data = (await res.json()) as { success?: boolean; message?: string };
  if (!res.ok || !data.success) {
    return NextResponse.json(
      { error: data.message || "Could not send. Try email instead." },
      { status: 502 }
    );
  }

  return NextResponse.json({ ok: true });
}
