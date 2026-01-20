import {NextRequest, NextResponse} from "next/server"
import {requireAdminApi, ApiAuthError} from "@/lib/auth/api-helpers"
import {apiKeyService} from "@/lib/services/api-key.service"
import {logger} from "@/lib/logger"
import {z} from "zod"
import type {ApiResponse} from "@/types/api"

const createApiKeySchema = z.object({
  label: z.string().min(1),
  companyId: z.string().uuid().optional() // Super admin pode especificar companyId
})

export async function POST(request: NextRequest) {
  const startTime = Date.now()

  try {
    logger.request({
      method: "POST",
      path: "/api/v1/api-keys"
    })

    const user = await requireAdminApi(request)

    const body = await request.json()
    logger.debug({
      message: "Request payload",
      method: "POST",
      path: "/api/v1/api-keys",
      payload: body,
      userId: user.id,
      userRole: user.role,
      companyId: user.companyId
    })

    const validated = createApiKeySchema.parse(body)

    // Determinar companyId: super_admin pode especificar, admin usa a própria
    let targetCompanyId: string
    if (user.role === "super_admin") {
      // Super admin pode criar para qualquer company ou precisa especificar
      if (validated.companyId) {
        targetCompanyId = validated.companyId
      } else {
        const response: ApiResponse = {
          success: false,
          error: "companyId is required when creating API key as super_admin"
        }
        return NextResponse.json(response, {status: 400})
      }
    } else {
      // Admin usa sua própria company
      if (!user.companyId) {
        const response: ApiResponse = {
          success: false,
          error: "User must be associated with a company"
        }
        return NextResponse.json(response, {status: 400})
      }
      targetCompanyId = user.companyId
    }

    const result = await apiKeyService.createApiKey({
      companyId: targetCompanyId,
      label: validated.label,
      userId: user.id
    })

    const response: ApiResponse = {
      success: true,
      data: {
        id: result.id,
        key: result.fullKey, // Mostrar apenas uma vez
        label: result.label,
        createdAt: result.createdAt
      }
    }

    const logResponse = response.data 
      ? {...response, data: {...response.data, key: "[REDACTED]"}}
      : response

    logger.response({
      method: "POST",
      path: "/api/v1/api-keys",
      statusCode: 201,
      duration: Date.now() - startTime,
      response: logResponse,
      userId: user.id,
      companyId: targetCompanyId,
      userRole: user.role
    })

    return NextResponse.json(response, {status: 201})
  } catch (error) {
    logger.error({
      message: "Error creating API key",
      method: "POST",
      path: "/api/v1/api-keys",
      error,
      duration: Date.now() - startTime
    })

    // Tratar erros de autenticação
    if (error instanceof ApiAuthError) {
      return error.toResponse()
    }

    if (error instanceof z.ZodError) {
      const response: ApiResponse = {
        success: false,
        error: "Validation error",
        errors: error.flatten().fieldErrors
      }
      return NextResponse.json(response, {status: 400})
    }

    const response: ApiResponse = {
      success: false,
      error: error instanceof Error ? error.message : "Internal server error"
    }
    return NextResponse.json(response, {status: 500})
  }
}

export async function GET(request: NextRequest) {
  const startTime = Date.now()

  try {
    logger.request({
      method: "GET",
      path: "/api/v1/api-keys"
    })

    const user = await requireAdminApi(request)

    // Super admin lista todas as API keys, admin lista apenas da sua company
    let keys
    if (user.role === "super_admin") {
      keys = await apiKeyService.listAllApiKeys()
    } else {
      if (!user.companyId) {
        const response: ApiResponse = {
          success: false,
          error: "User must be associated with a company"
        }
        return NextResponse.json(response, {status: 400})
      }
      keys = await apiKeyService.listApiKeys(user.companyId)
    }

    const response: ApiResponse = {
      success: true,
      data: keys
    }

    logger.response({
      method: "GET",
      path: "/api/v1/api-keys",
      statusCode: 200,
      duration: Date.now() - startTime,
      response: response,
      userId: user.id,
      companyId: user.companyId,
      userRole: user.role
    })

    return NextResponse.json(response)
  } catch (error) {
    logger.error({
      message: "Error listing API keys",
      method: "GET",
      path: "/api/v1/api-keys",
      error,
      duration: Date.now() - startTime
    })

    // Tratar erros de autenticação
    if (error instanceof ApiAuthError) {
      return error.toResponse()
    }

    const response: ApiResponse = {
      success: false,
      error: error instanceof Error ? error.message : "Internal server error"
    }
    return NextResponse.json(response, {status: 500})
  }
}
