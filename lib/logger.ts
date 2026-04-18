type LogLevel = 'info' | 'warn' | 'error' | 'debug';

function formatMessage(level: LogLevel, context: string, message: string, data?: unknown): string {
  const timestamp = new Date().toISOString();
  const base = `[${timestamp}] [${level.toUpperCase()}] [${context}] ${message}`;
  return data !== undefined ? `${base} ${JSON.stringify(data)}` : base;
}

export const logger = {
  info(context: string, message: string, data?: unknown) {
    console.log(formatMessage('info', context, message, data));
  },
  warn(context: string, message: string, data?: unknown) {
    console.warn(formatMessage('warn', context, message, data));
  },
  error(context: string, message: string, data?: unknown) {
    console.error(formatMessage('error', context, message, data));
  },
  debug(context: string, message: string, data?: unknown) {
    if (process.env.NODE_ENV !== 'production') {
      console.debug(formatMessage('debug', context, message, data));
    }
  },
};
