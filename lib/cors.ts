import {NextRequest, NextResponse} from "next/server"

/**
 * Verifica se uma origin é permitida para CORS
 */
export function isAllowedOrigin(origin: string | null): boolean {
  // Permitir requisições server-to-server (sem origin)
  if (!origin) {
    return true
  }

  // Permitir editor do WeWeb
  if (origin === "https://editor.weweb.io") {
    return true
  }

  // Permitir qualquer subdomínio .weweb.app
  if (origin.endsWith(".weweb.app")) {
    return true
  }

  // Permitir origin customizada via variável de ambiente
  const frontendOrigin = process.env.FRONTEND_ORIGIN
  if (frontendOrigin && origin === frontendOrigin) {
    return true
  }

  // Permitir múltiplas origens customizadas (separadas por vírgula)
  if (frontendOrigin) {
    const allowedOrigins = frontendOrigin.split(",").map(o => o.trim())
    if (allowedOrigins.includes(origin)) {
      return true
    }
  }

  return false
}

/**
 * Adiciona headers CORS a uma resposta
 */
export function addCorsHeaders(
  response: NextResponse,
  origin: string | null
): NextResponse {
  if (!origin || !isAllowedOrigin(origin)) {
    return response
  }

  response.headers.set("Access-Control-Allow-Origin", origin)
  response.headers.set(
    "Access-Control-Allow-Methods",
    "GET, POST, PUT, PATCH, DELETE, OPTIONS"
  )
  response.headers.set(
    "Access-Control-Allow-Headers",
    "Content-Type, Authorization"
  )
  response.headers.set("Access-Control-Max-Age", "86400") // 24 horas

  return response
}

/**
 * Cria uma resposta para preflight OPTIONS
 */
export function createPreflightResponse(origin: string | null): NextResponse {
  if (!origin || !isAllowedOrigin(origin)) {
    return new NextResponse(null, {status: 403})
  }

  const response = new NextResponse(null, {status: 204})
  return addCorsHeaders(response, origin)
}

/**
 * Helper para criar uma resposta JSON com CORS
 * Use este helper nas rotas de API para garantir que os headers CORS sejam adicionados
 */
export function jsonWithCors(
  data: any,
  init?: ResponseInit,
  request?: NextRequest
): NextResponse {
  const response = NextResponse.json(data, init)
  const origin = request?.headers.get("origin") || null
  return addCorsHeaders(response, origin)
}
