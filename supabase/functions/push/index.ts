import { serve } from "https://deno.land/std@0.177.0/http/server.ts"
import { WebPush } from "https://deno.land/x/webpush@v1.1.1/mod.ts"

serve(async (req) => {
  try {
    const { endpoint, keys, payload } = await req.json()
    const publicKey = Deno.env.get("VAPID_PUBLIC_KEY")
    const privateKey = Deno.env.get("VAPID_PRIVATE_KEY")
    if (!publicKey || !privateKey) {
      return new Response(JSON.stringify({ error: "VAPID keys missing" }), { status: 500 })
    }
    const wp = new WebPush({ publicKey, privateKey, subject: "mailto:admin@example.com" })
    await wp.sendNotification({ endpoint, keys }, JSON.stringify(payload ?? { title: "通知", body: "テスト" }))
    return new Response(JSON.stringify({ ok: true }), { status: 200 })
  } catch (e) {
    return new Response(JSON.stringify({ error: String(e) }), { status: 500 })
  }
})
