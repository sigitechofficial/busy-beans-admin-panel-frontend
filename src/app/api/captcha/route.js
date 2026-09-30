export async function POST(req) {
  const body = await req.json();

  // Server-only env var (no NEXT_PUBLIC_ prefix) so it never reaches the browser bundle.
  const secret = process.env.RECAPTCHA_SECRET_KEY;
  if (!secret) {
    return new Response(
      JSON.stringify({ success: false, message: "reCAPTCHA is not configured" }),
      { status: 500 }
    );
  }

  const captchaResponse = await fetch(
    "https://www.google.com/recaptcha/api/siteverify",
    {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({ secret, response: body.token ?? "" }),
    }
  );
  const captchaData = await captchaResponse.json();

  if (!captchaData.success || captchaData.score < 0.5) {
    return new Response(
      JSON.stringify({ success: false, message: "Bot detection failed" }),
      { status: 400 }
    );
  }

  // ✅ Continue with form logic (e.g., send email or store in DB)
  return new Response(
    JSON.stringify({ success: true, score: captchaData.score })
  );
}
