import {NextRequest, NextResponse} from "next/server"
import {isAllowedOrigin, addCorsHeaders, createPreflightResponse} from "@/lib/cors"
import {logger} from "@/lib/logger"

export function middleware(request: NextRequest) {
  const origin = request.headers.get("origin")
  const pathname = request.nextUrl.pathname

  // Aplicar CORS apenas para rotas de API
  if (!pathname.startsWith("/api/")) {
    return NextResponse.next()
  }

  // Lidar com preflight OPTIONS
  if (request.method === "OPTIONS") {
    logger.debug({
      message: "CORS preflight request",
      origin,
      pathname,
      method: request.method
    })

    const response = createPreflightResponse(origin)
    
    if (response.status === 403) {
      logger.warn({
        message: "CORS preflight blocked - origin not allowed",
        origin,
        pathname
      })
    }

    return response
  }

  // Para outras requisições, adicionar headers CORS na resposta
  // Isso será feito através do NextResponse.next() e modificado no handler
  const response = NextResponse.next()
  
  // Adicionar headers CORS se origin for permitida
  if (origin && isAllowedOrigin(origin)) {
    addCorsHeaders(response, origin)
  }

  return response
}

// Configurar quais rotas o middleware deve executar
export const config = {
  matcher: "/api/:path*"
}
