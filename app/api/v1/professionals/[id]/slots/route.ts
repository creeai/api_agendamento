import {NextRequest, NextResponse} from "next/server"
import {authenticateApiKey} from "@/lib/api-key/middleware"
import {slotService} from "@/lib/services/slot.service"
import {logger} from "@/lib/logger"
import type {ApiResponse} from "@/types/api"
import {DateTime} from "luxon"

export async function GET(request: NextRequest, {params}: {params: {id: string}}) {
  const startTime = Date.now()

  try {
    logger.request({
      method: "GET",
      path: `/api/v1/professionals/${params.id}/slots`
    })

    const authResult = await authenticateApiKey(request)
    if (!authResult) {
      const response: ApiResponse = {
        success: false,
        error: "Unauthorized: Invalid or missing API key"
      }
      logger.warn({
        message: "Unauthorized request",
        method: "GET",
        path: `/api/v1/professionals/${params.id}/slots`,
        statusCode: 401,
        duration: Date.now() - startTime
      })
      return NextResponse.json(response, {status: 401})
    }

    const {searchParams} = new URL(request.url)
    const serviceId =
      searchParams.get("serviceId") || searchParams.get("service_id") || searchParams.get("service") || undefined
    let from = searchParams.get("from")
    let to = searchParams.get("to")

    // Normalize common datetime formats sent by clients (try to be forgiving)
    const normalize = (s: string | null) => {
      if (!s) return null
      // If it's already a valid date string, return as-is
      if (!Number.isNaN(Date.parse(s))) return s
      // Replace single space separator with 'T', collapse multiple spaces
      const replaced = s.replace(/\s+/g, 'T')
      if (!Number.isNaN(Date.parse(replaced))) return replaced
      // Try appending Z if missing timezone
      if (!/[Z+-]/i.test(replaced)) {
        const withZ = `${replaced}Z`
        if (!Number.isNaN(Date.parse(withZ))) return withZ
      }
      return s
    }

    from = normalize(from)
    to = normalize(to)

    if (!from || !to || Number.isNaN(Date.parse(from)) || Number.isNaN(Date.parse(to))) {
      const response: ApiResponse = {
        success: false,
        error: "Query parameters 'from' and 'to' are required and must be valid ISO date strings"
      }
      logger.warn({
        message: "Invalid date query params",
        method: "GET",
        path: `/api/v1/professionals/${params.id}/slots`,
        queryParams: {serviceId, from, to}
      })
      return NextResponse.json(response, {status: 400})
    }

    logger.debug({
      message: "Request query params",
      method: "GET",
      path: `/api/v1/professionals/${params.id}/slots`,
      queryParams: {serviceId, from, to},
      companyId: authResult.companyId,
      apiKeyId: authResult.apiKeyId
    })

    if (serviceId) {
      try {
        const slotStep = parseInt(searchParams.get('slotStep') || searchParams.get('slotStepMinutes') || '15', 10)
        const minLeadMinutes = parseInt(searchParams.get('minLeadMinutes') || '0', 10)
        const closingTime = searchParams.get('closingTime') || undefined
        const timezone = searchParams.get('timezone') || 'America/Sao_Paulo'

        const result = await slotService.getServiceWindows({
          professionalId: params.id,
          serviceId,
          from,
          to,
          companyId: authResult.companyId,
          slotStepMinutes: slotStep,
          minLeadMinutes,
          closingTime,
          timezone
        })

        // Transformar slots no formato solicitado: agrupados por data
        // Os slots já vêm como janelas de serviço (ex: 60 minutos), então podemos usar diretamente
        const slotsByDate = new Map<string, Array<{
          start: string
          end: string
          id: string
          professional_id: string
        }>>()
        const dateInfo = new Map<string, {day: string, date: string}>()

        for (const slot of result.slots) {
          const startDt = DateTime.fromISO(slot.start_time, {zone: 'utc'}).setZone(timezone)
          const endDt = DateTime.fromISO(slot.end_time, {zone: 'utc'}).setZone(timezone)
          
          const dateKey = startDt.toFormat('yyyy-MM-dd')
          // Formatar nome do dia em inglês (Monday, Tuesday, etc.)
          const dayName = startDt.toFormat('cccc', {locale: 'en'})
          
          // Armazenar informações da data
          if (!dateInfo.has(dateKey)) {
            dateInfo.set(dateKey, {
              day: dayName,
              date: dateKey
            })
          }
          
          // Adicionar horário ao array da data
          if (!slotsByDate.has(dateKey)) {
            slotsByDate.set(dateKey, [])
          }
          
          // Gerar ID do slot - sempre usar slot_ids se disponível, senão gerar baseado no start_time
          let slotId: string
          if (slot.slot_ids && Array.isArray(slot.slot_ids) && slot.slot_ids.length > 0 && slot.slot_ids[0]) {
            slotId = slot.slot_ids[0]
          } else {
            // Gerar ID baseado no start_time
            slotId = `virtual-${slot.start_time}`
          }
          
          // Adicionar horário formatado com dados do slot
          const hourEntry = {
            start: startDt.toFormat('HH:mm') + ' BRT',
            end: endDt.toFormat('HH:mm') + ' BRT',
            id: slotId,
            professional_id: params.id
          }
          
          // Verificar se já existe para evitar duplicatas (comparar por start, end e id)
          const existingHours = slotsByDate.get(dateKey)!
          const exists = existingHours.some(h => 
            h.start === hourEntry.start && 
            h.end === hourEntry.end && 
            h.id === hourEntry.id
          )
          if (!exists) {
            existingHours.push(hourEntry)
          }
        }

        // Converter para array e ordenar por data e horário
        const dates = Array.from(dateInfo.entries())
          .sort((a, b) => a[0].localeCompare(b[0]))
          .map(([dateKey, info]) => {
            const hours = (slotsByDate.get(dateKey) || [])
              .sort((a, b) => a.start.localeCompare(b.start)) // Ordenar horários
            
            return {
              day: info.day,
              date: info.date,
              hours
            }
          })

        const response = {
          data: {
            service: {
              id: result.service.id,
              name: result.service.name,
              duration_minutes: result.service.duration_minutes,
              price: result.service.price
            },
            dates
          },
          meta: {
            serverTime: new Date().toISOString(),
            statusCode: 200,
            message: "FOUND"
          }
        }

        logger.response({
          method: "GET",
          path: `/api/v1/professionals/${params.id}/slots`,
          statusCode: 200,
          duration: Date.now() - startTime,
          response: {datesCount: dates.length, totalSlots: result.slots.length},
          companyId: authResult.companyId,
          apiKeyId: authResult.apiKeyId
        })

        return NextResponse.json([response])
      } catch (err: any) {
        // map known errors
        const msg = err instanceof Error ? err.message : String(err)
        if (msg.includes('Service not found')) {
          const response: ApiResponse = { success: false, error: 'Service not found' }
          return NextResponse.json(response, { status: 404 })
        }
        if (msg.includes('Service duration missing') || err?.status === 422) {
          const response: ApiResponse = { success: false, error: 'Service duration is required' }
          return NextResponse.json(response, { status: 422 })
        }
        logger.error({ message: 'Error building service windows', error: err })
        const response: ApiResponse = { success: false, error: 'Failed to get slots' }
        return NextResponse.json(response, { status: 500 })
      }
    }

    const slots = await slotService.getAvailableSlots({
      professionalId: params.id,
      serviceId,
      from,
      to,
      companyId: authResult.companyId
    })

    const response: ApiResponse = {
      success: true,
      data: slots
    }

    logger.response({
      method: "GET",
      path: `/api/v1/professionals/${params.id}/slots`,
      statusCode: 200,
      duration: Date.now() - startTime,
      response: response,
      companyId: authResult.companyId,
      apiKeyId: authResult.apiKeyId
    })

    return NextResponse.json(response)
  } catch (error) {
    // Log full error for debugging
    logger.error({
      message: "Error getting slots",
      method: "GET",
      path: `/api/v1/professionals/${params.id}/slots`,
      error,
      duration: Date.now() - startTime
    })

    // Return a more informative error message to the client (without stack)
    const errMsg = error instanceof Error ? error.message : "Internal server error"
    const response: ApiResponse = {
      success: false,
      error: errMsg
    }
    return NextResponse.json(response, {status: 500})
  }
}
