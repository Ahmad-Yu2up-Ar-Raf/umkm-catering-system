// @ts-nocheck
// ponytail: minimal PartyKit presence relay — edge presence for admin sessions

export default {
  options: { hibernate: true },

  // Health check for DX: any GET to this party returns JSON (so `GET /parties/main/admin-presence` is health)
  // Note: `GET http://localhost:1999/` (root) is PartyKit dev server, not this party — 404 there is normal
  async onRequest(req, room) {
    if (req.method === "GET") {
      return new Response(JSON.stringify({ status: "ok", service: "catering-presence", room: room.id }), {
        headers: { "content-type": "application/json" },
      })
    }
    return new Response("Not Found", { status: 404 })
  },

  async onConnect(conn, room) {
    // Presence join is broadcast by client via onMessage
  },

  async onMessage(message, sender) {
    try {
      const data = JSON.parse(message)
      if (
        data?.type === "presence:join" ||
        data?.type === "presence:leave" ||
        data?.type === "pesanan:created"
      ) {
        sender.room.broadcast(message, [sender.id])
      }
    } catch {
      // ignore malformed
    }
  },
}
