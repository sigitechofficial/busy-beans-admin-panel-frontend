import { RECAPTCHA_SECRET_KEY } from "@/utilities/URL";

export async function POST(req) {
  const body = await req.json();

  const captchaResponse = await fetch(
    `https://www.google.com/recaptcha/api/siteverify?secret=${RECAPTCHA_SECRET_KEY}&response=${body.captchaToken}`,
    { method: "POST" }
  );
  const captchaData = await captchaResponse.json();

  if (!captchaData.success) {
    return new Response(JSON.stringify({ success: false }), { status: 400 });
  }

  // ✅ Continue with form logic (e.g., send email or store in DB)
  return new Response(JSON.stringify({ success: true }));
}
