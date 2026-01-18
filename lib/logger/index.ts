type LogLevel = "info" | "warn" | "error" | "debug"

interface LogData {
  level: LogLevel
  message: string
  timestamp: string
  method?: string
  path?: string
  pathname?: string
  statusCode?: number
  duration?: number
  payload?: unknown
  response?: unknown
  error?: unknown
  authError?: unknown
  userId?: string
  role?: string
  hasUser?: boolean
  hasUserData?: boolean
  companyId?: string
  apiKeyId?: string
  apiClientId?: string
  queryParams?: unknown
  professionalId?: string
  serviceId?: string
  slotStep?: number
  closingTime?: string
  timezone?: string
  from?: string
  to?: string
  count?: number
  mapSize?: number
  sampleSlots?: unknown
  windowsCount?: number
  realIdsInMap?: number
  realIdsAssigned?: number
  slotsWithRealIds?: unknown
  sampleWindows?: unknown
  datesCount?: number
  totalSlots?: number
  origin?: string
  [key: string]: unknown // Permite campos adicionais dinâmicos
}

export class Logger {
  private formatLog(data: LogData): string {
    return JSON.stringify(data, null, 2)
  }

  private log(level: LogLevel, data: Omit<LogData, "level" | "timestamp">) {
    const logData: LogData = {
      level,
      message: data.message as string,
      timestamp: new Date().toISOString(),
      ...data
    } as LogData

    const formatted = this.formatLog(logData)

    switch (level) {
      case "error":
        console.error(formatted)
        break
      case "warn":
        console.warn(formatted)
        break
      case "debug":
        if (process.env.NODE_ENV === "development") {
          console.debug(formatted)
        }
        break
      default:
        console.log(formatted)
    }
  }

  info(data: Omit<LogData, "level" | "timestamp">) {
    this.log("info", data)
  }

  warn(data: Omit<LogData, "level" | "timestamp">) {
    this.log("warn", data)
  }

  error(data: Omit<LogData, "level" | "timestamp">) {
    this.log("error", data)
  }

  debug(data: Omit<LogData, "level" | "timestamp">) {
    this.log("debug", data)
  }

  request(data: {
    method: string
    path: string
    payload?: unknown
    userId?: string
    companyId?: string
    apiKeyId?: string
  }) {
    this.debug({
      message: "Incoming request",
      ...data
    })
  }

  response(data: {
    method: string
    path: string
    statusCode: number
    duration: number
    response?: unknown
    userId?: string
    companyId?: string
    apiKeyId?: string
  }) {
    this.debug({
      message: "Outgoing response",
      ...data
    })
  }
}

export const logger = new Logger()
