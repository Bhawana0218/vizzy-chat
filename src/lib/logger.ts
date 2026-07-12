type LogLevel = "debug" | "info" | "warn" | "error";

interface LogEntry {
  level: LogLevel;
  message: string;
  timestamp: string;
  requestId?: string;
  userId?: string;
  duration?: number;
  metadata?: Record<string, unknown>;
}

function formatEntry(entry: LogEntry): string {
  const base = `[${entry.timestamp}] ${entry.level.toUpperCase()}`;
  const req = entry.requestId ? ` [${entry.requestId}]` : "";
  const user = entry.userId ? ` [user:${entry.userId}]` : "";
  const dur = entry.duration !== undefined ? ` (${entry.duration}ms)` : "";
  return `${base}${req}${user} ${entry.message}${dur}`;
}

function log(level: LogLevel, message: string, meta?: Record<string, unknown>) {
  const entry: LogEntry = {
    level,
    message,
    timestamp: new Date().toISOString(),
    ...meta,
  };

  const formatted = formatEntry(entry);

  switch (level) {
    case "error":
      console.error(formatted);
      break;
    case "warn":
      console.warn(formatted);
      break;
    case "debug":
      if (process.env.NODE_ENV === "development") {
        console.debug(formatted);
      }
      break;
    default:
      console.log(formatted);
  }
}

export const logger = {
  debug: (msg: string, meta?: Record<string, unknown>) => log("debug", msg, meta),
  info: (msg: string, meta?: Record<string, unknown>) => log("info", msg, meta),
  warn: (msg: string, meta?: Record<string, unknown>) => log("warn", msg, meta),
  error: (msg: string, meta?: Record<string, unknown>) => log("error", msg, meta),

  request: (req: { method: string; url: string }, requestId: string) => {
    log("info", `${req.method} ${req.url}`, { requestId });
  },

  response: (
    requestId: string,
    status: number,
    duration: number
  ) => {
    log("info", `Response ${status}`, { requestId, duration });
  },
};

export function generateRequestId(): string {
  return `req_${Date.now().toString(36)}_${Math.random().toString(36).substring(2, 8)}`;
}
