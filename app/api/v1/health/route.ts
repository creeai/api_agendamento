import {NextRequest, NextResponse} from "next/server"
import {addCorsHeaders} from "@/lib/cors"

export async function GET(request: NextRequest) {
  const origin = request.headers.get("origin")
  const response = NextResponse.json(
    {
      ok: true,
      name: "api-agendamento-v2",
      time: new Date().toISOString()
    },
    {status: 200}
  )

  return addCorsHeaders(response, origin)
}
