export const env = {
  apiUrl:       import.meta.env.VITE_API_URL        ?? 'http://localhost:8080',
  analyticsUrl: import.meta.env.VITE_ANALYTICS_URL  ?? 'http://localhost:8084',
  calendarUrl:  import.meta.env.VITE_CALENDAR_URL   ?? 'http://localhost:8085',
} as const
