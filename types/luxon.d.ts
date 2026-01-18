// Declaração de tipos para luxon (fallback caso @types/luxon não esteja disponível)
declare module "luxon" {
  export class DateTime {
    static now(): DateTime
    static fromISO(iso: string, options?: any): DateTime
    static fromJSDate(date: Date, options?: any): DateTime
    static fromMillis(millis: number, options?: any): DateTime
    static fromObject(obj: any, options?: any): DateTime
    static fromFormat(text: string, format: string, options?: any): DateTime
    static local(year?: number, month?: number, day?: number, hour?: number, minute?: number, second?: number, millisecond?: number): DateTime
    static utc(year?: number, month?: number, day?: number, hour?: number, minute?: number, second?: number, millisecond?: number): DateTime
    
    year: number
    month: number
    day: number
    hour: number
    minute: number
    second: number
    millisecond: number
    
    toISO(options?: any): string | null
    toJSDate(): Date
    toMillis(): number
    toUnixInteger(): number
    toFormat(format: string, options?: any): string
    toLocaleString(options?: any): string
    toLocaleParts(options?: any): any[]
    
    plus(duration: Duration | any): DateTime
    minus(duration: Duration | any): DateTime
    startOf(unit: string): DateTime
    endOf(unit: string): DateTime
    
    set(values: any): DateTime
    setZone(zone: string | any, options?: any): DateTime
    
    diff(other: DateTime, unit?: string | string[], options?: any): Duration
    diffNow(unit?: string | string[], options?: any): Duration
    
    hasSame(other: DateTime, unit: string): boolean
    isBefore(other: DateTime): boolean
    isAfter(other: DateTime): boolean
    isSame(other: DateTime, unit?: string): boolean
    
    isValid: boolean
    invalidReason: string | null
    invalidExplanation: string | null
    
    zoneName: string
    offset: number
    offsetNameShort: string
    offsetNameLong: string
    
    weekday: number
    weekNumber: number
    weekYear: number
    ordinal: number
    
    daysInMonth: number
    daysInYear: number
    
    [key: string]: any
  }
  
  export class Duration {
    static fromISO(text: string, options?: any): Duration
    static fromMillis(count: number, options?: any): Duration
    static fromObject(obj: any): Duration
    static fromDurationLike(duration: DurationLike): Duration
    static invalid(reason: string, explanation?: string): Duration
    
    years: number
    months: number
    days: number
    hours: number
    minutes: number
    seconds: number
    milliseconds: number
    
    toISO(): string | null
    toJSON(): string | null
    toMillis(): number
    toObject(): any
    toFormat(format: string, options?: any): string
    
    plus(duration: Duration | DurationLike): Duration
    minus(duration: Duration | DurationLike): Duration
    negate(): Duration
    normalize(): Duration
    
    isValid: boolean
    invalidReason: string | null
    invalidExplanation: string | null
    
    [key: string]: any
  }
  
  export interface DurationLike {
    years?: number
    months?: number
    weeks?: number
    days?: number
    hours?: number
    minutes?: number
    seconds?: number
    milliseconds?: number
  }
  
  export class Interval {
    static fromDateTimes(start: DateTime, end: DateTime): Interval
    static after(start: DateTime, duration: Duration | DurationLike): Interval
    static before(end: DateTime, duration: Duration | DurationLike): Interval
    static fromISO(text: string, options?: any): Interval
    static invalid(reason: string, explanation?: string): Interval
    
    start: DateTime | null
    end: DateTime | null
    
    toISO(options?: any): string | null
    toFormat(format: string, options?: any): string
    
    contains(dateTime: DateTime): boolean
    overlaps(other: Interval): boolean
    abutsStart(other: Interval): boolean
    abutsEnd(other: Interval): boolean
    engulfs(other: Interval): boolean
    equals(other: Interval): boolean
    
    splitAt(...dateTimes: DateTime[]): Interval[]
    splitBy(duration: Duration | DurationLike): Interval[]
    
    isValid: boolean
    invalidReason: string | null
    invalidExplanation: string | null
    
    [key: string]: any
  }
  
  export class Info {
    static weekdays(length?: "long" | "short" | "narrow", options?: any): string[]
    static months(length?: "long" | "short" | "narrow", options?: any): string[]
    static meridiems(options?: any): string[]
    static eras(length?: "long" | "short" | "narrow", options?: any): string[]
    static features(): any
  }
  
  export class Settings {
    static defaultZone: string | any
    static defaultLocale: string
    static defaultNumberingSystem: string | null
    static defaultOutputCalendar: string | null
    static throwOnInvalid: boolean
    static resetCaches(): void
  }
  
  export class Zone {
    static utcInstance: Zone
    static localInstance: Zone
    static systemZone: Zone
    static isValidSpecifier(s: string): boolean
    static isIANAZone(zone: string): boolean
    static resetCache(): void
  }
}
